<template>
  <q-layout view="lHh lpr lFf" container style="height: 100vh">
    <q-header elevated>
      <q-toolbar class="bg-white text-dark flex justify-between">
        <q-img :src="logo.color" width="155px" alt="logo"/>
        <q-chip class="bg-teal text-white" v-if="userSession && !$q.screen.lt.sm">
          {{  userSession?.roles[0]?.name }}: {{ userSession.name }}
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
        <q-tab name="command" icon="shopping_bag">
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
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { logo } from 'src/const/mixins'
export default {
  data () {
    return {
      tab: 'scanner',
      filter: null,
      logo,
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
    },
    ...mapState(authentication, ['userSession'])
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
      this.tab = this.$route.query.tab ?? 'scanner'
    }
  }
}
</script>
