<template>
  <q-page class="finance-cashbox-page q-pa-md">
    <!-- Header Section -->
    <div class="header-section q-mb-lg">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <span class="text-h5 text-weight-bold q-ma-none">Gestión de Cajas</span>
          <p class="text-caption q-mt-xs text-grey-6">Control de saldos y transferencias globales</p>
        </div>
        <q-btn
          flat
          round
          color="primary"
          icon="refresh"
          dense
          :loading="loading"
          @click="loadCashboxes"
        >
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <!-- Compact Action Buttons -->
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-btn
            outline
            rounded
            color="primary"
            icon="add_circle_outline"
            label="Movimiento"
            class="full-width action-btn-compact"
            @click="openMovementDialog()"
          />
        </div>
        <div class="col-6">
          <q-btn
            unelevated
            rounded
            color="primary"
            icon="swap_horiz"
            label="Transferencia"
            class="full-width action-btn-compact pulse-button"
            @click="openTransferDialog()"
          />
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
      <div v-for="cashbox in cashboxes" :key="cashbox.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card flat class="cashbox-card-compact cursor-pointer" @click="openMovementsDialog(cashbox)">
          <div class="card-glow"></div>
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap q-gutter-x-md q-mb-sm">
              <div class="cashbox-icon-mini bg-primary-light">
                <q-icon name="account_balance" size="20px" color="primary" />
              </div>
              <div class="col overflow-hidden">
                <div class="text-subtitle1 text-weight-bold ellipsis">{{ cashbox.name }}</div>
                <div class="text-caption text-grey-6 line-height-1">Caja Global Principal</div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="swap_horiz"
                  size="sm"
                  @click.stop="openTransferDialog(cashbox)"
                >
                  <q-tooltip>Transferir</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="row items-center justify-between q-mt-md q-pt-sm border-top-dashed">
              <div class="column">
                <div class="text-overline text-grey-7 line-height-1">Saldo Disponible</div>
                <div class="text-h6 text-weight-bolder" :class="cashbox.balance >= 0 ? 'text-positive' : 'text-negative'">
                  {{ formatCurrency(cashbox.balance) }}
                </div>
              </div>
              <q-icon name="chevron_right" color="grey-4" size="sm" />
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
    <q-dialog v-model="transferDialog" persistent transition-show="slide-up" transition-hide="slide-down">
      <q-card class="transfer-dialog-card" style="max-width: 95vw; width: 600px; border-radius: 20px;">
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
    <q-dialog v-model="movementDialog" persistent transition-show="slide-up" transition-hide="slide-down">
      <q-card class="transfer-dialog-card" style="max-width: 95vw; width: 600px; border-radius: 20px;">
        <q-card-section class="dialog-header q-px-lg" :class="{ 'rounded-top': !$q.screen.lt.md }">
          <div class="row items-center justify-between">
            <span class="text-h6 text-weight-bold q-ma-none text-white">Registrar Movimiento</span>
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
                { label: 'Arqueo', value: 'withdrawal', icon: 'payments', color: 'orange' },
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

    <!-- Movements Dialog - Bank Statement Style -->
    <q-dialog v-model="movementsDialog" position="right" full-height>
      <q-card style="width: 420px; max-width: 100vw;" class="column no-border-radius shadow-4 movements-dialog-card">
        <!-- Header -->
        <q-card-section class="bg-primary text-white sticky-top z-top q-pa-md">
          <div class="row items-center justify-between">
            <div class="column">
              <div class="text-h6 text-weight-bold line-height-1">{{ selectedCashbox?.name }}</div>
              <div class="text-caption text-white-7 q-mt-xs">Estado de cuenta</div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup size="sm" color="white" />
          </div>

          <!-- Current Balance Card -->
          <div class="balance-card-compact q-mt-sm q-pa-sm rounded-borders">
            <div class="row items-center justify-between no-wrap">
              <div class="row items-center q-gutter-x-sm no-wrap">
                <q-icon name="account_balance_wallet" size="20px" color="white" style="opacity: 0.7" />
                <span class="text-caption text-white-7">Saldo:</span>
              </div>
              <div
                class="text-subtitle1 text-weight-bold"
                :class="selectedCashbox?.balance >= 0 ? 'text-white' : 'text-red-3'"
              >
                {{ formatCurrency(selectedCashbox?.balance) }}
              </div>
            </div>
          </div>

          <!-- Filter -->
          <q-select
            v-model="filterMovementType"
            :options="movementTypeOptions"
            label="Filtrar por tipo"
            outlined
            clearable
            dense
            dark
            emit-value
            map-options
            class="q-mt-md filter-select-dark"
            @update:model-value="loadMovements"
          >
            <template v-slot:prepend>
              <q-icon name="filter_list" size="xs" />
            </template>
          </q-select>
        </q-card-section>

        <!-- Movements List -->
        <q-card-section class="col q-pa-none scroll movements-scroll-area">
          <div v-if="movements.length > 0" class="movements-container">
            <div
              v-for="mov in movements"
              :key="mov.id"
              class="movement-row"
              v-ripple
            >
              <!-- Left: Icon + Info -->
              <div class="movement-left">
                <div
                  class="movement-icon-wrapper"
                  :class="mov.is_positive ? 'bg-green-1' : 'bg-red-1'"
                >
                  <q-icon
                    :name="mov.is_positive ? 'arrow_downward' : 'arrow_upward'"
                    :color="mov.is_positive ? 'green-7' : 'red-7'"
                    size="16px"
                  />
                </div>
                <div class="movement-info">
                  <div class="movement-description ellipsis-2-lines">
                    {{ mov.description || getTypeName(mov.type_cashflow) }}
                  </div>
                  <div class="movement-meta">
                    <span>{{ formatDateShort(mov.created_at) }}</span>
                    <span v-if="mov.payment_method?.name" class="meta-separator">•</span>
                    <span v-if="mov.payment_method?.name" class="ellipsis">{{ mov.payment_method.name }}</span>
                  </div>
                  <!-- Images -->
                  <div v-if="mov.images?.length > 0" class="movement-images q-mt-xs">
                    <q-avatar
                      v-for="(img, idx) in mov.images.slice(0, 2)"
                      :key="img.id || idx"
                      size="18px"
                      square
                      class="cursor-pointer shadow-1 rounded-sm"
                      @click.stop="openMovementGallery(mov, idx)"
                    >
                      <q-img :src="img.url" ratio="1" />
                    </q-avatar>
                    <span v-if="mov.images.length > 2" class="images-count">+{{ mov.images.length - 2 }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Amount + Balance -->
              <div class="movement-right">
                <div
                  class="movement-amount"
                  :class="mov.is_positive ? 'text-green-7' : 'text-red-7'"
                >
                  {{ mov.is_positive ? '+' : '-' }}{{ formatCurrency(mov.amount) }}
                </div>
                <div class="movement-balance">
                  Saldo: {{ formatCurrency(mov.balance_after) }}
                </div>
              </div>
            </div>

            <!-- Load More -->
            <div v-if="hasMore" class="q-pa-md text-center">
              <q-btn
                flat
                label="Cargar más"
                color="primary"
                size="sm"
                rounded
                :loading="loadingMore"
                @click="loadMoreMovements"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!loadingMovements" class="empty-state-mini column items-center justify-center q-pa-xl text-grey-5">
            <q-icon name="receipt_long" size="48px" style="opacity: 0.4" />
            <div class="text-body2 q-mt-md">Sin movimientos registrados</div>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="loadingMovements && movements.length === 0" class="q-pa-sm">
            <div v-for="n in 6" :key="n" class="movement-row skeleton-row">
              <div class="movement-left">
                <q-skeleton type="circle" size="32px" />
                <div class="movement-info">
                  <q-skeleton type="text" width="80%" />
                  <q-skeleton type="text" width="50%" />
                </div>
              </div>
              <div class="movement-right">
                <q-skeleton type="text" width="60px" />
                <q-skeleton type="text" width="70px" />
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Footer Actions -->
        <q-separator />
        <q-card-section v-if="selectedCashbox" class="q-pa-md footer-actions">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-btn
                unelevated
                color="green-6"
                icon="add"
                label="Entrada"
                class="full-width action-btn-footer"
                @click="openQuickMovement('debit')"
              />
            </div>
            <div class="col-6">
              <q-btn
                unelevated
                color="red-6"
                icon="remove"
                label="Salida"
                class="full-width action-btn-footer"
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
/**
 * Flag to indicate if data is being loaded
 * @type {ref<boolean>} indicator var
 */
const loading = ref(false)

/**
 * Flag to indicate if form submission is in progress
 * @type {ref<boolean>} indicator var
 */
const submitting = ref(false)

/**
 * List of cashboxes to display
 * @type {ref<array>} data var
 */
const cashboxes = ref([])

/**
 * Flag to control the visibility of the transfer dialog
 * @type {ref<boolean>} indicator var
 */
const transferDialog = ref(false)

/**
 * Flag to control the visibility of the movement dialog
 * @type {ref<boolean>} indicator var
 */
const movementDialog = ref(false)

/**
 * Flag to control the visibility of the movements history dialog
 * @type {ref<boolean>} indicator var
 */
const movementsDialog = ref(false)

/**
 * Filter value for movement type in history
 * @type {ref<string|null>} filter var
 */
const filterMovementType = ref(null)

/**
 * Currently selected cashbox for viewing history or operations
 * @type {ref<object|null>} data var
 */
const selectedCashbox = ref(null)

/**
 * List of movements for the selected cashbox
 * @type {ref<array>} data var
 */
const movements = ref([])

/**
 * Flag to indicate if movements are being loaded
 * @type {ref<boolean>} indicator var
 */
const loadingMovements = ref(false)

/**
 * Flag to indicate if more movements are being loaded during pagination
 * @type {ref<boolean>} indicator var
 */
const loadingMore = ref(false)

/**
 * Current page number for movements pagination
 * @type {ref<number>} pagination var
 */
const currentPage = ref(1)

/**
 * Flag to indicate if there are more movements to load
 * @type {ref<boolean>} indicator var
 */
const hasMore = ref(false)

/**
 * Reactive object for transfer form data
 * @type {reactive} data var
 */
const transferForm = reactive({
  source_cashbox_id: null,
  destination_cashbox_id: null,
  amount: null,
  description: '',
  images: []
})

/**
 * Reactive object for movement form data
 * @type {reactive} data var
 */
const movementForm = reactive({
  cashbox_id: null,
  type_cashflow: 'debit',
  amount: null,
  description: '',
  images: []
})

/**
 * Flag to indicate if a file is being dragged over the upload area
 * @type {ref<boolean>} indicator var
 */
const isDragging = ref(false)

/**
 * Preview URLs for images to be uploaded in transfer form
 * @type {ref<array>} data var
 */
const photoPreviews = ref([])

/**
 * Preview URLs for images to be uploaded in movement form
 * @type {ref<array>} data var
 */
const movementPhotoPreviews = ref([])

/**
 * Reference to the file input element for transfers
 * @type {ref<HTMLElement|null>} dom var
 */
const fileInput = ref(null)

/**
 * Reference to the file input element for movements
 * @type {ref<HTMLElement|null>} dom var
 */
const movementFileInput = ref(null)

/**
 * Mapping of movement types to icons and colors
 * @type {object} constant var
 */
const movementTypeMap = {
  debit: { icon: 'add_circle', color: 'positive' },
  expense: { icon: 'remove_circle', color: 'negative' },
  withdrawal: { icon: 'payments', color: 'orange' },
  init_cashbox: { icon: 'start', color: 'blue' },
  global_withdrawal: { icon: 'account_balance_wallet', color: 'green' }
}

/**
 * Flag to control the visibility of the image gallery
 * @type {ref<boolean>} indicator var
 */
const galleryOpen = ref(false)

/**
 * Currently active image index in the gallery
 * @type {ref<number>} state var
 */
const currentGalleryIndex = ref(0)

/**
 * List of images to display in the gallery
 * @type {ref<array>} data var
 */
const galleryImages = ref([])

/**
 * Computed options for source cashbox select input
 * @type {computed<array>} computed var
 */
const mainCashboxOptions = computed(() => {
  return cashboxes.value
    .filter(c => c.is_main) // Keep filter for explicit main cashboxes, though loadCashboxes now only loads main ones.
    .map(c => ({
      label: `${c.name} (${formatCurrency(c.balance)})`,
      value: c.id
    }))
})

/**
 * Computed options for destination cashbox select input
 * @type {computed<array>} computed var
 */
const allCashboxOptions = computed(() => {
  // If cashboxes.value only contains main cashboxes, this will effectively be the same as mainCashboxOptions
  return cashboxes.value.map(c => ({
    label: c.name,
    value: c.id
  }))
})

/**
 * Static options for movement type filtering
 * @type {array} constant var
 */
const movementTypeOptions = [
  { label: 'Entradas (Ventas)', value: 'debit' },
  { label: 'Inicio de Caja', value: 'init_cashbox' },
  { label: 'Arqueo Global (Entrada)', value: 'global_withdrawal' },
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
/**
 * Fetches cashbox balances from the API. Only fetches main cashboxes.
 * @params {void} none
 * @return {Promise<void>} resolve promise
 */
const loadCashboxes = async () => {
  loading.value = true
  try {
    const params = {
      is_main: 'true',
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

/**
 * Opens the transfer dialog and optionally pre-selects a cashbox
 * @params {object|null} cashbox cashbox to pre-select
 * @return {void} none
 */
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

/**
 * Opens the movement dialog for a specific box and type
 * @params {object|null} cashbox box to associate with the movement
 * @params {string} type type of cashflow movement
 * @return {void} none
 */
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

/**
 * Helper to open the movement dialog from the quick actions in history
 * @params {string} type type of movement to perform
 * @return {void} none
 */
const openQuickMovement = (type) => {
  if (selectedCashbox.value) {
    openMovementDialog(selectedCashbox.value, type)
  }
}

/**
 * Triggers the browser's file picker for transfers
 * @params {void} none
 * @return {void} none
 */
const triggerFileInput = () => {
  fileInput.value.click()
}

/**
 * Triggers the browser's file picker for movements
 * @params {void} none
 * @return {void} none
 */
const triggerMovementFileInput = () => {
  movementFileInput.value.click()
}

/**
 * Handles file selection for transfers
 * @params {Event} event file selection event
 * @return {void} none
 */
const onFilesSelected = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) processFiles(files)
}

/**
 * Handles file selection for movements
 * @params {Event} event file selection event
 * @return {void} none
 */
const onMovementFilesSelected = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) processMovementFiles(files)
}

/**
 * Handles file drop for transfers
 * @params {DragEvent} event drop event
 * @return {void} none
 */
const handleDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) processFiles(files)
}

