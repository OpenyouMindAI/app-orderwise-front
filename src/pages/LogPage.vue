<template>
  <div class="q-pa-md">
    <!-- <CHANGE> Filtros en tarjeta más moderna con mejor organización -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pb-none">
        <div class="text-subtitle2 q-mb-sm">Filtros</div>
        <div class="row items-center q-col-gutter-sm">
          <div class="col-12 col-md-4">
            <q-input v-model="filters.search" dense outlined placeholder="Buscar URL, endpoint, IP, user..."
                     clearable debounce="300" @update:model-value="fetchLogs">
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>

          <div class="col-6 col-md-2">
            <q-select v-model="filters.method" :options="methodOptions" dense outlined clearable
                      label="Método" @update:model-value="fetchLogs" />
          </div>

          <div class="col-6 col-md-2">
            <q-select v-model="filters.status" :options="statusOptions" dense outlined clearable
                      label="Estado" @update:model-value="fetchLogs" />
          </div>

          <div class="col-6 col-md-2">
            <q-toggle v-model="filters.errorsOnly" label="Solo errores" dense
                      @update:model-value="fetchLogs" color="negative" />
          </div>

          <!-- <CHANGE> Filtro de fecha mejorado sin restricciones y con opción de limpiar -->
          <div class="col-12 col-md-3">
            <q-input dense outlined v-model="filters.dateRangeLabel" readonly label="Rango de fecha"
                     @click="dateRangeDialog = true" clearable @clear="clearDateRange">
              <template #prepend><q-icon name="event" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-1 flex items-center justify-end">
            <q-btn dense color="primary" icon="refresh" @click="fetchLogs" rounded label="Actualizar"/>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-table
      :rows="rows"
      :columns="visibleColumns"
      row-key="id"
      flat bordered
      color="primary"
      :loading="loading"
      :filter="filters.search"
      :rows-per-page-options="[10,25,50,100]"
      :virtual-scroll="true"
      :virtual-scroll-item-size="56"
      v-model:pagination="pagination"
      @request="onRequest"
      :dense="compact"
      :grid="$q.screen.lt.md"
      :grid-header="$q.screen.lt.md"
    >
      <template #top-right>
        <div class="row items-center q-gutter-sm">
          <!-- <CHANGE> Selector de columnas siempre visible -->
          <q-btn-dropdown dense flat icon="view_column" label="Columnas">
            <q-list>
              <q-item v-for="col in columns.filter(c => c.name !== 'actions')" :key="col.name" tag="label" v-ripple>
                <q-item-section avatar>
                  <q-checkbox v-model="visibleColumnNames" :val="col.name" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ col.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-toggle v-model="compact" label="Compacto" dense />
        </div>
      </template>

      <template #body-cell-status_code="props">
        <q-td :props="props">
          <q-badge :color="statusColor(props.row.status_code)" align="top" rounded>
            {{ props.row.status_code }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-method="props">
        <q-td :props="props">
          <q-chip dense :color="methodColor(props.row.method)" text-color="white">{{ props.row.method }}</q-chip>
        </q-td>
      </template>

      <!-- <CHANGE> Mejor visualización de URL con tooltip y formato mejorado -->
      <template #body-cell-full_url="props">
        <q-td :props="props">
          <div class="url-container">
            <q-tooltip class="bg-dark text-white" anchor="top left" self="bottom left" :offset="[10, 10]">
              {{ props.row.full_url }}
            </q-tooltip>
            <a :href="props.row.full_url" target="_blank" rel="noopener" class="text-primary url-link">
              <q-icon name="link" size="xs" class="q-mr-xs" />
              {{ formatUrl(props.row.full_url) }}
            </a>
          </div>
        </q-td>
      </template>

      <!-- <CHANGE> Columna de usuario agregada -->
      <template #body-cell-user_id="props">
        <q-td :props="props">
          <q-chip v-if="props.row.user" dense color="grey-6" text-color="white">
            <q-icon name="person" size="xs" class="q-mr-xs" />
            {{ props.row.user.name }}
          </q-chip>
          <span v-else class="text-grey-6">guest</span>
        </q-td>
      </template>

      <!-- Columna de empresa -->
      <template #body-cell-company_name="props">
        <q-td :props="props">
          <q-chip v-if="props.row.user?.company_session" dense color="primary" text-color="white">
            <q-icon name="business" size="xs" class="q-mr-xs" />
            {{ props.row.user.company_session.name }}
          </q-chip>
          <span v-else class="text-grey-6">-</span>
        </q-td>
      </template>

      <!-- Columna de mensaje de error -->
      <template #body-cell-error_message="props">
        <q-td :props="props">
          <div v-if="props.row.error_message" class="error-message-cell">
            <q-icon name="error" size="xs" color="negative" class="q-mr-xs" />
            <span class="text-negative text-caption">{{ props.row.error_message.substring(0, 50) }}{{ props.row.error_message.length > 50 ? '...' : '' }}</span>
            <q-tooltip class="bg-negative text-white" max-width="400px">
              {{ props.row.error_message }}
            </q-tooltip>
          </div>
          <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="visibility" @click="openDetails(props.row)" :title="'Ver detalle #'+props.row.id" />
          <q-btn flat dense round icon="content_copy" @click="copyCurl(props.row)" title="Copiar cURL" />
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width row flex-center q-pa-lg text-grey">
          <q-icon name="inbox" size="lg" class="q-mr-sm" />
          Sin resultados para los filtros aplicados
        </div>
      </template>

      <!-- Grid mode para móvil -->
      <template #item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="row items-center q-mb-xs">
                <q-badge :color="statusColor(props.row.status_code)" class="q-mr-xs">
                  {{ props.row.status_code }}
                </q-badge>
                <q-chip dense :color="methodColor(props.row.method)" text-color="white" class="q-mr-xs">
                  {{ props.row.method }}
                </q-chip>
                <q-space />
                <span class="text-caption text-grey-7">#{{ props.row.id }}</span>
              </div>
              
              <div class="text-body2 q-mb-xs">
                <strong>Endpoint:</strong> {{ props.row.endpoint }}
              </div>
              
              <div v-if="props.row.user" class="text-caption q-mb-xs">
                <q-icon name="person" size="xs" />
                {{ props.row.user.name }}
                <span v-if="props.row.user.company_session" class="q-ml-xs">
                  <q-icon name="business" size="xs" />
                  {{ props.row.user.company_session.name }}
                </span>
              </div>
              
              <div v-if="props.row.error_message" class="text-caption text-negative q-mb-xs">
                <q-icon name="error" size="xs" />
                {{ props.row.error_message.substring(0, 50) }}...
              </div>
              
              <div class="row items-center justify-between q-mt-sm">
                <span class="text-caption text-grey-6">{{ formatDate(props.row.created_at) }}</span>
                <div>
                  <q-btn flat dense round size="sm" icon="visibility" @click="openDetails(props.row)" />
                  <q-btn flat dense round size="sm" icon="content_copy" @click="copyCurl(props.row)" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>

    <!-- <CHANGE> Selector de rango de fechas sin restricciones de año -->
    <q-dialog v-model="dateRangeDialog" :position="'standard'">
      <q-card class="q-pa-none" style="max-width: 350px">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-date
              v-model="dateRange"
              range
              mask="YYYY-MM-DD"
              class="full-width"
              :navigation-min-year-month="'1900/01'"
              :navigation-max-year-month="'2099/12'"
            />
          </div>
          <div class="col-12 text-right q-pa-sm">
            <q-btn flat label="Limpiar" @click="clearDateRange" class="q-mr-sm" />
            <q-btn flat label="Cancelar" v-close-popup class="q-mr-sm" />
            <q-btn color="primary" label="Aplicar" @click="applyDateRange" v-close-popup />
          </div>
        </div>
      </q-card>
    </q-dialog>

    <!-- Drawer de detalle mejorado -->
    <q-drawer v-model="detailsOpen" side="right" overlay :width="600" elevated>
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <q-icon name="info" class="q-mr-sm" />
          Detalle de Petición #{{ selected?.id }}
        </q-toolbar-title>
        <q-btn flat round dense icon="close" @click="detailsOpen=false" />
      </q-toolbar>
      <q-separator />

      <div class="q-pa-md scroll">
        <div class="q-gutter-md">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="info_outline" class="q-mr-xs" />
                Información General
              </div>
              <div class="text-body2">
                <div class="info-row"><b>Método:</b> <q-chip dense :color="methodColor(selected?.method)" text-color="white">{{ selected?.method }}</q-chip></div>
                <div class="info-row"><b>Status:</b> <q-badge :color="statusColor(selected?.status_code)">{{ selected?.status_code }}</q-badge></div>
                <div class="info-row url-info"><b>URL:</b>
                  <a :href="selected?.full_url" target="_blank" class="text-primary">
                    <q-icon name="link" size="xs" class="q-mr-xs" />
                    {{ selected?.full_url }}
                  </a>
                </div>
                <div class="info-row"><b>Endpoint:</b> <code>{{ selected?.endpoint }}</code></div>
                <div class="info-row"><b>IP:</b> {{ selected?.ip_address }} | <b>Usuario:</b> {{ selected?.user?.name ?? 'guest' }}</div>
                <div class="info-row" v-if="selected?.user?.company_session"><b>Empresa:</b> 
                  <q-chip dense color="primary" text-color="white">
                    <q-icon name="business" size="xs" class="q-mr-xs" />
                    {{ selected.user.company_session.name }}
                  </q-chip>
                </div>
                <div class="info-row"><b>User Agent:</b> <span class="text-grey-7">{{ selected?.user_agent }}</span></div>
                <div class="info-row"><b>Origen:</b> {{ selected?.origin }}</div>
                <div class="info-row"><b>Tiempo de respuesta:</b> <q-badge color="info">{{ selected?.response_time }}s</q-badge></div>
                <div class="info-row"><b>Fecha:</b> {{ formatDate(selected?.created_at) }}</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered>
            <q-card-section class="row items-center justify-between">
              <div class="text-subtitle2 flex items-center">
                <q-icon name="data_object" class="q-mr-xs" />
                Payload
              </div>
              <q-btn dense flat icon="content_copy" @click="copyJson(selected?.payload)" />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <pre class="code-block">{{ pretty(selected?.payload) }}</pre>
            </q-card-section>
          </q-card>

          <q-card flat bordered>
            <q-card-section class="row items-center justify-between">
              <div class="text-subtitle2 flex items-center">
                <q-icon name="http" class="q-mr-xs" />
                Headers
              </div>
              <q-btn dense flat icon="content_copy" @click="copyJson(selected?.headers)" />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <pre class="code-block">{{ pretty(selected?.headers) }}</pre>
            </q-card-section>
          </q-card>

          <!-- Error Details (nuevo) -->
          <q-card v-if="selected?.error_message" flat bordered class="error-card">
            <q-card-section class="row items-center justify-between bg-negative text-white">
              <div class="text-subtitle2 flex items-center">
                <q-icon name="error" class="q-mr-xs" />
                Detalles del Error
              </div>
              <q-btn dense flat icon="content_copy" @click="copyJson(parseResponseBody(selected?.response_body))" color="white" />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="error-details">
                <div class="error-row">
                  <b>Mensaje:</b> 
                  <span class="text-negative">{{ selected?.error_message }}</span>
                </div>
                <template v-if="parseResponseBody(selected?.response_body)">
                  <div class="error-row" v-if="parseResponseBody(selected?.response_body).error">
                    <b>Tipo:</b> 
                    <code>{{ parseResponseBody(selected?.response_body).error }}</code>
                  </div>
                  <div class="error-row" v-if="parseResponseBody(selected?.response_body).file">
                    <b>Archivo:</b> 
                    <code>{{ parseResponseBody(selected?.response_body).file }}:{{ parseResponseBody(selected?.response_body).line }}</code>
                  </div>
                  <div class="error-row" v-if="parseResponseBody(selected?.response_body).user_data">
                    <b>Usuario afectado:</b> 
                    <span>{{ parseResponseBody(selected?.response_body).user_data.name }} ({{ parseResponseBody(selected?.response_body).user_data.email }})</span>
                  </div>
                </template>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section v-if="parseResponseBody(selected?.response_body)?.trace">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="bug_report" class="q-mr-xs" />
                Stack Trace
              </div>
              <pre class="code-block trace-block">{{ formatTrace(parseResponseBody(selected?.response_body).trace) }}</pre>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/services'

const $q = useQuasar()

const loading = ref(false)
const compact = ref(false)
const rows = ref([])
const selected = ref(null)
const detailsOpen = ref(false)
const dateRangeDialog = ref(false)
const dateRange = ref({ from: null, to: null })

// <CHANGE> Agregado control de columnas visibles
const visibleColumnNames = ref(['id', 'created_at', 'method', 'status_code', 'endpoint', 'error_message', 'user_id', 'company_name', 'ip_address', 'response_time'])

const filters = reactive({
  search: '',
  method: null,
  status: null,
  dateRange: null,
  dateRangeLabel: '',
  errorsOnly: false
})

const pagination = ref({ page: 1, rowsPerPage: 25, rowsNumber: 0, sortBy: 'created_at', descending: true })

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  {
    name: 'created_at',
    label: 'Fecha',
    field: 'created_at',
    sortable: true,
    align: 'left',
    format: v => new Date(v).toLocaleString()
  },
  { name: 'method', label: 'Método', field: 'method', sortable: true, align: 'left' },
  { name: 'status_code', label: 'Estado', field: 'status_code', sortable: true, align: 'left' },
  { name: 'endpoint', label: 'Endpoint', field: 'endpoint', sortable: true, align: 'left' },
  { name: 'error_message', label: 'Error', field: 'error_message', sortable: true, align: 'left' },
  { name: 'user_id', label: 'Usuario', field: 'user_id', sortable: true, align: 'left' },
  { name: 'company_name', label: 'Empresa', field: row => row.user?.company_session?.name || '-', sortable: false, align: 'left' },
  { name: 'ip_address', label: 'IP', field: 'ip_address', sortable: true, align: 'left' },
  { name: 'response_time', label: 'Tiempo (s)', field: 'response_time', sortable: true, align: 'right' },
  { name: 'full_url', label: 'URL', field: 'full_url', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' }
]

// <CHANGE> Computed para columnas visibles
const visibleColumns = computed(() => {
  return columns.filter(col => col.name === 'actions' || visibleColumnNames.value.includes(col.name))
})

const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].map(v => ({ label: v, value: v }))
const statusOptions = [
  { label: '200', value: '200' }, { label: '300', value: '300' },
  { label: '400', value: '400' }, { label: '500', value: '500' }
]

