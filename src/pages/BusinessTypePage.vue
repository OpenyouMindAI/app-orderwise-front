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
      <q-card style="width: 600px; max-width: 90vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Modificar Rubro</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  v-model="businessType.name"
                  autofocus
                  label="Nombre del Rubro"
                />
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  v-model="businessType.description"
                  type="textarea"
                  label="Descripción"
                  rows="2"
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  dense
                  v-model="businessType.pixel"
                  type="textarea"
                  label="Facebook Pixel"
                  rows="2"
                />
              </div>

              <!-- Dropfile Inputs -->
              <div class="col-6">
                <div
                  class="simple-dropzone"
                  @dragover.prevent="dragOverImage = true"
                  @dragleave.prevent="dragOverImage = false"
                  @drop.prevent="onDropImage"
                  @click="$refs.imageInputEdit.click()"
                  :class="{ 'bg-blue-1': dragOverImage }"
                >
                  <input type="file" ref="imageInputEdit" style="display: none" accept="image/*" @change="onImageInput" />
                  <div v-if="!imagePreview && !businessType.image" class="column items-center justify-center full-height text-grey-7">
                    <q-icon name="image" size="24px" />
                    <div class="text-caption">Imagen</div>
                  </div>
                  <q-img v-else :src="imagePreview || getImageUrl(businessType.image)" class="full-height rounded-borders">
                    <div class="absolute-bottom-right q-pa-xs">
                      <q-btn round dense color="negative" icon="close" size="xs" @click.stop="clearImage" />
                    </div>
                  </q-img>
                </div>
              </div>
              <div class="col-6">
                <div
                  class="simple-dropzone"
                  @dragover.prevent="dragOverVideo = true"
                  @dragleave.prevent="dragOverVideo = false"
                  @drop.prevent="onDropVideo"
                  @click="$refs.videoInputEdit.click()"
                  :class="{ 'bg-blue-1': dragOverVideo }"
                >
                  <input type="file" ref="videoInputEdit" style="display: none" accept="video/*" @change="onVideoInput" />
                  <div v-if="!videoFile && !businessType.video" class="column items-center justify-center full-height text-grey-7">
                    <q-icon name="videocam" size="24px" />
                    <div class="text-caption">Video</div>
                  </div>
                  <div v-else class="column items-center justify-center full-height bg-green-1 rounded-borders relative-position">
                    <q-icon name="check_circle" color="positive" size="24px" />
                    <span class="text-caption text-positive">Video OK</span>
                    <q-btn round dense color="negative" icon="close" size="xs" class="absolute-top-right q-ma-xs" @click.stop="clearVideo" />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Module Selection Section -->
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle2">Módulos habilitados</div>
              <q-space />
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                :color="isAllSelected ? 'negative' : 'primary'"
                :label="isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'"
                @click="toggleSelectAll"
              />
            </div>

            <q-scroll-area style="height: 200px;" class="border rounded-borders">
              <q-expansion-item
                v-for="section in sections"
                :key="section.id"
                dense
                header-class="text-weight-bold"
                default-opened
              >
                <template v-slot:header>
                  <q-item-section avatar min-width="30px">
                    <q-checkbox
                      dense
                      size="sm"
                      :model-value="isSectionFullySelected(section)"
                      @click.stop="toggleSectionSelection(section)"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ section.name }}</q-item-label>
                  </q-item-section>
                </template>

                <div class="row q-col-gutter-xs q-pa-sm bg-grey-2">
                  <div
                    v-for="modul in section.modules"
                    :key="modul.id"
                    class="col-xs-6 col-sm-4"
                  >
                    <q-checkbox
                      v-model="moduleSelected"
                      :val="modul.id"
                      :label="modul.title"
                      dense
                      size="sm"
                    />
                  </div>
                </div>
              </q-expansion-item>
            </q-scroll-area>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat color="negative" label="Eliminar" @click="deleteBusinessType" :loading="visible" class="q-mr-auto" />
            <q-btn flat color="primary" label="Cancelar" @click="closeModal" />
            <q-btn unelevated color="primary" label="Guardar" type="submit" :loading="visible" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Add Business Type Dialog -->
    <q-dialog v-model="openAddBusinessType" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 600px; max-width: 90vw;">
        <q-form @submit="saveBusinessType">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Nuevo Rubro</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  v-model="businessType.name"
                  autofocus
                  label="Nombre del Rubro"
                />
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  v-model="businessType.description"
                  type="textarea"
                  label="Descripción"
                  rows="2"
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  dense
                  v-model="businessType.pixel"
                  type="textarea"
                  label="Facebook Pixel"
                  rows="2"
                />
              </div>

              <!-- Dropfile Inputs -->
              <div class="col-6">
                <div
                  class="simple-dropzone"
                  @dragover.prevent="dragOverImage = true"
                  @dragleave.prevent="dragOverImage = false"
                  @drop.prevent="onDropImage"
                  @click="$refs.imageInputAdd.click()"
                  :class="{ 'bg-blue-1': dragOverImage }"
                >
                  <input type="file" ref="imageInputAdd" style="display: none" accept="image/*" @change="onImageInput" />
                  <div v-if="!imagePreview" class="column items-center justify-center full-height text-grey-7">
                    <q-icon name="image" size="24px" />
                    <div class="text-caption">Imagen</div>
                  </div>
                  <q-img v-else :src="imagePreview" class="full-height rounded-borders">
                    <div class="absolute-bottom-right q-pa-xs">
                      <q-btn round dense color="negative" icon="close" size="xs" @click.stop="clearImage" />
                    </div>
                  </q-img>
                </div>
              </div>
              <div class="col-6">
                <div
                  class="simple-dropzone"
                  @dragover.prevent="dragOverVideo = true"
                  @dragleave.prevent="dragOverVideo = false"
                  @drop.prevent="onDropVideo"
                  @click="$refs.videoInputAdd.click()"
                  :class="{ 'bg-blue-1': dragOverVideo }"
                >
                  <input type="file" ref="videoInputAdd" style="display: none" accept="video/*" @change="onVideoInput" />
                  <div v-if="!videoFile" class="column items-center justify-center full-height text-grey-7">
                    <q-icon name="videocam" size="24px" />
                    <div class="text-caption">Video</div>
                  </div>
                  <div v-else class="column items-center justify-center full-height bg-green-1 rounded-borders relative-position">
                    <q-icon name="check_circle" color="positive" size="24px" />
                    <span class="text-caption text-positive">Video OK</span>
                    <q-btn round dense color="negative" icon="close" size="xs" class="absolute-top-right q-ma-xs" @click.stop="clearVideo" />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle2">Módulos habilitados</div>
              <q-space />
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                :color="isAllSelected ? 'negative' : 'primary'"
                :label="isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'"
                @click="toggleSelectAll"
              />
            </div>

            <q-scroll-area style="height: 200px;" class="border rounded-borders">
              <q-expansion-item
                v-for="section in sections"
                :key="section.id"
                dense
                header-class="text-weight-bold"
                default-opened
              >
                <template v-slot:header>
                  <q-item-section avatar min-width="30px">
                    <q-checkbox
                      dense
                      size="sm"
                      :model-value="isSectionFullySelected(section)"
                      @click.stop="toggleSectionSelection(section)"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ section.name }}</q-item-label>
                  </q-item-section>
                </template>

                <div class="row q-col-gutter-xs q-pa-sm bg-grey-2">
                  <div
                    v-for="modul in section.modules"
                    :key="modul.id"
                    class="col-xs-6 col-sm-4"
                  >
                    <q-checkbox
                      v-model="moduleSelected"
                      :val="modul.id"
                      :label="modul.title"
                      dense
                      size="sm"
                    />
                  </div>
                </div>
              </q-expansion-item>
            </q-scroll-area>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat color="primary" label="Cancelar" @click="closeModal" />
            <q-btn unelevated color="primary" label="Crear" type="submit" :loading="visible" />
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
          name: 'modules',
          align: 'left',
          label: 'Modulos Habilitados',
          field: 'modules',
          format: (val) => val.length,
          sortable: true
        },
        {
          name: 'pixel',
          align: 'left',
          label: 'Pixel de Meta',
          field: 'pixel',
          format: (val) => val || 'No configurado',
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
.simple-dropzone {
  height: 100px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  background: #fafafa;
  transition: background 0.2s;
}

.simple-dropzone:hover {
  background: #f0f0f0;
}

.border {
  border: 1px solid #ddd;
}
</style>
