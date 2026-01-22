<script setup>
import { defineProps, ref, watch } from 'vue'
import { formatNumber } from 'src/const/mixins'

/**
 * Props
 * @type {Object}
 */
const props = defineProps({
  movements: Array,
  total: {
    type: Number,
    default: 10
  }
})

/**
 * Emits
 * @type {Array}
 */
const emit = defineEmits(['update:current'])

/**
 * Current page
 * @type {Object}
 */
const current = ref(1)

/**
 * Watch current page
 * @param {Object} data current page
 */
watch(current, (data) => {
  emit('update:current', data)
})

/**
 * Get color based on movement type
 * @param {String} type
 */
const getTypeColor = (type) => {
  if (type.includes('Compra') || type.includes('Entrada')) return 'positive'
  if (type.includes('Venta') || type.includes('Salida')) return 'negative'
  if (type.includes('Ajuste') || type.includes('Conteo')) return 'primary'
  return 'grey'
}

/**
 * Format date to a more compact version
 * @param {String} dateStr
 */
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

</script>

<template>
  <div class="q-gutter-y-sm">
    <q-card v-for="(row, index) in movements" :key="index" class="movement-card overflow-hidden">
      <!-- Movement Indicator Strip -->
      <div :class="`indicator-strip bg-${getTypeColor(row.movementType)}`" />

      <q-card-section class="q-pa-sm">
        <!-- Top Row: Type and Date -->
        <div class="row justify-between items-center q-mb-xs">
          <div class="col-auto">
            <q-badge :color="getTypeColor(row.movementType)" class="type-badge text-weight-bold">
              {{ row.movementType }}
            </q-badge>
          </div>
          <div class="col-auto text-caption">
            {{ formatDate(row.date) }}
          </div>
        </div>

        <!-- Middle Row: Document and Description -->
        <div class="row items-center q-gutter-x-sm q-mb-xs">
          <q-badge outline color="grey-8" class="doc-badge">{{ row.document }}</q-badge>
          <div class="col text-caption text-italic ellipsis">
            {{ row.details }}
          </div>
        </div>

        <!-- Stock Impact Section -->
        <div class="row q-col-gutter-xs items-center q-pt-xs border-top">
          <div class="col-6 row items-center">
            <q-icon :name="row.inputQty > 0 ? 'south_east' : 'north_west'"
                    :color="row.inputQty > 0 ? 'positive' : 'negative'"
                    size="14px" class="q-mr-xs" />
            <span class="text-weight-bold" :class="row.inputQty > 0 ? 'text-positive' : 'text-negative'">
              {{ row.inputQty > 0 ? '+' : '-' }}{{ row.inputQty > 0 ? row.inputQty : row.outputQty }}
            </span>
            <span class="text-caption q-ml-xs">und</span>
          </div>

          <div class="col-6 text-right">
            <span class="text-caption">Total:</span>
            <span class="text-weight-bolder q-ml-xs">
              ${{ formatNumber(row.totalValue) }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Pagination -->
    <div class="q-py-md flex flex-center">
      <q-pagination
        v-model="current"
        :max="props.total"
        :max-pages="4"
        direction-links
        flat
        color="primary"
        active-color="primary"
        size="md"
      />
    </div>
  </div>
</template>

<style scoped>
.movement-card {
  border-radius: 8px;
  position: relative;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.movement-card:active {
  transform: scale(0.98);
  background-color: #f9f9f9;
}

.indicator-strip {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

.type-badge {
  padding: 2px 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.doc-badge {
  font-size: 10px;
  padding: 1px 4px;
}

.border-top {
  border-top: 1px dashed #eee;
}

.text-weight-bolder {
  font-weight: 800;
}
</style>
