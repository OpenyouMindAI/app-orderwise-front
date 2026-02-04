<template>
  <transition
    name="slide-fade"
    @before-enter="beforeEnter"
    @enter="enter"
    @leave="leave"
  >
    <div
      v-if="isVisible && hasDelayPassed"
      class="pro-promo-banner"
      @click="handleBannerClick"
    >
      <div class="banner-content">
        <div class="text-content-wrapper">
          <div class="text-content">
            <div class="icon-wrapper">
              <q-icon name="workspace_premium" size="24px" class="shimmer-icon" />
              <div class="timer-badge" v-if="timeString">
                <q-icon name="timer" size="14px" />
                <span>{{ timeString }}</span>
              </div>
            </div>
            <div class="text-group">
              <span class="title">¡Potencia tu negocio!</span>
              <span class="message">Obtén acceso ilimitado a todas las herramientas Pro.</span>
            </div>
          </div>
        </div>

        <div class="banner-actions">
          <q-btn
            unelevated
            dense
            no-caps
            class="action-btn"
            @click="handleUpgrade"
          >
            <span class="btn-text">Ver Planes Premium</span>
            <q-icon name="arrow_forward" size="14px" class="q-ml-xs" />
          </q-btn>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue'
import { authentication } from 'src/stores/module-authentication'

export default defineComponent({
  name: 'ProPlanPromoBanner',
  emits: ['open-subscription'],
  setup (props, { emit }) {
    const store = authentication()
    const hasDelayPassed = ref(false)
    const timeString = ref('')
    const TIMER_STORAGE_KEY = 'pro_promo_timer_target_v3_days'
    const COUNTDOWN_DURATION = 3 * 24 * 60 * 60 * 1000
    let timerInterval = null

    const isVisible = computed(() => {
      const currentPlan = store.subscriptionPlan || 'Free'
      return currentPlan === 'Free' || store.isDemo
    })

    const startTimer = () => {
      const now = Date.now()
      let targetTime = parseInt(localStorage.getItem(TIMER_STORAGE_KEY))

      if (!targetTime || targetTime < now) {
        targetTime = now + COUNTDOWN_DURATION
        localStorage.setItem(TIMER_STORAGE_KEY, targetTime.toString())
      }

      const updateTimer = () => {
        const currentTime = Date.now()
        let diff = targetTime - currentTime

        if (diff <= 0) {
          targetTime = currentTime + COUNTDOWN_DURATION
          localStorage.setItem(TIMER_STORAGE_KEY, targetTime.toString())
          diff = COUNTDOWN_DURATION
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        const formattedDays = days > 0 ? `${days}d ` : ''
        timeString.value = `${formattedDays}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }

      updateTimer()
      timerInterval = setInterval(updateTimer, 1000)
    }

    onMounted(() => {
      startTimer()

      setTimeout(() => {
        hasDelayPassed.value = true
      }, 1500)
    })

    onUnmounted(() => {
      if (timerInterval) clearInterval(timerInterval)
    })

    const handleUpgrade = () => {
      emit('open-subscription')
    }

    const handleBannerClick = () => {
      if (window.innerWidth < 1024) {
        emit('open-subscription')
      }
    }

    const beforeEnter = (el) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(-100%)'
    }

    const enter = (el, done) => {
      void el.offsetHeight
      el.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
      setTimeout(done, 600)
    }

    const leave = (el, done) => {
      el.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      el.style.opacity = '0'
      el.style.transform = 'translateY(-20px)'
      setTimeout(done, 400)
    }

    return {
      isVisible,
      hasDelayPassed,
      timeString,
      handleUpgrade,
      handleBannerClick,
      beforeEnter,
      enter,
      leave
    }
  }
})
</script>

<style lang="scss" scoped>
.pro-promo-banner {
  background: #1C1C1C;
  color: white;
  padding: 8px 24px;
  position: relative;
  z-index: 1000;
  width: 100%;
  box-sizing: border-box;
}

.banner-content {
  max-width: 1500px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.text-content-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.text-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 100%;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.shimmer-icon {
  color: #fbbf24;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
  animation: pulse-glow 3s infinite ease-in-out;
}

.timer-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-primary);
  border: 1px solid rgba(251, 191, 36, 0.3);
  animation: pulse-border 2s infinite;
  white-space: nowrap;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.2); }
  70% { box-shadow: 0 0 0 4px rgba(251, 191, 36, 0); }
  100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}

.title {
  font-family: var(--font-primary);
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: linear-gradient(to right, #fbbf24, #f59e0b);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.message {
  font-family: var(--font-primary);
  font-size: 0.875rem;
  color: #cbd5e1;
  font-weight: 400;
  line-height: 1.3;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  color: #0f172a;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.3);
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.4);
    filter: brightness(1.1);
  }
}

.btn-text {
  display: inline;
}

.close-btn {
  color: #64748b;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: #e2e8f0;
    background: transparent;
    transform: scale(1.1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.4));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.7));
    transform: scale(1.05);
  }
}

@media (max-width: 1023px) {
  .action-btn {
    display: none;
  }

  .pro-promo-banner {
    cursor: pointer;
    padding: 14px 20px;
  }

  .text-content-wrapper {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .pro-promo-banner {
    padding: 12px 16px;
  }

  .banner-content {
    gap: 12px;
  }

  .text-content {
    gap: 10px;
  }

  .title {
    font-size: 0.875rem;
  }

  .message {
    font-size: 0.8125rem;
  }

  .timer-badge {
    font-size: 0.7rem;
    padding: 3px 8px;
  }

  .shimmer-icon {
    font-size: 20px;
  }
}

@media (max-width: 600px) {
  .pro-promo-banner {
    padding: 12px 16px;
  }

  .text-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .icon-wrapper {
    width: 100%;
    justify-content: flex-start;
  }

  .text-group {
    width: 100%;
    gap: 4px;
  }

  .title {
    font-size: 0.85rem;
    white-space: normal;
  }

  .message {
    font-size: 0.8rem;
    line-height: 1.4;
  }

  .banner-actions {
    align-items: flex-start;
    padding-top: 4px;
  }
}

@media (max-width: 480px) {
  .pro-promo-banner {
    padding: 10px 14px;
  }

  .banner-content {
    gap: 10px;
  }

  .title {
    font-size: 0.8rem;
  }

  .message {
    font-size: 0.75rem;
  }

  .timer-badge {
    font-size: 0.65rem;
    padding: 2px 6px;
    gap: 3px;
  }

  .timer-badge .q-icon {
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .pro-promo-banner {
    padding: 8px 12px;
  }

  .banner-content {
    gap: 8px;
    align-items: flex-start;
  }

  .text-content {
    gap: 6px;
  }

  .icon-wrapper {
    gap: 6px;
    flex-wrap: wrap;
  }

  .shimmer-icon {
    font-size: 18px;
  }

  .title {
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .message {
    font-size: 0.7rem;
    line-height: 1.3;
  }

  .timer-badge {
    font-size: 0.6rem;
    padding: 2px 5px;
  }
}

@media (max-width: 320px) {
  .pro-promo-banner {
    padding: 8px 10px;
  }

  .title {
    font-size: 0.7rem;
  }

  .message {
    font-size: 0.65rem;
  }

  .timer-badge {
    font-size: 0.55rem;
  }

  .icon-wrapper {
    gap: 4px;
  }
}
</style>
