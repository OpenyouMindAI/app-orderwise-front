<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right q-gutter-sm">
        <!-- Botones modo edición -->
        <template v-if="editingOrder">
          <q-btn
            color="negative"
            icon="close"
            label="Cancelar"
            @click="cancelOrderEditing"
            :disable="savingOrder"
            outline
          />
          <q-btn
            color="positive"
            icon="save"
            label="Guardar Secuencia"
            @click="saveOrder"
            :loading="savingOrder"
          />
        </template>
        <!-- Botón modo normal -->
        <template v-else>
          <q-btn
            id="tour-btn-editar-secuencia"
            color="primary"
            icon="sort"
            label="Editar Secuencia"
            @click="startOrderEditing"
          />
        </template>
        <q-btn
          id="tour-btn-agregar"
          color="primary"
          @click="openAddCategoryDialog"
          icon="add_circle"
          label="Agregar"
        />
      </div>
      <div class="col-12">
        <q-table
          id="tour-tabla-categorias"
          title="Categorías"
          row-key="name"
          :columns="columns"
          :rows="categories"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="handleRowClick"
          @request="setPagination"
          no-data-label="Registro no encontrado"
          :class="{ 'table-editing-order': editingOrder }"
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
          <template v-slot:body-cell-actions="props" v-if="editingOrder">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                size="sm"
                round
                icon="keyboard_arrow_up"
                @click="moveUp(props.row)"
                :disable="props.row.sort_order === 1"
                color="positive"
              >
                <q-tooltip>Subir</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                round
                icon="keyboard_arrow_down"
                @click="moveDown(props.row)"
                :disable="isLast(props.row)"
                color="positive"
              >
                <q-tooltip>Bajar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Tour Overlay -->
    <div v-if="showTour" class="tour-overlay">
      <div class="tour-spotlight" :style="spotlightStyle"></div>
      <q-card class="tour-card" :style="tourCardStyle">
        <q-card-section class="tour-header">
          <div class="tour-step-indicator">Paso {{ currentTourStep + 1 }} de {{ currentTourSteps.length }}</div>
          <q-btn flat round dense icon="close" @click="skipTour" color="white" size="sm" />
        </q-card-section>
        <q-card-section>
          <div class="tour-title">{{ currentTourSteps[currentTourStep]?.title }}</div>
          <div class="tour-description">{{ currentTourSteps[currentTourStep]?.description }}</div>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            flat
            label="Anterior"
            @click="previousTourStep"
            :disable="currentTourStep === 0"
            color="grey-7"
          />
          <q-btn
            flat
            label="Saltar tour"
            @click="skipTour"
            color="grey-7"
          />
          <q-btn
            unelevated
            :label="currentTourStep === currentTourSteps.length - 1 ? 'Finalizar' : 'Siguiente'"
            @click="nextTourStep"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </div>

    <q-dialog v-model="openEditCategory" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 600px; max-width: 95vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Modificar categoría</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                id="tour-edit-nombre"
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="category.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-12">
              <q-select
                id="tour-edit-iva"
                use-input
                filled
                label="Iva (%)"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="category.aliquot_type"
                :options="aliquotTypes"
                @filter="getAliquotTypes"
              />
            </div>
            <div class="col-12">
              <q-select
                id="tour-edit-impresora"
                use-input
                filled
                clearable
                label="Impresora"
                input-debounce="0"
                option-label="name"
                option-value="id"
                v-model="category.printer"
                :options="printers"
                @filter="getPrinters"
              />
            </div>
            <div class="col-12">
              <div class="row items-center q-mb-sm">
                <div class="col">
                  <label class="text-subtitle2">Sucursales</label>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    color="primary"
                    label="Seleccionar todas"
                    @click="selectAllBranchOffices"
                  />
                </div>
              </div>
              <q-select
                id="tour-edit-sucursales"
                filled
                multiple
                use-chips
                label="Seleccionar sucursales"
                option-label="name"
                option-value="id"
                v-model="selectedBranchOffices"
                :options="branchOffices"
                emit-value
                map-options
              >
                <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                  <q-item v-bind="itemProps">
                    <q-item-section side>
                      <q-checkbox :model-value="selected" @update:model-value="toggleOption(opt)" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ opt.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-toggle
                id="tour-edit-catalogo"
                v-model="category.show_catalog"
                label="Mostrar en catálogo"
                :true-value="1"
                :false-value="0"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn id="tour-edit-btn-eliminar" color="negative" label="Eliminar" @click="deleteCategory" :loading="visible" />
            <q-btn id="tour-edit-btn-guardar" color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddCategory" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 600px; max-width: 95vw;">
        <q-form @submit="saveCategory">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Agregar categoría</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                id="tour-add-nombre"
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="category.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-12">
              <q-select
                id="tour-add-iva"
                use-input
                filled
                label="Iva (%)"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="category.aliquot_type"
                :options="aliquotTypes"
                @filter="getAliquotTypes"
              />
            </div>
            <div class="col-12">
              <q-select
                id="tour-add-impresora"
                use-input
                filled
                clearable
                label="Impresora"
                input-debounce="0"
                option-label="name"
                option-value="id"
                v-model="category.printer"
                :options="printers"
                @filter="getPrinters"
              />
            </div>
            <div class="col-12">
              <div class="row items-center q-mb-sm">
                <div class="col">
                  <label class="text-subtitle2">Sucursales</label>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    color="primary"
                    label="Seleccionar todas"
                    @click="selectAllBranchOffices"
                  />
                </div>
              </div>
              <q-select
                id="tour-add-sucursales"
                filled
                multiple
                use-chips
                label="Seleccionar sucursales"
                option-label="name"
                option-value="id"
                v-model="selectedBranchOffices"
                :options="branchOffices"
                emit-value
                map-options
              >
                <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                  <q-item v-bind="itemProps">
                    <q-item-section side>
                      <q-checkbox :model-value="selected" @update:model-value="toggleOption(opt)" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ opt.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-toggle
                id="tour-add-catalogo"
                v-model="category.show_catalog"
                label="Mostrar en catálogo"
                :true-value="1"
                :false-value="0"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn id="tour-add-btn-cancelar" color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn id="tour-add-btn-agregar" color="primary" label="Agregar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'
