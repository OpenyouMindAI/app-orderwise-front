<template>
  <div class="orders-view">
    <!-- Header -->
    <div class="orders-header q-pa-md bg-white row justify-between items-center">
      <div>
        <div class="text-h5 text-bold">Mis Órdenes</div>
        <div class="text-caption text-grey-7">
          Historial de pedidos realizados
        </div>
      </div>
      <q-btn
        icon="refresh"
        round
        flat
        @click="refreshOrders"
        :loading="loading"
      >
        <q-tooltip>Actualizar</q-tooltip>
      </q-btn>
    </div>

    <!-- Loading State -->
    <div v-if="loading && orders.length === 0" class="q-pa-md">
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
      <q-card v-if="selectedOrder" class="order-details-card">
        <!-- Header -->
        <q-card-section class="bg-primary text-white row justify-between items-center">
          <div>
            <div class="text-h6">Detalles de la Orden</div>
            <div class="text-caption">Orden #{{ selectedOrder.code }}</div>
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="showDetails = false"
          />
        </q-card-section>

        <!-- Content -->
        <q-card-section class="scroll details-content">
          <div class="q-gutter-md">
            <!-- Order Info -->
            <div class="info-section">
              <div class="section-title">Información General</div>
              <q-input
                label="Código"
                :model-value="selectedOrder.code"
                filled
                readonly
                dense
              />
              <q-input
                label="Cliente"
                :model-value="selectedOrder.client?.name"
                filled
                readonly
                dense
                class="q-mt-sm"
              />
              <q-input
                label="Fecha"
                :model-value="formatDate(selectedOrder.created_at, 'DD/MM/YYYY HH:mm:ss')"
                filled
                readonly
                dense
                class="q-mt-sm"
              />
              <div class="q-mt-sm">
                <q-badge
                  :color="getStatusColor(selectedOrder.status)"
                  :label="getStatusLabel(selectedOrder.status)"
                  rounded
                  class="q-pa-sm"
                />
              </div>
            </div>

            <!-- Address -->
            <div class="info-section" v-if="selectedOrder.address">
              <div class="section-title">Dirección de Entrega</div>
              <q-input
                :model-value="selectedOrder.address"
                type="textarea"
                filled
                readonly
                dense
                autogrow
              />
            </div>

            <!-- Description -->
            <div class="info-section" v-if="selectedOrder.description">
              <div class="section-title">Descripción</div>
              <q-input
                :model-value="selectedOrder.description"
                type="textarea"
                filled
                readonly
                autogrow
              />
            </div>

            <!-- Products -->
            <div class="info-section" v-if="selectedOrder.products?.length">
              <div class="section-title">Productos</div>
              <q-list bordered separator class="rounded-borders">
                <q-item
                  v-for="product in selectedOrder.products"
                  :key="product.id"
                >
                  <q-item-section>
                    <q-item-label>{{ product.name }}</q-item-label>
                    <q-item-label caption v-if="product.observation">
                      Obs: {{ product.observation }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      {{ product.amount }} x $ {{ formatNumber(product.price) }}
                    </q-item-label>
                    <q-item-label caption class="text-bold text-primary">
                      $ {{ formatNumber(product.subtotal) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Payments -->
            <div class="info-section" v-if="selectedOrder.invoice_payments?.length">
              <div class="section-title">Pagos</div>
              <div
                v-for="payment in selectedOrder.invoice_payments"
                :key="payment.id"
                class="payment-item q-pa-md bg-grey-2 rounded-borders q-mb-sm"
              >
                <div class="text-subtitle1 text-bold q-mb-sm">
                  {{ payment.payment_method?.name || 'Método de pago' }}
                </div>
                <div class="text-body2 text-grey-7 q-mb-sm">
                  Monto: $ {{ formatNumber(payment.amount) }}
                </div>

                <!-- Payment Vouchers -->
                <div v-if="payment.files?.length" class="voucher-images">
                  <div class="text-caption text-grey-7 q-mb-xs">Comprobantes:</div>
                  <div class="row q-gutter-sm">
                    <q-img
                      v-for="file in payment.files"
                      :key="file.id"
                      :src="file.url"
                      alt="comprobante"
                      class="voucher-thumbnail"
                      @click="openImage(file.url)"
                    >
                      <template v-slot:loading>
                        <q-spinner color="primary" />
                      </template>
                    </q-img>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total -->
            <q-card flat bordered class="total-card">
              <q-card-section>
                <div class="row justify-between items-center">
                  <span class="text-h6">Total</span>
                  <span class="text-h5 text-bold text-primary">
                    $ {{ formatNumber(selectedOrder.total) }}
                  </span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { formatDate, formatNumber, notify } from 'src/const/mixins'
import { status } from 'src/const/invoice'
import { api } from 'boot/axios'

// Quasar
const $q = useQuasar()

// State
const orders = ref([])
const loading = ref(false)
const showDetails = ref(false)
const selectedOrder = ref(null)
const currentPage = ref(1)
const showImageViewer = ref(false)
const viewerImageUrl = ref('')

const pagination = ref({
  rowsPerPage: 10,
  rowsNumber: 0,
  page: 1
})

// Computed
const totalPages = computed(() =>
  Math.ceil(pagination.value.rowsNumber / pagination.value.rowsPerPage)
)

// Methods
const loadOrders = async (page = 1) => {
  try {
    loading.value = true
    const { data } = await api.get('public/invoices', {
      params: {
        page,
        perPage: pagination.value.rowsPerPage,
        sortBy: 'id',
        sortOrder: 'desc',
        paginate: true
      }
    })
    orders.value = data.data || []
    pagination.value.rowsNumber = data.total || 0
    pagination.value.page = page
  } catch (error) {
    console.error('Error loading orders:', error)
    notify('Error al cargar las órdenes', 'negative', 'warning')
  } finally {
    loading.value = false
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
  selectedOrder.value = order
  showDetails.value = true
}

const getStatusColor = (statusValue) => {
  return status[statusValue]?.color || 'grey'
}

const getStatusLabel = (statusValue) => {
  return status[statusValue]?.label || 'Desconocido'
}

const openImage = (url) => {
  viewerImageUrl.value = url
  showImageViewer.value = true
}

// Lifecycle
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-view {
  min-height: 100vh;
  background: #f8f8f8;
}

.orders-header {
  border-bottom: 1px solid #e0e0e0;
}

/* Orders List */
.orders-list {
  max-width: 600px;
  margin: 0 auto;
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
  max-width: 700px;
}

.details-content {
  max-height: 70vh;
}

.info-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary, #ff4d00);
}

.payment-item {
  border-left: 4px solid var(--primary, #ff4d00);
}

.voucher-images {
  margin-top: 0.5rem;
}

.voucher-thumbnail {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.voucher-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.total-card {
  background: #f9f9f9;
  border-radius: 12px;
  border: 2px solid var(--primary, #ff4d00);
}

/* Image Viewer */
.image-viewer {
  max-width: 90vw;
  max-height: 90vh;
}

.image-viewer .q-img {
  max-height: 85vh;
}

/* Responsive */
@media (max-width: 599px) {
  .order-details-card {
    max-width: 100%;
    height: 100%;
  }

  .details-content {
    max-height: none;
  }
}
</style>
