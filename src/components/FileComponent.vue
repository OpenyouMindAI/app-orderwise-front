<template>
  <div>
    <div
      class="image-gallery__blinder bg-grey-8"
      :class="indexZoomed !== void 0 ? 'image-gallery__blinder--active' : void 0"
      @click="zoomImage()"
    />
    <div class="flex flex-wrap justify-start items-center full-width q-gutter-y-sm">
      <div v-for="(f, index) in fileAll" :key="index">
        <q-card v-if="f.type === 'application/pdf'" class="my-card" style="width: 310px" @click="openPdf(f)">
          <q-img src="image/pdf.png" :style="imageStyle">
            <div class="absolute-full text-h6 text-bold flex flex-center">
              {{ f.type }}
            </div>
            <q-btn
              v-if="!onlyView"
              class="all-pointer-events absolute material-symbols-outlined"
              icon="delete"
              color="negative"
              style="top: 2px; right: 1px"
              push
              dense
              round
              @click.prevent.stop="alertDialogFile(index, f)"
            >
              <q-tooltip>Eliminar documento</q-tooltip>
            </q-btn>
          </q-img>
        </q-card>
        <q-img
          v-else
          :ref="
            (el) => {
              thumbRef[index] = el
            }
          "
          style="width: 210px; height: 150px; margin-top: 10px"
          class="q-ml-xs image-gallery__image"
          :style="imageStyle"
          :src="f[nameImage]"
          @click="zoomImage(index)"
        >
          <div class="absolute-full text-h5 text-bold flex flex-center">
            {{ f.label }}
          </div>
          <q-btn
            v-if="!onlyView"
            class="all-pointer-events absolute material-symbols-outlined"
            icon="delete"
            color="negative"
            style="top: 2px; right: 1px"
            push
            dense
            round
            @click.prevent.stop="alertDialogFile(index, f)"
          >
            <q-tooltip>Eliminar documento</q-tooltip>
          </q-btn>
        </q-img>
      </div>
    </div>
    <q-img
      ref="fullRef"
      v-touch-pan.prevent.mouse="moveFab"
      class="image-gallery__image image-gallery__image-full fixed-center"
      :class="indexZoomed !== void 0 ? 'image-gallery__image-full--active' : void 0"
      :src="fileAll[indexZoomed] && fileAll[indexZoomed][nameImage]"
      :style="`left: ${fabPos.clientX}px; top: ${fabPos.clientY}px;`"
      @load="fileLoadedResolve"
      @error="imgLoadedReject"
      @click="zoomImage()"
    />
    <q-dialog v-model="pdfModel">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="q-pa-none">
          <iframe
            v-if="file"
            id="pdf"
            title="pdf"
            style="width: 100%; height: 90vh"
            type="application/pdf"
            :src="file[nameImage]"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="deleteConfirm">
      <q-card style="width: 400px; max-width: 80vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Confirmación</div>
        </q-card-section>

        <q-card-section class="text-subtitle1">¿Desea eliminar este archivo?</q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" color="negative" @click="deleteConfirm = false" />
          <q-btn label="Aceptar" color="primary" :loading="loadingDelete" @click="deleteFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onBeforeUpdate, watch, computed } from 'vue'
import { morph } from 'quasar'

