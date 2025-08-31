<template>
  <div class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h4"></div>
      <q-btn
        color="primary"
        icon="add"
        label=""
        @click="openDialog('create')"
      />
    </div>

    <q-table
      flat
      bordered
      title="Listado de Cajas"
      :rows="boxes"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      :pagination="pagination"
      @request="onRequest"
      binary-state-sort
    >
      <template v-slot:top-right>
        <q-input
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Buscar"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="statusColors[props.row.status]"
            :label="statusLabels[props.row.status]"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-sm">
          <q-btn
            dense
            round
            flat
            color="orange"
            icon="edit"
            @click="openDialog('edit', props.row)"
          />
          <q-btn
            dense
            round
            flat
            color="red"
            icon="delete"
            @click="confirmDelete(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-orange text-white row items-center q-pb-none">
          <div class="text-h6">{{ dialog.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeDialog" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitForm">
            <q-input
              v-model="formData.name"
              label="Nombre"
              filled
              lazy-rules
              :rules="[val => !!val || 'El campo es requerido.']"
              class="q-mb-sm"
              :error="!!formData.nameError"
              :error-message="formData.nameError"
            />

            <q-select
              v-model="formData.status"
              label="Estado *"
              filled
              :options="statusOptions"
              emit-value
              map-options
              :rules="[val => !!val || 'Seleccione un estado']"
              class="q-mb-sm"
            />

            <q-card-actions align="right" class="q-pt-none">
              <q-btn
                v-if="dialog.mode === 'edit'"
                flat
                label="Eliminar"
                color="negative"
                @click="confirmDelete(formData)"
              />
              <q-btn label="Cancelar" color="teal" @click="closeDialog" />
              <q-btn
                type="submit"
                label="Guardar"
                color="orange"
                :loading="submitting"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDialog.show">
      <q-card>
        <q-card-section class="bg-orange text-white">
          <div class="text-h6">Confirmar eliminación</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          ¿Estás seguro de eliminar la caja "{{ confirmDialog.boxName }}"?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="CANCELAR"
            color="teal"
            @click="confirmDialog.show = false"
          />
          <q-btn
            label="OK"
            color="orange"
            @click="deleteBox(confirmDialog.box)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/services'
import { authentication } from 'src/stores/module-authentication'

export default {
  setup () {
    const store = authentication()
    const branchOffice = store.branchOffice
    const $q = useQuasar()
    const loading = ref(false)
    const submitting = ref(false)
    const filter = ref('')
    const boxes = ref([])
    const formData = ref({
      id: null,
      name: '',
      status: 'active'
    })

    const dialog = ref({
      show: false,
      title: '',
      mode: 'create'
    })

    const confirmDialog = ref({
      show: false,
      box: null,
      boxName: ''
    })

    const pagination = ref({
      sortBy: 'id',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })

    const statusOptions = [
      { label: 'Activa', value: 'active' },
      { label: 'Inactiva', value: 'inactive' },
      { label: 'En mantenimiento', value: 'maintenance' }
    ]

    const statusLabels = {
      active: 'Activa',
      inactive: 'Inactiva',
      maintenance: 'Mantenimiento'
    }

    const statusColors = {
      active: 'green',
      inactive: 'red',
      maintenance: 'orange'
    }

    const columns = [
      {
        name: 'id',
        required: true,
        label: 'ID',
        align: 'left',
        field: 'id',
        sortable: true
      },
      {
        name: 'name',
        required: true,
        label: 'Nombre',
        align: 'left',
        field: 'name',
        sortable: true
      },
      {
        name: 'status',
        required: true,
        label: 'Estado',
        align: 'left',
        field: 'status',
        sortable: true
      },
      {
        name: 'actions',
        label: 'Acciones',
        align: 'center',
        field: '',
        sortable: false
      }
    ]

    const fetchBoxes = async (props = {}) => {
      loading.value = true

      const params = {
        page: props.pagination?.page || pagination.value.page,
        perPage: props.pagination?.rowsPerPage || pagination.value.rowsPerPage,
        sortBy: props.pagination?.sortBy || pagination.value.sortBy,
        sortOrder: props.pagination?.descending ? 'desc' : 'asc',
        paginate: true,
        dataSearch: {
          name: filter.value
        }
      }

      try {
        const response = await api.get('cashboxes', { params })
        boxes.value = response.data.data
        pagination.value.rowsNumber = response.data.total

        if (props.pagination) {
          pagination.value = props.pagination
        }
      } catch (error) {
        showError('Error al cargar las cajas', error)
      } finally {
        loading.value = false
      }
    }

    const onRequest = (props) => {
      fetchBoxes(props)
    }

    const openDialog = (mode, box = null) => {
      dialog.value.mode = mode

      if (mode === 'edit' && box) {
        dialog.value.title = 'Editar Caja'
        formData.value = { ...box }
      } else {
        dialog.value.title = 'Nueva Caja'
        resetForm()
      }

      dialog.value.show = true
    }

    const closeDialog = () => {
      dialog.value.show = false
      resetForm()
    }

    const resetForm = () => {
      formData.value = {
        id: null,
        name: '',
        status: 'active'
      }
    }

    const submitForm = async () => {
      submitting.value = true

      try {
        if (dialog.value.mode === 'create') {
          formData.value.branch_office_id = branchOffice.id
          await api.post('cashboxes', formData.value)
          showSuccess('Caja creada exitosamente')
        } else {
          await api.put(`cashboxes/${formData.value.id}`, formData.value)
          showSuccess('Caja actualizada exitosamente')
        }

        fetchBoxes(pagination.value)
        closeDialog()
      } catch (error) {
        showError('Error al guardar la caja', error)
      } finally {
        submitting.value = false
      }
    }

    const confirmDelete = (box) => {
      confirmDialog.value.show = true
      confirmDialog.value.box = box
      confirmDialog.value.boxName = box.name
    }

    const deleteBox = async (box) => {
      loading.value = true
      confirmDialog.value.show = false

      try {
        await api.delete(`/cashboxes/${box.id}`)
        showSuccess('Caja eliminada exitosamente')
        fetchBoxes(pagination.value)
        closeDialog()
      } catch (error) {
        showError('Error al eliminar la caja', error)
      } finally {
        loading.value = false
      }
    }

    const showSuccess = (message) => {
      $q.notify({
        type: 'positive',
        message,
        position: 'top'
      })
    }

    const showError = (defaultMessage, error) => {
      const message = error.response?.data?.message || defaultMessage
      $q.notify({
        type: 'negative',
        message,
        position: 'top'
      })
    }

    onMounted(() => {
      fetchBoxes(pagination.value)
    })

    return {
      loading,
      submitting,
      filter,
      boxes,
      formData,
      dialog,
      confirmDialog,
      pagination,
      statusOptions,
      statusLabels,
      statusColors,
      columns,
      onRequest,
      openDialog,
      closeDialog,
      submitForm,
      confirmDelete,
      deleteBox
    }
  }
}
</script>

<style scoped>
.q-table {
  height: calc(100vh - 180px);
}
</style>
