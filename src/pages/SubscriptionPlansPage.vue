<template>
  <q-page padding class="subscription-plans-page">
    <div class="glass-container rounded-borders">
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h4 text-weight-bolder text-primary flex items-center">
            <q-icon name="workspace_premium" size="md" class="q-mr-sm" />
            Gestión de Planes
          </div>
          <div class="text-subtitle1 text-grey-7">Diseña y personaliza las ofertas para tus clientes</div>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Nuevo Plan"
            unelevated
            rounded
            class="premium-btn"
            @click="openCreateDialog"
          />
        </div>
      </div>

      <!-- Plans Table -->
      <q-table
        :rows="plans"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        flat
        bordered
        class="premium-table"
        :dark="$q.dark.isActive"
      >
        <!-- Status Column -->
        <template v-slot:body-cell-is_active="props">
          <q-td :props="props">
            <q-badge
              rounded
              :color="props.row.is_active ? 'positive' : 'grey-7'"
              :label="props.row.is_active ? 'Activo' : 'Inactivo'"
              class="q-px-md q-py-xs"
            />
          </q-td>
        </template>

        <!-- Price Column -->
        <template v-slot:body-cell-price="props">
          <q-td :props="props">
            <div class="flex flex-center">
              <span v-if="props.row.price === 0" class="text-weight-bold text-positive">Gratis</span>
              <div v-else>
                <div class="text-weight-bolder text-primary">${{ props.row.price }} <small>/mes</small></div>
                <div v-if="props.row.discount_amount" class="text-caption text-negative">
                  Desc: -${{ props.row.discount_amount }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Annual Price Column -->
        <template v-slot:body-cell-price_year="props">
          <q-td :props="props">
              <div v-if="props.row.price_year > 0" class="flex flex-center flex-column">
                <div class="text-weight-bolder text-secondary">${{ props.row.price_year }} <small>/año</small></div>
                <div class="row items-center q-gutter-xs">
                  <q-badge v-if="props.row.annual_discount" color="orange" label="Ahorro aplicado" size="xs" dense />
                  <q-badge v-if="props.row.price > 0" color="green" :label="Math.round((props.row.annual_discount / (props.row.price * 12)) * 100) + '% OFF'" size="xs" dense />
                </div>
              </div>
             <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>

        <!-- Limits Column -->
        <template v-slot:body-cell-limits="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-chip outline size="sm" color="blue" icon="people">
                {{ props.row.max_users || '∞' }}
              </q-chip>
              <q-chip outline size="sm" color="purple" icon="storefront">
                {{ props.row.max_branch_offices || '∞' }} sucursales
              </q-chip>
              <q-chip outline size="sm" color="indigo" icon="point_of_sale">
                {{ props.row.max_cashboxes || '∞' }} cajas
              </q-chip>
            </div>
          </q-td>
        </template>

        <!-- Actions Column -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-sm">
            <q-btn flat round dense color="primary" icon="edit" @click="openEditDialog(props.row)">
              <q-tooltip>Editar Plan</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)" :disable="props.row.slug === 'free'">
              <q-tooltip>Eliminar Plan</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 1000px; max-width: 95vw;" class="premium-card shadow-24" :dark="$q.dark.isActive">
        <q-card-section class="row items-center bg-primary text-white q-py-md">
          <div class="text-h5 text-bold flex items-center">
            <q-icon name="edit_note" class="q-mr-sm" />
            {{ isEditing ? 'Refinar Plan' : 'Nuevo Plan' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="savePlan">
          <q-tabs
            v-model="tab"
            class="text-grey-7"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="general" icon="dashboard_customize" label="Configuración" />
            <q-tab name="pricing" icon="monetization_on" label="Monetización" />
            <q-tab name="features" icon="auto_awesome" label="Características" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated class="q-pa-none" :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
            <!-- General Tab -->
            <q-tab-panel name="general" class="q-pa-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-8">
                  <div class="text-subtitle1 text-bold q-mb-md">Identidad del Plan</div>
                  <div class="row q-col-gutter-md">
                    <q-input
                      filled
                      v-model="form.name"
                      label="Nombre Comercial"
                      class="col-12 col-sm-6"
                      :rules="[val => !!val || 'El nombre es obligatorio']"
                      :dark="$q.dark.isActive"
                    />
                    <q-input
                      filled
                      v-model="form.slug"
                      label="Identificador Único (Slug)"
                      class="col-12 col-sm-6"
                      :disable="isEditing"
                      hint="Eje: pro, elite, global"
                      :dark="$q.dark.isActive"
                    />
                    <q-input
                      filled
                      v-model="form.description"
                      label="Descripción de Impacto"
                      type="textarea"
                      class="col-12"
                      autogrow
                      :dark="$q.dark.isActive"
                    />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-subtitle1 text-bold q-mb-md">Visibilidad</div>
                  <q-card flat bordered class="q-pa-md" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'">
                    <q-checkbox v-model="form.is_active" label="Plan Activo en Tienda" color="positive" class="full-width q-mb-sm" />
                    <q-checkbox v-model="form.has_api_access" label="Acceso a API Avanzada" color="primary" class="full-width" />
                    <div class="text-caption text-grey-6 q-mt-md">
                      Planes inactivos no aparecerán en el checkout de clientes.
                    </div>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Pricing Tab -->
            <q-tab-panel name="pricing" class="q-pa-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="q-pa-md" :dark="$q.dark.isActive">
                    <div class="text-subtitle1 text-bold q-mb-md text-primary">Precios Base</div>
                    <div class="row q-col-gutter-md">
                      <q-input
                        filled
                        v-model.number="form.price"
                        label="Mensual"
                        prefix="$"
                        type="number"
                        step="0.01"
                        class="col-12"
                        :dark="$q.dark.isActive"
                      />
                      <q-input
                        filled
                        v-model.number="form.price_year"
                        label="Anual (Pago único)"
                        prefix="$"
                        type="number"
                        step="0.01"
                        class="col-12"
                        hint="Suele ser menor a 12x mensual"
                        :dark="$q.dark.isActive"
                      />
                      <q-input
                        filled
                        v-model.number="form.price_per_branch"
                        label="Precio por Sucursal Adicional"
                        prefix="$"
                        type="number"
                        step="0.01"
                        class="col-12"
                        hint="Monto extra por cada sucursal fuera del mínimo"
                        :dark="$q.dark.isActive"
                      />
                      <div class="row q-col-gutter-sm items-center">
                        <div class="col-8">
                          <q-input
                            filled
                            v-model.number="form.annual_discount"
                            label="Descuento Anual Sugerido"
                            prefix="$"
                            type="number"
                            class="full-width"
                            :dark="$q.dark.isActive"
                            hint="Monto ahorrado al pagar el año completo"
                          />
                        </div>
                        <div class="col-4">
                          <div class="text-center">
                            <div class="text-caption text-grey-7">Porcentaje</div>
                            <q-chip
                              square
                              color="green-1"
                              text-color="green-9"
                              class="text-bold full-width"
                              :label="discountPercentage + '%'"
                              icon="trending_down"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="q-pa-md" :dark="$q.dark.isActive">
                    <div class="text-subtitle1 text-bold q-mb-md text-orange-9">Promociones y Límites</div>
                    <div class="row q-col-gutter-md">
                      <q-input
                        filled
                        v-model.number="form.discount_amount"
                        label="Descuento Temporal"
                        prefix="$"
                        class="col-6"
                        :dark="$q.dark.isActive"
                      />
                      <q-input
                        filled
                        v-model.number="form.discount_duration"
                        label="Duración (Meses)"
                        class="col-6"
                        type="number"
                        :dark="$q.dark.isActive"
                      />
                      <q-input filled v-model.number="form.max_users" label="Usuarios máx." type="number" class="col-4" :dark="$q.dark.isActive" />
                      <q-input filled v-model.number="form.max_branch_offices" label="Sucursales máx." type="number" class="col-4" :dark="$q.dark.isActive" />
                      <q-input filled v-model.number="form.min_branch_offices" label="Sucursales mín." type="number" class="col-4" :dark="$q.dark.isActive" hint="Incluidas en precio base" />
                      <q-input filled v-model.number="form.max_cashboxes" label="Cajas máx." type="number" class="col-4" :dark="$q.dark.isActive" />
                      <q-input filled v-model.number="form.trial_days" label="Días de gracia" type="number" class="col-12" suffix="días gratis" :dark="$q.dark.isActive" />
                    </div>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Features Tab -->
            <q-tab-panel name="features" class="q-pa-lg">
              <div class="features-scroll scroll" style="max-height: 50vh;">
                <div v-for="(group, gIdx) in form.features" :key="gIdx" class="q-mb-xl q-pa-md rounded-borders relative-position" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'">
                  <div class="row items-center q-mb-md">
                    <q-input
                      filled
                      v-model="group.title"
                      label="Categoría de Funcionalidades"
                      placeholder="Ej: Gestión de Inventarios"
                      class="col"
                      dense
                      :dark="$q.dark.isActive"
                    />
                    <q-btn flat round color="negative" icon="delete" @click="removeFeatureGroup(gIdx)" class="q-ml-sm" />
                  </div>

                  <div class="q-pl-lg">
                    <div v-for="(item, iIdx) in group.items" :key="iIdx" class="row items-center q-mb-xs">
                      <q-icon name="subdirectory_arrow_right" color="grey-5" class="q-mr-sm" />
                      <q-input
                        filled
                        v-model="group.items[iIdx]"
                        placeholder="Especifique capacidad..."
                        class="col"
                        dense
                        :dark="$q.dark.isActive"
                      />
                      <q-btn flat round icon="remove" size="sm" color="grey-7" @click="removeFeatureItem(gIdx, iIdx)" :disable="group.items.length <= 1" />
                    </div>
                    <q-btn flat color="secondary" icon="add" label="Agregar detalle" size="sm" @click="addFeatureItem(gIdx)" class="q-mt-sm" />
                  </div>
                </div>
                <div class="text-center">
                  <q-btn outline color="primary" icon="add_circle" label="Nueva Categoría de Características" @click="addFeatureGroup" rounded />
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>

          <q-card-actions align="right" class="q-pa-lg">
            <q-btn flat label="Descartar" color="grey-8" v-close-popup class="q-px-lg" />
            <q-btn
              unelevated
              :label="isEditing ? 'Actualizar Propuesta' : 'Publicar Plan'"
              color="primary"
              type="submit"
              rounded
              class="q-px-xl text-bold premium-btn"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Delete Confirm -->
    <q-dialog v-model="showDeleteDialog" backdrop-filter="blur(4px)">
      <q-card class="q-pa-md" style="width: 400px; border-radius: 20px;" :dark="$q.dark.isActive">
        <q-card-section class="text-center">
          <q-avatar icon="warning" color="negative" text-color="white" size="80px" class="q-mb-md" />
          <div class="text-h6 text-bold">¿Eliminar este Plan?</div>
          <p class="text-grey-7 q-mt-sm">Esta acción es irreversible y afectará el catálogo público.</p>
        </q-card-section>
        <q-card-actions align="center" class="q-gutter-sm">
          <q-btn flat label="Mantenerme" color="grey-8" v-close-popup rounded />
          <q-btn label="Sí, eliminar" color="negative" @click="deletePlan" unelevated rounded class="q-px-lg" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { useQuasar } from 'quasar'

const $q = useQuasar()

/**
 * Subscription Plans Management Page
 * Handles CRUD operations for plans with advanced features like nested lists and annual pricing.
 */

/**
 * List of available subscription plans
 * @type {Array}
 */
const plans = ref([])

/**
 * Loading state for table
 * @type {boolean}
 */
const loading = ref(false)

/**
 * Saving state for forms
 * @type {boolean}
 */
const saving = ref(false)

/**
 * Deleting state for confirmation
 * @type {boolean}
 */
const deleting = ref(false)

/**
 * Visibility of create/edit dialog
 * @type {boolean}
 */
const showDialog = ref(false)

/**
 * Visibility of delete confirmation dialog
 * @type {boolean}
 */
const showDeleteDialog = ref(false)

/**
 * Toggle between create and edit mode
 * @type {boolean}
 */
const isEditing = ref(false)

/**
 * Reference to the plan scheduled for deletion
 * @type {Object|null}
 */
const planToDelete = ref(null)

/**
 * Current active tab in the dialog
 * @type {string}
 */
const tab = ref('general')

/**
 * Table pagination configuration
 * @type {Object}
 */
const pagination = ref({ rowsPerPage: 10 })

// Table Strategy
const columns = [
  { name: 'name', label: 'Nombre Comercial', align: 'left', field: 'name', sortable: true },
  { name: 'slug', label: 'ID Sistema', align: 'left', field: 'slug', sortable: true },
  { name: 'price', label: 'Tarifa Mensual', align: 'center', field: 'price', sortable: true },
  { name: 'price_year', label: 'Tarifa Anual', align: 'center', field: 'price_year', sortable: true },
  { name: 'limits', label: 'Altas / Límites', align: 'left' },
  { name: 'is_active', label: 'Disponibilidad', align: 'center', field: 'is_active', sortable: true },
  { name: 'actions', label: 'Gestión', align: 'center' }
]

/**
 * Computed percentage based on the annual discount relative to 12 months of monthly price
 */
const discountPercentage = computed(() => {
  if (form.value.price > 0 && form.value.annual_discount > 0) {
    const totalMonthly = form.value.price * 12
    return Math.round((form.value.annual_discount / totalMonthly) * 100)
  }
  return 0
})

/**
 * Reactive form object for plan creation and editing
 */
const form = ref({
  name: '',
  slug: '',
  description: '',
  price: 0,
  price_per_branch: 0,
  price_year: 0,
  annual_discount: 0,
  discount_amount: 0,
  discount_duration: null,
  features: [{ title: '', items: [''] }],
  max_users: null,
  max_branch_offices: null,
  min_branch_offices: 1,
  max_cashboxes: null,
  trial_days: 0,
  has_api_access: false,
  is_active: true
})

/**
 * Automatic calculation of prices and discounts
 */
watch(() => form.value.price, (newVal) => {
  if (newVal > 0) {
    // Default: 2 months free for annual plan (if not already set or in edit mode)
    if (!isEditing.value && (!form.value.price_year || form.value.price_year === 0)) {
      form.value.price_year = Number((newVal * 10).toFixed(2))
    }
    form.value.annual_discount = Number((newVal * 12 - (form.value.price_year || 0)).toFixed(2))
  }
})

watch(() => form.value.price_year, (newYearVal) => {
  if (newYearVal > 0 && form.value.price > 0) {
    const calculatedDiscount = Number((form.value.price * 12 - newYearVal).toFixed(2))
    if (form.value.annual_discount !== calculatedDiscount) {
      form.value.annual_discount = calculatedDiscount
    }
  }
})

watch(() => form.value.annual_discount, (newDiscount) => {
  if (form.value.price > 0) {
    const calculatedYearPrice = Number((form.value.price * 12 - newDiscount).toFixed(2))
    if (form.value.price_year !== calculatedYearPrice) {
      form.value.price_year = calculatedYearPrice
    }
  }
})

// Logic
const loadPlans = async () => {
  loading.value = true
  try {
    const { data } = await api.get('subscription-plans')
    plans.value = data
  } catch (error) {
    notify(error.response?.data?.message || 'Error al conectar con el servidor', 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  tab.value = 'general'
  form.value = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    price_per_branch: 0,
    price_year: 0,
    annual_discount: 0,
    discount_amount: 0,
    discount_duration: null,
    features: [{ title: '', items: [''] }],
    max_users: null,
    max_branch_offices: null,
    min_branch_offices: 1,
    max_cashboxes: null,
    trial_days: 0,
    has_api_access: false,
    is_active: true
  }
  showDialog.value = true
}

const openEditDialog = (plan) => {
  isEditing.value = true
  tab.value = 'general'
  form.value = {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description || '',
    price: plan.price,
    price_per_branch: plan.price_per_branch || 0,
    price_year: plan.price_year || 0,
    annual_discount: plan.annual_discount || 0,
    discount_amount: plan.discount_amount || 0,
    discount_duration: plan.discount_duration,
    features: plan.features && plan.features.length > 0 && typeof plan.features[0] === 'object'
      ? JSON.parse(JSON.stringify(plan.features))
      : [{ title: 'General', items: [...plan.features] }],
    max_users: plan.max_users,
    max_branch_offices: plan.max_branch_offices,
    min_branch_offices: plan.min_branch_offices || 1,
    max_cashboxes: plan.max_cashboxes,
    trial_days: plan.trial_days || 0,
    has_api_access: plan.has_api_access,
    is_active: plan.is_active
  }
  showDialog.value = true
}

const addFeatureGroup = () => {
  form.value.features.push({ title: '', items: [''] })
}

const removeFeatureGroup = (index) => {
  form.value.features.splice(index, 1)
}

const addFeatureItem = (groupIndex) => {
  form.value.features[groupIndex].items.push('')
}

const removeFeatureItem = (groupIndex, itemIndex) => {
  form.value.features[groupIndex].items.splice(itemIndex, 1)
}

const savePlan = async () => {
  const cleanFeatures = form.value.features
    .filter(g => g.title.trim() !== '')
    .map(g => ({
      title: g.title.trim(),
      items: g.items.filter(i => i.trim() !== '')
    }))
    .filter(g => g.items.length > 0)

  if (cleanFeatures.length === 0) {
    notify('El plan debe ofrecer al menos una categoría de funciones con detalles', 'warning', 'lightbulb')
    return
  }

  saving.value = true
  try {
    const payload = { ...form.value, features: cleanFeatures }
    if (isEditing.value) {
      await api.put(`subscription-plans/${form.value.id}`, payload)
      notify('Plan refinado con éxito', 'positive', 'verified')
    } else {
      await api.post('subscription-plans', payload)
      notify('Plan publicado globalmente', 'positive', 'cloud_done')
    }
    showDialog.value = false
    await loadPlans()
  } catch (error) {
    const msg = error.response?.data?.message || 'Error en la sincronización del plan'
    notify(msg, 'negative', 'report_problem')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (plan) => {
  planToDelete.value = plan
  showDeleteDialog.value = true
}

const deletePlan = async () => {
  deleting.value = true
  try {
    await api.delete(`subscription-plans/${planToDelete.value.id}`)
    notify('Plan revocado del sistema', 'positive', 'delete_sweep')
    showDeleteDialog.value = false
    await loadPlans()
  } catch (error) {
    notify(error.response?.data?.message || 'No se pudo eliminar el plan', 'negative', 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(loadPlans)
</script>

<style lang="scss" scoped>
.subscription-plans-page {
  background: var(--q-dark-page, #f8f9fa);
  min-height: 100vh;
}

.glass-container {
  background: rgba(var(--q-primary), 0.03);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--q-primary), 0.1);
}

.premium-table {
  background: white !important;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);

  :deep(.q-table__card) {
    box-shadow: none;
    background: transparent !important;
  }

  :deep(.q-table th) {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.75rem;
    color: #616161;
  }
}

.premium-card {
  border-radius: 24px;
  overflow: hidden;
}

.premium-btn {
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--q-primary), 0.3);
  }
}

body.body--dark {
  .subscription-plans-page {
    background: #121212;
  }
  .glass-container {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
  .premium-table {
    background: #1d1d1d !important;
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.1);

    :deep(.q-table th) {
      color: #bbbbbb;
    }

    :deep(.q-table td) {
      border-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
