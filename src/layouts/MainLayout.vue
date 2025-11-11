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
        <q-btn
          flat
          dense
          round
          class="q-mr-sm menu-btn"
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-separator dark vertical inset />

        <div v-if="!$q.screen.lt.sm" class="flex q-ml-md full-width">
          <q-img
            :src="userSession?.company_session?.url || logo.white"
            width="155px"
            style="max-height: 40px"
            alt="logo"
            fit="contain"
          >
            <q-tooltip :offset="[10, 10]" class="text-body2">
              {{ userSession?.company_session?.name }}
            </q-tooltip>
          </q-img>
        </div>
        <q-space />
        <!-- Botón de segunda pantalla (solo si hay 2 pantallas) -->
        <q-btn
          flat
          dense
          icon="cast_connected"
          round
          class="q-mr-sm"
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
          class="q-mr-sm"
          v-if="$q.platform.is.nativeMobile"
          @click="openQrScanner"
        >
          <q-tooltip>Escanear QR</q-tooltip>
        </q-btn>
        <q-btn flat dense icon="apps" round class="q-mr-sm">
          <q-tooltip class="text-body2">
            Herramientas
          </q-tooltip>
          <q-popup-proxy>
            <q-banner>
              <div class="full-width text-center q-mb-xs">
                <span class="text-subtitle2">
                  Herramientas
                </span>
              </div>
              <q-separator />
              <div class="q-mt-sm">
                <q-btn
                  icon="sync_alt"
                  round
                  flat
                  :color="$route.name === 'ChangeCompany' ? 'secondary' : ''"
                  @click="changeRoute('ChangeCompany', 'Cambio de empresa')"
                >
                  <q-tooltip> Cambio de empresa </q-tooltip>
                </q-btn>
                <q-btn
                  icon="store"
                  round
                  flat
                >
                  <q-tooltip>
                    {{ branchOffice?.name }}
                  </q-tooltip>
                  <q-menu>
                    <q-list>
                      <q-item
                        clickable
                        v-ripple
                        v-for="bo in branchOffices"
                        :key="bo.id"
                        :active="bo.id === branchOffice?.id"
                        @click="changeBranchOffice(bo)"
                      >
                        <q-item-section thumbnail class="q-pa-sm">
                          <q-icon name="store" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>
                            {{ bo.name }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
                <q-btn
                  flat
                  round
                  :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
                  aria-label="dark_mode"
                  @click="setTheme"
                >
                  <q-tooltip :offset="[10, 10]">
                    {{ $q.dark.isActive ? "Modo claro" : "Modo oscuro" }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  icon="share"
                  round
                  flat
                  @click="copyCatalog"
                >
                  <q-tooltip>
                    Copiar link
                  </q-tooltip>
                </q-btn>
                <q-btn
                  icon="update"
                  flat
                  round
                  @click="update"
                />
                <q-btn
                  icon="cable"
                  flat
                  round
                  @click="openDialogArca"
                >
                  <q-tooltip>
                    Conectar con el ARCA
                  </q-tooltip>
                </q-btn>
                <q-btn
                  icon="play_circle"
                  round
                  flat
                  :color="$route.name === 'Tutorial' ? 'secondary' : ''"
                  @click="changeRoute('Tutorial', 'Tutoriales')"
                >
                  <q-tooltip>
                    Tutoriales
                  </q-tooltip>
                </q-btn>
                <q-btn
                  round
                  flat
                  icon="print"
                  href="https://pub-1ee8b00ceed2443c917a8188cf6ed6a4.r2.dev/apk/printer_ui_win_0.19.zip"
                  target="_blank"
                  type="a"
                />
                <q-btn
                  round
                  flat
                  icon="android"
                  href="https://pub-1ee8b00ceed2443c917a8188cf6ed6a4.r2.dev/apk/orderwise.apk"
                  target="_blank"
                  type="a"
                >
                  <q-tooltip class="text-body2">
                    Actualizar app
                  </q-tooltip>
                </q-btn>
              </div>
            </q-banner>
          </q-popup-proxy>
        </q-btn>
        <q-btn dense flat round icon="notifications" color="white" class="q-mr-sm">
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
        <q-separator dark vertical inset />
        <q-btn
          v-if="userSession"
          flat
          dense
          round
          class="q-ml-sm profile-btn"
        >
          <q-avatar size="36px" class="profile-avatar">
            <img v-if="userSession.avatar" :src="userSession.avatar" alt="Profile" />
            <q-icon v-else name="person" size="24px" />
          </q-avatar>
          <q-menu class="profile-menu" transition-show="jump-down" transition-hide="jump-up">
            <q-card class="profile-card" flat bordered>
              <!-- Profile Header -->
              <q-card-section class="profile-header">
                <div class="profile-header-content">
                  <q-avatar size="64px" class="profile-avatar-large">
                    <img v-if="userSession.avatar" :src="userSession.avatar" alt="Profile" />
                    <q-icon v-else name="person" size="36px" />
                  </q-avatar>
                  <div class="profile-info">
                    <div class="profile-name">{{ ucwords(`${userSession.name}`) }}</div>
                    <div class="profile-email">{{ userSession.email }}</div>
                    <q-chip size="sm" class="profile-role" dense>
                      <q-icon name="badge" size="14px" class="q-mr-xs" />
                      {{ userSession.is_root ? 'Root' : userSession?.roles[0]?.name }}
                    </q-chip>
                  </div>
                </div>
              </q-card-section>

              <!-- Profile Actions -->
              <q-card-section class="profile-actions">
                <q-list>
                  <q-item
                    v-ripple
                    clickable
                    class="profile-action-item"
                    @click="changeRoute('Profile', 'Perfil')"
                    v-close-popup
                  >
                    <q-item-section avatar>
                      <q-icon name="account_circle" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Mi Perfil</q-item-label>
                      <q-item-label caption>Ver y editar información</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-ripple
                    clickable
                    class="profile-action-item"
                    @click="setTheme"
                  >
                    <q-item-section avatar>
                      <q-icon :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $q.dark.isActive ? 'Modo Claro' : 'Modo Oscuro' }}</q-item-label>
                      <q-item-label caption>Cambiar tema de la aplicación</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>

              <!-- Logout Button -->
              <q-card-section class="profile-logout">
                <q-btn
                  unelevated
                  color="negative"
                  icon="logout"
                  label="Cerrar Sesión"
                  class="full-width logout-btn"
                  @click="logoutAt"
                  v-close-popup
                  no-caps
                />
              </q-card-section>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      show-if-above
      class="q-pa-none relative modern-drawer"
      :style="
          !$q.screen.lt.md
            ? 'max-height: calc(100vh - 94px);'
            : 'max-height: calc(100vh - 46px);'
        "
    >
      <div v-if="$q.screen.lt.md" class="flex flex-center modern-drawer-header q-py-sm">
        <img
          :src="userSession?.company_session?.url || logo.white"
          width="155px"
          style="max-height: 50px"
          alt="logo"
        />
        <q-tooltip :offset="[10, 10]">
          {{ userSession?.company_session?.name }}
        </q-tooltip>
      </div>
      <q-expansion-item
        v-for="category_module in dataMenu"
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
              list.name != 'home'
            "
            v-ripple
            clickable
            active-class="my-menu-link"
            :active="list.link === $route.name"
          >
            <q-item-section v-if="list.icon" avatar class="q-ml-sm">
              <q-icon :name="list.icon" />
            </q-item-section>
            <q-item-section @click="changeRoute(list.link, list.title)">
              <q-item-label>
                {{ list.title }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-expansion-item>
      <div
        class="modern-drawer-footer text-white flex flex-center q-gutter-sm q-mt-xs q-pb-sm absolute-bottom"
      >
        <span class="text-subtitle1"> Powered by </span>
        <q-img
          src="https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QBits/white.png"
          width="70px"
          alt="Qbits"
        />
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
    <q-inner-loading :showing="visibleLoading">
      <q-spinner-gears size="100px" color="primary" />
    </q-inner-loading>
  </q-layout>
</template>

<script>
import { api, apiArca } from 'src/boot/axios'
import NotificationComponent from 'src/components/NotificationComponent.vue'
import FloatingThemeSelector from 'src/components/ThemeSelector/FloatingThemeSelector.vue'
import { authentication } from 'src/stores/module-authentication'
import { mapState, mapActions } from 'pinia'
import { logo, notify, loading } from 'src/const/mixins'
import { darkModeStore } from '../stores/darkModeStore'
import { MultiDisplayManager } from 'multi-display-manager'
import { copyToClipboard } from 'quasar'
import { useThemeStore } from 'src/stores/themeStore'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner'
export default {
  name: 'MainLayout',
  components: { NotificationComponent, FloatingThemeSelector },
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
      scannedCode: ''
    }
  },
  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice', 'setBranchOffice', 'access_token', 'refresh_token', 'expires_In', 'token_type']),
    ...mapState(darkModeStore, ['darkMode'])
  },
  watch: {
    modules (value) {
      if (value.length > 0) {
        this.dataMenu = value.filter((element) => {
          return (
            element.modules.filter((module) => {
              return this.validateRole(module.roles)
            }).length > 0
          )
        })
      }
    }
  },
  mounted () {
    this.$echo
      .private('App.Models.User.' + this.userSession.id)
      .notification((notification) => {
        this.setNotification(notification)
      })
  },
  created () {
    this.loadingPage()
    this.getDataNotification()
    this.checkMultipleScreens()
  },
  methods: {
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
        const url = `${import.meta.env.VITE_APP_URL}/verifying/${this.access_token}/${this.expires_In}/${this.token_type}/InvoiceDetails`
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
      if (this.userSession?.company_session?.billing) {
        try {
          loading(true)
          const { data } = await this.$apiArca('companies', {
            params: {
              user: {
                name: this.userSession.name,
                email: this.userSession.email
              },
              document_number: this.userSession?.company_session?.document_number
            }
          })
          this.download = {
            certificate_url: data.certificate_url,
            key_url: data.key_url
          }
        } catch (error) {
          notify(error.message, 'negative', 'warning')
        } finally {
          loading(false)
        }
      }
      this.arcaDialog = true
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
          localStorage.setItem('sections', JSON.stringify(this.modules))
        })
        .catch((err) => {
          console.log(err)
          this.modules = JSON.parse(localStorage.getItem('sections'))
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
      // Inicializar tema
      this.initializeTheme()
      this.getAllModules()
      this.getDataNotification()
      this.getBrachOffice()
      this.cuit = this.userSession?.company_session?.document_number
    },
    /**
     * Inicializar sistema de temas
     */
    initializeTheme () {
      try {
        const themeStore = useThemeStore()
        console.log('🎨 Inicializando tema desde MainLayout...')
        themeStore.initTheme()

        const savedTheme = localStorage.getItem('app-theme')
        console.log('📦 Tema guardado en localStorage:', savedTheme)
        console.log('🎨 Tema actual del store:', themeStore.currentTheme)
      } catch (error) {
        console.error('❌ Error al inicializar tema:', error)
      }
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

/* Drawer Styles */
.modern-drawer-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  transition: background 0.3s ease;
}

.modern-drawer-footer {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  transition: background 0.3s ease;
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

.profile-menu {
  margin-top: 8px;
}

.profile-card {
  min-width: 320px;
  border-radius: 15px;
  overflow: hidden;
  border: none !important;
}

.body--dark .profile-card {
  background: #2d3748;
  border: none !important;
}

/* Profile Header */
.profile-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 20px;
  transition: background 0.3s ease;
}

.body--dark .profile-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  filter: brightness(0.85);
}

.profile-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar-large {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.profile-info {
  flex: 1;
  color: white;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.2;
}

.profile-email {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.profile-role {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 11px;
  font-weight: 600;
}

/* Profile Actions */
.profile-actions {
  padding: 8px 0;
  background: white;
}

.body--dark .profile-actions {
  background: #2d3748;
}

.profile-action-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.profile-action-item:hover {
  background: rgba(124, 58, 237, 0.08);
  transform: translateX(4px);
}

.body--dark .profile-action-item:hover {
  background: rgba(139, 92, 246, 0.15);
}

:deep(.profile-action-item .q-item__label) {
  font-weight: 500;
  font-size: 14px;
}

:deep(.profile-action-item .q-item__label--caption) {
  font-size: 12px;
  opacity: 0.7;
}

/* Logout Section */
.profile-logout {
  padding: 12px 16px;
  background: #f9fafb;
}

.body--dark .profile-logout {
  background: #1a202c;
}

.logout-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
</style>
