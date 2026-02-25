<template>
  <div class="orders-view">
    <!-- Header -->
    <div class="orders-header q-pa-md bg-white">
      <div class="row items-center no-wrap q-mb-xs">
        <q-btn
          icon="arrow_back_ios_new"
          flat
          round
          dense
          color="dark"
          class="back-btn bg-white shadow-2 q-mr-md"
          size="sm"
          @click="$emit('back-to-catalog')"
        />
        <div class="text-h5 text-bold">Mis Órdenes</div>
        <q-btn
          icon="refresh"
          round
          flat
          @click="refreshOrders"
          :loading="loading"
          class="q-ml-auto"
        >
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && orders.length === 0" class="orders-list q-pa-md">
      <q-card
        v-for="i in 5"
        :key="i"
        flat
        bordered
        class="q-mb-md"
      >
        <q-card-section>
          <q-skeleton type="text" width="40%" />
          <q-skeleton type="text" width="60%" class="q-mt-sm" />
          <q-skeleton type="text" width="30%" class="q-mt-sm" />
        </q-card-section>
      </q-card>
    </div>

    <!-- Orders List -->
    <div v-else-if="orders.length > 0" class="orders-list q-pa-md">
      <q-card
        v-for="order in orders"
        :key="order.id"
        class="order-card q-mb-md"
        flat
        bordered
        @click="openOrderDetails(order)"
      >
        <q-card-section>
          <!-- Header Row -->
          <div class="row justify-between items-start q-mb-md">
            <div>
              <div class="text-subtitle1 text-bold">
                Orden #{{ order.code }}
              </div>
              <div class="text-caption text-grey-7">
                {{ formatDate(order.created_at, 'DD/MM/YYYY') }}
                <span class="q-ml-xs">{{ formatDate(order.created_at, 'HH:mm') }}</span>
              </div>
            </div>
            <q-badge
              :color="getStatusColor(order.status)"
              :label="getStatusLabel(order.status)"
              rounded
            />
          </div>

          <q-separator class="q-my-sm" />

          <!-- Details Row -->
          <div class="row justify-between items-center">
            <div class="col">
              <div class="text-caption text-grey-7">Cliente</div>
              <div class="text-body2">{{ order.client?.name || '-' }}</div>
            </div>
            <div class="col-auto">
              <div class="text-caption text-grey-7 text-right">Total</div>
              <div class="text-h6 text-bold text-primary">
                $ {{ formatNumber(order.total) }}
              </div>
            </div>
          </div>

          <!-- Action Indicator -->
          <div class="row justify-end q-mt-sm">
            <q-btn
              flat
              dense
              size="sm"
              label="Ver detalles"
              icon-right="arrow_forward"
              color="primary"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Pagination -->
      <div v-if="pagination.rowsNumber > pagination.rowsPerPage" class="q-mt-lg">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          @update:model-value="loadPage"
          direction-links
          boundary-links
          color="primary"
          class="justify-center"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <q-icon name="receipt_long" size="80px" color="grey-5" />
      <div class="text-h6 text-grey-6 q-mt-md">
        No tienes órdenes aún
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        Tus pedidos aparecerán aquí
      </div>
    </div>

    <!-- Order Details Dialog -->
    <q-dialog v-model="showDetails" :maximized="$q.screen.lt.sm">
      <q-card v-if="selectedOrder" class="order-details-card column no-wrap" :style="$q.screen.lt.sm ? 'height: 100%;' : 'width: 1000px; max-width: 95vw; max-height: 90vh;'">
        <!-- Header -->
        <q-card-section class="bg-primary text-white row items-center q-py-md col-auto">
          <q-icon name="receipt_long" size="sm" class="q-mr-sm" />
          <div>
            <div class="text-h6">Detalles de la Orden</div>
            <div class="text-caption text-white-8">Referencia: #{{ selectedOrder.code }}</div>
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="showDetails = false"
          />
        </q-card-section>

        <q-separator />

        <!-- Content -->
        <q-card-section class="col scroll q-pa-none">
          <div :class="$q.screen.lt.sm ? 'q-pa-md' : 'q-pa-lg'">
          <div class="row q-col-gutter-md">
            <!-- Columna Izquierda: Información General y Cliente -->
            <div class="col-12 col-md-5">
              <q-card flat bordered class="q-pa-md q-mb-md">
                <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                  <q-icon name="info" class="q-mr-sm" />
                  Información General
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <q-input
                      label="Estado de la Orden"
                      readonly
                      filled
                      dense
                      class="q-mb-sm"
                    >
                      <template v-slot:append>
                        <q-badge
                          :color="getStatusColor(selectedOrder.status)"
                          :label="getStatusLabel(selectedOrder.status)"
                          rounded
                          class="q-pa-xs q-px-sm"
                        />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-6">
                    <q-input
                      label="Código"
                      :model-value="selectedOrder.code"
                      filled
                      readonly
                      dense
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      label="Fecha"
                      :model-value="formatDate(selectedOrder.created_at, 'DD/MM/YYYY')"
                      filled
                      readonly
                      dense
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      label="Cliente"
                      :model-value="selectedOrder.client?.name || 'Cliente Final'"
                      filled
                      readonly
                      dense
                    />
                  </div>
                </div>
              </q-card>

              <q-card flat bordered class="q-pa-md q-mb-md" v-if="selectedOrder.address">
                <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                  <q-icon name="location_on" class="q-mr-sm" />
                  Dirección de Entrega
                </div>
                <q-input
                  :model-value="selectedOrder.address"
                  type="textarea"
                  filled
                  readonly
                  dense
                  autogrow
                />
              </q-card>

              <q-card flat bordered class="q-pa-md q-mb-md" v-if="selectedOrder.description">
                <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                  <q-icon name="notes" class="q-mr-sm" />
                  Descripción / Notas
                </div>
                <q-input
                  :model-value="selectedOrder.description"
                  type="textarea"
                  filled
                  readonly
                  dense
                  autogrow
                />
              </q-card>

              <q-card flat class="bg-primary text-white q-pa-md overflow-hidden total-elevation shadow-5">
                <div class="row justify-between items-center">
                  <div class="column">
                    <div class="text-subtitle2 text-white-8">Total de la Orden</div>
                    <div class="text-h4 text-bold">$ {{ formatNumber(selectedOrder.total) }}</div>
                  </div>
                  <q-icon name="payments" size="lg" class="opacity-2" />
                </div>
              </q-card>
            </div>

            <!-- Columna Derecha: Productos y Pagos -->
            <div class="col-12 col-md-7">
              <q-card flat bordered class="q-pa-md q-mb-md" v-if="selectedOrder.products?.length">
                <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                  <q-icon name="shopping_cart" class="q-mr-sm" />
                  Productos
                </div>
                <q-list bordered separator class="rounded-borders">
                  <q-item
                    v-for="product in selectedOrder.products"
                    :key="product.id"
                    class="q-py-md"
                  >
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ product.name }}</q-item-label>
                      <q-item-label caption v-if="product.observation" class="bg-grey-2 q-pa-xs rounded-borders q-mt-xs">
                        <q-icon name="info_outline" size="xs" /> {{ product.observation }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side class="text-right">
                      <q-item-label class="text-subtitle2">
                        {{ formatNumber(product.pivot?.amount || product.amount || 0) }} x <span class="text-primary">$ {{ formatNumber(product.pivot?.price || product.price || 0) }}</span>
                      </q-item-label>
                      <q-item-label class="text-weight-bolder text-dark">
                        $ {{ formatNumber(product.subtotal || (product.pivot ? (product.pivot.amount * product.pivot.price) : ((product.amount || 0) * (product.price || 0)))) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>

              <q-card flat bordered class="q-pa-md" v-if="selectedOrder.invoice_payments?.length">
                <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                  <q-icon name="payment" class="q-mr-sm" />
                  Historial de Pagos
                </div>
                <div
                  v-for="payment in selectedOrder.invoice_payments"
                  :key="payment.id"
                  class="payment-item-v2 q-pa-md q-mb-sm rounded-borders shadow-1 bg-white bordered"
                  style="border-left: 5px solid var(--q-primary);"
                >
                  <div class="row justify-between items-start q-mb-xs">
                    <div class="text-subtitle2 text-weight-bold">
                      {{ payment.payment_method?.name || 'Pago' }}
                    </div>
                    <div class="text-primary text-bold">
                      $ {{ formatNumber(payment.amount) }}
                    </div>
                  </div>

                  <!-- Payment Vouchers -->
                  <div v-if="payment.files?.length" class="voucher-section q-mt-sm">
                    <div class="text-caption text-grey-7 q-mb-xs">Comprobantes adjuntos:</div>
                    <div class="row q-gutter-sm">
                      <q-img
                        v-for="file in payment.files"
                        :key="file.id"
                        :src="file.url"
                        alt="comprobante"
                        class="voucher-thumbnail shadow-2 bordered"
                        @click="openImage(file.url)"
                        style="width: 80px; height: 80px; border-radius: 8px; cursor: pointer;"
                      >
                        <template v-slot:loading>
                          <q-spinner color="primary" />
                        </template>
                      </q-img>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </q-card-section>

        <!-- Tooltip for Image -->
        <q-tooltip v-if="!$q.screen.lt.sm">Click para ver en grande</q-tooltip>
      </q-card>
    </q-dialog>

    <!-- Image Viewer Dialog -->
    <q-dialog v-model="showImageViewer">
      <q-card class="image-viewer">
        <q-card-section class="q-pa-none">
          <q-img :src="viewerImageUrl" />
        </q-card-section>
        <q-btn
          icon="close"
          color="white"
          text-color="black"
          round
          dense
          class="absolute-top-right q-ma-md"
          @click="showImageViewer = false"
        />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { useOrderStore } from 'src/stores/order'

// Emits
defineEmits(['back-to-catalog'])
import { useQuasar } from 'quasar'
import { formatDate, formatNumber, notify } from 'src/const/mixins'
import { status } from 'src/const/invoice'

// Quasar
const $q = useQuasar()

// Stores
const authStore = authentication()
const orderStore = useOrderStore()
const { userSession } = storeToRefs(authStore)
const { orders, pagination, loading } = storeToRefs(orderStore)

// State
const showDetails = ref(false)
const currentPage = ref(1)
const showImageViewer = ref(false)
const viewerImageUrl = ref('')

// Computed
const totalPages = computed(() =>
  Math.ceil(pagination.value.rowsNumber / pagination.value.rowsPerPage)
)

// Methods
const loadOrders = async (page = 1) => {
  if (!userSession.value) {
    orderStore.resetOrderStore()
    showDetails.value = false
    return
  }

  try {
    await orderStore.fetchOrders(page)
  } catch (error) {
    notify('Error al cargar las órdenes', 'negative', 'warning')
  }
}

const refreshOrders = () => {
  loadOrders(currentPage.value)
}

const loadPage = (page) => {
  currentPage.value = page
  loadOrders(page)
}

const openOrderDetails = (order) => {
  selectedOrder.value = { ...order }
  showDetails.value = true
}

const selectedOrder = ref(null)

const getStatusColor = (statusKey) => {
  return status[statusKey]?.color || 'grey'
}

const getStatusLabel = (statusValue) => {
  return status[statusValue]?.label || 'Desconocido'
}

const openImage = (url) => {
  viewerImageUrl.value = url
  showImageViewer.value = true
}

// La carga de órdenes ahora se dispara solo por acciones específicas (login, checkout)
// o manualmente vía refreshOrders. Hemos removido onActivated y watch(userSession).
</script>

<style scoped>
.orders-view {
  flex: 1;
  min-height: 0;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.orders-header {
  border-bottom: 1px solid #e0e0e0;
  flex: 0 0 auto;
}

.back-btn {
  width: 36px;
  height: 36px;
  min-height: 36px;
}

.back-btn :deep(.q-icon) {
  font-size: 16px;
  margin-right: -2px; /* Center adjustment for arrow_back_ios_new */
}

/* Orders List */
.orders-list {
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  overflow-y: auto;
  flex: 1 1 auto;
}

.order-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  background: white;
  cursor: pointer;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 60vh;
}

/* Order Details Dialog */
.order-details-card {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.text-white-8 {
  color: rgba(255, 255, 255, 0.8);
}

.opacity-2 {
  opacity: 0.2;
}

.total-elevation {
  border-radius: 12px;
  position: relative;
}

.total-elevation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.payment-item-v2 {
  transition: all 0.2s ease;
  border: 1px solid #eee;
}

.payment-item-v2:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.voucher-thumbnail {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.voucher-thumbnail:hover {
  transform: scale(1.1);
  z-index: 10;
}

/* Image Viewer */
.image-viewer {
  max-width: 95vw;
  max-height: 95vh;
  background: transparent;
  box-shadow: none;
}

.image-viewer .q-img {
  max-height: 90vh;
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 599px) {
  .order-details-card {
    border-radius: 0;
  }
}
</style>
