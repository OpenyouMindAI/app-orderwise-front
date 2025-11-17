<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 900px; max-width: 95vw;">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Planes de Suscripción</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Current Plan Info -->
      <q-card-section v-if="currentSubscription" class="q-pt-sm">
        <q-banner rounded class="bg-primary text-white">
          <template v-slot:avatar>
            <q-icon name="workspace_premium" size="md" />
          </template>
          <div class="text-subtitle1">Plan Actual: <strong>{{ currentSubscription.plan.name }}</strong></div>
          <div class="text-caption">
            <span v-if="currentSubscription.status === 'trial'">
              Período de prueba - Vence: {{ formatDate(currentSubscription.trial_end_date) }}
            </span>
            <span v-else-if="currentSubscription.status === 'active'">
              Activo hasta: {{ formatDate(currentSubscription.end_date) }}
              <span v-if="daysLeft <= 7" class="text-warning">
                ({{ daysLeft }} días restantes)
              </span>
            </span>
            <span v-else-if="currentSubscription.status === 'expired'" class="text-negative">
              Expirado el {{ formatDate(currentSubscription.end_date) }}
            </span>
          </div>
        </q-banner>
      </q-card-section>

      <!-- Plans Grid -->
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div 
            v-for="plan in plans" 
            :key="plan.id"
            class="col-12 col-md-4"
          >
            <q-card 
              bordered 
              :class="[
                'plan-card',
                { 
                  'current-plan': isCurrentPlan(plan),
                  'recommended': plan.slug === 'pro'
                }
              ]"
            >
              <!-- Recommended Badge -->
              <q-badge 
                v-if="plan.slug === 'pro'" 
                color="orange" 
                floating
                class="text-weight-bold"
              >
                Recomendado
              </q-badge>

              <q-card-section class="text-center">
                <div class="text-h5 text-weight-bold">{{ plan.name }}</div>
                <div class="text-h3 text-primary q-my-md">
                  <span v-if="plan.price === 0">Gratis</span>
                  <span v-else>
                    ${{ plan.price }}
                    <span class="text-caption">/mes</span>
                  </span>
                </div>
                <div class="text-caption text-grey-7">{{ plan.description }}</div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <q-list dense>
                  <q-item v-for="(feature, index) in plan.features" :key="index">
                    <q-item-section avatar>
                      <q-icon name="check_circle" color="positive" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-caption">{{ feature }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <!-- Pro Team Branch Pricing -->
                <div v-if="plan.slug === 'pro_team'" class="q-mt-md">
                  <q-separator class="q-mb-sm" />
                  <div class="text-caption text-grey-7 q-mb-xs">
                    Sucursales adicionales: ${{ plan.price_per_branch }}/mes cada una
                  </div>
                  <q-input
                    v-model.number="branchCount"
                    type="number"
                    min="1"
                    dense
                    outlined
                    label="Número de sucursales"
                    @update:model-value="calculateProTeamPrice(plan)"
                  >
                    <template v-slot:prepend>
                      <q-icon name="store" />
                    </template>
                  </q-input>
                  <div class="text-subtitle2 text-primary q-mt-xs">
                    Total: ${{ proTeamTotalPrice }}/mes
                  </div>
                </div>
              </q-card-section>

              <q-card-actions class="q-pa-md">
                <q-btn
                  v-if="isCurrentPlan(plan)"
                  unelevated
                  color="grey"
                  label="Plan Actual"
                  class="full-width"
                  disable
                />
                <q-btn
                  v-else-if="plan.slug === 'free'"
                  unelevated
                  color="grey"
                  label="Plan Básico"
                  class="full-width"
                  disable
                />
                <q-btn
                  v-else-if="canUpgrade(plan)"
                  unelevated
                  color="primary"
                  :label="getActionLabel(plan)"
                  class="full-width"
                  @click="selectPlan(plan)"
                  :loading="loading"
                />
                <q-btn
                  v-else
                  unelevated
                  color="grey"
                  label="No disponible"
                  class="full-width"
                  disable
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Cancel Subscription -->
      <q-card-section v-if="currentSubscription && !currentSubscription.plan.is_free">
        <q-separator class="q-mb-md" />
        <div class="text-center">
          <q-btn
            flat
            color="negative"
            label="Cancelar Suscripción"
            icon="cancel"
            @click="showCancelDialog = true"
          />
        </div>
      </q-card-section>
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
  setup(props, { emit }) {
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
      loading.value = true
      try {
        let response
        
        if (!currentSubscription.value) {
          // Crear nueva suscripción
          response = await api.post('subscriptions', {
            subscription_plan_id: plan.id,
            branch_offices_count: plan.slug === 'pro_team' ? branchCount.value : 1,
            months: 1
          })
          notify('Suscripción creada exitosamente', 'positive', 'check_circle')
        } else {
          // Actualizar suscripción existente
          response = await api.post('subscriptions/upgrade', {
            subscription_plan_id: plan.id
          })
          notify('Plan actualizado exitosamente', 'positive', 'check_circle')
          
          // Si es Pro Team, actualizar el número de sucursales
          if (plan.slug === 'pro_team' && branchCount.value > 1) {
            await api.post('subscriptions/update-branch-count', {
              branch_offices_count: branchCount.value
            })
          }
        }
        
        await loadCurrentSubscription()
        emit('subscription-updated', response.data.subscription)
      } catch (error) {
        notify(error.response?.data?.message || 'Error al procesar la suscripción', 'negative', 'warning')
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
.plan-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  &.current-plan {
    border: 2px solid var(--q-primary);
    background: rgba(var(--q-primary-rgb), 0.05);
  }

  &.recommended {
    border: 2px solid var(--q-orange);
  }

  .q-card__section:last-child {
    margin-top: auto;
  }
}
</style>
