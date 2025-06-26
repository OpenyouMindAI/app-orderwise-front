<template>
  <q-dialog v-model="showDialog" persistent transition-show="slide-up" transition-hide="slide-down">
    <q-card class="bulk-price-dialog" style="max-width: 90vw; width: 1200px;">
      <!-- Header elegante -->
      <q-card-section class="dialog-header">
        <div class="row items-center">
          <div class="header-icon-wrapper">
            <q-icon name="tune" size="24px" />
          </div>
          <div class="header-content">
            <div class="header-title">Ajuste Masivo de Precios</div>
            <div class="header-subtitle">{{ products.length }} productos seleccionados</div>
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            size="md"
            class="close-btn"
            @click="closeDialog"
          />
        </div>
      </q-card-section>
      <q-card-section v-show="alertProductAll">
        <q-banner inline-actions rounded class="bg-negative text-white" dense>
          <template v-slot:avatar>
            <q-icon name="warning" />
          </template>
          <span v-if="typeof products === 'string' && products === 'all'">
            Esta acción afectara a todos los productos
          </span>
          <template v-slot:action>
            <q-btn icon="close" flat dense @click="alertProductAll = false"/>
          </template>
        </q-banner>
      </q-card-section>

      <!-- Contenido principal con layout de dos columnas -->
      <q-card-section class="dialog-content">
        <div class="content-grid">

          <!-- Columna izquierda - Configuración -->
          <div class="config-panel">
            <q-form @submit="updatePrices" class="config-form">

              <!-- Sucursales -->
              <div class="form-section">
                <q-select
                  v-model="form.branchOffice"
                  :options="branchOffices"
                  label="Seleccionar sucursales"
                  multiple
                  option-label="name"
                  option-value="id"
                  filled
                  :rules="[val => !!val?.length || 'Selecciona al menos una sucursal']"
                  class="custom-select"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" color="primary" />
                  </template>
                </q-select>
              </div>

              <!-- Tipo de operación -->
              <div class="form-section">
                <div class="section-header">
                  <q-icon name="swap_vert" class="section-icon" />
                  <span class="section-title">Tipo de Ajuste</span>
                </div>
                <div class="operation-buttons">
                  <q-btn
                    :class="['operation-btn', form.updateType === 'increase' ? 'active increase' : '']"
                    @click="form.updateType = 'increase'"
                    no-caps
                  >
                    <q-icon name="trending_up" class="q-mr-sm" />
                    Aumentar
                  </q-btn>
                  <q-btn
                    :class="['operation-btn', form.updateType === 'decrease' ? 'active decrease' : '']"
                    @click="form.updateType = 'decrease'"
                    no-caps
                  >
                    <q-icon name="trending_down" class="q-mr-sm" />
                    Disminuir
                  </q-btn>
                </div>
              </div>

              <!-- Base de cálculo -->
              <div class="form-section">
                <div class="section-header">
                  <q-icon name="calculate" class="section-icon" />
                  <span class="section-title">Base de Cálculo</span>
                </div>
                <div class="calculation-buttons">
                  <q-btn
                    :class="['calc-btn', form.field === 'price' ? 'active' : '']"
                    @click="form.field = 'price'"
                    no-caps
                  >
                    <q-icon name="attach_money" class="q-mr-sm" />
                    Precio Actual
                  </q-btn>
                  <q-btn
                    :class="['calc-btn', form.field === 'cost' ? 'active' : '']"
                    @click="form.field = 'cost'"
                    no-caps
                  >
                    <q-icon name="receipt" class="q-mr-sm" />
                    Costo
                  </q-btn>
                </div>
              </div>

              <!-- Opciones adicionales -->
              <div class="form-section">
                <div class="section-header">
                  <q-icon name="settings" class="section-icon" />
                  <span class="section-title">Opciones</span>
                </div>
                <div class="options-card">
                  <q-checkbox
                    v-model="form.create"
                    label="Crear listas de precios si no existen"
                    color="primary"
                    class="option-checkbox"
                  />
                </div>
              </div>

            </q-form>
          </div>

          <!-- Columna derecha - Precios -->
          <div class="prices-panel">
            <div class="prices-header">
              <div class="prices-title flex q-gutter-x-sm">
                <q-icon name="local_offer" class="q-mr-sm" />
                <span>
                  Configuración de Precios
                </span>
                <span v-if="typeof products === 'string' && products === 'all'" class="text-negative">
                    Todos los productos
                </span>
              </div>
              <q-btn
                icon="add"
                round
                size="sm"
                color="primary"
                @click="addPriceField"
                class="add-price-btn"
              >
                <q-tooltip>Agregar precio</q-tooltip>
              </q-btn>
            </div>

            <div class="prices-content scroll q-pt-sm" style="max-height: calc(100vh - 320px);">
              <transition-group name="price-item" tag="div" class="prices-list">
                <div
                  v-for="(percentage, index) in form.percentage"
                  :key="`price-${index}`"
                  class="price-item"
                >
                  <div class="price-card">
                    <q-input
                      v-model.number="form.percentage[index]"
                      type="number"
                      outlined
                      :label="`Precio ${index + 1}`"
                      :rules="[val => val >= 0 || 'Debe ser positivo']"
                      min="0"
                      step="0.01"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          :name="form.updateType === 'increase' ? 'add' : 'remove'"
                          :color="form.updateType === 'increase' ? 'positive' : 'warning'"
                        />
                      </template>
                      <template v-slot:append>
                        <span class="q-mr-xs">%</span>
                        <q-btn
                          v-if="form.percentage.length > 1"
                          icon="close"
                          flat
                          round
                          size="xs"
                          @click.stop="removePriceField(index)"
                          class="remove-btn"
                        />
                      </template>
                    </q-input>
                  </div>
                </div>
              </transition-group>

              <div v-if="form.percentage.length === 0" class="empty-prices">
                <q-icon name="local_offer" size="48px" color="grey-4" />
                <div class="empty-text">No hay precios configurados</div>
                <q-btn
                  label="Agregar primer precio"
                  color="primary"
                  outline
                  @click="addPriceField"
                  class="q-mt-md"
                />
              </div>
            </div>
          </div>

        </div>
      </q-card-section>

      <!-- Footer con acciones -->
      <q-card-section class="dialog-footer">
        <div class="footer-actions">
          <q-btn
            label="Cancelar"
            flat
            color="grey-7"
            @click="closeDialog"
            :disable="loading"
            class="cancel-btn"
          />
          <q-btn
            label="Aplicar Cambios"
            color="primary"
            :loading="loading"
            @click="updatePrices"
            :disable="!hasValidPercentages"
            class="apply-btn"
          >
            <q-icon name="check" class="q-ml-sm" />
          </q-btn>
        </div>
      </q-card-section>

      <!-- Loading overlay -->
      <q-inner-loading :showing="loading" class="custom-loading">
        <div class="loading-content">
          <q-spinner-dots size="50px" color="primary" />
          <div class="loading-text">Actualizando precios...</div>
          <div class="loading-subtext">Por favor espera un momento</div>
        </div>
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState } from 'pinia'
import { Notify } from 'quasar'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'

