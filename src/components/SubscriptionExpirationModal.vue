<template>
  <q-dialog
    v-model="showModal"
    :persistent="isPersistent"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="expiration-modal" :class="`modal--${modalType}`">
      <!-- Animated background glows -->
      <div class="modal-glow glow-1"></div>
      <div class="modal-glow glow-2"></div>

      <!-- Close Button (only for non-blocking states) -->
      <q-btn
        v-if="!isPersistent"
        icon="close"
        flat
        round
        dense
        class="modal-close-btn"
        @click="showModal = false"
      />

      <!-- Icon Area -->
      <div class="modal-icon-wrap">
        <div class="modal-icon-ring">
          <q-icon :name="iconName" :size="$q.screen.lt.sm ? '36px' : '44px'" class="modal-main-icon" />
        </div>
      </div>

      <!-- Content -->
      <div class="modal-body">
        <div class="modal-badge">{{ badgeLabel }}</div>
        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-description">{{ description }}</p>
        <p v-if="secondaryDescription" class="modal-description-secondary">{{ secondaryDescription }}</p>

        <!-- Plan name chip -->
        <div v-if="planName" class="plan-chip">
          <q-icon name="workspace_premium" size="14px" class="q-mr-xs" />
          {{ planName }}
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <q-btn
          unelevated
          no-caps
          class="renew-btn"
          :loading="loading"
          @click="handleRenew"
        >
          <template v-slot:loading>
            <q-spinner-dots size="20px" />
          </template>
          <q-icon name="refresh" size="18px" class="q-mr-sm" />
          Renovar mi plan
          <q-icon name="arrow_forward" size="16px" class="q-ml-sm" />
        </q-btn>

        <p v-if="!isPersistent" class="dismiss-hint">
          Puedes cerrar este aviso. Volverá a aparecer más adelante.
        </p>
        <p v-else class="block-hint">
          <q-icon name="info_outline" size="14px" class="q-mr-xs" />
          Renueva tu plan para recuperar el acceso completo.
        </p>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { useRoute } from 'vue-router'

