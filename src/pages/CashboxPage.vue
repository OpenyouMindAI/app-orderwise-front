<template>
  <q-page padding>
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center q-gutter-x-sm">
        <span class="text-h6">
          Listado de Cajas
        </span>
        <div class="text-right">
          <q-btn
            round
            color="primary"
            icon="add"
            @click="openDialog('create')"
          >
            <q-tooltip>Nueva Caja</q-tooltip>
          </q-btn>
        </div>
      </div>

      <q-table
        title="Cajas"
        row-key="id"
        :rows="boxes"
        :columns="columns"
        :loading="loading"
        :filter="filter"
        :visible-columns="visibleColumns"
        binary-state-sort
        v-model:pagination="pagination"
        @request="onRequest"
        @row-click="(_, row) => openDialog('edit', row)"
        no-data-label="Registro no encontrado"
        :grid="$q.screen.lt.md"
        class="cashbox-table"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <template v-slot:top>
          <div class="flex justify-end items-center full-width">
            <q-input filled dense debounce="300" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>

        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6">
            <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="openDialog('edit', props.row)">
              <span class="q-focus-helper"></span>

              <q-card-section class="row justify-between items-center compact-card-header">
                <div class="column">
                  <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">
                    {{ props.row.name }}
                    <q-badge v-if="props.row.is_main" color="amber-10" class="q-ml-sm" label="Principal" />
                  </div>
                  <div class="text-caption text-grey-6 text-weight-medium">ID: {{ props.row.id }}</div>
                </div>
                <div class="column items-end">
                  <q-badge
                    :color="statusColors[props.row.status]"
                    :label="statusLabels[props.row.status]"
                    class="q-py-xs q-px-sm text-weight-bold shadow-1"
                    rounded
                    style="font-size: 10px; letter-spacing: 0.5px"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>

        <template v-slot:body-cell-is_main="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="props.row.is_main ? 'amber-2' : 'grey-3'"
              :text-color="props.row.is_main ? 'amber-9' : 'grey-7'"
              :icon="props.row.is_main ? 'star' : 'person'"
              :label="props.row.is_main ? 'Sí' : 'No'"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="statusColors[props.row.status]"
              :label="statusLabels[props.row.status]"
              class="q-pa-sm"
            />
          </q-td>
        </template>
      </q-table>

      <q-dialog v-model="dialog.show" persistent :maximized="$q.screen.lt.sm">
        <q-card :style="$q.screen.lt.sm ? '' : 'width: 600px; max-width: 95vw;'" :class="$q.screen.lt.sm ? 'column full-height' : ''">
          <q-card-section class="bg-primary text-white row items-center q-py-sm col-auto">
            <div class="text-h6">{{ dialog.title }}</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeDialog" />
          </q-card-section>

          <q-form @submit="submitForm" :class="$q.screen.lt.sm ? 'col column' : ''">
            <q-card-section :class="$q.screen.lt.sm ? 'col scroll q-pa-md' : 'q-pa-md'">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="formData.name"
                    label="Nombre"
                    filled
                    dense
                    hide-bottom-space
                    lazy-rules
                    :rules="[val => !!val || 'El campo es requerido.']"
                    autofocus
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="formData.status"
                    label="Estado *"
                    filled
                    dense
                    hide-bottom-space
                    :options="statusOptions"
                    emit-value
                    map-options
                    :rules="[val => !!val || 'Seleccione un estado']"
                  />
                </div>

                <div class="col-12 col-sm-6 flex items-center">
                  <q-toggle
                    v-model="formData.is_main"
                    label="¿Es Caja Principal?"
                    color="amber-9"
                    keep-color
                    icon="star"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md col-auto border-top">
              <q-btn
                v-if="dialog.mode === 'edit'"
                outline
                label="Eliminar"
                color="negative"
                @click="confirmDelete(formData)"
              />
              <q-btn label="Cancelar" color="grey-7" flat @click="closeDialog" />
              <q-btn
                type="submit"
                label="Guardar"
                color="primary"
                unelevated
                :loading="submitting"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>

      <q-dialog v-model="confirmDialog.show">
        <q-card style="min-width: 300px">
          <q-card-section class="bg-negative text-white q-py-sm">
            <div class="text-h6">Confirmar eliminación</div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            ¿Estás seguro de eliminar la caja <strong>{{ confirmDialog.boxName }}</strong>?
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn
              label="Cancelar"
              color="grey-7"
              flat
              @click="confirmDialog.show = false"
            />
            <q-btn
              label="Eliminar"
              color="negative"
              @click="deleteBox(confirmDialog.box)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
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
    const visibleColumns = ref(['id', 'name', 'is_main', 'status'])
    const formData = ref({
      id: null,
      name: '',
      status: 'active',
      is_main: false
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
      active: 'positive',
      inactive: 'negative',
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
        name: 'is_main',
        label: 'Principal',
        align: 'center',
        field: 'is_main',
        sortable: true
      },
      {
        name: 'status',
        required: true,
        label: 'Estado',
        align: 'left',
        field: 'status',
        sortable: true
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
        status: 'active',
        is_main: false
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
        if (dialog.value.show) closeDialog()
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
      visibleColumns,
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
.cashbox-table tbody tr {
  cursor: pointer;
}

.transition-all {
  transition: all 0.3s ease;
}

.compact-card-header {
  padding: 0.8rem 1rem !important;
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

@media (max-width: 1023px) {
  :deep(.q-table__top) {
    padding: 0 !important;
  }

  :deep(.q-table__top .flex) {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: center;
  }

  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}
</style>
