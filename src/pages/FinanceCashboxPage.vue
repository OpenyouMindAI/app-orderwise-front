<template>
  <q-page class="finance-cashbox-page q-pa-md">
    <!-- Header Section -->
    <div class="header-section">
      <div class="row items-center justify-between">
        <div class="col-12 col-md-auto q-mb-sm q-mb-md-none">
          <span class="text-h5 text-weight-bold q-ma-none">Gestión de Cajas</span>
          <p class="text-caption q-mt-xs">Control de saldos y transferencias entre cajas</p>
        </div>
        <div class="col-12 col-md-auto">
          <div class="row q-gutter-sm">
            <q-btn
              outline
              rounded
              color="primary"
              icon="add_circle_outline"
              label="Nuevo Movimiento"
              class="q-px-md"
              dense
              @click="openMovementDialog()"
            />
            <q-btn
              unelevated
              rounded
              color="primary"
              icon="swap_horiz"
              label="Nueva Transferencia"
              class="pulse-button q-px-md"
              dense
              @click="openTransferDialog()"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section q-mb-md">
      <div class="row q-col-gutter-sm items-center">
        <div class="col-12 col-sm-3 col-md-2">
          <q-select
            v-model="filterBranchOffice"
            :options="branchOfficeOptions"
            label="Sucursal"
            outlined
            dense
            clearable
            emit-value
            map-options
            style="min-width: 200px;"
            @update:model-value="loadCashboxes"
          >
            <template v-slot:prepend>
              <q-icon name="storefront" color="primary" size="xs" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-sm-auto">
          <q-btn-toggle
            v-model="filterIsMain"
            toggle-color="primary"
            rounded
            :options="[
              { label: 'Todas', value: null },
              { label: 'Principales', value: 'true' },
              { label: 'Usuario', value: 'false' }
            ]"
            @update:model-value="loadCashboxes"
          />
        </div>
        <q-space />
        <div class="col-auto">
          <q-btn
            flat
            round
            color="primary"
            icon="refresh"
            dense
            size="sm"
            :loading="loading"
            @click="loadCashboxes"
          >
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Cashboxes Grid -->
    <div v-if="loading" class="row q-col-gutter-md">
      <div v-for="n in 8" :key="n" class="col-12 col-sm-4 col-md-3 col-lg-2">
        <q-card flat bordered class="cashbox-card-skeleton">
          <q-card-section class="q-pa-sm">
            <q-skeleton type="QAvatar" size="32px" class="q-mb-sm" />
            <q-skeleton type="text" width="80%" class="q-mb-xs" />
            <q-skeleton type="text" width="50%" class="q-mb-md" />
            <q-skeleton type="rect" height="30px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else-if="cashboxes.length > 0" class="row q-col-gutter-md">
      <div v-for="cashbox in cashboxes" :key="cashbox.id" class="col-12 col-sm-4 col-md-3 col-lg-2">
        <q-card flat class="cashbox-card-compact cursor-pointer" :class="{ 'is-main': cashbox.is_main }" @click="openMovementsDialog(cashbox)">
          <div class="card-glow"></div>
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-gutter-x-sm q-mb-xs">
              <div class="cashbox-icon-mini" :class="cashbox.is_main ? 'bg-amber-1' : 'bg-blue-1'">
                <q-icon :name="cashbox.is_main ? 'account_balance' : 'person'" size="16px" :color="cashbox.is_main ? 'amber-9' : 'blue-8'" />
              </div>
              <div class="col overflow-hidden">
                <div class="text-subtitle2 text-weight-bold ellipsis">{{ cashbox.name }}</div>
              </div>
              <div class="col-auto">
                <q-btn
                  v-if="cashbox.is_main"
                  flat
                  round
                  dense
                  color="primary"
                  icon="swap_horiz"
                  @click.stop="openTransferDialog(cashbox)"
                >
                  <q-tooltip>Transferir desde aquí</q-tooltip>
                </q-btn>
                <q-badge
                  v-else
                  color="blue-6"
                  class="compact-badge"
                >
                  Usuario
                </q-badge>
              </div>
            </div>

            <div class="q-mt-xs">
              <div class="text-caption text-grey-6 ellipsis">
                {{ cashbox.branch_office_name }}
              </div>
              <div class="row items-center justify-between q-mt-xs">
                <div class="text-overline text-grey-7 line-height-1">Saldo</div>
                <div class="text-subtitle2 text-weight-bolder" :class="cashbox.balance >= 0 ? 'text-positive' : 'text-negative'">
                  {{ formatCurrency(cashbox.balance) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else class="empty-state text-center q-pa-xl">
      <q-icon name="inbox" size="100px" color="grey-4" />
      <h3 class="text-h5 text-grey-6 text-weight-bold q-mt-md">No se encontraron cajas</h3>
      <p class="text-grey-5">Prueba ajustando los filtros de búsqueda</p>
    </div>

    <!-- Transfer Dialog -->
    <q-dialog v-model="transferDialog" persistent :maximized="$q.screen.lt.md" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="transfer-dialog-card" :style="!$q.screen.lt.md ? 'width: 550px; border-radius: 20px;' : ''">
        <q-card-section class="dialog-header q-px-lg" :class="{ 'rounded-top': !$q.screen.lt.md }">
          <div class="row items-center justify-between">
            <span class="text-h5 text-weight-bold q-ma-none text-white">Nueva Transferencia</span>
            <q-btn icon="close" flat round dense v-close-popup color="white" />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg scroll">
          <div class="max-width-container">
            <q-form @submit="handleTransfer" class="q-gutter-y-md">
              <!-- Source Cashbox -->
              <div class="form-group">
                <q-select
                  v-model="transferForm.source_cashbox_id"
                  :options="mainCashboxOptions"
                  filled
                  label="Caja Origen (Principales)"
                  placeholder="Selecciona la caja de origen"
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="account_balance" color="primary" />
                  </template>
                </q-select>
              </div>

              <!-- Destination Cashbox -->
              <div class="form-group">
                <q-select
                  v-model="transferForm.destination_cashbox_id"
                  :options="allCashboxOptions"
                  filled
                  label="Caja Destino"
                  placeholder="Selecciona la caja de destino"
                  emit-value
                  map-options
                  :rules="[
                    val => !!val || 'Requerido',
                    val => val !== transferForm.source_cashbox_id || 'Debe ser diferente a la origen'
                  ]"
                  class="custom-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="login" color="primary" />
                  </template>
                </q-select>
              </div>

              <!-- Amount -->
              <div class="form-group">
                <q-input
                  v-model.number="transferForm.amount"
                  type="number"
                  filled
                  label="Monto"
                  placeholder="0.00"
                  :rules="[val => val > 0 || 'Monto inválido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Description -->
              <div class="form-group">
                <q-input
                  v-model="transferForm.description"
                  type="textarea"
                  filled
                  label="Descripción"
                  placeholder="Motivo de la transferencia..."
                  rows="3"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Image Upload (Multiple) -->
              <div class="form-group">
                <label class="form-label q-mb-xs">Comprobantes / Imágenes</label>
                <div
                  class="upload-zone-multiple"
                  @click="triggerFileInput"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                  :class="{ 'dragging': isDragging }"
                >
                  <div class="upload-content text-center q-pa-md">
                    <q-icon name="add_a_photo" size="32px" color="primary" class="q-mb-xs" />
                    <p class="text-caption text-weight-medium q-mb-none">Añadir imágenes</p>
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    style="display: none"
                    accept="image/*"
                    multiple
                    @change="onFilesSelected"
                  />
                </div>

                <!-- Previews Grid -->
                <div v-if="photoPreviews.length > 0" class="row q-col-gutter-sm q-mt-xs">
                  <div v-for="(preview, index) in photoPreviews" :key="index" class="col-4 col-sm-3">
                    <q-card flat bordered class="preview-card-compact relative-position">
                      <q-img :src="preview" class="preview-img-compact" @click="openUploadGallery(index)">
                        <q-btn
                          icon="close"
                          round
                          dense
                          color="negative"
                          size="xs"
                          class="absolute-top-right q-ma-xs z-top"
                          @click.stop="removeImage(index)"
                        />
                      </q-img>
                    </q-card>
                  </div>
                </div>
              </div>

              <div class="q-pt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Confirmar Transferencia"
                  class="full-width text-weight-bold pulse-button"
                  rounded
                  unelevated
                  :loading="submitting"
                />
              </div>
            </q-form>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Image Gallery -->
    <ImageGalleryComponent
      v-model="galleryOpen"
      :images="galleryImages"
      :initial-index="currentGalleryIndex"
    />

    <!-- Image Gallery -->
    <ImageGalleryComponent
      v-model="galleryOpen"
      :images="galleryImages"
      :initial-index="currentGalleryIndex"
    />

    <!-- Movement Dialog -->
    <q-dialog v-model="movementDialog" persistent :maximized="$q.screen.lt.md" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="transfer-dialog-card" :style="!$q.screen.lt.md ? 'width: 500px; border-radius: 20px;' : ''">
        <q-card-section class="dialog-header q-px-lg" :class="{ 'rounded-top': !$q.screen.lt.md }">
          <div class="row items-center justify-between">
            <span class="text-h5 text-weight-bold q-ma-none text-white">Registrar Movimiento</span>
            <q-btn icon="close" flat round dense v-close-popup color="white" />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg scroll">
          <q-form @submit="handleMovement" class="q-gutter-y-md">
            <!-- Cashbox -->
            <q-select
              v-model="movementForm.cashbox_id"
              :options="allCashboxOptions"
              filled
              label="Caja"
              emit-value
              map-options
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="account_balance" color="primary" />
              </template>
            </q-select>

            <!-- Type -->
            <q-select
              v-model="movementForm.type_cashflow"
              :options="[
                { label: 'Entrada (Venta/Cobro)', value: 'debit', icon: 'add_circle', color: 'positive' },
                { label: 'Gasto', value: 'expense', icon: 'remove_circle', color: 'negative' },
                { label: 'Retiro / Vale', value: 'withdrawal', icon: 'payments', color: 'orange' },
                { label: 'Inicio de Caja', value: 'init_cashbox', icon: 'start', color: 'blue' }
              ]"
              filled
              label="Tipo de Movimiento"
              emit-value
              map-options
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon 
                  :name="movementForm.type_cashflow ? movementTypeMap[movementForm.type_cashflow]?.icon : 'list'" 
                  :color="movementForm.type_cashflow ? movementTypeMap[movementForm.type_cashflow]?.color : 'primary'" 
                />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div class="row q-col-gutter-sm">
              <!-- Amount -->
              <div class="col-12">
                <q-input
                  v-model.number="movementForm.amount"
                  type="number"
                  filled
                  label="Monto"
                  placeholder="0.00"
                  :rules="[val => val > 0 || 'Monto inválido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Description -->
            <q-input
              v-model="movementForm.description"
              type="textarea"
              filled
              label="Descripción / Motivo"
              placeholder="Escribe el motivo del movimiento..."
              rows="2"
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>

            <!-- Image Upload -->
            <div class="form-group">
              <label class="form-label q-mb-xs">Comprobantes / Imágenes</label>
              <div
                class="upload-zone-multiple"
                @click="triggerMovementFileInput"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleMovementDrop"
                :class="{ 'dragging': isDragging }"
              >
                <div class="upload-content text-center q-pa-md">
                  <q-icon name="add_a_photo" size="32px" color="primary" class="q-mb-xs" />
                  <p class="text-caption text-weight-medium q-mb-none">Añadir imágenes</p>
                </div>
                <input
                  type="file"
                  ref="movementFileInput"
                  style="display: none"
                  accept="image/*"
                  multiple
                  @change="onMovementFilesSelected"
                />
              </div>

              <!-- Previews Grid -->
              <div v-if="movementPhotoPreviews.length > 0" class="row q-col-gutter-sm q-mt-xs">
                <div v-for="(preview, index) in movementPhotoPreviews" :key="index" class="col-4 col-sm-3">
                  <q-card flat bordered class="preview-card-compact relative-position">
                    <q-img :src="preview" class="preview-img-compact" @click="openMovementUploadGallery(index)">
                      <q-btn
                        icon="close"
                        round
                        dense
                        color="negative"
                        size="xs"
                        class="absolute-top-right q-ma-xs z-top"
                        @click.stop="removeMovementImage(index)"
                      />
                    </q-img>
                  </q-card>
                </div>
              </div>
            </div>

            <div class="q-pt-md">
              <q-btn
                type="submit"
                color="primary"
                label="Registrar Movimiento"
                class="full-width text-weight-bold"
                rounded
                unelevated
                :loading="submitting"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Movements Dialog -->
    <q-dialog v-model="movementsDialog" position="right" full-height :maximized="$q.screen.lt.sm">
      <q-card style="width: 400px; max-width: 100vw;" class="column no-border-radius shadow-2">
        <q-card-section class="q-pa-md bg-primary text-white sticky-top z-top header-blur border-bottom bg-">
          <div class="row items-center justify-between q-mb-sm">
            <div class="column">
              <div class="text-subtitle2 text-weight-bold">{{ selectedCashbox?.name }}</div>
              <div>Historial de movimientos</div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup size="sm" />
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-select
                v-model="filterMovementType"
                :options="movementTypeOptions"
                label="Tipo de movimiento"
                outlined
                clearable
                dense
                emit-value
                map-options
                @update:model-value="loadMovements"
              >
                <template v-slot:prepend>
                  <q-icon name="filter_list" size="xs" color="grey-6" />
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="col q-pa-none scroll">
          <q-list v-if="movements.length > 0" class="movements-list">
            <q-item
              v-for="mov in movements"
              :key="mov.id"
              class="movement-item"
              v-ripple
              style="padding: 8px 16px;"
            >
              <q-item-section avatar style="min-width: 40px;">
                <q-icon
                  :name="isPositive(mov.type_cashflow) ? 'add_circle' : 'remove_circle'"
                  :color="isPositive(mov.type_cashflow) ? 'green-5' : 'red-5'"
                  size="22px"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium text-body2">
                  {{ mov.description || getTypeName(mov.type_cashflow) }}
                </q-item-label>
                <q-item-label caption class="row items-center q-gutter-x-sm no-wrap ellipsis">
                  <span>{{ formatDate(mov.created_at) }}</span>
                  <span v-if="mov.payment_method" class="text-grey-5">• {{ mov.payment_method.name }}</span>
                </q-item-label>
                <div v-if="mov.images && mov.images.length > 0" class="row q-gutter-xs q-mt-xs">
                  <q-avatar
                    v-for="(img, idx) in mov.images.slice(0, 3)"
                    :key="img.id"
                    size="20px"
                    square
                    class="cursor-pointer shadow-1 rounded-sm"
                    @click.stop="openMovementGallery(mov, idx)"
                  >
                    <q-img :src="img.url" ratio="1" />
                  </q-avatar>
                  <div
                    v-if="mov.images.length > 3"
                    class="text-caption text-grey-6 flex items-center q-ml-xs"
                    style="font-size: 10px;"
                  >
                    +{{ mov.images.length - 3 }}
                  </div>
                </div>
              </q-item-section>

              <q-item-section side>
                <div
                  class="text-weight-bold"
                  :class="isPositive(mov.type_cashflow) ? 'text-green-7' : 'text-red-7'"
                  style="font-size: 0.9rem;"
                >
                  {{ isPositive(mov.type_cashflow) ? '+' : '-' }} {{ formatCurrency(mov.amount) }}
                </div>
              </q-item-section>
              <q-separator inset spaced v-if="false" /> <!-- Use manual separator if needed -->
            </q-item>

            <div v-if="hasMore" class="q-pa-md text-center">
              <q-btn
                flat
                label="Cargar más"
                color="primary"
                size="xs"
                rounded
                :loading="loadingMore"
                @click="loadMoreMovements"
              />
            </div>
          </q-list>

          <div v-else-if="!loadingMovements" class="empty-state-mini column items-center justify-center q-pa-xl text-grey-5">
            <q-icon name="history" size="32px" opacity="0.5" />
            <div class="text-caption q-mt-sm">Sin movimientos</div>
          </div>

          <div v-if="loadingMovements && movements.length === 0" class="q-pa-md">
            <q-item v-for="n in 8" :key="n" style="padding: 8px 16px;">
              <q-item-section avatar style="min-width: 40px;">
                <q-skeleton type="QAvatar" size="22px" />
              </q-item-section>
              <q-item-section>
                <q-skeleton type="text" width="70%" />
                <q-skeleton type="text" width="40%" />
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-section v-if="selectedCashbox" class="q-pa-md">
          <div class="row justify-between items-center q-mb-md">
            <span class="text-caption text-grey-7 text-uppercase letter-spacing-1">Saldo Final</span>
            <span class="text-subtitle1 text-weight-bolder" :class="selectedCashbox.balance >= 0 ? 'text-positive' : 'text-negative'">
              {{ formatCurrency(selectedCashbox.balance) }}
            </span>
          </div>
          
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-btn 
                outline 
                color="positive" 
                icon="add" 
                label="Entrada" 
                class="full-width" 
                rounded
                @click="openQuickMovement('debit')"
              />
            </div>
            <div class="col-6">
              <q-btn 
                outline 
                color="negative" 
                icon="remove" 
                label="Salida" 
                class="full-width" 
                rounded
                @click="openQuickMovement('expense')"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import ImageGalleryComponent from 'src/components/ImageGalleryComponent.vue'

