<template>
  <div>
    <!-- Modal de promociones reutilizable -->
    <q-dialog
      v-model="internalShowModal"
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
            {{ isEditMode ? 'Editar Promoción' : 'Crear Nueva Promoción' }}
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
          ref="promotionForm"
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
                <div class="row q-col-gutter-md q-pb-md">
                  <div class="col-12 col-md-8">
                    <q-card flat bordered class="q-pa-md q-mb-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="info" class="q-mr-sm" />
                        Información General
                      </div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12">
                          <q-input
                            v-model="promotion.name"
                            label="Nombre de la promoción"
                            filled
                            dense
                            :rules="nameRules"
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
                            label="Canales disponibles"
                            filled
                            dense
                            multiple
                            option-label="label"
                            option-value="value"
                            emit-value
                            map-options
                            use-chips
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>

                  <div class="col-12 col-md-4">
                    <q-card flat bordered class="q-pa-md q-mb-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="image" class="q-mr-sm" />
                        Imagen de la Promo
                      </div>
                      <q-card
                        flat
                        bordered
                        class="dropzone-card q-mb-md"
                        :class="{ 'dropzone-active': isDragOver }"
                        @dragover.prevent="isDragOver = true"
                        @dragleave.prevent="isDragOver = false"
                        @drop.prevent="handleDrop"
                      >
                        <q-card-section class="text-center q-pa-xl q-gutter-y-md">
                          <!-- Image Preview Grid -->
                          <div class="col-12" v-if="promotion.images && promotion.images.length">
                            <div class="text-subtitle2 text-primary q-mb-md">Vista Previa</div>
                            <div class="row q-col-gutter-sm scroll q-pa-sm" style="max-height: 400px;">
                              <div
                                v-for="(image, index) in promotion.images"
                                :key="index"
                                class="col-6 col-sm-4 col-md-4"
                              >
                                <q-card flat class="image-preview-card">
                                  <q-img
                                    :src="image.url"
                                    :ratio="1"
                                    class="rounded-borders"
                                  >
                                    <div class="absolute-top-right bg-transparent">
                                      <q-btn
                                        size="sm"
                                        icon="close"
                                        color="negative"
                                        round
                                        dense
                                        @click="deleteImage(image, index)"
                                      />
                                    </div>
                                  </q-img>
                                </q-card>
                              </div>
                            </div>
                          </div>
                          <div v-else>
                            <q-icon name="cloud_upload" size="4rem" color="grey-5" class="q-mb-md" />
                            <div class="text-h6 text-grey-7 q-mb-sm">
                              Arrastra la imágen aquí
                            </div>
                            <div class="text-body2 text-grey-5 q-mb-md">
                              o haz clic para seleccionar archivo
                            </div>
                          </div>
                          <q-btn
                            color="primary"
                            label="Seleccionar imágen"
                            @click="$refs.fileInput.click()"
                            unelevated
                          />
                          <input
                            ref="fileInput"
                            type="file"
                            multiple
                            accept="image/*"
                            style="display: none"
                            @change="handleFileSelect"
                          />
                        </q-card-section>
                      </q-card>
                    </q-card>

                    <q-card flat bordered class="q-pa-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="settings" class="q-mr-sm" />
                        Configuración
                      </div>
                      <div class="q-gutter-md column">
                        <q-toggle
                          v-model="promotion.status"
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
                          label="Requiere stock"
                          color="positive"
                        />
                      </div>
                    </q-card>
                  </div>
                </div>
              </q-tab-panel>

              <!-- Tab: Grupos de Selección -->
              <q-tab-panel name="groups" class="q-pa-md">
                <div class="q-pb-md">
                  <div class="row justify-between items-center">
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
                        <div class="col-12 col-md-10">
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
                            v-model.number="group.quantity"
                            label="Cantidad"
                            type="number"
                            min="1"
                            filled
                            dense
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
                            <q-item-label>{{ getProductById(product.productId)?.name || getProductById(product.productId)?.label || 'Producto no encontrado' }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <div class="row items-center no-wrap q-gutter-xs">
                              <div v-if="product.priceModifier" class="text-body2 text-weight-medium text-grey-8 q-mr-xs">
                                {{ product.priceModifier.type === 'FIXED' ?
                                    (product.priceModifier.value >= 0 ? '+' : '') + formatCurrency(product.priceModifier.value) :
                                    (product.priceModifier.value >= 0 ? '+' : '') + product.priceModifier.value + '%'
                                }}
                              </div>

                              <!-- Preselected quantity input -->
                              <q-input
                                v-model.number="product.presetQuantity"
                                type="number"
                                min="0"
                                :max="group.quantity"
                                dense
                                filled
                                style="width: 60px;"
                                label="N°"
                                :title="'Cantidad preseleccionada para ' + (getProductById(product.productId)?.name || 'Producto')"
                                @update:model-value="validatePreselectedQuantities(groupIndex)"
                              />

                              <!-- TODO: Botón de editar modificador -->
                              <!-- <q-btn
                                icon="tune"
                                color="primary"
                                size="sm"
                                round
                                flat
                                @click="openProductModifierDialog(groupIndex, productIndex)"
                                :title="'Configurar modificador para ' + (getProductById(product.productId)?.name || getProductById(product.productId)?.label || 'Producto')"
                              /> -->

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

                      <!-- Preselected summary for group -->
                      <div v-if="getGroupPreselectedTotal(group) > 0" class="q-mb-md">
                        <q-card flat bordered class="bg-green-1">
                          <q-card-section class="q-pa-sm">
                            <div class="text-body2 text-weight-medium text-positive">
                              Total preseleccionado: {{ getGroupPreselectedTotal(group) }} / {{ group.quantity }}
                            </div>
                            <div v-if="getGroupPreselectedTotal(group) > group.quantity" class="text-caption text-negative q-mt-xs">
                              Excede la cantidad permitida para este grupo
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>

                      <!-- Add Product Select -->
                      <q-select
                        v-model="selectedProductForGroup"
                        filled
                        dense
                        label="Añadir producto al grupo"
                        :options="filteredProducts"
                        option-label="label"
                        option-value="value"
                        use-input
                        @filter="filterProducts"
                        @update:model-value="(selected) => addProductToGroup(groupIndex, selected)"
                      />

                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="q-mt-lg">
                    <q-card-section>
                      <div class="row justify-between items-center q-mb-md">
                        <div class="text-h6 text-primary text-weight-bold">Configuración de precio</div>
                      </div>
                      <q-separator />
                      <div class="row justify-between items-center q-pt-md">
                        <div class="col-6">
                          <q-input
                            v-model="promotion.finalPrice"
                            label="Precio Base de la Promoción"
                            filled
                            dense
                            type="number"
                            min="0"
                            step="0.01"
                            prefix="$"
                            :rules="priceRules"
                            @focus="handlePriceFocus"
                          />
                          <div class="text-body2 text-weight-medium q-mt-sm">
                            Precio sugerido: {{ formatCurrency(suggestedBasePrice) }}
                          </div>
                        </div>
                        <!--
                        <div class="col-5 text-right">
                          <div class="text-body2 text-grey-7">Modificadores Activos:</div>

                          Modificadores de Productos

                          <div v-if="getProductsWithModifiers().length > 0" class="text-caption q-mt-xs">
                            <div class="text-grey-6 q-mb-xs">Modificadores por producto:</div>
                            <div v-for="productMod in getProductsWithModifiers()" :key="productMod.name" class="q-mb-xs">
                              <div class="text-body2 text-weight-medium text-grey-8">
                                {{ productMod.name }}: {{ productMod.displayText }}
                              </div>
                            </div>
                          </div>

                          Mensaje cuando no hay modificadores

                          <div v-if="getProductsWithModifiers().length === 0" class="text-caption text-grey-5 q-mt-xs">
                            Sin modificadores configurados
                          </div>
                        </div>
                        -->
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
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
              :label="isEditMode ? 'Actualizar Promoción' : 'Guardar Promoción'"
              type="submit"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Product Price Modifier Dialog -->
    <q-dialog v-model="showProductModifierDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-blue text-white">
          <div class="row items-center">
            <div class="col">
              <h6 class="q-ma-none">Configurar Modificador del Producto</h6>
              <div class="text-caption" v-if="currentModifierProduct">
                {{ currentModifierProduct.name }}
              </div>
            </div>
            <div class="col-auto">
              <q-btn flat round icon="close" @click="closeProductModifierDialog" color="white" />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <div class="text-body2 text-grey-7">
              Precio base de la promoción: <span class="text-weight-bold">{{ formatCurrency(promotion.finalPrice || 0) }}</span>
            </div>

            <q-select
              v-model="productModifierForm.type"
              :options="modifierTypeOptions"
              label="Tipo de Modificador"
              filled
              option-label="label"
              option-value="value"
              emit-value
              map-options
            />

            <q-input
              v-model.number="productModifierForm.value"
              :label="productModifierForm.type === 'FIXED' ? 'Monto Fijo' : 'Porcentaje'"
              :prefix="productModifierForm.type === 'FIXED' ? '$' : ''"
              :suffix="productModifierForm.type === 'PERCENTAGE' ? '%' : ''"
              type="number"
              filled
              :step="productModifierForm.type === 'FIXED' ? '0.01' : '0.1'"
              :min="productModifierForm.type === 'FIXED' ? undefined : -100"
              :max="productModifierForm.type === 'PERCENTAGE' ? 1000 : undefined"
            />

            <q-input
              v-model="productModifierForm.description"
              label="Descripción (opcional)"
              type="textarea"
              rows="2"
              filled
              placeholder="Ej: Descuento especial, Recargo por ingrediente premium, etc."
            />

            <q-separator />

            <div class="text-center">
              <div class="text-body2 text-grey-7 q-mb-sm">Vista Previa del Precio</div>
              <div class="row justify-center items-baseline q-gutter-sm">
                <div class="text-h6 text-grey-6" :class="{ 'text-strike': productModifierForm.value !== 0 }">
                  {{ formatCurrency(promotion.finalPrice || 0) }}
                </div>
                <q-icon v-if="productModifierForm.value !== 0" name="arrow_forward" color="grey" />
                <div v-if="productModifierForm.value !== 0" class="text-h6 text-weight-bold" :class="getProductModifierPreview() > (promotion.finalPrice || 0) ? 'text-positive' : 'text-negative'">
                  {{ formatCurrency(getProductModifierPreview()) }}
                </div>
              </div>
              <div v-if="productModifierForm.value !== 0" class="text-caption text-grey-6 q-mt-xs">
                {{ productModifierForm.type === 'FIXED' ?
                    (productModifierForm.value >= 0 ? 'Incremento' : 'Descuento') + ' de ' + formatCurrency(Math.abs(productModifierForm.value)) + ' por unidad' :
                    (productModifierForm.value >= 0 ? 'Incremento' : 'Descuento') + ' del ' + Math.abs(productModifierForm.value) + '% por unidad'
                }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="closeProductModifierDialog" />
          <q-btn
            flat
            label="Quitar Modificador"
            color="negative"
            @click="removeProductModifier"
            v-if="currentModifierProduct && currentModifierProduct.priceModifier"
          />
          <q-btn color="primary" label="Aplicar" @click="applyProductModifier" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { authentication } from 'src/stores/module-authentication'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

// Props
const props = defineProps({
  // Controla la visibilidad del modal
  modelValue: {
    type: Boolean,
    default: false
  },
  // Modo edición: true = editar, false = crear
  editMode: {
    type: Boolean,
    default: false
  },
  // Datos de la promoción para edición
  promotionData: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'promotion-saved', 'promotion-updated'])

// Quasar instance
const $q = useQuasar()
const authStore = authentication()
const branchOffice = computed(() => authStore.branchOffice)

// Reactive state
const activeTab = ref('basic')
const saving = ref(false)
const promotionForm = ref(null)
const allProducts = ref([])
const filteredProducts = ref([])
const selectedProductForGroup = ref(null) // Para limpiar el q-select

// Computed properties
const internalShowModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditMode = computed(() => props.editMode && props.promotionData)

// Product Price Modifier Dialog
const showProductModifierDialog = ref(false)
const currentModifierGroupIndex = ref(0)
const currentModifierProductIndex = ref(0)
const currentModifierProduct = ref(null)
const productModifierForm = ref({
  type: 'FIXED',
  value: 0,
  description: ''
})

// Promotion data model
const getInitialPromotionState = () => ({
  name: '',
  description: '',
  channels: ['pos'],
  startDate: null,
  endDate: null,
  status: true,
  showInCatalog: true,
  requiresStock: true,
  selectionGroups: [],
  finalPrice: 0,
  imageUrl: null,
  images: []
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const suggestedBasePrice = computed(() => {
  let total = 0

  promotion.value.selectionGroups.forEach(group => {
    const quantity = group.quantity || 1
    let maxPrice = 0

    // Find the most expensive product in this group
    group.products.forEach(product => {
      const productDetails = getProductById(product.productId)
      if (productDetails?.price && productDetails.price > maxPrice) {
        maxPrice = productDetails.price
      }
    })

    // Add max price * quantity for this group
    total += maxPrice * quantity
  })

  return total
})

const promotion = ref(getInitialPromotionState())
const isDragOver = ref(false)

const channelOptions = [
  { label: 'Punto de Venta', value: 'pos' },
  { label: 'App Móvil', value: 'mobile_app' },
  { label: 'Web', value: 'web' }
]

const modifierTypeOptions = [
  { label: 'Monto Fijo ($)', value: 'FIXED' },
  { label: 'Porcentaje (%)', value: 'PERCENTAGE' }
]

// Validation Rules
const nameRules = [val => !!val || 'El nombre es requerido']
const priceRules = [
  val => (val !== null && val !== '') || 'El precio es requerido',
  val => val > 0 || 'El precio debe ser mayor a cero'
]

const handlePriceFocus = (event) => {
  // No need to do anything special for number inputs
}

// Watch for props changes
watch(
  () => [props.modelValue, props.promotionData, props.editMode],
  ([newModelValue, newPromotionData, newEditMode]) => {
    if (newModelValue && newEditMode && newPromotionData) {
      // Cargar datos para edición
      loadPromotionForEdit(newPromotionData)
    } else if (newModelValue && !newEditMode) {
      // Resetear para creación
      resetForm()
    }
  },
  { immediate: true, deep: true }
)

// Methods
const resetForm = () => {
  promotion.value = getInitialPromotionState()
  activeTab.value = 'basic'
  filteredProducts.value = allProducts.value
}

const loadPromotionForEdit = (promotionData) => {
  if (promotionData) {
    promotion.value = {
      ...getInitialPromotionState(),
      ...promotionData,
      // Asegurar que arrays existen
      selectionGroups: promotionData.selectionGroups || [],
      images: promotionData.images || []
    }
  }
}

const closeModal = () => {
  internalShowModal.value = false
  resetForm()
}

// Multiple image handling functions
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  processFiles(files)
}

const handleDrop = (event) => {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files || [])
  processFiles(files)
}

const processFiles = (files) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Por favor selecciona archivos de imagen válidos.',
      position: 'top'
    })
    return
  }

  imageFiles.forEach(file => {
    // Validate file size (5MB max)
    if (file.size > 5242880) {
      $q.notify({
        type: 'negative',
        message: `La imagen ${file.name} es demasiado grande. Máximo 5MB.`,
        position: 'top'
      })
      return
    }

    // Create FileReader to convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = {
        url: e.target.result,
        name: file.name,
        size: file.size,
        type: file.type
      }

      // Initialize images array if it doesn't exist
      if (!promotion.value.images) {
        promotion.value.images = []
      }

      promotion.value.images.push(imageData)

      $q.notify({
        type: 'positive',
        message: `Imagen ${file.name} cargada correctamente`,
        position: 'top',
        timeout: 2000
      })
    }

    reader.onerror = () => {
      $q.notify({
        type: 'negative',
        message: `Error al cargar la imagen ${file.name}`,
        position: 'top'
      })
    }

    reader.readAsDataURL(file)
  })
}

