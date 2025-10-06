import { boot } from 'quasar/wrappers'
import { useThemeStore } from 'src/stores/themeStore'

export default boot(({ app }) => {
  // Inicializar el store de temas
  const themeStore = useThemeStore()
  
  // Cargar el tema guardado al iniciar la aplicación
  themeStore.initTheme()
  
  // Hacer el store disponible globalmente si es necesario
  app.config.globalProperties.$themeStore = themeStore
})
