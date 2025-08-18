import { Device } from '@capacitor/device'
import { authentication } from 'src/stores/module-authentication'
import { companyConfig } from 'src/boot/company-config'
import { notify } from '../mixins'
import { sendCommand, sendTicket, sendInvoice } from './preview'
import { directCommandPrint as directCommandPrintBluetooth, directTicketPrint as directTicketPrintBluetooth } from './bluetooth'
import { printCommandUsb, printTicketUsb } from './usb'

/**
 * Get config
 * @returns {Object} config
 */
const getConfig = async () => {
  const device = await Device.getInfo()
  const store = authentication()
  return {
    device,
    user: store?.userSession,
    branchOffice: store?.branchOffice
  }
}

/**
 * Print command
 * @param {Object} data data
 * @param {Object} printer printer
 */

export const commandPrint = async (data, printer = null) => {
  try {
    const { device, user } = await getConfig()
    if (!companyConfig?.other?.directPrint) {
      await sendCommand(data, user)
      return
    }
    const printerSelected = printer || companyConfig.printer
    if (printerSelected.type === 'USB') {
      printCommandUsb(data, companyConfig?.other?.printer)
    } else {
      directCommandPrintBluetooth(
        printerSelected,
        data,
        device,
        companyConfig?.other?.printer
      )
    }
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Print ticket
 * @param {Object} data data
 * @param {Object} printer printer
 */

export const ticketPrint = async (data, printer = null) => {
  try {
    const { device, user } = await getConfig()
    if (!companyConfig?.other?.directPrint) {
      await sendTicket(data, user)
      return
    }
    const printerSelected = printer || companyConfig.printer
    if (printerSelected.type === 'USB') {
      printTicketUsb(data, companyConfig?.other?.printer)
    } else {
      directTicketPrintBluetooth(printerSelected, data, device)
    }
  } catch (error) {
    console.error(error)
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Print ticket
 * @param {Object} data data
 * @param {Object} printer printer
 */
export const invoicePrint = async (data) => {
  try {
    const { user } = await getConfig()
    await sendInvoice(data, user)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}
