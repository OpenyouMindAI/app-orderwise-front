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
          name: 'final_price',
          align: 'right',
          label: 'Precio Final',
          field: 'final_price',
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
        const requestParams = {
          ...params,
          branch_office_id: this.branchOffice?.id
        }
        const { data } = await this.$api.get('promotions', { params: requestParams })

        this.promotions = data.data || []
        this.paginationConfig.rowsNumber = data.total || 0

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
