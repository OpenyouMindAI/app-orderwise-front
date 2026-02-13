<template>
  <q-dialog
    v-model="internalValue"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card :class="['conversion-modal-card', 'modal-animated-card', { 'mobile-fullscreen': isMobile }]">
      <!-- Botón de cierre -->
      <q-btn
        icon="close"
        flat
        round
        dense
        v-close-popup
        class="close-btn"
      />

      <!-- Contenido principal scrolleable -->
      <div class="modal-content">
        <!-- Título principal -->
        <div class="header-section">
          <q-btn
            unelevated
            class="cta-button"
            @click="goToRegister"
          >
            <span class="cta-text">Crear mi cuenta gratis</span>
          </q-btn>
          <div class="text-h6 text-weight-bold main-title q-mt-md">
            Ya probaste la demo — ahora desbloqueá tu cuenta completa
          </div>
          <div class="text-body2 subtitle">
            Creá tu cuenta gratis y accedé a todas estas funciones:
          </div>
        </div>

        <!-- Lista de 5 beneficios -->
        <div class="benefits-list">
          <div
            v-for="(benefit, index) in benefits"
            :key="index"
            class="benefit-card"
            :style="{ animationDelay: `${300 + index * 100}ms` }"
          >
            <div class="benefit-icon">
              <q-icon :name="benefit.icon" size="28px" />
            </div>
            <div class="benefit-content">
              <div class="text-subtitle1 text-weight-bold benefit-title">{{ benefit.title }}</div>
              <div class="text-body2 benefit-description">{{ benefit.description }}</div>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="cta-section">
          <div class="text-caption cta-subtext q-mb-sm">
            No requiere tarjeta • 60 segundos
          </div>

          <!-- Enlace para continuar en demo -->
          <div class="continue-demo-container">
            <span class="continue-demo-link" v-close-popup>
              Continuar explorando la demo
            </span>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import eventBus from 'src/utils/eventBus'

const $q = useQuasar()

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

// Detectar si es mobile
const isMobile = computed(() => $q.screen.lt.md)

// 5 Beneficios detallados
const benefits = [
  {
    icon: 'shopping_cart',
    title: 'Venta simple',
    description: 'Vendo, cobro, listo. Rapidez y simplicidad.'
  },
  {
    icon: 'account_balance_wallet',
    title: 'Caja',
    description: 'Control automático del efectivo diario.'
  },
  {
    icon: 'assessment',
    title: 'Reporte diario',
    description: 'Resumen automático sin cálculos manuales.'
  },
  {
    icon: 'people',
    title: 'Cuenta corriente',
    description: 'Seguimiento claro de clientes.'
  },
  {
    icon: 'store',
    title: 'Sucursal / reparto',
    description: 'Medición de rendimiento por local o repartidor.'
  }
]

const goToRegister = () => {
  eventBus.emit('open-subscription-dialog')
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* ========== ESTRUCTURA BASE ========== */
.conversion-modal-card {
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  background: var(--surface);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.modal-animated-card {
  animation: zoomInSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

.mobile-fullscreen {
  max-width: 100%;
  height: 100vh;
  border-radius: 0;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  color: var(--text-light);
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--text);
}

/* ========== CONTENIDO SCROLLEABLE ========== */
.modal-content {
  padding: 48px 24px 24px;
  overflow-y: auto;
  max-height: 85vh;
}

/* ========== HEADER ========== */
.header-section {
  text-align: center;
  margin-bottom: 24px;
}

.top-icon-container {
  width: fit-content;
  min-width: 72px;
  height: auto;
  min-height: 72px;
  margin: 0 auto 24px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--primary-rgb, 25, 118, 210), 0.08), rgba(var(--primary-rgb, 25, 118, 210), 0.15));
  border-radius: 24px;
  position: relative;
  animation: float 4s ease-in-out infinite;
  border: 1px solid rgba(var(--primary-rgb, 25, 118, 210), 0.1);
}

.top-icon {
  font-size: 36px;
  color: var(--primary);
  filter: drop-shadow(0 4px 8px rgba(var(--primary-rgb, 25, 118, 210), 0.3));
}

.main-title {
  color: var(--text);
  line-height: 1.3;
  margin: 0 0 8px 0;
  font-size: 1.25rem;
}

.subtitle {
  color: var(--text-light);
  margin: 0;
}

/* ========== BENEFICIOS ========== */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.benefit-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--background);
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  transition: all 0.3s ease;
  animation: slideInSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

.benefit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.benefit-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border-radius: 8px;
}

.benefit-content {
  flex: 1;
}

.benefit-title {
  color: var(--text);
  margin: 0 0 2px 0;
}

.benefit-description {
  color: var(--text-light);
  margin: 0;
  line-height: 1.4;
}

/* ========== CTA SECTION ========== */
.cta-section {
  text-align: center;
}

.cta-button {
  width: 70%;
  height: 50px;
  background: var(--primary) !important;
  color: white !important;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  text-transform: none;
  box-shadow: 0 8px 20px rgba(var(--primary-rgb, 25, 118, 210), 0.35);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  margin-bottom: 0px;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--primary-rgb, 25, 118, 210), 0.4);
}

.cta-button:active {
  transform: translateY(0);
}

.cta-text {
  font-size: 1rem;
}

.cta-subtext {
  color: var(--text-light);
  margin: 0;
}

.continue-demo-container {
  margin-top: 16px;
}

.continue-demo-link {
  color: var(--primary);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
}

.continue-demo-link:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

/* ========== ANIMACIONES ========== */
@keyframes zoomInSpring {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInSpring {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* ========== RESPONSIVE MOBILE ========== */
@media (max-width: 768px) {
  .modal-content {
    padding: 48px 20px 20px;
    max-height: 100vh;
  }

  .header-section {
    margin-bottom: 16px;
  }

  .benefits-list {
    gap: 8px;
    margin-bottom: 16px;
  }

  .benefit-card {
    padding: 10px;
    gap: 10px;
  }

  .benefit-icon {
    width: 36px;
    height: 36px;
  }

  .benefit-icon .q-icon {
    font-size: 20px;
  }

  .cta-button {
    height: 48px;
  }

}

/* Mobile muy pequeño (< 375px) */
@media (max-width: 374px) {
  .modal-content {
    padding: 44px 16px 16px;
  }

  .benefit-card {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .cta-button {
    height: 46px;
    font-size: 0.95rem;
  }
}
</style>
