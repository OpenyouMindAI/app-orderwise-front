<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  product: Object,
  movementTypes: Array
})

const filters = ref({
  movementType: null,
  dateRange: { from: '2023-01-01', to: '2023-12-31' }
})

const emit = defineEmits(['goBack', 'exportExcel'])

console.log(props.product)

</script>

<template>
  <q-card class="q-pa-md shadow-2 rounded-borders">
    <div class="row items-center justify-between q-mb-md q-gutter-sm">
      <div class="flex justify-between items-center q-gutter-x-sm">
        <q-btn flat icon="arrow_back" @click="emit('goBack')" class="q-mb-sm" round/>
        <div class="col-12 col-md">
          <div class="text-h6 text-primary">{{ props.product.name }}</div>
          <div class="text-caption text-grey">{{ props.product.code }} | {{ props.product.category }}</div>
        </div>
      </div>
      <div class="col-auto">
        <q-btn icon="file_download" label="Exportar Excel" color="primary" flat @click="emit('exportExcel')" class="q-mb-sm" />
      </div>
    </div>

    <q-card flat bordered class="bg-grey-1 q-pa-md q-mb-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <div class="text-caption text-grey">Stock actual</div>
          <div class="text-h6 text-primary">{{ props.product.currentStock }} {{ props.product.unit }}</div>
        </div>
        <div class="col-12 col-sm-6">
          <div class="text-caption text-grey">Valor total</div>
          <div class="text-h6 text-bold">${{ props.product?.totalValue?.toLocaleString('es-AR') }}</div>
        </div>
      </div>
    </q-card>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-select v-model="filters.movementType" :options="movementTypes" label="Tipo de movimiento" clearable outlined dense />
      </div>
      <div class="col-12 col-md-6">
        <q-input v-model="filters.dateRange" label="Rango de fechas" outlined dense>
          <template #append>
            <q-icon name="event">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="filters.dateRange" range mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <slot /> <!-- Movements Table or Cards -->
  </q-card>
</template>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
