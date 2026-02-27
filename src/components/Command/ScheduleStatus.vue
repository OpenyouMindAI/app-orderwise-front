<template>
  <div>
    <q-btn
      fab
      :color="isCurrentlyOpen ? 'positive' : 'negative'"
      :label="isCurrentlyOpen ? 'Abierto' : 'Cerrado'"
      @click="showSchedule = true"
    >
      <q-badge v-if="isCurrentlyOpen && timeUntilClose < 60" color="orange" class="q-ml-xs" floating>
        {{ timeUntilClose }}m
      </q-badge>
      <q-icon name="keyboard_double_arrow_down" class="q-ml-xs" />
    </q-btn>

    <!-- Diálogo con horarios -->
    <q-dialog v-model="showSchedule" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="schedule-card">
        <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Horarios de atención</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="schedule-content q-py-none">
          <q-list separator>
            <q-item v-for="(day, index) in weekSchedule" :key="index" class="schedule-item">
              <q-item-section avatar>
                <q-avatar :color="getDayColor(day)" text-color="white" size="md">
                  {{ day.dayName.charAt(0) }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="day-name" :class="{ 'current-day': isCurrentDay(day.dayName) }">
                  {{ day.dayName }}
                  <q-badge v-if="isCurrentDay(day.dayName)" color="primary" class="q-ml-sm">Hoy</q-badge>
                </q-item-label>

                <q-item-label caption>
                  <template v-if="day.isOpen && !day.error">
                    <q-icon name="mdi-clock-time-four-outline" size="xs" class="q-mr-xs" />
                    <span class="schedule-time">{{ formatTime(day.openTime) }} – {{ formatTime(day.closeTime) }}</span>
                    <q-badge v-if="isCurrentDay(day.dayName) && isCurrentlyOpen"
                             color="positive"
                             class="q-ml-sm status-badge">
                      Abierto
                    </q-badge>
                    <q-badge v-else-if="isCurrentDay(day.dayName) && !isCurrentlyOpen"
                             color="negative"
                             class="q-ml-sm status-badge">
                      Cerrado
                    </q-badge>
                  </template>

                  <template v-else-if="!day.isOpen && !day.error">
                    <q-icon name="mdi-door-closed" size="xs" class="q-mr-xs" />
                    <span class="closed-text">Cerrado</span>
                  </template>

                  <template v-if="day.error">
                    <q-icon name="mdi-alert-circle" color="warning" size="xs" class="q-mr-xs" />
                    <span class="error-text">{{ day.errorMessage }}</span>
                  </template>
                </q-item-label>
              </q-item-section>

              <q-item-section side v-if="isCurrentDay(day.dayName) && isCurrentlyOpen">
                <q-circular-progress
                  show-value
                  font-size="10px"
                  :value="getDayProgress(day)"
                  size="40px"
                  :thickness="0.2"
                  color="positive"
                  track-color="grey-3"
                  class="q-mr-sm"
                >
                  {{ Math.round(getDayProgress(day)) }}%
                </q-circular-progress>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
/**
 * Show schedule
 * @type {Ref<Boolean>}
 */
const showSchedule = ref(false)
/**
 * Current time
 * @type {Ref<Date>}
 */
const currentTime = ref(new Date())
/**
 * Interval to update the time
 * @type {Ref<Number>}
 */
const updateInterval = ref(null)

/**
 * Day translations
 * @type {Object}
 */
const dayTranslations = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
}
const emit = defineEmits(['update:isCurrentlyOpen'])
/**
 * Day of the week
 * @type {Array<String>}
 */
const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/**
 * Days of the week in Spanish (to determine the current day)
 * @type {Array<String>}
 */
const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const props = defineProps({
  schedule: {
    type: Object,
    default: () => ({
      monday: { from: '00:00', to: '23:59', isOpen: true, hasError: false, errorMessage: '' },
      tuesday: { from: '00:00', to: '23:59', isOpen: true, hasError: false, errorMessage: '' },
      wednesday: { from: '00:00', to: '23:59', isOpen: true, hasError: false, errorMessage: '' },
      thursday: { from: '00:00', to: '23:59', isOpen: true, hasError: false, errorMessage: '' },
      friday: { from: '00:00', to: '23:59', isOpen: true, hasError: false, errorMessage: '' },
      saturday: { from: '00:00', to: '23:59', isOpen: true, hasError: false, errorMessage: '' },
      sunday: { from: '00:00', to: '23:59', isOpen: true, hasError: false, errorMessage: '' }
    })
  }
})
/**
 * Return current day key
 * @returns {String} current day key
 */
const getCurrentDayKey = () => {
  const currentDayIndex = currentTime.value.getDay() // 0 = Domingo, 1 = Lunes, ...
  const currentDayName = daysOfWeek[currentDayIndex]

  return Object.keys(dayTranslations).find(
    key => dayTranslations[key] === currentDayName
  )
}

/**
 * Week schedule
 * @returns {Array}
 */
