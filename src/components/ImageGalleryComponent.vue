<template>
  <q-dialog
    v-model="isOpen"
    maximized
    transition-show="fade"
    transition-hide="fade"
  >
    <div class="image-gallery-container">
      <!-- Header con controles -->
      <div class="gallery-header">
        <div class="gallery-info">
          <span class="image-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
          <span v-if="currentImage.name" class="image-name">{{ currentImage.name }}</span>
        </div>

        <div class="gallery-controls">
          <!-- Controles de zoom (solo para imágenes) -->
          <template v-if="!isPDF">
            <q-btn
              flat
              round
              dense
              icon="zoom_out"
              color="white"
              size="md"
              @click="zoomOut"
              :disable="zoomLevel <= minZoom"
              class="control-btn"
            >
              <q-tooltip>Alejar (Ctrl + -)</q-tooltip>
            </q-btn>

            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>

            <q-btn
              flat
              round
              dense
              icon="zoom_in"
              color="white"
              size="md"
              @click="zoomIn"
              :disable="zoomLevel >= maxZoom"
              class="control-btn"
            >
              <q-tooltip>Acercar (Ctrl + +)</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              icon="refresh"
              color="white"
              size="md"
              @click="resetZoom"
              class="control-btn"
            >
              <q-tooltip>Restablecer (R)</q-tooltip>
            </q-btn>

            <q-separator vertical dark class="q-mx-sm" />
          </template>

          <!-- Descargar -->
          <q-btn
            flat
            round
            dense
            icon="download"
            color="white"
            size="md"
            @click="downloadImage"
            class="control-btn"
          >
            <q-tooltip>Descargar</q-tooltip>
          </q-btn>

          <!-- Cerrar -->
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            size="md"
            @click="close"
            class="control-btn"
          >
            <q-tooltip>Cerrar (ESC)</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Contenedor de imagen/PDF con zoom -->
      <div
        class="gallery-main"
        @wheel.prevent="handleWheel"
        @mousedown="startDrag"
        @mousemove="drag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
      >
        <!-- Vista de PDF -->
        <div v-if="isPDF" class="pdf-preview">
          <q-icon name="picture_as_pdf" size="120px" color="red-5" class="pdf-icon" />
          <div class="pdf-name">{{ currentImage.name || 'Documento PDF' }}</div>
          <q-btn
            unelevated
            color="primary"
            icon="open_in_new"
            label="Abrir PDF"
            size="lg"
            @click="openPDF"
            class="q-mt-lg pdf-open-btn"
          />
          <q-btn
            outline
            color="white"
            icon="download"
            label="Descargar"
            size="md"
            @click="downloadImage"
            class="q-mt-md"
          />
        </div>

        <!-- Vista de imagen -->
        <template v-else>
          <img
            ref="imageElement"
            :src="currentImageUrl"
            :alt="currentImage.name || `Imagen ${currentIndex + 1}`"
            :style="imageStyle"
            class="gallery-image"
            @load="onImageLoad"
            @error="onImageError"
          />

          <!-- Loading -->
          <div v-if="loading" class="gallery-loading">
            <q-spinner-orbit color="white" size="60px" />
          </div>

          <!-- Error -->
          <div v-if="imageError" class="gallery-error">
            <q-icon name="broken_image" size="60px" color="white" />
            <p>No se pudo cargar la imagen</p>
          </div>
        </template>
      </div>

      <!-- Navegación -->
      <div v-if="images.length > 1" class="gallery-navigation">
        <q-btn
          flat
          round
          icon="chevron_left"
          color="white"
          size="lg"
          @click="previousImage"
          :disable="currentIndex === 0 && !loop"
          class="nav-btn nav-btn-left"
        >
          <q-tooltip>Anterior (←)</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          icon="chevron_right"
          color="white"
          size="lg"
          @click="nextImage"
          :disable="currentIndex === images.length - 1 && !loop"
          class="nav-btn nav-btn-right"
        >
          <q-tooltip>Siguiente (→)</q-tooltip>
        </q-btn>
      </div>

      <!-- Thumbnails (opcional) -->
      <div v-if="showThumbnails && images.length > 1" class="gallery-thumbnails">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="thumbnail-item"
          :class="{ 'thumbnail-active': index === currentIndex, 'thumbnail-pdf': isPDFFile(image) }"
          @click="goToImage(index)"
        >
          <!-- Vista de PDF en thumbnail -->
          <div v-if="isPDFFile(image)" class="thumbnail-pdf-content">
            <q-icon name="picture_as_pdf" size="32px" color="red-5" />
            <span class="thumbnail-pdf-label">PDF</span>
          </div>
          <!-- Vista de imagen en thumbnail -->
          <img v-else :src="getImageUrl(image)" :alt="`Miniatura ${index + 1}`" />
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script>
export default {
  name: 'ImageGalleryComponent',

  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    images: {
      type: Array,
      required: true,
      validator: (value) => Array.isArray(value) && value.length > 0
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    loop: {
      type: Boolean,
      default: true
    },
    showThumbnails: {
      type: Boolean,
      default: true
    },
    zoomStep: {
      type: Number,
      default: 0.2
    },
    minZoom: {
      type: Number,
      default: 0.5
    },
    maxZoom: {
      type: Number,
      default: 5
    }
  },

  emits: ['update:modelValue', 'change', 'close'],

  data () {
    return {
      currentIndex: this.initialIndex,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      loading: false,
      imageError: false
    }
  },

  computed: {
    isOpen: {
      get () {
        return this.modelValue
      },
      set (value) {
        this.$emit('update:modelValue', value)
      }
    },

    currentImage () {
      return this.images[this.currentIndex] || {}
    },

    currentImageUrl () {
      return this.getImageUrl(this.currentImage)
    },

    isPDF () {
      const url = this.currentImageUrl.toLowerCase()
      const image = this.currentImage

      // Detectar por extensión
      if (url.includes('.pdf')) return true

      // Detectar por tipo MIME
      if (image.type && image.type.includes('pdf')) return true
      if (image.mime_type && image.mime_type.includes('pdf')) return true

      // Detectar por nombre de archivo
      if (image.name && image.name.toLowerCase().endsWith('.pdf')) return true

      return false
    },

    imageStyle () {
      return {
        transform: `scale(${this.zoomLevel}) translate(${this.panX}px, ${this.panY}px)`,
        cursor: this.zoomLevel > 1 ? (this.isDragging ? 'grabbing' : 'grab') : 'default'
      }
    }
  },

  watch: {
    modelValue (newValue) {
      if (newValue) {
        this.currentIndex = this.initialIndex
        this.resetZoom()
        this.addKeyboardListeners()
      } else {
        this.removeKeyboardListeners()
      }
    },

    currentIndex (newIndex) {
      this.resetZoom()
      this.loading = true
      this.imageError = false
      this.$emit('change', {
        index: newIndex,
        image: this.currentImage
      })
    }
  },

  methods: {
    getImageUrl (image) {
      if (!image) return ''

      // Soporta diferentes formatos de datos
      if (typeof image === 'string') {
        return image
      }

      return image.url || image.path || image.file_url || image.src || ''
    },

    isPDFFile (image) {
      if (!image) return false

      const url = this.getImageUrl(image).toLowerCase()

      // Detectar por extensión
      if (url.includes('.pdf')) return true

      // Detectar por tipo MIME
      if (image.type && image.type.includes('pdf')) return true
      if (image.mime_type && image.mime_type.includes('pdf')) return true

      // Detectar por nombre de archivo
      if (image.name && image.name.toLowerCase().endsWith('.pdf')) return true

      return false
    },

    // Zoom methods
    zoomIn () {
      const newZoom = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom)
      this.zoomLevel = parseFloat(newZoom.toFixed(2))
    },

    zoomOut () {
      const newZoom = Math.max(this.zoomLevel - this.zoomStep, this.minZoom)
      this.zoomLevel = parseFloat(newZoom.toFixed(2))

      // Reset pan if zoomed out completely
      if (this.zoomLevel === 1) {
        this.panX = 0
        this.panY = 0
      }
    },

    resetZoom () {
      this.zoomLevel = 1
      this.panX = 0
      this.panY = 0
    },

    handleWheel (event) {
      if (event.ctrlKey || event.metaKey) {
        // Zoom con Ctrl + Scroll
        if (event.deltaY < 0) {
          this.zoomIn()
        } else {
          this.zoomOut()
        }
      }
    },

    // Pan/Drag methods
    startDrag (event) {
      if (this.zoomLevel > 1) {
        this.isDragging = true
        this.dragStartX = event.clientX - this.panX
        this.dragStartY = event.clientY - this.panY
      }
    },

    drag (event) {
      if (this.isDragging && this.zoomLevel > 1) {
        this.panX = event.clientX - this.dragStartX
        this.panY = event.clientY - this.dragStartY
      }
    },

    endDrag () {
      this.isDragging = false
    },

    // Navigation methods
    nextImage () {
      if (this.currentIndex < this.images.length - 1) {
        this.currentIndex++
      } else if (this.loop) {
        this.currentIndex = 0
      }
    },

    previousImage () {
      if (this.currentIndex > 0) {
        this.currentIndex--
      } else if (this.loop) {
        this.currentIndex = this.images.length - 1
      }
    },

    goToImage (index) {
      if (index >= 0 && index < this.images.length) {
        this.currentIndex = index
      }
    },

    // Image events
    onImageLoad () {
      this.loading = false
      this.imageError = false
    },

    onImageError () {
      this.loading = false
      this.imageError = true
    },

    // PDF methods
    openPDF () {
      window.open(this.currentImageUrl, '_blank')
    },

    // Download
    downloadImage () {
      const link = document.createElement('a')
      link.href = this.currentImageUrl
      link.download = this.currentImage.name || (this.isPDF ? `documento-${this.currentIndex + 1}.pdf` : `imagen-${this.currentIndex + 1}`)
      link.click()
    },

    // Close
    close () {
      this.isOpen = false
      this.$emit('close')
    },

    // Keyboard handlers
    handleKeyboard (event) {
      switch (event.key) {
        case 'Escape':
          this.close()
          break
        case 'ArrowLeft':
          this.previousImage()
          break
        case 'ArrowRight':
          this.nextImage()
          break
        case '+':
        case '=':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            this.zoomIn()
          }
          break
        case '-':
        case '_':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            this.zoomOut()
          }
          break
        case 'r':
        case 'R':
          this.resetZoom()
          break
      }
    },

    addKeyboardListeners () {
      window.addEventListener('keydown', this.handleKeyboard)
    },

    removeKeyboardListeners () {
      window.removeEventListener('keydown', this.handleKeyboard)
    }
  },

  beforeUnmount () {
    this.removeKeyboardListeners()
  }
}
</script>

