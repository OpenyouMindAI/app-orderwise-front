<template>
  <q-layout view="hHh Lpr lff" class="modern-layout">
    <!-- Theme Selector -->
    <FloatingThemeSelector />

    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <q-header elevated class="modern-header">
      <q-toolbar class="modern-toolbar">
        <!-- Left: Menu + Logo -->
        <div class="navbar-left">
          <q-btn
            flat
            dense
            round
            class="menu-btn"
            icon="menu"
            aria-label="Menu"
            @click="leftDrawerOpen = !leftDrawerOpen"
          />

          <!-- Search Button (New Location) -->
          <q-btn
            flat
            dense
            round
            class="menu-btn q-ml-sm"
            icon="search"
            v-if="$q.screen.gt.md"
            @click="toggleSearch"
          >
            <q-tooltip>Buscar en el menú ({{ $q.platform.is.mac ? '⌘K' : 'Ctrl+K' }})</q-tooltip>
          </q-btn>

          <q-separator dark vertical inset class="q-mx-sm" />

          <div v-if="!$q.screen.lt.sm" class="logo-container-with-badge">
            <q-img
              :src="userSession?.company_session?.url || logo.white"
              width="120px"
              style="max-height: 32px"
              alt="logo"
              fit="contain"
            >
              <q-tooltip :offset="[10, 10]" class="text-body2">
                {{ userSession?.company_session?.name }}
              </q-tooltip>
            </q-img>

            <!-- Demo Badge flotante (solo en modo demo) -->
            <transition
              appear
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
            >
              <div v-if="store.isDemo" class="demo-badge-floating">
                <span>Demo</span>
                <div class="demo-badge-dot"></div>
              </div>
            </transition>
          </div>
        </div>

        <q-space />

        <!-- Branch Office Indicator -->
        <div v-if="branchOffice && branchOffices.lenght > 1" class="branch-indicator">
          <q-chip
            dense
            square
            class="branch-chip"
            icon="store"
            color="primary"
            text-color="white"
          >
            {{ branchOffice.name }}
          </q-chip>

          <!-- Add Branch Button -->
          <q-btn
            v-if="canAddMoreBranches"
            flat
            dense
            round
            size="sm"
            icon="add"
            color="primary"
            class="q-ml-xs add-branch-btn"
            @click="goToAddBranch"
          >
            <q-tooltip>Agregar sucursal ({{ currentBranchCount }}/{{ maxBranches }})</q-tooltip>
          </q-btn>
        </div>

        <q-space />

        <!-- Right: Actions -->
        <div class="navbar-right">
          <!-- Botón Crear Mi Empresa (solo en modo demo) -->
          <transition
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <q-btn
              v-if="store.isDemo"
              outline
              dense
              class="create-btn-v0"
              @click="showCreateCompanyDialog = true"
            >
              <q-icon name="rocket_launch" size="16px" class="q-mr-xs rocket-icon" />
              <span>Mi Empresa</span>

              <q-tooltip class="bg-grey-9">
                Crea tu empresa y comienza gratis
              </q-tooltip>
            </q-btn>
          </transition>

          <!-- Botón de Tour -->
          <q-btn
            v-if="currentPageHasTour"
            flat
            dense
            icon="help_outline"
            round
            @click="activateCurrentPageTour"
            class="tour-btn-navbar"
          >
            <q-tooltip>Ver tutorial de esta página</q-tooltip>
          </q-btn>

          <!-- Botón de segunda pantalla (solo si hay 2 pantallas) -->
          <q-btn
            flat
            dense
            icon="cast_connected"
            round
            @click="screen"
            v-if="hasMultipleScreens && $q.platform.is.nativeMobile"
          >
            <q-tooltip>Segunda pantalla</q-tooltip>
          </q-btn>

          <!-- Botón de escaneo QR -->
          <q-btn
            flat
            dense
            icon="qr_code_scanner"
            round
            v-if="$q.platform.is.nativeMobile"
            @click="openQrScanner"
          >
            <q-tooltip>Escanear QR</q-tooltip>
          </q-btn>

          <!-- Botón Chat con IA -->
          <q-btn
            flat
            dense
            icon="smart_toy"
            round
            color="primary"
            @click="changeRoute('AiChat', 'Chat con IA')"
            v-if="userSession?.is_root"
            class="ai-chat-btn"
          >
            <q-tooltip>Chat con IA - Asistente Virtual</q-tooltip>
          </q-btn>

          <!-- Herramientas -->
          <q-btn flat dense icon="apps" round>
            <q-tooltip class="text-body2">
              Herramientas
            </q-tooltip>
            <q-popup-proxy class="tools-popup">
              <q-card flat class="tools-card">
                <!-- Header -->
                <div class="tools-header">
                  <q-icon name="apps" size="20px" />
                  <span class="tools-title">Herramientas</span>
                </div>

                <!-- Tools Grid -->
                <div class="tools-grid">
                  <!-- Cambio de empresa -->
                  <div
                    class="tool-item"
                    :class="{ 'tool-active': $route.name === 'ChangeCompany' }"
                    @click="changeRoute('ChangeCompany', 'Cambio de empresa')"
                  >
                    <q-icon name="sync_alt" size="24px" />
                    <span class="tool-label">Empresa</span>
                  </div>

                  <!-- Sucursal -->
                  <div class="tool-item" v-if="branchOffices.length > 1">
                    <q-icon name="store" size="24px" />
                    <span class="tool-label">Sucursal</span>
                    <q-menu anchor="bottom middle" self="top middle">
                      <q-list dense class="branch-menu">
                        <q-item
                          v-for="bo in branchOffices"
                          :key="bo.id"
                          clickable
                          v-ripple
                          :active="bo.id === branchOffice?.id"
                          @click="changeBranchOffice(bo)"
                        >
                          <q-item-section avatar>
                            <q-icon name="store" size="18px" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="text-caption">{{ bo.name }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </div>

                  <!-- Tema -->
                  <div class="tool-item" @click="setTheme">
                    <q-icon :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'" size="24px" />
                    <span class="tool-label">Tema</span>
                  </div>

                  <div class="tool-item" @click="copyCatalog">
                    <q-icon name="share" size="24px" />
                    <span class="tool-label">Compartir</span>
                  </div>

                  <div class="tool-item" @click="update">
                    <q-icon name="refresh" size="24px" />
                    <span class="tool-label">Actualizar</span>
                  </div>
                  <div
                    class="tool-item"
                    :class="{ 'tool-active': $route.name === 'Tutorial' }"
                    @click="changeRoute('Tutorial', 'Tutoriales')"
                  >
                    <q-icon name="play_circle" size="24px" />
                    <span class="tool-label">Tutoriales</span>
                  </div>
                  <a
                    href="https://pub-1ee8b00ceed2443c917a8188cf6ed6a4.r2.dev/apk/printer_ui_win_0.19.zip"
                    target="_blank"
                    class="tool-item tool-link"
                  >
                    <q-icon name="print" size="24px" />
                    <span class="tool-label">Impresora</span>
                  </a>
                  <a
                    href="https://pub-1ee8b00ceed2443c917a8188cf6ed6a4.r2.dev/apk/orderwise.apk"
                    target="_blank"
                    class="tool-item tool-link"
                  >
                    <q-icon name="android" size="24px" />
                    <span class="tool-label">App</span>
                  </a>
                </div>
                <div class="tools-section">
                  <div class="integrations-grid">
                    <div class="integration-item" @click="openDialogArca">
                      <img src="images/circle-arca.png" alt="ARCA" class="integration-logo" />
                    </div>
                  </div>
                </div>
              </q-card>
            </q-popup-proxy>
          </q-btn>

          <!-- Notificaciones -->
          <q-btn dense flat round icon="notifications" color="white">
            <q-tooltip>
              Notificaciones {{ numberOfNotifications.length }}
            </q-tooltip>
            <q-badge v-if="numberOfNotifications.length" color="teal" floating>
              {{ numberOfNotifications.length }}
            </q-badge>
            <q-popup-proxy>
              <notification-component
                style-css="min-width: 25vw;"
                @on-load="getDataNotification"
              />
            </q-popup-proxy>
          </q-btn>

          <!-- Profile -->
          <q-btn
            v-if="userSession"
            flat
            dense
            round
            class="profile-btn"
          >
            <q-avatar size="36px" class="profile-avatar">
              <img v-if="userSession.avatar" :src="userSession.avatar" alt="Profile" />
              <q-icon v-else name="person" size="24px" />
            </q-avatar>
            <q-menu class="profile-menu" transition-show="jump-down" transition-hide="jump-up">
              <q-card class="profile-card" flat bordered>
                <!-- Profile Header -->
                <div class="profile-header-modern">
                  <div class="profile-header-content">
                    <q-avatar size="48px" class="profile-avatar-modern">
                      <img v-if="userSession.avatar" :src="userSession.avatar" alt="Profile" />
                      <q-icon v-else name="person" size="28px" />
                    </q-avatar>
                    <div class="profile-info">
                      <div class="profile-name">{{ ucwords(`${userSession.name}`) }}</div>
                      <div class="profile-email">{{ userSession.email }}</div>
                    </div>
                  </div>
                </div>

                <!-- Plan Info / Demo Action -->
                <div>
                  <q-item
                    v-if="store.isDemo"
                    clickable
                    v-ripple
                    class="demo-action-item"
                    @click="showCreateCompanyDialog = true"
                    v-close-popup
                  >
                    <q-item-section avatar class="min-width-auto">
                      <div class="demo-icon-wrapper">
                        <q-icon name="workspace_premium" color="amber" size="22px" />
                      </div>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-body2 text-weight-bold">Demo</q-item-label>
                      <q-item-label caption class="text-caption demo-caption">Crea tu empresa</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="rocket-wrapper">
                        <q-icon name="rocket_launch" size="20px" class="rocket-icon" color="primary" />
                      </div>
                    </q-item-section>
                  </q-item>
                  <div v-else class="plan-compact">
                    <q-icon name="workspace_premium" color="primary" size="16px" />
                    <span class="text-caption q-ml-xs"><strong>Plan: {{ subscriptionPlan }}</strong></span>
                  </div>
                </div>

                <!-- Profile Actions -->
                <div>
                  <q-list dense class="q-py-none q-my-none">
                    <q-item
                      v-ripple
                      clickable
                      dense
                      class="profile-action-item-compact"
                      @click="changeRoute('Profile', 'Perfil')"
                      v-close-popup
                    >
                      <q-item-section avatar class="min-width-auto">
                        <div class="action-icon-wrapper">
                          <q-icon name="account_circle" color="primary" size="20px" />
                        </div>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-body2 text-weight-medium">Mi Perfil</q-item-label>
                        <q-item-label caption class="text-caption action-caption">Ver y editar información</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item
                      v-ripple
                      clickable
                      dense
                      class="profile-action-item-compact"
                      @click="setTheme"
                    >
                      <q-item-section avatar class="min-width-auto">
                        <div class="action-icon-wrapper">
                          <q-icon :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'" color="primary" size="20px" />
                        </div>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-body2 text-weight-medium">{{ $q.dark.isActive ? 'Modo Claro' : 'Modo Oscuro' }}</q-item-label>
                        <q-item-label caption class="text-caption action-caption">Cambiar tema</q-item-label>
                      </q-item-section>
                    </q-item>

                    <!-- Subscription Plans (Solo para super_admin) -->
                    <q-item
                      v-if="userSession.is_super_admin"
                      v-ripple
                      clickable
                      dense
                      class="profile-action-item-compact"
                      @click="openSubscriptionDialog"
                      v-close-popup
                    >
                      <q-item-section avatar class="min-width-auto">
                        <div class="action-icon-wrapper">
                          <q-icon name="workspace_premium" color="primary" size="20px" />
                        </div>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-body2 text-weight-medium">Suscripción</q-item-label>
                        <q-item-label caption class="text-caption action-caption">Gestionar plan</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="chevron_right" size="16px" color="grey-6" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Logout Button -->
                <div class="logout-container-modern">
                  <q-btn
                    unelevated
                    color="negative"
                    icon-right="logout"
                    label="Cerrar Sesión"
                    class="full-width logout-btn-modern"
                    @click="logoutAt"
                    v-close-popup
                    no-caps
                  />
                </div>
              </q-card>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      show-if-above
      class="q-pa-none relative modern-drawer"
    >
      <div class="column fit">
        <div v-if="$q.screen.lt.md" class="drawer-mobile-header">
          <div class="drawer-logo-wrapper">
            <img
              :src="userSession?.company_session?.url || logo.white"
              class="drawer-logo-img"
              alt="logo"
            />
            <q-tooltip :offset="[10, 10]">
              {{ userSession?.company_session?.name }}
            </q-tooltip>
          </div>
          <div class="drawer-header-actions">
            <q-btn
              flat
              round
              dense
              icon="search"
              class="drawer-action-btn"
              @click="toggleSearch"
            >
              <q-tooltip>Buscar en el menú ({{ $q.platform.is.mac ? '⌘K' : 'Ctrl+K' }})</q-tooltip>
            </q-btn>
          </div>
        </div>
        <transition name="slide-fade">
          <div class="q-px-md q-pt-md q-pb-sm search-container" v-if="showSearchInput">
            <q-input
              ref="searchInput"
              v-model="menuSearch"
              dense
              outlined
              placeholder="Buscar"
              class="menu-search-input"
              bg-color="white"
              autofocus
            >
              <template v-slot:append>
                <q-icon
                  name="close"
                  class="cursor-pointer"
                  @click="showSearchInput = false; menuSearch = ''"
                />
              </template>
            </q-input>
          </div>
        </transition>

        <q-scroll-area class="col">
          <q-expansion-item
            v-for="category_module in filteredDataMenu"
            expand-separator
            :key="category_module.id"
            :icon="category_module.icon"
            default-opened
            :label="category_module.name"
          >
            <div v-for="list in category_module.modules" :key="list.id">
              <q-item
                v-if="
                  validateRole(list.roles) &&
                  list.name != 'home' &&
                  list.visible !== false
                "
                v-ripple
                clickable
                active-class="my-menu-link"
                :active="list.link === $route.name"
                @click="changeRoute(list.link, list.title)"
              >
                <q-item-section v-if="list.icon" avatar class="q-ml-sm">
                  <q-icon :name="list.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ list.title }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </q-expansion-item>
        </q-scroll-area>
        <div class="modern-drawer-footer">
          <!-- Powered by -->
          <div class="drawer-footer-brand">
            <span class="footer-brand-text">Powered by</span>
            <q-img
              src="https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QBits/white.png"
              width="60px"
              alt="Qbits"
            />
          </div>
        </div>
      </div>
    </q-drawer>
    <q-dialog v-model="arcaDialog">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="modern-dialog-header flex justify-center items-center">
          <q-img src="images/arca.svg" style="width: 400px; max-width: 60vw;" alt="Arca" />
        </q-card-section>
        <q-card-section class="text-center q-gutter-y-md" v-if="!download">
          <div class="text-h6">Iniciar sesión con Arca</div>
          <q-input autofocus filled v-model="cuit" label="Usuario (Cuit)"  />
          <q-input filled v-model="password" label="Contraseña" type="password" />
        </q-card-section>

        <q-card-section v-else>
          <div class="column full-width q-gutter-y-lg justify-center items-center text-center">
            <q-icon
              name="check_circle"
              size="100px"
              color="positive"
            />
            <span class="text-h6">
              El certificado fue creado y
              autorizado exitosamente
            </span>
            <div class="text-subtitle1 text-center q-gutter-sm">
              <q-btn
                :href="download?.certificate_url"
                target="_blank"
                label="Descargar certificado"
                outline
                color="blue-10"
                />
                <q-btn
                  :href="download?.key_url"
                  target="_blank"
                  label="Descargar key"
                  outline
                  color="cyan-10"
                />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary" v-if="!download">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn flat label="Aceptar" @click="generateCertificate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Floating Onboarding Button -->
    <q-page-sticky
      v-if="showOnboardingFab && onboardingProgress < 100 && !isWelcomePage"
      position="bottom-right"
      :offset="[18, 18]"
      style="z-index: 2000;"
    >
      <q-btn
        fab
        icon="school"
        color="primary"
        class="onboarding-fab"
        @click="openOnboardingTour"
      >
        <q-tooltip anchor="center left" self="center right" :offset="[10, 0]">
          Configuración guiada ({{ onboardingProgress }}% completado)
        </q-tooltip>
        <q-badge
          v-if="onboardingProgress < 100"
          color="orange"
          floating
          rounded
        >
          {{ onboardingProgress }}%
        </q-badge>
      </q-btn>
    </q-page-sticky>

    <q-inner-loading :showing="visibleLoading">
      <q-spinner-gears size="100px" color="primary" />
    </q-inner-loading>

    <!-- Subscription Plans Dialog -->
    <subscription-plans-dialog
      v-model="showSubscriptionDialog"
      @subscription-updated="onSubscriptionUpdated"
    />

    <!-- Create Company Dialog -->
    <q-dialog
      v-model="showCreateCompanyDialog"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card v-if="isDemo" class="demo-register-card" style="width: 480px; max-width: 90vh; overflow: hidden;">
        <!-- Header con gradiente atractivo -->
        <div class="demo-register-header">
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            @click="closeCreateCompanyDialog"
            class="absolute-top-right q-ma-md"
            style="z-index: 10;"
          />

          <div class="demo-register-icon-container">
            <q-icon name="rocket_launch" size="44px" color="white" class="demo-register-icon" />
          </div>

          <div class="text-h6 text-weight-bold text-white q-mt-md">
            ¡Bienvenido a la era digital!
          </div>
          <div class="text-body2 text-white q-mt-sm" style="opacity: 0.95;">
            Crea tu cuenta gratis y desbloquea todas las funcionalidades
          </div>
        </div>

        <!-- Contenido -->
        <q-card-section class="q-pa-xl">
          <!-- Beneficios -->
          <div class="q-mb-lg">
            <div class="demo-benefit-item">
              <q-icon name="check_circle" color="positive" size="24px" />
              <span>Gestión completa de tu negocio</span>
            </div>
            <div class="demo-benefit-item">
              <q-icon name="check_circle" color="positive" size="24px" />
              <span>Control de stock</span>
            </div>
            <div class="demo-benefit-item">
              <q-icon name="check_circle" color="positive" size="24px" />
              <span>Reportes y estadísticas en tiempo real</span>
            </div>
            <div class="demo-benefit-item">
              <q-icon name="check_circle" color="positive" size="24px" />
              <span>Soporte técnico dedicado</span>
            </div>
          </div>

          <!-- Botón de Google mejorado -->
          <google-register-button @success="handleGoogleRegisterSuccess" @error="handleGoogleRegisterError" />

          <!-- Texto adicional -->
          <div class="text-center q-mt-md text-caption text-grey-7">
            Al registrarte, aceptas nuestros <a href="https://politicas.qbits.com.ar" target="_blank">términos y condiciones</a>
          </div>
        </q-card-section>
      </q-card>
      <q-card class="create-company-card" style="min-width: 500px; max-width: 600px;" v-else>
        <!-- Header con gradiente -->
        <q-card-section class="create-company-header">
          <div class="row items-center">
            <q-icon name="add_business" size="32px" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold">Crear Mi Empresa</div>
              <div class="text-caption">Deja la demo y crea tu cuenta empresarial</div>
            </div>
            <q-space />
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeCreateCompanyDialog"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md" style="max-height: 60vh; overflow-y: auto;">
          <!-- Información de Demo -->
          <q-banner rounded class="bg-orange-1 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="orange" />
            </template>
            <div class="text-body2">
              Actualmente estás usando una <strong>cuenta demo</strong>.
              Al crear tu empresa, todos tus datos se guardarán en tu propia cuenta.
            </div>
          </q-banner>

          <!-- Formulario -->
          <q-form ref="companyForm" @submit="createCompany">
            <div class="row q-col-gutter-md">
              <!-- Nombre de la empresa -->
              <div class="col-12">
                <q-input
                  v-model="companyData.company_name"
                  label="Nombre de la Empresa *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" />
                  </template>
                </q-input>
              </div>

              <!-- RUT/Documento -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="companyData.company_document"
                  label="RUT/Documento *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>

              <!-- Teléfono -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="companyData.company_phone"
                  label="Teléfono *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>

              <!-- Email -->
              <div class="col-12">
                <q-input
                  v-model="companyData.company_email"
                  label="Email *"
                  type="email"
                  outlined
                  dense
                  :rules="[
                    val => !!val || 'Campo requerido',
                    val => /.+@.+\..+/.test(val) || 'Email inválido'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </div>

              <!-- Dirección -->
              <div class="col-12">
                <AddressComponent
                  :initial-address="companyAddressData"
                  @address-selected="handleCompanyAddressSelected"
                />
              </div>

              <!-- Tipo de Negocio -->
              <div class="col-12">
                <q-select
                  v-model="companyData.business_type"
                  :options="businessTypes"
                  option-label="name"
                  option-value="id"
                  label="Tipo de Negocio *"
                  outlined
                  dense
                  use-input
                  input-debounce="300"
                  @filter="filterBusinessTypes"
                  :rules="[val => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="category" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No hay resultados
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Copiar productos demo -->
              <div class="col-12">
                <q-checkbox
                  v-model="companyData.copy_test_products"
                  label="Copiar productos y categorías de la empresa demo"
                  color="primary"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            @click="closeCreateCompanyDialog"
            :disable="loadingCreateCompany"
          />
          <q-btn
            unelevated
            label="Crear Empresa"
            color="primary"
            icon-right="arrow_forward"
            @click="createCompany"
            :loading="loadingCreateCompany"
            class="create-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import { api, apiArca } from 'src/boot/axios'
import NotificationComponent from 'src/components/NotificationComponent.vue'
import FloatingThemeSelector from 'src/components/ThemeSelector/FloatingThemeSelector.vue'
import SubscriptionPlansDialog from 'src/components/SubscriptionPlansDialog.vue'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
import GoogleRegisterButton from 'src/components/Auth/GoogleRegisterButton.vue'
import { authentication } from 'src/stores/module-authentication'
import { mapState, mapActions } from 'pinia'
import { logo, notify, loading } from 'src/const/mixins'
import eventBus from 'src/utils/eventBus'
import { darkModeStore } from '../stores/darkModeStore'
import { MultiDisplayManager } from 'multi-display-manager'
import { copyToClipboard } from 'quasar'
import { useThemeStore } from 'src/stores/themeStore'
import { useRouter } from 'vue-router'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner'

export default {
  name: 'MainLayout',
  components: { NotificationComponent, FloatingThemeSelector, SubscriptionPlansDialog, AddressComponent, GoogleRegisterButton },
  data () {
    return {
      logo,
      arcaDialog: false,
      branchOffices: [],
      role: null,
      notify,
      cuit: '',
      password: '',
      download: null,
      numberOfNotifications: [],
      notifications: [],
      labelDrown: null,
      dataMenu: [],
      active: true,
      menuSearch: '',
      showSearchInput: false,
      visibleLoading: false,
      titleApp: null,
      route: '',
      modules: [],
      /**
       * Status menu
       *
       * @type {Bolean} status menu
       */
      leftDrawerOpen: false,
      miniState: false,
      titleMenu: 'Opciones',
      /**
       * Has multiple screens
       * @type {Boolean}
       */
      hasMultipleScreens: false,
      /**
       * Scanned QR code
       * @type {String}
       */
      scannedCode: '',
      /**
       * Subscription dialog
       * @type {Boolean}
       */
      showSubscriptionDialog: false,
      /**
       * Show create company dialog
       * @type {Boolean}
       */
      showCreateCompanyDialog: false,
      /**
       * Loading create company
       * @type {Boolean}
       */
      loadingCreateCompany: false,
      /**
       * Company data form
       * @type {Object}
       */
      companyData: {
        company_name: '',
        company_document: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        business_type: null,
        copy_test_products: true
      },
      companyAddressData: {
        name: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        latitude: null,
        longitude: null
      },
      /**
       * Onboarding data
       */
      showOnboardingFab: false,
      onboardingProgress: 0,
      tasks: {
        formattedAddress: '',
        placeId: '',
        types: []
      },
      /**
       * Business types list
       * @type {Array}
       */
      businessTypes: [],
      /**
       * Store instance
       */
      store: authentication(),
      /**
       * Demo reminder interval
       * @type {Number}
       */
      demoReminderInterval: null
    }
  },
  computed: {
    ...mapState(authentication, [
      'userSession',
      'branchOffice',
      'isDemo',
      'setBranchOffice',
      'access_token',
      'refresh_token',
      'expires_In',
      'token_type'
    ]),
    ...mapState(darkModeStore, ['darkMode']),
    /**
     * Check if current page has tour available
     * @returns {Boolean}
     */
    currentPageHasTour () {
      const pagesWithTour = ['Billing', 'CompanyConfig', 'Category', 'Product']
      return pagesWithTour.includes(this.$route.name)
    },
    canAddMoreBranches () {
      return this.currentBranchCount < this.maxBranches
    },
    filteredDataMenu () {
      if (!this.menuSearch) return this.dataMenu

      const searchLower = this.menuSearch.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      return this.dataMenu.map(section => {
        // Filter modules that match the search term
        const filteredModules = section.modules.filter(module => {
          const title = (module.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          return title.includes(searchLower)
        })

        // If section has matching modules, return section with those modules
        if (filteredModules.length > 0) {
          return {
            ...section,
            modules: filteredModules
          }
        }

        // Also check if section name matches
        const sectionName = (section.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (sectionName.includes(searchLower)) {
          // If section name matches, should we show all modules?
          // Maybe better to show the section with original modules if the user is searching for the section.
          return section
        }

        return null
      }).filter(section => section !== null)
    },
    /**
     * Get subscription plan from store
     * @returns {String}
     */
    subscriptionPlan () {
      return this.store.subscriptionPlan || 'Free'
    },
    /**
     * Get subscription days left from store
     * @returns {Number}
     */
    subscriptionDaysLeft () {
      return this.store.subscriptionDaysLeft
    },
    /**
     * Get current subscription from store
     * @returns {Object}
     */
    currentSubscription () {
      return this.store.currentSubscription
    },
    /**
     * Get max branches from store
     * @returns {Number}
     */
    maxBranches () {
      return this.store.maxBranches
    },
    /**
     * Get current branch count from store
     * @returns {Number}
     */
    currentBranchCount () {
      return this.store.currentBranchCount
    },
    /**
     * Check if current route is Welcome page
     * @returns {Boolean}
     */
    isWelcomePage () {
      return this.route?.name === 'Welcome'
    }
  },
  watch: {
    showCreateCompanyDialog (val) {
      if (val) {
        this.loadBusinessTypes()
        this.companyData.business_type = this.userSession?.company_session?.business_type
        if (this.userSession?.email) {
          this.companyData.company_email = this.userSession.email
        }
        if (this.userSession?.phone_number) {
          this.companyData.company_phone = this.userSession.phone_number
        }
      }
    },
    modules (value) {
      if (value.length > 0) {
        this.dataMenu = value.filter((element) => {
          return (
            element.modules.filter((module) => {
              return this.validateRole(module.roles)
            }).length > 0
          )
        })

        // Agregar entrada de Chat con IA si no existe
        const hasAiChat = this.dataMenu.some(section =>
          section.modules.some(module => module.link === 'AiChat')
        )

        if (!hasAiChat) {
          // Buscar sección de Herramientas o crear una nueva
          let toolsSection = this.dataMenu.find(section =>
            section.name === 'Herramientas' || section.name === 'Tools'
          )

          if (!toolsSection) {
            toolsSection = {
              id: 'tools-section',
              name: 'Herramientas',
              icon: 'build',
              modules: []
            }
            this.dataMenu.push(toolsSection)
          }

          // Agregar módulo de Chat con IA
          toolsSection.modules.push({
            id: 'ai-chat-module',
            name: 'ai-chat',
            title: 'Chat con IA',
            link: 'AiChat',
            icon: 'smart_toy',
            roles: ['super_admin', 'admin', 'user'],
            visible: true
          })
        }
      }
    }
  },
  setup () {
    const router = useRouter()
    return {
      router
    }
  },
  mounted () {
    this.$echo
      .private('App.Models.User.' + this.userSession.id)
      .notification((notification) => {
        this.setNotification(notification)
      })

    // Listen for subscription updates
    window.addEventListener('subscription-updated', () => {
      this.loadSubscriptionInfo()
    })

    // Listen for global keyboard shortcuts
    window.addEventListener('keydown', this.handleGlobalKeyDown)

    this.startDemoReminder()
  },
  beforeUnmount () {
    this.stopDemoReminder()
  },
  unmounted () {
    window.removeEventListener('keydown', this.handleGlobalKeyDown)
  },
  created () {
    this.loadingPage()
    this.checkMultipleScreens()
    this.loadSubscriptionInfo()
  },
  methods: {
    /**
     * Handle global keyboard shortcuts
     * @param {KeyboardEvent} e event
     */
    handleGlobalKeyDown (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        this.toggleSearch()
      }
    },
    /**
     * Toggle menu search and focus
     */
    toggleSearch () {
      this.leftDrawerOpen = true
      this.menuSearch = ''
      this.showSearchInput = !this.showSearchInput
      this.$nextTick(() => {
        if (this.showSearchInput && this.$refs.searchInput) {
          this.$refs.searchInput.focus()
        }
      })
    },
    /**
     * Activate tour for current page
     */
    activateCurrentPageTour () {
      // Emitir evento global para que la página actual active su tour
      eventBus.emit('activate-page-tour', this.$route.name)
    },
    /**
     * Load business types
     */
    async loadBusinessTypes () {
      try {
        const { data } = await api.get('business-types')
        this.businessTypes = data.data || data
      } catch (error) {
        console.error('Error loading business types:', error)
        notify('Error al cargar tipos de negocio', 'negative', 'warning')
      }
    },
    /**
     * Filter business types
     */
    async filterBusinessTypes (val, update) {
      try {
        const { data } = await api.get('business-types', {
          params: { search: val }
        })
        update(() => {
          this.businessTypes = data.data || data
        })
      } catch (error) {
        console.error('Error filtering business types:', error)
        update(() => {
          this.businessTypes = []
        })
      }
    },
    /**
     * Close create company dialog
     */
    closeCreateCompanyDialog () {
      this.showCreateCompanyDialog = false
      // Reset form
      this.companyData = {
        company_name: '',
        company_document: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        business_type: null,
        copy_test_products: true
      }
      this.companyAddressData = {
        name: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        latitude: null,
        longitude: null,
        formattedAddress: '',
        placeId: '',
        types: []
      }
    },
    /**
     * Handle Google register success
     */
    async handleGoogleRegisterSuccess (data) {
      if (data.needsCompanySetup) {
        await this.store.setSessionData(data.user)
        this.companyData.company_email = data.userInfo.email
        this.showCreateCompanyDialog = true
      } else {
        this.closeCreateCompanyDialog()
      }
    },
    /**
     * Handle Google register error
     */
    handleGoogleRegisterError (error) {
      console.error('Error en registro con Google:', error)
    },
    /**
     * Handle company address selected
     */
    handleCompanyAddressSelected (addressDetails) {
      if (addressDetails) {
        // Guardar los detalles completos de la dirección
        this.companyAddressData = { ...addressDetails }
        // Actualizar el campo company_address con la dirección formateada
        this.companyData.company_address = addressDetails.formattedAddress || addressDetails.street || ''
      } else {
        // Limpiar si se resetea la dirección
        this.companyAddressData = {
          name: '',
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          latitude: null,
          longitude: null,
          formattedAddress: '',
          placeId: '',
          types: []
        }
        this.companyData.company_address = ''
      }
    },
    /**
     * Create company
     */
    async createCompany () {
      // Validar formulario
      const valid = await this.$refs.companyForm.validate()
      if (!valid) {
        notify('Por favor completa todos los campos requeridos', 'warning', 'warning')
        return
      }

      try {
        this.loadingCreateCompany = true

        // Preparar payload
        const payload = {
          company_name: this.companyData.company_name,
          company_document: this.companyData.company_document,
          company_email: this.companyData.company_email,
          company_phone: this.companyData.company_phone,
          company_address: this.companyData.company_address,
          business_type_id: this.companyData.business_type?.id,
          copy_test_products: this.companyData.copy_test_products
        }

        // Llamar al endpoint de setup-company
        const { data } = await api.post('authentication/setup-company', payload)

        // Actualizar store con nueva información
        this.store.setSessionData({
          user: data.user,
          access_token: this.access_token,
          token_type: this.token_type,
          expires_in: this.expires_In,
          refresh_token: this.refresh_token,
          is_demo: false // Ya no es demo
        })

        this.stopDemoReminder()

        // Cerrar diálogo
        this.showCreateCompanyDialog = false

        // Notificación de éxito con animación
        notify('¡Empresa creada exitosamente! 🎉', 'positive', 'check_circle')

        // Marcar que necesita tour de facturación
        localStorage.setItem('needs_billing_tour', 'true')

        // Mostrar diálogo de opciones
        this.$q.dialog({
          title: '¡Empresa creada exitosamente! 🎉',
          message: '¿Qué te gustaría hacer ahora?',
          options: {
            type: 'radio',
            model: 'billing',
            items: [
              { label: 'Ver tutorial de facturación (Recomendado)', value: 'billing', color: 'primary' },
              { label: 'Configurar mi empresa', value: 'config', color: 'secondary' }
            ]
          },
          cancel: false,
          persistent: true,
          ok: {
            label: 'Continuar',
            color: 'primary'
          }
        }).onOk(data => {
          if (data === 'billing') {
            // Ir a facturación con tour
            this.$router.push({ name: 'Billing' })
          } else {
            // Ir a configuración de empresa con tour
            localStorage.setItem('needs_company_config_tour', 'true')
            this.$router.push({ name: 'CompanyConfig' })
          }
        })
      } catch (error) {
        const message = error.response?.data?.message || 'Error al crear empresa'
        notify(message, 'negative', 'warning')
        console.error('Error creating company:', error)
      } finally {
        this.loadingCreateCompany = false
      }
    },
    /**
     * Load subscription information
     */
    async loadSubscriptionInfo () {
      // Use Pinia store to load and store subscription data
      await this.store.loadSubscriptionInfo()

      // Load current branch count
      await this.loadBranchCount()
    },
    /**
     * Load current branch count
     */
    async loadBranchCount () {
      try {
        const count = this.branchOffices.length

        this.store.setCurrentBranchCount(count)
      } catch (error) {
        console.error('Error loading branch count:', error)
        this.store.setCurrentBranchCount(0)
      }
    },
    /**
     * Go to add branch page
     */
    goToAddBranch () {
      this.$router.push('/branch-offices')
    },
    /**
     * Open subscription dialog
     */
    openSubscriptionDialog () {
      this.showSubscriptionDialog = true
    },
    /**
     * Handle subscription updated event
     */
    onSubscriptionUpdated (subscription) {
      this.loadSubscriptionInfo()
      if (subscription) {
        notify('Suscripción actualizada exitosamente', 'positive', 'check_circle')
      }
    },
    /**
     * Check if device has multiple screens
     */
    async checkMultipleScreens () {
      try {
        if (window.screen && window.screen.isExtended !== undefined) {
          this.hasMultipleScreens = await window.screen.isExtended
        } else if (this.$q.platform.is.nativeMobile) {
          // En móvil nativo, verificar con el plugin
          this.hasMultipleScreens = true
        }
      } catch (error) {
        console.log('No se pudo detectar múltiples pantallas:', error)
        this.hasMultipleScreens = false
      }
    },
    /**
     * Open QR scanner
     */
    async openQrScanner () {
      try {
        const result = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
          scanInstructions: 'Escanear código QR',
          scanButton: false,
          scanText: 'Scan',
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
          android: {
            scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.ZXING
          }
        })

        if (result.ScanResult) {
          await this.processQrCode(result.ScanResult)
        }
      } catch (error) {
        if (error instanceof Error && error.message !== 'User cancelled') {
          notify('Error al escanear el código QR', 'negative', 'warning')
        }
      }
    },
    /**
     * Process QR code
     * @param {String} code QR code data
     */
    async processQrCode (code) {
      if (!code) return

      try {
        loading(true)

        // Detectar tipo de QR
        const qrType = this.detectQrType(code)

        switch (qrType) {
          case 'transfer':
            await this.handleTransferQr(code)
            break
          case 'product':
            notify('Funcionalidad de productos próximamente', 'info', 'info')
            break
          case 'sale':
            notify('Funcionalidad de ventas próximamente', 'info', 'info')
            break
          case 'purchase':
            notify('Funcionalidad de compras próximamente', 'info', 'info')
            break
          default:
            notify('Código QR no reconocido', 'warning', 'warning')
        }
      } catch (error) {
        notify(error.message || 'Error al procesar el código QR', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Detect QR type
     * @param {String} code QR code
     * @returns {String} type
     */
    detectQrType (code) {
      // Detectar por prefijo o patrón
      console.log(code)
      if (code.includes('transfer_stock') || code.includes('TRANSFER_STOCK') || code.startsWith('T-')) {
        return 'transfer'
      } else if (code.includes('product') || code.includes('PRODUCT') || code.startsWith('P-')) {
        return 'product'
      } else if (code.includes('sale') || code.includes('SALE') || code.startsWith('S-')) {
        return 'sale'
      } else if (code.includes('purchase') || code.includes('PURCHASE') || code.startsWith('C-')) {
        return 'purchase'
      }

      // Si es solo un número, asumir que es una transferencia
      if (/^\d+$/.test(code)) {
        return 'transfer'
      }

      return 'unknown'
    },
    /**
     * Handle transfer QR
     * @param {String} code transfer code
     */
    async handleTransferQr (code) {
      // Extraer ID de la transferencia
      const data = JSON.parse(code)
      const transferId = data.id

      if (!transferId) {
        throw new Error('ID de transferencia no válido')
      }

      // Navegar a la página de transferencias con query params
      this.$router.push({
        name: 'TransferProduct',
        query: {
          view: 'options',
          id: transferId
        }
      })

      notify('Cargando opciones de transferencia...', 'info', 'info')
    },
    async screen () {
      try {
        loading(true)
        const url = `${import.meta.env.VITE_APP_URL}/verifying/${encodeURIComponent(this.token_type)}/${encodeURIComponent(this.access_token)}/${this.expires_In}/InvoiceDetails`
        await MultiDisplayManager.showOnSecondScreen({
          url
        })
      } catch (error) {
        alert(error.message)
      } finally {
        loading(false)
      }
    },
    async closeScreen () {
      // Obtener estado
      const status = await MultiDisplayManager.getSecondScreenStatus()
      alert(status.message, status.isShowing)
      if (status.isShowing) {
        // Cerrar pantalla
        await MultiDisplayManager.closeSecondScreen()
      }
    },
    ucwords (data) {
      return data
    },
    /**
     * Update data
     */
    update () {
      window.location.reload(true)
    },
    /**
     * Set notification
     * @param {Object} data data
     */
    setNotification ({ data, id }) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.getDataNotification()

          if (data.invoice_id) {
            const notification = createNotification(this.$t(`command.${data.name}`), {
              body: data.description,
              icon: '/icons/icon-128x128.png'
            }, false)
            notification.onclick = () => {
              window.open(`${window.location.origin}/command-orders/?id=${data.invoice_id}`, '_blank')
            }
          }

          if (data.error_type) {
            const notification = createNotification(this.$t(`command.${data?.error_type?.toLowerCase()}`), {
              body: data.description,
              icon: '/icons/icon-128x128.png'
            }, true)
            notification.onclick = () => {
              window.open(`${window.location.origin}/notifications/?id=${id}`, '_blank')
            }
          }

          function createNotification (title, options, sound) {
            if (sound) {
              const audio = new Audio('audios/bug_notification.wav')
              audio.play()
            }
            return new Notification(title, options)
          }
        }
      })
    },
    async getDataNotification () {
      try {
        const { data } = await api.get('notifications', {
          params: { unread: true }
        })
        this.numberOfNotifications = data
      } catch (error) {
        console.log(error.message)
      }
    },

    copyCatalog () {
      copyToClipboard(`${window.location.origin}/catalog/${this.userSession.company_session_id}/${this.branchOffice?.id}`)
        .then(() => {
          notify('Link copiado exitosamente', 'positive', 'check_circle')
        })
    },

    async openDialogArca () {
      try {
        // Validación 2: Verificar que no sea cuenta demo
        if (this.isDemo) {
          notify('Crea una empresa real para acceder a las integraciones', 'info', 'info')
          this.showCreateCompanyDialog = true
          return
        }

        loading(true)

        const hasApiAccess = await this.verifyApiAccess()

        if (!hasApiAccess) {
          notify('Tu plan actual no incluye acceso a integraciones. Actualiza tu plan.', 'warning', 'upgrade')
          this.showSubscriptionDialog = true
          return
        }

        // Validación 4: Verificar datos de facturación
        if (!this.userSession?.company_session?.billing) {
          const documentNumber = this.userSession?.company_session?.document_number
          const userName = this.userSession?.name
          const userEmail = this.userSession?.email

          if (!documentNumber || !userName || !userEmail) {
            notify('Datos de empresa incompletos. Contacta al administrador.', 'negative', 'error')
            return
          }

          const { data } = await this.$apiArca('companies', {
            params: {
              user: {
                name: userName,
                email: userEmail
              },
              document_number: documentNumber
            }
          })

          // Validar respuesta
          if (!data?.certificate_url || !data?.key_url) {
            throw new Error('Respuesta inválida del servidor ARCA')
          }

          this.download = {
            certificate_url: data.certificate_url,
            key_url: data.key_url
          }

          // Abrir diálogo solo si todo fue exitoso
          this.arcaDialog = true
        }
      } catch (error) {
        this.arcaDialog = true
      } finally {
        loading(false)
      }
    },

    /**
     * Verificar acceso a API desde el backend (no confiar en localStorage)
     */
    async verifyApiAccess () {
      try {
        // Llamar al backend para verificar la suscripción actual
        const { data } = await this.$api.get('subscriptions/current')

        // Actualizar el store con datos verificados del backend
        if (data.subscription) {
          this.store.currentSubscription = data.subscription
          this.store.subscriptionPlan = data.subscription.plan?.name
          this.store.subscriptionDaysLeft = data.days_left
          this.store.maxBranches = data.subscription.plan?.max_branches || 1

          // Retornar si tiene acceso a API
          return data.subscription.plan?.has_api_access === true
        }

        return false
      } catch (error) {
        console.error('[Subscription] Verification error:', error)
        // En caso de error, denegar acceso por seguridad
        return false
      }
    },
    /**
     * Get all products
     */
    getAllModules () {
      this.$api
        .get('sections', {
          params: {
            sortBy: 'index',
            sortOrder: 'asc'
          }
        })
        .then(({ data }) => {
          this.modules = data
        })
        .catch((err) => {
          console.log(err)
        })
    },
    /**
     * Generate certificate
     */
    async generateCertificate () {
      try {
        loading(true,
          {
            message: 'Generando certificado, esto puede tardar unos minutos ...',
            backgroundColor: 'cyan-10',
            customClass: 'text-subtitle1 text-center'
          }
        )
        const { data } = await apiArca.post('metadata/generate-cert', {
          cuit: this.cuit,
          password: this.password,
          company: this.userSession?.company_session,
          user: {
            email: this.userSession?.email,
            name: this.userSession?.name
          }
        })
        const res = await api.put(`session/company/${this.userSession.company_session_id}`, {
          ...this.userSession?.company_session,
          billing: true
        })
        this.setCompanySession({
          ...this.userSession?.company_session,
          ...res.data
        })
        this.download = data
      } catch (error) {
        notify(error?.response.data?.message || error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Get all branch offices
     */
    async getBrachOffice () {
      try {
        const params = {}
        if (!this.userSession.is_root) {
          params.dataEqualFilter = {
            'branchOfficeUsers.user_id': this.userSession.id
          }
        }
        const { data } = await api.get('branch-offices', { params })
        this.branchOffices = data
        if (!this.branchOffice) {
          this.setBranchOffice(data[0])
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Validate role
     * @param {Array} roles
     * @returns {Object}
     */
    validateRole (roles = []) {
      const rol = this.userSession?.roles[0]
      if (this.userSession?.is_root) return true
      if (roles && roles.length > 0 && rol) {
        return roles.some((element) => element.id === rol.id)
      }
      return false
    },
    /**
     * Validate business type
     * @param {Array} businessTypes
     * @returns {Boolean}
     */
    validateBusinessType (module) {
      const businessTypeModules = this.userSession?.company_session?.business_type?.modules || []

      if (this.userSession?.is_root) return true

      if (businessTypeModules.length === 0) return true

      if (businessTypeModules.length > 0 && module) {
        return businessTypeModules.some((businessModule) => businessModule.id === module.id)
      }
      return false
    },
    /**
     * Logout application
     */
    logoutAt () {
      this.$router.push({ name: 'Login' })
      this.logout()
    },
    /**
     * Dark mode application
     */
    setTheme () {
      this.$q.dark.toggle()
      this.setDarkMode(this.$q.dark.isActive)
    },
    /**
     * Loading applications
     */
    loadingPage () {
      this.$q.dark.set(this.darkMode)
      this.getAllModules()
      this.getDataNotification()
      this.getBrachOffice()
      this.cuit = this.userSession?.company_session?.document_number
      this.loadingTasks()
    },
    /**
     * Loading tasks
     */
    async loadingTasks () {
      try {
        // No hacer peticiones si la empresa ya está configurada al 100%
        const isConfigured = this.userSession?.company_session?.configured
        if (isConfigured) {
          this.showOnboardingFab = false
          this.onboardingProgress = 100
          return
        }

        const { data } = await this.$api.get('onboarding/tasks/status')
        this.tasks = data
        // Calcular progreso
        if (data.tasks) {
          let completed = 0
          const total = data.tasks.length
          data.tasks.forEach(task => {
            if (task.route === 'CompanyConfig' && task.multiple) {
              if (task.multiple.client && task.multiple.type_of_service && task.multiple.invoice_type) {
                completed++
              }
            } else if (task.count > 0) {
              completed++
            }
          })
          this.onboardingProgress = Math.round((completed / total) * 100)
          // Mostrar FAB solo si no está completado al 100%
          const hasCompletedAny = completed > 0
          const isDismissed = localStorage.getItem('onboarding_dismissed') === 'true'
          const isCompletedPermanently = localStorage.getItem('onboarding_completed') === 'true'
          this.showOnboardingFab = !isCompletedPermanently && (hasCompletedAny || !isDismissed)
        }
      } catch (error) {
        console.log(error)
      }
    },
    /**
     * Open onboarding tour
     */
    openOnboardingTour () {
      this.$router.push({ name: 'Welcome' })
    },
    /**
     * Change route
     * @param  {String} data name route
     */
    changeRoute (data, listName) {
      this.$router.push({ name: data })
      this.route = data
      this.titleApp = listName
    },
    /**
     * Change branch office
     * @param {Object} data branch office
     */
    changeBranchOffice (data) {
      this.setBranchOffice(data)
      notify(`Cambio de sucursal a ${data.name} exitosa`, 'positive', 'check_circle')
    },
    /**
     * Validate device
     * @param  {String} validate device
     */
    validateDevice (device) {
      return this.$q.platform.is[device]
    },
    /**
     * Start demo reminder interval
     * Shows create company dialog every 5 minutes for demo accounts
     */
    startDemoReminder () {
      // Solo iniciar si es cuenta demo
      if (!this.isDemo) {
        return
      }

      // Limpiar intervalo existente si hay uno
      this.stopDemoReminder()

      // Configurar intervalo de 5 minutos (300000 ms)
      this.demoReminderInterval = setInterval(() => {
        // Verificar nuevamente si sigue siendo demo (por si cambió)
        if (this.isDemo) {
          this.showCreateCompanyDialog = true
        } else {
          // Si ya no es demo, detener el intervalo
          this.stopDemoReminder()
        }
      }, 300000)
    },

    /**
     * Stop demo reminder interval
     */
    stopDemoReminder () {
      if (this.demoReminderInterval) {
        clearInterval(this.demoReminderInterval)
        this.demoReminderInterval = null
      }
    },

    /**
     * Logout map actions
     */
    ...mapActions(authentication, ['logout', 'setCompanySession']),
    /**
     * Dark mode map actions
     */
    ...mapActions(darkModeStore, ['setDarkMode'])
  }
}
</script>

<style lang="scss" scoped>
/* Modern Minimalist Layout Styles */
.modern-layout {
  position: relative;
  background: transparent;
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.body--dark .animated-bg {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  top: -10%;
  right: -10%;
  animation-delay: 0s;
  transition: background 0.5s ease;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  bottom: -10%;
  left: -10%;
  animation-delay: 7s;
  transition: background 0.5s ease;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.modern-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%) !important;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.15) !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2000 !important;
  transition: background 0.3s ease !important;
}

.body--dark .modern-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%) !important;
  box-shadow: 0 2px 12px rgba(90, 103, 216, 0.25) !important;
  filter: brightness(0.85);
}

.modern-toolbar {
  background: transparent !important;
  min-height: 56px;
}

.menu-btn {
  transition: all 0.3s ease;
}

.menu-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.1);
}