const weekSchedule = computed(() => {
  return dayOrder.map(day => {
    const dayData = props.schedule[day]
    let error = dayData.hasError
    let errorMessage = dayData.errorMessage

    if (dayData.isOpen && !error) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

      if (!timeRegex.test(dayData.from)) {
        error = true
        errorMessage = 'Formato de hora de apertura inválido'
      } else if (!timeRegex.test(dayData.to)) {
        error = true
        errorMessage = 'Formato de hora de cierre inválido'
      }
    }

    return {
      dayName: dayTranslations[day],
      dayKey: day,
      isOpen: dayData.isOpen,
      openTime: dayData.from,
      closeTime: dayData.to,
      error,
      errorMessage
    }
  })
})

/**
 * Returns the current day key
 */
const isCurrentlyOpen = computed(() => {
  const currentDayKey = getCurrentDayKey()

  if (!currentDayKey || !props.schedule[currentDayKey]) {
    return false
  }

  const today = props.schedule[currentDayKey]

  if (!today.isOpen || today.hasError) {
    return false
  }

  const currentHours = currentTime.value.getHours()
  const currentMinutes = currentTime.value.getMinutes()
  const currentTimeInMinutes = currentHours * 60 + currentMinutes

  const [openHours, openMinutes] = today.from.split(':').map(Number)
  const [closeHours, closeMinutes] = today.to.split(':').map(Number)

  const openTimeInMinutes = openHours * 60 + openMinutes
  const closeTimeInMinutes = closeHours * 60 + closeMinutes

  return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes
})

const timeUntilClose = computed(() => {
  if (!isCurrentlyOpen.value) return 0

  const currentDayKey = getCurrentDayKey()
  const today = props.schedule[currentDayKey]

  const currentHours = currentTime.value.getHours()
  const currentMinutes = currentTime.value.getMinutes()
  const currentTimeInMinutes = currentHours * 60 + currentMinutes

  const [closeHours, closeMinutes] = today.to.split(':').map(Number)
  const closeTimeInMinutes = closeHours * 60 + closeMinutes

  return closeTimeInMinutes - currentTimeInMinutes
})

const isCurrentDay = (dayName) => {
  const currentDayIndex = currentTime.value.getDay()
  const currentDayName = daysOfWeek[currentDayIndex]
  return dayName === currentDayName
}

const formatTime = (time) => {
  return time
}

const getDayColor = (day) => {
  if (isCurrentDay(day.dayName)) {
    return 'primary'
  }
  if (!day.isOpen) {
    return 'grey-7'
  }
  if (day.error) {
    return 'warning'
  }
  return 'grey-5'
}

/**
 * Get the progress of the day
 * @param {Object} day
 * @returns {Number}
 */
const getDayProgress = (day) => {
  if (!isCurrentlyOpen.value || !isCurrentDay(day.dayName)) {
    return 0
  }

  const currentDayKey = getCurrentDayKey()
  const today = props.schedule[currentDayKey]

  const currentHours = currentTime.value.getHours()
  const currentMinutes = currentTime.value.getMinutes()
  const currentTimeInMinutes = currentHours * 60 + currentMinutes

  const [openHours, openMinutes] = today.from.split(':').map(Number)
  const [closeHours, closeMinutes] = today.to.split(':').map(Number)

  const openTimeInMinutes = openHours * 60 + openMinutes
  const closeTimeInMinutes = closeHours * 60 + closeMinutes

  const totalOpenTime = closeTimeInMinutes - openTimeInMinutes
  const elapsedTime = currentTimeInMinutes - openTimeInMinutes

  return (elapsedTime / totalOpenTime) * 100
}

onMounted(() => {
  updateInterval.value = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

watch(isCurrentlyOpen, (val) => {
  emit('update:isCurrentlyOpen', val)
}, { immediate: true })

onBeforeUnmount(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>

<style scoped>

.status-chip {
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.schedule-card {
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.header-section {
  background: linear-gradient(to right, var(--q-primary), rgba(var(--q-primary-rgb), 0.8));
  color: white;
  border-radius: 12px 12px 0 0;
}

.schedule-content {
  max-height: calc(100vh - 50px);
  overflow-y: auto;
}

.schedule-item {
  transition: background-color 0.2s ease;
}

.schedule-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.day-name {
  font-weight: 600;
  font-size: 1.05rem;
}

.current-day {
  color: var(--q-primary);
}

.schedule-time {
  font-weight: 500;
  letter-spacing: 0.3px;
}

.closed-text {
  color: var(--q-negative);
  font-weight: 500;
}

.error-text {
  color: var(--q-warning);
  font-size: 0.9em;
}

.status-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
}

/* Estilos para modo oscuro */
.body--dark .schedule-card {
  background: #1d1d1d;
}

.body--dark .schedule-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.body--dark .closed-text {
  color: #ff6b6b;
}

.body--dark .header-section {
  background: linear-gradient(to right, var(--q-primary), rgba(var(--q-primary-rgb), 0.6));
}

@media (max-width: 599px) {
  .schedule-card {
    max-width: 100%;
    height: 70vh;
  }

  .schedule-content {
    max-height: calc(70vh - 120px);
  }
}
</style>
