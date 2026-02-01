<template>
  <div>
    <q-dialog v-model="showDialog" persistent :maximized="isMobile" transition-show="slide-up" transition-hide="slide-down">
      <q-card flat class="modern-pricing" :dark="$q.dark.isActive">
        <!-- Close Button -->
        <q-btn
          v-if="!mustSelectPlan"
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

            <!-- Billing Toggle -->
            <div class="billing-toggle-wrapper">
              <div
                :class="['billing-toggle', { 'dark-mode': $q.dark.isActive }]"
              >
                <button
                  :class="['toggle-btn', { active: !isAnnual }]"
                  @click="isAnnual = false"
                >
                  Monthly
                </button>
                <button
                  :class="['toggle-btn', { active: isAnnual }]"
                  @click="isAnnual = true"
                >
                  Annual
                  <span class="discount-badge">50% OFF</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Plans Grid -->
          <div class="plans-grid">
            <!-- Skeleton Loading -->
            <template v-if="loadingPlans">
              <div v-for="n in 3" :key="'skeleton-' + n" class="plan-card plan-skeleton">
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
                'plan-featured plan-card',
                {
                  'plan-current': isCurrentPlan(plan)
                }
              ]"
              :style="getDynamicCardStyle(plan)"
            >
              <!-- Card Header / Badge Area -->
              <div
                class="plan-header-badge"
              >
                <template v-if="plan.badge_text">
                  {{ plan.badge_text }}
                </template>
              </div>

              <!-- Inner Content (Dark Area) -->
              <div
                class="plan-inner"
                :style="{ color: plan.text_color || '#fff' }"
              >
                <!-- Current Badge (Inside) -->
                <div v-if="isCurrentPlan(plan)" class="current-badge-inner">
                  <q-icon name="check_circle" size="14px" />
                  <span>Plan Actual</span>
                </div>

                <!-- Plan Header -->
                <div class="plan-header">
                  <div class="plan-name-row">
                    <div class="plan-name">{{ plan.name }}</div>
                    <div v-if="isAnnual && hasAnnualPrice(plan)" class="discount-pill-small">
                      50% OFF
                    </div>
                  </div>
                  <div class="plan-description">{{ plan.description }}</div>
                </div>

                <!-- Price -->
                <div class="plan-price">
                  <template v-if="plan.price === 0">
                    <div class="price-wrapper">
                      <span class="price-amount">$0</span>
                      <span class="price-period">/month</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="price-wrapper">
                      <span v-if="isAnnual && hasAnnualPrice(plan)" class="old-price-strikethrough">
                        {{ getPlanCurrencySymbol(plan) }}{{ getPlanLocalPrice(plan) }}
                      </span>
                      <span class="price-currency">{{ getPlanCurrencySymbol(plan) }}</span>
                      <span class="price-amount">{{ getDisplayPrice(plan) }}</span>
                      <span class="price-period">/month</span>
                    </div>

                    <div v-if="isAnnual && hasAnnualPrice(plan)" class="billing-note">
                      Billed ${{ getPlanAnnualPrice(plan) }} for 12 months
                    </div>
                  </template>
                </div>

                <!-- Select Button -->
                <q-btn
                  unelevated
                  no-caps
                  :label="getActionLabel(plan)"
                  class="action-btn-new"
                  :style="plan.btn_color ? { backgroundColor: plan.btn_color, color: '#fff' } : {}"
                  @click="selectPlan(plan)"
                  :loading="loading"
                  :disable="isCurrentPlan(plan) || plan.slug?.toLowerCase() === 'free'"
                />

                <!-- Save Badge (Green style from image) -->
                <div v-if="isAnnual && hasAnnualPrice(plan)" class="save-badge-new">
                  <q-icon name="local_offer" size="14px" class="q-mr-xs" />
                  Ahorra ${{ getAnnualSavings(plan) }}
                </div>

                <!-- Features -->
                <div class="plan-features">
                  <template v-if="plan.features && plan.features.length > 0">
                    <template v-if="typeof plan.features[0] === 'object'">
                      <div v-for="(group, gIdx) in plan.features" :key="gIdx" class="feature-group">
                        <div class="feature-group-title">{{ group.title }}</div>
                        <div
                          v-for="(item, iIdx) in group.items"
                          :key="iIdx"
                          class="feature-item"
                        >
                          <q-icon name="check" size="16px" class="feature-icon" />
                          <span>{{ item }}</span>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div
                        v-for="(feature, index) in plan.features"
                        :key="index"
                        class="feature-item"
                      >
                        <q-icon name="check" size="16px" class="feature-icon" />
                        <span>{{ feature }}</span>
                      </div>
                    </template>
                  </template>
                </div>

                <!-- Limits -->
                <div v-if="plan.max_users || plan.max_branch_offices || plan.max_cashboxes" class="plan-limits">
                  <div class="limits-divider"></div>
                  <div class="limits-grid">
                    <div v-if="plan.max_users" class="limit-item">
                      <q-icon name="people" size="16px" />
                      <span>{{ plan.max_users }} users</span>
                    </div>
                    <div v-if="plan.max_branch_offices" class="limit-item">
                      <q-icon name="storefront" size="16px" />
                      <span>{{ plan.max_branch_offices }} branches</span>
                    </div>
                  </div>
                </div>

                <!-- Pro Team Branch Config -->
                <div v-if="plan.slug?.toLowerCase() === 'pro_team'" class="branch-config-compact">
                  <div class="branch-divider"></div>
                  <div class="branch-input-wrapper-compact">
                    <q-btn flat dense round icon="remove" @click="decrementBranch(plan)" size="sm" />
                    <div class="branch-count-text">{{ branchCount }} sucursales</div>
                    <q-btn flat dense round icon="add" @click="incrementBranch(plan)" size="sm" />
                  </div>
                  <div class="branch-total-compact">
                    Total: {{ getPlanCurrencySymbol(plan) }}{{ proTeamTotalPrice }}/mes
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
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'
import { formatNumber, notify } from 'src/const/mixins'
import { usePixel } from 'src/composables/usePixel'
import { authentication } from 'src/stores/module-authentication'

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
    const store = authentication()
    const $q = useQuasar()
    const fbq = usePixel()

    /**
     * List of subscription plans
     * @type {Array}
     */
    const plans = ref([])

    /**
     * Current active subscription
     * @type {Object|null}
     */
    const currentSubscription = ref(null)

    /**
     * Loading state for API operations
     * @type {boolean}
     */
    const loading = ref(false)

    /**
     * Loading state for plans fetch
     * @type {boolean}
     */
    const loadingPlans = ref(true)

    /**
     * Branch count for Pro Team plan
     * @type {number}
     */
    const branchCount = ref(1)

    /**
     * Current branch count in subscription
     * @type {number}
     */
    const currentBranchCount = ref(1)

    /**
     * Calculated total price for Pro Team
     * @type {number}
     */
    const proTeamTotalPrice = ref(0)

    /**
     * Pricing information per plan
     * @type {Object}
     */
    const pricingByPlan = ref({})

    /**
     * Cancel dialog visibility
     * @type {boolean}
     */
    const showCancelDialog = ref(false)

    /**
     * Cancellation reason text
     * @type {string}
     */
    const cancellationReason = ref('')

    /**
     * Billing period toggle (monthly/annual)
     * @type {boolean}
     */
    const isAnnual = ref(false)

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
      if (!currentSubscription.value) return 'Seleccionar  Plan'
      return 'Seleccionar  Plan'
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

    const getPlanAnnualLocalPrice = (plan) => {
      const pricing = getPlanPricing(plan)
      if (pricing && pricing.total_price_year_local) {
        return formatNumber(pricing.total_price_year_local)
      }
      return formatNumber(plan.price_year)
    }

    const getPlanMonthlyLocalTotal = (plan) => {
      const pricing = getPlanPricing(plan)
      if (pricing && pricing.total_price_local) {
        return formatNumber(pricing.total_price_local * 12)
      }
      return formatNumber(plan.price * 12)
    }

    /**
     * Check if plan has annual pricing configured
     */
    const hasAnnualPrice = (plan) => {
      return plan.price_year && plan.price_year > 0
    }

    /**
     * Get monthly price for display based on billing period
     */
    const getDisplayPrice = (plan) => {
      const pricing = getPlanPricing(plan)
      if (isAnnual.value && hasAnnualPrice(plan)) {
        if (pricing && pricing.total_price_year_local) {
          return formatNumber((pricing.total_price_year_local / 12).toFixed(2))
        }
        return formatNumber((plan.price_year / 12).toFixed(2))
      }
      return getPlanLocalPrice(plan)
    }

    /**
     * Get total annual price
     */
    const getPlanAnnualPrice = (plan) => {
      return getPlanAnnualLocalPrice(plan)
    }

    /**
     * Get monthly total (12 months)
     */
    const getPlanMonthlyTotal = (plan) => {
      return getPlanMonthlyLocalTotal(plan)
    }

    /**
     * Calculate annual savings
     */
    const getAnnualSavings = (plan) => {
      if (!hasAnnualPrice(plan)) return 0
      const monthlyTotal = plan.price * 12
      const annualTotal = plan.price_year
      return formatNumber(monthlyTotal - annualTotal)
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
          months: isAnnual.value ? 12 : 1
        })

        // Pixel Event: Initiate Checkout
        const pricing = getPlanPricing(plan)
        const value = pricing && pricing.total_price_local ? pricing.total_price_local : plan.price
        const currency = pricing && pricing.local_currency_code ? pricing.local_currency_code : 'ARS'

        if (fbq?.event) {
          const checkoutData = {
            content_name: plan.name,
            currency,
            value
          }
          fbq.event('InitiateCheckout', checkoutData)
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

    const mustSelectPlan = computed(() => store.mustSelectPlan)

    onMounted(() => {
      loadPlans()
      loadCurrentSubscription()
    })

    const darkenColor = (hex, percent) => {
      const num = parseInt(hex.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) - amt
      const G = (num >> 8 & 0x00FF) - amt
      const B = (num & 0x0000FF) - amt
      return '#' + (0x1000000 + (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 0 ? 0 : B) : 255)).toString(16).slice(1)
    }

    const getDynamicCardStyle = (plan) => {
      const color = plan.card_color || '#FF1493'
      const btnColor = plan.btn_color || '#CCFF00'
      const textColor = plan.text_color || '#ffffff'

      const glowColor = `${color}66`
      const darkColor = darkenColor(color, 50)

      return {
        '--p-color': color,
        '--p-color-dark': darkColor,
        '--p-btn': btnColor,
        '--p-text': textColor,
        '--p-glow': glowColor,
        '--p-glow-strong': `${color}aa`,
        background: `linear-gradient(135deg, ${color} 0%, ${darkColor} 100%)`
      }
    }

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
      cancelSubscription,
      mustSelectPlan,
      isAnnual,
      hasAnnualPrice,
      getDisplayPrice,
      getPlanAnnualPrice,
      getPlanMonthlyTotal,
      getAnnualSavings,
      getPlanAnnualLocalPrice,
      getPlanMonthlyLocalTotal,
      getDynamicCardStyle,
      darkenColor
    }
  }
}
</script>