/* Branch Office Indicator */
.branch-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.branch-chip {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  height: 28px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.branch-chip:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.branch-chip :deep(.q-chip__icon) {
  font-size: 16px;
  margin-right: 4px;
}

.branch-chip :deep(.q-chip__content) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.add-branch-btn {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.add-branch-btn:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.add-branch-btn:active {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .branch-chip :deep(.q-chip__content) {
    max-width: 120px;
  }

  .add-branch-btn {
    display: none;
  }
}

/* Tour Button in Navbar */
.tour-btn-navbar {
  transition: all 0.3s ease;
}

.tour-btn-navbar:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.1);
}

.tour-btn-navbar:active {
  transform: scale(0.95);
}

/* ===== Drawer Mobile Header ===== */
.drawer-mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.body--dark .drawer-mobile-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.drawer-mobile-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.drawer-logo-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  z-index: 1;
}

.drawer-logo-img {
  max-width: 140px;
  max-height: 50px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.drawer-logo-img:hover {
  transform: scale(1.02);
}

.drawer-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.drawer-action-btn {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
}

.drawer-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.drawer-action-btn:active {
  transform: scale(0.95);
}

/* Drawer Styles */
.modern-drawer-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  transition: background 0.3s ease;
}

.modern-drawer-footer {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  transition: background 0.3s ease;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Close Section */
.drawer-close-section {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-close-btn {
  width: 100%;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
}

.drawer-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.drawer-close-btn:active {
  transform: translateY(0);
}

.drawer-close-btn :deep(.q-icon) {
  font-size: 20px;
  margin-right: 8px;
}

/* Footer Brand */
.drawer-footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
}

.footer-brand-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* Menu Items */
:deep(.q-expansion-item__container) {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

:deep(.q-expansion-item__container:hover) {
  background: rgba(124, 58, 237, 0.05);
}

:deep(.q-item) {
  border-radius: 8px;
  margin: 2px 8px;
  transition: all 0.3s ease;
}

:deep(.q-item:hover) {
  background: rgba(124, 58, 237, 0.08);
  transform: translateX(4px);
}

:deep(.my-menu-link) {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
  border-left: 3px solid var(--primary);
  transition: all 0.3s ease;
}

/* Dialog Styles */
.modern-dialog-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 24px;
  transition: background 0.3s ease;
}

/* Buttons */
:deep(.q-btn) {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

:deep(.q-btn:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Inputs */
:deep(.q-field__control) {
  border-radius: 8px;
}

:deep(.q-field--filled .q-field__control) {
  background: rgba(124, 58, 237, 0.05);
}

:deep(.q-field--filled .q-field__control:hover) {
  background: rgba(124, 58, 237, 0.08);
}

:deep(.q-field--filled.q-field--focused .q-field__control) {
  background: rgba(124, 58, 237, 0.1);
}

/* Notifications Badge */
:deep(.q-badge) {
  border-radius: 12px;
  font-weight: 600;
}

/* Separators */
:deep(.q-separator) {
  background: rgba(255, 255, 255, 0.2);
}

/* Tooltips */
:deep(.q-tooltip) {
  background: #1f2937;
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 12px;
}

/* Cards */
:deep(.q-card) {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Expansion Items */
:deep(.q-expansion-item__label) {
  font-weight: 600;
  color: #374151;
}

:deep(.q-expansion-item--active .q-expansion-item__label) {
  color: #7c3aed;
}

/* Profile Button & Menu */
.profile-btn {
  transition: all 0.3s ease;
}

.profile-btn:hover {
  transform: scale(1.05);
}

.profile-avatar {
  transition: all 0.3s ease;
}

.profile-btn:hover .profile-avatar {
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
}

.profile-card {
  min-width: 300px;
  max-width: 300px;
  border-radius: 16px;
  overflow: hidden;
  border: none !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.body--dark .profile-card {
  background: #1e293b;
  border: none !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Profile Header Modern */
.profile-header-modern {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary-dark, var(--q-primary)) 100%);
  padding: 20px 16px;
  transition: all 0.3s ease;
}

.body--dark .profile-header-modern {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary-dark, var(--q-primary)) 100%);
  filter: brightness(1.1);
}

.profile-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar-modern {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.profile-avatar-modern:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.4);
}

.profile-info {
  flex: 1;
  color: white;
  min-width: 0;
}

.profile-name {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 3px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.profile-email {
  font-size: 12px;
  opacity: 0.95;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

/* Plan Compact */
.plan-compact {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: rgba(124, 58, 237, 0.08);
  border-radius: 6px;
}

.body--dark .plan-compact {
  background: rgba(139, 92, 246, 0.15);
}

/* Demo Action Item - Modern */
.demo-action-item {
  border-radius: 0;
  margin: 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%);
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 64px;
}

.demo-action-item:hover {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%);
  transform: translateX(4px);
  box-shadow: inset 4px 0 0 0 rgba(251, 191, 36, 0.6);
}

.body--dark .demo-action-item {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.18) 0%, rgba(245, 158, 11, 0.12) 100%);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.body--dark .demo-action-item:hover {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.28) 0%, rgba(245, 158, 11, 0.2) 100%);
  box-shadow: inset 4px 0 0 0 rgba(251, 191, 36, 0.8);
}

