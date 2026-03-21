<template>
  <div class="grid q-gutter-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center q-gutter-md">
        <span class="text-subtitle1">{{ branchOffice.name }}</span>
        <q-separator vertical/>
        <span class="text-subtitle1">Total Stock: {{ stockTotals?.stock_quantity || 0 }}</span>
      </div>
      <q-btn icon="add" color="primary" @click="openAddStock = true"/>
    </div>
    <q-table
      title="Stock del producto"
      row-key="name"
      :columns="columns"
      :rows="stockProducts"
      :loading="loadingTable"
      :filter="filter"
      binary-state-sort
      v-model:pagination="paginationConfig"
      @row-click="editStock"
      @request="setPagination"
      no-data-label="Registro no encontrado"
      :grid="$q.screen.lt.md"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="editStock($event, props.row)">
            <span class="q-focus-helper"></span>

            <q-card-section class="row justify-between items-start compact-card-header">
              <div class="column" style="max-width: 70%">
                 <div class="text-indigo-10 text-weight-bold text-body1 ellipsis" style="font-size: 1.1rem; letter-spacing: -0.5px">ID: {{ props.row.id }}</div>
                 <div class="text-caption text-grey-6 text-weight-medium">{{ formatDate(props.row.created_at, 'DD/MM/YYYY HH:mm') }}</div>
              </div>
              <div class="column items-end">
                 <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Cantidad</div>
                 <div class="text-h6 text-primary text-weight-bolder lh-100" style="letter-spacing: -0.5px">{{ props.row.quantity }}</div>
              </div>
            </q-card-section>

            <q-separator color="grey-2" inset />

            <q-card-section class="compact-card-body">
              <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Descripción</div>
              <div class="text-body2 text-grey-8 ellipsis-2-lines" style="min-height: 2.4em">{{ props.row.description || '-' }}</div>
            </q-card-section>
          </q-card>
        </div>
      </template>
      <template v-slot:top-right>
        <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>
    <q-dialog v-model="openEditStock" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEditStockProduct">
          <q-card-section class="row items-center q-py-sm bg-primary text-white">
            <div class="text-h6">Modificar stock</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="openEditStock = false" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                :model-value="branchOffice?.name"
                autofocus
                label="Sucursal"
                readonly
                :rules="[val => !!val || 'El campo es requerido.']"
                lazy-rules
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                lazy-rules
                filled
                v-model.number="stockProduct.quantity"
                type="number"
                autofocus
                label="Cantidad"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="stockProduct.description"
                type="textarea"
                label="Descripción"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteStockProduct" :loading="loadingForm" />
            <q-btn color="secondary" label="Cancelar" @click="openEditStock = false" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="loadingForm"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddStock" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveStockProduct">
          <q-card-section class="row items-center q-py-sm bg-primary text-white">
            <div class="text-h6">Agregar stock</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="openAddStock = false" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                :model-value="branchOffice?.name"
                autofocus
                label="Sucursal"
                readonly
                :rules="[val => !!val || 'El campo es requerido.']"
                lazy-rules
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                lazy-rules
                filled
                v-model.number="stockProduct.quantity"
                type="number"
                autofocus
                label="Cantidad"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="stockProduct.description"
                type="textarea"
                label="Descripción"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="secondary" label="Cancelar" @click="openAddStock = false" />
            <q-btn color="primary" label="Agregar" type="submit" :loading="loadingForm"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { formatDate, notify } from 'src/const/mixins'
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

const columns = [
  {
    name: 'id',
    align: 'left',
    label: 'Código',
    field: 'id',
    sortable: true
  },
  {
    name: 'description',
    align: 'left',
    label: 'Descripción',
    field: 'description',
    format: val => val || '-',
    sortable: true
  },
  {
    name: 'created_at',
    align: 'right',
    label: 'Fecha y hora de entrada',
    field: 'created_at',
    format: val => formatDate(val, 'DD/MM/YYYY HH:mm'),
    sortable: true
  },
  {
    name: 'quantity',
    align: 'right',
    label: 'Cantidad',
    field: 'quantity',
    sortable: true
  }
]

const defaultValue = {
  product_id: props.product.id,
  branch_office_id: branchOffice?.id
}

const loadingTable = ref(false)
const openAddStock = ref(false)
const openEditStock = ref(false)
const loadingForm = ref(false)
const filter = ref('')

const stockProduct = ref({
  ...defaultValue
})

const paginationConfig = ref({
  rowsPerPage: 20,
  rowsNumber: 20,
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc'
})

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

watch(openAddStock, () => {
  stockProduct.value = {
    ...defaultValue,
    cost: props.product.cost,
    price: props.product.price
  }
})

watch(filter, (data) => {
  searchData(data)
})

/**
 * Stock products
 * @type {Array}
 */
const stockProducts = ref([])

const stockTotals = ref(null)

onMounted(() => {
  setPagination({
    pagination: paginationConfig.value,
    filter: undefined
  })
  getBranchOfficeStockProducts()
})

const editStock = (event, row) => {
  stockProduct.value = row
  openEditStock.value = true
}

const setPagination = (data) => {
  params.value.sortOrder = data.pagination.descending ? 'asc' : 'desc'
  params.value.page = data.pagination.page
  params.value.sortBy = data.pagination.sortBy ?? params.value.sortBy
  params.value.perPage = data.pagination.rowsPerPage
  paginationConfig.value = data.pagination
  getStockProducts(params.value)
}

const getStockProducts = async (params) => {
  try {
    loadingTable.value = true
    const { data } = await api.get('stock-products', { params })
    stockProducts.value = data.data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingTable.value = false
  }
}

const getBranchOfficeStockProducts = async (params) => {
  try {
    loadingTable.value = true
    const { data } = await api.get('branch-office-stock-products', {
      params: {
        dataEqualFilter: defaultValue
      }
    })
    stockTotals.value = data[0]
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingTable.value = false
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
  getStockProducts(params.value)
}

const saveStockProduct = async () => {
  try {
    loadingForm.value = true
    await api.post('stock-products', stockProduct.value)
    openAddStock.value = false
    getStockProducts(params.value)
    getBranchOfficeStockProducts()
    notify('Stock agregado exitosamente', 'positive', 'warning')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingForm.value = false
  }
}

const saveEditStockProduct = async () => {
  try {
    loadingForm.value = true
    await api.put(`stock-products/${stockProduct.value.id}`, stockProduct.value)
    openEditStock.value = false
    getStockProducts(params.value)
    getBranchOfficeStockProducts()
    notify('Stock modificado exitosamente', 'positive', 'warning')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingForm.value = false
  }
}

const deleteStockProduct = async () => {
  try {
    loadingForm.value = true
    await api.delete(`stock-products/${stockProduct.value.id}`)
    openEditStock.value = false
    getStockProducts(params.value)
    getBranchOfficeStockProducts()
    notify('Stock eliminado exitosamente', 'positive', 'warning')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingForm.value = false
  }
}

</script>

<style lang="scss" scoped>
/* Clases para tarjetas compactas */
.compact-card-header {
  padding: 1rem !important;
}

.compact-card-body {
  padding: 1rem !important;
}

@media (max-width: 1023px) {
  /* Reducir padding del top de la tabla */
  :deep(.q-table__top) {
    padding: 0.5rem !important;
  }
}
</style>
