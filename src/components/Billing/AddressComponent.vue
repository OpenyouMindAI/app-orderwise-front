<template>
  <div class="places-input-container">
    <!-- Desktop Select -->
    <q-select
      v-if="!$q.platform.is.mobile"
      ref="selectRef"
      v-model="model"
      :options="options"
      :label="isCustomStyled ? undefined : label"
      :placeholder="isCustomStyled ? label : undefined"
      :filled="!isCustomStyled"
      :borderless="isCustomStyled"
      clearable
      :loading="loading"
      use-input
      hide-selected
      fill-input
      input-debounce="300"
      hide-dropdown-icon
      hide-bottom-space
      hide-no-option
      class="places-input"
      :class="{ 'custom-input-look': isCustomStyled }"
      input-class="places-input-field"
      label-color="grey-6"
      color="primary"
      popup-content-class="places-menu"
      @filter="filterFn"
      @update:model-value="onSelection"
      @clear="resetAddress"
    >
      <template #prepend>
        <q-icon name="place" :color="isCustomStyled ? 'primary' : 'grey-6'" size="20px" />
      </template>

      <template #append>
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
        <q-icon
          v-else-if="addressDetails.formattedAddress"
          name="check_circle"
          color="positive"
          size="20px"
        >
          <q-tooltip>Dirección guardada</q-tooltip>
        </q-icon>
      </template>

      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon name="place" color="grey-6" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.main_text }}</q-item-label>
            <q-item-label caption>{{ scope.opt.secondary_text }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- Mobile Select -->
    <q-select
      v-if="$q.platform.is.mobile"
      ref="selectRefMobile"
      :filled="!isCustomStyled"
      :borderless="isCustomStyled"
      v-model="model"
      use-input
      input-debounce="0"
      :label="isCustomStyled ? undefined : label"
      :placeholder="isCustomStyled ? label : undefined"
      :options="options"
      @filter="filterFn"
      behavior="dialog"
      :loading="loading"
      clearable
      hide-selected
      hide-dropdown-icon
      fill-input
      class="places-input"
      :class="{ 'custom-input-look': isCustomStyled }"
      input-class="places-input-field"
      label-color="grey-6"
      color="primary"
      @update:model-value="onSelection"
      @clear="resetAddress"
    >
      <template #prepend>
        <q-icon name="place" :color="isCustomStyled ? 'primary' : 'grey-6'" size="20px" />
      </template>
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon name="place" color="grey-6" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.main_text }}</q-item-label>
            <q-item-label caption>{{ scope.opt.secondary_text }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

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

    <!-- Elemento oculto para inicializar PlacesService -->
    <div ref="placesServiceContainer" style="display: none;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useQuasar } from 'quasar'
import { loadGoogleMaps } from 'src/boot/google-maps'

// ============================================================================
// DEFINICIONES Y PROPS
// ============================================================================

const $q = useQuasar()

const emit = defineEmits(['address-selected'])

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
  },
  label: {
    type: String,
    default: 'Buscar dirección de entrega'
  },
  isCustomStyled: {
    type: Boolean,
    default: false
  }
})

// ============================================================================
// ESTADO REACTIVO
// ============================================================================

// Generar ID único para esta instancia del componente
const componentId = `address-component-${Math.random().toString(36).substr(2, 9)}`

const placesContainer = ref(null)
const inputRef = ref(null)
const address = ref('')
const displayAddress = ref('')
const autocomplete = ref(null)
const loading = ref(false)
const mapModal = ref(false)
const map = ref(null)
const marker = ref(null)
const geocodingAddress = ref(false)
const myPacContainer = ref(null) // Referencia al pac-container de esta instancia

// Servicios de Google Maps
let autocompleteService = null
let placesService = null
let sessionToken = null

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

// ============================================================================
// UTILIDADES
// ============================================================================

