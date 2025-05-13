<template>
  <q-card class="store-hours-manager q-mb-lg">
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="col-12 col-sm-6">
          <div class="text-h6 text-weight-bold">
            <q-icon name="schedule" color="primary" size="sm" class="q-mr-xs" />
            Horarios de Apertura
          </div>
          <div class="text-caption text-grey">
            Configure los horarios de apertura y cierre para cada día de la semana
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-md-6 q-pr-md-md">
          <q-card class="bulk-actions" >
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Aplicar horario a múltiples días</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="bulkFrom"
                    :options="timeOptions"
                    label="Hora de apertura"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="q-mb-sm"
                  />
                  <q-select
                    v-model="bulkTo"
                    :options="timeOptions"
                    label="Hora de cierre"
                    outlined
                    dense
                    emit-value
                    map-options
                    :error="bulkError"
                    :error-message="bulkErrorMessage"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-caption q-mb-xs">Seleccionar días:</div>
                  <div class="row q-gutter-xs">
                    <q-checkbox
                      v-for="day in daysOfWeek"
                      :key="day.value"
                      v-model="bulkSelectedDays"
                      :val="day.value"
                      :label="day.shortLabel"
                      dense
                    />
                  </div>
                  <div class="q-mt-sm">
                    <q-btn
                      color="secondary"
                      label="Aplicar"
                      size="sm"
                      :disable="!canApplyBulk"
                      @click="applyBulkHours"
                    />
                    <q-btn
                      flat
                      color="grey"
                      label="Limpiar"
                      size="sm"
                      class="q-ml-sm"
                      @click="clearBulkSelection"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card class="quick-actions" style="height: 170px;">
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Acciones rápidas</div>
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-btn
                    outline
                    color="primary"
                    class="full-width"
                    label="Horario estándar"
                    icon="work"
                    @click="applyStandardHours"
                  />
                </div>
                <div class="col-6">
                  <q-btn
                    outline
                    color="negative"
                    class="full-width"
                    label="Cerrar todos"
                    icon="event_busy"
                    @click="closeAllDays"
                  />
                </div>
                <div class="col-6 q-mt-sm">
                  <q-btn
                    outline
                    color="secondary"
                    class="full-width"
                    label="Abrir L-V"
                    icon="event_available"
                    @click="openWeekdays"
                  />
                </div>
                <div class="col-6 q-mt-sm">
                  <q-btn
                    outline
                    color="secondary"
                    class="full-width"
                    label="Abrir S-D"
                    icon="weekend"
                    @click="openWeekends"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Tabla de horarios -->
      <q-card>
        <q-table
          :rows="hoursTableData"
          :columns="columns"
          row-key="day"
          :pagination="{ rowsPerPage: 7 }"
          hide-pagination
          flat
          class="hours-table"
        >
          <template v-slot:body="props">
            <q-tr :props="props" :class="{ 'closed-day': !props.row.isOpen }">
              <q-td key="day" :props="props">
                <div class="row items-center">
                  <q-checkbox
                    v-model="storeHours[props.row.day].isOpen"
                    :label="props.row.dayName"
                    @update:model-value="updateDayStatus(props.row.day)"
                  />
                </div>
              </q-td>
              <q-td key="hours" :props="props">
                <div v-if="storeHours[props.row.day].isOpen" class="row q-col-gutter-x-sm items-center">
                  <div class="col-12 col-sm-5">
                    <q-select
                      v-model="storeHours[props.row.day].from"
                      :options="timeOptions"
                      label="Apertura"
                      outlined
                      dense
                      emit-value
                      map-options
                      :disable="!storeHours[props.row.day].isOpen"
                      @update:model-value="validateHours(props.row.day)"
                    />
                  </div>
                  <div class="col-12 col-sm-5">
                    <q-select
                      v-model="storeHours[props.row.day].to"
                      :options="timeOptions"
                      label="Cierre"
                      outlined
                      dense
                      emit-value
                      map-options
                      :disable="!storeHours[props.row.day].isOpen"
                      @update:model-value="validateHours(props.row.day)"
                    />
                  </div>
                </div>
                <div v-else class="text-grey">
                  Cerrado
                </div>
              </q-td>
              <q-td key="status" :props="props" class="text-center">
                <q-badge
                  :color="storeHours[props.row.day].isOpen ? 'positive' : 'negative'"
                  :label="storeHours[props.row.day].isOpen ? 'Abierto' : 'Cerrado'"
                  class="q-px-sm"
                />
              </q-td>
              <q-td key="duration" :props="props" class="text-center">
                <div v-if="storeHours[props.row.day].isOpen && !storeHours[props.row.day].hasError">
                  {{ calculateDuration(props.row.day) }}
                </div>
                <div v-else class="text-grey">
                  --
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const emit = defineEmits(['update:schedule'])