export default {
  name: 'BulkPriceDialog',
  props: {
    products: {
      type: [Array, String],
      default: () => []
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'updated'],
  data () {
    return {
      alertProductAll: true,
      loading: false,
      form: {
        branchOffice: [],
        updateType: 'increase',
        percentage: [0, 0, 0, 0],
        field: 'price',
        create: false
      },
      branchOffices: []
    }
  },
  computed: {
    ...mapState(authentication, ['userSession']),
    showDialog: {
      get () {
        return this.modelValue
      },
      set (value) {
        this.$emit('update:modelValue', value)
      }
    },
    hasValidPercentages () {
      return Array.isArray(this.form.percentage) &&
        this.form.percentage.some(p => Number(p) > 0)
    }
  },
  watch: {
    showDialog (newVal) {
      if (newVal) {
        this.loadData()
      }
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    async getBranchOffice () {
      try {
        const params = {}
        if (!this.userSession.is_root) {
          params.dataEqualFilter = {
            'branchOfficeUsers.user_id': this.userSession.id
          }
        }
        const { data } = await this.$api.get('branch-offices', { params })
        this.branchOffices = data
        // Seleccionar todas por defecto
        this.form.branchOffice = this.branchOffices
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },

    async loadData () {
      try {
        await this.getBranchOffice()
      } catch (error) {
        Notify.create({
          message: 'Error al cargar datos',
          color: 'negative',
          icon: 'error'
        })
      }
    },

    addPriceField () {
      this.form.percentage.push(0)
    },

    removePriceField (index) {
      this.form.percentage.splice(index, 1)
    },

    async updatePrices () {
      if (!this.hasValidPercentages) {
        Notify.create({
          message: 'Ingresa al menos un porcentaje mayor a 0',
          color: 'warning',
          icon: 'warning'
        })
        return
      }

      this.loading = true

      try {
        const payload = {
          update_type: this.form.updateType,
          percentage: this.form.percentage,
          field: this.form.field,
          branch_office_ids: this.form.branchOffice.map(bo => bo.id),
          product_ids: typeof this.products === 'string' ? this.products : this.products.map(p => p.id),
          create: this.form.create
        }

        const { data } = await this.$api.post('bulk-price-update', payload)

        this.showSuccessMessage(data)
        this.$emit('updated', data)
        this.closeDialog()
      } catch (error) {
        Notify.create({
          message: error.message || 'Error al actualizar precios',
          color: 'negative',
          icon: 'error',
          timeout: 4000
        })
      } finally {
        this.loading = false
      }
    },

    showSuccessMessage (response) {
      const { message, updated_count: updatedCount, created_count: createdCount, total_affected: totalAffected } = response

      Notify.create({
        message: message || 'Operación completada exitosamente',
        color: 'positive',
        icon: 'check_circle',
        timeout: 5000,
        actions: [
          {
            icon: 'close',
            color: 'white',
            round: true,
            handler: () => {}
          }
        ]
      })

      if (totalAffected > 0) {
        setTimeout(() => {
          const details = []
          if (updatedCount > 0) details.push(`${updatedCount} actualizados`)
          if (createdCount > 0) details.push(`${createdCount} creados`)

          Notify.create({
            message: `Total: ${totalAffected} registros afectados (${details.join(', ')})`,
            color: 'info',
            icon: 'info',
            timeout: 4000,
            position: 'bottom-right'
          })
        }, 1000)
      }
    },

    closeDialog () {
      this.showDialog = false
      this.resetForm()
      this.$emit('close')
    },

    resetForm () {
      this.form = {
        branchOffice: [],
        updateType: 'increase',
        percentage: [0, 0, 0, 0],
        field: 'price',
        create: false
      }
    }
  }
}
</script>

<style scoped>
/* Header */
.dialog-header {
  background: #ff9f43;
  color: white;
  padding: 20px 24px;
  border-radius: 0;
}

.header-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  margin-right: 16px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Content Grid */
.dialog-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.content-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
}
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.section-icon {
  color: #667eea;
  margin-right: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.custom-select {
  background: white;
  border-radius: 12px;
}

/* Operation Buttons */
.operation-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.operation-btn {
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #64748b;
  transition: all 0.3s ease;
}

.operation-btn:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.operation-btn.active.increase {
  border-color: #10b981;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.operation-btn.active.decrease {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

/* Calculation Buttons */
.calculation-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.calc-btn {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  transition: all 0.3s ease;
}

.calc-btn:hover {
  border-color: #cbd5e1;
}

.calc-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

/* Options */
.options-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.option-checkbox {
  font-size: 14px;
}

/* Summary */
.summary-card {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
}

.summary-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.summary-title {
  font-weight: 600;
  color: #0c4a6e;
  margin-left: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-label {
  color: #64748b;
  font-size: 14px;
}

.summary-value {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

/* Prices Panel */
.prices-panel {
  background: white;
  padding: 0px 24px;
  overflow-y: auto;
}

.prices-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.prices-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.add-price-btn {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.prices-list {
  display: flex;
  flex-direction: column;
}

/* Price Items */
.price-item {
  transition: all 0.3s ease;
}

.price-card {
  transition: all 0.3s ease;
}

.price-card:hover {
  transform: translateY(-2px);
}

.price-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.price-label {
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.remove-btn {
  color: #ef4444;
}

.price-input {
  background: white;
  border-radius: 8px;
}

/* Empty State */
.empty-prices {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
}

.empty-text {
  font-size: 16px;
  color: #64748b;
  margin-top: 16px;
}

/* Footer */
.dialog-footer {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 20px 24px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 12px 24px;
  border-radius: 8px;
}

.apply-btn {
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Loading */
.custom-loading {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.loading-content {
  text-align: center;
}

.loading-text {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-top: 16px;
}

.loading-subtext {
  font-size: 14px;
  color: #64748b;
  margin-top: 8px;
}

/* Animations */
.price-item-enter-active,
.price-item-leave-active {
  transition: all 0.3s ease;
}

.price-item-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.price-item-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .config-panel {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>