/**
 * Quasar instance
 */
const $q = useQuasar()

/**
 * State
 */
const loading = ref(false)
const submitting = ref(false)
const cashboxes = ref([])
const allMainCashboxes = ref([])
const branchOffices = ref([])
const transferDialog = ref(false)
const movementDialog = ref(false)
const movementsDialog = ref(false)
const filterBranchOffice = ref(null)
const filterIsMain = ref('true') // Default view main cashboxes
const filterMovementType = ref(null)

const paymentMethods = ref([])
const selectedCashbox = ref(null)
const movements = ref([])
const loadingMovements = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const hasMore = ref(false)

const transferForm = reactive({
  source_cashbox_id: null,
  destination_cashbox_id: null,
  amount: null,
  description: '',
  images: []
})

const movementForm = reactive({
  cashbox_id: null,
  type_cashflow: 'debit',
  amount: null,
  description: '',
  images: []
})

const isDragging = ref(false)
const photoPreviews = ref([])
const movementPhotoPreviews = ref([])
const fileInput = ref(null)
const movementFileInput = ref(null)

const movementTypeMap = {
  debit: { icon: 'add_circle', color: 'positive' },
  expense: { icon: 'remove_circle', color: 'negative' },
  withdrawal: { icon: 'payments', color: 'orange' },
  init_cashbox: { icon: 'start', color: 'blue' }
}

