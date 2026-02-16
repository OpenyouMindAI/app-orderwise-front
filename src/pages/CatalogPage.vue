<template>
  <q-layout view="lHh lpr lFf">
    <q-page-container>
      <q-page :class="$q.screen.lt.sm ? 'q-pb-xl q-mb-lg' : 'items-center column'">
    <div class="header-container full-width">
      <div
        class="header-banner relative-position shadow-2"
        :style="{ backgroundImage: `url(${company?.company_config.other?.menu?.banner_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800'})` }"
      >
        <div class="banner-overlay"></div>
        <div class="header-content column items-center full-width q-pa-md">
          <q-avatar size="100px" class="profile-avatar shadow-5">
            <q-img :src="company?.url || 'https://cdn.quasar.dev/img/avatar.png'" />
          </q-avatar>
          <div class="text-h4 text-white text-bold q-mt-md text-uppercase company-name">
            {{ company?.name }}
          </div>
          <div
            v-if="company?.company_config.other?.menu?.description"
            class="text-subtitle2 text-white text-weight-light q-mt-xs description-text text-center"
            v-html="company?.company_config.other?.menu?.description"
          />
        </div>
      </div>
    </div>

    <div class="column full-width" style="max-width: 600px;">
      <div class="full-width text-subtitle1 flex justify-between items-center" v-if="tab === 'orders'">
        <span class="text-h6">Ordenes</span>
        <div>
          <q-btn
            color="primary"
            icon="refresh"
            round
            size="sm"
            @click="setPagination({ pagination: invoicePagination })"
          />
        </div>
      </div>
      <div class="row q-col-gutter-y-xs q-mt-sm" v-if="tab === 'menu'">
        <div class="col-12">
          <q-input
            outlined
            rounded
            label="Buscar"
            dense
            type="search"
            debounce="500"
            class="full-width"
            v-model="filter"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12">
          <q-tabs
            v-model="category"
            class="text-teal overflow-hidden"
            dense
            v-if="categories.length"
          >
            <q-tab
              name="all"
              label="Todos"
            />
            <q-tab
              :name="cat.id"
              :label="cat.name"
              :key="cat.id"
              v-for="cat in categories"
              class="q-pa-md"
            />
          </q-tabs>
          <q-skeleton type="text" height="60px" v-else/>
        </div>
        <div class="col-12">
          <div v-if="loadingPage" class="row q-col-gutter-sm">
            <div
              class="col-xs-6 col-sm-4 col-md-3"
              v-for="i in 20" :key="i"
            >
              <SkeletonCard class="full-width"/>
            </div>
          </div>
          <div v-else>
            <div
              v-for="cat in groupedProducts"
              :key="cat.id"
              class="q-mb-lg"
            >
              <div class="category-title q-pa-sm q-mb-sm">
                {{ cat.name }}
              </div>
              <div class="row q-col-gutter-y-md">
                <div
                  class="col-12"
                  v-for="row in cat.products"
                  :key="row.id"
                >
                  <q-card
                    flat
                    bordered
                    class="product-horizontal-card shadow-1"
                    :class="findProduct(command.products, row) && 'shadow-20'"
                    :style="`${findProduct(command.products, row) && 'border: solid 2px green;'}`"
                    @click="openProductDetails(row)"
                  >
                    <q-card-section horizontal class="items-center">
                      <q-card-section class="q-pa-md col">
                        <div class="product-title">{{ row.name }}</div>
                        <div v-if="row.description" class="text-content q-mt-xs ellipsis-2-lines" v-html="row.description">
                        </div>
                        <div class="text-h6 text-bold q-mt-sm price-text">
                          $ {{ formatNumber(row.price) }}
                        </div>
                      </q-card-section>

                      <q-card-section class="col-auto q-pa-md">
                        <q-img
                          :src="row.images[0] ? row.images[0].url : 'https://cdn.quasar.dev/img/image-src.png'"
                          class="product-image"
                        >
                          <q-badge v-if="!validStockProduct(row, 1)" color="negative" floating style="top: 7px; right: 7px;">
                            Sin stock
                          </q-badge>
                        </q-img>
                      </q-card-section>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
            <div v-if="groupedProducts.length === 0 && !loadingPage" class="text-center q-pa-xl">
              <q-icon name="info" size="50px" color="grey-5" />
              <div class="text-subtitle1 text-grey-6 q-mt-md">No se encontraron productos</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="tab === 'command'" class="q-mt-sm">
        <q-table
          row-key="name"
          dense
          grid
          :rows="command.products"
          hide-pagination
          v-model:pagination="pagination"
        >
          <template v-slot:item="props">
            <div class="column items-center q-pa-xs col-xs-12 col-sm-12 col-md-12">
              <q-card
                class="my-card q-mt-sm"
                style="max-width: 90vw; width: 500px; border-radius: 20px;"
              >
                <q-card-section horizontal class="full-height">
                    <q-img
                      class="col-4"
                      style="max-height: 132px;"
                      :src="props.row?.images[0] ? props.row?.images[0]?.url : 'images/404-image.jpg'"
                    />
                    <q-card-section class="q-pa-sm column col-8">
                      <q-card-section class="q-pa-sm col">
                        <span class="text-body2 text-uppercase text-bold">
                          {{ props.row.name.slice(0, 20) }}
                          <q-badge
                            floating
                            rounded
                            color="secondary"
                          >
                            <q-icon
                              :name="props.row.observation ? 'edit' : 'add'"
                              size="sm"
                            />
                            <q-popup-proxy>
                              <q-card class="bg-white" style="width: 400px; max-width: 80vw;">
                                <q-card-section class="q-py-sm text-h6 bg-primary text-white">
                                  Observación
                                </q-card-section>
                                <q-card-section class="text-body2">
                                  <q-input
                                    filled
                                    autofocus
                                    type="textarea"
                                    v-model="props.row.observation"
                                  />
                                </q-card-section>
                                <q-card-actions align="right">
                                  <q-btn
                                    color="primary"
                                    icon="check_circle"
                                    v-close-popup
                                  />
                                </q-card-actions>
                              </q-card>
                            </q-popup-proxy>
                          </q-badge>
                        </span>
                        <p class="text-subtitle2 text-grey">
                          $ {{ formatNumber(props.row.price) }}
                        </p>
                      </q-card-section>
                      <q-card-actions class="q-pa-none">
                        <div class="flex justify-between items-center full-width">
                          <div style="width: 10%;">
                            <q-btn icon="delete" round size="sm" color="negative" @click="deleteProduct(props)"/>
                          </div>
                          <div class="flex items-center q-gutter-xs justify-end" style="width: 90%;">
                            <div>
                              <q-btn icon="remove" round size="sm" color="primary" @click="() => {
                                  props.row.amount -= 1
                                  calculate(props.row)
                                }"
                              />
                            </div>
                            <q-input
                              rounded
                              outlined
                              dense
                              label="Cantidad"
                              type="number"
                              style="width: 50%;"
                              v-model.number="props.row.amount"
                              @update:model-value="calculate(props.row)"
                            />
                            <div>
                                <q-btn icon="add" round size="sm" color="primary" @click="() => {
                                    props.row.amount += 1
                                    calculate(props.row)
                                }"/>
                            </div>
                          </div>
                        </div>
                      </q-card-actions>
                    </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </template>
          <template v-slot:no-data>
            <div class="full-width column flex-center justify-center">
              <q-img src="images/car_empty.png" style="width: 300px; max-width: 80vw;" />
              <span class="text-subtitle2 text-center">
                No hay productos en la orden
              </span>
            </div>
          </template>
        </q-table>
      </div>
      <div v-else>
        <q-table
          row-key="id"
          dense
          grid
          :rows="invoices"
          binary-state-sort
          no-data-label="Registro no encontrado"
          v-model:pagination="invoicePagination"
          @request="setPagination"
        >
          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-12 col-md-12 column items-center">
              <q-card
                class="my-card q-mt-sm"
                style="width: 100%; border-radius: 20px;"
                @click="openDetails(props.row)"
              >
                <q-card-section horizontal class="full-height">
                  <q-icon
                    name="receipt"
                    class="col-2"
                    size="md"
                    style="max-height: 200px;"
                  />
                  <q-card-section class="q-py-sm col-10">
                    <div class="flex justify-between full-width">
                      <div class="flex justify-between items-center full-width">
                        <span class="text-subtitle2 text-bold">
                          Nro {{ props.row.code }}
                        </span>
                        <span class="text-subtitle2 text-semibold">
                          $ {{ formatNumber(props.row.total) }}
                        </span>
                      </div>
                      <div class="flex justify-between items-center full-width">
                        <span>
                          {{ props.row?.client?.name }}
                        </span>
                        <q-badge
                          :color="status[props.row.status].color"
                          :label="status[props.row.status].label"
                          rounded
                        />
                      </div>
                      <div class="flex justify-between items-center full-width">
                        <span>
                          {{ formatDate(props.row.created_at, 'DD-MM-YYYY') }}
                        </span>
                        <span>
                          {{ formatDate(props.row.created_at, 'HH:mm:ss') }}
                        </span>
                      </div>
                    </div>
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </div>
      <q-page-sticky position="bottom-right" :offset="[15, 10]">
        <div class="flex q-gutter-sm">
          <q-btn
            v-if="isCurrentlyOpen && totalBill > 0"
            rounded
            stack
            color="primary"
            class="button-baseline"
            :icon="tab === 'menu' ? 'shopping_cart' : 'receipt'"
            :label="formatNumber(totalBill)"
            :loading="billLoading"
            @click="saveBill"
          />
          <schedule-status
            :schedule="company?.company_config.other?.menu?.schedule"
            @update:isCurrentlyOpen="(data) => isCurrentlyOpen = data"
          />
        </div>
      </q-page-sticky>
      <q-dialog v-model="detailProduct">
        <q-card
          :class="$q.screen.lt.sm ? 'full-height column': ''"
          :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 400px; max-width: 80vw;'}`"
        >
          <SlideComponent :slides="product.images" styles="height: 200px;"/>
          <q-card-section class="scroll q-pa-none col" style="max-height: calc(100vh - 300px);">
            <q-card-section class="column q-pb-none">
              <div class="flex justify-between full-width">
                <span class="text-body2 text-uppercase text-bold">
                  {{ product?.name }}
                </span>
                <span class="text-body2 q-mt-sm">
                  $ {{ formatNumber(product?.price) }}
                </span>
              </div>
              <div v-if="product.description">
                <q-input
                  type="textarea"
                  v-model="product.description"
                  readonly
                  autogrow
                />
              </div>
              <div class="flex justify-between items-center q-mt-sm">
                <q-btn
                  icon="remove"
                  color="primary"
                  round
                  flat
                  size="lg"
                  @click="addTemporalProducts(product, product.amount -= 1)"
                />
                <q-input
                  borderless
                  dense
                  type="number"
                  style="width: 40px;"
                  input-class="text-center"
                  v-model.number="product.amount"
                  @update:model-value="(value) => addTemporalProducts(product, value)"
                />
                <q-btn
                  icon="add"
                  color="primary"
                  round
                  flat
                  size="lg"
                  @click="addTemporalProducts(product, product.amount += 1)"
                />
              </div>
            </q-card-section>
            <q-card-section class="q-px-none col" v-if="product.product_addons?.length > 0">
              <div class="col-12 bg-grey-2 q-pa-sm text-dark">
                <span class="text-subtitle2">+ Adicionales</span>
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div
                class="flex justify-between full-width items-center"
                v-for="addon in product.product_addons" :key="addon.id"
              >
                <div class="column">
                  <span class="text-body2 text-uppercase text-bold">
                    {{ addon.name }}
                  </span>
                  <span class="text-subtitle2 text-grey">
                    {{ formatNumber(addon.price) }}$
                  </span>
                </div>
                <div class="flex justify-between items-center q-gutter-xs">
                  <q-btn
                    icon="remove"
                    color="primary"
                    round
                    flat
                    size="sm"
                    @click="addTemporalProducts(addon, addon.amount -= 1)"
                  />
                  <q-input
                    borderless
                    dense
                    type="number"
                    style="width: 30px;"
                    input-class="text-center"
                    v-model.number="addon.amount"
                    @update:model-value="(value) => addTemporalProducts(product, value)"
                  />
                  <q-btn
                    icon="add"
                    color="primary"
                    round
                    flat
                    size="sm"
                    @click="addTemporalProducts(addon, addon.amount += 1)"
                  />
                </div>
              </div>
              <q-separator class="q-mt-md"/>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-input
                type="textarea"
                label="Observación"
                filled
                v-model="observation"
              />
            </q-card-section>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              color="negative"
              label="Cerrar"
              icon="close"
              @click="() => {
                detailProduct = false
                product = null
              }"
            />
            <q-btn
              color="primary"
              label="Agregar"
              icon="add_shopping_cart"
              @click="addCar"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="openAddClient" persistent :maximized="$q.screen.lt.sm">
        <q-card :style="$q.screen.lt.sm ? '' : 'width: 700px; max-width: 80vw;'">
          <q-form @submit="saveClient" class="column full-height">
            <q-card-section class="flex q-gutter-x-sm text-white bg-primary">
              <q-btn icon="arrow_back_ios" flat round dense @click="openAddClient = false"/>
              <span class="text-h6">Registrarse</span>
            </q-card-section>
            <q-card-section class="col">
              <div class="row q-gutter-y-sm">
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    :rules="[val => !!val || 'El campo es requerido.']"
                    filled
                    v-model="client.name"
                    label="Nombre"
                  />
                </div>
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    filled
                    v-model="client.phone_number"
                    label="Número de teléfono"
                    :rules="[val => !!val || 'El campo es requerido.']"
                  />
                </div>
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    :rules="[val => !!val || 'El campo es requerido.']"
                    filled
                    v-model="client.username"
                    label="Nombre de usuario"
                  />
                </div>
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    :rules="[val => !!val || 'El campo es requerido.']"
                    filled
                    v-model="client.password"
                    label="Contraseña"
                    type="password"
                  />
                </div>
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    filled
                    v-model="client.address"
                    label="Dirección"
                    type="textarea"
                  />
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right" class="text-primary">
              <q-btn icon="save" color="primary" label="Guardar" type="submit"/>
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
      <q-dialog v-model="openLoginDialog" persistent>
        <q-card :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 400px; max-width: 80vw;'">
          <q-form @submit="loginAt" class="column full-height">
            <q-card-section class="flex justify-between q-gutter-x-sm text-white bg-primary">
              <span class="text-h6">Iniciar sesión</span>
              <q-btn icon="close" flat round dense @click="openLoginDialog = false"/>
            </q-card-section>
            <q-card-section class="col">
              <div class="row q-gutter-y-sm">
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    :rules="[val => !!val || 'El campo es requerido.']"
                    filled
                    v-model="user.username"
                    label="Nombre de usuario"
                  />
                </div>
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    :rules="[val => !!val || 'El campo es requerido.']"
                    filled
                    v-model="user.password"
                    label="Contraseña"
                    type="password"
                  />
                </div>
                <div class="col-12 text-right">
                  <q-btn flat color="secondary" label="No tengo una cuenta" @click="openAddClient = true" />
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right" class="text-primary">
              <q-btn color="primary" label="Iniciar sesión" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
      <q-dialog v-model="dialogPayment" position="bottom">
        <q-card :style="$q.screen.lt.sm ? '' : 'width: 400px; max-width: 80vw;'" v-if="tabPayment === 'paymentMethod'">
          <q-card-section class="q-pb-xs flex justify-start items-center q-gutter-x-sm">
            <q-btn icon="arrow_back_ios" size="sm" flat round dense @click="dialogPayment = false"/>
            <span class="text-subtitle1 text-uppercase text-bold">
              Método de pago
            </span>
          </q-card-section>
          <q-card-section class="q-pt-sm q-pb-none">
            <p>
              Seleccione el método de pago que desea utilizar para pagar la factura.
              <br />
              Cuando seleccione el método de pago y confirme el pago,
              debe ingresar el comprobante de pago.
            </p>
          </q-card-section>
          <q-card-section class="q-gutter-sm q-pt-none scroll" style="max-height: calc(100vh - 320px);">
            <q-card v-for="payment in paymentMethods" :key="payment.id">
              <q-card-section class="q-py-sm">
                <q-radio v-model="paymentMethod" :val="payment.id" :label="payment.name" />
              </q-card-section>
              <q-card-section class="q-py-sm" v-if="payment.attributes && payment.attributes.length > 0">
                <div class="column q-gutter-sm">
                  <span class="text-subtitle1">Datos del pago</span>
                  <span class="text-subtitle2" v-for="attribute in payment.attributes" :key="attribute.id">
                    {{ attribute.attribute_name }}
                  </span>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
          <q-card-actions align="center" v-if="paymentMethod">
            <q-btn class="full-width" color="primary" label="Confirmar" @click="tabPayment = 'voucher'" />
          </q-card-actions>
        </q-card>
        <q-card :style="$q.screen.lt.sm ? '' : 'width: 400px; max-width: 80vw;'" v-if="tabPayment === 'voucher'">
          <q-card-section class="q-pb-xs flex justify-start items-center q-gutter-x-sm">
            <q-btn icon="arrow_back_ios" size="sm" flat round dense @click="tabPayment = 'paymentMethod'"/>
            <span class="text-subtitle1 text-uppercase text-bold">
            Comprobante de pago
            </span>
          </q-card-section>
          <q-card-section class="q-pt-sm q-pb-none">
            <p>
              Si no sube el comprobante de pago,
              se contactaran con usted via whatsapp o teléfono.
              para la confirmación del pago.
            </p>
          </q-card-section>
          <q-card-section class="q-pb-xs q-pt-sm flex justify-start items-center q-gutter-x-sm scroll" style="max-height: calc(100vh - 320px);">
            <FileButtonComponent ref="fileButton" @upload="setFile" v-if="!file">
              <template v-slot:button>
                <div
                  @click="$refs.fileButton.onClick()"
                  class="flex flex-center column"
                  style="height: 100px; min-width: 100%; border: 1px dashed #e0e0e0; border-radius: 5px; padding: 10px;">
                  <q-icon name="image" color="primary" size="50px" />
                  <span>
                    Seleccionar comprobante
                  </span>
                </div>
              </template>
            </FileButtonComponent>
            <q-img v-else :src="file.url" style="border-radius: 10px;">
              <q-btn
                class="absolute all-pointer-events"
                size="sm"
                icon="close"
                color="negative"
                style="top: 1px; right: 1px"
                push
                dense
                round
                @click="file = null"
              >
                <q-tooltip>
                  Eliminar Imagen
                </q-tooltip>
              </q-btn>
            </q-img>
          </q-card-section>
          <q-card-actions align="center" v-if="paymentMethod">
            <q-btn class="full-width" color="primary" label="Confirmar" @click="tabPayment = 'address'" />
          </q-card-actions>
        </q-card>
        <q-card :style="$q.screen.lt.sm ? '' : 'width: 400px; max-width: 80vw;'" v-if="tabPayment === 'address'">
          <q-card-section class="q-pb-xs flex justify-start items-center q-gutter-x-sm">
            <q-btn icon="arrow_back_ios" size="sm" flat round dense @click="tabPayment = 'voucher'"/>
            <span class="text-subtitle1 text-uppercase text-bold">
            Confirmar dirección
            </span>
          </q-card-section>
          <q-card-section class="q-pt-sm q-pb-none">
            <p>
              Confirme su dirección para recibir el pedido.
            </p>
          </q-card-section>
          <q-card-section class="q-pt-sm">
            <q-input type="textarea" v-model="address" filled label="Dirección" class="full-width" />
          </q-card-section>
          <q-card-actions align="center" v-if="address">
            <q-btn class="full-width" color="primary" label="Confirmar" @click="saveOrder" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="detailsDialog" persistent maximized>
        <q-card>
          <q-card-section class="flex justify-between items-center bg-primary text-white">
            <span class="text-h6">Detalles de la orden</span>
            <q-btn icon="close" flat round dense @click="detailsDialog = false" />
          </q-card-section>
          <q-card-section class="scroll" style="height: 82vh">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input label="Código" filled v-model="invoice.code" readonly dense />
              </div>
              <div class="col-6">
                <q-input label="Cliente" filled :model-value="invoice?.client?.name" readonly dense />
              </div>
              <div class="col-6">
                <q-input label="Fecha" filled v-model="invoice.date" readonly dense />
              </div>
              <div class="col-12">
                <q-input
                  type="textarea"
                  autogrow label="Dirección"
                  filled
                  v-model="invoice.address"
                  readonly
                  dense
                />
              </div>
              <div class="col-12">
                <q-input
                  type="textarea"
                  filled
                  v-model="invoice.description"
                  readonly
                  label="Descripción"
                />
              </div>
              <div class="col-12">
                <span class="text-h6">Pagos</span>
              </div>
              <div class="col-12 q-mt-md column" v-for="payment in invoice.invoice_payments" :key="payment.id">
                <span class="text-subtitle1 text-uppercase">
                  {{ payment.payment_method.name }}
                </span>
                <img v-for="file in payment.files" alt="pago" :key="file.id" :src="file.url" style="max-height: 300px; max-width: 400px;" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script>
