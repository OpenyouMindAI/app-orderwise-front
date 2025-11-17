<template>
  <div>
    <q-dialog v-model="showDialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card flat class="fullscreen-pricing">
        <!-- Close Button -->
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          class="close-btn-fixed"
        />

        <!-- Content Container -->
        <div class="pricing-content">
          <!-- Header -->
          <div class="pricing-header">
            <div class="text-h4 text-weight-bold text-center q-mb-sm">
              Elige tu plan
            </div>
            <div class="text-subtitle1 text-center text-grey-7 q-mb-lg">
              Selecciona el plan que mejor se adapte a tus necesidades
            </div>
          </div>

          <!-- Plans Grid -->
          <div class="pricing-grid">
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="plan-wrapper"
            >
              <div
                :class="[
                  'pricing-card',
                  {
                    'pricing-card-featured': plan.slug === 'pro',
                    'pricing-card-current': isCurrentPlan(plan)
                  }
                ]"
              >
                <!-- Plan Name -->
                <div class="card-plan-name">{{ plan.name }}</div>

                <!-- Price -->
                <div class="card-price">
                  <span v-if="plan.price === 0" class="price-value">$0</span>
                  <template v-else>
                    <span class="price-value">${{ plan.price }}</span>
                  </template>
                  <span class="price-period">/ Month</span>
                </div>

                <div class="card-subtitle">{{ plan.description }}</div>

                <!-- CTA Button -->
                <q-btn
                  unelevated
                  :color="plan.slug === 'pro' ? 'white' : 'primary'"
                  :text-color="plan.slug === 'pro' ? 'primary' : 'white'"
                  :label="getActionLabel(plan)"
                  :class="['full-width', 'card-cta-btn', plan.slug === 'pro' ? 'btn-featured' : '']"
                  @click="selectPlan(plan)"
                  :loading="loading"
                  :disable="isCurrentPlan(plan) || plan.slug === 'free'"
                />

                <!-- Features List -->
                <div class="card-features">
                  <div
                    v-for="(feature, index) in plan.features"
                    :key="index"
                    class="card-feature-item"
                  >
                    <q-icon name="check_circle" size="18px" :color="plan.slug === 'pro' ? 'white' : 'positive'" />
                    <span>{{ feature }}</span>
                  </div>
                </div>

                <!-- Pro Team Branch Pricing -->
                <div v-if="plan.slug === 'pro_team'" class="branch-pricing">
                  <div class="branch-pricing-label">
                    Sucursales adicionales: ${{ plan.price_per_branch }}/mes c/u
                  </div>
                  <q-input
                    v-model.number="branchCount"
                    type="number"
                    min="1"
                    dense
                    filled
                    label="Número de sucursales"
                    @update:model-value="calculateProTeamPrice(plan)"
                  >
                    <template v-slot:prepend>
                      <q-icon name="store" size="18px" />
                    </template>
                  </q-input>
                  <div class="branch-pricing-total">
                    Total: ${{ proTeamTotalPrice }}/mes
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

    <!-- Cancel Confirmation Dialog -->
    <q-dialog v-model="showCancelDialog">
      <q-card style="min-width: 400px;">
        <q-card-section>
          <div class="text-h6">¿Cancelar Suscripción?</div>
        </q-card-section>

        <q-card-section>
          <p>¿Está seguro que desea cancelar su suscripción?</p>
          <p class="text-caption text-grey-7">
            Su plan actual permanecerá activo hasta la fecha de vencimiento.
            Después de eso, su cuenta será cambiada al plan Free.
          </p>
          <q-input
            v-model="cancellationReason"
            type="textarea"
            label="Motivo de cancelación (opcional)"
            outlined
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="No, mantener" color="primary" v-close-popup />
          <q-btn
            unelevated
            label="Sí, cancelar"
            color="negative"
            @click="cancelSubscription"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { date } from 'quasar'

