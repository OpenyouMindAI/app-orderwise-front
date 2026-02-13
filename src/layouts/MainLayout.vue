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

    <q-header v-if="!hideMainHeader" elevated class="modern-header">
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
            v-if="$q.screen.gt.sm"
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
              @click="$router.push({ name: 'Home' })"
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
        <!-- Support Button (Replaces Branch Office Indicator) -->
        <div class="support-indicator">
          <q-btn
            v-if="userSession?.is_root"
            flat
            dense
            no-caps
            class="support-btn-header"
            label="Suporte Admin"
            @click="changeRoute('AdminSupport', 'Suporte Admin')"
          >
            <q-icon name="support_agent" size="20px" />
            <q-tooltip>Centro de Soporte para Administradores</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            flat
            dense
            no-caps
            label="Contactanos"
            class="support-btn-header"
            @click="changeRoute('Support', 'Suporte')"
          >
            <q-icon name="support_agent" size="20px" />
            <q-tooltip>Centro de Soporte y Ayuda</q-tooltip>
          </q-btn>
        </div>

        <q-space />

        <!-- Right: Actions -->
        <div class="navbar-right">
          <!-- Botón Crear Mi Empresa (Escritorio/Tablet) -->
          <transition
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <div v-if="store.isDemo && !$q.screen.xs">
              <q-btn
                outline
                dense
                class="create-btn-v0"
                @click="showCreateCompanyDialog = true"
              >
                <q-icon
                  name="rocket_launch"
                  size="16px"
                  class="q-mr-xs rocket-icon"
                />
                <span>Mi Empresa</span>

                <q-tooltip class="bg-grey-9">
                  Crea tu empresa y comienza gratis
                </q-tooltip>
              </q-btn>
            </div>
          </transition>
          <!-- Botón de Tour (Visible en Desktop y Tablet) -->
          <q-btn
            v-if="currentPageHasTour && !$q.screen.xs"
            flat
            dense
            icon="help_outline"
            round
            @click="activateCurrentPageTour"
            class="tour-btn-navbar"
          >
            <q-tooltip>Ver tutorial de esta página</q-tooltip>
          </q-btn>
          <q-btn
            v-if="showRenewButton"
            flat
            dense
            round
            @click="showSubscriptionDialog = true"
            :class="['renew-subscription-btn', renewButtonClass]"
          >
            <q-icon name="warning" size="20px" />
            <q-badge
              v-if="subscriptionDaysLeft !== null"
              floating
              color="red"
              :label="subscriptionDaysLeft"
            />
            <q-tooltip>
              {{ renewButtonTooltip }}
            </q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            icon="cast_connected"
            round
            @click="screen"
            v-if="hasMultipleScreens && $q.platform.is.nativeMobile && !$q.screen.xs"
          >
            <q-tooltip>Segunda pantalla</q-tooltip>
          </q-btn>

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
          <!-- Chat IA (Visible en Desktop y Tablet) -->
          <q-btn
            flat
            dense
            icon="smart_toy"
            round
            color="primary"
            @click="changeRoute('AiChat', 'Chat con IA')"
            v-if="userSession?.is_root && !$q.screen.xs"
            class="ai-chat-btn"
          >
            <q-tooltip>Chat con IA - Asistente Virtual</q-tooltip>
          </q-btn>
          <!-- Herramientas -->
          <q-btn flat dense icon="apps" round @click="loadIntegrations">
            <q-tooltip class="text-body2">
              Herramientas
            </q-tooltip>
            <q-popup-proxy class="tools-popup" ref="toolsPopup">
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

                  <!-- Chat IA (Solo Mobile XS) -->
                  <div
                    v-if="userSession?.is_root && $q.screen.xs"
                    class="tool-item"
                    :class="{ 'tool-active': $route.name === 'AiChat' }"
                    @click="changeRoute('AiChat', 'Chat con IA')"
                  >
                    <q-icon name="smart_toy" size="24px" color="primary" />
                    <span class="tool-label">Chat IA</span>
                  </div>

                  <!-- Tour de Página (Solo Mobile XS) -->
                  <div
                    v-if="currentPageHasTour && $q.screen.xs"
                    class="tool-item"
                    @click="activateCurrentPageTour"
                  >
                    <q-icon name="help_outline" size="24px" />
                    <span class="tool-label">Tutorial</span>
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

                  <!-- Otros Items Existentes -->
                  <div class="tool-item" @click="copyCatalog">
                    <q-icon name="share" size="24px" />
                    <span class="tool-label">Compartir</span>
                  </div>

                  <!-- Segunda Pantalla (Solo Mobile XS) -->
                  <div
                    v-if="hasMultipleScreens && $q.platform.is.nativeMobile && $q.screen.xs"
                    class="tool-item"
                    @click="screen"
                  >
                    <q-icon name="cast_connected" size="24px" />
                    <span class="tool-label">Segunda Pantalla</span>
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
                    href="https://pub-1ee8b00ceed2443c917a8188cf6ed6a4.r2.dev/apk/qbits.apk"
                    target="_blank"
                    class="tool-item tool-link"
                  >
                    <svg
                      height="24px"
                      viewBox="42.544 -.671 467.96 553.72"
                      width="24px"
                      fill="var(--q-primary)"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="m76.774 179.141c-9.529 0-17.614 3.323-24.26 9.969s-9.97 14.621-9.97 23.929v142.914c0 9.541 3.323 17.619 9.97 24.266 6.646 6.646 14.731 9.97 24.26 9.97 9.522 0 17.558-3.323 24.101-9.97 6.53-6.646 9.804-14.725 9.804-24.266v-142.914c0-9.309-3.323-17.283-9.97-23.929s-14.627-9.969-23.935-9.969zm275.198-128.294 23.598-43.532c1.549-2.882.998-5.092-1.658-6.646-2.883-1.34-5.098-.661-6.646 1.989l-23.928 43.88c-21.055-9.309-43.324-13.972-66.807-13.972-23.488 0-45.759 4.664-66.806 13.972l-23.929-43.88c-1.555-2.65-3.77-3.323-6.646-1.989-2.662 1.561-3.213 3.764-1.658 6.646l23.599 43.532c-23.929 12.203-42.987 29.198-57.167 51.022-14.18 21.836-21.273 45.698-21.273 71.628h307.426c0-25.924-7.094-49.787-21.273-71.628-14.181-21.824-33.129-38.819-56.832-51.022zm-136.433 63.318c-2.552 2.558-5.6 3.831-9.143 3.831-3.55 0-6.536-1.273-8.972-3.831-2.436-2.546-3.654-5.582-3.654-9.137 0-3.543 1.218-6.585 3.654-9.137 2.436-2.546 5.429-3.819 8.972-3.819s6.591 1.273 9.143 3.819c2.546 2.558 3.825 5.594 3.825 9.137-.007 3.549-1.285 6.591-3.825 9.137zm140.086 0c-2.441 2.558-5.434 3.831-8.971 3.831-3.551 0-6.598-1.273-9.145-3.831-2.551-2.546-3.824-5.582-3.824-9.137 0-3.543 1.273-6.585 3.824-9.137 2.547-2.546 5.594-3.819 9.145-3.819 3.543 0 6.529 1.273 8.971 3.819 2.438 2.558 3.654 5.594 3.654 9.137 0 3.549-1.217 6.591-3.654 9.137zm-231.654 292.639c0 10.202 3.543 18.838 10.63 25.925 7.093 7.087 15.729 10.63 25.924 10.63h24.596l.337 75.454c0 9.528 3.323 17.619 9.969 24.266s14.627 9.97 23.929 9.97c9.523 0 17.613-3.323 24.26-9.97s9.97-14.737 9.97-24.266v-75.447h45.864v75.447c0 9.528 3.322 17.619 9.969 24.266s14.73 9.97 24.26 9.97c9.523 0 17.613-3.323 24.26-9.97s9.969-14.737 9.969-24.266v-75.447h24.928c9.969 0 18.494-3.544 25.594-10.631 7.086-7.087 10.631-15.723 10.631-25.924v-221.361h-305.09zm352.304-227.663c-9.309 0-17.283 3.274-23.93 9.804-6.646 6.542-9.969 14.578-9.969 24.094v142.914c0 9.541 3.322 17.619 9.969 24.266s14.627 9.97 23.93 9.97c9.523 0 17.613-3.323 24.26-9.97s9.969-14.725 9.969-24.266v-142.914c0-9.517-3.322-17.552-9.969-24.094-6.647-6.53-14.737-9.804-24.26-9.804z"/>
                    </svg>
                    <span class="tool-label">Instalar App</span>
                  </a>
                </div>
                <div class="tools-section">
                  <div class="integrations-grid">
                    <!-- Skeleton loaders while loading -->
                    <template v-if="loadingIntegrations">
                      <div v-for="i in 4" :key="'skeleton-' + i" class="integration-item">
                        <q-skeleton type="circle" size="60px" />
                      </div>
                    </template>

                    <template v-else>
                      <div
                        v-for="integration in availableIntegrations"
                        :key="integration.id"
                        class="integration-item"
                        @click="openIntegrationDialog(integration)"
                        style="position: relative;"
                      >
                        <img
                          v-if="integration.icon_url"
                          :src="integration.icon_url"
                          :alt="integration.name"
                          class="integration-logo"
                        >
                        <div v-else class="integration-logo-placeholder">
                          <q-icon name="extension" size="32px" color="primary" />
                        </div>
                        <premium-badge
                          :show="subscriptionPlan.toLocaleLowerCase() === 'free'"
                          :size="15"
                          top="0px"
                          right="4px"
                          padding="4px"
                          tooltip-text="PREMIUM"
                        />
                        <q-tooltip>
                          {{ integration.name }}
                        </q-tooltip>
                      </div>
                    </template>
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
                      @click="showSubscriptionDialog = true"
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
      <ProPlanPromoBanner @open-subscription="showSubscriptionDialog = true" />
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
            v-for="(category_module, index) in filteredDataMenu"
            expand-separator
            :key="category_module.id"
            :icon="category_module.icon"
            :default-opened="index === 0"
            :label="category_module.name"
          >
            <div v-for="list in category_module.modules" :key="list.id">
              <q-item
                v-if="
                  validateRole(list.roles) &&
                  validateBusinessType(list) &&
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

    <q-page-container :class="{ 'with-bottom-nav': $q.screen.lt.md && !$route.meta.hideBottomNav }">
      <router-view />
    </q-page-container>

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

    <!-- Dynamic Integration Dialog -->
    <integration-dynamic
      v-model="showIntegrationDialog"
      :key="selectedIntegrationSlug"
      :integration-slug="selectedIntegrationSlug"
      :download="download"
      @connect="handleIntegrationConnect"
      @generate="handleIntegrationGenerate"
    />

    <subscription-expiration-banner
      :is-demo="isDemo"
      @open-subscription-dialog="showSubscriptionDialog = true"
      @banner-dismissed="handleBannerDismissed"
    />

    <subscription-plans-dialog
      v-if="showSubscriptionDialog"
      v-model="showSubscriptionDialog"
      :show-contact-option="false"
      @subscription-updated="onSubscriptionUpdated"
      @open-register="showCreateCompanyDialog = true"
    />

    <!-- Register Dialog -->
    <register-dialog
      v-model="showCreateCompanyDialog"
      @success="handleRegisterSuccess"
      @google-success="handleGoogleRegisterSuccess"
    />

    <!-- Company Setup Modal -->
    <company-setup-modal
      v-model="showCompanySetup"
      :user-email="companySetupEmail"
      @success="handleCompanySetupSuccess"
    />

    <!-- OTP Verification Dialog -->
    <otp-verification-dialog
      v-model="showOtpVerification"
      :email="otpIdentifier"
      :session-token="otpSessionToken"
      :purpose="'verify_email'"
      :show-back-link="true"
      @verified="handleOtpVerified"
      @back="showOtpVerification = false; showCreateCompanyDialog = true"
    />

    <bottom-nav v-if="!$route.meta.hideBottomNav" :data-menu="dataMenu" />

    <q-inner-loading :showing="visibleLoading">
      <q-spinner-gears size="100px" color="primary" />
    </q-inner-loading>

    <!-- Botón Crear Mi Empresa (Solo Mobile - Fuera del Header para evitar bugs de posicionamiento) -->
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div
        v-if="store.isDemo && $q.screen.xs"
        class="float-create-btn-mobile"
      >
        <div v-if="showDemoMessage" class="demo-info-message">
          Crea tu empresa y comienza gratis
        </div>
        <q-btn
          outline
          dense
          class="create-btn-v0"
          @click="showCreateCompanyDialog = true"
        >
          <q-icon
            name="rocket_launch"
            size="16px"
            class="rocket-icon"
          />
        </q-btn>
      </div>
    </transition>
  </q-layout>