// Gallery
const galleryOpen = ref(false)
const currentGalleryIndex = ref(0)
const galleryImages = ref([])

const branchOfficeOptions = computed(() => {
  return branchOffices.value.map(bo => ({ label: bo.name, value: bo.id }))
})

const mainCashboxOptions = computed(() => {
  return allMainCashboxes.value
    .map(c => ({
      label: `${c.name} (${formatCurrency(c.balance)})`,
      value: c.id
    }))
})

const allCashboxOptions = computed(() => {
  return cashboxes.value.map(c => ({
    label: `${c.name} - ${c.branch_office_name}`,
    value: c.id
  }))
})

const movementTypeOptions = [
  { label: 'Entradas (Ventas)', value: 'debit' },
  { label: 'Inicio de Caja', value: 'init_cashbox' },
  { label: 'Transferencia (Entrada)', value: 'transfer_in' },
  { label: 'Salidas (Créditos)', value: 'credit' },
  { label: 'Gastos', value: 'expense' },
  { label: 'Retiros', value: 'withdrawal' },
  { label: 'Cierre de Caja', value: 'close_cashbox' },
  { label: 'Transferencia (Salida)', value: 'transfer_out' }
]

/**
 * Methods
 */
const loadBranchOffices = async () => {
  try {
    const { data } = await api.get('/branch-offices')
    branchOffices.value = data.data || data
  } catch (error) {
    console.error('Error loading branch offices:', error)
  }
}