import { Notify } from 'quasar'
import { formatDate, formatNumber, loading, notify, setFiles } from '../const/mixins'
import { useCommandStore } from '../stores/command'
import SkeletonCard from '../components/SkeletonCard.vue'
import SlideComponent from '../components/SlideComponent.vue'
import { mapActions, mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import FileButtonComponent from 'src/components/FileButtonComponent.vue'
import { status } from 'src/const/invoice'
import ScheduleStatus from 'src/components/Command/ScheduleStatus.vue'
export default {
  name: 'CatalogPage',
  components: {
    SkeletonCard,
    SlideComponent,
    ScheduleStatus,
    FileButtonComponent
  },
  data () {
    return {
      observation: null,
      status,
      company: null,
      formatDate,
      tabPayment: 'paymentMethod',
      client: {},
      user: {},
      address: '',
      invoices: [],
      paymentMethod: null,
      openAddClient: false,
      dialogPayment: false,
      isCurrentlyOpen: false,
      openLoginDialog: false,
      paymentMethods: [],
      temporalProducts: [],
      file: null,
      /**
       * Slide
       * @type {Number}
       */
      slide: 1,
      /**
       * Dialog table
       * @type {Boolean}
       */
      dialogTable: false,
      /**
       * Details product
       * @type {Boolean}
       */
      detailProduct: false,
      /**
       * Loading table
       * @type {Boolean}
       */
      loadingTable: false,
      /**
       * Product
       * @type {Object}
       */
      product: null,
      /**
       * Bill loading
       * @type {Boolean}
       */
      billLoading: false,
      /**
       * Format number
       * @type {Function}
       */
      formatNumber,
      /**
       * Table
       * @type {Object}
       */
      table: null,
      /**
       * Loading page
       * @type {Boolean}
       */
      loadingPage: false,
      /**
       * Category selected
       * @type {Object}
       */
      category: null,
      /**
       * Categories
       * @type {Array}
       */
      categories: [],
      /**
       * Total bill
       * @type {Number}
       */
      totalBill: 0,
      /**
       * Products
       * @type {Array}
       */
      products: [],
      /**
       * Pagination option
       * @type {Object}
       */
      pagination: { rowsPerPage: 30 },
      /**
       * All products
       * @type {Array}
       */
      allProducts: [],
      /**
       * Table selected
       * @type {Array}
       */
      tableSelected: [],
      invoice: null,
      detailsDialog: false,
      filter: '',
      /**
       * Pagination option
       * @type {Object}
       */
      invoicePagination: {
        rowsPerPage: 10,
        rowsNumber: 10,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      }
    }
  },
  mounted () {
    if (this.userSession) {
      this.setPagination({ pagination: this.invoicePagination })
    }
  },
  created () {
    this.getCompany()
    this.getCategories()
    this.getPaymentMethods()
    this.category = this.$route.query.category || 'all'
    this.products = this.command.products || []
    this.calculateTotal()
    this.address = this.userSession?.address
  },
  watch: {
    category (data) {
      this.$router.push({
        path: this.$route.path,
        query: {
          tab: this.tab,
          category: data || 'all'
        }
      })
      this.getAllProducts()
    },
    observation (data) {
      if (typeof data === 'string') {
        this.product.observation = data
        this.addTemporalProducts(this.product, this.product.amount)
      }
    },
    table (table) {
      const store = useCommandStore()
      store.setCommands({ table })
    },
    products (products) {
      const store = useCommandStore()
      store.setCommands({ products })
    },
    userSession (data) {
      this.address = data?.address
    },
    tab (data) {
      if (data === 'orders') this.setPagination({ pagination: this.invoicePagination })
    }
  },
  computed: {
    tab () {
      return this.$route.query.tab ?? 'menu'
    },
    command () {
      const store = useCommandStore()
      return store?.command
    },
    groupedProducts () {
      let filtered = this.allProducts || []
      if (this.filter) {
        const query = this.filter.toLowerCase()
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
        )
      }

      return this.categories
        .map(cat => ({
          ...cat,
          products: filtered.filter(p => p.category_id === cat.id)
        }))
        .filter(cat => cat.products.length > 0)
    },
    ...mapState(authentication, ['userSession', 'branchOffice'])
  },
  methods: {
    /**
     * Open product details
     * @param {Object} product
     */
    openProductDetails (product) {
      this.detailProduct = true
      this.product = product
      this.product.amount = 1
      this.addTemporalProducts(product, product.amount)
      if (product.product_addons && product.product_addons.length > 0) {
        this.product.product_addons = product.product_addons.map(addon => {
          addon.amount = 0
          return addon
        })
      }
    },
    addCar () {
      this.temporalProducts.forEach(product => this.validateProduct(product))
      this.notifyProductCar(this.products)
      this.detailProduct = false
      this.temporalProducts = []
      this.observation = null
    },
    /**
     * Add temporal products
     */
    addTemporalProducts (data, amount) {
      const findProduct = this.findProduct(this.temporalProducts, data)
      if (findProduct) {
        findProduct.amount = amount
        findProduct.observation = data.observation
      } else {
        this.temporalProducts.push({
          ...data,
          amount
        })
      }
    },
    /**
     * Open details
     * @param {Object} data invoice
     */
    openDetails (data) {
      this.invoice = data
      this.detailsDialog = true
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
        paginate: true
      }
      this.invoicePagination = data.pagination
      this.getInvoices(params)
    },
    /**
     * Get company
     */
    async getCompany () {
      try {
        const { data } = await this.$api.get(`public/company/${this.$route?.params?.company_id}`)
        this.company = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Set file
     * @param {Array} files files
     */
    async setFile (files) {
      const file = await setFiles(files)
      this.file = file[0]
    },
    /**
     * After save bill
     */
    afterSaveBill () {
      this.products = []
      this.setQueryParams({ tab: 'orders' })
      this.totalBill = 0
      this.file = null
      this.paymentMethod = null
      this.tabPayment = 'paymentMethod'
      notify('Pedido creado exitosamente', 'positive', 'check_circle')
    },
    /**
     * Set table selected
     * @param {Object} data table selected
     */
    async setTableSelected (data) {
      this.table = data[0]
      this.tableSelected = [this.table]
      await this.getTable(data)
      this.dialogTable = false
    },
    /**
     * Save clients
     */
    async saveClient () {
      try {
        loading(true)
        const { data } = await this.$api.post(`public/clients/${this.$route.params.company_id}`, this.client)
        this.openAddClient = false
        this.openLoginDialog = false
        this.client = {}
        this.setSessionData(data)
        this.saveBill()
      } catch (error) {
        console.error(error)
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },

    async saveFilePayment (data) {
      try {
        const formData = new FormData()
        const { invoice_payments: invoicePayments } = data
        if (invoicePayments.length > 0) {
          formData.append('file', this.file?.file)
          formData.append('fileable_type', 'App\\Models\\InvoicePayment')
          formData.append('fileable_id', invoicePayments[0].id)
          await this.$api.post('files', formData)
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Save order
     */
    async saveOrder () {
      try {
        loading(true)
        const { data } = await this.$api.post('command-orders', {
          seller_id: this.userSession?.id,
          products: this.command.products,
          address: this.address,
          company_id: this.$route?.params?.company_id,
          client_id: this.userSession.id,
          code: 1,
          payments: [
            {
              payment_method_id: this.paymentMethod,
              amount: this.totalBill,
              reference: null,
              exchange: 1,
              coin_id: this.company?.company_config?.coin_id
            }
          ]
        })
        if (this.file) await this.saveFilePayment(data)
        this.afterSaveBill()
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Save bill and payments
     */
    async saveBill () {
      if (this.tab !== 'command') {
        this.setQueryParams({ tab: 'command' })
        return
      }
      if (!this.userSession) {
        this.openLoginDialog = true
        return
      }
      this.dialogPayment = true
    },
    /**
     * Delete product in table
     * @param {Object} product props table products
     */
    deleteProduct (product) {
      const index = this.products.map(productOne => productOne.id).indexOf(product.row.id)
      this.products.splice(index, 1)
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
     * Calculate the total and subtotal
     * @param {Object} data props products
     */
    calculate (data) {
      if (this.validStockProduct(data, data.amount)) {
        data.subtotal = data.price * data.amount
        this.calculateTotal()
      } else {
        notify(
          `No hay stock suficiente para ${data.name}`,
          'negative',
          'warning'
        )
        data.amount = 1
      }
    },
    /**
     * Find product
     * @param {Array} products products
     * @param {Object} product product
     */
    findProduct (products, product) {
      if (products) {
        return products.find(productOne => productOne.id === product.id)
      }
      return false
    },
    /**
     * Login app
     */
    async loginAt () {
      try {
        loading(true)
        await this.login(this.user)
        this.openLoginDialog = false
        this.dialogPayment = true
        this.user = {}
      } catch (error) {
        notify(error?.message || error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Valid stock product
     * @param {Object} data data
     * @param {Number} amount amount
     */
    validStockProduct (data, amount) {
      const stock = data.is_bundle ? data.bundle_stock : data.normal_stock
      console.log(data)
      if (!data.skip_stock) {
        return stock >= amount
      }
      return true
    },
    /**
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data) {
      const findProduct = this.findProduct(this.products, data)

      if (!this.validStockProduct(data, 1)) {
        notify(
          `No hay stock suficiente para ${data.name}`,
          'negative',
          'warning'
        )
        return
      }

      if (findProduct) {
        findProduct.amount += 1
        findProduct.product_id = findProduct.id
        findProduct.observation = data.observation
        this.calculate(findProduct)
      } else {
        data.amount = 1
        data.subtotal = 0
        data.product_id = data.id
        this.products = [
          ...this.products,
          data
        ]
        this.calculate(data)
      }
    },
    /**
     * Set query params
     * @param {Object} query query params
     */
    setQueryParams (query) {
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          ...query
        }
      })
    },
    /**
     * Notify product car
     */
    notifyProductCar () {
      Notify.create({
        position: 'top',
        message: '¡Producto añadido con éxito! ¡Listo para confirmar su orden!',
        actions: [
          {
            label: 'Ver orden',
            color: 'white',
            handler: () => this.setQueryParams({ tab: 'command' })
          }
        ],
        icon: 'info',
        color: 'positive'
      })
    },
    /**
     * Get all products
     */
    async getAllProducts () {
      try {
        this.loadingPage = true
        const { data } = await this.$api.get(`public/products/${this.$route.params.company_id}`, {
          params: {
            stock: true,
            withStock: true,
            sortOrder: 'desc',
            sortBy: 'sold',
            branch_office_id: this.$route.params.branch_office_id,
            dataEqualFilter: {
              category_id: this.category === 'all' ? null : this.category,
              show_catalog: 1,
              'category.show_catalog': 1
            }
          }
        })
        this.allProducts = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.loadingPage = false
      }
    },
    /**
     * Get categories
     */
    async getCategories () {
      try {
        const { data } = await this.$api.get(`public/categories/${this.$route.params.company_id}`, {
          params: {
            dataFilter: {
              show_catalog: 1
            }
          }
        })
        this.categories = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get categories
     */
    async getPaymentMethods () {
      try {
        const { data } = await this.$api.get(`public/payment-methods/${this.$route.params.company_id}`)
        this.paymentMethods = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get categories
     */
    async getInvoices (params) {
      try {
        loading(true)
        const { data } = await this.$api.get('public/invoices', { params })
        this.invoices = data.data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    ...mapActions(authentication, ['setSessionData', 'login'])
  }
}
</script>
<style scoped>
.header-container {
  overflow: hidden;
  border-radius: 0;
}

.header-banner {
  min-height: 280px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%);
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
}

.profile-avatar {
  background: white;
}

.company-name {
  text-shadow: 0 2px 10px rgba(0,0,0,0.7);
  letter-spacing: 2px;
}

.description-text {
  text-shadow: 0 1px 5px rgba(0,0,0,0.7);
  opacity: 0.9;
}

.button-baseline {
  background-color: rgb(253, 126, 20); /* Verde */
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  animation: titilar 2s infinite ease-in-out;
}

@keyframes titilar {
  0% {
    box-shadow: 0 0 0px rgba(253, 126, 20, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(253, 126, 20, 0.7);
  }
  100% {
    box-shadow: 0 0 0px rgba(253, 126, 20, 0.5);
  }
}
.category-title {
  font-family: var(--font-primary);
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--text);
}

.product-horizontal-card {
  border-radius: var(--border-radius-lg);
  transition: var(--transition-transform), var(--transition-shadow);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--border);
}

.product-horizontal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg) !important;
}

.product-title {
  font-weight: 700;
  line-height: 1.2;
  font-size: 1.1rem;
  color: var(--text);
}

.text-content {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-light);
}

.price-text {
  color: var(--primary); /* Using primary variable for theme consistency */
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: var(--border-radius-md);
  object-fit: cover;
}
</style>
