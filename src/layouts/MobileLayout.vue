<template>
  <q-layout view="lHh lpr lFf" container style="height: 100vh">
    <q-header elevated>
      <q-toolbar class="bg-white text-dark flex justify-between">
        <q-avatar>
          <img alt="logo" src="https://cdn.quasar.dev/logo-v2/svg/logo.svg">
        </q-avatar>
        <q-toolbar-title>
          Menu
        </q-toolbar-title>
        <q-chip class="bg-teal text-white" v-if="userSession && !$q.screen.lt.sm">
          {{  userSession.role.name }}: {{ userSession.name }}
        </q-chip>
        <q-input
          outlined
          rounded
          class="q-ml-sm"
          label="Buscar"
          dense
          type="search"
          debounce="500"
          v-model="filter"
          v-if="tab === 'menu'"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <!-- <q-btn flat round dense icon="whatshot" /> -->
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
        <q-tab name="command" icon="orderwise_bag">
          <q-badge floating color="negative" rounded v-if="commands?.products?.length">
            <span class="text-body text-bold">
              {{ commands?.products?.length }}
            </span>
          </q-badge>
        </q-tab>
      </q-tabs>
    </q-footer>
  </q-layout>
</template>
<script>
import { watch } from 'vue'
import { useCommandStore } from '../stores/command'
export default {
  data () {
    return {
      tab: 'scanner',
      filter: null,
      userSession: JSON.parse(localStorage.getItem('user')),
      tabs: [
        { name: 'scanner', icon: 'qr_code_scanner' },
        { name: 'menu', icon: 'restaurant_menu' }
      ]
    }
  },
  watch: {
    tab (data) {
      this.setQueryParams({
        tab: data
      })
    },
    filter (data) {
      this.setQueryParams({
        filter: data
      })
    }
  },
  created () {
    this.setData()
    watch(() => this.$route.query, (toParams, previousParams) => {
      this.tab = toParams.tab
    })
  },
  computed: {
    commands () {
      const store = useCommandStore()
      return store?.command
    }
  },
  methods: {
    setQueryParams (query) {
      this.$router.push({
        path: 'command',
        query: {
          ...this.$route.query,
          ...query
        }
      })
    },
    setData () {
      this.$api.defaults.headers.common.authorization = `${localStorage.getItem('tokenType')} ${localStorage.getItem('accessToken')}`
      this.tab = this.$route.query.tab ?? 'scanner'
    }
  }
}
</script>
