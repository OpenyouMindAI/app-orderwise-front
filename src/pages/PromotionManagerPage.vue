<template>
  <q-page class="promotion-manager-page">
    <div class="page-header q-pa-md">
      <div class="row items-center justify-between">
        <div class="col">
          <h4 class="q-ma-none text-weight-bold">Gestión de Promociones</h4>
          <p class="text-grey-6 q-ma-none q-mt-xs">Crear y administrar promociones del sistema</p>
        </div>
        <div class="col-auto">
          <q-btn color="primary" icon="add" label="Nueva Promoción" @click="createNewPromotion" size="md" no-caps />
        </div>
      </div>
    </div>

    <div class="q-pa-md">
      <q-table :rows="promotions" :columns="promotionColumns" :loading="loading" row-key="id" flat bordered>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip :color="getStatusColor(props.value)" text-color="white" size="sm" :label="props.value" />
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round color="primary" icon="edit" size="sm" @click="editPromotion(props.row)" />
            <q-btn flat round color="negative" icon="delete" size="sm" @click="deletePromotion(props.row)" />
          </q-td>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="showPromotionDialog" maximized persistent>
      <q-card class="promotion-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <h5 class="q-ma-none">{{ isEditMode ? 'Editar Promoción' : 'Nueva Promoción' }}</h5>
            </div>
            <div class="col-auto">
              <q-btn flat round icon="close" @click="closePromotionDialog" color="white" />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="currentPromotion.name" label="Nombre *" outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-select v-model="currentPromotion.status" :options="statusOptions" label="Estado *" outlined emit-value map-options />
            </div>
          </div>

          <div class="row q-gutter-md q-mt-md">
            <div class="col-12">
              <q-input v-model="currentPromotion.description" label="Descripción *" type="textarea" rows="3" outlined />
            </div>
          </div>

          <div class="row q-gutter-md q-mt-md">
            <div class="col-12 col-md-4">
              <q-select v-model="currentPromotion.channel" :options="channelOptions" label="Canal *" outlined emit-value map-options />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="currentPromotion.startDate" label="Fecha Inicio *" type="date" outlined />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="currentPromotion.endDate" label="Fecha Fin *" type="date" outlined />
            </div>
          </div>

          <div class="row q-gutter-md q-mt-md">
            <div class="col-12 col-md-6">
              <q-select v-model="currentPromotion.pricingMode" :options="pricingModeOptions" label="Modalidad Precio *" outlined emit-value map-options />
            </div>
            <div class="col-12 col-md-6" v-if="currentPromotion.pricingMode === 'FIXED_WITH_MODIFIERS'">
              <q-input v-model.number="currentPromotion.basePrice" label="Precio Base *" type="number" min="0" outlined prefix="$" />
            </div>
          </div>

          <div class="q-mt-lg">
            <div class="row items-center justify-between q-mb-md">
              <div class="col">
                <h6 class="q-ma-none">Grupos de Selección</h6>
              </div>
              <div class="col-auto">
                <q-btn color="primary" icon="add" label="Agregar Grupo" @click="addSelectionGroup" size="sm" no-caps />
              </div>
            </div>

            <q-expansion-item
              v-for="(group, groupIndex) in currentPromotion.selectionGroups"
              :key="groupIndex"
              :label="group.name || `Grupo ${groupIndex + 1}`"
              icon="category"
              class="q-mb-md"
              header-class="bg-grey-1"
            >
              <q-card>
                <q-card-section>
                  <div class="row items-center justify-between q-mb-md">
                    <div class="col">
                      <h6 class="q-ma-none">Configuración del Grupo</h6>
                    </div>
                    <div class="col-auto">
                      <q-btn flat round color="negative" icon="delete" size="sm" @click="removeSelectionGroup(groupIndex)" />
                    </div>
                  </div>

                  <div class="row q-gutter-md">
                    <div class="col-12 col-md-8">
                      <q-input v-model="group.name" label="Nombre del Grupo *" outlined />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-toggle v-model="group.required" label="Obligatorio" color="primary" />
                    </div>
                  </div>

                  <div class="row q-gutter-md q-mt-md">
                    <div class="col-12">
                      <q-input v-model="group.description" label="Descripción" outlined />
                    </div>
                  </div>

                  <div class="row q-gutter-md q-mt-md">
                    <div class="col-6 col-md-3">
                      <q-input v-model.number="group.minSelection" label="Mín" type="number" min="0" outlined />
                    </div>
                    <div class="col-6 col-md-3">
                      <q-input v-model.number="group.maxSelection" label="Máx" type="number" min="1" outlined />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-btn color="primary" icon="add" label="Agregar Productos" @click="addProductToGroup(groupIndex)" no-caps />
                    </div>
                  </div>

                  <div class="q-mt-md" v-if="group.products.length > 0">
                    <div class="row q-gutter-sm">
                      <div v-for="(product, productIndex) in group.products" :key="productIndex" class="col-auto">
                        <q-chip removable @remove="removeProductFromGroup(groupIndex, productIndex)" color="primary" text-color="white">
                          {{ product.name }} - ${{ product.basePrice }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat @click="closePromotionDialog" label="Cancelar" />
          <q-btn color="primary" @click="savePromotion" label="Guardar" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showProductDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <h6 class="q-ma-none">Seleccionar Productos</h6>
            </div>
            <div class="col-auto">
              <q-btn flat round icon="close" @click="closeProductDialog" color="white" />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="productSearchFilter" label="Buscar productos..." outlined clearable class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-list separator>
            <q-item v-for="product in filteredProducts" :key="product.productId" clickable @click="selectProduct(product)" class="q-py-md">
              <q-item-section avatar>
                <q-avatar size="md" color="grey-3" text-color="grey-7">
                  <q-icon name="inventory" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ product.name }}</q-item-label>
                <q-item-label caption>{{ product.category }} - Stock: {{ product.stock }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>${{ product.price }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="closeProductDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import mockPromotionAPI from '../services/mockPromotionAPI.js'
import { PromotionModel, SelectionGroupModel, ProductOptionModel, PROMOTION_STATUS, PROMOTION_CHANNELS, PRICING_MODES } from '../models/promotionModels.js'

export default {
  name: 'PromotionManagerPage',
  setup () {
    const $q = useQuasar()

    const loading = ref(false)
    const saving = ref(false)
    const promotions = ref([])
    const products = ref([])
    const showPromotionDialog = ref(false)
    const showProductDialog = ref(false)
    const isEditMode = ref(false)
    const currentPromotion = ref(new PromotionModel())
    const currentGroupIndex = ref(0)
    const productSearchFilter = ref('')

    const promotionColumns = [
      { name: 'name', required: true, label: 'Nombre', align: 'left', field: 'name', sortable: true },
      { name: 'status', label: 'Estado', field: 'status', align: 'center' },
      { name: 'channel', label: 'Canal', field: 'channel', align: 'center' },
      { name: 'startDate', label: 'Inicio', field: 'startDate', format: (val) => val ? new Date(val).toLocaleDateString() : '' },
      { name: 'endDate', label: 'Fin', field: 'endDate', format: (val) => val ? new Date(val).toLocaleDateString() : '' },
      { name: 'basePrice', label: 'Precio', field: 'basePrice', format: (val) => val ? `$${val}` : 'N/A' },
      { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
    ]

    const statusOptions = [
      { label: 'Activa', value: PROMOTION_STATUS.ACTIVE },
      { label: 'Inactiva', value: PROMOTION_STATUS.INACTIVE },
      { label: 'Borrador', value: PROMOTION_STATUS.DRAFT }
    ]

    const channelOptions = [
      { label: 'POS', value: PROMOTION_CHANNELS.POS },
      { label: 'Online', value: PROMOTION_CHANNELS.ONLINE },
      { label: 'Ambos', value: PROMOTION_CHANNELS.BOTH }
    ]

    const pricingModeOptions = [
      { label: 'Precio Fijo + Modificadores', value: PRICING_MODES.FIXED_WITH_MODIFIERS },
      { label: 'Suma de Componentes', value: PRICING_MODES.COMPONENT_SUM }
    ]

    const filteredProducts = computed(() => {
      if (!productSearchFilter.value) return products.value
      return products.value.filter(product =>
        product.name.toLowerCase().includes(productSearchFilter.value.toLowerCase())
      )
    })

    const loadPromotions = async () => {
      loading.value = true
      try {
        const response = await mockPromotionAPI.getPromotions()
        if (response.success) {
          promotions.value = response.data
        }
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Error al cargar promociones' })
      } finally {
        loading.value = false
      }
    }

    const loadProducts = async () => {
      try {
        const response = await mockPromotionAPI.getProducts({ active: true })
        if (response.success) {
          products.value = response.data
        }
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }

    const getStatusColor = (status) => {
      const colors = {
        [PROMOTION_STATUS.ACTIVE]: 'positive',
        [PROMOTION_STATUS.INACTIVE]: 'negative',
        [PROMOTION_STATUS.DRAFT]: 'warning'
      }
      return colors[status] || 'grey'
    }

    const createNewPromotion = () => {
      currentPromotion.value = new PromotionModel({
        name: '',
        description: '',
        status: PROMOTION_STATUS.DRAFT,
        channel: PROMOTION_CHANNELS.BOTH,
        pricingMode: PRICING_MODES.FIXED_WITH_MODIFIERS,
        basePrice: 0,
        selectionGroups: []
      })
      isEditMode.value = false
      showPromotionDialog.value = true
    }

    const editPromotion = (promotion) => {
      currentPromotion.value = new PromotionModel(promotion)
      isEditMode.value = true
      showPromotionDialog.value = true
    }

    const deletePromotion = async (promotion) => {
      try {
        await $q.dialog({
          title: 'Confirmar eliminación',
          message: `¿Eliminar "${promotion.name}"?`,
          cancel: true
        })

        const response = await mockPromotionAPI.deletePromotion(promotion.id)
        if (response.success) {
          $q.notify({ type: 'positive', message: 'Promoción eliminada' })
          await loadPromotions()
        }
      } catch (error) {
        if (error !== false) {
          $q.notify({ type: 'negative', message: 'Error al eliminar' })
        }
      }
    }

    const addSelectionGroup = () => {
      currentPromotion.value.selectionGroups.push(new SelectionGroupModel({
        name: `Grupo ${currentPromotion.value.selectionGroups.length + 1}`,
        description: '',
        required: true,
        minSelection: 1,
        maxSelection: 3,
        products: []
      }))
    }

    const removeSelectionGroup = (index) => {
      currentPromotion.value.selectionGroups.splice(index, 1)
    }

    const addProductToGroup = (groupIndex) => {
      currentGroupIndex.value = groupIndex
      showProductDialog.value = true
    }

    const removeProductFromGroup = (groupIndex, productIndex) => {
      currentPromotion.value.selectionGroups[groupIndex].products.splice(productIndex, 1)
    }

    const selectProduct = (product) => {
      const productOption = new ProductOptionModel({
        productId: product.productId,
        name: product.name,
        basePrice: product.price,
        stock: product.stock,
        active: product.active,
        images: product.images,
        category: product.category
      })
      currentPromotion.value.selectionGroups[currentGroupIndex.value].products.push(productOption)
      closeProductDialog()
    }

    const closeProductDialog = () => {
      showProductDialog.value = false
      productSearchFilter.value = ''
    }

    const closePromotionDialog = () => {
      showPromotionDialog.value = false
    }

    const savePromotion = async () => {
      saving.value = true
      try {
        const promotionData = currentPromotion.value.toJSON()

        let response
        if (isEditMode.value) {
          response = await mockPromotionAPI.updatePromotion(currentPromotion.value.id, promotionData)
        } else {
          response = await mockPromotionAPI.createPromotion(promotionData)
        }

        if (response.success) {
          $q.notify({ type: 'positive', message: isEditMode.value ? 'Promoción actualizada' : 'Promoción creada' })
          await loadPromotions()
          closePromotionDialog()
        }
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Error al guardar promoción' })
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadPromotions()
      loadProducts()
    })

    return {
      loading,
      saving,
      promotions,
      products,
      showPromotionDialog,
      showProductDialog,
      isEditMode,
      currentPromotion,
      currentGroupIndex,
      productSearchFilter,
      promotionColumns,
      statusOptions,
      channelOptions,
      pricingModeOptions,
      filteredProducts,
      getStatusColor,
      createNewPromotion,
      editPromotion,
      deletePromotion,
      addSelectionGroup,
      removeSelectionGroup,
      addProductToGroup,
      removeProductFromGroup,
      selectProduct,
      closeProductDialog,
      closePromotionDialog,
      savePromotion
    }
  }
}
</script>

<style scoped>
.promotion-manager-page {
  background: #f5f5f5;
}
.page-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
}
</style>
