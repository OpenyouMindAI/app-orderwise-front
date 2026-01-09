<template>
  <q-dialog v-model="showDialog" @hide="onHide">
    <q-card class="pedidosya-dialog">
      <!-- Header con logo -->
      <q-card-section class="pedidosya-header">
        <div class="header-content">
          <q-img
            src="images/pedidos-ya.svg"
            class="pedidosya-logo"
            alt="PedidosYa"
          />
        </div>
      </q-card-section>

      <!-- Formulario de credenciales -->
      <q-card-section v-if="!downloadData" class="form-section">
        <div class="text-h6 text-center q-mb-md text-grey-8">
          Conecta tu cuenta de PedidosYa
        </div>
        <p class="text-body2 text-center text-grey-6 q-mb-lg">
          Ingresa tus credenciales para sincronizar tus pedidos automáticamente
        </p>

        <div class="q-gutter-md">
          <q-input
            v-model="credentials.email"
            filled
            label="Usuario o Email"
            autofocus
            :rules="[val => !!val || 'El usuario es requerido']"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="person" color="grey-6" />
            </template>
          </q-input>

          <q-input
            v-model="credentials.password"
            filled
            label="Contraseña"
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

        <div class="text-caption text-grey-6 q-mt-md text-center">
          <q-icon name="info" size="16px" class="q-mr-xs" />
          Tus credenciales se almacenan de forma segura y encriptada
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
            ¡Conexión exitosa!
          </div>

          <p class="text-body2 text-grey-6 q-mb-lg">
            El certificado fue creado y autorizado correctamente
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
        </div>
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions v-if="!downloadData" align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          v-close-popup
        />
        <q-btn
          unelevated
          label="Conectar"
          color="negative"
          @click="handleConnect"
          :loading="loading"
          :disable="!credentials.email || !credentials.password"
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
import { ref, watch } from 'vue'

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

const emit = defineEmits(['update:modelValue', 'connect'])

const showDialog = ref(props.modelValue)
const credentials = ref({
  email: '',
  password: ''
})
const showPassword = ref(false)
const loading = ref(false)
const downloadData = ref(props.download)

watch(() => props.modelValue, (newVal) => {
  showDialog.value = newVal
})

watch(() => props.download, (newVal) => {
  downloadData.value = newVal
})

watch(showDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleConnect = () => {
  emit('connect', credentials.value)
}

const onHide = () => {
  credentials.value = {
    email: '',
    password: ''
  }
  showPassword.value = false
  downloadData.value = null
}
</script>

<style scoped lang="scss">
.pedidosya-dialog {
  width: 550px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.pedidosya-header {
  background: linear-gradient(135deg, #ee2e43 0%, #d41f33 100%);
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

.pedidosya-logo {
  width: 320px;
  max-width: 70vw;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.form-section {
  padding: 32px 24px;
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