<style lang="scss" scoped>
.modern-pricing {
  position: relative;
  background: #0a0a0a;
  width: 100%;
  max-width: 1200px;
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

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}

body:not(.body--dark) .modern-pricing {
  background: #ffffff;

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
  height: 250px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
  border-radius: 16px 16px 0 0;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

body:not(.body--dark) .close-btn {
  background: rgba(0, 0, 0, 0.1);
  color: #0a0a0a;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}

.pricing-container {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 32px 24px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1.5px;
  margin-bottom: 8px;
  color: white;
}

body:not(.body--dark) .header-title {
  color: #0a0a0a;
}

.header-subtitle {
  font-size: 15px;
  opacity: 0.7;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
}

body:not(.body--dark) .header-subtitle {
  color: rgba(0, 0, 0, 0.6);
}

.billing-toggle-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.billing-toggle {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50px;
  padding: 4px;
  gap: 4px;

  &.dark-mode {
    background: rgba(255, 255, 255, 0.08);
  }
}

body:not(.body--dark) .billing-toggle {
  background: rgba(0, 0, 0, 0.05);
}

.toggle-btn {
  position: relative;
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &.active {
    background: var(--q-primary);
    color: white;
    box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.4);
  }

  &:hover:not(.active) {
    color: rgba(255, 255, 255, 0.9);
  }
}

body:not(.body--dark) .toggle-btn {
  color: rgba(0, 0, 0, 0.6);

  &:hover:not(.active) {
    color: rgba(0, 0, 0, 0.9);
  }
}

.discount-badge {
  background: #CCFF00;
  color: #000;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 100%;
  margin: 0 auto;
}

.plan-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  color: white;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  }
}

