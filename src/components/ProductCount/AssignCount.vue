<template>
  <div>
    <div class="text-h6 q-mb-md">Asignar Nuevo Conteo de Inventario</div>

    <q-form @submit="assignCount">
      <q-card class="q-pa-md">
        <div class="row q-col-gutter-md">
          <!-- Selección de Sucursal -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="newCount.branch_office_id"
              :options="branches"
              option-label="name"
              option-value="id"
              label="Sucursal"
              :rules="[val => !!val || 'Seleccione una sucursal']"
              emit-value
              map-options
              clearable
            />
          </div>

          <!-- Selección de Almacén -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="newCount.warehouse_id"
              :options="filteredWarehouses"
              option-label="name"
              option-value="id"
              label="Almacén"
              :rules="[val => !!val || 'Seleccione un almacén']"
              emit-value
              map-options
              clearable
              :disable="!newCount.branch_office_id"
            />
          </div>

          <!-- Asignación de Responsables -->
          <div class="col-12">
            <q-select
              v-model="newCount.responsibles"
              :options="employees"
              option-label="name"
              multiple
              use-chips
              label="Responsables del conteo"
              :rules="[val => val && val.length > 0 || 'Seleccione al menos un responsable']"
            />
          </div>

          <!-- Periodicidad -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="newCount.periodicity"
              :options="periodicityOptions"
              label="Periodicidad (opcional)"
              clearable
            />
          </div>

          <!-- Notas adicionales -->
          <div class="col-12">
            <q-input
              v-model="newCount.notes"
              type="textarea"
              label="Notas adicionales"
              autogrow
            />
          </div>
        </div>

        <q-card-actions align="right" class="q-mt-md">
          <q-btn label="Cancelar" color="secondary" flat />
          <q-btn label="Asignar Conteo" type="submit" color="primary" />
        </q-card-actions>
      </q-card>
    </q-form>

    <!-- Lista de conteos asignados recientemente -->
    <div class="text-h6 q-mt-xl q-mb-md">Conteos Asignados Recientemente</div>

    <q-table
      :rows="recentCounts"
      :columns="countColumns"
      row-key="id"
      :pagination="{ rowsPerPage: 5 }"
      flat
      bordered
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.value)" class="q-pa-sm">
            {{ formatStatus(props.value) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-responsibles="props">
        <q-td :props="props">
          <div class="q-gutter-xs">
            <q-chip v-for="user in props.value" :key="user.id" small>
              {{ user.name }}
            </q-chip>
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  props: {
    branches: {
      type: Array,
      required: true
    },
    warehouses: {
      type: Array,
      required: true
    },
    employees: {
      type: Array,
      required: true
    }
  },

  setup (props, { emit }) {
    const newCount = ref({
      branch_office_id: null,
      warehouse_id: null,
      responsibles: [],
      periodicity: null,
      notes: ''
    })

    const periodicityOptions = [
      { label: 'Mensual', value: 'mensual' },
      { label: 'Semanal', value: 'semanal' },
      { label: 'Cíclico ABC', value: 'cíclico' },
      { label: 'Anual', value: 'anual' }
    ]

    const countColumns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'branch', label: 'Sucursal', field: row => row.branch_office_id ? props.branches.find(b => b.id === row.branch_office_id)?.name : '-', align: 'left' },
      { name: 'warehouse', label: 'Almacén', field: row => row.warehouse_id ? props.warehouses.find(w => w.id === row.warehouse_id)?.name : '-', align: 'left' },
      { name: 'responsibles', label: 'Responsables', field: 'responsibles', align: 'left' },
      { name: 'status', label: 'Estado', field: 'status', align: 'center' },
      { name: 'created_at', label: 'Fecha', field: 'created_at', align: 'right' }
    ]

    // Mock data para conteos recientes
    const recentCounts = ref([
      {
        id: 1,
        branch_office_id: 1,
        warehouse_id: 1,
        responsibles: [{ id: 1, name: 'Juan Pérez' }],
        status: 'completed',
        created_at: '2023-06-15'
      },
      {
        id: 2,
        branch_office_id: 1,
        warehouse_id: 2,
        responsibles: [{ id: 2, name: 'María Gómez' }],
        status: 'in_progress',
        created_at: '2023-06-16'
      },
      {
        id: 3,
        branch_office_id: 2,
        warehouse_id: 3,
        responsibles: [{ id: 3, name: 'Carlos Ruiz' }],
        status: 'pending',
        created_at: '2023-06-17'
      }
    ])

    const filteredWarehouses = computed(() => {
      if (!newCount.value.branch_office_id) return props.warehouses
      return props.warehouses.filter(w => w.branch_id === newCount.value.branch_office_id)
    })

    const getStatusColor = (status) => {
      const colors = {
        pending: 'orange',
        in_progress: 'blue',
        completed: 'green',
        recount: 'purple'
      }
      return colors[status] || 'grey'
    }

    const formatStatus = (status) => {
      const statusMap = {
        pending: 'Pendiente',
        in_progress: 'En Progreso',
        completed: 'Completado',
        recount: 'Reconteo'
      }
      return statusMap[status] || status
    }

    const assignCount = () => {
      const assignedCount = {
        ...newCount.value,
        status: 'pending',
        responsibles: props.employees.filter(e => newCount.value.responsibles.includes(e.id))
      }

      emit('count-assigned', assignedCount)

      // Reset form
      newCount.value = {
        branch_office_id: null,
        warehouse_id: null,
        responsibles: [],
        periodicity: null,
        notes: ''
      }
    }

    return {
      newCount,
      periodicityOptions,
      recentCounts,
      countColumns,
      filteredWarehouses,
      getStatusColor,
      formatStatus,
      assignCount
    }
  }
}
</script>

<style scoped>
.q-table__container {
  box-shadow: none;
  border: 1px solid #e0e0e0;
}
</style>