.demo-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(251, 191, 36, 0.15);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.demo-action-item:hover .demo-icon-wrapper {
  background: rgba(251, 191, 36, 0.25);
  transform: scale(1.1);
}

.rocket-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 58, 237, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.demo-action-item:hover .rocket-wrapper {
  background: rgba(124, 58, 237, 0.2);
  transform: rotate(10deg) scale(1.1);
}

.demo-caption {
  opacity: 0.8;
  font-weight: 500;
}

/* Profile Actions Modern */
.profile-action-item-compact {
  border-radius: 0;
  margin: 0;
  min-height: 52px;
  padding: 10px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.profile-action-item-compact:last-child {
  border-bottom: none;
}

.profile-action-item-compact:hover {
  background: rgba(124, 58, 237, 0.06);
  transform: translateX(4px);
  box-shadow: inset 3px 0 0 0 rgba(124, 58, 237, 0.5);
}

.body--dark .profile-action-item-compact {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.body--dark .profile-action-item-compact:hover {
  background: rgba(139, 92, 246, 0.12);
  box-shadow: inset 3px 0 0 0 rgba(139, 92, 246, 0.6);
}

.action-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 58, 237, 0.08);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.profile-action-item-compact:hover .action-icon-wrapper {
  background: rgba(124, 58, 237, 0.15);
  transform: scale(1.1);
}

.body--dark .action-icon-wrapper {
  background: rgba(139, 92, 246, 0.12);
}

.body--dark .profile-action-item-compact:hover .action-icon-wrapper {
  background: rgba(139, 92, 246, 0.2);
}

.action-caption {
  opacity: 0.7;
  font-weight: 400;
}

:deep(.profile-action-item-compact .q-item__label) {
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.01em;
}

:deep(.profile-action-item-compact .q-item__label--caption) {
  font-size: 12px;
  margin-top: 2px;
}

/* Logout Container Modern */
.logout-container-modern {
  padding: 12px 16px 16px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);
}

