<template>
  <q-layout view="lHh lpr lFf" class="catalog-layout">
    <q-header class="catalog-header">
      <q-toolbar class="q-px-md q-py-sm">
        <q-btn
          icon="search"
          flat
          round
          dense
          color="white"
          size="md"
          class="search-btn"
          @click="openSearchDialog"
        />
        <q-space />
        <div class="header-greeting" v-if="!isSearching">
          <span class="text-caption text-grey-5">{{ greeting }}</span>
        </div>
        <div class="search-info" v-else>
          <span class="text-caption text-white">Buscando: "{{ searchQueryFromUrl }}"</span>
          <q-btn
            icon="close"
            flat
            round
            dense
            size="sm"
            color="grey-5"
            @click="clearSearch"
          />
        </div>
        <q-space />
        <q-avatar size="36px" class="cursor-pointer user-avatar">
          <img :src="userAvatar" alt="user">
          <q-menu>
            <q-list style="min-width: 200px" class="bg-grey-9">
              <q-item v-if="userSession" clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="person" color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">{{ userSession?.name || 'Usuario' }}</q-item-label>
                  <q-item-label caption class="text-grey-5">{{ userSession?.username }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator dark />
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">Cerrar sesión</q-item-label>
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

    <!-- Navegación inferior -->
    <q-footer class="catalog-footer">
      <q-toolbar class="footer-toolbar">
        <div class="footer-tabs">
          <div
            class="footer-tab"
            :class="{ 'footer-tab-active': currentTab === 'home' }"
            @click="navigateTo('home')"
          >
            <q-icon name="home" size="24px" />
          </div>
          <div
            class="footer-tab"
            :class="{ 'footer-tab-active': currentTab === 'cart' }"
            @click="navigateTo('cart')"
          >
            <q-icon name="shopping_cart" size="24px" />
            <q-badge
              v-if="cartItemsCount > 0"
              color="red"
              floating
              rounded
              class="cart-badge"
            >
              {{ cartItemsCount }}
            </q-badge>
          </div>
          <div
            class="footer-tab"
            :class="{ 'footer-tab-active': currentTab === 'orders' }"
            @click="navigateTo('orders')"
          >
            <q-icon name="receipt_long" size="24px" />
          </div>
          <div
            class="footer-tab"
            :class="{ 'footer-tab-active': currentTab === 'favorites' }"
            @click="navigateTo('favorites')"
          >
            <q-icon name="star_outline" size="24px" />
          </div>
        </div>
      </q-toolbar>
    </q-footer>

    <!-- Modal de Búsqueda -->
    <q-dialog v-model="searchDialog" position="top">
      <q-card class="search-dialog-card">
        <q-card-section class="q-pa-md">
          <div class="text-h6 text-white q-mb-md">Buscar productos</div>
          <q-input
            v-model="searchQuery"
            placeholder="Buscar por nombre, descripción o categoría..."
            dark
            outlined
            autofocus
            @keyup.enter="performSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-5" />
            </template>
            <template v-slot:append>
              <q-icon
                v-if="searchQuery"
                name="close"
                color="grey-5"
                class="cursor-pointer"
                @click="searchQuery = ''"
              />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            label="Cancelar"
            flat
            color="grey-5"
            v-close-popup
          />
          <q-btn
            label="Buscar"
            unelevated
            color="orange"
            @click="performSearch"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { useCommandStore } from 'src/stores/command'

export default {
  name: 'CatalogLayout',
  data () {
    return {
      currentTab: 'home',
      searchDialog: false,
      searchQuery: ''
    }
  },
  computed: {
    ...mapState(authentication, ['userSession']),
    greeting () {
      const hour = new Date().getHours()
      const name = this.userSession?.name?.split(' ')[0] || 'Usuario'
      if (hour < 12) return `Buenos días, ${name}!`
      if (hour < 18) return `Buenas tardes, ${name}!`
      return `Buenas noches, ${name}!`
    },
    userAvatar () {
      return this.userSession?.avatar_url || 'https://ui-avatars.com/api/?name=' + (this.userSession?.name || 'U')
    },
    cartItemsCount () {
      const store = useCommandStore()
      return store?.command?.products?.length || 0
    },
    showBackButton () {
      return this.$route.query.view && this.$route.query.view !== 'catalog'
    },
    searchQueryFromUrl () {
      return this.$route.query.search || ''
    },
    isSearching () {
      return !!this.searchQueryFromUrl
    }
  },
  watch: {
    '$route.query.view' (newView) {
      if (!newView || newView === 'catalog') {
        this.currentTab = 'home'
      } else if (newView === 'cart') {
        this.currentTab = 'cart'
      } else if (newView === 'orders') {
        this.currentTab = 'orders'
      }
    },
    searchQueryFromUrl (newVal) {
      this.searchQuery = newVal
    }
  },
  methods: {
    ...mapActions(authentication, ['logout']),
    openSearchDialog () {
      this.searchQuery = this.searchQueryFromUrl
      this.searchDialog = true
    },
    performSearch () {
      if (this.searchQuery.trim()) {
        this.$router.push({
          query: {
            ...this.$route.query,
            search: this.searchQuery.trim()
          }
        })
      } else {
        this.clearSearch()
      }
      this.searchDialog = false
    },
    clearSearch () {
      this.searchQuery = ''
      const query = { ...this.$route.query }
      delete query.search
      this.$router.push({ query })
    },
    navigateTo (tab) {
      const viewMap = {
        home: 'catalog',
        cart: 'cart',
        orders: 'orders',
        favorites: 'favorites'
      }

      this.$router.push({
        query: {
          ...this.$route.query,
          view: viewMap[tab]
        }
      })
    },
    goBack () {
      this.$router.push({
        query: {
          ...this.$route.query,
          view: 'catalog'
        }
      })
    }
  },
  created() {
    const view = this.$route.query.view
    if (view === 'cart') this.currentTab = 'cart'
    else if (view === 'orders') this.currentTab = 'orders'
    else if (view === 'favorites') this.currentTab = 'favorites'
    else this.currentTab = 'home'
  }
}
</script>

<style scoped>
.catalog-layout {
  background: linear-gradient(180deg, #1a1d29 0%, #252836 100%);
}

.catalog-header {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-btn {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.header-greeting {
  text-align: center;
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.catalog-footer {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-toolbar {
  padding: 8px 16px;
}

.footer-tabs {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.footer-tab {
  position: relative;
  padding: 8px 20px;
  cursor: pointer;
  color: #8e8e93;
  transition: all 0.3s;
  border-radius: 12px;
}

.footer-tab:hover {
  background: rgba(255, 255, 255, 0.05);
}

.footer-tab-active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.cart-badge {
  top: -4px;
  right: -4px;
}

.search-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Modal de Búsqueda */
.search-dialog-card {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  min-width: 90vw;
  max-width: 500px;
}
</style>
