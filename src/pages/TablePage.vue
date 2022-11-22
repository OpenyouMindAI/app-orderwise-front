<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddTable = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <draggable-resizable-container
          :grid="[20, 20]"
          :show-grid="true"
          class="container"
        >
          <draggable-resizable-vue
            v-for="table in tables"
            :key="table.id"
            v-model:x="table.x"
            v-model:y="table.y"
            v-model:h="table.height"
            v-model:w="table.width"
            class="element-one"
            :handles-size="10"
            @deactivated="onDeactivated(table)"
          >
            {{ table.name }}
          </draggable-resizable-vue>
        </draggable-resizable-container>
      </div>
      <!-- <div class="col-12">
        <q-table
          title="Mesas"
          row-key="name"
          :columns="columns"
          :rows="tables"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editTable"
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
      </div> -->
    </div>
    <q-dialog v-model="openEditTable" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar mesa</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="table.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="table.number"
                autofocus
                label="Número"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
            <q-btn color="negative" label="Eliminar" @click="deleteTable" :loading="visible" />
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddTable" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveTable">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar mesa</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="table.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="table.number"
                autofocus
                label="Número"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible"/>
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'

export default {
  components: {
    DraggableResizableContainer,
    DraggableResizableVue
  },
  data () {
    return {
      tables: [],
      table: {},
      visible: false,
      openAddTable: false,
      openEditTable: null,
      userSession: null
    }
  },
  created () {
    this.userSession = JSON.parse(localStorage.getItem('user'))
    this.table.user_created_id = this.userSession.id
    this.table.user_updated_id = this.userSession.id
    this.getTables()
  },
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  methods: {
    onDeactivated (data) {
      console.log(data)
      this.saveEdit(data)
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddTable = false
      this.openEditTable = false
      this.table = {}
    },
    /**
     * Get all tables
     */
    getTables () {
      this.visible = true
      this.$api.get('tables', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.tables = data
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
     * Save tables
     */
    saveTable () {
      this.visible = true
      this.$api.post('tables', this.table)
        .then(({ data }) => {
          this.getTables()
          this.openAddTable = false
          this.visible = false
          this.table = {}
          Notify.create({
            message: 'Mesa creada exitosamente',
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
     * View table
     */
    editTable (event, row, index) {
      this.openEditTable = true
      this.table = row
    },
    /**
     * Save edit
     */
    saveEdit (data) {
      this.visible = true
      this.$api.put(`tables/${data.id}`, data)
        .then(({ data }) => {
          this.getTables()
          this.openEditTable = false
          this.visible = false
          Notify.create({
            message: 'Mesa editada exitosamente',
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
     * Delete table
     */
    deleteTable () {
      this.visible = true
      this.$api.delete(`tables/${this.table.id}`)
        .then(({ data }) => {
          this.getTables()
          this.openEditTable = false
          this.visible = false
          this.table = {}
          Notify.create({
            message: 'Mesa eliminada exitosamente',
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
<style>
.container {
  width: 100%;
  height: 79vh;
  border: 1px solid black;
}

.element-one {
  background-color: blue;
  color: white;
}
</style>
