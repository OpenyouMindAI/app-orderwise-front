<template>
  <q-layout view="lHh lpr lFf" container style="height: 100vh">
    <q-header elevated>
      <q-toolbar class="bg-primary text-white flex justify-between">
        <div class="flex items-center q-gutter-sm">
          <q-btn
            icon="chevron_left"
            flat
            dense
            round
            class="q-mr-sm"
            aria-label="Menu"
            @click="() => {
              if ($route.name === 'Catalog') {
                this.setQueryParams({ tab: 'menu' })
              } else {
                $router.push({ name: 'Product' })
              }
            }"
          />
          <img :src="company?.url || logo.white" alt="logo" style="max-height: 40px"/>
        </div>
        <q-avatar
          v-if="userSession"
          flat
          round
          icon="person"
          aria-label="person"
          class="q-ml-sm text-primary bg-white"
        >
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item
                v-ripple
                v-close-popup
                clickable
                dense
              >
                <q-item-section avatar>
                  <q-avatar>
                    <q-icon name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  {{ userSession.name }}
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable dense>
                <q-item-section avatar>
                  <q-avatar icon="person" />
                </q-item-section>
                <q-item-section>
                  {{ userSession.username }}
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
        </q-avatar>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer class="bg-transparent">
      <q-tabs
        v-model="tab"
        align="center"
        active-color="primary"
        style="border-radius: 50px 50px 0px 0px;"
        class="text-secondary bg-white shadow-4 text-bold"
      >
        <q-tab v-for="tab in tabs" :key="tab.name" v-bind="tab"/>
        <q-tab name="command" icon="shopping_bag">
          <q-badge floating color="negative" rounded v-if="commands?.products?.length">
            <span class="text-body text-bold">
              {{ commands?.products?.length }}
            </span>
          </q-badge>
        </q-tab>
        <q-tab
          icon="receipt_long"
          v-if="userSession && $router.name === 'Catalog'"
          name="orders"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>
<script>
import { useCommandStore } from '../stores/command'
import { mapActions, mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { logo } from 'src/const/mixins'
import { notify } from '../const/mixins'
export default {
  data () {
    return {
      tab: 'scanner',
      filter: null,
      logo,
      company: {},
      tabs: [
        { name: 'scanner', icon: 'qr_code_scanner' },
        { name: 'menu', icon: 'restaurant_menu' }
      ]
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
    },
    commands () {
      const store = useCommandStore()
      return store?.command
    }
  },
  created () {
    this.setData()
    this.getCompany()
  },
  methods: {
    /**
     * Get company
     */
    async getCompany () {
      try {
        if (!this.userSession?.company_session) {
          let params = {}
          if (this.$route?.params?.company_id) {
            params.company_id = this.$route?.params?.company_id
          } else {
            params = JSON.parse(atob(this.$route.query.p))
          }
          const { data } = await this.$api.get(`public/company/${params?.company_id}`)
          this.company = data
        } else {
          this.company = this.userSession.company_session
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Logout application
     */
    logoutAt () {
      const name = this.$route.name === 'Catalog' ? 'Catalog' : 'Login'
      this.$router.push({ name, query: { tab: 'menu' } })
      this.logout()
    },
    setQueryParams (query) {
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          ...query
        }
      })
    },
    setData () {
      this.tab = this.$route.query.tab ?? 'menu'
      const isTable = this.userSession?.company_session?.company_config?.is_table
      if (this.$route.name === 'Catalog' || !isTable) {
        this.tabs = [
          { name: 'menu', icon: 'restaurant_menu' }
        ]
      }
    },

    /**
     * Cierra la sesión del usuario
     */
    logoutUser () {
      this.showProfileMenu = false
      this.router.push({ name: 'Login' })
      this.logout()
    },

    ...mapActions(authentication, ['logout'])
  },
  watch: {
    tab (val) {
      if (this.$route.query.tab !== val) {
        this.setQueryParams({ tab: val })
      }
    },
    '$route.query.tab': {
      handler (val) {
        this.tab = val || 'menu'
      },
      immediate: true
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
    }
  }
}
</script>
