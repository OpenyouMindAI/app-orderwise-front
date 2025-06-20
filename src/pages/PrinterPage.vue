<template>
  <div class="q-pa-md">
    <!-- Botones principales -->
    <div class="q-gutter-sm flex flex-center q-mb-md">
      <q-btn
        color="primary"
        icon="add_circle"
        label="Agregar impresora"
        @click="openAddPrinter = true"
        unelevated
        rounded
      />
      <q-btn
        v-if="isAndroid"
        color="secondary"
        icon="bluetooth_searching"
        label="Escanear Bluetooth"
        @click="scanner"
        unelevated
        rounded
      />
      <q-btn
        v-else
        color="secondary"
        icon="print"
        label="Imprimir directo"
        @click="advertenceDialog = true"
        unelevated
        rounded
        />
        <q-btn
        color="info"
        icon="settings"
        label="Configuración de impresión"
        unelevated
        rounded
        @click="configToPrint = true"
      />
    </div>
    <!-- Buscador -->
    <q-input
      filled
      debounce="400"
      v-model="filter"
      placeholder="Buscar impresora por nombre o IP"
      class="q-mb-md"
      :clearable="!!filter"
      @clear="filter = ''"
      prefix="🔍"
    />

    <!-- Tabla/Lista Responsive -->
    <div v-if="!isMobile">
      <q-table
        :columns="columns"
        :rows="printers"
        :filter="filter"
        row-key="id"
        flat
        bordered
        class="modern-table"
        v-model:pagination="paginationConfig"
        @row-click="editPrinter"
        @request="setPagination"
        no-data-label="No se encontraron impresoras"
        :rows-per-page-options="[5, 10, 20]"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <q-icon name="print" color="primary" class="q-mr-xs" />
            {{ props.row.name }}
          </q-td>
        </template>
        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </div>
    <div v-else>
      <div v-if="printers.length === 0" class="text-center q-mt-lg text-grey">
        <q-icon name="print_disabled" size="48px" />
        <div>No se encontraron impresoras</div>
      </div>
      <q-list separator class="modern-list">
        <q-item
          v-for="printer in filteredPrinters"
          :key="printer.id"
          class="modern-card"
          clickable
          v-ripple
          @click="editPrinter(null, printer)"
        >
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" icon="print" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-h6">{{ printer.name }}</q-item-label>
            <q-item-label caption>
              <q-icon name="dns" size="xs" class="q-mr-xs" /> {{ printer.ip }}
            </q-item-label>
            <q-item-label caption>
              <q-icon name="devices" size="xs" class="q-mr-xs" /> {{ printer.device }}
            </q-item-label>
            <q-item-label caption>
              <q-badge color="secondary" outline>{{ printer.type }}</q-badge>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn icon="refresh" class="q-mb-sm" color="secondary" flat dense @click.stop="reconnectPrinter(printer)" />
            <q-btn icon="edit" color="primary" flat dense @click.stop="editPrinter(null, printer)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

        <!-- Edit Printer Dialog -->
    <q-dialog v-model="openEditPrinter" persistent>
      <q-card style="width: 400px; max-width: 90vw;">
        <q-form @submit.prevent="saveEdit">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Modificar impresora</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section>
            <q-input
              :rules="[requiredRule]"
              filled
              v-model="printer.name"
              label="Nombre"
              autofocus
              class="q-mb-md"
            />
            <q-input
              :rules="[requiredRule]"
              filled
              v-model="printer.ip"
              label="Dirección IP"
              class="q-mb-md"
            />
            <q-input
              :rules="[requiredRule]"
              filled
              v-model="printer.device"
              label="Dispositivo"
              class="q-mb-md"
            />
            <q-select
              :rules="[requiredRule]"
              filled
              v-model="printer.type"
              label="Tipo"
              :options="options"
              class="q-mb-md"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-gutter-sm">
            <q-btn
              color="negative"
              label="Eliminar"
              @click="confirmDelete"
              flat
            />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" flat />
            <q-btn
              icon="refresh"
              color="info"
              @click.stop="reconnectPrinter(printer)"
            />
            <q-btn color="primary" label="Guardar" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Add Printer Dialog -->
    <q-dialog v-model="openAddPrinter" persistent>
      <q-card style="width: 400px; max-width: 90vw;">
        <q-form @submit.prevent="savePrinter">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar impresora</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section>
            <q-input
              :rules="[requiredRule]"
              filled
              v-model="printer.name"
              label="Nombre"
              autofocus
              class="q-mb-md"
            />
            <q-input
              :rules="[requiredRule]"
              filled
              v-model="printer.ip"
              label="Dirección IP"
              class="q-mb-md"
            />
            <q-input
              :rules="[requiredRule]"
              filled
              v-model="printer.device"
              label="Dispositivo"
              class="q-mb-md"
            />
            <q-select
              :rules="[requiredRule]"
              filled
              v-model="printer.type"
              label="Tipo"
              :options="options"
              class="q-mb-md"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-gutter-sm">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" flat />
            <q-btn color="primary" label="Agregar" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="configToPrint" persistent>
      <q-card style="width: 400px; max-width: 90vw;">
        <q-form @submit.prevent="onSubmitConfig">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Configuración de impresión</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="configToPrint = false" />
          </q-card-section>
          <q-card-section>
            <q-input
              :rules="[requiredRule]"
              filled
              v-model="quantityToPrint"
              label="Cantidad de impresiones"
              autofocus
              class="q-mb-md"
            />
            <q-select
              :rules="[requiredRule]"
              filled
              v-model="size"
              label="Tamaño de impresión"
              option-value="value"
              option-label="label"
              :options="sizeOptions"
              class="q-mb-md"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-gutter-sm">
            <q-btn color="secondary" label="Cancelar" @click="configToPrint = false" flat />
            <q-btn color="primary" label="Guardar" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Advertence Dialog -->
    <q-dialog v-model="advertenceDialog" persistent>
      <q-card class="q-pa-md q-mb-md bg-grey-1">
        <q-card-section>
          <div class="text-h6 text-primary">
            ⚠️ Importante: Activación del sistema de impresión
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pt-none">
          <ol class="q-pl-md">
            <li class="q-mb-sm">
              <span class="text-weight-medium text-subtitle1">Descarga el archivo de configuración.</span><br />
              Este archivo es necesario para enlazar las impresoras al sistema.
            </li>
            <li class="q-mb-sm">
              <span class="text-weight-medium text-subtitle1">Ejecútalo en el dispositivo donde estén instaladas las impresoras.</span><br />
              Asegúrate de hacerlo con permisos de administrador para evitar errores.
            </li>
            <li class="q-mb-sm">
              <span class="text-weight-medium text-subtitle1">Ingresa tu número de CUIT.</span><br />
              Esto permitirá identificar la empresa y registrar las impresoras automáticamente.
            </li>
            <li class="q-mb-sm">
              <span class="text-weight-medium text-subtitle1">Verifica si las impresoras fueron agregadas automáticamente.</span><br />
              Si no aparecen en el sistema, continua con la carga manual.
            </li>
            <li class="q-mb-sm">
              <span class="text-weight-medium text-subtitle1">Carga manual de impresoras (si es necesario):</span>
              <ul class="q-pl-md q-mt-xs">
                <li>Ingresa <strong>el nombre exacto de la impresora</strong> (debe coincidir con el nombre en el sistema operativo).</li>
                <li>Ingresa <strong>la IP de la impresora</strong>. <br />
                  <em>Si no conoces la IP, puedes ingresar el nombre de la impresora en este campo.</em>
                </li>
                <li>Ingresa <strong>el nombre del dispositivo</strong> donde se encuentra instalada la impresora.</li>
              </ul>
            </li>
            <li>
              <span class="text-weight-medium">Guarda los cambios y verifica la conexión.</span><br />
              El sistema debería detectar y vincular correctamente la impresora.
            </li>
          </ol>
        </q-card-section>
        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn
            color="negative"
            icon="close"
            label="Cerrar"
            @click="advertenceDialog = false"
          />
          <q-btn
            color="primary"
            icon="download"
            label="Descargar archivo"
            href="https://pub-1ee8b00ceed2443c917a8188cf6ed6a4.r2.dev/apk/main.exe"
            target="_blank"
            type="a"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Bluetooth Printers Dialog -->
    <q-dialog v-model="dialogPrintersVisible" persistent>
      <q-card style="width: 400px; max-width: 90vw;">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="bluetooth_searching" size="md" class="q-mr-sm" />
          <div class="text-h6">Impresoras encontradas</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="dialogPrintersVisible = false" />
        </q-card-section>
        <q-card-section>
          <q-list separator>
            <q-item
              v-for="printer in printersBluetooth"
              :key="printer.id"
              class="q-pa-sm"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="print" color="primary" size="32px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ printer.name || 'Sin nombre' }}</q-item-label>
                <q-item-label caption>
                  <q-icon name="bluetooth" size="xs" class="q-mr-xs" />
                  {{ printer.address || 'Sin dirección' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  color="positive"
                  icon="link"
                  label="Conectar"
                  dense
                  @click.stop="connectPrinter(printer)"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <div v-if="printersBluetooth.length === 0" class="text-center q-mt-md">
            <q-icon name="info" size="50px" class="text-grey-5" />
            <div class="q-mt-sm">No se encontraron impresoras.</div>
            <div class="q-mt-sm">
              Si su impresora está conectada, puede intentar conectarla manualmente.
            </div>
            <div class="q-mt-sm q-gutter-sm">
              <q-btn
                color="secondary"
                label="Escanear impresoras otra vez"
                icon="refresh"
                @click="scanner"
              />
              <q-btn
                color="primary"
                label="Agregar impresora manualmente"
                icon="add_circle"
                @click="openAddPrinter = true"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Confirm Delete Dialog -->
    <q-dialog v-model="confirmDeleteDialog">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">¿Eliminar impresora?</div>
          <div>Esta acción no se puede deshacer.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deletePrinter"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { Notify, Platform, Loading, Screen, QSpinnerRadio, QSpinnerGrid, QSpinnerHourglass, QSpinnerGears, useQuasar } from 'quasar'
import { CapacitorThermalPrinter } from 'capacitor-thermal-printer'
import { Device } from '@capacitor/device'
import { api } from 'src/boot/axios'
import { loading, notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'

const isAndroid = Platform.is.android
const $q = useQuasar()
const isMobile = computed(() => Screen.lt.sm)
const store = authentication()
const { company_session: company } = store?.userSession
const dialogPrintersVisible = ref(false)
const printersBluetooth = ref([])
const advertenceDialog = ref(false)
const configToPrint = ref(false)
const printers = ref([])
const info = ref({})
const options = ['Bluetooth', 'Red']
const printer = reactive({
  name: '',
  ip: '',
  device: '',
  type: 'Bluetooth'
})
const filter = ref('')
const size = ref(company?.company_config?.other?.printer?.size)
const sizeOptions = [
  { label: '44mm', value: 29 },
  { label: '57mm', value: 32 },
  { label: '58mm', value: 40 },
  { label: '76mm', value: 48 },
  { label: '80mm', value: 58 },
  { label: '110mm', value: 72 }
]
const openAddPrinter = ref(false)
const quantityToPrint = ref(company?.company_config?.other?.printer?.quantityToPrint || 1)
const openEditPrinter = ref(false)
const confirmDeleteDialog = ref(false)
const columns = [
  { name: 'id', align: 'left', label: 'Código', field: 'id', sortable: true },
  { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
  { name: 'ip', align: 'left', label: 'IP', field: 'ip', sortable: true },
  { name: 'device', align: 'left', label: 'Dispositivo', field: 'device', sortable: true }
]
const paginationConfig = ref({
  rowsPerPage: 10,
  rowsNumber: 10,
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  page: 1
})

const params = reactive({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 10,
  page: 1,
  dataSearch: {
    id: '',
    name: ''
  }
})

const requiredRule = val => !!val || 'El campo es requerido.'

const filteredPrinters = computed(() => {
  if (!filter.value) return printers.value
  const f = filter.value.toLowerCase()
  return printers.value.filter(p =>
    (p.name && p.name.toLowerCase().includes(f)) ||
    (p.ip && p.ip.toLowerCase().includes(f)) ||
    (p.device && p.device.toLowerCase().includes(f))
  )
})

// --- API helpers ---
function resetPrinterForm () {
  printer.name = ''
  printer.ip = ''
  printer.device = info.value?.name || ''
  printer.type = 'Bluetooth'
}

function handleError (err, fallbackMsg = 'Ocurrió un error inesperado') {
  Loading.hide()
  Notify.create({
    message: err?.message || fallbackMsg,
    icon: 'warning',
    color: 'negative'
  })
}

/**
 * Save company config
 * @param {Object} data
 */

const onSubmitConfig = async () => {
  try {
    loading(true)
    const { data } = await api.post('company-configs', {
      ...company.company_config,
      other: {
        ...company.company_config.other,
        printer: {
          quantityToPrint: quantityToPrint.value,
          size: size.value
        }
      }
    })
    store.setCompanySession({
      ...company.value,
      company_config: data
    })
    notify('Guardado exitosamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading(false)
  }
}

// --- Bluetooth scan ---
async function scanner () {
  try {
    Loading.show({
      spinner: QSpinnerRadio,
      message: 'Escaneando impresoras Bluetooth...'
    })
    await CapacitorThermalPrinter.startScan()
  } catch (error) {
    handleError(error, 'Error al escanear impresoras')
    Loading.hide()
  }
}

// --- Bluetooth connect ---
async function reconnectPrinter (printerObj) {
  try {
    Loading.show({
      spinner: QSpinnerRadio,
      message: `Conectando a ${printerObj.name || printerObj.ip}...`
    })
    const device = await CapacitorThermalPrinter.connect({ address: printerObj.ip })
    if (device === null) {
      notify('No se pudo conectar con la impresora intente otra vez', 'negative', 'warning')
      return
    }
    Notify.create({
      message: `Conectado a ${printerObj.name || printerObj.ip}`,
      color: 'positive',
      icon: 'bluetooth_connected'
    })
    await printTest()
    editPrinter(null, printerObj)
  } catch (err) {
    handleError(err, 'No se pudo conectar a la impresora')
  } finally {
    Loading.hide()
  }
}

// --- Bluetooth connect ---
async function connectPrinter (printerObj) {
  try {
    Loading.show({
      spinner: QSpinnerRadio,
      message: `Conectando a ${printerObj.name || printerObj.address}...`
    })
    const device = await CapacitorThermalPrinter.connect({ address: printerObj.address })
    if (device === null) {
      notify('No se pudo conectar con la impresora intente otra vez', 'negative', 'warning')
      return
    }
    Notify.create({
      message: `Conectado a ${printerObj.name || printerObj.address}`,
      color: 'positive',
      icon: 'bluetooth_connected'
    })
    await printTest()
    printer.name = printerObj.name
    printer.ip = printerObj.address
    printer.device = info.value?.name || ''
    printer.type = 'Bluetooth'
    openAddPrinter.value = true
  } catch (err) {
    handleError(err, 'No se pudo conectar a la impresora')
  } finally {
    Loading.hide()
  }
}

const printTest = async () => {
  try {
    await CapacitorThermalPrinter.begin()
      .align('center')
      .bold()
      .text('Impresora: ' + printer.name)
      .text('\n')
      .text('Direccion: ' + printer.ip)
      .text('\n')
      .text('Configurada con exito')
      .clearFormatting()
      .cutPaper()
      .write()
  } catch (error) {
    scanner()
    notify(error.message, 'negative', 'warning')
  }
}

// --- CRUD ---
async function getPrinters (customParams = params) {
  try {
    Loading.show({
      spinner: QSpinnerGrid,
      message: 'Cargando impresoras...'
    })
    const { data } = await api.get('printers', { params: customParams })
    printers.value = data.data
    paginationConfig.value.rowsNumber = data.total
  } catch (err) {
    handleError(err, 'No se pudieron obtener las impresoras')
  } finally {
    Loading.hide()
  }
}

async function savePrinter () {
  try {
    Loading.show({
      spinner: QSpinnerHourglass,
      message: 'Agregando impresora...'
    })
    await api.post('printers', { ...printer })
    Notify.create({
      message: 'Impresora creada exitosamente',
      icon: 'check_circle',
      color: 'positive'
    })
    openAddPrinter.value = false
    await getPrinters()
    resetPrinterForm()
  } catch (err) {
    handleError(err, 'No se pudo crear la impresora')
  } finally {
    Loading.hide()
  }
}

function editPrinter (_, row) {
  Object.assign(printer, row)
  openEditPrinter.value = true
}

async function saveEdit () {
  try {
    Loading.show({
      spinner: QSpinnerHourglass,
      message: 'Guardando cambios...'
    })
    await api.put(`printers/${printer.id}`, { ...printer })
    Notify.create({
      message: 'Impresora editada exitosamente',
      icon: 'check_circle',
      color: 'positive'
    })
    openEditPrinter.value = false
    await getPrinters()
    resetPrinterForm()
  } catch (err) {
    handleError(err, 'No se pudo editar la impresora')
  } finally {
    Loading.hide()
  }
}

function confirmDelete () {
  confirmDeleteDialog.value = true
}

async function deletePrinter () {
  try {
    Loading.show({
      spinner: QSpinnerGears,
      message: 'Eliminando impresora...'
    })
    await api.delete(`printers/${printer.id}`)
    Notify.create({
      message: 'Impresora eliminada exitosamente',
      icon: 'check_circle',
      color: 'positive'
    })
    openEditPrinter.value = false
    confirmDeleteDialog.value = false
    await getPrinters()
    resetPrinterForm()
  } catch (err) {
    handleError(err, 'No se pudo eliminar la impresora')
  } finally {
    Loading.hide()
  }
}

function closeModal () {
  openAddPrinter.value = false
  openEditPrinter.value = false
  dialogPrintersVisible.value = false
  resetPrinterForm()
}

// --- Pagination ---
async function setPagination ({ pagination }) {
  info.value = await Device.getInfo()
  printer.device = info.value.name
  params.sortOrder = pagination.descending ? 'asc' : 'desc'
  params.page = pagination.page
  params.sortBy = pagination.sortBy ?? params.sortBy
  params.perPage = pagination.rowsPerPage
  Object.assign(paginationConfig.value, pagination)
  await getPrinters(params)
}

// --- Search ---
function searchData (data) {
  for (const key in params.dataSearch) {
    params.dataSearch[key] = data
  }
  params.page = 1
  getPrinters(params)
}

// --- Watchers ---
watch(filter, (val) => {
  searchData(val)
})

// --- Mounted ---
onMounted(async () => {
  info.value = await Device.getInfo()
  printer.device = info.value.name
  if ($q.platform.is.nativeMobile) {
    CapacitorThermalPrinter.addListener('discoverDevices', async ({ devices }) => {
      printersBluetooth.value = devices
    })
    CapacitorThermalPrinter.addListener('discoveryFinish', () => {
      dialogPrintersVisible.value = true
      Loading.hide()
    })
  }
  await getPrinters(params)
})
</script>

<style scoped>
.main-btn {
  min-width: 160px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 24px;
}
.modern-table {
  border-radius: 14px;
  font-size: 1rem;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
}
.modern-list {
  max-width: 600px;
  margin: 0 auto;
}
.modern-card {
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.07);
}
@media (max-width: 600px) {
  .modern-table {
    font-size: 0.95rem;
  }
  .main-btn {
    font-size: 1rem;
    min-width: 120px;
  }
  .modern-card {
    width: 93vw !important;
    max-width: 98vw !important;
  }
}
</style>