.body--dark .logout-container-modern {
  border-top-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.logout-btn-modern {
  border-radius: 10px;
  font-weight: 600;
  padding: 10px 16px;
  letter-spacing: 0.01em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logout-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
}

/* Drawer Styles */
.modern-drawer {
  background: white;
  z-index: 100 !important;
  position: fixed !important;
}

.body--dark .modern-drawer {
  background: #2d3748;
  border-right: 1px solid #4a5568;
}

.main-content {
  position: relative;
  z-index: 1;
  background: transparent;
  overflow-y: auto;
  height: 100vh;
}

:deep(.q-page) {
  background: transparent;
}

.body--dark :deep(.q-item) {
  color: #e2e8f0;
}

.body--dark :deep(.q-item:hover) {
  background: rgba(139, 92, 246, 0.15);
}

.body--dark :deep(.my-menu-link) {
  background: linear-gradient(135deg, rgba(90, 103, 216, 0.2) 0%, rgba(107, 70, 193, 0.2) 100%);
  color: #a78bfa;
  border-left-color: #a78bfa;
}

.body--dark :deep(.q-expansion-item__label) {
  color: #e2e8f0;
}

.body--dark :deep(.q-expansion-item--active .q-expansion-item__label) {
  color: #a78bfa;
}

/* Navbar Structure v0 Style */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 0;
}