/**
 * Handles file drop for movements
 * @params {DragEvent} event drop event
 * @return {void} none
 */
const handleMovementDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) processMovementFiles(files)
}

/**
 * Validates and processes multiple image files for transfers
 * @params {array} files list of file objects
 * @return {void} none
 */
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

/**
 * Validates and processes multiple image files for movements
 * @params {array} files list of file objects
 * @return {void} none
 */
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

/**
 * Removes an image from the transfer form's selection
 * @params {number} index index of the image to remove
 * @return {void} none
 */
const removeImage = (index) => {
  transferForm.images.splice(index, 1)
  photoPreviews.value.splice(index, 1)
}

/**
 * Removes an image from the movement form's selection
 * @params {number} index index of the image to remove
 * @return {void} none
 */
const removeMovementImage = (index) => {
  movementForm.images.splice(index, 1)
  movementPhotoPreviews.value.splice(index, 1)
}

/**
 * Opens the gallery for images in the transfer form
 * @params {number} index index of the image to start with
 * @return {void} none
 */
const openUploadGallery = (index) => {
  galleryImages.value = photoPreviews.value.map(url => ({ url }))
  currentGalleryIndex.value = index
  galleryOpen.value = true
}

/**
 * Opens the gallery for images in the movement form
 * @params {number} index index of the image to start with
 * @return {void} none
 */