function statusColor (code) {
  const c = Number(code || 0)
  if (c >= 500) return 'negative'
  if (c >= 400) return 'warning'
  if (c >= 300) return 'info'
  if (c >= 200) return 'positive'
  return 'grey'
}

function methodColor (m) {
  switch (m) {
    case 'GET': return 'primary'
    case 'POST': return 'secondary'
    case 'PUT': return 'warning'
    case 'PATCH': return 'info'
    case 'DELETE': return 'negative'
    default: return 'grey'
  }
}

// <CHANGE> Función para formatear URL de manera más compacta
function formatUrl (url) {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname + urlObj.search
    return path.length > 50 ? path.substring(0, 47) + '...' : path
  } catch {
    return url.length > 50 ? url.substring(0, 47) + '...' : url
  }
}

// <CHANGE> Función para formatear fecha de manera más legible
function formatDate (dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function pretty (obj) {
  try { return JSON.stringify(obj ?? {}, null, 2) } catch { return String(obj) }
}

function openDetails (row) {
  selected.value = row
  detailsOpen.value = true
}

function copyJson (obj) {
  navigator.clipboard.writeText(pretty(obj))
  $q.notify({ message: 'Copiado al portapapeles', icon: 'check', color: 'positive', position: 'top' })
}

function parseResponseBody (responseBody) {
  if (!responseBody) return null
  try {
    return typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody
  } catch {
    return null
  }
}

function formatTrace (trace) {
  if (!trace) return ''
  if (Array.isArray(trace)) {
    return trace.map((t, i) => `#${i} ${t.file}:${t.line}\n    ${t.class ? t.class + '::' : ''}${t.function}`).join('\n\n')
  }
  return String(trace)
}

function copyCurl (row) {
  const data = row?.payload ? ` --data '${JSON.stringify(row.payload)}'` : ''
  const cmd = `curl -X ${row.method} '${row.full_url}'${data}`
  navigator.clipboard.writeText(cmd)
  $q.notify({ message: 'cURL copiado al portapapeles', icon: 'content_copy', color: 'primary', position: 'top' })
}

// <CHANGE> Función para limpiar el filtro de fecha
function clearDateRange () {
  dateRange.value = { from: null, to: null }
  filters.dateRange = null
  filters.dateRangeLabel = ''
  fetchLogs()
}

function applyDateRange () {
  if (dateRange.value?.from && dateRange.value?.to) {
    filters.dateRange = { ...dateRange.value }
    filters.dateRangeLabel = `${filters.dateRange.from} → ${filters.dateRange.to}`
    fetchLogs()
  }
}

async function onRequest (ctx) {
  pagination.value.page = ctx.pagination.page
  pagination.value.rowsPerPage = ctx.pagination.rowsPerPage
  pagination.value.sortBy = ctx.pagination.sortBy
  pagination.value.descending = ctx.pagination.descending
  // No hardcodear rowsNumber - se actualiza desde el backend
  await fetchLogs()
}

async function fetchLogs () {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      paginate: true,
      perPage: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      sortOrder: pagination.value.descending ? 'desc' : 'asc',
      dataSearch: {
        ip_address: filters.search,
        endpoint: filters.search,
        error_message: filters.search
      },
      dataEqualFilter: {
        method: filters.method?.value || null,
        status_code: filters.status?.value || null
      },
      dateFilter: {
        field: 'created_at',
        from: filters.dateRange?.from || null,
        to: filters.dateRange?.to || null
      }
    }

    // Filtro de solo errores
    if (filters.errorsOnly) {
      params.dataRangeFilter = {
        status_code: { from: 400, to: 599 }
      }
    }

    const { data } = await api.get('user-activity', { params })
    rows.value = data.data
    pagination.value.rowsNumber = data.total
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error cargando logs', position: 'top' })
  } finally {
    loading.value = false
  }
}

