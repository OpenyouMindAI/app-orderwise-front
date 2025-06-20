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
  window.open(pdfUrl, '_blank')
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
