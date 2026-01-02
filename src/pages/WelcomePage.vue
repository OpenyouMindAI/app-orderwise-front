<template>
  <q-page class="welcome-page">
    <!-- Modal de selección de tareas -->
    <q-dialog v-model="showTasksModal" persistent transition-show="scale" transition-hide="scale">
      <q-card class="tasks-modal-card">
        <!-- Header con gradiente -->
        <div class="tasks-modal-header">
          <q-icon name="rocket_launch" size="32px" class="header-icon" />
          <div class="header-title">¿Qué deseas configurar?</div>
          <div class="header-subtitle">Selecciona una tarea para comenzar</div>
          <q-btn
            icon="close"
            flat
            round
            dense
            color="white"
            class="close-btn-modal"
            v-close-popup
          />
        </div>

        <!-- Lista de tareas -->
        <q-card-section class="tasks-list-section">
          <div
            v-for="(task, index) in pendingTasks"
            :key="index"
            class="task-card-item"
            :class="{ 'task-completed': task.completed }"
            @click="!task.completed && selectTask(task)"
          >
            <div class="task-card-icon">
              <q-icon
                :name="task.completed ? 'check_circle' : task.icon"
                size="28px"
              />
            </div>
            <div class="task-card-content">
              <div class="task-card-title">{{ task.title }}</div>
              <div class="task-card-description">{{ task.description }}</div>
            </div>
            <div class="task-card-arrow" v-if="!task.completed">
              <q-icon name="arrow_forward_ios" size="18px" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Background Orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="welcome-content">
      <!-- Header -->
      <div class="header-section">
        <div class="logo-container">
          <q-icon name="rocket_launch" size="35px" class="logo-icon" />
        </div>
        <h1 class="welcome-title">Bienvenido</h1>
        <p class="welcome-subtitle q-pb-md">Configura tu negocio en minutos</p>
      </div>

      <!-- Progress Ring -->
      <div class="progress-section">
        <div class="progress-ring-container">
          <svg class="progress-ring" width="160" height="160" style="overflow: visible;">
            <circle
              class="progress-ring-track"
              cx="80"
              cy="80"
              r="70"
            />
            <circle
              class="progress-ring-fill"
              cx="80"
              cy="80"
              r="70"
              :style="{ strokeDashoffset: progressOffset }"
            />
          </svg>
          <div class="progress-center">
            <div class="progress-percentage">{{ progressPercentage }}%</div>
            <div class="progress-label">Completado</div>
          </div>
        </div>
        <div class="progress-stats">
          <span class="stat-item">
            <q-icon name="check_circle" size="16px" />
            {{ completedTasksCount }}/{{ totalTasksCount }}
          </span>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="tasks-section">
        <div
          v-for="(task, index) in displayTasks"
          :key="index"
          class="task-item"
          :class="{ 'task-completed': task.completed }"
          @click="goToTask(task.routeName)"
        >
          <div class="task-icon">
            <q-icon
              :name="task.completed ? 'check_circle' : task.icon"
              size="28px"
            />
          </div>
          <div class="task-info">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-caption">{{ task.caption }}</div>
          </div>
          <div class="task-action">
            <q-icon
              :name="task.completed ? 'done' : 'arrow_forward_ios'"
              size="20px"
            />
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="action-section">
        <!-- Botón cuando está al 100% -->
        <button v-if="progressPercentage === 100" class="primary-button" @click="goToBilling">
          <q-icon name="receipt_long" size="24px" />
          <span>Empieza a Facturar</span>
        </button>

        <!-- Botón cuando ya inició pero no completó -->
        <button v-else-if="progressPercentage > 0 && progressPercentage < 100" class="primary-button" @click="startTour">
          <q-icon name="settings" size="24px" />
          <span>Seguir Configurando</span>
        </button>

        <!-- Botón cuando no ha iniciado -->
        <button v-else class="primary-button" @click="startTour">
          <q-icon name="play_arrow" size="24px" />
          <span>Iniciar Configuración</span>
        </button>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'

const router = useRouter()

const tasksData = ref({})
const showTasksModal = ref(false)

const displayTasks = ref([
  {
    id: 'Category',
    title: 'Categorías',
    caption: 'Organiza tus productos',
    description: 'Crea categorías para organizar tus productos y facilitar su gestión',
    icon: 'category',
    routeName: 'Category',
    completed: false,
    count: 0
  },
  {
    id: 'Product',
    title: 'Productos',
    caption: 'Tu inventario',
    description: 'Agrega los productos que vendes con precios, stock y detalles',
    icon: 'inventory_2',
    routeName: 'Product',
    completed: false,
    count: 0
  },
  {
    id: 'PaymentMethod',
    title: 'Métodos de Pago',
    caption: 'Formas de cobro',
    description: 'Define cómo recibirás los pagos: efectivo, tarjeta, transferencia, etc.',
    icon: 'payment',
    routeName: 'PaymentMethod',
    completed: false,
    count: 0
  },
  {
    id: 'Client',
    title: 'Clientes',
    caption: 'Base de clientes',
    description: 'Registra tus clientes para facturación y seguimiento de ventas',
    icon: 'people',
    routeName: 'Client',
    completed: false,
    count: 0
  },
  {
    id: 'CompanyConfig',
    title: 'Configuración',
    caption: 'Datos de empresa',
    description: 'Configura los datos básicos de tu empresa: moneda, tipo de servicio, facturación',
    icon: 'settings',
    routeName: 'CompanyConfig',
    completed: false,
    count: 0
  }
])

