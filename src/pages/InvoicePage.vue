<template>
  <q-page padding>
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center q-gutter-x-sm">
        <span class="text-h6">
          Lista de facturas
        </span>
        <div class="text-right q-gutter-x-sm">
          <q-btn
            class="text-right"
            icon="download"
            color="teal"
            round
          >
            <q-popup-proxy>
              <q-banner>
                <q-list>
                  <q-item
                    style="border-radius: 10px;"
                    v-ripple
                    clickable
                    @click="downloadInvoiceExcel"
                  >
                    <q-item-section thumbnail>
                      <q-icon name="archive" class="q-ml-sm"/>
                    </q-item-section>
                    <q-item-section>
                      Excel de facturas
                    </q-item-section>
                  </q-item>
                  <!-- <q-item v-ripple style="border-radius: 10px;" clickable>
                    <q-item-section thumbnail>
                      <q-icon name="archive" class="q-ml-sm"/>
                    </q-item-section>
                    <q-item-section>
                      Facturas electrónicas
                    </q-item-section>
                  </q-item> -->
                </q-list>
              </q-banner>
            </q-popup-proxy>
          </q-btn>
          <q-btn
            round
            class="text-right"
            icon="filter_alt"
            color="primary"
            @click="dialogFilter = true"
          />
        </div>
      </div>
      <q-table
        title="Facturas"
        row-key="name"
        :columns="columns"
        :rows="invoices"
        :loading="visible"
        :filter="filter"
        :visible-columns="visibleColumns"
        binary-state-sort
        v-model:pagination="paginationConfig"
        @row-click="editInvoice"
        @request="setPagination"
        no-data-label="Registro no encontrado"
        :grid="$q.screen.lt.md"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        <template v-slot:top>
          <div class="flex justify-between items-center full-width">
            <q-select
              v-model="visibleColumns"
              multiple
              outlined
              dense
              options-dense
              :display-value="$q.lang.table.columns"
              emit-value
              map-options
              :options="columns"
              option-value="name"
              options-cover
            />
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>

        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="editInvoice(null, props.row)">
              <span class="q-focus-helper"></span>

              <q-card-section class="row justify-between items-start compact-card-header">
                <div class="column">
                   <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">{{ props.row.code }}</div>
                   <div class="text-caption text-grey-6 text-weight-medium">{{ props.row.invoice_type?.name }}</div>
                </div>
                <div class="column items-end">
                   <q-badge
                     v-if="props.row.status"
                     :color="status[props.row.status]?.color"
                     :label="status[props.row.status]?.label"
                     class="q-py-xs q-px-sm text-weight-bold shadow-1"
                     rounded
                     style="font-size: 10px; letter-spacing: 0.5px"
                   />
                </div>
              </q-card-section>

              <q-separator color="grey-2" inset />

              <q-card-section class="compact-card-body">
                <div class="row q-col-gutter-y-sm">
                  <div class="col-8">
                     <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Cliente</div>
                     <div class="text-body2 text-grey-9 text-weight-bold ellipsis">{{ props.row.client?.name || '-' }}</div>
                  </div>
                  <div class="col-4 text-right">
                     <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Fecha</div>
                     <div class="text-body2 text-grey-8">{{ props.row.created_at?.split('T')[0] || '-' }}</div>
                  </div>
                  <div class="col-12" v-if="props.row.seller">
                     <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Vendedor</div>
                     <div class="text-body2 text-grey-8">{{ props.row.seller.name }}</div>
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="compact-card-footer">
                <div class="row items-center justify-between bg-grey-1 compact-total-container" style="border-radius: 12px">
                    <div>
                      <div class="text-caption text-grey-6 text-weight-medium">Total a pagar</div>
                      <div class="text-h6 text-primary text-weight-bolder lh-100" style="letter-spacing: -0.5px">{{ formatNumber(props.row.total) }}</div>
                    </div>
                    <div>
                      <q-btn
                        round
                        unelevated
                        color="negative"
                        icon="restart_alt"
                        size="md"
                        class="shadow-1"
                        v-if="!props.row.billing && props.row?.electronic_invoice?.fields?.error"
                        @click.stop="alertBeforeSend(props.row)"
                      >
                         <q-tooltip>Error: {{ props.row?.electronic_invoice?.fields?.message }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        round
                        unelevated
                        color="warning"
                        text-color="white"
                        icon="send"
                        size="md"
                        class="shadow-1"
                        v-else-if="!props.row.billing"
                        @click.stop="alertBeforeSend(props.row)"
                      >
                         <q-tooltip>Facturar</q-tooltip>
                      </q-btn>
                      <q-btn
                        round
                        unelevated
                        color="positive"
                        icon="check_circle"
                        size="md"
                        class="shadow-1"
                        v-if="props.row.billing"
                        @click.stop
                      >
                         <q-tooltip>Facturado</q-tooltip>
                      </q-btn>
                    </div>
                 </div>
              </q-card-section>
            </q-card>
          </div>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" v-if="props.value">
            <q-badge
              :color="status[props.value]?.color"
              :label="status[props.value]?.label"
              class="q-pa-sm"
            />
          </q-td>
          <q-td :props="props" v-else>
            -
          </q-td>
        </template>
        <template v-slot:body-cell-billing="props">
          <q-td :props="props">
            <div class="full-width flex justify-center">
              <q-btn
                round
                color="negative"
                icon="restart_alt"
                v-if="!props.value && props.row?.electronic_invoice?.fields?.error"
                @click.stop="alertBeforeSend(props.row)"
              >
                <q-tooltip class="text-body1">
                  Error al generar la factura
                  {{ props.row?.electronic_invoice?.fields?.message }}
                  Reintentar.
                </q-tooltip>
              </q-btn>
              <q-btn
                round
                color="warning"
                icon="send"
                v-else-if="!props.value"
                @click.stop="alertBeforeSend(props.row)"
              >
                <q-tooltip class="text-body1">
                  Facturar
                </q-tooltip>
              </q-btn>
              <q-btn
                round
                color="positive"
                icon="check_circle"
                v-if="props.value"
                @click.stop
              >
                <q-tooltip class="text-body1">
                  Facturado
                </q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
    <q-dialog v-model="openEditInvoice" :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 900px; max-width: 85vw;'}`"
        >
        <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
          <span class="text-h6">Detalles de la factura</span>
          <q-btn icon="close" flat round dense @click="openEditInvoice = false" />
        </q-card-section>
        <q-card-section class="scroll col" style="max-height: 90vh">
          <div class="row q-col-gutter-md">
            <div class="col-xl-7 col-lg-7 col-md-7 col-sm-7 col-xs-12 row q-col-gutter-sm">
              <div class="col-6">
                <q-input label="Código" filled v-model="invoice.code" readonly dense/>
              </div>
              <div class="col-6">
                <q-select
                  use-input
                  filled
                  dense
                  label="Tipo de factura"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  v-model="invoice.invoice_type"
                  :options="invoiceTypes"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  @filter="filterInvoiceTypes"
                />
              </div>
              <div class="col-6">
                <q-input label="Cliente" filled v-model="invoice.client.name" readonly dense/>
              </div>
              <div class="col-6" v-if="invoice.seller">
                <q-input label="Vendedor" filled v-model="invoice.seller.name" readonly dense/>
              </div>
              <div class="col-6">
                <q-input label="Moneda" filled :model-value="invoice?.coin?.name" readonly dense/>
              </div>
              <div class="col-6" v-if="invoice.tables.length">
                <q-select
                  filled
                  readonly
                  dense
                  label="Mesas"
                  v-model="invoice.tables"
                  option-label="name"
                  multiple
                />
              </div>
              <div class="col-6">
                <q-input label="Fecha" filled v-model="invoice.date" readonly dense/>
              </div>
              <div class="col-6">
                <q-input label="Hora" filled v-model="invoice.hour" readonly dense/>
              </div>
              <div class="col-12">
                <q-input
                  label="Descripción"
                  filled
                  v-model="invoice.description"
                  readonly
                  dense
                  type="textarea"
                  autogrow
                />
              </div>
              <div class="col-12" v-if="invoice?.address?.formattedAddress">
                <q-input
                  label="Dirección"
                  filled
                  :model-value="invoice?.address?.formattedAddress"
                  readonly
                  dense
                  type="textarea"
                  autogrow
                />
              </div>
              <div class="col-12">
                <q-expansion-item
                  icon="list"
                  label="Artículos"
                  :caption="`Total: ${formatNumber(invoice.total)}`"
                  style="border-radius: 10px"
                  class="shadow-1 overflow-hidden"
                  default-opened
                >
                  <q-card>
                    <q-card-section class="q-pa-xs">
                      <!-- Desktop Table -->
                      <q-markup-table dense v-if="$q.screen.gt.xs">
                        <thead>
                          <tr>
                            <th class="text-left">Código</th>
                            <th class="text-left">Descripción</th>
                            <th class="text-right">Cantidad</th>
                            <th class="text-right">Subtotal</th>
                            <th class="text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="product in invoice.products" :key="product.id">
                            <td class="text-left">
                              {{ product.barcode }}
                            </td>
                            <td class="text-left">
                              {{ product.name.slice(0, 15) }} ...
                              <q-tooltip class="text-subtitle1">{{ product.name }}</q-tooltip>
                            </td>
                            <td class="text-right">
                              {{ formatNumber(product.pivot.amount) }}
                            </td>
                            <td class="text-right">
                              {{ formatNumber(product.pivot.amount *  product.pivot.price) }}
                            </td>
                            <td class="text-center">
                              -
                            </td>
                          </tr>
                          <template v-for="promotion in invoice.promotions" :key="promotion.id">
                            <tr>
                              <td class="text-left">
                                {{ promotion.barcode || '-' }}
                              </td>
                              <td class="text-left">
                                {{ promotion.name.slice(0, 15) }} ...
                                <q-tooltip class="text-subtitle1">{{ promotion.name }}</q-tooltip>
                              </td>
                              <td class="text-right">
                                {{ formatNumber(promotion.pivot.quantity) }}
                              </td>
                              <td class="text-right">
                                {{ formatNumber(promotion.pivot.price || promotion.final_price) }}
                              </td>
                              <td class="text-center">
                                <q-btn
                                  v-if="promotion.pivot && promotion.pivot.promotion_details && promotion.pivot.promotion_details.length > 0"
                                  :icon="promotionExpanded[promotion.id] ? 'expand_less' : 'expand_more'"
                                  size="sm"
                                  color="orange"
                                  @click="togglePromotionDetails(promotion.id)"
                                  round
                                  dense
                                />
                                <span v-else class="text-caption text-grey-6">Promoción</span>
                              </td>
                            </tr>
                            <!-- Detalles de la promoción -->
                            <tr v-if="promotionExpanded[promotion.id] && promotion.pivot && promotion.pivot.promotion_details">
                              <td colspan="5" class="q-pa-md">
                                <div class="text-weight-medium q-mb-sm">Detalles de la promoción: {{ promotion.name }}</div>

                                <div v-for="group in promotion.pivot.promotion_details" :key="group.id" class="q-mb-md">
                                  <div class="text-subtitle2 text-weight-medium q-mb-xs">
                                    {{ group.name }} ({{ group.quantity }} requeridos)
                                  </div>

                                  <div class="q-ml-md">
                                    <div v-if="group.products && group.products.length > 0">
                                      <div
                                        v-for="product in group.products.filter(p => p.pivot && p.pivot.quantity > 0)"
                                        :key="product.id"
                                        class="row justify-between items-center q-py-xs q-px-sm q-mb-xs"
                                        style="border-left: 2px solid #e0e0e0;"
                                      >
                                        <div class="row items-center q-gutter-xs">
                                          <span class="text-body2">• {{ product.name }}</span>
                                        </div>
                                        <div class="text-weight-medium">
                                          {{ product.pivot.quantity }} {{ product.pivot.quantity === 1 ? 'unidad' : 'unidades' }}
                                        </div>
                                      </div>
                                    </div>
                                    <div v-else class="text-caption text-grey-6 q-py-xs">
                                      No hay productos seleccionados para este grupo
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                      </q-markup-table>

                      <!-- Mobile List View -->
                      <div v-else class="q-gutter-y-sm">
                        <!-- Products Loop -->
                        <div v-for="product in invoice.products" :key="product.id" class="bg-grey-1 q-pa-sm" style="border-radius: 8px">
                          <div class="row items-start justify-between no-wrap">
                            <div class="col q-pr-sm">
                              <div class="text-subtitle2 text-weight-medium">{{ product.name }}</div>
                              <div class="text-caption text-grey-7">{{ product.barcode }}</div>
                            </div>
                            <div class="col-auto text-right">
                               <div class="text-subtitle2 text-weight-bold text-primary">{{ formatNumber(product.pivot.amount * product.pivot.price) }}</div>
                               <div class="text-caption text-grey-8">{{ formatNumber(product.pivot.amount) }} x {{ formatNumber(product.pivot.price) }}</div>
                            </div>
                          </div>
                        </div>

                        <!-- Promotions Loop -->
                        <div v-for="promotion in invoice.promotions" :key="promotion.id" class="bg-grey-1 q-pa-sm" style="border-radius: 8px">
                          <div class="row items-start justify-between no-wrap">
                            <div class="col q-pr-sm">
                              <div class="text-subtitle2 text-weight-medium">{{ promotion.name }}</div>
                              <div class="text-caption text-grey-7">{{ promotion.barcode || 'Promoción' }}</div>
                            </div>
                            <div class="col-auto text-right">
                               <div class="text-subtitle2 text-weight-bold text-primary">{{ formatNumber(promotion.final_price || promotion.pivot.price) }}</div>
                               <div class="text-caption text-grey-8">Cant: {{ formatNumber(promotion.pivot.quantity) }}</div>
                            </div>
                          </div>

                          <!-- Expand Details Button -->
                          <div class="row justify-center q-mt-xs" v-if="promotion.pivot && promotion.pivot.promotion_details && promotion.pivot.promotion_details.length > 0">
                             <q-btn
                                flat
                                dense
                                size="sm"
                                color="primary"
                                :icon-right="promotionExpanded[promotion.id] ? 'expand_less' : 'expand_more'"
                                label="Detalles"
                                @click="togglePromotionDetails(promotion.id)"
                             />
                          </div>

                          <!-- Promotion Details -->
                          <div v-if="promotionExpanded[promotion.id] && promotion.pivot && promotion.pivot.promotion_details" class="q-mt-sm q-pa-sm bg-white" style="border-radius: 6px">
                              <div v-for="group in promotion.pivot.promotion_details" :key="group.id" class="q-mb-md last-no-margin">
                                  <div class="text-caption text-weight-bold q-mb-xs">
                                    {{ group.name }} ({{ group.quantity }})
                                  </div>
                                  <div class="q-pl-sm" style="border-left: 2px solid #eee">
                                    <div v-if="group.products && group.products.length > 0">
                                      <div
                                        v-for="prod in group.products.filter(p => p.pivot && p.pivot.quantity > 0)"
                                        :key="prod.id"
                                        class="row justify-between items-center q-mb-xs"
                                      >
                                        <span class="text-caption col ellipsis">{{ prod.name }}</span>
                                        <span class="text-caption text-weight-bold col-auto q-ml-sm">{{ prod.pivot.quantity }}</span>
                                      </div>
                                    </div>
                                    <div v-else class="text-caption text-grey-6">
                                      Sin selección
                                    </div>
                                  </div>
                              </div>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </div>
            <div class="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-xs-12 q-gutter-y-sm">
              <!-- Sección de Archivos Adjuntos (Solo visualización) -->
              <div class="col-12" v-if="invoice && invoice.files && invoice.files.length > 0">
                <q-card flat bordered>
                  <q-card-section class="q-pb-none">
                    <div class="row items-center q-mb-sm">
                      <div class="col">
                        <div class="text-subtitle2 text-weight-medium text-grey-8">
                          <q-icon name="attach_file" size="20px" class="q-mr-xs" />
                          Archivos Adjuntos
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-chip dense color="primary" text-color="white" size="sm">
                          {{ invoice.files.length }}
                        </q-chip>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-section class="q-pt-sm">
                    <div class="invoice-files-grid">
                      <div
                        v-for="(file, index) in invoice.files"
                        :key="index"
                        class="invoice-file-item"
                        @click="openGallery(index)"
                      >
                        <div class="invoice-file-wrapper">
                          <!-- Imagen -->
                          <q-img
                            v-if="!file.name || !file.name.toLowerCase().endsWith('.pdf')"
                            :src="file.url"
                            :ratio="1"
                            fit="cover"
                            class="invoice-file-image"
                            loading="lazy"
                          >
                            <template v-slot:loading>
                              <q-spinner color="primary" size="24px" />
                            </template>
                          </q-img>

                          <!-- PDF Icon -->
                          <div v-else class="invoice-pdf-icon">
                            <q-icon name="picture_as_pdf" size="48px" color="red-7" />
                            <div class="invoice-pdf-name">{{ file.name }}</div>
                          </div>

                          <div class="invoice-file-overlay">
                            <q-icon :name="file.name && file.name.toLowerCase().endsWith('.pdf') ? 'visibility' : 'search'" size="32px" color="white" />
                          </div>
                          <div class="invoice-file-number">
                            #{{ index + 1 }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12">
                <q-expansion-item
                  label="Pagos"
                  :caption="`Total: ${formatNumber(invoice.total_payments)}`"
                  style="border-radius: 10px"
                  class="shadow-1 overflow-hidden"
                  default-opened
                >
                  <q-card>
                    <q-card-section class="q-pa-xs">
                      <q-markup-table dense>
                        <thead>
                          <tr>
                            <th class="text-left">Método de pago</th>
                            <th class="text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(payment) in invoice.invoice_payments" :key="payment.id">
                            <td class="text-left">
                              {{ payment.payment_method.name }}
                            </td>
                            <td class="text-right">
                              {{ formatNumber(payment.amount) }}
                            </td>
                          </tr>
                        </tbody>
                      </q-markup-table>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
              <div class="q-gutter-y-xs">
                <q-btn
                  class="full-width"
                  icon="block"
                  color="negative"
                  label="Anular"
                  :loading="cancelLoading"
                  @click="cancelInvoice"
                />
                <q-btn
                  icon="print"
                  color="black"
                  label="Imprimir comanda"
                  class="full-width"
                  @click="printCommand"
                />
                <q-btn
                  class="full-width"
                  icon="print"
                  color="positive"
                  :label="!invoice.billing ? 'Imprimir Comprobante' : 'Imprimir Factura'"
                  @click="print"
                />
                <q-btn
                  class="full-width"
                  icon="print"
                  color="info"
                  v-if="invoice.billing"
                  label="Imprimir en factura A4"
                  @click="printInvoiceA4"
                />
                <q-btn
                  class="full-width"
                  icon="send"
                  color="positive"
                  label="Factura electrónica"
                  v-if="invoice.invoice_type.bill && !invoice.billing && invoice.status !== 'cancelled'"
                  @click="setInvoiceElectronic(invoice)"
                >
                  <q-tooltip class="text-body1" anchor="bottom middle">
                    Generar factura electrónica
                  </q-tooltip>
                </q-btn>
                <q-btn
                  class="full-width"
                  icon="check_circle"
                  color="primary"
                  label="Guardar"
                  v-if="invoice.status !== 'cancelled'"
                  @click="saveEdit"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="dialogFilter"
      :position="$q.screen.lt.sm ? 'standard' : 'right'"
      :seamless="!$q.screen.lt.sm"
      :maximized="$q.screen.lt.sm"
    >
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column' : ''"
        :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 500px; max-width: 80vw;'"
      >
        <!-- CABECERA (Header) - Fija arriba -->
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-h6">
            Filtros
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="dialogFilter = false"
          />
        </q-card-section>

        <!-- CONTENIDO (Body) - Scrollable -->
        <q-card-section
          :class="$q.screen.lt.sm ? 'col scroll q-pt-sm' : 'q-pt-sm scroll'"
          :style="$q.screen.lt.sm ? '' : 'max-height: calc(100vh - 200px);'"
        >
          <div class="column q-gutter-y-sm">
            <q-option-group
              v-model="panel"
              inline
              :options="[
                { label: 'Dia', value: 'day' },
                { label: 'Entre fechas', value: 'between' }
              ]"
            />
            <q-tab-panels v-model="panel" animated class="q-pa-none bg-transparent">
              <q-tab-panel name="between" class="q-gutter-y-sm q-pa-none">
                <div class="text-h6">Filtrar entre fechas</div>
                <q-input filled dense v-model="filters.from" hint="Desde" type="date"/>
                <q-input filled dense v-model="filters.to" hint="Hasta" type="date"/>
              </q-tab-panel>
              <q-tab-panel name="day" class="q-gutter-y-sm q-pa-none">
                <div class="text-h6">Filtrar por dia y horas</div>
                <q-input filled dense v-model="filters.day" hint="Fecha del dia" type="date"/>
                <q-input filled dense v-model="filters.fromHours" hint="Desde" type="time"/>
                <q-input filled dense v-model="filters.toHours" hint="Hasta" type="time"/>
              </q-tab-panel>
            </q-tab-panels>
            <span class="text-h6">Otros filtros</span>
            <q-input
              v-model="filters.code"
              label="Código"
              filled
              dense
              debounce="500"
              clearable
            />
            <q-select
              dense
              use-input
              filled
              label="Vendedor"
              input-debounce="0"
              option-value="id"
              clearable
              v-model="filters.seller"
              :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
              :options="sellers"
              @filter="filterSellers"
            />
            <q-select
              dense
              use-input
              filled
              label="Cliente"
              input-debounce="0"
              option-value="id"
              clearable
              v-model="filters.client"
              :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
              :options="clients"
              @filter="filterClients"
            />
            <q-select
              dense
              use-input
              filled
              label="Repartidor"
              input-debounce="0"
              option-value="id"
              clearable
              v-model="filters.deliveryPerson"
              :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
              :options="deliveryPersons"
              @filter="filterDeliveryPersons"
            />
            <q-select
              v-model="filters.typeOfService"
              :options="typeOfServices"
              style="min-width: 300px;"
              label="Tipo de servicio"
              option-value="id"
              option-label="name"
              dense
              filled
              multiple
              @filter="filterServiceTypes"
            >
              <template v-if="filters.typeOfService.length" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop.prevent="typeOfService = []"
                  class="cursor-pointer"
                />
              </template>
            </q-select>
            <q-select
              v-model="filters.invoiceType"
              :options="invoiceTypes"
              style="min-width: 300px;"
              label="Tipo de factura"
              option-value="id"
              option-label="name"
              dense
              filled
              multiple
              @filter="filterInvoiceTypes"
            >
              <template v-if="filters.invoiceType.length" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop.prevent="filters.invoiceType = []"
                  class="cursor-pointer"
                />
              </template>
            </q-select>
            <q-select
              v-model="filters.branchOfficeSelect"
              :options="branchOffices"
              style="min-width: 300px;"
              label="Sucursales"
              option-value="id"
              option-label="name"
              dense
              filled
              multiple
            >
              <template v-if="filters.branchOfficeSelect.length" v-slot:append>
                <q-icon name="cancel" @click.stop.prevent="filters.branchOfficeSelect = []" class="cursor-pointer" />
              </template>
            </q-select>
          </div>
        </q-card-section>

        <!-- FOOTER (Pie de página) - Fijo al fondo -->
        <q-card-actions align="right">
          <q-btn
            color="secondary"
            label="Limpiar"
            @click="clearFilter"
          />
          <q-btn
            color="negative"
            label="Cerrar"
            @click="dialogFilter = false"
          />
          <q-btn
            color="primary"
            label="Aplicar"
            @click="filterInvoice"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-inner-loading :showing="visibleLoading">
      <q-knob
        :step="10"
        show-value
        v-model="loadingDownload"
        class="text-white q-ma-md"
      />
    </q-inner-loading>

    <!-- Image Gallery -->
    <ImageGalleryComponent
      v-model="showGallery"
      :images="invoice && invoice.files ? invoice.files : []"
      :initial-index="selectedFileIndex"
      :loop="true"
      :show-thumbnails="true"
    />
  </q-page>