export default {
  props: {
    nameImage: {
      type: String,
      default: 'url',
      required: false
    },
    imageStyle: {
      type: String,
      default: 'max-height: 150px; max-width: 300px;'
    },
    /**
     * Files all
     * @type {Array}
     */
    files: {
      type: Array,
      required: true
    },
    /**
     * Only view
     * @type {Boolean}
     */
    onlyView: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:files', 'delete:files'],
  setup (props, { emit }) {
    /**
     * Thumb reference
     * @type {Array}
     */
    const thumbRef = ref([])
    /**
     * Deleted files
     * @type {Array}
     */
    const deletedFiles = ref([])
    /**
     * Full reference
     * @type {Object}
     */
    const fullRef = ref(null)
    /**
     * Delete confirm
     * @type {Boolean}
     */
    const deleteConfirm = ref(false)
    /**
     * Loading delete
     * @type {Boolean}
     */
    const loadingDelete = ref(false)
    /**
     * File all
     * @type {Array}
     */
    const fileAll = computed(() => props.files)
    /**
     * File
     * @type {Object}
     */
    const file = ref(null)
    /**
     * Pdf model
     * @type {Boolean}
     */
    const pdfModel = ref(false)
    /**
     * Fab position
     * @type {Object}
     */
    const fabPos = ref({})
    /**
     * Index zoomed
     * @type {Number}
     */
    const indexZoomed = ref(void 0)
    /**
     * Watch files
     * @param {Array} data data to watch
     */
    watch(props.files, (data) => {
      emit('update:files', data)
    })
    /**
     * Watch deleted files
     * @param {Array} data data to watch
     */
    watch(deletedFiles.value, (data) => {
      emit('delete:files', data)
    })
    /**
     * Open pdf
     * @param {Object} data data to open pdf
     */
    function openPdf (data) {
      file.value = data
      pdfModel.value = true
    }
    /**
     * File loaded
     * @type {Object}
     */
    const fileLoaded = {
      promise: Promise.resolve(),
      resolve: () => {},
      reject: () => {}
    }
    /**
     * Move fab
     * @param {Object} ev event
     */
    const moveFab = (ev) => {
      fabPos.value = ev.evt
    }
    /**
     * File loaded resolve
     */
    function fileLoadedResolve () {
      fileLoaded.resolve()
    }
    /**
     * Img loaded reject
     */
    function imgLoadedReject () {
      fileLoaded.reject()
    }
    /**
     * Delete file
     */
    async function deleteFile () {
      try {
        loadingDelete.value = true
        setTimeout(() => {
          fileAll.value.splice(file.value.index, 1)
          if (file.value?.id) {
            deletedFiles.value.push(file.value.id)
          }
          deleteConfirm.value = false
          loadingDelete.value = false
        }, 500)
      } catch (error) {
        console.log(error)
      }
    }
    /**
     * Delete image material
     * @param {Number} index index the array image
     */
    async function alertDialogFile (index, data) {
      deleteConfirm.value = true
      file.value = {
        index,
        ...data
      }
    }
    /**
     * Zoom image
     * @param {Number} index index the array image
     */
    function zoomImage (index) {
      const indexZoomedState = indexZoomed.value
      let cancel = void 0

      fileLoaded.reject()

      const zoom = () => {
        if (index !== void 0 && index !== indexZoomedState) {
          fileLoaded.promise = new Promise((resolve, reject) => {
            fileLoaded.resolve = () => {
              fileLoaded.resolve = () => {}
              fileLoaded.reject = () => {}

              resolve()
            }
            fileLoaded.reject = () => {
              fileLoaded.resolve = () => {}
              fileLoaded.reject = () => {}

              reject()
            }
          })

          cancel = morph({
            from: thumbRef.value[index].$el,
            to: fullRef.value.$el,
            onToggle: () => {
              indexZoomed.value = index
            },
            waitFor: fileLoaded.promise,
            duration: 400,
            hideFromClone: true,
            onEnd: (end) => {
              if (end === 'from' && indexZoomed.value === index) {
                indexZoomed.value = void 0
              }
            }
          })
        }
      }

      if (indexZoomedState !== void 0 && (cancel === void 0 || cancel() === false)) {
        morph({
          from: fullRef.value.$el,
          to: thumbRef.value[indexZoomedState].$el,
          onToggle: () => {
            indexZoomed.value = void 0
          },
          duration: 200,
          keepToClone: true,
          onEnd: zoom
        })
      } else {
        zoom()
      }
    }
    /**
     * On resize
     * @param {Object} el element
     */
    function onResize ({ width, height }, el) {
      console.log(el)
    }
    // Make sure to reset the dynamic refs before each update.
    onBeforeUpdate(() => {
      thumbRef.value = []
    })

    return {
      fabPos,
      onResize,
      thumbRef,
      fullRef,
      indexZoomed,
      file,
      fileAll,
      pdfModel,
      deleteConfirm,
      loadingDelete,
      moveFab,
      zoomImage,
      openPdf,
      deleteFile,
      fileLoadedResolve,
      alertDialogFile,
      imgLoadedReject
    }
  }
}
</script>

<style lang="sass">
.image-gallery
  &__image
    border-radius: 3%/3%
    cursor: pointer

    &-full
      width: 800px
      max-width: 70vw
      z-index: 2002
      pointer-events: none

      &--active
        pointer-events: all
  &__blinder
    opacity: 0
    z-index: 2000
    pointer-events: none
    transition: opacity 0.3s ease-in-out

    &--active
      opacity: 0.6
      pointer-events: all

      + div > .image-gallery__image
        z-index: 2001
</style>
