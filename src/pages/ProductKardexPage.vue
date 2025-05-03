<script setup>
import { ref, watch } from 'vue'
import ProductList from 'src/components/ProductKardex/ProductList.vue'
import ProductDetail from 'src/components/ProductKardex/ProductDetail.vue'
import ProductMovementsTable from 'src/components/ProductKardex/ProductMovementsTable.vue'
import MobileMovementCards from 'src/components/ProductKardex/MobileMovementCards.vue'
import { loading, notify } from 'src/const/mixins'
import { api } from 'src/boot/axios'

/**
 * Selected product
 * @type {Object}
 */
const selectedProduct = ref(null)

/**
 * Watch selected product
 * @param {Object} data product
 */
watch(selectedProduct, (data) => {
  if (data) {
    getMovements(data, params.value)
  } else {
    movements.value = []
  }
})

/**
 * Filters
 * @type {Object}
 */
const filters = ref({
  movementType: null,
  dateRange: { from: '2023-01-01', to: '2023-12-31' }
})

/**
 * Movement types
 * @type {Array}
 */
const movementTypes = [
  { label: 'Compra', value: 'Compra' },
  { label: 'Venta', value: 'Venta' },
  { label: 'Ajuste Positivo', value: 'Ajuste Positivo' },
  { label: 'Ajuste Negativo', value: 'Ajuste Negativo' },
  { label: 'Transferencia Entrada', value: 'Transferencia Entrada', inactive: true, description: 'Próximamente' },
  { label: 'Transferencia Salida', value: 'Transferencia Salida', inactive: true, description: 'Próximamente' }
]

/**
 * Pagination config
 * @type {Object}
 */
const paginationConfig = ref({
  rowsPerPage: 10,
  rowsNumber: 10,
  paginate: true,
  sortBy: 'date',
  sortOrder: 'desc'
})

/**
 * Movements
 * @type {Array}
 */
const movements = ref([])

/**
 * Params
 * @type {Object}
 */
const params = ref({})

/**
 * Get movement color
 * @param {String} type movement type
 * @returns {String}
 */
function getMovementColor (type) {
  const colors = {
    Compra: 'green',
    Venta: 'red',
    'Ajuste Positivo': 'teal',
    'Ajuste Negativo': 'orange',
    'Transferencia Entrada': 'blue',
    'Transferencia Salida': 'purple'
  }
  return colors[type] || 'grey'
}

/**
 * Export to excel
 */
function exportToExcel () {
  console.log('Exportar a Excel...')
}

/**
 * Set pagination
 * @param {Object} data pagination
 */
function setPagination (data) {
  paginationConfig.value = data.pagination
  params.value = {
    ...params.value,
    ...data.pagination,
    sortOrder: data.pagination?.descending ? 'desc' : 'asc'
  }
  getMovements(selectedProduct.value, params.value)
}

function currentPaginate (data) {
  params.value.page = data
  getMovements(selectedProduct.value, params.value)
}

/**
 * Filter data
 * @param {String} field field
 * @param {Object} data data
 */
function filterData (field, data) {
  if (field === 'movementType') {
    params.value = {
      ...params.value,
      movementType: data?.value
    }
  } else {
    params.value = {
      ...params.value,
      from: data?.from,
      to: data?.to
    }
  }
  getMovements(selectedProduct.value, params.value)
}

/**
 * Get movements
 * @param {Object} product product
 * @param {Object} params params
 */
const getMovements = async (product, params) => {
  try {
    loading(true)
    const { data } = await api.get(`kardex/${product?.id}/movements`, { params })
    movements.value = data.data
    paginationConfig.value.rowsNumber = data.total
    paginationConfig.value.lastPage = data.last_page
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading(false)
  }
}

</script>

<template>
  <div class="q-pa-md q-col-gutter-x-md row no-wrap">
    <div class="col-12 col-md-4" v-show="$q.screen.gt.sm || !selectedProduct">
      <ProductList @select="selectedProduct = $event" />
    </div>

    <div class="col-12 col-md-8" v-if="selectedProduct">
      <ProductDetail
        :product="selectedProduct"
        :filters="filters"
        :movementTypes="movementTypes"
        @goBack="selectedProduct = null"
        @exportExcel="exportToExcel"
        @update:movementType="($event) => filterData('movementType', $event)"
        @update:dateRange="($event) => filterData('dateRange', $event)"
      >
        <MobileMovementCards
          v-if="$q.screen.lt.md"
          :movements="movements"
          :total="paginationConfig.lastPage"
          @update:current="currentPaginate"
        />
        <ProductMovementsTable
          v-else
          :paginationConfig="paginationConfig"
          :movements="movements"
          :getColor="getMovementColor"
          @update:setPagination="setPagination"
        />
      </ProductDetail>
    </div>
    <div v-else class="col-12 col-md-8">
      <div class="column items-center justify-center bg-grey-2 q-pa-xl rounded-borders full-height">
        <q-icon name="dashboard_customize" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h6 text-primary">Selecciona un producto para ver su Kardex</div>
        <div class="text-caption text-grey">Podrás visualizar aquí el detalle de movimientos, entradas y salidas</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 600px) {
  .text-h6 {
    font-size: 1.2rem;
  }
  .text-caption {
    font-size: 0.85rem;
  }
}
</style>