body:not(.body--dark) .plan-card {
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  color: #0a0a0a;

  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
  }

  &.plan-featured {
    background: linear-gradient(135deg, #CCFF00 0%, #B8E600 100%);
    border: none;
    box-shadow: 0 12px 40px rgba(204, 255, 0, 0.3);

    .plan-name,
    .plan-description,
    .price-currency,
    .price-amount,
    .price-period,
    .feature-item,
    .limit-item {
      color: #000;
    }

    .feature-icon {
      color: #000;
    }

    .action-btn {
      background: #000;
      color: #CCFF00;

      &:hover {
        background: #1a1a1a;
      }
    }

    &:hover {
      box-shadow: 0 16px 56px rgba(204, 255, 0, 0.4);
    }
  }
}

.plan-card {
  position: relative;
  border-radius: 30px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);

  /* Shimmer effect overlay */
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 45%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.05) 55%,
      transparent 100%
    );
    transform: rotate(25deg);
    animation: shimmer 6s infinite;
    pointer-events: none;
    z-index: 2;
  }

  &:hover {
    transform: translateY(-15px) scale(1.03);
    box-shadow: 0 40px 80px -15px var(--p-glow-strong) !important;
    border-color: rgba(255, 255, 255, 0.3);

    &::after {
      animation-duration: 2s;
    }
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(25deg); }
  100% { transform: translateX(100%) rotate(25deg); }
}

