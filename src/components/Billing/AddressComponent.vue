<template>
  <div class="places-input-container">
    <q-input
      ref="inputRef"
      v-model="address"
      label="Buscar dirección de entrega"
      filled
      clearable
      :loading="loading"
      class="places-input"
      input-class="places-input-field"
      label-color="grey-6"
      color="primary"
      @clear="resetAddress"
      @keyup.enter="handleManualAddressInput"
      @blur="handleManualAddressInput"
    >
      <template #prepend>
        <q-icon name="place" color="grey-6" size="20px" />
      </template>

      <template #append>
        <q-btn
          v-if="address && addressDetails.latitude"
          flat
          round
          dense
          icon="location_on"
          color="primary"
          size="sm"
          class="location-btn"
          @click.stop="showMapModal"
        />
      </template>
    </q-input>

    <q-dialog v-model="mapModal" class="map-dialog" @hide="cleanupMap">
      <q-card class="map-card">
        <q-card-section class="map-header bg-primary text-white">
          <div class="map-title">
            {{ addressDetails.name || 'Ubicación seleccionada' }}
          </div>
          <q-btn v-close-popup icon="close" flat round dense color="grey-7" size="sm" />
        </q-card-section>

        <q-card-section class="map-content">
          <div class="address-text">
            {{ addressDetails.formattedAddress }}
          </div>
          <div id="map-container" class="map-container"></div>
        </q-card-section>

        <q-card-actions class="map-actions" align="right">
          <q-btn v-close-popup flat label="Cerrar" color="grey-7" />
          <q-btn
            label="Cómo llegar"
            icon="directions"
            color="primary"
            unelevated
            :disable="!addressDetails.latitude"
            class="directions-btn"
            @click="openDirections"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { loadGoogleMaps } from 'src/boot/google-maps'

const emit = defineEmits(['address-selected'])

const inputRef = ref(null)
const address = ref('')
const autocomplete = ref(null)
const loading = ref(false)
const mapModal = ref(false)
const map = ref(null)
const marker = ref(null)

const props = defineProps({
  initialAddress: {
    type: Object,
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
  // Dar tiempo para que el componente se monte completamente
  await nextTick()
  await initializeComponent()
})

// Limpieza al desmontar
onUnmounted(() => {
  cleanup()
})

const initializeComponent = async () => {
  loading.value = true
  try {
    const loaded = await loadGoogleMaps()
    if (!loaded) throw new Error('Google Maps no se cargó')

    // Estrategia alternativa: buscar el input directamente en el DOM del componente
    // sin depender del template ref que no se está bindeando correctamente
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))

    await initAutocomplete()
    address.value = props?.initialAddress?.formattedAddress || props.initialAddress?.name || ''
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
      onPlaceChanged().catch(console.error)
    })
  } catch (error) {
    console.error('Error en autocomplete:', error)
    throw error
  }
}

const handlePlaceSelection = async (place) => {
  try {
    if (!place?.geometry) {
      console.log('Lugar sin geometría')
      return
    }

    address.value = place.formatted_address || place.name || ''
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
    console.error('Error procesando lugar:', error)
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

const showMapModal = async () => {
  if (!addressDetails.value.latitude) return

  mapModal.value = true
  await nextTick()
  initMap()
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
    console.error('Error inicializando mapa:', error)
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

const resetAddress = () => {
  address.value = ''
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
  resetAddress
})
</script>

<style scoped>
.places-input-container {
  position: relative;
}

.places-input {
  border-radius: 12px;
}

.places-input :deep(.q-field__control) {
  border-radius: 12px;
  min-height: 48px;
}

.places-input :deep(.q-field__outlined) {
  border-color: #e0e0e0;
  transition: border-color 0.2s ease;
}

.places-input :deep(.q-field__outlined:hover) {
  border-color: #bdbdbd;
}

.places-input :deep(.q-field--focused .q-field__outlined) {
  border-color: var(--q-primary);
  border-width: 2px;
}

.places-input-field {
  font-size: 14px;
  font-weight: 400;
  color: #424242;
}

.location-btn {
  transition: all 0.2s ease;
}

.location-btn:hover {
  background-color: rgba(25, 118, 210, 0.08);
}

.map-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  width: 800px;
  max-width: 90vw;
}

.map-header {
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.map-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.map-content {
  padding: 24px;
}

.address-text {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 16px;
  line-height: 1.4;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  overflow: hidden;
}

.map-actions {
  gap: 12px;
}

.directions-btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 20px;
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