.logo-container-with-badge {
  position: relative;
  display: flex;
  align-items: center;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Demo Badge v0 Style */
.demo-badge-v0 {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  backdrop-filter: blur(10px);
}

/* Demo Badge Floating (flotando al lado del logo) */
.demo-badge-floating {
  position: absolute;
  right: -32px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: rgba(251, 191, 36, 0.95);
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
  z-index: 10;
  animation: float-badge 3s ease-in-out infinite;
}

@keyframes float-badge {
  0%, 100% {
    transform: translateY(-50%) translateX(0);
  }
  50% {
    transform: translateY(-50%) translateX(2px);
  }
}

.demo-badge-floating .demo-badge-dot {
  width: 5px;
  height: 5px;
  background: #1f2937;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

.demo-badge-dot {
  width: 6px;
  height: 6px;
  background: #fbbf24;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.body--dark .demo-badge-v0 {
  background: rgba(255, 255, 255, 0.1);
}

.body--dark .demo-badge-floating {
  background: rgba(251, 191, 36, 0.9);
  box-shadow: 0 2px 12px rgba(251, 191, 36, 0.5);
}

/* Create Button v0 Style */
.create-btn-v0 {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  transition: all 0.2s ease;
}

.create-btn-v0:hover {
  background: rgba(255, 255, 255, 0.15);
}

.body--dark .create-btn-v0:hover {
  background: rgba(255, 255, 255, 0.1);
}

.create-btn-v0 span {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* Rocket Icon Animation */
.rocket-icon {
  animation: rocket-launch 2s ease-in-out infinite;
  transform-origin: center;
}

@keyframes rocket-launch {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  10% {
    transform: translateY(-2px) rotate(-3deg);
  }
  20% {
    transform: translateY(-4px) rotate(3deg);
  }
  30% {
    transform: translateY(-6px) rotate(-2deg);
  }
  40% {
    transform: translateY(-4px) rotate(2deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
}

.create-btn-v0:hover .rocket-icon {
  animation: rocket-boost 0.6s ease-in-out infinite;
}

@keyframes rocket-boost {
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-3px) rotate(-5deg) scale(1.1);
  }
  50% {
    transform: translateY(-6px) rotate(0deg) scale(1.15);
  }
  75% {
    transform: translateY(-3px) rotate(5deg) scale(1.1);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .navbar-left {
    gap: 4px;
  }

  .navbar-right {
    gap: 2px;
  }

  .demo-badge-v0 {
    padding: 3px 8px;
    font-size: 11px;
  }

  .create-btn-v0 {
    height: 28px;
    padding: 0 10px;
  }

  .create-btn-v0 span {
    font-size: 12px;
  }
}

/* Create Company Dialog */
.create-company-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.create-company-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #667eea 100%);
  color: white;
  padding: 24px;
}

.body--dark .create-company-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #4c51bf 100%);
}

.create-company-card :deep(.q-field__control) {
  border-radius: 8px;
}

.create-company-card :deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(0, 0, 0, 0.12);
}

.body--dark .create-company-card :deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.12);
}

