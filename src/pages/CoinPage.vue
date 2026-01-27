<template>
  <q-page :class="['coin-page-container', $q.dark.isActive ? 'bg-dark' : 'bg-grey-1']">
    <q-pull-to-refresh @refresh="refreshData">
      <!-- Premium Futuristic Header -->
      <header class="futuristic-header q-px-md q-py-md sticky-header">
        <div class="row items-center justify-between no-wrap">
          <div class="column">
            <span class="text-h5 text-weight-bolder letter-spacing-tight" :class="$q.dark.isActive ? 'text-white' : 'text-grey-10'">
              Monedas
            </span>
            <div class="row items-center q-mt-xs">
              <div class="status-dot q-mr-sm" />
              <span class="text-caption font-medium" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
                {{ paginationConfig.rowsNumber }} divisas activas
              </span>
            </div>
          </div>
          <div class="row q-gutter-x-sm">
            <div class="header-action-glass">
              <q-btn
                flat
                round
                dense
                :color="$q.dark.isActive ? 'white' : 'primary'"
                :icon="showSearch ? 'close' : 'search'"
                @click="showSearch = !showSearch"
              />
            </div>
            <q-btn
              v-if="!$q.screen.xs"
              unelevated
              rounded
              icon="add"
              color="primary"
              label="Nueva"
              class="add-btn-futuristic"
              @click="openAddCoin = true"
            />
          </div>
        </div>

        <!-- Minimalist Search -->
        <q-slide-transition>
          <div v-if="showSearch" class="q-pt-md">
            <q-input
              v-model="filter"
              placeholder="Escribe para buscar..."
              outlined
              dense
              rounded
              :bg-color="$q.dark.isActive ? 'grey-10' : 'white'"
              class="ultra-dense-search"
              debounce="500"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="xs" color="primary" />
              </template>
            </q-input>
          </div>
        </q-slide-transition>
      </header>

      <div class="q-px-md q-pb-xl">
        <!-- Desktop Bento View -->
        <div v-if="$q.screen.gt.xs" class="q-pt-md">
          <q-table
            :columns="columns"
            :rows="coins"
            :loading="visible"
            row-key="id"
            flat
            binary-state-sort
            v-model:pagination="paginationConfig"
            @request="setPagination"
            class="futuristic-table"
            :card-class="$q.dark.isActive ? 'bg-grey-10 shadow-dark' : 'bg-white shadow-light'"
          >
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div class="row items-center no-wrap">
                  <div class="mini-bento-icon q-mr-md" :class="$q.dark.isActive ? 'bg-primary-dark text-white' : 'bg-primary-light text-primary'">
                    {{ props.row.symbol }}
                  </div>
                  <span class="text-weight-bold text-body2">{{ props.row.name }}</span>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="text-right">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  color="grey-6"
                  icon="more_vert"
                  @click.stop="viewEditCoin(props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </div>

        <!-- Mobile Futuristic Cards -->
        <div v-else class="column q-gutter-y-sm q-pt-sm">
          <div v-if="visible && coins.length === 0" class="row justify-center q-pa-xl">
            <q-spinner-dots color="primary" size="2em" />
          </div>

          <div v-else-if="coins.length === 0" class="column items-center q-pa-xl text-center">
            <q-icon name="cloud_off" size="80px" class="opacity-10 text-primary" />
            <div class="text-subtitle2 text-grey-6 q-mt-md font-medium">No se encontraron monedas</div>
          </div>

          <q-card
            v-for="c in coins"
            :key="c.id"
            v-ripple
            class="bento-mobile-card clickable transition-200"
            :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white text-grey-10'"
            @click="viewEditCoin(c)"
          >
            <q-card-section horizontal class="items-center q-pa-sm">
              <div class="avatar-glass q-mr-sm" :class="$q.dark.isActive ? 'bg-primary-dark-10 text-primary' : 'bg-grey-2 text-primary'">
                {{ c.symbol }}
              </div>

              <q-card-section class="q-pa-none flex-grow">
                <div class="text-weight-bold text-body2 letter-spacing-tight">{{ c.name }}</div>
                <div class="text-caption font-medium opacity-60">ID: {{ c.id }} • {{ c.symbol }}</div>
              </q-card-section>

              <q-icon name="keyboard_arrow_right" size="18px" color="grey-6" class="q-mr-xs" />
            </q-card-section>
          </q-card>

          <!-- Minimalist Pagination -->
          <div class="row justify-center q-mt-lg" v-if="paginationConfig.rowsNumber > paginationConfig.rowsPerPage">
            <q-pagination
              v-model="paginationConfig.page"
              :max="Math.ceil(paginationConfig.rowsNumber / paginationConfig.rowsPerPage)"
              direction-links
              flat
              dense
              color="primary"
              active-color="primary"
              @update:model-value="handleMobilePageChange"
            />
          </div>
        </div>
      </div>
    </q-pull-to-refresh>

    <!-- FAB for mobile -->
    <q-page-sticky position="bottom-right" :offset="[20, 20]" v-if="$q.screen.xs">
      <q-btn fab icon="add" color="primary" @click="openAddCoin = true" class="shadow-12 fab-futuristic" />
    </q-page-sticky>

    <!-- Unified BON-Style Dialog: Add -->
    <q-dialog v-model="openAddCoin" :position="$q.screen.xs ? 'bottom' : 'standard'" backdrop-filter="blur(10px)">
      <q-card :class="['bon-dialog-card', $q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white']">
        <q-card-section class="bon-header row items-center no-wrap">
          <div class="text-h6 text-weight-bolder">Nueva Moneda</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup size="sm" />
        </q-card-section>

        <q-form @submit="saveCoin" class="q-pa-md">
          <div class="column q-gutter-y-md">
            <q-input
              v-model="coin.name"
              label="Nombre"
              placeholder="Ej. Peso Argentino"
              outlined
              stack-label
              :dark="$q.dark.isActive"
              :rules="[val => !!val || 'El nombre es obligatorio']"
              class="bon-input"
            />
            <q-input
              v-model="coin.symbol"
              label="Símbolo"
              placeholder="Ej. $, S/"
              outlined
              stack-label
              :dark="$q.dark.isActive"
              :rules="[val => !!val || 'El símbolo es obligatorio']"
              class="bon-input"
            />
          </div>
          <div class="row justify-end q-mt-xl">
            <q-btn unelevated label="Registrar Moneda" color="primary" type="submit" :loading="visible" class="full-width-xs bon-action-btn" />
          </div>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Unified BON-Style Dialog: Edit -->
    <q-dialog v-model="openEditCoin" :position="$q.screen.xs ? 'bottom' : 'standard'" backdrop-filter="blur(10px)">
      <q-card :class="['bon-dialog-card', $q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white']">
        <q-card-section class="bon-header row items-center no-wrap edit-header">
          <div class="text-h6 text-weight-bolder">Modificar Moneda</div>
          <q-space />
          <q-btn icon="delete_outline" flat round dense color="white" size="sm" @click="deleteCoin" />
          <q-btn icon="close" flat round dense v-close-popup size="sm" class="q-ml-sm" />
        </q-card-section>

        <q-form @submit="saveEdit" class="q-pa-md">
          <div class="column q-gutter-y-md">
            <q-input v-model="coin.name" label="Nombre" outlined stack-label :dark="$q.dark.isActive" :rules="[val => !!val || 'El nombre es obligatorio']" class="bon-input" />
            <q-input v-model="coin.symbol" label="Símbolo" outlined stack-label :dark="$q.dark.isActive" :rules="[val => !!val || 'El símbolo es obligatorio']" class="bon-input" />
          </div>
          <div class="row justify-end q-mt-xl">
            <q-btn unelevated label="Actualizar Cambios" color="primary" type="submit" :loading="visible" class="full-width-xs bon-action-btn" />
          </div>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Notify, useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