const createEmptyAddressDetails = () => ({
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

const getSessionToken = () => {
  if (window.google?.maps?.places?.AutocompleteSessionToken) {
    return new window.google.maps.places.AutocompleteSessionToken()
  }
  return null
}

// ============================================================================
// LOGICA DE AUTOCOMPLETADO
// ============================================================================

/**
 * Actualiza el ancho y posición del pac-container para que coincida con el contenedor.
 * Usa cssText para forzar estilos inline más fuertes.
 * Usa places-input-container como referencia de ancho y posición (no el input).
 * Solo trabaja con el pac-container de ESTA instancia.
 */
const updatePacWidth = () => {
  // Solo trabajar con el pac-container de esta instancia
  const pacContainer = myPacContainer.value
  const inputContainer = placesContainer.value

  if (pacContainer && inputContainer && document.body.contains(pacContainer)) {
    const rect = inputContainer.getBoundingClientRect()
    const width = rect.width
    const left = rect.left + window.scrollX

    const currentWidth = parseFloat(pacContainer.style.width) || 0
    const currentLeft = parseFloat(pacContainer.style.left) || 0

    // Solo actualizar si difiere para evitar loops
    if (Math.abs(currentWidth - width) > 1 || Math.abs(currentLeft - left) > 1) {
      // Preservar otros estilos y forzar width y left
      const existingStyles = pacContainer.style.cssText
        .replace(/width:[^;]+;?/g, '')
        .replace(/left:[^;]+;?/g, '')
      pacContainer.style.cssText = `width: ${width}px !important; left: ${left}px !important; ${existingStyles}`
    }
  }

  if (!autocompleteService && window.google?.maps?.places) {
    autocompleteService = new window.google.maps.places.AutocompleteService()
  }

  let elapsed = 0
  const intervalMs = 50
  const duration = 2000

  widthUpdateInterval = setInterval(() => {
    updatePacWidth()
    elapsed += intervalMs

    if (elapsed >= duration) {
      clearInterval(widthUpdateInterval)
      widthUpdateInterval = null
    }
  }, intervalMs)
}

/**
 * Configura el pac-container cuando se detecta en el DOM.
 * Aplica estilos y observa cambios de estilo para revertir overrides de Google.
 * Usa places-input-container como referencia de ancho y posición.
 * Marca el pac-container con el componentId único.
 */
const setupPacContainer = (node) => {
  // Marcar este pac-container como perteneciente a esta instancia
  node.classList.add('custom-pac-container')
  node.setAttribute('data-component-id', componentId)
  myPacContainer.value = node

  const inputContainer = placesContainer.value
  if (!inputContainer) return

  // Forzar ancho y posición inicial con cssText usando el contenedor
  const rect = inputContainer.getBoundingClientRect()
  const width = rect.width
  const left = rect.left + window.scrollX

  // Preservar estilos existentes (especialmente display: none)
  const existingStyles = node.style.cssText
    .replace(/width:[^;]+;?/g, '')
    .replace(/left:[^;]+;?/g, '')

  node.style.cssText = `width: ${width}px !important; left: ${left}px !important; ${existingStyles}`

  // Generar nuevo token de sesión si no existe
  if (!sessionToken) {
    sessionToken = getSessionToken()
  }

  // Observar cambios de estilo para revertir overrides de Google
  styleObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        // Verificar que seguimos observando el pac-container correcto
        if (mutation.target !== myPacContainer.value) return
        
        const containerRect = placesContainer.value?.getBoundingClientRect()
        if (!containerRect) return

        const requiredWidth = containerRect.width
        const requiredLeft = containerRect.left + window.scrollX
        const currentWidth = parseFloat(node.style.width) || 0
        const currentLeft = parseFloat(node.style.left) || 0

        if (Math.abs(currentWidth - requiredWidth) > 1 || Math.abs(currentLeft - requiredLeft) > 1) {
          const existingStyles = node.style.cssText
            .replace(/width:[^;]+;?/g, '')
            .replace(/left:[^;]+;?/g, '')
          node.style.cssText = `width: ${requiredWidth}px !important; left: ${requiredLeft}px !important; ${existingStyles}`
        }
      }

      options.value = predictions.map(prediction => ({
        label: prediction.description,
        value: prediction.place_id,
        main_text: prediction.structured_formatting.main_text,
        secondary_text: prediction.structured_formatting.secondary_text,
        description: prediction.description
      }))
    })
  })
}

