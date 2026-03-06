<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="modern-business-type-dialog">
      <!-- Header moderno -->
      <q-card-section class="business-type-header">
        <div class="header-content">
          <div class="setup-icon-wrapper">
            <q-icon name="storefront" size="28px" class="setup-icon" />
          </div>
          <div class="text-h6 text-weight-bold q-mt-xs">Selecciona tu Rubro</div>
          <div class="text-caption text-grey-7">Personaliza tu experiencia</div>
        </div>
      </q-card-section>

      <q-card-section class="setup-body-section">
        <q-form @submit="handleSubmit">

          <!-- Buscador -->
          <div class="input-container">
            <q-input
              v-model="searchQuery"
              placeholder="Buscar rubro..."
              class="custom-input"
              borderless
              @update:model-value="handleSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" size="20px"/>
              </template>
              <template v-slot:append v-if="searchQuery">
                <q-icon
                  name="close"
                  class="cursor-pointer"
                  size="18px"
                  @click="searchQuery = ''"
                />
              </template>
            </q-input>
          </div>

          <!-- Carrusel de Rubros -->
          <div class="carousel-container min-height-200">
            <div v-if="loadingTypes" class="flex flex-center q-py-xl">
              <q-spinner-dots color="primary" size="48px" />
            </div>

            <div v-else-if="filteredBusinessTypes.length === 0" class="text-center q-py-xl text-grey-6">
              <q-icon name="search_off" size="48px" class="q-mb-md"/>
              <div>No se encontraron rubros</div>
            </div>

            <swiper
              v-else
              :modules="modules"
              :slides-per-view="1"
              :space-between="16"
              :navigation="true"
              :loop="filteredBusinessTypes.length > 3"
              :breakpoints="{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 16,
                },
                900: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                }
              }"
              class="business-swiper"
            >
              <swiper-slide
                v-for="type in filteredBusinessTypes"
                :key="type.id"
              >
                <div
                  class="business-card"
                  :class="{ 'selected': businessType?.id === type.id }"
                  @click="selectBusinessType(type)"
                >
                  <div class="card-icon-wrapper">
                    <q-icon :name="getBusinessIcon(type.name)" size="32px" />
                  </div>
                  <div class="card-title ">{{ type.name }}</div>
                  <div class="card-check">
                    <q-icon
                      name="check_circle"
                      size="24px"
                      :color="businessType?.id === type.id ? 'primary' : 'grey-4'"
                    />
                  </div>
                </div>
              </swiper-slide>
            </swiper>
          </div>

          <!-- Rubro seleccionado -->
          <transition name="fade">
            <div v-if="businessType" class="selected-badge">
              <q-chip
                color="primary"
                text-color="white"
                icon="check"
                removable
                @remove="businessType = null"
              >
                {{ businessType.name }}
              </q-chip>
            </div>
          </transition>

          <!-- Checkbox de copiar productos -->
          <div class="input-container q-mt-md">
            <q-checkbox
              v-model="copyTestProducts"
              label="Copiar productos y categorías de ejemplo"
              color="primary"
              class="text-grey-8"
            >
              <q-tooltip class="bg-grey-8">
                Te ayudará a empezar más rápido con datos de prueba del mismo rubro
              </q-tooltip>
            </q-checkbox>
          </div>

          <!-- Botones -->
          <div class="row q-mt-lg q-col-gutter-sm reverse-order-mobile">
            <div class="col-12 col-sm-6 btn-order-2">
              <q-btn
                label="Atrás"
                color="grey-7"
                flat
                icon="arrow_back"
                class="full-width action-btn back-btn"
                @click="$emit('back')"
                :disable="loading"
                no-caps
              />
            </div>
            <div class="col-12 col-sm-6 btn-order-1">
              <q-btn
                label="Crear Empresa"
                color="primary"
                icon-right="rocket_launch"
                type="submit"
                :loading="loading"
                :disable="!businessType"
                unelevated
                no-caps
                class="full-width action-btn create-btn"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'submit', 'back'])

// Swiper modules
const modules = [Navigation, Pagination]

// State
const businessTypes = ref([])
const businessType = ref(null)
const copyTestProducts = ref(false)
const searchQuery = ref('')
const loadingTypes = ref(false)

// Computed
const filteredBusinessTypes = computed(() => {
  if (!searchQuery.value) return businessTypes.value

  const query = searchQuery.value.toLowerCase()
  return businessTypes.value.filter(type =>
    type.name.toLowerCase().includes(query)
  )
})

/**
 * Load business types from API
 */
const loadBusinessTypes = async (search = '') => {
  try {
    loadingTypes.value = true
    const { data } = await api.get('business-types', {
      params: search ? { dataSearch: { name: search } } : {}
    })
    businessTypes.value = data
  } catch (error) {
    console.error('Error loading business types:', error)
  } finally {
    loadingTypes.value = false
  }
}

/**
 * Handle search with debounce
 */
let searchTimeout
const handleSearch = (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadBusinessTypes(val)
  }, 300)
}

