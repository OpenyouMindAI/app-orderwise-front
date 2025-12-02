<template>
  <div class="places-input-container">
    <q-input
      ref="inputRef"
      :model-value="displayAddress"
      @update:model-value="handleAddressInput"
      label="Buscar dirección de entrega"
      filled
      clearable
      :loading="loading"
      class="places-input"
      input-class="places-input-field"
      label-color="grey-6"
      color="primary"
      @clear="resetAddress"
    >
      <template #prepend>
        <q-icon name="place" color="grey-6" size="20px" />
      </template>

      <template #append>
        <!-- Botón de mapa dentro del input -->
        <q-btn
          v-if="addressDetails.latitude && addressDetails.formattedAddress"
          flat
          round
          dense
          icon="map"
          color="primary"
          size="sm"
          :loading="geocodingAddress"
          @click.stop="showMapModal"
        >
          <q-tooltip>Ver en mapa</q-tooltip>
        </q-btn>

        <!-- Indicador de dirección guardada -->
        <q-icon
          v-else-if="addressDetails.formattedAddress"
          name="check_circle"
          color="positive"
          size="20px"
        >
          <q-tooltip>Dirección guardada</q-tooltip>
        </q-icon>
      </template>
    </q-input>
    <!-- Modal del mapa optimizado -->
    <q-dialog
      v-model="mapModal"
      class="map-dialog"
      @hide="cleanupMap"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="map-card">
        <!-- Header del modal -->
        <q-card-section class="map-header">
          <div class="header-content">
            <div class="location-info">
              <q-icon name="location_on" color="primary" size="20px" />
              <div class="location-details">
                <div class="location-name">
                  {{ addressDetails.name || 'Ubicación' }}
                </div>
                <div class="location-address">
                  {{ addressDetails.formattedAddress }}
                </div>
              </div>
            </div>
            <q-btn
              v-close-popup
              icon="close"
              flat
              round
              dense
              color="grey-6"
              size="sm"
              class="close-btn"
            />
          </div>
        </q-card-section>

        <!-- Contenido del mapa -->
        <q-card-section class="map-content">
          <div id="map-container" class="map-container"></div>
        </q-card-section>

        <!-- Acciones del modal -->
        <q-card-actions class="map-actions">
          <q-btn
            flat
            label="Cerrar"
            color="grey-7"
            @click="mapModal = false"
            class="secondary-btn"
          />
          <q-space />
          <q-btn
            label="Cómo llegar"
            icon="directions"
            color="primary"
            unelevated
            :disable="!addressDetails.latitude"
            :loading="geocodingAddress"
            class="primary-btn"
            @click="openDirections"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { loadGoogleMaps } from 'src/boot/google-maps'

const emit = defineEmits(['address-selected'])

const inputRef = ref(null)
const address = ref('')
const displayAddress = ref('')
const autocomplete = ref(null)
const loading = ref(false)
const mapModal = ref(false)
const map = ref(null)
const marker = ref(null)
const geocodingAddress = ref(false)

const props = defineProps({
  initialAddress: {
    type: [Object, String],
    default: () => ({
      name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: null,
      longitude: null,
      formattedAddress: '',
      placeId: '',
      types: []
    })
  }
})

const addressDetails = ref({
  name: '',
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  latitude: null,
  longitude: null,
  formattedAddress: '',
  placeId: '',
  types: []
})

// Carga inicial
onMounted(async () => {
  // Cargar dirección inicial si existe
  loadInitialAddress()

  // Dar tiempo para que el componente se monte completamente
  await nextTick()
  await initializeComponent()
})

