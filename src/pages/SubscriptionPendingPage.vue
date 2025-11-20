<template>
  <div class="pending-page-fullscreen">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Content Container -->
    <div class="content-container">
      <div class="state-content">
        <!-- Pending Icon with Animation -->
        <div class="pending-icon-container">
          <div class="pending-clock">
            <div class="clock-circle">
              <div class="clock-hand hour-hand"></div>
              <div class="clock-hand minute-hand"></div>
              <div class="clock-center"></div>
            </div>
          </div>
        </div>

        <h1 class="pending-title fade-in-up">Pago Pendiente</h1>
        <p class="pending-subtitle fade-in-up delay-1">
          Tu pago está siendo procesado. Te notificaremos cuando se complete.
        </p>

        <!-- Action Button -->
        <button @click="goHome" class="action-button fade-in-up delay-2">
          <span>Volver al inicio</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'SubscriptionPendingPage',
  setup () {
    const router = useRouter()

    const goHome = () => {
      router.push('/')
    }

    return {
      goHome
    }
  }
}
</script>

<style scoped>
/* Fullscreen Container */
.pending-page-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
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
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  top: -250px;
  left: -250px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #ffb347 0%, #ffcc33 100%);
  bottom: -200px;
  right: -200px;
  animation-delay: 7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
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

/* Pending Clock Animation */
.pending-icon-container {
  margin: 0 auto 40px;
}

.pending-clock {
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.clock-circle {
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
  animation: clock-pulse 2s ease-in-out infinite;
}

.clock-hand {
  position: absolute;
  background-color: white;
  border-radius: 2px;
  transform-origin: bottom center;
  bottom: 50%;
  left: 50%;
}

.hour-hand {
  width: 4px;
  height: 30px;
  margin-left: -2px;
  animation: hour-rotate 4s linear infinite;
}

.minute-hand {
  width: 3px;
  height: 40px;
  margin-left: -1.5px;
  animation: minute-rotate 2s linear infinite;
}

.clock-center {
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

@keyframes clock-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
}

@keyframes hour-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes minute-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Typography */
.pending-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 0 0 16px;
  letter-spacing: -1px;
}

.pending-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 40px;
  font-weight: 400;
  line-height: 1.5;
}

/* Action Button */
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 40px;
  font-size: 16px;
  font-weight: 600;
  color: #f39c12;
  background: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.3px;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.action-button:active {
  transform: translateY(0);
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
  .pending-title {
    font-size: 36px;
  }

  .pending-subtitle {
    font-size: 16px;
  }

  .action-button {
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
