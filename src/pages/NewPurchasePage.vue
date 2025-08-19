<template>
  <q-page padding>
    <div v-if="$route.query.id">
      <span class="text-subtitle1">Factura número: </span>
      <span class="text-subtitle2">{{ purchase?.purchase_number }}</span>
    </div>
    <q-form ref="saveBill" @submit="saveBill" style="min-height: calc(100vh - 120px);">
      <div class="row q-col-gutter-x-md">
        <div class="col-12 row q-col-gutter-x-xs">
          <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <q-input
              filled
              dense
              v-model="purchaseCode"
              autofocus
              label="Numero de factura"
            />
          </div>
          <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <q-select
              use-input
              filled
              dense
              label="Proveedor"
              input-debounce="0"
              option-value="id"
              v-model="provider"
              :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
              :options="providers"
              :rules="[val => !!val || 'El campo es requerido.']"
              @filter="filterProviders"
            >
              <template v-slot:append>
                <q-btn color="primary" round icon="add_circle" @click.stop.prevent="(openAddProvider = true)" size="sm"/>
              </template>
            </q-select>
          </div>
          <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-6">
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
          <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-6">
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
                @keypress.enter="getOneProduct"
              >
                <template v-slot:append>
                  <q-btn round color="teal" icon="add_circle" size="sm" @click="openAddProduct = true"/>
                </template>
              </q-input>
            </div>
            <div class="col-xl-6 col-lg-6 col-md-7 col-sm-7 col-xs-12 flex q-gutter-xs">
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
              <!-- <div class="flex q-mt-sm" v-if="purchase" style="gap: 15px;">
                <q-btn
                  color="primary"
                  icon="print"
                  label="Imprimir factura"
                  @click="() => { invoicePrinter = true; printBill(purchase) }"
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
                  @click="() => { invoicePrinter = false; printBill(purchase) }"
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
              </div> -->
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

    <q-dialog v-model="openAddProduct" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 1200px; max-width: 95vw;">
        <q-card-section class="row items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Agregar producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="saveProduct" ref="formAddProduct">
          <q-card-section class="scroll " style="height: calc(100vh - 200px);">
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
                            <q-icon name="qr_code_scanner" size="sm" class="cursor-pointer" @click.stop="startScanner" />
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
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12 flex justify-start items-center">
                        <q-option-group
                          v-model="unitOfMeasure"
                          :options="unitOfMeasures"
                          color="positive"
                          inline
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
                    </div>

                    <!-- Lista de precios adicionales -->
                    <div class="q-mb-md">
                      <div class="flex items-center justify-between q-mb-sm">
                        <span class="text-body1 text-weight-medium">Listas de precios adicionales</span>
                        <q-btn
                          color="positive"
                          icon="add"
                          label="Agregar lista"
                          size="sm"
                          @click="addPriceLis"
                          unelevated
                        />
                      </div>

                      <div v-if="priceLists.length === 0" class="text-center q-pa-md text-grey-6">
                        <q-icon name="list_alt" size="2rem" class="q-mb-sm" />
                        <div>No hay listas de precios adicionales</div>
                      </div>

                      <q-card
                        v-for="(priceList, index) in priceLists"
                        :key="index"
                        flat
                        bordered
                        class="q-mb-sm"
                      >
                        <q-card-section class="q-pa-sm">
                          <div class="row q-col-gutter-sm items-center">
                            <div class="col-5">
                              <q-input
                                v-model="priceList.name"
                                label="Nombre de la lista"
                                filled
                                dense
                                :rules="[val => !!val || 'El precio mínimo es 3']"
                              />
                            </div>
                            <div class="col-5">
                              <q-input
                                v-model="priceList.price"
                                label="Precio"
                                type="number"
                                step=".01"
                                :rules="[val => val >= 1 || 'El precio mínimo es 3']"
                                filled
                                dense
                              />
                            </div>
                            <div class="col-2 text-right">
                              <q-btn
                                icon="delete"
                                color="negative"
                                size="sm"
                                round
                                flat
                                @click="removePriceList(index)"
                              >
                                <q-tooltip>Eliminar lista</q-tooltip>
                              </q-btn>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="row q-col-gutter-sm">
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
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
                        @click="$refs.fileInput.click()"
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
                          v-model="product.is_bundle"
                          label="Pack"
                          :true-value="1"
                          :false-value="0"
                          color="positive"
                        />
                      </div>
                      <div class="col-6">
                        <q-toggle
                          v-model="product.is_addons"
                          label="Es un adicional"
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
                    <div
                      class="q-mt-md"
                      v-if="product.is_addons"
                    >
                      <q-select
                        use-input
                        filled
                        label="Productos a asociar"
                        input-debounce="0"
                        option-label="name"
                        option-value="id"
                        multiple
                        v-model="addonsProducts"
                        :options="addonsProductsOptions"
                        :rules="[val => !!val || 'El campo es requerido.']"
                        @filter="filterProductsAddons"
                        dense
                      />
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
    <!-- <q-dialog v-model="modelScan">
      <q-card>
        <q-card-section class="q-pb-none q-pt-xs q-px-xs bg-dark">
          <stream-barcode-reader @debarcode="getOneProduct"/>
        </q-card-section>
      </q-card>
    </q-dialog> -->

    <q-dialog  v-model="addPriceList">
      <h1>HOLAA</h1>
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
    <q-dialog v-model="openAddProvider" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveProvider">
          <q-card-section class="row items-center q-py-sm bg-primary text-white">
            <div class="text-h6">Agregar proveedor</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="(openAddProvider = false)" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="providerAdded.document_number"
                label="Número de documento"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="providerAdded.name"
                label="Nombre"
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
export default {
  name: 'BillingPage',
  components: {
    // StreamBarcodeReader,
    WaitByPaymentMp
  },
  data () {
    return {
      waitingPayment: false,
      purchaseCode: null,
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
      deliveryDate: formatDate(Date(), 'YYYY-MM-DD HH:mm:ss'),
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
      providers: [],
      /**
       * Client to billing
       * @type {Object}
       */
      provider: null,
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
       * @type {Array}
       */
      aliquotTypes: [],
      categoryAdd: null,
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
        is_bundle: 0,
        show_catalog: 0,
        is_addons: 0,
        skip_stock: 0,
        profit_percentage: 0,
        images: []
      },
      /**
       * product price list
       * @type {Array}
       */
      priceLists: [],
      isDragOver: false,
      addPriceList: false,
      /**
       * Open dialog to add products
       * @type {Boolean}
       */
      openAddProduct: false,
      addonsProducts: [],
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
    openAddProduct (data) {
      this.tab = 'basicData'
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
    if (this.$route?.query?.id) this.getInvoiceOne(this.$route.query.id)
  },
  methods: {

    testCOSAS () {
      this.addPriceList = true
      console.log(this.addPriceList)
    },
    /**
     * Update values
     * @param {String} inputName input name
     */
    updateValues (inputName) {
      if (inputName === 'quantity') {
        this.currentAmount = this.roundToFourDecimals(this.quantity * this.productQuantity.cost)
      } else if (inputName === 'currentAmount') {
        this.quantity = this.roundToFourDecimals(this.currentAmount / this.productQuantity.cost)
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
     * Get all products
     * @param {Object} params params to search
     */
    async getAllProducts (params) {
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
        this.allProducts = data.data
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
              purchase_number: id,
              purchase_code: id
            }
          }
        })
        return data.data[0]
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
        this.deliveryDate = purchase.delivery_date
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
      this.deliveryDate = formatDate(Date(), 'YYYY-MM-DD HH:mm:ss')
      this.dialogPayment = false
      this.withoutPrint = false
      this.invoicePrinter = false
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
     * Set purchase model
     * @returns {Object}
     */
    setModelInvoice () {
      return {
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
        if (!params) return

        if (this.$route.query.id) {
          await this.$api.put(`purchases/${this.$route.query.id}`, params)
        } else {
          await this.$api.post('purchases', params)
        }
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
      data.subtotal = data.cost * data.quantity
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
        subtotal: product.subtotal || parseFloat(((product.quantity || 1) * (product.cost || 0)).toFixed(2)),
        product_id: product.id,
        cost: product.cost,
        barcode: product.barcode
      })
    },
    /**
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data, validUnitMeasurement = false) {
      const findProduct = this.products.find(product => product.id === data.id)
      const unitMeasurement = data?.unit_of_measure?.acronym === 'KG'
      data.cost = data?.cost || 0
      if (validUnitMeasurement && unitMeasurement) {
        this.quantityDialog = true
        this.currentAmount = data.cost
        this.productQuantity = data
        return
      }

      if (findProduct) {
        const quantity = unitMeasurement ? this.quantity : findProduct?.quantity
        findProduct.quantity = quantity
        findProduct.product_id = findProduct.id
        this.calculate(findProduct)
      } else {
        data.product_id = data.id
        data.quantity = this.quantity
        if (this.currentAmount) {
          data.quantity = this.currentAmount / this.productQuantity.cost
          data.subtotal = this.currentAmount
          this.pushProduct(data)
          this.calculateTotal()
        } else {
          data.quantity = this.quantity
          this.calculate(data)
          this.pushProduct(data)
          this.calculateTotal()
        }
      }
      this.quantity = 1
      this.currentAmount = 0
      this.quantityDialog = false
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
    handleFileSelect (event) {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.product.images.push({
              image: file,
              url: e.target.result,
              // Añadir un ID temporal para manejar mejor las imágenes
              tempId: Date.now() + Math.random().toString(36).substring(2)
            })
          }
          reader.readAsDataURL(file)
        }
      })
      // Limpiar el input para permitir seleccionar las mismas imágenes otra vez
      this.$refs.fileInput.value = ''
    },

    deleteImageadd (image, index) {
      if (image.tempId || image.id) {
        if (image.id) {
          this.$api.delete(`product-images/${image.id}`)
            .then(() => {
              this.product.images.splice(index, 1)
            })
            .catch(err => {
              notify('Error al eliminar la imagen', 'negative')
              console.error(err)
            })
        } else {
          this.product.images.splice(index, 1)
        }
      }
    },
    async getUnitOfMeasures () {
      try {
        const { data } = await this.$api.get('unit-of-measures')
        this.unitOfMeasures = data.map(unit => ({ label: unit.name, value: unit.id }))
        this.unitOfMeasure = this.unitOfMeasures[0]?.value
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
      console.log(payload)
      this.$api.post('products', payload)
        .then(({ data }) => {
          this.getProducts()
          this.openAddProduct = false
          this.visible = false
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
    addPriceLis () {
      this.priceLists.push({
        name: `Lista ${this.priceLists.length + 1}`,
        price: null
      })
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
    }
  }
}
</script>