// Función para cargar dirección inicial de forma segura
const loadInitialAddress = () => {
  try {
    if (!props.initialAddress) {
      address.value = ''
      return
    }

    let initial = props.initialAddress

    console.log('🔍 loadInitialAddress - Tipo:', typeof initial)
    console.log('🔍 loadInitialAddress - Valor:', initial)
    console.log('🔍 formattedAddress:', initial.formattedAddress)
    console.log('🔍 name:', initial.name)
    console.log('🔍 street:', initial.street)

    // Si viene como string JSON, parsearlo
    if (typeof initial === 'string') {
      try {
        initial = JSON.parse(initial)
        console.log('✅ Parseado como JSON:', initial)
      } catch (e) {
        // Si no es JSON válido, usar como dirección simple
        console.log('📝 Usando string directo:', initial)
        address.value = String(initial)
        return
      }
    }

    // Verificar que sea un objeto válido
    if (typeof initial !== 'object' || initial === null) {
      console.log('⚠️ No es un objeto válido')
      address.value = ''
      return
    }

    // Cargar dirección en el input (priorizar formattedAddress)
    let addressText = ''

    if (initial.formattedAddress && initial.formattedAddress !== '') {
      addressText = String(initial.formattedAddress)
    } else if (initial.name && initial.name !== '') {
      addressText = String(initial.name)
    } else if (initial.street && initial.street !== '') {
      addressText = String(initial.street)
    }

    console.log('📍 Dirección a mostrar:', addressText)
    console.log('📍 Tipo de addressText:', typeof addressText)

    // Solo actualizar si hay un texto válido
    if (addressText && addressText !== '') {
      address.value = addressText
      displayAddress.value = addressText
    } else {
      console.log('⚠️ No hay dirección válida para mostrar')
      address.value = ''
      displayAddress.value = ''
    }

    // Cargar detalles completos si existen
    if (initial.formattedAddress || initial.latitude || initial.name) {
      addressDetails.value = {
        name: initial.name || '',
        street: initial.street || '',
        city: initial.city || '',
        state: initial.state || '',
        country: initial.country || '',
        zipCode: initial.zipCode || '',
        latitude: initial.latitude || null,
        longitude: initial.longitude || null,
        formattedAddress: initial.formattedAddress || '',
        placeId: initial.placeId || '',
        types: initial.types || []
      }
    }
  } catch (error) {
    console.error('❌ Error loading initial address:', error)
    address.value = ''
  }
}

// Watch para cambios en initialAddress
watch(() => props.initialAddress, (newAddress) => {
  if (newAddress) {
    loadInitialAddress()
  }
}, { deep: true, immediate: true })

// Watch para asegurar que address siempre sea string
watch(address, (newVal) => {
  if (typeof newVal === 'string') {
    displayAddress.value = newVal
  } else if (typeof newVal === 'object' && newVal !== null) {
    // Si es un objeto, extraer el string
    if (newVal.formattedAddress) {
      displayAddress.value = String(newVal.formattedAddress)
    } else if (newVal.name) {
      displayAddress.value = String(newVal.name)
    } else {
      displayAddress.value = ''
    }
  } else {
    displayAddress.value = ''
  }
})

// Manejar cambios en el input
const handleAddressInput = (value) => {
  address.value = value
  displayAddress.value = value
}

// Limpieza al desmontar
onUnmounted(() => {
  cleanup()
})

const initializeComponent = async () => {
  loading.value = true
  try {
    const loaded = await loadGoogleMaps()
    if (!loaded) {
      // Google Maps no disponible, usar modo manual
      return
    }

    // Estrategia alternativa: buscar el input directamente en el DOM del componente
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))

    // Estrategia alternativa: buscar el input directamente en el DOM del componente
    // sin depender del template ref que no se está bindeando correctamente
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))

    await initAutocomplete()
  } catch (error) {
    console.error('Error inicializando AddressComponent:', error)
    // No reintentar en caso de error, mantener el componente funcional sin autocomplete
  } finally {
    loading.value = false
  }
}

