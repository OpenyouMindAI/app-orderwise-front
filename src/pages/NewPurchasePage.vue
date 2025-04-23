<template>
  <q-page padding>
    <div v-if="$route.query.id">
      <span class="text-subtitle1">Factura número: </span>
      <span class="text-subtitle2">{{ invoice?.code }}</span>
    </div>
    <q-form ref="saveBill" @submit="saveBill" style="min-height: calc(100vh - 120px);">
      <div class="row q-col-gutter-x-md">
        <div class="col-12 row q-col-gutter-x-xs">
          <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
            <q-select
              use-input
              filled
              dense
              label="Cliente"
              input-debounce="0"
              option-value="id"
              v-model="client"
              :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
              :options="clients"
              :rules="[val => !!val || 'El campo es requerido.']"
              @filter="filterClients"
            >
              <template v-slot:append>
                <q-btn color="primary" round icon="add_circle" @click.stop.prevent="(openAddClient = true)" size="sm"/>
              </template>
            </q-select>
          </div>
          <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6">
            <q-select
              use-input
              filled
              dense
              label="Tipo de factura"
              input-debounce="0"
              option-label="name"
              option-value="id"
              v-model="invoiceType"
              :options="invoiceTypes"
              :rules="[val => !!val || 'El campo es requerido.']"
              @filter="filterInvoiceTypes"
            />
          </div>
          <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6">
            <q-select
              use-input
              filled
              dense
              label="Tipo de servicio"
              input-debounce="0"
              option-label="name"
              option-value="id"
              v-model="typeOfService"
              :options="typeOfServices"
              :rules="[val => !!val || 'El campo es requerido.']"
              @filter="filterTypeOfServices"
            />
          </div>
        </div>
        <div class="col-xs-12 col-sm-7 col-md-6 col-lg-5 col-xl-5 q-col-gutter-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-xl-6 col-lg-6 col-md-5 col-sm-5 col-xs-12">
              <q-input
                filled
                dense
                v-model="barcode"
                autofocus
                type="number"
                label="Código"
                @keypress.enter="getOneProduct(this.barcode)"
              >
                <template v-slot:append>
                  <q-btn round color="teal" icon="qr_code" size="sm" @click="modelScan = true"/>
                </template>
              </q-input>
            </div>
            <div class="col-xl-6 col-lg-6 col-md-7 col-sm-7 col-xs-12 flex q-gutter-xs">
              <q-btn
                size="sm"
                color="primary"
                icon="table_restaurant"
                :loading="loadingLivingRoom"
                @click="dialogTable = true"
              >
                <q-badge
                  color="negative"
                  align="bottom"
                  floating
                  v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
                >
                  F6
                </q-badge>
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Seleccionar mesas
                </q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                icon="save"
                color="positive"
                :disable="products.length <= 0"
                @click="dialogPayment = true"
              >
                <q-badge
                  color="negative"
                  align="bottom"
                  floating
                  v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
                >
                  F8
                </q-badge>
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Guardar
                </q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                icon="search"
                color="primary"
                @click="searchInvoice = true"
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
                  Buscar factura
                </q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                icon="payments"
                color="info"
                @click="cashflow = true"
              >
                <q-badge
                  color="negative"
                  align="bottom"
                  floating
                  v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
                >
                  F7
                </q-badge>
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Flujo de dinero
                </q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                icon="clear"
                color="negative"
                @click="clear"
              >
                <q-tooltip class="text-body2" anchor="bottom middle">
                  Limpiar factura en curso
                </q-tooltip>
              </q-btn>
            </div>
            <div class="col-12">
              <q-table
                row-key="name"
                title="Artículos"
                dense
                hide-pagination
                :rows="products"
                :columns="columns"
                :pagination="{ rowsPerPage: 0 }"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="barcode" :props="props">
                      {{ props.row.barcode }}
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ props.row.name }}
                    </q-td>
                    <q-td key="price" :props="props">
                      {{ formatNumber(props.row.price) }}
                      <q-popup-edit
                        v-if="userSession.is_root || userSession.is_super_admin"
                        v-model.number="props.row.price"
                        auto-save
                        v-slot="scope"
                        @update:model-value="calculate(props.row)"
                      >
                        <q-input
                          label="Precio"
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
                    <q-td key="subtotal" :props="props">
                      {{ formatNumber(props.row.subtotal) }}
                    </q-td>
                    <q-td key="actions" :props="props">
                      <q-btn icon="delete" size="xs" color="negative" @click="deleteProduct(props)"/>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
            <div class="col-12">
              <q-list dense separator>
                <q-item v-if="tableSelected.length">
                  <q-item-section>
                    Mesas
                  </q-item-section>
                  <q-item-section side>
                    {{ tableSelected.length }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    Op Gravada
                  </q-item-section>
                  <q-item-section side v-if="coin">
                    {{ coin.symbol }} {{ formatNumber(totalBill) }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    Monto pagado
                  </q-item-section>
                  <q-item-section class="text-positive" side v-if="coin">
                    {{  coin.symbol }} {{ formatNumber(totalPayment) }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    Por pagar
                  </q-item-section>
                  <q-item-section side v-if="coin">
                    {{  coin.symbol }} {{ formatNumber(pendingPayment) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-12 q-gutter-xs q-mt-md">
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
              <q-input type="datetime-local" dense filled v-model="deliveryDate" label="Fecha de entrega" />
              <q-input type="textarea" filled v-model="invoiceDescription" label="Descripción" autogrow />
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
        <div class="col-xs-12 col-sm-5 col-md-6 col-lg-7 col-xl-7">
          <q-table
            v-model:pagination="pagination"
            row-key="name"
            dense
            grid
            style="max-height: calc(100vh - 190px); overflow: auto;"
            binary-state-sort
            :loading="loadingProducts"
            :rows="allProducts"
            :columns="productColumns"
            :filter="filter"
            no-data-label="Registro no encontrado"
            @request="setPagination"
          >
            <template v-slot:top>
              <div class="row full-width q-col-gutter-xs">
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
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
              </div>
            </template>
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                <q-card class="my-card">
                  <q-img
                    style="height: 150px; width: 100%"
                    :src="props.row.images[0] ? props.row.images[0].url : 'images/404-image.jpg'"
                    @click="validateProduct(props.row, true)"
                  >
                    <div class="absolute-full text-subtitle1 flex flex-center text-bold text-center">
                      {{ props.row.name }}
                      <q-badge v-if="!validStockProduct(props.row, 1)" color="negative" floating style="top: 3px; right: 3px;">
                        Sin stock
                      </q-badge>
                    </div>
                  </q-img>
                </q-card>
              </div>
            </template>
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>
        </div>
      </div>
    </q-form>
    <q-dialog v-model="modelScan">
      <q-card>
        <q-card-section class="q-pb-none q-pt-xs q-px-xs bg-dark">
          <stream-barcode-reader @debarcode="getOneProduct"/>
        </q-card-section>
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
              <q-toggle v-if="tableSelected.length && invoice?.id" v-model="tableClose" label="Cerrar mesa" />
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
          <q-btn
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
          />
          <q-btn
            label="Guardar sin imprimir"
            @click="saveWithoutPrint"
            color="primary"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogTable" maximized>
      <drawer-table
        ref="drawerTable"
        :tablesSelected="tableSelected"
        @update:tableSelected="setTableSelected"
        @update:invoice="selectInvoice"
        @update:freeTable="freeTable"
      >
        <template v-slot:footer>
          <q-card-actions align="right">
            <q-btn color="negative" label="Cerrar" @click="dialogTable = false"/>
            <q-btn color="primary" label="Aceptar" @click="dialogTable = false"/>
          </q-card-actions>
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
          <q-form @submit="getInvoiceOne(search)" class="row full-width items-center justify-between">
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
    <q-dialog v-model="cashflow" :maximized="$q.screen.lt.sm">
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 700px; max-width: 80vw;'">
        <q-form @submit="saveCashflow" class="column full-height">
          <q-card-section class="q-py-sm flex justify-between items-center bg-primary text-white">
            <span class="text-h6">Flujo de dinero</span>
            <q-btn flat icon="close" round size="md" v-close-popup/>
          </q-card-section>
          <q-card-section class="col">
            <div class="full-width row q-gutter-y-sm">
              <div class="col-12">
                <q-option-group
                  v-model="panel"
                  inline
                  :options="[
                    { label: 'Entrada', value: 'debit' },
                    { label: 'Salida', value: 'credit' }
                  ]"
                />
              </div>
              <div class="column col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                <q-radio
                  v-for="paymentMethod in paymentMethods"
                  :key="paymentMethod.id"
                  color="primary"
                  v-model="paymentMethodCashFlow"
                  :label="paymentMethod.name"
                  :val="paymentMethod.id"
                />
              </div>
              <div class="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-xs-12 q-gutter-sm">
                <q-input
                  name="amount"
                  autocomplete="amount"
                  v-model="amount"
                  color="primary"
                  label="Monto"
                  filled
                  clearable
                  type="amount"
                  required
                  autofocus
                />
                <q-input
                  name="description"
                  autocomplete="description"
                  v-model="description"
                  color="primary"
                  label="Descripción"
                  filled
                  clearable
                  type="textarea"
                  autogrow
                  required
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" color="primary" label="Guardar" icon="save" :loading="loadingCashflow"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddClient" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveClient">
          <q-card-section class="row items-center q-py-sm bg-primary text-white">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="(openAddClient = false)" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                autofocus
                label="Tipo de documento"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="clientAdded.document_type"
                :options="documentTypes"
                @filter="getDocumentTypes"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.document_number"
                label="Número de documento"
              />
                <!-- :rules="[val => !!val || 'El campo es requerido.']" -->
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="clientAdded.name"
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Condición de IVA"
                input-debounce="0"
                option-label="name"
                option-value="code"
                v-model="clientAdded.condition_iva_receptor"
                :options="conditionIvaReceptors"
                @filter="getConditionIvaReceptor"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.phone_number"
                label="Número de teléfono"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.address"
                label="Dirección"
                type="textarea"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="loadingClient"/>
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
  </q-page>
</template>

<script>
import { StreamBarcodeReader } from 'vue-barcode-reader'
import { Notify } from 'quasar'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatDate, formatNumber, loading, notify } from 'src/const/mixins'
import { printInvoice, printTicket } from 'src/const/invoice'
import DrawerTable from 'src/components/Table/DrawerTable.vue'
import WaitByPaymentMp from 'src/components/Billing/WaitByPaymentMp.vue'
import { apiArca } from 'src/boot/axios'
export default {
  name: 'BillingPage',
  components: {
    StreamBarcodeReader,
    DrawerTable,
    WaitByPaymentMp
  },
  data () {
    return {
      waitingPayment: false,
      loadingBilling: false,
      paymentMethodCashFlow: null,
      loadingSearch: false,
      documentTypes: [],
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
       * Panel
       * @type {String}
       */
      panel: 'debit',
      /**
       * Amount
       * @type {Number}
       */
      amount: 0,
      /**
       * Loading cashflow
       * @type {Boolean}
       */
      loadingCashflow: false,
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
       * Cashflow dialog
       * @type {Boolean}
       */
      cashflow: false,
      /**
       * Delivery date
       * @type {String}
       */
      deliveryDate: formatDate(Date(), 'YYYY-MM-DD HH:mm:ss'),
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
      clientAdded: {},
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
       * Exchange rate
       * @type {Number}
       */
      exchangeRate: 0,
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
          name: 'price',
          align: 'right',
          label: 'Precio',
          field: 'price',
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
        { name: 'price', align: 'right', label: 'Precio de venta', field: 'price', sortable: true },
        { name: 'quantity', align: 'right', label: 'Cantidad', field: 'quantity', sortable: true },
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
    ...mapState(authentication, ['userSession', 'branchOffice'])
  },
  watch: {
    quantityDialog (data) {
      if (!data) {
        this.quantity = 1
        this.currentAmount = 0
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
      if (e.key === 'F6') {
        e.preventDefault()
        this.dialogTable = !this.dialogTable
      }
      if (e.key === 'F7') {
        e.preventDefault()
        this.cashflow = !this.cashflow
      }
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
        if (this.invoice) {
          this.invoicePrinter = true
          this.printBill(this.invoice)
        }
      }

      if (e.key === 'F4') {
        if (this.invoice) {
          e.preventDefault()
          this.printBill(this.invoice)
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
    if (this.$route?.query?.id) this.getInvoiceOne(this.$route.query.id)
  },
  methods: {
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
     * @param {String} value Value filter
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
     * Set table selected
     * @param {Object} data table selected
     */
    setTableSelected (data) {
      this.tableSelected = data
    },
    /**
     * Save cashflow
     */
    async saveCashflow () {
      try {
        if (!this.paymentMethodCashFlow) {
          notify('Debe seleccionar un método de pago', 'negative', 'warning')
          return
        }
        this.loadingCashflow = true
        await this.$api.post('cashflow', {
          description: this.description,
          amount: this.amount,
          branch_office_id: this.branchOffice?.id,
          type_cashflow: this.panel,
          payment_method_id: this.paymentMethodCashFlow
        })
        this.$q.notify({
          message: 'Entrada/Salida guardada',
          icon: 'check_circle',
          color: 'positive'
        })
        this.cashflow = false
        this.amount = 0
        this.description = ''
        this.panel = 'debit'
      } catch (error) {
        this.$q.notify({
          message: error.message,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loadingCashflow = false
      }
    },
    /**
     * Save clients
     */
    saveClient () {
      this.loadingClient = true
      this.$api.post('clients', this.clientAdded)
        .then(({ data }) => {
          this.openAddClient = false
          this.clientAdded = {}
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
     * Save without print
     */
    saveWithoutPrint () {
      this.withoutPrint = true
      this.$refs.saveBill.submit()
    },
    /**
     * Save without print
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
      loading(true)
      const invoiceOne = table.invoices[0]
      await this.getInvoiceOne(invoiceOne.id)
      this.dialogTable = false
      loading(false)
    },
    /**
     * Free table
     * @param {Object} table  table data
     */
    async freeTable (table) {
      try {
        await this.selectInvoice(table)
        this.tableClose = true
        setTimeout(() => {
          this.dialogPayment = true
        }, 200)
      } catch (error) {
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
    getAllProducts (params) {
      this.loadingProducts = true
      this.$api.get('products', {
        params: {
          ...params,
          branch_office_id: this.branchOffice?.id,
          stock: true,
          withStock: true,
          mostSold: true,
          dataEqualFilter: {
            category_id: this.category ? this.category.id : null
          }
        }
      })
        .then(({ data }) => {
          this.allProducts = data.data
          this.pagination.rowsNumber = data.total
          this.loadingProducts = false
        })
        .catch(err => {
          this.loadingProducts = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
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
        if (invoice.branch_office_id !== this.branchOffice.id) {
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
            quantity: product.pivot.amount,
            subtotal: product.pivot.price * product.pivot.amount
          }
        })
        this.client = invoice.client
        this.invoiceType = invoice.invoice_type
        this.typeOfService = invoice.type_of_service
        this.tableSelected = invoice.tables.map(table => table.id)
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
      this.payments = []
      this.products = []
      this.tableSelected = []
      this.products = []
      this.invoiceDescription = ''
      this.deliveryDate = formatDate(Date(), 'YYYY-MM-DD HH:mm:ss')
      this.dialogPayment = false
      this.withoutPrint = false
      this.invoicePrinter = false
      this.tableClose = false
      this.calculateTotal()
      this.$router.push({ name: 'Billing' })
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
      let doc = null
      const invoice = await this.getInvoiceOneRequest(data.id)

      if (!invoice) {
        notify('Error al obtener la factura', 'negative', 'warning')
        return
      }

      if (this.withoutPrint) {
        this.clear()
        this.withoutPrint = false
        return
      }

      if (this.invoicePrinter) {
        doc = await printInvoice(invoice, this.userSession)
      } else {
        doc = await printTicket(invoice, this.userSession)
      }

      const pdfUrl = doc.output('bloburl')
      window.open(pdfUrl, '_blank')
      this.clear()
    },
    /**
     * Set invoice model
     * @returns {Object}
     */
    setModelInvoice () {
      return {
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
        exchange_rate: this.exchangeRate,
        delivery_date: this.deliveryDate,
        branch_office_id: this.branchOffice?.id,
        products: this.products,
        status: this.invoice?.status || this.typeOfService.code === 4 ? 'delivered' : 'pending',
        payments: this.payments.filter(payment => payment.amount > 0),
        total_amount: this.totalBill,
        tables: this.tableSelected,
        electronic_invoice: this.invoiceType?.bill
      }
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
     * Save bill and payments
     */
    async saveBill () {
      try {
        this.loadingBilling = true
        const params = this.setParamsBill()
        let res = null
        if (!params) return

        if (this.$route.query.id) {
          res = await this.$api.put(`invoices/${this.$route.query.id}`, params)
        } else {
          res = await this.$api.post('invoices', params)
        }
        this.printBill(res.data.data)
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
      this.client = companySession?.company_config?.client
      this.invoiceType = companySession?.company_config?.invoice_type
      this.typeOfService = companySession?.company_config?.type_of_service
      this.coin = companySession?.company_config?.coin
      this.calculateTotal()
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
     * Delete invoice payment
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

    validStockProduct (data, amount) {
      data.stock = data.is_bundle ? data.bundle_stock : data.normal_stock
      if (!data.skip_stock) return data.stock >= amount
      return true
    },
    /**
     * Calculate the total and subtotal
     * @param {Object} data props products
     */
    calculate (data) {
      if (this.validStockProduct(data, data.quantity)) {
        data.amount = data.quantity
        data.subtotal = data.price * data.quantity
        this.calculateTotal()
      } else {
        notify(
          `No hay stock suficiente para ${data.name} cantidad de stock: ${data.stock}`,
          'negative',
          'warning'
        )

        data.amount = data.stock
        data.quantity = data.stock
      }
    },
    /**
     * Push product
     * @param {Object} product product
     */
    pushProduct (product) {
      this.products.push({
        id: product.id,
        name: product.name,
        price: product.price,
        amount: product.quantity,
        quantity: product.quantity,
        subtotal: product.subtotal,
        product_id: product.id,
        cost: product.cost,
        barcode: product.barcode,
        normal_stock: product.normal_stock,
        bundle_stock: product.bundle_stock,
        skip_stock: product.skip_stock,
        is_bundle: product.is_bundle,
        aliquot_type: product.aliquot_type || product?.category?.aliquot_type
      })
    },
    /**
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data, validUnitMeasurement = false) {
      const findProduct = this.products.find(product => product.id === data.id)
      const unitMeasurement = data?.unit_of_measure?.acronym === 'KG'

      if (validUnitMeasurement && unitMeasurement) {
        this.quantityDialog = true
        this.currentAmount = data.price
        this.productQuantity = data
        return
      }
      if (!this.validStockProduct(data, this.quantity)) {
        notify(
          `No hay stock suficiente para ${data.name}`,
          'negative',
          'warning'
        )
        return
      }

      if (findProduct) {
        const quantity = unitMeasurement ? this.quantity : findProduct?.quantity + 1
        findProduct.quantity = quantity
        findProduct.amount = quantity
        findProduct.product_id = findProduct.id
        this.calculate(findProduct)
      } else {
        data.product_id = data.id
        data.quantity = this.quantity
        if (this.currentAmount) {
          data.amount = this.currentAmount / this.productQuantity.price
          data.subtotal = this.currentAmount
          this.pushProduct(data)
          this.calculateTotal()
        } else {
          data.amount = this.quantity
          this.calculate(data)
          this.pushProduct(data)
          this.calculateTotal()
        }
      }
      this.quantity = 1
      this.currentAmount = 0
      this.quantityDialog = false
    },
    /**
     * Get one product
     * @param {Number} barcode barcode product
     */
    async getOneProduct (barcode = this.barcode) {
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
    }
  }
}
</script>
