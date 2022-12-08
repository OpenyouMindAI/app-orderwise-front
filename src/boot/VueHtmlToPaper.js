import { boot } from 'quasar/wrappers'

import { VueHtmlToPaper } from '../../lib/vue-html-to-paper/dist'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  const options = {
    name: '_blank',
    specs: [
      'fullscreen=yes',
      'titlebar=yes',
      'scrollbars=yes'
    ],
    styles: [
      'src/css/styleInvoice.css'
    ],
    autoClose: true
  }
  app.use(VueHtmlToPaper, options)
})
