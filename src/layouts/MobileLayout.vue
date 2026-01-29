<template>
  <q-layout view="hHh Lpr lff" class="mobile-layout">
    <!-- Header con información del usuario y empresa -->
    <q-header elevated class="mobile-header">
      <q-toolbar class="mobile-toolbar">
        <!-- Avatar del usuario -->
        <q-btn flat dense round class="avatar-btn" @click="showProfileMenu = true">
          <q-avatar size="40px" class="user-avatar">
            <img v-if="userSession?.avatar" :src="userSession.avatar" alt="Profile" />
            <q-icon v-else name="person" size="24px" />
          </q-avatar>
        </q-btn>

        <!-- Información de la empresa -->
        <div class="company-info" @click="showCompanySwitcher = true">
          <div class="company-name">
            {{ userSession?.company_session?.name || 'Sin empresa' }}
            <q-icon name="expand_more" size="20px" class="q-ml-xs" />
          </div>
          <div class="company-role">{{ userRole }}</div>
        </div>

        <q-space />

        <!-- Botones de acción -->
        <q-btn flat dense round icon="help_outline" @click="showHelp">
          <q-tooltip>Ayuda</q-tooltip>
        </q-btn>

        <q-btn flat dense round icon="notifications">
          <q-badge v-if="numberOfNotifications.length" color="red" floating>
            {{ numberOfNotifications.length }}
          </q-badge>
          <q-tooltip>Notificaciones</q-tooltip>
          <q-popup-proxy>
            <notification-component
              style-css="min-width: 90vw;"
              @on-load="getDataNotification"
            />
          </q-popup-proxy>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Contenido principal -->
    <q-page-container>
      <q-page class="mobile-page">
        <!-- Sección de accesos rápidos -->
        <div class="section-header">
          <h6 class="section-title">Accesos rápidos</h6>
        </div>

        <div class="quick-access-grid">
          <!-- Registrar Venta -->
          <q-card
            class="quick-access-card primary-card"
            @click="navigateTo('Billing', 'Facturación')"
          >
            <q-card-section class="card-content">
              <q-icon name="trending_up" size="32px" class="card-icon" />
              <div class="card-label">Registrar</div>
              <div class="card-label">Venta</div>
            </q-card-section>
          </q-card>

          <!-- Registrar Gasto -->
          <q-card
            class="quick-access-card light-card"
            @click="navigateTo('Purchase', 'Compras')"
          >
            <q-card-section class="card-content">
              <q-icon name="trending_down" size="32px" class="card-icon" />
              <div class="card-label">Registrar</div>
              <div class="card-label">Gasto</div>
            </q-card-section>
          </q-card>

          <!-- Ver Inventario -->
          <q-card
            class="quick-access-card light-card"
            @click="navigateTo('Product', 'Productos')"
          >
            <q-card-section class="card-content">
              <q-icon name="inventory_2" size="32px" class="card-icon" />
              <div class="card-label">Ver</div>
              <div class="card-label">Inventario</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Banner de suscripción -->
        <q-card class="subscription-banner" v-if="!isDemo">
          <q-card-section class="banner-content">
            <div class="banner-text">
              <div class="banner-title">¡Agiliza tus ventas!</div>
              <div class="banner-subtitle">Con el Plan Básico o Pro, genera tickets de venta.</div>
              <q-btn
                unelevated
                rounded
                label="Explorar planes"
                class="banner-btn"
                @click="openSubscriptionDialog"
              />
            </div>
            <div class="banner-image">
              <q-icon name="phone_iphone" size="80px" color="white" />
            </div>
          </q-card-section>
        </q-card>

        <!-- Sección de estadísticas -->
        <div class="section-header">
          <h6 class="section-title">
            <q-icon name="trending_up" size="24px" class="q-mr-xs" />
            Estadísticas
          </h6>
          <q-chip dense square color="primary" text-color="white" icon="workspace_premium">
            Función premium
          </q-chip>
        </div>

        <div class="stats-subtitle">Datos que pueden cambiar tu negocio a un clic.</div>

        <div class="stats-grid">
          <!-- Producto estrella -->
          <q-card class="stat-card">
            <q-card-section class="stat-content">
              <div class="stat-title">Aquí verás</div>
              <div class="stat-title">tu producto</div>
              <div class="stat-title">estrella</div>
              <div class="stat-placeholder">
                <q-icon name="star" size="48px" color="orange" />
              </div>
            </q-card-section>
          </q-card>

          <!-- Ganancias -->
          <q-card class="stat-card">
            <q-card-section class="stat-content">
              <div class="stat-title">Aquí verás tus</div>
              <div class="stat-title">ganancias</div>
              <div class="stat-placeholder">
                <div class="stat-amount">$0.00</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <!-- Bottom Navigation -->
    <q-footer class="mobile-footer">
      <q-tabs
        v-model="activeTab"
        class="mobile-tabs"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-tab
          name="home"
          icon="home"
          label="Home"
          @click="navigateTo('Home', 'Inicio')"
        />
        <q-tab
          name="balance"
          icon="receipt_long"
          label="Balance"
          @click="navigateTo('PaymentReport', 'Reportes')"
        />
        <q-tab
          name="deudas"
          icon="percent"
          label="Deudas"
          @click="navigateTo('ClientAccountStatement', 'Cuentas por cobrar')"
        />
        <q-tab
          name="inventory"
          icon="inventory_2"
          label="Inventario"
          @click="navigateTo('Product', 'Productos')"
        />
      </q-tabs>
    </q-footer>

    <!-- Diálogo de cambio de empresa -->
    <q-dialog v-model="showCompanySwitcher" position="bottom">
      <q-card class="company-switcher-card">
        <q-card-section class="switcher-header">
          <div class="switcher-title">Cuentas</div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="switcher-content">
          <change-company :companies="companies" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo de perfil -->
    <q-dialog v-model="showProfileMenu" position="bottom">
      <q-card class="profile-menu-card">
        <q-card-section class="profile-header">
          <q-avatar size="60px" class="profile-avatar">
            <img v-if="userSession?.avatar" :src="userSession.avatar" alt="Profile" />
            <q-icon v-else name="person" size="36px" />
          </q-avatar>
          <div class="profile-info">
            <div class="profile-name">{{ userSession?.name }}</div>
            <div class="profile-email">{{ userSession?.email }}</div>
          </div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-list>
          <q-item clickable v-ripple @click="navigateTo('Profile', 'Perfil')">
            <q-item-section avatar>
              <q-icon name="account_circle" color="primary" />
            </q-item-section>
            <q-item-section>Mi Perfil</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="toggleTheme">
            <q-item-section avatar>
              <q-icon :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'" color="primary" />
            </q-item-section>
            <q-item-section>{{ $q.dark.isActive ? 'Modo Claro' : 'Modo Oscuro' }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="logoutUser" class="logout-item">
            <q-item-section avatar>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section>Cerrar Sesión</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>

    <!-- Subscription Plans Dialog -->
    <subscription-plans-dialog
      v-model="showSubscriptionDialog"
      @subscription-updated="onSubscriptionUpdated"
    />
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'
import { mapState, mapActions } from 'pinia'
import { notify } from 'src/const/mixins'
import SubscriptionPlansDialog from 'src/components/SubscriptionPlansDialog.vue'
import NotificationComponent from 'src/components/NotificationComponent.vue'
import ChangeCompany from 'src/components/Company/ChangeCompany.vue'

export default {
  name: 'MobileLayout',
  components: {
    SubscriptionPlansDialog,
    NotificationComponent,
    ChangeCompany
  },
  setup () {
    const router = useRouter()
    const store = authentication()

    // ========================================
    // ESTADO REACTIVO
    // ========================================

    /** @type {Ref<string>} Tab activo en la navegación inferior */
    const activeTab = ref('home')

    /** @type {Ref<boolean>} Controla la visibilidad del diálogo de cambio de empresa */
    const showCompanySwitcher = ref(false)

    /** @type {Ref<boolean>} Controla la visibilidad del menú de perfil */
    const showProfileMenu = ref(false)

    /** @type {Ref<boolean>} Controla la visibilidad del diálogo de suscripciones */
    const showSubscriptionDialog = ref(false)

    /** @type {Ref<Array>} Lista de notificaciones no leídas */
    const numberOfNotifications = ref([])

    /** @type {Ref<Array>} Lista de empresas del usuario */
    const companies = ref([])

    return {
      router,
      store,
      activeTab,
      showCompanySwitcher,
      showProfileMenu,
      showSubscriptionDialog,
      numberOfNotifications,
      companies
    }
  },
  computed: {
    ...mapState(authentication, [
      'userSession',
      'branchOffice',
      'isDemo',
      'access_token',
      'refresh_token',
      'expires_In',
      'token_type',
      'mustSelectPlan'
    ]),

    /**
     * Obtiene el rol del usuario en formato legible
     * @returns {string} Nombre del rol del usuario
     */
    userRole () {
      if (this.userSession?.is_root) return 'Propietario'
      if (this.userSession?.is_super_admin) return 'Super Admin'
      const role = this.userSession?.roles?.[0]
      return role?.name || 'Usuario'
    }
  },
  mounted () {
    this.getDataNotification()
    this.loadUserCompanies()
  },
  methods: {
    ...mapActions(authentication, ['logout', 'setCompanySession', 'setBranchOffice']),

    /**
     * Navega a una ruta específica
     * @param {string} routeName - Nombre de la ruta
     * @param {string} title - Título de la página
     */
    navigateTo (routeName, title) {
      this.router.push({ name: routeName })
      this.activeTab = routeName.toLowerCase()
    },

    /**
     * Carga las notificaciones no leídas del usuario
     * Este método es llamado por NotificationComponent
     */
    async getDataNotification () {
      try {
        const { data } = await api.get('notifications', {
          params: { unread: true }
        })
        this.numberOfNotifications = data
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    },

    /**
     * Carga todas las empresas asociadas al usuario
     */
    async loadUserCompanies () {
      try {
        const { data } = await api.get('session/companies')
        this.companies = data
      } catch (error) {
        console.error('Error loading user companies:', error)
        this.companies = []
      }
    },

    /**
     * Muestra el diálogo de ayuda
     */
    showHelp () {
      notify('Ayuda próximamente', 'info', 'info')
    },

    /**
     * Alterna entre modo claro y oscuro
     */
    toggleTheme () {
      this.$q.dark.toggle()
      this.showProfileMenu = false
    },

    /**
     * Abre el diálogo de planes de suscripción
     */
    openSubscriptionDialog () {
      this.showSubscriptionDialog = true
    },

    /**
     * Maneja la actualización de la suscripción
     * @param {Object} subscription - Datos de la suscripción actualizada
     */
    onSubscriptionUpdated (subscription) {
      if (subscription) {
        notify('Suscripción actualizada exitosamente', 'positive', 'check_circle')
      }
    },

    /**
     * Cierra la sesión del usuario
     */
    logoutUser () {
      this.showProfileMenu = false
      this.router.push({ name: 'Login' })
      this.logout()
    }
  },
  watch: {
    mustSelectPlan: {
      handler (val) {
        if (val) {
          this.showSubscriptionDialog = true
        } else {
          this.showSubscriptionDialog = false
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
/* ========================================
   LAYOUT PRINCIPAL
   ======================================== */
.mobile-layout {
  background: #f5f5f5;
}

.body--dark .mobile-layout {
  background: #1a1a1a;
}

/* ========================================
   HEADER
   ======================================== */
.mobile-header {
  background: linear-gradient(135deg, #FDB913 0%, #F59E0B 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-toolbar {
  padding: 8px 16px;
  min-height: 64px;
}

.avatar-btn {
  margin-right: 12px;
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.company-info {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
}

.company-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

/* ========================================
   CONTENIDO PRINCIPAL
   ======================================== */
.mobile-page {
  padding: 16px;
  padding-bottom: 80px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
  display: flex;
  align-items: center;
}

.body--dark .section-title {
  color: #ffffff;
}

/* ========================================
   ACCESOS RÁPIDOS
   ======================================== */
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.quick-access-card {
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quick-access-card:active {
  transform: scale(0.95);
}

.primary-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
}

.light-card {
  background: white;
  color: #1a1a1a;
}

.body--dark .light-card {
  background: #2d2d2d;
  color: #ffffff;
}

.card-content {
  padding: 20px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.card-icon {
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
}

/* ========================================
   BANNER DE SUSCRIPCIÓN
   ======================================== */
.subscription-banner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  color: white;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.banner-subtitle {
  font-size: 13px;
  margin-bottom: 16px;
  opacity: 0.95;
}

.banner-btn {
  background: white;
  color: #059669;
  font-weight: 600;
  padding: 8px 20px;
  text-transform: none;
}

.banner-image {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

/* ========================================
   ESTADÍSTICAS
   ======================================== */
.stats-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.body--dark .stats-subtitle {
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.body--dark .stat-card {
  background: #2d2d2d;
}

.stat-content {
  padding: 16px;
  text-align: center;
}

.stat-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.body--dark .stat-title {
  color: #ffffff;
}

.stat-placeholder {
  margin-top: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.body--dark .stat-placeholder {
  background: #1a1a1a;
}

.stat-amount {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
}

/* ========================================
   NAVEGACIÓN INFERIOR
   ======================================== */
.mobile-footer {
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.body--dark .mobile-footer {
  background: #2d2d2d;
}

.mobile-tabs {
  height: 64px;
}

.mobile-tabs :deep(.q-tab) {
  min-height: 64px;
  padding: 8px 12px;
}

.mobile-tabs :deep(.q-tab__icon) {
  font-size: 24px;
  margin-bottom: 4px;
}

.mobile-tabs :deep(.q-tab__label) {
  font-size: 11px;
  font-weight: 500;
}

/* ========================================
   DIÁLOGO DE CAMBIO DE EMPRESA
   ======================================== */
.company-switcher-card {
  width: 100%;
  max-width: 100vw;
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  overflow: hidden;
}

.switcher-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.switcher-title {
  font-size: 20px;
  font-weight: 700;
}

.switcher-content {
  padding: 0;
  max-height: 60vh;
  overflow-y: auto;
}

.company-item {
  padding: 16px 20px;
  transition: background 0.2s ease;
}

.company-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.body--dark .company-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.active-company {
  background: #FEF3C7;
}

.body--dark .active-company {
  background: rgba(251, 191, 36, 0.2);
}

.company-item-name {
  font-size: 15px;
  font-weight: 600;
}

.add-business-item {
  padding: 16px 20px;
}

.add-business-label {
  font-size: 15px;
  font-weight: 600;
  color: #666;
}

.body--dark .add-business-label {
  color: #999;
}

/* ========================================
   DIÁLOGO DE PERFIL
   ======================================== */
.profile-menu-card {
  width: 100%;
  max-width: 100vw;
  border-radius: 20px 20px 0 0;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 20px;
  background: linear-gradient(135deg, #FDB913 0%, #F59E0B 100%);
  color: white;
}

.profile-avatar {
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.profile-email {
  font-size: 13px;
  opacity: 0.9;
}

.logout-item {
  color: #ef4444;
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 360px) {
  .quick-access-grid {
    gap: 8px;
  }

  .card-content {
    padding: 16px 12px;
  }

  .card-label {
    font-size: 13px;
  }
}
</style>
