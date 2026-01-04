<template>
  <q-dialog v-model="show" persistent transition-show="scale" transition-hide="scale">
    <q-card class="celebration-card">
      <q-card-section class="column items-center q-pb-none q-pt-xl q-px-lg relative-position" style="z-index: 2;">
        <div class="icon-container q-mb-md">
          <q-icon name="celebration" size="48px" class="text-white" />
        </div>

        <div class="text-h4 text-center text-weight-bold q-mb-sm text-primary">
          ¡Felicitaciones!
        </div>

        <div class="text-body1 text-center text-grey-7 q-mb-lg celebration-message">
          Tu empresa está configurada al 100%.<br>
          Ya puedes empezar a gestionar tu negocio y realizar ventas.
        </div>
      </q-card-section>

      <!-- Confetti Canvas (Background of the card) -->
      <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

      <q-card-actions align="center" class="q-pa-lg q-pt-none relative-position" style="z-index: 2;">
        <q-btn
          label="Ir a Vender"
          color="primary"
          class="full-width q-py-md text-weight-bold"
          rounded
          unelevated
          size="md"
          @click="goToSelling"
          icon-right="rocket_launch"
          style="box-shadow: 0 4px 15px rgba(var(--q-primary-rgb), 0.3);"
        />
      </q-card-actions>
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

const goToSelling = () => {
  localStorage.setItem('needs_billing_tour', 'true')
  localStorage.removeItem('has_seen_billing_tour')
  show.value = false
  router.push('/')
  onDialogOK()
}

// Enhanced Confetti Animation
const createConfetti = () => {
  const canvas = confettiCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  // Set canvas to parent size (card size)
  const resizeCanvas = () => {
    // We can use the parent element's dimensions
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
  }

  // Initial resize
  resizeCanvas()

  // In a dialog, window resize might affect card size
  window.addEventListener('resize', resizeCanvas)

  const confettiPieces = []
  const confettiCount = 100 // Reduced count for smaller area
  // Colors from the gradient + vibrant accents
  const colors = ['#667eea', '#764ba2', '#FFD700', '#FF6B6B', '#4ECDC4', '#f0f8ff']

  class ConfettiPiece {
    constructor () {
      this.reset(true)
    }

    reset (initial = false) {
      this.x = Math.random() * canvas.width
      this.y = initial ? Math.random() * canvas.height : -10
      this.size = Math.random() * 6 + 3 // Slightly smaller pieces
      this.speedY = Math.random() * 2 + 0.5
      this.speedX = Math.random() * 2 - 1
      this.color = colors[Math.floor(Math.random() * colors.length)]
      this.rotation = Math.random() * 360
      this.rotationSpeed = Math.random() * 10 - 5
      this.wobble = Math.random() * Math.PI * 2
      this.wobbleSpeed = Math.random() * 0.1 + 0.05
    }

    update () {
      this.y += this.speedY
      this.x += this.speedX
      this.rotation += this.rotationSpeed
      this.wobble += this.wobbleSpeed

      this.x += Math.sin(this.wobble) * 2

      if (this.y > canvas.height) {
        this.reset()
      }
    }

    draw () {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate((this.rotation * Math.PI) / 180)
      ctx.fillStyle = this.color

      if (this.color === '#f0f8ff') {
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
      }

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

  return () => window.removeEventListener('resize', resizeCanvas)
}

let cleanup = null

onMounted(() => {
  // Delay slightly to ensure DOM gives correct dimensions after dialog animation
  setTimeout(() => {
    cleanup = createConfetti()
  }, 200)
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (cleanup) cleanup()
})
</script>

<style scoped>
.celebration-card {
  width: 450px;
  max-width: 90vw;
  border-radius: 20px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden; /* Ensure confetti stays in card */
}

/* Confetti Background for Card */
.confetti-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1; /* Behind content */
  mask-image: linear-gradient(to bottom, black 0%, black 20%, transparent 45%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 20%, transparent 45%);
}

/* Icon Styling from Inspiration */
.icon-container {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--q-primary), var(--q-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(var(--q-primary-rgb), 0.4);
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb), 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(var(--q-primary-rgb), 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb), 0); }
}

.celebration-message {
  line-height: 1.5;
}
</style>
