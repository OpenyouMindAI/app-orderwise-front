import { boot } from 'quasar/wrappers'

export default boot(async () => {
  // Only use MSW in development
  if (process.env.DEV) {
    const { worker } = await import('../mocks/browser')
    // Start MSW Service Worker
    await worker.start({
      onUnhandledRequest: 'bypass' // Ignore requests that aren't mocked
    })
    console.log('[MSW] Mocking is enabled in development.')
  }
})
