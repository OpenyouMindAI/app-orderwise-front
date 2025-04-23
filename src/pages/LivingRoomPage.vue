<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddLivingRoom = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Sala de estar"
          row-key="name"
          no-data-label="Registro no encontrado"
          binary-state-sort
          v-model:pagination="paginationConfig"
          :columns="columns"
          :rows="livingRooms"
          :loading="visible"
          :filter="filter"
          @row-click="editLivingRoom"
          @request="setPagination"
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
    <q-dialog v-model="openEditLivingRoom" persistent maximized>
      <q-card class="column">
        <q-form @submit="saveEditLivingRoom">
          <q-card-section class="row items-center q-py-sm bg-primary text-white">
            <div class="text-h6">Modificar sala de estar</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-py-sm">
            <q-input
              :rules="[val => !!val || 'El campo es requerido.']"
              filled
              v-model="livingRoom.name"
              autofocus
              dense
              label="Nombre"
            />
          </q-card-section>
          <q-card-section class="q-py-none flex justify-center">
            <draggable-resizable-container
              :grid="[20, 20]"
              :show-grid="true"
              class="container full-width"
            >
              <draggable-resizable-vue
                v-for="(table, index) in livingRoom.tables"
                :key="table.id"
                v-model:x="table.x"
                v-model:y="table.y"
                v-model:h="table.height"
                v-model:w="table.width"
                :class="tableSelected?.id === table.id ? 'bg-secondary text-white' : 'bg-primary text-white'"
                :handles-size="10"
                @deactivated="onDeactivated(table, index)"
                @activated="onActivated(table, index)"
              >
              <span class="absolute-center">
                {{ table.name }}
              </span>
              </draggable-resizable-vue>
            </draggable-resizable-container>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn color="primary" label="Agregar mesa" @click="(openAddTable = true)"/>
            <q-btn color="secondary" label="Modificar mesa" @click="(openEditTable = true)" v-if="tableSelected"/>
            <q-btn color="negative" label="Eliminar mesa" @click="confirmDeleteTable" v-if="tableSelected"/>
            <q-badge class="bg-secondary q-ml-md text-subtitle1 q-py-xs q-px-md" v-if="tableSelected">
              {{ tableSelected.name }}
            </q-badge>
            <q-space/>
            <q-btn color="primary" label="Guardar" type="submit" :loading="loadingEdit"/>
            <q-btn color="secondary" label="Imprimir Qrs" @click="printQr"/>
            <q-btn color="negative" label="Eliminar" @click="deleteLivingRoom" :loading="loadingEdit" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddLivingRoom" persistent maximized>
      <q-card>
        <q-form @submit="saveLivingRoom">
          <q-card-section class="row q-py-xs items-center text-white bg-primary">
            <div class="text-h6">Agregar sala de estar</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-py-sm">
            <q-input
              :rules="[val => !!val || 'El campo es requerido.']"
              filled
              v-model="livingRoom.name"
              autofocus
              label="Nombre"
              dense
            />
          </q-card-section>
          <q-card-section class="q-py-none flex justify-center">
            <draggable-resizable-container
              :grid="[20, 20]"
              :show-grid="true"
              class="container"
            >
              <draggable-resizable-vue
                v-for="(table, index) in livingRoom.tables"
                :key="table.id"
                v-model:x="table.x"
                v-model:y="table.y"
                v-model:h="table.height"
                v-model:w="table.width"
                :class="tableSelected?.id === table.id ? 'bg-secondary text-white' : 'bg-primary text-white'"
                :handles-size="10"
                @deactivated="onDeactivated(table, index)"
              >
                <span class="absolute-center">
                  {{ table.name }}
                </span>
              </draggable-resizable-vue>
            </draggable-resizable-container>
          </q-card-section>
          <q-card-actions class="text-primary q-px-md">
            <q-btn color="primary" label="Agregar mesa" @click="(openAddTable = true)"/>
            <q-btn color="secondary" label="Modificar mesa" @click="(openEditTable = true)" v-if="tableSelected"/>
            <q-btn color="negative" label="Eliminar mesa" @click="confirmDeleteTable" v-if="tableSelected"/>
            <q-space/>
            <q-btn color="primary" label="Guardar" type="submit" :loading="loadingSave"/>
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddTable" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="addTable">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar mesa</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="openAddTable = false" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="tableName"
                autofocus
                label="Nombre"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Agregar" type="submit"/>
            <!-- <q-btn color="negative" label="Eliminar" @click="deleteLivingRoom" :loading="visible" /> -->
            <q-btn color="secondary" label="Cancelar" @click="openAddTable = false" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openEditTable" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-form @submit="onDeactivated(tableSelected)">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Modificar mesa</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="openEditTable = false" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <!-- <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center">
              <QrcodeVue
                :value="JSON.stringify({id: tableSelected.id, name: tableSelected.name})"
                :size="150"
                level="H"
              />
            </div> -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="tableSelected.name"
                autofocus
                label="Nombre"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit"/>
            <!-- <q-btn color="negative" label="Eliminar" @click="deleteLivingRoom"/> -->
            <q-btn color="secondary" label="Cancelar" @click="openEditTable = false" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <div id="printMe" v-show="false" class="containerQr">
      <div style="width: 100%; text-align: center;">
        <h2>
          {{ livingRoom.name }}
        </h2>
      </div>
      <div
        v-for="table in livingRoom.tables"
        :key="table.id"
        class="columnQr"
      >
        <img :id="table.id" :alt="table.name" width="200" height="200">
        <span>{{ table.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'
import QRCode from 'qrcode'
import { nextTick } from 'vue'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'
export default {
  components: {
    DraggableResizableContainer,
    DraggableResizableVue
  },
  data () {
    return {
      tableName: null,
      openAddTable: false,
      loadingSave: false,
      loadingEdit: false,
      tableSelected: null,
      livingRooms: [],
      openEditTable: false,
      livingRoom: {
        tables: []
      },
      visible: false,
      openAddLivingRoom: false,
      openEditLivingRoom: null,
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
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sort: true
        },
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sort: true
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
  created () {
    this.getLivingRooms()
  },
  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice'])
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
    },
    openAddLivingRoom () {
      this.tableSelected = null
    },
    openEditLivingRoom () {
      this.tableSelected = null
    },
    livingRoom (data) {
      this.handlerQr(data?.tables || [])
    }
  },
  methods: {
    printQr () {
      this.$htmlToPaper('printMe', {
        styles: ['stylesTable.css']
      })
    },
    /**
     * Print invoice
     * @param {Object} data invoice saved
     */
    handlerQr (data) {
      const opts = {
        type: 'image/jpeg',
        errorCorrectionLevel: 'L',
        margin: 2
      }
      data.forEach(table => {
        const docQr = {
          id: table.id,
          name: table.name,
          branch_office_id: this.branchOffice?.id,
          company_id: this.userSession?.company_session_id
        }
        const encoded = btoa(JSON.stringify(docQr))
        const urlQr = `${window.location.origin}/#/menu/?tab=menu&category=all&p=${encoded}`
        nextTick(() => {
          QRCode.toDataURL(urlQr, opts, function (error, url) {
            if (error) throw error
            const img = document.getElementById(table.id)
            img.src = url
          })
        })
      })
    },
    onActivated (data, index) {
      this.tableSelected = data
      this.tableSelected.index = index
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
      this.getLivingRooms(this.params)
    },
    /**
     * Add table in living room
     */
    addTable () {
      this.livingRoom.tables.push({
        name: this.tableName,
        width: 50,
        height: 50
      })
      this.tableName = null
      this.openAddTable = false
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
      this.getLivingRooms(this.params)
    },
    /**
     * Change data table
     * @param {Object} data table
     * @param {Number} i index table
     */
    onDeactivated (data, i) {
      this.livingRoom.tables.map((table, index) => {
        if (i === index) {
          return data
        }
        return table
      })
      this.openEditTable = false
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddLivingRoom = false
      this.openEditLivingRoom = false
      this.livingRoom = { tables: [] }
    },
    /**
     * Get all livingRooms
     * @param {Object} params search params
     */
    getLivingRooms (params = this.params) {
      this.visible = true
      this.$api.get('living-rooms', { params })
        .then(({ data }) => {
          this.livingRooms = data.data
          this.visible = false
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
     * Save livingRooms
     */
    saveLivingRoom () {
      this.loadingSave = true
      this.$api.post('living-rooms', {
        user_created_id: this.userSession?.id,
        ...this.livingRoom
      })
        .then(({ data }) => {
          this.getLivingRooms()
          this.openAddLivingRoom = false
          this.loadingSave = false
          this.livingRoom = {
            tables: []
          }
          Notify.create({
            message: 'Sala de estar creada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingSave = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * View livingRoom
     */
    editLivingRoom (event, row, index) {
      this.openEditLivingRoom = true
      this.livingRoom = row
    },
    /**
     * Save edit
     */
    saveEditLivingRoom () {
      this.loadingEdit = true
      this.$api.put(`living-rooms/${this.livingRoom.id}`, {
        user_created_id: this.userSession?.id,
        ...this.livingRoom
      })
        .then(({ data }) => {
          this.getLivingRooms()
          this.openEditLivingRoom = false
          this.loadingEdit = false
          this.livingRoom = {
            tables: []
          }
          Notify.create({
            message: 'Sala de estar editada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingEdit = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Delete livingRoom
     */
    deleteLivingRoom () {
      this.loadingEdit = true
      this.$api.delete(`living-rooms/${this.livingRoom.id}`)
        .then(({ data }) => {
          this.getLivingRooms()
          this.openEditLivingRoom = false
          this.loadingEdit = false
          this.livingRoom = {
            tables: []
          }
          Notify.create({
            message: 'Sala de estar eliminada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingEdit = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Confirm delete table
     */
    confirmDeleteTable () {
      if (this.tableSelected.id) {
        this.deleteTable(this.tableSelected)
        this.livingRoom.tables.splice(this.tableSelected.index, 1)
      } else {
        this.livingRoom.tables.splice(this.tableSelected.index, 1)
      }
    },
    /**
     * Delete table
     */
    deleteTable (data) {
      this.$api.delete(`tables/${data.id}`)
        .then(({ data }) => {
          this.getLivingRooms()
          this.tableSelected = null
          Notify.create({
            message: 'Mesa eliminada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
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
<style>
.container {
  height: 400px;
  max-width: 900px;
  border: 1px solid black;
}
</style>
