<template>
  <q-page padding>
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center q-gutter-x-sm q-mb-sm">
        <span class="text-h6">
          Promociones
        </span>
        <div class="text-right q-gutter-x-sm">
          <q-btn
            color="primary"
            @click="openCreateModal"
            icon="add_circle"
            round
          >
            <q-tooltip>Agregar</q-tooltip>
          </q-btn>
        </div>
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12">
          <q-table
            title="Promociones"
            row-key="id"
            :columns="columns"
            :rows="promotions"
            :loading="visible"
            :filter="filter"
            :visible-columns="visibleColumns"
            binary-state-sort
            :selection="multipleSelected ? 'multiple' : 'none'"
            v-model:selected="selection"
            v-model:pagination="paginationConfig"
            @row-click="editPromotion"
            @request="setPagination"
            no-data-label="Registro no encontrado"
            :grid="$q.screen.lt.md"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <template v-slot:top>
              <div class="flex justify-end items-center full-width">
                <q-input
                  filled
                  dense
                  debounce="500"
                  v-model="filter"
                  placeholder="Buscar"
                  :class="{ 'full-width': $q.screen.lt.md }"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
            </template>

            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
                <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="editPromotion(null, props.row)">
                  <span class="q-focus-helper"></span>

                  <q-card-section class="row justify-between items-start compact-card-header">
                    <div class="column">
                      <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">{{ props.row.code }}</div>
                      <div class="text-caption text-grey-6 text-weight-medium">{{ props.row.name }}</div>
                    </div>
                    <div class="column items-end">
                      <q-chip
                        :color="getStatusColor(props.row.status)"
                        text-color="white"
                        :label="getStatusLabel(props.row.status)"
                        size="sm"
                        class="q-py-xs q-px-sm text-weight-bold shadow-1"
                        style="font-size: 10px; letter-spacing: 0.5px"
                      />
                    </div>
                  </q-card-section>

                  <q-separator color="grey-2" inset />

                  <q-card-section class="compact-card-body">
                    <div class="row q-col-gutter-y-sm">
                      <div class="col-12">
                        <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Canales</div>
                        <div class="text-body2 text-grey-9 text-weight-bold ellipsis">{{ Array.isArray(props.row.channels) ? props.row.channels.join(', ') : props.row.channels || '-' }}</div>
                      </div>
                      <div class="col-12">
                         <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Grupos</div>
                         <div class="text-body2 text-grey-8">{{ Array.isArray(props.row.promotion_details) ? props.row.promotion_details.length : 0 }}</div>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-section class="compact-card-footer">
                    <div class="row items-center justify-between bg-grey-1 compact-total-container" style="border-radius: 12px">
                        <div>
                          <div class="text-caption text-grey-6 text-weight-medium">Precio Final</div>
                          <div class="text-h6 text-primary text-weight-bolder lh-100" style="letter-spacing: -0.5px">{{ formatNumber(props.row.final_price) }}</div>
                        </div>
                        <div>
                          <q-btn
                            round
                            unelevated
                            color="primary"
                            icon="edit"
                            size="md"
                            class="shadow-1"
                          />
                        </div>
                     </div>
                  </q-card-section>
                </q-card>
              </div>
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
    </div>

    <!-- Modal Reutilizable para Crear/Editar Promociones -->
    <ModalComponent
      v-model="openPromotionModal"
      :edit-mode="editMode"
      :promotion-data="selectedPromotion"
      @promotion-saved="handlePromotionSaved"
      @promotion-updated="handlePromotionUpdated"
      @promotion-deleted="handlePromotionDeleted"
    />
  </q-page>
</template>

<script>
import { notify, formatNumber } from 'src/const/mixins'
import { Notify } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import ModalComponent from 'src/components/Promotion/ModalComponent.vue'
import { getDownload } from 'src/const/services'

export default {
  components: {
    ModalComponent
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
      formatNumber,
      visibleColumns: [
        'id',
        'code',
        'name',
        'final_price',
        'channels',
        'promotion_details',
        'status'
      ],
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'ID',
          field: 'id',
          sortable: true
        },
        {
          name: 'code',
          align: 'left',
          label: 'Codigo',
          field: 'code',
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
          name: 'final_price',
          align: 'right',
          label: 'Precio Final',
          field: 'final_price',
          format: (val) => formatNumber(val),
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
          name: 'promotion_details',
          align: 'center',
          label: 'Grupos',
          field: 'promotion_details',
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
        // Verificar que branchOffice esté disponible
        if (!this.branchOffice?.id) {
          console.warn('⚠️  Branch office not available, retrying in 1 second...')
          this.visible = false
          setTimeout(() => {
            this.getPromotions(params)
          }, 1000)
          return
        }

        const requestParams = {
          ...params,
          branch_office_id: this.branchOffice.id
        }

        console.log('📡 Fetching promotions with params:', requestParams)
        const { data } = await this.$api.get('promotions', { params: requestParams })

        console.log('✅ Promotions response:', data)
        this.promotions = data.data || data || []
        this.paginationConfig.rowsNumber = data.total || this.promotions.length

        this.visible = false
      } catch (err) {
        this.visible = false
        console.error('❌ Error fetching promotions:', err)
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
     * Handle promotion deleted event from modal
     */
    handlePromotionDeleted (promotion) {
      if (!promotion || !promotion.id) {
        notify('No se pudo identificar la promoción a eliminar', 'negative', 'warning')
        return
      }

      this.visible = true
      this.$api.delete(`promotions/${promotion.id}`)
        .then(() => {
          this.getPromotions()
          this.visible = false
          this.openPromotionModal = false
          this.selectedPromotion = null
          notify('Promoción eliminada exitosamente', 'positive', 'info')
        })
        .catch(err => {
          this.visible = false
          notify(err.message || 'Error al eliminar la promoción', 'negative', 'warning')
        })
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

<style scoped>
/* Clases para tarjetas compactas */
.compact-card-header {
  padding: 0.5rem 1rem !important;
}

.compact-card-body {
  padding: 0.5rem 1rem !important;
}

.compact-card-footer {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  padding-top: 0 !important;
}

.compact-total-container {
  padding: 0.5rem !important;
}

@media (max-width: 1023px) {
  /* Reducir padding del top de la tabla - usando deep selector para sobrescribir Quasar */
  :deep(.q-table__top) {
    padding: 0 !important;
  }
  :deep(.q-table__top .flex) {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: center;
  }

  :deep(.q-table__top .q-select) {
    max-width: 200px;
  }

  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}
</style>
