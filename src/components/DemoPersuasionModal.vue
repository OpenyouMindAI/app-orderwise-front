<template>
  <q-dialog v-model="internalValue" persistent transition-show="scale" transition-hide="scale">
    <q-card class="persuasion-card shadow-24">
      <q-card-section class="persuasion-header q-pa-lg text-center bg-gradient-premium text-white">
        <q-btn icon="close" flat round dense v-close-popup class="absolute-top-right q-ma-sm" />
        <q-icon name="rocket_launch" size="84px" class="q-mb-md animate-bounce" />
        <div class="text-h4 text-weight-bold">¡Lleva tu negocio al siguiente nivel!</div>
        <div class="text-subtitle1 q-mt-sm opacity-80">
          Has completado acciones clave con éxito. Imagina lo que podrías lograr con tu empresa real configurada.
        </div>
      </q-card-section>

      <q-card-section class="q-pa-xl">
        <div class="row q-col-gutter-lg items-center">
          <div class="col-12 col-sm-6">
            <q-list dense padding>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Gestión Profesional</q-item-label>
                  <q-item-label caption>Categorías y productos personalizados.</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Facturación Real</q-item-label>
                  <q-item-label caption>Genera comprobantes válidos para tu país.</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Control Inventario</q-item-label>
                  <q-item-label caption>Mantén todo bajo control en tiempo real.</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-12 col-sm-6 text-center">
            <q-img
              src="https://img.freepik.com/free-vector/business-success-concept-illustration_114360-10118.jpg"
              spinner-color="primary"
              style="max-width: 200px"
              class="rounded-borders"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-xl q-px-xl">
        <q-btn
          label="Crear mi empresa ahora"
          color="primary"
          size="lg"
          unelevated
          class="full-width q-mb-md gradient-btn"
          @click="goToRegister"
        />
        <q-btn
          label="Continuar explorando el demo"
          flat
          color="grey-7"
          class="full-width text-weight-regular"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const goToRegister = () => {
  router.push('/register-company')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.persuasion-card {
  width: 600px;
  max-width: 95vw;
  border-radius: 24px;
  overflow: hidden;
}

.bg-gradient-premium {
  background: linear-gradient(135deg, #1976d2 0%, #673ab7 100%);
}

.gradient-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1e88e5 100%);
  border-radius: 12px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.animate-vertical {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.opacity-80 {
  opacity: 0.8;
}
</style>
