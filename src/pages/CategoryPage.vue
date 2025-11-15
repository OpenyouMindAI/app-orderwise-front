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
            color="primary"
            icon="sort"
            label="Editar Secuencia"
            @click="startOrderEditing"
          />
        </template>
        <q-btn
          color="primary"
          @click="openAddCategory = true"
          icon="add_circle"
          label="Agregar"
        />
      </div>
      <div class="col-12">
        <q-table
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
    <q-dialog v-model="openEditCategory" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 900px; max-width: 95vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Modificar categoría</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="category.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-12">
              <q-select
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
                v-model="category.show_catalog"
                label="Mostrar en catálogo"
                :true-value="1"
                :false-value="0"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteCategory" :loading="visible" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddCategory" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 900px; max-width: 95vw;">
        <q-form @submit="saveCategory">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Agregar categoría</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="category.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-12">
              <q-select
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
                v-model="category.show_catalog"
                label="Mostrar en catálogo"
                :true-value="1"
                :false-value="0"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible"/>
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
      }
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
    this.getBranchOffices()
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
    }
  },
  methods: {
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
</style>
