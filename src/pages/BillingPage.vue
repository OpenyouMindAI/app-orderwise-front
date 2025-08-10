<template>
  <q-page padding>
    <div v-if="$route.query.id">
      <span class="text-subtitle1">Factura número: </span>
      <span class="text-subtitle2">{{ invoice?.code }}</span>
    </div>
    <q-form ref="saveBill" @submit="saveBill" style="min-height: calc(100vh - 120px);">
      <div class="row q-col-gutter-x-md">
        <div class="col-12 row q-col-gutter-x-xs">
          <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-12" id="select-client">
            <q-select
              :hide-dropdown-icon="$q.platform.is.nativeMobile"
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
          <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-6">
            <q-select
              :hide-dropdown-icon="$q.platform.is.nativeMobile"
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
          <div v-if="invoiceType.bill" class="col-xl-3 col-lg-3 col-md-3 col-sm-4 col-xs-6">
            <q-select
              v-model="voucherType"
              use-input
              filled
              dense
              label="Tipo de factura (Arca)"
              input-debounce="0"
              option-label="Desc"
              option-value="id"
              :hide-dropdown-icon="$q.platform.is.nativeMobile"
              :options="voucherTypes"
              :rules="[(val) => !!val || 'El campo es requerido.']"
              @filter="getVoucherTypes"
            />
          </div>
          <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-6">
            <q-select
              use-input
              :hide-dropdown-icon="$q.platform.is.nativeMobile"
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
        <div class="col-xs-12 col-sm-7 col-md-7 col-lg-6 col-xl-6 q-col-gutter-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-xl-3 col-lg-12 col-md-12 col-sm-12 col-xs-12 flex justify-between">
              <q-input
                filled
                dense
                v-model="barcode"
                autofocus
                type="number"
                label="Código"
                ref="barcode"
                :style="$q.platform.is.nativeMobile ? 'width: 60%;' : 'width: 100%;'"
                @keyup.enter="processBarcode(barcode)"
                @focus="scanner = false"
                @blur="scanner = true"
              />
              <q-btn
                style="border-radius: 10px; padding: 5px 15px"
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
            <div class="justify-start col-xl-9 col-lg-12 col-md-12 col-sm-12 col-xs-12 flex q-gutter-sm" id="buttons-bar">
              <q-btn
                style="border-radius: 10px; padding: 5px 15px"
                label="Cobrar"
                icon="payments"
                color="positive"
                id="payments"
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
                style="border-radius: 10px; padding: 5px 15px"
                color="primary"
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

              <q-btn
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

              <q-btn
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
            <div class="col-12">
              <!-- Desktop view -->
              <q-table
                v-if="$q.screen.gt.xs"
                row-key="name"
                title="Artículos"
                dense
                hide-pagination
                :rows="products"
                :columns="columns"
                style="max-height: 400px; overflow: auto;"
                :pagination="{ rowsPerPage: 0 }"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="barcode" :props="props">
                      {{ props.row.barcode }}
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ props.row.name.slice(0, 20) }}{{ props.row.name.length > 20 ? '...' : '' }}
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
                            v-if="props.row.product_price_lists && props.row.product_price_lists.length > 0"
                            v-model="priceInputType"
                            val="list"
                            label="Lista de precios"
                          />
                          <q-radio
                            v-if="props.row.product_price_lists && props.row.product_price_lists.length > 0"
                            v-model="priceInputType"
                            val="manual"
                            label="Precio manual"
                          />

                          <!-- Selector de lista de precios -->
                          <q-select
                            v-if="props.row.product_price_lists && props.row.product_price_lists.length > 0 && priceInputType === 'list'"
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
                        v-slot="scope"
                        @update:model-value="calculate(props.row)"
                      >
                        <q-input
                          label="Cantidad"
                          type="number"
                          v-model.number="scope.value"
                          :model-value="Number(scope.value).toFixed(3)"
                          autofocus
                          @keyup.enter="scope.set"
                        />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="subtotal" :props="props">
                      {{ formatNumber(props.row.subtotal) }}
                    </q-td>
                    <q-td key="actions" :props="props">
                      <q-btn icon="delete" size="xs" color="negative" @click="deleteProduct(props)" />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>

              <!-- Mobile view -->
              <div v-else>
                <div class="text-h6 q-mb-md">Artículos</div>
                <div class="q-gutter-y-md">
                  <q-card v-for="(product, index) in products" :key="index" flat bordered class="product-card">
                    <q-card-section>
                      <div class="row items-center justify-between q-mb-sm q-pr-sm">
                        <div class="text-subtitle1 text-weight-bold">
                          {{ product.barcode }} - {{ product.name }}
                        </div>
                        <q-badge floating class="q-pa-none" style="background-color: transparent;">
                          <q-btn icon="delete" size="sm" color="negative" flat round @click="deleteProduct({ row: product })" />
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
                              v-if="userSession.is_root || !setPermissionsByUser(['CJ'])"
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
              <div class="col-6" v-if="typeOfService.code !== 4">
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
              </div>
              <div class="col-6" v-if="typeOfService.code !== 4">
                <q-input type="datetime-local" dense filled v-model="deliveryDate" label="Fecha de entrega" />
              </div>
              <div class="col-12" v-if="typeOfService.code !== 4">
                <q-input type="textarea" filled v-model="invoiceDescription" label="Descripción" autogrow />
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
            <div class="col-12">
              <q-list separator bordered style="border-radius: 10px;">
                <q-item v-if="tableSelected.length">
                  <q-item-section>
                    Mesas
                  </q-item-section>
                  <q-item-section side>
                    {{ tableSelected.length }}
                  </q-item-section>
                </q-item>
                <q-item class="bg-positive text-white text-h5 text-bold" style="border-radius: 10px 10px 0px 0px;">
                  <q-item-section>
                    TOTAL
                  </q-item-section>
                  <q-item-section v-if="coin" side class="text-white">
                    {{ coin.symbol }} {{ formatNumber(totalBill) }}
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
                    {{  coin.symbol }} {{ formatNumber(Math.abs(pendingPayment)) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-sm-5 col-md-5 col-lg-6 col-xl-6">
          <q-table
            v-model:pagination="pagination"
            row-key="name"
            id="pop-products"
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
              <div class="q-pa-xs col-xs-4 col-sm-4 col-md-3 col-lg-2 col-xl-2">
                <q-card class="my-card" style="border-radius: 10px;">
                  <q-img
                    style="height: 120px; width: 100%; border-radius: 10px;"
                    :src="props.row.images[0] ? props.row.images[0].url : 'images/404-image.jpg'"
                    @click="validateProduct(props.row, true)"
                  >
                    <div class="absolute-full text-subtitle1 flex flex-center text-bold text-center">
                      {{ props.row.name.slice(0, 20) }}
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
          <div class="col-xs-12 col-sm-8 col-md-8 col-lg-9 q-gutter-md row">
            <div class="col-12">
              <q-toggle v-if="tableSelected.length && invoice?.id" v-model="tableClose" label="Cerrar mesa" />
              <q-markup-table>
                <thead>
                  <tr>
                    <th class="text-left" v-if="partialBilling">✅</th>
                    <th class="text-left">Método de pago</th>
                    <th class="text-left">Referencia</th>
                    <th class="text-right">Monto</th>
                    <th class="text-right">% Descuento</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(payment, index) in payments" :key="payment.id">
                    <td class="text-left" v-if="partialBilling">
                      <q-checkbox v-model="payment.checked" color="primary"/>
                    </td>
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
                        @update:model-value="appendPayment(payment)"
                      >
                        <q-input
                          v-model="scope.value"
                          autofocus
                          @keyup.enter="scope.set"
                        />
                      </q-popup-edit>
                    </td>
                    <td class="text-right">{{ payment.discount_percentage }}</td>
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
                </tbody>
              </q-markup-table>
            </div>
            <div class="col-12">
              <q-item style="border: none !important">
                  <q-item-section v-if="pendingPayment >= 0">
                    RESTANTE POR COBRAR
                  </q-item-section>
                  <q-item-section v-else>
                    VUELTO
                  </q-item-section>
                  <q-item-section side v-if="coin" class="text-bold text-black">
                    {{  coin.symbol }} {{ formatNumber(Math.abs(pendingPayment)) }}
                  </q-item-section>
                </q-item>
              <q-list separator bordered style="border-radius: 10px;" dense>

                <q-item class="bg-positive text-white text-subtitle1" style="border-radius: 10px 10px 0px 0px; border-top: none !important">
                  <q-item-section>
                    SUBTOTAL
                  </q-item-section>
                  <q-item-section side v-if="coin" class="text-white">
                    {{ coin.symbol }} {{ formatNumber(totalBill) }}
                  </q-item-section>
                </q-item>
                <q-item v-for="paymentMethod in selectedPaymentMethods" :key="paymentMethod.name" v-show="selectedPaymentMethods.length > 0">
                  <q-item-section>
                    {{ paymentMethod.name }}
                    <span v-if="paymentMethod.discount_percentage > 0" class="text-caption text-positive">
                      ({{ paymentMethod.discount_percentage }}% descuento)
                    </span>
                  </q-item-section>
                  <q-item-section side v-if="coin">
                    {{ coin.symbol }} {{ formatNumber(paymentMethod.amount) }}
                    <span v-if="paymentMethod.discountAmount > 0" class="text-positive">
                      (-{{ coin.symbol }} {{ formatNumber(paymentMethod.discountAmount) }})
                    </span>
                  </q-item-section>
                </q-item>
                <!-- Total de descuento -->
                <q-item v-if="discountAmount > 0" class="text-subtitle1">
                  <q-item-section>
                    DESCUENTO TOTAL
                  </q-item-section>
                  <q-item-section side v-if="coin">
                    {{ coin.symbol }} {{ formatNumber(discountAmount) }}
                  </q-item-section>
                </q-item>
                <q-item v-if="discountAmount > 0" class="bg-positive text-white text-h6 text-bold" style="border-radius: 0px 0px 10px 10px;  border-top: none !important">
                  <q-item-section>
                    <q-item-label>TOTAL</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="coin" class="text-white">
                    {{ coin.symbol }} {{ formatNumber(totalWithDiscount) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-gutter-y-sm">
          <q-btn
            label="Factura"
            color="secondary"
            icon="print"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
            @click="savePrintInvoice"
          >
            <q-badge
              color="negative"
              align="bottom"
              floating
              v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
            >
              F7
            </q-badge>
          </q-btn>
          <q-btn
            label="Comanda"
            icon="print"
            @click="submitBill"
            color="warning"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
          >
            <q-badge
              color="negative"
              align="bottom"
              floating
              v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
            >
              F8
            </q-badge>
          </q-btn>
          <q-btn
            label="Guardar sin imprimir"
            @click="saveWithoutPrint"
            color="primary"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
          >
            <q-badge
              color="negative"
              align="bottom"
              floating
              v-if="$q.screen.gt.sm && !$q.platform.is.nativeMobile"
            >
              F9
            </q-badge>
          </q-btn>
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
              :model-value="Number(quantity).toFixed(3)"
              autofocus
              label="Cantidad"
              type="number"
              style="width: 50%;"
              @update:model-value="updateValues('quantity')"
            />
            <q-input
              filled
              v-model.number="currentAmount"
              :model-value="Number(currentAmount).toFixed(2)"
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
    <TransferMpDialog
      v-if="currentPayment"
      :payment="currentPayment"
      :show-modal="showDetailsModal"
    />
    <BarcodeScanner @barcode-scanned="processBarcode" v-if="scanner" />
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatDate, formatNumber, loading, notify, BALANZA_PREFIXES } from 'src/const/mixins'
import DrawerTable from 'src/components/Table/DrawerTable.vue'
import WaitByPaymentMp from 'src/components/Billing/WaitByPaymentMp.vue'
import { apiArca } from 'src/boot/axios'
import { useCommandStore } from 'src/stores/command'
import { usePaymentNotifier } from 'src/boot/payment-notifier'
import { commandPrint, ticketPrint } from 'src/const/printers'
import TransferMpDialog from 'src/components/Billing/TransferMpDialog.vue'
import BarcodeScanner from 'src/components/Billing/ScannerComponent.vue'
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
    DrawerTable,
    WaitByPaymentMp,
    BarcodeScanner,
    TransferMpDialog
  },
  data () {
    return {
      scanner: false,
      /**
       * Show payment details modal
       * @type {Boolean}
       */
      showDetailsModal: false,
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
       * Payment method cash flow
       * @type {Object}
       */
      paymentMethodCashFlow: null,
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
      balanceCode: 0,
      /**
       * Panel
       * @type {String}
       */
      panel: 'debit',
      /**
       * Amount
       * @type {Number}
       */
      amount: null,
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
       * Company config
       * @type {Object}
       */
      companyConfig: {},
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
    /**
     * Pending payment
     * @returns {Number}
     */
    pendingPayment () {
      const totalWithDiscount = this.totalWithDiscount - this.totalPaymentWithDiscount

      if (totalWithDiscount > 0) return this.totalWithDiscount - this.totalPayment

      return totalWithDiscount
    },
    /**
     * Total payment
     * @returns {Number}
     */
    totalPaymentWithDiscount () {
      let totalPayment = 0
      this.payments.forEach((payment) => {
        totalPayment = totalPayment + (payment.amount - payment.discount_amount) || 0
      })
      return totalPayment
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
     * Discount amount - Calcula el descuento total aplicado
     * @returns {Number}
     */
    discountAmount () {
      let totalDiscount = 0
      this.payments.forEach((payment) => {
        if (payment.discount_percentage && payment.discount_percentage > 0) {
          const discountAmount = (payment.amount * payment.discount_percentage) / 100
          totalDiscount += discountAmount
        }
      })
      return totalDiscount
    },
    /**
     * Selected payment methods - Obtiene los métodos de pago seleccionados
     * @returns {Array}
     */
    selectedPaymentMethods () {
      return this.payments.map(payment => ({
        name: payment.name,
        amount: payment.amount,
        discount_percentage: payment.discount_percentage || 0,
        discountAmount: payment.discount_percentage ? (payment.amount * payment.discount_percentage) / 100 : 0
      }))
    },
    /**
     * Total with discount - Total con descuento (visual)
     * @returns {Number}
     */
    totalWithDiscount () {
      return this.totalBill - this.discountAmount
    },
    ...mapState(authentication, ['userSession', 'branchOffice']),
    ...mapState(useCommandStore, ['setInvoice'])
  },
  watch: {
    client (client) {
      this.invoiceShare = { ...this.invoiceShare, client }
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
      this.invoiceShare = {
        ...this.invoiceShare,
        totalBill: this.totalBill,
        totalPayment: this.totalPayment,
        products
      }
    },
    payments: {
      handler (payments) {
        this.$forceUpdate()
        this.invoiceShare = { ...this.invoiceShare, payments }
      },
      deep: true
    },
    async invoiceShare (data) {
      try {
        await this.$api.post('invoice-details-event', {
          invoice: data,
          user_id: this.userSession.id
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
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
    /**
     * Get products with pagination
     */
    this.setPagination({
      pagination: this.pagination,
      filter: undefined
    })
    /**
     * Init keywords button
     */
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
    window.removeEventListener('keydown', () => {
      this.dialogPayment = true
    })
  },
  created () {
    this.getLocalStorage()
    this.getPaymentMethods()
    this.listenPayments()
    if (this.$route?.query?.id) this.getInvoiceOne(this.$route.query.id)
    // document.addEventListener('click', this.handleClick)
  },
  methods: {
    setPermissionsByUser (data) {
      return this.userSession.roles.some(role => data.includes(role.acronym))
    },
    listenPayments () {
      const { company_session: companySession } = this.userSession
      if (companySession?.company_config?.other?.qpay_id) {
        const channel = this.$echoPay.channel('mercado-pago-payment')
        channel.listen(`.mercado-pago-payment.${companySession.company_config.other.qpay_id}.${this.branchOffice.id}`, (data) => {
          const { showPaymentNotification, showDetailsModal, currentPayment } = usePaymentNotifier()
          showPaymentNotification(data.payment)
          this.showDetailsModal = showDetailsModal
          this.currentPayment = currentPayment
        })
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
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      const params = {
        sortOrder: 'desc',
        sortBy: 'sold',
        page: data.pagination.page,
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
     * Add payment
     * @param {Object} data data payment
     */
    addPayment (data) {
      if (!this.hasPendingPayment()) return
      if (data.acronym && data.acronym.toLowerCase() === 'efe') {
        this.promptPaymentAmount(data, true).then(amount => {
          if (amount !== null) {
            const payment = this.createPayment(data, amount)
            this.appendPayment(payment)
          }
        })
      } else {
        const amount = this.pendingPayment
        const payment = this.createPayment(data, amount)
        this.appendPayment(payment)
      }
    },
    /**
     * Has pending payment
     * @returns {Boolean}
     */
    hasPendingPayment () {
      return this.pendingPayment && this.pendingPayment > 0
    },
    /**
     * Create payment
     * @param {Object} data data payment
     * @param {Number} amountToCover amount
     * @returns {Object}
     */
    createPayment (data, amount) {
      return {
        name: data.name,
        acronym: data.acronym,
        amount: parseFloat(amount) || this.pendingPayment,
        reference: null,
        coin_id: this.coin?.id ?? null,
        payment_method_id: data.id,
        user_created_id: this.userSession?.id ?? null,
        discount_percentage: data.percentage || 0,
        discount_amount: data.percentage
          ? ((parseFloat(amount) || this.pendingPayment) * data.percentage) / 100
          : 0
      }
    },
    /**
     * Append payment
     * @param {Object} payment payment
     */
    appendPayment (payment) {
      const paymentFund = this.payments.find(p => p.payment_method_id === payment.payment_method_id)
      if (paymentFund) {
        paymentFund.amount = payment.amount
        paymentFund.discount_amount = payment.amount * (payment.discount_percentage / 100)
      } else {
        this.payments = [...this.payments, payment]
      }
    },
    /**
     * Prompt cash amount
     * @param {Object} data data payment
     * @returns {Promise}
     */
    promptCashAmount (data) {
      return new Promise((resolve) => {
        this.$q.dialog({
          title: data.name || 'Pago en efectivo',
          color: 'primary',
          message: 'Ingrese el monto en efectivo. Si es el monto exacto, presione Aceptar.',
          persistent: true,
          prompt: {
            model: '',
            type: 'number',
            min: 0,
            filled: true,
            label: 'Monto'
          },
          ok: {
            label: 'Aceptar',
            color: 'primary'
          }
        }).onOk(val => {
          const amount = parseFloat(val)
          resolve(!isNaN(amount) && amount > 0 ? amount : this.pendingPayment)
        }).onCancel(() => resolve(this.pendingPayment))
          .onDismiss(() => resolve(this.pendingPayment))
      })
    },
    /**
     * Prompt payment amount - Pregunta el monto para cualquier método de pago
     * @param {Object} data data payment
     * @returns {Promise}
     */
    promptPaymentAmount (data, emptyInput = false) {
      return new Promise((resolve) => {
        const discountText = data.discount_percentage > 0
          ? ` (${data.discount_percentage}% de descuento)`
          : ''

        this.$q.dialog({
          title: `Pago con ${data.name} ${discountText}`,
          color: 'primary',
          message: `Ingrese el monto a pagar con ${data.name}.`,
          persistent: true,
          prompt: {
            model: emptyInput ? '' : this.pendingPayment.toString(),
            type: 'number',
            min: 0,
            filled: true,
            label: 'Monto a pagar'
          },
          ok: { label: 'Aceptar', color: 'primary' },
          cancel: { label: 'Cancelar', color: 'negative' }
        }).onOk(val => {
          const amount = parseFloat(val)
          if (!isNaN(amount) && amount > 0) {
            resolve(amount)
          } else {
            resolve(this.pendingPayment)
          }
        }).onCancel(() => resolve(this.pendingPayment))
          .onDismiss(() => resolve(this.pendingPayment))
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
            subtotal: product.pivot.price * product.pivot.amount,
            product_price_lists: product.product_price_lists
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
      this.invoiceDescription = ''
      this.deliveryDate = formatDate(Date(), 'YYYY-MM-DD HH:mm:ss')
      this.dialogPayment = false
      this.withoutPrint = false
      this.invoicePrinter = false
      this.tableClose = false
      this.calculateTotal()
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
        this.clear()
        this.withoutPrint = false
        return
      }
      if (this.invoicePrinter) {
        await ticketPrint(invoice)
      } else {
        await commandPrint(invoice)
      }
      // if (this.$q.platform.is.nativeMobile) {
      //   const type = this.invoicePrinter ? 'ticket' : 'command'
      //   const quantity = this.invoicePrinter ? 1 : null
      //   await getPrintersB(invoice, quantity, type)
      // } else {
      //   const pdfUrl = doc.output('bloburl')
      //   window.open(pdfUrl, '_blank')
      // }
      this.clear()
    },
    /**
     * Payment model
     * @param {Array} payments payments
     * @returns {Array}
     */
    paymentModel (payments) {
      if (this.pendingPayment < 0) {
        const cash = payments.find(payment => payment.acronym === 'EFE')
        cash.amount = cash.amount - Math.abs(this.pendingPayment)
      }
      return payments.filter(payment => payment.amount > 0)
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
        payments: this.paymentModel(this.payments),
        total_amount: this.totalBill,
        tables: this.tableSelected,
        electronic_invoice: this.invoiceType?.bill,
        voucherType: this.invoiceType?.bill ? this.voucherType : null
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

        if (this.$route.query.id) {
          res = await this.$api.put(`invoices/${this.$route.query.id}`, params)
        } else {
          console.log(params)
          res = await this.$api.post('invoices', params)
        }
        this.printBill(res.data.data)
        notify('Factura guardada exitosamente', 'positive', 'check_circle')
        this.setPagination({
          pagination: this.pagination,
          filter: undefined
        })
      } catch (error) {
        console.log(error)
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
      this.companyConfig = companySession?.company_config
      this.voucherType = companySession?.company_config?.other?.voucher_type
      this.balanceCode = companySession?.company_config?.other?.balance_code
      this.partialBilling = companySession?.company_config?.other?.partial_billing || false
      this.calculateTotal()
    },
    /**
     * Delete product in table
     * @param {Object} product props table products
     */
    deleteProduct (product) {
      this.products.splice(product.rowIndex, 1)
      this.products = [...this.products]
      this.calculateTotal()
    },
    /**
     * Delete invoice payment
     * @param {Number} index value index payments
     */
    deletePayment (index) {
      this.payments.splice(index, 1)
      this.payments = [...this.payments]
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
      this.products = [
        ...this.products,
        {
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
          aliquot_type: product.aliquot_type || product?.category?.aliquot_type,
          unit_of_measure: product.unit_of_measure,
          product_price_lists: product.product_price_lists
        }
      ]
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

      // Resetear valores
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
      // Validación final de stock
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

      // Cálculo preciso con redondeo a 2 decimales
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
          : data.price * quantity
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
     * Resetea cantidades temporales
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
    }
  }
}
</script>
