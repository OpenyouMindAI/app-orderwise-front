<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right q-gutter-sm">
        <!-- <q-btn
          color="blue"
          @click="multipleSelected = !multipleSelected"
          :icon="multipleSelected ? 'check_box' : 'check_box_outline_blank'"
          label="Seleccionar múltiples"
        /> -->
        <!-- <q-btn
          color="negative"
          @click="deleteMassive"
          icon="delete"
          v-if="selection.length"
          label="Eliminar masivo"
        /> -->
        <!-- <q-btn
          color="secondary"
          @click="download"
          icon="download"
          label="Exportar excel"
        /> -->
        <q-btn
          color="positive"
          @click="openCreateModal"
          icon="add"
          label="Agregar Promoción"
        />
        <!-- <q-btn
          color="primary"
          @click="dialogFilter = true"
          icon="filter_alt"
          label="Filtrar Promociones"
        /> -->
      </div>
      <div class="col-12">
        <q-table
          title="Promociones"
          row-key="id"
          :columns="columns"
          :rows="promotions"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          :selection="multipleSelected ? 'multiple' : 'none'"
          v-model:selected="selection"
          v-model:pagination="paginationConfig"
          @row-click="editPromotion"
          @request="setPagination"
          no-data-label="Registro no encontrado"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top-right>
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                :label="getStatusLabel(props.row.status)"
                size="sm"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Modal Reutilizable para Crear/Editar Promociones -->
    <DemoModalPage
      v-model="openPromotionModal"
      :edit-mode="editMode"
      :promotion-data="selectedPromotion"
      @promotion-saved="handlePromotionSaved"
      @promotion-updated="handlePromotionUpdated"
    />

    <!-- Modal para Agregar Promoción -->
    <q-dialog v-model="openAddPromotion" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 1000px; max-width: 95vw;">
        <q-card-section class="row items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Agregar promoción</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="savePromotion" ref="formAddPromotion">
          <q-card-section class="scroll" style="height: calc(100vh - 200px);">
            <div class="row q-col-gutter-sm">
              <!-- Datos básicos -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md q-mb-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="local_offer" class="q-mr-sm" />
                    Datos básicos
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                      <q-input
                        :rules="[val => !!val || 'El campo es requerido.']"
                        filled
                        v-model="promotion.name"
                        label="Nombre de la promoción"
                        dense
                      />
                    </div>
                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                      <q-select
                        filled
                        label="Tipo de promoción"
                        v-model="promotion.promotion_type"
                        :options="promotionTypes"
                        :rules="[val => !!val || 'El campo es requerido.']"
                        dense
                      />
                    </div>
                    <div class="col-12">
                      <q-input
                        filled
                        v-model="promotion.description"
                        type="textarea"
                        autogrow
                        label="Descripción"
                        dense
                      />
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- Fechas y vigencia -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md q-mb-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="event" class="q-mr-sm" />
                    Vigencia
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                      <q-input
                        filled
                        v-model="promotion.start_date"
                        label="Fecha de inicio"
                        type="date"
                        dense
                        :rules="[val => !!val || 'El campo es requerido.']"
                      />
                    </div>
                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                      <q-input
                        filled
                        v-model="promotion.end_date"
                        label="Fecha de fin"
                        type="date"
                        dense
                        :rules="[val => !!val || 'El campo es requerido.']"
                      />
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- Configuración del descuento -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md q-mb-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="percent" class="q-mr-sm" />
                    Configuración del descuento
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                      <q-select
                        filled
                        label="Tipo de descuento"
                        v-model="promotion.discount_type"
                        :options="discountTypes"
                        dense
                      />
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                      <q-input
                        filled
                        v-model="promotion.discount_value"
                        label="Valor del descuento"
                        type="number"
                        step="0.01"
                        dense
                        :rules="[val => val > 0 || 'El valor debe ser mayor a 0']"
                      />
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                      <q-input
                        filled
                        v-model="promotion.minimum_amount"
                        label="Compra mínima"
                        type="number"
                        step="0.01"
                        dense
                      />
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- Configuración adicional -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="settings" class="q-mr-sm" />
                    Configuración
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-6">
                      <q-toggle
                        v-model="promotion.is_active"
                        label="Promoción activa"
                        :true-value="1"
                        :false-value="0"
                        color="positive"
                      />
                    </div>
                    <div class="col-6">
                      <q-toggle
                        v-model="promotion.is_cumulative"
                        label="Acumulable con otras promociones"
                        :true-value="1"
                        :false-value="0"
                        color="positive"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        filled
                        v-model="promotion.max_uses"
                        label="Máximo de usos (opcional)"
                        type="number"
                        dense
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        filled
                        v-model="promotion.uses_per_customer"
                        label="Usos por cliente (opcional)"
                        type="number"
                        dense
                      />
                    </div>
                  </div>
                </q-card>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary q-pa-md">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible" unelevated />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Modal para Editar Promoción -->
    <q-dialog v-model="openEditPromotion" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 1000px; max-width: 95vw;">
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <div class="text-h6">Modificar promoción</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="saveEdit">
          <q-card-section class="scroll" style="height: calc(100vh - 200px);">
            <div class="row q-col-gutter-sm">
              <!-- Datos básicos -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md q-mb-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="local_offer" class="q-mr-sm" />
                    Datos básicos
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                      <q-input
                        :rules="[val => !!val || 'El campo es requerido.']"
                        filled
                        v-model="promotion.name"
                        label="Nombre de la promoción"
                        dense
                      />
                    </div>
                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                      <q-select
                        filled
                        label="Tipo de promoción"
                        v-model="promotion.promotion_type"
                        :options="promotionTypes"
                        :rules="[val => !!val || 'El campo es requerido.']"
                        dense
                      />
                    </div>
                    <div class="col-12">
                      <q-input
                        filled
                        v-model="promotion.description"
                        type="textarea"
                        autogrow
                        label="Descripción"
                        dense
                      />
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- Fechas y vigencia -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md q-mb-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="event" class="q-mr-sm" />
                    Vigencia
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                      <q-input
                        filled
                        v-model="promotion.start_date"
                        label="Fecha de inicio"
                        type="date"
                        dense
                        :rules="[val => !!val || 'El campo es requerido.']"
                      />
                    </div>
                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                      <q-input
                        filled
                        v-model="promotion.end_date"
                        label="Fecha de fin"
                        type="date"
                        dense
                        :rules="[val => !!val || 'El campo es requerido.']"
                      />
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- Configuración del descuento -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md q-mb-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="percent" class="q-mr-sm" />
                    Configuración del descuento
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                      <q-select
                        filled
                        label="Tipo de descuento"
                        v-model="promotion.discount_type"
                        :options="discountTypes"
                        dense
                      />
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                      <q-input
                        filled
                        v-model="promotion.discount_value"
                        label="Valor del descuento"
                        type="number"
                        step="0.01"
                        dense
                        :rules="[val => val > 0 || 'El valor debe ser mayor a 0']"
                      />
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                      <q-input
                        filled
                        v-model="promotion.minimum_amount"
                        label="Compra mínima"
                        type="number"
                        step="0.01"
                        dense
                      />
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- Configuración adicional -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="settings" class="q-mr-sm" />
                    Configuración
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-6">
                      <q-toggle
                        v-model="promotion.is_active"
                        label="Promoción activa"
                        :true-value="1"
                        :false-value="0"
                        color="positive"
                      />
                    </div>
                    <div class="col-6">
                      <q-toggle
                        v-model="promotion.is_cumulative"
                        label="Acumulable con otras promociones"
                        :true-value="1"
                        :false-value="0"
                        color="positive"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        filled
                        v-model="promotion.max_uses"
                        label="Máximo de usos (opcional)"
                        type="number"
                        dense
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        filled
                        v-model="promotion.uses_per_customer"
                        label="Usos por cliente (opcional)"
                        type="number"
                        dense
                      />
                    </div>
                  </div>
                </q-card>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deletePromotion" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog de Filtros -->
    <q-dialog
      v-model="dialogFilter"
      position="right"
      seamless
    >
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-h6">
            Filtros
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="dialogFilter = false"
          />
        </q-card-section>

        <q-card-section class="q-pt-sm scroll" style="max-height: calc(100vh - 200px);">
          <div class="column q-gutter-y-md">

            <q-input
              v-model="filters.name"
              label="Nombre"
              filled
              dense
              clearable
            />

            <q-input
              v-model="filters.description"
              label="Descripción"
              filled
              dense
              clearable
            />

            <q-select
              dense
              filled
              label="Tipo de promoción"
              clearable
              v-model="filters.promotion_type"
              :options="promotionTypes"
            />

            <q-select
              dense
              filled
              label="Tipo de descuento"
              clearable
              v-model="filters.discount_type"
              :options="discountTypes"
            />

            <q-select
              dense
              filled
              label="Estado"
              clearable
              v-model="filters.is_active"
              :options="[{label: 'Activa', value: 1}, {label: 'Inactiva', value: 0}]"
            />

            <q-input
              v-model="filters.start_date"
              label="Fecha de inicio desde"
              type="date"
              filled
              dense
              clearable
            />

            <q-input
              v-model="filters.end_date"
              label="Fecha de fin hasta"
              type="date"
              filled
              dense
              clearable
            />

          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="secondary"
            label="Limpiar"
            @click="clearFilter"
          />
          <q-btn
            color="negative"
            label="Cerrar"
            @click="dialogFilter = false"
          />
          <q-btn
            color="primary"
            label="Aplicar"
            @click="filterPromotions"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { notify } from 'src/const/mixins'
