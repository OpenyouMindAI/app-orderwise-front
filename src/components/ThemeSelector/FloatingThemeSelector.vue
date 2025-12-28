<template>
  <q-dialog v-model="showDialog" persistent v-if="!isWelcomePage">
    <q-card class="theme-selector-card">
      <q-card-section class="card-header">
        <div class="header-content">
          <q-icon name="palette" size="32px" color="white" />
          <div>
            <h3 class="header-title">Personaliza tu Tema</h3>
            <p class="header-subtitle">Elige la paleta de colores que más te guste</p>
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          color="white"
          @click="closeForever"
          class="close-btn"
        >
          <q-tooltip>Cerrar y no mostrar de nuevo</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-card-section class="themes-grid">
        <div
          v-for="(theme, key) in themes"
          :key="key"
          class="theme-card"
          :class="{ active: currentTheme === key }"
          @click="selectTheme(key)"
        >
          <div class="theme-preview">
            <div class="preview-gradient" :style="{ background: theme.gradient }"></div>
            <div class="preview-colors">
              <div class="color-dot" :style="{ background: theme.primary }"></div>
              <div class="color-dot" :style="{ background: theme.secondary }"></div>
              <div class="color-dot" :style="{ background: theme.primaryDark }"></div>
            </div>
          </div>
          <div class="theme-info">
            <span class="theme-name">{{ theme.name }}</span>
            <q-icon
              v-if="currentTheme === key"
              name="check_circle"
              size="20px"
              color="positive"
              class="check-icon"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="card-actions">
        <q-btn
          flat
          label="No mostrar de nuevo"
          color="grey-7"
          @click="closeForever"
          no-caps
        />
        <q-btn
          unelevated
          label="Aplicar Tema"
          color="primary"
          @click="applyAndClose"
          no-caps
          class="apply-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useThemeStore } from 'src/stores/themeStore'
import { useTourStore } from 'src/stores/tourStore'
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'FloatingThemeSelector',
  setup () {
    const themeStore = useThemeStore()
    const tourStore = useTourStore()
    const route = useRoute()
    const showDialog = ref(themeStore.showThemeSelector)
    const selectedTheme = ref(themeStore.currentTheme)

    // Detectar si estamos en WelcomePage
    const isWelcomePage = computed(() => route.name === 'Welcome')

    const themes = computed(() => themeStore.allThemes)
    const currentTheme = computed(() => selectedTheme.value)

    // Sincronizar con el store
    watch(() => themeStore.showThemeSelector, (newVal) => {
      showDialog.value = newVal
    })

    // Variable para rastrear estado anterior del tour
    let previousTourState = tourStore.isActive

    // Cerrar automáticamente si se detecta un tour activo
    const checkTourStatus = () => {
      // Tour se activó
      if (tourStore.isActive && !previousTourState && showDialog.value) {
        tourStore.setPendingModal('themeSelector', true)
        showDialog.value = false
        themeStore.showThemeSelector = false
      }

      // Tour terminó
      if (!tourStore.isActive && previousTourState) {
        if (tourStore.getPendingModal('themeSelector')) {
          setTimeout(() => {
            showDialog.value = true
            themeStore.showThemeSelector = true
          }, 500)
        }
      }

      previousTourState = tourStore.isActive
    }

    // Verificar cada 500ms si hay un tour activo
    const intervalId = setInterval(checkTourStatus, 500)

    // Limpiar el intervalo cuando el componente se desmonte
    onUnmounted(() => {
      clearInterval(intervalId)
    })

    const selectTheme = (themeName) => {
      selectedTheme.value = themeName

      // Aplicar inmediatamente para vista previa
      themeStore.setTheme(themeName)
    }

    const closeSelector = () => {
      showDialog.value = false
      themeStore.showThemeSelector = false
    }

    const closeForever = () => {
      // Asegurar que el tema actual esté guardado
      themeStore.setTheme(selectedTheme.value)
      themeStore.hideThemeSelector()
      showDialog.value = false
    }

    const applyAndClose = () => {
      // Guardar el tema seleccionado
      themeStore.setTheme(selectedTheme.value)
      closeSelector()
    }

    return {
      showDialog,
      themes,
      currentTheme,
      selectedTheme,
      selectTheme,
      closeSelector,
      closeForever,
      applyAndClose,
      isWelcomePage
    }
  }
}
</script>

<style scoped lang="scss">
.theme-selector-card {
  width: 700px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-title {
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.theme-card {
  cursor: pointer;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.theme-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--primary);
}

.theme-card.active {
  border-color: var(--primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.theme-preview {
  position: relative;
  height: 80px;
}

.preview-gradient {
  width: 100%;
  height: 100%;
}

.preview-colors {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.theme-info {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.theme-name {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  flex: 1;
}

.check-icon {
  flex-shrink: 0;
}

.card-actions {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.apply-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 12px;
}

/* Scrollbar personalizado */
.themes-grid::-webkit-scrollbar {
  width: 6px;
}

.themes-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.themes-grid::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 10px;
}

.themes-grid::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

/* Responsive */
@media (max-width: 600px) {
  .themes-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
  }

  .theme-card {
    min-width: 0;
  }

  .header-title {
    font-size: 20px;
  }

  .header-subtitle {
    font-size: 12px;
  }
}
</style>