const onSelection = (option) => {
  if (!option) {
    resetAddress()
    return
  }

  // Establecer el modelo con el texto completo
  model.value = option.label

  if (!placesService && window.google?.maps?.places && placesServiceContainer.value) {
    placesService = new window.google.maps.places.PlacesService(placesServiceContainer.value)
  }

  // Observer para capturar el pac-container cuando se añade al DOM
  // Solo capturamos el que aparece DESPUÉS de nuestro input
  mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.classList?.contains('pac-container')) {
          // Verificar si este pac-container ya tiene un componentId asignado
          const existingId = node.getAttribute('data-component-id')
          if (existingId && existingId !== componentId) {
            // Este pac-container pertenece a otra instancia, ignorarlo
            continue
          }
          
          // Si no tiene ID o es nuestro ID, configurarlo
          if (!existingId) {
            setupPacContainer(node)
            return
          }
        }
      }
    }
  })
  mutationObserver.observe(document.body, { childList: true, subtree: false })

  loading.value = true

  placesService.getDetails({
    placeId: option.value,
    sessionToken,
    fields: ['address_components', 'geometry', 'formatted_address', 'name', 'place_id', 'types']
  }, (place, status) => {
    loading.value = false
    // Reiniciar token después de una selección exitosa
    sessionToken = null

  // Fallback: buscar pac-container si ya existe
  // Solo configurar si no tiene componentId o si es el nuestro
  setTimeout(() => {
    const containers = document.querySelectorAll('.pac-container')
    for (const container of containers) {
      const existingId = container.getAttribute('data-component-id')
      // Si no tiene ID, asignarlo a esta instancia
      if (!existingId && !myPacContainer.value) {
        setupPacContainer(container)
        break
      }
      // Si ya es nuestro, asegurarnos de tener la referencia
      if (existingId === componentId) {
        myPacContainer.value = container
        break
      }
    }
  })
}

// ============================================================================
// PROCESAMIENTO DE LUGAR SELECCIONADO
// ============================================================================

const parseAddressComponents = (components) => {
  for (const component of components) {
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
  }
}

const handlePlaceSelection = (place) => {
  if (!place?.geometry) {
    console.warn('[AddressComponent] Lugar seleccionado sin geometría')
    return
  }

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
}

// ============================================================================
// CARGA DE DIRECCIÓN INICIAL
// ============================================================================

const loadInitialAddress = () => {
  if (!props.initialAddress) {
    model.value = ''
    return
  }

  let initial = props.initialAddress

  // Parsear si es string JSON
  if (typeof initial === 'string') {
    try {
      initial = JSON.parse(initial)
    } catch {
      model.value = String(initial)
      return
    }
  }

  // Verificar que sea objeto válido
  if (typeof initial !== 'object' || initial === null) {
    model.value = ''
    return
  }

  // Determinar texto a mostrar
  const addressText = initial.formattedAddress || initial.name || initial.street || ''

  if (addressText) {
    model.value = String(addressText)
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
}

// ============================================================================
// GEOCODIFICACIÓN Y MAPA
// ============================================================================

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
      addressDetails.value.latitude = result.geometry.location.lat()
      addressDetails.value.longitude = result.geometry.location.lng()
      emit('address-selected', addressDetails.value)
      return true
    }
  } catch (error) {
    console.warn('[AddressComponent] Error al geocodificar:', error.message)
  } finally {
    geocodingAddress.value = false
  }

  return false
}

