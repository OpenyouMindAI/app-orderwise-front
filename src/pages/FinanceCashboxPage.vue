<template>
  <q-page class="finance-cashbox-page q-pa-md">
    <!-- Header Section -->
    <div class="header-section q-mb-md">
      <div class="row items-center justify-between">
        <div class="col-12 col-md-auto q-mb-sm q-mb-md-none">
          <span class="text-h5 text-weight-bold q-ma-none text-gradient">Gestión de Cajas</span>
          <p class="text-caption text-grey-7 q-mt-xs">Control de saldos y transferencias entre cajas</p>
        </div>
        <div class="col-12 col-md-auto">
          <q-btn
            unelevated
            rounded
            color="primary"
            icon="add_circle"
            label="Nueva Transferencia"
            class="pulse-button q-px-md"
            dense
            @click="openTransferDialog()"
          />
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
        <q-card flat class="cashbox-card-compact" :class="{ 'is-main': cashbox.is_main }">
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
                  @click="openTransferDialog(cashbox)"
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

              <!-- Image Upload -->
              <div class="form-group">
                <label class="form-label">Adjuntar / Tomar Foto</label>
                <div
                  class="upload-zone"
                  @click="triggerFileInput"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                  :class="{ 'dragging': isDragging, 'has-preview': photoPreview }"
                >
                  <div v-if="!photoPreview" class="upload-content text-center">
                    <q-icon name="cloud_upload" size="48px" color="primary" class="q-mb-sm" />
                    <p class="text-weight-medium q-mb-none">Haz clic o arrastra una imagen</p>
                    <p class="text-caption text-grey-5">Soporta JPG, PNG (Máx 10MB)</p>
                  </div>
                  <div v-else class="preview-content">
                    <q-img :src="photoPreview" class="preview-image" @click.stop="openGallery">
                      <div class="absolute-bottom text-center text-caption q-pa-xs">
                        Toca para ampliar
                      </div>
                    </q-img>
                    <q-btn
                      icon="close"
                      round
                      dense
                      color="negative"
                      class="remove-photo-btn"
                      @click.stop="clearPhoto"
                    />
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    style="display: none"
                    accept="image/*"
                    @change="onFileSelected"
                  />
                </div>
              </div>

              <div class="q-pt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Confirmar Transferencia"
                  class="full-width text-weight-bold"
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
      :initial-index="0"
    />
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
const filterBranchOffice = ref(null)
const filterIsMain = ref('true') // Default view main cashboxes

const transferForm = reactive({
  source_cashbox_id: null,
  destination_cashbox_id: null,
  amount: null,
  description: '',
  photo: null
})

const isDragging = ref(false)
const photoPreview = ref(null)
const fileInput = ref(null)

// Gallery
const galleryOpen = ref(false)
const galleryImages = computed(() => {
  return photoPreview.value ? [{ url: photoPreview.value }] : []
})

/**
 * Options for selects
 */
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
    photo: null
  })
  photoPreview.value = null
  transferDialog.value = true
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) processFile(file)
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) processFile(file)
}

const processFile = (file) => {
  if (!file.type.startsWith('image/')) {
    $q.notify({ type: 'negative', message: 'Por favor selecciona una imagen' })
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    $q.notify({ type: 'negative', message: 'La imagen excede los 10MB' })
    return
  }

  transferForm.photo = file
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const clearPhoto = () => {
  transferForm.photo = null
  photoPreview.value = null
}

const openGallery = () => {
  if (photoPreview.value) {
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
    if (transferForm.photo) {
      formData.append('photo', transferForm.photo)
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

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(val || 0)
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

// Upload Area
.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover, &.dragging {
    border-color: var(--q-primary);
    background-color: rgba(var(--q-primary-rgb), 0.02);
  }

  &.has-preview {
    padding: 0;
    border-style: solid;
    height: 250px;
  }
}

.preview-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.remove-photo-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.rounded-pill {
  border-radius: 50px;
}

.opacity-20 {
  opacity: 0.2;
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
