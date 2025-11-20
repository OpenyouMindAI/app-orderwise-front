<template>
  <div class="failure-page-fullscreen">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Content Container -->
    <div class="content-container">
      <div class="state-content">
        <!-- Error Icon with Animation -->
        <div class="error-icon-container">
          <div class="error-icon-wrapper">
            <div class="error-circle">
              <div class="error-x">
                <span class="error-line error-line-left"></span>
                <span class="error-line error-line-right"></span>
              </div>
            </div>
          </div>
        </div>

        <h1 class="error-title fade-in-up">Pago Rechazado</h1>
        <p class="error-subtitle fade-in-up delay-1">
          Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
        </p>

        <!-- Action Buttons -->
        <div class="button-group fade-in-up delay-2">
          <button @click="retry" class="action-button primary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M10 2L10 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 4L10 6L8 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Intentar de nuevo</span>
          </button>

          <button @click="goHome" class="action-button secondary">
            <span>Volver al inicio</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { notify } from 'src/const/mixins'

export default {
  name: 'SubscriptionFailurePage',
  setup () {
    const router = useRouter()

    const retry = () => {
      router.push('/')
      notify('Intenta seleccionar tu plan nuevamente', 'info', 'info')
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      retry,
      goHome
    }
  }
}
</script>

<style scoped>
/* Fullscreen Container */
.failure-page-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Animated Background */
.animated-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  top: -250px;
  left: -250px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #ff8787 0%, #ff6b9d 100%);
  bottom: -200px;
  right: -200px;
  animation-delay: 7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #ffa07a 0%, #ff7f50 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Content Container */
.content-container {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
}

.state-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

/* Error Icon Animation */
.error-icon-container {
  margin: 0 auto 40px;
}

.error-icon-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.error-circle {
  width: 120px;
  height: 120px;
  position: relative;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: error-circle 0.8s ease-in-out;
}

.error-x {
  position: relative;
  width: 60px;
  height: 60px;
}

.error-line {
  position: absolute;
  height: 5px;
  width: 60px;
  background-color: white;
  border-radius: 2px;
  top: 50%;
  left: 50%;
}

.error-line-left {
  transform: translate(-50%, -50%) rotate(45deg);
  animation: error-line-left 0.5s 0.3s ease-out forwards;
  transform-origin: center;
  opacity: 0;
}

.error-line-right {
  transform: translate(-50%, -50%) rotate(-45deg);
  animation: error-line-right 0.5s 0.5s ease-out forwards;
  transform-origin: center;
  opacity: 0;
}

@keyframes error-circle {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes error-line-left {
  0% {
    width: 0;
    opacity: 0;
  }
  100% {
    width: 60px;
    opacity: 1;
  }
}

@keyframes error-line-right {
  0% {
    width: 0;
    opacity: 0;
  }
  100% {
    width: 60px;
    opacity: 1;
  }
}

/* Typography */
.error-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 0 0 16px;
  letter-spacing: -1px;
}

.error-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 40px;
  font-weight: 400;
  line-height: 1.5;
}

/* Button Group */
.button-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Action Buttons */
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 40px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.3px;
}

.action-button.primary {
  color: #e74c3c;
  background: white;
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.action-button:active {
  transform: translateY(0);
}

.action-button svg {
  transition: transform 0.3s ease;
}

.action-button:hover svg {
  transform: rotate(180deg);
}

/* Fade In Up Animation */
.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.delay-1 {
  animation-delay: 0.2s;
}

.delay-2 {
  animation-delay: 0.4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .error-title {
    font-size: 36px;
  }

  .error-subtitle {
    font-size: 16px;
  }

  .button-group {
    flex-direction: column;
    width: 100%;
  }

  .action-button {
    width: 100%;
    justify-content: center;
    padding: 16px 32px;
    font-size: 15px;
  }

  .gradient-orb {
    filter: blur(60px);
  }

  .orb-1 {
    width: 300px;
    height: 300px;
  }

  .orb-2 {
    width: 250px;
    height: 250px;
  }

  .orb-3 {
    width: 200px;
    height: 200px;
  }
}
</style>
