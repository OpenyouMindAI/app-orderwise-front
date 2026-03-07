<template>
  <q-page class="q-pa-none">
    <q-form ref="saveBill" @submit.prevent="saveBill">
      <div class="billing-panel-container q-pa-sm">
        <!-- LEFT PANEL -->
        <div style="min-width: 0;">
          <div class="row q-col-gutter-sm">
            <!-- Selectores principales - Solo desktop -->
            <div v-if="$q.screen.gt.sm" class="billing-selects-desktop col-12">
              <div v-if="$route.query.id">
                <q-chip
                  square
                  color="primary"
                  text-color="white"
                  icon="receipt_long"
                  class="invoice-chip"
                >
                  <span>{{ purchase?.purchase_number }}</span>
                </q-chip>
              </div>

              <div class="billing-select-item">
                <q-select
                  filled
                  dense
                  v-model="provider"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :hide-dropdown-icon="$q.platform.is.nativeMobile"
                  option-value="id"
                  :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
                  :options="providers"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  @filter="filterProviders"
                  hide-bottom-space
                  label="Proveedor"
                >
                  <template v-slot:append>
                    <q-btn color="primary" round icon="add_circle" @click.stop.prevent="(openAddProvider = true)" size="sm"/>
                  </template>
                </q-select>
              </div>

              <div class="billing-select-item">
                <q-select
                  filled
                  dense
                  v-model="invoiceType"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :hide-dropdown-icon="$q.platform.is.nativeMobile"
                  option-label="name"
                  option-value="id"
                  :options="invoiceTypes"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  @filter="filterInvoiceTypes"
                  hide-bottom-space
                  label="Tipo de factura"
                />
              </div>

              <!-- Tipo de servicio eliminado para agilidad -->

               <div class="billing-select-item">
                <q-input
                   filled
                   dense
                   v-model="purchaseCode"
                   label="N° Factura"
                   hide-bottom-space
                />
               </div>

              <div class="col-12" style="width: 100% !important;">
                <q-input
                  filled
                  dense
                  v-model="barcode"
                  autofocus
                  label="Código"
                  style="width: 100% !important; max-width: none !important;"
                  @keypress.enter="processBarcode(barcode)"
                >
                    <template v-slot:append>
                        <q-btn v-if="$q.platform.is.nativeMobile" round color="teal" icon="qr_code_scanner" size="sm" @click="startScanner" class="q-mr-sm"/>
                        <q-btn round color="teal" icon="add_circle" size="sm" @click="openAddProduct = true"/>
                    </template>
                </q-input>
              </div>
            </div>

            <div v-else class="mobile-header-section" :class="{ 'mobile-header-hidden': productsFullscreen }">
              <div v-if="$route.query.id">
                <q-chip
                  square
                  color="primary"
                  text-color="white"
                  icon="receipt_long"
                  dense
                  class="invoice-chip"
                >
                  <span>{{ purchase?.purchase_number }}</span>
                </q-chip>
              </div>
              <div>
                <q-btn
                  color="secondary"
                  icon="store"
                  :label="provider?.name || 'Proveedor'"
                  label-position="left"
                  style="height: 100% !important;"
                >
                  <q-popup-proxy @before-show="loadProvidersData()" v-model="providerMenuOpen">
                    <q-card class="fab-popup-card">
                      <q-card-section class="fab-popup-header">
                        <div class="text-h6">Seleccionar Proveedor</div>
                        <q-btn flat round dense icon="close" v-close-popup />
                      </q-card-section>
                      <q-separator />
                      <q-card-section class="q-pa-none" style="position: relative; min-height: 200px;">
                        <q-inner-loading :showing="loadingProviders">
                          <q-spinner-dots size="50px" color="primary" />
                        </q-inner-loading>
                        <q-input
                          v-model="providerSearch"
                          placeholder="Buscar proveedor..."
                          dense
                          outlined
                          class="q-ma-sm"
                        >
                          <template v-slot:prepend>
                            <q-icon name="search" />
                          </template>
                        </q-input>
                        <q-list class="fab-popup-list">
                          <q-item
                            v-for="p in filteredProvidersForFab"
                            :key="p.id"
                            clickable
                            v-ripple
                            :active="provider?.id === p.id"
                            @click="provider = p; providerSearch = ''"
                            v-close-popup
                          >
                            <q-item-section>
                              <q-item-label>{{ p.name }}</q-item-label>
                              <q-item-label caption>{{ p.document_number }}</q-item-label>
                            </q-item-section>
                            <q-item-section side v-if="provider?.id === p.id">
                              <q-icon name="check_circle" color="primary" />
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                      <q-separator />
                      <q-card-actions align="right">
                        <q-btn flat color="primary" icon="add" label="Nuevo" @click="openAddProvider = true" v-close-popup />
                      </q-card-actions>
                    </q-card>
                  </q-popup-proxy>
                </q-btn>
              </div>
              <div class="flex">
                <q-btn
                  color="info"
                  icon="qr_code_scanner"
                  style="height: 100%"
                  @click.stop="startScanner"
                  v-if="$q.platform.is.nativeMobile"
                >
                  <q-tooltip class="text-body2" anchor="bottom middle">
                    Escanear código
                  </q-tooltip>
                </q-btn>
              </div>

              <!-- FAB para configuraciones adicionales -->
              <q-fab
                color="primary"
                icon="tune"
                type="button"
                direction="down"
                padding="sm"
                vertical-actions-align="right"
                v-model="centerFabOpen"
              >
                <!-- FAB Tipo de Factura -->
                <q-fab-action
                  color="accent"
                  icon="receipt"
                  :label="invoiceType?.name || 'Tipo'"
                  label-position="left"
                >
                  <q-popup-proxy @before-show="loadInvoiceTypesData()">
                    <q-card class="fab-popup-card">
                      <q-card-section class="fab-popup-header">
                        <div class="text-h6">Tipo de Factura</div>
                        <q-btn flat round dense icon="close" v-close-popup />
                      </q-card-section>
                      <q-separator />
                      <q-card-section class="q-pa-none" style="position: relative; min-height: 200px;">
                        <q-inner-loading :showing="loadingInvoiceTypes">
                          <q-spinner-dots size="50px" color="primary" />
                        </q-inner-loading>
                        <q-list class="fab-popup-list">
                          <q-item
                            v-for="type in invoiceTypes"
                            :key="type.id"
                            clickable
                            v-ripple
                            :active="invoiceType?.id === type.id"
                            @click="invoiceType = type"
                            v-close-popup
                          >
                            <q-item-section>
                              <q-item-label>{{ type.name }}</q-item-label>
                            </q-item-section>
                            <q-item-section side v-if="invoiceType?.id === type.id">
                              <q-icon name="check_circle" color="primary" />
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </q-popup-proxy>
                </q-fab-action>

              </q-fab>

              <!-- FAB para opciones adicionales -->
              <q-fab
                square
                type="button"
                color="orange"
                icon="more_vert"
                direction="down"
                padding="sm"
                vertical-actions-align="right"
                v-model="rightFabOpen"
              >
                <q-fab-action
                  color="teal"
                  icon="search"
                  label="Buscar"
                  label-position="right"
                  @click="searchInvoice = true"
                />

                <q-fab-action
                  color="negative"
                  icon="delete"
                  label="Borrar"
                  label-position="right"
                  @click="clear"
                />
              </q-fab>
            </div>

            <div class="col-12 articles-section" :class="{ 'articles-section-hidden': productsFullscreen }">
              <!-- Desktop View -->
              <q-table
                v-if="$q.screen.gt.xs"
                row-key="name"
                title="Artí­culos"
                dense
                hide-pagination
                :rows="products"
                :columns="columns"
                :pagination="{ rowsPerPage: 0 }"
                style="max-height: 400px; overflow: auto;"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="barcode" :props="props">
                      {{ props.row.barcode }}
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ props.row.name }}
                    </q-td>
                    <q-td key="cost" :props="props">
                      {{ formatNumber(props.row.cost) }}
                      <q-popup-edit
                        v-if="userSession.is_root || userSession.is_super_admin"
                        v-model.number="props.row.cost"
                        auto-save
                        v-slot="scope"
                        @update:model-value="calculate(props.row)"
                      >
                        <q-input
                          label="Costo"
                          type="number"
                          v-model.number="scope.value"
                          autofocus
                          @keyup.enter="scope.set"
                        />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="taxe" :props="props">
                      {{ formatNumber(props.row.taxe) }}
                      <q-popup-edit
                        v-model.number="props.row.taxe"
                        auto-save
                        v-slot="scope"
                        @save="calculate(props.row)"
                      >
                        <q-input
                          type="number"
                          @focus="e => e.target.select()"
                          v-model.number="scope.value"
                          dense
                          autofocus
                          @keyup.enter="scope.set"
                          label="Impuesto"
                        />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="quantity" :props="props">
                      {{ formatNumber(props.row.quantity) }}
                      <q-popup-edit
                        v-model.number="props.row.quantity"
                        auto-save
                        v-slot="scope"
                        @update:model-value="calculate(props.row)"
                      >
                        <q-input
                          label="Cantidad"
                          type="number"
                          v-model.number="scope.value"
                          autofocus
                          @keyup.enter="scope.set"
                        />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="uom" :props="props">
                      {{ props.row.uom_acronym }}
                    </q-td>
                    <q-td key="subtotal" :props="props">
                      {{ formatNumber(props.row.subtotal) }}
                    </q-td>
                    <q-td key="actions" :props="props">
                      <q-btn icon="delete" size="xs" color="negative" @click="deleteProduct(props)"/>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>

              <!-- Mobile Cart View -->
              <div
                v-else-if="products.length > 0"
                class="mobile-cart-container"
              >
                 <div class="mobile-cart-list">
                      <div
                        v-for="(product, rowIndex) in products"
                        :key="rowIndex"
                        class="cart-item"
                      >
                        <div class="cart-item-row">
                          <!-- Botón eliminar -->
                          <q-btn
                            icon="close"
                            flat
                            dense
                            round
                            size="xs"
                            color="grey-6"
                            class="cart-delete-btn"
                            @click="deleteProduct({ rowIndex })"
                          />

                          <!-- Información del producto -->
                          <div class="cart-item-info">
                            <span class="cart-item-name">{{ product.name }}</span>
                            <div class="cart-item-prices">
                              <span class="cart-item-price-label">
                                Costo: {{ coin?.symbol }} {{ formatNumber(product.cost) }}
                                <q-popup-edit
                                  v-if="userSession?.is_root || userSession?.is_super_admin"
                                  v-model.number="product.cost"
                                  auto-save
                                  v-slot="scope"
                                  @update:model-value="calculate(product)"
                                >
                                  <q-input
                                    label="Costo"
                                    type="number"
                                    @focus="e => e.target.select()"
                                    v-model.number="scope.value"
                                    dense
                                    autofocus
                                    @keyup.enter="scope.set"
                                  />
                                </q-popup-edit>
                              </span>
                              <div class="cart-item-price-label text-orange-9 text-weight-bold">
                                Impuesto: {{ coin?.symbol }} {{ formatNumber(product.taxe) }}
                                <q-popup-edit
                                  v-model.number="product.taxe"
                                  auto-save
                                  v-slot="scope"
                                  @save="calculate(product)"
                                >
                                  <q-input
                                    label="Impuesto"
                                    type="number"
                                    @focus="e => e.target.select()"
                                    v-model.number="scope.value"
                                    dense
                                    autofocus
                                    @keyup.enter="scope.set"
                                  />
                                </q-popup-edit>
                              </div>
                            </div>
                          </div>

                          <!-- Controles de cantidad -->
                          <div class="quantity-controls">
                            <q-btn
                              icon="remove"
                              unelevated
                              dense
                              round
                              size="xs"
                              color="grey-3"
                              text-color="dark"
                              @click="product.quantity > 1 ? (product.quantity--, calculate(product)) : deleteProduct({ rowIndex })"
                            />
                            <span class="quantity-value" @click.stop>
                              {{ formatNumber(product.quantity) }}
                              <q-popup-edit
                                v-model.number="product.quantity"
                                auto-save
                                v-slot="scope"
                                @update:model-value="calculate(product)"
                              >
                                <q-input
                                  label="Cantidad"
                                  type="number"
                                  @focus="e => e.target.select()"
                                  v-model.number="scope.value"
                                  dense
                                  autofocus
                                  @keyup.enter="scope.set"
                                />
                              </q-popup-edit>
                            </span>
                            <q-btn
                              icon="add"
                              unelevated
                              dense
                              round
                              size="xs"
                              color="primary"
                              @click="product.quantity++; calculate(product)"
                            />
                          </div>

                          <!-- Subtotal -->
                          <div class="cart-item-subtotal">
                            {{ formatNumber(product.subtotal) }}
                          </div>
                        </div>
                      </div>
                 </div>
              </div>
            </div>

            <div class="col-12 q-col-gutter-xs q-mt-md row" :class="{ 'articles-section-hidden': productsFullscreen }">
              <div class="col-12">
                <q-input type="datetime-local" dense filled v-model="deliveryDate" label="Fecha de entrega" />
              </div>
              <div class="col-12">
                <q-input type="textarea" filled v-model="invoiceDescription" label="Descripción" autogrow />
              </div>
              <div class="col-12">
                <q-card flat bordered class="q-mt-md">
                  <q-card-section class="q-pb-sm">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center justify-between">
                      <div class="flex items-center">
                        <q-icon name="attachment" class="q-mr-sm" />
                        Archivos Adjuntos
                      </div>

                      <!-- Botón para agregar archivos - visible cuando ya hay archivos -->
                      <q-btn
                        v-if="purchaseFiles.length > 0"
                        round
                        color="primary"
                        text-color="white"
                        icon="add"
                        size="sm"
                        unelevated
                        @click="openFileDialog"
                      >
                        <q-tooltip>Agregar mis archivos</q-tooltip>
                      </q-btn>
                    </div>

                    <div
                      v-if="purchaseFiles.length === 0"
                      class="upload-zone"
                      :class="{ 'upload-zone-active': isDragOverPurchase, 'q-dark': $q.dark.isActive }"
                      @dragenter.prevent="isDragOverPurchase = true"
                      @dragover.prevent="isDragOverPurchase = true"
                      @dragleave.prevent="isDragOverPurchase = false"
                      @drop.prevent="handlePurchaseFileDrop"
                      @click="openFileDialog"
                    >
                      <div class="upload-content">
                        <q-icon name="cloud_upload" size="24px" color="primary" class="q-mb-xs" />
                        <div class="upload-text">Arrastra archivos aquí­</div>
                        <q-btn color="primary" label="SELECCIONAR" unelevated size="xs" class="q-mt-xs upload-btn" @click.stop="openFileDialog"/>
                      </div>
                    </div>

                    <input ref="fileInput" type="file" multiple accept="image/*,.pdf,application/pdf" style="display: none" @change="handleFileSelect" />

                    <div v-if="purchaseFiles.length > 0" class="q-mt-md">
                      <div class="text-body2 text-primary q-mb-sm">Archivos adjuntos ({{ purchaseFiles.length }})</div>
                      <file-component :files="purchaseFiles" @delete:files="handleDeletePurchaseFiles"/>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Impuestos y Descuentos -->
              <div class="col-12">
                <q-card style="border-radius: 10px;" class="shadow-1">
                  <q-card-section class="q-pa-sm">
                    <div class="text-subtitle2 text-weight-medium q-mb-sm">Impuestos y Descuentos</div>

                    <!-- Botones para agregar -->
                    <div class="row q-col-gutter-xs q-mb-sm">
                      <div class="col-6">
                        <q-btn
                          icon="add"
                          label="Impuesto"
                          color="orange"
                          dense
                          unelevated
                          class="full-width"
                          @click="dialogAddTax = true"
                        >
                          <q-badge v-if="taxes.length > 0" color="red" floating>{{ taxes.length }}</q-badge>
                        </q-btn>
                      </div>
                      <div class="col-6">
                        <q-btn
                          icon="add"
                          label="Descuento"
                          color="teal"
                          dense
                          unelevated
                          class="full-width"
                          @click="dialogAddDiscount = true"
                        >
                          <q-badge v-if="discounts.length > 0" color="red" floating>{{ discounts.length }}</q-badge>
                        </q-btn>
                      </div>
                    </div>

                    <!-- Resumen -->
                    <q-list separator bordered style="border-radius: 10px;">
                      <q-item dense>
                        <q-item-section>Subtotal</q-item-section>
                        <q-item-section side v-if="coin">{{ coin.symbol }} {{ formatNumber(totalBill) }}</q-item-section>
                      </q-item>

                      <q-item dense v-if="taxes.length > 0" clickable @click="dialogViewTaxes = true">
                        <q-item-section>
                          <q-item-label>Impuestos (+)</q-item-label>
                          <q-item-label caption>{{ taxes.length }} impuesto(s)</q-item-label>
                        </q-item-section>
                        <q-item-section side class="text-orange">
                          {{ coin?.symbol }} {{ formatNumber(totalTaxes) }}
                        </q-item-section>
                        <q-item-section side>
                          <q-icon name="chevron_right" size="xs" />
                        </q-item-section>
                      </q-item>

                      <q-item dense v-if="discounts.length > 0" clickable @click="dialogViewDiscounts = true">
                        <q-item-section>
                          <q-item-label>Descuentos (-)</q-item-label>
                          <q-item-label caption>{{ discounts.length }} descuento(s)</q-item-label>
                        </q-item-section>
                        <q-item-section side class="text-teal">
                          {{ coin?.symbol }} {{ formatNumber(totalDiscounts) }}
                        </q-item-section>
                        <q-item-section side>
                          <q-icon name="chevron_right" size="xs" />
                        </q-item-section>
                      </q-item>

                      <q-separator v-if="taxes.length > 0 || discounts.length > 0" />

                      <q-item dense v-if="taxes.length > 0 || discounts.length > 0">
                        <q-item-section><strong>Total</strong></q-item-section>
                        <q-item-section side v-if="coin">
                          <strong>{{ coin.symbol }} {{ formatNumber(totalBill + totalTaxes - totalDiscounts) }}</strong>
                        </q-item-section>
                      </q-item>

                      <q-item dense>
                        <q-item-section>Monto pagado</q-item-section>
                        <q-item-section class="text-positive" side v-if="coin">{{ coin.symbol }} {{ formatNumber(totalPayment) }}</q-item-section>
                      </q-item>

                      <q-item dense>
                        <q-item-section>Por pagar</q-item-section>
                        <q-item-section side v-if="coin">{{ coin.symbol }} {{ formatNumber(pendingPayment) }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL (Product Catalog) -->
        <div ref="productsSection" class="products-section" :class="{ 'products-section-fullscreen': productsFullscreen }">
          <div style="flex-shrink: 0; padding-bottom: 0.5rem;" v-if="$q.screen.gt.sm">
            <div class="flex q-gutter-sm justify-start">
              <q-btn
                label="Guardar"
                icon="save"
                color="positive"
                dense
                :disable="products.length <= 0"
                @click="dialogPayment = true"
                style="border-radius: 10px; padding: 5px 15px"
              />
              <q-btn
                label="Buscar"
                icon="search"
                color="primary"
                dense
                @click="searchInvoice = true"
                style="border-radius: 10px; padding: 5px 15px"
              />
              <q-btn
                label="Borrar"
                icon="delete"
                color="negative"
                dense
                @click="clear"
                style="border-radius: 10px; padding: 5px 15px"
              />
            </div>
          </div>

          <div class="row q-col-gutter-xs">
            <div class="col-6">
              <q-select
                use-input
                filled
                dense
                clearable
                label="Categorí­as"
                input-debounce="0"
                option-label="name"
                option-value="id"
                v-model="category"
                :options="categories"
                @filter="filterCategories"
              />
            </div>
            <div class="col-6">
              <q-input type="search" filled dense debounce="1000" v-model="filter" placeholder="Buscar" clearable>
                <template v-slot:append>
                    <q-btn
                    v-if="$q.screen.lt.md"
                    :icon="productsFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                    flat dense round size="sm"
                    @click="productsFullscreen = !productsFullscreen"
                  />
                  <q-icon v-else name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <div
            class="product-container-scroll"
            style="flex: 1; overflow-y: auto; padding: 0.5rem;"
            :style="$q.screen.lt.md ? 'padding-bottom: 80px !important;' : ''"
            @scroll="handleProductsScroll"
          >
            <div class="row q-col-gutter-xs">
                <div
                    v-for="product in allProducts"
                    :key="product.id"
                    class="col-xs-4 col-sm-4 col-md-3 col-lg-2 col-xl-2"
                    style="padding: 1px;"
                >
                      <q-card class="my-card" style="border-radius: 10px; cursor: pointer;">
                        <q-img
                            style="height: 150px; width: 100%; border-radius: 10px;"
                            :src="product.images[0] ? product.images[0].url : 'images/404-image.jpg'"
                            @click="validateProduct(product, true)"
                        >
                            <div class="absolute-full text-subtitle2 flex flex-center text-bold text-center product-name-overlay">
                              {{ product.name }}
                            </div>
                        </q-img>
                      </q-card>
                </div>
                  <template v-if="loadingProducts">
                    <div v-for="n in 10" :key="n" class="col-xs-4 col-sm-4 col-md-3 col-lg-2 col-xl-2" style="padding: 1px;">
                        <q-card class="my-card" style="border-radius: 10px;"><q-skeleton height="150px" width="100%" /></q-card>
                    </div>
                  </template>
            </div>
          </div>
        </div>
      </div>

      <q-page-sticky v-if="$q.screen.lt.md" position="bottom" :offset="[0, 12]">
        <q-btn
          class="cobrar-floating-btn"
          color="positive"
          :disable="products.length <= 0"
          @click="dialogPayment = true"
          no-caps
          unelevated
          style="width: 90vw; border-radius: 50px;"
        >
          <div class="row full-width justify-between items-center q-px-md">
                <span>Guardar</span>
                <span>{{ coin?.symbol }} {{ formatNumber(totalBill) }}</span>
          </div>
        </q-btn>
      </q-page-sticky>

    </q-form>

    <q-dialog v-model="openAddProduct" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 1200px; max-width: 95vw;">
        <q-card-section class="row items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Agregar producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="saveProduct" ref="formAddProduct">
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="row col-md-7 col-xs-12 col-sm-12">
                <!-- Datos bí¡sicos -->
                <div class="col-12">
                  <q-card flat bordered class="q-pa-md q-mb-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="info" class="q-mr-sm" />
                      Datos bí¡sicos
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-input
                          filled
                          v-model="product.barcode"
                          autofocus
                          label="Código de barra"
                          dense
                          @keyup.enter="getOneProduct(product.barcode)"
                        >
                          <template v-slot:append v-if="$q.platform.is.nativeMobile">
                            <q-icon name="qr_code_scanner" size="sm" class="cursor-pointer" />
                          </template>
                        </q-input>
                      </div>
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-input
                          :rules="[val => !!val || 'El campo es requerido.']"
                          filled
                          v-model="product.name"
                          label="Nombre"
                          dense
                        />
                      </div>
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-select
                          use-input
                          filled
                          label="Categorí­a"
                          input-debounce="0"
                          option-label="name"
                          option-value="id"
                          v-model="categoryAdd"
                          :options="categories"
                          :rules="[val => !!val || 'El campo es requerido.']"
                          @filter="filterCategories"
                          @update:model-value="setCategory"
                          dense
                        />
                      </div>
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-select
                          filled
                          dense
                          v-model="unitOfMeasure"
                          :options="unitOfMeasures"
                          option-label="name"
                          option-value="id"
                          label="Unidad de Medida"
                          :rules="[val => !!val || 'Requerido']"
                        />
                      </div>
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-input
                          filled
                          dense
                          v-model.number="product.base_quantity"
                          label="Cantidad Base"
                          type="number"
                          step="0.01"
                          min="0.01"
                          hint="Cantidad para el costo (ej: 100 para $X por 100g)"
                          :rules="[val => val > 0 || 'Debe ser mayor a 0']"
                        />
                      </div>
                      <div class="col-12">
                        <q-input
                          filled
                          v-model="product.description"
                          type="textarea"
                          autogrow
                          label="Descripción"
                          dense
                        />
                      </div>
                    </div>
                  </q-card>
                </div>

                <!-- Precios -->
                <div class="col-12">
                  <q-card flat bordered class="q-pa-md q-mb-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="attach_money" class="q-mr-sm" />
                      Precios
                    </div>
                    <div class="row q-col-gutter-sm q-mb-md">
                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                        <q-input
                          :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                          filled
                          v-model="product.cost"
                          label="Costo"
                          type="number"
                          dense
                          @update:model-value="updateCost"
                        />
                      </div>
                      <div class="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-xs-12">
                        <q-input
                          :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                          filled
                          v-model.number="product.profit_percentage"
                          :model-value="Number(product?.profit_percentage).toFixed(2)"
                          label="Margen %"
                          min="0"
                          dense
                          @update:model-value="updateProfitPercentage"
                        />
                      </div>
                      <div class="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-xs-12">
                        <q-input
                          :rules="[val => !!val || 'El campo es requerido.']"
                          filled
                          v-model="product.price"
                          label="Precio base"
                          type="number"
                          step=".01"
                          dense
                          @update:model-value="updatePrice"
                        />
                      </div>
                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                        <q-input
                          filled
                          v-model="product.minimum_stock"
                          label="Stock mí­nimo"
                          type="number"
                          step=".01"
                          dense
                        />
                      </div>
                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                        <q-select
                          use-input
                          filled
                          label="Iva (%)"
                          input-debounce="0"
                          option-label="Desc"
                          option-value="id"
                          v-model="product.aliquot_type"
                          :options="aliquotTypes"
                          @filter="getAliquotTypes"
                          dense
                        />
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>

              <!-- Sección de imí¡genes -->
              <div class="col-md-5 col-xs-12 col-sm-12">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="image" class="q-mr-sm" />
                    Imí¡genes
                  </div>
                  <q-card
                    flat
                    bordered
                    class="dropzone-card q-mb-md"
                    :class="{ 'dropzone-active': isDragOver }"
                    @dragover.prevent="isDragOver = true"
                    @dragleave.prevent="isDragOver = false"
                    @drop.prevent="handleDrop"
                  >
                    <q-card-section class="text-center q-pa-xl q-gutter-y-md">
                      <!-- Image Preview Grid -->
                      <div class="col-12" v-if="product.images.length">
                        <div class="text-subtitle2 text-primary q-mb-md">Vista Previa</div>
                        <div class="row q-col-gutter-sm scroll q-pa-sm" style="max-height: 400px;">
                          <div
                            v-for="(image, index) in product.images"
                            :key="index"
                            class="col-6 col-sm-4 col-md-4"
                          >
                            <q-card flat class="image-preview-card">
                              <q-img
                                :src="image.url"
                                :ratio="1"
                                class="rounded-borders"
                              >
                                <div class="absolute-top-right bg-transparent">
                                  <q-btn
                                    size="sm"
                                    icon="close"
                                    color="negative"
                                    round
                                    dense
                                    @click="deleteImage(image, index)"
                                  />
                                </div>
                              </q-img>
                            </q-card>
                          </div>
                        </div>
                      </div>
                      <div v-else>
                        <q-icon name="cloud_upload" size="4rem" color="grey-5" class="q-mb-md" />
                        <div class="text-h6 text-grey-7 q-mb-sm">
                          Arrastra las imí¡genes aquí­
                        </div>
                        <div class="text-body2 text-grey-5 q-mb-md">
                          o haz clic para seleccionar archivos
                        </div>
                      </div>
                      <q-btn
                        color="primary"
                        label="Seleccionar Imí¡genes"
                        @click="openFileDialog"
                        unelevated
                      />
                      <input
                        ref="fileInput"
                        type="file"
                        multiple
                        accept="image/*"
                        style="display: none"
                        @change="handleFileSelect"
                      />
                    </q-card-section>
                  </q-card>
                  <q-card flat bordered class="q-pa-md q-mb-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="settings" class="q-mr-sm" />
                      Configuración
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <q-toggle
                          v-model="product.skip_stock"
                          label="Facturar sin stock"
                          :true-value="1"
                          :false-value="0"
                          color="positive"
                        />
                      </div>
                      <div class="col-6">
                        <q-toggle
                          v-model="product.show_catalog"
                          label="Mostrar en catí¡logo"
                          :true-value="1"
                          :false-value="0"
                          color="positive"
                        />
                      </div>
                    </div>
                  </q-card>
                </q-card>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary q-pa-md">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible" unelevated />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogPayment" :maximized="$q.screen.lt.sm">
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 900px; max-width: 80vw;'">
        <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
          <span class="text-h6">Desglose de pago</span>
          <q-btn flat icon="close" round size="md" v-close-popup/>
        </q-card-section>
        <q-card-section class="row q-col-gutter-md q-px-sm">
          <div class="col-xs-12 col-sm-4 col-md-4 col-lg-3 q-gutter-xs">
            <q-btn
              color="secondary"
              size="17px"
              style="width: 100%"
              :label="paymentMethod.name"
              v-for="paymentMethod in paymentMethods" :key="paymentMethod.id"
              @click="addPayment(paymentMethod)"
            />
          </div>
          <div class="col-xs-12 col-sm-8 col-md-8 col-lg-9 q-gutter-xs row">
            <div class="col-12">
              <q-markup-table>
                <thead>
                  <tr>
                    <th class="text-left">Mí©todo de pago</th>
                    <th class="text-left">Referencia</th>
                    <th class="text-right">Monto</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(payment, index) in payments" :key="payment.id">
                    <td class="text-left">{{ payment.name }}</td>
                    <td class="text-left">
                      <span v-if="payment.reference"> {{ payment.reference }}</span>
                      <span v-else>-</span>
                      <q-popup-edit
                        v-model="payment.reference"
                        auto-save
                        v-slot="scope"
                      >
                        <q-input
                          v-model="scope.value"
                          autofocus
                          @keyup.enter="scope.set"
                        />
                      </q-popup-edit>
                    </td>
                    <td class="text-right">
                      {{ formatNumber(payment.amount) }}
                      <q-popup-edit
                        v-model.number="payment.amount"
                        auto-save
                        v-slot="scope"
                      >
                        <q-input
                          v-model="scope.value"
                          autofocus
                          @keyup.enter="scope.set"
                        />
                      </q-popup-edit>
                    </td>
                    <q-td class="text-center q-gutter-x-xs">
                      <q-btn
                        icon="delete"
                        color="negative"
                        rounded
                        dense
                        @click="deletePayment(index)"
                        />
                        <q-btn
                          v-if="payment.acronym === 'MPQA'"
                          rounded
                          dense
                          icon="qr_code"
                          color="secondary"
                          @click="waitingPayment = true"
                        />
                    </q-td>
                  </tr>
                  <tr>
                    <th colspan="4">
                      Restante a pagar:
                      <span v-if="coin">{{ coin.symbol }}</span>{{ formatNumber(pendingPayment) }}
                    </th>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-gutter-y-sm">
          <!-- <q-btn
            label="Guardar e imprimir factura"
            @click="savePrintInvoice"
            color="secondary"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
          />
          <q-btn
            label="Guardar e imprimir comanda"
            @click="submitBill"
            color="warning"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
          /> -->
          <q-btn
            label="Guardar"
            @click="saveWithoutPrint"
            color="primary"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="searchInvoice">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="q-py-sm bg-primary text-white flex justify-between items-center">
          <span class="text-h6">Buscar factura</span>
          <q-btn flat icon="close" round size="md" v-close-popup/>
        </q-card-section>
        <q-card-section>
          <q-form @submit="getInvoiceOne(search)" class="row full-width items-center no-wrap">
            <div :class="`col ${$q.screen.lt.sm ? 'q-pr-sm' : 'q-pr-md'}`">
              <q-input
                name="search"
                autocomplete="search"
                v-model="search"
                color="primary"
                label="Níºmero de factura"
                filled
                clearable
                type="search"
                required
                autofocus
                :dense="$q.screen.lt.sm"
                hide-bottom-space
              />
            </div>
            <div class="col-auto">
              <q-btn
                type="submit"
                color="primary"
                icon="search"
                :size="$q.screen.lt.sm ? 'md' : 'lg'"
                :loading="loadingSearch"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddProvider" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveProvider">
          <q-card-section class="row items-center q-py-sm bg-primary text-white">
            <div class="text-h6">Agregar proveedor</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="(openAddProvider = false)" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <!-- Nombre - Campo principal con asterisco -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="providerAdded.name"
                label="Nombre *"
              />
            </div>

            <!-- Información adicional -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 text-grey-7 q-mt-sm">
              Información adicional (opcional)
            </div>

            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="providerAdded.document_number"
                label="Níºmero de documento"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="providerAdded.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="providerAdded.phone_number"
                label="Níºmero de telí©fono"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="providerAdded.address"
                label="Dirección"
                type="textarea"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="loadingProvider"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="quantityDialog">
      <q-card style="width: 600px; max-width: 80vw;">
        <q-form @submit="validateProduct(productQuantity)">
          <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
            <span class="text-h6">Cantidad del producto</span>
            <q-btn icon="close" flat round dense @click="quantityDialog = false" />
          </q-card-section>
          <q-card-section class="q-pb-xs">
            <div class="row items-center justify-center q-gutter-x-sm">
              <div class="text-subtitle1">{{ productQuantity?.name }}</div>
              <div class="text-subtitle1 text-grey-7">en</div>
              <q-select
                v-model="selectedUom"
                :options="availableUoms"
                option-label="acronym"
                filled
                dense
                style="min-width: 80px"
              >
              </q-select>
            </div>
          </q-card-section>
          <q-card-section class="flex q-col-gutter-sm justify-between items-center">
            <q-input
              filled
              v-model.number="quantity"
              autofocus
              label="Cantidad"
              type="number"
              style="width: 50%;"
              @update:model-value="updateValues('quantity')"
            />
            <q-input
              filled
              v-model.number="currentAmount"
              label="Importe"
              type="number"
              style="width: 50%;"
              @update:model-value="updateValues('currentAmount')"
            />
          </q-card-section>
          <q-card-section class="q-pt-xs">
            <div class="text-subtitle1 text-center text-weight-bold row items-center justify-center q-gutter-x-xs">
               <span>Costo por {{ selectedUom?.acronym || 'unidad' }} = {{ formatNumber((productQuantity.cost || 0) * ((selectedUom?.ratio || 1) / (productQuantity.unit_of_measure?.ratio || 1))) }}</span>
               <q-icon name="help_outline" size="xs" color="grey-6">
                 <q-tooltip anchor="top middle" self="bottom middle">
                   Basado en el costo base de {{ formatNumber(productQuantity.cost) }} por {{ productQuantity.unit_of_measure?.acronym }}
                 </q-tooltip>
               </q-icon>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              label="Guardar"
              color="primary"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog para agregar impuestos -->
    <q-dialog v-model="dialogAddTax">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Agregar Impuesto</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-form @submit="addTax">
          <q-card-section>
            <q-input
              filled
              v-model="taxForm.description"
              label="Descripción"
              :rules="[val => !!val || 'Requerido']"
              class="q-mb-md"
            />
            <q-input
              filled
              v-model.number="taxForm.amount"
              label="Monto"
              type="number"
              step="0.01"
              :rules="[val => val > 0 || 'Debe ser mayor a 0']"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Cancelar" color="grey" flat v-close-popup />
            <q-btn label="Agregar" color="primary" type="submit" unelevated />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog para agregar descuentos -->
    <q-dialog v-model="dialogAddDiscount">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Agregar Descuento</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-form @submit="addDiscount">
          <q-card-section>
            <q-input
              filled
              v-model="discountForm.description"
              label="Descripción"
              :rules="[val => !!val || 'Requerido']"
              class="q-mb-md"
            />
            <q-input
              filled
              v-model.number="discountForm.amount"
              label="Monto"
              type="number"
              step="0.01"
              :rules="[val => val > 0 || 'Debe ser mayor a 0']"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Cancelar" color="grey" flat v-close-popup />
            <q-btn label="Agregar" color="primary" type="submit" unelevated />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog para ver/gestionar impuestos -->
    <q-dialog v-model="dialogViewTaxes">
      <q-card style="width: 600px; max-width: 80vw;">
        <q-card-section class="row items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Impuestos</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-list bordered separator>
            <q-item v-for="(tax, index) in taxes" :key="index">
              <q-item-section>
                <q-item-label>{{ tax.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                {{ formatNumber(tax.amount) }}
              </q-item-section>
              <q-item-section side>
                <q-btn
                  icon="delete"
                  flat
                  round
                  dense
                  color="negative"
                  @click="removeTax(index)"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="taxes.length === 0">
              <q-item-section class="text-grey-6 text-center">
                No hay impuestos agregados
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog para ver/gestionar descuentos -->
    <q-dialog v-model="dialogViewDiscounts">
      <q-card style="width: 600px; max-width: 80vw;">
        <q-card-section class="row items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Descuentos</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-list bordered separator>
            <q-item v-for="(discount, index) in discounts" :key="index">
              <q-item-section>
                <q-item-label>{{ discount.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                {{ formatNumber(discount.amount) }}
              </q-item-section>
              <q-item-section side>
                <q-btn
                  icon="delete"
                  flat
                  round
                  dense
                  color="negative"
                  @click="removeDiscount(index)"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="discounts.length === 0">
              <q-item-section class="text-grey-6 text-center">
                No hay descuentos agregados
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog para visualización de análisis IA -->
    <q-dialog
      v-model="showAnalysisModal"
      persistent
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <q-card
        :style="$q.screen.gt.sm ? 'min-width: 1150px; border-radius: 20px;' : 'border-radius: 0;'"
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-2'"
      >
        <!-- Sticky Header -->
        <q-toolbar class="q-py-sm q-px-md" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-white'">
          <div class="row items-center full-width">
            <q-avatar color="primary" text-color="white" icon="auto_awesome" size="32px" class="q-mr-sm shadow-1" />
            <div>
              <div class="text-subtitle1 text-weight-bolder line-height-1" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Resultados de Análisis IA</div>
              <div class="text-caption text-grey-7">Validación inteligente de suministros</div>
            </div>
            <q-space />
            <q-btn flat round dense icon="close" color="grey-7" v-close-popup @click="clearAnalysis" class="hover-scale" />
          </div>
        </q-toolbar>

        <q-card-section :class="$q.screen.gt.sm ? 'q-pa-md' : 'q-pa-sm'" style="max-height: calc(100vh - 180px); overflow-y: auto;">
          <div class="row q-col-gutter-lg">
            <!-- Columna Izquierda: Información de Cabecera -->
            <div class="col-12 col-md-3">
              <div class="sticky-top">
                <q-card flat bordered class="rounded-borders-15 q-pa-md overflow-hidden relative-position shadow-sm" :class="$q.dark.isActive ? 'bg-grey-9 border-grey-8' : 'bg-white border-grey-3'">
                  <!-- Decoración de fondo -->
                  <div class="absolute-top-right q-ma-sm opacity-05" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">
                    <q-icon name="receipt" size="80px" />
                  </div>

                  <div class="text-subtitle2 text-primary text-weight-bold q-mb-xs" style="font-size: 11px;">DATOS DE COMPRA</div>

                  <div class="q-gutter-y-md">
                    <!-- Proveedor -->
                    <div class="field-container">
                      <div class="row justify-between items-end q-mb-xs">
                        <span class="text-subtitle2 text-weight-medium" :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-9'">Proveedor</span>
                        <q-badge v-if="analysisData.selectedProvider" color="positive" rounded class="q-px-sm">Registrado</q-badge>
                      </div>
                      <q-select
                        outlined
                        v-model="analysisData.selectedProvider"
                        :options="providers"
                        option-label="name"
                        option-value="id"
                        use-input
                        @filter="filterProviders"
                        placeholder="Vincular proveedor..."
                        class="custom-select"
                        :dark="$q.dark.isActive"
                      >
                        <template v-slot:prepend>
                          <q-icon name="storefront" color="primary" />
                        </template>
                      </q-select>
                      <div v-if="analysisData.provider_name && !analysisData.selectedProvider" :class="$q.dark.isActive ? 'bg-amber-10 text-amber-2 border-amber-9' : 'bg-amber-1 text-amber-9 border-amber-2'" class="q-pa-sm q-mt-sm rounded-borders-10 border row no-wrap items-start animate-fade">
                        <q-icon name="psychology" size="18px" class="q-mr-xs q-mt-xs" />
                        <span class="text-caption font-medium">Detectado por IA: <strong>"{{ analysisData.provider_name }}"</strong></span>
                      </div>
                    </div>

                    <div class="row q-gutter-xs">
                      <div class="col-12 col-md-12">
                        <span class="text-caption text-grey-7 font-weight-medium uppercase">Nº Factura</span>
                        <q-input outlined dense v-model="analysisData.invoice_number" class="q-mt-xs font-weight-bold" :dark="$q.dark.isActive" />
                      </div>
                      <div class="col-12 col-md-12">
                        <span class="text-caption t+ext-grey-7 font-weight-medium uppercase">Fecha Emisión</span>
                        <q-input outlined dense v-model="analysisData.date" mask="####-##-##" class="q-mt-xs" :dark="$q.dark.isActive">
                          <template v-slot:append>
                            <q-icon name="calendar_today" size="16px" class="cursor-pointer">
                              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="analysisData.date" mask="YYYY-MM-DD" minimal :dark="$q.dark.isActive" />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                    </div>

                    <!-- Total Impactante -->
                    <div class="q-mt-md">
                      <div class="q-pa-sm rounded-borders-10 text-center relative-position overflow-hidden shadow-1 bg-primary text-white">
                        <div class="text-caption opacity-80 text-uppercase letter-spacing-1 q-mb-xs font-medium">Total Detectado</div>
                        <div class="text-h5 text-weight-bolder">
                          <span class="text-subtitle1 opacity-70">{{ analysisData?.currency || '$' }}</span>
                          {{ formatNumber(analysisData?.total_amount || 0) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card>
              </div>
            </div>
            <!-- Columna Derecha: Detalle de Productos -->
            <div class="col-12 col-md-9">
              <div class="row items-center justify-between q-mb-md">
                <div class="row items-center">
                  <div class="text-h6 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Artículos Identificados</div>
                  <q-chip outline color="primary" class="q-ml-md text-weight-bold" size="sm">
                    {{ analysisData?.items?.length || 0 }} Líneas
                  </q-chip>
                </div>
                <div class="text-caption text-grey-7">Validación inteligente activa</div>
              </div>

              <!-- Lista de Items (Refined Cards) -->
              <div class="q-gutter-y-md">
                <div v-if="!analysisData?.items?.length" class="text-center q-pa-lg rounded-15 border-dashed q-mt-lg" :class="$q.dark.isActive ? 'bg-grey-9 border-grey-7' : 'bg-white border-grey-4'">
                   <q-icon name="explore_off" size="60px" color="grey-5" />
                   <div class="text-subtitle1 text-grey-6 q-mt-sm">Sin datos detectables</div>
                </div>

                <q-card
                  v-for="(item, index) in analysisData.items"
                  :key="index"
                  flat
                  bordered
                  class="item-card overflow-hidden transition-base rounded-15 shadow-sm"
                  :class="[
                    $q.dark.isActive ? 'bg-grey-9 border-grey-8' : 'bg-white border-grey-3',
                    item.is_new ? 'border-l-positive' : 'border-l-primary'
                  ]"
                >
                  <div class="q-pa-md">
                    <div class="row q-col-gutter-sm items-center">
                      <!-- Info Producto -->
                      <div class="col-12 col-md-5">
                        <div class="row items-center q-mb-xs">
                          <q-icon
                            :name="item.is_new ? 'new_releases' : 'check_circle'"
                            :color="item.is_new ? 'positive' : 'primary'"
                            size="xs"
                            class="q-mr-xs"
                          />
                          <span class="text-caption text-weight-bold uppercase" :class="item.is_new ? 'text-positive' : 'text-primary'">
                            {{ item.is_new ? 'Nuevo Producto' : 'Cátalogo' }}
                          </span>
                        </div>

                        <q-select
                          outlined
                          dense
                          v-model="item.selectedProduct"
                          :options="item.productOptions"
                          option-label="name"
                          option-value="id"
                          use-input
                          fill-input
                          hide-selected
                          @filter="(val, update) => filterProductsRow(val, update, item)"
                          @update:model-value="(val) => onProductSelect(val, item)"
                          placeholder="Vincular con producto existente..."
                          class="q-mb-xs q-mt-xs"
                          :dark="$q.dark.isActive"
                          style="font-size: 13px"
                        >
                          <template v-slot:no-option>
                            <q-item><q-item-section class="text-grey italic text-caption">No hay coincidencias</q-item-section></q-item>
                          </template>
                        </q-select>

                        <div class="text-caption text-grey-7 q-ml-xs">
                          IA detectó: <span class="text-weight-medium">{{ item.description }}</span>
                        </div>

                        <!-- Categoría y Unidad (Solo si es nuevo) -->
                        <div class="row q-col-gutter-xs q-mt-xs" v-if="item.is_new">
                          <div class="col-6">
                            <q-select
                              outlined
                              dense
                              v-model="item.category"
                              :options="categories"
                              option-label="name"
                              placeholder="Categoría"
                              :dark="$q.dark.isActive"
                              style="font-size: 12px"
                              @filter="filterCategories"
                            />
                          </div>
                          <div class="col-6">
                            <q-select
                              outlined
                              dense
                              v-model="item.uom"
                              :options="unitOfMeasures"
                              option-label="name"
                              placeholder="Unidad"
                              :dark="$q.dark.isActive"
                              style="font-size: 12px"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- Valores y Cantidad -->
                      <div class="col-12 col-md-4">
                        <div class="row q-col-gutter-sm">
                          <div class="col-4">
                            <div class="text-caption text-grey-7 text-center uppercase" style="font-size: 10px">Cant</div>
                            <q-input outlined dense v-model.number="item.quantity" type="number" step="any" input-class="text-center text-weight-bold" :dark="$q.dark.isActive" />
                          </div>
                          <div class="col-8">
                            <div class="text-caption text-grey-7 text-center uppercase" style="font-size: 10px">Precio Unitario</div>
                            <q-input outlined dense v-model.number="item.unit_price" type="number" step="any" prefix="$" input-class="text-right text-weight-bold" :dark="$q.dark.isActive" />
                          </div>
                        </div>
                      </div>

                      <!-- Subtotal -->
                      <div class="col-12 col-md-3 text-right">
                        <div class="text-caption text-grey-7 uppercase font-bold" style="font-size: 11px">Subtotal</div>
                        <div class="text-h6 text-weight-bolder text-primary">
                          {{ formatNumber(item.quantity * item.unit_price) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card>
              </div>

               <div class="q-mt-md q-pa-md rounded-15 flex items-center shadow-sm border" :class="$q.dark.isActive ? 'bg-blue-10 text-blue-2 border-blue-9' : 'bg-blue-1 text-blue-9 border-blue-2'">
                  <q-icon name="lightbulb" size="24px" class="q-mr-md" />
                  <div class="col">
                    <div class="text-caption opacity-90">
                      <strong>Sincronización Inteligente:</strong> He vinculado los productos detectados con tu inventario. Si ves un item "NUEVO" que ya existe, búscalo para vincularlo.
                    </div>
                  </div>
               </div>

            </div>
          </div>
        </q-card-section>

        <!-- Footer -->
        <q-card-actions align="right" class="q-pa-md" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-white'">
          <div class="row q-gutter-x-sm items-center">
            <q-btn
              unelevated
              label="Importar Factura"
              color="primary"
              icon-right="bolt"
              @click="applyAnalysisData"
              class="q-px-lg text-weight-bold rounded-10"
              no-caps
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
// import { StreamBarcodeReader } from 'vue-barcode-reader'
import { Notify } from 'quasar'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatDate, formatNumber, notify, BALANZA_PREFIXES } from 'src/const/mixins'
import FileComponent from 'src/components/FileComponent.vue'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
export default {
  name: 'NewPurchasePage',
  components: {
    // StreamBarcodeReader,
    FileComponent
  },
  data () {
    return {
      /**
       * Controls if the products view is in fullscreen mode
       * @type {boolean} products fullscreen state
       */
      productsFullscreen: false,
      /**
       * The invoice or purchase number code
       * @type {string} purchase code
       */
      purchaseCode: null,
      /**
       * Indicates if a billing operation is in progress
       * @type {boolean} loading billing state
       */
      loadingBilling: false,
      /**
       * Indicates if a search operation is in progress
       * @type {boolean} loading search state
       */
      loadingSearch: false,
      /**
       * State of the invoice printer dialog
       * @type {boolean} invoice printer state
       */
      invoicePrinter: false,
      /**
       * Visibility state of the quantity selection dialog
       * @type {boolean} quantity dialog state
       */
      quantityDialog: false,
      /**
       * The product currently being processed in the quantity dialog
       * @type {object} product quantity object
       */
      productQuantity: null,
      /**
       * The quantity selected for a product
       * @type {number} quantity value
       */
      quantity: 1,
      /**
       * The current monetary amount for the selected quantity
       * @type {number} current amount value
       */
      currentAmount: 0,
      /**
       * The unit of measure selected in the quantity dialog
       * @type {object} selected UOM object
       */
      selectedUom: null,
      /**
       * Description for the cashflow entry
       * @type {string} cashflow description
       */
      description: '',
      /**
       * Additional description or notes for the invoice
       * @type {string} invoice description
       */
      invoiceDescription: '',
      /**
       * The delivery or invoice date
       * @type {string} delivery date string
       */
      deliveryDate: formatDate(Date(), 'YYYY-MM-DDTHH:mm'),
      /**
       * Function to format numbers as currency or decimal strings
       * @type {function} format number function
       */
      formatNumber,
      /**
       * Visibility state of the invoice search dialog
       * @type {boolean} search invoice state
       */
      searchInvoice: false,
      /**
       * Search term for filtering products or invoices
       * @type {string} search string
       */
      search: '',
      /**
       * Indicates if a provider save operation is in progress
       * @type {boolean} loading provider state
       */
      loadingProvider: false,
      /**
       * Visibility state of the add provider modal
       * @type {boolean} open add provider state
       */
      openAddProvider: false,
      /**
       * Form data for a new provider being added
       * @type {object} provider added data
       */
      providerAdded: {},
      /**
       * The current purchase or invoice data object
       * @type {object} purchase data
       */
      purchase: null,
      /**
       * The category used to filter products
       * @type {object} category filter
       */
      category: null,
      /**
       * The currently selected type of service
       * @type {object} type of service object
       */
      typeOfService: null,
      /**
       * List of available types of services
       * @type {array} type of services array
       */
      typeOfServices: [],
      /**
       * List of available IVA conditions for receptors
       * @type {array} condition IVA receptors array
       */
      conditionIvaReceptors: [],
      /**
       * List of payments added to the current purchase
       * @type {array} payments array
       */
      payments: [],
      /**
       * List of available payment methods
       * @type {array} payment methods array
       */
      paymentMethods: [],
      /**
       * Visibility state of the payment dialog
       * @type {boolean} dialog payment state
       */
      dialogPayment: false,
      /**
       * List of available invoice types
       * @type {array} invoice types array
       */
      invoiceTypes: [],
      /**
       * The currently selected invoice type
       * @type {object} invoice type object
       */
      invoiceType: null,
      /**
       * List of available currencies (coins)
       * @type {array} coins array
       */
      coins: [],
      /**
       * The currently selected currency (coin)
       * @type {object} coin object
       */
      coin: null,
      /**
       * List of available providers
       * @type {array} providers array
       */
      providers: [],
      /**
       * The currently selected provider for the billing operation
       * @type {object} provider object
       */
      provider: null,
      /**
       * The current exchange rate for currency conversion
       * @type {number} exchange rate value
       */
      exchangeRate: 1,
      /**
       * Configuration object for product table pagination
       * @type {object} pagination config object
       */
      pagination: {
        rowsPerPage: 50,
        rowsNumber: 50,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      /**
       * Filter string for searching products
       * @type {string} products filter string
       */
      filter: '',
      /**
       * The barcode string being processed
       * @type {string} barcode value
       */
      barcode: null,
      /**
       * Indicates if an invoice image is currently being analyzed by AI
       * @type {boolean} analyzing invoice state
       */
      analyzingInvoice: false,
      /**
       * Visibility state of the AI analysis results modal
       * @type {boolean} show analysis modal state
       */
      showAnalysisModal: false,
      /**
       * The extracted data from an AI invoice analysis
       * @type {object} AI analysis data object
       */
      analysisData: null,
      /**
       * Prefix code used for weight scale (balanza) barcodes
       * @type {string} balance code prefix
       */
      balanceCode: null,
      /**
       * Indicates if the application is currently in barcode scanning mode
       * @type {boolean} scanning mode state
       */
      scanningMode: false,
      /**
       * List of invoice type acronyms that don't require immediate payment
       * @type {array} without payment types array
       */
      withoutPayment: ['T', 'P', 'CC'],

      /**
       * List of service type codes that require validation
       * @type {array} with service type codes array
       */
      withServiceType: [4],
      /**
       * Visibility state of the manual barcode scan dialog
       * @type {boolean} model scan state
       */
      modelScan: false,
      /**
       * List of files (images/PDFs) attached to the current purchase
       * @type {array} purchase files array
       */
      purchaseFiles: [],
      /**
       * Indicates if a file is currently being dragged over the purchase attachment area
       * @type {boolean} drag over state
       */
      isDragOverPurchase: false,
      /**
       * List of attached file IDs that have been marked for deletion
       * @type {array} deleted purchase files array
       */
      deletedPurchaseFiles: [],
      /**
       * Indicates if the save operation should proceed without printing
       * @type {boolean} without print state
       */
      withoutPrint: false,
      /**
       * Search term for filtering providers within the selection modal
       * @type {string} provider search string
       */
      providerSearch: '',
      /**
       * Visibility state of the provider selection menu/popup
       * @type {boolean} provider menu open state
       */
      providerMenuOpen: false,
      /**
       * Indicates if providers are currently being fetched from the server
       * @type {boolean} loading providers state
       */
      loadingProviders: false,
      /**
       * Indicates if invoice types are currently being fetched from the server
       * @type {boolean} loading invoice types state
       */
      loadingInvoiceTypes: false,
      /**
       * Indicates if service types are currently being fetched from the server
       * @type {boolean} loading type of services state
       */
      loadingTypeOfServices: false,
      /**
       * Visibility state of the center floating action button
       * @type {boolean} center FAB state
       */
      centerFabOpen: false,
      /**
       * Visibility state of the right floating action button
       * @type {boolean} right FAB state
       */
      rightFabOpen: false,
      /**
       * List of available aliquot (tax rate) types
       * @type {array} aliquot types array
       */
      aliquotTypes: [],
      /**
       * Category object for a new product being added
       * @type {object} category add object
       */
      categoryAdd: null,
      /**
       * List of taxes applied to the current purchase
       * @type {array} taxes array
       */
      taxes: [],
      /**
       * List of discounts applied to the current purchase
       * @type {array} discounts array
       */
      discounts: [],
      /**
       * Visibility state of the add tax dialog
       * @type {boolean} dialog add tax state
       */
      dialogAddTax: false,
      /**
       * Visibility state of the add discount dialog
       * @type {boolean} dialog add discount state
       */
      dialogAddDiscount: false,
      /**
       * Visibility state of the view taxes list modal
       * @type {boolean} dialog view taxes state
       */
      dialogViewTaxes: false,
      /**
       * Visibility state of the view discounts list modal
       * @type {boolean} dialog view discounts state
       */
      dialogViewDiscounts: false,
      /**
       * Form data for adding a new tax
       * @type {object} tax form data
       */
      taxForm: {
        description: 'Iva del',
        amount: 0
      },
      /**
       * Form data for adding a new discount
       * @type {object} discount form data
       */
      discountForm: {
        description: 'Descuento del',
        amount: 0
      },
      /**
       * List of products included in the current purchase
       * @type {array} products array
       */
      products: [],
      /**
       * General visibility state for UI elements or loading overlays
       * @type {boolean} visible state
       */
      visible: false,
      /**
       * The calculated total amount of the current purchase/bill
       * @type {number} total bill value
       */
      totalBill: 0,
      /**
       * List of all products available in the system (for selection)
       * @type {array} all products array
       */
      allProducts: [],
      /**
       * List of all product categories available
       * @type {array} categories array
       */
      categories: [],
      /**
       * The currently selected unit of measure (object)
       * @type {object} selected UOM
       */
      unitOfMeasure: null,
      /**
       * List of all available units of measure
       * @type {array} unit of measures array
       */
      unitOfMeasures: [],
      /**
       * Data object for a new product being created
       * @type {object} product data object
       */
      product: {
        show_catalog: 0,
        skip_stock: 0,
        profit_percentage: 0,
        images: [],
        base_quantity: 1
      },
      /**
       * List of price lists associated with a product
       * @type {array} price lists array
       */
      priceLists: [],
      /**
       * Indicates if a file is currently being dragged over a drop zone
       * @type {boolean} drag over state
       */
      isDragOver: false,
      /**
       * Visibility state of the modal used to add products manually
       * @type {boolean} open add product modal state
       */
      openAddProduct: false,
      /**
       * List of addon products selected for the current item
       * @type {array} addons products array
       */
      addonsProducts: [],
      /**
       * List of available options for addon products
       * @type {array} addon product options array
       */
      addonsProductsOptions: [],
      /**
       * Indicates if products are currently being loaded from the API
       * @type {boolean} loading products state
       */
      loadingProducts: false,
      /**
       * Definition of columns for the desktop products selection table
       * @type {array} product columns configuration
       */
      productColumns: [
        {
          name: 'barcode',
          align: 'left',
          label: 'Código',
          field: 'barcode',
          sortable: true
        },
        {
          name: 'name',
          required: true,
          label: 'Descripción',
          align: 'left',
          field: row => row.name,
          sortable: true
        },
        {
          name: 'category',
          align: 'right',
          label: 'Categorí­a',
          field: row => row.category?.name,
          sortable: true
        },
        {
          name: 'cost',
          align: 'right',
          label: 'Costo',
          field: 'cost',
          sortable: true
        }
      ],
      /**
       * Definition of columns for the main purchase products table
       * @type {array} main table columns configuration
       */
      columns: [
        { name: 'barcode', align: 'left', label: 'Código', field: 'barcode', sortable: true },
        {
          name: 'name',
          required: true,
          label: 'Descripción',
          align: 'left',
          field: row => row.name,
          sortable: true
        },
        { name: 'cost', align: 'right', label: 'Costo', field: 'cost', sortable: true },
        { name: 'taxe', align: 'right', label: 'Impuesto', field: 'taxe', sortable: true },
        { name: 'quantity', align: 'right', label: 'Cantidad', field: 'quantity', sortable: true },
        { name: 'uom', align: 'left', label: 'Unidad', field: 'uom_acronym', sortable: true },
        { name: 'subtotal', align: 'right', label: 'Importe', field: 'subtotal', sortable: true },
        { name: 'actions', align: 'right', label: 'Acciones', field: 'actions' }
      ],
      /**
       * Definition of columns for the AI analysis results table
       * @type {array} analysis table columns configuration
       */
      analysisColumns: [
        { name: 'status', label: '', align: 'center' },
        { name: 'description', label: 'Producto / Descripción', align: 'left' },
        { name: 'category', label: 'Categoría', align: 'left' },
        { name: 'uom', label: 'UOM', align: 'left' },
        { name: 'catalog', label: 'Catálogo', align: 'center' },
        { name: 'quantity', label: 'Cant.', align: 'right' },
        { name: 'unit_price', label: 'Costo', align: 'right' },
        { name: 'total', label: 'Total', align: 'right' }
      ]
    }
  },
  computed: {
    /**
     * Calculates the remaining amount to be paid for the current purchase
     * @return {number} pending payment amount
     */
    pendingPayment () {
      const grandTotal = this.totalBill + this.totalTaxes - this.totalDiscounts
      return grandTotal - this.totalPayment
    },
    /**
     * Calculates the sum of all payments added to the purchase
     * @return {number} total payment amount
     */
    totalPayment () {
      let totalPayment = 0
      this.payments.forEach((payment) => {
        totalPayment = totalPayment + payment.amount
      })
      return totalPayment
    },
    /**
     * Calculates the sum of all taxes applied to the purchase
     * @return {number} total taxes amount
     */
    totalTaxes () {
      return this.taxes.reduce((sum, tax) => sum + (parseFloat(tax.amount) || 0), 0)
    },
    /**
     * Calculates the sum of all discounts applied to the purchase
     * @return {number} total discounts amount
     */
    totalDiscounts () {
      return this.discounts.reduce((sum, discount) => sum + (parseFloat(discount.amount) || 0), 0)
    },
    /**
     * Filters available Units of Measure based on the current product's category
     * @return {array} filtered UOMs array
     */
    availableUoms () {
      if (!this.productQuantity?.unit_of_measure?.uom_category_id) return []
      return this.unitOfMeasures.filter(uom =>
        uom.uom_category_id === this.productQuantity.unit_of_measure.uom_category_id
      )
    },
    /**
     * Filters the providers list for the Floating Action Button modal based on search term
     * @return {array} filtered providers array
     */
    filteredProvidersForFab () {
      if (!this.providerSearch) return this.providers
      const term = this.providerSearch.toLowerCase()
      return this.providers.filter(v =>
        (v.name && v.name.toLowerCase().includes(term)) ||
        (v.document_number && v.document_number.includes(term))
      )
    },
    ...mapState(authentication, ['userSession', 'branchOffice'])
  },
  watch: {
    /**
     * Resets quantity selection states when the quantity dialog is closed
     * @params {boolean} data dialog visibility state
     */
    quantityDialog (data) {
      if (!data) {
        this.quantity = 1
        this.currentAmount = 0
        this.selectedUom = null
      }
    },
    /**
     * Resets the active tab when the add product dialog is opened
     * @params {boolean} data dialog visibility state
     */
    openAddProduct (data) {
      this.tab = 'basicData'
    },
    /**
     * Triggers values update when a new unit of measure is selected
     * @params {object} val new UOM object
     */
    selectedUom (val) {
      if (val) {
        this.updateValues('quantity')
      }
    },
    /**
     * Updates the product's unit of measure ID when selecting a new UOM
     * @params {number} data UOM ID
     */
    unitOfMeasure (data) {
      this.product.unit_of_measure_id = data
    },
    /**
     * Updates the product's category ID when a category is selected in the add product form
     * @params {object} data category object
     */
    categoryAdd (data) {
      if (data) {
        this.product.category_id = data.id
      }
    },
    /**
     * Refetches items and resets pagination when the category filter changes
     */
    category () {
      this.setPagination({
        pagination: this.pagination,
        filter: undefined
      })
    },
    /**
     * Refetches items and resets pagination when the search filter changes
     */
    filter () {
      this.setPagination({
        pagination: this.pagination,
        filter: undefined
      })
    },
    /**
     * Automatically adds a default payment method when the payment dialog is opened
     * @params {boolean} data dialog visibility state
     */
    dialogPayment (data) {
      const { company_session: companySession } = this.userSession
      if (data && companySession?.company_config?.payment_method) {
        this.addPayment(companySession?.company_config?.payment_method)
      }
    },
    /**
     * Resets pagination when the selected branch office changes
     * @params {object} data new branch office object
     */
    branchOffice (data) {
      if (data) {
        this.setPagination({
          pagination: this.pagination,
          filter: undefined
        })
      }
    }
  },
  /**
   * Initializes pagination and registers global keyboard shortcuts (F8, F10, F9, F4)
   */
  mounted () {
    this.setPagination({
      pagination: this.pagination,
      filter: undefined
    })
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F8') {
        e.preventDefault()
        if (this.products.length > 0) {
          this.dialogPayment = true
        } else {
          notify('No hay productos seleccionados', 'negative', 'warning')
        }
      }
      if (e.key === 'F10') {
        e.preventDefault()
        this.searchInvoice = !this.searchInvoice
      }
      if (e.key === 'F9') {
        e.preventDefault()
        if (this.purchase) {
          this.invoicePrinter = true
          this.printBill(this.purchase)
        }
      }

      if (e.key === 'F4') {
        if (this.purchase) {
          e.preventDefault()
          this.printBill(this.purchase)
        }
      }
    })
  },
  /**
   * Cleans up global event listeners before the component is destroyed
   */
  beforeUnmount () {
    window.removeEventListener('keydown', () => {
      this.dialogPayment = true
    })
  },
  /**
   * Loads initial configuration from local storage and fetches available payment methods
   */
  created () {
    this.getLocalStorage()
    this.getPaymentMethods()
    if (this.$route?.query?.id) {
      this.$router.replace({ name: 'NewPurchase' })
    }
  },
  methods: {
    /**
     * Updates quantities or amounts based on the conversion ratio and input changes
     * @params {string} inputName name of the input field that triggered the update
     */
    updateValues (inputName) {
      let ratio = parseFloat(this.selectedUom?.ratio) || 1
      if (isNaN(ratio)) ratio = 1
      const unitCost = (this.productQuantity?.cost || 0) * ratio

      if (inputName === 'quantity') {
        if (unitCost > 0) {
          this.currentAmount = this.roundToFourDecimals(this.quantity * unitCost)
        }
      } else if (inputName === 'currentAmount') {
        if (unitCost > 0) {
          this.quantity = this.roundToFourDecimals(this.currentAmount / unitCost)
        }
        // Si el costo es 0, no actualizamos la cantidad para permitir que el usuario la defina junto al importe
      }
    },
    /**
     * Rounds a number to four decimal places using a specific factor
     * @params {number} number the number to round
     * @return {number} rounded number
     */
    roundToFourDecimals (number) {
      const factor = Math.pow(10, 3)
      return Math.floor(number * factor) / factor
    },
    /**
     * Adds a new tax entry to the current purchase's taxes list
     */
    addTax () {
      this.taxes.push({
        description: this.taxForm.description,
        amount: parseFloat(this.taxForm.amount)
      })
      this.taxForm = { description: '', amount: 0 }
      this.dialogAddTax = false
      notify('Impuesto agregado', 'positive', 'check_circle')
    },
    /**
     * Removes a tax entry from the taxes list by its index
     * @params {number} index index of the tax to remove
     */
    removeTax (index) {
      this.taxes.splice(index, 1)
      notify('Impuesto eliminado', 'positive', 'check_circle')
    },
    /**
     * Adds a new discount entry to the current purchase's discounts list
     */
    addDiscount () {
      this.discounts.push({
        description: this.discountForm.description,
        amount: parseFloat(this.discountForm.amount)
      })
      this.discountForm = { description: '', amount: 0 }
      this.dialogAddDiscount = false
      notify('Descuento agregado', 'positive', 'check_circle')
    },
    /**
     * Removes a discount entry from the discounts list by its index
     * @params {number} index index of the discount to remove
     */
    removeDiscount (index) {
      this.discounts.splice(index, 1)
      notify('Descuento eliminado', 'positive', 'check_circle')
    },
    /**
     * Constructs a unified invoice object containing all current purchase data
     * @return {object} assembled invoice object
     */
    getInvoiceObject () {
      return {
        provider: this.provider,
        products: this.products,
        payments: this.payments,
        taxes: this.taxes,
        discounts: this.discounts,
        purchase_code: this.purchaseCode,
        delivery_date: this.deliveryDate,
        description: this.invoiceDescription
      }
    },
    /**
     * Updates pagination state and triggers a full products fetch
     * @params {object} data pagination configuration data
     */
    setPagination (data) {
      const params = {
        sortOrder: data.pagination.descending ? 'asc' : 'desc',
        page: data.pagination.page,
        sortBy: data.pagination.sortBy,
        perPage: data.pagination.rowsPerPage,
        paginate: true,
        dataSearch: {
          name: this.filter,
          'category.name': this.filter,
          barcode: this.filter
        }
      }
      this.pagination = data.pagination
      this.getAllProducts(params)
    },
    /**
     * Activates the native device scanner to read a barcode
     */
    async startScanner () {
      try {
        this.scanningMode = true
        const result = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.ALL,
          scanInstructions: 'Escanear código',
          scanButton: false,
          scanText: 'Scan',
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
          android: {
            scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.ZXING
          }
        })
        await this.processBarcode(result.ScanResult)
      } catch (error) {
        this.scanningMode = false
        if (error instanceof Error) {
          // notify(error.message, 'negative', 'warning')
        } else {
          notify('Error al escanear el código', 'negative', 'warning')
        }
      }
    },
    /**
     * Processes a scanned or entered barcode, handling special weight scale formats
     * @params {string} barcode the barcode string to process
     */
    async processBarcode (barcode) {
      try {
        if (!barcode || typeof barcode !== 'string' || barcode.length < 13) {
          this.getOneProduct(barcode)
          return
        }

        const balancePrefix = (typeof this.balanceCode === 'string' && this.balanceCode.length > 0)
          ? this.balanceCode
          : null

        let prefixLength = 2
        let prefixes = []

        if (balancePrefix) {
          prefixLength = balancePrefix.length
          prefixes.push(balancePrefix)
        } else {
          prefixes = BALANZA_PREFIXES
        }

        const prefix = barcode.substring(0, prefixLength)

        if (prefixes.includes(prefix)) {
          const pluStart = prefixLength
          const pluEnd = pluStart + 4
          const variableStart = pluEnd

          const pluRaw = barcode.substring(pluStart, pluEnd)
          const variablePart = barcode.substring(variableStart, 12)

          const plu = parseInt(pluRaw, 10).toString()

          if (!/^\d+$/.test(variablePart)) {
            notify('Formato inví¡lido en importe/peso', 'negative', 'warning')
            this.getOneProduct(barcode)
            return
          }

          const product = await this.getProduct(plu)
          if (!product) {
            notify('Producto no encontrado', 'negative', 'warning')
            this.getOneProduct(barcode)
            return
          }

          const importe = parseInt(variablePart, 10) / 1000

          if (isNaN(importe) || importe <= 0) {
            notify('Importe inví¡lido', 'negative', 'warning')
            this.getOneProduct(barcode)
            return
          }

          this.quantity = importe
          this.validateProduct(product, false)
          this.barcode = null
          return
        }

        this.getOneProduct(barcode)
      } catch (error) {
        console.error('Error procesando código de balanza:', error)
        notify('Error procesando producto', 'negative', 'warning')
        this.getOneProduct(barcode)
      }
    },
    /**
     * Fetches a single product from the server by its barcode
     * @params {string} barcode the barcode to search for
     * @return {promise} search result promise
     */
    async getProduct (barcode) {
      try {
        const { data } = await this.$api.get('products', {
          params: {
            dataEqualFilter: { barcode },
            branch_office_id: this.branchOffice?.id,
            stock: true
          }
        })
        return data[0]
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * High-level method to fetch a product by barcode and validate it for adding
     * @params {string} barcodeParam optional barcode to search
     */
    async getOneProduct (barcodeParam) {
      const barcodeToSearch = barcodeParam || this.barcode
      const product = await this.getProduct(barcodeToSearch)

      if (product) {
        this.validateProduct(product, true)
        this.barcode = null
        this.modelScan = false
      } else {
        this.$q.notify({
          message: 'Producto no encontrado',
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Saves the currently added provider to the server
     */
    saveProvider () {
      this.loadingProvider = true
      this.$api.post('providers', this.providerAdded)
        .then(({ data }) => {
          this.openAddProvider = false
          this.providerAdded = {}
          this.provider = data
          this.loadingProvider = false
          Notify.create({
            message: 'Proveedor creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingProvider = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Saves the bill without triggering a print operation
     */
    saveWithoutPrint () {
      this.withoutPrint = true
      this.saveBill()
    },
    /**
     * Callback for successful external payment processing
     * @params {object} data payment success data
     */
    paymentSuccess (data) {
      const payment = this.payments.find(payment => payment.amount === data.transaction_amount && payment.acronym === 'MPQA')
      payment.reference = String(data.id)
    },
    /**
     * Adds a new payment to the current purchase
     * @params {object} data payment data
     */
    addPayment (data) {
      if (this.pendingPayment > 0) {
        this.payments.push({
          name: data.name,
          acronym: data.acronym,
          amount: this.pendingPayment,
          reference: null,
          coin_id: this.coin.id,
          payment_method_id: data.id,
          user_created_id: this.userSession.id
        })
      }
    },
    /**
     * Processes a list of selected files (images) and converts them to base64 for preview
     * @params {array} files list of file objects
     */
    processFiles (files) {
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.product.images.push({
              image: file,
              url: e.target.result
            })
          }
          reader.readAsDataURL(file)
        }
      })
    },
    /**
     * Fetches available payment methods from the server
     */
    getPaymentMethods () {
      this.$api.get('payment-methods')
        .then(({ data }) => {
          this.paymentMethods = data
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Filters available invoice types based on a search string
     * @params {string} value search filter value
     * @params {function} update quasar-specific update callback
     */
    filterInvoiceTypes (value, update) {
      this.$api.get('invoice-types', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.invoiceTypes = data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Filters available service types based on a search string
     * @params {string} value search filter value
     * @params {function} update quasar-specific update callback
     */
    filterTypeOfServices (value, update) {
      this.$api.get('type-of-services', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.typeOfServices = data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Filters available categories based on a search string
     * @params {string} value search filter value
     * @params {function} update quasar-specific update callback
     */
    filterCategories (value, update) {
      this.$api.get('categories', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.categories = data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Filters available providers based on a search string
     * @params {string} value search filter value
     * @params {function} update quasar-specific update callback
     */
    filterProviders (value, update) {
      this.$api.get('providers', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          paginate: true,
          page: 1,
          perPage: 50,
          dataSearch: {
            name: value,
            document_number: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.providers = data.data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Triggers a fuzzy search for products based on the user's manual input in the AI results modal
     * @params {string} val search term
     * @params {function} update quasar-specific update callback
     * @params {object} item the current analysis item being edited
     */
    async searchProducts (val, update, item) {
      if (val.length < 2) {
        update(() => {
          item.productOptions = []
        })
        return
      }

      try {
        const { data } = await this.$api.get('products', {
          params: {
            dataSearch: { name: val },
            perPage: 10,
            paginate: true,
            branch_office_id: this.branchOffice?.id
          }
        })
        update(() => {
          item.productOptions = data.data
        })
      } catch (err) {
        console.error(err)
      }
    },
    /**
     * Loads the first page of providers when the provider selection modal opens
     */
    async loadProvidersData () {
      this.loadingProviders = true
      try {
        const { data } = await this.$api.get('providers', {
          params: {
            sortBy: 'id',
            sortOrder: 'desc',
            paginate: true,
            page: 1,
            perPage: 50
          }
        })
        this.providers = data.data
      } catch (err) {
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loadingProviders = false
      }
    },
    /**
     * Fetches all invoice types if they haven't been loaded yet
     */
    async loadInvoiceTypesData () {
      if (this.invoiceTypes.length > 0) return // Ya hay datos cargados

      this.loadingInvoiceTypes = true
      try {
        const { data } = await this.$api.get('invoice-types')
        this.invoiceTypes = data
      } catch (err) {
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loadingInvoiceTypes = false
      }
    },
    /**
     * Fetches available service types if they haven't been loaded yet
     */
    async loadTypeOfServicesData () {
      if (this.typeOfServices.length > 0) return // Ya hay datos cargados

      this.loadingTypeOfServices = true
      try {
        const { data } = await this.$api.get('type-of-services')
        this.typeOfServices = data
      } catch (err) {
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loadingTypeOfServices = false
      }
    },
    /**
     * Fetches a list of products from the server based on pagination and filters
     * @params {object} params API request parameters
     * @params {boolean} append if true, adds results to existing list instead of replacing
     */
    async getAllProducts (params, append = false) {
      this.loadingProducts = true
      try {
        const { data } = await this.$api.get('products', {
          params: {
            ...params,
            branch_office_id: this.branchOffice?.id,
            stock: true,
            sortOrder: 'desc',
            sortBy: 'sold',
            dataEqualFilter: {
              category_id: this.category ? this.category.id : null
            }
          }
        })

        if (append) {
          this.allProducts = [...this.allProducts, ...data.data]
        } else {
          this.allProducts = data.data
        }

        this.pagination.rowsNumber = data.total
      } catch (err) {
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loadingProducts = false
      }
    },

    /**
     * Handles infinite scroll events for the products list, loading more pages as needed
     * @params {event} event the scroll event object
     */
    handleProductsScroll (event) {
      const container = event.target
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight

      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (!isNearBottom || this.loadingProducts) {
        return
      }

      const currentProductsCount = this.allProducts.length
      const totalProducts = this.pagination.rowsNumber

      if (currentProductsCount >= totalProducts) {
        return
      }

      const currentPage = Math.floor(currentProductsCount / this.pagination.rowsPerPage)
      const nextPage = currentPage + 1

      const params = {
        sortOrder: this.pagination.descending ? 'asc' : 'desc', // Fix: keep current sorting
        page: nextPage,
        sortBy: this.pagination.sortBy,
        perPage: this.pagination.rowsPerPage,
        paginate: true,
        dataSearch: {
          name: this.filter,
          'category.name': this.filter,
          barcode: this.filter
        }
      }

      this.getAllProducts(params, true)
    },
    /**
     * Populates the local payments list from an array of invoice payments
     * @params {array} invoicePayments array of payment objects from an existing invoice
     */
    setPayments (invoicePayments) {
      invoicePayments?.forEach(payment => {
        this.payments.push({
          id: payment.payment_method_id,
          payment_method_id: payment.payment_method_id,
          name: payment.payment_method.name,
          amount: payment.amount,
          reference: payment.reference,
          coin_id: payment.coin_id
        })
      })
    },
    /**
     * Requests a single purchase record from the API by its purchase code
     * @params {number|string} id the purchase code to retrieve
     * @return {promise} search result promise
     */
    async getInvoiceOneRequest (id) {
      try {
        const { data } = await this.$api.get('purchases', {
          params: {
            dataEqualFilter: {
              purchase_code: id
            }
          }
        })
        return data[0]
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Main method to fetch and load a full invoice into the UI for editing/viewing
     * @params {number|string} data the purchase identifier or code
     */
    async getInvoiceOne (data) {
      this.loadingSearch = true
      const purchase = await this.getInvoiceOneRequest(data)
      if (purchase) {
        if (purchase.branch_office_id !== this.branchOffice.id) {
          notify('Esta factura no pertenece a esta sucursal', 'negative', 'warning')
          this.$router.push({ name: 'Billing' })
          this.loadingSearch = false
          return
        }
        this.loadingSearch = false
        this.purchase = purchase
        this.products = purchase.products.map(product => {
          return {
            ...product,
            ...product.pivot,
            subtotal: product.pivot.cost * product.pivot.quantity
          }
        })
        this.provider = purchase.provider
        this.invoiceType = purchase.invoice_type
        this.typeOfService = purchase.type_of_service
        this.searchInvoice = false
        this.setPayments(purchase.purchase_payments)
        this.$router.push({
          name: 'NewPurchase',
          query: {
            id: purchase.id
          }
        })
        this.invoiceDescription = purchase.description
        if (purchase.delivery_date) {
          this.deliveryDate = purchase.delivery_date.includes('T') ? purchase.delivery_date : purchase.delivery_date.replace(' ', 'T')
          // Asegurar formato YYYY-MM-DDTHH:mm para compatibilidad con input datetime-local
          if (this.deliveryDate.length === 10) {
            this.deliveryDate += 'T00:00'
          } else if (this.deliveryDate.length > 16) {
            this.deliveryDate = this.deliveryDate.slice(0, 16)
          }
        } else {
          this.deliveryDate = formatDate(Date(), 'YYYY-MM-DDTHH:mm')
        }
        // Load existing attachments
        this.loadExistingAttachments(purchase.files || [])
        this.calculateTotal()
        this.search = ''
      } else {
        notify('No se encontró la factura', 'negative', 'warning')
      }
    },
    /**
     * Clears all current purchase data and resets the form to its initial state
     */
    clear () {
      this.payments = []
      this.products = []
      this.invoiceDescription = ''
      this.purchaseCode = ''
      this.deliveryDate = formatDate(Date(), 'YYYY-MM-DDTHH:mm')
      this.dialogPayment = false
      this.withoutPrint = false
      this.invoicePrinter = false
      // Clear purchase files
      this.clearPurchaseFiles()
      this.calculateTotal()
      this.$router.push({ name: 'NewPurchase' })
      setTimeout(() => {
        this.$refs.saveBill.resetValidation()
        this.getLocalStorage()
        this.purchase = null
      }, 100)
    },
    /**
     * Triggers the printing process for a saved purchase/bill
     * @params {object} data the saved purchase object
     */
    async printBill (data) {
      const purchase = await this.getInvoiceOneRequest(data.id)

      if (!purchase) {
        notify('Error al obtener la factura', 'negative', 'warning')
        return
      }

      if (this.withoutPrint) {
        this.clear()
        this.withoutPrint = false
        return
      }
      this.clear()
    },
    /**
     * Prepares the purchase data as FormData for submission, including files
     * @return {FormData} prepared form data
     */
    getInvoiceFormData () {
      const purchaseData = {
        ...this.purchase,
        purchase_code: this.purchaseCode,
        provider_id: this.provider?.id,
        coin_id: this.coin.id,
        description: this.invoiceDescription,
        type_of_service_id: this.typeOfService.id,
        invoice_type_id: this.invoiceType.id,
        user_created_id: this.userSession.id,
        exchange_rate: this.exchangeRate,
        delivery_date: this.deliveryDate,
        branch_office_id: this.branchOffice?.id,
        products: this.products,
        taxes: this.taxes,
        discounts: this.discounts,
        total: this.totalBill + this.totalTaxes - this.totalDiscounts,
        total_taxes: this.totalTaxes,
        total_discounts: this.totalDiscounts,
        status: this.purchase?.status || (this.typeOfService?.code === 4 ? 'delivered' : 'pending'),
        payments: this.payments.filter(payment => payment.amount > 0)
      }

      // Siempre usar FormData para consistencia
      return this.createPurchaseFormData(purchaseData)
    },

    /**
     * Internal helper to create a FormData object from raw purchase data and files
     * @params {object} purchaseData raw purchase data
     * @return {FormData} constructed FormData object
     */
    createPurchaseFormData (purchaseData) {
      const formData = new FormData()

      // Agregar mí©todo PUT/PATCH si es edición
      if (this.$route.query.id) {
        formData.append('_method', 'put')
      }

      // Agregar todos los campos de la compra
      for (const key in purchaseData) {
        if (Object.hasOwnProperty.call(purchaseData, key)) {
          const value = purchaseData[key]

          if (Array.isArray(value)) {
            // Manejar arrays (products, payments)
            formData.append(key, JSON.stringify(value))
          } else if (value !== null && value !== undefined) {
            formData.append(key, value)
          }
        }
      }

      // Agregar archivos multimedia nuevos
      let fileIndex = 0
      this.purchaseFiles.forEach((fileObj) => {
        if (fileObj.isNew && fileObj.file) {
          formData.append(`files[${fileIndex}]`, fileObj.file)
          fileIndex++
        }
      })

      // Agregar archivos eliminados para su procesamiento
      if (this.deletedPurchaseFiles.length > 0) {
        formData.append('deleted_files', JSON.stringify(this.deletedPurchaseFiles))
      }

      return formData
    },
    /**
     * Validates required amounts and payment status before finalizing the bill
     * @return {FormData|boolean} prepared FormData or false if validation failed
     */
    setParamsBill () {
      if (this.invoiceType?.acronym_serie === 'CC') { return this.getInvoiceFormData() }

      if (!this.withoutPayment.includes(this.invoiceType?.acronym_serie) && this.pendingPayment > 0) {
        notify('La factura no puede ser generada sin pagar el monto total', 'negative', 'warning')
        this.dialogPayment = true
        return false
      }

      if (this.withServiceType.includes(this.typeOfService.code) && this.pendingPayment > 0) {
        notify('La factura no puede ser generada sin pagar el monto total', 'negative', 'warning')
        this.dialogPayment = true
        return false
      }

      if (this.products <= 0) {
        notify('No hay productos seleccionados', 'negative', 'warning')
        return false
      }

      return this.getInvoiceFormData()
    },

    /**
     * Sends the purchase and payment data to the server to be saved
     */
    async saveBill () {
      try {
        this.loadingBilling = true
        const params = this.setParamsBill()
        if (!params) return

        // Configurar headers para FormData
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }

        if (this.$route.query.id) {
          await this.$api.post(`purchases/${this.$route.query.id}`, params, config)
        } else {
          await this.$api.post('purchases', params, config)
        }

        // Limpiar estado (incluye archivos)
        this.clear()
        notify('Factura guardada exitosamente', 'positive', 'check_circle')
        this.setPagination({
          pagination: this.pagination,
          filter: undefined
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.loadingBilling = false
      }
    },
    /**
     * Retrives the default configuration and session data from local storage
     */
    getLocalStorage () {
      const { company_session: companySession } = this.userSession
      this.provider = companySession?.company_config?.provider
      this.invoiceType = companySession?.company_config?.invoice_type
      this.typeOfService = companySession?.company_config?.type_of_service
      this.coin = companySession?.company_config?.coin
      this.balanceCode = companySession?.company_config?.other?.balance_code
      this.calculateTotal()
      this.getUnitOfMeasures()
    },
    /**
     * Removes a product from the purchase products table
     * @params {object} product the product record to remove
     */
    deleteProduct (product) {
      this.products.splice(product.rowIndex, 1)
      this.calculateTotal()
    },
    /**
     * Removes a payment entry from the payments list by its index
     * @params {number} index index of the payment to remove
     */
    deletePayment (index) {
      this.payments.splice(index, 1)
    },
    /**
     * Recalculates the total amount of the bill based on current products
     */
    calculateTotal () {
      let total = 0
      this.products.forEach(product => {
        total += product.subtotal
      })
      this.totalBill = total
    },
    /**
     * Calculates the subtotal for a specific product item
     * @params {object} data product data including quantity and cost
     */
    calculate (data) {
      const quantity = isNaN(data.quantity) ? 0 : data.quantity
      const cost = isNaN(data.cost) ? 0 : data.cost
      const taxe = isNaN(data.taxe) ? 0 : data.taxe
      const factor = data.conversion_factor || 1
      data.subtotal = parseFloat(((cost * quantity * factor) + taxe).toFixed(4))
      this.calculateTotal()
    },
    /**
     * Adds a product object to the purchase's products array
     * @params {object} product the product data to add
     */
    pushProduct (product) {
      this.products.push({
        id: product.id,
        name: product.name,
        quantity: product.quantity || 1,
        taxe: product.taxe || 0,
        subtotal: product.subtotal || parseFloat(((product.quantity || 1) * (product.cost || 0) * (product.conversion_factor || 1)).toFixed(2)),
        product_id: product.id,
        cost: product.cost,
        barcode: product.barcode,
        unit_of_measure_id: this.selectedUom?.id || product.unit_of_measure_id,
        uom_acronym: this.selectedUom?.acronym || product.unit_of_measure?.acronym,
        conversion_factor: product.conversion_factor || 1,
        supplier_product_name: product.supplier_product_name || null
      })
    },
    /**
     * Validates a product before adding it to the purchase, handling UOM conversions
     * @params {object} data product data
     * @params {boolean} validUnitMeasurement if true, validates if UOM requires a dialog
     */
    validateProduct (data, validUnitMeasurement = false) {
      const findProduct = this.products.find(product => product.id === data.id)
      const hasUom = !!data?.unit_of_measure
      let baseCost = data?.cost || 0
      const uomAcronym = data?.unit_of_measure?.acronym?.toUpperCase()

      // Si es unidad (U), no abrimos el dií¡logo de cantidad/importe
      if (validUnitMeasurement && hasUom && uomAcronym !== 'U') {
        this.quantityDialog = true
        this.currentAmount = baseCost
        this.productQuantity = data
        this.selectedUom = data.unit_of_measure
        return
      }

      // Calculate conversion factor
      // Factor = Selected UOM Ratio / Base Product UOM Ratio
      const productUomId = data.unit_of_measure_id
      const productUom = this.unitOfMeasures.find(u => u.id === productUomId)
      let baseRatio = productUom && productUom.ratio ? parseFloat(productUom.ratio) : 1
      if (isNaN(baseRatio) || baseRatio === 0) baseRatio = 1

      const selectedUomId = this.selectedUom?.id || data.unit_of_measure_id
      const selectedUomObj = this.unitOfMeasures.find(u => u.id === selectedUomId)
      let selectedRatio = selectedUomObj && selectedUomObj.ratio ? parseFloat(selectedUomObj.ratio) : (this.selectedUom?.ratio ? parseFloat(this.selectedUom.ratio) : 1)
      if (isNaN(selectedRatio) || selectedRatio === 0) selectedRatio = 1

      const conversionFactor = selectedRatio / baseRatio

      const quantityToAdd = this.quantity

      // Lógica para productos sin costo: calcular costo a partir del importe ingresado
      if (baseCost === 0 && this.currentAmount > 0 && quantityToAdd > 0) {
        baseCost = this.roundToFourDecimals(this.currentAmount / (quantityToAdd * conversionFactor))
      }

      if (findProduct) {
        findProduct.unit_of_measure_id = selectedUomId
        findProduct.uom_acronym = selectedUomObj ? selectedUomObj.acronym : (this.selectedUom?.acronym || findProduct.uom_acronym)
        // Keep the base cost, just update the factor
        findProduct.cost = baseCost
        findProduct.conversion_factor = conversionFactor
        findProduct.quantity = quantityToAdd
        this.calculate(findProduct)
      } else {
        const newProductData = {
          ...data,
          product_id: data.id,
          cost: baseCost,
          quantity: quantityToAdd,
          conversion_factor: conversionFactor,
          subtotal: 0 // Will be calculated
        }
        // Calculate initial subtotal
        newProductData.subtotal = baseCost * quantityToAdd * conversionFactor
        this.pushProduct(newProductData)
        this.calculateTotal()
      }
      this.quantity = 1
      this.currentAmount = 0
      this.quantityDialog = false
      this.selectedUom = null

      // Preguntar si desea escanear otro producto si estí¡ en modo escaneo
      if (this.scanningMode) {
        this.$q.dialog({
          title: 'Escaneo exitoso',
          message: '¿Desea escanear otro producto?',
          cancel: {
            label: 'No, finalizar',
            color: 'negative',
            flat: true
          },
          ok: {
            label: 'Sí­, escanear',
            color: 'primary'
          },
          persistent: true
        }).onOk(() => {
          this.startScanner()
        }).onCancel(() => {
          this.scanningMode = false
        }).onDismiss(() => {
          // Asegurar que salimos del modo si se cierra de otra forma
        })
      }
    },
    /**
     * Closes the product addition modal and resets relevant data
     */
    closeModal () {
      this.openAddProduct = false
      this.priceLists = []
      this.product = {
        images: [],
        is_bundle: 0,
        show_catalog: 0,
        is_addons: 0,
        skip_stock: 0,
        profit_percentage: 0
      }
      this.getUnitOfMeasures()
    },
    /**
     * Fetches available aliquot (tax) types from the metadata API
     * @params {string} value search filter value
     * @params {function} update quasar-specific update callback
     */
    async getAliquotTypes (value, update) {
      try {
        const { data } = await this.$apiArca.get('metadata/aliquot-types', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.aliquotTypes = data
        })
      } catch (err) {
        notify(err.message, 'negative', 'warning')
      }
    },
    /**
     * Fetches all units of measure from the API
     */
    async getUnitOfMeasures () {
      try {
        const { data } = await this.$api.get('unit-of-measures')
        this.unitOfMeasures = data
      } catch (error) {
        Notify.create({
          message: error.message,
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Saves a new product created via the addition modal to the server
     */
    saveProduct () {
      this.visible = true
      const payload = this.modelData(this.product)
      this.$api.post('products', payload)
        .then(({ data }) => {
          this.openAddProduct = false
          this.visible = false
          this.product = {}
          this.pushProduct({
            name: data.name,
            quantity: 1,
            subtotal: data.cost,
            product_id: data.id,
            cost: data.cost,
            barcode: data.barcode
          })
          this.closeModal()
          Notify.create({
            message: 'Producto creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Deletes an image from a product, optionally from the server if it has an ID
     * @params {object} image image data object
     * @params {number} index index in the images array
     */
    deleteImage (image, index) {
      if (image.id) {
        this.$api.delete(`product-images/${image.id}`)
          .then(({ data }) => {
            this.product.images.splice(index, 1)
          })
          .catch(err => {
            this.visible = false
            Notify.create({
              message: err.message,
              icon: 'warning',
              color: 'negative'
            })
          })
      } else {
        this.product.images.splice(index, 1)
      }
    },
    /**
     * Updates the product's selling price based on a profit percentage
     * @params {number} newVal new profit percentage value
     */
    updateProfitPercentage (newVal) {
      if (newVal && this.product.cost > 0) {
        const price = this.product.cost * (1 + newVal / 100)
        this.product.price = parseFloat(price.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0])
      }
    },
    /**
     * Updates the product's selling price when the cost changes
     * @params {number} newVal new cost value
     */
    updateCost (newVal) {
      if (newVal && this.product.profit_percentage != null) {
        const price = newVal * (1 + this.product.profit_percentage / 100)
        this.product.price = parseFloat(price.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0])
      }
    },
    /**
     * Recalculates profit percentage when the selling price is manually updated
     * @params {number} newVal new selling price value
     */
    updatePrice (newVal) {
      if (newVal && this.product.cost > 0) {
        const margin = ((newVal - this.product.cost) / this.product.cost) * 100
        this.product.profit_percentage = Number(margin.toFixed(4)) // 85.7143%
      }
    },
    /**
     * Prepares product data as FormData for uploading images and creation
     * @params {object} data raw product data
     * @params {boolean} put if true, adds _method=put for updates
     * @return {FormData} prepared FormData
     */
    modelData (data, put = false) {
      const formData = new FormData()
      if (put) {
        formData.append('_method', 'put')
      }
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key]
          if (typeof data[key] !== 'object') {
            formData.append(key, element)
          }
        }
      }

      if (data.aliquot_type) {
        formData.append('aliquot_type', JSON.stringify(data.aliquot_type))
      }

      data.images.forEach((element, index) => {
        formData.append(`images[${index}]`, element.image)
      })

      if (this.addonsProducts.length > 0) {
        this.addonsProducts.forEach((element, index) => {
          formData.append(`addons[${index}]`, element.id)
        })
      }

      if (this.priceLists.length > 0) {
        this.priceLists.forEach((element, index) => {
          formData.append(`price_lists[${index}]`, JSON.stringify({ ...element, index }))
        })
      }

      formData.append('branch_office_ids[0]', this.branchOffice?.id)
      return formData
    },
    /**
     * Handles file drop events for product images
     * @params {event} event drop event object
     */
    handleDrop (event) {
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.processFiles(files)
    },
    /**
     * Updates the product's aliquot type based on category selection
     * @params {object} data category data object
     */
    setCategory (data) {
      this.product.aliquot_type = data.aliquot_type
    },

    /**
     * Programmatically opens the hidden file input dialog for attachments
     */
    openFileDialog () {
      if (this.$q.platform.is.nativeMobile) {
        this.$q.dialog({
          title: 'Agregar archivo',
          message: '¿Desde dónde deseas agregar el archivo?',
          options: {
            type: 'radio',
            model: 'camera',
            items: [
              { label: 'Tomar foto (Cámara)', value: 'camera' },
              { label: 'Galería de fotos', value: 'gallery' },
              { label: 'Archivos o Documentos', value: 'document' }
            ]
          },
          cancel: true,
          persistent: true
        }).onOk(async data => {
          if (data === 'document') {
            const input = this.$refs.fileInput
            if (input) input.click()
          } else {
            try {
              const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: data === 'camera' ? CameraSource.Camera : CameraSource.Photos
              })
              const response = await fetch(image.webPath)
              const blob = await response.blob()
              const file = new File([blob], `photo_${Date.now()}.${image.format}`, { type: `image/${image.format}` })
              this.processPurchaseFiles([file])
            } catch (error) {
              console.error('Camera error:', error)
            }
          }
        })
      } else {
        const input = this.$refs.fileInput
        if (input) {
          input.click()
        } else {
          console.error('File input ref not found')
        }
      }
    },
    /**
     * Handles file selection from the standard file input dialog
     * @params {event} event change event object
     */
    handleFileSelect (event) {
      const files = Array.from(event.target.files)
      this.processPurchaseFiles(files)
      event.target.value = '' // Reset input
    },
    /**
     * Handles file drops specifically into the purchase attachments zone
     * @params {event} event drop event object
     */
    handlePurchaseFileDrop (event) {
      this.isDragOverPurchase = false
      const files = Array.from(event.dataTransfer.files)
      this.processPurchaseFiles(files)
    },
    /**
     * Processes files intended as purchase attachments, validating types and sizes
     * @params {array} files list of file objects to process
     */
    processPurchaseFiles (files) {
      const validFiles = []
      files.forEach(file => {
        // Validate file type
        const isValidImage = file.type.startsWith('image/')
        const isValidPDF = file.type === 'application/pdf'

        if (!isValidImage && !isValidPDF) {
          this.$q.notify({
            message: 'Tipo de archivo no válido (solo imágenes y PDF)',
            icon: 'warning',
            color: 'negative'
          })
          return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          this.$q.notify({
            message: 'El archivo es demasiado grande (max 10MB)',
            icon: 'warning',
            color: 'negative'
          })
          return
        }

        // Create file object
        const fileObj = {
          id: Date.now() + Math.random(), // Temporary ID
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          file, // Store original file for upload
          isNew: true
        }

        this.purchaseFiles.push(fileObj)
        validFiles.push(file)
      })

      // Prompt for AI Analysis for the first image
      const imageFile = validFiles.find(f => f.type.startsWith('image/'))
      if (imageFile) {
        this.$q.dialog({
          title: 'Analizar Factura con IA',
          message: '¿Deseas analizar esta imagen para extraer los datos automáticamente?',
          ok: {
            label: 'Analizar',
            color: 'primary',
            icon: 'auto_awesome'
          },
          cancel: {
            label: 'Solo adjuntar',
            color: 'grey',
            flat: true
          },
          persistent: true
        }).onOk(() => {
          this.uploadAndAnalyzeInvoice(imageFile)
        })
      }
    },
    /**
     * Tracks the IDs of attached files marked for deletion to inform the backend during save
     * @params {array} deletedIds list of attachment IDs to delete
     */
    handleDeletePurchaseFiles (deletedIds) {
      if (deletedIds.length > 0) {
        this.deletedPurchaseFiles.push(...deletedIds)
      }
    },
    /**
     * Maps existing invoice attachments to the component's internal purchaseFiles state
     * @params {array} attachments array of existing attachment objects from API
     */
    loadExistingAttachments (attachments) {
      this.purchaseFiles = attachments.map(attachment => ({
        id: attachment.id,
        name: attachment.name || attachment.original_name,
        type: attachment.mime_type || attachment.type,
        size: attachment.size,
        url: attachment.url || attachment.path,
        isNew: false // Mark as existing file
      }))
    },
    /**
     * Resets the purchase files list and revokes local object URLs to free memory
     */
    clearPurchaseFiles () {
      // Revoke URLs to prevent memory leaks
      this.purchaseFiles.forEach(file => {
        if (file.url && file.isNew) {
          URL.revokeObjectURL(file.url)
        }
      })
      this.purchaseFiles = []
      this.deletedPurchaseFiles = []
    },
    /**
     * Uploads an invoice image to the AI analysis endpoint and processes the extracted data
     * @params {file} file the image file to analyze
     */
    async uploadAndAnalyzeInvoice (file) {
      if (this.analyzingInvoice) return

      this.analyzingInvoice = true
      const formData = new FormData()
      formData.append('file', file)

      // Show loading
      this.$q.loading.show({
        message: 'Analizando factura con IA...',
        backgroundColor: 'primary',
        spinnerColor: 'white'
      })

      try {
        const { data } = await this.$api.post('purchases/analyze-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (data.success && data.data) {
          // Initialize items while preserving backend matches
          data.data.items = data.data.items.map(item => ({
            ...item,
            // Keep what backend found, or set defaults for UI interaction
            selectedProduct: item.selectedProduct || null,
            productOptions: item.productOptions || (item.selectedProduct ? [item.selectedProduct] : []),
            is_new: item.is_new !== undefined ? item.is_new : true,
            // UI helper fields for New Product creation
            category: item.selectedProduct?.category || null,
            uom: item.selectedProduct?.unit_of_measure || null,
            show_catalog: !!item.selectedProduct?.show_catalog
          }))

          this.analysisData = data.data
          this.showAnalysisModal = true
          notify('Datos extraídos exitosamente. Por favor verifica los productos.', 'positive', 'auto_awesome')
        } else {
          notify('No se pudieron extraer datos de la imagen', 'warning', 'warning')
        }
      } catch (error) {
        console.error('Error analyzing invoice:', error)
        const msg = error.response?.data?.error || 'Error al analizar la factura'
        notify(msg, 'negative', 'error')
      } finally {
        this.analyzingInvoice = false
        this.$q.loading.hide()
      }
    },
    /**
     * Applies the validated AI analysis results to the current purchase form
     */
    async applyAnalysisData () {
      if (!this.analysisData) return

      const data = this.analysisData
      const items = data.items || []

      // Validate items
      for (const item of items) {
        if (item.is_new) {
          if (!item.category) {
            notify(`Falta categoría para el producto nuevo: ${item.description}`, 'negative', 'warning')
            return
          }
          if (!item.uom) {
            notify(`Falta unidad de medida para el producto nuevo: ${item.description}`, 'negative', 'warning')
            return
          }
        }
      }

      this.$q.loading.show({ message: 'Procesando productos...' })

      try {
        // Process Items
        for (const item of items) {
          let productData = null

          if (item.is_new) {
            // Create Product in DB to get a valid ID
            const newProductPayload = {
              name: item.description,
              barcode: item?.barcode,
              category_id: item.category?.id,
              unit_of_measure_id: item.uom?.id,
              cost: item.unit_price,
              price: item.unit_price * 1.5, // Default margin 50%
              profit_percentage: 50,
              stock: 0,
              minimum_stock: 0,
              show_catalog: item.show_catalog ? 1 : 0,
              skip_stock: 0,
              images: [],
              branch_office_ids: [this.branchOffice?.id],
              product_type: 'PRODUCT',
              base_quantity: 1
            }

            const { data: createdProduct } = await this.$api.post('products', newProductPayload)
            productData = createdProduct
            notify(`Producto creado y agregado: ${createdProduct.name}`, 'positive', 'check')
          } else {
            productData = item.selectedProduct
          }

          // Add to Purchase Grid
          this.addProductToGrid({
            ...productData,
            name: productData.name, // Nombe real en DB
            quantity: parseFloat(item.quantity),
            cost: parseFloat(item.unit_price), // Mantener precio de la factura
            subtotal: parseFloat(item.quantity) * parseFloat(item.unit_price),
            supplier_product_name: item.description // Nombre detectado por IA para alias
          })
        }

        // 1. Set Invoice Number
        if (data.invoice_number) {
          this.purchaseCode = data.invoice_number
        }

        // 2. Set Date
        if (data.date) {
          let date = data.date
          if (date.length === 10) date += 'T00:00'
          this.deliveryDate = date
        }

        // 3. Set Provider
        if (data.selectedProvider) {
          this.provider = data.selectedProvider
        } else if (data.provider_name) {
          // Create new provider if not selected but name exists
          try {
            const { data: newProvider } = await this.$api.post('providers', {
              name: data.provider_name,
              document_number: 'GEN-' + Date.now().toString().slice(-8), // Temp doc number
              address: 'Dirección de la factura',
              phone: null,
              email: null
            })
            this.provider = newProvider
            notify(`Proveedor creado y asignado: ${newProvider.name}`, 'positive', 'check')
          } catch (provErr) {
            console.error('Error creating provider', provErr)
            notify(`No se pudo crear el proveedor: ${data.provider_name}`, 'warning', 'warning')
          }
        }

        // 4. Description
        if (data.invoice_number && data.provider_name) {
          const info = `Factura ${data.invoice_number} de ${data.provider_name}`
          this.invoiceDescription = this.invoiceDescription ? `${this.invoiceDescription}\n${info}` : info
        }

        this.showAnalysisModal = false
        this.analysisData = null
        notify('Datos y productos aplicados exitosamente.', 'positive', 'check_circle')
      } catch (error) {
        console.error('Error applying analysis:', error)
        notify('Error al procesar los productos: ' + error.message, 'negative', 'error')
      } finally {
        this.$q.loading.hide()
      }
    },
    /**
     * Helper method to add a product to the main products grid, handling duplicates and recalculations
     * @params {object} productData product data including quantity and cost
     */
    addProductToGrid (productData) {
      const existing = this.products.find(p => p.product_id === productData.id || p.id === productData.id)

      if (existing) {
        existing.quantity += productData.quantity
        existing.cost = productData.cost // Update to latest invoice cost
        existing.supplier_product_name = productData.supplier_product_name || existing.supplier_product_name
        this.calculate(existing)
      } else {
        this.pushProduct({
          ...productData,
          id: productData.id || productData.product_id,
          unit_of_measure_id: productData.unit_of_measure_id,
          uom_acronym: productData.unit_of_measure?.acronym || productData.uom_acronym,
          supplier_product_name: productData.supplier_product_name
        })
      }
      this.calculateTotal()
    },
    /**
     * Filters products for specific rows in the AI analysis results table
     * @params {string} val search term
     * @params {function} update quasar-specific update callback
     * @params {object} row the row object to update options for
     */
    filterProductsRow (val, update, row) {
      this.$api.get('products', {
        params: {
          dataSearch: val ? { name: val, barcode: val } : {},
          perPage: 20,
          paginate: true,
          page: 1
        }
      }).then(({ data }) => {
        update(() => {
          row.productOptions = data.data
        })
      }).catch(err => {
        console.error('Error fetching products for row:', err)
      })
    },
    /**
     * Updates row data when a product is selected from the search results in the AI modal
     * @params {object} product the selected product object
     * @params {object} row the analysis item row being updated
     */
    onProductSelect (product, row) {
      if (product) {
        row.is_new = false
        // No sobreescribimos la descripción ni el precio de la factura
        // Solo vinculamos la identidad del producto para el backend
      } else {
        row.is_new = true
      }
    },
    /**
     * Resets a row to "new product" state when the selection is cleared
     * @params {object} row the analysis item row to reset
     */
    onProductClear (row) {
      row.is_new = true
      row.selectedProduct = null
    },
    /**
     * Resets and closes the AI analysis results modal
     */
    clearAnalysis () {
      this.analysisData = null
      this.showAnalysisModal = false
    },
    /**
     * Filters available products to be added as addons/bundles
     * @params {string} value search filter value
     * @params {function} update quasar-specific update callback
     */
    filterProductsAddons (value, update) {
      this.$api.get('products', {
        params: {
          dataSearch: {
            name: value,
            barcode: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.addonsProductsOptions = data
          })
        })
        .catch(err => {
          console.error('Error filtering addon products:', err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
/* ===== Billing Selects Optimization ===== */
/* Desktop - mantiene el diseí±o actual */
.billing-selects-desktop {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.billing-select-item {
  width: 100%;
}

.product-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.selected-product {
  border: 2px solid #21BA45 !important;
  box-shadow: 0 0 15px rgba(33, 186, 69, 0.3);
}

.product-name-overlay {
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%);
  padding: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.selected-product .product-name-overlay {
  background: linear-gradient(45deg, rgba(33, 186, 69, 0.8) 0%, rgba(33, 186, 69, 0.6) 100%);
}

/* Smooth animations for quantity controls */
.absolute-bottom-right {
  animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced modal styling */
.q-dialog .q-card {
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
}

/* Progress bar styling */
.q-linear-progress {
  background: rgba(0, 0, 0, 0.1);
}

/* Button enhancements */
.q-btn {
  transition: all 0.2s ease;
}

.q-btn:hover {
  transform: translateY(-1px);
}

/* Badge styling */
.q-badge {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .col-xs-6 {
    padding: 2px;
  }

  .product-card {
    margin: 2px;
  }

  .text-subtitle2 {
    font-size: 11px !important;
  }
}

.dropzone-card {
  border: 2px dashed #e0e0e0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.profit-percentage-input input {
  text-align: right !important;
}

.dropzone-card:hover,
.dropzone-active {
  border-color: #1976d2;
}

/* Modern Product Card Styles */
.product-container {
  position: relative;
}

.modern-product-card {
  position: relative;
  aspect-ratio: 3/4;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.modern-product-card--selected {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 3px #10b981;
}

.selection-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #10b981;
  border-radius: 50%;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.4);
  z-index: 3;
  backdrop-filter: blur(4px);
}

.product-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 2;
  text-align: center;
}

.product-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quantity-controls {
  bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quantity-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-btn--minus {
  background: #ef4444;
  color: white;
}

.quantity-btn--minus:hover:not(:disabled) {
  background: #dc2626;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.quantity-btn--plus {
  background: #10b981;
  color: white;
}

.quantity-btn--plus:hover:not(:disabled) {
  background: #059669;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.quantity-display {
  min-width: 28px;
  text-align: center;
  font-weight: 700;
  font-size: 15px;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  padding: 2px 6px;
}

.image-preview-card {
  transition: transform 0.2s ease;
}

.image-preview-card:hover {
  transform: scale(1.02);
}

.product-name-overlay {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
}

/* Modern Navigation Buttons */
.modern-nav-btn {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-nav-btn--secondary {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e5e7eb;
}

.modern-nav-btn--secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modern-nav-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

.modern-nav-btn--success {
  background: linear-gradient(135deg, #10b981, #059669);
  font-size: 15px;
}

.modern-nav-btn--success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* Upload Zone Styles */
.upload-zone {
  background: rgba(25, 118, 210, 0.08);
  border: 2px dashed var(--q-primary);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.upload-zone:hover {
  opacity: 1;
  background: rgba(25, 118, 210, 0.12);
  border-color: var(--q-primary);
}

.upload-zone-active {
  opacity: 1;
  background: rgba(25, 118, 210, 0.15);
  border-color: var(--q-primary);
  transform: scale(1.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-text {
  font-size: 14px;
  color: var(--q-primary);
  font-weight: 500;
}

.upload-btn {
  margin-top: 8px;
  font-weight: 600;
}

/* Dark mode support */
.body--dark .upload-zone {
  background: rgba(144, 202, 249, 0.1);
  border-color: #90caf9;
}

.body--dark .upload-zone:hover {
  background: rgba(144, 202, 249, 0.15);
}

.body--dark .upload-text {
  color: #90caf9;
}

/* Responsive */
@media (max-width: 600px) {
  .upload-zone {
    min-height: 80px;
    padding: 12px;
  }

  .upload-text {
    font-size: 12px;
  }
}

.billing-panel-container {
  display: grid;
  grid-template-columns: calc(58.333% - 0.5rem) calc(41.666% - 0.5rem);
  gap: 1rem;
}

/* Responsive: Móvil no aplica altura fija */
@media (max-width: 599px) {
  .billing-panel-container {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1440px) {
  .billing-panel-container {
    grid-template-columns: calc(50% - 0.5rem) calc(50% - 0.5rem);
  }
}

.product-container-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.product-container-scroll::-webkit-scrollbar-thumb {
  border-radius: 4px;
}

/* ===== Billing Selects Optimization ===== */
/* Desktop - mantiene el diseí±o actual */
.billing-selects-desktop {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.billing-select-item {
  width: 100%;
}

/* ===== FAB Floating Action Buttons (Mobile) ===== */
:deep(.q-fab) {
  z-index: 2000;
}

:deep(.q-fab__actions) {
  padding-bottom: 8px;
}

:deep(.q-fab-action) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.q-fab-action .q-btn__content) {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

/* FAB Popup Card */
.fab-popup-card {
  min-width: 320px;
  max-width: 90vw;
  max-height: 70vh;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.fab-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--q-primary);
  color: white;
  border-radius: 16px 16px 0 0;
}

.fab-popup-header .text-h6 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.fab-popup-header .q-btn {
  color: white;
}

/* FAB Popup List */
.fab-popup-list {
  max-height: 300px;
  overflow-y: auto;
}

.fab-popup-list .q-item {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.fab-popup-list .q-item:last-child {
  border-bottom: none;
}

.fab-popup-list .q-item__label {
  font-size: 14px;
  font-weight: 500;
}

.fab-popup-card .q-input {
  margin: 12px 16px;
}

.fab-popup-card .q-field__control {
  border-radius: 10px;
}

/* Mobile header section with transition */
.mobile-header-section {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  text-align: right;
  gap: 8px;
  padding-bottom: 2px;
  position: relative;
  z-index: 100;
}

.mobile-header-hidden {
  display: none;
}

/* Articles section */
.articles-section-hidden {
  max-height: 0;
  opacity: 0;
  margin: 0 !important;
  padding: 0 !important;
}

/* Mobile Cart Styles */
.mobile-cart-container {
  max-height: calc(50vh - 60px);
  overflow-y: auto;
  border-radius: 8px;
}

.mobile-cart-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cart-item {
  background: white;
  color: black;
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.body--dark .cart-item {
  background: #1e1e1e;
  color: white;
}

.cart-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-delete-btn {
  flex-shrink: 0;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 0;
}

.cart-item-name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.body--dark .cart-item-name {
  color: #e0e0e0;
}

.cart-item-prices {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-item-price-label {
  font-size: 10px;
  color: #666;
  cursor: pointer;
  font-weight: 500;
}

.body--dark .cart-item-price-label {
  color: #999;
}

.cart-item-price {
  font-size: 10px;
  color: #888;
  cursor: pointer;
}

.body--dark .cart-item-price {
  color: #b0b0b0;
}

.quantity-controls {
  display: flex !important;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  border-radius: 16px;
  padding: 2px 4px;
}

.quantity-controls .q-btn {
  min-width: 24px !important;
  min-height: 24px !important;
}

.quantity-value {
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.cart-item-subtotal {
  font-size: 13px;
  font-weight: 700;
  color: #21BA45;
  white-space: nowrap;
  min-width: 55px;
  text-align: right;
  flex-shrink: 0;
}

.add-more-files {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.add-files-btn {
    background: var(--q-primary);
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
}

.add-files-btn:hover {
      background: var(--q-primary-dark, #1565c0);
      transform: scale(1.05) translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.add-files-btn:active {
      transform: scale(1.02) translateY(0);
}

/* Products section */
.products-section {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 76px);
}

.products-section-fullscreen {
  height: calc(100vh - 56px);
}

.product-container-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* Thumb translíºcido */
.product-container-scroll::-webkit-scrollbar-thumb {
  border-radius: 4px;
}

.invoice-chip {
  justify-content: center;
  margin: 0;
  width: 100%;
  min-width: 3rem;
  height: 100%;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

/* AI Analysis Modal Styles */
.rounded-10 { border-radius: 10px !important; }
.compact-select :deep(.q-field__marginal) { height: 32px; }
.compact-select :deep(.q-field__control) { min-height: 32px; }
.rounded-15 { border-radius: 15px !important; }
.rounded-borders-15 { border-radius: 15px; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rounded-borders-20 { border-radius: 20px; }
.rounded-borders-15 { border-radius: 15px; }
.rounded-borders-10 { border-radius: 10px; }
.sticky-top { position: sticky; top: 0; z-index: 10; }
.letter-spacing-1 { letter-spacing: 1px; }
.font-medium { font-weight: 500; }
.font-weight-regular { font-weight: 400; }
.opacity-05 { opacity: 0.05; }
.opacity-80 { opacity: 0.8; }
.line-height-1 { line-height: 1.2; }
.border-l-positive { border-left: 5px solid #21ba45 !important; }
.border-l-primary { border-left: 5px solid #1976d2 !important; }
.transition-base { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.item-card { border: 1px solid rgba(0,0,0,0.05); }
.vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); }
.hover-scale { transition: transform 0.2s; }
.hover-scale:hover { transform: scale(1.05); }
.border-grey-3 { border-color: #eeeeee; }
.border-grey-8 { border-color: #424242; }
.animate-fade { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
