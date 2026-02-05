<template>
  <q-dialog v-model="show" @hide="onHide">
    <q-card :style="$q.screen.lt.sm ? 'min-width: 90vw;' : 'width: 800px; max-width: 80vw;'">
      <q-form @submit="saveCashflow" class="column">
        <!-- Header -->
        <q-card-section class="q-py-sm flex justify-between items-center bg-primary text-white">
          <div class="row items-center q-gutter-sm">
            <q-btn
              v-if="$q.screen.lt.sm && currentStep > 1"
              flat
              icon="arrow_back"
              round
              size="sm"
              @click="previousStep"
            />
            <span class="text-h6">Flujo de dinero</span>
          </div>
          <q-btn flat icon="close" round size="md" v-close-popup/>
        </q-card-section>

        <!-- Progress indicator (mobile only) -->
        <q-linear-progress
          v-if="$q.screen.lt.sm"
          :value="stepProgress"
          color="primary"
          size="4px"
          class="q-mt-none"
        />

        <q-card-section class="col q-pa-md" :style="$q.screen.lt.sm && currentStep >= 3 ? 'padding-bottom: 80px;' : ''">
          <!-- Mobile: Step by step wizard -->
          <div v-if="$q.screen.lt.sm" class="mobile-wizard">
            <transition
              :name="transitionName"
              mode="out-in"
            >
              <!-- Step 1: Tipo de Flujo -->
              <div v-if="currentStep === 1" key="step1" class="wizard-step">
                <div class="step-header q-mb-lg">
                  <div class="text-h5 text-weight-bold text-primary">Tipo de Flujo</div>
                  <div class="text-caption text-grey-7">Paso 1 de 4</div>
                </div>
                <div class="column q-gutter-md">
                  <q-card
                    v-for="option in flowTypeOptions"
                    :key="option.value"
                    flat
                    bordered
                    class="flow-option-card"
                    :class="{ 'selected': panel === option.value }"
                    @click="selectFlowType(option.value)"
                  >
                    <q-card-section class="row items-center q-pa-md">
                      <q-icon
                        :name="getFlowIcon(option.value)"
                        size="md"
                        :color="panel === option.value ? 'primary' : 'grey-6'"
                        class="q-mr-md"
                      />
                      <div class="col">
                        <div class="text-subtitle1 text-weight-medium">{{ option.label }}</div>
                      </div>
                      <q-icon
                        v-if="panel === option.value"
                        name="check_circle"
                        color="primary"
                        size="sm"
                      />
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Step 2: Método de Pago -->
              <div v-else-if="currentStep === 2" key="step2" class="wizard-step">
                <div class="step-header q-mb-lg">
                  <div class="text-h5 text-weight-bold text-primary">Método de Pago</div>
                  <div class="text-caption text-grey-7">Paso 2 de 4</div>
                </div>
                <div class="column q-gutter-md">
                  <q-card
                    v-for="method in paymentMethods"
                    :key="method.id"
                    flat
                    bordered
                    class="flow-option-card"
                    :class="{ 'selected': paymentMethodCashFlow === method.id }"
                    @click="selectPaymentMethod(method.id)"
                  >
                    <q-card-section class="row items-center q-pa-md">
                      <q-icon
                        :name="getPaymentIcon(method.name)"
                        size="md"
                        :color="paymentMethodCashFlow === method.id ? 'primary' : 'grey-6'"
                        class="q-mr-md"
                      />
                      <div class="col">
                        <div class="text-subtitle1 text-weight-medium">{{ method.name }}</div>
                      </div>
                      <q-icon
                        v-if="paymentMethodCashFlow === method.id"
                        name="check_circle"
                        color="primary"
                        size="sm"
                      />
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Step 3: Monto y Detalles -->
              <div v-else-if="currentStep === 3" key="step3" class="wizard-step">
                <div class="step-header q-mb-lg">
                  <div class="text-h5 text-weight-bold text-primary">Detalles</div>
                  <div class="text-caption text-grey-7">Paso 3 de 4</div>
                </div>
                <div class="column q-gutter-md">
                  <q-input
                    v-model="amount"
                    color="primary"
                    label="Monto *"
                    filled
                    clearable
                    type="number"
                    required
                    autofocus
                    prefix="$"
                    input-class="text-h6 text-weight-bold"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_money" />
                    </template>
                  </q-input>
                  <q-input
                    v-if="userSession.is_root || userSession.is_super_admin"
                    v-model="date"
                    color="primary"
                    label="Fecha"
                    filled
                    clearable
                    type="date"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                  <q-input
                    v-model="description"
                    color="primary"
                    label="Descripción *"
                    filled
                    clearable
                    type="textarea"
                    autogrow
                    required
                    rows="3"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Step 4: Comprobante -->
              <div v-else-if="currentStep === 4" key="step4" class="wizard-step">
                <div class="step-header q-mb-lg">
                  <div class="text-h5 text-weight-bold text-primary">Comprobante</div>
                  <div class="text-caption text-grey-7">Paso 4 de 4 (Opcional)</div>
                </div>
                <q-card flat bordered class="dropzone-card-mobile">
                  <q-card-section class="text-center q-pa-md">
                    <!-- Image Preview Grid -->
                    <div v-if="cashflowImages.length">
                      <div class="text-subtitle2 text-primary q-mb-md">Imágenes ({{ cashflowImages.length }})</div>
                      <div class="row q-col-gutter-sm scroll q-pa-sm" style="max-height: 300px;">
                        <div
                          v-for="(image, index) in cashflowImages"
                          :key="index"
                          class="col-6"
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
                                  round
                                  color="negative"
                                  @click="deleteImage(image, index)"
                                />
                              </div>
                            </q-img>
                          </q-card>
                        </div>
                      </div>
                    </div>
                    <div v-else class="dropzone-content q-py-xl">
                      <q-icon name="add_photo_alternate" size="4rem" color="grey-5" class="q-mb-md"/>
                      <div class="text-subtitle1 text-grey-7 q-mb-sm">
                        Agregar comprobante
                      </div>
                      <div class="text-caption text-grey-6">
                        (Opcional)
                      </div>
                    </div>
                    <q-btn
                      color="primary"
                      label="Agregar Imagen"
                      icon="add_photo_alternate"
                      @click="openImagePicker"
                      unelevated
                      class="full-width q-mt-md"
                    />
                    <input
                      ref="fileInput"
                      type="file"
                      multiple
                      accept="image/*"
                      style="display: none"
                      @change="handleFileSelect"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </transition>
          </div>

          <!-- Desktop: Original layout -->
          <div v-else class="row q-col-gutter-md">
            <!-- Cards del lado izquierdo -->
            <div class="col-12 col-sm-4">
              <!-- Card para Tipo de Flujo -->
              <q-card bordered flat class="q-pa-md q-mb-md" v-if="flowTypeOptions.length > 1">
                <div class="text-h6 text-primary q-mb-sm">Tipo de Flujo</div>
                <div class="column q-gutter-xs">
                  <q-radio
                    v-for="option in flowTypeOptions"
                    :key="option.value"
                    color="primary"
                    v-model="panel"
                    :label="option.label"
                    :val="option.value"
                  />
                </div>
              </q-card>

              <!-- Card para Métodos de Pago -->
              <q-card bordered flat class="q-pa-md">
                <div class="text-h6 text-primary q-mb-sm">Método de Pago</div>
                <div class="column q-gutter-xs">
                  <q-radio
                    v-for="paymentMethod in paymentMethods"
                    :key="paymentMethod.id"
                    color="primary"
                    v-model="paymentMethodCashFlow"
                    :label="paymentMethod.name"
                    :val="paymentMethod.id"
                  />
                </div>
              </q-card>
            </div>

            <!-- Inputs del lado derecho -->
            <div class="col-12 col-sm-8">
              <div class="column q-gutter-md">
                <q-input
                  name="amount"
                  autocomplete="amount"
                  v-model="amount"
                  color="primary"
                  label="Monto"
                  filled
                  clearable
                  type="amount"
                  required
                  autofocus
                />
                <q-input
                  v-if="userSession.is_root || userSession.is_super_admin"
                  name="created_at"
                  autocomplete="created_at"
                  v-model="date"
                  color="primary"
                  label="Fecha"
                  filled
                  clearable
                  type="date"
                  required
                  autofocus
                />
                <q-input
                  name="description"
                  autocomplete="description"
                  v-model="description"
                  color="primary"
                  label="Descripción"
                  filled
                  clearable
                  type="textarea"
                  autogrow
                  required
                />
                <q-card
                  flat
                  bordered
                  class="dropzone-card"
                  :class="{ 'dropzone-active': isDragOver }"
                  @dragover.prevent="isDragOver = true"
                  @dragleave.prevent="isDragOver = false"
                  @drop.prevent="handleDrop"
                >
                  <q-card-section :class="$q.screen.lt.sm ? 'text-center q-pa-md' : 'text-center q-pa-xl q-gutter-y-md'">
                    <!-- Image Preview Grid -->
                    <div class="col-12" v-if="cashflowImages.length">
                      <div class="text-subtitle2 text-primary q-mb-md">Vista Previa</div>
                      <div class="row q-col-gutter-sm scroll q-pa-sm" :style="$q.screen.lt.sm ? 'max-height: 300px;' : 'max-height: 400px;'">
                        <div
                          v-for="(image, index) in cashflowImages"
                          :key="index"
                          :class="$q.screen.lt.sm ? 'col-6' : 'col-6 col-sm-4 col-md-4'"
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
                                  round
                                  color="negative"
                                  @click="deleteImage(image, index)"
                                />
                              </div>
                            </q-img>
                          </q-card>
                        </div>
                      </div>
                    </div>
                    <div v-else class="dropzone-content">
                      <q-icon name="cloud_upload" :size="$q.screen.lt.sm ? '3rem' : '4rem'" color="grey-5" class="q-mb-md"/>
                      <div :class="$q.screen.lt.sm ? 'text-subtitle1 text-grey-5 q-mb-sm' : 'text-h6 text-grey-5 q-mb-md'">
                        {{ $q.screen.lt.sm ? 'Agregar comprobante' : 'Arrastra las imágenes aquí' }}
                      </div>
                      <div v-if="!$q.screen.lt.sm" class="text-body2 text-grey-5 q-mb-md">
                        o haz clic para seleccionar archivos
                      </div>
                    </div>

                    <!-- Botón único para agregar imágenes -->
                    <div class="row q-gutter-sm justify-center">
                      <q-btn
                        color="primary"
                        :label="$q.screen.lt.sm ? 'Agregar Imagen' : 'Seleccionar Imágenes'"
                        icon="add_photo_alternate"
                        @click="openImagePicker"
                        :unelevated="$q.screen.lt.sm"
                        :class="$q.screen.lt.sm ? 'full-width' : ''"
                      />
                    </div>

                    <!-- Input oculto para fallback web -->
                    <input
                      ref="fileInput"
                      type="file"
                      multiple
                      accept="image/*"
                      style="display: none"
                      @change="handleFileSelect"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Footer Actions (solo para pasos 3 y 4) -->
        <q-card-actions v-if="$q.screen.lt.sm && currentStep >= 3" align="between" class="q-pa-xs mobile-footer">
          <q-space v-if="currentStep === 4" />
          <q-btn
            v-if="currentStep === 3"
            color="primary"
            label="Continuar"
            icon-right="arrow_forward"
            @click="nextStep"
            :disable="!canProceed"
            unelevated
            class="full-width"
          />
          <q-btn
            v-if="currentStep === 4"
            type="submit"
            color="primary"
            label="Guardar"
            icon="save"
            :loading="loadingCashflow"
            unelevated
          />
        </q-card-actions>
        <q-card-actions v-if="!$q.screen.lt.sm" align="right">
          <q-btn type="submit" color="primary" label="Guardar" icon="save" :loading="loadingCashflow"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { formatDate, notify } from 'src/const/mixins'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export default {
  name: 'CashflowModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: Number,
      default: null
    },
    paymentMethods: {
      type: Array,
      required: true
    },
    cashBoxState: {
      type: Object,
      default: null
    },
    branchOffice: {
      type: Object,
      required: false,
      default: null
    },
    flowType: {
      type: String,
      default: 'debit'
    },
    descriptionValue: {
      type: String,
      default: ''
    },
    flowTypeOptions: {
      type: Array,
      default: () => [
        { label: 'Entrada', value: 'debit' },
        { label: 'Salida', value: 'credit' },
        { label: 'Arqueo', value: 'withdrawal' }
      ]
    },
    createdAt: {
      type: String,
      default: null
    }
  },
  emits: ['update:modelValue'],
  data () {
    return {
      /**
       * Date cashflow
       * @type {String}
       */
      date: formatDate(new Date(), 'YYYY/MM/DD'),
      /**
       * Panel
       * @type {String}
       */
      panel: 'debit',
      /**
       * Amount
       * @type {Number}
       */
      amount: null,
      /**
       * Loading cashflow
       * @type {Boolean}
       */
      loadingCashflow: false,
      /**
       * Description cashflow
       * @type {String}
       */
      description: '',
      /**
       * Payment method cash flow
       * @type {Object}
       */
      paymentMethodCashFlow: null,
      /**
       * Drag over state
       * @type {Boolean}
       */
      isDragOver: false,
      /**
       * Cash flow images
       * @type {Array}
       */
      cashflowImages: [],
      /**
       * Current step for mobile wizard
       * @type {Number}
       */
      currentStep: 1,
      /**
       * Transition name for animations
       * @type {String}
       */
      transitionName: 'slide-left'
    }
  },
  computed: {
    show: {
      get () {
        return this.modelValue
      },
      set (value) {
        this.$emit('update:modelValue', value)
      }
    },
    ...mapState(authentication, ['userSession']),
    /**
     * Calculate step progress
     * @returns {Number}
     */
    stepProgress () {
      return this.currentStep / 4
    },
    /**
     * Check if can proceed to next step
     * @returns {Boolean}
     */
    canProceed () {
      switch (this.currentStep) {
        case 1:
          return !!this.panel
        case 2:
          return !!this.paymentMethodCashFlow
        case 3:
          return !!this.amount && !!this.description
        case 4:
          return true
        default:
          return false
      }
    },
    /**
     * Check if can skip current step
     * @returns {Boolean}
     */
    canSkipStep () {
      return this.currentStep === 4 // Solo se puede omitir el paso de imágenes
    }
  },
  watch: {
    paymentMethod: {
      handler (newPaymentMethod) {
        this.paymentMethodCashFlow = newPaymentMethod
      },
      immediate: true
    },
    cashBoxState: {
      handler (newCashboxUser) {
        if (newCashboxUser) {
          this.cashboxUser = newCashboxUser
        }
      },
      immediate: true
    },
    descriptionValue: {
      handler (newDescription) {
        this.description = newDescription
      },
      immediate: true
    },
    createdAt: {
      handler (newCreatedAt) {
        this.date = formatDate(newCreatedAt, 'YYYY-MM-DD')
      },
      immediate: true
    },
    flowTypeOptions: {
      handler (newOptions) {
        if (newOptions.length === 1) {
          this.panel = newOptions[0].value
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * Format date time
     * @param {String} dateStr date string
     * @returns {String} date string
     */
    formatDateTime (dateStr) {
      if (!dateStr) return null
      const date = new Date(dateStr)
      return date.toISOString().slice(0, 19).replace('T', ' ')
    },
    /**
     * Save cashflow
     */
    async saveCashflow () {
      try {
        if (!this.paymentMethodCashFlow) {
          notify('Debe seleccionar un método de pago', 'negative', 'warning')
          return
        }
        this.loadingCashflow = true
        const payload = this.modelData({
          description: this.description,
          amount: this.amount,
          branch_office_id: this.branchOffice?.id,
          type_cashflow: this.panel,
          cashbox_user_id: this.cashBoxState?.id,
          payment_method_id: this.paymentMethodCashFlow,
          images: this.cashflowImages,
          created_at: this.date
            ? `${this.date} ${formatDate(new Date(), 'HH:mm:ss')}`
            : formatDate(this.createdAt || new Date(), 'YYYY-MM-DD HH:mm:ss')
        })

        await this.$api.post('cashflow', payload)

        notify('Flujo de dinero guardado exitosamente', 'positive', 'check')
        this.resetForm()
        this.show = false
      } catch (error) {
        console.error('Error saving cashflow:', error)
        notify('Error al guardar el flujo de dinero', 'negative', 'error')
      } finally {
        this.loadingCashflow = false
      }
    },

    /**
     * Delete image
     * @param {Object} image data image
     * @param {Number} index index image
     */
    deleteImage (image, index) {
      if (image.id) {
        this.$api.delete(`product-images/${image.id}`)
          .then(({ data }) => {
            if (data.success) {
              notify('Imagen eliminada exitosamente', 'positive', 'check')
            } else {
              notify('No se pudo eliminar la imagen', 'negative', 'warning')
            }
          })
          .catch((error) => {
            console.error('Error deleting image:', error)
            notify('Error al eliminar la imagen', 'negative', 'error')
          })
      } else {
        this.cashflowImages.splice(index, 1)
      }
    },

    /**
     * Handle drop event
     */
    handleDrop (event) {
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.processFiles(files)
    },

    /**
     * Handle file select event
     */
    handleFileSelect (event) {
      const files = Array.from(event.target.files)
      this.processFiles(files)
      // Limpiar el input para permitir seleccionar la misma imagen nuevamente
      event.target.value = ''
    },

    /**
     * Open image picker with options (Camera or Gallery)
     */
    async openImagePicker () {
      // Si es dispositivo móvil con Capacitor, mostrar opciones
      if (this.$q.platform.is.capacitor || this.$q.platform.is.nativeMobile) {
        try {
          // Mostrar diálogo de opciones
          this.$q.dialog({
            title: 'Agregar Imagen',
            message: '¿Cómo deseas agregar la imagen?',
            options: {
              type: 'radio',
              model: 'camera',
              items: [
                { label: 'Tomar Foto', value: 'camera', icon: 'photo_camera', color: 'primary' },
                { label: 'Seleccionar de Galería', value: 'gallery', icon: 'photo_library', color: 'secondary' }
              ]
            },
            cancel: {
              label: 'Cancelar',
              color: 'grey',
              flat: true
            },
            ok: {
              label: 'Continuar',
              color: 'primary'
            }
          }).onOk(async (source) => {
            await this.captureImage(source)
          })
        } catch (error) {
          console.error('Error opening image picker:', error)
          // Fallback a input file
          this.$refs.fileInput.click()
        }
      } else {
        // En web, usar input file tradicional
        this.$refs.fileInput.click()
      }
    },

    /**
     * Capture image using Capacitor Camera
     * @param {String} source - 'camera' or 'gallery'
     */
    async captureImage (source) {
      try {
        const cameraSource = source === 'camera' ? CameraSource.Camera : CameraSource.Photos

        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: cameraSource,
          width: 1920,
          height: 1920,
          preserveAspectRatio: true
        })

        // Convertir DataUrl a File
        const blob = await this.dataUrlToBlob(image.dataUrl)
        const fileName = `cashflow_${Date.now()}.${image.format || 'jpg'}`
        const file = new File([blob], fileName, { type: `image/${image.format || 'jpeg'}` })

        // Agregar a la lista de imágenes
        this.cashflowImages.push({
          image: file,
          url: image.dataUrl
        })

        notify('Imagen agregada exitosamente', 'positive', 'check')
      } catch (error) {
        if (error.message !== 'User cancelled photos app') {
          console.error('Error capturing image:', error)
          notify('Error al capturar la imagen', 'negative', 'warning')
        }
      }
    },

    /**
     * Convert DataUrl to Blob
     * @param {String} dataUrl
     * @returns {Promise<Blob>}
     */
    async dataUrlToBlob (dataUrl) {
      const response = await fetch(dataUrl)
      return response.blob()
    },

    /**
     * Process files
     */
    processFiles (files) {
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.cashflowImages.push({
              image: file,
              url: e.target.result
            })
          }
          reader.readAsDataURL(file)
        }
      })
    },

    /**
     * Model data helper
     */
    modelData (data, put = false) {
      const formData = new FormData()
      if (put) {
        formData.append('_method', 'put')
      }
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key]
          if (typeof element !== 'object' && element) {
            formData.append(key, element)
          }
        }
      }

      data.images.forEach((element, index) => {
        formData.append(`images[${index}]`, element.image)
      })

      return formData
    },

    /**
     * Reset form
     */
    resetForm () {
      this.panel = 'debit'
      this.amount = null
      this.description = ''
      this.paymentMethodCashFlow = null
      this.cashflowImages = []
      this.isDragOver = false
      this.currentStep = 1
      this.transitionName = 'slide-left'
    },

    /**
     * Handle modal hide
     */
    onHide () {
      this.resetForm()
    },

    /**
     * Select flow type and advance
     * @param {String} type
     */
    selectFlowType (type) {
      this.panel = type
      setTimeout(() => {
        this.nextStep()
      }, 300)
    },

    /**
     * Select payment method and advance
     * @param {Number} methodId
     */
    selectPaymentMethod (methodId) {
      this.paymentMethodCashFlow = methodId
      setTimeout(() => {
        this.nextStep()
      }, 300)
    },

    /**
     * Go to next step
     */
    nextStep () {
      if (this.currentStep < 4 && this.canProceed) {
        this.transitionName = 'slide-left'
        this.currentStep++
      } else if (this.currentStep === 4 && this.canSkipStep) {
        this.currentStep++
      }
    },

    /**
     * Go to previous step
     */
    previousStep () {
      if (this.currentStep > 1) {
        this.transitionName = 'slide-right'
        this.currentStep--
      }
    },

    /**
     * Get flow type icon
     * @param {String} type
     * @returns {String}
     */
    getFlowIcon (type) {
      switch (type) {
        case 'debit':
          return 'arrow_downward'
        case 'credit':
          return 'arrow_upward'
        case 'withdrawal':
          return 'account_balance'
        default:
          return 'attach_money'
      }
    },

    /**
     * Get payment method icon
     * @param {String} name
     * @returns {String}
     */
    getPaymentIcon (name) {
      const nameLower = name.toLowerCase()
      if (nameLower.includes('efectivo') || nameLower.includes('cash')) {
        return 'payments'
      } else if (nameLower.includes('tarjeta') || nameLower.includes('card')) {
        return 'credit_card'
      } else if (nameLower.includes('transferencia') || nameLower.includes('transfer')) {
        return 'account_balance'
      } else if (nameLower.includes('cheque') || nameLower.includes('check')) {
        return 'receipt'
      } else {
        return 'payment'
      }
    }
  }
}
</script>

<style scoped>
/* Dropzone styles */
.dropzone-card {
  border: 2px dashed #ccc;
  transition: border-color 0.3s ease;
}

.dropzone-active {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}

.dropzone-card-mobile {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.image-preview-card {
  position: relative;
}

/* Mobile wizard styles */
.mobile-wizard {
  min-height: 400px;
  position: relative;
  overflow-y: auto;
}

.wizard-step {
  width: 100%;
}

.step-header {
  text-align: center;
}

/* Flow option cards */
.flow-option-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid #e0e0e0;
  border-radius: 12px;
}

.flow-option-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.flow-option-card.selected {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

.flow-option-card:active {
  transform: scale(0.98);
}

/* Slide animations */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Fade animation for step content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
