import { Device } from '@capacitor/device'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import {
  previewCommand
} from './command'

import {
  previewTicket,
  previewInvoice
} from './ticket'

/**
 * Common handler to open/share PDF based on platform
 * @param {Object} doc - jsPDF instance
 * @param {String} fileName - desired file name
 * @param {String} title - share dialog title
 */
const handlePdfOutput = async (doc, fileName, title = 'Compartir Documento') => {
  try {
    const info = await Device.getInfo()

    if (info.platform === 'web') {
      const pdfUrl = doc.output('bloburl')
      const newWindow = window.open(pdfUrl, '_blank')

      if (!newWindow) {
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = fileName
        link.click()
      }
    } else {
      // Mobile platform (Android/iOS)
      const fileNameWithExt = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
      const base64Data = doc.output('datauristring').split(',')[1]

      // 1. Write the file to local cache
      const savedFile = await Filesystem.writeFile({
        path: fileNameWithExt,
        data: base64Data,
        directory: Directory.Cache
      })

      // 2. Open native sharing (allows View, Save, Send)
      await Share.share({
        title,
        text: `Documento generado: ${fileNameWithExt}`,
        url: savedFile.uri,
        dialogTitle: '¿Qué desea hacer con el documento?'
      })
    }
  } catch (error) {
    console.error('Error handling PDF output:', error)
  }
}

/**
 * Preview Ticket
 */
export const sendTicket = async (data, userSession, branchOffice = null) => {
  const doc = await previewTicket(data, userSession, branchOffice)
  const fileName = `ticket-${data.code || Date.now()}.pdf`
  await handlePdfOutput(doc, fileName, 'Ver/Compartir Ticket')
}

/**
 * Preview Invoice
 */
export const sendInvoice = async (data, userSession, branchOffice = null) => {
  const doc = await previewInvoice(data, userSession, branchOffice)
  const fileName = `factura-${data.code || Date.now()}.pdf`
  await handlePdfOutput(doc, fileName, 'Ver/Compartir Factura')
}

/**
 * Preview Command
 */
export const sendCommand = async (data, userSession, branchOffice = null) => {
  const doc = await previewCommand(data, userSession, branchOffice)
  const fileName = `comanda-${data.code || Date.now()}.pdf`
  await handlePdfOutput(doc, fileName, 'Ver/Compartir Comanda')
}
