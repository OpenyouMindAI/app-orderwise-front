import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'

export const printTicket = async (data, printer) => {
  try {
    await api.get(`print/${data.id}`, {
      printer: printer.name
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}
