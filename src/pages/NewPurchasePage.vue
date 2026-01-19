<template>
  <q-page class="q-pa-none">
    <q-form ref="saveBill" @submit.prevent="saveBill">
      <div class="billing-panel-container q-pa-sm">
        <!-- LEFT PANEL -->
        <div style="min-width: 0;">
          <!-- Purchase Number Indicator -->

          <div class="row q-col-gutter-sm">
            <!-- Selectores principales - Solo desktop -->
            <div v-if="$q.screen.gt.sm" class="billing-selects-desktop col-12">
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

              <div class="billing-select-item">
                <q-select
                  filled
                  dense
                  v-model="typeOfService"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :hide-dropdown-icon="$q.platform.is.nativeMobile"
                  option-label="name"
                  option-value="id"
                  :options="typeOfServices"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  @filter="filterTypeOfServices"
                  hide-bottom-space
                  label="Tipo de servicio"
                />
              </div>

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
                  @keypress.enter="getOneProduct"
                >
                    <template v-slot:append>
                        <q-btn round color="teal" icon="add_circle" size="sm" @click="openAddProduct = true"/>
                    </template>
                </q-input>
              </div>

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

                 <!-- FAB Tipo de Servicio -->
                 <q-fab-action
                   color="positive"
                   icon="category"
                   :label="typeOfService?.name || 'Servicio'"
                   label-position="left"
                 >
                   <q-popup-proxy @before-show="loadTypeOfServicesData()">
                     <q-card class="fab-popup-card">
                       <q-card-section class="fab-popup-header">
                         <div class="text-h6">Tipo de Servicio</div>
                         <q-btn flat round dense icon="close" v-close-popup />
                       </q-card-section>
                       <q-separator />
                       <q-card-section class="q-pa-none" style="position: relative; min-height: 200px;">
                         <q-inner-loading :showing="loadingTypeOfServices">
                           <q-spinner-dots size="50px" color="primary" />
                         </q-inner-loading>
                         <q-list class="fab-popup-list">
                           <q-item
                             v-for="service in typeOfServices"
                             :key="service.id"
                             clickable
                             v-ripple
                             :active="typeOfService?.id === service.id"
                             @click="typeOfService = service"
                             v-close-popup
                           >
                             <q-item-section>
                               <q-item-label>{{ service.name }}</q-item-label>
                             </q-item-section>
                             <q-item-section side v-if="typeOfService?.id === service.id">
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
                title="Artículos"
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
                        <q-tooltip>Agregar más archivos</q-tooltip>
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
                        <div class="upload-text">Arrastra archivos aquí</div>
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
                    label="Categorías"
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

             <div v-if="$q.screen.gt.sm" style="flex-shrink: 0; padding: 0.5rem; border-top: 1px solid #e0e0e0;">
                <q-list separator bordered style="border-radius: 10px;">
                    <q-item>
                      <q-item-section>Op Gravada</q-item-section>
                      <q-item-section side v-if="coin">{{ coin.symbol }} {{ formatNumber(totalBill) }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Monto pagado</q-item-section>
                      <q-item-section class="text-positive" side v-if="coin">{{ coin.symbol }} {{ formatNumber(totalPayment) }}</q-item-section>
                    </q-item>
                     <q-item>
                      <q-item-section>Por pagar</q-item-section>
                      <q-item-section side v-if="coin">{{ coin.symbol }} {{ formatNumber(pendingPayment) }}</q-item-section>
                    </q-item>
                </q-list>
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
                <!-- Datos básicos -->
                <div class="col-12">
                  <q-card flat bordered class="q-pa-md q-mb-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="info" class="q-mr-sm" />
                      Datos básicos
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
                          label="Categoría"
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
                          label="Stock mínimo"
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

              <!-- Sección de imágenes -->
              <div class="col-md-5 col-xs-12 col-sm-12">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="image" class="q-mr-sm" />
                    Imágenes
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
                          Arrastra las imágenes aquí
                        </div>
                        <div class="text-body2 text-grey-5 q-mb-md">
                          o haz clic para seleccionar archivos
                        </div>
                      </div>
                      <q-btn
                        color="primary"
                        label="Seleccionar Imágenes"
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
                          label="Mostrar en catálogo"
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
                    <th class="text-left">Método de pago</th>
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
                label="Número de factura"
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
                label="Número de documento"
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
                label="Número de teléfono"
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
                <q-tooltip>Cambiar unidad de compra</q-tooltip>
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
            <div class="text-subtitle1 text-center text-weight-bold">
              Precio por unidad = {{ formatNumber(productQuantity.cost) }}
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

    <wait-by-payment-mp
      v-if="waitingPayment"
      v-model="waitingPayment"
      :purchase="setModelInvoice()"
      @paymentSuccess="paymentSuccess"
    />
  </q-page>
</template>

<script>
// import { StreamBarcodeReader } from 'vue-barcode-reader'
import { Notify } from 'quasar'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatDate, formatNumber, notify } from 'src/const/mixins'
import WaitByPaymentMp from 'src/components/Billing/WaitByPaymentMp.vue'
import FileComponent from 'src/components/FileComponent.vue'
export default {
  name: 'NewPurchasePage',
  components: {
    // StreamBarcodeReader,
    WaitByPaymentMp,
    FileComponent
  },
  data () {
    return {
      productsFullscreen: false,
      waitingPayment: false,
      purchaseCode: null,
      loadingBilling: false,
      loadingSearch: false,
      /**
       * Invoice printer
       * @type {Boolean}
       */
      invoicePrinter: false,
      /**
       * Quantity dialog
       * @type {Boolean}
       */
      quantityDialog: false,
      /**
       * Product quantity
       * @type {Object}
       */
      productQuantity: null,
      /**
       * Quantity
       * @type {Number}
       */
      quantity: 1,
      /**
       * Current amount
       * @type {Number}
       */
      currentAmount: 0,
      /**
       * Selected UOM in quantity dialog
       * @type {Object}
       */
      selectedUom: null,
      /**
       * Description cashflow
       * @type {String}
       */
      description: '',
      /**
       * Invoice description
       * @type {String}
       */
      invoiceDescription: '',
      /**
       * Delivery date
       * @type {String}
       */
      deliveryDate: formatDate(Date(), 'YYYY-MM-DDTHH:mm'),
      /**
       * Format number
       * @type {Function}
       */
      formatNumber,
      /**
       * Search purchase
       * @type {Boolean}
       */
      searchInvoice: false,
      /**
       * Search
       * @type {String}
       */
      search: '',
      /**
       * Loading save provider
       * @type {Boolean}
       */
      loadingProvider: false,
      /**
       * Open add provider
       * @type {Boolean}
       */
      openAddProvider: false,
      /**
       * Client added data form
       * @type {Object}
       */
      providerAdded: {},
      /**
       * Invoice data
       * @type {Object}
       */
      purchase: null,
      /**
       * Category products filter
       * @type {Object}
       */
      category: null,
      /**
       * Type of service
       * @type {Object}
       */
      typeOfService: null,
      /**
       * Type of services
       * @type {Array}
       */
      typeOfServices: [],
      /**
       * Type of services
       * @type {Array}
       */
      conditionIvaReceptors: [],
      /**
       * Payments
       * @type {Array}
       */
      payments: [],
      /**
       * Payment methods
       * @type {Array}
       */
      paymentMethods: [],
      /**
       * Dialog payment
       * @type {Boolean}
       */
      dialogPayment: false,
      /**
       * Invoice types
       * @type {Array}
       */
      invoiceTypes: [],
      /**
       * Invoice type
       * @type {Object}
       */
      invoiceType: null,
      /**
       * Coins
       * @type {Array}
       */
      coins: [],
      /**
       * Coin
       * @type {Object}
       */
      coin: null,
      /**
       * Clients
       * @type {Array}
       */
      providers: [],
      /**
       * Client to billing
       * @type {Object}
       */
      provider: null,
      /**
       * Exchange rate
       * @type {Number}
       */
      exchangeRate: 1,
      /**
       * Pagination option
       * @type {Object}
       */
      pagination: {
        rowsPerPage: 50,
        rowsNumber: 50,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      /**
       * Filter products
       * @type {String}
       */
      filter: '',
      /**
       * Barcode
       * @type {String}
       */
      barcode: null,
      /**
       * Without payment
       * @type {Array}
       */
      withoutPayment: ['T', 'P', 'CC'],

      withServiceType: [4],
      /**
       * Scan dialog
       * @type {Boolean}
       */
      modelScan: false,
      /**
       * Purchase files (attachments)
       * @type {Array}
       */
      purchaseFiles: [],
      /**
       * Drag over state for purchase files
       * @type {Boolean}
       */
      isDragOverPurchase: false,
      /**
       * Deleted purchase files
       * @type {Array}
       */
      deletedPurchaseFiles: [],
      /**
       * Without print
       * @type {Boolean}
       */
      withoutPrint: false,
      /**
       * Provider search for FAB modal
       * @type {String}
       */
      providerSearch: '',
      /**
       * Provider menu open state
       * @type {Boolean}
       */
      providerMenuOpen: false,
      /**
       * Loading providers state
       * @type {Boolean}
       */
      loadingProviders: false,
      /**
       * Loading invoice types state
       * @type {Boolean}
       */
      loadingInvoiceTypes: false,
      /**
       * Loading type of services state
       * @type {Boolean}
       */
      loadingTypeOfServices: false,
      /**
       * Center FAB open state
       * @type {Boolean}
       */
      centerFabOpen: false,
      /**
       * Right FAB open state
       * @type {Boolean}
       */
      rightFabOpen: false,
      /**
       * @type {Array}
       */
      aliquotTypes: [],
      categoryAdd: null,
      /**
       * Products list
       * @type {Array}
       */
      products: [],
      visible: false,
      /**
       * Total bill
       * @type {Number}
       */
      totalBill: 0,
      /**
       * All products
       * @type {Array}
       */
      allProducts: [],
      /**
       * Categories list
       * @type {Array}
       */
      categories: [],
      /**
       * @type {Array}
       */
      unitOfMeasure: null,
      /**
       * @type {Array}
       */
      unitOfMeasures: [],
      /**
       * @type {Object}
       */
      product: {
        show_catalog: 0,
        skip_stock: 0,
        profit_percentage: 0,
        images: [],
        base_quantity: 1
      },
      /**
       * product price list
       * @type {Array}
       */
      priceLists: [],
      isDragOver: false,
      /**
       * Open dialog to add products
       * @type {Boolean}
       */
      openAddProduct: false,
      addonsProducts: [],
      addonsProductsOptions: [],
      /**
       * Loading products
       * @type {Boolean}
       */
      loadingProducts: false,
      /**
       * Products columns
       * @type {Array}
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
          label: 'Categoría',
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
       * Products columns
       * @type {Array}
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
        { name: 'quantity', align: 'right', label: 'Cantidad', field: 'quantity', sortable: true },
        { name: 'uom', align: 'left', label: 'Unidad', field: 'uom_acronym', sortable: true },
        { name: 'subtotal', align: 'right', label: 'Importe', field: 'subtotal', sortable: true },
        { name: 'actions', align: 'right', label: 'Acciones', field: 'actions' }
      ]
    }
  },
  computed: {
    /**
     * Pending payment
     * @returns {Number}
     */
    pendingPayment () {
      return this.totalBill - this.totalPayment
    },
    /**
     * Total payment
     * @returns {Number}
     */
    totalPayment () {
      let totalPayment = 0
      this.payments.forEach((payment) => {
        totalPayment = totalPayment + payment.amount
      })
      return totalPayment
    },
    /**
     * Filter available UOMs based on current product category
     */
    availableUoms () {
      if (!this.productQuantity?.unit_of_measure?.uom_category_id) return []
      return this.unitOfMeasures.filter(uom =>
        uom.uom_category_id === this.productQuantity.unit_of_measure.uom_category_id
      )
    },
    ...mapState(authentication, ['userSession', 'branchOffice'])
  },
  watch: {
    quantityDialog (data) {
      if (!data) {
        this.quantity = 1
        this.currentAmount = 0
        this.selectedUom = null
      }
    },
    openAddProduct (data) {
      this.tab = 'basicData'
    },
    selectedUom (val) {
      if (val) {
        this.updateValues('quantity')
      }
    },
    unitOfMeasure (data) {
      this.product.unit_of_measure_id = data
    },
    categoryAdd (data) {
      if (data) {
        this.product.category_id = data.id
      }
    },
    category () {
      this.setPagination({
        pagination: this.pagination,
        filter: undefined
      })
    },
    filter () {
      this.setPagination({
        pagination: this.pagination,
        filter: undefined
      })
    },
    /**
     * Dialog payment
     * @param {Object} data data payment
     */
    dialogPayment (data) {
      const { company_session: companySession } = this.userSession
      if (data && companySession?.company_config?.payment_method) {
        this.addPayment(companySession?.company_config?.payment_method)
      }
    },
    branchOffice (data) {
      if (data) {
        this.setPagination({
          pagination: this.pagination,
          filter: undefined
        })
      }
    }
  },
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
  beforeUnmount () {
    window.removeEventListener('keydown', () => {
      this.dialogPayment = true
    })
  },
  created () {
    this.getLocalStorage()
    this.getPaymentMethods()
    // Verificar si hay un ID en la query al cargar la página
    // Si hay un ID pero la página se está refrescando (no hay estado previo),
    // limpiar la URL para resetear el estado
    if (this.$route?.query?.id) {
      // Remover el parámetro 'id' de la URL para restablecer el estado
      this.$router.replace({ name: 'NewPurchase' })
    }
  },
  methods: {
    /**
     * Update values
     * @param {String} inputName input name
     */
    updateValues (inputName) {
      const ratio = this.selectedUom?.ratio || 1
      const unitCost = this.productQuantity.cost * ratio

      if (inputName === 'quantity') {
        this.currentAmount = this.roundToFourDecimals(this.quantity * unitCost)
      } else if (inputName === 'currentAmount') {
        this.quantity = this.roundToFourDecimals(this.currentAmount / unitCost)
      }
    },
    /**
     * Round to four decimals
     * @param {Number} number number
     * @returns {Number}
     */
    roundToFourDecimals (number) {
      const factor = Math.pow(10, 3)
      return Math.floor(number * factor) / factor
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
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
     * Save providers
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
     * Save without print
     */
    saveWithoutPrint () {
      this.withoutPrint = true
      this.saveBill()
    },
    /**
     * Payment success
     * @param {Object} data data payments
     */
    paymentSuccess (data) {
      const payment = this.payments.find(payment => payment.amount === data.transaction_amount && payment.acronym === 'MPQA')
      payment.reference = String(data.id)
    },
    /**
     * Add bill payment
     * @param {Object} data data payments
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
     * Get all payment-methods
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    getCoins (value, update) {
      this.$api.get('coins', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.coins = data
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
     * Select category
     * @param {String} value user Session Value filter
     * @param {Callback} update update options
     */
    filterProviders (value, update) {
      this.$api.get('providers', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          dataSearch: {
            name: value,
            document_number: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.providers = data
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
     * Load providers data when modal opens
     */
    async loadProvidersData () {
      if (this.providers.length > 0) return // Ya hay datos cargados

      this.loadingProviders = true
      try {
        const { data } = await this.$api.get('providers', {
          params: {
            sortBy: 'id',
            sortOrder: 'desc'
          }
        })
        this.providers = data
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
     * Load invoice types data when modal opens
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
     * Load type of services data when modal opens
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
     * Get all products
     * @param {Object} params params to search
     * @param {Boolean} append if true appends products to list
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
     * Handle products infinite scroll
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
     * Set payments
     * @param {Array} invoicePayments purchase payments
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
     * Get purchase one request
     * @param {Number} id purchase id
     * @returns {Object}
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
     * Get purchase one
     * @param {Number} id purchase id
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
     * Clear purchase
     */
    clear () {
      this.payments = []
      this.products = []
      this.invoiceDescription = ''
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
     * Print purchase
     * @param {Object} data purchase saved
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
     * Set purchase model with FormData
     * @returns {FormData}
     */
    setModelInvoice () {
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
        status: this.purchase?.status || this.typeOfService.code === 4 ? 'delivered' : 'pending',
        payments: this.payments.filter(payment => payment.amount > 0)
      }

      // Siempre usar FormData para consistencia
      return this.createPurchaseFormData(purchaseData)
    },

    /**
     * Create FormData with purchase data and multimedia files
     * @param {Object} purchaseData
     * @returns {FormData}
     */
    createPurchaseFormData (purchaseData) {
      const formData = new FormData()

      // Agregar método PUT/PATCH si es edición
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
     * Set params bill
     */
    setParamsBill () {
      if (this.invoiceType?.acronym_serie === 'CC') { return this.setModelInvoice() }

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

      return this.setModelInvoice()
    },

    /**
     * Save bill and payments with FormData
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
     * Get local storage
     */
    getLocalStorage () {
      const { company_session: companySession } = this.userSession
      this.provider = companySession?.company_config?.provider
      this.invoiceType = companySession?.company_config?.invoice_type
      this.typeOfService = companySession?.company_config?.type_of_service
      this.coin = companySession?.company_config?.coin
      this.calculateTotal()
      this.getUnitOfMeasures()
    },
    /**
     * Delete product in table
     * @param {Object} product props table products
     */
    deleteProduct (product) {
      this.products.splice(product.rowIndex, 1)
      this.calculateTotal()
    },
    /**
     * Delete purchase payment
     * @param {Number} index value index payments
     */
    deletePayment (index) {
      this.payments.splice(index, 1)
    },
    /**
     * Calculate the total
     */
    calculateTotal () {
      let total = 0
      this.products.forEach(product => {
        total += product.subtotal
      })
      this.totalBill = total
    },
    /**
     * Calculate the total and subtotal
     * @param {Object} data props products
     */
    calculate (data) {
      const quantity = isNaN(data.quantity) ? 0 : data.quantity
      const cost = isNaN(data.cost) ? 0 : data.cost
      const factor = data.conversion_factor || 1
      data.subtotal = parseFloat((cost * quantity * factor).toFixed(4))
      this.calculateTotal()
    },
    /**
     * Push product
     * @param {Object} product product
     */
    pushProduct (product) {
      this.products.push({
        id: product.id,
        name: product.name,
        quantity: product.quantity || 1,
        subtotal: product.subtotal || parseFloat(((product.quantity || 1) * (product.cost || 0) * (product.conversion_factor || 1)).toFixed(2)),
        product_id: product.id,
        cost: product.cost,
        barcode: product.barcode,
        unit_of_measure_id: this.selectedUom?.id || product.unit_of_measure_id,
        uom_acronym: this.selectedUom?.acronym || product.unit_of_measure?.acronym,
        conversion_factor: product.conversion_factor || 1
      })
    },
    /**
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data, validUnitMeasurement = false) {
      const findProduct = this.products.find(product => product.id === data.id)
      const hasUom = !!data?.unit_of_measure
      const baseCost = data?.cost || 0
      if (validUnitMeasurement && hasUom) {
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
      const baseRatio = productUom ? parseFloat(productUom.ratio) : 1

      const selectedUomId = this.selectedUom?.id || data.unit_of_measure_id
      const selectedUomObj = this.unitOfMeasures.find(u => u.id === selectedUomId)
      const selectedRatio = selectedUomObj ? parseFloat(selectedUomObj.ratio) : (this.selectedUom?.ratio ? parseFloat(this.selectedUom.ratio) : 1)

      const conversionFactor = selectedRatio / baseRatio

      const quantityToAdd = this.quantity

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
    },
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
    updateProfitPercentage (newVal) {
      if (newVal && this.product.cost > 0) {
        const price = this.product.cost * (1 + newVal / 100)
        this.product.price = parseFloat(price.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0])
      }
    },
    updateCost (newVal) {
      if (newVal && this.product.profit_percentage != null) {
        const price = newVal * (1 + this.product.profit_percentage / 100)
        this.product.price = parseFloat(price.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0])
      }
    },
    updatePrice (newVal) {
      if (newVal && this.product.cost > 0) {
        const margin = ((newVal - this.product.cost) / this.product.cost) * 100
        this.product.profit_percentage = Number(margin.toFixed(4)) // 85.7143%
      }
    },
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
    handleDrop (event) {
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.processFiles(files)
    },
    setCategory (data) {
      this.product.aliquot_type = data.aliquot_type
    },
    /**
     * Get one product
     * @param {Number} barcode barcode product
     */
    async getOneProduct () {
      this.$api.get('products', {
        params: {
          dataEqualFilter: {
            barcode: this.barcode
          }
        }
      })
        .then(({ data }) => {
          const product = data[0]
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
        })
        .catch((error) => {
          this.$q.notify({
            message: error.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Open file dialog safely
     */
    openFileDialog () {
      const input = this.$refs.fileInput
      if (input) {
        input.click()
      } else {
        console.error('File input ref not found')
      }
    },
    /**
     * Handle file select
     * @param {Event} event
     */
    handleFileSelect (event) {
      const files = Array.from(event.target.files)
      this.processPurchaseFiles(files)
      event.target.value = '' // Reset input
    },
    /**
     * Handle purchase file drop
     * @param {Event} event
     */
    handlePurchaseFileDrop (event) {
      this.isDragOverPurchase = false
      const files = Array.from(event.dataTransfer.files)
      this.processPurchaseFiles(files)
    },
    /**
     * Process purchase files (images and PDFs)
     * @param {Array} files
     */
    processPurchaseFiles (files) {
      files.forEach(file => {
        // Validate file type
        const isValidImage = file.type.startsWith('image/')
        const isValidPDF = file.type === 'application/pdf'

        if (!isValidImage && !isValidPDF) {
          this.$q.notify({
            message: this.$t('newPurchasePage.invalidFileType'),
            icon: 'warning',
            color: 'negative'
          })
          return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          this.$q.notify({
            message: this.$t('newPurchasePage.fileTooLarge'),
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
      })
    },
    /**
     * Handle delete purchase files
     * @param {Array} deletedIds
     */
    handleDeletePurchaseFiles (deletedIds) {
      if (deletedIds.length > 0) {
        this.deletedPurchaseFiles.push(...deletedIds)
      }
    },
    /**
     * Load existing attachments
     * @param {Array} attachments
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
     * Clear purchase files
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
     * Filter products for addons
     * @param {String} value Value filter
     * @param {Callback} update update options
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
/* Desktop - mantiene el diseño actual */
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
/* Desktop - mantiene el diseño actual */
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

/* Thumb translúcido */
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
  @media (max-width: 1023px) {
    :deep(.col) {
      flex: none !important;
    }
  }
}
</style>
