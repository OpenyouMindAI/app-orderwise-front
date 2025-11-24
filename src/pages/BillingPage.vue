<template>
  <q-page padding>
    <!-- Tour Overlay -->
    <div v-if="showTour" class="tour-overlay">
      <div class="tour-spotlight" :style="spotlightStyle"></div>
      <q-card class="tour-card" :style="tourCardStyle">
        <q-card-section class="tour-header">
          <div class="tour-step-indicator">Paso {{ currentTourStep + 1 }} de {{ tourSteps.length }}</div>
          <q-btn flat round dense icon="close" @click="skipTour" color="grey-7" size="sm" />
        </q-card-section>
        <q-card-section>
          <div class="tour-title">{{ tourSteps[currentTourStep].title }}</div>
          <div class="tour-description">{{ tourSteps[currentTourStep].description }}</div>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            v-if="currentTourStep > 0"
            flat
            label="Anterior"
            @click="previousTourStep"
            color="grey-7"
          />
          <q-btn
            flat
            label="Saltar tour"
            @click="skipTour"
            color="grey-7"
          />
          <q-btn
            unelevated
            :label="currentTourStep === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'"
            @click="nextTourStep"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </div>

    <div v-if="$route.query.id">
      <span class="text-subtitle1">Factura número: </span>
      <span class="text-subtitle2">{{ invoice?.code }}</span>
    </div>
    <q-form ref="saveBill" @submit="saveBill" style="min-height: calc(100vh - 104px);">
      <div class="billing-panel-container">
        <div>
          <!-- Panel de facturación -->
          <div class="row q-col-gutter-sm">
            <!-- Selectores principales -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;" class="col-12">
              <!-- Select cliente -->
              <div id="select-client">
                <q-select
                  filled
                  dense
                  v-model="client"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :hide-dropdown-icon="$q.platform.is.nativeMobile"
                  option-value="id"
                  :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
                  :options="clients"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  hide-bottom-space
                  @filter="filterClients"
                  label="Cliente"
                >
                  <template v-slot:append>
                    <q-btn color="primary" round icon="add_circle" @click.stop.prevent="(openAddClient = true)" size="sm"/>
                  </template>
                </q-select>
              </div>

              <!-- Select tipo de factura -->
              <div id="tour-tipo-factura">
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
                  hide-bottom-space
                  @filter="filterInvoiceTypes"
                  label="Tipo de factura"
                />
              </div>

              <!-- Select tipo de factura (Arca) -->
              <div v-if="invoiceType.bill">
                <q-select
                  filled
                  dense
                  v-model="voucherType"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :hide-dropdown-icon="$q.platform.is.nativeMobile"
                  option-value="id"
                  option-label="Desc"
                  :options="voucherTypes"
                  :rules="[(val) => !!val || 'El campo es requerido.']"
                  hide-bottom-space
                  @filter="getVoucherTypes"
                  label="Tipo de factura (Arca)"
                />
              </div>

              <!-- Select tipo de servicio -->
              <div id="tour-type-service">
                <q-select
                  filled
                  dense
                  v-model="typeOfService"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  :hide-dropdown-icon="$q.platform.is.nativeMobile"
                  option-value="id"
                  option-label="name"
                  :options="typeOfServices"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  hide-bottom-space
                  @filter="filterTypeOfServices"
                  label="Tipo de servicio"
                />
              </div>

              <!-- Espacio donde estaba el boton de caja - ahora vacío -->
            </div>
            <div class="col-12" style="width: 100% !important;" id="tour-barcode">
              <q-input
                filled
                dense
                v-model="barcode"
                autofocus
                label="Código"
                ref="barcode"
                style="width: 100% !important; max-width: none !important;"
                @keyup.enter="processBarcode(barcode)"
                @focus="scanner = false"
                @blur="scanner = true"
              />
              <q-btn
                style="border-radius: 10px; padding: 5px 15px; margin-top: 8px;"
                color="primary"
                icon="qr_code_scanner"
                label="Escanear"
                class="q-px-sm"
                dense
                @click.stop="startScanner"
                v-if="$q.platform.is.nativeMobile"
              >
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Escanear código
                </q-tooltip>
              </q-btn>
            </div>
            <div class="col-12" id="tour-products-table">
              <!-- Desktop view -->
              <q-table
                v-if="$q.screen.gt.xs"
                row-key="id"
                title="Artículos"
                dense
                hide-pagination
                :rows="products"
                :columns="columns"
                style="max-height: 400px; overflow: auto;"
                :pagination="{ rowsPerPage: 0 }"
                tabindex="0"
                @keydown="handleKeyboardNavigation"
                ref="productsTable"
              >
                <template v-slot:body="props">
                  <q-tr
                    :props="props"
                    :class="{ 'bg-blue-1 text-blue-10': selectedProductIndex == props.rowIndex }"
                    @click="selectProduct(props.rowIndex)"
                    style="cursor: pointer;"
                  >
                    <q-td key="barcode" :props="props">
                      {{ props.row.barcode || '-' }}
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ props.row.name.slice(0, 40) }}{{ props.row.name.length > 40 ? '...' : '' }}
                      <q-tooltip class="text-body2" anchor="bottom middle">
                        {{ props.row.name }}
                      </q-tooltip>
                    </q-td>
                    <q-td key="price" :props="props">
                      {{ formatNumber(props.row.price) }}
                      <q-popup-edit
                        v-if="userSession.is_root || !setPermissionsByUser(['CJ'])"
                        v-model.number="props.row.price"
                        auto-save
                        v-slot="scope"
                        @update:model-value="calculate(props.row)"
                      >
                        <div class="q-gutter-md" style="min-width: 250px">
                          <!-- Toggle para seleccionar tipo de precio (solo si hay listas de precios) -->
                          <q-radio
                            v-if="props.row.product_price_lists &&
                              props.row.product_price_lists.length > 0"
                            v-model="priceInputType"
                            val="list"
                            label="Lista de precios"
                          />
                          <q-radio
                            v-if="props.row.product_price_lists &&
                              props.row.product_price_lists.length > 0"
                            v-model="priceInputType"
                            val="manual"
                            label="Precio manual"
                          />

                          <!-- Selector de lista de precios -->
                          <q-select
                            v-if="props.row.product_price_lists &&
                              props.row.product_price_lists.length > 0 &&
                              priceInputType === 'list'"
                            v-model="selectedPriceList"
                            :options="props.row.product_price_lists"
                            option-label="name"
                            option-value="price"
                            label="Seleccionar lista de precios"
                            emit-value
                            map-options
                            @update:model-value="(value) => { scope.value = value; scope.set(); }"
                          />

                          <!-- Input manual de precio -->
                          <q-input
                            v-if="!props.row.product_price_lists || props.row.product_price_lists.length === 0 || priceInputType === 'manual'"
                            label="Precio"
                            type="number"
                            v-model.number="scope.value"
                            autofocus
                            @keyup.enter="scope.set"
                          />
                        </div>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="quantity" :props="props">
                      {{ formatNumber(props.row.quantity) }}
                      <q-popup-edit
                        v-model.number="props.row.quantity"
                        auto-save
                        :ref="`quantityInput-${props.rowIndex}`"
                        v-slot="scope"
                        @update:model-value="calculate(props.row)"
                      >
                        <q-input
                          label="Cantidad"
                          type="number"
                          @focus="e => e.target.select()"
                          v-model.number="scope.value"
                          :model-value="Number(scope.value).toFixed(2)"
                          autofocus
                          @keyup.enter="scope.set"
                        />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="subtotal" :props="props">
                      {{ formatNumber(props.row.subtotal) }}
                    </q-td>
                    <q-td key="actions" :props="props">
                      <q-btn
                        v-if="props.row.promotion_details && props.row.promotion_details.length > 0"
                        :icon="props.expand ? 'expand_less' : 'expand_more'"
                        size="sm"
                        color="primary"
                        @click.stop="props.expand = !props.expand"
                        round
                        class="q-mr-xs"
                      />
                      <q-btn icon="delete" size="sm" color="negative" @click.stop="deleteProduct(props)" round/>
                    </q-td>
                  </q-tr>
                  <q-tr v-show="props.expand" :props="props">
                    <q-td colspan="100%" class="q-pa-sm">
                      <div class="text-left">
                        <div v-if="props.row.promotion_details && props.row.promotion_details.length > 0">
                          <div class="text-weight-medium q-mb-sm">Detalles de la promoción</div>

                          <div v-for="group in props.row.promotion_details" :key="group.name" class="q-mb-sm">
                            <div class="text-subtitle2 text-grey-8 q-mb-xs">
                              {{ group.name }}
                            </div>
                            <div class="q-ml-sm">
                              <!-- Show selected products for this group -->
                              <div v-if="props.row.selectedProducts && props.row.selectedProducts.length > 0">
                                <div
                                  v-for="selection in props.row.selectedProducts.filter(sel => sel.groupIndex === props.row.promotion_details.indexOf(group))"
                                  :key="selection.product_id"
                                  class="row justify-between q-py-xs"
                                >
                                  <span>{{ selection.product.name }}</span>
                                  <div class="row items-center q-gutter-xs">
                                    <span class="text-weight-medium">{{ selection.quantity }} unidad{{ selection.quantity > 1 ? 'es' : '' }}</span>
                                  </div>
                                </div>
                              </div>
                              <!-- Fallback if no selected products -->
                              <div v-else>
                                <div class="text-caption text-grey-6 q-py-xs">
                                  No hay productos seleccionados para este grupo
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="q-mt-sm q-pt-sm" style="border-top: 1px solid #e0e0e0;">
                            <div class="row justify-between items-center">
                              <span class="text-weight-medium">Total promoción:</span>
                              <span class="text-weight-bold text-primary">${{ formatNumber(props.row.subtotal || props.row.final_price || props.row.price) }}</span>
                            </div>
                          </div>
                        </div>

                        <div v-else-if="(props.row.selectedProducts && props.row.selectedProducts.length > 0) || (props.row.products && props.row.products.length > 0)">
                          <div class="text-weight-medium q-mb-sm">Productos incluidos</div>
                          <div class="q-ml-sm">
                            <!-- Show selected products if available (for promos from modal) -->
                            <div v-if="props.row.selectedProducts && props.row.selectedProducts.length > 0">
                              <div v-for="selection in props.row.selectedProducts" :key="selection.product_id" class="row justify-between q-py-xs">
                                <span>{{ selection.product.name }}</span>
                                <span class="text-weight-medium">{{ selection.quantity }} unidad{{ selection.quantity > 1 ? 'es' : '' }}</span>
                              </div>
                            </div>
                            <!-- Fallback to all products (for legacy promos) -->
                            <div v-else>
                              <div v-for="item in props.row.products" :key="item.product_id || item.id" class="row justify-between q-py-xs">
                                <span>{{ item.name }}</span>
                                <span class="text-weight-medium">1 unidad</span>
                              </div>
                            </div>
                          </div>
                          <div v-if="props.row.final_price" class="q-mt-sm q-pt-sm" style="border-top: 1px solid #e0e0e0;">
                            <div class="row justify-between items-center">
                              <span class="text-weight-medium">Total:</span>
                              <span class="text-weight-bold text-primary">${{ formatNumber(props.row.final_price) }}</span>
                            </div>
                          </div>
                        </div>

                        <div v-else-if="props.row.is_bundle">
                          <div class="text-grey-6">Producto promocional sin detalles específicos</div>
                        </div>

                        <div v-else>
                          <div class="text-grey-6">No hay detalles adicionales para este producto</div>
                        </div>
                      </div>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>

              <!-- Mobile view -->
              <div v-else>
                <div class="text-h6 q-mb-md">Artículos</div>
                <div class="q-gutter-y-md">
                  <q-card v-for="(product, rowIndex) in products" :key="rowIndex" flat bordered class="product-card">
                    <q-card-section>
                      <div class="row items-center justify-between q-mb-sm q-pr-sm">
                        <div class="text-subtitle1 text-weight-bold">
                          {{ product.barcode }} - {{ product.name }}
                        </div>
                        <q-badge floating class="q-pa-none" style="background-color: transparent;">
                          <q-btn icon="delete" size="sm" color="negative" flat round @click="deleteProduct({ rowIndex })" />
                        </q-badge>
                      </div>
                      <div class="row q-mb-xs">
                        <div class="col-4 text-grey column text-left">
                          <span>Precio:</span>
                          <div>
                            {{ formatNumber(product.price) }}
                            <q-icon
                              v-if="userSession.is_root || !setPermissionsByUser(['CJ'])"
                              name="edit"
                              size="xs"
                              color="primary"
                              class="q-ml-xs cursor-pointer"
                            />
                            <q-popup-edit
                              v-if="userSession?.is_root || !setPermissionsByUser(['CJ'])"
                              v-model.number="product.price"
                              auto-save
                              v-slot="scope"
                              @update:model-value="calculate(product)"
                            >
                              <q-input
                                label="Precio"
                                type="number"
                                v-model.number="scope.value"
                                autofocus
                                @keyup.enter="scope.set"
                              />
                            </q-popup-edit>
                          </div>
                        </div>
                        <div class="col-4 text-grey text-center">
                          <span>Cantidad:</span>
                          <div>
                            {{ formatNumber(product.quantity) }}
                            <q-icon
                              name="edit"
                              size="xs"
                              color="primary"
                              class="q-ml-xs cursor-pointer"
                            />
                            <q-popup-edit
                              v-model.number="product.quantity"
                              auto-save
                              v-slot="scope"
                              :model-value="Number(product.quantity).toFixed(2)"
                              @update:model-value="calculate(product)"
                            >
                              <q-input
                                label="Cantidad"
                                type="number"
                                :model-value="Number(scope.value).toFixed(2)"
                                v-model.number="scope.value"
                                autofocus
                                @keyup.enter="scope.set"
                              />
                            </q-popup-edit>
                          </div>
                        </div>
                        <div class="col-4 text-grey text-center">
                          <div class="col-5 text-grey">Subtotal:</div>
                          <div class="col-7 text-weight-bold">{{ formatNumber(product.subtotal) }}</div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
            <div class="col-12 q-col-gutter-xs q-mt-md row">
              <!-- <div class="col-6" v-if="typeOfService.code !== '4'">
                <q-select
                  filled
                  dense
                  label="Moneda"
                  option-label="name"
                  option-value="id"
                  v-model="coin"
                  :options="coins"
                  @filter="getCoins"
                />
              </div> -->
              <div class="col-6" v-if="typeOfService.code !== '4'">
                <q-input type="datetime-local" dense filled v-model="deliveryDate" label="Fecha de entrega" />
              </div>
              <div class="col-12" v-if="typeOfService.code !== '4'">
                <AddressComponent
                  :key="addressComponentKey"
                  :initial-address="address"
                  @address-selected="handleAddressSelected"
                />
              </div>
              <div class="col-12" id="tour-descripcion">
                <q-input type="textarea" filled v-model="invoiceDescription" label="Descripción" autogrow />
              </div>

              <!-- Sección de archivos adjuntos - Solo para pedidos (code === 5) -->
              <div class="col-12" v-if="typeOfService && typeOfService.code === 5">
                <q-card flat bordered class="q-mt-md">
                  <q-card-section class="q-pb-sm">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center justify-between">
                      <div class="flex items-center">
                        <q-icon name="attachment" class="q-mr-sm" />
                        Archivos Adjuntos
                      </div>

                      <!-- Botón para agregar archivos - visible cuando ya hay archivos -->
                      <q-btn
                        v-if="invoiceFiles.length > 0"
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

                    <!-- Dropzone simple - solo cuando no hay archivos -->
                    <div
                      v-if="invoiceFiles.length === 0"
                      class="upload-zone"
                      :class="{
                        'upload-zone-active': isDragOverInvoice,
                        'q-dark': $q.dark.isActive
                      }"
                      @dragenter.prevent="isDragOverInvoice = true"
                      @dragover.prevent="isDragOverInvoice = true"
                      @dragleave.prevent="isDragOverInvoice = false"
                      @drop.prevent="handleInvoiceFileDrop"
                      @click="openFileDialog"
                    >
                      <div class="upload-content">
                        <q-icon name="cloud_upload" size="24px" color="primary" class="q-mb-xs" />
                        <div class="upload-text">
                          Arrastra archivos aquí
                        </div>
                        <q-btn
                          color="primary"
                          label="SELECCIONAR"
                          unelevated
                          size="xs"
                          class="q-mt-xs upload-btn"
                          @click.stop="openFileDialog"
                        />
                      </div>
                    </div>

                    <!-- Input oculto para seleccionar archivos - SIEMPRE disponible -->
                    <input
                      ref="fileInput"
                      type="file"
                      multiple
                      accept="image/*,.pdf,application/pdf"
                      style="display: none"
                      @change="handleFileSelect"
                    />

                    <!-- Vista de archivos adjuntos -->
                    <div v-if="invoiceFiles.length > 0" class="q-mt-md">
                      <div class="text-body2 text-primary q-mb-sm">
                        Archivos adjuntos ({{ invoiceFiles.length }})
                      </div>
                      <file-component
                        :files="invoiceFiles"
                        @delete:files="handleDeleteInvoiceFiles"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12">
                <div class="flex q-mt-sm" v-if="invoice" style="gap: 15px;">
                  <q-btn
                    color="primary"
                    icon="print"
                    label="Imprimir factura"
                    @click="() => { invoicePrinter = true; printBill(invoice) }"
                  >
                    <q-badge
                      color="negative"
                      align="bottom"
                      floating
                      v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
                    >
                      F9
                    </q-badge>
                    <q-tooltip class="text-body2" anchor="bottom middle">
                      Imprimir factura
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    color="teal"
                    icon="receipt"
                    label="Imprimir ticket"
                    @click="() => { invoicePrinter = false; printBill(invoice) }"
                  >
                    <q-badge
                      color="negative"
                      align="bottom"
                      floating
                      v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
                    >
                      F4
                    </q-badge>
                    <q-tooltip class="text-body2" anchor="bottom middle">
                      Imprimir ticket
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref="productsSection" style="display: flex; flex-direction: column; height: calc(100vh - 104px);">

          <!-- Botones de acción arriba de todo -->
          <div style="flex-shrink: 0; padding-bottom: 0.5rem;">
            <div class="flex q-gutter-sm justify-start">
              <!-- Abrir/Cerrar caja -->
              <!-- Cobrar -->
              <q-btn
                id="tour-btn-cobrar"
                style="border-radius: 10px; padding: 5px 15px"
                label="Cobrar"
                icon="payments"
                color="positive"
                dense
                :disable="products.length <= 0"
                @click="dialogPayment = true"
              >
                <q-badge
                  color="negative"
                  align="bottom"
                  floating
                  v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
                >
                  F1
                </q-badge>
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Cobrar
                </q-tooltip>
              </q-btn>
              <q-btn
                id="tour-btn-mesas"
                style="border-radius: 10px; padding: 5px 15px"
                color="orange"
                icon="table_restaurant"
                dense
                label="Mesas"
                :loading="loadingLivingRoom"
                @click="dialogTable = true"
                v-if="companyConfig.is_table"
              >
                <q-badge
                  color="negative"
                  align="bottom"
                  floating
                  v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
                >
                  F10
                </q-badge>
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Seleccionar mesas
                </q-tooltip>
              </q-btn>
              <!-- Entrada/Salida -->
              <q-btn
                id="tour-btn-cashflow"
                icon="payments"
                color="info"
                dense
                :label="$q.screen.gt.sm && !$q.platform.is.nativeMobile ? 'Entrada / Salida' : ''"
                style="border-radius: 10px; padding: 5px 15px"
                @click="cashflow = true"
              >
                <q-badge
                  color="swap_horiz"
                  align="bottom"
                  floating
                  v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
                >
                  F11
                </q-badge>
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Entrada y salida de dinero
                </q-tooltip>
              </q-btn>

              <!-- Buscar -->
              <q-btn
                id="tour-btn-buscar"
                style="border-radius: 10px; padding: 5px 15px"
                :label="$q.screen.gt.sm && !$q.platform.is.nativeMobile ? 'Buscar': ''"
                icon="search"
                color="teal"
                dense
                @click="searchInvoice = true"
              >
                <q-badge
                  color="negative"
                  align="bottom"
                  floating
                  v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
                >
                  F12
                </q-badge>
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Buscar factura
                </q-tooltip>
              </q-btn>
              <q-btn
                v-if="openCashBox"
                style="border-radius: 10px; padding: 5px 15px;"
                dense
                :icon="isUserBoxOpen ? 'highlight_off' : 'point_of_sale'"
                :color="isUserBoxOpen ? 'yellow' : 'primary'"
                :label="isUserBoxOpen ? 'Cerrar caja' : 'Abrir caja'"
                @click="handleCashBoxButtonClick"
              >
                <q-tooltip class="text-body2" anchor="bottom middle">
                  {{ isUserBoxOpen ? 'Cerrar caja' : 'Abrir caja' }}
                </q-tooltip>
              </q-btn>
              <!-- Borrar -->
              <q-btn
                id="tour-btn-borrar"
                style="border-radius: 10px; padding: 5px 15px"
                icon="delete"
                color="negative"
                dense
                :label="$q.screen.gt.sm && !$q.platform.is.nativeMobile ? 'Borrar': ''"
                @click="clear"
              >
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Borrar factura
                </q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Filtros fijos arriba -->
          <div style="flex-shrink: 0; padding-bottom: 0.5rem;">
            <div class="row q-col-gutter-xs">
              <div class="col-6" id="tour-select-categoria">
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
              <div class="col-6" id="tour-input-buscar-producto">
                <q-input type="search" filled dense debounce="1000" v-model="filter" placeholder="Buscar" clearable>
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- Productos con scroll -->
          <div
            id="tour-seccion-productos"
            ref="productsScrollContainer"
            class="product-container-scroll"
            style="flex: 1; overflow-y: auto; padding: 0.5rem;"
            @scroll="handleProductsScroll"
          >
            <!-- Grid de productos y skeleton juntos -->
            <div class="row q-col-gutter-xs">
              <!-- Productos existentes -->
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
                    @click="product.is_promotion ? openPromoDialog(product) : validateProduct(product, true)"
                  >
                    <div class="absolute-full text-body2 flex flex-center text-bold text-center">
                      {{ product.name }}
                      <q-badge v-if="!validStockProduct(product, 1)" color="negative" floating style="top: 3px; right: 3px;">
                        Sin stock
                      </q-badge>
                    </div>
                    <q-tooltip class="text-body2">
                      {{ product.name }}
                    </q-tooltip>
                  </q-img>
                </q-card>
              </div>

              <!-- Skeleton loader en la misma fila -->
              <template v-if="loadingProducts">
                <div
                  v-for="n in skeletonCount"
                  :key="`skeleton-${n}`"
                  class="col-xs-4 col-sm-4 col-md-3 col-lg-2 col-xl-2"
                  style="padding: 1px;"
                >
                  <q-card class="my-card" style="border-radius: 10px;">
                    <q-skeleton
                      height="150px"
                      width="100%"
                      style="border-radius: 10px;"
                    />
                  </q-card>
                </div>
              </template>
            </div>

            <!-- Mensaje cuando no hay productos -->
            <div v-if="!loadingProducts && allProducts.length === 0" class="text-center q-pa-lg text-grey">
              <q-icon name="inventory_2" size="3rem" />
              <div class="text-h6 q-mt-md">No se encontraron productos</div>
            </div>
          </div>

          <!-- Total fijo abajo -->
          <div style="flex-shrink: 0; padding: 0.5rem; border-top: 1px solid #e0e0e0;">
            <q-list separator bordered style="border-radius: 10px;">
              <q-item v-if="tableSelected.length">
                <q-item-section>
                  Mesas
                </q-item-section>
                <q-item-section side>
                  {{ tableSelected.length }}
                </q-item-section>
              </q-item>
              <!-- Tasa de cambio -->
              <q-item v-if="exchangeRate" class="bg-blue-1">
                <q-item-section>
                  <div class="text-subtitle2 text-weight-medium">Tasa de cambio</div>
                  <div class="text-caption text-grey-7">
                    1 {{ coin?.symbol || '' }} = {{ exchangeRate.amount }} {{ exchangeRate.coin?.symbol || '' }}
                  </div>
                </q-item-section>
              </q-item>
              <q-item class="bg-positive text-white text-h5 text-bold" style="border-radius: 10px 10px 0px 0px;">
                <q-item-section>
                  TOTAL
                </q-item-section>
                <q-item-section v-if="coin" side class="text-white">
                  <div style="display: flex; align-items: center; gap: 7px">
                    <span>
                      {{ coin.symbol }}
                    </span>
                    <span>
                      {{ formatNumber(totalBill) }}
                    </span>
                    <span v-if="exchangeRate">
                      |
                    </span>
                    <span v-if="exchangeRate">
                      {{ exchangeRate.coin?.symbol }} {{ formatNumber(totalBill * exchangeRate.amount) }}
                    </span>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section v-if="pendingPayment >= 0">
                  TOTAL POR COBRAR
                </q-item-section>
                <q-item-section v-else>
                  VUELTO
                </q-item-section>
                <q-item-section side v-if="coin">
                  <div style="display: flex; align-items: center; gap: 7px">
                    <span>
                      {{ coin.symbol }}
                    </span>
                    <span>
                      {{ formatNumber(Math.abs(pendingPayment)) }}
                    </span>
                    <span v-if="exchangeRate">
                      |
                    </span>
                    <span v-if="exchangeRate">
                      {{ exchangeRate.coin?.symbol }} {{ formatNumber(Math.abs(pendingPayment * exchangeRate.amount)) }}
                    </span>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
    </q-form>

    <!-- Promo Selection Dialog -->
    <q-dialog v-model="promoDialog" :maximized="$q.screen.lt.sm" persistent ref="promoModal">
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 700px; max-width: 80vw;'">
        <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
          <span class="text-h6">{{ currentPromo?.name }} - {{ currentGroup?.name }}</span>
          <q-btn flat icon="close" round size="md" @click="closePromoDialog"/>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div v-if="currentGroup">
            <!-- Header with selection info -->
            <div class="text-center q-mb-lg">
              <div class="text-h6 text-weight-bold q-mb-sm">
                {{ currentGroup.name }}
              </div>
              <div class="text-subtitle1 q-mb-sm">
                Selecciona {{ currentGroup.quantity }} producto{{ currentGroup.quantity > 1 ? 's' : '' }}
              </div>
            </div>

            <!-- Products Grid -->
            <div class="row q-col-gutter-md justify-center">
              <div
                v-for="product in currentGroup.products"
                :key="product.id || product.product_id"
                class="col-xs-6 col-sm-4 col-md-3"
              >
                <div class="product-container">
                  <div
                    class="modern-product-card"
                    :class="{ 'modern-product-card--selected': isProductSelected(product.id || product.product_id) }"
                    @click="toggleProductSelection(product)"
                    :key="`product-${product.id || product.product_id}-${currentGroupIndex}`"
                    :style="{
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${product.images && product.images[0] ? product.images[0].url : 'images/404-image.jpg'})`
                    }"
                  >
                    <!-- Selection indicator -->
                    <div v-if="isProductSelected(product.id || product.product_id)" class="selection-indicator">
                      <q-icon name="check_circle" color="white" size="18px" />
                    </div>

                    <!-- Product content -->
                    <div class="product-content">
                      <div class="product-name">{{ product.name }}</div>

                      <!-- Quantity controls -->
                      <div v-if="isProductSelected(product.id || product.product_id)" class="quantity-controls">
                        <button
                          class="quantity-btn quantity-btn--minus"
                          @click.stop="decreaseQuantity(product.id || product.product_id)"
                          :disabled="getProductQuantity(product.id || product.product_id) <= 1"
                        >
                          <q-icon name="remove" size="14px" />
                        </button>
                        <span class="quantity-display">{{ getProductQuantity(product.id || product.product_id) }}</span>
                        <button
                          class="quantity-btn quantity-btn--plus"
                          @click.stop="increaseQuantity(product.id || product.product_id)"
                          :disabled="getTotalSelectedQuantity() >= currentGroup.quantity"
                        >
                          <q-icon name="add" size="14px" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selection status -->
            <div class="text-center q-mt-lg">
              <q-linear-progress
                :value="getTotalSelectedQuantity() / currentGroup.quantity"
                color="primary"
                size="8px"
                rounded
                class="q-mb-sm"
              />
              <div class="text-subtitle2 q-mb-sm text-weight-medium">
                <q-icon name="shopping_cart" class="q-mr-xs" />
                {{ getTotalSelectedQuantity() }} de {{ currentGroup.quantity }} seleccionados
              </div>

              <!-- Price calculation with modifiers -->
              <div class="q-mb-lg">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-body1 text-weight-bold q-mb-xs">
                    <q-icon name="attach_money" class="q-mr-xs text-green" />
                    Total de la Promoción
                  </div>
                  <div class="row justify-between items-center">
                    <div class="text-subtitle2 text-grey-7">
                      Precio base: ${{ parseFloat(currentPromo.final_price || 0).toFixed(2) }}
                    </div>
                    <div class="text-h6 text-weight-bold text-primary">
                      ${{ currentPromo.final_price }}
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- Navigation buttons -->
              <div class="row q-gutter-md justify-center q-mt-lg">
                <q-btn
                  v-if="currentGroupIndex > 0"
                  flat
                  color="grey-8"
                  icon="chevron_left"
                  label="Anterior"
                  @click="previousGroup"
                  class="modern-nav-btn modern-nav-btn--secondary"
                  padding="12px 24px"
                />
                <q-btn
                  v-if="currentGroupIndex < currentPromo.promotion_details.length - 1"
                  unelevated
                  color="primary"
                  icon-right="chevron_right"
                  label="Siguiente"
                  @click="nextGroup"
                  :disable="!isCurrentGroupValid()"
                  class="modern-nav-btn modern-nav-btn--primary"
                  padding="12px 24px"
                />
                <q-btn
                  v-else
                  unelevated
                  color="positive"
                  icon="shopping_cart"
                  label="Agregar Promocion"
                  @click="addPromoToCart"
                  :disable="!isCurrentGroupValid()"
                  class="modern-nav-btn modern-nav-btn--success"
                  padding="14px 28px"
                  size="md"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <PaymentModal
      :show="dialogPayment"
      :payment-methods="paymentMethods"
      :payments="payments"
      :total-amount="totalBill"
      :coin="coin"
      :show-table-close="!!(invoice?.tables?.length && invoice?.id)"
      :table-close="tableClose"
      :loading="loadingBilling"
      :user-session="userSession"
      :cash-box-state="cashBoxState"
      :type-of-service="typeOfService"
      :invoice-type="invoiceType"
      :exchange-rate="exchangeRate"
      @update:show="dialogPayment = $event"
      @update:table-close="tableClose = $event"
      @payment-update="handlePaymentUpdate"
      @payment-delete="handlePaymentDelete"
      @payment-check="handlePaymentCheck"
      @qr-payment="handleQRPayment"
      @action-click="handlePaymentAction"
    />

    <q-dialog v-model="dialogTable">
      <drawer-table
        ref="drawerTable"
        :tablesSelected="tableSelected"
        @update:tableSelected="setTableSelected"
        @update:invoice="selectInvoice"
        @update:freeTable="freeTable"
      >
        <template v-slot:header>
          <q-space />
          <q-btn rounded color="negative" label="Cerrar" @click="dialogTable = false"/>
          <q-btn rounded color="primary" label="Aceptar" @click="dialogTable = false"/>
        </template>
      </drawer-table>
    </q-dialog>
    <q-dialog v-model="searchInvoice">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="q-py-sm bg-primary text-white flex justify-between items-center">
          <span class="text-h6">Buscar factura</span>
          <q-btn flat icon="close" round size="md" v-close-popup/>
        </q-card-section>
        <q-card-section>
          <q-form @submit="getInvoiceOne(search)" class="row full-width items-center">
            <div class="col-10">
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
              />
            </div>
            <div class="col-auto text-right">
              <q-btn type="submit" color="primary" icon="search" size="lg" :loading="loadingSearch"/>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Cash Box Dialog -->
    <CashBoxDialog
      v-model="showCashBoxDialog"
      :cashier-id="userSession?.id"
      :is-box-already-open="isUserBoxOpen"
      :available-cash-boxes="availableCashBoxes"
      :branch-office="branchOffice"
      @box-opened="handleBoxOpened"
      @box-closed="handleBoxClosed"
      @box-created="loadAvailableCashBoxes"
    />

    <!-- Cashflow Modal Component -->
    <CashflowModal
      v-model="cashflow"
      :payment-methods="paymentMethods"
      :cash-box-state="cashBoxState"
      :branch-office="branchOffice"
      :flow-type-options="[
        { label: 'Entrada', value: 'debit' },
        { label: 'Salida', value: 'credit' },
        { label: 'Arqueo', value: 'withdrawal' }
      ]"
    />

    <q-dialog v-model="openAddClient" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveClient">
          <!-- Header con estilo naranja -->
          <q-card-section class="row items-center text-white bg-primary">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeAddClientModal" />
          </q-card-section>

          <!-- Body con tema oscuro -->
          <q-card-section class="row q-col-gutter-sm">
            <!-- Nombre - Campo principal con asterisco rojo -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.name"
                label="Nombre *"
                :rules="[val => !!val || 'El campo es requerido.']"
                autofocus
              />
            </div>

            <!-- Información adicional -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 text-grey-7 q-mt-sm">
              Información adicional (opcional)
            </div>

            <!-- Fila 1: Tipo de documento y Número -->
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-select
                filled
                use-input
                label="Tipo de documento"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="clientAdded.document_type"
                :options="documentTypes"
                @filter="getDocumentTypes"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.document_number"
                label="Número de documento"
              />
            </div>

            <!-- Fila 2: Correo y Teléfono -->
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.phone_number"
                label="Teléfono"
              />
            </div>

            <!-- Condición de IVA -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                filled
                use-input
                label="Condición de IVA"
                input-debounce="0"
                option-label="name"
                option-value="code"
                v-model="clientAdded.condition_iva_receptor"
                :options="conditionIvaReceptors"
                @filter="getConditionIvaReceptor"
              />
            </div>

            <!-- Checkbox cuenta corriente -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-checkbox
                v-model="clientAdded.is_credit"
                label="¿Maneja cuenta corriente?"
              />
            </div>

            <!-- Sección de Dirección - MANTENER IGUAL -->
            <div class="col-12">
              <AddressComponent
                :key="addressComponentKey"
                :initial-address="address"
                @address-selected="handleAddressSelectedForClient"
              />
            </div>
          </q-card-section>

          <!-- Botón guardar -->
          <q-card-actions align="right" class="text-primary">
            <q-btn
              icon="save"
              color="primary"
              label="GUARDAR"
              type="submit"
              :loading="loadingClient"
            />
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
            <div class="text-subtitle1 text-center">
              {{  productQuantity.name }} x {{ productQuantity.unit_of_measure.acronym }}
            </div>
          </q-card-section>
          <q-card-section class="flex q-col-gutter-sm justify-between items-center">
            <q-input
              filled
              v-model.number="quantity"
              :model-value="Number(quantity).toFixed(3)"
              label="Cantidad"
              type="number"
              style="width: 50%;"
              @focus="e => e.target.select()"
              @update:model-value="updateValues('quantity')"
            />
            <q-input
              filled
              v-model.number="currentAmount"
              :model-value="Number(currentAmount).toFixed(2)"
              label="Importe"
              type="number"
              style="width: 50%;"
              autofocus
              @focus="e => e.target.select()"
              @update:model-value="updateValues('currentAmount')"
            />
          </q-card-section>
          <q-card-section class="q-pt-xs">
            <div class="text-subtitle1 text-center text-weight-bold">
              Precio por unidad = {{ formatNumber(productQuantity.price) }}
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
      :invoice="setModelInvoice()"
      @paymentSuccess="paymentSuccess"
    />
    <TransferMpDialog
      v-if="currentPayment"
      :payment="currentPayment"
      :show-modal="showDetailsModal"
    />
    <BarcodeScanner @barcode-scanned="processBarcode" v-if="scanner" />
  </q-page>
</template>

<script>
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
import { Notify } from 'quasar'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatDate, formatNumber, loading, notify, BALANZA_PREFIXES } from 'src/const/mixins'
import eventBus from 'src/utils/eventBus'
import DrawerTable from 'src/components/Table/DrawerTable.vue'
import WaitByPaymentMp from 'src/components/Billing/WaitByPaymentMp.vue'
import { apiArca } from 'src/boot/axios'
import { useCommandStore } from 'src/stores/command'
import { usePaymentNotifier } from 'src/boot/payment-notifier'
import { commandPrint, ticketPrint } from 'src/const/printers'
import TransferMpDialog from 'src/components/Billing/TransferMpDialog.vue'
import BarcodeScanner from 'src/components/Billing/ScannerComponent.vue'
import PaymentModal from 'src/components/PaymentModal.vue'
import CashBoxDialog from 'src/components/Billing/CashBoxDialog.vue'
import CashflowModal from 'src/components/CashflowModal.vue'
import FileComponent from 'src/components/FileComponent.vue'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner'

export default {
  name: 'BillingPage',
  components: {
    AddressComponent,
    DrawerTable,
    PaymentModal,
    WaitByPaymentMp,
    BarcodeScanner,
    CashBoxDialog,
    TransferMpDialog,
    CashflowModal,
    FileComponent
  },
  data () {
    return {
      // Tour System
      showTour: false,
      currentTourStep: 0,
      tourSteps: [
        {
          target: '#select-client',
          title: '👤 Seleccionar Cliente',
          description: 'Aquí seleccionas el cliente para la factura. Puedes buscar por nombre o documento, o agregar un nuevo cliente con el botón +.'
        },
        {
          target: '#tour-tipo-factura',
          title: '🧾 Tipo de Factura',
          description: 'Selecciona el tipo de factura: Venta, Nota de crédito, etc. Este campo determina el tipo de documento que se generará.'
        },
        {
          target: '#tour-type-service',
          title: '🍽️ Tipo de Servicio',
          description: 'Selecciona el tipo de servicio: Mesa, Para llevar, Delivery, etc. Esto ayuda a organizar tus ventas.'
        },
        {
          target: '#tour-barcode',
          title: '🔍 Código de Barras',
          description: 'Escanea o escribe el código de barras del producto. Presiona Enter para agregarlo automáticamente a la lista.'
        },
        {
          target: '#tour-products-table',
          title: '📦 Lista de Artículos',
          description: 'Aquí aparecen todos los productos agregados. Puedes editar cantidades, precios, y eliminar productos desde esta tabla.'
        },
        {
          target: '#tour-descripcion',
          title: '📝 Descripción',
          description: 'Agrega notas o comentarios adicionales sobre la factura. Este campo es opcional pero útil para detalles especiales.'
        },
        {
          target: '#tour-btn-cobrar',
          title: '💰 Botón Cobrar (F1)',
          description: 'Presiona este botón para abrir el diálogo de pago y procesar el cobro. También puedes usar la tecla F1.'
        },
        {
          target: '#tour-btn-mesas',
          title: '🪑 Botón Mesas (F10)',
          description: 'Administra las mesas del restaurante. Asigna pedidos a mesas específicas y controla su estado. Atajo: F10.'
        },
        {
          target: '#tour-btn-cashflow',
          title: '💵 Entrada/Salida de Dinero (F11)',
          description: 'Registra entradas y salidas de dinero en efectivo. Útil para gastos, retiros o ingresos adicionales. Atajo: F11.'
        },
        {
          target: '#tour-btn-buscar',
          title: '🔎 Buscar Factura (F12)',
          description: 'Busca facturas anteriores por número, cliente o fecha. Útil para consultas y reimpresiones. Atajo: F12.'
        },
        {
          target: '#tour-btn-borrar',
          title: '🗑️ Borrar Factura',
          description: 'Limpia todos los productos y datos de la factura actual. Úsalo para empezar una nueva factura desde cero.'
        },
        {
          target: '#tour-select-categoria',
          title: '🏷️ Filtro de Categorías',
          description: 'Filtra los productos por categoría para encontrarlos más rápido. Selecciona una categoría o déjalo vacío para ver todos.'
        },
        {
          target: '#tour-input-buscar-producto',
          title: '🔍 Buscar Producto',
          description: 'Busca productos por nombre o código. Escribe para filtrar la lista de productos disponibles en tiempo real.'
        },
        {
          target: '#tour-seccion-productos',
          title: '🛍️ Sección de Productos',
          description: 'Aquí se muestran todos los productos disponibles. Haz click en un producto para agregarlo a la factura.'
        }
      ],
      spotlightStyle: {},
      tourCardStyle: {},

      currentCashierSession: null,

      scanner: false,

      // Cash Box System
      showCashBoxDialog: false,
      isUserBoxOpen: false,
      availableCashBoxes: [],
      cashBoxState: null,
      /**
       * Show payment details modal
       * @type {Boolean}
       */
      showDetailsModal: false,
      isDragOver: false,
      /**
       * Current payment
       * @type {Object}
       */
      currentPayment: {},
      /**
       * Partial billing
       * @type {Boolean}
       */
      partialBilling: false,
      /**
       * Selected price list
       * @type {Object}
       */
      selectedPriceList: null,
      /**
       * Price input type
       * @type {String}
       */
      priceInputType: 'list',
      /**
       * Waiting payment
       * @type {Boolean}
       */
      waitingPayment: false,
      /**
       * Loading billing
       * @type {Boolean}
       */
      loadingBilling: false,
      /**
       * Loading search
       * @type {Boolean}
       */
      loadingSearch: false,
      /**
       * Invoice share
       * @type {Object}
       */
      invoiceShare: {},
      /**
       * Debounce timer for invoice share
       * @type {Number|null}
       */
      invoiceShareDebounceTimer: null,
      /**
       * Document types
       * @type {Array}
       */
      documentTypes: [],
      /**
       * Invoice printer
       * @type {Boolean}
       */
      invoicePrinter: false,
      /**
       * Open cash box
       * @type {Boolean}
       */
      openCashBox: false,
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
       * Selected product index for keyboard navigation
       * @type {Number}
       */
      selectedProductIndex: -1,
      /**
       * Is keyboard navigation active
       * @type {Boolean}
       */
      keyboardNavigationActive: false,
      /**
       * Current amount
       * @type {Number}
       */
      currentAmount: 0,
      balanceCode: 0,
      /**
       * Invoice description
       * @type {String}
       */
      invoiceDescription: '',
      /**
       * Cashflow dialog
       * @type {Boolean}
       */
      cashflow: false,
      /**
       * Invoice created at (custom date)
       * @type {String}
       */
      invoiceCreatedAt: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      /**
       * Delivery date
       * @type {String}
       */
      deliveryDate: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      /**
       * Delivery address
       * @type {Object}
       */
      deliveryAddress: {
        name: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        latitude: null,
        longitude: null,
        formattedAddress: '',
        placeId: '',
        types: []
      },
      /**
       * Format number
       * @type {Function}
       */
      formatNumber,
      /**
       * Search invoice
       * @type {Boolean}
       */
      searchInvoice: false,
      /**
       * Address component key
       * @type {Number}
       */
      addressComponentKey: 0,
      /**
       * Address
       * @type {Object}
       */
      address: null,
      /**
       * Formatted address
       * @type {String}
       */
      formattedAddress: '',
      /**
       * Search
       * @type {String}
       */
      search: '',
      /**
       * Loading save client
       * @type {Boolean}
       */
      loadingClient: false,
      /**
       * Open add client
       * @type {Boolean}
       */
      openAddClient: false,
      /**
       * Client added data form
       * @type {Object}
       */
      clientAdded: {
        is_credit: false
      },
      /**
       * Invoice data
       * @type {Object}
       */
      invoice: null,
      /**
       * Status table
       * @type {Object}
       */
      statusTable: {
        unoccupied: 'Libre',
        busy: 'Ocupada'
      },
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
       * Promo selection dialog
       * @type {Boolean}
       */
      promoDialog: false,
      /**
       * Current promo being configured
       * @type {Object}
       */
      currentPromo: null,
      /**
       * Current group index in promo selection
       * @type {Number}
       */
      currentGroupIndex: 0,
      /**
       * Selected products for current promo
       * @type {Array}
       */
      promoSelections: [],
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
      clients: [],
      /**
       * Client to billing
       * @type {Object}
       */
      client: null,
      /**
       * Table selected
       * @type {Array}
       */
      tableSelected: [],
      /**
       * Dialog table
       * @type {Boolean}
       */
      dialogTable: false,
      /**
       * Exchange
       * @type {Boolean}
       */
      exchange: false,
      /**
       * Scan dialog
       * @type {Boolean}
       */
      modelScan: false,
      /**
       * Tables
       * @type {Array}
       */
      tables: [],
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
       * Channel
       * @type {Object}
       */
      channel: null,
      /**
       * Table close
       * @type {Boolean}
       */
      tableClose: false,
      /**
       * Without payment
       * @type {Array}
       */
      withoutPayment: ['T', 'P', 'CC'],

      withServiceType: [4],
      /**
       * Dialog scanner
       * @type {Boolean}
       */
      dialogScanner: false,
      /**
       * Without print
       * @type {Boolean}
       */
      withoutPrint: false,
      /**
       * Invoice files (attachments)
       * @type {Array}
       */
      invoiceFiles: [],
      /**
       * Drag over state for invoice files
       * @type {Boolean}
       */
      isDragOverInvoice: false,
      /**
       * Deleted invoice files
       * @type {Array}
       */
      deletedInvoiceFiles: [],
      /**
       * Loading living room
       * @type {Boolean}
       */
      loadingLivingRoom: false,
      /**
       * Products list
       * @type {Array}
       */
      products: [],
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
       * Exchange rate
       * @type {Object}
       */
      exchangeRate: null,
      /**
       * Loading products
       * @type {Boolean}
       */
      loadingProducts: false,
      /**
       * Company config
       * @type {Object}
       */
      companyConfig: {},
      /**
       * Products columns
       * @type {Array}
       * @deprecated Ya no se usa - Removido q-table, ahora se usa grid directo con v-for
       */
      /* COMENTADO - Ya no necesario después de implementar scroll infinito
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
          name: 'price',
          align: 'right',
          label: 'Precio',
          field: 'price',
          sortable: true
        }
      ],
      */ // FIN COMENTADO - productColumns obsoleto
      voucherTypes: [],
      /**
       * Voucher type
       * @type {Object}
       */
      voucherType: null,
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
        { name: 'price', align: 'right', label: 'Precio de venta', field: 'price', sortable: true },
        { name: 'quantity', align: 'right', label: 'Cantidad', field: 'quantity', sortable: true },
        { name: 'subtotal', align: 'right', label: 'Importe', field: 'subtotal', sortable: true },
        { name: 'actions', align: 'right', label: 'Acciones', field: 'actions' }
      ]
    }
  },
  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice']),
    branchOfficeCharged () {
      return this.branchOffice
    },
    currentGroup () {
      return this.currentPromo?.promotion_details?.[this.currentGroupIndex]
    },
    pendingPayment () {
      const totalPayments = this.payments.reduce((total, payment) => {
        return total + ((payment.amount - (payment.discount_amount || 0)) || 0)
      }, 0)
      return this.totalBill - totalPayments
    },
    /**
     * Calcula cuántos skeletons mostrar para llenar espacios vacíos en el grid
     */
    skeletonCount () {
      // Si no hay productos, mostrar 12 skeletons (carga inicial)
      if (this.allProducts.length === 0) {
        return 12
      }

      // Detectar productos por fila según breakpoint (basado en col-xs-4, col-md-3, col-lg-2)
      let productsPerRow = 6 // Default: col-lg-2 y col-xl-2 = 12/2 = 6

      if (this.$q.screen.xs || this.$q.screen.sm) {
        productsPerRow = 3 // col-xs-4 y col-sm-4 = 12/4 = 3
      } else if (this.$q.screen.md) {
        productsPerRow = 4 // col-md-3 = 12/3 = 4
      }

      // Calcular cuántos espacios vacíos quedan en la última fila
      const emptySpaces = productsPerRow - (this.allProducts.length % productsPerRow)

      // Si emptySpaces es igual a productsPerRow, significa que la última fila está completa
      return emptySpaces === productsPerRow ? productsPerRow : emptySpaces
    },
    ...mapState(authentication, ['userSession', 'branchOffice']),
    ...mapState(useCommandStore, ['setInvoice'])
  },
  watch: {
    client (client) {
      this.invoiceShare = { ...this.invoiceShare, client }
      // Actualizar la dirección cuando se selecciona un cliente
      if (client && client.address) {
        this.formattedAddress = client.address
        this.address = client.address
      } else {
        this.formattedAddress = ''
        this.address = null
      }
    },
    invoiceType (invoiceType) {
      this.invoiceShare = { ...this.invoiceShare, invoiceType }
    },
    typeOfService (typeOfService) {
      this.invoiceShare = { ...this.invoiceShare, typeOfService }
    },
    totalBill (totalBill) {
      this.invoiceShare = { ...this.invoiceShare, totalBill }
    },
    totalPayment (totalPayment) {
      this.invoiceShare = { ...this.invoiceShare, totalPayment }
    },
    products (products) {
      // Debounce solo para productos (500ms)
      if (this.invoiceShareDebounceTimer) {
        clearTimeout(this.invoiceShareDebounceTimer)
      }

      this.invoiceShareDebounceTimer = setTimeout(() => {
        this.invoiceShare = {
          ...this.invoiceShare,
          totalBill: this.totalBill,
          totalPayment: this.totalPayment,
          products
        }
      }, 500)
    },
    payments: {
      handler (payments) {
        this.$forceUpdate()
        // Sin debounce - inmediato para pagos
        this.invoiceShare = { ...this.invoiceShare, payments }
      },
      deep: true
    },
    invoiceShare (data) {
      // Enviar inmediatamente sin debounce adicional
      this.sendInvoiceUpdate(data)
    },
    quantityDialog (data) {
      if (!data) {
        this.quantity = 1
        this.currentAmount = 0
      }
    },
    category () {
      this.reloadProducts()
    },
    filter () {
      this.reloadProducts()
    },
    branchOffice (data) {
      if (data) {
        this.reloadProducts()
      }
    }
  },
  mounted () {
    /**
     * Get products with pagination
     */
    this.reloadProducts()

    /**
     * Check if should show tour (only once after company creation)
     */
    this.checkAndStartTour()

    /**
     * Listen for tour activation from navbar
     */
    eventBus.on('activate-page-tour', (pageName) => {
      if (pageName === 'Billing') {
        this.startTour()
      }
    })

    /**
     * Init keywords button
     */
    document.addEventListener('click', this.handleOutsideClick)
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'F1':
          e.preventDefault()
          if (this.products.length > 0) {
            this.dialogPayment = true
          } else {
            notify('No hay productos seleccionados', 'negative', 'warning')
          }
          break
        case 'F7':
          e.preventDefault()
          this.savePrintInvoice()
          break
        case 'F8':
          e.preventDefault()
          this.submitBill()
          break
        case 'F9':
          e.preventDefault()
          this.saveWithoutPrint()
          break
        case 'F10':
          e.preventDefault()
          this.dialogTable = !this.dialogTable
          break
        case 'F11':
          e.preventDefault()
          this.cashflow = !this.cashflow
          break
        case 'F12':
          e.preventDefault()
          this.searchInvoice = !this.searchInvoice
          break
      }
    })
  },
  beforeUnmount () {
    document.removeEventListener('click', this.handleOutsideClick)
    window.removeEventListener('keydown', () => {
      this.dialogPayment = true
    })
    // Limpiar el timer de debounce si existe
    if (this.invoiceShareDebounceTimer) {
      clearTimeout(this.invoiceShareDebounceTimer)
    }
  },
  created () {
    this.getLocalStorage()
    this.getPaymentMethods()
    this.listenPayments()
    this.getExchangeRates()
    this.checkCashBoxStatus()
    if (this.$route?.query?.id) this.getInvoiceOne(this.$route.query.id)
  },
  methods: {
    /**
     * Check and start tour if needed
     */
    checkAndStartTour () {
      const hasSeenBillingTour = localStorage.getItem('has_seen_billing_tour')
      const needsTour = localStorage.getItem('needs_billing_tour')
      const hasVisitedBilling = sessionStorage.getItem('has_visited_billing')

      // Mostrar tour si:
      // 1. Se marcó que necesita tour (después de crear empresa)
      // 2. O es la primera vez que visita la página en esta sesión y nunca ha visto el tour
      if ((needsTour === 'true' && !hasSeenBillingTour) || (!hasVisitedBilling && !hasSeenBillingTour)) {
        // Marcar que ya visitó la página en esta sesión
        sessionStorage.setItem('has_visited_billing', 'true')

        // Esperar a que el DOM esté completamente renderizado
        this.$nextTick(() => {
          setTimeout(() => {
            this.startTour()
          }, 500)
        })
      } else {
        // Marcar que ya visitó la página en esta sesión
        sessionStorage.setItem('has_visited_billing', 'true')
      }
    },

    /**
     * Start tour
     */
    startTour () {
      this.showTour = true
      this.currentTourStep = 0
      this.updateTourPosition()
    },

    /**
     * Next tour step
     */
    nextTourStep () {
      if (this.currentTourStep < this.tourSteps.length - 1) {
        this.currentTourStep++
        this.updateTourPosition()
      } else {
        this.finishTour()
      }
    },

    /**
     * Previous tour step
     */
    previousTourStep () {
      if (this.currentTourStep > 0) {
        this.currentTourStep--
        this.updateTourPosition()
      }
    },

    /**
     * Skip tour
     */
    skipTour () {
      this.finishTour()
    },

    /**
     * Finish tour
     */
    finishTour () {
      this.showTour = false
      localStorage.setItem('has_seen_billing_tour', 'true')
      localStorage.removeItem('needs_billing_tour')
      this.$q.notify({
        message: '¡Tour completado! Ya puedes comenzar a facturar',
        color: 'positive',
        icon: 'check_circle'
      })
    },

    /**
     * Update tour position
     */
    updateTourPosition () {
      this.$nextTick(() => {
        const step = this.tourSteps[this.currentTourStep]
        const element = document.querySelector(step.target)

        if (element) {
          // Scroll to element first
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

          // Wait for scroll to finish before calculating positions
          setTimeout(() => {
            const rect = element.getBoundingClientRect()
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

            // Update spotlight position
            this.spotlightStyle = {
              top: `${rect.top + scrollTop - 10}px`,
              left: `${rect.left + scrollLeft - 10}px`,
              width: `${rect.width + 20}px`,
              height: `${rect.height + 20}px`
            }

            // Position tour card with better logic
            const cardWidth = 400
            const cardHeight = 280
            const padding = 20
            const viewportHeight = window.innerHeight
            const viewportWidth = window.innerWidth

            let cardTop = rect.top + scrollTop
            let cardLeft = rect.left + scrollLeft

            // Detectar si es la sección de productos o categorías/búsqueda
            const isProductSection = step.target === '#tour-seccion-productos' ||
                                    step.target === '#tour-select-categoria' ||
                                    step.target === '#tour-input-buscar-producto'

            if (isProductSection) {
              // Para sección de productos, posicionar a la IZQUIERDA del elemento
              // Calcular posición: elemento.left - ancho del card - espacio
              const spaceFromElement = 30 // Espacio entre el card y el elemento
              cardLeft = rect.left + scrollLeft - cardWidth - spaceFromElement

              // Si no cabe a la izquierda, posicionar en el borde izquierdo con margen
              if (cardLeft < padding) {
                cardLeft = padding
              }

              // Centrar verticalmente con el elemento
              cardTop = rect.top + scrollTop + (rect.height / 2) - (cardHeight / 2)
            } else {
              // Para otros elementos, posicionar DEBAJO
              cardTop = rect.bottom + scrollTop + padding

              // If card goes below viewport, position it above the element
              if (rect.bottom + cardHeight + padding > viewportHeight) {
                cardTop = rect.top + scrollTop - cardHeight - padding
              }

              // If still goes above viewport, position it in the middle
              if (cardTop < scrollTop) {
                cardTop = scrollTop + (viewportHeight - cardHeight) / 2
              }
            }

            // Adjust horizontal position
            if (cardLeft + cardWidth > viewportWidth) {
              cardLeft = viewportWidth - cardWidth - padding
            }
            if (cardLeft < 0) {
              cardLeft = padding
            }

            // Adjust vertical position to keep in viewport
            if (cardTop + cardHeight > scrollTop + viewportHeight) {
              cardTop = scrollTop + viewportHeight - cardHeight - padding
            }
            if (cardTop < scrollTop) {
              cardTop = scrollTop + padding
            }

            this.tourCardStyle = {
              top: `${cardTop}px`,
              left: `${cardLeft}px`
            }
          }, 300)
        }
      })
    },

    async getExchangeRates () {
      try {
        const { data } = await this.$api.get('exchange-rates', {
          params: {
            sortOrder: 'desc',
            sortBy: 'id',
            paginate: true,
            perPage: 1,
            page: 1
          }
        })
        this.exchangeRate = data?.data?.[0]
      } catch (error) {
        console.error('Error getting exchange rates:', error)
      }
    },
    /**
     * Send invoice update to details screen
     * @param {Object} data - Invoice data
     * @returns {Promise<void>}
     */
    async sendInvoiceUpdate (data) {
      try {
        // Preparar datos optimizados para la pantalla de detalles
        const optimizedInvoice = {
          client: {
            name: data.client?.name || 'Cliente no especificado'
          },
          products: (data.products || []).map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            amount: product.amount || product.quantity || 1,
            subtotal: product.subtotal
          })),
          totalBill: data.totalBill || 0,
          payments: (data.payments || []).map(payment => ({
            name: payment.name || payment.payment_method?.name || 'Método de pago',
            amount: payment.amount || 0
          }))
        }

        // Enviar via backend
        await this.$api.post('invoice-details-event', {
          invoice: optimizedInvoice,
          user_id: this.userSession.id
        })
      } catch (error) {
        console.error('Error sending invoice update:', error)
      }
    },
    setPermissionsByUser (data) {
      return this.userSession.roles.some(role => data.includes(role.acronym))
    },
    /**
     * Handle address selection from AddressComponent
     * @param {Object} address - Selected address object
     */
    onAddressSelected (address) {
      this.deliveryAddress = address || {
        name: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        latitude: null,
        longitude: null,
        formattedAddress: '',
        placeId: '',
        types: []
      }
    },
    /**
     * Select a product by index for keyboard navigation
     * @param {Number} index - Product index
     */
    selectProduct (index) {
      this.selectedProductIndex = index
      this.keyboardNavigationActive = true
      // Focus the table to ensure keyboard events are captured
      this.$nextTick(() => {
        if (this.$refs.productsTable && this.$refs.productsTable.$el) {
          this.$refs.productsTable.$el.focus()
        }
      })
    },
    /**
     * Move to next product (TAB key)
     */
    moveToNextProduct () {
      if (this.products.length === 0) return

      if (this.selectedProductIndex < this.products.length - 1) {
        this.selectedProductIndex++
      } else {
        this.selectedProductIndex = 0
      }
    },
    /**
     * Move to previous product (Shift+TAB)
     */
    moveToPreviousProduct () {
      if (this.products.length === 0) return

      if (this.selectedProductIndex > 0) {
        this.selectedProductIndex--
      } else {
        this.selectedProductIndex = this.products.length - 1
      }
    },
    /**
     * Increase quantity of selected product
     */
    increaseSelectedProductQuantity () {
      if (this.selectedProductIndex >= 0 && this.products[this.selectedProductIndex]) {
        const product = this.products[this.selectedProductIndex]
        product.quantity = (product.quantity || 1) + 1
        this.calculate(product)
      }
    },
    /**
     * Decrease quantity of selected product
     */
    decreaseSelectedProductQuantity () {
      if (this.selectedProductIndex >= 0 && this.products[this.selectedProductIndex]) {
        const product = this.products[this.selectedProductIndex]
        if (product.quantity > 1) {
          product.quantity = (product.quantity || 1) - 1
          this.calculate(product)
        }
      }
    },
    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} event
     */
    handleKeyboardNavigation (event) {
      if (!this.keyboardNavigationActive || this.products.length === 0) return

      switch (event.key) {
        case 'Tab':
          event.preventDefault()
          if (event.shiftKey) {
            this.moveToPreviousProduct()
          } else {
            this.moveToNextProduct()
          }
          break
        case 'ArrowUp':
        case '+':
          event.preventDefault()
          this.increaseSelectedProductQuantity()
          break
        case 'ArrowDown':
        case '-':
          event.preventDefault()
          this.decreaseSelectedProductQuantity()
          break
        case 'Escape':
          event.preventDefault()
          this.selectedProductIndex = -1
          this.keyboardNavigationActive = false
          break
      }
    },
    /**
     * Reset product selection when products array changes
     */
    resetProductSelection () {
      // Always reset selection when products array changes to avoid index conflicts
      this.selectedProductIndex = -1
      this.keyboardNavigationActive = false
    },
    /**
     * Auto-select the last added product in the cart
     * Reusable function for keyboard navigation enhancement
     */
    selectLastAddedProduct () {
      this.$nextTick(() => {
        const newProductIndex = this.products.length - 1
        if (newProductIndex >= 0) {
          this.selectProduct(newProductIndex)
        }
      })
    },
    /**
     * Deselect product when clicking outside table
     * @param {Event} event
     */
    handleOutsideClick (event) {
      const tableElement = this.$refs.productsTable?.$el
      const productsSection = this.$refs.productsSection
      const promoModal = this.$refs.promoModal?.$el || this.$refs.promoModal

      // Check if click is outside both table and products section
      const isOutsideTable = tableElement && !tableElement.contains(event.target)
      const isOutsideProductsSection = productsSection && !productsSection.contains(event.target)
      const isOutsidePromoModal = !promoModal || !promoModal.contains(event.target)

      // Also check if promo dialog is open
      const isPromoDialogOpen = this.promoDialog

      if (isOutsideTable && isOutsideProductsSection && isOutsidePromoModal && !isPromoDialogOpen) {
        this.selectedProductIndex = -1
        this.keyboardNavigationActive = false
      }
    },
    listenPayments () {
      if (this.branchOffice) {
        const { company_session: companySession } = this.userSession
        if (companySession?.company_config?.other?.qpay_id) {
          const channel = this.$echoPay.channel('mercado-pago-payment')
          channel.listen(`.mercado-pago-payment.${companySession.company_config.other.qpay_id}.${this.branchOffice.id}`, (data) => {
            const paymentNotifier = usePaymentNotifier()
            paymentNotifier.showPaymentNotification(data.payment)
            this.showDetailsModal = paymentNotifier.showDetailsModal
            this.currentPayment = paymentNotifier.currentPayment
          })
        }
      }
    },
    handleClick (event) {
      const clickedElement = event.target

      if (
        clickedElement.closest('.product-card') ||
        clickedElement.closest('table') ||
        clickedElement.closest('button') ||
        clickedElement.closest('input') ||
        clickedElement.closest('textarea') ||
        clickedElement.closest('.q-field')
      ) {
        return
      }

      // Si no, enfocar el input principal
      this.$refs?.barcode?.focus()
    },
    /**
     * Start scanner
     */
    async startScanner () {
      try {
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
        this.startScanner()
      } catch (error) {
        if (error instanceof Error) {
          // notify(error.message, 'negative', 'warning')
        } else {
          notify('Error al escanear el código', 'negative', 'warning')
        }
      }
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getVoucherTypes (value, update) {
      try {
        const { data } = await apiArca.get('metadata/voucher-types', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.voucherTypes = data
        })
      } catch (err) {
        notify(err.message, 'negative', 'warning')
      }
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getConditionIvaReceptor (value, update) {
      try {
        const { data } = await apiArca.get('metadata/condition-iva-receptors', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.conditionIvaReceptors = data
        })
      } catch (err) {
        notify('A ocurrido un error con la conexión con el ARCA', 'negative', 'warning')
      }
    },
    /**
     * Select category
     * @param {String} value user Session Value filter
     * @param {Callback} update update options
     */
    async getDocumentTypes (value, update) {
      try {
        const { data } = await apiArca.get('metadata/document-types', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.documentTypes = data
        })
      } catch (err) {
        notify('A ocurrido un error con la conexión con el ARCA', 'negative', 'warning')
      }
    },
    /**
     * Update values
     * @param {String} inputName input name
     */
    updateValues (inputName) {
      if (inputName === 'quantity') {
        this.currentAmount = this.roundToFourDecimals(this.quantity * this.productQuantity.price)
      } else if (inputName === 'currentAmount') {
        this.quantity = this.roundToFourDecimals(this.currentAmount / this.productQuantity.price)
      }
    },
    /**
     * Round to four decimals
     * @param {Number} number number
     * @returns {Number}
     */
    roundToFourDecimals (number) {
      const factor = Math.pow(10, 10)
      return Math.floor(number * factor) / factor
    },
    /**
     * Get one product
     * @param {Number} barcode barcode product
     * @returns {Promise<void>}
     */
    async processBarcode (barcode) {
      try {
        if (!barcode || typeof barcode !== 'string' || barcode.length < 13) {
          this.getOneProduct(barcode)
          return
        }

        // Si tienes prefijo configurado:
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
          // Posiciones dinámicas
          const pluStart = prefixLength
          const pluEnd = pluStart + 4
          const variableStart = pluEnd

          const pluRaw = barcode.substring(pluStart, pluEnd)
          const variablePart = barcode.substring(variableStart, 12)

          const plu = parseInt(pluRaw, 10).toString() // quita ceros a la izquierda

          if (!/^\d+$/.test(variablePart)) {
            notify('Formato inválido en importe/peso', 'negative', 'warning')
            this.getOneProduct(barcode)
            return
          }

          // Buscar producto por PLU real
          const product = await this.getProduct(plu)
          if (!product) {
            notify('Producto no encontrado', 'negative', 'warning')
            this.getOneProduct(barcode)
            return
          }

          const importe = parseInt(variablePart, 10) / 1000

          if (isNaN(importe) || importe <= 0) {
            notify('Importe inválido', 'negative', 'warning')
            this.getOneProduct(barcode)
            return
          }

          this.quantity = importe

          this.validateProduct(product, false)

          this.barcode = null
          return
        }

        // No es balanza
        this.getOneProduct(barcode)
      } catch (error) {
        console.error('Error procesando código de balanza:', error)
        notify('Error procesando producto', 'negative', 'warning')
        this.getOneProduct(barcode)
      }
    },
    /**
     * Recarga productos desde página 1 (usado por watchers y cambios de filtros)
     * Reemplaza el antiguo setPagination con una API más simple
     */
    reloadProducts () {
      console.log('🔄 Recargando productos desde página 1')

      // Actualizar objeto pagination para resetear a página 1
      this.pagination = {
        ...this.pagination,
        page: 1
      }

      const params = {
        sortOrder: 'desc',
        sortBy: 'sold',
        page: 1, // Siempre página 1 para recargas
        perPage: this.pagination.rowsPerPage,
        paginate: true,
        dataSearch: {
          name: this.filter,
          'category.name': this.filter,
          barcode: this.filter
        }
      }

      // false = carga inicial (reemplaza productos, no append)
      this.getAllProducts(params, false)
    },
    /**
     * Set table selected
     * @param {Object} data table selected
     */
    setTableSelected (data) {
      this.tableSelected = data
    },
    /**
     * Save clients
     */
    saveClient () {
      this.loadingClient = true
      this.$api.post('clients', this.clientAdded)
        .then(({ data }) => {
          this.closeAddClientModal()
          this.client = data
          this.loadingClient = false
          Notify.create({
            message: 'Cliente creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingClient = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
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
     * Handle payment modal events
     */
    handlePaymentUpdate ({ payment, payments }) {
      this.payments = payments
    },
    handlePaymentDelete ({ payments }) {
      this.payments = payments
    },
    handlePaymentCheck ({ payment, index }) {
      // Handle payment check if needed
    },
    handleQRPayment (payment) {
      this.waitingPayment = true
    },
    handlePaymentAction ({ action, params, payments, tableClose }) {
      this.payments = payments
      // tableClose is now handled internally by PaymentModal
      switch (action) {
        case 'invoice':
          this.savePrintInvoice()
          break
        case 'command':
          this.submitBill()
          break
        case 'save':
          this.saveWithoutPrint()
          break
      }
    },
    /**
     * Save without print
     */
    saveWithoutPrint () {
      this.withoutPrint = true
      this.$refs.saveBill.submit()
    },
    /**
     * Save print invoice
     */
    savePrintInvoice () {
      this.invoicePrinter = true
      this.$refs.saveBill.submit()
    },
    /**
     * Submit bill
     */
    submitBill () {
      this.$refs.saveBill.submit()
    },
    /**
     * Model product
     * @param {Object} data product
     */
    modelData (data, put = false) {
      const formData = new FormData()
      if (put) {
        formData.append('_method', 'put')
      }
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key]
          // Processing form data element
          if (typeof element !== 'object' && element) {
            formData.append(key, element)
          }
        }
      }

      data.images.forEach((element, index) => {
        formData.append(`images[${index}]`, element.image)
      })

      return formData
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
          branch_office_id: this.branchOffice?.id,
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
    filterClients (value, update) {
      this.$api.get('clients', {
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
            this.clients = data
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
     * Free table
     * @param {Object} table  table data
     */
    async selectInvoice (table) {
      // Selecting invoice from table

      loading(true)
      const invoiceOne = table.invoices[0]
      await this.getInvoiceOne(invoiceOne.id)
      this.dialogTable = false
      loading(false)

      // Invoice loaded from table
    },
    /**
     * Free table
     * @param {Object} table  table data
     */
    async freeTable (table) {
      // Freeing table

      try {
        await this.selectInvoice(table)
        this.tableClose = true

        // Table close activated

        setTimeout(() => {
          this.dialogPayment = true
          // Payment dialog opened for table close
        }, 200)
      } catch (error) {
        // Error freeing table
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get all tables
     */
    getTables (data) {
      this.$api.get('tables', {
        params: {
          dataEqualFilter: {
            living_room_id: data.id
          },
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.tables = data
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
     * Get all products
     * @param {Object} params params to search
     */
    getAllProducts (params, append = false) {
      this.loadingProducts = true

      console.log(`${append ? '➕' : '🔄'} ${append ? 'Agregando' : 'Cargando'} productos:`, {
        pagina: params.page,
        porPagina: params.perPage,
        append
      })

      this.$api.get('products', {
        params: {
          ...params,
          branch_office_id: this.branchOffice?.id,
          stock: true,
          withStock: true,
          dataEqualFilter: {
            category_id: this.category ? this.category.id : null
          }
        }
      })
        .then(({ data }) => {
          const newProducts = data.data.map(product => ({
            ...product,
            product_price_lists: [
              ...(product.product_price_lists || []),
              {
                name: 'Precio base',
                price: product.price
              }
            ]
          }))

          const prevCount = this.allProducts.length

          if (append) {
            // Scroll infinito: agregar productos al final
            this.allProducts = [...this.allProducts, ...newProducts]
            console.log('✓ Productos agregados:', {
              nuevos: newProducts.length,
              anterior: prevCount,
              actual: this.allProducts.length,
              total: data.total
            })
          } else {
            // Carga inicial: reemplazar productos
            this.allProducts = newProducts
            console.log('✓ Productos cargados:', {
              cantidad: newProducts.length,
              total: data.total
            })
          }

          this.pagination.rowsNumber = data.total

          if (!append) {
            // Solo cargar promociones en la carga inicial
            this.fetchPromotions()
          } else {
            this.loadingProducts = false
          }
        })
        .catch(err => {
          this.loadingProducts = false
          console.error('❌ Error cargando productos:', err.message)
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Maneja el scroll infinito de productos
     */
    handleProductsScroll (event) {
      const container = event.target
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight

      // Detectar si está cerca del fondo (100px antes del final)
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      // Solo continuar si está cerca del fondo y no está cargando
      if (!isNearBottom || this.loadingProducts) {
        return
      }

      // Verificar si hay más productos por cargar
      const currentProductsCount = this.allProducts.length
      const totalProducts = this.pagination.rowsNumber

      // Si ya se cargaron todos los productos, no hacer nada
      if (currentProductsCount >= totalProducts) {
        console.log('✓ Todos los productos ya están cargados:', {
          cargados: currentProductsCount,
          total: totalProducts
        })
        return
      }

      // Calcular la siguiente página
      const currentPage = Math.floor(currentProductsCount / this.pagination.rowsPerPage)
      const nextPage = currentPage + 1

      console.log('📦 Cargando más productos:', {
        paginaActual: currentPage,
        proximaPagina: nextPage,
        productosCargados: currentProductsCount,
        totalProductos: totalProducts,
        restantes: totalProducts - currentProductsCount
      })

      // Cargar más productos
      const params = {
        sortOrder: 'desc',
        sortBy: 'sold',
        page: nextPage,
        perPage: this.pagination.rowsPerPage,
        paginate: true,
        dataSearch: {
          name: this.filter,
          code: this.filter,
          barcode: this.filter
        }
      }

      this.getAllProducts(params, true)
    },
    sumCostPromotion (data) {
      return (data ?? [])
        .flatMap(g => g.products ?? [])
        .reduce((sum, p) => sum + (Number.isFinite(Number(p.cost)) ? Number(p.cost) : 0), 0)
    },
    /**
     * Fetch promotions from API and add them to products list
     */
    async fetchPromotions () {
      try {
        const params = {
          branch_office_id: this.branchOffice?.id
        }
        const { data } = await this.$api.get('promotions', { params })

        // Add promotions to the beginning of the products list
        if (data && data.length > 0) {
          data.forEach(promotion => {
            this.allProducts.unshift({
              ...promotion,
              is_bundle: true,
              is_promotion: true,
              cost: this.sumCostPromotion(promotion.promotion_details),
              skip_stock: !promotion.requires_stock,
              price: promotion.final_price
            })
          })
        }

        this.loadingProducts = false
      } catch (error) {
        console.error('Error fetching promotions:', error)
        this.loadingProducts = false
      }
    },
    /**
     * Set payments
     * @param {Array} invoicePayments invoice payments
     */
    setPayments (invoicePayments) {
      invoicePayments?.forEach(payment => {
        this.payments.push({
          id: payment.payment_method_id,
          payment_method_id: payment.payment_method_id,
          name: payment.payment_method.name,
          amount: payment.amount,
          discount_percentage: payment.discount_percentage,
          reference: payment.reference,
          coin_id: payment.coin_id
        })
      })
    },
    /**
     * Get invoice one request
     * @param {Number} id invoice id
     * @returns {Object}
     */
    async getInvoiceOneRequest (id) {
      try {
        const { data } = await this.$api.get(`invoices/${id}`)
        return data.data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get invoice one
     * @param {Number} id invoice id
     */
    async getInvoiceOne (data) {
      this.loadingSearch = true
      const invoice = await this.getInvoiceOneRequest(data)
      if (invoice) {
        if (invoice.branch_office_id !== this.branchOffice?.id) {
          notify('Esta factura no pertenece a esta sucursal', 'negative', 'warning')
          this.$router.push({ name: 'Billing' })
          this.loadingSearch = false
          return
        }
        this.loadingSearch = false
        this.invoice = invoice
        this.products = invoice.products.map(product => {
          return {
            ...product,
            ...product.pivot,
            id: product.id,
            quantity: product.pivot.amount,
            subtotal: product.pivot.price * product.pivot.amount,
            product_price_lists: product.product_price_lists
          }
        })
        this.client = invoice.client
        this.invoiceType = invoice.invoice_type
        this.typeOfService = invoice.type_of_service

        this.searchInvoice = false
        this.setPayments(invoice.invoice_payments)
        this.$router.push({
          name: 'Billing',
          query: {
            id: invoice.id
          }
        })
        this.invoiceDescription = invoice.description
        this.deliveryDate = invoice.delivery_date
        this.calculateTotal()
        this.search = ''
      } else {
        notify('No se encontró la factura', 'negative', 'warning')
      }
    },
    /**
     * Clear invoice
     */
    clear () {
      // Cancelar debounce pendiente
      if (this.invoiceShareDebounceTimer) {
        clearTimeout(this.invoiceShareDebounceTimer)
        this.invoiceShareDebounceTimer = null
      }

      this.payments = []
      this.products = []
      this.resetProductSelection()
      this.tableSelected = []
      this.invoiceDescription = ''
      this.invoiceCreatedAt = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
      this.deliveryDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
      this.dialogPayment = false
      this.tableClose = false
      // Note: withoutPrint and invoicePrinter are reset by printBill() function

      // Limpiar campos de dirección
      this.address = null
      this.formattedAddress = ''
      // Reiniciar el componente AddressComponent incrementando su key
      this.addressComponentKey += 1

      // Limpiar archivos adjuntos
      this.clearInvoiceFiles()

      this.calculateTotal()

      // Enviar actualización inmediata de factura vacía
      this.invoiceShare = {
        client: this.client,
        products: [],
        payments: [],
        totalBill: 0,
        totalPayment: 0
      }

      // Navigating to billing page
      this.$router.push({ name: 'Billing' })
      this.setInvoice({})

      setTimeout(() => {
        this.$refs.saveBill.resetValidation()
        this.getLocalStorage()
        this.invoice = null
      }, 100)
    },
    /**
     * Print invoice
     * @param {Object} data invoice saved
     */
    async printBill (data) {
      const invoice = await this.getInvoiceOneRequest(data.id)

      if (!invoice) {
        notify('Error al obtener la factura', 'negative', 'warning')
        return
      }

      if (this.withoutPrint) {
        this.withoutPrint = false
        // Para guardar sin imprimir, limpiar inmediatamente
        setTimeout(() => {
          this.dialogPayment = false
          this.clear()
        }, 300)
        return
      }

      if (this.invoicePrinter) {
        await ticketPrint(invoice)
      } else {
        await commandPrint(invoice)
      }

      // Reset flags after printing completes
      this.invoicePrinter = false
      this.withoutPrint = false
    },
    /**
     * Set invoice model
     * @returns {Object}
     */
    setModelInvoice () {
      // Determinar si es cuenta corriente (CC) o contado
      const isCuentaCorriente = this.invoiceType?.acronym_serie === 'CC'
      const paymentType = isCuentaCorriente ? 'credit' : 'cash'

      const invoiceModel = {
        ...this.invoice,
        tableClose: this.tableClose,
        title: this.invoiceType?.name,
        client_id: this.client?.id,
        seller_id: this.userSession.id,
        coin_id: this.coin.id,
        description: this.invoiceDescription,
        type_of_service_id: this.typeOfService.id,
        invoice_type_id: this.invoiceType.id,
        user_created_id: this.userSession.id,
        cashbox_user_id: this.cashBoxState?.id,
        exchange_rate: this.exchangeRate?.amount || 0,
        created_at: this.invoiceCreatedAt,
        delivery_date: this.deliveryDate,
        branch_office_id: this.branchOffice?.id,
        address: this.formattedAddress,
        products: this.products,
        status: this.invoice?.status || this.typeOfService.code === 4 ? 'delivered' : 'pending',
        payments: this.payments.filter(payment => payment.amount > 0).map(payment => ({
          ...payment,
          payment_type: paymentType
        })),
        total_amount: this.totalBill,
        tables: this.tableSelected.map(table => table?.id || table),
        electronic_invoice: this.invoiceType?.bill,
        voucherType: this.invoiceType?.bill ? this.voucherType : null
      }
      return invoiceModel
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

      if (this.products.length <= 0) {
        notify('No hay productos seleccionados', 'negative', 'warning')
        return false
      }

      return this.setModelInvoice()
    },
    /**
     * Save bill and payments
     */
    async saveBill () {
      try {
        this.loadingBilling = true
        const params = this.setParamsBill()
        let res = null
        if (!params) return

        // Paso 1: Guardar factura con datos JSON
        if (this.$route.query.id) {
          res = await this.$api.put(`invoices/${this.$route.query.id}`, params)
        } else {
          res = await this.$api.post('invoices', params)
        }

        // Paso 2: Si hay archivos adjuntos y es tipo pedido (code === 5), enviarlos
        const invoiceId = res.data.data?.id
        if (invoiceId && this.invoiceFiles.length > 0 && this.typeOfService?.code === 5) {
          await this.uploadInvoiceFiles(invoiceId)
        }

        await this.printBill(res.data.data)
        notify('Factura guardada exitosamente', 'positive', 'check_circle')

        // Cerrar modal y limpiar después de guardar exitoso
        this.dialogPayment = false
        if (!this.tableClose) {
          // Limpiar siempre después de facturar exitosamente, excepto si viene de mesa
          setTimeout(() => this.clear(), 500)
        }
        // Recargar productos para actualizar stock después de la venta
        this.reloadProducts()
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.loadingBilling = false
      }
    },

    /**
     * Upload invoice files to server
     * @param {Number} invoiceId - ID de la factura creada
     */
    async uploadInvoiceFiles (invoiceId) {
      try {
        // Subir cada archivo individualmente
        const uploadPromises = []

        this.invoiceFiles.forEach((fileObj) => {
          if (fileObj.isNew && fileObj.file) {
            const formData = new FormData()

            // Estructura requerida por el backend
            formData.append('file', fileObj.file)
            formData.append('fileable_type', 'App\\Models\\Invoice')
            formData.append('fileable_id', invoiceId)

            // Configurar headers para FormData
            const config = {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }

            // Agregar promesa de upload
            uploadPromises.push(
              this.$api.post('files', formData, config)
            )
          }
        })

        // Eliminar archivos existentes marcados para eliminación (solo en edición)
        if (this.deletedInvoiceFiles.length > 0) {
          this.deletedInvoiceFiles.forEach((fileId) => {
            // Verificar que sea un ID real antes de intentar eliminar
            if (Number.isInteger(fileId) && fileId > 0) {
              uploadPromises.push(
                this.$api.delete(`files/${fileId}`)
              )
            }
          })
        }

        // Ejecutar todas las subidas en paralelo
        await Promise.all(uploadPromises)
      } catch (error) {
        console.error('Error al subir archivos:', error)
        this.$q.notify({
          message: 'La factura se guardó pero hubo un error al subir los archivos adjuntos',
          icon: 'warning',
          color: 'warning'
        })
      }
    },
    /**
     * Get local storage
     */
    getLocalStorage () {
      const { company_session: companySession } = this.userSession
      this.client = companySession?.company_config?.client
      this.invoiceType = companySession?.company_config?.invoice_type
      this.typeOfService = companySession?.company_config?.type_of_service
      this.coin = companySession?.company_config?.coin
      this.companyConfig = companySession?.company_config
      this.voucherType = companySession?.company_config?.other?.voucher_type
      this.balanceCode = companySession?.company_config?.other?.balance_code
      this.partialBilling = companySession?.company_config?.other?.partial_billing || false
      this.openCashBox = companySession?.company_config?.other?.open_cashbox || false
      this.calculateTotal()
    },
    /**
     * Delete product in table
     * @param {Object} product props table products
     */
    deleteProduct (product) {
      this.products.splice(product.rowIndex, 1)
      this.products = [...this.products]
      this.resetProductSelection()
      this.calculateTotal()
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
     * Check if the stock is valid
     * @param {Object} data props products
     * @param {Number} amount
     */
    validStockProduct (data, amount) {
      data.stock = data.is_bundle ? data.bundle_stock : data.normal_stock
      if (!data.skip_stock) return data.stock >= amount
      return true
    },
    /**
     * Push product
     * @param {Object} product product
     */
    pushProduct (product) {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.is_promotion ? product.final_price : product.price,
        amount: product.quantity,
        quantity: product.quantity,
        subtotal: product.subtotal,
        product_id: product.id,
        cost: product.cost,
        barcode: product.barcode,
        normal_stock: product.normal_stock || 0,
        bundle_stock: product.bundle_stock || 0,
        skip_stock: product.skip_stock,
        is_bundle: product.is_bundle,
        aliquot_type: product.aliquot_type || product?.category?.aliquot_type,
        unit_of_measure: product.unit_of_measure,
        product_price_lists: product.product_price_lists,
        is_promotion: product.is_promotion,
        promotion_details: product.promotion_details || [],
        products: product.products || [],
        selectedProducts: product.selectedProducts || [],
        final_price: product.final_price
      }

      this.products = [
        ...this.products,
        cartProduct
      ]

      // Seleccionar automáticamente el producto recién agregado
      this.selectLastAddedProduct()
    },
    /**
     * Valida y agrega productos al carrito con cálculos precisos
     * @param {Object} data - Producto seleccionado
     * @param {Boolean} validUnitMeasurement - Indica si debe validar unidad de medida
     */
    validateProduct (data, validUnitMeasurement = false) {
      // Validación inicial
      if (!data || !data.id) {
        this.$q.notify({
          message: 'Producto inválido',
          color: 'negative'
        })
        return
      }

      const isWeightProduct = data?.unit_of_measure?.acronym === 'KG'
      const quantity = this.quantity || 1

      // Manejo especial para productos por peso
      if (validUnitMeasurement && isWeightProduct) {
        this.handleWeightProduct(data)
        return
      }

      // Validación de stock
      if (!this.validStockProduct(data, quantity)) {
        this.showStockError(data)
        return
      }

      // Buscar producto existente
      const existingIndex = this.products.findIndex(p => p.id === data.id)

      if (existingIndex >= 0) {
        this.updateExistingProduct(existingIndex, data, isWeightProduct, quantity)
      } else {
        this.addNewProduct(data, isWeightProduct, quantity)
      }
      this.resetQuantities()
    },

    /**
     * Actualiza un producto existente en el carrito (VERSIÓN CORREGIDA)
     */
    updateExistingProduct (index, data, isWeightProduct, quantity) {
      const product = this.products[index]
      if (isWeightProduct && this.currentAmount) {
        // Para productos por peso con monto específico
        const weightQuantity = this.currentAmount / data.price
        product.quantity += weightQuantity
        product.amount += weightQuantity
        product.subtotal = product.price * product.quantity
      } else {
        // Para productos normales (por unidad)
        product.quantity += quantity
        product.amount += quantity
        product.subtotal = product.price * product.quantity
      }

      // Asegurar que los cálculos sean precisos
      product.subtotal = Math.round((product.price * product.quantity) * 100) / 100

      // Actualizar el producto en el array
      this.products.splice(index, 1, product)
      this.calculateTotal()
    },
    /**
     * Calcula subtotal con validación de stock
     */
    calculate (data) {
      // Las promociones no requieren validación de stock
      if (!data.is_promotion) {
        // Validación final de stock solo para productos normales
        if (!this.validStockProduct(data, data.quantity)) {
          const availableStock = data.stock || 0
          data.quantity = Math.min(data.quantity, availableStock)
          data.amount = data.quantity
          data.subtotal = data.price * data.quantity

          this.$q.notify({
            message: `Stock ajustado a ${availableStock} unidades`,
            color: 'warning',
            timeout: 1500
          })
        }
      }

      // Cálculo preciso con redondeo a 2 decimales
      data.amount = data.quantity
      data.subtotal = Math.round((data.price * data.quantity) * 100) / 100
      this.calculateTotal()
    },
    /**
     * Agrega un nuevo producto al carrito
     */
    addNewProduct (data, isWeightProduct, quantity) {
      const newProduct = {
        ...data,
        product_id: data.id,
        quantity: isWeightProduct && this.currentAmount
          ? this.currentAmount / data.price
          : quantity,
        amount: isWeightProduct && this.currentAmount
          ? this.currentAmount
          : quantity,
        subtotal: isWeightProduct && this.currentAmount
          ? this.currentAmount
          : data.price * quantity,
        // Explicitly preserve bundle/promo properties
        is_bundle: data.is_bundle || false,
        products: data.promotion_details || [],
        promotion_details: data.promotion_details || [],
        final_price: data.final_price || data.price
      }

      // Asegurar precisión en decimales
      newProduct.subtotal = Math.round(newProduct.subtotal * 100) / 100

      this.pushProduct(newProduct)
      this.calculateTotal()
    },

    /**
     * Maneja productos vendidos por peso
     */
    handleWeightProduct (data) {
      this.quantityDialog = true
      this.currentAmount = data.price // Precio por KG
      this.productQuantity = data
    },

    /**
     * Muestra error de stock
     */
    showStockError (data) {
      this.$q.notify({
        message: `Stock insuficiente para ${data.name}`,
        caption: `Disponible: ${data.stock || 0}`,
        color: 'negative',
        icon: 'warning',
        timeout: 2000
      })
    },

    /**
     * Reset quantities
     */
    resetQuantities () {
      this.quantity = 1
      this.currentAmount = 0
      this.quantityDialog = false
    },

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
     * Get one product
     * @param {Number} barcode barcode product
     */
    async getOneProduct (barcode) {
      const product = await this.getProduct(barcode)
      if (product) {
        this.validateProduct(product, true)
        this.barcode = null
      } else {
        notify('Producto no encontrado', 'negative', 'warning')
      }
    },

    /**
     * Checks the current cash box status for the user
     * using the new API structure
     */
    /**
     * Simplified method that just calls loadAvailableCashBoxes
     * All cashbox logic is now handled in loadAvailableCashBoxes
     */
    async checkCashBoxStatus () {
      if (!this.openCashBox) return
      try {
        const { data } = await this.$api.get('cashier-init', {
          params: {
            branch_office_id: this.branchOffice?.id
          }
        })
        if (data && data.status === 'open') {
          this.isUserBoxOpen = true
          this.cashBoxState = {
            id: data.id,
            cashbox_id: data.cashbox_id,
            user_id: data.user_id,
            init_balance: parseFloat(data.init_balance),
            init_date: data.init_date,
            status: data.status,
            close_date: data.close_date,
            end_balance: data.end_balance,
            user_close_id: data.user_close_id
          }
          this.availableCashBoxes = []
        } else {
          // Respuesta exitosa pero sin sesión activa
          await this.handleNoActiveSession()
        }
      } catch (error) {
        if (error.response?.status === 404 ||
            error.message?.includes('No query results for model') ||
            error.message?.includes('CashboxUser')) {
          // 404 o sin datos es comportamiento normal - no hay sesión activa
          await this.handleNoActiveSession()
        } else {
          // Error real del servidor
          console.error('Error al verificar estado de caja:', error)
          this.isUserBoxOpen = false
          this.cashBoxState = null
          this.availableCashBoxes = []
        }
      }
    },

    /**
     * Handle when there's no active cashbox session
     */
    async handleNoActiveSession () {
      this.isUserBoxOpen = false
      this.cashBoxState = null
      await this.loadAvailableCashBoxes()

      // Mostrar automáticamente el modal para abrir caja con delay para asegurar renderizado
      this.showCashBoxDialog = true
    },

    /**
     * Handle cash box button click - load boxes before showing modal
     */
    async handleCashBoxButtonClick () {
      if (!this.isUserBoxOpen) {
        await this.loadAvailableCashBoxes()
      }

      this.showCashBoxDialog = true
    },

    /**
     * Loads available cash boxes from API with open/closed status
     */
    async loadAvailableCashBoxes () {
      if (!this.branchOffice?.id) {
        console.error('Error: branchOffice.id no está disponible')
        this.availableCashBoxes = []
        return
      }

      try {
        const response = await this.$api.get('cashboxes', {
          params: {
            dataEqualFilter: {
              branch_office_id: this.branchOffice?.id
            }
          }
        })

        const allBoxes = response.data || []

        this.availableCashBoxes = allBoxes
          .filter(box => box.branch_office_id === this.branchOffice?.id && !box.deleted_at)
          .map(box => ({
            ...box,
            open: box.current_session ? box.current_session.open : false
          }))
      } catch (error) {
        this.availableCashBoxes = []
      }
    },

    /**
     * Handle when a cash box is opened
     */
    handleBoxOpened (boxData) {
      this.isUserBoxOpen = true
      this.cashBoxState = {
        id: boxData.sessionId,
        cashbox_id: boxData.cashboxId,
        user_id: this.userSession.id,
        init_balance: boxData.initialBalance,
        open: true
      }
      this.availableCashBoxes = []
    },

    /**
     * Handle when a cash box is closed
     */
    handleBoxClosed (closeData) {
      this.isUserBoxOpen = false
      this.cashBoxState = null
      // Reload available boxes after closing
      this.loadAvailableCashBoxes()
    },

    /**
     * Handle when a new cash box is created
     */
    handleBoxCreated (newBox) {
      // Reload available boxes to include the new one
      this.loadAvailableCashBoxes()
    },

    /*
     * Open promo selection dialog
     */
    async openPromoDialog (promo) {
      try {
        const promoWithDetails = { ...promo }

        // Collect all unique product IDs from promotion groups
        const productIds = new Set()
        if (promoWithDetails.promotion_details && promoWithDetails.promotion_details.length > 0) {
          promoWithDetails.promotion_details.forEach(group => {
            if (group.products && group.products.length > 0) {
              group.products.forEach(product => {
                // Debug: Log product structure to understand the data
                // Processing product data

                // Handle different possible property names
                const productId = product.product_id || product.id || product.productId

                if (productId) {
                  productIds.add(productId)
                } else {
                  console.warn('Product without valid ID found:', product)
                }
              })
            }
          })
        }

        let promotionProducts = []
        const productIdsArray = Array.from(productIds)
        if (productIdsArray.length > 0) {
          try {
            const { data } = await this.$api.get('products', {
              params: {
                branch_office_id: this.branchOffice?.id,
                whereIn: {
                  id: productIdsArray
                },
                perPage: productIdsArray.length,
                paginate: false
              }
            })
            promotionProducts = Array.isArray(data) ? data : (data.data || [])
          } catch (error) {
            console.error('Error fetching promotion products:', error)
          }
        }

        // Merge complete product data with promotion products
        if (promoWithDetails.promotion_details && promoWithDetails.promotion_details.length > 0) {
          for (const group of promoWithDetails.promotion_details) {
            if (group.products && group.products.length > 0) {
              for (const product of group.products) {
                // Handle different possible property names for product ID
                const productId = product.product_id || product.id || product.productId

                if (!productId) {
                  console.warn('Product without valid ID found in merge:', product)
                  continue
                }

                // Find complete product data in the fetched promotion products
                const completeProduct = promotionProducts.find(p => p.id === productId)

                if (completeProduct) {
                  // Merge complete product data with existing product data
                  Object.assign(product, {
                    ...completeProduct,
                    // Preserve promotion-specific data
                    product_id: productId,
                    quantity: product.quantity || 0
                  })
                } else {
                  console.warn(`Product with ID ${productId} not found in API response`)
                }
              }
            }
          }
        }

        this.currentPromo = promoWithDetails
        this.currentGroupIndex = 0
        this.promoSelections = []

        // Initialize preselected products
        this.initializePreselectedProducts()

        // Auto-advance through completed groups
        this.autoAdvanceCompletedGroups()

        this.promoDialog = true
      } catch (error) {
        console.error('Error opening promo dialog:', error)
        notify('Error al cargar los detalles de la promoción', 'negative', 'warning')
      }
    },

    /**
     * Initialize preselected products when opening promo dialog
     */
    initializePreselectedProducts () {
      if (!this.currentPromo) return
      this.currentPromo.promotion_details.forEach((group, groupIndex) => {
        group.products.forEach(product => {
          // Check for preselected quantity in pivot.quantity (new structure)
          const preselectedQuantity = product.pivot?.quantity || product.quantity || 0
          if (preselectedQuantity && preselectedQuantity > 0) {
            const productId = product.id || product.product_id
            this.promoSelections.push({
              groupIndex,
              product_id: String(productId),
              product,
              quantity: preselectedQuantity,
              amount: preselectedQuantity
            })
          }
        })
      })
    },

    /**
     * Auto-advance through completed groups due to preselection
     */
    autoAdvanceCompletedGroups () {
      if (!this.currentPromo) return

      // Check each group starting from the current one
      while (this.currentGroupIndex < this.currentPromo.promotion_details.length) {
        const currentGroup = this.currentPromo.promotion_details[this.currentGroupIndex]
        const groupSelections = this.promoSelections.filter(sel => sel.groupIndex === this.currentGroupIndex)
        const totalSelected = groupSelections.reduce((sum, sel) => sum + sel.quantity, 0)

        // If current group is complete, move to next
        if (totalSelected === currentGroup.quantity) {
          // If this is the last group, we're done
          if (this.currentGroupIndex === this.currentPromo.promotion_details.length - 1) {
            break
          }

          // Move to next group
          this.currentGroupIndex++
        } else {
          break
        }
      }
    },

    /**
     * Close promo selection dialog
     */
    closePromoDialog () {
      this.promoDialog = false
      this.currentPromo = null
      this.currentGroupIndex = 0
      this.promoSelections = []
    },

    /**
     * Check if product is selected in current group
     */
    isProductSelected (id) {
      if (!id) {
        console.warn('⚠️ isProductSelected called with undefined id')
        return false
      }
      const isSelected = this.promoSelections.some(selection =>
        selection.groupIndex === this.currentGroupIndex &&
        String(selection.product_id) === String(id)
      )
      return isSelected
    },

    /**
     * Get product quantity in current group
     */
    getProductQuantity (id) {
      if (!id) {
        console.warn('⚠️ getProductQuantity called with undefined id')
        return 0
      }
      const selections = this.promoSelections.filter(selection =>
        selection.groupIndex === this.currentGroupIndex &&
        String(selection.product_id) === String(id)
      )
      const quantity = selections.reduce((total, selection) => total + selection.quantity, 0)

      return quantity
    },

    /**
     * Get total selected quantity for current group
     */
    getTotalSelectedQuantity () {
      return this.promoSelections
        .filter(selection => selection.groupIndex === this.currentGroupIndex)
        .reduce((total, selection) => total + selection.quantity, 0)
    },

    /**
     * Toggle product selection
     */
    toggleProductSelection (product) {
      const productId = product.id || product.product_id

      const existingSelectionIndex = this.promoSelections.findIndex(selection =>
        selection.groupIndex === this.currentGroupIndex &&
        String(selection.product_id) === String(productId)
      )

      if (existingSelectionIndex >= 0) {
        this.promoSelections.splice(existingSelectionIndex, 1)
      } else {
        const currentTotal = this.getTotalSelectedQuantity()
        if (currentTotal < this.currentGroup.quantity) {
          this.promoSelections.push({
            groupIndex: this.currentGroupIndex,
            product_id: String(productId),
            product,
            quantity: 1
          })
        }
      }
    },

    /**
     * Increase product quantity
     */
    increaseQuantity (id) {
      if (!id) {
        console.warn('⚠️ increaseQuantity called with undefined id')
        return
      }
      const selection = this.promoSelections.find(selection =>
        selection.groupIndex === this.currentGroupIndex &&
        String(selection.product_id) === String(id)
      )

      if (selection) {
        const currentTotal = this.getTotalSelectedQuantity()
        if (currentTotal < this.currentGroup.quantity) {
          selection.quantity++
        } else {
          // Group limit reached
        }
      } else {
        // No selection found for product ID
      }
    },

    /**
     * Decrease product quantity
     */
    decreaseQuantity (id) {
      if (!id) {
        console.warn('⚠️ decreaseQuantity called with undefined id')
        return
      }
      const selection = this.promoSelections.find(selection =>
        selection.groupIndex === this.currentGroupIndex &&
        String(selection.product_id) === String(id)
      )

      if (selection && selection.quantity > 1) selection.quantity--
    },

    /**
     * Check if current group selection is valid
     */
    isCurrentGroupValid () {
      const totalSelected = this.getTotalSelectedQuantity()
      return totalSelected === this.currentGroup.quantity
    },

    /**
     * Go to next group
     */
    nextGroup () {
      if (this.isCurrentGroupValid() && this.currentGroupIndex < this.currentPromo.promotion_details.length - 1) {
        this.currentGroupIndex++
      }
    },
    handleAddressSelected (address) {
      // Si la dirección es nula, reiniciar el objeto de dirección
      if (!address) {
        this.address = {}
        this.formattedAddress = ''
        return
      }

      // Actualizar los campos de dirección para el formulario
      this.address = address

      // Formatear la dirección para enviarla en la factura
      // El componente AddressComponent devuelve un objeto con la estructura específica
      if (typeof address === 'object' && address !== null) {
        // Priorizar formattedAddress si existe
        if (address.formattedAddress) {
          this.formattedAddress = address.formattedAddress
        } else if (address.name) {
          // Si no hay formattedAddress, usar el name del lugar
          this.formattedAddress = address.name
        } else {
          // Construir dirección desde componentes disponibles
          const addressParts = []
          if (address.street) addressParts.push(address.street)
          if (address.city) addressParts.push(address.city)
          if (address.state) addressParts.push(address.state)
          if (address.country) addressParts.push(address.country)
          if (address.zipCode) addressParts.push(address.zipCode)

          this.formattedAddress = addressParts.length > 0
            ? addressParts.join(', ')
            : JSON.stringify(address)
        }
      } else if (typeof address === 'string') {
        // Si por alguna razón viene como string
        this.formattedAddress = address
      } else {
        // Fallback: convertir a string
        this.formattedAddress = String(address)
      }

      // Address processing completed
    },

    /**
     * Close add client modal and reset state
     */
    closeAddClientModal () {
      this.openAddClient = false
      this.clientAdded = {
        is_credit: false
      }
      this.address = null
      // Resetear el componente AddressComponent incrementando su key
      this.addressComponentKey += 1
    },

    /**
     * Handle address selection for client form
     * @param {Object|String} address - The selected address
     */
    handleAddressSelectedForClient (address) {
      // Si la dirección es nula, limpiar el campo
      if (!address) {
        this.clientAdded.address = ''
        return
      }

      // Formatear la dirección para el cliente
      if (typeof address === 'object' && address !== null) {
        // Priorizar formattedAddress si existe
        if (address.formattedAddress) {
          this.clientAdded.address = address.formattedAddress
        } else if (address.name) {
          // Si no hay formattedAddress, usar el name del lugar
          this.clientAdded.address = address.name
        } else {
          // Construir dirección desde componentes disponibles
          const addressParts = []
          if (address.street) addressParts.push(address.street)
          if (address.city) addressParts.push(address.city)
          if (address.state) addressParts.push(address.state)
          if (address.country) addressParts.push(address.country)
          if (address.zipCode) addressParts.push(address.zipCode)

          this.clientAdded.address = addressParts.length > 0
            ? addressParts.join(', ')
            : JSON.stringify(address)
        }

        // Guardar coordenadas GPS si están disponibles
        if (address.latitude && address.longitude) {
          this.clientAdded.latitude = address.latitude
          this.clientAdded.longitude = address.longitude
          this.clientAdded.place_id = address.place_id || null
        }
      } else if (typeof address === 'string') {
        // Si por alguna razón viene como string
        this.clientAdded.address = address
      } else {
        // Fallback: convertir a string
        this.clientAdded.address = String(address)
      }
    },

    /**
     * Go to previous group
     */
    previousGroup () {
      if (this.currentGroupIndex > 0) {
        this.currentGroupIndex--
      }
    },

    /**
     * Add promo to cart with selected products
     */
    addPromoToCart () {
      if (!this.isCurrentGroupValid()) return
      const promoProduct = {
        ...this.currentPromo,
        promotion_id: this.currentPromo.id,
        promotion_detail_id: this.currentPromo.id,
        selectedProducts: this.promoSelections,
        quantity: 1,
        amount: 1,
        is_promotion: true,
        price: this.currentPromo.final_price,
        subtotal: this.currentPromo.final_price
      }

      this.pushProduct(promoProduct)
      this.calculateTotal()
      this.closePromoDialog()

      // Auto-select the newly added promotion
      this.selectLastAddedProduct()

      this.$q.notify({
        message: `${promoProduct.name} agregado`,
        color: 'positive',
        icon: 'check_circle'
      })
    },

    /**
     * Open file dialog safely
     */
    openFileDialog () {
      const input = this.$refs.fileInput
      if (input) {
        input.click()
      }
    },

    /**
     * Handle file select
     * @param {Event} event
     */
    handleFileSelect (event) {
      const files = Array.from(event.target.files)
      this.processInvoiceFiles(files)
      event.target.value = '' // Reset input
    },

    /**
     * Handle invoice file drop
     * @param {Event} event
     */
    handleInvoiceFileDrop (event) {
      this.isDragOverInvoice = false
      const files = Array.from(event.dataTransfer.files)
      this.processInvoiceFiles(files)
    },

    /**
     * Process invoice files (images and PDFs)
     * @param {Array} files
     */
    processInvoiceFiles (files) {
      let acceptedCount = 0
      let rejectedCount = 0

      files.forEach(file => {
        // Validate file type
        const isValidImage = file.type.startsWith('image/')
        const isValidPDF = file.type === 'application/pdf'

        if (!isValidImage && !isValidPDF) {
          this.$q.notify({
            message: `"${file.name}" no es un formato válido. Solo se permiten imágenes y archivos PDF`,
            icon: 'warning',
            color: 'negative',
            position: 'top'
          })
          rejectedCount++
          return
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB

        // Si el tamaño es 0, aceptar el archivo sin validación
        // (Algunos navegadores como Brave reportan size=0 en drag & drop)
        if (file.size === 0) {
          this.addValidatedFile(file)
          acceptedCount++
          return
        }

        // Validar tamaño para archivos con size conocido
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)

        if (file.size > maxSize) {
          this.$q.notify({
            message: `"${file.name}" es muy grande (${fileSizeMB}MB). Máximo permitido: 10MB`,
            icon: 'warning',
            color: 'negative',
            position: 'top',
            timeout: 3000
          })
          rejectedCount++
          return
        }

        // Archivo con tamaño válido, agregarlo directamente
        this.addValidatedFile(file)
        acceptedCount++
      })

      // Notificación de éxito si se agregaron archivos
      if (acceptedCount > 0) {
        const message = rejectedCount > 0
          ? `${acceptedCount} archivo(s) agregado(s), ${rejectedCount} rechazado(s)`
          : `${acceptedCount} archivo(s) agregado(s) exitosamente`

        this.$q.notify({
          message,
          icon: 'check_circle',
          color: 'positive',
          position: 'top',
          timeout: 2000
        })
      }
    },

    /**
     * Add validated file to the list
     * @param {File} file
     */
    addValidatedFile (file) {
      const fileObj = {
        id: Date.now() + Math.random(), // Temporary ID
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        file, // Store original file for upload
        isNew: true
      }

      this.invoiceFiles.push(fileObj)
    },

    /**
     * Handle delete invoice files
     * @param {Array} deletedIds
     */
    handleDeleteInvoiceFiles (deletedIds) {
      if (deletedIds.length > 0) {
        // Solo agregar IDs reales (enteros) de archivos existentes en el servidor
        // Los IDs temporales (con decimales) no deben enviarse al backend
        const realIds = deletedIds.filter(id => {
          return Number.isInteger(id) && id > 0
        })

        if (realIds.length > 0) {
          this.deletedInvoiceFiles.push(...realIds)
        }
      }
    },

    /**
     * Clear invoice files
     */
    clearInvoiceFiles () {
      // Revoke URLs to prevent memory leaks
      this.invoiceFiles.forEach(file => {
        if (file.url && file.isNew) {
          URL.revokeObjectURL(file.url)
        }
      })
      this.invoiceFiles = []
      this.deletedInvoiceFiles = []
    }
  }
}
</script>

<style scoped>
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
  backdrop-filter: blur(2px);
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
  position: absolute;
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
  backdrop-filter: blur(2px);
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

/* Thumb translúcido */
.product-container-scroll::-webkit-scrollbar-thumb {
  border-radius: 4px;
}

/* Estilos para el formulario moderno de cliente */
.client-form-card {
  background: white !important;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--q-separator-color);
}

.body--dark .client-form-card {
  background: #1e1e1e !important;
}

.client-form-header {
  background: var(--q-primary) !important;
  padding: 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.client-form-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.client-form-header .text-h6 {
  font-weight: 700;
  font-size: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.client-form-body {
  background: white;
  padding: 32px;
  padding-bottom: 24px;
  position: relative;
  color: #333;
}

.body--dark .client-form-body {
  background: #1e1e1e;
  color: white;
}

.client-form-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--q-primary), #00bcd4, var(--q-primary));
}

.form-field-wrapper {
  margin-bottom: 12px;
}

.client-form-input {
  border-radius: 12px;
  margin-bottom: 8px;
}

.client-form-input :deep(.q-field__control) {
  border-radius: 12px !important;
  min-height: 60px;
  border: none !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8f9fa;
  position: relative;
  color: #333;
}

.client-form-input :deep(.q-field__control):before {
  border-radius: 12px !important;
  border: none !important;
}

.client-form-input :deep(.q-field__control):after {
  border-radius: 12px !important;
  border: none !important;
}

/* Estilos globales para TODOS los inputs - incluyendo AddressComponent */
:deep(.q-field__control) {
  border-radius: 12px !important;
}

:deep(.q-input .q-field__control) {
  border-radius: 12px !important;
}

:deep(.q-select .q-field__control) {
  border-radius: 12px !important;
}

.body--dark .client-form-input :deep(.q-field__control) {
  background: #2a2a2a;
  color: white;
}

.client-form-input :deep(.q-field__control):hover {
  border-color: var(--q-primary);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.client-form-input :deep(.q-field__native) {
  color: inherit !important;
  font-weight: 500;
  padding: 12px 20px 8px 20px; /* Más padding arriba para dar espacio al label */
}

/* Labels mejorados con más espacio */
.client-form-input :deep(.q-field__label) {
  font-weight: 600;
  letter-spacing: 0.5px;
  left: 20px;
  top: 8px !important; /* Más espacio arriba para separar del texto */
  transition: all 0.3s ease;
  color: #6b7280 !important;
}

.body--dark .client-form-input :deep(.q-field__label) {
  color: #9ca3af !important;
}

/* Focus effects mejorados */
.client-form-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary) !important;
  box-shadow: 0 0 0 4px var(--q-primary-alpha, rgba(25, 118, 210, 0.15));
  transform: scale(1.02);
}

.client-form-input :deep(.q-field--focused .q-field__label) {
  color: var(--q-primary) !important;
  transform: translateY(-32px) scale(0.85); /* Ajustado para el nuevo espaciado */
  font-weight: 700;
}

/* Estilos adicionales para mejor presentación */
.form-field-wrapper {
  margin-bottom: 24px;
  position: relative;
}

.text-grey-5 {
  color: #6b7280 !important;
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.body--dark .text-grey-5 {
  color: #9ca3af !important;
}

.client-form-input :deep(.q-field__control):before {
  border-color: var(--q-separator-color) !important;
}

/* Bordes en tema claro */
.body--light .client-form-input :deep(.q-field__control):before {
  border-color: #e0e0e0 !important;
}

/* Bordes en tema oscuro */
.body--dark .client-form-input :deep(.q-field__control):before {
  border-color: #616161 !important;
}

.client-form-input :deep(.q-field__control):hover:before {
  border-color: var(--q-primary) !important;
}

.client-form-input :deep(.q-field--focused .q-field__control):before,
.client-form-input :deep(.q-field--focused .q-field__control):after {
  border-color: var(--q-primary) !important;
}

/* Campo nombre con asterisco rojo */
.client-form-input :deep(.q-field--error .q-field__label) {
  color: #f44336 !important;
}

.client-form-input :deep(.q-field--error .q-field__control):before {
  border-color: #f44336 !important;
}

/* Select dropdown */
.client-form-input :deep(.q-field__append) {
  color: #b0b0b0;
}

.client-form-actions-improved {
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding: 24px 32px;
  background: white;
  margin-top: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
}

.body--dark .client-form-actions-improved {
  background: #1e1e1e;
}

/* Campo nombre más elegante y destacado */
.client-form-name-input {
  margin-bottom: 24px;
}

.client-form-name-input :deep(.q-field__control) {
  min-height: 64px !important;
  font-size: 18px;
  border: 3px solid var(--q-primary);
  border-radius: 16px;
  background: #f0f8ff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.body--dark .client-form-name-input :deep(.q-field__control) {
  background: #2a2a2a;
}

.client-form-name-input :deep(.q-field__native) {
  font-size: 18px !important;
  font-weight: 600;
  padding: 0 24px;
}

.client-form-name-input :deep(.q-field__label) {
  font-size: 16px !important;
  font-weight: 700;
  left: 24px;
  color: var(--q-primary) !important;
}

.client-form-name-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary) !important;
  box-shadow: 0 0 0 6px var(--q-primary-alpha, rgba(25, 118, 210, 0.15));
  transform: scale(1.03);
}

.client-form-save-btn {
  background: var(--q-primary) !important;
  color: white !important;
  padding: 10px 24px;
  font-weight: 600;
  border-radius: 8px;
  font-size: 14px;
  min-width: 120px;
  height: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.client-form-save-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.client-form-save-btn:hover::before {
  left: 100%;
}

.client-form-save-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Checkbox styling */
.client-form-checkbox {
  color: #b0b0b0;
}

.client-form-checkbox :deep(.q-checkbox__inner) {
  color: var(--q-primary);
}

.client-form-checkbox :deep(.q-checkbox__label) {
  color: #b0b0b0;
}

/* Responsive */
@media (max-width: 768px) {
  .client-form-actions-improved {
    position: static;
    justify-content: center;
    margin-top: 20px;
    padding: 0 20px 20px;
  }
  .client-form-body {
    padding: 16px;
    padding-bottom: 16px;
  }
}

/* Tour Styles */
.tour-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 9998;
  pointer-events: auto;
}

.tour-spotlight {
  position: absolute;
  background: transparent;
  border: 4px solid var(--q-primary);
  border-radius: 12px;
  box-shadow:
    0 0 0 9999px rgba(0, 0, 0, 0.75),
    0 0 0 8px rgba(255, 255, 255, 0.1),
    0 0 40px 4px rgba(var(--q-primary-rgb, 25, 118, 210), 0.6);
  transition: all 0.3s ease;
  z-index: 9999;
  pointer-events: none;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% {
    border-color: var(--q-primary);
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      0 0 0 8px rgba(255, 255, 255, 0.1),
      0 0 40px 4px rgba(var(--q-primary-rgb, 25, 118, 210), 0.6);
  }
  50% {
    border-color: var(--q-primary);
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      0 0 0 8px rgba(255, 255, 255, 0.15),
      0 0 50px 6px rgba(var(--q-primary-rgb, 25, 118, 210), 0.8);
  }
}

.tour-card {
  position: absolute;
  z-index: 10000;
  min-width: 350px;
  max-width: 450px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: tour-card-appear 0.3s ease-out;
}

@keyframes tour-card-appear {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary-dark, var(--q-primary)) 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.tour-step-indicator {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.tour-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--q-primary);
  line-height: 1.3;
}

.body--dark .tour-title {
  color: var(--q-primary);
}

.tour-description {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.body--dark .tour-description {
  color: #b0b0b0;
}

/* Responsive tour */
@media (max-width: 768px) {
  .tour-card {
    min-width: 300px;
    max-width: 90vw;
    left: 5vw !important;
  }

  .tour-title {
    font-size: 18px;
  }

  .tour-description {
    font-size: 13px;
  }
}

</style>