.create-company-card :deep(.q-field--outlined.q-field--focused .q-field__control:before) {
  border-color: var(--q-primary);
  border-width: 2px;
}

.create-btn {
  font-weight: 600;
  padding: 10px 24px;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateX(4px);
}

/* AI Chat Button */
.ai-chat-btn {
  position: relative;
  transition: all 0.3s ease;
}

.ai-chat-btn:hover {
  transform: scale(1.1);
}

.ai-chat-btn::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .create-company-btn {
    padding: 6px 12px;
    font-size: 0.875rem;
  }

  .create-company-btn :deep(.q-btn__content) {
    flex-direction: column;
    gap: 4px;
  }

  .create-company-card {
    min-width: 90vw !important;
    max-width: 90vw !important;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
  /* Animation */
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease-out;
    max-height: 80px;
    opacity: 1;
    overflow: hidden;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  .search-container {
    overflow: hidden;
  }

  /* Demo Register Card Styles */
.demo-register-card {
  border-radius: 20px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
}

.demo-register-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px 32px;
  text-align: center;
  position: relative;
}

.demo-register-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  animation: float 3s ease-in-out infinite;
}

.demo-register-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.demo-benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 15px;
  color: #374151;
  animation: slideInLeft 0.5s ease-out backwards;
}

