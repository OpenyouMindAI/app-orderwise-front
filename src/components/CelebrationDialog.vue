<template>
  <q-dialog v-model="show" persistent>
    <q-card class="celebration-card">
      <!-- Confetti Canvas -->
      <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

      <q-card-section class="celebration-content">
        <div class="celebration-icon">
          <q-icon name="celebration" size="80px" color="primary" />
        </div>

        <div class="celebration-title">
          ¡Felicitaciones! 🎉
        </div>

        <div class="celebration-message">
          Tu empresa está configurada al 100%
        </div>

        <div class="celebration-submessage">
          Ya puedes empezar a realizar ventas y gestionar tu negocio
        </div>

        <div class="celebration-actions">
          <q-btn
            unelevated
            color="primary"
            size="lg"
            label="Ir a Vender"
            icon="shopping_cart"
            @click="goToBilling"
            class="celebration-btn"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useDialogPluginComponent } from 'quasar'

const router = useRouter()
const { onDialogOK } = useDialogPluginComponent()

const show = ref(true)
const confettiCanvas = ref(null)
let animationId = null

const goToBilling = () => {
  onDialogOK()
  router.push({ name: 'Billing' })
}

// Confetti animation
const createConfetti = () => {
  const canvas = confettiCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const confettiPieces = []
  const confettiCount = 150
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a']

  class ConfettiPiece {
    constructor () {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height - canvas.height
      this.size = Math.random() * 8 + 5
      this.speedY = Math.random() * 3 + 2
      this.speedX = Math.random() * 2 - 1
      this.color = colors[Math.floor(Math.random() * colors.length)]
      this.rotation = Math.random() * 360
      this.rotationSpeed = Math.random() * 10 - 5
    }

    update () {
      this.y += this.speedY
      this.x += this.speedX
      this.rotation += this.rotationSpeed

      if (this.y > canvas.height) {
        this.y = -10
        this.x = Math.random() * canvas.width
      }
    }

    draw () {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate((this.rotation * Math.PI) / 180)
      ctx.fillStyle = this.color
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
      ctx.restore()
    }
  }

  for (let i = 0; i < confettiCount; i++) {
    confettiPieces.push(new ConfettiPiece())
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    confettiPieces.forEach(piece => {
      piece.update()
      piece.draw()
    })

    animationId = requestAnimationFrame(animate)
  }

  animate()
}

onMounted(() => {
  setTimeout(() => {
    createConfetti()
  }, 100)
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.celebration-card {
  width: 500px;
  max-width: 90vw;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.confetti-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.celebration-content {
  position: relative;
  z-index: 2;
  padding: 60px 40px;
  text-align: center;
  color: white;
}

.celebration-icon {
  margin-bottom: 24px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.celebration-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.celebration-message {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 12px;
  color: white;
  opacity: 0.95;
}

.celebration-submessage {
  font-size: 16px;
  margin-bottom: 40px;
  color: white;
  opacity: 0.85;
  line-height: 1.5;
}

.celebration-actions {
  display: flex;
  justify-content: center;
}

.celebration-btn {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: white;
  color: #667eea;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.celebration-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}

@media (max-width: 600px) {
  .celebration-content {
    padding: 40px 24px;
  }

  .celebration-title {
    font-size: 28px;
  }

  .celebration-message {
    font-size: 18px;
  }

  .celebration-submessage {
    font-size: 14px;
  }
}
</style>
