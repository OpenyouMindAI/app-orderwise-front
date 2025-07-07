<template>
  <div class="schedule-manager">
    <!-- Header -->
    <div class="schedule-header">
      <h3 class="schedule-title">Horarios de atención</h3>
      <p class="schedule-subtitle">Configura los días y horarios de apertura</p>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <q-btn
        flat
        dense
        color="primary"
        label="L-V 9-18h"
        @click="applyWeekdays"
        class="action-chip"
      />
      <q-btn
        flat
        dense
        color="secondary"
        label="S-D 10-16h"
        @click="applyWeekends"
        class="action-chip"
      />
      <q-btn
        flat
        dense
        color="negative"
        label="Cerrar todo"
        @click="closeAllDays"
        class="action-chip"
      />
    </div>

    <!-- Days Grid -->
    <div class="days-grid">
      <div
        v-for="day in daysOfWeek"
        :key="day.value"
        class="day-card"
        :class="{ 'day-closed': !storeHours[day.value].isOpen }"
      >
        <!-- Day Header -->
        <div class="day-header">
          <q-checkbox
            v-model="storeHours[day.value].isOpen"
            :label="day.shortLabel"
            color="primary"
            dense
            @update:model-value="updateDayStatus(day.value)"
            class="day-checkbox"
          />
          <q-badge
            v-if="storeHours[day.value].isOpen"
            color="positive"
            label="Abierto"
            class="day-badge"
          />
          <q-badge
            v-else
            color="grey-5"
            label="Cerrado"
            class="day-badge"
          />
        </div>

        <!-- Time Selectors -->
        <div v-if="storeHours[day.value].isOpen" class="time-selectors">
          <div class="time-group">
            <label class="time-label">Apertura</label>
            <q-select
              v-model="storeHours[day.value].from"
              :options="timeOptions"
              outlined
              dense
              emit-value
              map-options
              class="time-select"
              @update:model-value="validateHours(day.value)"
            />
          </div>
          <div class="time-separator">-</div>
          <div class="time-group">
            <label class="time-label">Cierre</label>
            <q-select
              v-model="storeHours[day.value].to"
              :options="timeOptions"
              outlined
              dense
              emit-value
              map-options
              class="time-select"
              :error="storeHours[day.value].hasError"
              @update:model-value="validateHours(day.value)"
            />
          </div>
        </div>

        <!-- Closed State -->
        <div v-else class="closed-state">
          <q-icon name="event_busy" color="grey-5" size="sm" />
          <span class="closed-text">Cerrado</span>
        </div>

        <!-- Duration -->
        <div v-if="storeHours[day.value].isOpen && !storeHours[day.value].hasError" class="duration">
          <q-icon name="schedule" size="xs" color="grey-6" />
          <span class="duration-text">{{ calculateDuration(day.value) }}</span>
        </div>
      </div>
    </div>

    <!-- Bulk Actions (Collapsible) -->
    <q-expansion-item
      icon="tune"
      label="Configuración avanzada"
      class="bulk-section"
      header-class="bulk-header"
    >
      <div class="bulk-content">
        <div class="bulk-form">
          <div class="bulk-times">
            <div class="bulk-time-group">
              <label class="bulk-label">Horario</label>
              <div class="bulk-time-inputs">
                <q-select
                  v-model="bulkFrom"
                  :options="timeOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="bulk-time-select"
                />
                <span class="bulk-separator">a</span>
                <q-select
                  v-model="bulkTo"
                  :options="timeOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="bulk-time-select"
                  :error="bulkError"
                />
              </div>
            </div>
          </div>

          <div class="bulk-days">
            <label class="bulk-label">Aplicar a:</label>
            <div class="bulk-checkboxes">
              <q-checkbox
                v-for="day in daysOfWeek"
                :key="day.value"
                v-model="bulkSelectedDays"
                :val="day.value"
                :label="day.shortLabel"
                color="primary"
                dense
                class="bulk-checkbox"
              />
            </div>
          </div>

          <div class="bulk-actions-row">
            <q-btn
              flat
              color="grey-6"
              label="Limpiar"
              size="sm"
              @click="clearBulkSelection"
              class="bulk-btn"
            />
            <q-btn
              color="primary"
              label="Aplicar"
              size="sm"
              :disable="!canApplyBulk"
              @click="applyBulkHours"
              unelevated
              class="bulk-btn"
            />
          </div>
        </div>
      </div>
    </q-expansion-item>
  </div>
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

const daysOfWeek = [
  { value: 'monday', label: 'Lunes', shortLabel: 'Lun' },
  { value: 'tuesday', label: 'Martes', shortLabel: 'Mar' },
  { value: 'wednesday', label: 'Miércoles', shortLabel: 'Mié' },
  { value: 'thursday', label: 'Jueves', shortLabel: 'Jue' },
  { value: 'friday', label: 'Viernes', shortLabel: 'Vie' },
  { value: 'saturday', label: 'Sábado', shortLabel: 'Sáb' },
  { value: 'sunday', label: 'Domingo', shortLabel: 'Dom' }
]

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

