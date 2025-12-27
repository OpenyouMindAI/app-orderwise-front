<template>
  <q-page class="flex flex-center" style="background: #fafafa;">
    <div class="welcome-container q-pa-lg">
      <!-- Header Section -->
      <div class="text-center q-mb-xl">
        <div class="text-h3 text-weight-light text-grey-8 q-mb-sm">Bienvenido a Qbits</div>
        <div class="text-h6 text-grey-6 text-weight-light">Completa tus primeros pasos para empezar a gestionar tu negocio.</div>
      </div>

      <!-- Tasks List -->
      <q-list class="task-list">
        <q-expansion-item
          v-for="(task, index) in tasks"
          :key="index"
          group="tasks"
          :icon="task.completed ? 'check_circle' : task.icon"
          :label="task.title"
          :caption="task.caption"
          header-class="task-header"
          expand-icon-class="text-grey-5"
          :class="['task-item', { 'task-completed': task.completed }]"
        >
          <q-card flat class="q-pa-md">
            <div class="text-body1 text-grey-7 q-mb-lg">
              {{ task.description }}
            </div>
            <div class="text-right">
              <q-btn
                flat
                color="primary"
                :label="task.buttonLabel"
                :to="{ name: task.routeName }"
                icon-right="arrow_forward"
                no-caps
              />
            </div>
          </q-card>
        </q-expansion-item>
      </q-list>

      <!-- Progress Section at Bottom -->
      <div class="progress-container q-mt-xl text-center">
        <div class="flex flex-center q-gutter-x-xs">
          <div
            v-for="n in totalCount"
            :key="n"
            class="progress-segment"
            :class="{ 'segment-active': n <= completedCount }"
          ></div>
        </div>
        <div class="text-subtitle1 text-grey-6 q-mt-md">
          Has completado {{ completedCount }} de {{ totalCount }} tareas fundamentales
        </div>
      </div>

      <!-- Footer Help -->
      <div class="text-center q-mt-xl">
        <div class="text-body2 text-grey-6">
          ¿Necesitas ayuda? <a href="#" class="text-primary" style="text-decoration: none; font-weight: 600" @click.prevent="$router.push({ name: 'Tutorial' })">Ver tutoriales</a>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'

const tasks = ref([
  {
    id: 'company_config',
    title: 'Completa los Datos de tu Empresa',
    caption: 'Configuración inicial',
    icon: 'business',
    description: 'Información básica de tu empresa para facturas y documentos.',
    buttonLabel: 'Configurar',
    routeName: 'CompanyConfig'
  },
  {
    id: 'branch_office',
    title: 'Crea tu primera Sucursal',
    caption: 'Expande tu negocio',
    icon: 'store',
    description: 'Registra tu primera sucursal para gestionar inventario y ventas.',
    buttonLabel: 'Gestionar Sucursales',
    routeName: 'BranchOffice'
  },
  {
    id: 'product',
    title: 'Registra tu primer Producto',
    caption: 'Llena tu inventario',
    icon: 'inventory_2',
    description: 'Agrega productos con precios, costos y control de stock.',
    buttonLabel: 'Agregar Productos',
    routeName: 'Product'
  },
  {
    id: 'point_of_sale',
    title: 'Realiza tu primera Venta',
    caption: 'Empieza a facturar',
    icon: 'point_of_sale',
    description: 'Registra tu primera transacción y observa el movimiento del inventario.',
    buttonLabel: 'Ir a Ventas',
    routeName: 'PointOfSale'
  },
  {
    id: 'user',
    title: 'Invita a tu Equipo',
    caption: 'Colaboración',
    icon: 'group_add',
    description: 'Invita colaboradores y asigna roles específicos.',
    buttonLabel: 'Gestionar Usuarios',
    routeName: 'User'
  }
])

const completedCount = computed(() => tasks.value.filter(t => t.completed).length)
const totalCount = computed(() => tasks.value.length)

/**
 * Verifica el estado de completado de las tareas consultando el endpoint del backend
 */
const checkTasksCompletion = async () => {
  try {
    const { data } = await api.get('/onboarding/tasks/status')

    // Actualizar el estado de cada tarea basándose en la respuesta del backend
    data.tasks.forEach(backendTask => {
      const taskIndex = tasks.value.findIndex(t => t.id === backendTask.id)
      if (taskIndex !== -1) {
        tasks.value[taskIndex].completed = backendTask.completed
      }
    })
  } catch (error) {
    console.error('Error al verificar el estado de las tareas:', error)
    // En caso de error, las tareas mantienen su estado inicial (false)
  }
}

// Verificar el estado al montar el componente
onMounted(() => {
  checkTasksCompletion()
})
</script>

<style scoped>
.welcome-container {
  width: 100%;
  max-width: 720px;
}

.task-list {
  background: transparent;
}

.task-item {
  background: white;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

/* .task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
} */

.task-header {
  padding: 20px 24px;
  font-weight: 500;
  color: #424242;
}

:deep(.q-card) {
  box-shadow: none !important;
  transform: none !important;
}

:deep(.q-item__section--avatar) {
  min-width: 40px;
  color: #757575;
}

:deep(.q-item__label) {
  font-size: 1.1rem;
}

:deep(.q-item__label--caption) {
  color: #9e9e9e;
  font-size: 0.9rem;
  margin-top: 4px;
}

:deep(.q-expansion-item) {
  transition: all 0.3s ease;
}

:deep(.q-expansion-item:hover),
:deep(.q-expansion-item:focus-within) {
  transform: translateX(5px);
  box-shadow: inset 0 0 0 2px var(--q-primary);
}

/* Eliminar todos los efectos hover de Quasar */
:deep(.q-item:hover),
:deep(.q-focusable:hover),
:deep(.q-hoverable:hover),
:deep(.q-expansion-item__toggle-icon:hover) {
  background: transparent !important;
  color: inherit !important;
  transform: none !important;
}

:deep(.q-item:hover > .q-focus-helper) {
  background: transparent !important;
  opacity: 0 !important;
}

:deep(.q-expansion-item__container:hover) {
  background: none !important;
}

/* Estilos para tareas completadas */
.task-completed {
  opacity: 0.6;
}

.task-completed :deep(.q-item__section--avatar) {
  color: #4caf50 !important;
}

.task-completed :deep(.q-item__label) {
  text-decoration: line-through;
}

.task-completed:hover {
  opacity: 0.7;
}

.progress-segment {
  width: 32px;
  height: 4px;
  border-radius: 10px;
  background: #eeeeee;
  transition: all 0.4s ease;
}

.segment-active {
  background: var(--q-primary);
  box-shadow: 0 0 10px rgba(var(--q-primary), 0.2);
}
</style>
