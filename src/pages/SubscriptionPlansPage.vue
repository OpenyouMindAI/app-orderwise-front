<template>
  <q-page padding>
    <div>
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <div class="text-h4 text-weight-bold">Gestión de Planes de Suscripción</div>
          <div class="text-subtitle2 text-grey-7">Administra los planes disponibles para tus clientes</div>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Nuevo Plan"
            unelevated
            @click="openCreateDialog"
          />
        </div>
      </div>

      <!-- Plans Table -->
      <q-card flat bordered>
        <q-table
          :rows="plans"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          flat
        >
          <!-- Status Column -->
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.is_active ? 'positive' : 'grey'"
                :label="props.row.is_active ? 'Activo' : 'Inactivo'"
              />
            </q-td>
          </template>

          <!-- Price Column -->
          <template v-slot:body-cell-price="props">
            <q-td :props="props">
              <span v-if="props.row.price === 0" class="text-weight-bold text-positive">
                Gratis
              </span>
              <span v-else class="text-weight-bold">
                ${{ props.row.price }}/mes
              </span>
            </q-td>
          </template>

          <!-- Features Column -->
          <template v-slot:body-cell-features="props">
            <q-td :props="props">
              <q-chip
                v-for="(feature, index) in props.row.features.slice(0, 2)"
                :key="index"
                size="sm"
                dense
              >
                {{ feature }}
              </q-chip>
              <q-chip
                v-if="props.row.features.length > 2"
                size="sm"
                dense
                color="grey-4"
              >
                +{{ props.row.features.length - 2 }} más
              </q-chip>
            </q-td>
          </template>

          <!-- API Access Column -->
          <template v-slot:body-cell-has_api_access="props">
            <q-td :props="props">
              <q-icon
                :name="props.row.has_api_access ? 'check_circle' : 'cancel'"
                :color="props.row.has_api_access ? 'positive' : 'grey'"
                size="sm"
              />
            </q-td>
          </template>

          <!-- Actions Column -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
                :disable="props.row.slug === 'free'"
              >
                <q-tooltip>{{ props.row.slug === 'free' ? 'No se puede eliminar el plan Free' : 'Eliminar' }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showDialog" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 900px; max-width: 95vw;">
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <q-icon name="workspace_premium" size="sm" class="q-mr-sm" />
          <div class="text-h6">{{ isEditing ? 'Editar Plan de Suscripción' : 'Nuevo Plan de Suscripción' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeDialog" />
        </q-card-section>

        <q-form @submit.prevent="savePlan">
          <q-tabs
            v-model="tab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="general" icon="info" label="Información General" />
            <q-tab name="pricing" icon="attach_money" label="Precios y Límites" />
            <q-tab name="features" icon="checklist" label="Características" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <!-- General Tab -->
            <q-tab-panel name="general">
              <div class="row q-col-gutter-sm scroll" style="height: calc(100vh - 240px);">
                <div class="col-12">
                  <q-card flat bordered>
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="info" class="q-mr-sm" />
                      Información Básica del Plan
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-input
                          filled
                          v-model="form.name"
                          label="Nombre del Plan"
                          dense
                          :rules="[val => !!val || 'El nombre es requerido']"
                          hint="Nombre visible para los clientes"
                        />
                      </div>

                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-input
                          filled
                          v-model="form.slug"
                          label="Identificador (Slug)"
                          dense
                          :rules="[val => !!val || 'El slug es requerido']"
                          hint="Identificador único (ej: free, pro, enterprise)"
                          :disable="isEditing"
                        />
                      </div>

                      <div class="col-12">
                        <q-input
                          filled
                          v-model="form.description"
                          label="Descripción del Plan"
                          type="textarea"
                          autogrow
                          dense
                          hint="Descripción breve que aparecerá en la tarjeta del plan"
                        />
                      </div>
                    </div>
                  </q-card>
                </div>

                <div class="col-12">
                  <q-card flat bordered class="q-pa-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="settings" class="q-mr-sm" />
                      Configuración del Plan
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6">
                        <q-checkbox
                          v-model="form.has_api_access"
                          label="Acceso a APIs Externas"
                          color="primary"
                        />
                        <div class="text-caption text-grey-7 q-ml-lg">
                          Permite conexión con ARCA y otras APIs
                        </div>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-checkbox
                          v-model="form.is_active"
                          label="Plan Activo"
                          color="positive"
                        />
                        <div class="text-caption text-grey-7 q-ml-lg">
                          Disponible para nuevas suscripciones
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Pricing Tab -->
            <q-tab-panel name="pricing">
              <div class="row q-col-gutter-sm scroll" style="height: calc(100vh - 240px);">
                <div class="col-12">
                  <q-card flat bordered class="q-pa-md q-mb-sm">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="attach_money" class="q-mr-sm" />
                      Configuración de Precios
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-input
                          filled
                          v-model.number="form.price"
                          label="Precio Mensual"
                          dense
                          type="number"
                          step="0.01"
                          min="0"
                          prefix="$"
                          suffix="/ mes"
                          :rules="[val => val >= 0 || 'El precio debe ser mayor o igual a 0']"
                          hint="Precio base del plan. Usar 0 para planes gratuitos"
                        />
                      </div>

                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-input
                          filled
                          v-model.number="form.price_per_branch"
                          label="Precio por Sucursal Adicional"
                          dense
                          type="number"
                          step="0.01"
                          min="0"
                          prefix="$"
                          suffix="/ mes"
                          hint="Costo adicional por cada sucursal extra (opcional)"
                        />
                      </div>
                    </div>
                  </q-card>
                </div>

                <div class="col-12">
                  <q-card flat bordered class="q-pa-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="rule" class="q-mr-sm" />
                      Límites y Restricciones
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                        <q-input
                          filled
                          v-model.number="form.max_users"
                          label="Máximo de Usuarios"
                          dense
                          type="number"
                          min="1"
                          hint="Dejar vacío para ilimitado"
                        />
                      </div>

                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                        <q-input
                          filled
                          v-model.number="form.max_branch_offices"
                          label="Máximo de Sucursales"
                          dense
                          type="number"
                          min="1"
                          hint="Dejar vacío para ilimitado"
                        />
                      </div>

                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                        <q-input
                          filled
                          v-model.number="form.trial_days"
                          label="Días de Prueba Gratis"
                          dense
                          type="number"
                          min="0"
                          suffix="días"
                        />
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- Features Tab -->
            <q-tab-panel name="features">
              <div class="row q-col-gutter-sm scroll" style="height: calc(100vh - 240px);">
                <div class="col-12">
                  <q-banner rounded class="bg-blue-1 q-mb-sm">
                    <template v-slot:avatar>
                      <q-icon name="info" color="blue" />
                    </template>
                    <div class="text-caption">
                      Agrega las características que estarán incluidas en este plan.
                      Estas se mostrarán a los clientes al momento de elegir su suscripción.
                    </div>
                  </q-banner>
                </div>

                <div class="col-12">
                  <q-card flat bordered class="q-pa-md q-mb-sm">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="checklist" class="q-mr-sm" />
                      Características del Plan
                    </div>
                    <div
                      v-for="(feature, index) in form.features"
                      :key="index"
                      class="row q-col-gutter-sm q-mb-sm items-center"
                    >
                      <div class="col-auto">
                        <q-icon name="check_circle" color="positive" size="sm" />
                      </div>
                      <div class="col">
                        <q-input
                          filled
                          v-model="form.features[index]"
                          dense
                          placeholder="Ej: Acceso completo al sistema de facturación"
                        />
                      </div>
                      <div class="col-auto">
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="delete"
                          @click="removeFeature(index)"
                          :disable="form.features.length === 1"
                        >
                          <q-tooltip>Eliminar característica</q-tooltip>
                        </q-btn>
                      </div>
                    </div>

                    <div class="text-center q-mt-md">
                      <q-btn
                        flat
                        color="primary"
                        icon="add"
                        label="Agregar Característica"
                        @click="addFeature"
                      />
                    </div>
                  </q-card>
                </div>

                <div class="col-12">
                  <q-card flat bordered class="q-pa-md bg-grey-1">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="visibility" class="q-mr-sm" />
                      Vista Previa
                    </div>
                    <div class="text-caption text-grey-7 q-mb-md">
                      Así se verán las características en la tarjeta del plan:
                    </div>
                    <q-list bordered separator class="rounded-borders bg-white">
                      <q-item v-for="(feature, index) in form.features.filter(f => f.trim())" :key="index">
                        <q-item-section avatar>
                          <q-icon name="check_circle" color="positive" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ feature }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>

          <q-card-actions align="right" class="text-primary q-gutter-sm">
            <q-btn
              color="secondary"
              label="Cancelar"
              @click="closeDialog"
            />
            <q-btn
              color="primary"
              :label="isEditing ? 'Actualizar' : 'Guardar'"
              type="submit"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 400px;">
        <q-card-section>
          <div class="text-h6">¿Eliminar Plan?</div>
        </q-card-section>

        <q-card-section>
          <p>¿Está seguro que desea eliminar el plan <strong>{{ planToDelete?.name }}</strong>?</p>
          <p class="text-caption text-grey-7">
            Esta acción no se puede deshacer. Solo se pueden eliminar planes sin suscripciones activas.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            unelevated
            label="Eliminar"
            color="negative"
            @click="deletePlan"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'

export default {
  name: 'SubscriptionPlansPage',
  setup () {
    const plans = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const showDialog = ref(false)
    const showDeleteDialog = ref(false)
    const isEditing = ref(false)
    const planToDelete = ref(null)
    const tab = ref('general')

    const pagination = ref({
      rowsPerPage: 10
    })

    const columns = [
      {
        name: 'name',
        label: 'Nombre',
        align: 'left',
        field: 'name',
        sortable: true
      },
      {
        name: 'slug',
        label: 'Slug',
        align: 'left',
        field: 'slug',
        sortable: true
      },
      {
        name: 'price',
        label: 'Precio',
        align: 'left',
        field: 'price',
        sortable: true
      },
      {
        name: 'features',
        label: 'Características',
        align: 'left',
        field: 'features'
      },
      {
        name: 'has_api_access',
        label: 'API',
        align: 'center',
        field: 'has_api_access',
        sortable: true
      },
      {
        name: 'is_active',
        label: 'Estado',
        align: 'center',
        field: 'is_active',
        sortable: true
      },
      {
        name: 'actions',
        label: 'Acciones',
        align: 'center'
      }
    ]

    const form = ref({
      name: '',
      slug: '',
      description: '',
      price: 0,
      price_per_branch: 0,
      features: [''],
      max_users: null,
      max_branch_offices: null,
      trial_days: 0,
      has_api_access: false,
      is_active: true
    })

    const loadPlans = async () => {
      loading.value = true
      try {
        const { data } = await api.get('subscription-plans')
        plans.value = data
      } catch (error) {
        notify(error.response?.data?.message || 'Error al cargar planes', 'negative', 'warning')
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
        features: [''],
        max_users: null,
        max_branch_offices: null,
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
        features: [...plan.features],
        max_users: plan.max_users,
        max_branch_offices: plan.max_branch_offices,
        trial_days: plan.trial_days || 0,
        has_api_access: plan.has_api_access,
        is_active: plan.is_active
      }
      showDialog.value = true
    }

    const closeDialog = () => {
      showDialog.value = false
      tab.value = 'general'
    }

    const addFeature = () => {
      form.value.features.push('')
    }

    const removeFeature = (index) => {
      form.value.features.splice(index, 1)
    }

    const savePlan = async () => {
      // Validar que al menos haya una característica
      const validFeatures = form.value.features.filter(f => f.trim() !== '')
      if (validFeatures.length === 0) {
        notify('Debe agregar al menos una característica', 'warning', 'warning')
        return
      }

      saving.value = true
      try {
        const payload = {
          ...form.value,
          features: validFeatures
        }

        if (isEditing.value) {
          await api.put(`subscription-plans/${form.value.id}`, payload)
          notify('Plan actualizado exitosamente', 'positive', 'check_circle')
        } else {
          await api.post('subscription-plans', payload)
          notify('Plan creado exitosamente', 'positive', 'check_circle')
        }

        showDialog.value = false
        await loadPlans()
      } catch (error) {
        notify(error.response?.data?.message || 'Error al guardar el plan', 'negative', 'warning')
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
        notify('Plan eliminado exitosamente', 'positive', 'check_circle')
        showDeleteDialog.value = false
        await loadPlans()
      } catch (error) {
        notify(error.response?.data?.message || 'Error al eliminar el plan', 'negative', 'warning')
      } finally {
        deleting.value = false
      }
    }

    onMounted(() => {
      loadPlans()
    })

    return {
      plans,
      loading,
      saving,
      deleting,
      showDialog,
      showDeleteDialog,
      isEditing,
      planToDelete,
      tab,
      pagination,
      columns,
      form,
      openCreateDialog,
      openEditDialog,
      closeDialog,
      addFeature,
      removeFeature,
      savePlan,
      confirmDelete,
      deletePlan
    }
  }
}
</script>

<style lang="scss" scoped>
.q-page {
  background: #f5f5f5;
}
</style>