export default {
  name: 'SubscriptionPlansDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'subscription-updated'],
  setup (props, { emit }) {
    const plans = ref([])
    const currentSubscription = ref(null)
    const loading = ref(false)
    const branchCount = ref(1)
    const proTeamTotalPrice = ref(0)
    const showCancelDialog = ref(false)
    const cancellationReason = ref('')

    const showDialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const daysLeft = computed(() => {
      if (!currentSubscription.value) return 0
      const end = new Date(currentSubscription.value.end_date)
      const now = new Date()
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
      return Math.max(0, diff)
    })

    const isCurrentPlan = (plan) => {
      if (!currentSubscription.value) return plan.slug === 'free'
      return currentSubscription.value.plan.id === plan.id
    }

    const canUpgrade = (plan) => {
      if (plan.slug === 'free') return false
      if (!currentSubscription.value) return true

      const currentPlanOrder = { free: 0, pro: 1, pro_team: 2 }
      const currentOrder = currentPlanOrder[currentSubscription.value.plan.slug] || 0
      const targetOrder = currentPlanOrder[plan.slug] || 0

      return targetOrder > currentOrder
    }

    const getActionLabel = (plan) => {
      if (!currentSubscription.value) return 'Comenzar'
      return 'Actualizar Plan'
    }

    const formatDate = (dateStr) => {
      return date.formatDate(dateStr, 'DD/MM/YYYY')
    }

    const calculateProTeamPrice = (plan) => {
      if (plan.slug === 'pro_team') {
        const additionalBranches = Math.max(0, branchCount.value - 1)
        proTeamTotalPrice.value = parseFloat(plan.price) + (additionalBranches * parseFloat(plan.price_per_branch))
      }
    }

    const loadPlans = async () => {
      try {
        const { data } = await api.get('subscription-plans')
        plans.value = data

        // Calcular precio inicial de Pro Team
        const proTeamPlan = plans.value.find(p => p.slug === 'pro_team')
        if (proTeamPlan) {
          calculateProTeamPrice(proTeamPlan)
        }
      } catch (error) {
        notify(error.message || 'Error al cargar planes', 'negative', 'warning')
      }
    }

    const loadCurrentSubscription = async () => {
      try {
        const { data } = await api.get('subscriptions/current')
        currentSubscription.value = data.subscription

        if (data.subscription && data.subscription.branch_offices_count) {
          branchCount.value = data.subscription.branch_offices_count
        }
      } catch (error) {
        console.error('Error loading subscription:', error)
      }
    }

    const selectPlan = async (plan) => {
      // Si el plan es Free, no requiere pago
      if (plan.slug === 'free') {
        notify('El plan Free no requiere pago', 'info', 'info')
        return
      }

      loading.value = true
      try {
        console.log('Creating payment link for plan:', plan.name)

        // Crear link de pago con Mercado Pago
        const response = await api.post('mercadopago/create-payment', {
          subscription_plan_id: plan.id,
          branch_offices_count: plan.slug === 'pro_team' ? branchCount.value : 1,
          months: 1
        })

        console.log('Payment link response:', response.data)

        // Redirigir a Mercado Pago
        if (response.data.init_point) {
          notify('Redirigiendo a Mercado Pago...', 'info', 'payment')

          // Usar sandbox en desarrollo, producción en producción
          const paymentUrl = process.env.NODE_ENV === 'production'
            ? response.data.init_point
            : response.data.sandbox_init_point

          console.log('Opening payment URL:', paymentUrl)

          // Abrir en nueva ventana
          window.open(paymentUrl, '_blank')

          // Cerrar el diálogo
          showDialog.value = false
        } else {
          console.error('No init_point in response:', response.data)
          notify('Error: No se recibió el link de pago', 'negative', 'warning')
        }
      } catch (error) {
        console.error('Error creating payment link:', error)
        console.error('Error response:', error.response?.data)
        notify(error.response?.data?.message || 'Error al crear el link de pago', 'negative', 'warning')
      } finally {
        loading.value = false
      }
    }

    const cancelSubscription = async () => {
      loading.value = true
      try {
        await api.post('subscriptions/cancel', {
          reason: cancellationReason.value
        })

        notify('Suscripción cancelada exitosamente', 'positive', 'check_circle')
        showCancelDialog.value = false
        cancellationReason.value = ''

        await loadCurrentSubscription()
        emit('subscription-updated', null)
      } catch (error) {
        notify(error.response?.data?.message || 'Error al cancelar suscripción', 'negative', 'warning')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadPlans()
      loadCurrentSubscription()
    })

    return {
      showDialog,
      plans,
      currentSubscription,
      loading,
      branchCount,
      proTeamTotalPrice,
      showCancelDialog,
      cancellationReason,
      daysLeft,
      isCurrentPlan,
      canUpgrade,
      getActionLabel,
      formatDate,
      calculateProTeamPrice,
      selectPlan,
      cancelSubscription
    }
  }
}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.fullscreen-pricing {
  background: #fafafa;
  height: 100vh;
  overflow-y: auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.close-btn-fixed {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
}

.pricing-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 40px;
}

