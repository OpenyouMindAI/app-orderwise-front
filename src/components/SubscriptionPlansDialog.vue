<template>
  <div>
    <q-dialog v-model="showDialog" persistent :maximized="isMobile" transition-show="slide-up" transition-hide="slide-down">
      <q-card flat class="futuristic-pricing">
        <!-- Close Button -->
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          class="close-btn"
        />

        <!-- Animated Background -->
        <div class="bg-gradient"></div>

        <!-- Content Container -->
        <div class="pricing-container">
          <!-- Header -->
          <div class="pricing-header">
            <div class="header-title">
              Elige tu plan
            </div>
            <div class="header-subtitle">
              Selecciona el plan que mejor se adapte a tus necesidades
            </div>
          </div>

          <!-- Plans Grid -->
          <div class="plans-grid">
            <!-- Skeleton Loading -->
            <template v-if="loadingPlans">
              <div v-for="n in 2" :key="'skeleton-' + n" class="plan-card plan-skeleton">
                <q-skeleton height="24px" width="60%" class="q-mb-md" />
                <q-skeleton height="16px" width="80%" class="q-mb-lg" />
                <q-skeleton height="48px" width="100%" class="q-mb-lg" />
                <q-skeleton height="16px" width="100%" class="q-mb-sm" />
                <q-skeleton height="16px" width="100%" class="q-mb-sm" />
                <q-skeleton height="16px" width="100%" class="q-mb-sm" />
                <q-skeleton height="16px" width="100%" class="q-mb-lg" />
                <q-skeleton height="40px" width="100%" />
              </div>
            </template>

            <!-- Plans Cards -->
            <div
              v-else
              v-for="plan in plans.filter(p => p.slug?.toLowerCase() !== 'free')"
              :key="plan.id"
              :class="[
                'plan-card',
                {
                  'plan-featured': plan.slug?.toLowerCase()?.toLowerCase() === 'pro',
                  'plan-current': isCurrentPlan(plan)
                }
              ]"
            >
              <!-- Featured Badge -->
              <div v-if="plan.slug?.toLowerCase() === 'pro'" class="featured-badge">
                <q-icon name="star" size="14px" />
                <span>Más Popular</span>
              </div>

              <!-- Current Badge -->
              <div v-if="isCurrentPlan(plan)" class="current-badge">
                <q-icon name="check_circle" size="14px" />
                <span>Plan Actual</span>
              </div>

              <!-- Plan Header -->
              <div class="plan-header">
                <div class="plan-name">{{ plan.name }}</div>
                <div class="plan-description">{{ plan.description }}</div>
              </div>

              <!-- Price -->
              <div class="plan-price">
                <div class="price-wrapper">
                  <span v-if="plan.price === 0" class="price-amount">Gratis</span>
                  <template v-else>
                    <span class="price-currency">{{ getPlanCurrencySymbol(plan) }}</span>
                    <span class="price-amount">{{ getPlanLocalPrice(plan) }}</span>
                    <span class="price-period">/mes</span>
                  </template>
                </div>
              </div>

              <!-- Features -->
              <div class="plan-features">
                <div
                  v-for="(feature, index) in plan.features"
                  :key="index"
                  class="feature-item"
                >
                  <q-icon name="check" size="16px" class="feature-icon" />
                  <span>{{ feature }}</span>
                </div>
              </div>

              <!-- Pro Team Branch Pricing -->
              <div v-if="plan.slug?.toLowerCase() === 'pro_team'" class="branch-config">
                <div class="branch-divider"></div>
                <div class="branch-label">
                  Sucursales adicionales: ${{ plan.price_per_branch }}/mes
                </div>
                <div class="branch-current-info">
                  <q-icon name="info" size="14px" color="primary" />
                  <span>Actualmente tienes {{ currentBranchCount }} sucursal{{ currentBranchCount > 1 ? 'es' : '' }}</span>
                </div>
                <div class="branch-input-wrapper">
                  <q-btn
                    v-if="branchCount > currentBranchCount"
                    flat
                    dense
                    round
                    icon="remove"
                    color="negative"
                    @click="decrementBranch(plan)"
                    class="branch-btn"
                  >
                    <q-tooltip>Disminuir sucursales</q-tooltip>
                  </q-btn>
                  <q-input
                    v-model.number="branchCount"
                    type="number"
                    :min="currentBranchCount"
                    outlined
                    dense
                    readonly
                    :label="`Número de sucursales (mín: ${currentBranchCount})`"
                    class="branch-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="store" size="18px" />
                    </template>
                  </q-input>
                  <q-btn
                    flat
                    dense
                    round
                    icon="add"
                    color="positive"
                    @click="incrementBranch(plan)"
                    class="branch-btn"
                  >
                    <q-tooltip>Agregar sucursales</q-tooltip>
                  </q-btn>
                </div>
                <div class="branch-total">
                  Total: {{ getPlanCurrencySymbol(plan) }}{{ proTeamTotalPrice }}/mes
                </div>
              </div>

              <!-- Action Button -->
              <q-btn
                unelevated
                no-caps
                :label="getActionLabel(plan)"
                :class="['action-btn', plan.slug?.toLowerCase() === 'pro' ? 'action-btn-featured' : '']"
                @click="selectPlan(plan)"
                :loading="loading"
                :disable="isCurrentPlan(plan) || plan.slug?.toLowerCase() === 'free'"
              />
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
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'
import { formatNumber, notify } from 'src/const/mixins'
import { useFbq } from 'vue3-facebook-pixel'

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
    const $q = useQuasar()
    const fbq = useFbq()
    const plans = ref([])
    const currentSubscription = ref(null)
    const loading = ref(false)
    const loadingPlans = ref(true)
    const branchCount = ref(1)
    const currentBranchCount = ref(1)
    const proTeamTotalPrice = ref(0)
    const pricingByPlan = ref({})
    const showCancelDialog = ref(false)
    const cancellationReason = ref('')

    const showDialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const isMobile = computed(() => $q.screen.lt.sm)

    const daysLeft = computed(() => {
      if (!currentSubscription.value) return 0
      const end = new Date(currentSubscription.value.end_date)
      const now = new Date()
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
      return Math.max(0, diff)
    })

    const isCurrentPlan = (plan) => {
      if (!currentSubscription.value) return plan.slug?.toLowerCase() === 'free'
      return currentSubscription.value.plan.id === plan.id
    }

    const canUpgrade = (plan) => {
      if (plan.slug?.toLowerCase() === 'free') return false
      if (!currentSubscription.value) return true

      const currentPlanOrder = { free: 0, pro: 1, pro_team: 2 }
      const currentOrder = currentPlanOrder[currentSubscription.value.plan.slug?.toLowerCase()] || 0
      const targetOrder = currentPlanOrder[plan.slug?.toLowerCase()] || 0

      return targetOrder > currentOrder
    }

    const getActionLabel = (plan) => {
      if (!currentSubscription.value) return 'Comenzar'
      return 'Actualizar Plan'
    }

    const formatDate = (dateStr) => {
      return date.formatDate(dateStr, 'DD/MM/YYYY')
    }

    const getPlanPricing = (plan) => pricingByPlan.value[plan.id] || null

    const getPlanLocalPrice = (plan) => {
      const pricing = getPlanPricing(plan)
      if (pricing && pricing.total_price_local) {
        return formatNumber(pricing.total_price_local)
      }
      return formatNumber(plan.price)
    }

    const getPlanUsdPrice = (plan) => {
      const pricing = getPlanPricing(plan)
      const value = pricing && pricing.total_price_usd ? pricing.total_price_usd : plan.price
      return formatNumber(value)
    }

    const getPlanCurrencySymbol = (plan) => {
      const pricing = getPlanPricing(plan)
      return pricing && pricing.local_currency_symbol ? pricing.local_currency_symbol : '$'
    }

    const hasExchangeInfo = (plan) => {
      const pricing = getPlanPricing(plan)
      return !!(pricing && pricing.exchange_rate && pricing.local_currency_code)
    }

    const getExchangeRate = (plan) => {
      const pricing = getPlanPricing(plan)
      return pricing ? formatNumber(pricing.exchange_rate) : null
    }

    const getLocalCurrencyCode = (plan) => {
      const pricing = getPlanPricing(plan)
      return pricing ? pricing.local_currency_code : null
    }

    const fetchAllPricing = async (branches) => {
      try {
        const { data } = await api.post('subscription-plans/calculate-all-prices', {
          branch_count: branches
        })
        return data
      } catch (error) {
        console.error('Error fetching pricing', error)
        return null
      }
    }

    const incrementBranch = async (plan) => {
      branchCount.value++
      await calculateProTeamPrice(plan)
    }

    const decrementBranch = async (plan) => {
      if (branchCount.value > currentBranchCount.value) {
        branchCount.value--
        await calculateProTeamPrice(plan)
      }
    }

    const calculateProTeamPrice = async (plan) => {
      if (plan.slug?.toLowerCase() !== 'pro_team') return

      // Recalcular todos los precios con el nuevo branch count
      const pricingData = await fetchAllPricing(branchCount.value)

      if (pricingData && pricingData.pricing) {
        pricingByPlan.value = pricingData.pricing

        if (pricingByPlan.value[plan.id]) {
          const pricing = pricingByPlan.value[plan.id]
          proTeamTotalPrice.value = pricing.total_price_local
            ? formatNumber(pricing.total_price_local)
            : formatNumber(pricing.total_price_usd)
        }
      }
    }

    const loadPlans = async () => {
      loadingPlans.value = true
      try {
        const { data } = await api.get('subscription-plans')
        plans.value = data

        // Cargar todos los precios en una sola petición
        const pricingData = await fetchAllPricing(branchCount.value)

        if (pricingData && pricingData.pricing) {
          pricingByPlan.value = pricingData.pricing

          // Actualizar precio total de Pro Team
          const proTeamPlan = plans.value.find(p => p.slug?.toLowerCase() === 'pro_team')
          if (proTeamPlan && pricingByPlan.value[proTeamPlan.id]) {
            const pricing = pricingByPlan.value[proTeamPlan.id]
            proTeamTotalPrice.value = pricing.total_price_local
              ? formatNumber(pricing.total_price_local)
              : formatNumber(pricing.total_price_usd)
          }
        }
      } catch (error) {
        notify(error.message || 'Error al cargar planes', 'negative', 'warning')
      } finally {
        loadingPlans.value = false
      }
    }

    const loadCurrentSubscription = async () => {
      try {
        const { data } = await api.get('subscriptions/current')
        currentSubscription.value = data.subscription

        if (data.subscription && data.subscription.branch_offices_count) {
          const currentBranches = data.subscription.branch_offices_count
          branchCount.value = currentBranches
          currentBranchCount.value = currentBranches

          // Recalcular precios con el branch count actual
          const pricingData = await fetchAllPricing(branchCount.value)
          if (pricingData && pricingData.pricing) {
            pricingByPlan.value = pricingData.pricing

            const proTeamPlan = plans.value.find(p => p.slug === 'pro_team')
            if (proTeamPlan && pricingByPlan.value[proTeamPlan.id]) {
              const pricing = pricingByPlan.value[proTeamPlan.id]
              proTeamTotalPrice.value = pricing.total_price_local
                ? formatNumber(pricing.total_price_local)
                : formatNumber(pricing.total_price_usd)
            }
          }
        }
      } catch (error) {
        console.error('Error loading subscription:', error)
      }
    }

    /**
     * Iniciar proceso de pago con Mercado Pago Checkout Pro
     * @param {Object} plan - Plan de suscripción seleccionado
     */
    const selectPlan = async (plan) => {
      // Si el plan es Free, no requiere pago
      if (plan.slug?.toLowerCase() === 'free') {
        notify('El plan Free no requiere pago', 'info', 'info')
        return
      }

      loading.value = true

      try {
        // Crear link de pago con Checkout Pro
        const response = await api.post('mercadopago/create-payment', {
          subscription_plan_id: plan.id,
          branch_offices_count: plan.slug?.toLowerCase() === 'pro_team' ? branchCount.value : 1,
          months: 1
        })

        // Pixel Event: Initiate Checkout
        const pricing = getPlanPricing(plan)
        const value = pricing && pricing.total_price_local ? pricing.total_price_local : plan.price
        const currency = pricing && pricing.local_currency_code ? pricing.local_currency_code : 'ARS'

        if (fbq?.event) {
          fbq.event('InitiateCheckout', {
            content_name: plan.name,
            currency,
            value
          })
        }

        // Validar respuesta
        if (!response.data.init_point) {
          throw new Error('No se recibió URL de pago de Mercado Pago')
        }

        // Usar init_point directamente
        const paymentUrl = response.data.init_point

        // Guardar preference_id en localStorage para tracking
        localStorage.setItem('mp_preference_id', response.data.preference_id)
        localStorage.setItem('mp_plan_id', plan.id)
        localStorage.setItem('mp_plan_name', plan.name)

        // Notificar al usuario
        notify('Redirigiendo a Mercado Pago...', 'info', 'payment')

        // Esperar un momento para que el usuario vea la notificación
        await new Promise(resolve => setTimeout(resolve, 500))

        // Redirigir a Mercado Pago
        window.location.href = paymentUrl
      } catch (error) {
        // Manejo específico de errores
        let errorMessage = 'Error al crear el link de pago'

        if (error.response) {
          // Error de respuesta del servidor
          const { status, data } = error.response

          if (status === 400) {
            errorMessage = data.message || 'Datos de pago inválidos'
          } else if (status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente'
          } else if (status === 500) {
            errorMessage = 'Error del servidor. Por favor, intenta nuevamente'
          } else if (data.details) {
            errorMessage = `Error de Mercado Pago: ${JSON.stringify(data.details)}`
          }
        } else if (error.request) {
          // Error de red
          errorMessage = 'Error de conexión. Verifica tu internet'
        }

        notify(errorMessage, 'negative', 'warning')
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
      isMobile,
      plans,
      currentSubscription,
      loading,
      loadingPlans,
      branchCount,
      currentBranchCount,
      proTeamTotalPrice,
      showCancelDialog,
      cancellationReason,
      daysLeft,
      isCurrentPlan,
      canUpgrade,
      getActionLabel,
      formatDate,
      incrementBranch,
      decrementBranch,
      calculateProTeamPrice,
      getPlanLocalPrice,
      getPlanCurrencySymbol,
      getPlanUsdPrice,
      hasExchangeInfo,
      getExchangeRate,
      getLocalCurrencyCode,
      selectPlan,
      cancelSubscription
    }
  }
}
</script>

