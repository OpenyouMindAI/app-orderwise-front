<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddProduct = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Productos"
          row-key="name"
          :columns="columns"
          :rows="products"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editProduct"
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
    <q-dialog v-model="openEditProduct" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar producto</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="product.barcode"
                autofocus
                label="Código de barra"
                hint=""
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="product.name"
                autofocus
                label="Descripción"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="product.price"
                label="Precio"
                type="number"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Categoria"
                input-debounce="0"
                option-label="name"
                option-value="id"
                v-model="category"
                :options="categories"
                :rules="[val => !!val || 'El campo es requerido.']"
                @filter="filterCategories"
              />
            </div>
          </q-card-section>
          <q-card-section class="row q-py-none">
            <div class="col-10">
              <q-file
                filled
                dense
                v-model="productImage"
                label="Adjunte foto de su documento de identidad"
                @update:model-value="changeImage"
              />
            </div>
            <div class="col-2 text-right" >
              <q-btn color="primary" round icon="add" dense @click="addImage"/>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row items-start q-mt-sm">
              <q-img
                v-for="(image, index) in product.images"
                :key="image"
                class="q-ml-xs"
                :src="image.url"
                style="max-width: 32%; height: 150px;"
              >
                <q-btn
                  class="absolute all-pointer-events"
                  size="sm"
                  icon="close"
                  color="negative"
                  style="top: 1px; right: 1px"
                  push
                  dense
                  round
                  @click="deleteImage(image, index)"
                >
                  <q-tooltip>
                    Eliminar Imagen
                  </q-tooltip>
                </q-btn>
              </q-img>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
            <q-btn color="negative" label="Eliminar" @click="deleteProduct" :loading="visible" />
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddProduct" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveProduct">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar producto</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="product.barcode"
                autofocus
                label="Código de barra"
                hint=""
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="product.name"
                autofocus
                label="Descripción"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="product.price"
                label="Precio"
                type="number"
                step=".01"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Categoria"
                input-debounce="0"
                option-label="name"
                option-value="id"
                v-model="category"
                :options="categories"
                :rules="[val => !!val || 'El campo es requerido.']"
                @filter="filterCategories"
              />
            </div>
          </q-card-section>
          <q-card-section class="row q-py-none">
            <div class="col-10">
              <q-file
                filled
                dense
                v-model="productImage"
                label="Adjunte foto de su documento de identidad"
                @update:model-value="changeImage"
              />
            </div>
            <div class="col-2 text-right" >
              <q-btn color="primary" round icon="add" dense @click="addImage"/>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row items-start q-mt-sm">
              <q-img
                v-for="(image, index) in product.images"
                :key="image"
                class="q-ml-xs"
                :src="image.url"
                style="max-width: 32%; height: 150px;"
              >
                <q-btn
                  class="absolute all-pointer-events"
                  size="sm"
                  icon="close"
                  color="negative"
                  style="top: 1px; right: 1px"
                  push
                  dense
                  round
                  @click="deleteImage(image, index)"
                >
                  <q-tooltip>
                    Eliminar Imagen
                  </q-tooltip>
                </q-btn>
              </q-img>
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
export default {
  data () {
    return {
      productImage: null,
      products: [],
      product: {
        images: []
      },
      categories: [],
      imageUrl: null,
      category: null,
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
          barcode: '',
          name: '',
          'category.name': '',
          price: ''
        }
      },
      visible: false,
      openAddProduct: false,
      openEditProduct: null,
      userSession: null,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
        {
          name: 'barcode',
          align: 'left',
          label: 'Código de barra',
          field: 'barcode',
          format: (val) => val ?? '-',
          sortable: true
        },
        {
          name: 'name',
          align: 'left',
          label: 'Descripción',
          field: 'name',
          sortable: true
        },
        {
          name: 'category',
          align: 'left',
          label: 'Categoria',
          field: row => row.category.name,
          sortable: true
        },
        {
          name: 'price',
          align: 'right',
          label: 'Precio',
          field: 'price',
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
  created () {
    this.userSession = JSON.parse(localStorage.getItem('user'))
    this.product.user_created_id = this.userSession.id
    this.product.user_updated_id = this.userSession.id
  },
  watch: {
    filter (data) {
      this.searchData(data)
    },
    category (data) {
      if (data) {
        this.product.category_id = data.id
      }
    },
    product (data) {
      this.category = data.category
    }
  },
  methods: {
    /**
     * Value image
     * @param {File} e file image
     */
    changeImage (e) {
      const self = this
      const reader = new FileReader()
      reader.readAsDataURL(e)
      reader.onload = function (e) {
        self.imageUrl = this.result
      }
    },
    /**
     * Delete image
     * @param {Object} image data image
     * @param {Number} index index image
     */
    deleteImage (image, index) {
      if (image.id) {
        this.$api.delete(`product-images/${image.id}`)
          .then(({ data }) => {
            this.product.images.splice(index, 1)
          })
          .catch(err => {
            this.visible = false
            Notify.create({
              message: err.message,
              icon: 'warning',
              color: 'negative'
            })
          })
      } else {
        this.product.images.splice(index, 1)
      }
    },
    /**
     * Model product
     * @param {Object} data product
     */
    modelData (data, put = false) {
      const formData = new FormData()
      if (put) {
        formData.append('_method', 'put')
      }
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key]
          if (typeof data[key] !== 'object') {
            formData.append(key, element)
          }
        }
      }
      data.images.forEach((element, index) => {
        formData.append(`images[${index}]`, element.image)
      })
      return formData
    },
    /**
     * Add image to product
     */
    addImage () {
      this.product.images.push({
        image: this.productImage,
        url: this.imageUrl
      })
      this.productImage = null
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterCategories (value, update) {
      this.$api.get('categories', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.categories = data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddProduct = false
      this.openEditProduct = false
      this.product = {
        images: []
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
      this.getProducts(this.params)
    },
    /**
     * Get all products
     */
    getProducts (params = this.params) {
      this.visible = true
      this.$api.get('products', { params })
        .then(({ data }) => {
          this.products = data.data
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
      this.getProducts(this.params)
    },
    /**
     * Save products
     */
    saveProduct () {
      this.visible = true
      this.$api.post('products', this.modelData(this.product))
        .then(({ data }) => {
          this.getProducts()
          this.openAddProduct = false
          this.visible = false
          this.product = {
            images: []
          }
          Notify.create({
            message: 'Producto creado exitosamente',
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
     * View product
     */
    editProduct (event, row, index) {
      this.openEditProduct = true
      this.product = row
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.post(`products/${this.product.id}`, this.modelData(this.product, true))
        .then(({ data }) => {
          this.getProducts()
          this.openEditProduct = false
          this.visible = false
          this.product = {
            images: []
          }
          Notify.create({
            message: 'Producto editado exitosamente',
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
     * Delete product
     */
    deleteProduct () {
      this.visible = true
      this.$api.delete(`products/${this.product.id}`)
        .then(({ data }) => {
          this.getProducts()
          this.openEditProduct = false
          this.visible = false
          this.product = {
            images: []
          }
          Notify.create({
            message: 'Producto eliminado exitosamente',
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
