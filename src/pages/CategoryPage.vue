<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn
          color="primary"
          @click="openAddCategory = true"
          icon="add_circle"
        />
      </div>
      <div class="col-12">
        <q-table
          title="Categorías"
          row-key="name"
          :columns="columns"
          :rows="categories"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editCategory"
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
    <q-dialog v-model="openEditCategory" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Modificar categoría</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="category.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-12">
              <q-select
                use-input
                filled
                label="Iva (%)"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="category.aliquot_type"
                :options="aliquotTypes"
                @filter="getAliquotTypes"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-toggle
                v-model="category.show_catalog"
                label="Mostrar en catálogo"
                :true-value="1"
                :false-value="0"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteCategory" :loading="visible" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddCategory" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveCategory">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Agregar categoría</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="category.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-12">
              <q-select
                use-input
                filled
                label="Iva (%)"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="category.aliquot_type"
                :options="aliquotTypes"
                @filter="getAliquotTypes"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-toggle
                v-model="category.show_catalog"
                label="Mostrar en catálogo"
                :true-value="1"
                :false-value="0"
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
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'
export default {
  data () {
    return {
      categories: [],
      aliquotTypes: [],
      category: {
        show_catalog: 0
      },
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
      openAddCategory: false,
      openEditCategory: null,
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
          name: 'aliquot_type',
          align: 'left',
          label: 'Impuesto',
          field: 'aliquot_type',
          format: row => row?.Desc || '-',
          sortable: true
        },
        {
          name: 'show_catalog',
          align: 'left',
          label: 'Mostrar en catálogo',
          field: 'show_catalog',
          format: row => row ? 'Si' : 'No'
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
  computed: {
    ...mapState(authentication, ['userSession'])
  },
  methods: {
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddCategory = false
      this.openEditCategory = false
      this.category = {
        show_catalog: 0
      }
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
      this.getCategories(this.params)
    },
    /**
     * Get all categories
     */
    getCategories (params = this.params) {
      this.visible = true
      this.$api.get('categories', { params })
        .then(({ data }) => {
          this.categories = data.data
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getAliquotTypes (value, update) {
      try {
        const { data } = await this.$apiArca.get('metadata/aliquot-types', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.aliquotTypes = data
        })
      } catch (err) {
        notify(err.message, 'negative', 'warning')
      }
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      console.log(data.pagination.descending)
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getCategories(this.params)
    },
    /**
     * Save categories
     */
    saveCategory () {
      this.visible = true
      this.$api.post('categories', this.category)
        .then(({ data }) => {
          this.getCategories()
          this.openAddCategory = false
          this.visible = false
          this.category = {
            show_catalog: 0
          }
          Notify.create({
            message: 'Categoría creada exitosamente',
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
     * View category
     */
    editCategory (event, row, index) {
      this.openEditCategory = true
      this.category = row
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`categories/${this.category.id}`, this.category)
        .then(({ data }) => {
          this.getCategories()
          this.openEditCategory = false
          this.visible = false
          this.category = {
            show_catalog: 0
          }
          Notify.create({
            message: 'Categoría editada exitosamente',
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
     * Delete category
     */
    deleteCategory () {
      this.visible = true
      this.$api.delete(`categories/${this.category.id}`)
        .then(({ data }) => {
          this.getCategories()
          this.openEditCategory = false
          this.visible = false
          this.category = {
            show_catalog: 0
          }
          Notify.create({
            message: 'Categoría eliminada exitosamente',
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