const initAutocomplete = async () => {
  try {
    // Evitar múltiples inicializaciones
    if (autocomplete.value) {
      console.info('Autocomplete ya inicializado, evitando duplicación')
      return
    }

    // Estrategia alternativa: buscar directamente en el DOM sin usar refs
    // Buscar el input dentro del componente actual usando selectores específicos
    let inputElement = null

    // Intentar diferentes estrategias de búsqueda con reintentos
    const searchStrategies = [
      () => document.querySelector('.places-input-container input'),
      () => document.querySelector('.places-input input'),
      () => document.querySelector('.q-field input'),
      () => {
        const container = document.querySelector('.places-input-container')
        return container?.querySelector('input')
      },
      () => {
        // Buscar cualquier input dentro de un q-field que tenga la clase places-input
        return document.querySelector('.q-field.places-input input')
      }
    ]

    // Intentar múltiples veces con pequeñas esperas
    for (let attempt = 0; attempt < 3 && !inputElement; attempt++) {
      for (const strategy of searchStrategies) {
        inputElement = strategy()
        if (inputElement) {
          break
        }
      }

      if (!inputElement && attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    if (!inputElement) {
      // Debug: mostrar toda la estructura disponible
      const container = document.querySelector('.places-input-container')
      console.error('Debug - No se encontró input element:', {
        container,
        containerHTML: container?.outerHTML,
        allInputs: document.querySelectorAll('input'),
        qFieldInputs: document.querySelectorAll('.q-field input')
      })

      throw new Error('Input element no encontrado en el DOM del componente')
    }

    if (!window.google?.maps?.places?.Autocomplete) {
      throw new Error('Google Maps Places API no disponible')
    }

    // NOTA IMPORTANTE: Google Maps API Warning Conocido
    // Google muestra un warning sobre la deprecación de Autocomplete (marzo 2025)
    // Usando google.maps.places.Autocomplete (estable hasta marzo 2025+)
    // La migración a PlaceAutocompleteElement se realizará en versiones futuras

    autocomplete.value = new window.google.maps.places.Autocomplete(inputElement, {
      types: ['geocode', 'establishment'],
      componentRestrictions: { country: 'ar' },
      fields: ['address_components', 'geometry', 'formatted_address', 'name', 'place_id', 'types']
    })

    autocomplete.value.addListener('place_changed', () => {
      onPlaceChanged().catch(() => {})
    })
  } catch (error) {
    // Silencioso: usar modo manual
  }
}

const handlePlaceSelection = async (place) => {
  try {
    if (!place?.geometry) {
      // Lugar sin geometría, usar modo manual
      return
    }

    address.value = place.formattedAddress || place.name || ''
    addressDetails.value = {
      name: place.name || '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      formattedAddress: place.formatted_address || '',
      placeId: place.place_id || '',
      types: place.types || []
    }

    if (place.address_components) {
      parseAddressComponents(place.address_components)
    }

    emit('address-selected', addressDetails.value)
  } catch (error) {
    // Error silencioso al procesar lugar
  }
}

const onPlaceChanged = async () => {
  try {
    if (!autocomplete.value) return

    const place = autocomplete.value.getPlace()
    await handlePlaceSelection(place)
  } catch (error) {
    console.error('Error procesando lugar:', error)
  }
}

const parseAddressComponents = (components) => {
  components.forEach((component) => {
    const type = component.types[0]
    switch (type) {
      case 'street_number':
        addressDetails.value.street = `${component.long_name} ${addressDetails.value.street}`
        break
      case 'route':
        addressDetails.value.street += component.long_name
        break
      case 'locality':
        addressDetails.value.city = component.long_name
        break
      case 'administrative_area_level_1':
        addressDetails.value.state = component.long_name
        break
      case 'country':
        addressDetails.value.country = component.long_name
        break
      case 'postal_code':
        addressDetails.value.zipCode = component.long_name
        break
    }
  })
}

const geocodeAddress = async () => {
  if (!addressDetails.value.formattedAddress || !window.google?.maps) {
    return false
  }

  geocodingAddress.value = true

  try {
    const geocoder = new window.google.maps.Geocoder()

    const result = await new Promise((resolve, reject) => {
      geocoder.geocode(
        {
          address: addressDetails.value.formattedAddress,
          componentRestrictions: { country: 'ar' }
        },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0])
          } else {
            reject(new Error(`Geocoding failed: ${status}`))
          }
        }
      )
    })

    if (result.geometry) {
      // Actualizar coordenadas sin perder la dirección original
      addressDetails.value.latitude = result.geometry.location.lat()
      addressDetails.value.longitude = result.geometry.location.lng()

      // Emitir actualización con coordenadas
      emit('address-selected', addressDetails.value)

      return true
    }
  } catch (error) {
    console.warn('Error al geocodificar dirección:', error)
  } finally {
    geocodingAddress.value = false
  }

  return false
}

const showMapModal = async () => {
  // Si ya tiene coordenadas, mostrar directamente
  if (addressDetails.value.latitude) {
    mapModal.value = true
    await nextTick()
    initMap()
    return
  }

  // Si no tiene coordenadas pero tiene dirección, hacer geocoding
  if (addressDetails.value.formattedAddress) {
    await geocodeAddress()
    if (addressDetails.value.latitude) {
      mapModal.value = true
      await nextTick()
      initMap()
    }
  }
}

