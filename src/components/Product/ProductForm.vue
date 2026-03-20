<template>
  <q-form @submit="onSave" ref="productForm" class="full-width">
    <q-tabs
      v-model="activeTab"
      class="text-grey col-auto"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="basicData" label="Datos básicos" />
      <q-tab name="stock" label="Stock" v-if="isEdit && !product.is_bundle" />
      <q-tab name="product" label="Combo / Pack" v-if="product.is_bundle" />
      <q-tab name="recipe" label="Receta (Ingredientes)" v-if="isRecipeType && !isProduct" />
    </q-tabs>

    <q-separator />

    <q-tab-panels
      v-model="activeTab"
      animated
      class="scroll"
      :style="$q.screen.lt.sm ? '' : 'max-height: calc(100vh - 280px);'"
    >
      <q-tab-panel name="basicData">
        <div class="row q-col-gutter-md">
          <div class="row col-md-7 col-xs-12 col-sm-12">
            <!-- Datos básicos -->
            <div class="col-12">
              <q-card flat bordered class="q-pa-md q-mb-md">
                <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                  <q-icon name="info" class="q-mr-sm" />
                  Datos básicos
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-input
                      filled
                      v-model="product.barcode"
                      autofocus
                      label="Código de barra"
                      dense
                      hide-bottom-space
                    >
                      <template v-slot:append v-if="$q.platform.is.nativeMobile">
                        <q-icon name="qr_code_scanner" size="sm" class="cursor-pointer" @click.stop="$emit('scanner')" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-input
                      :rules="[val => !!val || 'El campo es requerido.']"
                      lazy-rules
                      filled
                      v-model="product.name"
                      label="Nombre"
                      dense
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-select
                      use-input
                      filled
                      label="Categoría"
                      input-debounce="500"
                      option-label="name"
                      option-value="id"
                      v-model="category"
                      :options="categories"
                      :rules="[val => !!val || 'El campo es requerido.']"
                      lazy-rules
                      @filter="(val, update) => $emit('filter-categories', val, update)"
                      @update:model-value="onSetCategory"
                      dense
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-select
                      filled
                      v-model="product.product_type"
                      :options="productTypeOptions"
                      label="Tipo de Producto"
                      emit-value
                      map-options
                      dense
                      hide-bottom-space
                      :rules="[val => !!val || 'Requerido']"
                      lazy-rules
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                            <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-select
                      filled
                      dense
                      v-model="unitOfMeasure"
                      :options="unitOfMeasures"
                      option-label="name"
                      option-value="id"
                      label="Unidad de Medida"
                      hide-bottom-space
                      :rules="[val => !!val || 'Requerido']"
                      lazy-rules
                      @update:model-value="onSetUom"
                    />
                  </div>
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-input
                      filled
                      dense
                      v-model.number="product.base_quantity"
                      label="Cantidad de la unidad"
                      type="number"
                      step="0.01"
                      min="0.01"
                      hide-bottom-space
                      hint="Cantidad del producto en gramos o mililitros"
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      filled
                      v-model="product.description"
                      type="textarea"
                      autogrow
                      label="Descripción"
                      dense
                      hide-bottom-space
                    />
                  </div>
                </div>
              </q-card>
            </div>

            <!-- Precios -->
            <div class="col-12">
              <q-card flat bordered class="q-pa-md q-mb-md">
                <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                  <q-icon name="attach_money" class="q-mr-sm" />
                  Precios
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                    <q-input
                      :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                      lazy-rules
                      filled
                      v-model="product.cost"
                      label="Costo"
                      type="number"
                      dense
                      hide-bottom-space
                      @update:model-value="updateCost"
                    />
                  </div>
                  <div class="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-xs-12">
                    <q-input
                      filled
                      v-model="profitPercentageDisplay"
                      label="Margen %"
                      dense
                      hide-bottom-space
                      class="profit-percentage-input"
                      @update:model-value="handleProfitPercentageInput"
                      @focus="onMarginFocus"
                    />
                  </div>
                  <div class="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-xs-12">
                    <q-input
                      :rules="[val => !!val || 'El campo es requerido.']"
                      lazy-rules
                      filled
                      v-model="product.price"
                      label="Precio base"
                      type="number"
                      step=".00"
                      dense
                      hide-bottom-space
                      @update:model-value="updatePrice"
                    />
                  </div>
                  <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                    <q-input
                      filled
                      v-model="product.minimum_stock"
                      label="Stock mínimo"
                      type="number"
                      step=".00"
                      dense
                      hide-bottom-space
                    />
                  </div>
                </div>

                <!-- Lista de precios adicionales -->
                <div class="q-mb-md q-mt-md">
                  <div class="flex items-center justify-between q-mb-sm">
                    <span class="text-body1 text-weight-medium">Listas de precios adicionales</span>
                    <q-btn
                      color="positive"
                      icon="add"
                      label="Agregar lista"
                      size="sm"
                      @click="addPriceList"
                      unelevated
                    />
                  </div>

                  <div v-if="priceLists.length === 0" class="text-center q-pa-md text-grey-6">
                    <q-icon name="list_alt" size="2rem" class="q-mb-sm" />
                    <div>No hay listas de precios adicionales</div>
                  </div>

                  <q-card
                    v-for="(priceList, index) in priceLists"
                    :key="index"
                    class="q-mb-sm q-pa-none"
                  >
                    <q-card-section class="q-pa-md">
                      <div class="row q-gutter-x-md items-start">
                        <div class="col">
                          <q-input
                            v-model="priceList.name"
                            label="Nombre"
                            filled
                            dense
                            :rules="[val => !!val || 'Requerido']"
                            lazy-rules
                          />
                        </div>
                        <div class="col">
                          <q-input
                            v-model="priceList.profitPercentageDisplay"
                            label="Margen %"
                            filled
                            dense
                            class="profit-percentage-input"
                            inputmode="numeric"
                            @update:model-value="val => handlePriceListMarginInput(val, priceList)"
                            @focus="initializePriceListMargin(priceList)"
                          />
                        </div>
                        <div class="col">
                          <q-input
                            v-model="priceList.price"
                            label="Precio"
                            type="number"
                            step=".01"
                            filled
                            dense
                            @update:model-value="calculatePriceListMargin(priceList)"
                          />
                        </div>
                        <div class="col-auto">
                          <q-btn
                            icon="delete"
                            color="negative"
                            round
                            flat
                            @click="removePriceList(index)"
                          >
                            <q-tooltip>Eliminar lista</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                    <q-select
                      use-input
                      filled
                      label="IVA (%)"
                      input-debounce="0"
                      option-label="Desc"
                      option-value="id"
                      v-model="product.aliquot_type"
                      :options="aliquotTypes"
                      @filter="(val, update) => $emit('filter-aliquots', val, update)"
                      dense
                      hide-bottom-space
                    />
                  </div>
                </div>
              </q-card>
            </div>
          </div>

          <!-- Sección de imágenes y configuración -->
          <div class="col-md-5 col-xs-12 col-sm-12">
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                <q-icon name="image" class="q-mr-sm" />
                Imágenes
              </div>
              <q-card
                flat
                bordered
                class="dropzone-card q-mb-md"
                :class="{ 'dropzone-active': isDragOver }"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="onHandleDrop"
              >
                <q-card-section class="text-center q-pa-xl q-gutter-y-md">
                  <div class="col-12" v-if="product.images?.length">
                    <div class="text-subtitle2 text-primary q-mb-md">Vista Previa</div>
                    <div class="row q-col-gutter-md scroll q-pa-sm" style="max-height: 400px;">
                      <div
                        v-for="(image, index) in product.images"
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
                                @click="onDeleteImage(image, index)"
                              />
                            </div>
                          </q-img>
                        </q-card>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <q-icon name="cloud_upload" size="4rem" color="grey-5" class="q-mb-md" />
                    <div class="text-h6 text-grey-7 q-mb-sm">Arrastra las imágenes aquí</div>
                    <div class="text-body2 text-grey-5 q-mb-md">o haz clic para seleccionar archivos</div>
                  </div>
                  <q-btn
                    color="primary"
                    label="Seleccionar Imágenes"
                    @click="$refs.fileInput.click()"
                    unelevated
                  />
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    style="display: none"
                    @change="onHandleFileSelect"
                  />
                </q-card-section>
              </q-card>

              <q-card flat bordered class="q-pa-md">
                <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                  <q-icon name="settings" class="q-mr-sm" />
                  Configuración
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <q-toggle
                      v-model="product.skip_stock"
                      label="Facturar sin stock"
                      :true-value="1"
                      :false-value="0"
                      color="positive"
                    />
                  </div>
                  <div class="col-6">
                    <q-toggle
                      v-model="product.is_bundle"
                      label="Pack"
                      :true-value="1"
                      :false-value="0"
                      color="positive"
                    />
                  </div>
                  <div class="col-6">
                    <q-toggle
                      v-model="product.is_addons"
                      label="Es un adicional"
                      :true-value="1"
                      :false-value="0"
                      color="positive"
                    />
                  </div>
                  <div class="col-6">
                    <q-toggle
                      v-model="product.show_catalog"
                      label="Mostrar en catálogo"
                      :true-value="1"
                      :false-value="0"
                      color="positive"
                    />
                  </div>
                </div>
                <div class="q-mt-md" v-if="product.is_addons">
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
                    @filter="(val, update) => $emit('filter-addons', val, update)"
                    dense
                  />
                </div>
              </q-card>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="stock" v-if="isEdit && !product.is_bundle">
        <stock-product :product="product" />
      </q-tab-panel>

      <q-tab-panel name="product" v-if="product.is_bundle">
        <pack-product :product="product" />
      </q-tab-panel>

      <q-tab-panel name="recipe" v-if="isRecipeType && !isProduct">
        <recipe-product :product="product" @update:ingredients="onRecipeUpdate" />
      </q-tab-panel>
    </q-tab-panels>

    <q-card-actions align="right" class="q-pa-md q-gutter-sm">
      <q-btn color="secondary" label="Cancelar" flat @click="$emit('cancel')" />
      <q-btn color="primary" label="Guardar" type="submit" :loading="loading" unelevated />
    </q-card-actions>
  </q-form>