// Tareas pendientes (no completadas)
const pendingTasks = computed(() => displayTasks.value.filter(t => !t.completed))

const completedTasksCount = computed(() => displayTasks.value.filter(t => t.completed).length)
const totalTasksCount = computed(() => displayTasks.value.length)
const progressPercentage = computed(() => Math.round((completedTasksCount.value / totalTasksCount.value) * 100))

// Progress ring calculation
const progressOffset = computed(() => {
  const circumference = 2 * Math.PI * 70 // r=70
  const progress = progressPercentage.value / 100
  return circumference * (1 - progress)
})

/**
 * Cargar estado de las tareas desde el backend
 */
const loadTasksStatus = async () => {
  try {
    const { data } = await api.get('/onboarding/tasks/status')
    tasksData.value = data

    // Actualizar displayTasks
    if (data.tasks) {
      data.tasks.forEach(backendTask => {
        const task = displayTasks.value.find(t => t.id === backendTask.route)
        if (task) {
          task.count = backendTask.count || 0
          task.completed = backendTask.count > 0

          // Para CompanyConfig verificar múltiples condiciones
          if (backendTask.route === 'CompanyConfig' && backendTask.multiple) {
            task.completed = backendTask.multiple.client &&
                           backendTask.multiple.type_of_service &&
                           backendTask.multiple.invoice_type
          }
        }
      })
    }
  } catch (error) {
    console.error('Error al cargar tareas:', error)
  }
}

const startTour = () => {
  showTasksModal.value = true
}

const selectTask = (task) => {
  showTasksModal.value = false

  // Marcar que viene desde WelcomePage para activar tour automáticamente
  localStorage.setItem('activate_tour_from_welcome', 'true')
  localStorage.setItem('welcome_selected_task', task.routeName)

  // Redirigir a la página de la tarea
  router.push({ name: task.routeName })
}

const goToBilling = () => {
  router.push({ name: 'Billing' })
}

const goToTask = (routeName) => {
  // Marcar que viene desde WelcomePage
  localStorage.setItem('activate_tour_from_welcome', 'true')
  localStorage.setItem('welcome_selected_task', routeName)

  router.push({ name: routeName })
}

// Verificar si el usuario volvió del tour
watch(() => router.currentRoute.value, () => {
  if (localStorage.getItem('onboarding_return') === 'true') {
    loadTasksStatus()
  }
}, { immediate: true })

onMounted(() => {
  loadTasksStatus()
})
</script>

<style scoped>
/* Mobile-first futuristic design - MÁS VISIBLE */
.welcome-page {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
  padding: 0;
}

body.body--dark .welcome-page {
  background: #1a1a1a;
}

/* Animated background orbs - más visibles */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.2;
  animation: float 20s infinite ease-in-out;
  pointer-events: none;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: var(--q-primary);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: var(--q-secondary);
  bottom: -80px;
  right: -80px;
  animation-delay: 7s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: var(--q-primary);
  top: 50%;
  right: -50px;
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

/* Content container */
.welcome-content {
  position: relative;
  z-index: 1;
  max-width: 480px;
  margin: 0 auto;
  padding: 10px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Section */
.header-section {
  text-align: center;
  animation: fadeInDown 0.8s ease;
}

.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 24px;
  background: var(--q-primary);
  backdrop-filter: blur(10px);
  border: 2px solid var(--q-primary);
  margin-bottom: 5px;
  animation: pulse 3s infinite ease-in-out;
}

.logo-icon {
  color: white;
  filter: drop-shadow(0 0 20px var(--q-primary));
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(102, 126, 234, 0);
  }
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--q-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

body.body--dark .welcome-title {
  color: var(--q-primary);
}

.welcome-subtitle {
  font-size: 15px;
  color: #666;
  margin: 0;
  font-weight: 400;
}

body.body--dark .welcome-subtitle {
  color: var(--q-secondary);
}

/* Progress Section */
.progress-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  animation: fadeIn 1s ease 0.3s both;
}

