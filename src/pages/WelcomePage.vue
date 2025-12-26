<template>
  <q-page class="flex flex-center" style="background: #fafafa;">
    <div class="welcome-container q-pa-lg">
      <!-- Header Section -->
      <div class="text-center q-mb-lg">
        <div class="text-h4 text-weight-light text-grey-8 q-mb-xs">Bienvenido a OrderWise</div>
        <div class="text-body1 text-grey-6">
          Configura tu negocio en 5 pasos simples
        </div>
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
            <div class="text-body2 text-grey-7 q-mb-md">
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

      <!-- Footer Help -->
      <div class="text-center q-mt-lg">
        <div class="text-caption text-grey-5">
          ¿Necesitas ayuda? <a href="#" class="text-primary" style="text-decoration: none; font-weight: 500" @click.prevent="$router.push({ name: 'Tutorial' })">Ver tutoriales</a>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref /*, onMounted */ } from 'vue'
// import { api } from 'boot/axios'

const tasks = ref([
  {
    title: 'Completa los Datos de tu Empresa',
    caption: 'Configuración inicial',
    icon: 'business',
    description: 'Información básica de tu empresa para facturas y documentos.',
    buttonLabel: 'Configurar',
    routeName: 'CompanyConfig',
    completed: true
  },
  {
    title: 'Crea tu primera Sucursal',
    caption: 'Expande tu negocio',
    icon: 'store',
    description: 'Registra tu primera sucursal para gestionar inventario y ventas.',
    buttonLabel: 'Gestionar Sucursales',
    routeName: 'BranchOffice',
    completed: false
  },
  {
    title: 'Registra tu primer Producto',
    caption: 'Llena tu inventario',
    icon: 'inventory_2',
    description: 'Agrega productos con precios, costos y control de stock.',
    buttonLabel: 'Agregar Productos',
    routeName: 'Product',
    completed: false
  },
  {
    title: 'Realiza tu primera Venta',
    caption: 'Empieza a facturar',
    icon: 'point_of_sale',
    description: 'Registra tu primera transacción y observa el movimiento del inventario.',
    buttonLabel: 'Ir a Ventas',
    routeName: 'PointOfSale',
    completed: false
  },
  {
    title: 'Invita a tu Equipo',
    caption: 'Colaboración',
    icon: 'group_add',
    description: 'Invita colaboradores y asigna roles específicos.',
    buttonLabel: 'Gestionar Usuarios',
    routeName: 'User',
    completed: false
  }
])

/*
// Función para verificar el estado de completado de las tareas
const checkTasksCompletion = async () => {
  try {
    // Task 1: Verificar si hay datos de empresa
    try {
      const { data: company } = await api.get('companies')
      if (company && (Array.isArray(company) ? company.length > 0 : company.id)) {
        tasks.value[0].completed = true
      }
    } catch (e) {
      // Si falla, asumimos que no está completa
    }

    // Task 2: Verificar si hay sucursales
    try {
      const { data: branches } = await api.get('branch-offices')
      if (branches && Array.isArray(branches) && branches.length > 0) {
        tasks.value[1].completed = true
      }
    } catch (e) {
      // Si falla, asumimos que no está completa
    }

    // Task 3: Verificar si hay productos
    try {
      const { data: products } = await api.get('products')
      if (products && Array.isArray(products) && products.length > 0) {
        tasks.value[2].completed = true
      }
    } catch (e) {
      // Si falla, asumimos que no está completa
    }

    // Task 4: Verificar si hay ventas/facturas
    try {
      const { data: invoices } = await api.get('invoices')
      if (invoices && Array.isArray(invoices) && invoices.length > 0) {
        tasks.value[3].completed = true
      }
    } catch (e) {
      // Si falla, asumimos que no está completa
    }

    // Task 5: Verificar si hay usuarios (más de uno, ya que el actual cuenta)
    try {
      const { data: users } = await api.get('users')
      if (users && Array.isArray(users) && users.length > 1) {
        tasks.value[4].completed = true
      }
    } catch (e) {
      // Si falla, asumimos que no está completa
    }
  } catch (error) {
    console.error('Error al verificar el estado de las tareas:', error)
  }
}

// Verificar el estado al montar el componente
onMounted(() => {
  checkTasksCompletion()
})
*/
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
  padding: 16px 20px;
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

:deep(.q-item__label--caption) {
  color: #9e9e9e;
  font-size: 0.75rem;
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

</style>