const loadCashboxes = async () => {
  loading.value = true
  try {
    const params = {
      branch_office_id: filterBranchOffice.value,
      is_main: filterIsMain.value,
      paginate: 'false'
    }
    const { data } = await api.get('/cashboxes/balances', { params })
    cashboxes.value = data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar cajas',
      position: 'bottom-right'
    })
  } finally {
    loading.value = false
  }
}

const loadMainCashboxes = async () => {
  try {
    const { data } = await api.get('/cashboxes/balances', {
      params: { is_main: 'true', paginate: 'false' }
    })
    allMainCashboxes.value = data
  } catch (error) {
    console.error('Error loading main cashboxes:', error)
  }
}

const openTransferDialog = (cashbox = null) => {
  Object.assign(transferForm, {
    source_cashbox_id: cashbox && cashbox.is_main ? cashbox.id : null,
    destination_cashbox_id: cashbox && !cashbox.is_main ? cashbox.id : null,
    amount: null,
    description: '',
    images: []
  })
  photoPreviews.value = []
  transferDialog.value = true
}

const openMovementDialog = (cashbox = null, type = 'debit') => {
  Object.assign(movementForm, {
    cashbox_id: cashbox ? cashbox.id : null,
    type_cashflow: type,
    amount: null,
    description: '',
    images: []
  })
  movementPhotoPreviews.value = []
  movementDialog.value = true
}

