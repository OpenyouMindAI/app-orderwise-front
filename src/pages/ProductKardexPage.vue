<script setup>
import { ref } from 'vue'
import ProductList from 'src/components/ProductKardex/ProductList.vue'
import ProductDetail from 'src/components/ProductKardex/ProductDetail.vue'
import ProductMovementsTable from 'src/components/ProductKardex/ProductMovementsTable.vue'
import MobileMovementCards from 'src/components/ProductKardex/MobileMovementCards.vue'

const selectedProduct = ref(null)

const filters = ref({
  movementType: null,
  dateRange: { from: '2023-01-01', to: '2023-12-31' }
})

const movementTypes = [
  { label: 'Compra', value: 'Compra' },
  { label: 'Venta', value: 'Venta' },
  { label: 'Ajuste Positivo', value: 'Ajuste Positivo' },
  { label: 'Ajuste Negativo', value: 'Ajuste Negativo' },
  { label: 'Transferencia Entrada', value: 'Transferencia Entrada' },
  { label: 'Transferencia Salida', value: 'Transferencia Salida' }
]

const movements = ref([])

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

function exportToExcel () {
  console.log('Exportar a Excel...')
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
      >
        <MobileMovementCards v-if="$q.screen.lt.md" :movements="movements" />
        <ProductMovementsTable v-else :movements="movements" :getColor="getMovementColor" />
      </ProductDetail>
    </div>
    <div v-else class="col-12 col-md-8">
      <div class="column items-center bg-grey-2 q-pa-xl rounded-borders full-height">
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

.full-height {
  height: 100%;
  min-height: 300px;
}
</style>
