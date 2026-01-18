<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddTypeOfService = true" icon="add_circle" label=""/>
      </div>
      <div class="col-12">
        <q-table
          title="Tipos de Servicios"
          row-key="id"
          :columns="columns"
          :rows="serviceTypes"
          :loading="loading"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @request="setPagination"
          no-data-label="No se encontraron registros"
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
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round color="primary" icon="edit" @click="editServiceType(props.row)"/>
              <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)"/>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <q-dialog v-model="openAddTypeOfService" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveServiceType">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar Tipo de Servicio</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input
                :rules="[val => !!val || 'Campo requerido']"
                filled
                v-model="serviceType.name"
                label="Nombre del servicio"
                lazy-rules
              />
            </div>
            <div class="col-12">
              <q-input
                :rules="[val => !!val || 'Campo requerido']"
                filled
                v-model="serviceType.code"
                label="Código"
                lazy-rules
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn style="background-color: #3b9e9d; color: white;" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="loading"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="openEditTypeOfService" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Editar Tipo de Servicio</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input
                :rules="[val => !!val || 'Campo requerido']"
                filled
                v-model="serviceType.name"
                label="Nombre del servicio"
                lazy-rules
              />
            </div>
            <div class="col-12">
              <q-input
                :rules="[val => !!val || 'Campo requerido']"
                filled
                v-model="serviceType.code"
                label="Código"
                lazy-rules
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn style="background-color: #3b9e9d; color: white;" label="Cancelar" @click="closeModal" />
            <q-btn color="negative" label="Eliminar" @click="deleteServiceType" :loading="loading" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="loading"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify } from 'quasar'
export default {
  data () {
    return {
      serviceTypes: [],
      serviceType: {
        id: null,
        name: '',
        code: ''
      },
      filter: '',
      loading: false,
      openAddTypeOfService: false,
      openEditTypeOfService: false,
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
          name: 'code',
          align: 'left',
          label: 'Código',
          field: 'code',
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Acciones',
          field: '',
          sortable: false
        }
      ],
      paginationConfig: {
        sortBy: 'id',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 10
      }
    }
  },
  mounted () {
    this.getServiceTypes()
  },
  methods: {
    getServiceTypes () {
      this.loading = true
      this.$api.get('type-of-services', { params: this.params })
        .then(({ data }) => {
          this.serviceTypes = data.data
          this.paginationConfig.rowsNumber = data.total
          this.loading = false
        })
        .catch(error => {
          this.loading = false
          const message = error.response?.data?.message ||
                   error.message ||
                   'Error al procesar la solicitud'

          Notify.create({
            message,
            color: 'negative',
            icon: 'error'
          })
        })
    },
    saveServiceType () {
      this.loading = true
      this.$api.post('type-of-services', this.serviceType)
        .then(() => {
          this.getServiceTypes()
          this.closeModal()
          Notify.create({
            message: 'Tipo de servicio creado exitosamente',
            color: 'positive'
          })
        })
        .catch(error => {
          this.loading = false
          const message = error.response?.data?.message ||
                   'Error al actualizar el tipo de servicio'

          Notify.create({
            message: message.includes('validation')
              ? 'Complete todos los campos requeridos'
              : message,
            color: 'negative',
            icon: 'error',
            timeout: 4000
          })
        })
    },
    editServiceType (serviceType) {
      this.serviceType = { ...serviceType }
      this.openEditTypeOfService = true
    },
    saveEdit () {
      this.loading = true
      this.$api.put(`type-of-services/${this.serviceType.id}`, this.serviceType)
        .then(() => {
          this.getServiceTypes()
          this.closeModal()
          Notify.create({
            message: 'Tipo de servicio actualizado exitosamente',
            color: 'positive'
          })
        })
        .catch(error => {
          this.loading = false

          let message = 'Error al actualizar el servicio'

          if (error.response?.data?.message) {
            message = error.message
          } else if (error.response?.status === 422) {
            message = 'Complete todos los campos correctamente'
          } else if (!error.response && error.request) {
            message = 'Problema de conexión con el servidor'
          }

          Notify.create({
            message,
            color: 'negative',
            icon: 'error',
            timeout: 4000
          })
        })
    },
    confirmDelete (serviceType) {
      this.$q.dialog({
        title: 'Confirmar',
        message: `¿Estás seguro de eliminar "${serviceType.name}"?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.deleteServiceType(serviceType)
      })
    },
    deleteServiceType (serviceType = null) {
      const id = serviceType ? serviceType.id : this.serviceType.id
      this.loading = true
      this.$api.delete(`type-of-services/${id}`)
        .then(() => {
          this.getServiceTypes()
          this.closeModal()
          Notify.create({
            message: 'Tipo de servicio eliminado exitosamente',
            color: 'positive'
          })
        })
        .catch(error => {
          this.loading = false
          const status = error.response?.status
          let message = 'Error al eliminar el tipo de servicio'

          if (status === 404) message = 'El servicio ya no existe'
          if (status === 409) message = 'Existen registros asociados a este servicio'
          if (status === 403) message = 'No tiene permisos para eliminar'

          Notify.create({
            message: error.response?.data?.message || message,
            color: 'negative',
            icon: 'error',
            timeout: 4000
          })
        })
    },
    closeModal () {
      this.openAddTypeOfService = false
      this.openEditTypeOfService = false
      this.serviceType = {
        id: null,
        name: '',
        code: ''
      }
      this.loading = false
    },
    setPagination (data) {
      this.params.sortBy = data.pagination.sortBy
      this.params.sortOrder = data.pagination.descending ? 'desc' : 'asc'
      this.params.page = data.pagination.page
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getServiceTypes()
    }
  }
}
</script>