<style lang="scss" scoped>
.image-gallery-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Header
.gallery-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
  color: white;
}

.gallery-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .image-counter {
    font-size: 14px;
    font-weight: 600;
    opacity: 0.9;
  }

  .image-name {
    font-size: 12px;
    opacity: 0.7;
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.gallery-controls {
  display: flex;
  align-items: center;
  gap: 8px;

  .zoom-level {
    min-width: 50px;
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    opacity: 0.9;
  }

  .control-btn {
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

// Main image area
.gallery-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  user-select: none;
}

.gallery-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.2s ease-out;
  will-change: transform;
}

.gallery-loading,
.gallery-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: white;

  p {
    margin: 0;
    font-size: 16px;
    opacity: 0.8;
  }
}

// PDF Preview
.pdf-preview {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: white;
  text-align: center;
  max-width: 500px;
  padding: 40px;

  .pdf-icon {
    animation: fadeInScale 0.3s ease-out;
  }

  .pdf-name {
    font-size: 18px;
    font-weight: 500;
    opacity: 0.9;
    margin-top: 8px;
    word-break: break-word;
  }

  .pdf-open-btn {
    min-width: 200px;
    font-size: 16px;
    padding: 12px 32px;
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Navigation
.gallery-navigation {
  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.5);
    transition: all 0.2s ease;
    z-index: 99;

    &:hover:not(.disabled) {
      background-color: rgba(0, 0, 0, 0.8);
      transform: translateY(-50%) scale(1.1);
    }

    &.nav-btn-left {
      left: 24px;
    }

    &.nav-btn-right {
      right: 24px;
    }
  }
}

// Thumbnails
.gallery-thumbnails {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.thumbnail-item {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s ease;
  opacity: 0.6;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }

  &.thumbnail-active {
    border-color: white;
    opacity: 1;
  }

  &.thumbnail-pdf {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.thumbnail-pdf-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);

  .thumbnail-pdf-label {
    font-size: 10px;
    font-weight: 600;
    color: white;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

// Responsive
@media (max-width: 768px) {
  .gallery-header {
    padding: 12px 16px;
  }

  .gallery-info .image-name {
    max-width: 150px;
  }

  .gallery-controls {
    gap: 4px;

    .zoom-level {
      display: none;
    }
  }

  .gallery-navigation .nav-btn {
    &.nav-btn-left {
      left: 8px;
    }

    &.nav-btn-right {
      right: 8px;
    }
  }

  .gallery-thumbnails {
    padding: 12px 16px;
  }

  .thumbnail-item {
    width: 60px;
    height: 60px;
  }
}
</style>
