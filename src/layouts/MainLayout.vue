<template>
  <q-layout view="hHh Lpr lff" class="shadow-2 rounded-borders q-pa-safe">
    <q-header elevated>
      <q-toolbar class="bg-primary">
        <q-btn
          flat
          dense
          round
          class="q-mr-sm"
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
        <q-btn
          flat
          dense
          icon="cast_connected"
          round
          class="q-mr-sm"
          @click="screen"
          v-if="$q.platform.is.nativeMobile"
        />
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
                  href="https://pub-1ee8b00ceed2443c917a8188cf6ed6a4.r2.dev/apk/main.exe"
                  target="_blank"
                  type="a"
                />
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
          icon="person"
          aria-label="person"
          class="q-ml-sm"
        >
          <q-menu>
            <q-list>
              <q-item
                v-ripple
                v-close-popup
                clickable
                dense
                @click="changeRoute('Profile', 'Perfil')"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <q-icon name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  {{ ucwords(`${userSession.name}`) }}
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable dense>
                <q-item-section avatar>
                  <q-avatar icon="email" />
                </q-item-section>
                <q-item-section>
                  {{ userSession.email }}
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable dense>
                <q-item-section avatar>
                  <q-avatar icon="badge" />
                </q-item-section>
                <q-item-section>
                  {{ userSession.is_root ? 'Root' : userSession?.roles[0]?.name }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-btn
                    v-close-popup
                    color="negative"
                    label="Cerrar Sesión"
                    push
                    size="sm"
                    @click="logoutAt"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      show-if-above
      class="q-pa-none relative"
      :style="
          !$q.screen.lt.md
            ? 'max-height: calc(100vh - 94px);'
            : 'max-height: calc(100vh - 46px);'
        "
    >
      <div v-if="$q.screen.lt.md" class="flex flex-center bg-primary q-py-sm">
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
        class="bg-primary text-white flex flex-center q-gutter-sm q-mt-xs q-pb-sm absolute-bottom"
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
        <q-card-section class="bg-primary flex justify-center items-center">
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
    <q-page-container style="padding-bottom: env(safe-area-inset-bottom);">
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
import { authentication } from 'src/stores/module-authentication'
import { mapState, mapActions } from 'pinia'
import { logo, notify, loading } from 'src/const/mixins'
import { darkModeStore } from '../stores/darkModeStore'
import { MultiDisplayManager } from 'multi-display-manager'
import { printer } from 'src/utils/printer'
import { copyToClipboard } from 'quasar'
export default {
  name: 'MainLayout',
  components: { NotificationComponent },
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
      titleMenu: 'Opciones'
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
  },
  methods: {
    async screen () {
      try {
        loading(true)
        const url = `${import.meta.env.VITE_APP_URL}/#/verifying/${this.access_token}/${this.expires_In}/${this.token_type}/InvoiceDetails`
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
    setNotification ({ data }) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.getDataNotification()
          const notification = createNotification(this.$t(`command.${data.name}`), {
            body: data.description,
            icon: '/icons/icon-128x128.png'
          })

          notification.onclick = () => {
            window.open(`${window.location.origin}/#/command-orders/?id=${data.invoice_id}`, '_blank')
          }

          function createNotification (title, options) {
            notify('Hay una nueva comanda', 'primary', 'notifications', 'bottom-right')
            const audio = new Audio('audios/notify.mp3')
            audio.play()
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
      copyToClipboard(`${window.location.origin}/#/catalog/${this.userSession.company_session_id}/${this.branchOffice?.id}`)
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
