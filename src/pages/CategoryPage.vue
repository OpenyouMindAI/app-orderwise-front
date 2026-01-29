<template>
  <q-page padding>
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center q-gutter-x-sm q-mb-sm">
        <span class="text-h6">
          Categorías
        </span>
        <div class="text-right q-gutter-x-sm">
        <!-- Botones modo edición -->
        <template v-if="editingOrder">
          <q-btn
            color="negative"
            icon="close"
            @click="cancelOrderEditing"
            :disable="savingOrder"
            outline
            round
          >
            <q-tooltip>Cancelar</q-tooltip>
          </q-btn>
          <q-btn
            color="positive"
            icon="save"
            @click="saveOrder"
            :loading="savingOrder"
            round
          >
            <q-tooltip>Guardar Secuencia</q-tooltip>
          </q-btn>
        </template>
        <!-- Botón modo normal -->
        <template v-else>
          <q-btn
            id="tour-btn-editar-secuencia"
            color="primary"
            icon="sort"
            @click="startOrderEditing"
            round
          >
            <q-tooltip>Editar Secuencia</q-tooltip>
          </q-btn>
        </template>
        <q-btn
          id="tour-btn-agregar"
          color="primary"
          @click="openAddCategoryDialog"
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
            id="tour-tabla-categorias"
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
          :grid="$q.screen.lt.md"
        >
          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
              <q-card
                class="cursor-pointer q-hoverable no-shadow transition-all"
                style="border-radius: 16px; border: 1px solid #eef0f3"
                @click="handleRowClick(null, props.row)"
              >
                <span class="q-focus-helper"></span>

                <q-card-section class="row justify-between items-start compact-card-header">
                  <div class="column">
                    <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">
                      {{ props.row.name }}
                    </div>
                    <div class="text-caption text-grey-6 text-weight-medium">
                      {{ props.row.aliquot_type?.Desc || 'Sin impuesto' }}
                    </div>
                  </div>
                  <div class="column items-end">
                    <q-badge
                      color="primary"
                      :label="`Pos # ${props.row.sort_order}`"
                      class="q-py-xs q-px-sm text-weight-bold shadow-1"
                      rounded
                      style="font-size: 10px; letter-spacing: 0.5px"
                    />
                  </div>
                </q-card-section>

                <q-separator color="grey-2" inset />

                <q-card-section class="compact-card-body">
                  <div class="row q-col-gutter-y-sm">
                    <div class="col-8">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Impresora</div>
                      <div class="text-body2 text-grey-9 text-weight-bold ellipsis">{{ props.row.printer?.name || '-' }}</div>
                    </div>
                    <div class="col-4 text-right">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">En Catálogo</div>
                      <div class="text-body2 text-grey-8">{{ props.row.show_catalog ? 'Sí' : 'No' }}</div>
                    </div>
                  </div>
                </q-card-section>

                <q-card-section v-if="editingOrder" class="compact-card-footer">
                  <div class="row items-center justify-center bg-grey-1 compact-total-container" style="border-radius: 12px">
                    <div class="q-gutter-x-md">
                      <q-btn
                        size="md"
                        round
                        unelevated
                        color="positive"
                        icon="keyboard_arrow_up"
                        @click.stop="moveUp(props.row)"
                        :disable="props.row.sort_order === 1"
                        class="shadow-1"
                      >
                        <q-tooltip>Subir</q-tooltip>
                      </q-btn>
                      <q-btn
                        size="md"
                        round
                        unelevated
                        color="positive"
                        icon="keyboard_arrow_down"
                        @click.stop="moveDown(props.row)"
                        :disable="isLast(props.row)"
                        class="shadow-1"
                      >
                        <q-tooltip>Bajar</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
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
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 85vw;'}`"
      >
        <q-form @submit="saveEdit" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Modificar categoría</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  id="tour-edit-nombre"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="category.name"
                  autofocus
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
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
                  dense
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
                />
              </div>
              <div class="col-12 col-sm-6">
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
                  dense
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-toggle
                  id="tour-edit-catalogo"
                  v-model="category.show_catalog"
                  label="Mostrar en catálogo"
                  :true-value="1"
                  :false-value="0"
                  class="full-width"
                />
              </div>

              <div class="col-12">
                <div class="row items-center q-mb-sm q-mt-sm">
                  <div class="col">
                    <label class="text-subtitle2 text-grey-8">Sucursales</label>
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
                  dense
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
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
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn id="tour-edit-btn-eliminar" color="negative" flat icon="delete" label="Eliminar" @click="deleteCategory" :loading="visible" />
            <q-btn id="tour-edit-btn-guardar" color="primary" unelevated icon="save" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddCategory" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 85vw;'}`"
      >
        <q-form @submit="saveCategory" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Agregar categoría</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  id="tour-add-nombre"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="category.name"
                  autofocus
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
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
                  dense
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
                />
              </div>
              <div class="col-12 col-sm-6">
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
                  dense
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-toggle
                  id="tour-add-catalogo"
                  v-model="category.show_catalog"
                  label="Mostrar en catálogo"
                  :true-value="1"
                  :false-value="0"
                  class="full-width"
                />
              </div>

              <div class="col-12">
                <div class="row items-center q-mb-sm q-mt-sm">
                  <div class="col">
                    <label class="text-subtitle2 text-grey-8">Sucursales</label>
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
                  dense
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
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
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn id="tour-add-btn-cancelar" color="secondary" flat label="Cancelar" @click="closeModal" />
            <q-btn id="tour-add-btn-agregar" color="primary" unelevated icon="add_circle" label="Agregar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    </div>
    <DemoPersuasionModal v-model="showDemoModal" />
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'
import eventBus from 'src/utils/eventBus'
import { api } from 'boot/axios'
import { useDemoPersuasion } from 'src/composables/useDemoPersuasion'
import DemoPersuasionModal from 'src/components/DemoPersuasionModal.vue'
export default {
  components: { DemoPersuasionModal },
  setup () {
    const { showDemoModal, trackDemoAction } = useDemoPersuasion()
    return { showDemoModal, trackDemoAction }
  },
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

          this.trackDemoAction()

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
      // Limpiar flag si existe, aunque ya no dependemos estrictamente de ella
      localStorage.removeItem('came_from_welcome_category')

      // Si ya está configurada la empresa, no hacemos nada para evitar spam
      if (this.userSession?.company_session?.company_config?.other?.configured) {
        return
      }

      // Verificar si el progreso está al 100%
      const progressData = await this.checkIfComplete()

      if (progressData.isComplete) {
        // Mostrar celebración al 100%
        this.showCelebration()
      } else {
        // Emitir evento de Pixel antes de mostrar el diálogo
        if (this.$fbq) {
          this.$fbq.event('PrimeraCategoria', {
            company_id: this.userSession?.company_session?.id,
            business_type: this.userSession?.company_session?.business_type?.name
          })
        }
        // Preguntar si quiere continuar con la siguiente tarea
        // Mostrar siempre si no ha terminado la configuración
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

</style>

<style scoped>
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
  :deep(.q-table__top > div) {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
  }

  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}

.table-editing-order :deep(tbody tr) {
  cursor: default !important;
}

.tour-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  pointer-events: all;
}

.tour-spotlight {
  position: absolute;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  transition: all 0.3s ease;
  z-index: 10000;
  pointer-events: none;
}

.tour-card {
  position: absolute;
  width: 320px;
  z-index: 10001;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
}

.tour-header {
  background: var(--q-primary);
  color: white;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tour-step-indicator {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tour-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.tour-description {
  font-size: 0.95rem;
  color: #4a4a4a;
  line-height: 1.4;
}

.transition-all {
  transition: all 0.3s ease;
}
</style>
