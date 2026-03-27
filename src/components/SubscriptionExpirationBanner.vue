<template>
  <transition
    appear
    enter-active-class="animated slideInDown"
    leave-active-class="animated slideOutUp"
  >
    <div
      v-if="showBanner && !dismissed"
      :class="['subscription-banner', bannerClass]"
    >
      <div class="subscription-banner-content">
        <div class="banner-icon">
          <q-icon :name="bannerIcon" size="24px" />
        </div>
        <div class="banner-text">
          <div class="banner-title">{{ bannerTitle }}</div>
          <div class="banner-message">{{ bannerMessage }}</div>
        </div>
        <div class="banner-actions">
          <q-btn
            flat
            dense
            label="Renovar"
            color="white"
            class="banner-btn"
            :loading="loading"
            @click="handleRenew"
          />
          <q-btn
            flat
            dense
            round
            icon="close"
            color="white"
            size="sm"
            @click="handleDismiss"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'

export default {
  name: 'SubscriptionExpirationBanner',
  props: {
    isDemo: {
      type: Boolean,
      default: false
    }
  },
  emits: ['open-subscription-dialog', 'banner-dismissed'],
  setup (props, { emit }) {
    const store = authentication()
    const route = useRoute()
    const dismissed = ref(false)
    const loading = ref(false)

    const subscriptionInfo = computed(() => store.currentSubscription)
    const daysLeft = computed(() => store.subscriptionDaysLeft)

    const showBanner = computed(() => {
      if (!subscriptionInfo.value || props.isDemo) return false
      const days = daysLeft.value
      return days !== null && days <= 7 && days >= 0
    })

    const bannerClass = computed(() => {
      const days = daysLeft.value
      if (days <= 2) return 'banner-critical'
      if (days <= 5) return 'banner-warning'
      return 'banner-info'
    })

    const bannerIcon = computed(() => {
      const days = daysLeft.value
      if (days <= 2) return 'error'
      if (days <= 5) return 'warning'
      return 'info'
    })

    const bannerTitle = computed(() => {
      const days = daysLeft.value
      if (days === 0) return '¡Tu suscripción vence hoy!'
      if (days === 1) return '¡Tu suscripción vence mañana!'
      return `Tu suscripción vence en ${days} días`
    })

    const bannerMessage = computed(() => {
      const planName = subscriptionInfo.value?.plan?.name || 'actual'
      return `Renueva tu plan ${planName} para seguir disfrutando de todas las funcionalidades`
    })

    const checkDismissalStatus = () => {
      if (!subscriptionInfo.value) return

      const storedSubId = localStorage.getItem('dismissed_banner_sub_id')
      const currentSubId = subscriptionInfo.value?.id

      if (storedSubId !== String(currentSubId)) {
        dismissed.value = false
        localStorage.removeItem('dismissed_banner_sub_id')
      }
    }

    const handleDismiss = () => {
      dismissed.value = true
      if (subscriptionInfo.value?.id) {
        localStorage.setItem('dismissed_banner_sub_id', String(subscriptionInfo.value.id))
      }
      emit('banner-dismissed', {
        daysLeft: daysLeft.value,
        subscriptionId: subscriptionInfo.value?.id
      })
    }

    const handleRenew = async () => {
      const plan = store.currentPlan

      // Fallback: open plans dialog if we don't have plan data
      if (!plan?.id) {
        emit('open-subscription-dialog')
        return
      }

      loading.value = true
      try {
        const businessType = route.query.business_type ||
          store.userSession?.company_session?.business_type?.name

        const response = await api.post('mercadopago/create-payment', {
          subscription_plan_id: plan.id,
          branch_offices_count: store.currentSubscription?.branch_offices_count || 1,
          months: 1,
          business_type: businessType
        })

        if (!response.data.init_point) {
          throw new Error('No se recibió URL de pago de Mercado Pago')
        }

        localStorage.setItem('mp_preference_id', response.data.preference_id)
        localStorage.setItem('mp_plan_id', plan.id)
        localStorage.setItem('mp_plan_name', plan.name)
        localStorage.setItem('mp_business_type_id', store.userSession?.company_session?.business_type?.id || '')

        notify('Redirigiendo a Mercado Pago...', 'info', 'payment')
        await new Promise(resolve => setTimeout(resolve, 500))
        window.location.href = response.data.init_point
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al crear el link de pago'
        notify(msg, 'negative', 'warning')
      } finally {
        loading.value = false
      }
    }

    // Watch for subscription changes to handle dismissal reset
    watch(subscriptionInfo, () => {
      checkDismissalStatus()
    }, { immediate: true })

    return {
      subscriptionInfo,
      daysLeft,
      dismissed,
      loading,
      showBanner,
      bannerClass,
      bannerIcon,
      bannerTitle,
      bannerMessage,
      handleDismiss,
      handleRenew
    }
  }
}
</script>

<style lang="scss" scoped>
/* Subscription Expiration Banner */
.subscription-banner {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 2000;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &.banner-info {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  &.banner-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  &.banner-critical {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }
}

.subscription-banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
}

.banner-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}

.banner-message {
  font-size: 13px;
  opacity: 0.95;
  line-height: 1.4;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.banner-btn {
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 8px 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .subscription-banner {
    top: 56px;
    padding: 10px 12px;
  }

  .subscription-banner-content {
    gap: 12px;
  }

  .banner-icon {
    width: 32px;
    height: 32px;
  }

  .banner-title {
    font-size: 14px;
  }

  .banner-message {
    font-size: 12px;
  }

  .banner-btn {
    padding: 6px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .banner-text {
    flex: 1;
  }

  .banner-message {
    display: none;
  }

  .banner-actions {
    gap: 4px;
  }

  .banner-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
