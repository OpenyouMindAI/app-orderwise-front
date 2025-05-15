<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right q-gutter-sm">
        <q-btn
          color="secondary"
          @click="advertenceDialog = true"
          icon="print_connect"
          label="Imprimir directamente"
        >
          <q-tooltip class="text-body2">
           Activar el imprimir directamente
          </q-tooltip>
        </q-btn>
        <q-btn
          color="primary"
          @click="openAddPrinter = true"
          icon="add_circle"
        />
      </div>
      <div class="col-12">
        <q-table
          title="Impresoras"
          row-key="name"
          :columns="columns"
          :rows="printers"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editPrinter"
          @request="setPagination"
          no-data-label="Registro no encontrado"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top-right>
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
        </q-table>
      </div>
    </div>
    <q-dialog v-model="openEditPrinter" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Modificar moneda</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="printer.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="printer.ip"
                autofocus
                label="Símbolo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="printer.device"
                autofocus
                label="Dispositivo"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deletePrinter" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddPrinter" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="savePrinter">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar moneda</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="printer.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="printer.ip"
                autofocus
                label="Símbolo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="printer.device"
                autofocus
                label="Dispositivo"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
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
  </div>
</template>

<script>
import { Notify } from 'quasar'
export default {
  data () {
    return {
      advertenceDialog: false,
      printers: [],
      printer: {},
      filter: '',
      /**
       * Params search
       * @type {Object}
       */
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 1,
        dataSearch: {
          id: '',
          name: ''
        }
      },
      visible: false,
      openAddPrinter: false,
      openEditPrinter: null,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'ip',
          align: 'left',
          label: 'Ip',
          field: 'ip',
          sortable: true
        },
        {
          name: 'device',
          align: 'left',
          label: 'Dispositivo',
          field: 'device',
          sortable: true
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      }
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
  },
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  methods: {
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddPrinter = false
      this.openEditPrinter = false
      this.printer = {}
    },
    /**
     * Search beneficiary
     * @param  {Object}
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getPrinters(this.params)
    },
    /**
     * Get all printers
     */
    getPrinters (params = this.params) {
      this.visible = true
      this.$api.get('printers', { params })
        .then(({ data }) => {
          this.printers = data.data
          this.visible = false
          this.paginationConfig.rowsNumber = data.total
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getPrinters(this.params)
    },
    /**
     * Save printers
     */
    savePrinter () {
      this.visible = true
      this.$api.post('printers', this.printer)
        .then(({ data }) => {
          this.getPrinters()
          this.openAddPrinter = false
          this.visible = false
          this.printer = {}
          Notify.create({
            message: 'Impresora creada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * View printer
     */
    editPrinter (event, row, index) {
      this.openEditPrinter = true
      this.printer = row
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`printers/${this.printer.id}`, this.printer)
        .then(({ data }) => {
          this.getPrinters()
          this.openEditPrinter = false
          this.visible = false
          this.printer = {}
          Notify.create({
            message: 'Impresora editada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Delete printer
     */
    deletePrinter () {
      this.visible = true
      this.$api.delete(`printers/${this.printer.id}`)
        .then(({ data }) => {
          this.getPrinters()
          this.openEditPrinter = false
          this.visible = false
          this.printer = {}
          Notify.create({
            message: 'Impresora eliminada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    }
  }
}
</script>
