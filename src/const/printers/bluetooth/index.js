import { printTicket, printCommand as printCommandWindows } from './windows'
import { printCommand, printTicket as printTicketAndroid } from './android'

/**
 * Print ticket direct
 * @param {Object} printer printer data
 * @param {Object} data invoice data
 * @param {Object} device device data
 */

export const directTicketPrint = async (printer, data, device) => {
  switch (device.platform) {
    case 'android':
      if (device.name === printer.device) {
        await printTicketAndroid(data, printer, device)
      } else {
        await printTicket(data, printer)
      }
      break
    case 'web':
      await printTicket(data, printer)
      break
    default:
      alert('No se pudo imprimir')
      break
  }
}

/**
 * Print command direct
 * @param {Object} printer printer data
 * @param {Object} data invoice data
 * @param {Object} device device data
 */

export const directCommandPrint = async (printer, data, device, config) => {
  switch (device.platform) {
    case 'android':
      if (device.name === printer.device) {
        printCommand(data, config)
      } else {
        printCommandWindows(data, printer)
      }
      break
    case 'web':
      printCommandWindows(data, printer)
      break
    default:
      alert('No se pudo imprimir')
      break
  }
}