</template>

<script>
import { api, apiArca } from 'src/boot/axios'
import NotificationComponent from 'src/components/NotificationComponent.vue'
import FloatingThemeSelector from 'src/components/ThemeSelector/FloatingThemeSelector.vue'
import SubscriptionPlansDialog from 'src/components/SubscriptionPlansDialog.vue'
import SubscriptionExpirationBanner from 'src/components/SubscriptionExpirationBanner.vue'
import RegisterDialog from 'src/components/Auth/RegisterDialog.vue'
import OtpVerificationDialog from 'src/components/Auth/OtpVerificationDialog.vue'
import CompanySetupModal from 'src/components/Register/CompanySetupModal.vue'
import PremiumBadge from 'src/components/PremiumBadge.vue'
import IntegrationDynamic from 'src/components/Integrations/IntegrationDynamic.vue'
import { authentication } from 'src/stores/module-authentication'
import { mapState, mapActions } from 'pinia'
import { logo, notify, loading } from 'src/const/mixins'
import eventBus from 'src/utils/eventBus'
import { darkModeStore } from '../stores/darkModeStore'
import { MultiDisplayManager } from 'multi-display-manager'
import { copyToClipboard } from 'quasar'
import { useRouter } from 'vue-router'
import BottomNav from 'src/components/Navigation/BottomNav.vue'
import { useTourStore } from 'src/stores/tourStore.js'

