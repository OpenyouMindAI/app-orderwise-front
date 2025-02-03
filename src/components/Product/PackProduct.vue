<template>
  <div class="grid q-gutter-sm">
    <div class="flex items-center justify-between">
      <div class="flex q-gutter-sm">
        <span class="text-h6">{{ branchOffice.name }}</span>
        <q-separator vertical/>
        <span class="text-h6">Stock: {{ stock.stock_pack }}</span>
        <q-separator vertical/>
        <span class="text-h6">Costo: {{ stock.cost }}</span>
      </div>
      <q-btn icon="add" color="primary" @click="openAddProduct = true"/>
    </div>
    <q-table
      title="Productos"
      row-key="name"
      :columns="columns"
      :rows="productBundles"
      :loading="loadingTable"
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
    <q-dialog v-model="openEditProduct" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEditProductBundle">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Modificar producto</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="openEditProduct = false" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Producto"
                input-debounce="0"
                option-value="id"
                clearable
                autofocus
                :rules="[val => !!val || 'El campo es requerido.']"
                v-model="productBundle.bundle"
                :option-label="row => `${row.barcode ?? ''} | ${row.name}`"
                :options="products"
                @filter="filterProducts"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model.number="productBundle.quantity"
                type="number"
                label="Cantidad"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteProductBundle" :loading="loadingForm" />
            <q-btn color="secondary" label="Cancelar" @click="openEditProduct = false" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="loadingForm"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddProduct" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveProductBundle">
          <q-card-section class="row items-center  bg-primary text-white">
            <div class="text-h6">Agregar producto</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="openAddProduct = false" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Producto"
                input-debounce="0"
                option-value="id"
                clearable
                autofocus
                :rules="[val => !!val || 'El campo es requerido.']"
                v-model="productBundle.bundle"
                :option-label="row => `${row.barcode ?? ''} | ${row.name}`"
                :options="products"
                @filter="filterProducts"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model.number="productBundle.quantity"
                type="number"
                label="Cantidad"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="secondary" label="Cancelar" @click="openAddProduct = false" />
            <q-btn color="primary" label="Agregar" type="submit" :loading="loadingForm"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { onMounted, ref, watch } from 'vue'
import { authentication } from 'src/stores/module-authentication'

const { branchOffice } = authentication()

const props = defineProps({
  /**
   * Product data
   * @type {Object}
   */
  product: {
    type: Object,
    require: true
  }
})

/**
 * List columns
 * @type {Array}
 */
const columns = [
  {
    name: 'code',
    align: 'left',
    label: 'Código',
    field: 'bundle',
    format: val => val?.barcode || '-'
  },
  {
    name: 'bundle',
    align: 'left',
    label: 'Producto',
    field: 'bundle',
    format: val => val?.name
  },
  {
    name: 'quantity',
    align: 'right',
    label: 'Cantidad',
    field: 'quantity',
    sortable: true
  }
]

/**
 * Default value
 * @type {Object}
 */
const defaultValue = {
  product_id: props.product.id
}
/**
 * Loading table
 * @type {Boolean}
 */
const loadingTable = ref(false)

/**
 * Open add product
 * @type {Boolean}
 */
const openAddProduct = ref(false)
/**
 * Open edit product
 * @type {Boolean}
 */
const openEditProduct = ref(false)
/**
 * Products
 * @type {Array}
 */
const products = ref([])
/**
 * Filter
 * @type {String}
 */
const filter = ref('')
/**
 * Product product
 * @type {Object}
 */
const productBundle = ref({ ...defaultValue })
/**
 * Loading form
 * @type {Boolean}
 */
const loadingForm = ref(false)

const stock = ref(0)
/**
 * Pagination config
 * @type {Object}
 */
const paginationConfig = ref({
  rowsPerPage: 20,
  rowsNumber: 20,
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc'
})
/**
 * Params
 * @type {Object}
 */
const params = ref({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 1,
  dataSearch: {
    description: ''
  },
  dataEqualFilter: defaultValue
})

watch(openAddProduct, () => {
  productBundle.value = { ...defaultValue }
})

watch(filter, (data) => {
  searchData(data)
})

/**
 * Product products
 * @type {Array}
 */
const productBundles = ref([])

onMounted(() => {
  setPagination({
    pagination: paginationConfig.value,
    filter: undefined
  })
})

/**
 * Edit product
 * @param {Object} event event
 * @param {Object} row row
 */
const editProduct = (event, row) => {
  productBundle.value = row
  openEditProduct.value = true
}

/**
 * Set pagination
 * @param {Object} data data
 */
const setPagination = (data) => {
  params.value.sortOrder = data.pagination.descending ? 'asc' : 'desc'
  params.value.page = data.pagination.page
  params.value.sortBy = data.pagination.sortBy ?? params.value.sortBy
  params.value.perPage = data.pagination.rowsPerPage
  paginationConfig.value = data.pagination
  getProductBundles(params.value)
}

/**
 * Get product stock
 * @param {Object} params params
 */
const getProductStock = async (product) => {
  try {
    loadingTable.value = true
    const { data } = await api.get(`products/${product.id}/stock`, {
      params: {
        branch_office_id: branchOffice.id
      }
    })
    stock.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingTable.value = false
  }
}

/**
 * Get product products
 * @param {Object} params params
 */
const getProductBundles = async (params) => {
  try {
    loadingTable.value = true
    const { data } = await api.get('product-bundles', { params })
    productBundles.value = data.data
    getProductStock(props.product)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingTable.value = false
  }
}

/**
 * Get products
 * @param {String} value value
 * @param {Function} update update
 */
const filterProducts = async (value, update) => {
  try {
    const { data } = await api.get('products', {
      params: {
        sortOrder: 'desc',
        sortBy: 'id',
        dataEqualFilter: {
          is_bundle: 0
        },
        dataSearch: {
          name: value,
          barcode: value
        }
      }
    })
    update(() => {
      products.value = data
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Search beneficiary
 * @param  {Object}
 */
const searchData = (data) => {
  for (const dataSearch in params.value.dataSearch) {
    params.value.dataSearch[dataSearch] = data
  }
  params.value.page = 1
  getProductBundles(params.value)
}

/**
 * Save product product
 */
const saveProductBundle = async () => {
  try {
    loadingForm.value = true
    await api.post('product-bundles', {
      ...productBundle.value,
      bundle_id: productBundle.value.bundle?.id
    })
    openAddProduct.value = false
    getProductBundles(params.value)
    notify('Producto agregado exitosamente', 'positive', 'warning')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingForm.value = false
  }
}

/**
 * Save edit product product
 */
const saveEditProductBundle = async () => {
  try {
    loadingForm.value = true
    await api.put(`product-bundles/${productBundle.value.id}`, productBundle.value)
    openEditProduct.value = false
    getProductBundles(params.value)
    notify('Producto modificado exitosamente', 'positive', 'warning')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingForm.value = false
  }
}

/**
 * Delete product product
 */
const deleteProductBundle = async () => {
  try {
    loadingForm.value = true
    await api.delete(`product-bundles/${productBundle.value.id}`)
    openEditProduct.value = false
    getProductBundles(params.value)
    notify('Producto eliminado exitosamente', 'positive', 'warning')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingForm.value = false
  }
}

</script>