/**
 * Select business type
 */
const selectBusinessType = (type) => {
  businessType.value = type
}

/**
 * Get icon for business type
 */
const getBusinessIcon = (name) => {
  const iconMap = {
    Restaurante: 'restaurant',
    Cafetería: 'local_cafe',
    Tienda: 'store',
    Supermercado: 'shopping_cart',
    Farmacia: 'local_pharmacy',
    Veterinaria: 'pets',
    Librería: 'menu_book',
    Ferretería: 'handyman',
    Ropa: 'checkroom',
    Electrónica: 'devices',
    Belleza: 'face',
    Gimnasio: 'fitness_center',
    Panadería: 'bakery_dining',
    Peluquería: 'content_cut',
    Bar: 'local_bar',
    Hotel: 'hotel',
    Lavandería: 'local_laundry_service',
    Floristería: 'local_florist',
    Juguetería: 'toys',
    Muebles: 'chair'
  }

  // Buscar coincidencia parcial
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return icon
    }
  }

  return 'store' // Icono por defecto
}

/**
 * Handle form submit
 */
const handleSubmit = () => {
  if (!businessType.value) return

  emit('submit', {
    business_type_id: businessType.value.id,
    business_type_name: businessType.value.name,
    copy_test_products: copyTestProducts.value
  })
}

/**
 * Reinicia el estado interno
 */
const resetState = () => {
  businessType.value = null
  copyTestProducts.value = false
  searchQuery.value = ''
}

watch(() => props.modelValue, (val) => {
  if (val && businessTypes.value.length === 0) {
    loadBusinessTypes()
  }
  if (!val) {
    resetState()
  }
})

onMounted(() => {
  if (props.modelValue) {
    loadBusinessTypes()
  }
})
</script>

<style scoped>
.modern-business-type-dialog {
  border-radius: 20px;
  animation: dialogEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dialogEnter {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.business-type-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 24px 8px;
  text-align: center;
}

.body--dark .business-type-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.setup-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
  margin-bottom: 8px;
}

.setup-icon {
  color: white;
}

.setup-body-section {
  padding: 20px 24px 24px !important;
}

.input-container {
  margin-bottom: 1rem;
}

/* Estilos para el input de búsqueda */
.custom-input :deep(.q-field__control),
.custom-input :deep(.q-field__native) {
  min-height: 44px !important;
  height: 44px !important;
  max-height: 44px !important;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 12px;
  display: flex !important;
  align-items: center !important;
}

.body--dark .custom-input :deep(.q-field__control) {
  background: #1f2937;
  border-color: #374151;
}

.custom-input :deep(.q-field__control):hover {
  background: #ffffff;
  border-color: #6366f1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.body--dark .custom-input :deep(.q-field__control):hover {
  background: #1f2937;
}

.custom-input :deep(.q-field__control):focus-within {
  background: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  transform: translateY(-1px);
}

.body--dark .custom-input :deep(.q-field__control):focus-within {
  background: #1f2937;
}

/* Carousel Container */
.min-height-200 {
  min-height: 200px;
}

/* Swiper Styles */
.business-swiper {
  padding: 0.5rem 0 1rem;
}

.business-swiper :deep(.swiper-button-next),
.business-swiper :deep(.swiper-button-prev) {
  color: #6366f1;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.business-swiper :deep(.swiper-button-next):after,
.business-swiper :deep(.swiper-button-prev):after {
  font-size: 16px;
  font-weight: bold;
}

.business-swiper :deep(.swiper-pagination-bullet) {
  background: #6366f1;
  opacity: 0.3;
}

.business-swiper :deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: #6366f1;
}

/* Business Card */
.business-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.body--dark .business-card {
  background: #1f2937;
  border-color: #374151;
}

.business-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.25rem 1rem rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
}

.business-card.selected {
  border-color: #6366f1;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  box-shadow: 0 0 0.5rem rgba(99, 102, 241, 0.3);
}

.body--dark .business-card.selected {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
}

.card-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.business-card.selected .card-icon-wrapper {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.business-card.selected .card-icon-wrapper .q-icon {
  color: white !important;
}

.card-icon-wrapper .q-icon {
  color: #6366f1;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.3;
}

.body--dark .card-title {
  color: #e5e7eb;
}

.card-check {
  position: absolute;
  top: 12px;
  right: 12px;
}

/* Selected Badge */
.selected-badge {
  text-align: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Action Buttons */
.action-btn {
  height: 44px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 10px;
}

.create-btn {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.back-btn {
  border: 1px solid #e5e7eb;
}

.body--dark .back-btn {
  border-color: #374151;
  color: #e5e7eb !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {

  .btn-order-1 {
    order: 1;
  }

  .btn-order-2 {
    order: 2;
  }

  .business-card {
    height: 160px;
    padding: 16px 12px;
  }

  .card-icon-wrapper {
    width: 56px;
    height: 56px;
  }

  .card-icon-wrapper .q-icon {
    font-size: 28px !important;
  }
}
</style>