const openMovementUploadGallery = (index) => {
  galleryImages.value = movementPhotoPreviews.value.map(url => ({ url }))
  currentGalleryIndex.value = index
  galleryOpen.value = true
}

/**
 * Opens the gallery for images associated with an existing movement
 * @params {object} mov movement object containing images
 * @params {number} index index of the image to start with
 * @return {void} none
 */
const openMovementGallery = (mov, index) => {
  if (mov.images && mov.images.length > 0) {
    galleryImages.value = mov.images
    currentGalleryIndex.value = index
    galleryOpen.value = true
  }
}

/**
 * Submits the transfer request to the API
 * @params {void} none
 * @return {Promise<void>} resolve promise
 */
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
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error en la transferencia'
    })
  } finally {
    submitting.value = false
  }
}

/**
 * Submits the movement request to the API
 * @params {void} none
 * @return {Promise<void>} resolve promise
 */
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

/**
 * Formats a numeric value into a currency string (ARS)
 * @params {number} val numeric value to format
 * @return {string} formatted currency string
 */
const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(val || 0)
}

/**
 * Formats a date string into a local readable format
 * @params {string} dateStr ISO date string
 * @return {string} formatted local date string
 */
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

/**
 * Formats a date string into a short readable format for bank statement
 * @params {string} dateStr ISO date string
 * @return {string} formatted short date string
 */
