<template>
  <q-dialog v-model="showDialog" @hide="onHide">
    <q-card class="arca-dialog">
      <!-- Header con logo -->
      <q-card-section class="arca-header" :style="{ background: integration?.color || 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)' }">
        <div class="header-content">
          <q-img
            v-if="integration?.logo_url"
            :src="integration.logo_url"
            class="arca-logo"
            :alt="integration.name"
          />
          <div v-else class="logo-placeholder">
            <q-icon name="extension" size="48px" color="white" />
          </div>
        </div>
      </q-card-section>

      <!-- Formulario de credenciales -->
      <q-card-section v-if="!downloadData" class="form-section">
        <div class="text-h6 text-center q-mb-md text-grey-8">
          Configurar {{ integration?.name || 'Integración' }}
        </div>
        <p class="text-body2 text-center text-grey-6 q-mb-lg">
          {{ integration?.description || 'Ingresa tus credenciales para conectar esta integración' }}
        </p>

        <q-form @submit="handleGenerate" class="q-gutter-md">
          <div
            v-for="field in integration?.fields"
            :key="field.name"
          >
            <q-input
              v-model="configForm[field.name]"
              :label="field.label"
              :type="field.type === 'password' ? (showPasswords[field.name] ? 'text' : 'password') : field.type"
              :placeholder="field.placeholder"
              :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
              filled
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon
                  :name="getFieldIcon(field.type)"
                  color="grey-6"
                />
              </template>
              <template v-if="field.type === 'password'" v-slot:append>
                <q-icon
                  :name="showPasswords[field.name] ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-6"
                  @click="togglePasswordVisibility(field.name)"
                />
              </template>
            </q-input>
          </div>

          <div class="text-caption text-grey-6 q-mt-md text-center">
            <q-icon name="lock" size="16px" class="q-mr-xs" />
            Tus credenciales se almacenan de forma segura y encriptada
          </div>
        </q-form>
      </q-card-section>

      <!-- Pantalla de éxito -->
      <q-card-section v-else class="success-section">
        <div class="success-content">
          <div class="success-icon-wrapper">
            <q-icon
              name="check_circle"
              class="success-icon"
              color="positive"
            />
          </div>

          <div class="text-h6 text-grey-8 q-mb-sm">
            ¡Certificado generado exitosamente!
          </div>

          <p class="text-body2 text-grey-6 q-mb-lg">
            Tu certificado fue creado y autorizado correctamente por AFIP
          </p>

          <div class="download-buttons">
            <q-btn
              :href="downloadData.certificate_url"
              target="_blank"
              unelevated
              color="primary"
              icon="download"
              label="Descargar certificado"
              class="full-width q-mb-sm"
            />
            <q-btn
              :href="downloadData.key_url"
              target="_blank"
              unelevated
              color="secondary"
              icon="vpn_key"
              label="Descargar clave privada"
              class="full-width"
            />
          </div>

          <div class="text-caption text-grey-6 q-mt-md text-center">
            <q-icon name="security" size="16px" class="q-mr-xs" />
            Guarda estos archivos en un lugar seguro
          </div>
        </div>
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions v-if="!downloadData" align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          v-close-popup
          class="q-px-lg"
        />
        <q-btn
          unelevated
          :label="integration?.slug === 'arca' ? 'Generar certificado' : 'Guardar'"
          color="primary"
          @click="handleGenerate"
          :loading="loading"
          :disable="!isFormValid"
          class="q-px-lg"
        />
      </q-card-actions>

      <q-card-actions v-else align="center" class="q-pa-md">
        <q-btn
          unelevated
          label="Cerrar"
          color="primary"
          v-close-popup
          class="q-px-xl"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from 'boot/axios'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  download: {
    type: Object,
    default: null
  },
  integrationSlug: {
    type: String,
    default: 'arca'
  }
})

const emit = defineEmits(['update:modelValue', 'generate'])

const showDialog = ref(props.modelValue)
const integration = ref(null)
const configForm = ref({})
const showPasswords = ref({})
const loading = ref(false)
const downloadData = ref(props.download)

const isFormValid = computed(() => {
  if (!integration.value?.fields) return false

  return integration.value.fields
    .filter(f => f.required)
    .every(f => configForm.value[f.name])
})

const getFieldIcon = (type) => {
  const icons = {
    text: 'text_fields',
    password: 'lock',
    email: 'email',
    url: 'link',
    number: 'numbers'
  }
  return icons[type] || 'text_fields'
}

const togglePasswordVisibility = (fieldName) => {
  showPasswords.value[fieldName] = !showPasswords.value[fieldName]
}

const loadIntegration = async () => {
  try {
    const { data } = await api.get('company-integrations/available')
    integration.value = data.find(i => i.slug === props.integrationSlug)

    if (integration.value) {
      // Initialize form with empty values
      integration.value.fields?.forEach(field => {
        configForm.value[field.name] = ''
      })
    }
  } catch (error) {
    console.error('Error loading integration:', error)
  }
}

watch(() => props.modelValue, (newVal) => {
  showDialog.value = newVal
  // Load integration when dialog opens
  if (newVal && !integration.value) {
    loadIntegration()
  }
})

watch(() => props.download, (newVal) => {
  downloadData.value = newVal
})

watch(showDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleGenerate = () => {
  emit('generate', configForm.value)
}

const onHide = () => {
  configForm.value = {}
  showPasswords.value = {}
  downloadData.value = null
}
</script>

<style scoped lang="scss">
.arca-dialog {
  width: 550px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.arca-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
  padding: 40px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.arca-logo {
  width: 400px;
  max-width: 70vw;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.logo-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-section {
  padding: 32px 24px;
}

.info-banner {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background: rgba(25, 118, 210, 0.08);
  border-left: 3px solid #1976d2;
  border-radius: 8px;
}

.success-section {
  padding: 48px 24px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.success-icon-wrapper {
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out;
}

.success-icon {
  font-size: 120px;
  filter: drop-shadow(0 4px 12px rgba(33, 186, 69, 0.3));
}

.download-buttons {
  width: 100%;
  max-width: 400px;
  margin-top: 16px;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

:deep(.q-field__control) {
  border-radius: 8px;
}

:deep(.q-btn) {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.3px;
}
</style>
