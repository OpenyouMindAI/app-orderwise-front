<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="bg-black text-white column no-scroll">
      <!-- Toolbar -->
      <q-bar class="bg-black q-pa-md items-center" style="height: 60px; z-index: 2000;">
        <div class="text-h6 text-weight-regular">{{ title }}</div>
        <q-space />
        <q-btn dense flat round icon="close" v-close-popup size="lg">
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="col q-pa-none relative-position flex flex-center overflow-hidden">
        <!-- Empty State -->
        <div v-if="!images || images.length === 0" class="text-center text-grey-5">
            <q-icon name="image_not_supported" size="64px" />
            <div class="text-h6 q-mt-md">No hay imágenes disponibles</div>
        </div>

        <!-- Carousel -->
        <q-carousel
          v-else
          v-model="slide"
          animated
          swipeable
          navigation
          infinite
          arrows
          control-color="white"
          class="bg-transparent full-width full-height"
          height="100%"
        >
          <q-carousel-slide
            v-for="(img, index) in images"
            :key="index"
            :name="index"
            class="flex flex-center no-padding"
          >
            <q-img
                :src="img.url"
                fit="contain"
                class="full-height full-width"
                style="max-height: 100vh;"
                spinner-color="primary"
                spinner-size="50px"
            >
                <template v-slot:error>
                    <div class="absolute-full flex flex-center column">
                        <q-icon name="broken_image" size="64px" color="grey-7" />
                        <div class="text-grey-5 q-mt-sm">No se pudo cargar la imagen</div>
                    </div>
                </template>
            </q-img>
          </q-carousel-slide>
        </q-carousel>
      </q-card-section>

      <!-- Footer Actions -->
      <q-card-actions align="center" class="bg-black q-pb-lg q-pt-md" style="z-index: 2000;" v-if="images && images.length > 0">
         <div class="row items-center q-gutter-md">
            <!-- Counter -->
            <div class="text-grey-4 text-subtitle1 q-mr-md">
                {{ slide + 1 }} / {{ images.length }}
            </div>
            
            <q-separator vertical dark />

            <q-btn
                v-if="currentImage"
                color="white"
                text-color="black"
                icon="download"
                label="Descargar"
                @click="downloadImage"
                unelevated
                rounded
                class="text-weight-bold"
            />
         </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'NewImageCarouselDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    images: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: 'Galería'
    }
  },
  emits: ['update:modelValue'],
  setup (props) {
    const $q = useQuasar()
    const slide = ref(0)

    // Reset slide index when dialog is opened
    watch(() => props.modelValue, (val) => {
      if (val) {
        slide.value = 0
      }
    })

    const currentImage = computed(() => {
      if (!props.images || props.images.length === 0) return null
      return props.images[slide.value]
    })

    const downloadImage = () => {
      const img = currentImage.value
      if (!img || !img.url) return

      // Create a temporary link to download
      const link = document.createElement('a')
      link.href = img.url
      
      // Attempt to construct a filename
      const dateStr = new Date().toISOString().split('T')[0]
      const ext = img.url.split('.').pop().split('?')[0] || 'jpg'
      const fileName = `imagen-retiro-${dateStr}-${slide.value + 1}.${ext}`
      
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      $q.notify({
        type: 'positive',
        message: 'Descargando imagen...',
        position: 'bottom',
        timeout: 1500
      })
    }

    return {
      slide,
      currentImage,
      downloadImage
    }
  }
}
</script>

<style scoped>
:deep(.q-carousel__navigation-inner) {
    padding-bottom: 20px;
}
</style>