export default {
  name: 'SubscriptionExpirationModal',

  props: {
    /** Whether the subscription is currently expired */
    isExpired: {
      type: Boolean,
      default: false
    },

    /** Plan slug for display */
    planName: {
      type: String,
      default: ''
    },
    /** Skip showing modal for demo accounts */
    isDemo: {
      type: Boolean,
      default: false
    }
  },

  emits: ['open-subscription'],

  setup (props, { emit }) {
    const store = authentication()
    const route = useRoute()
    const showModal = ref(false)
    const loading = ref(false)

    // Determine modal type based on expired days
    const modalType = computed(() => {
      const days = store.subscriptionDaysLeft || 0
      if (days <= -3) return 'blocked'
      if (days <= -1) return 'warning'
      return 'info'
    })

    // Blocking modals can't be dismissed
    const isPersistent = computed(() => modalType.value === 'blocked' && !store?.userSession?.is_root)

    const iconName = computed(() => {
      if (modalType.value === 'blocked') return 'lock'
      if (modalType.value === 'warning') return 'warning_amber'
      return 'event_available'
    })

    const badgeLabel = computed(() => {
      if (modalType.value === 'blocked') return 'Acceso Suspendido'
      if (modalType.value === 'warning') return 'Aviso Importante'
      return 'Plan Vencido'
    })

    /**
     * Helper to format dates like "26 de febrero del 2026"
     */
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date)
    }

    const formattedPlanName = computed(() => {
      return store.currentPlan?.name || props.planName?.charAt(0).toUpperCase() + props.planName?.slice(1) || 'Pro'
    })

    const deadlineDateString = computed(() => {
      const daysLeft = store.subscriptionDaysLeft || 0
      const daysUntilSuspension = 3 + daysLeft
      const date = new Date()
      date.setDate(date.getDate() + daysUntilSuspension)
      return formatDate(date)
    })

    const title = computed(() => {
      if (modalType.value === 'blocked') return 'Cuenta suspendida'
      if (modalType.value === 'warning') return 'Periodo de gracia'
      return '¡Vence hoy!'
    })

    const description = computed(() => {
      if (modalType.value === 'blocked') {
        return `Tu plan ${formattedPlanName.value} ha sido suspendido por falta de pago. Para continuar utilizando el sistema, es necesario renovar tu suscripción.`
      }
      if (modalType.value === 'warning') {
        const x = Math.abs(store.subscriptionDaysLeft)
        return `Tu suscripción venció hace ${x} día${x === 1 ? '' : 's'}. Tienes hasta el día ${deadlineDateString.value} para renovarla antes de que el sistema sea suspendido.`
      }
      return `Tu suscripción al Plan ${formattedPlanName.value} vence hoy. Para evitar interrupciones en el servicio, te recomendamos renovarla antes de que finalice el día.`
    })

    const secondaryDescription = computed(() => {
      if (modalType.value === 'blocked') {
        return 'Una vez confirmado el pago, el acceso se restablecerá automáticamente.'
      }
      if (modalType.value === 'warning') {
        return 'Durante este periodo puedes seguir utilizando la plataforma con normalidad.'
      }
      return `Si no se renueva, tienes hasta el día ${deadlineDateString.value} antes de la suspensión.`
    })

    // Show modal when expired (days_left < 0) OR exactly on expiration day (days_left === 0)
    // This covers the edge case where the backend may not set is_expired: true on day 0
    watch(
      [() => props.isExpired, () => props.isDemo, () => store.subscriptionDaysLeft],
      ([expired, demo, daysLeft]) => {
        const isExpiredOrDueToday = expired || daysLeft === 0
        if (isExpiredOrDueToday && !demo) {
          setTimeout(() => { showModal.value = true }, 800)
        } else {
          showModal.value = false
        }
      },
      { immediate: true }
    )

    /**
     * Direct redirect to Mercado Pago using the stored plan data.
     * Mirrors the selectPlan() logic from SubscriptionPlansDialog.
     */
    const handleRenew = async () => {
      const plan = store.currentPlan
      console.log(plan)

      // If we have no plan data, fall back to opening the plans dialog
      if (!plan?.id) {
        showModal.value = false
        emit('open-subscription')
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

        // Store preference data in localStorage (same as SubscriptionPlansDialog)
        localStorage.setItem('mp_preference_id', response.data.preference_id)
        localStorage.setItem('mp_plan_id', plan.id)
        localStorage.setItem('mp_plan_name', plan.name)

        notify('Redirigiendo a Mercado Pago...', 'info', 'payment')

        await new Promise(resolve => setTimeout(resolve, 500))

        window.location.href = response.data.init_point
      } catch (error) {
        let errorMessage = 'Error al crear el link de pago'

        if (error.response) {
          const { status, data } = error.response
          if (status === 400) {
            errorMessage = data.message || 'Datos de pago inválidos'
          } else if (status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente'
          } else if (status === 500) {
            errorMessage = 'Error del servidor. Por favor, intenta nuevamente'
          }
        } else if (error.request) {
          errorMessage = 'Error de conexión. Verifica tu internet'
        }

        notify(errorMessage, 'negative', 'warning')
      } finally {
        loading.value = false
      }
    }

    return {
      showModal,
      loading,
      modalType,
      isPersistent,
      iconName,
      badgeLabel,
      title,
      description,
      secondaryDescription,
      handleRenew
    }
  }
}
</script>

<style lang="scss" scoped>
/* ─── Card Base ─────────────────────────────────────────────── */
.expiration-modal {
  position: relative;
  overflow: hidden;
  width: 420px;
  max-width: 95vw;
  border-radius: 28px;
  padding: 0;
  background: #0d0d14;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
}