const openQuickMovement = (type) => {
  if (selectedCashbox.value) {
    openMovementDialog(selectedCashbox.value, type)
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const triggerMovementFileInput = () => {
  movementFileInput.value.click()
}

const onFilesSelected = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) processFiles(files)
}

const onMovementFilesSelected = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) processMovementFiles(files)
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) processFiles(files)
}

const handleMovementDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) processMovementFiles(files)
}

const processFiles = (files) => {
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      $q.notify({ type: 'negative', message: `El archivo ${file.name} no es una imagen` })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      $q.notify({ type: 'negative', message: `La imagen ${file.name} excede los 10MB` })
      return
    }

    transferForm.images.push(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const processMovementFiles = (files) => {
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      $q.notify({ type: 'negative', message: `El archivo ${file.name} no es una imagen` })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      $q.notify({ type: 'negative', message: `La imagen ${file.name} excede los 10MB` })
      return
    }

    movementForm.images.push(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      movementPhotoPreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  transferForm.images.splice(index, 1)
  photoPreviews.value.splice(index, 1)
}

const removeMovementImage = (index) => {
  movementForm.images.splice(index, 1)
  movementPhotoPreviews.value.splice(index, 1)
}

const openUploadGallery = (index) => {
  galleryImages.value = photoPreviews.value.map(url => ({ url }))
  currentGalleryIndex.value = index
  galleryOpen.value = true
}

const openMovementUploadGallery = (index) => {
  galleryImages.value = movementPhotoPreviews.value.map(url => ({ url }))
  currentGalleryIndex.value = index
  galleryOpen.value = true
}

const openMovementGallery = (mov, index) => {
  if (mov.images && mov.images.length > 0) {
    galleryImages.value = mov.images
    currentGalleryIndex.value = index
    galleryOpen.value = true
  }
}

const handleTransfer = async () => {
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('source_cashbox_id', transferForm.source_cashbox_id)
    formData.append('destination_cashbox_id', transferForm.destination_cashbox_id)
    formData.append('amount', transferForm.amount)
    formData.append('description', transferForm.description)
    if (transferForm.images && transferForm.images.length > 0) {
      transferForm.images.forEach(img => {
        formData.append('images[]', img)
      })
    }

    await api.post('/cashboxes/transfer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    $q.notify({
      type: 'positive',
      message: 'Transferencia completada',
      icon: 'check_circle'
    })
    transferDialog.value = false
    loadCashboxes()
    loadMainCashboxes()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error en la transferencia'
    })
  } finally {
    submitting.value = false
  }
}

