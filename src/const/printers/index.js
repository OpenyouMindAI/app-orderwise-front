import { Device } from '@capacitor/device'
import { authentication } from 'src/stores/module-authentication'
import { companyConfig } from 'src/boot/company-config'
import { notify } from '../mixins'
import { sendCommand, sendTicket, sendInvoice } from './preview'
import { directCommandPrint, directTicketPrint } from './bluetooth'

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
    if (!companyConfig.other.directPrint) {
      await sendCommand(data, user)
      return
    }
    const printerSelected = printer || companyConfig.printer
    directCommandPrint(printerSelected, data, device)
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
    if (!companyConfig.other.directPrint) {
      await sendTicket(data, user)
      return
    }
    const printerSelected = printer || companyConfig.printer
    directTicketPrint(printerSelected, data, device)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Print ticket
 * @param {Object} data data
 * @param {Object} printer printer
 */
export const invoicePrint = async (data, printer = null) => {
  try {
    const { user } = await getConfig()
    await sendInvoice(data, user)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}