const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  if (isToday) {
    return date.toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Checks if a movement type is considered a positive flow (debit)
 * @params {string} type movement type slug
 * @return {boolean} true if positive flow
 */
const isPositive = (type) => {
  return ['debit', 'init_cashbox', 'transfer_in', 'global_withdrawal'].includes(type)
}

/**
 * Translates movement type slug into human readable text
 * @params {string} type movement type slug
 * @return {string} human readable label
 */
const getTypeName = (type) => {
  const found = movementTypeOptions.find(o => o.value === type)
  return found ? found.label : type
}

/**
 * Opens the movements history sidebar for a specific cashbox
 * @params {object} cashbox box from which to show history
 * @return {void} none
 */
const openMovementsDialog = (cashbox) => {
  selectedCashbox.value = cashbox
  movements.value = []
  currentPage.value = 1
  filterMovementType.value = null
  movementsDialog.value = true
  loadMovements()
}

/**
 * Fetches movements history for the currently selected box
 * @params {void} none
 * @return {Promise<void>} resolve promise
 */
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

/**
 * Loads the next page of movements for the current history view
 * @params {void} none
 * @return {Promise<void>} resolve promise
 */
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

/**
 * Lifecycle hook - Initializes data on component mount
 * @return {Promise<void>} resolve promise
 */
onMounted(async () => {
  await Promise.all([
    loadCashboxes()
  ])
})
</script>

<style scoped lang="scss">
.finance-cashbox-page {
  max-width: 1200px;
  margin: 0 auto;
}

.action-btn-compact {
  height: 44px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.bg-primary-light {
  background-color: rgba($primary, 0.08);
}

.border-top-dashed {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.body--dark .border-top-dashed {
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.cashbox-card-compact {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
  background: white;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, $primary, lighten($primary, 20%));
    opacity: 0.8;
  }
}

.body--dark .cashbox-card-compact {
  background: #1e1e2d;
  border-color: rgba(255, 255, 255, 0.05);
}

.cashbox-icon-mini {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-button {
  animation: pulse-primary 2.5s infinite;
}

@keyframes pulse-primary {
  0% { box-shadow: 0 0 0 0 rgba($primary, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba($primary, 0); }
  100% { box-shadow: 0 0 0 0 rgba($primary, 0); }
}

.header-blur {
  backdrop-filter: blur(8px);
  background: rgba($primary, 0.9) !important;
}

.movements-list {
  background: transparent;
}

.movement-item {
  transition: background 0.2s;
  border-radius: 8px;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}

.line-height-1 {
  line-height: 1;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.sticky-top {
  position: sticky;
  top: 0;
}

// Dialog styles
.transfer-dialog-card {
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  background: linear-gradient(135deg, $primary, darken($primary, 10%));
  color: white;
  padding-top: 20px;
  padding-bottom: 20px;
}

.upload-zone-multiple {
  border: 2px dashed rgba($primary, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba($primary, 0.02);

  &:hover, &.dragging {
    background: rgba($primary, 0.05);
    border-color: $primary;
  }
}

.preview-img-compact {
  height: 80px;
  border-radius: 8px;
}

.rounded-sm {
  border-radius: 4px;
}

.body--dark .movement-item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

@media (max-width: 600px) {
  .header-section {
    text-align: center;
    .row {
      justify-content: center;
    }
    p {
      margin-left: auto;
      margin-right: auto;
    }
  }

  .action-btn-compact {
    font-size: 13px;
    padding: 0 8px;

    :deep(.q-icon) {
      font-size: 18px;
    }
  }

  .cashbox-card-compact {
    .text-h6 {
      font-size: 1.1rem;
    }
  }

  .transfer-dialog-card {
    border-radius: 0;
  }
}

// ===========================================
// Bank Statement Style - Movements Dialog
// ===========================================

.movements-dialog-card {
  background: #fafbfc;
}

.body--dark .movements-dialog-card {
  background: #1a1a2e;
}

.balance-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.balance-card-compact {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.text-white-7 {
  color: rgba(255, 255, 255, 0.7) !important;
}

.filter-select-dark {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.1);
  }
  :deep(.q-field__label) {
    color: rgba(255, 255, 255, 0.7);
  }
}

.movements-scroll-area {
  background: transparent;
}

.movements-container {
  padding: 8px 0;
}

.movement-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;
  gap: 12px;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }
}

.body--dark .movement-row {
  border-bottom-color: rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
}

.movement-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.movement-icon-wrapper {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.movement-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.movement-description {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  line-height: 1.3;
  word-break: break-word;
}

.body--dark .movement-description {
  color: #e0e0e0;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movement-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #888;
  margin-top: 2px;
  flex-wrap: wrap;
}

.meta-separator {
  color: #ccc;
}

.movement-images {
  display: flex;
  align-items: center;
  gap: 4px;
}

.images-count {
  font-size: 10px;
  color: #888;
  margin-left: 2px;
}

.movement-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  min-width: 80px;
}

.movement-amount {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.movement-balance {
  font-size: 10px;
  color: #888;
  margin-top: 2px;
  white-space: nowrap;
}

.body--dark .movement-balance {
  color: #aaa;
}

.skeleton-row {
  padding: 16px;
}

.footer-actions {
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.body--dark .footer-actions {
  background: #1e1e2d;
  border-top-color: rgba(255, 255, 255, 0.08);
}

.action-btn-footer {
  font-weight: 600;
  font-size: 13px;
  height: 40px;
  border-radius: 10px;
}

// Mobile specific adjustments
@media (max-width: 420px) {
  .movement-row {
    padding: 10px 12px;
  }

  .movement-icon-wrapper {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }

  .movement-description {
    font-size: 12px;
  }

  .movement-amount {
    font-size: 13px;
  }

  .movement-balance {
    font-size: 9px;
  }

  .movement-right {
    min-width: 70px;
  }

  .balance-card {
    padding: 12px !important;
  }

  .balance-card .text-h5 {
    font-size: 1.25rem !important;
  }
}
</style>
