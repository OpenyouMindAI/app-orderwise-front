<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-weight-bold">
          <q-icon name="receipt_long" size="28px" class="q-mr-sm" />
          Facturación Electrónica
        </div>
        <div class="text-caption text-grey-7">Configurá tu conexión fiscal para emitir comprobantes electrónicos</div>
      </div>
      <div class="col-auto" v-if="config.configured">
        <q-chip
          :color="config.config?.status === 'active' ? 'positive' : config.config?.status === 'error' ? 'negative' : 'warning'"
          text-color="white"
          icon="circle"
          :label="statusLabels[config.config?.status] || 'Desconocido'"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="48px" color="primary" />
    </div>

    <!-- Not Configured: Country Selector -->
    <div v-else-if="!config.configured && !selectedCountry">
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            <q-icon name="public" class="q-mr-sm" />
            Seleccioná tu país
          </div>
          <div class="row q-col-gutter-md">
            <div
              v-for="country in countries"
              :key="country.code"
              class="col-6 col-sm-4 col-md-3"
            >
              <q-card
                class="country-card cursor-pointer"
                flat bordered
                @click="selectCountry(country.code)"
              >
                <q-card-section class="text-center q-pa-md">
                  <div class="text-h4 q-mb-sm">{{ countryFlags[country.code] || '🏳️' }}</div>
                  <div class="text-subtitle2 text-weight-bold">{{ country.name }}</div>
                  <div class="text-caption text-grey-6">{{ country.tax_id_label }} · IVA {{ country.tax_rate }}%</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Configuration Form -->
    <div v-else>
      <!-- Country Header -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="row items-center">
          <div class="text-h4 q-mr-md">{{ countryFlags[selectedCountry] || '🏳️' }}</div>
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">{{ countryData?.country_name }}</div>
            <div class="text-caption text-grey-6">
              {{ countryData?.tax_id_label }} · IVA {{ countryData?.tax_rate }}%
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              icon="swap_horiz"
              color="grey-7"
              @click="changeCountry"
            >
              <q-tooltip>Cambiar país</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>

      <!-- Form Fields -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            <q-icon name="settings" class="q-mr-sm" />
            Configuración fiscal
          </div>

          <q-form @submit="saveConfig" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div
                v-for="field in countryData?.required_fields || []"
                :key="field.field"
                class="col-12 col-md-6"
              >
                <!-- Text / Number -->
                <q-input
                  v-if="['string', 'number'].includes(field.type)"
                  v-model="formData[field.field]"
                  :label="field.label + (field.required ? ' *' : '')"
                  :type="field.type === 'number' ? 'number' : 'text'"
                  :placeholder="field.placeholder"
                  :rules="field.required ? [val => !!val || 'Requerido'] : []"
                  filled
                  dense
                />

                <!-- Password -->
                <q-input
                  v-else-if="field.type === 'password'"
                  v-model="formData[field.field]"
                  :label="field.label + (field.required ? ' *' : '')"
                  :type="showPasswords[field.field] ? 'text' : 'password'"
                  :rules="field.required ? [val => !!val || 'Requerido'] : []"
                  filled
                  dense
                >
                  <template v-slot:append>
                    <q-icon
                      :name="showPasswords[field.field] ? 'visibility' : 'visibility_off'"
                      class="cursor-pointer"
                      @click="showPasswords[field.field] = !showPasswords[field.field]"
                    />
                  </template>
                </q-input>

                <!-- Select -->
                <q-select
                  v-else-if="field.type === 'select'"
                  v-model="formData[field.field]"
                  :label="field.label + (field.required ? ' *' : '')"
                  :options="field.options"
                  :rules="field.required ? [val => !!val || 'Requerido'] : []"
                  filled
                  dense
                  emit-value
                  map-options
                />

                <!-- Date -->
                <q-input
                  v-else-if="field.type === 'date'"
                  v-model="formData[field.field]"
                  :label="field.label + (field.required ? ' *' : '')"
                  type="date"
                  filled
                  dense
                />

                <!-- File -->
                <q-file
                  v-else-if="field.type === 'file'"
                  v-model="formFiles[field.field]"
                  :label="field.label + (field.required ? ' *' : '')"
                  :accept="field.accept || '*'"
                  filled
                  dense
                  counter
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
              </div>
            </div>

            <!-- Document Types -->
            <div class="q-mt-md" v-if="countryData?.document_types?.length">
              <div class="text-subtitle2 text-weight-bold q-mb-sm">
                <q-icon name="description" class="q-mr-xs" />
                Tipos de documento habilitados
              </div>
              <div class="row q-col-gutter-sm">
                <div
                  v-for="docType in countryData.document_types"
                  :key="docType.code"
                  class="col-12 col-sm-6 col-md-4"
                >
                  <q-checkbox
                    v-model="enabledDocTypes"
                    :val="docType.code"
                    :label="`${docType.name} (${docType.code})`"
                    color="primary"
                    dense
                  >
                    <q-tooltip>{{ docType.description }}</q-tooltip>
                  </q-checkbox>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="row q-gutter-md q-mt-lg">
              <q-btn
                type="submit"
                color="primary"
                icon="save"
                label="Guardar configuración"
                :loading="saving"
                unelevated
                no-caps
              />
              <q-btn
                color="info"
                icon="wifi_tethering"
                label="Probar conexión"
                :loading="testing"
                :disable="!config.configured"
                unelevated
                no-caps
                @click="testConnection"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Current Status -->
      <q-card v-if="config.configured" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            <q-icon name="info" class="q-mr-sm" />
            Estado actual
          </div>
          <q-list dense>
            <q-item>
              <q-item-section avatar><q-icon name="badge" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ countryData?.tax_id_label }}</q-item-label>
                <q-item-label caption>{{ config.config?.tax_id || 'Sin configurar' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="verified" :color="config.config?.status === 'active' ? 'positive' : 'warning'" /></q-item-section>
              <q-item-section>
                <q-item-label>Estado</q-item-label>
                <q-item-label caption>{{ statusLabels[config.config?.status] || 'Desconocido' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="cloud" :color="config.config?.environment === 'production' || config.config?.environment === 'produccion' ? 'positive' : 'orange'" /></q-item-section>
              <q-item-section>
                <q-item-label>Ambiente</q-item-label>
                <q-item-label caption>{{ config.config?.environment || 'testing' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="lock" :color="config.config?.has_certificate ? 'positive' : 'negative'" /></q-item-section>
              <q-item-section>
                <q-item-label>Certificado digital</q-item-label>
                <q-item-label caption>{{ config.config?.has_certificate ? 'Cargado ✓' : 'No cargado' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="config.config?.last_sync_at">
              <q-item-section avatar><q-icon name="sync" color="grey" /></q-item-section>
              <q-item-section>
                <q-item-label>Última sincronización</q-item-label>
                <q-item-label caption>{{ config.config.last_sync_at }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="config.config?.last_error">
              <q-item-section avatar><q-icon name="error" color="negative" /></q-item-section>
              <q-item-section>
                <q-item-label>Último error</q-item-label>
                <q-item-label caption class="text-negative">{{ config.config.last_error }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'

export default {
  name: 'FiscalConfigPage',

  data () {
    return {
      loading: true,
      saving: false,
      testing: false,
      config: { configured: false },
      countries: [],
      selectedCountry: null,
      countryData: null,
      formData: {},
      formFiles: {},
      showPasswords: {},
      enabledDocTypes: [],
      statusLabels: {
        pending: 'Pendiente',
        active: 'Activo',
        error: 'Error'
      },
      countryFlags: {
        AR: '🇦🇷', CL: '🇨🇱', PY: '🇵🇾', CO: '🇨🇴', BR: '🇧🇷',
        SV: '🇸🇻', CR: '🇨🇷', PA: '🇵🇦', PE: '🇵🇪', VE: '🇻🇪',
        MX: '🇲🇽', UY: '🇺🇾', EC: '🇪🇨', BO: '🇧🇴'
      }
    }
  },

  async created () {
    await this.loadConfig()
  },

  methods: {
    async loadConfig () {
      this.loading = true
      try {
        const { data } = await api.get('fiscal/config')
        this.config = data

        if (data.configured) {
          this.selectedCountry = data.config.country_code
          await this.loadCountryFields(this.selectedCountry)
          // Pre-fill form
          this.formData.tax_id = data.config.tax_id
          this.formData.business_name = data.config.business_name
          this.enabledDocTypes = data.config.enabled_doc_types || []
        } else {
          this.countries = data.supported_countries || []
        }
      } catch (err) {
        notify('Error al cargar configuración fiscal', 'negative', 'warning')
      } finally {
        this.loading = false
      }
    },

    async selectCountry (code) {
      this.selectedCountry = code
      await this.loadCountryFields(code)
    },

    async loadCountryFields (code) {
      try {
        const { data } = await api.get(`fiscal/config/fields/${code}`)
        this.countryData = data
        // Initialize form fields
        data.required_fields?.forEach(f => {
          if (!this.formData[f.field]) {
            this.formData[f.field] = f.type === 'select' ? (f.options?.[0] || '') : ''
          }
        })
      } catch (err) {
        notify('Error al cargar campos del país', 'negative', 'warning')
      }
    },

    changeCountry () {
      this.selectedCountry = null
      this.countryData = null
      this.formData = {}
      this.formFiles = {}
      this.enabledDocTypes = []
      if (!this.countries.length) {
        api.get('fiscal/countries').then(({ data }) => { this.countries = data })
      }
    },

    async saveConfig () {
      this.saving = true
      try {
        // Read file certificates as base64
        const settings = { ...this.formData }
        for (const [key, file] of Object.entries(this.formFiles)) {
          if (file) {
            const b64 = await this.fileToBase64(file)
            settings[key] = b64
          }
        }

        const payload = {
          country_code: this.selectedCountry,
          tax_id: settings.tax_id,
          business_name: settings.business_name,
          certificate: settings.certificate,
          certificate_pass: settings.certificate_pass,
          environment: settings.environment || 'testing',
          enabled_doc_types: this.enabledDocTypes,
          settings
        }

        const { data } = await api.post('fiscal/config', payload)

        if (data.success) {
          notify('Configuración guardada', 'positive', 'check_circle')
          await this.loadConfig()
        } else {
          notify('Error al guardar', 'negative', 'warning')
        }
      } catch (err) {
        notify(err.response?.data?.error || 'Error al guardar', 'negative', 'warning')
      } finally {
        this.saving = false
      }
    },

    async testConnection () {
      this.testing = true
      try {
        const { data } = await api.post('fiscal/test-connection')
        if (data.success) {
          notify('Conexión exitosa ✓', 'positive', 'check_circle')
        } else {
          notify(data.errors?.join(', ') || 'Error de conexión', 'negative', 'warning')
        }
      } catch (err) {
        notify('Error al probar conexión', 'negative', 'warning')
      } finally {
        this.testing = false
      }
    },

    fileToBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
      })
    }
  }
}
</script>

<style scoped>
.country-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px !important;
}
.country-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
  border-color: #6366f1 !important;
}
</style>
