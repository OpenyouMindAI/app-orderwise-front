// src/boot/msw.js
import { boot } from 'quasar/wrappers'

// Conditionally import and start MSW in development mode
export default boot(async () => {
  if (process.env.DEV) {
    try {
      const { worker } = await import('../mocks/browser')
      await worker.start({
        onUnhandledRequest: 'bypass' // Let unhandled requests pass through
      })
      console.log('MSW: Mock Service Worker started successfully.')
    } catch (error) {
      console.error('MSW: Failed to start Mock Service Worker.', error)
    }
  }
})
