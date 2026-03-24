<template>
  <div class="invoice-review-card bg-white rounded-xl shadow-xl overflow-hidden" style="border: 2px solid #edf2f7;">
    <!-- Header: Ultra minimal -->
    <div class="q-pa-md row items-center border-b bg-grey-1">
      <div class="row items-center">
        <div class="ai-badge q-mr-sm">IA</div>
        <span class="text-weight-bold text-grey-9 text-uppercase tracking-wider" style="font-size: 11px;">Análisis de Factura</span>
      </div>
    </div>

    <div class="q-pa-md q-gutter-y-lg">
      <!-- Section: General -->
      <div class="q-gutter-y-md">
        <!-- Provider -->
        <div class="q-gutter-y-xs">
          <div class="row items-center justify-between">
            <label class="minimal-label">Proveedor</label>
            <transition name="fade">
              <div v-if="localData.selectedProvider" class="text-positive text-weight-bold" style="font-size: 10px;">• VINCULADO</div>
            </transition>
          </div>
          <q-select
            outlined
            dense
            v-model="localData.selectedProvider"
            :options="providers"
            option-label="name"
            option-value="id"
            use-input
            @filter="filterProviders"
            placeholder="Buscar proveedor..."
            class="minimal-input"
            color="primary"
            :disable="saveSuccess"
          >
            <template v-slot:prepend><q-icon name="storefront" size="16px" color="grey-6" /></template>
          </q-select>
          <div v-if="!localData.selectedProvider" class="q-mt-xs">
            <q-input
              outlined
              dense
              v-model="localData.provider_name"
              placeholder="Nombre del Proveedor (Nuevo)"
              class="minimal-input"
              color="amber-9"
              :disable="saveSuccess"
            >
              <template v-slot:prepend>
                <q-icon name="psychology" size="16px" color="amber-9" />
              </template>
            </q-input>
            <div class="ai-suggestion q-px-sm" style="font-size: 10px;">
              IA detectó: <span class="text-weight-bold">"{{ localData.provider }}"</span>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="row q-col-gutter-md">
          <div class="col-6 q-gutter-y-xs">
            <label class="minimal-label">Nº Factura</label>
            <q-input outlined dense v-model="localData.invoice_number" class="minimal-input" placeholder="Ej. 1234" color="primary" :disable="saveSuccess">
              <template v-slot:prepend><q-icon name="numbers" size="16px" color="grey-6" /></template>
            </q-input>
          </div>
          <div class="col-6 q-gutter-y-xs">
            <label class="minimal-label">Fecha</label>
            <q-input outlined dense v-model="localData.date" class="minimal-input" placeholder="YYYY-MM-DD" color="primary" :disable="saveSuccess">
              <template v-slot:append>
                <q-icon name="event" size="16px" class="cursor-pointer" color="grey-6">
                  <q-popup-proxy cover><q-date v-model="localData.date" mask="YYYY-MM-DD" minimal /></q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- Total: Minimal but clear -->
      <div class="row items-center justify-between q-pa-sm rounded-lg bg-grey-1">
        <span class="text-grey-7 text-weight-medium" style="font-size: 11px;">MONTO TOTAL</span>
        <span class="text-subtitle1 text-weight-bolder text-grey-9">
          {{ localData.currency || '$' }} {{ formatNumber(localData.total || localData.total_amount || 0) }}
        </span>
      </div>

      <!-- Section: Items -->
      <div class="q-gutter-y-md">
        <label class="minimal-label text-primary">ARTÍCULOS ({{ localData.items?.length || 0 }})</label>

        <div class="q-gutter-y-md">
          <div
            v-for="(item, index) in localData.items"
            :key="index"
            class="item-row"
          >
            <div class="q-gutter-y-xs">
              <!-- Item Header -->
              <div class="row items-center justify-between">
                <div class="row items-center">
                  <div :class="['status-dot', item.is_new ? 'bg-positive' : 'bg-primary']"></div>
                  <span class="text-caption text-grey-6 text-uppercase q-ml-xs" style="font-size: 9px; letter-spacing: 0.5px;">{{ item.is_new ? 'Nuevo' : 'Catálogo' }}</span>
                </div>
                <q-btn v-if="!saveSuccess" flat round dense icon="close" size="sm" color="negative" @click="removeItem(index)" />
              </div>

              <!-- Product Select -->
              <div class="q-gutter-y-xs">
                <q-select
                  outlined
                  dense
                  v-model="item.selectedProduct"
                  :options="item.productOptions || []"
                  option-label="name"
                  option-value="id"
                  use-input
                  @filter="(val, update) => filterProducts(val, update, item)"
                  @update:model-value="val => onProductSelect(val, item)"
                  placeholder="Vincular producto..."
                  class="minimal-input"
                  color="primary"
                  :disable="saveSuccess"
                >
                  <template v-slot:prepend><q-icon name="inventory_2" size="16px" color="grey-6" /></template>
                </q-select>

                <q-select
                  outlined
                  dense
                  v-model="item.category"
                  :options="categories"
                  option-label="name"
                  option-value="id"
                  use-input
                  @filter="filterCategories"
                  placeholder="Categoría"
                  class="minimal-input"
                  color="primary"
                  :disable="saveSuccess"
                >
                  <template v-slot:prepend><q-icon name="category" size="16px" color="grey-6" /></template>
                </q-select>
                <q-select
                  outlined
                  dense
                  v-model="item.uom"
                  :options="unitOfMeasures"
                  option-label="name"
                  option-value="id"
                  use-input
                  @filter="filterUoms"
                  placeholder="Unidad"
                  class="minimal-input"
                  color="primary"
                  :disable="saveSuccess"
                >
                  <template v-slot:prepend><q-icon name="straighten" size="16px" color="grey-6" /></template>
                </q-select>

                <q-input
                  outlined
                  dense
                  v-model="item.barcode"
                  placeholder="Código de Barras"
                  class="minimal-input"
                  color="primary"
                  :disable="saveSuccess"
                >
                  <template v-slot:prepend><q-icon name="qr_code" size="16px" color="grey-6" /></template>
                </q-input>

                <!-- Detection text -->
                <div v-if="!item.selectedProduct" class="ai-suggestion q-px-sm">
                  IA detectó: <span class="text-weight-bold">"{{ item.description }}"</span>
                </div>
              </div>

              <!-- Values: Vertical list -->
              <div class="column q-mt-sm" style="gap: 0.5rem;">
                <!-- 1. Cantidad -->
                <div class="value-chip border bg-grey-1">
                  <q-icon name="tag" size="16px" color="grey-6" class="q-mr-xs" />
                  <span class="text-grey-5 q-mr-sm">Cantidad</span>
                  <input
                    type="text"
                    v-model="item.quantity"
                    class="inline-edit"
                    @input="e => item.quantity = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')"
                    :disabled="saveSuccess"
                  >
                </div>

                <!-- 2. Precio -->
                <div class="value-chip border bg-grey-1">
                  <q-icon name="payments" size="16px" color="grey-6" class="q-mr-xs" />
                  <span class="text-grey-5 q-mr-sm">Precio Unit.</span>
                  <input
                    type="text"
                    v-model="item.unit_price"
                    class="inline-edit"
                    @input="e => item.unit_price = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')"
                    :disabled="saveSuccess"
                  >
                </div>

                <!-- 3. Subtotal -->
                <div class="value-chip border bg-grey-1">
                  <q-icon name="calculate" size="16px" color="grey-6" class="q-mr-xs" />
                  <span class="text-grey-7 text-weight-bold q-mr-sm">Subtotal</span>
                  <div class="inline-edit">
                    {{ formatNumber((item.quantity || 0) * (item.unit_price || 0)) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions: Stacked vertically -->
    <div class="column border-t bg-grey-1" style="gap: 0.5rem; padding: 0.5rem;">
      <q-btn
        unelevated
        :color="saveSuccess ? 'positive' : 'primary'"
        :label="saveSuccess ? 'Factura Integrada' : 'Integrar Factura'"
        :icon="saveSuccess ? 'check_circle' : 'bolt'"
        :loading="loading"
        :disable="saveSuccess"
        class="full-width rounded-lg text-weight-bold"
        no-caps
        @click="submit"
      />
      <q-btn v-if="!saveSuccess" flat color="grey-6" label="Descartar" class="full-width rounded-lg" no-caps @click="$emit('discard')" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'
import { Notify } from 'quasar'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['confirm', 'discard'])
const authStore = authentication()

const localData = reactive(JSON.parse(JSON.stringify(props.data)))
const loading = ref(false)
const saveSuccess = ref(false)

// Sync IA data key 'provider' with validation key 'provider_name'
if (!localData.provider_name && localData.provider) {
  localData.provider_name = localData.provider
}

if (localData.items) {
  localData.items = localData.items.map(item => ({
    ...item,
    unit_price: item.unit_price || item.total || 0,
    selectedProduct: item.selectedProduct || null,
    productOptions: item.productOptions || [],
    category: item.category || null,
    uom: item.uom || null,
    barcode: item.barcode ? String(item.barcode) : ''
  }))
}

const providers = ref([])
const categories = ref([])
const unitOfMeasures = ref([])

const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

const filterProviders = (val, update) => {
  api.get('providers', {
    params: {
      sortBy: 'id',
      sortOrder: 'desc',
      paginate: true,
      page: 1,
      perPage: 50,
      dataSearch: { name: val, document_number: val }
    }
  }).then(({ data }) => {
    update(() => {
      providers.value = data.data || []
    })
  }).catch(() => {
    update(() => { providers.value = [] })
  })
}

const filterCategories = (val, update) => {
  api.get('categories', {
    params: { dataSearch: { name: val } }
  }).then(({ data }) => {
    update(() => { categories.value = data || [] })
  }).catch(() => {
    update(() => { categories.value = [] })
  })
}

const filterUoms = (val, update) => {
  api.get('unit-of-measures', {
    params: { dataSearch: { name: val } }
  }).then(({ data }) => {
    update(() => { unitOfMeasures.value = data || [] })
  }).catch(() => {
    update(() => { unitOfMeasures.value = [] })
  })
}

const filterProducts = (val, update, item) => {
  const searchTerm = val || item.description || ''
  api.get('products', {
    params: {
      dataSearch: searchTerm ? { name: searchTerm, barcode: searchTerm } : {},
      perPage: 20,
      paginate: true,
      page: 1,
      branch_office_id: authStore.branchOffice?.id
    }
  }).then(({ data }) => {
    update(() => {
      item.productOptions = data.data || []
    })
  }).catch(() => {
    update(() => { item.productOptions = [] })
  })
}

const onProductSelect = (product, item) => {
  if (product) {
    item.is_new = false
    item.unit_price = product.cost || item.unit_price
  } else {
    item.is_new = true
  }
}

const removeItem = (index) => {
  localData.items.splice(index, 1)
}

const submit = async () => {
  if (loading.value || saveSuccess.value) return

  // 1. Validation
  if (!localData.selectedProvider && !localData.provider_name) {
    Notify.create({ message: 'No se detectó proveedor. Por favor selecciona uno.', color: 'negative', position: 'bottom' })
    return
  }

  for (const item of localData.items) {
    if (!item.selectedProduct) {
      if (!item.category) {
        Notify.create({ message: `Asigna una categoría a: ${item.description}`, color: 'negative', position: 'bottom' })
        return
      }
      if (!item.uom) {
        Notify.create({ message: `Asigna una unidad a: ${item.description}`, color: 'negative', position: 'bottom' })
        return
      }
    }
  }

  loading.value = true
  try {
    // 2. Prepare Provider (Sync with NewPurchasePage.vue logic)
    let providerId = localData.selectedProvider?.id
    if (!providerId && localData.provider_name) {
      const { data: newProv } = await api.post('providers', {
        name: localData.provider_name,
        document_number: 'GEN-' + Date.now().toString().slice(-8),
        address: 'Dirección de la factura',
        phone: null,
        email: null
      })
      providerId = newProv.id
      Notify.create({ message: `Proveedor creado: ${newProv.name}`, color: 'positive', icon: 'storefront' })
    }

    // 3. Prepare Items (Create new products if needed, sync with NewPurchasePage.vue)
    const finalizedItems = []
    for (const item of localData.items) {
      let productData = null
      if (!item.selectedProduct) {
        // Sync with NewPurchasePage.vue payload
        const newProductPayload = {
          name: item.description,
          barcode: (item.barcode && String(item.barcode).trim()) ? String(item.barcode) : 'AI-' + Date.now().toString().slice(-8),
          category_id: item.category.id,
          unit_of_measure_id: item.uom.id,
          cost: parseFloat(item.unit_price),
          price: parseFloat(item.unit_price) * 1.5, // Default margin 50%
          profit_percentage: 50,
          stock: 0,
          minimum_stock: 0,
          show_catalog: 1,
          skip_stock: 0,
          images: [],
          branch_office_ids: [authStore.branchOffice?.id || authStore.userSession?.branch_office_id],
          product_type: 'PRODUCT',
          base_quantity: 1
        }
        const { data: createdProduct } = await api.post('products', newProductPayload)
        productData = createdProduct
        Notify.create({ message: `Producto creado: ${createdProduct.name}`, color: 'positive', icon: 'inventory_2' })
      } else {
        productData = item.selectedProduct
      }

      finalizedItems.push({
        product_id: productData.id,
        quantity: parseFloat(item.quantity),
        cost: parseFloat(item.unit_price),
        taxe: 0,
        subtotal: parseFloat(item.quantity) * parseFloat(item.unit_price),
        supplier_product_name: item.description // IA detected name as alias
      })
    }

    // 4. Build Purchase Payload (Sync with NewPurchasePage.vue)
    const companyConfig = authStore.userSession?.company_session?.company_config || {}
    const total = localData.items.reduce((acc, i) => acc + (parseFloat(i.quantity) * parseFloat(i.unit_price)), 0)

    const payload = {
      purchase_code: localData.invoice_number || 'IA-' + Date.now().toString().slice(-6),
      provider_id: providerId,
      coin_id: companyConfig.coin?.id || 1,
      type_of_service_id: companyConfig.type_of_service?.id || 1,
      invoice_type_id: companyConfig.invoice_type?.id || 1,
      user_created_id: authStore.userSession?.id,
      branch_office_id: authStore.branchOffice?.id || authStore.userSession?.branch_office_id,
      products: finalizedItems,
      taxes: [],
      discounts: [],
      exchange_rate: 1,
      purchase_number: 1,
      total,
      total_taxes: 0,
      total_discounts: 0,
      status: 'delivered',
      delivery_date: new Date().toISOString().split('T')[0] + 'T00:00',
      description: `Integrado vía AI Chat. Factura: ${localData.invoice_number || 'N/A'}`
    }

    await api.post('purchases', payload)

    saveSuccess.value = true
    emit('confirm', { ...localData, handledInChat: true })
  } catch (err) {
    console.error('Error integrating invoice:', err)
    Notify.create({
      message: 'Error: ' + (err.response?.data?.message || err.message),
      color: 'negative',
      position: 'bottom'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  filterProviders('', (cb) => cb())
})
</script>

<style scoped>
.invoice-review-card {
  width: 100%;
  max-width: 400px;
}

.ai-badge {
  background: #7c3aed15;
  color: #7c3aed;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 4px;
}

.minimal-label {
  font-size: 9px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Fix for outlined inputs being too heavy */
:deep(.minimal-input .q-field__control) {
  border-radius: 8px;
  border-color: #f1f5f9 !important;
  background: #f8fafc;
  height: 36px;
  min-height: 36px;
}

:deep(.minimal-input .q-field__control:hover:before) {
  border-color: #e2e8f0 !important;
}

:deep(.minimal-input .q-field__native),
:deep(.minimal-input .q-field__prefix),
:deep(.minimal-input .q-field__suffix),
:deep(.minimal-input .q-field__input) {
  font-size: 12px;
  color: #1e293b;
  font-weight: 600;
}

:deep(.minimal-input .q-field__marginal) {
  height: 36px;
}

.ai-suggestion {
  font-size: 11px;
  color: #b45309;
  padding: 2px 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.value-chip {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 10px;
  height: 32px;
}

.value-chip .q-mr-xs {
  margin-right: 8px !important;
}

.value-chip.border {
  border: 1px solid #f1f5f9;
}

.bg-grey-1 {
  background: #f8fafc;
}

.inline-edit {
  background: transparent;
  border: none;
  width: 100%;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  font-size: 12px;
  text-align: right;
}

.border-b { border-bottom: 1px solid #f1f5f9; }
.border-t { border-top: 1px solid #f1f5f9; }

.tracking-wider { letter-spacing: 0.1em; }
.rounded-xl { border-radius: 16px; }
.rounded-lg { border-radius: 12px; }

.item-row:last-child { border-bottom: none; }
</style>
