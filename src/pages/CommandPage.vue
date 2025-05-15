<template>
  <q-page padding :class="$q.screen.lt.sm ? 'q-pb-xl q-mb-lg' : 'items-center column'">
    <div class="relative full-width q-mt-sm" style="height: calc(100vh - 190px);" v-if="tab === 'scanner' && isTable">
      <qrcode-stream @detect="getCodeQr"/>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" class="text-center">
        <div class="scanner">
          <div class="light"></div>
        </div>
      </div>
    </div>
    <div v-if="tab !== 'scanner'" class="column" style="max-width: 600px;">
      <div class="flex full-width justify-center items-center">
        <q-img
          :src="menu?.banner_url || company?.url"
          style="max-height: 250px; max-width: 500px; min-width: 45vw;"
        />
      </div>
      <iframe
        v-if="menu?.description"
        :srcdoc="menu?.description"
        width="100%"
        style="min-height: 20px;"
        frameborder="0"
        title="Description"
      >
      </iframe>
      <!-- <div class="text-subtitle1 text-center q-mt-md" v-html="menu?.description"/> -->
    </div>
    <div style="max-width: 600px;" class="row q-col-gutter-y-xs q-mt-sm" v-if="tab === 'menu'">
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
          class="text-teal"
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
            class="q-pa-md"
            v-for="cat in categories"
          />
        </q-tabs>
        <q-skeleton type="text" height="60px" v-else/>
      </div>
      <div class="col-12" style="max-width: 600px;">
        <div v-if="loadingPage" class="row q-col-gutter-sm">
          <div
            class="col-xs-6 col-sm-4 col-md-3"
            v-for="i in 20" :key="i"
          >
            <SkeletonCard class="full-width"/>
          </div>
        </div>
        <q-table
          row-key="name"
          dense
          grid
          :rows="allProducts"
          :columns="productColumns"
          :loading="loadingPage"
          :filter="filter"
          :pagination="pagination"
          v-else
        >
          <template v-slot:item="props">
            <div class="col-xs-6 col-sm-4 col-md-4 col-lg-4" style="padding: 2px;">
              <q-card
                :class="findProduct(products, props.row) && 'shadow-20'"
                :style="`${findProduct(products, props.row) && 'border: solid 2px green;'}  height: 100%; border-radius: 20px;`"
                @click="openProductDetails(props.row)"
              >
                <q-img
                  fit="fill"
                  no-native-menu
                  :src="props.row?.images[0] ? props.row.images[0].url : 'images/404-image.jpg'"
                  style="height: 180px;"
                  spinner-color="primary"
                >
                <div class="absolute-full column items-center justify-center text-center">
                  <div class="text-bold text-body2 p-a-none">
                      {{ props.row.name.slice(0, 20) }}
                    </div>
                    <span class="text-caption">
                      {{ formatNumber(props.row.price) }} $
                    </span>
                    <q-badge v-if="!validStockProduct(props.row, 1)" color="negative" floating style="top: 7px; right: 7px;">
                      Sin stock
                    </q-badge>
                  </div>
                </q-img>
              </q-card>
            </div>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing color="secondary"/>
          </template>
        </q-table>
      </div>
    </div>
    <div v-else-if="tab === 'orders'">
      <div class="text-h6 text-bold">
        Lista de pedidos
      </div>
      <q-table
        row-key="id"
        dense
        grid
        style="max-height: calc(100vh - 162px); overflow: auto;"
        :rows="invoices"
        binary-state-sort
        no-data-label="Registro no encontrado"
        v-model:pagination="invoicePagination"
        @request="setPagination"
      >
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-6">
            <q-card
              class="my-card q-mt-sm"
              style="width: 100%; border-radius: 10px;"
            >
              <q-card-section horizontal class="full-height">
                <q-card-section class="col-xl-11 col-lg-11 col-md-11 col-sm-10 col-xs-10">
                  <div class="flex justify-between">
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
                <q-card-actions align="center" class="q-pt-none">
                  <q-btn color="primary" icon="more_vert" round flat dense>
                    <q-menu fit>
                      <q-list style="min-width: 250px">
                        <q-item clickable v-ripple @click="printTicket(props.row)">
                          <q-item-section avatar>
                            <q-icon color="primary" name="receipt" />
                          </q-item-section>
                          <q-item-section>Imprimir comanda</q-item-section>
                        </q-item>
                        <q-item clickable v-ripple @click="printBill(props.row)">
                          <q-item-section avatar>
                            <q-icon color="primary" name="print" />
                          </q-item-section>
                          <q-item-section>
                            {{ `Imprimir ${props.row.billing ? 'factura' : 'comprobante'}` }}
                          </q-item-section>
                        </q-item>
                        <q-item
                          v-if="!props.row.billing && props.row.status !== 'cancelled'"
                          clickable
                          v-ripple
                          @click="setInvoiceElectronic(props.row)"
                        >
                          <q-item-section avatar>
                            <q-icon color="primary" name="send" />
                          </q-item-section>
                          <q-item-section>
                            Generar factura
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-ripple @click="openPaid(props.row)">
                          <q-item-section avatar>
                            <q-icon color="primary" name="payments" />
                          </q-item-section>
                          <q-item-section>
                            Cobrar ticket
                          </q-item-section>
                        </q-item>
                        <!-- <q-item clickable v-ripple>
                          <q-item-section avatar>
                            <q-icon color="primary" name="visibility" />
                          </q-item-section>
                          <q-item-section>
                           Ver detalles
                          </q-item-section>
                        </q-item> -->
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-card-actions>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>
    <div v-else-if="tab === 'command'" class="q-mt-sm" style="max-width: 600px;">
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
          <q-btn
            color="primary"
            round
            icon="add_circle"
            @click.stop.prevent="(openAddClient = true)"
            size="sm"
          />
        </template>
      </q-select>
      <q-table
        dense
        grid
        row-key="name"
        :rows="products"
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
                    </span>
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
        <q-btn
          rounded
          stack
          color="secondary"
          class="q-ml-sm"
          icon="table_bar"
          :label="tables?.length > 0 ? tables?.map(table => table.name).join(', ') : 'Mesas'"
          :loading="billLoading"
          @click="dialogTable = true"
          v-if="isTable && isCurrentlyOpen"
        />
        <schedule-status
          :schedule="menu?.schedule"
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
    <q-dialog v-model="dialogTable" maximized>
      <drawer-table
        ref="drawerTable"
        :free-table="false"
        :tablesSelected="tableSelected"
        @update:tableSelected="setTableSelected"
        @update:invoice="freeTable"
      >
        <template v-slot:top>
          <q-card-section class="flex items-center justify-between bg-primary text-white q-py-sm">
            <span class="text-h6">Seleccionar mesa</span>
            <q-btn flat round dense @click="dialogTable = false" icon="close" class="q-ml-sm"/>
          </q-card-section>
        </template>
      </drawer-table>
    </q-dialog>
    <q-dialog v-model="dialogPayment" :maximized="$q.screen.lt.sm">
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 900px; max-width: 80vw;'">
        <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
          <span class="text-h6">Desglose de pago</span>
          <q-btn flat icon="close" round size="md" v-close-popup/>
        </q-card-section>
        <q-card-section class="row q-col-gutter-md q-px-sm">
          <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 q-gutter-xs grid justify-between">
            <q-btn
              color="secondary"
              style="width: 48%"
              :label="paymentMethod.name"
              v-for="paymentMethod in paymentMethods"
              :key="paymentMethod.id"
              v-show="paymentMethod.acronym !== 'MPQA'"
              @click="addPayment(paymentMethod)"
            />
          </div>
          <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8 q-gutter-xs row">
            <div class="col-12">
              <q-markup-table>
                <thead>
                  <tr>
                    <th class="text-left" colspan="4">
                      <div class="flex q-gutter-x-md justify-between items-center">
                        <span class="text-subtitle2 text-uppercase">
                          {{ invoiceOne.invoice_type.name }} Nro {{ invoiceOne?.code }}
                        </span>
                        <span class="text-subtitle2 text-uppercase" v-if="invoiceOne?.tables?.length">
                          Mesas: {{ invoiceOne?.tables?.map(table => table.name).join(', ') }}
                        </span>
                        <q-toggle v-model="tableClose" label="Cerrar mesa" v-if="invoiceOne?.tables?.length"/>
                      </div>
                    </th>
                  </tr>
                  <tr>
                    <th class="text-left">M. de pago</th>
                    <th class="text-left">Referencia</th>
                    <th class="text-right">Monto</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(payment, index) in payments" :key="payment.id">
                    <td class="text-left">
                      {{ payment.name }}
                    </td>
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
                      <span class="text-subtitle2 text-uppercase">
                        Restante a pagar:
                        <span v-if="coin">{{ coin.symbol }}</span>{{ formatNumber(pendingPayment) }}
                      </span>
                    </th>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
          <div class="col-12">
            <q-expansion-item
              icon="list"
              label="Artículos"
              :caption="`Total: ${formatNumber(invoiceOne.total)}`"
              style="border-radius: 10px"
              class="shadow-1 overflow-hidden"
              default-opened
            >
              <q-card>
                <q-card-section class="q-py-sm q-pt-none scroll" style="max-height: 250px">
                  <div v-for="product in invoiceOne.products" :key="product.id" class="col-12 column">
                    <div class="full-width flex items-center justify-between">
                      <div class="flex q-gutter-sm items-center">
                        <file-component
                          :files="[product.images[0]]"
                          image-style="height: 50px; width: 50px; border-radius: 10px;"
                          only-view
                        />
                        <span class="text-body1">
                          {{ product.name.slice(0, 15) }}
                          <q-tooltip class="text-subtitle1">
                            {{ product.name }}
                          </q-tooltip>
                        </span>
                      </div>
                      <span class="text-bold">
                        {{ formatNumber(product.pivot.amount) }}
                      </span>
                      <span class="text-bold">
                        {{ formatNumber(product.pivot.amount * product.pivot.price) }}
                      </span>
                    </div>
                    <q-separator class="q-mt-sm" />
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-gutter-y-sm">
          <q-btn
            :label="`Guardar e imprimir ${invoiceOne.billing ? 'factura' : 'comprobante'}`"
            @click="submitBill('printBill')"
            color="secondary"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
          />
          <q-btn
            label="Guardar e imprimir comanda"
            @click="submitBill('printCommand')"
            color="warning"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
          />
          <q-btn
            label="Guardar sin imprimir"
            @click="submitBill('withoutPrint')"
            color="primary"
            :class="$q.screen.lt.sm ? 'full-width' : ''"
            :loading="loadingBilling"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddClient" persistent :maximized="$q.screen.lt.md">
      <q-card :style="$q.screen.lt.md ? '' : 'width: 700px; max-width: 80vw;'">
        <q-form @submit="saveClient" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="(openAddClient = false)" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm col">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.document_number"
                autofocus
                label="Número de documento"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
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
  </q-page>