.plan-header-badge {
  width: 100%;
  padding: 10px 12px;
  text-align: center;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--p-text);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.plan-inner {
  margin: 8px;
  margin-top: 0;
  padding: 28px;
  background: rgba(10, 10, 10, 0.4);
  backdrop-filter: blur(25px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 3;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.6);
  color: var(--p-text);
  
  /* Internal glow based on plan color */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at top right, var(--p-glow), transparent 70%);
    pointer-events: none;
    opacity: 0.5;
    border-radius: inherit;
  }
}

.plan-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.plan-name {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--p-text);
}

.discount-pill-small {
  background: #FF1493;
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.current-badge-inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(204, 255, 0, 0.1);
  border: 1px solid rgba(204, 255, 0, 0.3);
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  color: #CCFF00;
  margin-bottom: 16px;
  align-self: flex-start;
}

.plan-description {
  font-size: 14px;
  opacity: 0.6;
  line-height: 1.5;
  margin-bottom: 20px;
}

.plan-price {
  margin-bottom: 24px;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
}

.old-price-strikethrough {
  font-size: 20px;
  font-weight: 700;
  color: #FF1493;
  text-decoration: line-through;
  margin-right: 12px;
  opacity: 0.8;
}

.price-currency {
  font-size: 24px;
  font-weight: 700;
  margin-right: 2px;
}

.price-amount {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -2px;
  line-height: 1;
}

.price-period {
  font-size: 14px;
  opacity: 0.5;
  margin-left: 4px;
}

.billing-note {
  font-size: 12px;
  opacity: 0.4;
  margin-top: 8px;
  font-weight: 500;
}

.action-btn-new {
  width: 100%;
  height: 56px;
  border-radius: 18px;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-3px);
    filter: brightness(1.2);
    box-shadow: 0 12px 25px var(--p-glow);
  }

  &:active {
    transform: scale(0.97);
  }
}

.save-badge-new {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: rgba(204, 255, 0, 0.1);
  border: 1px solid rgba(204, 255, 0, 0.1);
  border-radius: 14px;
  font-size: 12px;
  font-weight: 700;
  color: #CCFF00;
  margin-bottom: 24px;
}

.plan-features {
  flex: 1;
}

.feature-group {
  margin-bottom: 20px;
}

.feature-group-title {
  font-size: 11px;
  font-weight: 800;
  opacity: 0.5;
  margin-bottom: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
}

.feature-icon {
  color: var(--p-text);
  opacity: 0.7;
}

.plan-limits {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.limits-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
}

.branch-config-compact {
  margin-top: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
}

.branch-input-wrapper-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.branch-count-text {
  font-size: 14px;
  font-weight: 700;
}

.branch-total-compact {
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--q-primary);
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }
}

/* Skeleton override */
.plan-skeleton {
  .plan-inner {
    background: rgba(20, 20, 20, 0.8);
  }
}
</style>
