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
    <q-dialog v-model="openEditBusinessType" persistent>
      <q-card style="width: 600px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Modificar Rubro</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="businessType.name"
                autofocus
                label="Nombre del Rubro"
                hint="Ej: Restaurante, Farmacia, Supermercado"
              />
            </div>
            <div class="col-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="businessType.description"
                type="textarea"
                label="Descripción"
                hint="Descripción detallada del tipo de negocio"
                rows="3"
              />
            </div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" v-for="modul in modules" :key="modul.id">
              <q-toggle
                size="xs"
                v-model="moduleSelected"
                :val="modul.id"
                :label="modul.title"
                :disable="visible"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteBusinessType" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddBusinessType" persistent>
      <q-card style="width: 600px; max-width: 80vw;">
        <q-form @submit="saveBusinessType">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar Rubro</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="businessType.name"
                autofocus
                label="Nombre del Rubro"
                hint="Ej: Restaurante, Farmacia, Supermercado"
              />
            </div>
            <div class="col-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="businessType.description"
                type="textarea"
                label="Descripción"
                hint="Descripción detallada del tipo de negocio"
                rows="3"
              />
            </div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" v-for="modul in modules" :key="modul.id">
              <q-toggle
                size="xs"
                v-model="moduleSelected"
                :val="modul.id"
                :label="modul.title"
                :disable="visible"
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
export default {
  name: 'BusinessTypePage',
  data () {
    return {
      businessTypes: [],
      modules: [],
      businessType: {},
      filter: '',
      moduleSelected: [],
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
    this.getModules()
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
      const payload = {
        name: this.businessType.name,
        description: this.businessType.description,
        modules: this.moduleSelected
      }

      this.$api.post('business-types', payload)
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
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      const payload = {
        name: this.businessType.name,
        description: this.businessType.description,
        modules: this.moduleSelected
      }

      this.$api.put(`business-types/${this.businessType.id}`, payload)
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
     * Get all modules
     */
    async getModules () {
      try {
        const { data } = await this.$api.get('modules')
        this.modules = data
      } catch (err) {
        console.error('Error loading modules:', err)
      }
    }
  }
}
</script>