const props = defineProps({
  schedule: {
    type: Object,
    default: () => {}
  }
})

/**
 * Days of the week
 * @type {Array}
 */
const daysOfWeek = [
  { value: 'monday', label: 'Lunes', shortLabel: 'Lun' },
  { value: 'tuesday', label: 'Martes', shortLabel: 'Mar' },
  { value: 'wednesday', label: 'Miércoles', shortLabel: 'Mié' },
  { value: 'thursday', label: 'Jueves', shortLabel: 'Jue' },
  { value: 'friday', label: 'Viernes', shortLabel: 'Vie' },
  { value: 'saturday', label: 'Sábado', shortLabel: 'Sáb' },
  { value: 'sunday', label: 'Domingo', shortLabel: 'Dom' }
]

/**
 * Generates time options (every 30 minutes)
 * @returns {Array}
 */
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const hourStr = hour.toString().padStart(2, '0')
      const minuteStr = minute.toString().padStart(2, '0')
      const timeStr = `${hourStr}:${minuteStr}`
      options.push({
        label: timeStr,
        value: timeStr
      })
    }
  }
  return options
}

/**
 * Time options
 * @type {Array}
 */
const timeOptions = generateTimeOptions()

/**
 * Default store hours
 * @returns {Object} Object with the store hours
 */
const createDefaultStoreHours = () => {
  const hours = {}
  daysOfWeek.forEach(day => {
    hours[day.value] = {
      isOpen: day.value !== 'sunday',
      from: '09:00',
      to: '18:00',
      hasError: false,
      errorMessage: ''
    }
  })
  return hours
}

/**
 * Store hours
 * @type {Object}
 */
const storeHours = reactive(props.schedule || createDefaultStoreHours())

/**
 * Bulk variables
 */
const bulkFrom = ref('09:00')
/**
 * Bulk variables
 * @type {Ref}
 */
const bulkTo = ref('18:00')
/**
 * Bulk variables
 * @type {Ref}
 */
const bulkSelectedDays = ref([])
/**
 * Bulk variables
 * @type {Ref}
 */
const bulkError = ref(false)
/**
 * Bulk variables
 * @type {Ref}
 */
const bulkErrorMessage = ref('')

/**
 * Validates that the closing time is after the opening time
 * @param {String} day
 * @returns {Boolean}
 */
const validateHours = (day) => {
  const { from, to } = storeHours[day]

  if (from >= to) {
    storeHours[day].hasError = true
    storeHours[day].errorMessage = 'La hora de cierre debe ser posterior a la de apertura'
    return false
  }

  storeHours[day].hasError = false
  storeHours[day].errorMessage = ''
  return true
}

watch(storeHours, (data) => {
  emit('update:schedule', data)
})

/**
 * Validates bulk hours
 * @returns {Boolean}
 */
const validateBulkHours = () => {
  if (bulkFrom.value >= bulkTo.value) {
    bulkError.value = true
    bulkErrorMessage.value = 'La hora de cierre debe ser posterior a la de apertura'
    return false
  }

  bulkError.value = false
  bulkErrorMessage.value = ''
  return true
}

/**
 * Update day status (open/closed)
 * @param {String} day
 */
const updateDayStatus = (day) => {
  if (storeHours[day].isOpen) {
    validateHours(day)
  } else {
    storeHours[day].hasError = false
    storeHours[day].errorMessage = ''
  }
}

/**
 * Calculate duration of the time
 * @param {String} day
 * @returns {Number}
 */
const calculateDuration = (day) => {
  const { from, to } = storeHours[day]

  const [fromHours, fromMinutes] = from.split(':').map(Number)
  const [toHours, toMinutes] = to.split(':').map(Number)

  const durationMinutes = (toHours * 60 + toMinutes) - (fromHours * 60 + fromMinutes)

  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  return `${hours}h ${minutes}m`
}

/**
 * Apply bulk hours
 */
const applyBulkHours = () => {
  if (!validateBulkHours()) return

  bulkSelectedDays.value.forEach(day => {
    storeHours[day].isOpen = true
    storeHours[day].from = bulkFrom.value
    storeHours[day].to = bulkTo.value
    validateHours(day)
  })

  $q.notify({
    color: 'positive',
    message: `Horario aplicado a ${bulkSelectedDays.value.length} días`,
    icon: 'done'
  })
}

/**
 * Clear bulk selection
 */
const clearBulkSelection = () => {
  bulkSelectedDays.value = []
  bulkError.value = false
  bulkErrorMessage.value = ''
}

