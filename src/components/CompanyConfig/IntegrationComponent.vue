<template>
  <div class="integration-manager">
    <!-- Header -->
    <div class="integration-header">
      <h3 class="integration-title">Integraciones</h3>
      <p class="integration-subtitle">Conecta tus servicios favoritos</p>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-number">{{ connectedServices }}</div>
        <div class="stat-label">Conectados</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-number">{{ availableServices }}</div>
        <div class="stat-label">Disponibles</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-number">{{ pendingServices }}</div>
        <div class="stat-label">Pendientes</div>
      </div>
    </div>

    <!-- Integration Grid -->
    <div class="integration-grid">
      <div
        v-for="integration in integrations"
        :key="integration.id"
        class="integration-card"
        :class="{ 'connected': integration.connected }"
        @click="handleIntegrationClick(integration)"
      >
        <!-- Logo Container -->
        <div class="logo-container">
          <div class="logo-background" :class="integration.logoClass">
            <img
              :src="integration.logo"
              :alt="integration.name"
              class="logo-image"
            />
          </div>
          <div v-if="integration.connected" class="connected-badge">
            <q-icon name="check_circle" size="16px" color="white" />
          </div>
        </div>

        <!-- Service Info -->
        <div class="service-info">
          <h4 class="service-name">{{ integration.displayName }}</h4>
          <p class="service-description">{{ integration.description }}</p>
        </div>

        <!-- Action Button -->
        <q-btn
          :color="integration.connected ? 'grey-6' : 'primary'"
          :label="integration.connected ? 'Configurar' : 'Conectar'"
          :icon="integration.connected ? 'settings' : 'add'"
          size="sm"
          unelevated
          class="action-button"
          :loading="integration.loading"
          @click.stop="handleAction(integration)"
        />
      </div>
    </div>

    <!-- Arca Dialog -->
    <q-dialog v-model="arcaDialog" class="arca-dialog">
      <q-card class="arca-card">
        <q-card-section class="arca-header">
          <div class="arca-logo-container">
            <img src="images/arca.svg" alt="Arca" class="arca-logo" />
          </div>
        </q-card-section>

        <q-card-section v-if="!download" class="arca-form">
          <h3 class="arca-title">Iniciar sesión con Arca</h3>
          <div class="form-fields">
            <q-input
              v-model="cuit"
              label="Usuario (CUIT)"
              outlined
              dense
              class="form-field"
            />
            <q-input
              v-model="password"
              label="Contraseña"
              type="password"
              outlined
              dense
              class="form-field"
            />
          </div>
        </q-card-section>

        <q-card-section v-else class="arca-success">
          <div class="success-content">
            <q-icon name="check_circle" size="60px" color="positive" />
            <h3 class="success-title">¡Certificado creado!</h3>
            <p class="success-message">El certificado fue autorizado exitosamente</p>
            <div class="download-buttons">
              <q-btn
                :href="download?.certificate_url"
                target="_blank"
                label="Descargar certificado"
                color="primary"
                outline
                size="sm"
                class="download-btn"
              />
              <q-btn
                :href="download?.key_url"
                target="_blank"
                label="Descargar key"
                color="secondary"
                outline
                size="sm"
                class="download-btn"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions v-if="!download" class="arca-actions">
          <q-btn flat label="Cerrar" v-close-popup class="action-btn-secondary" />
          <q-btn 
            color="primary" 
            label="Conectar" 
            @click="generateCertificate" 
            unelevated
            class="action-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { apiArca } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'

const $q = useQuasar()

// Reactive data
const integrations = ref([
  {
    id: 1,
    name: 'mercadopago',
    displayName: 'Mercado Pago',
    description: 'Procesa pagos online',
    logo: '/images/mercado-pago.png',
    logoClass: 'logo-mercadopago',
    connected: true,
    loading: false,
    enabled: true
  },
  {
    id: 2,
    name: 'mercadolibre',
    displayName: 'Mercado Libre',
    description: 'Vende en el marketplace',
    logo: '/images/mercado-libre.png',
    logoClass: 'logo-mercadolibre',
    connected: false,
    loading: false
  },
  {
    id: 3,
    name: 'arca',
    displayName: 'ARCA',
    description: 'Facturación electrónica',
    logo: 'images/arca.svg',
    logoClass: 'logo-arca',
    connected: false,
    loading: false
  },
  {
    id: 4,
    name: 'pedidosya',
    displayName: 'PedidosYa',
    description: 'Delivery de comida',
    logo: 'images/pedidos-ya.svg',
    logoClass: 'logo-pedidosya',
    connected: false,
    loading: false
  }
])