.demo-benefit-item:nth-child(1) { animation-delay: 0.1s; }
.demo-benefit-item:nth-child(2) { animation-delay: 0.2s; }
.demo-benefit-item:nth-child(3) { animation-delay: 0.3s; }
.demo-benefit-item:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Tools Popup Styles */
.tools-card {
  min-width: 280px;
  max-width: 320px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

body.body--dark .tools-card {
  background: rgba(30, 30, 30, 0.98);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.tools-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: white;
}

.tools-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  color: inherit;
  position: relative;

  &:hover {
    background: rgba(var(--q-primary-rgb), 0.1);
    transform: translateY(-2px);
  }

  &.tool-active {
    background: rgba(var(--q-primary-rgb), 0.15);
    color: var(--q-primary);

    .q-icon {
      color: var(--q-primary);
    }
  }

  .q-icon {
    color: #374151;
    transition: color 0.3s ease;
  }
}

body.body--dark .tool-item {
  background: rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(var(--q-primary-rgb), 0.2);
  }

  &.tool-active {
    background: rgba(var(--q-primary-rgb), 0.25);
  }

  .q-icon {
    color: rgba(255, 255, 255, 0.9);
  }
}

.tool-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tool-label {
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  opacity: 0.8;
}

.branch-menu {
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
}

.tools-section {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 6px 16px;
}

body.body--dark .tools-section {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  opacity: 0.7;
}

.integrations-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.integration-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 3px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;

  &:hover {
    background: rgba(var(--q-primary-rgb), 0.1);
    transform: translateY(-2px);
  }
}

body.body--dark .integration-item {
  background: rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(var(--q-primary-rgb), 0.2);
  }
}

.integration-logo {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.integration-label {
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 600px) {
  .tools-card {
    min-width: 260px;
    max-width: 280px;
  }

  .tools-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    padding: 12px;
  }

  .tool-item {
    padding: 10px 6px;
    gap: 4px;
  }

  .tool-label {
    font-size: 10px;
  }

  .tools-section {
    padding: 12px;
  }
}
</style>
