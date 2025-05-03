<script setup>
import { formatNumber } from 'src/const/mixins'
import { ref, defineProps, defineEmits, watch } from 'vue'

/**
 * Props
 * @type {Object}
 */
const props = defineProps({
  product: Object,
  movementTypes: Array
})
/**
 * Emits
 * @type {Array}
 */
const emit = defineEmits([
  'goBack',
  'exportExcel',
  'update:movementType',
  'update:dateRange'
])
/**
 * Movement type
 * @type {Object}
 */
const movementType = ref(null)
/**
 * Date range
 * @type {Object}
 */
const dateRange = ref(null)

const clearFilters = () => {
  movementType.value = null
  dateRange.value = null
}

/**
 * Watch movement type
 * @param {Object} data movement type
 */
watch(movementType, (data) => {
  emit('update:movementType', data)
})

/**
 * Watch date range
 * @param {Object} data date range
 */
watch(dateRange, (data) => {
  let range = {}
  if (typeof data === 'string') {
    range.from = data
    range.to = data
  } else {
    range = data
  }
  emit('update:dateRange', range)
})

</script>

<template>
  <q-card class="q-pa-md shadow-2 rounded-borders">
    <div class="row items-center justify-between q-mb-md q-gutter-sm">
      <div class="flex justify-between items-center q-gutter-x-sm">
        <q-btn flat icon="arrow_back" @click="emit('goBack')" class="q-mb-sm" round color="primary"/>
        <div class="col-12 col-md">
          <div class="text-h6 text-primary">
            {{ props.product.name }}
          </div>
          <div class="text-caption text-grey">
            {{ props.product.barcode }} | {{ props.product?.category?.name }}
          </div>
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          icon="file_download"
          label="Exportar Excel"
          color="primary"
          flat
          @click="emit('exportExcel')"
          class="q-mb-sm"
          disable
        >
          <q-tooltip anchor="bottom middle" class="bg-primary text-white text-body2">
            Funcionalidad no disponible,
            estará disponible pronto
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-card bordered flat>
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <div class="text-caption text-grey">
            Stock actual
          </div>
          <div class="text-h6 text-primary">
            {{ props.product.normal_stock || props.product.bundle_stock }} {{ props.product?.unit_of_measure?.acronym }}
          </div>
        </div>
        <div class="col-12 col-sm-6">
          <div class="text-caption text-grey">
            Valor total
          </div>
          <div class="text-h6 text-bold">
            ${{ formatNumber(Number(props.product.normal_stock || props.product.bundle_stock) * props.product?.cost) }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md q-mb-md q-mt-sm">
      <div class="col-12 col-md-5">
        <q-select
          v-model="movementType"
          :options="movementTypes"
          label="Tipo de movimiento"
          clearable
          outlined
          dense
          option-disable="inactive"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-5">
        <q-input
          :model-value="dateRange ? `Desde: ${dateRange?.from || dateRange} Hasta: ${dateRange?.to || dateRange}` : 'Seleccionar rango'"
          outlined
          clearable
          readonly
          dense
        >
          <template #append>
            <q-icon name="event">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="dateRange" range mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-2 text-right" v-if="movementType || dateRange">
        <q-btn
          icon="filter_alt_off"
          color="primary"
          round
          flat
          @click="clearFilters"
        />
      </div>
    </div>
    <slot />
  </q-card>
</template>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
