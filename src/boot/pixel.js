import { boot } from 'quasar/wrappers'
import { VueFbq } from 'vue3-facebook-pixel'

export default boot(async ({ app }) => {
  app.use(VueFbq, { pixelId: '802568126168744', debug: true })
})
