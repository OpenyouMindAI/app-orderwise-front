<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddBusinessType = true" icon="add_circle" label="Agregar Rubro"/>
      </div>
      <div class="col-12">
        <q-table
          title="Rubros"
          row-key="id"
          :columns="columns"
          :rows="businessTypes"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editBusinessType"
          @request="setPagination"
          no-data-label="Registro no encontrado"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top-right>
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar rubro">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
        </q-table>
      </div>
    </div>
    <!-- Edit Business Type Dialog -->
    <q-dialog v-model="openEditBusinessType" persistent transition-show="scale" transition-hide="scale">
      <q-card class="modern-business-dialog shadow-12">
        <q-form @submit="saveEdit">
          <!-- Header Moderno -->
          <q-card-section class="modern-dialog-header">
            <div class="row items-center no-wrap">
              <div class="header-icon-container bg-primary-gradient text-white q-mr-md">
                <q-icon name="edit" size="24px" />
              </div>
              <div>
                <div class="text-subtitle1 text-weight-bold">Modificar Rubro</div>
                <div class="text-caption text-grey-7">Actualiza la información y módulos</div>
              </div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup class="text-grey-6" />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-xs">
            <div class="row q-col-gutter-y-md">
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  outlined
                  v-model="businessType.name"
                  autofocus
                  label="Nombre del Rubro"
                  placeholder="Ej: Restaurante, Farmacia"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="storefront" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  outlined
                  v-model="businessType.description"
                  type="textarea"
                  label="Descripción"
                  placeholder="Añade una descripción clara..."
                  rows="2"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12">
                <q-input
                  outlined
                  v-model="businessType.pixel"
                  type="textarea"
                  label="Facebook Pixel"
                  placeholder="Pega el código del pixel aquí..."
                  rows="2"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="code" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Dropfile Inputs -->
              <div class="col-12 row q-col-gutter-x-md">
                <div class="col-6">
                  <div
                    class="dropzone-container"
                    @dragover.prevent="dragOverImage = true"
                    @dragleave.prevent="dragOverImage = false"
                    @drop.prevent="onDropImage"
                    @click="$refs.imageInputEdit.click()"
                    :class="{ 'dragging': dragOverImage }"
                  >
                    <input type="file" ref="imageInputEdit" style="display: none" accept="image/*" @change="onImageInput" />
                    <div v-if="!imagePreview && !businessType.image" class="dropzone-content">
                      <q-icon name="add_photo_alternate" size="28px" color="primary" />
                      <div class="text-caption text-weight-medium">Imagen</div>
                    </div>
                    <div v-else class="dropzone-preview">
                      <q-img
                        :src="imagePreview || getImageUrl(businessType.image)"
                        class="full-height rounded-borders"
                        fit="cover"
                      >
                        <div class="absolute-bottom-right q-pa-xs">
                          <q-btn round dense color="negative" icon="close" size="xs" @click.stop="clearImage" />
                        </div>
                      </q-img>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div
                    class="dropzone-container"
                    @dragover.prevent="dragOverVideo = true"
                    @dragleave.prevent="dragOverVideo = false"
                    @drop.prevent="onDropVideo"
                    @click="$refs.videoInputEdit.click()"
                    :class="{ 'dragging': dragOverVideo }"
                  >
                    <input type="file" ref="videoInputEdit" style="display: none" accept="video/*" @change="onVideoInput" />
                    <div v-if="!videoFile && !businessType.video" class="dropzone-content">
                      <q-icon name="video_library" size="28px" color="primary" />
                      <div class="text-caption text-weight-medium">Video</div>
                    </div>
                    <div v-else class="dropzone-preview video-preview">
                      <div class="column items-center justify-center full-height bg-grey-2 rounded-borders">
                        <q-icon name="check_circle" color="positive" size="24px" />
                        <span class="text-caption text-positive">Video Listo</span>
                        <q-btn round dense color="negative" icon="close" size="xs" class="absolute-top-right q-ma-xs" @click.stop="clearVideo" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Module Selection Section -->
          <q-card-section class="q-py-md">
            <div class="module-section-box">
              <div class="row items-center q-mb-md">
                <div class="text-subtitle2 text-weight-bold">
                  <q-icon name="widgets" class="q-mr-xs" color="primary" /> Módulos asignados
                </div>
                <q-space />
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  :color="isAllSelected ? 'negative' : 'primary'"
                  :label="isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'"
                  @click="toggleSelectAll"
                  class="rounded-borders"
                />
              </div>

              <q-scroll-area style="height: 200px;" class="modern-scroll">
                <q-expansion-item
                  v-for="section in sections"
                  :key="section.id"
                  dense
                  header-class="section-header"
                  default-opened
                >
                  <template v-slot:header>
                    <q-item-section avatar min-width="30px">
                      <q-checkbox
                        dense
                        size="sm"
                        :model-value="isSectionFullySelected(section)"
                        @click.stop="toggleSectionSelection(section)"
                        color="primary"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ section.name }}</q-item-label>
                      <q-item-label caption>{{ getSelectedCountBySection(section) }}/{{ getSectionModulesCount(section) }} seleccionados</q-item-label>
                    </q-item-section>
                  </template>

                  <div class="row q-col-gutter-xs q-pa-sm bg-grey-1">
                    <div
                      v-for="modul in section.modules"
                      :key="modul.id"
                      class="col-xs-6 col-sm-4"
                    >
                      <div class="module-check-card" :class="{ 'active': moduleSelected.includes(modul.id) }">
                        <q-checkbox
                          v-model="moduleSelected"
                          :val="modul.id"
                          :label="modul.title"
                          dense
                          size="sm"
                          class="full-width"
                        />
                      </div>
                    </div>
                  </div>
                </q-expansion-item>
              </q-scroll-area>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat color="negative" label="Eliminar Rubro" @click="deleteBusinessType" :loading="visible" size="sm" class="q-mr-auto no-caps" />
            <q-btn flat color="grey-7" label="Cancelar" @click="closeModal" size="sm" class="no-caps" />
            <q-btn unelevated color="primary" label="Guardar Cambios" type="submit" :loading="visible" class="btn-premium q-px-md" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Add Business Type Dialog -->
    <q-dialog v-model="openAddBusinessType" persistent transition-show="scale" transition-hide="scale">
      <q-card class="modern-business-dialog shadow-12">
        <q-form @submit="saveBusinessType">
          <q-card-section class="modern-dialog-header">
            <div class="row items-center no-wrap">
              <div class="header-icon-container bg-primary-gradient text-white q-mr-md">
                <q-icon name="add" size="24px" />
              </div>
              <div>
                <div class="text-subtitle1 text-weight-bold">Nuevo Rubro</div>
                <div class="text-caption text-grey-7">Configura un nuevo tipo de negocio</div>
              </div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup class="text-grey-6" />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-xs">
            <div class="row q-col-gutter-y-md">
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  outlined
                  v-model="businessType.name"
                  autofocus
                  label="Nombre del Rubro"
                  placeholder="Ej: Restaurante, Farmacia"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="storefront" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  outlined
                  v-model="businessType.description"
                  type="textarea"
                  label="Descripción"
                  placeholder="Añade una descripción clara..."
                  rows="2"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12">
                <q-input
                  outlined
                  v-model="businessType.pixel"
                  type="textarea"
                  label="Facebook Pixel"
                  placeholder="Pega el código del pixel aquí..."
                  rows="2"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="code" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Dropfile Inputs -->
              <div class="col-12 row q-col-gutter-x-md">
                <div class="col-6">
                  <div
                    class="dropzone-container"
                    @dragover.prevent="dragOverImage = true"
                    @dragleave.prevent="dragOverImage = false"
                    @drop.prevent="onDropImage"
                    @click="$refs.imageInputAdd.click()"
                    :class="{ 'dragging': dragOverImage }"
                  >
                    <input type="file" ref="imageInputAdd" style="display: none" accept="image/*" @change="onImageInput" />
                    <div v-if="!imagePreview" class="dropzone-content">
                      <q-icon name="add_photo_alternate" size="28px" color="primary" />
                      <div class="text-caption text-weight-medium">Imagen</div>
                    </div>
                    <div v-else class="dropzone-preview">
                      <q-img
                        :src="imagePreview"
                        class="full-height rounded-borders"
                        fit="cover"
                      >
                        <div class="absolute-bottom-right q-pa-xs">
                          <q-btn round dense color="negative" icon="close" size="xs" @click.stop="clearImage" />
                        </div>
                      </q-img>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div
                    class="dropzone-container"
                    @dragover.prevent="dragOverVideo = true"
                    @dragleave.prevent="dragOverVideo = false"
                    @drop.prevent="onDropVideo"
                    @click="$refs.videoInputAdd.click()"
                    :class="{ 'dragging': dragOverVideo }"
                  >
                    <input type="file" ref="videoInputAdd" style="display: none" accept="video/*" @change="onVideoInput" />
                    <div v-if="!videoFile" class="dropzone-content">
                      <q-icon name="video_library" size="28px" color="primary" />
                      <div class="text-caption text-weight-medium">Video</div>
                    </div>
                    <div v-else class="dropzone-preview video-preview">
                      <div class="column items-center justify-center full-height bg-grey-2 rounded-borders">
                        <q-icon name="check_circle" color="positive" size="24px" />
                        <span class="text-caption text-positive">Video Listo</span>
                        <q-btn round dense color="negative" icon="close" size="xs" class="absolute-top-right q-ma-xs" @click.stop="clearVideo" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-py-md">
            <div class="module-section-box">
              <div class="row items-center q-mb-md">
                <div class="text-subtitle2 text-weight-bold">
                  <q-icon name="widgets" class="q-mr-xs" color="primary" /> Módulos habilitados
                </div>
                <q-space />
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  :color="isAllSelected ? 'negative' : 'primary'"
                  :label="isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'"
                  @click="toggleSelectAll"
                  class="rounded-borders"
                />
              </div>

              <q-scroll-area style="height: 200px;" class="modern-scroll">
                <q-expansion-item
                  v-for="section in sections"
                  :key="section.id"
                  dense
                  header-class="section-header"
                  default-opened
                >
                  <template v-slot:header>
                    <q-item-section avatar min-width="30px">
                      <q-checkbox
                        dense
                        size="sm"
                        :model-value="isSectionFullySelected(section)"
                        @click.stop="toggleSectionSelection(section)"
                        color="primary"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ section.name }}</q-item-label>
                      <q-item-label caption>{{ getSelectedCountBySection(section) }}/{{ getSectionModulesCount(section) }} seleccionados</q-item-label>
                    </q-item-section>
                  </template>

                  <div class="row q-col-gutter-xs q-pa-sm bg-grey-1">
                    <div
                      v-for="modul in section.modules"
                      :key="modul.id"
                      class="col-xs-6 col-sm-4"
                    >
                      <div class="module-check-card" :class="{ 'active': moduleSelected.includes(modul.id) }">
                        <q-checkbox
                          v-model="moduleSelected"
                          :val="modul.id"
                          :label="modul.title"
                          dense
                          size="sm"
                          class="full-width"
                        />
                      </div>
                    </div>
                  </div>
                </q-expansion-item>
              </q-scroll-area>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat color="grey-7" label="Cancelar" @click="closeModal" size="sm" class="no-caps" />
            <q-btn unelevated color="primary" label="Crear Rubro" type="submit" :loading="visible" class="btn-premium q-px-md" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify } from 'quasar'
