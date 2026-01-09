<template>
  <q-dialog v-model="showDialog" @hide="onHide">
    <q-card class="arca-dialog">
      <!-- Header con logo -->
      <q-card-section class="arca-header">
        <div class="header-content">
          <q-img
            src="images/arca.svg"
            class="arca-logo"
            alt="Arca"
          />
        </div>
      </q-card-section>

      <!-- Formulario de credenciales -->
      <q-card-section v-if="!downloadData" class="form-section">
        <div class="text-h6 text-center q-mb-md text-grey-8">
          Conecta tu cuenta de Arca
        </div>
        <p class="text-body2 text-center text-grey-6 q-mb-lg">
          Ingresa tus credenciales de AFIP para generar tu certificado de facturación electrónica
        </p>

        <div class="q-gutter-sm">
          <q-input
            v-model="credentials.cuit"
            filled
            label="CUIT"
            autofocus
            mask="##-########-#"
            :rules="[
              val => !!val || 'El CUIT es requerido',
              val => val.replace(/-/g, '').length === 11 || 'CUIT inválido'
            ]"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="badge" color="grey-6" />
            </template>
          </q-input>

          <q-input
            v-model="credentials.password"
            filled
            label="Contraseña de ARCA"
            :type="showPassword ? 'text' : 'password'"
            :rules="[val => !!val || 'La contraseña es requerida']"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="grey-6" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="grey-6"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </div>

        <div class="info-banner q-mt-lg">
          <q-icon name="info" size="20px" color="primary" class="q-mr-sm" />
          <div class="text-caption text-grey-7">
            <strong>Importante:</strong> Este proceso puede tardar unos minutos.
            Se generará un certificado digital válido para facturación electrónica.
          </div>
        </div>
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
          label="Generar certificado"
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

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  download: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'generate'])

const showDialog = ref(props.modelValue)
const credentials = ref({
  cuit: '',
  password: ''
})
const showPassword = ref(false)
const loading = ref(false)
const downloadData = ref(props.download)

const isFormValid = computed(() => {
  const cuitClean = credentials.value.cuit.replace(/-/g, '')
  return cuitClean.length === 11 && credentials.value.password.length > 0
})

watch(() => props.modelValue, (newVal) => {
  showDialog.value = newVal
})

watch(() => props.download, (newVal) => {
  downloadData.value = newVal
})

watch(showDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleGenerate = () => {
  emit('generate', {
    cuit: credentials.value.cuit,
    password: credentials.value.password
  })
}

const onHide = () => {
  credentials.value = {
    cuit: '',
    password: ''
  }
  showPassword.value = false
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