.progress-ring-container {
  position: relative;
  margin-bottom: 16px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-track {
  fill: none;
  stroke: var(--q-primary);
  stroke-width: 8;
  opacity: 0.3;
}

.progress-ring-fill {
  fill: none;
  stroke: var(--q-positive);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 439.8;
  transition: stroke-dashoffset 1s ease;
  filter: drop-shadow(0 0 10px var(--q-positive));
}

.progress-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percentage {
  font-size: 36px;
  font-weight: 700;
  color: var(--q-positive);
  line-height: 1;
  margin-bottom: 4px;
}

.progress-label {
  font-size: 12px;
  color: var(--q-positive);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.progress-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--q-primary);
  backdrop-filter: blur(10px);
  border: 1px solid var(--q-primary);
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.stat-item .q-icon {
  color: white;
}

/* Tasks Section */
.tasks-section {
  flex: 1;
  margin-bottom: 24px;
  animation: fadeInUp 1s ease 0.5s both;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  margin-bottom: 12px;
  background-color: white;
  backdrop-filter: blur(10px);
  border: 2px solid var(--q-primary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .task-item {
  background-color: #2a2a2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.task-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.task-item:active {
  transform: scale(0.98);
}

.task-item:hover::before {
  opacity: 0.1;
}

.task-icon {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--q-primary);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.task-item:hover .task-icon {
  transform: scale(1.1);
}

.task-icon .q-icon {
  color: white;
}

.task-completed .task-icon {
  background: #10b981;
}

.task-completed .task-icon .q-icon {
  color: white;
}

.task-info {
  position: relative;
  z-index: 1;
  flex: 1;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.3;
}

body.body--dark .task-title {
  color: var(--q-primary);
}

.task-caption {
  font-size: 13px;
  color: #666;
  line-height: 1.3;
}

body.body--dark .task-caption {
  color: var(--q-secondary);
}

.task-action {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--q-primary);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.task-item:hover .task-action {
  transform: translateX(4px);
}

.task-action .q-icon {
  color: white;
}

.task-completed {
  opacity: 0.8;
}

.task-completed .task-action {
  background: #10b981;
}

.task-completed .task-action .q-icon {
  color: white;
}

/* Action Section */
.action-section {
  animation: fadeInUp 1s ease 0.7s both;
}

.primary-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 32px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  border: none;
  border-radius: 16px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.primary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.primary-button:hover::before {
  left: 100%;
}

.primary-button:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.primary-button .q-icon {
  font-size: 24px;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 380px) {
  .welcome-content {
    padding: 24px 16px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .progress-percentage {
    font-size: 32px;
  }

  .task-item {
    padding: 16px;
  }

  .task-title {
    font-size: 15px;
  }

  .primary-button {
    padding: 16px 24px;
    font-size: 15px;
  }
}

/* Safe area for notch devices */
@supports (padding: max(0px)) {
  .welcome-content {
    padding-top: max(32px, env(safe-area-inset-top));
    padding-bottom: max(32px, env(safe-area-inset-bottom));
    padding-left: max(20px, env(safe-area-inset-left));
    padding-right: max(20px, env(safe-area-inset-right));
  }
}

/* Modal de tareas mejorado */
.tasks-modal-card {
  width: 450px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

body.body--dark .tasks-modal-card {
  background: #1e1e1e;
}

.tasks-modal-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  padding: 32px 24px;
  text-align: center;
  position: relative;
  color: white;
}

.header-icon {
  color: white;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
  color: white;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.95;
  color: white;
}

.close-btn-modal {
  position: absolute;
  top: 12px;
  right: 12px;
}

.tasks-list-section {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.task-card-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

body.body--dark .task-card-item {
  background: #2a2a2a;
  border-color: #3a3a3a;
}

.task-card-item:hover {
  border-color: var(--q-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .task-card-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.task-card-item:active {
  transform: translateY(0);
}

.task-card-item.task-completed {
  opacity: 0.6;
  cursor: not-allowed;
  border-color: #4caf50;
}

.task-card-item.task-completed:hover {
  transform: none;
  box-shadow: none;
}

.task-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--q-primary);
  color: white;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.task-card-item:hover .task-card-icon {
  transform: scale(1.1);
}

.task-card-item.task-completed .task-card-icon {
  background: #4caf50;
}

.task-card-content {
  flex: 1;
  min-width: 0;
}

.task-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

body.body--dark .task-card-title {
  color: #f5f5f5;
}

.task-card-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

body.body--dark .task-card-description {
  color: #aaa;
}

.task-card-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(var(--q-primary-rgb), 0.1);
  color: var(--q-primary);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.task-card-item:hover .task-card-arrow {
  background: var(--q-primary);
  color: white;
  transform: translateX(4px);
}

/* Responsive */
@media (max-width: 480px) {
  .tasks-modal-card {
    width: 95vw;
  }

  .tasks-modal-header {
    padding: 24px 16px;
  }

  .header-title {
    font-size: 20px;
  }

  .tasks-list-section {
    padding: 16px;
  }

  .task-card-item {
    padding: 14px;
  }

  .task-card-icon {
    width: 44px;
    height: 44px;
  }

  .task-card-title {
    font-size: 15px;
  }

  .task-card-description {
    font-size: 12px;
  }
}
</style>
