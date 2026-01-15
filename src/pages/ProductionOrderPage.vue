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
              <div class="col-12 col-md-12">
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
                <div class="row items-center q-mb-md q-col-gutter-sm">
                  <div class="col-12 col-md-6 flex items-center q-gutter-sm">
                     <span class="text-h6">Productos a Fabricar</span>
                     <q-btn
                        label="Fabricar Falta (Stock Mín.)"
                        color="secondary"
                        size="sm"
                        icon="auto_fix_high"
                        @click="setQuantitiesToMinimum"
                        :disable="!orderForm.branch_office_id"
                      >
                        <q-tooltip>Establecer cantidad para cubrir el stock mínimo de todos los productos</q-tooltip>
                     </q-btn>
                     <q-btn
                        label="Reset"
                        color="warning"
                        size="sm"
                        icon="restart_alt"
                        @click="resetQuantitiesToZero"
                      >
                        <q-tooltip>Poner todas las cantidades en 0</q-tooltip>
                     </q-btn>
                  </div>
                  <div class="col-12 col-md-6 flex justify-end items-center q-gutter-sm">
                      <q-input
                        dense
                        filled
                        v-model.number="percentageIncrease"
                        type="number"
                        label="% Extra"
                        style="width: 100px"
                        min="0"
                      />
                      <q-btn
                        label="Aplicar %"
                        color="primary"
                        size="sm"
                        icon="trending_up"
                        @click="applyPercentageIncrease"
                        :disable="!hasSelectedItems"
                      />
                  </div>
                </div>

                <q-table
                  :rows="productsWithRecipe"
                  :columns="productSelectionColumns"
                  row-key="id"
                  flat
                  bordered
                  :filter="filterProducts"
                  :loading="loadingProducts"
                  :pagination="{ rowsPerPage: 10 }"
                >
                  <template v-slot:top-right>
                    <q-input
                      v-model="filterProducts"
                      debounce="300"
                      placeholder="Buscar"
                      style="max-width: 200px"
                    />
                  </template>
                  <template v-slot:body="props">
                    <q-tr :props="props">
                       <q-td key="name" :props="props">
                          <div class="text-weight-bold">{{ props.row.name }}</div>
                          <div class="text-caption text-grey">{{ props.row.category?.name }}</div>
                       </q-td>
                       <q-td key="stock" :props="props" class="text-right">
                          {{ props.row.stock }}
                       </q-td>
                        <q-td key="min_stock" :props="props" class="text-right">
                          {{ props.row.minimum_stock || 0 }}
                       </q-td>
                       <q-td key="difference" :props="props" class="text-right">
                          <q-badge :color="getStockStatusColor(props.row)" text-color="white">
                            {{ getStockDifference(props.row) }}
                          </q-badge>
                       </q-td>
                       <q-td key="quantity" :props="props" style="width: 150px">
                          <q-input
                            dense
                            filled
                            v-model.number="props.row.planned_quantity"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            bg-color="white"
                          />
                       </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn color="secondary" label="Cancelar" @click="closeNewOrderModal" />
            <q-btn color="primary" label="Crear Orden" type="submit" :loading="visible" :disable="!hasSelectedItems"/>
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
                       <q-item-section side>
                           <q-btn flat round color="primary" icon="receipt_long" size="sm" @click="viewRecipeForProduct(item)">
                              <q-tooltip>Ver detalle de receta</q-tooltip>
                           </q-btn>
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
          <q-btn color="info" icon="print" label="Imprimir" @click="downloadPdf" :loading="downloadingPdf"/>
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
const downloadingPdf = ref(false)
const loadingProducts = ref(false)
const completing = ref(false)
const openNewOrder = ref(false)
const openViewOrder = ref(false)
const openCompleteModal = ref(false)
const openRecipeDetail = ref(false)
const selectedRecipeProduct = ref(null)
const selectedRecipeQuantity = ref(0)
const selectedRecipeItems = ref([])
const openProductPicker = ref(false)
const selectedProductForOrder = ref(null)
const filterProducts = ref('')
const percentageIncrease = ref(0)
const hasSelectedItems = computed(() => {
  return productsWithRecipe.value.some(p => p.planned_quantity > 0)
})

