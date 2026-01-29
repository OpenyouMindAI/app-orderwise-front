<template>
  <q-dialog
    v-model="internalValue"
    persistent
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="minimal-persuasion-card q-pa-md">
      <!-- Botón de cierre discreto -->
      <q-btn
        icon="close"
        flat
        round
        dense
        v-close-popup
        class="absolute-top-right text-grey-5 q-ma-sm"
      />

      <q-card-section class="text-center q-pt-lg">
        <div class="icon-container q-mb-md">
          <q-icon
            name="business"
            size="48px"
            class="fade-in-sutil"
            style="color: var(--primary)"
          />
        </div>

        <div class="text-h6 text-weight-bold q-mt-none q-mb-xs" style="color: var(--text)">
          Haz que tu empresa empiece a crecer hoy
        </div>
        <p class="text-body2 q-mb-lg" style="color: var(--text-light)">
          La demo es solo el comienzo. Configura tu empresa real y desbloquea
          todas las herramientas que necesitas para gestionar tu negocio sin límites.
        </p>
      </q-card-section>

      <q-card-section class="benefits-section q-px-lg">
        <div class="row q-col-gutter-sm">
          <div v-for="(benefit, index) in benefits" :key="index" class="col-12">
            <div class="benefit-item flex items-center no-wrap">
              <q-icon name="check" size="20px" class="q-mr-sm" style="color: var(--primary)" />
              <div class="text-body2" style="color: var(--text)">{{ benefit }}</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="column items-center q-pt-xl q-pb-md">
        <q-btn
          label="Empezar ahora"
          unelevated
          class="action-btn-main q-mb-sm"
          @click="goToRegister"
        />
        <q-btn
          label="Continuar en modo demo"
          flat
          class="action-btn-sub text-none"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import eventBus from 'src/utils/eventBus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const benefits = [
  'Inventario organizado y automatizado',
  'Facturación personalizada y lista para operar',
  'Reportes claros para entender y mejorar tu negocio'
]

const goToRegister = () => {
  eventBus.emit('open-create-company')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.minimal-persuasion-card {
  width: 100%;
  max-width: 500px;
  border-radius: var(--border-radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.icon-container {
  display: inline-flex;
  padding: 16px;
  border-radius: 50%;
  background: var(--background);
}

.benefit-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.benefits-section div:last-child .benefit-item {
  border-bottom: none;
}

.action-btn-main {
  width: 100%;
  height: 48px;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-transform: none;
  font-size: 1rem;
  background: var(--primary) !important;
  color: white !important;
}

.action-btn-sub {
  width: 100%;
  height: 40px;
  border-radius: var(--border-radius-md);
  font-weight: 400;
  font-size: 0.9rem;
  color: var(--text-light) !important;
}

/* Animaciones suaves */
.fade-in-sutil {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividad extra */
@media (max-width: 480px) {
  .minimal-persuasion-card {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }
}
</style>