fetchLogs()
</script>

<style scoped>
.code-block {
background: rgba(148,163,184,0.08);
border: 1px solid rgba(148,163,184,0.24);
border-radius: 8px;
padding: 12px;
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
white-space: pre-wrap;
word-break: break-word;
font-size: 12px;
}

.url-container {
max-width: 200px;
overflow: hidden;
}

.url-link {
text-decoration: none;
display: flex;
align-items: center;
}

.url-link:hover {
text-decoration: underline;
}

.info-row {
margin-bottom: 8px;
display: flex;
align-items: center;
flex-wrap: wrap;
gap: 4px;
}

.url-info {
align-items: flex-start;
}

.url-info a {
word-break: break-all;
margin-left: 4px;
}

code {
background: rgba(148,163,184,0.1);
padding: 2px 6px;
border-radius: 4px;
font-size: 12px;
}

.error-message-cell {
display: flex;
align-items: center;
max-width: 300px;
}

.error-card {
border: 2px solid rgba(244, 67, 54, 0.3);
}

.error-details {
display: flex;
flex-direction: column;
gap: 12px;
}

.error-row {
display: flex;
flex-direction: column;
gap: 4px;
word-break: break-word;
}

.trace-block {
max-height: 400px;
overflow: auto;
background: rgba(244, 67, 54, 0.05);
border: 1px solid rgba(244, 67, 54, 0.2);
}
</style>
