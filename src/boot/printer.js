import { boot } from 'quasar/wrappers'
import { Printer } from 'printers'

export default boot(async ({ app }) => {
  // // Listen for printer connection events
  // Printer.addListener('printerConnected', (data) => {
  //   console.log('Impresora conectada:', data)
  //   // Puedes almacenar la impresora conectada en tu store o estado global
  //   app.config.globalProperties.$printer = data
  // })

  // // Check for already connected printers
  // const result = await Printer.getConnectedPrinters()
  // if (result.printer) {
  //   app.config.globalProperties.$printer = result.printer
  // }
})

export { Printer }
