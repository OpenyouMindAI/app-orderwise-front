<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" label="Nueva Orden de Producción" @click="openNewOrder = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Órdenes de Producción"
          row-key="id"
          :columns="columns"
          :rows="orders"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="viewOrder"
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
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)">
                {{ getStatusLabel(props.row.status) }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Modal para nueva orden -->
    <q-dialog v-model="openNewOrder" persistent full-width>
      <q-card style="max-width: 1000px; width: 100%;">
        <q-form @submit="createOrder">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Nueva Orden de Producción</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeNewOrderModal" />
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  filled
                  v-model="orderForm.deposit_id"
                  :options="deposits"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  label="Depósito"
                  :rules="[val => !!val || 'El depósito es requerido']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  filled
                  v-model="orderForm.branch_office_id"
                  :options="branchOffices"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  label="Sucursal"
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  v-model="orderForm.planned_date"
                  label="Fecha planeada"
                  type="datetime-local"
                />
              </div>
              <div class="col-12">
                <div class="text-h6 q-mb-md">Productos a Fabricar</div>
                <q-btn color="primary" label="Agregar Producto" @click="openProductPicker = true" size="sm" class="q-mb-md"/>
                
                <q-list bordered separator v-if="orderForm.items.length > 0">
                  <q-item v-for="(item, index) in orderForm.items" :key="index">
                    <q-item-section>
                      <q-item-label>{{ getProductName(item.product_id) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side style="min-width: 150px;">
                      <q-input
                        filled
                        dense
                        v-model.number="item.planned_quantity"
                        label="Cantidad"
                        type="number"
                        step="0.01"
                        min="0.01"
                      />
                    </q-item-section>
                    <q-item-section side>
                      <q-btn size="sm" color="negative" round dense flat icon="delete" @click="removeItem(index)"/>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-center text-grey q-pa-md">
                  No hay productos agregados
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn color="secondary" label="Cancelar" @click="closeNewOrderModal" />
            <q-btn color="primary" label="Crear Orden" type="submit" :loading="visible" :disable="orderForm.items.length === 0"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Modal para ver orden -->
    <q-dialog v-model="openViewOrder" persistent full-width>
      <q-card style="max-width: 1200px; width: 100%;">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Orden {{ selectedOrder?.order_number }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeViewOrderModal" />
        </q-card-section>

        <q-card-section v-if="selectedOrder">
          <div class="row q-col-gutter-md">
            <!-- Información general -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Información</div>
                  <q-separator class="q-my-sm"/>
                  <div class="q-gutter-sm">
                    <div><strong>Estado:</strong> 
                      <q-badge :color="getStatusColor(selectedOrder.status)">
                        {{ getStatusLabel(selectedOrder.status) }}
                      </q-badge>
                    </div>
                    <div><strong>Depósito:</strong> {{ selectedOrder.deposit?.name }}</div>
                    <div><strong>Sucursal:</strong> {{ selectedOrder.branch_office?.name || 'N/A' }}</div>
                    <div><strong>Fecha planeada:</strong> {{ formatDate(selectedOrder.planned_date) }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Productos a fabricar -->
            <div class="col-12 col-md-8">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Productos a Fabricar</div>
                  <q-separator class="q-my-sm"/>
                  <q-list bordered separator>
                    <q-item v-for="item in selectedOrder.items" :key="item.id">
                      <q-item-section>
                        <q-item-label>{{ item.product?.name }}</q-item-label>
                        <q-item-label caption>
                          Planeado: {{ item.planned_quantity }} | Producido: {{ item.produced_quantity }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <!-- Requerimientos de materiales -->
            <div class="col-12">
              <q-card flat bordered>
                <q-card-section>
                  <div class="row items-center">
                    <div class="text-h6">Requerimientos de Materiales</div>
                    <q-space/>
                    <q-btn color="primary" label="Ver Lista de Picking" @click="viewPickingList" size="sm"/>
                  </div>
                  <q-separator class="q-my-sm"/>
                  <q-table
                    :rows="materialRequirements"
                    :columns="materialColumns"
                    row-key="id"
                    flat
                    dense
                  >
                    <template v-slot:body-cell-status="props">
                      <q-td :props="props">
                        <q-badge :color="props.row.status === 'SUFFICIENT' ? 'positive' : 'negative'">
                          {{ props.row.status === 'SUFFICIENT' ? 'Suficiente' : 'Insuficiente' }}
                        </q-badge>
                      </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="secondary" label="Cerrar" @click="closeViewOrderModal" />
          <q-btn 
            v-if="selectedOrder?.status === 'PLANNED' || selectedOrder?.status === 'IN_PROGRESS'" 
            color="positive" 
            label="Completar Producción" 
            @click="openCompleteModal = true"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para completar producción -->
    <q-dialog v-model="openCompleteModal" persistent>
      <q-card style="width: 600px; max-width: 80vw;">
        <q-form @submit="completeProduction">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Completar Producción</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="openCompleteModal = false" />
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle1 q-mb-md">Ingrese las cantidades realmente producidas:</div>
            <div class="q-gutter-md">
              <div v-for="item in selectedOrder?.items" :key="item.id">
                <q-input
                  filled
                  v-model.number="completionForm[item.id]"
                  :label="item.product?.name"
                  type="number"
                  step="0.01"
                  min="0"
                  :hint="`Planeado: ${item.planned_quantity}`"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn color="secondary" label="Cancelar" @click="openCompleteModal = false" />
            <q-btn color="positive" label="Completar" type="submit" :loading="completing"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Modal para seleccionar producto -->
    <q-dialog v-model="openProductPicker" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Seleccionar Producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="openProductPicker = false" />
        </q-card-section>

        <q-card-section>
          <q-select
            filled
            v-model="selectedProductForOrder"
            :options="productsWithRecipe"
            option-value="id"
            option-label="name"
            label="Producto"
            use-input
            @filter="filterProductsWithRecipe"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="secondary" label="Cancelar" @click="openProductPicker = false" />
          <q-btn color="primary" label="Agregar" @click="addProductToOrder" :disable="!selectedProductForOrder"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Notify } from 'quasar'
import { api } from 'boot/axios'

const orders = ref([])
const selectedOrder = ref(null)
const materialRequirements = ref([])
const deposits = ref([])
const branchOffices = ref([])
const productsWithRecipe = ref([])
const allProductsWithRecipe = ref([])
const filter = ref('')
const visible = ref(false)
const completing = ref(false)
const openNewOrder = ref(false)
const openViewOrder = ref(false)
const openCompleteModal = ref(false)
const openProductPicker = ref(false)
const selectedProductForOrder = ref(null)

const orderForm = ref({
  deposit_id: null,
  branch_office_id: null,
  planned_date: null,
  items: []
})

const completionForm = ref({})

const params = ref({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 20
})

const paginationConfig = ref({
  rowsPerPage: 20,
  rowsNumber: 20,
  page: 1,
  sortBy: 'id',
  descending: true
})

const columns = [
  { name: 'order_number', align: 'left', label: 'Número', field: 'order_number', sortable: true },
  { name: 'status', align: 'center', label: 'Estado', field: 'status', sortable: true },
  { name: 'planned_date', align: 'left', label: 'Fecha Planeada', field: 'planned_date', sortable: true, format: val => formatDate(val) },
  { name: 'deposit', align: 'left', label: 'Depósito', field: row => row.deposit?.name }
]

const materialColumns = [
  { name: 'product', align: 'left', label: 'Material', field: row => row.product?.name },
  { name: 'required', align: 'right', label: 'Requerido', field: 'required_quantity' },
  { name: 'available', align: 'right', label: 'Disponible', field: 'available_quantity' },
  { name: 'status', align: 'center', label: 'Estado', field: 'status' }
]

const getStatusColor = (status) => {
  const colors = {
    'DRAFT': 'grey',
    'PLANNED': 'blue',
    'IN_PROGRESS': 'orange',
    'COMPLETED': 'green',
    'CANCELLED': 'red'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    'DRAFT': 'Borrador',
    'PLANNED': 'Planeado',
    'IN_PROGRESS': 'En Progreso',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('es-ES')
}

const getProductName = (productId) => {
  const product = allProductsWithRecipe.value.find(p => p.id === productId)
  return product?.name || 'Producto desconocido'
}

const getOrders = async () => {
  visible.value = true
  try {
    const { data } = await api.get('production-orders', { params: params.value })
    orders.value = data.data || data
    paginationConfig.value.rowsNumber = data.total || orders.value.length
  } catch (err) {
    Notify.create({
      message: err.message,
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    visible.value = false
  }
}

const viewOrder = async (event, row) => {
  try {
    const { data } = await api.get(`production-orders/${row.id}`)
    selectedOrder.value = data
    
    // Load material requirements
    const materialsResponse = await api.get(`production-orders/${row.id}/materials`)
    materialRequirements.value = materialsResponse.data.requirements
    
    openViewOrder.value = true
  } catch (err) {
    Notify.create({
      message: 'Error al cargar la orden',
      icon: 'warning',
      color: 'negative'
    })
  }
}

const createOrder = async () => {
  visible.value = true
  try {
    await api.post('production-orders', orderForm.value)
    Notify.create({
      message: 'Orden creada exitosamente',
      icon: 'check_circle',
      color: 'positive'
    })
    closeNewOrderModal()
    getOrders()
  } catch (err) {
    Notify.create({
      message: err.response?.data?.message || 'Error al crear la orden',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    visible.value = false
  }
}

const completeProduction = async () => {
  completing.value = true
  try {
    const items = Object.entries(completionForm.value).map(([id, produced_quantity]) => ({
      id: parseInt(id),
      produced_quantity
    }))

    await api.post(`production-orders/${selectedOrder.value.id}/complete`, { items })
    
    Notify.create({
      message: 'Producción completada exitosamente',
      icon: 'check_circle',
      color: 'positive'
    })
    
    openCompleteModal.value = false
    closeViewOrderModal()
    getOrders()
  } catch (err) {
    Notify.create({
      message: err.response?.data?.message || 'Error al completar la producción',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    completing.value = false
  }
}

const viewPickingList = async () => {
  try {
    const { data } = await api.get(`production-orders/${selectedOrder.value.id}/picking-list`)
    console.log('Picking List:', data)
    // Aquí podrías abrir un modal o descargar un PDF
    Notify.create({
      message: 'Lista de picking generada (ver consola)',
      icon: 'info',
      color: 'info'
    })
  } catch (err) {
    Notify.create({
      message: 'Error al generar lista de picking',
      icon: 'warning',
      color: 'negative'
    })
  }
}

const addProductToOrder = () => {
  if (selectedProductForOrder.value) {
    orderForm.value.items.push({
      product_id: selectedProductForOrder.value.id,
      planned_quantity: 1
    })
    selectedProductForOrder.value = null
    openProductPicker.value = false
  }
}

const removeItem = (index) => {
  orderForm.value.items.splice(index, 1)
}

const closeNewOrderModal = () => {
  openNewOrder.value = false
  orderForm.value = {
    deposit_id: null,
    branch_office_id: null,
    planned_date: null,
    items: []
  }
}

const closeViewOrderModal = () => {
  openViewOrder.value = false
  selectedOrder.value = null
  materialRequirements.value = []
}

const filterProductsWithRecipe = (val, update) => {
  update(() => {
    if (val === '') {
      productsWithRecipe.value = allProductsWithRecipe.value
    } else {
      const needle = val.toLowerCase()
      productsWithRecipe.value = allProductsWithRecipe.value.filter(
        v => v.name.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const loadDeposits = async () => {
  try {
    const { data } = await api.get('deposits', { params: { perPage: 100 } })
    deposits.value = data.data || data
  } catch (err) {
    console.error(err)
  }
}

const loadBranchOffices = async () => {
  try {
    const { data } = await api.get('branch-offices', { params: { perPage: 100 } })
    branchOffices.value = data.data || data
  } catch (err) {
    console.error(err)
  }
}

const loadProductsWithRecipe = async () => {
  try {
    const { data } = await api.get('products', { params: { perPage: 1000 } })
    allProductsWithRecipe.value = (data.data || data).filter(p => 
      p.product_type === 'SUB_RECIPE' || p.product_type === 'FINISHED_GOOD'
    )
    productsWithRecipe.value = allProductsWithRecipe.value
  } catch (err) {
    console.error(err)
  }
}

const setPagination = (data) => {
  params.value.sortOrder = data.pagination.descending ? 'desc' : 'asc'
  params.value.page = data.pagination.page
  params.value.sortBy = data.pagination.sortBy ?? params.value.sortBy
  params.value.perPage = data.pagination.rowsPerPage
  paginationConfig.value = data.pagination
  getOrders()
}

onMounted(() => {
  getOrders()
  loadDeposits()
  loadBranchOffices()
  loadProductsWithRecipe()
})
</script>