import eventBus from 'src/utils/eventBus'
import { api } from 'boot/axios'
export default {
  data () {
    return {
      categories: [],
      aliquotTypes: [],
      printers: [],
      branchOffices: [],
      selectedBranchOffices: [],
      category: {
        show_catalog: 0,
        images: [],
        sort_order: 1
      },
      isDragOver: false,
      editingOrder: false,
      savingOrder: false,
      originalCategories: [], // Estado original para cancelar
      filter: '',
      /**
       * Params search
       * @type {Object}
       */
      params: {
        paginate: true,
        sortBy: 'sort_order',
        sortOrder: 'asc',
        perPage: 1,
        dataSearch: {
          id: '',
          name: ''
        }
      },
      visible: false,
      openAddCategory: false,
      openEditCategory: null,
      baseColumns: [
        {
          name: 'sort_order',
          align: 'center',
          label: 'Posición',
          field: 'sort_order',
          sortable: true,
          style: 'width: 100px; font-weight: bold; background-color: #f0f8ff;',
          headerStyle: 'background-color: #e3f2fd; font-weight: bold;'
        },
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'aliquot_type',
          align: 'left',
          label: 'Impuesto',
          field: 'aliquot_type',
          format: row => row?.Desc || '-',
          sortable: true
        },
        {
          name: 'show_catalog',
          align: 'left',
          label: 'Mostrar en catálogo',
          field: 'show_catalog',
          format: row => row ? 'Si' : 'No'
        },
        {
          name: 'printer',
          align: 'left',
          label: 'Impresora',
          field: 'printer',
          format: row => row?.name || '-',
          sortable: true
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'sort_order',
        sortOrder: 'asc'
      },
      // Tour System
      showTour: false,
      currentTourStep: 0,
      currentTourType: 'main',
      mainTourSteps: [
        {
          target: '#tour-btn-editar-secuencia',
          title: '🔢 Editar Secuencia',
          description: 'Usa este botón para cambiar el orden de las categorías. Podrás mover las categorías hacia arriba o abajo para organizarlas como prefieras.'
        },
        {
          target: '#tour-btn-agregar',
          title: '➕ Botón Agregar',
          description: 'Haz clic aquí para agregar una nueva categoría. Al hacer clic, se abrirá un formulario donde podrás ingresar todos los datos de la categoría.'
        },
        {
          target: '#tour-tabla-categorias',
          title: '📋 Tabla de Categorías',
          description: 'Aquí se muestran todas las categorías creadas. Puedes ver el nombre, impuesto, impresora asignada y más información de cada categoría.'
        },
        {
          target: '#tour-tabla-categorias tbody tr:first-child',
          title: '✏️ Editar Categoría',
          description: 'Para editar una categoría, simplemente haz clic en cualquier fila de la tabla. Se abrirá un formulario con todos los datos que podrás modificar.'
        }
      ],
      spotlightStyle: {},
      tourCardStyle: {}
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
    this.getBranchOffices()

    // Check and start tour on first visit
    this.checkAndStartTour()

    // Listen for tour activation from navbar
    eventBus.on('activate-page-tour', (pageName) => {
      if (pageName === 'Category') {
        this.startMainTour()
      }
    })
  },
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  computed: {
    ...mapState(authentication, ['userSession']),
    columns () {
      const cols = [...this.baseColumns]
      if (this.editingOrder) {
        cols.push({
          name: 'actions',
          align: 'center',
          label: 'Reordenar',
          field: 'actions'
        })
      }
      return cols
    },
    currentTourSteps () {
      return this.mainTourSteps
    }
  },
  methods: {
    /**
     * Open add category dialog
     */
    openAddCategoryDialog () {
      this.openAddCategory = true
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddCategory = false
      this.openEditCategory = false
      this.category = {
        show_catalog: 0,
        images: []
      }
      this.selectedBranchOffices = []
    },
    /**
     * Handle drag and drop
     */
    handleDrop (event) {
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.processFiles(files)
    },
    /**
     * Handle file selection
     */
    handleFileSelect (event) {
      const files = Array.from(event.target.files)
      this.processFiles(files)
    },
    /**
     * Process images files
     */
    processFiles (files) {
      const file = files[0] // Solo tomar la primera imagen para categorías
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.category.images = [{
            file,
            url: e.target.result
          }]
        }
        reader.readAsDataURL(file)
      } else {
        Notify.create({
          message: 'Por favor selecciona un archivo de imagen válido',
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Delete category images
     */
    deleteImage () {
      const images = this.category.images
      if (images && images.id) {
        // Imagen existente en BD - eliminar del servidor
        this.$api.delete(`files/${images.id}`)
          .then(() => {
            this.category.images = []
            Notify.create({
              message: 'Imagen eliminada exitosamente',
              icon: 'check_circle',
              color: 'positive'
            })
          })
          .catch(err => {
            Notify.create({
              message: err.message,
              icon: 'warning',
              color: 'negative'
            })
          })
      } else {
        // Imagen nueva (solo en memoria) - eliminar del objeto
        this.category.images = []
      }
    },
    /**
     * Prepare data for API submission
     */
    modelData (data, isEdit = false) {
      const formData = new FormData()

      if (isEdit) {
        formData.append('_method', 'put')
      }

      // Agregar campos básicos
      formData.append('name', data.name || '')
      formData.append('show_catalog', data.show_catalog || 0)

      if (data.aliquot_type) {
        formData.append('aliquot_type', JSON.stringify(data.aliquot_type))
      }

      // Agregar imagen si existe
      if (data?.images && data.images[0]?.file) {
        formData.append('images', data.images[0].file)
      }

      return formData
    },
    /**
     * Search beneficiary
     * @param  {Object}
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getCategories(this.params)
    },
    /**
     * Get all categories
     */
    getCategories (params = this.params) {
      this.visible = true
      this.$api.get('categories', { params })
        .then(({ data }) => {
          this.categories = data.data
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
    /**
     * Get branch offices
     */
    async getBranchOffices () {
      try {
        const { data } = await this.$api.get('branch-offices', {
          params: {
            paginate: false
          }
        })
        this.branchOffices = data
      } catch (err) {
        notify(err.message, 'negative', 'warning')
      }
    },
    /**
     * Select all branch offices
     */
    selectAllBranchOffices () {
      this.selectedBranchOffices = this.branchOffices.map(bo => bo.id)
    },
    /**
     * Get printers
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getPrinters (value, update) {
      try {
        const { data } = await this.$api.get('printers', {
          params: {
            dataSearch: {
              name: value
            }
          }
        })
        update(() => {
          this.printers = data
        })
      } catch (err) {
        notify(err.message, 'negative', 'warning')
      }
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getAliquotTypes (value, update) {
      try {
        const { data } = await this.$apiArca.get('metadata/aliquot-types', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.aliquotTypes = data
        })
      } catch (err) {
        notify(err.message, 'negative', 'warning')
      }
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      console.log(data.pagination.descending)
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getCategories(this.params)
    },
    /**
     * Save categories
     */
    saveCategory () {
      this.visible = true
      const categoryData = {
        ...this.category,
        printer_id: this.category.printer?.id || null,
        branch_office_ids: this.selectedBranchOffices
      }
      this.$api.post('categories', categoryData)
        .then(({ data }) => {
          this.getCategories()
          this.openAddCategory = false
          this.visible = false
          this.closeModal()

          Notify.create({
            message: 'Categoría creada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })

          this.checkContinueConfiguration()
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
     * Handle row click - only edit in normal mode
     */
    handleRowClick (event, row, index) {
      if (!this.editingOrder) {
        this.editCategory(event, row, index)
      } else {
        console.log('❌ Row click ignored - in editing mode')
      }
    },
    /**
     * View category
     */
    editCategory (event, row, index) {
      this.openEditCategory = true
      this.category = row
      // Cargar las sucursales seleccionadas
      this.selectedBranchOffices = row.branch_offices?.map(bo => bo.id) || []
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      const categoryData = {
        ...this.category,
        printer_id: this.category.printer?.id || null,
        branch_office_ids: this.selectedBranchOffices
      }
      this.$api.put(`categories/${this.category.id}`, categoryData)
        .then(({ data }) => {
          this.getCategories()
          this.openEditCategory = false
          this.visible = false
          this.closeModal()
          Notify.create({
            message: 'Categoría editada exitosamente',
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
     * Delete category
     */
    deleteCategory () {
      this.visible = true
      this.$api.delete(`categories/${this.category.id}`)
        .then(({ data }) => {
          this.getCategories()
          this.openEditCategory = false
          this.visible = false
          this.closeModal()
          Notify.create({
            message: 'Categoría eliminada exitosamente',
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
     * Start order editing mode - saves original state
     */
    startOrderEditing () {
      // Asegurar que todas las categorías tengan sort_order antes de empezar
      this.ensureSortOrder()

      // Guardar estado original para poder cancelar
      this.originalCategories = JSON.parse(JSON.stringify(this.categories))
      this.editingOrder = true

      Notify.create({
        message: 'Modo de edición activado. Reordena las categorías y luego guarda o cancela los cambios.',
        icon: 'info',
        color: 'info',
        timeout: 4000
      })
    },
    /**
     * Cancel order editing - restore original state
     */
    cancelOrderEditing () {
      // Restaurar estado original
      this.categories = JSON.parse(JSON.stringify(this.originalCategories))
      this.originalCategories = []
      this.editingOrder = false
      Notify.create({
        message: 'Cambios de orden cancelados. Se restauró el orden original.',
        icon: 'undo',
        color: 'warning',
        timeout: 3000
      })
    },
    /**
     * Save all category order changes to API
     */
    async saveOrder () {
      try {
        this.savingOrder = true

        // Preparar datos de orden para enviar al backend
        const orderData = this.categories.map(category => ({
          id: category.id,
          sort_order: category.sort_order
        }))

        // Enviar al API
        await this.$api.post('categories/update-order', {
          categories: orderData
        })

        this.editingOrder = false
        this.savingOrder = false
        this.originalCategories = [] // Limpiar estado original

        Notify.create({
          message: 'Orden de categorías guardado exitosamente',
          icon: 'check_circle',
          color: 'positive',
          timeout: 3000
        })

        // Recargar categorías para asegurar consistencia con backend
        this.getCategories()
      } catch (error) {
        this.savingOrder = false
        Notify.create({
          message: error.message || 'Error al guardar el orden de las categorías',
          icon: 'warning',
          color: 'negative'
        })

        // En caso de error, restaurar estado original
        this.cancelOrderEditing()
      }
    },
    /**
     * Move category up in order (only updates locally until save)
     */
    moveUp (category) {
      console.log('🔼 moveUp called for:', category.name, 'current sort_order:', category.sort_order)

      // Asegurar que todas las categorías tengan sort_order
      this.ensureSortOrder()

      const currentIndex = this.categories.findIndex(c => c.id === category.id)
      if (currentIndex > 0) {
        // Intercambiar con el elemento anterior
        const prevCategory = this.categories[currentIndex - 1]
        const tempOrder = category.sort_order
        category.sort_order = prevCategory.sort_order
        prevCategory.sort_order = tempOrder

        // Reordenar array
        this.categories.sort((a, b) => a.sort_order - b.sort_order)

        console.log('✅ Moved up successfully. New order:', category.sort_order)
      } else {
        console.log('❌ Cannot move up - already at top')
      }
    },
    /**
     * Move category down in order (only updates locally until save)
     */
    moveDown (category) {
      console.log('🔽 moveDown called for:', category.name, 'current sort_order:', category.sort_order)

      // Asegurar que todas las categorías tengan sort_order
      this.ensureSortOrder()

      const currentIndex = this.categories.findIndex(c => c.id === category.id)
      if (currentIndex < this.categories.length - 1) {
        // Intercambiar con el elemento siguiente
        const nextCategory = this.categories[currentIndex + 1]
        const tempOrder = category.sort_order
        category.sort_order = nextCategory.sort_order
        nextCategory.sort_order = tempOrder

        // Reordenar array
        this.categories.sort((a, b) => a.sort_order - b.sort_order)

        console.log('✅ Moved down successfully. New order:', category.sort_order)
      } else {
        console.log('❌ Cannot move down - already at bottom')
      }
    },
    /**
     * Check if category is last in order
     */
    isLast (category) {
      const currentIndex = this.categories.findIndex(c => c.id === category.id)
      return currentIndex >= this.categories.length - 1
    },
    /**
     * Ensure all categories have sort_order values
     */
    ensureSortOrder () {
      this.categories.forEach((category, index) => {
        if (!category.sort_order) {
          category.sort_order = index + 1
        }
      })
      // Asegurar que estén ordenadas
      this.categories.sort((a, b) => a.sort_order - b.sort_order)
    },
    /**
     * Check and start tour on first visit
     */
    checkAndStartTour () {
      const activateFromWelcome = localStorage.getItem('activate_tour_from_welcome')
      const selectedTask = localStorage.getItem('welcome_selected_task')

      if (activateFromWelcome === 'true' && selectedTask === 'Category') {
        localStorage.removeItem('activate_tour_from_welcome')
        localStorage.removeItem('welcome_selected_task')

        localStorage.setItem('came_from_welcome_category', 'true')

        setTimeout(() => {
          this.startMainTour()
        }, 500)
        return
      }

      const hasSeenMainTour = localStorage.getItem('has_seen_category_main_tour')
      if (hasSeenMainTour !== 'true') {
        setTimeout(() => {
          this.startMainTour()
        }, 500)
      }
    },
    /**
     * Start main tour
     */
    startMainTour () {
      this.currentTourType = 'main'
      this.currentTourStep = 0
      this.showTour = true
      this.$nextTick(() => {
        this.updateTourPosition()
      })
    },
    /**
     * Next tour step
     */
    nextTourStep () {
      if (this.currentTourStep < this.currentTourSteps.length - 1) {
        this.currentTourStep++
        this.$nextTick(() => {
          this.updateTourPosition()
        })
      } else {
        this.finishTour()
      }
    },
    /**
     * Previous tour step
     */
    previousTourStep () {
      if (this.currentTourStep > 0) {
        this.currentTourStep--
        this.$nextTick(() => {
          this.updateTourPosition()
        })
      }
    },
    /**
     * Skip tour
     */
    skipTour () {
      this.finishTour()
    },
    /**
     * Finish tour
     */
    finishTour () {
      this.showTour = false
      this.currentTourStep = 0
      localStorage.setItem('has_seen_category_main_tour', 'true')
      notify('¡Tour completado! Ya conoces cómo gestionar categorías.', 'positive', 'check_circle')
    },
    /**
     * Check if should continue configuration
     */
    async checkContinueConfiguration () {
      // Solo preguntar si viene desde WelcomePage
      const cameFromWelcome = localStorage.getItem('came_from_welcome_category')

      if (cameFromWelcome === 'true') {
        // Limpiar flag
        localStorage.removeItem('came_from_welcome_category')

        // Verificar si el progreso está al 100%
        const progressData = await this.checkIfComplete()

        if (progressData.isComplete) {
          // Mostrar celebración al 100%
          this.showCelebration()
        } else {
          // Preguntar si quiere continuar con la siguiente tarea
          setTimeout(() => {
            this.$q.dialog({
              title: '¡Categorías configuradas! ✅',
              message: '¿Deseas continuar con la siguiente tarea de configuración?',
              cancel: {
                label: 'Más tarde',
                color: 'grey-7',
                flat: true
              },
              ok: {
                label: 'Continuar',
                color: 'primary',
                unelevated: true
              },
              persistent: false
            }).onOk(() => {
              this.$router.push({ name: 'Welcome' })
            })
          }, 500)
        }
      }
    },
    /**
     * Check if all tasks are complete (100%)
     */
    async checkIfComplete () {
      try {
        const isConfigured = this.userSession?.company_session?.company_config?.other?.configured
        if (isConfigured) {
          return {
            isComplete: true,
            percentage: 100
          }
        }
        const { data } = await api.get('/onboarding/tasks/status')
        const tasks = data.tasks || []
        const total = tasks.length
        const completed = tasks.filter(t => t.count > 0 || (t.multiple && Object.values(t.multiple).every(v => v))).length
        const percentage = Math.round((completed / total) * 100)

        return {
          isComplete: percentage === 100,
          percentage
        }
      } catch (error) {
        console.error('Error checking completion:', error)
        return { isComplete: false, percentage: 0 }
      }
    },
    /**
     * Show celebration dialog when 100% complete
     */
    async showCelebration () {
      // Actualizar empresa como configurada
      try {
        const companyId = this.userSession?.company_session?.id
        await api.post('/companies/mark-configured', {
          company_id: companyId
        })
      } catch (error) {
        console.error('Error marking company as configured:', error)
      }

      // Mostrar diálogo de celebración con confeti
      const CelebrationDialog = await import('src/components/CelebrationDialog.vue')
      this.$q.dialog({
        component: CelebrationDialog.default
      })
    },
    /**
     * Update tour position
     */
    updateTourPosition (retryCount = 0) {
      this.$nextTick(() => {
        const step = this.currentTourSteps[this.currentTourStep]
        if (!step) return

        const element = document.querySelector(step.target)
        if (!element) {
          // Retry up to 5 times with increasing delay
          if (retryCount < 5) {
            console.warn(`Tour element not found: ${step.target}, retrying... (${retryCount + 1}/5)`)
            setTimeout(() => {
              this.updateTourPosition(retryCount + 1)
            }, 200 * (retryCount + 1))
            return
          } else {
            console.error('Tour element not found after retries:', step.target)
            return
          }
        }

        // Scroll to element first
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

        // Wait for scroll to finish before calculating positions
        setTimeout(() => {
          const rect = element.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

          // Update spotlight position
          this.spotlightStyle = {
            top: `${rect.top + scrollTop - 10}px`,
            left: `${rect.left + scrollLeft - 10}px`,
            width: `${rect.width + 20}px`,
            height: `${rect.height + 20}px`
          }

          // Position tour card with better logic
          const cardWidth = 400
          const cardHeight = 280
          const padding = 20
          const viewportHeight = window.innerHeight
          const viewportWidth = window.innerWidth

          let cardTop = rect.bottom + scrollTop + padding
          let cardLeft = rect.left + scrollLeft

          // Special positioning for table - place card at bottom of viewport
          if (step.target === '#tour-tabla-categorias' || step.target === '#tour-tabla-categorias tbody tr:first-child') {
            cardTop = scrollTop + viewportHeight - cardHeight - padding
            cardLeft = scrollLeft + (viewportWidth - cardWidth) / 2
          } else {
            // If card goes below viewport, position it above the element
            if (rect.bottom + cardHeight + padding > viewportHeight) {
              cardTop = rect.top + scrollTop - cardHeight - padding
            }

            // If still goes above viewport, position it in the middle
            if (cardTop < scrollTop) {
              cardTop = scrollTop + (viewportHeight - cardHeight) / 2
            }

            // Adjust horizontal position
            if (cardLeft + cardWidth > viewportWidth) {
              cardLeft = viewportWidth - cardWidth - padding
            }
            if (cardLeft < 0) {
              cardLeft = padding
            }
          }

          this.tourCardStyle = {
            top: `${cardTop}px`,
            left: `${cardLeft}px`
          }
        }, 300)
      })
    }
  }
}
</script>

<style scoped>
.dropzone-card {
  border: 2px dashed #e0e0e0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.dropzone-card:hover,
.dropzone-active {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.images-preview-card {
  transition: transform 0.2s ease;
  max-width: 200px;
  margin: 0 auto;
}

.images-preview-card:hover {
  transform: scale(1.02);
}

.dropzone-card .q-card-section {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Estilos para columna de posición */
.q-table tbody td:first-child,
.q-table thead th:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: #f0f8ff;
  border-right: 3px solid #1976d2;
}

.q-table thead th:first-child {
  background-color: #e3f2fd !important;
  font-weight: bold;
  font-size: 14px;
}

.q-table tbody td:first-child {
  font-weight: bold;
  font-size: 18px;
  color: #1976d2;
  text-align: center;
}

/* Tour Styles */
.tour-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 10000;
  pointer-events: auto;
}

.tour-spotlight {
  position: absolute;
  background: transparent;
  border: 4px solid var(--q-primary);
  border-radius: 12px;
  box-shadow:
    0 0 0 9999px rgba(0, 0, 0, 0.75),
    0 0 0 8px rgba(255, 255, 255, 0.1),
    0 0 40px 4px rgba(var(--q-primary-rgb, 25, 118, 210), 0.6);
  transition: all 0.3s ease;
  z-index: 10001;
  pointer-events: none;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% {
    border-color: var(--q-primary);
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      0 0 0 8px rgba(255, 255, 255, 0.1),
      0 0 40px 4px rgba(var(--q-primary-rgb, 25, 118, 210), 0.6);
  }
  50% {
    border-color: var(--q-primary);
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      0 0 0 8px rgba(255, 255, 255, 0.15),
      0 0 50px 6px rgba(var(--q-primary-rgb, 25, 118, 210), 0.8);
  }
}

.tour-card {
  position: absolute;
  z-index: 10002;
  min-width: 350px;
  max-width: 450px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: tour-card-appear 0.3s ease-out;
}

@keyframes tour-card-appear {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary-dark, var(--q-primary)) 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.tour-step-indicator {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.tour-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--q-primary);
  line-height: 1.3;
}

.body--dark .tour-title {
  color: var(--q-primary);
}

.tour-description {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.body--dark .tour-description {
  color: #b0b0b0;
}

/* Responsive tour */
@media (max-width: 768px) {
  .tour-card {
    min-width: 300px;
    max-width: 90vw;
    left: 5vw !important;
  }

  .tour-title {
    font-size: 18px;
  }

  .tour-description {
    font-size: 13px;
  }
}
</style>