import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner'
import { useDemoPersuasion } from 'src/composables/useDemoPersuasion'
import ProPlanPromoBanner from 'src/components/ProPlanPromoBanner.vue'

export default {
  name: 'MainLayout',
  components: {
    NotificationComponent,
    FloatingThemeSelector,
    SubscriptionPlansDialog,
    SubscriptionExpirationBanner,
    RegisterDialog,
    OtpVerificationDialog,
    CompanySetupModal,
    PremiumBadge,
    IntegrationDynamic,
    BottomNav,
    ProPlanPromoBanner
  },
  data () {
    return {
      logo,
      branchOffices: [],
      role: null,
      notify,
      cuit: '',
      password: '',
      download: null,
      loadingIntegrations: false,
      availableIntegrations: [],
      showIntegrationDialog: false,
      selectedIntegrationSlug: null,
      numberOfNotifications: [],
      notifications: [],
      labelDrown: null,
      dataMenu: [],
      active: true,
      menuSearch: '',
      showSearchInput: false,
      visibleLoading: false,
      titleApp: null,
      menuRoute: '',
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
       * Show OTP verification dialog
       * @type {Boolean}
       */
      showOtpVerification: false,
      /**
       * OTP identifier (email or phone)
       * @type {String}
       */
      otpIdentifier: '',
      /**
       * OTP session token
       * @type {String}
       */
      otpSessionToken: '',
      /**
       * Show company setup modal
       * @type {Boolean}
       */
      showCompanySetup: false,
      /**
       * Company setup email
       * @type {String}
       */
      companySetupEmail: '',
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
      showDemoMessage: false,
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
      demoReminderInterval: null,
      /**
       * Subscription renewal button state
       * @type {Boolean}
       */
      showRenewButton: false
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
      'token_type',
      'mustSelectPlan'
    ]),
    ...mapState(useTourStore, {
      tourActive: 'isActive'
    }),
    ...mapState(darkModeStore, ['darkMode']),
    /**
     * Hide header if current route has hideHeader: true in meta
     * @returns {Boolean}
     */
    hideMainHeader () {
      return !!this.$route.meta?.hideHeader
    },
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
      return this.$route?.name === 'Welcome'
    },
    /**
     * Renewal button class based on days left
     * @returns {String}
     */
    renewButtonClass () {
      if (this.subscriptionDaysLeft === null) return ''
      if (this.subscriptionDaysLeft <= 2) return 'renew-critical'
      if (this.subscriptionDaysLeft <= 5) return 'renew-warning'
      return 'renew-info'
    },
    /**
     * Renewal button tooltip
     * @returns {String}
     */
    renewButtonTooltip () {
      if (this.subscriptionDaysLeft === null) return 'Renovar suscripción'
      if (this.subscriptionDaysLeft === 0) return '¡Tu suscripción vence hoy! Haz clic para renovar'
      if (this.subscriptionDaysLeft === 1) return '¡Tu suscripción vence mañana! Haz clic para renovar'
      return `Tu suscripción vence en ${this.subscriptionDaysLeft} días. Haz clic para renovar`
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
              return this.validateRole(module.roles) && this.validateBusinessType(module)
            }).length > 0
          )
        })
      }
    },
    $route (to, from) {
      this.loadingTasks()
    },
    mustSelectPlan: {
      handler (val) {
        if (val) {
          this.showSubscriptionDialog = true
        } else {
          this.showSubscriptionDialog = false
        }
      },
      immediate: true
    },
    /**
     * Bypass DemoPersuasionModal and show SubscriptionPlansDialog directly
     */
    showDemoModal (val) {
      if (val) {
        this.showDemoModal = false
        this.showSubscriptionDialog = true
      }
    }
  },
  setup () {
    const router = useRouter()
    const { showDemoModal, trackDemoAction } = useDemoPersuasion()

    return {
      router,
      showDemoModal,
      trackDemoAction
    }
  },

  mounted () {
    this.$echo
      .private('App.Models.User.' + this.userSession.id)
      .notification((notification) => {
        this.setNotification(notification)
      })

    this.$echo.private(`support.user.${this.userSession.id}`)
      .listen('.message.sent', (data) => {
        this.handleGlobalSupportMessage(data)
      })

    // Listen for subscription updates
    window.addEventListener('subscription-updated', () => {
      this.loadSubscriptionInfo()
    })

    // Listen for global keyboard shortcuts
    window.addEventListener('keydown', this.handleGlobalKeyDown)

    eventBus.on('open-create-company', () => {
      this.showCreateCompanyDialog = true
    })

    eventBus.on('open-subscription-dialog', () => {
      this.showSubscriptionDialog = true
    })

    eventBus.on('toggle-left-drawer', () => {
      this.leftDrawerOpen = !this.leftDrawerOpen
    })

    if (this.store.isDemo) {
      this.showDemoMessage = true
      setTimeout(() => {
        this.showDemoMessage = false
      }, 3000)
    }

    this.startDemoReminder()

    if (localStorage.getItem('pending_plan_subscription')) {
      this.showSubscriptionDialog = true
    }

    // Check for plans query parameter to show subscription dialog
    if (this.$route.query.plans === 'true') {
      this.showSubscriptionDialog = true
      // Clean the URL by removing the query parameter
      this.$router.replace({ query: { ...this.$route.query, plans: undefined } })
    }

    // Listener global de clicks con silenciador inteligente
    document.addEventListener('click', this.handleGlobalClick)
  },
  beforeUnmount () {
    this.stopDemoReminder()
    document.removeEventListener('click', this.handleGlobalClick)
  },
  unmounted () {
    window.removeEventListener('keydown', this.handleGlobalKeyDown)
    eventBus.off('open-create-company')
    eventBus.off('open-subscription-dialog')
    eventBus.off('toggle-left-drawer')
  },
  created () {
    this.loadingPage()
    this.checkMultipleScreens()
    this.loadSubscriptionInfo()
  },
  methods: {
    /**
     * Smart click tracker with contextual silencing
     */
    handleGlobalClick (event) {
      // 1. SILENCIO POR DIÁLOGOS ABIERTOS (Contexto de conversión)
      if (
        this.showSubscriptionDialog ||
        this.showCreateCompanyDialog ||
        this.showCompanySetup ||
        this.showOtpVerification ||
        this.showDemoModal
      ) return

      // 2. SILENCIO POR RUTAS CRÍTICAS
      const silentRoutes = ['Register', 'Welcome', 'SubscriptionSuccess', 'SubscriptionFailure', 'SubscriptionPending']
      if (silentRoutes.includes(this.$route.name)) return

      // 3. SILENCIO ESTRUCTURAL (Navbar y Herramientas)
      if (
        event.target.closest('.modern-header') ||
        event.target.closest('.tools-popup')
      ) return

      // 4. SILENCIO POR HEURÍSTICA DE ICONOS (Clicks en sistema)
      const systemIcons = ['close', 'help', 'info', 'help_outline', 'arrow_back']
      const clickedIcon = event.target.innerText?.trim().toLowerCase()
      if (systemIcons.includes(clickedIcon)) return

      // Si pasa los filtros, registramos la acción
      this.trackDemoAction()
    },
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
      // Cerrar el modal de herramientas si está abierto
      if (this.$refs.toolsPopup) {
        this.$refs.toolsPopup.hide()
      }
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
     * Handle register success
     */
    async handleRegisterSuccess (data) {
      try {
        this.showCreateCompanyDialog = false

        await this.store.setSessionData(data)

        this.companySetupEmail = data.user_email || data.user?.email
        this.otpIdentifier = data.user_email || data.user?.email
        this.otpSessionToken = data.session_token || ''

        await new Promise(resolve => setTimeout(resolve, 300))

        this.showOtpVerification = true

        notify('Código de verificación enviado a tu correo', 'positive', 'mail')
      } catch (error) {
        console.error('Error al procesar registro:', error)
        notify('Error al procesar el registro', 'negative', 'warning')
      }
    },
    /**
     * Handle Google register success
     */
    async handleGoogleRegisterSuccess (data) {
      try {
        // Cerrar el diálogo de registro primero
        this.showCreateCompanyDialog = false

        // Esperar a que el diálogo se cierre completamente
        await this.$nextTick()

        // Iniciar sesión automáticamente con los datos del usuario
        await this.store.setSessionData(data.user)

        // Guardar el email para el setup de la empresa
        this.companySetupEmail = data.userInfo?.email || data.user.email

        // Pequeña pausa antes de mostrar el siguiente modal
        await new Promise(resolve => setTimeout(resolve, 300))

        // Mostrar el modal de configuración de empresa
        this.showCompanySetup = true

        notify('Registro exitoso con Google. Configura tu empresa', 'positive', 'check_circle')
      } catch (error) {
        console.error('Error al procesar registro con Google:', error)
        notify('Error al procesar el registro', 'negative', 'warning')
      }
    },
    /**
     * Handle Google register error
     */
    handleGoogleRegisterError (error) {
      console.error('Error en registro con Google:', error)
    },
    /**
     * Handle OTP verified
     */
    async handleOtpVerified () {
      try {
        this.showOtpVerification = false

        this.showCompanySetup = true

        notify('Correo verificado. Ahora crea tu empresa', 'positive', 'check_circle')
      } catch (error) {
        console.error('Error al procesar verificación OTP:', error)
        notify('Error al procesar la verificación', 'negative', 'warning')
      }
    },
    /**
     * Handle company setup success
     */
    async handleCompanySetupSuccess (data) {
      try {
        this.showCompanySetup = false

        // El backend devuelve { user, company, branch_office, ... }
        if (data?.user) {
          Object.assign(this.store.userSession, data.user)
          this.store.isDemo = false

          // Actualizar branch office si viene
          if (data.branch_office) {
            this.store.branchOffice = data.branch_office
          }

          // Esperar a que Pinia persista los cambios
          await this.$nextTick()
        }

        notify('¡Empresa configurada exitosamente! 🎉', 'positive', 'check_circle')
        this.$router.push('/')
      } catch (error) {
        console.error('Error al procesar configuración de empresa:', error)
        notify('Error al procesar la configuración', 'negative', 'warning')
      }
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

        this.$router.push('/')
      } catch (error) {
        const message = error.response?.data?.message || 'Error al crear empresa'
        notify(message, 'negative', 'warning')
        console.error('Error creating company:', error)
      } finally {
        this.loadingCreateCompany = false
      }
    },
    /**
     * Process pending subscription from localStorage
     */
    async processPendingSubscription () {
      const pendingPlan = localStorage.getItem('pending_plan_subscription')
      if (pendingPlan) {
        try {
          const { planId, branchCount } = JSON.parse(pendingPlan)
          localStorage.removeItem('pending_plan_subscription')

          loading(true)
          notify('Procesando tu suscripción...', 'info', 'hourglass_empty')

          // Crear link de pago
          const response = await api.post('mercadopago/create-payment', {
            subscription_plan_id: planId,
            branch_offices_count: branchCount || 1,
            months: 1
          })

          if (response.data && response.data.init_point) {
            window.location.href = response.data.init_point
            return true
          }
        } catch (error) {
          console.error('Error processing pending subscription:', error)
          notify('Error al procesar la suscripción pendiente', 'negative', 'warning')
        } finally {
          loading(false)
        }
      }
      return false
    },
    /**
     * Load subscription information
     */
    async loadSubscriptionInfo () {
      await this.store.loadSubscriptionInfo()
      await this.loadBranchCount()
    },
    /**
     * Handle banner dismissed event
     */
    handleBannerDismissed (data) {
      if (!this.isDemo && data.daysLeft !== null && data.daysLeft <= 7 && data.daysLeft >= 0) {
        this.showRenewButton = true
      }
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
      console.log(data, id)
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.getDataNotification()
          if (data?.invoice_id) {
            const notification = createNotification(this.$t(`command.${data.name}`), {
              body: data.description,
              icon: '/icons/icon-128x128.png'
            }, false)
            notification.onclick = () => {
              window.open(`${window.location.origin}/command-orders/?id=${data.invoice_id}`, '_blank')
            }
          }

          if (data?.error_type) {
            const notification = createNotification(this.$t(`command.${data?.error_type?.toLowerCase()}`), {
              body: data.description,
              icon: '/icons/icon-128x128.png'
            }, data?.error_type === 'SUPPORT_MESSAGE')
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
    /**
     * Maneja un mensaje de soporte entrante globalmente
     * @param {Object} data data del evento
     */
    handleGlobalSupportMessage (data) {
      // Si el mensaje es mío, no notificar
      if (data.message.sender_id === this.userSession.id) return

      // Actualizar la campanita
      this.getDataNotification()

      this.setNotification({
        data: {
          error_type: 'SUPPORT_MESSAGE',
          description: `${data.message.sender_name}: ${data.message.content}`,
          name: 'SUPPORT_MESSAGE'
        },
        id: data.chat_id
      })
    },
    async getDataNotification () {
      try {
        const { data } = await api.get('notifications', {
          params: { unread: true }
        })
        this.numberOfNotifications = data.data
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
    /**
     * Verificar acceso a API desde el backend (no confiar en localStorage)
     */
    async verifyApiAccess () {
      try {
        loading(true)
        // Llamar al backend para verificar la suscripción actual
        const { data } = await this.$api.get('subscriptions/current')
        // Actualizar el store con datos verificados del backend
        if (data.subscription) {
          this.store.currentSubscription = data.subscription
          this.store.subscriptionPlan = data.subscription.plan?.slug
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
      } finally {
        loading(false)
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
    async generateCertificate (credentials) {
      try {
        loading(true,
          {
            message: 'Generando certificado, esto puede tardar unos minutos ...',
            backgroundColor: 'cyan-10',
            customClass: 'text-subtitle1 text-center'
          }
        )
        const { data } = await apiArca.post('metadata/generate-cert', {
          cuit: credentials.cuit,
          password: credentials.password,
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
        notify('Certificado generado exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify(error?.response.data?.message || error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Load available integrations
     */
    async loadIntegrations () {
      if (this.availableIntegrations.length > 0) {
        return
      }

      this.loadingIntegrations = true
      try {
        const { data } = await api.get('company-integrations/available')
        this.availableIntegrations = data
      } catch (error) {
        console.error('Error loading integrations:', error)
        notify('Error al cargar integraciones', 'negative', 'warning')
      } finally {
        this.loadingIntegrations = false
      }
    },
    /**
     * Open integration dialog
     */
    async openIntegrationDialog (integration) {
      const hasApiAccess = await this.verifyApiAccess()

      if (!hasApiAccess) {
        notify('Tu plan actual no incluye acceso a integraciones. Actualiza tu plan.', 'warning', 'upgrade')
        this.showSubscriptionDialog = true
        return
      }

      this.selectedIntegrationSlug = integration.slug

      setTimeout(() => {
        this.showIntegrationDialog = true
      }, 100)
    },
    /**
     * Handle integration connection (generic)
     */
    async handleIntegrationConnect (credentials) {
      try {
        loading(true, {
          message: 'Guardando configuración...',
          backgroundColor: 'primary',
          customClass: 'text-subtitle1 text-center'
        })

        // Find the integration to get its ID
        const integration = this.availableIntegrations.find(
          i => i.slug === this.selectedIntegrationSlug
        )

        if (!integration) {
          throw new Error('Integración no encontrada')
        }

        // Save or update company integration
        await api.post('company-integrations', {
          integration_id: integration.id,
          credentials
        })

        notify('Configuración guardada exitosamente', 'positive', 'check_circle')
        this.showIntegrationDialog = false
      } catch (error) {
        notify(
          error?.response?.data?.message || 'Error al guardar configuración',
          'negative',
          'warning'
        )
      } finally {
        loading(false)
      }
    },
    /**
     * Handle integration generate (for special cases like ARCA)
     */
    async handleIntegrationGenerate (credentials) {
      if (this.selectedIntegrationSlug === 'arca') {
        await this.generateCertificate(credentials)
      } else {
        await this.handleIntegrationConnect(credentials)
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
        if (!this.branchOffice && data && data.length > 0) {
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
     * @param {Object} module - Module to validate
     * @returns {Boolean}
     */
    validateBusinessType (module) {
      const businessTypeModules = this.userSession?.company_session?.business_type?.modules || []

      // First check if module is hidden by plan restrictions
      if (!this.validatePlan(module)) return false

      if (this.userSession?.is_root) return true

      if (businessTypeModules.length === 0) return true

      if (businessTypeModules.length > 0 && module) {
        return businessTypeModules.some((businessModule) => businessModule.id === module.id)
      }

      return false
    },

    /**
     * Validate if module is allowed based on subscription plan
     * @param {Object} module - Module to validate
     * @returns {Boolean} - true if module is allowed, false if should be hidden
     */
    validatePlan (module) {
      // Root users can see all modules
      if (this.userSession?.is_root) return true

      // Modules restricted for free plan and demo companies
      const premiumModules = [
        'SalesInventoryReport',
        'ProductKardex',
        'TransferProduct',
        'Promotions',
        'BranchOffice',
        'Integrations',
        'Company',
        'Cashbox',
        'Seller',
        'Client',
        'DeliveryPerson'
      ]

      // Check if company is demo or plan is free
      const isDemo = this.store.isDemo
      const isFree = this.currentSubscription?.plan && this.currentSubscription?.plan?.slug === 'free'

      // If demo or free plan, hide premium modules
      if (isDemo || isFree) {
        // Check if the module link matches any restricted module
        if (module?.link && premiumModules.includes(module.link)) {
          return false
        }
      }

      return true
    },
    /**
     * Logout application
     */
    async logoutAt () {
      try {
        loading(true)
        await this.logout()
        this.$router.push({ name: 'Login' })
      } catch (error) {
        console.log(error)
      } finally {
        loading(false)
      }
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
        const isConfigured = this.userSession?.company_session?.company_config?.other?.configured

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

          if (this.onboardingProgress === 100) {
            try {
              const { data } = await api.post('/companies/mark-configured')
              console.log(data)
              this.setCompanySession({
                ...this.userSession.company_session,
                company_config: data.data
              })
            } catch (error) {
              console.error('Error marking company as configured:', error)
            }
          }
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
      this.menuRoute = data
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
      if (!this.isDemo || this.userSession?.is_root) {
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

/* Support Indicator (Replaces Branch Office) */
.support-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.support-btn-header {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  height: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.support-btn-header > * {
  gap: 0.25rem;
}

.support-btn-header:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.support-btn-header:active {
  transform: translateY(0) scale(0.98);
}

/* Responsive adjustments for support button */
@media (max-width: 390px) {
  .support-btn-header span {
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

/* Floating Create Button Mobile */
.float-create-btn-mobile {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Demo Info Message */
.demo-info-message {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%);
  color: white;
  padding: 10px 18px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, fadeOutMessage 0.4s ease-in 2.6s forwards;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes fadeOutMessage {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.float-create-btn-mobile .create-btn-v0 {
  background: linear-gradient(135deg, var(--q-primary) 0%, #667eea 100%) !important;
  color: white !important;
  width: 52px;
  height: 52px;
  border-radius: 50% !important;
  box-shadow: 0 6px 20px rgba(var(--q-primary-rgb), 0.5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.float-create-btn-mobile .create-btn-v0:active {
  transform: scale(0.9);
}

.float-create-btn-mobile .create-btn-v0 .q-icon {
  font-size: 26px !important;
}

/* Pantallas muy pequeñas */
@media (max-width: 360px) {
  .float-create-btn-mobile {
    right: 16px;
    bottom: 74px;
    gap: 8px;
  }

  .float-create-btn-mobile .create-btn-v0 {
    width: 44px;
    height: 44px;
  }

  .float-create-btn-mobile .create-btn-v0 .q-icon {
    font-size: 22px !important;
  }

  .demo-info-message {
    padding: 8px 14px;
    font-size: 12px;
  }
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

.integration-logo-placeholder {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--q-primary-rgb), 0.1);
  border-radius: 50%;
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

/* Renew Subscription Button in Navbar */
.renew-subscription-btn {
  position: relative;
  animation: pulse-glow 2s ease-in-out infinite;

  &.renew-info {
    color: #3b82f6;
  }

  &.renew-warning {
    color: #f59e0b;
  }

  &.renew-critical {
    color: #ef4444;
    animation: pulse-urgent 1s ease-in-out infinite;
  }

  &:hover {
    transform: scale(1.1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes pulse-urgent {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

body.body--dark .renew-subscription-btn {
  &.renew-info {
    color: #60a5fa;
  }

  &.renew-warning {
    color: #fbbf24;
  }

  &.renew-critical {
    color: #f87171;
  }
}

/* Bottom Navigation Support */
.with-bottom-nav {
  padding-bottom: 64px !important;
}

@supports (padding: max(0px)) {
  .with-bottom-nav {
    padding-bottom: max(64px, env(safe-area-inset-bottom)) !important;
  }
}

</style>
