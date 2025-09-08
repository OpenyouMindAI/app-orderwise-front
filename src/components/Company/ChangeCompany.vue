<template>
  <div>
    <!-- Resumen de empresas por status -->
    <q-card class="q-mb-md">
      <q-card-section class="q-pb-sm">
        <div class="text-h6 text-grey-8 q-mb-sm" v-if="user.is_root">Resumen de Actividad</div>
        <div class="row q-gutter-sm" v-if="user.is_root">
          <div class="col-auto">
            <q-chip
              :label="`Activas: ${statusCounts.active}`"
              color="positive"
              text-color="white"
              icon="trending_up"
              size="sm"
            />
          </div>
          <div class="col-auto">
            <q-chip
              :label="`Moderadas: ${statusCounts.moderate}`"
              color="warning"
              text-color="white"
              icon="schedule"
              size="sm"
            />
          </div>
          <div class="col-auto">
            <q-chip
              :label="`Baja actividad: ${statusCounts.low}`"
              color="orange-8"
              text-color="white"
              icon="trending_down"
              size="sm"
            />
          </div>
          <div class="col-auto">
            <q-chip
              :label="`Inactivas: ${statusCounts.inactive}`"
              color="negative"
              text-color="white"
              icon="pause_circle"
              size="sm"
            />
          </div>
          <div class="col-auto">
            <q-chip
              :label="`Sin actividad: ${statusCounts.noActivity}`"
              color="grey-6"
              text-color="white"
              icon="help_outline"
              size="sm"
            />
          </div>
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">
          Total de empresas: {{ filteredCompanies.length }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Buscador -->
    <q-input
      v-model="searchQuery"
      outlined
      dense
      placeholder="Buscar empresa por nombre..."
      class="q-mb-md"
      clearable
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- Lista de empresas paginada -->
    <div v-if="paginatedCompanies.length > 0">
      <q-card
        v-for="org in paginatedCompanies"
        :key="org.id"
        class="q-mt-sm cursor-pointer q-py-sm bg-primary text-white"
      >
        <q-item>
          <q-item-section avatar>
            <img
              alt="logo"
              :src="org.url || whiteLogo"
              :style="$q.screen.lt.md
                ? 'height: 50px; width: 70px;'
                : 'height: 50px; width: 130px;'
              "
            />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-subtitle1">
              {{ org.name }} - {{ org.document_number }}
            </q-item-label>
            <q-item-label class="q-subtitle2">
              {{ org.email }}
              <!-- Etiqueta de actividad dinámica -->
              <q-badge
                rounded
                floating
                class="text-white text-bold q-pa-xs"
                :color="getActivityBadgeColor(org)"
              >
                {{ getActivityStatus(org) }}
              </q-badge>
            </q-item-label>
            <q-item-label class="text-subtitle1" v-if="org?.invoice">
              Última actividad: {{ formatDate(org?.invoice?.created_at, 'DD/MM/YYYY HH:mm:ss') }}
            </q-item-label>
            <q-item-label class="text-caption" v-else>
              Sin actividad registrada
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              v-if="org.id === user.company_session_id"
              icon="published_with_changes"
              color="white"
              size="lg"
              dense
              round
              flat
            />
            <q-btn
              v-else
              flat
              icon="sync"
              size="lg"
              round
              dense
              @click="changeCompany(org)"
            >
              <q-tooltip>Cambiar la sesión de la empresa</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-card>
    </div>

    <!-- Mensaje cuando no hay resultados -->
    <div v-else class="text-center q-pa-lg">
      <q-icon name="search_off" size="4rem" color="grey-5" />
      <div class="text-h6 text-grey-6 q-mt-md">
        No se encontraron empresas
      </div>
      <div class="text-body2 text-grey-5">
        {{ searchQuery ? 'Intenta con otro término de búsqueda' : 'No hay empresas disponibles' }}
      </div>
    </div>

    <!-- Paginación -->
    <div class="q-mt-lg flex flex-center" v-if="totalPages > 1">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        boundary-numbers
        direction-links
        outline
        color="primary"
        active-design="unelevated"
        active-color="primary"
        active-text-color="white"
      />
    </div>

    <!-- Información de paginación -->
    <div class="text-center text-caption text-grey-6 q-mt-sm" v-if="filteredCompanies.length > 0">
      Mostrando {{ startIndex + 1 }}-{{ endIndex }} de {{ filteredCompanies.length }} empresas
    </div>

    <!-- Dialog de confirmación -->
    <q-dialog v-model="confirmDialog" persistent>
      <q-card style="width: 400px; max-width: 80vw">
        <q-form @submit="updateSession">
          <q-card-section class="row items-center q-py-md bg-primary text-white">
            <div class="text-h6">Confirmar usuario</div>
          </q-card-section>
          <q-card-section class="q-py-xs flex flex-center">
            <q-img :src="company.url || whiteLogo" width="200px" />
          </q-card-section>
          <q-card-section class="q-pb-md">
            <q-input
              v-model="password"
              type="password"
              label="Contraseña"
              outlined
              dense
              autofocus
              :rules="[
                (val) => (val && val.length > 0) || 'Este campo es requerido',
              ]"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-gutter-sm q-pt-none">
            <q-btn
              color="secondary"
              icon="cancel"
              label="Cancelar"
              @click="confirmDialog = false"
            />
            <q-btn
              color="primary"
              icon="check_circle"
              label="Aceptar"
              type="submit"
              :loading="loading"
            />
          </q-card-actions>
        </q-form>
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
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Store y Quasar
const store = authentication()
const user = store.userSession
const $q = useQuasar()