/* ─── Type Variants ─────────────────────────────────────────── */
.modal--info {
  --accent: #3B82F6;
  --accent-light: rgba(59, 130, 246, 0.15);
  --accent-glow: rgba(59, 130, 246, 0.35);
  border-color: rgba(59, 130, 246, 0.25);
}
.modal--warning {
  --accent: #F59E0B;
  --accent-light: rgba(245, 158, 11, 0.15);
  --accent-glow: rgba(245, 158, 11, 0.35);
  border-color: rgba(245, 158, 11, 0.25);
}
.modal--blocked {
  --accent: #EF4444;
  --accent-light: rgba(239, 68, 68, 0.15);
  --accent-glow: rgba(239, 68, 68, 0.35);
  border-color: rgba(239, 68, 68, 0.3);
}

/* ─── Animated Glows ────────────────────────────────────────── */
.modal-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  pointer-events: none;
  animation: glow-pulse 4s ease-in-out infinite alternate;
}
.glow-1 {
  width: 240px;
  height: 240px;
  background: var(--accent-glow);
  top: -80px;
  right: -60px;
}
.glow-2 {
  width: 160px;
  height: 160px;
  background: var(--accent-glow);
  bottom: -60px;
  left: -40px;
  animation-delay: -2s;
  opacity: 0.3;
}

@keyframes glow-pulse {
  from { opacity: 0.4; transform: scale(0.95); }
  to   { opacity: 0.7; transform: scale(1.05); }
}

/* ─── Close Button ──────────────────────────────────────────── */
.modal-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.2s;
  &:hover { color: rgba(255, 255, 255, 0.85); }
}

/* ─── Icon ──────────────────────────────────────────────────── */
.modal-icon-wrap {
  display: flex;
  justify-content: center;
  padding-top: 44px;
  padding-bottom: 8px;
  position: relative;
  z-index: 1;
}
.modal-icon-ring {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--accent-light);
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 32px var(--accent-glow);
  animation: ring-pulse 2.5s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% { box-shadow: 0 0 24px var(--accent-glow); }
  50%       { box-shadow: 0 0 48px var(--accent-glow), 0 0 80px rgba(0,0,0,0.1); }
}

.modal-main-icon {
  color: var(--accent);
}

/* ─── Body ──────────────────────────────────────────────────── */
.modal-body {
  position: relative;
  z-index: 1;
  padding: 20px 32px 8px;
  text-align: center;
}

.modal-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  background: var(--accent-light);
  color: var(--accent);
  border: 1px solid var(--accent);
  margin-bottom: 14px;
}

.modal-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  margin: 0 0 10px;
}

.modal-description {
  font-size: 15px;
  line-height: 1.6;
  color: #fff;
  font-weight: 500;
  margin: 0 0 12px;
}

.modal-description-secondary {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 18px;
}

/* ─── Plan chip ─────────────────────────────────────────────── */
.plan-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

/* ─── Actions ───────────────────────────────────────────────── */
.modal-actions {
  position: relative;
  z-index: 1;
  padding: 16px 32px 32px;
  text-align: center;
}

.renew-btn {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #000;
  background: var(--accent) !important;
  box-shadow: 0 8px 24px var(--accent-glow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px var(--accent-glow);
    filter: brightness(1.1);
  }
  &:active {
    transform: scale(0.98);
  }
}

.dismiss-hint {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  line-height: 1.5;
}

.block-hint {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* ─── Light mode overrides ──────────────────────────────────── */
body:not(.body--dark) {
  .expiration-modal {
    background: #ffffff;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.2);
  }
  .modal-title { color: #0f172a; }
  .modal-description { color: #1e293b; }
  .modal-description-secondary { color: rgba(0, 0, 0, 0.55); }
  .plan-chip {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.5);
  }

  .dismiss-hint { color: rgba(0, 0, 0, 0.35); }
  .block-hint { color: rgba(0, 0, 0, 0.45); }
  .renew-btn { color: #fff !important; }
  .modal-close-btn { color: rgba(0, 0, 0, 0.4); &:hover { color: rgba(0,0,0,0.8); } }
}
</style>
