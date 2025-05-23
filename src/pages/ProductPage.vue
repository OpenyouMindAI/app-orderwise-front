<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right q-gutter-sm">
        <q-btn color="secondary" @click="download" icon="download"/>
        <q-btn color="info" @click="openCompaniesDialog" icon="content_copy" v-if="userSession.is_root"/>
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
          :selection="multipleSelected ? 'multiple' : 'none'"
          v-model:selected="selection"
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
    <q-dialog v-model="openEditProduct" persistent maximized>
      <q-card>
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <div class="text-h6">Modificar producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="saveEdit">
          <q-tabs
            v-model="tab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="basicData" label="Datos básicos" />
            <q-tab name="images" label="Imágenes" />
            <q-tab name="stock" label="stock" v-if="!product.is_bundle"/>
            <q-tab name="product" label="Productos" v-if="product.is_bundle" />
          </q-tabs>
          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="basicData">
              <q-card-section class="q-pa-none scroll" style="height: calc(100vh - 200px);">
                <div class="row q-col-gutter-sm">
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
                      label="Nombre"
                    />
                  </div>
                  <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                    <q-input
                      :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                      filled
                      v-model="product.cost"
                      label="Costo"
                      type="number"
                    />
                  </div>
                  <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                    <q-input
                      :rules="[val => !!val || 'El campo es requerido.']"
                      filled
                      v-model="product.price"
                      label="Precio"
                      type="number"
                    />
                  </div>
                  <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                    <q-input
                      :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                      filled
                      v-model="product.minimum_stock"
                      label="Stock mínimo"
                      type="number"
                      step=".01"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-select
                      use-input
                      filled
                      label="Categoría"
                      input-debounce="0"
                      option-label="name"
                      option-value="id"
                      v-model="category"
                      :options="categories"
                      :rules="[val => !!val || 'El campo es requerido.']"
                      @filter="filterCategories"
                      @update:model-value="setCategory"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-select
                      use-input
                      filled
                      label="Iva (%)"
                      input-debounce="0"
                      option-label="Desc"
                      option-value="id"
                      v-model="product.aliquot_type"
                      :options="aliquotTypes"
                      @filter="getAliquotTypes"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-toggle
                      v-model="product.skip_stock"
                      label="Facturar sin stock"
                      :true-value="1"
                      :false-value="0"
                    />
                    <q-toggle
                      v-model="product.is_bundle"
                      label="Pack"
                      :true-value="1"
                      :false-value="0"
                    />
                    <q-toggle
                      v-model="product.is_addons"
                      label="Es un adicional"
                      :true-value="1"
                      :false-value="0"
                    />
                    <q-toggle
                      v-model="product.show_catalog"
                      label="Mostrar en catálogo"
                      :true-value="1"
                      :false-value="0"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-option-group
                      v-model="unitOfMeasure"
                      :options="unitOfMeasures"
                      color="positive"
                      inline
                    />
                  </div>
                  <div
                    class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12"
                    v-if="product.is_addons"
                  >
                    <q-select
                      use-input
                      filled
                      label="Productos a asociar"
                      input-debounce="0"
                      option-label="name"
                      option-value="id"
                      multiple
                      v-model="addonsProducts"
                      :options="addonsProductsOptions"
                      :rules="[val => !!val || 'El campo es requerido.']"
                      @filter="filterProductsAddons"
                    />
                  </div>
                  <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <q-input
                      :rules="[val => !!val || 'El campo es requerido.']"
                      filled
                      v-model="product.description"
                      autofocus
                      type="textarea"
                      label="Descripción"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-tab-panel>
            <q-tab-panel name="images">
              <q-card-section class="q-pa-none scroll" style="height: calc(100vh - 190px);">
                <div class="row q-col-gutter-sm">
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
                  <div class="col-12 row items-start q-mt-sm">
                    <q-img
                      v-for="(image, index) in product.images"
                      :key="image"
                      class="q-ml-xs"
                      :src="image.url"
                      style="max-width: 32%; height: 250px;"
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
                </div>
              </q-card-section>
            </q-tab-panel>
            <q-tab-panel name="stock">
              <stock-product :product="product"/>
            </q-tab-panel>
            <q-tab-panel name="product">
              <pack-product :product="product"/>
            </q-tab-panel>
          </q-tab-panels>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteProduct" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddProduct" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Agregar producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="saveProduct">
          <q-tabs
            v-model="tab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="basicData" label="Datos básicos" />
            <q-tab name="images" label="Imágenes" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="basicData">
              <q-card-section class="q-pa-none scroll" style="height: calc(100vh - 200px);">
                <div class="row q-col-gutter-sm">
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-input
                      filled
                      v-model="product.barcode"
                      autofocus
                      label="Código de barra"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-input
                      :rules="[val => !!val || 'El campo es requerido.']"
                      filled
                      v-model="product.name"
                      label="Nombre"
                    />
                  </div>
                  <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                    <q-input
                      :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                      filled
                      v-model="product.cost"
                      label="Costo"
                      type="number"
                    />
                  </div>
                  <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                    <q-input
                      :rules="[val => !!val || 'El campo es requerido.']"
                      filled
                      v-model="product.price"
                      label="Precio"
                      type="number"
                      step=".01"
                    />
                  </div>
                  <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                    <q-input
                      filled
                      v-model="product.minimum_stock"
                      label="Stock mínimo"
                      type="number"
                      step=".01"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-select
                      use-input
                      filled
                      label="Categoría"
                      input-debounce="0"
                      option-label="name"
                      option-value="id"
                      v-model="category"
                      :options="categories"
                      :rules="[val => !!val || 'El campo es requerido.']"
                      @filter="filterCategories"
                      @update:model-value="setCategory"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-select
                      use-input
                      filled
                      label="Iva (%)"
                      input-debounce="0"
                      option-label="Desc"
                      option-value="id"
                      v-model="product.aliquot_type"
                      :options="aliquotTypes"
                      @filter="getAliquotTypes"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12 q-gutter-x-sm">
                    <q-toggle
                      v-model="product.skip_stock"
                      label="Facturar sin stock"
                      :true-value="1"
                      :false-value="0"
                    />
                    <q-toggle
                      v-model="product.is_bundle"
                      label="Pack"
                      :true-value="1"
                      :false-value="0"
                    />
                    <q-toggle
                      v-model="product.is_addons"
                      label="Es un adicional"
                      :true-value="1"
                      :false-value="0"
                    />
                    <q-toggle
                      v-model="product.show_catalog"
                      label="Mostrar en catálogo"
                      :true-value="1"
                      :false-value="0"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-option-group
                      v-model="unitOfMeasure"
                      :options="unitOfMeasures"
                      color="positive"
                      inline
                    />
                  </div>
                  <div
                    class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12"
                    v-if="product.is_addons"
                  >
                    <q-select
                      use-input
                      filled
                      label="Productos a asociar"
                      input-debounce="0"
                      option-label="name"
                      option-value="id"
                      multiple
                      v-model="addonsProducts"
                      :options="addonsProductsOptions"
                      :rules="[val => !!val || 'El campo es requerido.']"
                      @filter="filterProductsAddons"
                    />
                  </div>
                  <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <q-input
                      :rules="[val => !!val || 'El campo es requerido.']"
                      filled
                      v-model="product.description"
                      autofocus
                      type="textarea"
                      label="Descripción"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-tab-panel>
            <q-tab-panel name="images">
              <q-card-section class="q-pa-none scroll" style="height: calc(100vh - 190px);">
                <div class="row q-col-gutter-sm">
                  <div class="col-10">
                    <q-file
                      filled
                      dense
                      v-model="productImage"
                      label="Adjunte foto de su documento de identidad"
                      @update:model-value="changeImage"
                    />
                  </div>
                  <div class="col-2 text-right">
                    <q-btn color="primary" round icon="add" dense @click="addImage"/>
                  </div>
                  <div class="col-12 row items-start q-mt-sm">
                    <q-img
                      v-for="(image, index) in product.images"
                      :key="image"
                      class="q-ml-xs"
                      :src="image.url"
                      style="max-width: 32%; height: 250px; border-radius: 10px;"
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
                </div>
              </q-card-section>
            </q-tab-panel>
          </q-tab-panels>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="companiesDialog" persistent>
      <q-card>
        <q-card-section class="flex justify-between items-center bg-primary text-white">
          <div class="text-h6">Compañías</div>
          <q-btn icon="close" flat round dense @click="companiesDialog = false" />
        </q-card-section>

        <q-card-section style="max-height: 50vh" class="scroll">
          <q-card v-for="org in companies" :key="org.id" class="q-mt-sm cursor-pointer q-py-sm">
            <q-item>
              <q-item-section avatar>
                <q-img alt="logo" :src="org.url || logo.white"/>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-subtitle1">
                  {{ org.name }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="company" :val="org.id"></q-radio>
              </q-item-section>
            </q-item>
          </q-card>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Copiar productos" color="primary" @click="copyProducts" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import { mapState } from 'pinia'
import { Notify } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import StockProduct from 'src/components/Product/StockProduct.vue'
import PackProduct from 'src/components/Product/PackProduct.vue'
import { getDownload } from 'src/const/services'
import { loading, notify } from 'src/const/mixins'
export default {
  components: { StockProduct, PackProduct },
  data () {
    return {
      productImage: null,
      companiesDialog: false,
      companies: [],
      multipleSelected: false,
      products: [],
      selection: [],
      company: null,
      addonsProducts: [],
      addonsProductsOptions: [],
      tab: 'basicData',
      unitOfMeasures: [],
      unitOfMeasure: null,
      product: {
        is_bundle: 0,
        show_catalog: 0,
        is_addons: 0,
        skip_stock: 0,
        images: []
      },
      categories: [],
      imageUrl: null,
      aliquotTypes: [],
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
        stock: true,
        withStock: true,
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
      loadingDownload: 0,
      columns: [
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
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'category',
          align: 'left',
          label: 'Categoría',
          field: row => row?.category?.name || '-'
        },
        {
          name: 'show_catalog',
          align: 'left',
          label: 'Mostrar en catálogo',
          field: 'show_catalog',
          format: row => row ? 'Si' : 'No',
          sortable: true
        },
        {
          name: 'cost',
          align: 'right',
          label: 'Costo',
          field: 'cost',
          sortable: true
        },
        {
          name: 'price',
          align: 'right',
          label: 'Precio',
          field: 'price',
          sortable: true
        },
        {
          name: 'stock',
          align: 'right',
          label: 'Stock',
          field: row => row?.is_bundle ? row.bundle_stock : row?.normal_stock
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
    this.getUnitOfMeasures()
    this.getAllCompanies()
  },
  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice'])
  },
  watch: {
    /**
     * Set pagination when branch office changes
     * @param {Object} value branch office
     */
    branchOffice (value) {
      this.setPagination({
        pagination: this.paginationConfig,
        filter: undefined
      })
    },
    openAddProduct (data) {
      this.tab = 'basicData'
    },
    openEditProduct (data) {
      this.tab = 'basicData'
    },
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
    },
    unitOfMeasure (data) {
      this.product.unit_of_measure_id = data
    }
  },
  methods: {
    /**
     * Open companies dialog
     */
    openCompaniesDialog () {
      this.companiesDialog = true
    },
    /**
     * Get all companies
     */
    async getAllCompanies () {
      try {
        const { data } = await this.$api.get('companies')
        this.companies = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Download data
     */
    async download () {
      getDownload(
        'excel/products',
        {
          stock: true,
          withStock: false,
          branch_office_id: this.branchOffice?.id
        },
        (percentCompleted) => {
          this.loadingDownload = percentCompleted / 100
          if (percentCompleted === 100) {
            this.loadingDownload = 0
          }
        },
        (link) => {
          link.setAttribute(
            'download',
            'Productos.xlsx'
            // `Recibos de cobro: Desde ${proxyDate.value.from} Hasta ${proxyDate.value.to}.xlsx`
          )
          document.body.appendChild(link)
          link.click()
        }
      )
    },
    /**
     * Copy products
     */
    async copyProducts () {
      try {
        loading(true)
        await this.$api.post('products/copy', {
          company_from_id: this.company,
          company_to_id: this.userSession.company_session_id
        })
        this.getProducts(this.params)
        notify('Productos copiados exitosamente', 'positive', 'info')
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterProductsAddons (value, update) {
      this.$api.get('products', {
        params: {
          paginate: true,
          perPage: 100,
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.addonsProductsOptions = data.data
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

      if (data.aliquot_type) {
        formData.append('aliquot_type', JSON.stringify(data.aliquot_type))
      }

      data.images.forEach((element, index) => {
        formData.append(`images[${index}]`, element.image)
      })

      if (this.addonsProducts.length > 0) {
        this.addonsProducts.forEach((element, index) => {
          formData.append(`addons[${index}]`, element.id)
        })
      }
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
        unit_of_measure_id: this.unitOfMeasure?.value,
        images: [],
        is_bundle: 0,
        show_catalog: 0,
        is_addons: 0,
        skip_stock: 0
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
     * Get all products
     */
    getProducts (params = this.params) {
      this.visible = true
      this.$api.get('products', {
        params: {
          ...params,
          branch_office_id: this.branchOffice?.id
        }
      })
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
     * Set category
     * @param {Object} data category
     */
    setCategory (data) {
      this.product.aliquot_type = data.aliquot_type
    },
    /**
     * Get all products
     */
    async getUnitOfMeasures () {
      try {
        const { data } = await this.$api.get('unit-of-measures')
        this.unitOfMeasures = data.map(unit => ({ label: unit.name, value: unit.id }))
        this.unitOfMeasure = this.unitOfMeasures[0]?.value
      } catch (error) {
        Notify.create({
          message: error.message,
          icon: 'warning',
          color: 'negative'
        })
      }
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
          this.closeModal()
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
      this.unitOfMeasure = row.unit_of_measure_id
      this.addonsProducts = row.addons
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
          this.closeModal()
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
          this.closeModal()
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