<style lang="scss" scoped>
.futuristic-pricing {
  position: relative;
  background: #1a1a1a;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 16px;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0 16px 16px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    transition: background 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}

.q-dark .futuristic-pricing {
  background: #1a1a1a;
}

body:not(.q-dark) .futuristic-pricing {
  background: #f8f9fa;

  /* Custom Scrollbar Light Mode */
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  opacity: 0.1;
  pointer-events: none;
  z-index: 0;
  border-radius: 16px 16px 0 0;
}

body:not(.q-dark) .bg-gradient {
  opacity: 0.05;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  color: white;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
}

body:not(.q-dark) .close-btn {
  background: rgba(255, 255, 255, 0.8);
  color: #1a1a1a;

  &:hover {
    background: rgba(255, 255, 255, 1);
  }
}

.pricing-container {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 24px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 20px;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -1.5px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: white;
}

body:not(.q-dark) .header-title {
  color: #1a1a1a;
  -webkit-text-fill-color: #1a1a1a;
  background: none;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.7;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
}

body:not(.q-dark) .header-subtitle {
  color: rgba(0, 0, 0, 0.6);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  max-width: 100%;
  margin: 0 auto;
}

.plan-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  color: white;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
}

body:not(.q-dark) .plan-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  color: #1a1a1a;

  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }

  &.plan-featured {
    background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
    border: 2px solid transparent;
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(var(--q-primary-rgb), 0.4);

    .plan-name,
    .plan-description,
    .price-currency,
    .price-amount,
    .price-period,
    .feature-item {
      color: white;
    }

    .feature-icon {
      color: white;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 48px rgba(var(--q-primary-rgb), 0.5);
    }
  }

  &.plan-current {
    border: 2px solid var(--q-primary);
    box-shadow: 0 0 40px rgba(var(--q-primary-rgb), 0.3);
  }
}

