<template>
  <q-page padding>
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center q-gutter-x-sm">
        <span class="text-h6">
          Métodos de pago
        </span>
        <div class="text-right q-gutter-x-sm">
          <q-btn
            round
            icon="add"
            color="primary"
            @click="openAddPaymentMethod = true"
          />
        </div>
      </div>

      <q-table
        title="Métodos de pago"
        row-key="id"
        :columns="columns"
        :rows="paymentMethods"
        :loading="visible"
        :filter="filter"
        binary-state-sort
        v-model:pagination="paginationConfig"
        @row-click="editPaymentMethod"
        @request="setPagination"
        no-data-label="Registro no encontrado"
        :grid="$q.screen.lt.md"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <template v-slot:top>
          <div class="flex justify-end items-center full-width">
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>

        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="editPaymentMethod(null, props.row)">
              <span class="q-focus-helper"></span>

              <q-card-section class="row justify-between items-start compact-card-header">
                <div class="column">
                   <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">{{ props.row.name }}</div>
                   <div class="text-caption text-grey-6 text-weight-medium">{{ props.row.acronym || 'sin acrónimo' }}</div>
                </div>
                <div class="column items-end">
                   <q-badge
                     v-if="props.row.bill"
                     color="teal"
                     label="Factura"
                     class="q-py-xs q-px-sm text-weight-bold shadow-1"
                     rounded
                     style="font-size: 10px; letter-spacing: 0.5px"
                   />
                </div>
              </q-card-section>

              <q-separator color="grey-2" inset />

              <q-card-section class="compact-card-body">
                <div class="row q-col-gutter-y-sm">
                  <div class="col-6">
                     <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Código</div>
                     <div class="text-body2 text-grey-9 text-weight-bold">{{ props.row.id }}</div>
                  </div>
                  <div class="col-6 text-right">
                     <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Porcentaje</div>
                     <div class="text-body2 text-grey-9 text-weight-bold">{{ props.row.percentage ? props.row.percentage + '%' : '-' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>

    <!-- Dialogo de Edición -->
    <q-dialog v-model="openEditPaymentMethod" persistent :maximized="$q.screen.lt.sm">
      <q-card :class="$q.screen.lt.sm ? 'full-height column' : ''" :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 85vw;'}`">
        <q-form @submit="saveEdit" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Modificar método de pago</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section class="scroll col q-pt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="text-subtitle1 text-weight-bold q-mb-xs">Información general</div>
              </div>
              <div class="col-12">
                <q-input
                  filled
                  dense
                  hide-bottom-space
                  autofocus
                  label="Nombre"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  v-model="paymentMethod.name"
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  dense
                  hide-bottom-space
                  label="Acrónimo"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  v-model="paymentMethod.acronym"
                  hint="Código corto (ej: EFE, TAR, TRA)"
                  maxlength="10"
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  dense
                  hide-bottom-space
                  label="Porcentaje de descuento"
                  type="number"
                  v-model.number="paymentMethod.percentage"
                />
              </div>
              <div class="col-12 flex items-center">
                <q-checkbox
                  v-model="paymentMethod.bill"
                  label="¿Facturar?"
                  dense
                />
              </div>

              <div class="col-12 q-mt-sm">
                <div class="text-subtitle1 text-weight-bold q-mb-xs">Datos de pago</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="(attribute, index) in paymentMethod.attributes"
                    :key="index"
                    class="col-12"
                  >
                    <q-input
                      v-model="attribute.attribute_name"
                      filled
                      dense
                      hide-bottom-space
                      label="Nombre del atributo"
                      @keypress.stop.enter="addAttribute"
                    >
                      <template #append>
                        <q-btn
                          v-if="index === paymentMethod.attributes.length - 1"
                          color="primary"
                          icon="add"
                          round
                          size="sm"
                          @click="addAttribute"
                          unelevated
                        />
                        <q-btn
                          v-if="paymentMethod.attributes.length > 1"
                          round
                          color="negative"
                          icon="delete"
                          size="sm"
                          :loading="deleteLoading[attribute.attribute_name]"
                          @click="deleteAttribute(index)"
                          unelevated
                        />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn color="negative" outline label="Eliminar" @click="deletePaymentMethod" :loading="visible" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible" unelevated/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialogo de Agregar -->
    <q-dialog v-model="openAddPaymentMethod" persistent :maximized="$q.screen.lt.sm">
      <q-card :class="$q.screen.lt.sm ? 'full-height column' : ''" :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 85vw;'}`">
        <q-form @submit="savePaymentMethod" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Agregar método de pago</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section class="scroll col q-pt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="text-subtitle1 text-weight-bold q-mb-xs">Información general</div>
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  hide-bottom-space
                  v-model="paymentMethod.name"
                  autofocus
                  label="Nombre"
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  dense
                  hide-bottom-space
                  label="Acrónimo"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  v-model="paymentMethod.acronym"
                  hint="Código corto (ej: EFE, TAR, TRA)"
                  maxlength="10"
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  dense
                  hide-bottom-space
                  label="Porcentaje de descuento"
                  type="number"
                  v-model.number="paymentMethod.percentage"
                />
              </div>
              <div class="col-12 flex items-center">
                <q-checkbox
                  v-model="paymentMethod.bill"
                  label="¿Facturar?"
                  dense
                />
              </div>

              <div class="col-12 q-mt-sm">
                <div class="text-subtitle1 text-weight-bold q-mb-xs">Datos de pago</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="(attribute, index) in paymentMethod.attributes"
                    :key="index"
                    class="col-12"
                  >
                    <q-input
                      v-model="attribute.attribute_name"
                      filled
                      dense
                      hide-bottom-space
                      label="Nombre del atributo"
                      @keypress.stop.enter="addAttribute"
                    >
                      <template #append>
                        <q-btn
                          v-if="index === paymentMethod.attributes.length - 1"
                          color="primary"
                          icon="add"
                          round
                          size="sm"
                          @click="addAttribute"
                          unelevated
                        />
                        <q-btn
                          v-if="paymentMethod.attributes.length > 1"
                          round
                          color="negative"
                          icon="delete"
                          size="sm"
                          :loading="deleteLoading[attribute.attribute_name]"
                          @click="deleteAttribute(index)"
                          unelevated
                        />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible" class="full-width" unelevated/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
export default {
  data () {
    return {
      paymentMethods: [],
      paymentMethod: {
        attributes: [{}],
        bill: false
      },
      deleteLoading: {},
      filter: '',
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 20,
        dataSearch: {
          id: '',
          name: ''
        }
      },
      visible: false,
      openAddPaymentMethod: false,
      openEditPaymentMethod: null,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
        {
          name: 'acronym',
          align: 'left',
          label: 'Acrónimo',
          field: 'acronym',
          sortable: true,
          format: val => val || 'sin acrónimo'
        },
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'percentage',
          align: 'left',
          label: 'Porcentaje',
          field: 'percentage',
          sortable: true,
          format: val => val ? `${val}%` : '-'
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 0,
        page: 1,
        sortBy: 'id',
        descending: true
      }
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
  },
  watch: {
    filter (data) {
      if (data === null || data === undefined) return
      this.searchData(data)
    }
  },
  methods: {
    addAttribute () {
      if (!this.paymentMethod.attributes) {
        this.paymentMethod.attributes = []
      }
      this.paymentMethod.attributes.push({ attribute_name: '' })
    },
    deleteAttribute (index) {
      this.paymentMethod.attributes.splice(index, 1)
    },
    closeModal () {
      this.openAddPaymentMethod = false
      this.openEditPaymentMethod = false
      this.paymentMethod = {
        attributes: [{}],
        bill: false
      }
    },
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getPaymentMethods(this.params)
    },
    getPaymentMethods (params = this.params) {
      this.visible = true
      this.$api.get('payment-methods', { params })
        .then(({ data }) => {
          this.paymentMethods = data.data
          this.visible = false
          this.paginationConfig.rowsNumber = data.total
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'desc' : 'asc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getPaymentMethods(this.params)
    },
    savePaymentMethod () {
      this.visible = true
      const payload = {
        ...this.paymentMethod,
        is_billing: !!this.paymentMethod.bill
      }
      this.$api.post('payment-methods', payload)
        .then(({ data }) => {
          this.getPaymentMethods()
          this.closeModal()
          this.visible = false
          Notify.create({
            message: 'Método de pago creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    editPaymentMethod (event, row) {
      this.paymentMethod = JSON.parse(JSON.stringify(row))
      this.paymentMethod.attributes = row?.attributes?.length > 0 ? JSON.parse(JSON.stringify(row.attributes)) : [{ attribute_name: '' }]
      this.paymentMethod.bill = !!row.bill
      this.openEditPaymentMethod = true
    },
    saveEdit () {
      this.visible = true
      const payload = {
        ...this.paymentMethod,
        is_billing: !!this.paymentMethod.bill
      }
      this.$api.put(`payment-methods/${this.paymentMethod.id}`, payload)
        .then(({ data }) => {
          this.getPaymentMethods()
          this.closeModal()
          this.visible = false
          Notify.create({
            message: 'Método de pago editado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    deletePaymentMethod () {
      Notify.create({
        message: '¿Estás seguro de que deseas eliminar este método de pago?',
        icon: 'warning',
        color: 'negative',
        actions: [
          { label: 'Cancelar', color: 'white', handler: () => { } },
          {
            label: 'Eliminar',
            color: 'white',
            handler: () => {
              this.visible = true
              this.$api.delete(`payment-methods/${this.paymentMethod.id}`)
                .then(({ data }) => {
                  this.getPaymentMethods()
                  this.closeModal()
                  this.visible = false
                  Notify.create({
                    message: 'Método de pago eliminado exitosamente',
                    icon: 'check_circle',
                    color: 'positive'
                  })
                })
                .catch(err => {
                  this.visible = false
                  Notify.create({
                    message: err.message,
                    icon: 'warning',
                    color: 'negative'
                  })
                })
            }
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.compact-card-header {
  padding: 0.8rem 1rem !important;
}

.compact-card-body {
  padding: 0.8rem 1rem !important;
}

.transition-all {
  transition: all 0.3s ease;
}

.q-hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

@media (max-width: 1023px) {
  :deep(.q-table__top) {
    padding: 0 !important;
  }
  :deep(.q-table__top .flex) {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: center;
  }

  :deep(.q-table__top .q-select) {
    max-width: 150px;
  }

  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}
</style>