const orderForm = ref({
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

const productSelectionColumns = [
  { name: 'name', align: 'left', label: 'Producto', field: 'name', sortable: true },
  { name: 'stock', align: 'right', label: 'Stock Actual', field: 'stock', sortable: true },
  { name: 'min_stock', align: 'right', label: 'Stock Mín.', field: 'minimum_stock', sortable: true },
  { name: 'difference', align: 'right', label: 'Diferencia', field: row => row.stock - row.minimum_stock, sortable: true },
  { name: 'quantity', align: 'center', label: 'A Fabricar', field: 'planned_quantity' }
]

const getStatusColor = (status) => {
  const colors = {
    DRAFT: 'grey',
    PLANNED: 'blue',
    IN_PROGRESS: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'red'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    DRAFT: 'Borrador',
    PLANNED: 'Planeado',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('es-ES')
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
    // Filter items with quantity > 0
    orderForm.value.items = productsWithRecipe.value
      .filter(p => p.planned_quantity > 0)
      .map(p => ({
        product_id: p.id,
        planned_quantity: p.planned_quantity
      }))

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
    const items = Object.entries(completionForm.value).map(([id, producedQuantity]) => ({
      id: parseInt(id),
      produced_quantity: producedQuantity
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

const downloadPdf = async () => {
  if (!selectedOrder.value) return
  downloadingPdf.value = true
  try {
    const response = await api.get(`production-orders/${selectedOrder.value.id}/pdf`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `orden-produccion-${selectedOrder.value.order_number}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    Notify.create({
      message: 'Error al descargar PDF',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    downloadingPdf.value = false
  }
}

const viewRecipeForProduct = async (item) => {
  selectedRecipeProduct.value = item.product
  selectedRecipeQuantity.value = item.planned_quantity
  try {
    // Fetch recipe structure
    const { data } = await api.get(`products/${item.product_id}/recipe`)

    // Calculate based on quantity
    // Note: Recipe items usually define quantity for 1 unit (or recipe yield).
    // Assuming recipe is for 1 unit for simplicity, or we should check recipe yield.
    // The RecipeService logic does this complex calculation. For frontend "preview",
    // strictly speaking we should replicate that logic or ask backend.
    // For now, simpler aproach: just show the base recipe multiplied.

    selectedRecipeItems.value = data.map(r => ({
      ...r,
      quantity: r.quantity * item.planned_quantity
    }))

    openRecipeDetail.value = true
  } catch (error) {
    Notify.create({ message: 'Error al cargar receta', color: 'negative' })
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

const closeNewOrderModal = () => {
  openNewOrder.value = false
  orderForm.value = {
    branch_office_id: null,
    planned_date: null,
    items: []
  }
  // Reset quantities
  productsWithRecipe.value.forEach(p => { p.planned_quantity = 0 })
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
  loadingProducts.value = true
  try {
    const params = {
      perPage: 1000,
      page: 1,
      paginate: true,
      stock: true,
      withStock: true,
      whereIn: {
        product_type: ['SUB_RECIPE', 'FINISHED_GOOD']
      }
    }

    // Pass sorting filters
    if (orderForm.value.branch_office_id) {
      params.branch_office_id = orderForm.value.branch_office_id
    }

    const { data } = await api.get('products', { params })

    // Map to include local state for the form
    allProductsWithRecipe.value = data.data.map(p => ({
      ...p,
      planned_quantity: 0,
      // If backend doesn't filter stock by deposit, we might need to assume 'stock' field is correct for the request context
      // The ProductsController seems to respect branch_office_id or standard filters.
      // Ensuring numbers
      stock: parseFloat(p.stock || p.stock_quantity || 0), // Adjust field name if necessary based on API response
      minimum_stock: parseFloat(p.minimum_stock || 0)
    }))

    productsWithRecipe.value = allProductsWithRecipe.value
  } catch (err) {
    console.error(err)
  } finally {
    loadingProducts.value = false
  }
}

// Watchers for reloading products when context changes
import { watch, computed } from 'vue'

watch(() => orderForm.value.branch_office_id, () => {
  if (openNewOrder.value) loadProductsWithRecipe()
})

watch(openNewOrder, (val) => {
  if (val) loadProductsWithRecipe()
})

// Logic functions
const getStockDifference = (row) => {
  return (row.stock - row.minimum_stock).toFixed(2)
}

const getStockStatusColor = (row) => {
  const diff = row.stock - row.minimum_stock
  if (diff < 0) return 'negative'
  if (diff === 0) return 'warning'
  return 'positive'
}

const setQuantitiesToMinimum = () => {
  productsWithRecipe.value.forEach(p => {
    const diff = p.minimum_stock - p.stock
    if (diff > 0) {
      p.planned_quantity = diff
    }
  })
  Notify.create({ message: 'Cantidades actualizadas para cubrir stock mínimo', color: 'positive', icon: 'check' })
}

const applyPercentageIncrease = () => {
  if (percentageIncrease.value <= 0) return

  productsWithRecipe.value.forEach(p => {
    if (p.planned_quantity > 0) {
      const increase = p.planned_quantity * (percentageIncrease.value / 100)
      p.planned_quantity = parseFloat((p.planned_quantity + increase).toFixed(2))
    }
  })
  Notify.create({ message: `Cantidades aumentadas en un ${percentageIncrease.value}%`, color: 'positive', icon: 'trending_up' })
}

const resetQuantitiesToZero = () => {
  productsWithRecipe.value.forEach(p => {
    p.planned_quantity = 0
  })
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