/**
 * Quasar instance
 * @type {Object}
 */
const $q = useQuasar()

/**
 * Data references
 */
const coins = ref([])
const coin = ref({})
const filter = ref('')
const visible = ref(false)
const showSearch = ref(false)
const openAddCoin = ref(false)
const openEditCoin = ref(false)

const params = reactive({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 20,
  page: 1,
  dataSearch: { id: '', name: '' }
})

const columns = [
  { name: 'name', align: 'left', label: 'MONEDA', field: 'name', sortable: true },
  { name: 'symbol', align: 'left', label: 'SYMBOL', field: 'symbol', sortable: true },
  { name: 'actions', align: 'right', label: '', field: 'actions' }
]

const paginationConfig = ref({
  rowsPerPage: 20,
  rowsNumber: 0,
  page: 1,
  sortBy: 'id',
  descending: true
})

/**
 * Actions
 */
const closeModal = () => {
  openAddCoin.value = false
  openEditCoin.value = false
  coin.value = {}
}

const refreshData = (done) => {
  getCoins(params)
  if (done) setTimeout(() => done(), 800)
}

const getCoins = (searchParams = params) => {
  visible.value = true
  api.get('coins', { params: searchParams })
    .then(({ data }) => {
      coins.value = data.data
      paginationConfig.value.rowsNumber = data.total
    })
    .catch(err => {
      Notify.create({ message: err.message, color: 'negative', position: 'top' })
    })
    .finally(() => { visible.value = false })
}