export default {
  name: 'BusinessTypePage',
  data () {
    return {
      businessTypes: [],
      modules: [],
      /**
       * Sections with modules grouped
       * @type {Array}
       */
      sections: [],
      businessType: {},
      filter: '',
      moduleSelected: [],
      imageFile: null,
      imagePreview: null,
      videoFile: null,
      /**
       * Params search
       * @type {Object}
       */
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
      },
      visible: false,
      openAddBusinessType: false,
      openEditBusinessType: false,
      dragOverImage: false,
      dragOverVideo: false,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'ID',
          field: 'id',
          sortable: true,
          style: 'width: 80px'
        },
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'description',
          align: 'left',
          label: 'Descripción',
          field: 'description',
          sortable: true,
          format: (val) => val && val.length > 50 ? val.substring(0, 50) + '...' : val
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
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
      this.searchData(data)
    }
  },
  created () {
    this.getSections()
  },
  computed: {
    /**
     * Check if all modules are selected
     * @returns {Boolean}
     */
    isAllSelected () {
      return this.allModuleIds.length > 0 && this.allModuleIds.every(id => this.moduleSelected.includes(id))
    },
    /**
     * Get all module IDs from all sections
     * @returns {Array}
     */
    allModuleIds () {
      return this.sections.flatMap(section => section.modules?.map(m => m.id) || [])
    }
  },
  methods: {
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddBusinessType = false
      this.openEditBusinessType = false
      this.businessType = {}
      this.moduleSelected = []
      this.imageFile = null
      this.imagePreview = null
      this.videoFile = null
    },
    /**
     * Search business types
     * @param  {String} data - Search term
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getBusinessTypes(this.params)
    },
    /**
     * Get all business types
     */
    getBusinessTypes (params = this.params) {
      this.visible = true
      this.$api.get('business-types', { params })
        .then(({ data }) => {
          this.businessTypes = data.data
          this.visible = false
          this.paginationConfig.rowsNumber = data.total
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.response?.data?.message || err.message || 'Error al cargar los rubros',
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getBusinessTypes(this.params)
    },
    /**
     * Save business type
     */
    saveBusinessType () {
      this.visible = true
      const formData = new FormData()
      formData.append('name', this.businessType.name)
      formData.append('description', this.businessType.description)
      if (this.businessType.pixel) {
        formData.append('pixel', this.businessType.pixel)
      }
      if (this.imageFile) {
        formData.append('image', this.imageFile)
      }
      if (this.videoFile) {
        formData.append('video', this.videoFile)
      }
      if (this.moduleSelected && this.moduleSelected.length > 0) {
        this.moduleSelected.forEach((moduleId, index) => {
          formData.append(`modules[${index}]`, moduleId)
        })
      }

      this.$api.post('business-types', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(({ data }) => {
          this.getBusinessTypes()
          this.openAddBusinessType = false
          this.visible = false
          this.businessType = {}
          this.moduleSelected = []
          Notify.create({
            message: 'Rubro creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.response?.data?.message || err.message || 'Error al crear el rubro',
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Edit business type
     */
    editBusinessType (event, row, index) {
      this.openEditBusinessType = true
      this.businessType = { ...row }
      this.moduleSelected = row.modules ? row.modules.map(element => element.id) : []
      this.imageFile = null
      this.imagePreview = null
      this.videoFile = null
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      const formData = new FormData()
      formData.append('name', this.businessType.name)
      formData.append('description', this.businessType.description)
      if (this.businessType.pixel) {
        formData.append('pixel', this.businessType.pixel)
      }
      if (this.imageFile) {
        formData.append('image', this.imageFile)
      }
      if (this.videoFile) {
        formData.append('video', this.videoFile)
      }
      if (this.moduleSelected && this.moduleSelected.length > 0) {
        this.moduleSelected.forEach((moduleId, index) => {
          formData.append(`modules[${index}]`, moduleId)
        })
      }
      formData.append('_method', 'PUT')

      this.$api.post(`business-types/${this.businessType.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(({ data }) => {
          this.getBusinessTypes()
          this.openEditBusinessType = false
          this.visible = false
          this.businessType = {}
          this.moduleSelected = []
          Notify.create({
            message: 'Rubro editado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.response?.data?.message || err.message || 'Error al editar el rubro',
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Delete business type
     */
    deleteBusinessType () {
      this.$q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar el rubro "${this.businessType.name}"?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.visible = true
        this.$api.delete(`business-types/${this.businessType.id}`)
          .then(({ data }) => {
            this.getBusinessTypes()
            this.openEditBusinessType = false
            this.visible = false
            this.businessType = {}
            this.moduleSelected = []
            Notify.create({
              message: 'Rubro eliminado exitosamente',
              icon: 'check_circle',
              color: 'positive'
            })
          })
          .catch(err => {
            this.visible = false
            Notify.create({
              message: err.response?.data?.message || err.message || 'Error al eliminar el rubro',
              icon: 'warning',
              color: 'negative'
            })
          })
      })
    },
    /**
     * Get all sections with modules
     */
    async getSections () {
      try {
        const { data } = await this.$api.get('sections', {
          params: {
            sortBy: 'index',
            sortOrder: 'asc'
          }
        })
        this.sections = data
        // Also flatten modules for compatibility
        this.modules = data.flatMap(section => section.modules || [])
      } catch (err) {
        console.error('Error loading sections:', err)
      }
    },
    /**
     * Toggle select/deselect all modules
     */
    toggleSelectAll () {
      if (this.isAllSelected) {
        this.moduleSelected = []
      } else {
        this.moduleSelected = [...this.allModuleIds]
      }
    },
    /**
     * Toggle select/deselect all modules in a section
     * @param {Object} section - Section object
     */
    toggleSectionSelection (section) {
      const sectionModuleIds = section.modules?.map(m => m.id) || []
      const isFullySelected = this.isSectionFullySelected(section)

      if (isFullySelected) {
        // Deselect all modules in this section
        this.moduleSelected = this.moduleSelected.filter(id => !sectionModuleIds.includes(id))
      } else {
        // Select all modules in this section
        const newSelection = new Set([...this.moduleSelected, ...sectionModuleIds])
        this.moduleSelected = [...newSelection]
      }
    },
    /**
     * Check if all modules in a section are selected
     * @param {Object} section - Section object
     * @returns {Boolean}
     */
    isSectionFullySelected (section) {
      const sectionModuleIds = section.modules?.map(m => m.id) || []
      return sectionModuleIds.length > 0 && sectionModuleIds.every(id => this.moduleSelected.includes(id))
    },
    /**
     * Get count of selected modules in a section
     * @param {Object} section - Section object
     * @returns {Number}
     */
    getSelectedCountBySection (section) {
      const sectionModuleIds = section.modules?.map(m => m.id) || []
      return sectionModuleIds.filter(id => this.moduleSelected.includes(id)).length
    },
    /**
     * Get total modules count in a section
     * @param {Object} section - Section object
     * @returns {Number}
     */
    getSectionModulesCount (section) {
      return section.modules?.length || 0
    },
    /**
     * Handle image input from file picker
     */
    onImageInput (e) {
      const file = e.target.files[0]
      if (file) {
        this.imageFile = file
        this.onImageSelected(file)
      }
    },
    /**
     * Handle video input from file picker
     */
    onVideoInput (e) {
      const file = e.target.files[0]
      if (file) {
        this.videoFile = file
        this.onVideoSelected(file)
      }
    },
    /**
     * Handle drop image
     */
    onDropImage (e) {
      this.dragOverImage = false
      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        this.imageFile = files[0]
        this.onImageSelected(this.imageFile)
      }
    },
    /**
     * Handle drop video
     */
    onDropVideo (e) {
      this.dragOverVideo = false
      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        this.videoFile = files[0]
        this.onVideoSelected(this.videoFile)
      }
    },
    /**
     * Handle image selection
     */
    onImageSelected (file) {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        this.imagePreview = null
      }
    },
    /**
     * Clear selected image
     */
    clearImage () {
      this.imageFile = null
      this.imagePreview = null
      if (this.businessType.image) {
        this.businessType.image = null
      }
    },
    /**
     * Get image URL from image object
     */
    getImageUrl (image) {
      if (!image) return ''
      return image.url || ''
    },
    /**
     * Handle video selection
     */
    onVideoSelected (file) {
      if (!file) {
        this.videoFile = null
      }
    },
    /**
     * Clear selected video
     */
    clearVideo () {
      this.videoFile = null
      if (this.businessType.video) {
        this.businessType.video = null
      }
    }
  }
}
</script>

<style scoped>
.modern-business-dialog {
  width: 500px;
  max-width: 95vw;
  border-radius: 20px;
  overflow: hidden;
  background: white;
}

.modern-dialog-header {
  padding: 20px 24px;
}

.header-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(var(--q-primary-rgb), 0.3);
}

.bg-primary-gradient {
  background: linear-gradient(135deg, var(--q-primary) 0%, #3a7bd5 100%);
}

.modern-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #fcfcfc;
}

/* Dropzone Styles */
.dropzone-container {
  height: 100px;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.dropzone-container:hover {
  border-color: var(--q-primary);
  background: #f1f5f9;
}

.dropzone-container.dragging {
  border-color: var(--q-primary);
  background: rgba(var(--q-primary-rgb), 0.05);
  transform: scale(1.02);
}

.dropzone-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.dropzone-preview {
  height: 100%;
  width: 100%;
}

.video-preview {
  position: relative;
}

/* Module Section */
.module-section-box {
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #edf2f7;
}

.modern-scroll {
  border-radius: 8px;
}

.section-header {
  border-radius: 10px;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.section-header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.module-check-card {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s;
  background: white;
}

.module-check-card:hover {
  background: #f1f5f9;
}

.module-check-card.active {
  background: white;
  border-color: rgba(var(--q-primary-rgb), 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-premium {
  border-radius: 12px;
  font-weight: 600;
  padding: 10px 24px;
  box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.2);
  transition: all 0.3s;
}

.btn-premium:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(var(--q-primary-rgb), 0.3);
}

.no-caps {
  text-transform: none;
}
</style>
