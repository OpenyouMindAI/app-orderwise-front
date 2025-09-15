<template>
  <q-dialog v-model="show" :maximized="$q.screen.lt.sm" @hide="onHide">
    <q-card :style="$q.screen.lt.sm ? '' : 'width: 800px; max-width: 80vw;'">
      <q-form @submit="saveCashflow" class="column full-height">
        <q-card-section class="q-py-sm flex justify-between items-center bg-primary text-white">
          <span class="text-h6">Flujo de dinero</span>
          <q-btn flat icon="close" round size="md" v-close-popup/>
        </q-card-section>
        <q-card-section class="col q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Cards del lado izquierdo -->
            <div class="col-4">
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
            <div class="col-8">
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
                  <q-card-section class="text-center q-pa-xl q-gutter-y-md">
                    <!-- Image Preview Grid -->
                    <div class="col-12" v-if="cashflowImages.length">
                      <div class="text-subtitle2 text-primary q-mb-md">Vista Previa</div>
                      <div class="row q-col-gutter-sm scroll q-pa-sm" style="max-height: 400px;">
                        <div
                          v-for="(image, index) in cashflowImages"
                          :key="index"
                          class="col-6 col-sm-4 col-md-4"
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
                      <q-icon name="cloud_upload" size="4rem" color="grey-5" class="q-mb-md"/>
                      <div class="text-h6 text-grey-5 q-mb-md">
                        Arrastra las imágenes aquí
                      </div>
                      <div class="text-body2 text-grey-5 q-mb-md">
                        o haz clic para seleccionar archivos
                      </div>
                    </div>
                    <q-btn
                      color="primary"
                      label="Seleccionar Imágenes"
                      @click="$refs.fileInput.click()"
                      unelevated
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
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn type="submit" color="primary" label="Guardar" icon="save" :loading="loadingCashflow"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { notify } from 'src/const/mixins'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'

export default {
  name: 'CashflowModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
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
      required: true
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
  emits: ['update:modelValue', 'cashflow-saved'],
  data () {
    return {
      /**
       * Date cashflow
       * @type {String}
       */
      date: null,
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
      cashflowImages: []
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
    ...mapState(authentication, ['userSession'])
  },
  watch: {
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
            ? `${this.date} 05:00:00`
            : this.formatDateTime(this.createdAt || new Date())
        })

        await this.$api.post('cashflow', payload)

        notify('Flujo de dinero guardado exitosamente', 'positive', 'check')
        this.resetForm()
        this.show = false
        this.$emit('cashflow-saved')
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
    },

    /**
     * Handle modal hide
     */
    onHide () {
      this.resetForm()
    }
  }
}
</script>

<style scoped>
.dropzone-card {
  border: 2px dashed #ccc;
  transition: border-color 0.3s ease;
}

.dropzone-active {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}

.image-preview-card {
  position: relative;
}
</style>
