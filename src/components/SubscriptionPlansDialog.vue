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
        <div class="bg-orbs">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
        </div>

        <!-- Content Container -->
        <div class="pricing-container">
          <!-- Header -->
          <div class="pricing-header">
            <div class="header-badge">
              <q-icon name="auto_awesome" size="14px" />
              <span>Planes Premium</span>
            </div>
            <div class="header-title">
              Elige tu plan ideal
            </div>
            <div class="header-subtitle">
              Potencia tu negocio con las herramientas que necesitas
            </div>

            <!-- Billing Toggle -->
            <div class="billing-toggle-wrapper">
              <div class="billing-toggle" :class="{ annual: isAnnual }">
                <div class="toggle-slider" :class="{ right: isAnnual }"></div>
                <button
                  :class="['toggle-btn', { active: !isAnnual }]"
                  @click="isAnnual = false"
                >
                  Mensual
                </button>
                <button
                  :class="['toggle-btn', { active: isAnnual }]"
                  @click="isAnnual = true"
                >
                  Anual
                  <span class="discount-badge">
                    <q-icon name="local_fire_department" size="10px" />
                    -40%
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Plans Grid -->
          <div class="plans-grid">
            <!-- Skeleton Loading -->
            <template v-if="loadingPlans">
              <div v-for="n in 1" :key="'skeleton-' + n" class="plan-card plan-skeleton">
                <div class="plan-inner">
                  <q-skeleton height="24px" width="60%" class="q-mb-md" animation="wave" />
                  <q-skeleton height="16px" width="80%" class="q-mb-lg" animation="wave" />
                  <q-skeleton height="56px" width="100%" class="q-mb-lg" animation="wave" />
                  <q-skeleton height="16px" width="100%" class="q-mb-sm" animation="wave" />
                  <q-skeleton height="16px" width="90%" class="q-mb-sm" animation="wave" />
                  <q-skeleton height="16px" width="85%" class="q-mb-lg" animation="wave" />
                  <q-skeleton height="48px" width="100%" animation="wave" />
                </div>
              </div>
            </template>

            <!-- Plans Cards -->
            <div
              v-else
              v-for="plan in plans.filter(p => p.slug?.toLowerCase() !== 'free')"
              :key="plan.id"
              :class="[
                'plan-featured plan-card',
                { 'plan-current': isCurrentPlan(plan) }
              ]"
              :style="getDynamicCardStyle(plan)"
            >
              <!-- Card Header / Badge Area -->
              <div v-if="plan.badge_text" class="plan-header-badge">
                <q-icon name="diamond" size="12px" class="q-mr-xs" />
                {{ plan.badge_text }}
              </div>

              <!-- Inner Content -->
              <div class="plan-inner" :style="{ color: plan.text_color || '#fff' }">
                <!-- Current Badge (Inside) -->
                <div v-if="isCurrentPlan(plan)" class="current-badge-inner">
                  <q-icon name="verified" size="14px" />
                  <span>Tu plan actual</span>
                </div>

                <!-- Plan Header -->
                <div class="plan-header">
                  <div class="plan-name-row">
                    <div class="plan-name">{{ plan.name }}</div>
                    <div v-if="isAnnual && hasAnnualPrice(plan)" class="discount-pill-small">
                      <q-icon name="savings" size="12px" />
                      40% OFF
                    </div>
                  </div>
                  <div class="plan-description">{{ plan.description }}</div>
                </div>

                <!-- Price -->
                <div class="plan-price">
                  <template v-if="plan.price === 0">
                    <div class="price-wrapper">
                      <span class="price-amount">Gratis</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="price-wrapper">
                      <span v-if="isAnnual && hasAnnualPrice(plan)" class="old-price">
                        {{ getPlanCurrencySymbol(plan) }}{{ getPlanLocalPrice(plan) }}
                      </span>
                      <div class="current-price">
                        <span class="price-currency">{{ getPlanCurrencySymbol(plan) }}</span>
                        <span class="price-amount">{{ getDisplayPrice(plan) }}</span>
                        <span class="price-period">/mes</span>
                      </div>
                    </div>

                    <div v-if="isAnnual && hasAnnualPrice(plan)" class="billing-note">
                      <q-icon name="event" size="14px" class="q-mr-xs" />
                      Facturado {{ getPlanCurrencySymbol(plan) }}{{ getPlanAnnualPrice(plan) }} anualmente
                    </div>
                  </template>
                </div>

                <!-- Select Button -->
                <q-btn
                  unelevated
                  no-caps
                  :label="getActionLabel(plan)"
                  class="action-btn-new"
                  :style="plan.btn_color ? { backgroundColor: plan.btn_color, color: '#000' } : {}"
                  @click="selectPlan(plan)"
                  :loading="loading"
                  :disable="isCurrentPlan(plan) || plan.slug?.toLowerCase() === 'free'"
                >
                  <template v-slot:loading>
                    <q-spinner-dots size="20px" />
                  </template>
                </q-btn>

                <!-- Save Badge -->
                <div v-if="isAnnual && hasAnnualPrice(plan)" class="save-badge-new">
                  <div class="save-icon">
                    <q-icon name="savings" size="18px" />
                  </div>
                  <div class="save-text">
                    <span class="save-label">Ahorro total</span>
                    <span class="save-amount">{{ getPlanCurrencySymbol(plan) }}{{ getAnnualSavings(plan) }}</span>
                  </div>
                </div>

                <!-- Features Divider -->
                <div class="features-divider">
                  <span>Incluye</span>
                </div>

                <!-- Features -->
                <div class="plan-features">
                  <template v-if="plan.features && plan.features.length > 0">
                    <template v-if="typeof plan.features[0] === 'object'">
                      <div v-for="(group, gIdx) in plan.features" :key="gIdx" class="feature-group">
                        <div class="feature-group-title">
                          <q-icon name="folder_open" size="14px" />
                          {{ group.title }}
                        </div>
                        <div
                          v-for="(item, iIdx) in group.items"
                          :key="iIdx"
                          class="feature-item"
                        >
                          <div class="feature-check">
                            <q-icon name="check" size="12px" />
                          </div>
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
                        <div class="feature-check">
                          <q-icon name="check" size="12px" />
                        </div>
                        <span>{{ feature }}</span>
                      </div>
                    </template>
                  </template>
                </div>

                <!-- Limits -->
                <div v-if="plan.max_users || plan.max_branch_offices" class="plan-limits">
                  <div class="limits-grid">
                    <div v-if="plan.max_users" class="limit-item">
                      <div class="limit-icon">
                        <q-icon name="group" size="16px" />
                      </div>
                      <div class="limit-text">
                        <span class="limit-value">{{ plan.max_users }}</span>
                        <span class="limit-label">usuarios</span>
                      </div>
                    </div>
                    <div v-if="plan.max_branch_offices" class="limit-item">
                      <div class="limit-icon">
                        <q-icon name="store" size="16px" />
                      </div>
                      <div class="limit-text">
                        <span class="limit-value">{{ plan.max_branch_offices }}</span>
                        <span class="limit-label">sucursales</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pro Team Branch Config -->
                <div v-if="plan.slug?.toLowerCase() === 'pro_team'" class="branch-config-compact">
                  <div class="branch-header">
                    <q-icon name="business" size="18px" />
                    <span>Configurar sucursales</span>
                  </div>
                  <div class="branch-info-row">
                    <div class="info-item">
                      <q-icon name="info_outline" size="14px" />
                      <span>{{ plan.min_branch_offices || 1 }} {{ (plan.min_branch_offices || 1) === 1 ? 'sucursal incluida' : 'sucursales incluidas' }}</span>
                    </div>
                    <div v-if="plan.price_per_branch" class="info-item">
                      <q-icon name="add_circle_outline" size="14px" />
                      <span>{{ getPlanCurrencySymbol(plan) }}{{ getLocalPricePerBranch(plan) }} / suc. adicional</span>
                    </div>
                  </div>
                  <div class="branch-input-wrapper-compact">
                    <q-btn
                      flat
                      dense
                      round
                      icon="remove"
                      @click="decrementBranch(plan)"
                      size="sm"
                      class="branch-btn"
                    />
                    <div class="branch-count-display">
                      <span class="branch-count-number">{{ branchCount }}</span>
                      <span class="branch-count-label">sucursales</span>
                    </div>
                    <q-btn
                      flat
                      dense
                      round
                      icon="add"
                      @click="incrementBranch(plan)"
                      size="sm"
                      class="branch-btn"
                    />
                  </div>
                  <div class="branch-total-compact">
                    <span class="total-label">{{ isAnnual ? 'Total anual (mensual):' : 'Total mensual:' }}</span>
                    <span class="total-amount">{{ getPlanCurrencySymbol(plan) }}{{ proTeamTotalPrice }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Contact Advisor Card -->
            <div v-if="showContactOption" class="plan-card contact-advisor-card">
              <div class="plan-inner advisor-inner">
                <!-- Advisor Header -->
                <div class="advisor-header">
                  <div class="advisor-badge">
                    <q-icon name="support_agent" size="14px" />
                    Asesoría Personalizada
                  </div>
                  <div class="advisor-title">Hablar con un asesor</div>
                  <div class="advisor-description">
                    Soluciones a medida para empresas con grandes volúmenes o requerimientos especiales de integración.
                  </div>
                </div>

                <!-- Price Placeholder -->
                <div class="plan-price advisor-price">
                  <div class="price-wrapper">
                    <span class="price-amount" style="font-size: 32px;">A medida</span>
                    <span class="price-period">Cotización personalizada</span>
                  </div>
                </div>

                <!-- Select Button -->
                <q-btn
                  unelevated
                  no-caps
                  label="Hablar con un asesor"
                  class="action-btn-new advisor-btn"
                  @click="contactAdvisor"
                >
                  <q-icon name="arrow_forward" size="18px" class="q-ml-sm" />
                </q-btn>

                <!-- Features Divider -->
                <div class="features-divider">
                  <span>Lo que obtienes</span>
                </div>

                <!-- Advisor Features -->
                <div class="plan-features advisor-features">
                  <div class="feature-item">
                    <div class="feature-check"><q-icon name="check" size="12px" /></div>
                    <span>Soporte prioritario 24/7</span>
                  </div>
                  <div class="feature-item">
                    <div class="feature-check"><q-icon name="check" size="12px" /></div>
                    <span>SLA de disponibilidad garantizado</span>
                  </div>
                  <div class="feature-item">
                    <div class="feature-check"><q-icon name="check" size="12px" /></div>
                    <span>Capacitación in-company</span>
                  </div>
                  <div class="feature-item">
                    <div class="feature-check"><q-icon name="check" size="12px" /></div>
                    <span>Desarrollos personalizados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Note -->
          <div class="pricing-footer">
            <q-icon name="security" size="16px" />
            <span>Pago seguro con Mercado Pago • Cancela cuando quieras</span>
          </div>
        </div>
      </q-card>
    </q-dialog>

    <!-- Cancel Confirmation Dialog -->
    <q-dialog v-model="showCancelDialog">
      <q-card class="cancel-dialog">
        <q-card-section class="cancel-header">
          <q-icon name="warning_amber" size="48px" color="warning" />
          <div class="text-h6">¿Cancelar Suscripción?</div>
        </q-card-section>

        <q-card-section>
          <p>¿Está seguro que desea cancelar su suscripción?</p>
          <p class="text-caption text-grey-6">
            Su plan actual permanecerá activo hasta la fecha de vencimiento.
            Después de eso, su cuenta será cambiada al plan Free.
          </p>
          <q-input
            v-model="cancellationReason"
            type="textarea"
            label="Motivo de cancelación (opcional)"
            outlined
            rows="3"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
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
    },
    mustSelectPlan: {
      type: Boolean,
      default: false
    },
    showContactOption: {
      type: Boolean,
      default: true
    },
    enableCountdown: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'subscription-updated'],
  setup (props, { emit }) {
    const router = useRouter()
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

    // Countdown State
    const countdown = ref(3)
    const countdownInterval = ref(null)
    const redirectingPlanId = ref(null)

    const showDialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const isMobile = computed(() => $q.screen.lt.md)

    const daysLeft = computed(() => {
      if (!currentSubscription.value) return 0
      const end = new Date(currentSubscription.value.end_date)
      const now = new Date()
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
      return Math.max(0, diff)
    })

    /**
     * Check if plan is the current active plan
     * @param {Object} plan - The plan to check
     * @return {boolean} Whether the plan is the current plan
     */
    const isCurrentPlan = (plan) => {
      if (!currentSubscription.value) return plan.slug?.toLowerCase() === 'free'
      return currentSubscription.value.plan.id === plan.id
    }

    /**
     * Check if user can upgrade to a plan
     * @param {Object} plan - The plan to check
     * @return {boolean} Whether the user can upgrade to the plan
     */
    const canUpgrade = (plan) => {
      if (plan.slug?.toLowerCase() === 'free') return false
      if (!currentSubscription.value) return true

      const currentPlanOrder = { free: 0, pro: 1, pro_team: 2 }
      const currentOrder = currentPlanOrder[currentSubscription.value.plan.slug?.toLowerCase()] || 0
      const targetOrder = currentPlanOrder[plan.slug?.toLowerCase()] || 0

      return targetOrder > currentOrder
    }

    /**
     * Get the action button label for a plan
     * @param {Object} plan - The plan to get the label for
     * @return {string} The action button label
     */
    const getActionLabel = (plan) => {
      if (redirectingPlanId.value === plan.id) {
        return `Redirigiendo en ${countdown.value}s...`
      }
      if (isCurrentPlan(plan)) return 'Plan Actual'
      return 'Comenzar Ahora'
    }

    /**
     * Format a date string
     * @param {string} dateStr - The date string to format
     * @return {string} The formatted date string
     */
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

    const getLocalPricePerBranch = (plan) => {
      const pricing = getPlanPricing(plan)
      let price = plan.price_per_branch || 0

      if (pricing && pricing.price_per_branch_local) {
        price = pricing.price_per_branch_local
      }

      // Si es anual, aplicamos el mismo descuento del 50% (o el que sea) al precio por sucursal
      if (isAnnual.value && hasAnnualPrice(plan)) {
        // En el controlador asumimos 0.8 (20% off), pero aquí podemos simplificar al 50% si el badge del toggle dice 50%
        // O mejor aún, intentamos ser consistentes con el descuento del plan base
        const basePrice = plan.price
        const annualMonthlyBase = plan.price_year / 12
        const discountRatio = basePrice > 0 ? annualMonthlyBase / basePrice : 0.5

        price = price * discountRatio
      }

      return formatNumber(price)
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
     * @param {Object} plan - The plan to check
     * @return {boolean} Whether the plan has annual pricing
     */
    const hasAnnualPrice = (plan) => {
      return plan.price_year && plan.price_year > 0
    }

    /**
     * Get monthly price for display based on billing period
     * @param {Object} plan - The plan to get the price for
     * @return {string} The formatted display price
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
     * @param {Object} plan - The plan to get the price for
     * @return {string} The formatted annual price
     */
    const getPlanAnnualPrice = (plan) => {
      return getPlanAnnualLocalPrice(plan)
    }

    /**
     * Get monthly total (12 months)
     * @param {Object} plan - The plan to get the total for
     * @return {string} The formatted monthly total
     */
    const getPlanMonthlyTotal = (plan) => {
      return getPlanMonthlyLocalTotal(plan)
    }

    /**
     * Calculate annual savings using local prices
     * @param {Object} plan - The plan to calculate savings for
     * @return {string} The formatted annual savings
     */
    const getAnnualSavings = (plan) => {
      if (!hasAnnualPrice(plan)) return 0
      const pricing = getPlanPricing(plan)

      let monthlyTotal, annualTotal

      if (pricing && pricing.total_price_local && pricing.total_price_year_local) {
        monthlyTotal = pricing.total_price_local * 12
        annualTotal = pricing.total_price_year_local
      } else {
        monthlyTotal = plan.price * 12
        annualTotal = plan.price_year
      }

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
      const minBranches = plan.min_branch_offices || 1
      if (branchCount.value > Math.max(minBranches, currentBranchCount.value)) {
        branchCount.value--
        await calculateProTeamPrice(plan)
      }
    }

    const calculateProTeamPrice = async (plan) => {
      if (plan.slug?.toLowerCase() !== 'pro_team') return

      const pricingData = await fetchAllPricing(branchCount.value)

      if (pricingData && pricingData.pricing) {
        // Asignar el nuevo objeto para asegurar reactividad
        pricingByPlan.value = { ...pricingData.pricing }

        if (pricingByPlan.value[plan.id]) {
          const pricing = pricingByPlan.value[plan.id]
          let price

          if (isAnnual.value && pricing.total_price_year_local) {
            price = pricing.total_price_year_local / 12
          } else if (pricing.total_price_local) {
            price = pricing.total_price_local
          } else {
            price = isAnnual.value ? (plan.price_year / 12) : plan.price
          }

          proTeamTotalPrice.value = formatNumber(price)
        }
      }
    }

    const loadPlans = async () => {
      loadingPlans.value = true
      try {
        const { data } = await api.get('subscription-plans')
        plans.value = data

        const pricingData = await fetchAllPricing(branchCount.value)

        if (pricingData && pricingData.pricing) {
          pricingByPlan.value = pricingData.pricing

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
     * Start payment process with Mercado Pago Checkout Pro
     * @param {Object} plan - The plan to subscribe to
     * @return {void}
     */
    const selectPlan = async (plan) => {
      // Si ya está redirigiendo, ignorar
      if (redirectingPlanId.value) return

      if (store.isDemo) {
        localStorage.setItem('pending_plan_subscription', JSON.stringify({
          planId: plan.id,
          branchCount: plan.slug?.toLowerCase() === 'pro_team' ? branchCount.value : 1
        }))
        notify('Completa tu registro para suscribirte', 'info', 'person_add')
        emit('update:modelValue', false)
        emit('open-register')
        return
      }

      if (props.enableCountdown) {
        redirectingPlanId.value = plan.id
        countdown.value = 3
        
        countdownInterval.value = setInterval(async () => {
          countdown.value--
          if (countdown.value <= 0) {
            clearInterval(countdownInterval.value)
            await processPayment(plan)
          }
        }, 1000)
      } else {
        await processPayment(plan)
      }
    }

    const processPayment = async (plan) => {
      try {
        loading.value = true

        const payload = {
          subscription_plan_id: plan.id,
          branch_offices_count: plan.slug?.toLowerCase() === 'pro_team' ? branchCount.value : 1,
          months: isAnnual.value ? 12 : 1 // 12 meses si es anual, 1 si es mensual
        }

        const { data } = await api.post('mercadopago/create-payment', payload)

        if (data.init_point) {
          localStorage.setItem('mp_plan_id', plan.id)
          // Redirect to Mercado Pago
          window.location.href = data.init_point
        } else {
          notify('Error al generar link de pago', 'negative', 'error')
          redirectingPlanId.value = null
        }
      } catch (error) {
        notify(error.response?.data?.message || 'Error al procesar pago', 'negative', 'error')
        redirectingPlanId.value = null
      } finally {
        loading.value = false
      }
    }

    /**
     * Handle contact advisor click
     * @return {void}
     */
    const contactAdvisor = () => {
      if (store.isDemo) {
        localStorage.setItem('pending_contact_advisor', 'true')
        notify('Completa tu registro para hablar con un asesor', 'info', 'person_add')
        emit('update:modelValue', false)
        emit('open-register')
        return
      }
      router.push({ name: 'Support' })
      showDialog.value = false
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

    const mustSelectPlan = computed(() => props.mustSelectPlan || store.mustSelectPlan)

    watch(isAnnual, async () => {
      const proTeamPlan = plans.value.find(p => p.slug?.toLowerCase() === 'pro_team')
      if (proTeamPlan) {
        await calculateProTeamPrice(proTeamPlan)
      }
    })

    onMounted(async () => {
      await loadPlans()
      loadCurrentSubscription()
    })

    /**
     * Darken a hex color by a percentage
     * @param {string} hex - The hex color to darken
     * @param {number} percent - The percentage to darken by
     * @return {string} The darkened hex color
     */
    const darkenColor = (hex, percent) => {
      const num = parseInt(hex.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) - amt
      const G = (num >> 8 & 0x00FF) - amt
      const B = (num & 0x0000FF) - amt
      return '#' + (0x1000000 + (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 0 ? 0 : B) : 255)).toString(16).slice(1)
    }

    /**
     * Get dynamic card styles based on plan configuration
     * @param {Object} plan - The plan to get styles for
     * @return {Object} The dynamic styles object
     */
    const getDynamicCardStyle = (plan) => {
      const color = plan.card_color || '#6366F1'
      const btnColor = plan.btn_color || '#CCFF00'
      const textColor = plan.text_color || '#ffffff'

      const glowColor = `${color}40`
      const darkColor = darkenColor(color, 40)

      return {
        '--p-color': color,
        '--p-color-dark': darkColor,
        '--p-btn': btnColor,
        '--p-text': textColor,
        '--p-glow': glowColor,
        '--p-glow-strong': `${color}80`,
        background: `linear-gradient(160deg, ${color} 0%, ${darkColor} 100%)`
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
      getLocalPricePerBranch,
      hasExchangeInfo,
      getExchangeRate,
      getLocalCurrencyCode,
      selectPlan,
      contactAdvisor,
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
  background: #0a0a0f;
  width: 100%;
  max-width: 1200px;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    &:hover { background: rgba(255, 255, 255, 0.25); }
  }
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

body:not(.body--dark) .modern-pricing {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid rgba(0, 0, 0, 0.06);
  &::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); }
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.bg-gradient {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 400px;
  background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.bg-orbs {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    animation: float 20s ease-in-out infinite;
  }
  .orb-1 {
    width: 300px; height: 300px;
    background: rgba(139, 92, 246, 0.3);
    top: -100px; right: -50px;
  }
  .orb-2 {
    width: 200px; height: 200px;
    background: rgba(6, 182, 212, 0.3);
    bottom: 100px; left: -50px;
    animation-delay: -5s;
  }
  .orb-3 {
    width: 150px; height: 150px;
    background: rgba(236, 72, 153, 0.3);
    top: 50%; right: 20%;
    animation-delay: -10s;
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.close-btn {
  position: absolute;
  top: 20px; right: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
}

body:not(.body--dark) .close-btn {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.6);
  &:hover { background: rgba(0, 0, 0, 0.1); color: #0a0a0a; }
}

.pricing-container {
  position: relative;
  z-index: 1;
  padding: 48px 32px 32px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 48px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #a78bfa;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

body:not(.body--dark) .header-badge {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
  color: #7c3aed;
}

.header-title {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -1.5px;
  margin-bottom: 12px;
  color: white;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

body:not(.body--dark) .header-title {
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.header-subtitle {
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 32px;
}

body:not(.body--dark) .header-subtitle { color: rgba(0, 0, 0, 0.5); }

.billing-toggle-wrapper {
  display: flex;
  justify-content: center;
}

.billing-toggle {
  position: relative;
  display: inline-flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 4px;
  gap: 4px;
}

body:not(.body--dark) .billing-toggle {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.toggle-slider {
  position: absolute;
  top: 4px; left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  &.right { transform: translateX(100%); }
}

.toggle-btn {
  position: relative;
  z-index: 1;
  padding: 10px 24px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  &.active { color: white; }
  &:hover:not(.active) { color: rgba(255, 255, 255, 0.8); }
}

body:not(.body--dark) .toggle-btn {
  color: rgba(0, 0, 0, 0.5);
  &.active { color: white; }
  &:hover:not(.active) { color: rgba(0, 0, 0, 0.8); }
}

.discount-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  color: white;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  max-width: 100%;
}

.plan-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 24px -8px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 48px -12px var(--p-glow-strong);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.plan-current {
    border: 2px solid var(--p-color);
    box-shadow: 0 0 0 4px var(--p-glow), 0 4px 24px -8px rgba(0, 0, 0, 0.3);
  }
}

.plan-header-badge {
  padding: 10px 16px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.2);
}

.plan-inner {
  margin: 3px;
  margin-top: 0;
  padding: 28px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 22px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.current-badge-inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #4ade80;
  margin-bottom: 16px;
  align-self: flex-start;
}

.plan-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.plan-name {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.discount-pill-small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
}

.plan-description {
  font-size: 14px;
  opacity: 0.6;
  line-height: 1.6;
  margin-bottom: 24px;
}

.plan-price { margin-bottom: 24px; }

.price-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.old-price {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: line-through;
}

.current-price {
  display: flex;
  align-items: baseline;
}

.price-currency {
  font-size: 28px;
  font-weight: 700;
  margin-right: 2px;
  opacity: 0.9;
}

.price-amount {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -3px;
  line-height: 1;
}

.price-period {
  font-size: 16px;
  opacity: 0.5;
  margin-left: 4px;
  font-weight: 500;
}

.billing-note {
  display: flex;
  align-items: center;
  font-size: 13px;
  opacity: 0.5;
  margin-top: 8px;
  font-weight: 500;
}

.action-btn-new {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--p-glow);
    filter: brightness(1.1);
  }

  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.save-badge-new {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 14px;
  margin-bottom: 24px;
}

.save-icon {
  width: 36px; height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 10px;
  color: #4ade80;
}

.save-text {
  display: flex;
  flex-direction: column;
}

.save-label {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.save-amount {
  font-size: 18px;
  font-weight: 800;
  color: #4ade80;
}

.features-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  opacity: 0.4;
  span {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: currentColor;
    opacity: 0.3;
  }
}

.plan-features { flex: 1; }

.feature-group { margin-bottom: 20px; }

.feature-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  opacity: 0.6;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
}

.feature-check {
  width: 20px; height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 6px;
  color: #4ade80;
  flex-shrink: 0;
}

.plan-limits {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.limits-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  flex: 1;
  min-width: 120px;
}

.limit-icon {
  width: 32px; height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  opacity: 0.8;
}

.limit-text {
  display: flex;
  flex-direction: column;
}

.limit-value {
  font-size: 18px;
  font-weight: 800;
}

.limit-label {
  font-size: 11px;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.branch-config-compact {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.branch-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.8;
}

.branch-info-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #4ade80;
  background: rgba(34, 197, 94, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
  white-space: nowrap;
}

.branch-input-wrapper-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.branch-btn {
  background: rgba(255, 255, 255, 0.1);
  &:hover { background: rgba(255, 255, 255, 0.2); }
}

.branch-count-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.branch-count-number {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.branch-count-label {
  font-size: 10px;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.branch-total-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(var(--q-primary-rgb), 0.1);
  border-radius: 12px;
}

.total-label {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
}

.total-amount {
  font-size: 20px;
  font-weight: 800;
  color: var(--q-primary);
}

.pricing-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

body:not(.body--dark) .pricing-footer {
  border-top-color: rgba(0, 0, 0, 0.06);
  color: white;
}

.cancel-dialog {
  min-width: 400px;
  border-radius: 20px;
}

.cancel-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding-bottom: 0;
}

@media (max-width: 768px) {
  .pricing-container { padding: 32px 16px 24px; }
  .header-title { font-size: 32px; }
  .plans-grid { grid-template-columns: 1fr; gap: 16px; }
  .price-amount { font-size: 44px; }
  .cancel-dialog { min-width: 90vw; }
}

/* Contact Advisor Styles - Premium Enterprise Blue */
.contact-advisor-card {
  --p-color: #3b82f6;
  --p-color-dark: #1e3a8a;
  --p-btn: #60a5fa;
  --p-text: #ffffff;
  --p-glow: rgba(59, 130, 246, 0.4);
  --p-glow-strong: rgba(59, 130, 246, 0.7);
  background: linear-gradient(165deg, #2563eb 0%, #1e3a8a 100%) !important;
  border-color: rgba(96, 165, 250, 0.3) !important;
}

.contact-advisor-card .advisor-inner {
  background: rgba(15, 23, 42, 0.7) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.advisor-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.4);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #93c5fd;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.advisor-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
  color: white;
  letter-spacing: -0.5px;
}

.advisor-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 28px;
}

.advisor-price {
  margin-bottom: 32px;
}

.advisor-price .price-amount {
  color: #60a5fa;
  text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
}

.advisor-price .price-period {
  color: rgba(255, 255, 255, 0.6);
}

.advisor-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4) !important;
  height: 54px;
  font-size: 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.advisor-features .feature-item {
  color: rgba(255, 255, 255, 0.9);
}

.advisor-features .feature-check {
  background: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.plan-skeleton {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  .plan-inner { background: rgba(0, 0, 0, 0.3); padding: 28px; }
}
</style>
