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
            <q-tab name="groups" label="Grupos de Selección" />
            <q-tab name="products" label="Productos" />
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

                    <q-card flat bordered class="q-pa-md q-mb-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="attach_money" class="q-mr-sm" />
                        Configuración de Precio
                      </div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12 col-md-6">
                          <q-select
                            v-model="promotion.priceMode"
                            :options="priceModeOptions"
                            label="Modo de precio"
                            filled
                            dense
                            emit-value
                            map-options
                            @update:model-value="(val) => $event.target.blur()"
                          />
                        </div>
                        <div class="col-12 col-md-6" v-if="promotion.priceMode === 'fixed'">
                          <q-input
                            v-model.number="promotion.fixedPrice"
                            label="Precio fijo"
                            type="number"
                            step="0.01"
                            filled
                            dense
                            :rules="priceRules"
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
                  v-for="(group, index) in promotion.selectionGroups"
                  :key="`group-${index}`"
                  class="q-mb-md"
                  flat
                  bordered
                >
                  <q-card-section>
                    <div class="row items-center q-mb-md">
                      <div class="text-subtitle1 text-weight-medium">
                        Grupo {{ index + 1 }}
                      </div>
                      <q-space />
                      <q-btn
                        icon="delete"
                        color="negative"
                        size="sm"
                        round
                        flat
                        @click="removeSelectionGroup(index)"
                      />
                    </div>

                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="group.name"
                          label="Nombre del grupo"
                          filled
                          dense
                          :rules="nameRules"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-toggle
                          v-model="group.required"
                          label="Selección obligatoria"
                          color="positive"
                        />
                      </div>
                      <div class="col-4">
                        <q-input
                          v-model.number="group.minSelection"
                          label="Mínimo"
                          type="number"
                          min="0"
                          filled
                          dense
                        />
                      </div>
                      <div class="col-4">
                        <q-input
                          v-model.number="group.maxSelection"
                          label="Máximo"
                          type="number"
                          min="1"
                          filled
                          dense
                        />
                      </div>
                      <div class="col-4">
                        <q-input
                          v-model.number="group.step"
                          label="Paso"
                          type="number"
                          min="1"
                          filled
                          dense
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <!-- Tab: Productos -->
              <q-tab-panel name="products" class="q-pa-md">
                <div class="row justify-between items-center q-mb-md">
                  <div class="text-h6 text-primary">Productos Disponibles</div>
                  <q-btn
                    color="positive"
                    icon="add"
                    label="Agregar Producto"
                    unelevated
                    @click="addProduct"
                  />
                </div>

                <div v-if="promotion.products.length === 0" class="text-center q-pa-xl text-grey-6">
                  <q-icon name="inventory" size="4rem" class="q-mb-md" />
                  <div class="text-h6 q-mb-sm">No hay productos agregados</div>
                  <div class="text-body2">Agrega productos que estarán disponibles en esta promoción</div>
                </div>

                <q-card
                  v-for="(product, index) in promotion.products"
                  :key="`product-${index}`"
                  class="q-mb-md"
                  flat
                  bordered
                >
                  <q-card-section>
                    <div class="row items-center q-mb-md">
                      <div class="text-subtitle1 text-weight-medium">
                        {{ product.name || `Producto ${index + 1}` }}
                      </div>
                      <q-space />
                      <q-btn
                        icon="delete"
                        color="negative"
                        size="sm"
                        round
                        flat
                        @click="removeProduct(index)"
                      />
                    </div>

                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-md-4">
                        <q-select
                          v-model="product.productId"
                          :options="filteredProducts"
                          label="Seleccionar producto"
                          filled
                          dense
                          emit-value
                          map-options
                          use-input
                          @filter="filterProducts"
                          @update:model-value="(val) => {
                            onProductSelect(product, allProducts.find(p => p.value === val));
                            $event.target.blur();
                          }"
                          :rules="[val => !!val || 'Debe seleccionar un producto']"
                        >
                          <template v-slot:no-option>
                            <q-item>
                              <q-item-section class="text-grey">
                                No se encontraron resultados
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                      <div class="col-12 col-md-4">
                        <q-select
                          v-model="product.groupId"
                          :options="groupOptions"
                          label="Grupo asignado"
                          filled
                          dense
                          emit-value
                          map-options
                          @update:model-value="(val) => $event.target.blur()"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model.number="product.price"
                          label="Precio unitario"
                          type="number"
                          step="0.01"
                          filled
                          dense
                          :rules="priceRules"
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

// Promotion data model
const getInitialPromotionState = () => ({
  name: '',
  description: '',
  status: 'active',
  priceMode: 'fixed',
  fixedPrice: 0,
  startDate: '',
  endDate: '',
  channels: '',
  isActive: true,
  showInCatalog: true,
  requiresStock: true,
  selectionGroups: [],
  products: []
})

const promotion = ref(getInitialPromotionState())

// Options for selects
const statusOptions = [
  { label: 'Activa', value: 'active' },
  { label: 'Inactiva', value: 'inactive' },
  { label: 'Borrador', value: 'draft' }
]
const priceModeOptions = [
  { label: 'Precio Fijo', value: 'fixed' },
  { label: 'Suma de productos', value: 'sum_products' }
]
const channelOptions = [
  { label: 'Punto de Venta', value: 'pos' },
  { label: 'App Móvil', value: 'mobile_app' },
  { label: 'Web', value: 'web' }
]

// Computed properties
const groupOptions = computed(() => {
  return promotion.value.selectionGroups.map((group, index) => ({
    label: group.name || `Grupo ${index + 1}`,
    value: index
  }))
})

// Validation Rules
const nameRules = [val => !!val || 'El nombre es requerido']
const priceRules = [val => val >= 0 || 'El precio debe ser positivo']

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
    name: '',
    required: false,
    minSelection: 1,
    maxSelection: 1,
    step: 1
  })
}

const removeSelectionGroup = (index) => {
  promotion.value.selectionGroups.splice(index, 1)
}

const addProduct = () => {
  promotion.value.products.push({
    productId: null,
    name: '',
    price: 0,
    groupId: null
  })
}

const removeProduct = (index) => {
  promotion.value.products.splice(index, 1)
}

const onProductSelect = (product, selectedProduct) => {
  if (selectedProduct) {
    product.name = selectedProduct.name
    product.price = selectedProduct.price
  }
}

const savePromotion = async () => {
  saving.value = true
  try {
    const { data } = await api.post('/promotions', promotion.value)
    $q.notify({
      type: 'positive',
      message: `Promoción "${data.name}" creada con ID: ${data.id}`,
      position: 'top'
    })
    closeModal()
  } catch (error) {
    console.error('Error saving promotion:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al crear la promoción',
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