const timeOptions = generateTimeOptions()

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

const storeHours = reactive(props.schedule || createDefaultStoreHours())

const bulkFrom = ref('09:00')
const bulkTo = ref('18:00')
const bulkSelectedDays = ref([])
const bulkError = ref(false)
const bulkErrorMessage = ref('')

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
}, { deep: true })

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

const updateDayStatus = (day) => {
  if (storeHours[day].isOpen) {
    validateHours(day)
  } else {
    storeHours[day].hasError = false
    storeHours[day].errorMessage = ''
  }
}

const calculateDuration = (day) => {
  const { from, to } = storeHours[day]

  const [fromHours, fromMinutes] = from.split(':').map(Number)
  const [toHours, toMinutes] = to.split(':').map(Number)

  const durationMinutes = (toHours * 60 + toMinutes) - (fromHours * 60 + fromMinutes)

  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  return `${hours}h ${minutes}m`
}

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
    icon: 'done',
    timeout: 2000
  })
}

const clearBulkSelection = () => {
  bulkSelectedDays.value = []
  bulkError.value = false
  bulkErrorMessage.value = ''
}

const applyWeekdays = () => {
  daysOfWeek.forEach(day => {
    if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.value)) {
      storeHours[day.value].isOpen = true
      storeHours[day.value].from = '09:00'
      storeHours[day.value].to = '18:00'
      validateHours(day.value)
    }
  })

  $q.notify({
    color: 'positive',
    message: 'Horario L-V aplicado',
    icon: 'event_available',
    timeout: 2000
  })
}

const applyWeekends = () => {
  daysOfWeek.forEach(day => {
    if (['saturday', 'sunday'].includes(day.value)) {
      storeHours[day.value].isOpen = true
      storeHours[day.value].from = '10:00'
      storeHours[day.value].to = '16:00'
      validateHours(day.value)
    }
  })

  $q.notify({
    color: 'positive',
    message: 'Horario S-D aplicado',
    icon: 'weekend',
    timeout: 2000
  })
}

const closeAllDays = () => {
  daysOfWeek.forEach(day => {
    storeHours[day.value].isOpen = false
  })

  $q.notify({
    color: 'negative',
    message: 'Todos los días cerrados',
    icon: 'event_busy',
    timeout: 2000
  })
}

const canApplyBulk = computed(() => {
  return bulkSelectedDays.value.length > 0 && !bulkError.value
})

const initializeStoreHours = () => {
  daysOfWeek.forEach(day => {
    if (storeHours[day.value].isOpen) {
      validateHours(day.value)
    }
  })
}

onMounted(() => {
  initializeStoreHours()
})
</script>

<style scoped>
.schedule-manager {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
}

/* Header */
.schedule-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.schedule-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.schedule-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.action-chip {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: none;
  font-weight: 500;
}

/* Days Grid */
.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.day-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.day-card:hover {
  border-color: var(--q-primary);
}

.day-closed {
  background: #f1f5f9;
  opacity: 0.7;
}

/* Day Header */
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.day-checkbox {
  font-weight: 500;
}

.day-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
}

/* Time Selectors */
.time-selectors {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.time-group {
  flex: 1;
  min-width: 0;
}

.time-label {
  display: block;
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.time-select {
  font-size: 0.8rem;
  width: 100%;
}

.time-select :deep(.q-field__control) {
  min-height: 32px;
}

.time-separator {
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.25rem;
  flex-shrink: 0;
}

/* Closed State */
.closed-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0;
  color: #64748b;
}

.closed-text {
  font-size: 0.85rem;
  font-weight: 500;
}

/* Duration */
.duration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.duration-text {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* Bulk Section */
.bulk-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.bulk-header {
  background: #f8fafc;
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.bulk-content {
  padding: 1rem;
  background: white;
}

.bulk-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bulk-times {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bulk-time-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bulk-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
}

.bulk-time-inputs {
  display: flex;
  gap: 0.5rem;
}

.bulk-time-select {
  flex: 1;
  max-width: 100px;
}

.bulk-time-select :deep(.q-field__control) {
  min-height: 32px;
}

.bulk-separator {
  color: #64748b;
  font-weight: 500;
}

.bulk-days {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bulk-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bulk-checkbox {
  font-size: 0.8rem;
}

.bulk-actions-row {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.bulk-btn {
  font-size: 0.8rem;
  padding: 0.25rem 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-manager {
    padding: 1rem;
  }

  .days-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .day-card {
    padding: 0.75rem;
  }

  .bulk-time-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .bulk-time-select {
    max-width: none;
  }

  .bulk-checkboxes {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-chip {
    width: 100%;
    max-width: 200px;
  }

  .time-selectors {
    flex-direction: column;
    gap: 0.5rem;
  }

  .time-separator {
    display: none;
  }
}
</style>