const initMap = () => {
  try {
    const container = document.getElementById('map-container')
    if (!container || !window.google?.maps) return

    container.innerHTML = ''

    const location = new window.google.maps.LatLng(addressDetails.value.latitude, addressDetails.value.longitude)

    map.value = new window.google.maps.Map(container, {
      center: location,
      zoom: 15,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP
    })

    marker.value = new window.google.maps.Marker({
      position: location,
      map: map.value,
      title: addressDetails.value.name || addressDetails.value.formattedAddress
    })

    if (addressDetails.value.types?.includes('establishment')) {
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <strong>${addressDetails.value.name}</strong><br>
            ${addressDetails.value.formattedAddress}
          </div>
        `
      })
      infoWindow.open(map.value, marker.value)
    }
  } catch (error) {
    // Error silencioso al inicializar mapa
  }
}

const openDirections = () => {
  if (!addressDetails.value.latitude) return

  const baseUrl = 'https://www.google.com/maps/dir/?api=1'
  const params = new URLSearchParams({
    destination: `${addressDetails.value.latitude},${addressDetails.value.longitude}`,
    destination_place_id: addressDetails.value.placeId,
    travelmode: 'driving'
  })

  window.open(`${baseUrl}&${params.toString()}`, '_blank')
}

const cleanup = () => {
  if (autocomplete.value && window.google?.maps?.event) {
    window.google.maps.event.clearInstanceListeners(autocomplete.value)
    autocomplete.value = null
  }
  cleanupMap()
}

const cleanupMap = () => {
  if (marker.value) {
    marker.value.setMap(null)
    marker.value = null
  }
  map.value = null
}

const handleManualAddressInput = () => {
  if (!address.value || address.value.trim().length < 3) return

  // Crear un objeto de dirección manual cuando Google Maps no está disponible
  addressDetails.value = {
    name: '',
    street: address.value.trim(),
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: null,
    longitude: null,
    formattedAddress: address.value.trim(),
    placeId: '',
    types: ['manual_input']
  }

  emit('address-selected', addressDetails.value)
}

// Nueva función para editar dirección
const editAddress = () => {
  if (addressDetails.value.formattedAddress) {
    address.value = addressDetails.value.formattedAddress
    // Limpiar los detalles para permitir nueva edición
    addressDetails.value = {
      name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: null,
      longitude: null,
      formattedAddress: '',
      placeId: '',
      types: []
    }
  }
}

const resetAddress = () => {
  address.value = ''
  displayAddress.value = ''
  addressDetails.value = {
    name: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: null,
    longitude: null,
    formattedAddress: '',
    placeId: '',
    types: []
  }
  emit('address-selected', null)
}

defineExpose({
  resetAddress,
  editAddress
})
</script>

<style scoped>
/* Input container */
.places-input-container {
  width: 100%;
}

.places-input {
  width: 100%;
}

/* Modal del mapa optimizado */
.map-card {
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 900px;
  max-width: 95vw;
  max-height: 90vh;
}

/* Header mejorado */
.map-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  padding: 16px 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.location-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
}

.location-address {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.3;
  word-break: break-word;
}

.close-btn {
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
}

/* Contenido del mapa */
.map-content {
  padding: 0;
  position: relative;
}

.map-container {
  height: 400px;
  width: 100%;
  background: #f8f9fa;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

/* Acciones del modal */
.map-actions {
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 12px 20px;
  gap: 12px;
}

.secondary-btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.primary-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 20px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

.secondary-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Animaciones */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.saved-address-info {
  animation: slideInUp 0.3s ease-out;
}

/* Responsividad mejorada */
@media (max-width: 768px) {
  .address-component {
    gap: 6px;
  }

  .actions-container {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .action-btn {
    justify-content: center;
    width: 100%;
    padding: 14px 24px;
    font-size: 15px;
  }

  .saved-address-card {
    min-width: unset;
    width: 100%;
  }

  .saved-address-text {
    font-size: 13px;
  }

  .map-card {
    width: 100%;
    max-width: 100vw;
    max-height: 85vh;
    margin: 0;
    border-radius: 0;
  }

  .map-container {
    height: 250px;
  }

  .header-content {
    gap: 8px;
  }

  .location-info {
    gap: 8px;
  }

  .location-name {
    font-size: 15px;
  }

  .location-address {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .actions-container {
    padding: 6px 0;
  }

  .action-btn {
    font-size: 11px;
    padding: 6px 12px;
  }

  .saved-text {
    font-size: 11px;
  }
}
</style>

<style>
.pac-container {
  z-index: 10000 !important;
  border-radius: 12px !important;
  border: 1px solid #e0e0e0 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  margin-top: 4px !important;
  overflow: hidden !important;
}

.pac-item {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f0f0f0 !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  transition: background-color 0.2s ease !important;
}

.pac-item:hover,
.pac-item-selected {
  background-color: #f8f9fa !important;
}

.pac-item:last-child {
  border-bottom: none !important;
}

.pac-item-query {
  font-weight: 500 !important;
  color: #212529 !important;
}

.pac-matched {
  font-weight: 600 !important;
  color: var(--q-primary) !important;
}

.pac-item-query .pac-matched {
  color: var(--q-primary) !important;
}

.pac-secondary {
  color: #6c757d !important;
  font-size: 13px !important;
  margin-top: 2px !important;
}

.pac-icon {
  margin-right: 12px !important;
  margin-top: 2px !important;
}

#map-container {
  z-index: 1 !important;
}

.q-dialog__backdrop {
  z-index: 6000 !important;
}

.q-dialog__inner {
  z-index: 6001 !important;
}
</style>