const showMapModal = async () => {
  if (addressDetails.value.latitude) {
    mapModal.value = true
    await nextTick()
    initMap()
    return
  }

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
  const container = document.getElementById('map-container')
  if (!container || !window.google?.maps) {
    return
  }

  container.innerHTML = ''

  const location = new window.google.maps.LatLng(
    addressDetails.value.latitude,
    addressDetails.value.longitude
  )

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

// ============================================================================
// MANEJO DE ESTADO
// ============================================================================

const resetAddress = () => {
  model.value = ''
  addressDetails.value = createEmptyAddressDetails()
  emit('address-selected', null)
}

const editAddress = () => {
  if (addressDetails.value.formattedAddress) {
    model.value = addressDetails.value.formattedAddress
    addressDetails.value = createEmptyAddressDetails()
  }
}

// ============================================================================
// LIMPIEZA
// ============================================================================

const cleanupMap = () => {
  if (marker.value) {
    marker.value.setMap(null)
    marker.value = null
  }
  map.value = null
}

const cleanup = () => {
  // Limpiar interval de actualización de ancho
  if (widthUpdateInterval) {
    clearInterval(widthUpdateInterval)
    widthUpdateInterval = null
  }

  // Desconectar MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }

  // Desconectar ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // Desconectar StyleObserver
  if (styleObserver) {
    styleObserver.disconnect()
    styleObserver = null
  }

  // Remover todos los event listeners trackeados
  for (const { target, event, handler, options } of eventListeners) {
    target.removeEventListener(event, handler, options)
  }
  eventListeners.length = 0

  // Limpiar autocomplete de Google
  if (autocomplete.value && window.google?.maps?.event) {
    window.google.maps.event.clearInstanceListeners(autocomplete.value)
    autocomplete.value = null
  }

  // Limpiar y remover el pac-container de esta instancia del DOM
  if (myPacContainer.value && document.body.contains(myPacContainer.value)) {
    myPacContainer.value.remove()
  }
  myPacContainer.value = null

  // Limpiar referencia cacheada
  cachedInputElement = null

  cleanupMap()
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

const initializeComponent = async () => {
  loading.value = true
  try {
    const loaded = await loadGoogleMaps()
    if (!loaded) return

    await nextTick()

    // Inicializar servicios si es necesario
    if (window.google?.maps?.places) {
      autocompleteService = new window.google.maps.places.AutocompleteService()
      if (placesServiceContainer.value) {
        placesService = new window.google.maps.places.PlacesService(placesServiceContainer.value)
      }
    }
  } catch (error) {
    console.warn('[AddressComponent] Error inicializando:', error.message)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loadInitialAddress()
  await nextTick()
  await initializeComponent()
})

onUnmounted(() => {
  cleanup()
})

// Watch para cambios en initialAddress
watch(
  () => props.initialAddress,
  (newAddress) => {
    if (newAddress) {
      loadInitialAddress()
    }
  },
  { deep: true }
)

// EXPOSE
defineExpose({
  resetAddress,
  editAddress
})
</script>

<style scoped>
.custom-input-look {
  /* Removed styles applied to root to match RegisterPage pattern */
  width: 100%;
}

.custom-input-look :deep(.q-field__control):hover {
  background: #ffffff;
  border-color: #667eea;
}

.custom-input-look :deep(.q-field__control):focus-within {
  background: #ffffff;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.custom-input-look :deep(.q-field__control) {
  min-height: 44px !important;
  height: 44px !important;
  border-radius: 12px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  padding: 0 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex !important;
  align-items: center !important;
}

.custom-input-look :deep(.q-field__native) {
  min-height: 44px !important;
  height: 44px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  line-height: normal;
}

.custom-input-look :deep(.q-field__prepend),
.custom-input-look :deep(.q-field__append) {
  height: 44px !important;
  min-height: 44px !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 8px !important;
}

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
