<template>
  <div class="full-width">
    <!-- Search Bar with Icon -->
    <q-input
      v-model="searchQuery"
      outlined
      dense
      placeholder="Buscar empresa por nombre..."
      class="q-mb-md"
      clearable
      rounded
      bg-color="white"
      input-class="text-grey-9"
    >
      <template v-slot:prepend>
        <q-icon name="search" color="primary" />
      </template>
    </q-input>

    <!-- Company List with Infinite Scroll -->
    <q-infinite-scroll
      @load="onLoadMore"
      :offset="250"
      :disable="!hasMoreItems"
      scroll-target="#company-scroll-area"
      class="scroll"
      id="company-scroll-area"
      style="height: 60vh"
    >
      <transition-group
        name="list"
        tag="div"
        class="q-gutter-y-sm"
      >
        <q-card
          v-for="org in visibleCompanies"
          :key="org.id"
          class="company-card"
          :class="{ 'current-company': org.id === user.company_session_id }"
          flat
          bordered
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar
                size="80px"
                class="bg-grey"
                >
                <img
                  :src="org.url || whiteLogo"
                  class="company-logo"
                  style="height: 70px;" fit="contain"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <div class="row items-center q-mb-xs">
                <q-item-label class="text-subtitle1 text-weight-bold">
                  {{ org.name }}
                </q-item-label>
                <q-badge
                  v-if="org.id === user.company_session_id"
                  color="primary"
                  class="q-ml-sm"
                  rounded
                >
                  Actual
                </q-badge>
              </div>

              <q-item-label class="text-caption text-grey-7 q-mb-xs">
                {{ org.document_number }} • {{ org.email }}
              </q-item-label>

              <div class="row items-center">
                <q-badge
                  rounded
                  class="q-mr-sm"
                  :color="getActivityBadgeColor(org)"
                  text-color="white"
                >
                  {{ getActivityStatus(org) }}
                </q-badge>
              </div>
            </q-item-section>

            <q-item-section side>
              <q-btn
                v-if="org.id !== user.company_session_id"
                icon="sync"
                round
                flat
                color="primary"
                size="md"
                @click="changeCompany(org)"
              >
                <q-tooltip>Cambiar empresa</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-card>
      </transition-group>

      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <!-- No Results Message -->
    <div
      v-if="filteredCompanies.length === 0"
      class="column items-center justify-center q-pa-xl text-center"
    >
      <q-icon
        name="search_off"
        size="4rem"
        color="grey-4"
        class="q-mb-md"
      />
      <div class="text-h6 text-grey-6">No se encontraron empresas</div>
      <div class="text-body2 text-grey-5 q-mt-sm">
        {{ searchQuery ? 'Intenta con otro término de búsqueda' : 'No hay empresas disponibles' }}
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="confirmDialog">
      <q-card style="width: 100%; max-width: 400px">
        <q-card-section class="row items-center q-pb-sm bg-primary text-white">
          <q-avatar
            icon="sync"
            color="white"
            text-color="primary"
            class="q-mr-sm"
          />
          <span class="text-h6">Cambiar de empresa</span>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <div class="text-center q-mb-md bg-grey rounded-borders q-pa-md" style="max-height: 100px;">
            <q-img :src="company.url || whiteLogo" class="full-width" style="height: 70px;" fit="contain"/>
          </div>

          <q-form @submit="updateSession">
            <q-input
              v-model="password"
              type="password"
              label="Ingresa tu contraseña para confirmar"
              outlined
              dense
              autofocus
              :rules="[val => !!val || 'La contraseña es requerida']"
              class="q-mb-md"
            />

            <div class="row q-gutter-sm justify-end">
              <q-btn
                flat
                label="Cancelar"
                color="grey-7"
                v-close-popup
              />
              <q-btn
                label="Confirmar"
                type="submit"
                color="primary"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { authentication } from 'src/stores/module-authentication'
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate } from '../../const/mixins'

const props = defineProps({
  companies: {
    type: Array,
    required: true
  }
})

// Variables reactivas
const company = ref(null)
const password = ref('')
const confirmDialog = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const visibleCount = ref(10) // Número inicial de empresas a mostrar

// Store y Quasar
const store = authentication()
const user = store.userSession
const $q = useQuasar()

// Computed properties
const filteredCompanies = computed(() => {
  if (!searchQuery.value) return props.companies
  const query = searchQuery.value.toLowerCase()
  return props.companies.filter(org =>
    org.name.toLowerCase().includes(query) ||
    org.document_number?.toLowerCase().includes(query) ||
    org.email?.toLowerCase().includes(query)
  )
})

const visibleCompanies = computed(() => {
  return filteredCompanies.value.slice(0, visibleCount.value)
})

const hasMoreItems = computed(() => {
  return visibleCompanies.value.length < filteredCompanies.value.length
})

// Methods
const onLoadMore = (index, done) => {
  if (hasMoreItems.value) {
    setTimeout(() => {
      visibleCount.value += 5
      done()
    }, 800)
  } else {
    done(true) // Detiene la carga infinita
  }
}

const getActivityStatus = (org) => {
  if (!org.invoice) return 'Sin actividad'
  const now = new Date()
  const invoiceDate = new Date(org.invoice.created_at)
  const daysDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) return 'Hoy'
  if (daysDiff === 1) return 'Ayer'
  if (daysDiff <= 7) return `Hace ${daysDiff} días`
  if (daysDiff <= 30) return 'Este mes'
  return 'Hace más de un mes'
}

const getActivityBadgeColor = (org) => {
  if (!org.invoice) return 'grey-6'
  const now = new Date()
  const invoiceDate = new Date(org.invoice.created_at)
  const daysDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 1) return 'positive'
  if (daysDiff <= 7) return 'warning'
  if (daysDiff <= 30) return 'orange'
  return 'negative'
}

const changeCompany = (data) => {
  company.value = data
  password.value = ''
  confirmDialog.value = true
}

const updateSession = async () => {
  if (!password.value) return

  try {
    loading.value = true
    const { data } = await api.post('session/company', {
      company_id: company.value.id,
      username: user.username || user.email,
      password: password.value
    })
    
    // Actualizar token si viene en la respuesta
    if (data.access_token) {
      localStorage.setItem('token', data.access_token)
      api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
    }
    
    store.setBranchOffice(null)
    store.setSessionData(data)
    
    confirmDialog.value = false
    
    $q.notify({
      message: 'Cambio realizado exitosamente, se actualizarán los datos en unos segundos',
      color: 'positive',
      progress: true,
      timeout: 1000
    })
    setTimeout(() => window.location.reload(), 2000)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al cambiar de empresa',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  visibleCount.value = 10
})
</script>

<style scoped>
.company-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  border-radius: 8px;
}

.company-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.company-card.current-company {
  border-left: 4px solid var(--q-primary);
  background-color: rgba(25, 118, 210, 0.05);
}

.company-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