</template>
<script>
import { Notify } from 'quasar'
import { QrcodeStream } from 'vue-qrcode-reader'
import { formatNumber, loading, notify } from '../const/mixins'
import SkeletonCard from '../components/SkeletonCard.vue'
import SlideComponent from '../components/SlideComponent.vue'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import DrawerTable from 'src/components/Table/DrawerTable.vue'
import { useCommandStore } from 'src/stores/command'
import { printInvoice, printTicket, status } from 'src/const/invoice'
import { formatDate } from 'src/const/mixins'
import FileComponent from 'src/components/FileComponent.vue'
import ScheduleStatus from 'src/components/Command/ScheduleStatus.vue'
export default {
  name: 'CommandPage',
  components: {
    QrcodeStream,
    SkeletonCard,
    SlideComponent,
    DrawerTable,
    FileComponent,
    ScheduleStatus
  },
  data () {
    return {
      formatDate,
      status,
      observation: null,
      coin: null,
      tableClose: true,
      loadingBilling: false,
      dialogPayment: false,
      company: null,
      isCurrentlyOpen: false,
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
      },
      /**
       * Clients
       * @type {Array}
       */
      clients: [],
      paymentMethods: [],
      payments: [],
      /**
       * Client
       * @type {Object}
       */
      client: null,
      /**
       * Filter
       * @type {String}
       */
      filter: null,
      /**
       * Client added
       * @type {Object}
       */
      clientAdded: {},
      /**
       * Temporal products
       * @type {Array}
       */
      temporalProducts: [],
      /**
       * Open add client
       * @type {Boolean}
       */
      openAddClient: false,
      /**
       * Loading client
       * @type {Boolean}
       */
      loadingClient: false,
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
      tables: [],
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
       * Columns
       * @type {Array}
       */
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Descripción',
          align: 'left',
          field: row => row.name,
          sortable: true
        },
        { name: 'amount', align: 'right', label: 'Cantidad', field: 'amount', sortable: true },
        { name: 'price', align: 'right', label: 'Precio', field: 'price', sortable: true },
        { name: 'subtotal', align: 'right', label: 'Subtotal', field: 'subtotal', sortable: true },
        { name: 'actions', align: 'right', label: 'Acciones', field: 'actions' }
      ],
      /**
       * Pagination option
       * @type {Object}
       */
      pagination: { rowsPerPage: 50 },
      /**
       * All products
       * @type {Array}
       */
      allProducts: [],
      /**
       * Invoices list
       * @type {Array}
       */
      invoices: [],
      /**
       * Table selected
       * @type {Array}
       */
      tableSelected: [],
      /**
       * Is table
       * @type {Number}
       */
      isTable: 1,
      invoiceOne: null,
      menu: null,
      /**
       * Product columns
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
          field: row => row.category.name,
          sortable: true
        },
        {
          name: 'price',
          align: 'right',
          label: 'Precio',
          field: 'price',
          sortable: true
        }
      ]
    }
  },
  created () {
    this.isTable = this.userSession?.company_session?.company_config?.is_table
    this.client = this.userSession?.company_session?.company_config?.client
    this.coin = this.userSession?.company_session?.company_config?.coin
    this.menu = this.userSession?.company_session?.company_config?.other?.menu
    this.company = this.userSession?.company_session
    this.getCategories()
    this.setPagination({ pagination: this.invoicePagination })
    this.category = this.$route.query.category || 'all'
    this.calculateTotal()
    this.getPaymentMethods()
  },
  watch: {
    observation (data) {
      if (typeof data === 'string') {
        this.product.observation = data
        this.addTemporalProducts(this.product, this.product.amount)
      }
    },
    /**
     * Dialog payment
     * @param {Object} data data payment
     */
    dialogPayment (data) {
      if (!data) {
        this.payments = []
        this.totalBill = 0
      }
    },
    category (data) {
      this.$router.push({
        path: 'command',
        query: {
          tab: this.tab,
          category: data || 'all'
        }
      })
      this.getAllProducts()
    },
    table (table) {
      const store = useCommandStore()
      store.setCommands({ table })
    },
    products (products) {
      const store = useCommandStore()
      store.setCommands({ products })
    },
    filter (data) {
      this.setQueryParams({
        filter: data
      })
    },
    tab (data) {
      if (data === 'orders') { this.setPagination({ pagination: this.invoicePagination }) }
    }
  },
  computed: {
    tab () {
      return this.$route.query.tab ?? 'menu'
    },
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
  methods: {
    async submitBill (options) {
      try {
        loading(true)
        await this.$api.put(`invoices/${this.invoiceOne.id}`, {
          ...this.invoiceOne,
          tableClose: this.tableClose,
          status: this.tableClose ? 'delivered' : this.invoiceOne.status,
          payments: this.payments
        })
        switch (options) {
          case 'printBill':
            this.printBill(this.invoiceOne)
            break
          case 'printCommand':
            this.printTicket(this.invoiceOne)
            break
          case 'withoutPrint':
            break
        }
        this.dialogPayment = false
        this.dialogTable = false
        this.setPagination({
          pagination: this.invoicePagination
        })
        notify('Se ha guardado exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },

    async printBill (data) {
      const doc = await printInvoice(data, this.userSession)
      const pdfUrl = doc.output('bloburl')
      window.open(pdfUrl, '_blank')
    },

    async printTicket (data) {
      const doc = await printTicket(data, this.userSession)
      const pdfUrl = doc.output('bloburl')
      window.open(pdfUrl, '_blank')
    },
    /**
     * Delete invoice payment
     * @param {Number} index value index payments
     */
    deletePayment (index) {
      this.payments.splice(index, 1)
    },
    /**
     * Valid stock product
     * @param {Object} data data
     * @param {Number} amount amount
     */
    validStockProduct (data, amount) {
      const stock = data.is_bundle ? data.bundle_stock : data.normal_stock
      if (!data.skip_stock) {
        return stock >= amount
      }
      return true
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
     * Free table
     * @param {Object} table  table data
     */
    async freeTable (table) {
      try {
        loading(true)
        const invoiceOne = table.invoices[0]
        const { data } = await this.$api.get(`invoices/${invoiceOne.id}`)
        this.openPaid(data.data)
        loading(false)
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Open paid
     * @param {Object} data data
     */
    openPaid (data) {
      this.invoiceOne = data
      this.totalBill = data.total
      this.pendingPayment = data.total - data.total_payments
      this.setPayments(data.invoice_payments)
      this.dialogPayment = true
    },
    /**
     * Get all payment-methods
     */
    async getPaymentMethods () {
      try {
        const { data } = await this.$api.get('payment-methods')
        this.paymentMethods = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
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
          notify('Factura electrónica generada exitosamente', 'positive', 'check_circle')
          this.printBill(data)
          this.getInvoices(this.invoicePagination)
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
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
        dataEqualFilter: {
          seller_id: this.userSession.id
        },
        paginate: true
      }
      this.invoicePagination = data.pagination
      this.getInvoices(params)
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
     * Add product to car
     */
    addCar () {
      this.temporalProducts.forEach(product => this.validateProduct(product))
      this.notifyProductCar(this.products)
      this.detailProduct = false
      this.temporalProducts = []
      this.observation = null
      this.product = {
        amount: 1
      }
    },
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
     * After save bill
     */
    afterSaveBill () {
      this.tables = []
      this.client = this.userSession?.company_session?.company_config?.client
      this.clientAdded = {}
      this.products = []
      this.tableSelected = []
      this.setQueryParams({ tab: 'menu' })
      this.totalBill = 0
      notify('Pedido creado exitosamente', 'positive', 'check_circle')
    },
    /**
     * Set table selected
     * @param {Object} data table selected
     */
    async setTableSelected (data) {
      this.tableSelected = data
      if (data.length > 0) {
        await this.getTable(data)
        this.dialogTable = false
      }
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
     * Get categories
     */
    async getInvoices (params) {
      try {
        loading(true)
        const { data } = await this.$api.get('invoices', { params })
        this.invoices = data.data
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

      if (!this.tables?.length && this.isTable) {
        notify('No se puede crear pedido sin mesa', 'negative', 'warning')
        return
      }

      if (this.products.length === 0) {
        notify('No se puede crear pedido sin productos', 'negative', 'warning')
        return
      }

      if (!this.client) {
        notify('No se puede crear pedido sin cliente', 'negative', 'warning')
        return
      }

      try {
        this.billLoading = true
        await this.$api.post('command-orders', {
          seller_id: this.userSession?.id,
          client_id: this.client?.id,
          products: this.products,
          branch_office_id: this.branchOffice?.id,
          tables: this.isTable ? this.tables?.map(table => table.id) : [],
          company_id: this.userSession?.company_session_id,
          code: 2
        })
        this.afterSaveBill()
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.billLoading = false
      }
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
      data.subtotal = data.price * data.amount
      this.calculateTotal()
    },
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
        findProduct.amount += data.amount
        findProduct.product_id = findProduct.id
        findProduct.observation = data.observation
        this.calculate(findProduct)
      } else {
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
        path: 'command',
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
     * Get all tables
     */
    getAllProducts () {
      this.loadingPage = true
      this.$api.get('products', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          mostSold: true,
          dataEqualFilter: {
            category_id: this.category === 'all' ? null : this.category,
            show_catalog: 1,
            'category.show_catalog': 1
          }
        }
      })
        .then(({ data }) => {
          this.allProducts = data
          this.loadingPage = false
        })
        .catch(err => {
          this.loadingPage = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    getParams (url) {
      const urlObj = new URL(url.replace('#', '?'))
      console.log(urlObj)
      const params = new URLSearchParams(urlObj.search)
      return params.get('p')
    },
    getCodeQr (code) {
      const newCode = code[0]
      const data = this.getParams(newCode.rawValue)
      console.log(atob(data))
      const { id } = JSON.parse(atob(data))
      this.getTable([id])
    },
    /**
     * Get table
     * @param {Object} code code
     */
    async getTable (id) {
      try {
        this.loadingTable = true
        const { data } = await this.$api.get('tables', {
          params: {
            whereIn: {
              id
            }
          }
        })
        this.loadingTable = false
        if (data.find(table => table.status === 'busy')) {
          notify('La mesa está ocupada', 'negative', 'warning')
          return
        }
        this.tables = data
        this.setQueryParams({ tab: 'menu' })
      } catch (error) {
        this.tables = []
        this.loadingTable = false
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    getCategories () {
      this.$api.get('categories', {
        params: {
          dataFilter: {
            show_catalog: 1
          }
        }
      })
        .then(({ data }) => {
          this.categories = data
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    }
  }
}
</script>
<style>
  .scanner {
    width: 250px;
    height: 250px;
    border: 4px solid #000;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    box-shadow: 0px 0px 10px white;
    background-image: url('/images/qr.png');
    background-size: cover;
    opacity: 0.3;
  }
  @keyframes scan {
    0% {
      transform: translateY(10px);
    }
    100% {
      transform: translateY(230px);
    }
  }
  .light {
    position: absolute;
    width: 100%;
    height: 2px;
    background: red;
    top: 0;
    animation: scan 1.5s infinite alternate;
  }
  .scanner::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: transparent;
    clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
  }
  .button-baseline {
    background-color: rgb(253, 126, 20); /* Verde */
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
</style>