.pricing-header {
  margin-bottom: 40px;

  .text-h4 {
    font-family: 'Inter', sans-serif;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .text-subtitle1 {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-card {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &.pricing-card-featured {
    background: var(--q-primary);
    color: white;
    transform: scale(1.05);
    box-shadow: 0 8px 32px rgba(var(--q-primary-rgb), 0.3);

    .card-plan-name,
    .price-value,
    .card-subtitle,
    .card-feature-item {
      color: white;
    }

    .price-period {
      color: rgba(255, 255, 255, 0.8);
    }

    &:hover {
      transform: scale(1.05) translateY(-4px);
    }
  }

  &.pricing-card-current {
    border: 2px solid var(--q-primary);
  }
}

.card-plan-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
}

.card-price {
  text-align: center;
  margin-bottom: 8px;
}

.price-value {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  font-family: 'Inter', sans-serif;
  letter-spacing: -1.5px;
}

.price-period {
  font-size: 15px;
  color: #666;
  margin-left: 4px;
  font-weight: 500;
}

.card-subtitle {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  min-height: 40px;
  font-weight: 400;
  line-height: 1.4;
}

.card-cta-btn {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  margin-bottom: 24px;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
    transform: translateY(-1px);
  }

  &.btn-featured {
    box-shadow: 0 2px 12px rgba(255, 255, 255, 0.3) !important;

    &:hover:not(:disabled) {
      box-shadow: 0 4px 16px rgba(255, 255, 255, 0.4) !important;
    }
  }
}

.card-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
}

.plan-card-modern {
  position: relative;
  height: 100%;
  padding: 20px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: #999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  &.plan-card-current {
    border: 1.5px solid var(--q-primary);
    background: rgba(var(--q-primary-rgb), 0.02);
  }

  &.plan-card-popular {
    border: 1.5px solid #000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.popular-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 10px;
  background: #000;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  letter-spacing: 0.3px;
}

.plan-header {
  margin-bottom: 16px;
}

.plan-name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.plan-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.plan-price {
  margin-bottom: 16px;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-currency {
  font-size: 18px;
  font-weight: 600;
  color: #000;
}

.price-amount {
  font-size: 32px;
  font-weight: 700;
  color: #000;
  line-height: 1;
}

.price-period {
  font-size: 13px;
  color: #666;
  margin-left: 2px;
}

.plan-features {
  flex: 1;
  margin-bottom: 16px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}

.feature-icon {
  color: #000;
  margin-top: 1px;
  flex-shrink: 0;
}

.branch-pricing {
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e5e5;
}

.branch-pricing-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.branch-pricing-total {
  font-size: 14px;
  font-weight: 600;
  color: var(--q-primary);
  margin-top: 6px;
}

.plan-action {
  margin-top: auto;
}

.action-btn {
  height: 36px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.2px;
  text-transform: none;
}

.cancel-section {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #e5e5e5;
}

.cancel-btn {
  text-transform: none;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}
</style>