</template>

<script>
import { Notify, date, is } from 'quasar'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatNumber, loading, notify } from 'src/const/mixins'
import { status } from 'src/const/invoice'
import { getDownload } from 'src/const/services'
import { commandPrint, invoicePrint, ticketPrint } from 'src/const/printers'
import ImageGalleryComponent from 'src/components/ImageGalleryComponent.vue'

export default {
  components: {
    ImageGalleryComponent
  },
  data () {
    return {
      panel: 'day',
      sellers: [],
      clients: [],
      deliveryPersons: [],
      categories: [],
      branchOffices: [],
      typeOfServices: [],
      filters: {
        code: '',
        seller: null,
        deliveryPerson: null,
        invoiceType: [],
        typeOfService: [],
        branchOfficeSelect: []
      },
      loadingDownload: 0,
      /**
       * Value knob
       * @type {Number}
       */
      dialogFilter: false,
      /**
       * Visible columns
       * @type {Array}
       */
      visibleColumns: [
        'id',
        'billing',
        'invoice_type',
        'client',
        'seller',
        'created_at',
        'status',
        'total'
      ],
      /**
       * Status invoice
       * @type {Object}
       */
      status,
      /**
       * Format number
       * @type {Function}
       */
      formatNumber,
      printers: [],
      /**
       * Taxe translate
       * @type {Object}
       */
      taxeTranslate: {
        percentage: '%'
      },
      /**
       * Edit tab
       * @type {String}
       */
      editTab: 'details',
      /**
       * Invoices list table
       * @type {Array}
       */
      invoices: [],
      /**
       * Invoice data selected
       * @type {Object}
       */
      invoice: null,
      /**
       * Coin data
       * @type {Object}
       */
      coin: {},
      /**
       * Cancel loading
       * @type {Boolean}
       */
      cancelLoading: false,
      /**
       * Filter
       * @type {String}
       */
      filter: '',
      /**
       * Params search
       * @type {Object}
       */
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 1,
        dataSearch: {
          id: '',
          created_at: '',
          'coin.name': '',
          'invoiceType.name': '',
          'client.name': '',
          'seller.name': '',
          'tables.name': ''
        }
      },
      /**
       * Loading table
       * @type {Boolean}
       */
      visible: false,
      /**
       * Open add invoice dialog
       * @type {Boolean}
       */
      openAddInvoice: false,
      /**
       * Open edit invoice dialog
       * @type {Object}
       */
      openEditInvoice: null,
      /**
       * Show gallery dialog
       * @type {Boolean}
       */
      showGallery: false,
      /**
       * Selected file index for gallery
       * @type {Number}
       */
      selectedFileIndex: 0,
      /**
       * Table columns
       * @type {Array}
       */
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'code',
          sortable: true
        },
        {
          name: 'invoice_type',
          align: 'left',
          label: 'Tipo de servicio',
          field: row => row?.invoice_type?.name
        },
        {
          name: 'client',
          align: 'left',
          label: 'Cliente',
          field: row => row.client?.name
        },
        {
          name: 'seller',
          align: 'left',
          label: 'Vendedor',
          field: row => row.seller?.name || '-'
        },
        {
          name: 'coin',
          align: 'left',
          label: 'Moneda',
          field: row => row.coin?.name
        },
        {
          name: 'tables',
          align: 'left',
          label: 'Mesas',
          field: row => row.tables.map(table => table.name).join(','),
          format: row => row === '' ? 'N/A' : row
        },
        {
          name: 'created_at',
          align: 'left',
          label: 'Fecha',
          field: row => date.formatDate(row.created_at, 'DD/MM/YYYY'),
          sortable: true
        },
        {
          name: 'hour_at',
          align: 'left',
          label: 'Hora',
          field: row => date.formatDate(row.created_at, 'H:mm:ss'),
          sortable: true
        },
        // {
        //   name: 'tax_base',
        //   align: 'right',
        //   label: 'Subtotal',
        //   field: 'tax_base',
        //   sortable: true
        // },
        // {
        //   name: 'total_taxe',
        //   align: 'right',
        //   label: 'Igv',
        //   field: 'total_taxe',
        //   sortable: true
        // },
        {
          name: 'status',
          align: 'center',
          label: 'Estado',
          field: 'status',
          sortable: true
        },
        {
          name: 'billing',
          align: 'center',
          label: 'Facturado',
          field: 'billing',
          sortable: true
        },
        {
          name: 'total',
          align: 'right',
          label: 'Total',
          field: 'total',
          format: val => formatNumber(val)
        },
        {
          name: 'pending',
          align: 'right',
          label: 'Pendiente por pagar',
          field: 'pending',
          format: val => formatNumber(val)
        }
      ],
      /**
       * Pagination config
       * @type {Object}
       */
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      /**
       * Invoice types
       * @type {Array}
       */
      invoiceTypes: [],
      /**
       * Promotion expansion state
       * @type {Object}
       */
      promotionExpanded: {},
      /**
       * Product columns for invoice details table
       * @type {Array}
       */
      productColumns: [
        {
          name: 'barcode',
          align: 'left',
          label: 'Código',
          field: 'barcode',
          sortable: false
        },
        {
          name: 'name',
          align: 'left',
          label: 'Descripción',
          field: 'name',
          sortable: false
        },
        {
          name: 'price',
          align: 'right',
          label: 'Precio',
          field: 'price',
          sortable: false
        },
        {
          name: 'quantity',
          align: 'right',
          label: 'Cantidad',
          field: 'quantity',
          sortable: false
        },
        {
          name: 'subtotal',
          align: 'right',
          label: 'Subtotal',
          field: 'subtotal',
          sortable: false
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Acciones',
          field: 'actions',
          sortable: false
        }
      ]
    }
  },
  computed: {
    visibleLoading () {
      return this.loadingDownload > 0
    },
    totalBill () {
      const sum = this.invoice.taxes.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)
      return sum + this.invoice.total
    },
    /**
     * Combines products and promotions for the invoice details table
     * @returns {Array}
     */
    invoiceProducts () {
      if (!this.invoice) return []

      const products = []

      // Add regular products
      if (this.invoice.products && this.invoice.products.length > 0) {
        this.invoice.products.forEach(product => {
          products.push({
            id: product.id,
            barcode: product.barcode || '-',
            name: product.name,
            price: product.pivot?.price || product.price,
            quantity: product.pivot?.amount || product.quantity || 1,
            subtotal: (product.pivot?.amount || product.quantity || 1) * (product.pivot?.price || product.price),
            type: 'product'
          })
        })
      }

      // Add promotions
      if (this.invoice.promotions && this.invoice.promotions.length > 0) {
        this.invoice.promotions.forEach(promotion => {
          // Process selected products from promotion_details
          const selectedProducts = []
          if (promotion.pivot && promotion.pivot.promotion_details) {
            promotion.pivot.promotion_details.forEach((group, groupIndex) => {
              if (group.products && group.products.length > 0) {
                group.products.forEach(product => {
                  if (product.pivot && product.pivot.quantity > 0) {
                    selectedProducts.push({
                      product_id: product.id,
                      product,
                      quantity: product.pivot.quantity,
                      groupIndex,
                      groupName: group.name
                    })
                  }
                })
              }
            })
          }

          products.push({
            id: promotion.id,
            barcode: promotion.barcode || '-',
            name: promotion.name,
            price: promotion.pivot?.price || promotion.final_price || 0,
            quantity: promotion.pivot?.quantity || 1,
            subtotal: promotion.pivot?.price || promotion.final_price || 0,
            type: 'promotion',
            promotion_details: promotion.pivot?.promotion_details || null,
            selectedProducts,
            final_price: promotion.final_price || null,
            is_bundle: promotion.is_bundle || false
          })
        })
      }

      return products
    },
    ...mapState(authentication, ['branchOffice', 'userSession'])
  },
  mounted () {
    this.getInit()
  },
  watch: {
    filter (data) {
      this.searchData(data)
    },
    branchOffice (data) {
      this.getInvoices(this.params)
    }
  },
  methods: {
    async getInit () {
      await this.getBranchOffices()
      this.getPrinters()
      this.filterInvoice()
    },
    /**
     * Filter invoice
     */
    filterInvoice () {
      if (this.panel === 'day') {
        if (this.filters.day) {
          this.params.dateFilter = {
            ...this.params.dateFilter,
            field: 'created_at',
            from: `${this.filters.day} ${this.filters.fromHours || '00:00'}`,
            to: `${this.filters.day} ${this.filters.toHours || '23:59'}`
          }
        }
      } else {
        if (this.filters.from && this.filters.to) {
          this.params.dateFilter = {
            ...this.params.dateFilter,
            field: 'created_at',
            from: this.filters.from,
            to: this.filters.to
          }
        }
      }
      this.params.whereIn = {
        ...this.params.whereIn,
        invoice_type_id: this.filters.invoiceType.map(item => item.id),
        type_of_service_id: this.filters.typeOfService.map(item => item.id),
        branch_office_id: this.filters.branchOfficeSelect.map(item => item.id)
      }
      this.params.dataEqualFilter = {
        ...this.params.dataEqualFilter,
        seller_id: this.filters.seller?.id,
        client_id: this.filters.client?.id,
        delivery_person_id: this.filters.deliveryPerson?.id,
        id: this?.filters?.code
      }
      this.setPagination({
        pagination: this.paginationConfig
      })
    },
    /**
     * Get all sellers
     * @param {String} value
     * @param {Callback} update update options
     */
    async filterSellers (value, update) {
      try {
        const { data } = await this.$api.get('sellers', {
          params: {
            dataSearch: {
              name: value,
              document_number: value
            }
          }
        })
        update(() => {
          this.sellers = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get all clients
     * @param {String} value
     * @param {Callback} update update options
     */
    async filterClients (value, update) {
      try {
        const { data } = await this.$api.get('clients', {
          params: {
            dataSearch: {
              name: value,
              document_number: value
            }
          }
        })
        update(() => {
          this.clients = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Clear filter
     */
    async clearFilter () {
      this.params.dateFilter = {}
      this.filters = {
        code: null,
        seller: null,
        deliveryPerson: null,
        invoiceType: [],
        typeOfService: [],
        branchOfficeSelect: []
      }
      await this.getBranchOffices()
      this.filterInvoice()
    },
    /**
     * Toggle promotion details expansion
     * @param {Number} promotionId
     */
    togglePromotionDetails (promotionId) {
      this.promotionExpanded = {
        ...this.promotionExpanded,
        [promotionId]: !this.promotionExpanded[promotionId]
      }
    },
    /**
     * Get all sellers
     */
    async filterServiceTypes (value, update) {
      try {
        const { data } = await this.$api.get('type-of-services', {
          params: {
            dataSearch: {
              name: value
            }
          }
        })
        update(() => {
          this.typeOfServices = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get all invoices
     */
    async getBranchOffices () {
      try {
        if (this.userSession.is_root) {
          const { data } = await this.$api.get('branch-offices')
          this.branchOffices = data
          this.filters.branchOfficeSelect = data
        } else {
          this.filters.branchOfficeSelect = [this.branchOffice]
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },

    /**
     * Get all sellers
     */
    async filterDeliveryPersons (value, update) {
      try {
        const { data } = await this.$api.get('delivery-persons', {
          params: {
            dataSearch: {
              name: value,
              document_number: value
            }
          }
        })
        update(() => {
          this.deliveryPersons = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Download invoice excel
     */
    downloadInvoiceExcel () {
      this.loadingDownload = 1
      getDownload(
        'excel/invoices',
        { ...this.params },
        (percentCompleted) => {
          this.loadingDownload = percentCompleted
          if (percentCompleted === 100) {
            this.loadingDownload = 0
          }
        },
        (link) => {
          link.setAttribute(
            'download',
            'Invoices.xlsx'
            // `Recibos de cobro: Desde ${proxyDate.value.from} Hasta ${proxyDate.value.to}.xlsx`
          )
          document.body.appendChild(link)
          link.click()
        }
      )
    },
    /**
     * Calculate taxe
     * @param {Object} taxe taxe
     */
    calculateTaxe (taxe) {
      if (taxe.pivot.type_taxe === 'percentage') {
        taxe.total = (this.invoice.total * taxe.pivot.amount) / 100
      } else {
        taxe.total = this.invoice.total + taxe.pivot.amount
      }
      return taxe.total
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

    async printInvoiceA4 () {
      try {
        await invoicePrint(this.invoice, this.userSession)
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Print invoice
     * @param {Object} data invoice saved
     */
    async print () {
      try {
        ticketPrint(this.invoice)
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Alert before send to arca
     * @param {Object} row row
     */
    alertBeforeSend (row) {
      this.$q.dialog({
        title: '¿Está seguro?',
        message: `Esta factura (${row.code}) no se ha enviado a ARCA. una vez enviada no podrá ser modificada, ¿Está seguro de enviar esta factura?`,
        persistent: true,
        ok: {
          label: 'Enviar y guardar',
          color: 'primary',
          icon: 'send'
        },
        cancel: {
          label: 'Cancelar',
          icon: 'close',
          color: 'negative'
        }
      }).onOk(() => {
        this.setInvoiceElectronic(row)
      })
    },

    async getPrinters () {
      try {
        const { data } = await this.$api.get('printers')
        this.printers = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Print command
     */
    async printCommand () {
      try {
        commandPrint(this.invoice)
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddInvoice = false
      this.openEditInvoice = false
      this.coin = {}
    },
    /**
     * Search beneficiary
     * @param  {Object}
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getInvoices(this.params)
    },
    /**
     * Get all invoices
     */
    getInvoices (params = this.params) {
      this.visible = true
      this.$api.get('invoices', { params })
        .then(({ data }) => {
          this.invoices = data.data
          this.visible = false
          this.paginationConfig.rowsNumber = data.total
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
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getInvoices(this.params)
    },
    /**
     * Save invoices
     */
    saveInvoice () {
      this.visible = true
      this.$api.post('invoices', this.invoice)
        .then(({ data }) => {
          this.getInvoices()
          this.openAddInvoice = false
          this.visible = false
          this.invoice = {}
          Notify.create({
            message: 'Factura creada exitosamente',
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
     * Set invoice electronic
     * @param {Object} invoice invoice
     */
    async setInvoiceElectronic (invoice) {
      try {
        loading(true)
        const { data } = await this.$api.post(`invoices/${invoice.id}/electronic`)
        if (data.electronic_invoice?.fields?.error) {
          notify(`Hubo un error al generar la factura: ${data.electronic_invoice.fields.message}`, 'negative', 'warning')
        } else {
          this.invoice = data
          notify('Factura electrónica generada exitosamente', 'positive', 'check_circle')
        }
        this.getInvoices(this.params)
      } catch (error) {
        notify(error?.message || error?.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * View invoice data
     * @param {Object} event event
     * @param {Object} row row
     * @param {Number} index index
     */
    editInvoice (event, row, index) {
      this.invoice = {
        ...row
      }

      console.log(row)

      this.openEditInvoice = true
    },
    /**
     * Opens the gallery at a specific file index
     * @param {Number} index - Index of the file to display
     */
    openGallery (index = 0) {
      this.selectedFileIndex = index
      this.showGallery = true
    },
    /**
     * Model product
     * @param {Object} data product
     */
    modelData (data, put = false) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key]
          if (element && is.object(element)) {
            data[`${key}_id`] = element.id
          }
        }
      }
      return data
    },
    /**
     * Edit invoice
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`invoices/${this.invoice.id}`, this.modelData(this.invoice))
        .then(({ data }) => {
          this.getInvoices()
          this.openEditInvoice = false
          this.visible = false
          this.invoice = null
          Notify.create({
            message: 'Factura editada exitosamente',
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
     * Delete invoice
     */
    deleteInvoice () {
      this.visible = true
      this.$api.delete(`invoices/${this.invoice.id}`)
        .then(({ data }) => {
          this.getInvoices()
          this.openEditInvoice = false
          this.visible = false
          this.invoice = null
          Notify.create({
            message: 'Factura eliminada exitosamente',
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
     * Change status
     * @param {Object} data invoice
     * @param {Number} index index status
     */
    async cancelInvoice  () {
      try {
        this.cancelLoading = true
        await this.$api.put(`invoice-status-command/${this.invoice.id}`, { status: 'cancelled' })
        this.getInvoices()
        notify('Factura anulada exitosamente', 'positive', 'check_circle')
        this.openEditInvoice = false
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.cancelLoading = false
      }
    }
  }
}
</script>

<style scoped>
/* Grid responsivo de archivos adjuntos */
.invoice-files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  width: 100%;
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Item individual de archivo */
.invoice-file-item {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
}

/* Wrapper para efectos */
.invoice-file-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Hover effect - elevación */
.invoice-file-item:hover .invoice-file-wrapper {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Imagen */
.invoice-file-image {
  border-radius: 8px;
}

/* Overlay oscuro en hover */
.invoice-file-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.invoice-file-item:hover .invoice-file-overlay {
  opacity: 1;
}

/* Número de archivo */
.invoice-file-number {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
  z-index: 1;
}

/* PDF Icon Container */
.invoice-pdf-icon {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 8px;
  padding: 12px;
  gap: 8px;
}

/* PDF Filename */
.invoice-pdf-name {
  font-size: 9px;
  font-weight: 500;
  color: #616161;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

/* Responsive - móvil */
@media (max-width: 600px) {
  .invoice-files-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 6px;
  }
}

/* Responsive - tablet */
@media (min-width: 601px) and (max-width: 960px) {
  .invoice-files-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  }
}

/* Scroll personalizado */
.invoice-files-grid::-webkit-scrollbar {
  width: 6px;
}

.invoice-files-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.invoice-files-grid::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 3px;
}

.invoice-files-grid::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}

/* Clases para tarjetas compactas */
.compact-card-header {
  padding: 0.5rem 1rem !important;
}

.compact-card-body {
  padding: 0.5rem 1rem !important;
}

.compact-card-footer {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  padding-top: 0 !important;
}

.compact-total-container {
  padding: 0.5rem !important;
}

@media (max-width: 1023px) {
  /* Reducir padding del top de la tabla - usando deep selector para sobrescribir Quasar */
  :deep(.q-table__top) {
    padding: 0 !important;
  }
  :deep(.q-table__top .flex) {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: center;
  }

  :deep(.q-table__top .q-select) {
    max-width: 200px;
  }

  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}
</style>
