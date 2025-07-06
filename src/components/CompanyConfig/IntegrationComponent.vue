<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row justify-between items-center q-mb-xl">
      <div>
        <div class="text-h6 text-weight q-mb-sm">Integraciones</div>
        <p class="text-subtitle1 text-grey-6">Conecta y gestiona tus servicios favoritos</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="stats-card">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-light text-primary">{{ connectedServices }}</div>
            <div class="text-subtitle2 text-grey-6">Servicios Conectados</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="stats-card">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-light text-positive">{{ availableServices }}</div>
            <div class="text-subtitle2 text-grey-6">Disponibles</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="stats-card">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-light text-orange">{{ pendingServices }}</div>
            <div class="text-subtitle2 text-grey-6">Pendientes</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Integration Cards Grid -->
    <div class="row q-col-gutter-lg">
      <div
        v-for="integration in integrations"
        :key="integration.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card
          flat
          bordered
          class="integration-card cursor-pointer"
          :class="{ 'connected': integration.connected }"
          @click="handleIntegrationClick(integration)"
        >
          <q-card-section class="q-pa-lg">
            <!-- Logo and Status -->
            <div class="row items-center justify-between q-mb-md">
              <div class="integration-logo">
                <img
                  :src="integration.logo"
                  :alt="integration.name"
                  :style="Intersection.style"
                  class="logo-image"
                />
              </div>
            </div>

            <!-- Service Name -->
            <h3 class="text-h6 text-weight-medium q-mb-sm" v-if="integration.name">{{ integration.name }}</h3>

            <!-- Description -->
            <p class="text-body2 text-grey-6 q-mb-lg description-text" v-if="integration.description">
              {{ integration.description }}
            </p>

            <!-- Action Button -->
            <q-btn
              :color="integration.connected ? 'grey-5' : 'primary'"
              :label="integration.connected ? 'Configurar' : 'Conectar'"
              :icon="integration.connected ? 'settings' : 'add_link'"
              unelevated
              class="full-width action-btn"
              :loading="integration.loading"
              @click.stop="handleAction(integration)"
            />
          </q-card-section>

          <!-- Hover Overlay -->
          <div class="hover-overlay">
            <q-icon name="arrow_forward" size="24px" />
          </div>
        </q-card>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="integrations.length === 0" class="text-center q-py-xl">
      <q-icon name="integration_instructions" size="64px" class="text-grey-4 q-mb-md" />
      <h4 class="text-h6 text-grey-6 q-mb-sm">No hay integraciones disponibles</h4>
      <p class="text-body2 text-grey-5">Las integraciones aparecerán aquí cuando estén disponibles.</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Intersection, useQuasar } from 'quasar'

const $q = useQuasar()

// Reactive data
const integrations = ref([
  {
    id: 1,
    name: '',
    logo: '/images/mercado-pago.png',
    connected: true,
    loading: false,
    style: 'height: 100px;'
  },
  {
    id: 4,
    name: '',
    logo: '/images/mercado-libre.png',
    connected: false,
    loading: false
  },
  {
    id: 2,
    name: '',
    logo: 'images/arca.svg',
    connected: false,
    loading: false
  },
  {
    id: 3,
    name: '',
    logo: 'images/pedidos-ya.svg',
    connected: false,
    loading: false
  }
  // {
  //   id: 5,
  //   name: 'Google Analytics',
  //   description: 'Analiza el comportamiento de usuarios y optimiza el rendimiento de tu negocio digital.',
  //   logo: '/placeholder.svg?height=48&width=48',
  //   connected: true,
  //   loading: false,
  //   category: 'analytics'
  // },
  // {
  //   id: 6,
  //   name: 'Shopify',
  //   description: 'Sincroniza tu tienda online con inventario, pedidos y datos de clientes en tiempo real.',
  //   logo: '/placeholder.svg?height=48&width=48',
  //   connected: false,
  //   loading: false,
  //   category: 'ecommerce'
  // }
])

// Computed properties
const connectedServices = computed(() =>
  integrations.value.filter(i => i.connected).length
)

const availableServices = computed(() =>
  integrations.value.filter(i => !i.connected).length
)

const pendingServices = computed(() =>
  integrations.value.filter(i => i.loading).length
)

// Methods
const handleIntegrationClick = (integration) => {
  console.log('Integration clicked:', integration.name)
}

const handleAction = async (integration) => {
  integration.loading = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))

  if (integration.connected) {
    $q.notify({
      message: `Configurando ${integration.name}...`,
      color: 'primary',
      icon: 'settings'
    })
  } else {
    integration.connected = true
    $q.notify({
      message: `${integration.name} conectado exitosamente`,
      color: 'positive',
      icon: 'check_circle'
    })
  }

  integration.loading = false
}
</script>

<style scoped>
/* Stats Cards */
.stats-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Integration Cards */
.integration-card {
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.integration-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(25, 118, 210, 0.2);
}

.integration-card.connected {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%);
  border-color: rgba(76, 175, 80, 0.2);
}

/* Logo Styling */
.integration-logo {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logo-image {
  width: 50%;
  height: 32px;
  border-radius: 8px;
}

.integration-card:hover .integration-logo {
  transform: scale(1.05);
  background: rgba(25, 118, 210, 0.1);
}

/* Description Text */
.description-text {
  line-height: 1.5;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Action Button */
.action-btn {
  border-radius: 12px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

/* Hover Overlay */
.hover-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(25, 118, 210, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  color: #1976d2;
}

.integration-card:hover .hover-overlay {
  opacity: 1;
  transform: scale(1);
}

/* Dark Mode Adjustments */
.body--dark .stats-card,
.body--dark .integration-card {
  background: rgba(30, 30, 30, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .integration-card:hover {
  border-color: rgba(144, 202, 249, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.body--dark .integration-card.connected {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(30, 30, 30, 0.9) 100%);
  border-color: rgba(76, 175, 80, 0.3);
}

.body--dark .integration-logo {
  background: rgba(255, 255, 255, 0.05);
}

.body--dark .integration-card:hover .integration-logo {
  background: rgba(144, 202, 249, 0.1);
}

.body--dark .hover-overlay {
  background: rgba(144, 202, 249, 0.1);
  color: #90caf9;
}

/* Responsive Design */
@media (max-width: 600px) {
  .integration-card {
    margin-bottom: 16px;
  }

  .stats-card {
    margin-bottom: 12px;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.integration-card {
  animation: fadeInUp 0.6s ease forwards;
}

.integration-card:nth-child(1) { animation-delay: 0.1s; }
.integration-card:nth-child(2) { animation-delay: 0.2s; }
.integration-card:nth-child(3) { animation-delay: 0.3s; }
.integration-card:nth-child(4) { animation-delay: 0.4s; }
.integration-card:nth-child(5) { animation-delay: 0.5s; }
.integration-card:nth-child(6) { animation-delay: 0.6s; }
</style>
