import { boot } from 'quasar/wrappers'

export default boot(async () => {
  if (process.env.DEV && !process.env.SERVER && import.meta.env.VITE_USE_MSW === 'true') {
    const { worker } = await import('../mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass'
    })
  }
})
