<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="welcome-container q-pa-md">
      <!-- Header Section -->
      <div class="text-center q-mb-xl">
        <q-icon name="rocket_launch" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h3 text-weight-bold q-my-none text-grey-9">Bienvenido a OrderWise</div>
        <div class="text-h6 text-grey-6 q-mt-sm">
          Comienza tu viaje completando estas misiones esenciales para configurar tu negocio.
        </div>
      </div>

      <!-- Tasks Accordion -->
      <q-list bordered class="rounded-borders bg-white shadow-1">
        <q-expansion-item
          v-for="(task, index) in tasks"
          :key="index"
          group="tasks"
          :icon="task.icon"
          :label="task.title"
          :caption="task.caption"
          header-class="text-weight-medium text-grey-9"
          expand-icon-class="text-primary"
        >
          <q-card>
            <q-card-section class="q-pt-none">
              <div class="text-body1 text-grey-7 q-mb-md">
                {{ task.description }}
              </div>
              <div class="text-right">
                <q-btn
                  unelevated
                  color="primary"
                  :label="task.buttonLabel"
                  :to="{ name: task.routeName }"
                  icon-right="arrow_forward"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>

      <!-- Footer Help -->
      <div class="text-center q-mt-xl text-grey-6">
        <div>¿Necesitas ayuda? Revisa nuestros <a href="#" class="text-primary" style="text-decoration: none" @click.prevent="$router.push({ name: 'Tutorial' })">tutoriales</a> o contacta soporte.</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const tasks = ref([
  {
    title: 'Completa los Datos de tu Empresa',
    caption: 'Configuración inicial',
    icon: 'business',
    description: 'Para comenzar, necesitamos que completes la información básica de tu empresa. Esto asegurará que tus facturas y documentos salgan con los datos correctos.',
    buttonLabel: 'Ir a Configuración',
    routeName: 'CompanyConfig'
  },
  {
    title: 'Crea tu primera Sucursal',
    caption: 'Expande tu negocio',
    icon: 'store',
    description: 'Registra tu primera sucursal u oficina. Aquí es donde gestionarás tu inventario y realizarás tus ventas.',
    buttonLabel: 'Gestionar Sucursales',
    routeName: 'BranchOffice'
  },
  {
    title: 'Registra tu primer Producto',
    caption: 'Llena tu inventario',
    icon: 'inventory_2',
    description: 'Agrega productos a tu catálogo. Puedes incluir detalles como precio, costo, y control de stock.',
    buttonLabel: 'Ir a Productos',
    routeName: 'Product'
  },
  {
    title: 'Realiza tu primera Venta',
    caption: 'Empieza a facturar',
    icon: 'point_of_sale',
    description: '¡Es hora de vender! Utiliza el punto de venta para registrar tu primera transacción y ver cómo se mueve tu inventario.',
    buttonLabel: 'Ir al Punto de Venta',
    routeName: 'PointOfSale'
  },
  {
    title: 'Invita a tu Equipo',
    caption: 'Colaboración',
    icon: 'group_add',
    description: 'OrderWise es mejor en equipo. Invita a tus colaboradores y asigna roles y permisos específicos.',
    buttonLabel: 'Gestionar Usuarios',
    routeName: 'User'
  }
])
</script>

<style scoped>
.welcome-container {
  width: 100%;
  max-width: 800px;
}

.q-expansion-item {
  border-bottom: 1px solid #f0f0f0;
}

.q-expansion-item:last-child {
  border-bottom: none;
}
</style>
