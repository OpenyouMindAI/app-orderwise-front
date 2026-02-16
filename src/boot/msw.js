import { boot } from 'quasar/wrappers'

export default boot(async ({ app }) => {
  if (process.env.DEV || import.meta.env.VITE_API_MOCK === 'true') {
    const { worker } = await import('../mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass'
    })
  }
})