const handleMovement = async () => {
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('cashbox_id', movementForm.cashbox_id)
    formData.append('type_cashflow', movementForm.type_cashflow)
    formData.append('amount', movementForm.amount)
    formData.append('description', movementForm.description)
    
    if (movementForm.images && movementForm.images.length > 0) {
      movementForm.images.forEach(img => {
        formData.append('images[]', img)
      })
    }

    await api.post('/cashboxes/movements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    $q.notify({
      type: 'positive',
      message: 'Movimiento registrado con éxito',
      icon: 'check_circle'
    })
    
    movementDialog.value = false
    loadCashboxes()
    loadMainCashboxes()
    
    // If we are viewing the movements list for this box, reload it
    if (movementsDialog.value && selectedCashbox.value && selectedCashbox.value.id === movementForm.cashbox_id) {
       loadMovements()
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al registrar movimiento'
    })
  } finally {
    submitting.value = false
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(val || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isPositive = (type) => {
  return ['debit', 'init_cashbox', 'transfer_in'].includes(type)
}

const getTypeName = (type) => {
  const found = movementTypeOptions.find(o => o.value === type)
  return found ? found.label : type
}

const openMovementsDialog = (cashbox) => {
  selectedCashbox.value = cashbox
  movements.value = []
  currentPage.value = 1
  filterMovementType.value = null
  movementsDialog.value = true
  loadMovements()
}

const loadMovements = async () => {
  if (!selectedCashbox.value) return
  loadingMovements.value = true
  try {
    const params = {
      type: filterMovementType.value,
      page: 1,
      perPage: 20
    }
    const { data } = await api.get(`/cashboxes/${selectedCashbox.value.id}/movements`, { params })
    movements.value = data.data
    hasMore.value = data.current_page < data.last_page
    currentPage.value = data.current_page
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar movimientos' })
  } finally {
    loadingMovements.value = false
  }
}

const loadMoreMovements = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const params = {
      type: filterMovementType.value,
      page: currentPage.value + 1,
      perPage: 20
    }
    const { data } = await api.get(`/cashboxes/${selectedCashbox.value.id}/movements`, { params })
    movements.value = [...movements.value, ...data.data]
    hasMore.value = data.current_page < data.last_page
    currentPage.value = data.current_page
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar más movimientos' })
  } finally {
    loadingMore.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadBranchOffices(),
    loadCashboxes(),
    loadMainCashboxes()
  ])
})
</script>

