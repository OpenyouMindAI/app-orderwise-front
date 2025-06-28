import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'

/**
 * Print ticket
 * @param {Object} data invoice data
 * @param {Object} printer printer data
 */
export const printTicket = async (data, printer) => {
  try {
    await api.get(`print/${data.id}`, {
      printer: printer.name,
      type: 'ticket'
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Print command
 * @param {Object} data invoice data
 * @param {Object} printer printer data
 */
export const printCommand = async (data, printer) => {
  try {
    await api.get(`print/${data.id}`, {
      printer: printer.name,
      type: 'command'
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}
