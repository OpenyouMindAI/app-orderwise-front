<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="success-modal-card">
      <!-- Success Content -->
      <q-card-section class="text-center q-pt-xl q-pb-md relative-position">
        <!-- Animated icon with circles -->
        <div class="success-icon-container">
          <div class="success-circle-1"></div>
          <div class="success-circle-2"></div>
          <div class="success-circle-3"></div>
          <q-avatar size="100px" class="success-avatar">
            <q-icon :name="icon" size="60px" color="white" class="success-check-icon" />
          </q-avatar>
        </div>

        <!-- Title with animation -->
        <div class="text-h5 text-weight-bold q-mt-lg success-title">
          {{ title }}
        </div>
        <div v-if="subtitle" class="text-body1 text-grey-7 q-mt-xs success-subtitle">
          <span v-html="subtitle"></span>
        </div>
      </q-card-section>

      <!-- Modern action buttons -->
      <q-card-section class="q-px-lg q-pb-lg q-pt-none">
        <div class="column q-gutter-y-md items-center">
          <!-- Primary button -->
          <q-btn
            v-if="showView"
            unelevated
            color="primary"
            icon="visibility"
            :label="viewLabel"
            @click="$emit('view')"
            class="full-width action-btn-primary"
            size="md"
            no-caps
          >
            <div class="btn-shine"></div>
          </q-btn>

          <!-- Secondary buttons grid -->
          <div v-if="showDownload || showShare" class="row q-col-gutter-xs full-width">
            <div v-if="showDownload && !$q.platform.is.mobile" class="col-6">
              <q-btn
                outline
                color="primary"
                icon="download"
                :label="downloadLabel"
                @click="$emit('download')"
                class="full-width action-btn-secondary"
                size="md"
                no-caps
                stack
              />
            </div>
            <div :class="showDownload && !$q.platform.is.mobile ? 'col-6' : 'col-12'">
              <q-btn
                v-if="showShare"
                outline
                color="primary"
                icon="share"
                :label="shareLabel"
                @click="$emit('share')"
                class="full-width action-btn-secondary"
                size="md"
                no-caps
                stack
              />
            </div>
          </div>

          <!-- Close button -->
          <q-btn
            outline
            :label="closeLabel"
            color="grey-8"
            @click="$emit('close'); $emit('update:modelValue', false)"
            class="full-width q-mt-sm action-btn-close"
            size="md"
            no-caps
          />
        </div>
      </q-card-section>

      <!-- Decorative confetti -->
      <div class="confetti-container">
        <div class="confetti" v-for="i in 20" :key="i" :style="{ left: (i * 5) + '%' }"></div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

/**
 * Props for the success modal component
 * @type {Object}
 */
defineProps({
  /**
   * v-model value to show/hide the modal
   * @type {Boolean}
   */
  modelValue: {
    type: Boolean,
    default: false
  },
  /**
   * Main title of the success modal
   * @type {String}
   */
  title: {
    type: String,
    default: '¡Operación Exitosa!'
  },
  /**
   * Subtitle or description (supports HTML)
   * @type {String}
   */
  subtitle: {
    type: String,
    default: ''
  },
  /**
   * Icon name to display in the success circle
   * @type {String}
   */
  icon: {
    type: String,
    default: 'check'
  },
  /**
   * Show the "View" button
   * @type {Boolean}
   */
  showView: {
    type: Boolean,
    default: true
  },
  /**
   * Label for the view button
   * @type {String}
   */
  viewLabel: {
    type: String,
    default: 'Ver Detalle'
  },
  /**
   * Show the "Download" button
   * @type {Boolean}
   */
  showDownload: {
    type: Boolean,
    default: false
  },
  /**
   * Label for the download button
   * @type {String}
   */
  downloadLabel: {
    type: String,
    default: 'Descargar'
  },
  /**
   * Show the "Share" button
   * @type {Boolean}
   */
  showShare: {
    type: Boolean,
    default: false
  },
  /**
   * Label for the share button
   * @type {String}
   */
  shareLabel: {
    type: String,
    default: 'Compartir'
  },
  /**
   * Label for the close button
   * @type {String}
   */
  closeLabel: {
    type: String,
    default: 'Cerrar'
  }
})

/**
 * Emits for the success modal component
 */
defineEmits(['update:modelValue', 'view', 'download', 'share', 'close'])
</script>

<style scoped>
/* Success Modal Card */
.success-modal-card {
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.body--dark .success-modal-card {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
}

/* Animated Success Icon */
.success-icon-container {
  position: relative;
  display: inline-block;
  width: 120px;
  height: 120px;
}

.success-circle-1,
.success-circle-2,
.success-circle-3 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
}

.success-circle-1 {
  width: 100%;
  height: 100%;
  background: rgba(76, 175, 80, 0.1);
  animation-delay: 0s;
}

.success-circle-2 {
  width: 85%;
  height: 85%;
  background: rgba(76, 175, 80, 0.15);
  animation-delay: 0.3s;
}

.success-circle-3 {
  width: 70%;
  height: 70%;
  background: rgba(76, 175, 80, 0.2);
  animation-delay: 0.6s;
}

.success-avatar {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.4);
  animation: scale-in 0.5s ease-out;
}

.success-check-icon {
  animation: check-bounce 0.6s ease-out 0.3s both;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

@keyframes scale-in {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes check-bounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Title Animation */
.success-title {
  animation: fade-in-up 0.5s ease-out 0.4s both;
}

.success-subtitle {
  animation: fade-in-up 0.5s ease-out 0.5s both;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button Styles */
.action-btn-primary {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  50%, 100% {
    left: 100%;
  }
}

.action-btn-secondary {
  border-radius: 12px;
  font-weight: 500;
}

.action-btn-close {
  border-radius: 12px;
}

/* Confetti Animation */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  animation: confetti-fall 3s ease-out infinite;
}

.confetti:nth-child(2n) {
  background: linear-gradient(135deg, #2196f3, #03a9f4);
  animation-delay: 0.2s;
}

.confetti:nth-child(3n) {
  background: linear-gradient(135deg, #ff9800, #ffc107);
  animation-delay: 0.4s;
}

.confetti:nth-child(4n) {
  background: linear-gradient(135deg, #e91e63, #f44336);
  animation-delay: 0.6s;
}

.confetti:nth-child(5n) {
  background: linear-gradient(135deg, #9c27b0, #673ab7);
  animation-delay: 0.8s;
}

@keyframes confetti-fall {
  0% {
    top: -10%;
    transform: rotate(0deg) scale(0);
    opacity: 1;
  }
  10% {
    transform: rotate(45deg) scale(1);
  }
  100% {
    top: 110%;
    transform: rotate(720deg) scale(0);
    opacity: 0;
  }
}

/* Dark mode adjustments */
.body--dark .success-circle-1 {
  background: rgba(76, 175, 80, 0.15);
}

.body--dark .success-circle-2 {
  background: rgba(76, 175, 80, 0.2);
}

.body--dark .success-circle-3 {
  background: rgba(76, 175, 80, 0.25);
}

.body--dark .success-title {
  color: #f1f5f9;
}

.body--dark .success-subtitle {
  color: #94a3b8;
}
</style>