import { Notify } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import DemoModalPage from 'src/pages/DemoModalPage.vue'
import { getDownload } from 'src/const/services'

export default {
  components: {
    DemoModalPage
  },
  data () {
    return {
      multipleSelected: false,
      promotions: [],
      selection: [],
      promotion: {
        is_active: 1,
        is_cumulative: 0
      },
      promotionTypes: [
        { label: 'Descuento por porcentaje', value: 'percentage' },
        { label: 'Descuento por monto fijo', value: 'fixed_amount' },
        { label: '2x1', value: '2x1' },
        { label: '3x2', value: '3x2' },
        { label: 'Envío gratis', value: 'free_shipping' },
        { label: 'Producto gratis', value: 'free_product' }
      ],
      discountTypes: [
        { label: 'Porcentaje (%)', value: 'percentage' },
        { label: 'Monto fijo ($)', value: 'fixed_amount' }
      ],
      filters: {
        name: null,
        description: null,
        promotion_type: null,
        discount_type: null,
        is_active: null,
        start_date: null,
        end_date: null
      },
      filter: '',
      visible: false,
      openAddPromotion: false,
      openEditPromotion: false,
      openPromotionModal: false,
      editMode: false,
      selectedPromotion: null,
      dialogFilter: false,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'ID',
          field: 'id',
          sortable: true
        },
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'finalPrice',
          align: 'right',
          label: 'Precio Final',
          field: 'finalPrice',
          format: (val) => val ? `$${val}` : '-',
          sortable: true
        },
        {
          name: 'channels',
          align: 'left',
          label: 'Canales',
          field: 'channels',
          format: (val) => Array.isArray(val) ? val.join(', ') : val || '-'
        },
        {
          name: 'selectionGroups',
          align: 'center',
          label: 'Grupos',
          field: 'selectionGroups',
          format: (val) => Array.isArray(val) ? val.length : 0
        },
        {
          name: 'status',
          align: 'center',
          label: 'Estado',
          field: 'status'
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 20,
        dataSearch: {
          id: '',
          name: '',
          description: ''
        }
      }
    }
  },
  computed: {
    branchOffice () {
      return authentication().branchOffice
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
  },
  watch: {
    branchOffice (value) {
      this.setPagination({
        pagination: this.paginationConfig,
        filter: undefined
      })
    },
    filter (data) {
      this.searchData(data)
    }
  },
  methods: {
    /**
     * Delete massive promotions
     */
    deleteMassive () {
      this.$q.dialog({
        title: 'Eliminar promociones',
        message: '¿Está seguro de eliminar las promociones seleccionadas?',
        persistent: true,
        cancel: {
          color: 'negative',
          flat: true,
          label: 'Cancelar'
        },
        ok: {
          color: 'primary',
          label: 'Aceptar'
        }
      }).onOk(async () => {
        try {
          const ids = this.selection.map(item => item.id)
          await this.$api.post('promotions/delete-massive', { ids })
          notify('Promociones eliminadas exitosamente', 'positive', 'info')
          this.getPromotions(this.params)
          this.selection = []
        } catch (error) {
          notify(error.message, 'negative', 'warning')
        }
      })
    },

    /**
     * Download data
     */
    async download () {
      getDownload(
        'excel/promotions',
        {
          branch_office_id: this.branchOffice?.id
        },
        (percentCompleted) => {
          this.loadingDownload = percentCompleted / 100
          if (percentCompleted === 100) {
            this.loadingDownload = 0
          }
        },
        (link) => {
          link.setAttribute('download', 'Promociones.xlsx')
          document.body.appendChild(link)
          link.click()
        }
      )
    },

    /**
     * Edit promotion
     */
    editPromotion (event, row) {
      this.openEditModal(row)
    },

    /**
     * Set pagination
     */
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getPromotions(this.params)
    },

    /**
     * Search data
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getPromotions(this.params)
    },

    /**
     * Get all promotions
     */
    async getPromotions (params = this.params) {
      this.visible = true
      try {
        const requestParams = {
          branch_office_id: this.branchOffice?.id,
          ...params
        }
        const { data } = await this.$api.get('/promotions', { params: requestParams })

        console.log('=== PROMOCIONES CARGADAS EN CRUD ===')
        console.log('Total de promociones:', data.length)

        // Si data es un array directo (sin paginación)
        if (Array.isArray(data)) {
          this.promotions = data
          this.paginationConfig.rowsNumber = data.length
        } else {
          // Si data tiene estructura de paginación
          this.promotions = data.data || []
          this.paginationConfig.rowsNumber = data.total || 0
        }

        // Log para debugging
        this.promotions.forEach((promo, index) => {
          console.log(`--- Promoción ${index + 1} ---`)
          console.log('ID:', promo.id)
          console.log('Nombre:', promo.name)
          console.log('Precio Final:', promo.finalPrice)
          console.log('Estado:', promo.status)
          console.log('Canales:', promo.channels)
          console.log('Grupos:', promo.selectionGroups?.length || 0)
        })

        this.visible = false
      } catch (err) {
        this.visible = false
        console.error('Error fetching promotions:', err)
        Notify.create({
          message: err.message || 'Error al cargar promociones',
          icon: 'warning',
          color: 'negative'
        })
      }
    },

    /**
     * Save promotion
     */
    savePromotion () {
      this.visible = true
      this.$api.post('promotions', this.promotion)
        .then(({ data }) => {
          this.getPromotions()
          this.openAddPromotion = false
          this.visible = false
          this.closeModal()
          Notify.create({
            message: 'Promoción creada exitosamente',
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

    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`promotions/${this.promotion.id}`, this.promotion)
        .then(({ data }) => {
          this.getPromotions()
          this.openEditPromotion = false
          this.visible = false
          this.closeModal()
          Notify.create({
            message: 'Promoción editada exitosamente',
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

    /**
     * Delete promotion
     */
    deletePromotion () {
      this.visible = true
      this.$api.delete(`promotions/${this.promotion.id}`)
        .then(({ data }) => {
          this.getPromotions()
          this.openEditPromotion = false
          this.visible = false
          this.closeModal()
          Notify.create({
            message: 'Promoción eliminada exitosamente',
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

    /**
     * Filter promotions
     */
    filterPromotions () {
      // Reiniciar los parámetros de búsqueda para evitar conflictos
      this.params.dataSearch = {}

      const dataEqualFilter = {}
      const dataSearch = {}

      // Filtros de texto (búsqueda parcial)
      if (this.filters.name) dataSearch.name = this.filters.name
      if (this.filters.description) dataSearch.description = this.filters.description

      // Filtros de selección (coincidencia exacta)
      if (this.filters.promotion_type) dataEqualFilter.promotion_type = this.filters.promotion_type.value
      if (this.filters.discount_type) dataEqualFilter.discount_type = this.filters.discount_type.value
      if (this.filters.is_active !== null) dataEqualFilter.is_active = this.filters.is_active.value
      if (this.filters.start_date) dataEqualFilter.start_date = this.filters.start_date
      if (this.filters.end_date) dataEqualFilter.end_date = this.filters.end_date

      this.params.dataEqualFilter = dataEqualFilter
      this.params.dataSearch = dataSearch

      this.getPromotions(this.params)
      this.dialogFilter = false
    },

    /**
     * Clear filters
     */
    clearFilter () {
      this.filters = {
        name: null,
        description: null,
        promotion_type: null,
        discount_type: null,
        is_active: null,
        start_date: null,
        end_date: null
      }

      // Limpiar completamente los parámetros de filtro antes de recargar
      this.params.dataSearch = {}
      this.params.dataEqualFilter = {}

      this.getPromotions(this.params)
      this.dialogFilter = false
    },

    /**
     * Get status color for chip
     */
    getStatusColor (status) {
      if (typeof status === 'boolean') {
        return status ? 'positive' : 'negative'
      }
      switch (status) {
        case 'active':
        case 'activa':
          return 'positive'
        case 'inactive':
        case 'inactiva':
          return 'negative'
        case 'pending':
        case 'pendiente':
          return 'orange'
        case 'expired':
        case 'expirada':
          return 'red'
        default:
          return 'grey'
      }
    },

    /**
     * Get status label for chip
     */
    getStatusLabel (status) {
      if (typeof status === 'boolean') {
        return status ? 'Activa' : 'Inactiva'
      }
      switch (status) {
        case 'active':
          return 'Activa'
        case 'inactive':
          return 'Inactiva'
        case 'pending':
          return 'Pendiente'
        case 'expired':
          return 'Expirada'
        case 'activa':
          return 'Activa'
        case 'inactiva':
          return 'Inactiva'
        case 'pendiente':
          return 'Pendiente'
        case 'expirada':
          return 'Expirada'
        default:
          return status || 'Sin estado'
      }
    },

    /**
     * Open modal for creating new promotion
     */
    openCreateModal () {
      this.editMode = false
      this.selectedPromotion = null
      this.openPromotionModal = true
    },

    /**
     * Open modal for editing promotion
     */
    openEditModal (promotion) {
      this.editMode = true
      this.selectedPromotion = promotion
      this.openPromotionModal = true
    },

    /**
     * Handle promotion saved event
     */
    handlePromotionSaved (newPromotion) {
      console.log('Nueva promoción creada:', newPromotion)
      this.getPromotions()
      notify('Promoción creada exitosamente', 'positive', 'info')
    },

    /**
     * Handle promotion updated event
     */
    handlePromotionUpdated (updatedPromotion) {
      console.log('Promoción actualizada:', updatedPromotion)
      this.getPromotions()
      notify('Promoción actualizada exitosamente', 'positive', 'info')
    },

    /**
     * Close modal
     */
    closeModal () {
      this.openAddPromotion = false
      this.openEditPromotion = false
      this.promotion = {
        is_active: 1,
        is_cumulative: 0
      }
    }
  }
}
</script>