const setPagination = (data) => {
  const { page, rowsPerPage, sortBy, descending } = data.pagination
  params.sortOrder = descending ? 'desc' : 'asc'
  params.page = page
  params.sortBy = sortBy ?? params.sortBy
  params.perPage = rowsPerPage
  paginationConfig.value = data.pagination
  getCoins(params)
}

const handleMobilePageChange = (page) => {
  params.page = page
  getCoins(params)
}

const searchData = (searchString) => {
  for (const key in params.dataSearch) {
    params.dataSearch[key] = searchString
  }
  params.page = 1
  getCoins(params)
}

const viewEditCoin = (row) => {
  coin.value = { ...row }
  openEditCoin.value = true
}

const saveCoin = () => {
  visible.value = true
  api.post('coins', coin.value)
    .then(() => {
      getCoins()
      closeModal()
      Notify.create({ message: 'Moneda creada', color: 'positive', position: 'top' })
    })
    .catch(err => {
      Notify.create({ message: err.message, color: 'negative', position: 'top' })
    })
    .finally(() => { visible.value = false })
}

const saveEdit = () => {
  visible.value = true
  api.put(`coins/${coin.value.id}`, coin.value)
    .then(() => {
      getCoins()
      closeModal()
      Notify.create({ message: 'Actualizado', color: 'positive', position: 'top' })
    })
    .catch(err => {
      Notify.create({ message: err.message, color: 'negative', position: 'top' })
    })
    .finally(() => { visible.value = false })
}

const deleteCoin = () => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${coin.value.name}"?`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', flat: true, label: 'Eliminar' }
  }).onOk(() => {
    visible.value = true
    api.delete(`coins/${coin.value.id}`)
      .then(() => {
        getCoins()
        closeModal()
        Notify.create({ message: 'Registro eliminado', color: 'positive', position: 'top' })
      })
      .finally(() => { visible.value = false })
  })
}

watch(filter, (newVal) => searchData(newVal))
onMounted(() => getCoins())
</script>

<style scoped>
.coin-page-container {
  min-height: 100vh;
}

/* Futuristic Header */
.futuristic-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(128, 128, 128, 0.08);
}
.body--light .futuristic-header { background: rgba(255, 255, 255, 0.82); }
.body--dark .futuristic-header { background: rgba(18, 18, 18, 0.85); }

.letter-spacing-tight { letter-spacing: -1.2px; }

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.header-action-glass {
  background: rgba(128, 128, 128, 0.08);
  border-radius: 12px;
  padding: 2px;
}

.add-btn-futuristic {
  font-weight: 700;
  padding: 8px 20px;
  text-transform: none;
  font-size: 13px;
}

/* Bento Bento UI */
.futuristic-table {
  border-radius: 20px;
  background: transparent !important;
}

.shadow-light { box-shadow: 0 10px 40px rgba(0,0,0,0.03); }
.shadow-dark { box-shadow: 0 10px 40px rgba(0,0,0,0.3); }

.mini-bento-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 900;
}
.bg-primary-light { background: #eef2ff; }
.bg-primary-dark { background: #1e293b; }

.bento-mobile-card {
  border-radius: 18px;
  border: 1px solid rgba(128, 128, 128, 0.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.body--dark .bento-mobile-card { border-color: rgba(255, 255, 255, 0.03); }

.avatar-glass {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
.bg-primary-dark-10 { background: rgba(25, 118, 210, 0.15); }

/* BON Style Dialogs */
.bon-dialog-card {
  border-radius: 24px;
  width: 480px;
  max-width: 92vw;
  overflow: hidden;
}

.bon-header {
  background: #1976d2;
  color: white;
  padding: 16px 20px;
  font-weight: 800;
}

.edit-header {
  background: #1e293b; /* Darker futuristic tone */
}
.body--dark .edit-header { background: #111827; }

.bon-input :deep(.q-field__control) {
  border-radius: 12px;
  background: rgba(128, 128, 128, 0.03);
}

.bon-action-btn {
  border-radius: 14px;
  font-weight: 800;
  padding: 12px 24px;
  text-transform: none;
}

.ultra-dense-search :deep(.q-field__control) {
  border-radius: 14px;
}

@media (max-width: 599px) {
  .full-width-xs { width: 100%; }
  .bon-dialog-card { border-radius: 24px 24px 0 0; }
}

.transition-200 { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.opacity-10 { opacity: 0.1; }
.flex-grow { flex-grow: 1; }
</style>

