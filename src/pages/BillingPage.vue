<template>
  <q-page padding>
    <div v-if="$route.query.id">
      <span class="text-subtitle1">Factura número: </span>
      <span class="text-subtitle2">{{ invoice?.code }}</span>
    </div>
    <q-form ref="saveBill" @submit="saveBill" style="min-height: calc(100vh - 120px);">
      <div class="row q-col-gutter-x-md">
        <div class="col-12 row q-col-gutter-x-xs">
          <div class="col-xl-2 col-lg-3 col-md-3 col-sm-6 col-xs-12" id="select-client">
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
          <div class="col-xl-2 col-lg-2 col-md-3 col-sm-6 col-xs-6">
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
          <div v-if="invoiceType.bill" class="col-xl-2 col-lg-2 col-md-2 col-sm-3 col-xs-6">
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
          <div class="col-xl-2 col-lg-2 col-md-2 col-sm-4 col-xs-6">
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
          <div class="col-xl-2 col-lg-2 col-md-2 col-sm-4 col-xs-6">
            <q-input
              filled
              dense
              v-model="invoiceCreatedAt"
              label="Fecha de factura"
              type="datetime-local"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>
          <div class="col-xl-2 col-lg-2 col-md-2 col-sm-3 col-xs-6" v-if="openCashBox">
            <q-btn
              style="border-radius: 10px; padding: 5px 15px; margin-top: 4px;"
              dense
              :icon="isUserBoxOpen ? 'highlight_off' : 'point_of_sale'"
              :color="isUserBoxOpen ? 'negative' : 'primary'"
              :label="isUserBoxOpen ? 'Cerrar caja' : 'Abrir caja'"
              @click="handleCashBoxButtonClick"
            >
              <q-tooltip class="text-body2" anchor="bottom middle">
                {{ isUserBoxOpen ? 'Cerrar caja' : 'Abrir caja' }}
              </q-tooltip>
            </q-btn>
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
              <div class="col-6" v-if="typeOfService.code !== '4'">
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
              <div class="col-12">
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
              <div class="col-12">
                <q-list separator bordered style="border-radius: 10px;">
                  <q-item v-if="exchangeRate">
                    <q-item-section>
                      Tasa del dia
                    </q-item-section>
                    <q-item-section side>
                      {{ exchangeRate.coin?.symbol }} {{ formatNumber(exchangeRate.amount) }}
                    </q-item-section>
                  </q-item>
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
                      <div  style="display: flex; gap: 10px;">
                        <span>
                          {{ coin.symbol }} {{ formatNumber(totalBill) }}
                        </span>
                        <span v-if="exchangeRate">|</span>
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
                      <div style="display: flex; gap: 10px;">
                        <span>
                          {{ coin.symbol }} {{ formatNumber(Math.abs(pendingPayment)) }}
                        </span>
                        <span v-if="exchangeRate">|</span>
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
        </div>
        <div class="col-xs-12 col-sm-5 col-md-5 col-lg-6 col-xl-6" ref="productsSection">
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
              <div class="col-xs-4 col-sm-4 col-md-3 col-lg-2 col-xl-2" style="padding: 1px;">
                <q-card class="my-card" style="border-radius: 10px;">
                  <q-img
                    style="height: 150px; width: 100%; border-radius: 10px;"
                    :src="props.row.images[0] ? props.row.images[0].url : 'images/404-image.jpg'"
                    @click="props.row.is_promotion ? openPromoDialog(props.row) : validateProduct(props.row, true)"
                  >
                    <div class="absolute-full text-body2 flex flex-center text-bold text-center">
                      {{ props.row.name }}
                      <q-badge v-if="!validStockProduct(props.row, 1)" color="negative" floating style="top: 3px; right: 3px;">
                        Sin stock
                      </q-badge>
                    </div>
                    <q-tooltip class="text-body2">
                      {{props.row.name}}
                    </q-tooltip>
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
      :cashier-id="userSession.id"
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
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-checkbox
                v-model="clientAdded.is_credit"
                label="¿Maneja cuenta corriente?"
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
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
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
import PaymentModal from 'src/components/PaymentModal.vue'
import CashBoxDialog from 'src/components/Billing/CashBoxDialog.vue'
import CashflowModal from 'src/components/CashflowModal.vue'
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
    CashflowModal
  },
  data () {
    return {
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
    ...mapState(authentication, ['userSession', 'branchOffice']),
    branchOfficeCharged () {
      return this.branchOffice
    },
    currentGroup () {
      return this.currentPromo?.promotion_details?.[this.currentGroupIndex]
    },
    pendingPayment () {
      const totalPayments = this.payments.reduce((total, payment) => {
        return total + (payment.amount || 0)
      }, 0)
      return this.totalBill - totalPayments
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
  },
  created () {
    this.getLocalStorage()
    this.getPaymentMethods()
    this.listenPayments()
    this.getExchangeRates()
    this.checkCashBoxStatus()
    if (this.$route?.query?.id) this.getInvoiceOne(this.$route.query.id)
    // document.addEventListener('click', this.handleClick)
  },
  methods: {
    /**
     * Get exchange rate
     */
    getExchangeRates () {
      this.$api.get('exchange-rates', {
        params: {
          paginate: true,
          perPage: 1,
          page: 1,
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.exchangeRate = data?.data?.[0]
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
     * Set permissions by user
     * @param {Array} data - Array of permissions
     */
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
          this.allProducts = data.data.map(product => ({
            ...product,
            product_price_lists: [
              ...(product.product_price_lists || []),
              {
                name: 'Precio base',
                price: product.price
              }
            ]
          }))
          this.pagination.rowsNumber = data.total
          this.fetchPromotions()
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
      this.payments = []
      this.products = []
      this.resetProductSelection()
      this.tableSelected = []
      this.invoiceDescription = ''
      this.invoiceCreatedAt = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
      this.deliveryDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
      this.dialogPayment = false
      this.withoutPrint = false
      this.invoicePrinter = false
      this.tableClose = false

      // Limpiar campos de dirección
      this.address = null
      this.formattedAddress = ''
      // Reiniciar el componente AddressComponent incrementando su key
      this.addressComponentKey += 1

      this.calculateTotal()

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

      // Don't clear automatically - let PaymentModal handle table close
    },
    /**
     * Set invoice model
     * @returns {Object}
     */
    setModelInvoice () {
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
        payments: this.payments.filter(payment => payment.amount > 0),
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

      console.log('=== SET PARAMS BILL ===', {
        invoiceType: this.invoiceType,
        pendingPayment: this.pendingPayment,
        withoutPayment: this.withoutPayment,
        withServiceType: this.withServiceType,
        products: this.products
      })

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
          res = await this.$api.post('invoices', params)
        }
        this.printBill(res.data.data)
        notify('Factura guardada exitosamente', 'positive', 'check_circle')

        // Cerrar modal y limpiar después de guardar exitoso
        this.dialogPayment = false
        if (!this.tableClose && !this.withoutPrint && !this.invoicePrinter) {
          // Solo limpiar si no hay flags especiales activos
          setTimeout(() => this.clear(), 500)
        }
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
              branch_office_id: this.branchOffice.id
            }
          }
        })

        const allBoxes = response.data || []

        this.availableCashBoxes = allBoxes
          .filter(box => box.branch_office_id === this.branchOffice.id && !box.deleted_at)
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

/* Estilos específicos de BillingPage (los estilos comunes ahora están en app.scss) */
.product-container {
  position: relative;
}
</style>
