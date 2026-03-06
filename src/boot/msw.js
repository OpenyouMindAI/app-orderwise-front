import { boot } from 'quasar/wrappers'

export default boot(async () => {
  // Solo en desarrollo y si la variable está activa
  if (process.env.DEV && !process.env.SERVER && import.meta.env.VITE_USE_MSW === 'true') {
    const { worker } = await import('../mocks/browser')

    // Este await es FUNDAMENTAL para que interceptar funcione incluso tras un F5 rápido.
    // Detiene la app hasta que el Service Worker esté registrado y activo.
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    })

    console.warn(`[MSW] Mocking habilitado sobre: ${import.meta.env.VITE_APP_API_URL}`)
  }
})