/**
 * Apply standard hours
 */
const applyStandardHours = () => {
  daysOfWeek.forEach(day => {
    if (day.value === 'saturday') {
      storeHours[day.value].isOpen = true
      storeHours[day.value].from = '10:00'
      storeHours[day.value].to = '14:00'
    } else if (day.value === 'sunday') {
      storeHours[day.value].isOpen = false
    } else {
      storeHours[day.value].isOpen = true
      storeHours[day.value].from = '09:00'
      storeHours[day.value].to = '18:00'
    }
    validateHours(day.value)
  })

  $q.notify({
    color: 'positive',
    message: 'Horario estándar aplicado',
    icon: 'done'
  })
}

/**
 * Close all days
 */
const closeAllDays = () => {
  daysOfWeek.forEach(day => {
    storeHours[day.value].isOpen = false
  })

  $q.notify({
    color: 'negative',
    message: 'Todos los días cerrados',
    icon: 'event_busy'
  })
}

/**
 * Open weekdays
 */
const openWeekdays = () => {
  daysOfWeek.forEach(day => {
    if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.value)) {
      storeHours[day.value].isOpen = true
      storeHours[day.value].from = '09:00'
      storeHours[day.value].to = '18:00'
      validateHours(day.value)
    } else {
      storeHours[day.value].isOpen = false
    }
  })

  $q.notify({
    color: 'positive',
    message: 'Horario de lunes a viernes aplicado',
    icon: 'event_available'
  })
}

/**
 * Open weekends
 */
const openWeekends = () => {
  daysOfWeek.forEach(day => {
    if (['saturday', 'sunday'].includes(day.value)) {
      storeHours[day.value].isOpen = true
      storeHours[day.value].from = '10:00'
      storeHours[day.value].to = '16:00'
      validateHours(day.value)
    } else {
      storeHours[day.value].isOpen = false
    }
  })

  $q.notify({
    color: 'positive',
    message: 'Horario de fin de semana aplicado',
    icon: 'weekend'
  })
}

/**
 * Verify if bulk hours can be applied
 * @returns {Boolean}
 */
const canApplyBulk = computed(() => {
  return bulkSelectedDays.value.length > 0 && !bulkError.value
})

/**
 * Hours table data
 * @returns {Array}
 */
const hoursTableData = computed(() => {
  return daysOfWeek.map(day => ({
    day: day.value,
    dayName: day.label,
    isOpen: storeHours[day.value].isOpen
  }))
})

/**
 * Columns for the table
 * @type {Array}
 */
const columns = [
  { name: 'day', align: 'left', label: 'Día', field: 'dayName' },
  { name: 'hours', align: 'left', label: 'Horario', field: 'hours' },
  { name: 'status', align: 'center', label: 'Estado', field: 'status' },
  { name: 'duration', align: 'center', label: 'Duración', field: 'duration' }
]

onMounted(() => {
  daysOfWeek.forEach(day => {
    if (storeHours[day.value].isOpen) {
      validateHours(day.value)
    }
  })
})

</script>

<style>
.store-hours-manager {
  border-radius: 8px;
  overflow: hidden;
}

.hours-table {
  border-radius: 4px;
}

.closed-day {
  background-color: rgba(0, 0, 0, 0.03);
}

.body--dark .closed-day {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Vista previa de horarios */
.hours-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.hours-preview-day {
  flex: 1;
  min-width: 100px;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.hours-preview-day-label {
  font-weight: 500;
  margin-bottom: 4px;
}

.hours-preview-day-hours {
  font-size: 0.9rem;
}

.hours-preview-day-open {
  background-color: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
}

.hours-preview-day-closed {
  background-color: rgba(244, 67, 54, 0.05);
  border-color: rgba(244, 67, 54, 0.2);
  color: rgba(0, 0, 0, 0.6);
}

.hours-preview-day-error {
  background-color: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.4);
}

/* Estilos para modo oscuro */
.body--dark .hours-preview-day {
  border-color: rgba(255, 255, 255, 0.12);
}

.body--dark .hours-preview-day-open {
  background-color: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.3);
}

.body--dark .hours-preview-day-closed {
  background-color: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.2);
  color: rgba(255, 255, 255, 0.6);
}

.body--dark .hours-preview-day-error {
  background-color: rgba(244, 67, 54, 0.15);
  border-color: rgba(244, 67, 54, 0.4);
}

/* Responsive */
@media (max-width: 599px) {
  .hours-preview-day {
    min-width: 80px;
    padding: 6px;
  }

  .hours-preview-day-hours {
    font-size: 0.8rem;
  }
}
</style>
