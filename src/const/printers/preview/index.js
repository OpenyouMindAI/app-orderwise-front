import {
  previewCommand
} from './command'

import {
  previewTicket,
  previewInvoice
} from './ticket'

/**
 * Preview
 */
export const sendTicket = async (data, userSession) => {
  const doc = await previewTicket(data, userSession)
  const pdfUrl = doc.output('bloburl')
  const newWindow = window.open(pdfUrl, '_blank')

  if (!newWindow) {
    // Fallback: descargar el PDF si el navegador bloquea ventanas emergentes
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `factura-${data.code || Date.now()}.pdf`
    link.click()
  }
}
/**
 * Preview
 */
export const sendInvoice = async (data, userSession) => {
  const doc = await previewInvoice(data, userSession)
  const pdfUrl = doc.output('bloburl')
  window.open(pdfUrl, '_blank')
}
/**
 * Preview
 */
export const sendCommand = async (data, userSession) => {
  const doc = await previewCommand(data, userSession)
  const pdfUrl = doc.output('bloburl')
  window.open(pdfUrl, '_blank')
}