// Logo variable
const whiteLogo = 'path/to/white/logo.png'

// Funciones y computeds deben estar al principio
const getActivityStatus = (org) => {
  if (!org.invoice) return 'Sin actividad'

  const now = new Date()
  const invoiceDate = new Date(org.invoice.created_at)
  const daysDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 2) return 'Activa'
  if (daysDiff <= 7) return 'Moderada'
  if (daysDiff <= 30) return 'Baja actividad'
  return 'Inactiva'
}

const getActivityBadgeColor = (org) => {
  if (!org.invoice) return 'grey-6'

  const now = new Date()
  const invoiceDate = new Date(org.invoice.created_at)
  const daysDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 2) return 'positive' // Verde
  if (daysDiff <= 7) return 'warning' // Amarillo/Naranja
  if (daysDiff <= 30) return 'orange-8' // Naranja oscuro
  return 'negative' // Rojo
}

const changeCompany = (data) => {
  company.value = data
  confirmDialog.value = true
}

const updateSession = async () => {
  try {
    loading.value = true
    const { data } = await api.post('session/company', {
      company_id: company.value.id,
      username: user.username || user.email,
      password: password.value
    })
    store.setBranchOffice(null)
    store.setSessionData(data)
    $q.notify({
      message: 'Cambio realizado exitosamente, se actualizarán los datos en unos segundos',
      color: 'positive',
      progress: true,
      timeout: 1000
    })
    setTimeout(() => window.location.reload(), 2000)
  } catch (error) {
    $q.notify({
      message: error?.message || error.message,
      color: 'negative',
      progress: true,
      timeout: 1500
    })
  } finally {
    loading.value = false
    password.value = ''
    confirmDialog.value = false
  }
}

// Computed para ordenar empresas por última factura
const sortedCompanies = computed(() => {
  return [...props.companies].sort((a, b) => {
    // Empresas con facturas primero, ordenadas por fecha más reciente
    if (a.invoice && b.invoice) {
      return new Date(b.invoice.created_at) - new Date(a.invoice.created_at)
    }
    if (a.invoice && !b.invoice) return -1
    if (!a.invoice && b.invoice) return 1
    // Si ninguna tiene factura, ordenar por nombre
    return a.name.localeCompare(b.name)
  })
})

// Computed para filtrar empresas por búsqueda
const filteredCompanies = computed(() => {
  if (!searchQuery.value) return sortedCompanies.value

  const query = searchQuery.value.toLowerCase().trim()
  return sortedCompanies.value.filter(company =>
    company.name.toLowerCase().includes(query) ||
    company.document_number.toLowerCase().includes(query) ||
    company.email.toLowerCase().includes(query)
  )
})

// Computed para paginación
const totalPages = computed(() => {
  return Math.ceil(filteredCompanies.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, filteredCompanies.value.length)
})

const paginatedCompanies = computed(() => {
  return filteredCompanies.value.slice(startIndex.value, endIndex.value)
})

// Watcher para resetear página cuando se busca
watch(searchQuery, () => {
  currentPage.value = 1
})

// Computed para contar empresas por status
const statusCounts = computed(() => {
  const counts = {
    active: 0,
    moderate: 0,
    low: 0,
    inactive: 0,
    noActivity: 0
  }

  filteredCompanies.value.forEach(org => {
    const status = getActivityStatus(org)
    switch (status) {
      case 'Activa':
        counts.active++
        break
      case 'Moderada':
        counts.moderate++
        break
      case 'Baja actividad':
        counts.low++
        break
      case 'Inactiva':
        counts.inactive++
        break
      case 'Sin actividad':
        counts.noActivity++
        break
    }
  })

  return counts
})
</script>