<style lang="scss" scoped>
.finance-cashbox-page {
  min-height: 100vh;
}

.text-gradient {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pulse-button {
  box-shadow: 0 4px 15px rgba(var(--q-primary-rgb), 0.3);
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--q-primary-rgb), 0.4);
  }
}

// Cashbox Cards - Compact
.cashbox-card-compact {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.06);
    border-color: var(--q-primary);
  }

  &.is-main {
    border-color: rgba(255, 193, 7, 0.4);
    &:hover {
        border-color: #ff9800;
    }
  }

  .cashbox-icon-mini {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .compact-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }
}

.toggle-filter-compact {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 0px 10px;
  :deep(.q-btn) {
    font-size: 12px;
    min-height: 32px;
  }
}

.compact-select {
  :deep(.q-field__control) {
    height: 36px;
    border-radius: 8px;
  }
  :deep(.q-field__marginal) {
    height: 36px;
  }
}

.line-height-1 {
  line-height: 1;
}

.balance-container {
  padding-top: 4px;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

// Dialog Styles
.transfer-dialog-card {
  display: flex;
  flex-direction: column;
}

.dialog-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1976d2 100%);
  padding-top: 20px;
  padding-bottom: 20px;
  &.rounded-top {
    border-radius: 20px 20px 0 0;
  }
}

.max-width-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 12px;
  }
}

// Upload Area Multiple
.upload-zone-multiple {
  border: 2px dashed rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.01);

  &:hover, &.dragging {
    border-color: var(--q-primary);
    background-color: rgba(var(--q-primary-rgb), 0.02);
  }
}

.body--dark .upload-zone-multiple {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.preview-card-compact {
  border-radius: 8px;
  overflow: hidden;
  height: 80px;
}

.preview-img-compact {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.rounded-sm {
  border-radius: 4px;
}

.remove-images-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
}

.rounded-pill {
  border-radius: 50px;
}

.opacity-20 {
  opacity: 0.2;
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.body--dark .border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.border-bottom-light {
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.body--dark .border-bottom-light {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.header-blur {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.8);
}

.body--dark .header-blur {
  background: rgba(29, 29, 29, 0.8);
}

.compact-select-mini {
  :deep(.q-field__control) {
    min-height: 32px;
    height: 32px;
    font-size: 13px;
  }
  :deep(.q-field__marginal) {
    height: 32px;
  }
  :deep(.q-field__label) {
    top: 6px;
  }
}

.movement-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  &:last-child {
    border-bottom: none;
  }
}

.body--dark .movement-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.z-top {
  z-index: 100;
}

.sticky-top {
  position: sticky;
  top: 0;
}

.movement-item {
  transition: background-color 0.2s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

.body--dark .movement-item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

@media (max-width: 600px) {
  .header-section {
    text-align: center;
    .row {
      flex-direction: column;
      gap: 20px;
    }
  }

  .transfer-dialog-card {
    border-radius: 0;
  }
}
</style>
