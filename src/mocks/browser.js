// Función para inicializar MSW
export const startMocking = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Importación dinámica para evitar problemas de ESLint
      const { setupWorker } = await import('msw/browser')
      const { handlers } = await import('./handlers')

      const worker = setupWorker(...handlers)

      await worker.start({
        onUnhandledRequest: 'bypass'
      })

      console.log('🔧 MSW iniciado - Mocking de APIs activado')

      // Exportar worker para poder detenerlo después
      window.__mswWorker = worker
    } catch (error) {
      console.error('Error al iniciar MSW:', error)
    }
  }
}

// Función para detener MSW
export const stopMocking = () => {
  if (window.__mswWorker) {
    window.__mswWorker.stop()
    console.log('🔧 MSW detenido')
  }
}
