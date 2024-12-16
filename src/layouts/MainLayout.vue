<template>
  <q-layout view="hHh Lpr lff" class="shadow-2 rounded-borders">
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
        <div v-if="!$q.screen.lt.md" class="flex flex-center q-ml-md">
          <img
            :src="userSession?.organization_session?.photo_url || logo.white"
            width="155px"
            style="max-height: 60px"
            alt="logo"
          />
          <q-tooltip :offset="[10, 10]">
            {{ userSession?.organization_session?.name }}
          </q-tooltip>
        </div>
        <q-space />
        <q-btn
          icon="sync_alt"
          round
          flat
          :color="$route.name === 'ChangeCompany' ? 'secondary' : 'white'"
          @click="changeRoute('ChangeCompany', 'Cambio de empresa')"
        >
          <q-tooltip> Cambio de empresa </q-tooltip>
        </q-btn>
        <q-btn
          icon="store"
          round
          flat
        >
          <q-tooltip class="text-body2"> {{ branchOffice.name }} </q-tooltip>
          <q-popup-proxy>
            <q-list>
              <q-item
                clickable
                v-ripple
                v-for="bo in branchOffices"
                :key="bo.id"
                :active="bo.id === branchOffice.id"
                @click="setBranchOffice(bo)"
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
          </q-popup-proxy>
        </q-btn>
        <q-btn icon="update" flat color="white" round @click="update" />
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
        <q-btn
          flat
          dense
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          aria-label="dark_mode"
          class="q-mr-sm"
          @click="darkMode"
        >
          <q-tooltip :offset="[10, 10]">
            {{ $q.dark.isActive ? "Modo claro" : "Modo oscuro" }}
          </q-tooltip>
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
                  {{ userSession?.roles[0]?.name }}
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
          :src="userSession?.company_session?.logo"
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
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-inner-loading :showing="visibleLoading">
      <q-spinner-gears size="100px" color="primary" />
    </q-inner-loading>
    <q-dialog v-model="dialog" backdrop-filter="blur" persistent>
      <q-card>
        <q-card-section>
          <img
            src="image/aviso.png"
            alt="aviso"
            class="q-mb-md"
            style="max-width: 450px"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { LocalStorage } from 'quasar'
import { api } from 'src/boot/axios'
import NotificationComponent from 'src/components/NotificationComponent.vue'
import { authentication } from 'src/stores/module-authentication'
import { mapState, mapActions } from 'pinia'
import { logo, notify } from 'src/const/mixins'
export default {
  name: 'MainLayout',
  components: { NotificationComponent },
  data () {
    return {
      logo,
      dialog: false,
      branchOffices: [],
      role: null,
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
    ...mapState(authentication, ['userSession', 'branchOffice'])
  },
  watch: {
    modules (value) {
      if (value) {
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
    // this.$echo
    //   .private("App.Models.User." + this.userSession.id)
    //   .notification((notification) => {
    //     this.setNotification(notification);
    //   });
  },
  created () {
    this.getAllModules()
    // this.loadingPage()
    this.getDataNotification()
    this.getBrachOffice()
  },
  methods: {
    ucwords (data) {
      return data
    },
    /**
     * Update data
     */
    update () {
      window.location.reload(true)
    },
    // setNotification({ data }) {
    //   Notification.requestPermission().then((permission) => {
    //     if (permission === "granted") {
    //       this.getDataNotification();
    //       new Notification(
    //         `Orden ${data.ownerable_id} ${this.$t(
    //           `listOrderPayment.${data.name}`
    //         )}`,
    //         {
    //           body: data.description,
    //           icon: "/icons/icon-128x128.png",
    //         }
    //       );
    //     }
    //   });
    // },
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
    /**
     * Get all products
     */
    getAllModules () {
      this.$api
        .get('sections')
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
     * Get all branch offices
     */
    async getBrachOffice () {
      try {
        const params = {}
        if (!this.userSession.is_root) {
          params.dataFilter = {
            'users.id': this.userSession.id
          }
        }
        const { data } = await api.get('branch-offices', { params })
        this.branchOffices = data
        this.setBranchOffice(data[0])
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    validateRole (roles = []) {
      const rol = this.userSession.roles[0]
      if (this.userSession.is_root) return true

      if (roles && roles.length > 0 && rol) {
        return roles.filter((element) => {
          return element.id === rol.id
        })[0]
      }
      return false
    },
    logoutAt () {
      this.$router.push({ name: 'Login' })
      this.logout()
    },
    /**
     * Dark mode application
     */
    darkMode () {
      this.$q.dark.toggle()
      LocalStorage.set('dark', this.$q.dark.isActive)
    },
    /**
     * Loading applications
     */
    // loadingPage () {
    //   this.$q.dark.set(LocalStorage.getItem('dark'))
    //   this.titleApp =
    //     this.userSession.roles[0].modules.find(
    //       (module) => module.route === this.$route.name
    //     )?.name || this.$route.name.toLowerCase()
    // },
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
     * Validate device
     * @param  {String} validate device
     */
    validateDevice (device) {
      return this.$q.platform.is[device]
    },
    ...mapActions(authentication, ['logout', 'setBranchOffice'])
  }
}
</script>