.featured-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.current-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--q-primary);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.3px;
}

.plan-header {
  margin-bottom: 16px;
}

.plan-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.plan-description {
  font-size: 13px;
  opacity: 0.7;
  line-height: 1.5;
}

.plan-price {
  margin-bottom: 16px;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-currency {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.8;
}

.price-amount {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1;
}

.price-period {
  font-size: 14px;
  opacity: 0.6;
  margin-left: 4px;
}

.plan-features {
  margin-bottom: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.9;
}

.feature-icon {
  margin-top: 2px;
  flex-shrink: 0;
  color: var(--q-primary);

  .plan-featured & {
    color: white;
  }
}

.branch-config {
  margin-bottom: 20px;
}

.branch-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
}

body:not(.q-dark) .branch-divider {
  background: rgba(0, 0, 0, 0.08);
}

.branch-label {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 10px;
}

.branch-current-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 8px 12px;
  background: rgba(var(--q-primary-rgb), 0.1);
  border-radius: 8px;
  margin-bottom: 12px;
  color: var(--q-primary);
}

body:not(.q-dark) .branch-current-info {
  background: rgba(var(--q-primary-rgb), 0.08);
}

.branch-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.branch-input {
  flex: 1;
}

.branch-btn {
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

.branch-total {
  font-size: 14px;
  font-weight: 600;
  color: var(--q-primary);
}

.action-btn {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  background: var(--q-primary);
  color: white;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--q-primary-rgb), 0.4);
  }

  &.action-btn-featured {
    background: white;
    color: var(--q-primary);

    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .futuristic-pricing {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .bg-gradient {
    border-radius: 0;
  }

  .pricing-container {
    padding: 16px;
  }

  .header-title {
    font-size: 24px;
  }

  .header-subtitle {
    font-size: 13px;
  }

  .plans-grid {
    gap: 12px;
  }

  .plan-card {
    padding: 16px 20px;
  }

  .plan-card.plan-featured {
    transform: scale(1);

    &:hover {
      transform: translateY(-4px);
    }
  }

  .price-amount {
    font-size: 28px;
  }
}

/* Skeleton Styles */
.plan-skeleton {
  pointer-events: none;

  &:hover {
    transform: none;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }
}

body:not(.q-dark) .plan-skeleton {
  &:hover {
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  }
}
</style>
