<template>
  <div class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <q-card class="q-pa-lg text-center">
          <q-card-section>
            <div class="text-h4 text-primary q-mb-md">
              <q-icon name="local_offer" size="2rem" class="q-mr-sm" />
              Gestión de Promociones
            </div>
            <div class="text-body1 text-grey-7 q-mb-lg">
              Crea promociones personalizadas con grupos de productos y configuraciones avanzadas
            </div>
            <q-btn
              color="primary"
              size="lg"
              label="Crear Nueva Promoción"
              icon="add"
              unelevated
              class="q-px-xl"
              @click="openCreateModal"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Modal de creación de promociones -->
    <q-dialog
      v-model="showCreateModal"
      persistent
      :maximized="$q.screen.lt.sm"
    >
      <q-card
        style="width: 1200px; max-width: 90vw;"
        class="promotion-modal"
      >
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <div class="text-h6">
            <q-icon name="local_offer" class="q-mr-sm" />
            Crear Nueva Promoción
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="closeModal"
          />
        </q-card-section>

        <q-form
          class="promotion-form"
          @submit="savePromotion"
        >
          <q-tabs
            v-model="activeTab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="basic" label="Datos Básicos" />
            <q-tab name="groups" label="Grupos y Productos" />
            <q-tab name="preview" label="Vista Previa" />
          </q-tabs>
          <q-separator />

          <div class="tab-panels-container">
            <q-tab-panels
              v-model="activeTab"
              animated
              class="tab-panels-content"
            >
              <!-- Tab: Datos Básicos -->
              <q-tab-panel name="basic" class="q-pa-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-8">
                    <q-card flat bordered class="q-pa-md q-mb-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="info" class="q-mr-sm" />
                        Información General
                      </div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="promotion.name"
                            label="Nombre de la promoción"
                            filled
                            dense
                            :rules="nameRules"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-select
                            v-model="promotion.status"
                            :options="statusOptions"
                            label="Estado"
                            filled
                            dense
                            emit-value
                            map-options
                          />
                        </div>
                        <div class="col-12">
                          <q-input
                            v-model="promotion.description"
                            label="Descripción"
                            type="textarea"
                            filled
                            dense
                            autogrow
                          />
                        </div>
                      </div>
                    </q-card>

                    <q-card flat bordered class="q-pa-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="schedule" class="q-mr-sm" />
                        Vigencia y Canales
                      </div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="promotion.startDate"
                            label="Fecha de inicio"
                            type="date"
                            filled
                            dense
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="promotion.endDate"
                            label="Fecha de fin"
                            type="date"
                            filled
                            dense
                          />
                        </div>
                        <div class="col-12">
                          <q-select
                            v-model="promotion.channels"
                            :options="channelOptions"
                            label="Canal disponible"
                            filled
                            dense
                            emit-value
                            map-options
                            @update:model-value="$event.target.blur()"
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>

                  <div class="col-12 col-md-4">
                    <q-card flat bordered class="q-pa-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="settings" class="q-mr-sm" />
                        Configuración
                      </div>
                      <div class="q-gutter-md">
                        <q-toggle
                          v-model="promotion.isActive"
                          label="Promoción activa"
                          color="positive"
                        />
                        <q-toggle
                          v-model="promotion.showInCatalog"
                          label="Mostrar en catálogo"
                          color="positive"
                        />
                        <q-toggle
                          v-model="promotion.requiresStock"
                          label="Validar stock"
                          color="positive"
                        />
                      </div>
                    </q-card>
                  </div>
                </div>
              </q-tab-panel>

              <!-- Tab: Grupos de Selección -->
              <q-tab-panel name="groups" class="q-pa-md">
                <div class="row justify-between items-center q-mb-md">
                  <div class="text-h6 text-primary">Grupos de Selección</div>
                  <q-btn
                    color="positive"
                    icon="add"
                    label="Agregar Grupo"
                    unelevated
                    @click="addSelectionGroup"
                  />
                </div>

                <div v-if="promotion.selectionGroups.length === 0" class="text-center q-pa-xl text-grey-6">
                  <q-icon name="group_work" size="4rem" class="q-mb-md" />
                  <div class="text-h6 q-mb-sm">No hay grupos de selección</div>
                  <div class="text-body2">Agrega grupos para organizar los productos de tu promoción</div>
                </div>

                <q-card
                  v-for="(group, groupIndex) in promotion.selectionGroups"
                  :key="`group-${groupIndex}`"
                  class="q-mb-md"
                  flat
                  bordered
                >
                  <q-card-section>
                    <div class="row items-center q-mb-sm">
                      <div class="text-subtitle1 text-weight-medium">
                        Grupo {{ groupIndex + 1 }}
                      </div>
                      <q-space />
                      <q-btn
                        icon="delete"
                        color="negative"
                        size="sm"
                        round
                        flat
                        @click="removeSelectionGroup(groupIndex)"
                      />
                    </div>

                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-md-5">
                        <q-input
                          v-model="group.name"
                          label="Nombre del grupo"
                          filled
                          dense
                          :rules="nameRules"
                        />
                      </div>
                      <div class="col-4 col-md-2">
                        <q-input
                          v-model.number="group.minSelection"
                          label="Mínimo"
                          type="number"
                          min="0"
                          filled
                          dense
                        />
                      </div>
                      <div class="col-4 col-md-2">
                        <q-input
                          v-model.number="group.maxSelection"
                          label="Máximo"
                          type="number"
                          min="1"
                          filled
                          dense
                        />
                      </div>
                      <div class="col-4 col-md-3">
                        <q-toggle
                          v-model="group.required"
                          label="Obligatorio"
                          color="positive"
                        />
                      </div>
                    </div>
                  </q-card-section>

                  <q-separator />

                  <q-card-section>
                    <div class="row justify-between items-center q-mb-md">
                      <div class="text-subtitle2 text-primary">Productos del Grupo</div>
                    </div>

                    <!-- Product List -->
                    <div v-if="group.products.length === 0" class="text-center q-pa-md text-grey-6">
                      <q-icon name="style" size="2rem" class="q-mb-sm" />
                      <div>No hay productos en este grupo.</div>
                    </div>

                    <q-list v-else dense class="q-mb-md bordered-list">
                      <q-item
                        v-for="(product, productIndex) in group.products"
                        :key="`product-${groupIndex}-${productIndex}`"
                      >
                        <q-item-section>
                          <q-item-label>{{ product.name }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <div class="row items-center no-wrap">
                            <div class="text-grey-8 q-mr-md">{{ formatCurrency(product.price) }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              round
                              flat
                              @click="removeProductFromGroup(groupIndex, productIndex)"
                            />
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>

                    <q-separator spaced />
                    <div class="row justify-end items-center q-mt-sm q-pr-sm">
                      <div class="text-subtitle1 text-weight-medium">Total Grupo:</div>
                      <div class="text-subtitle1 text-weight-bold q-ml-md">{{ formatCurrency(calculateGroupTotal(group)) }}</div>
                    </div>
                    <q-separator spaced />

                    <!-- Add Product Select -->
                    <q-select
                      v-model="selectedProductForGroup"
                      filled
                      dense
                      label="Añadir producto al grupo"
                      :options="filteredProducts"
                      use-input
                      @filter="filterProducts"
                      @update:model-value="(selected) => addProductToGroup(groupIndex, selected)"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No se encontraron resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>

                  </q-card-section>
                </q-card>

                <q-card flat bordered class="q-mt-lg">
                  <q-card-section>
                    <div class="row justify-between items-center q-mb-md">
                      <div class="text-subtitle1 text-grey-8">Costo de Productos (Calculado)</div>
                      <div class="text-subtitle1 text-weight-medium">{{ formatCurrency(promotionTotalPrice) }}</div>
                    </div>
                    <q-separator />
                    <div class="row justify-between items-center q-pt-md">
                      <div class="text-h6 text-primary text-weight-bold">Precio Final</div>
                      <div class="col-5">
                        <q-input
                          v-model="promotion.finalPrice"
                          label="Precio de la promoción"
                          filled
                          dense
                          mask="#.##"
                          fill-mask="0"
                          reverse-fill-mask
                          input-class="text-right"
                          :rules="priceRules"
                          @focus="handlePriceFocus"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <!-- Tab: Vista Previa -->
              <q-tab-panel name="preview" class="q-pa-md">
                <div class="text-h6 text-primary q-mb-md">Vista Previa de la Promoción</div>
                <pre class="bg-grey-2 q-pa-md rounded-borders">{{ promotion }}</pre>
              </q-tab-panel>
            </q-tab-panels>
          </div>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md bg-grey-1">
            <q-btn
              color="grey-7"
              label="Cancelar"
              flat
              @click="closeModal"
            />
            <q-btn
              color="primary"
              label="Guardar Promoción"
              type="submit"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { authentication } from 'src/stores/module-authentication'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

// Quasar instance
const $q = useQuasar()
const authStore = authentication()
const branchOffice = computed(() => authStore.branchOffice)

// Reactive state
const showCreateModal = ref(false)
const activeTab = ref('basic')
const saving = ref(false)
const allProducts = ref([])
const filteredProducts = ref([])
const selectedProductForGroup = ref(null) // Para limpiar el q-select

// Promotion data model
const getInitialPromotionState = () => ({
  name: '',
  description: '',
  status: 'active',
  startDate: '',
  endDate: '',
  channels: '',
  isActive: true,
  showInCatalog: true,
  requiresStock: true,
  selectionGroups: [],
  finalPrice: 0
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const calculateGroupTotal = (group) => {
  if (!group || !group.products || group.products.length === 0 || !group.maxSelection) {
    return 0
  }

  const maxPrice = Math.max(...group.products.map(p => p.price))
  return maxPrice * group.maxSelection
}

const promotionTotalPrice = computed(() => {
  return promotion.value.selectionGroups.reduce((total, group) => {
    return total + calculateGroupTotal(group)
  }, 0)
})

// Flattened products from all groups for submission
const promotionProducts = computed(() => {
  return promotion.value.selectionGroups.flatMap((group, groupIndex) =>
    group.products.map(product => ({
      productId: product.productId,
      name: product.name,
      price: product.price,
      groupId: groupIndex
    }))
  )
})

const promotion = ref(getInitialPromotionState())

// Options for selects
const statusOptions = [
  { label: 'Activa', value: 'active' },
  { label: 'Inactiva', value: 'inactive' },
  { label: 'Borrador', value: 'draft' }
]
const channelOptions = [
  { label: 'Punto de Venta', value: 'pos' },
  { label: 'App Móvil', value: 'mobile_app' },
  { label: 'Web', value: 'web' }
]

// Validation Rules
const nameRules = [val => !!val || 'El nombre es requerido']
const priceRules = [val => val >= 0 || 'El precio debe ser positivo']

const handlePriceFocus = (event) => {
  const el = event.target
  setTimeout(() => {
    if (document.activeElement === el) {
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, 0)
}

// Methods
const openCreateModal = () => {
  showCreateModal.value = true
}

const resetForm = () => {
  promotion.value = getInitialPromotionState()
  activeTab.value = 'basic'
  filteredProducts.value = allProducts.value
}

const closeModal = () => {
  showCreateModal.value = false
  resetForm()
}

const fetchProducts = async () => {
  try {
    const params = {
      branch_office_id: branchOffice.value?.id
    }
    const { data } = await api.get('/products', { params })
    const products = data.map(p => ({
      label: p.name,
      value: p.id,
      ...p
    }))
    allProducts.value = products
    filteredProducts.value = products
  } catch (error) {
    console.error('Error fetching products:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los productos.',
      position: 'top'
    })
  }
}

const filterProducts = (val, update) => {
  if (val === '') {
    update(() => {
      filteredProducts.value = allProducts.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    filteredProducts.value = allProducts.value.filter(
      p => p.label.toLowerCase().indexOf(needle) > -1
    )
  })
}

const addSelectionGroup = () => {
  promotion.value.selectionGroups.push({
    name: `Grupo ${promotion.value.selectionGroups.length + 1}`,
    required: false,
    minSelection: 1,
    maxSelection: 1,
    products: []
  })
}

const removeSelectionGroup = (index) => {
  promotion.value.selectionGroups.splice(index, 1)
}

const addProductToGroup = (groupIndex, selectedProduct) => {
  if (!selectedProduct) return

  const group = promotion.value.selectionGroups[groupIndex]
  if (!group) return

  // Evitar duplicados
  const alreadyExists = group.products.some(p => p.productId === selectedProduct.value)
  if (alreadyExists) {
    $q.notify({
      type: 'warning',
      message: 'Este producto ya está en el grupo.',
      position: 'top'
    })
    selectedProductForGroup.value = null // Limpiar selección
    return
  }

  group.products.push({
    productId: selectedProduct.value,
    name: selectedProduct.label,
    price: selectedProduct.price
  })

  selectedProductForGroup.value = null // Limpiar selección
}

const removeProductFromGroup = (groupIndex, productIndex) => {
  const group = promotion.value.selectionGroups[groupIndex]
  if (group) {
    group.products.splice(productIndex, 1)
  }
}

const savePromotion = async () => {
  saving.value = true
  try {
    const payload = {
      ...promotion.value,
      products: promotionProducts.value
    }
    const { data } = await api.post('/promotions', payload)
    $q.notify({
      type: 'positive',
      message: `Promoción "${data.name}" creada con ID: ${data.id}`,
      position: 'top'
    })
    closeModal()
  } catch (error) {
    console.error('Error saving promotion:', error)
    let errorMessage = 'Error al crear la promoción.'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.response && error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      caption: 'Por favor, revise los datos e intente de nuevo.',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.bordered-list {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.promotion-modal {
  height: 85vh;
  display: flex;
  flex-direction: column;
}

.promotion-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tab-panels-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tab-panels-content {
  flex: 1;
  overflow-y: auto;
}

.tab-panels-content .q-tab-panel {
  padding: 16px;
}

/* Asegurar que los tab-panels no crezcan más de lo necesario */
.q-tab-panels {
  min-height: 0;
}

/* Mejorar el comportamiento del scroll en móvil */
@media (max-width: 600px) {
  .promotion-modal {
    height: 100vh;
  }
}
</style>