const deleteImage = (image, index) => {
  if (promotion.value.images && promotion.value.images.length > index) {
    promotion.value.images.splice(index, 1)
    $q.notify({
      type: 'positive',
      message: 'Imagen eliminada',
      position: 'top'
    })
  }
}

const fetchProducts = async () => {
  try {
    const params = {
      branch_office_id: branchOffice.value?.id
    }
    const { data } = await api.get('/products', { params })
    console.log('Productos obtenidos:', data) // Debug
    const products = data.map(p => ({
      label: p.name || p.label || `Producto ${p.id}`,
      value: p.id,
      ...p
    }))
    console.log('Productos mapeados:', products) // Debug
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
  console.log('Filtrando productos con valor:', val) // Debug
  console.log('Productos disponibles:', allProducts.value.length) // Debug

  if (val === '') {
    update(() => {
      filteredProducts.value = allProducts.value
      console.log('Sin filtro - mostrando todos:', filteredProducts.value.length) // Debug
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredProducts.value = allProducts.value.filter(
      p => {
        const label = p.label || p.name || ''
        const match = label.toLowerCase().indexOf(needle) > -1
        console.log(`Producto: ${label}, Busca: ${needle}, Coincide: ${match}`) // Debug
        return match
      }
    )
    console.log('Productos filtrados:', filteredProducts.value.length) // Debug
  })
}

const addSelectionGroup = () => {
  promotion.value.selectionGroups.push({
    name: `Grupo ${promotion.value.selectionGroups.length + 1}`,
    quantity: 1,
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
    priceModifier: null,
    presetQuantity: 0
  })

  selectedProductForGroup.value = null // Limpiar selección
}

const removeProductFromGroup = (groupIndex, productIndex) => {
  const group = promotion.value.selectionGroups[groupIndex]
  if (group) {
    group.products.splice(productIndex, 1)
  }
}

// Get product details by ID
const getProductById = (productId) => {
  return allProducts.value.find(p => p.id === productId || p.value === productId)
}

// Get total preselected quantity for a group
const getGroupPreselectedTotal = (group) => {
  return group.products.reduce((total, product) => {
    return total + (product.presetQuantity || 0)
  }, 0)
}

// Validate preselected quantities for a group
const validatePreselectedQuantities = (groupIndex) => {
  const group = promotion.value.selectionGroups[groupIndex]
  if (!group) return

  const total = getGroupPreselectedTotal(group)

  if (total > group.quantity) {
    $q.notify({
      type: 'warning',
      message: `El total preseleccionado (${total}) excede la cantidad permitida para este grupo (${group.quantity})`,
      position: 'top'
    })
  }
}

/* TODO: Funcion para obtener los productos con modificadores */
// const getProductsWithModifiers = () => {
//   const productsWithModifiers = []

//   promotion.value.selectionGroups.forEach(group => {
//     group.products.forEach(product => {
//       if (product.priceModifier) {
//         const productDetails = getProductById(product.productId)
//         productsWithModifiers.push({
//           name: productDetails?.name || productDetails?.label || 'Producto no encontrado',
//           modifier: product.priceModifier,
//           displayText: product.priceModifier.type === 'FIXED'
//             ? (product.priceModifier.value >= 0 ? '+' : '') + formatCurrency(product.priceModifier.value)
//             : (product.priceModifier.value >= 0 ? '+' : '') + product.priceModifier.value + '%'
//         })
//       }
//     })
//   })

//   return productsWithModifiers
// }

/* TODO: Funcion para abrir el dialogo de modificador de producto */
// const openProductModifierDialog = (groupIndex, productIndex) => {
//   currentModifierGroupIndex.value = groupIndex
//   currentModifierProductIndex.value = productIndex
//   currentModifierProduct.value = promotion.value.selectionGroups[groupIndex].products[productIndex]

//   // Load existing modifier if present
//   if (currentModifierProduct.value.priceModifier) {
//     productModifierForm.value = {
//       type: currentModifierProduct.value.priceModifier.type,
//       value: currentModifierProduct.value.priceModifier.value,
//       description: currentModifierProduct.value.priceModifier.description || ''
//     }
//   } else {
//     productModifierForm.value = {
//       type: 'FIXED',
//       value: 0,
//       description: ''
//     }
//   }

//   showProductModifierDialog.value = true
// }

const closeProductModifierDialog = () => {
  showProductModifierDialog.value = false
  currentModifierProduct.value = null
  productModifierForm.value = {
    type: 'FIXED',
    value: 0,
    description: ''
  }
}

const getProductModifierPreview = () => {
  const basePrice = Number(promotion.value.finalPrice) || 0

  if (Number(productModifierForm.value.value) === 0) {
    return basePrice
  }

  let price = basePrice

  if (productModifierForm.value.type === 'FIXED') {
    price += Number(productModifierForm.value.value)
  } else if (productModifierForm.value.type === 'PERCENTAGE') {
    price += (basePrice * Number(productModifierForm.value.value) / 100)
  }

  return Math.max(0, price)
}

const applyProductModifier = () => {
  if (!currentModifierProduct.value) return

  const product = promotion.value.selectionGroups[currentModifierGroupIndex.value]
    .products[currentModifierProductIndex.value]

  if (productModifierForm.value.value === 0) {
    // Remove modifier if value is 0
    product.priceModifier = null
  } else {
    product.priceModifier = {
      type: productModifierForm.value.type,
      value: Number(productModifierForm.value.value),
      description: productModifierForm.value.description || null
    }
  }

  $q.notify({
    type: 'positive',
    message: 'Modificador de producto aplicado',
    position: 'top'
  })

  closeProductModifierDialog()
}

const removeProductModifier = () => {
  if (!currentModifierProduct.value) return

  const product = promotion.value.selectionGroups[currentModifierGroupIndex.value]
    .products[currentModifierProductIndex.value]

  product.priceModifier = null

  $q.notify({
    type: 'info',
    message: 'Modificador de producto removido',
    position: 'top'
  })

  closeProductModifierDialog()
}

const savePromotion = async () => {
  const formIsValid = await promotionForm.value.validate()

  let customValidation = true
  let customMessage = ''

  if (promotion.value.selectionGroups.length === 0) {
    customValidation = false
    customMessage = 'Debe agregar al menos un grupo de selección.'
  } else if (promotion.value.selectionGroups.some(g => g.products.length === 0)) {
    customValidation = false
    customMessage = 'Todos los grupos deben contener al menos un producto.'
  }

  if (!formIsValid || !customValidation) {
    $q.notify({
      type: 'negative',
      message: customMessage || 'Por favor, complete todos los campos requeridos.',
      position: 'top'
    })
    return
  }

  saving.value = true
  try {
    const payload = {
      ...promotion.value,
      finalPrice: Number(promotion.value.finalPrice)
    }

    let response
    if (isEditMode.value) {
      // Actualizar promoción existente
      response = await api.put(`/promotions/${promotion.value.id}`, payload)
      $q.notify({
        type: 'positive',
        message: `Promoción "${response.data.name}" actualizada exitosamente`,
        position: 'top'
      })
      emit('promotion-updated', response.data)
    } else {
      // Crear nueva promoción
      response = await api.post('/promotions', payload)
      $q.notify({
        type: 'positive',
        message: `Promoción "${response.data.name}" creada con ID: ${response.data.id}`,
        position: 'top'
      })
      emit('promotion-saved', response.data)
    }

    closeModal()
  } catch (error) {
    console.error('Error saving promotion:', error)
    let errorMessage = isEditMode.value ? 'Error al actualizar la promoción.' : 'Error al crear la promoción.'
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

const fetchPromotions = async () => {
  try {
    const params = {
      branch_office_id: branchOffice.value?.id
    }
    const { data } = await api.get('/promotions', { params })
    console.log('=== TODAS LAS PROMOCIONES GUARDADAS ===')
    console.log('Total de promociones:', data.length)
    data.forEach((promo, index) => {
      console.log(`\n--- Promoción ${index + 1} ---`)
      console.log('ID:', promo.id)
      console.log('Nombre:', promo.name)
      console.log('Precio Final:', promo.finalPrice)
      console.log('Estado:', promo.status)
      console.log('Canales:', promo.channels)
      console.log('Grupos de Selección:', promo.selectionGroups?.length || 0)
      console.log('Datos completos:', promo)
    })
    console.log('=== FIN LISTADO PROMOCIONES ===')
  } catch (error) {
    console.error('Error fetching promotions:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchProducts()
  fetchPromotions()
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

/* Dropzone styles */
.dropzone-card {
  border: 2px dashed #e0e0e0 !important;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.dropzone-card:hover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.dropzone-active {
  border-color: #1976d2 !important;
  background-color: #e3f2fd !important;
  transform: scale(1.02);
}

.image-preview-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.image-preview-card:hover {
  transform: scale(1.05);
}

/* Mejorar el comportamiento del scroll en móvil */
@media (max-width: 600px) {
  .promotion-modal {
    height: 100vh;
  }
}
</style>