// Dialog data
const arcaDialog = ref(false)
const cuit = ref('')
const password = ref('')
const download = ref({})

// Store
const store = authentication()
const userSession = store.userSession

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
  if (integration.name === 'arca') {
    openDialogArca()
  }
}

const openDialogArca = async () => {
  if (userSession?.company_session?.billing) {
    try {
      const { data } = await apiArca('companies', {
        params: {
          user: {
            name: userSession.name,
            email: userSession.email
          },
          document_number: userSession?.company_session?.document_number
        }
      })
      download.value = {
        certificate_url: data.certificate_url,
        key_url: data.key_url
      }
    } catch (error) {
      $q.notify({
        message: error.message,
        color: 'negative',
        icon: 'warning'
      })
    }
  }
  arcaDialog.value = true
}

const handleAction = async (integration) => {
  if (integration.name === 'arca') {
    openDialogArca()
    return
  }

  integration.loading = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))

  if (integration.connected) {
    $q.notify({
      message: `Configurando ${integration.displayName}...`,
      color: 'primary',
      icon: 'settings',
      timeout: 2000
    })
  } else {
    integration.connected = true
    $q.notify({
      message: `${integration.displayName} conectado exitosamente`,
      color: 'positive',
      icon: 'check_circle',
      timeout: 2000
    })
  }

  integration.loading = false
}

const generateCertificate = async () => {
  try {
    // Simulate certificate generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    download.value = {
      certificate_url: '#',
      key_url: '#'
    }
    
    $q.notify({
      message: 'Certificado generado exitosamente',
      color: 'positive',
      icon: 'check_circle',
      timeout: 2000
    })
  } catch (error) {
    $q.notify({
      message: 'Error al generar certificado',
      color: 'negative',
      icon: 'error',
      timeout: 2000
    })
  }
}
</script>

<style scoped>

/* Header */
.integration-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.integration-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.integration-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

/* Stats Row */
.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--q-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #e2e8f0;
}

/* Integration Grid */
.integration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.integration-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.integration-card:hover {
  border-color: var(--q-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.integration-card.connected {
  background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
  border-color: #10b981;
}

/* Logo Container */
.logo-container {
  position: relative;
  margin-bottom: 1rem;
}

.logo-background {
  width: 100%;
  height: 100px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.logo-mercadopago {
  background: linear-gradient(135deg, #009ee3 0%, #0066cc 100%);
  padding: 1rem;
}

.logo-mercadolibre {
  background: linear-gradient(135deg, #fff200 0%, #ffcc00 100%);
  padding: 1rem;
}

.logo-arca {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  padding: 1rem;
}

.logo-pedidosya {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  padding: 1rem;
}

.logo-image {
  width: 100%;
  height: 42px;
  object-fit: contain;
}

.connected-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

/* Service Info */
.service-info {
  text-align: center;
  margin-bottom: 1rem;
}

.service-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.service-description {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

/* Action Button */
.action-button {
  width: 100%;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: none;
}

/* Arca Dialog */
.arca-dialog :deep(.q-dialog__inner) {
  padding: 1rem;
}

.arca-card {
  max-width: 500px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.arca-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  padding: 2rem;
  text-align: center;
}

.arca-logo-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: inline-block;
}

.arca-logo {
  height: 40px;
  filter: brightness(0) invert(1);
}

.arca-form {
  padding: 2rem;
}

.arca-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  margin: 0 0 1.5rem 0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  border-radius: 8px;
}

.arca-success {
  padding: 2rem;
}

.success-content {
  text-align: center;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 1rem 0 0.5rem 0;
}

.success-message {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
}

.download-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.download-btn {
  border-radius: 8px;
  font-size: 0.8rem;
  text-transform: none;
}

.arca-actions {
  padding: 1rem 2rem 2rem 2rem;
  gap: 1rem;
}

.action-btn {
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: none;
  flex: 1;
}

.action-btn-secondary {
  color: #64748b;
  font-size: 0.8rem;
  text-transform: none;
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .integration-manager {
    padding: 1rem;
  }
  
  .integration-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }
  
  .integration-card {
    padding: 1rem;
  }
  
  .stats-row {
    gap: 1rem;
    padding: 0.75rem;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .stats-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat-divider {
    width: 30px;
    height: 1px;
  }
  
  .integration-grid {
    grid-template-columns: 1fr;
  }
}
</style>