</template>

<script>
import StockProduct from './StockProduct.vue'
import RecipeProduct from './RecipeProduct.vue'
import PackProduct from './PackProduct.vue'

export default {
  name: 'ProductForm',
  components: { StockProduct, RecipeProduct, PackProduct },
  props: {
    value: {
      type: Object,
      required: true
    },
    categories: {
      type: Array,
      default: () => []
    },
    unitOfMeasures: {
      type: Array,
      default: () => []
    },
    aliquotTypes: {
      type: Array,
      default: () => []
    },
    productTypeOptions: {
      type: Array,
      default: () => [
        { label: 'Producto', value: 'PRODUCT', description: 'Producto para venta' },
        { label: 'Materia Prima', value: 'RAW_MATERIAL', description: 'Insumo básico para recetas' },
        { label: 'Sub-receta', value: 'SUB_RECIPE', description: 'Producto intermedio fabricado' },
        { label: 'Receta', value: 'FINISHED_GOOD', description: 'Receta para fabricar un producto' }
      ]
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    tab: {
      type: String,
      default: 'basicData'
    }
  },
  data () {
    return {
      activeTab: this.tab,
      product: JSON.parse(JSON.stringify(this.value)),
      category: null,
      unitOfMeasure: null,
      addonsProducts: this.value.addons || [],
      addonsProductsOptions: [],
      priceLists: this.value.product_price_lists || [],
      profitPercentageValue: 0,
      profitPercentageDisplay: '0',
      isUpdatingFromMargin: false,
      isUpdatingFromPrice: false,
      isUpdatingFromCost: false,
      isDragOver: false,
      tempRecipeIngredients: []
    }
  },
  computed: {
    isRecipeType () {
      return this.product.product_type === 'FINISHED_GOOD' || this.product.product_type === 'SUB_RECIPE'
    },
    isProduct () {
      return this.product.product_type === 'PRODUCT'
    }
  },
  watch: {
    value: {
      handler (newVal) {
        // Preserve existing File objects in images before overwriting
        const existingImages = this.product.images || []
        this.product = JSON.parse(JSON.stringify(newVal))
        // Restore File objects that were lost during serialization
        this.product.images = this.product.images.map((img, i) => {
          const existing = existingImages[i]
          if (existing && existing.image instanceof File) {
            return { ...img, image: existing.image }
          }
          return img
        })
        this.initializeValues()
      },
      deep: true
    },
    'product.profit_percentage': {
      handler (newVal) {
        if (!this.isUpdatingFromMargin && !this.isUpdatingFromPrice) {
          this.initializeProfitPercentage()
        }
      }
    }
  },
  created () {
    this.initializeValues()
  },
  methods: {
    initializeValues () {
      this.category = this.product.category
      this.unitOfMeasure = this.product.unit_of_measure
      this.product.skip_stock = this.product.skip_stock || 0
      this.product.is_bundle = this.product.is_bundle || 0
      this.product.is_addons = this.product.is_addons || 0
      this.product.show_catalog = this.product.show_catalog || 0
      this.priceLists = this.product.product_price_lists?.map(pl => {
        const margin = parseFloat(pl.profit_percentage || 0)
        return {
          ...pl,
          profitPercentageValue: Math.round(margin * 100),
          profitPercentageDisplay: margin.toFixed(2)
        }
      }) || []
      this.initializeProfitPercentage()
    },

    initializeProfitPercentage () {
      const margin = parseFloat(this.product.profit_percentage || 0)
      this.profitPercentageValue = Math.round(margin * 100)
      this.profitPercentageDisplay = margin.toFixed(2)
    },

    onMarginFocus (e) {
      this.initializeProfitPercentage()
      setTimeout(() => {
        if (e && e.target) {
          const val = e.target.value
          e.target.setSelectionRange(val.length, val.length)
        }
      }, 0)
    },

    handleProfitPercentageInput (val) {
      if (this.isUpdatingFromPrice) return
      const digits = val.replace(/\D/g, '')
      this.profitPercentageValue = digits ? parseInt(digits) : 0
      this.formatProfitPercentage()
    },

    formatProfitPercentage () {
      const margin = this.profitPercentageValue / 100
      this.profitPercentageDisplay = margin.toFixed(2)
      this.product.profit_percentage = margin
      this.calculatePriceFromMargin()
    },

    calculatePriceFromMargin () {
      const cost = parseFloat(this.product.cost)
      if (cost > 0) {
        this.isUpdatingFromMargin = true
        this.product.price = parseFloat((cost * (1 + this.product.profit_percentage / 100)).toFixed(2))
        this.$nextTick(() => {
          this.isUpdatingFromMargin = false
        })
      }
    },

    updateCost (newVal) {
      if (this.isUpdatingFromPrice) return
      const cost = parseFloat(newVal)
      if (cost >= 0) {
        this.isUpdatingFromCost = true
        const margin = parseFloat(this.product.profit_percentage || 0)
        this.product.price = parseFloat((cost * (1 + margin / 100)).toFixed(2))

        // Update price lists
        this.priceLists.forEach(pl => {
          const plMargin = parseFloat(pl.profit_percentage || 0)
          pl.price = parseFloat((cost * (1 + plMargin / 100)).toFixed(2))
        })

        this.$nextTick(() => {
          this.isUpdatingFromCost = false
        })
      }
    },

    updatePrice (newVal) {
      if (this.isUpdatingFromMargin || this.isUpdatingFromCost) return
      const price = parseFloat(newVal)
      const cost = parseFloat(this.product.cost)
      if (price > 0 && cost > 0) {
        this.isUpdatingFromPrice = true
        const margin = ((price - cost) / cost) * 100
        this.product.profit_percentage = Number(margin.toFixed(4))
        this.profitPercentageValue = Math.round(this.product.profit_percentage * 100)
        this.profitPercentageDisplay = margin.toFixed(2)
        this.$nextTick(() => {
          this.isUpdatingFromPrice = false
        })
      }
    },

    // Price List Methods
    addPriceList () {
      this.priceLists.push({
        name: '',
        profit_percentage: 0,
        profitPercentageValue: 0,
        profitPercentageDisplay: '0.00',
        price: 0
      })
    },

    removePriceList (index) {
      this.$q.dialog({
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que deseas eliminar esta lista de precios?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.priceLists.splice(index, 1)
      })
    },

    handlePriceListMarginInput (val, priceList) {
      const digits = val.replace(/\D/g, '')
      priceList.profitPercentageValue = digits ? parseInt(digits) : 0
      this.formatPriceListMargin(priceList)
    },

    formatPriceListMargin (priceList) {
      const margin = priceList.profitPercentageValue / 100
      priceList.profitPercentageDisplay = margin.toFixed(2)
      priceList.profit_percentage = margin
      const cost = parseFloat(this.product.cost)
      if (cost > 0) {
        priceList.price = parseFloat((cost * (1 + margin / 100)).toFixed(2))
      }
    },

    initializePriceListMargin (priceList) {
      const margin = parseFloat(priceList.profit_percentage || 0)
      priceList.profitPercentageValue = Math.round(margin * 100)
      priceList.profitPercentageDisplay = margin.toFixed(2)
    },

    calculatePriceListMargin (priceList) {
      const cost = parseFloat(this.product.cost)
      const price = parseFloat(priceList.price)
      if (cost > 0 && price > 0) {
        const margin = ((price - cost) / cost) * 100
        priceList.profit_percentage = parseFloat(margin.toFixed(2))
        priceList.profitPercentageValue = Math.round(margin * 100)
        priceList.profitPercentageDisplay = margin.toFixed(2)
      }
    },

    onSetCategory (data) {
      if (data) {
        this.product.category_id = data.id
        this.product.aliquot_type = data.aliquot_type
      }
    },

    onSetUom (data) {
      if (data) {
        this.product.unit_of_measure_id = data.id
      }
    },

    onRecipeUpdate (ingredients) {
      this.tempRecipeIngredients = ingredients
    },

    onHandleDrop (event) {
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.processImages(files)
    },

    onHandleFileSelect (event) {
      const files = Array.from(event.target.files)
      this.processImages(files)
      event.target.value = ''
    },

    processImages (files) {
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.product.images.push({
              image: file,
              url: e.target.result
            })
          }
          reader.readAsDataURL(file)
        }
      })
    },

    onDeleteImage (image, index) {
      if (image.id) {
        // Has a server-side id: delegate to parent to call the API
        this.$emit('delete-image', image, index)
      } else {
        // Local-only image: remove directly
        this.product.images.splice(index, 1)
      }
    },

    onSave () {
      const payload = {
        ...this.product,
        price_lists: this.priceLists,
        addons: this.addonsProducts,
        recipe_ingredients: this.tempRecipeIngredients
      }
      this.$emit('save', payload)
    }
  }
}
</script>

<style lang="scss" scoped>
.dropzone-card {
  border: 2px dashed #e0e0e0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.dropzone-card:hover,
.dropzone-active {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}

.profit-percentage-input {
  :deep(input) {
    text-align: right !important;
  }
}

.image-preview-card {
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.02);
  }
}
</style>
