import { printTicket } from './windows'

export const directTicketPrint = async (printer, data, device) => {
  console.log({ printer, data, device })
  switch (device.platform) {
    case 'android':
      console.log('android')
      break
    case 'web':
      await printTicket(data, printer)
      break
    default:
      alert('No se pudo imprimir')
      break
  }
}

export const directCommandPrint = async (printer, data, device) => {
  switch (device.platform) {
    case 'android':
      console.log('android')
      break
    case 'web':
      console.log('ios')
      break
    default:
      alert('No se pudo imprimir')
      break
  }
}
