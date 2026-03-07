import { jsPDF as JsPdf } from 'jspdf'
import { formatDate } from '../mixins'
import QRCode from 'qrcode'

/**
 * Sum amount
 * @param {Number} data amount
 * @returns {Number} sum
 */
export const sum = (data) => {
  return data.reduce((a, b) => a + Number(b.pivot.amount), 0)
}

/**
 * Cut words
 * @param {String} text text
 * @param {Number} maxWidth max width
 * @param {Object} doc jsPDF
 * @param {Number} y y
 * @param {Boolean} center center
 * @param {Number} pageWidth page width
 * @returns {Number} y
 */

export const cutWords = (text, maxWidth, doc, y, center = false, pageWidth = 80) => {
  let currentY = Number(y) || 10
  if (!text) return currentY

  const centrarTexto = (texto) => {
    const textWidth = doc.getTextWidth(texto)
    return (pageWidth - textWidth) / 2
  }
  const lines = doc.splitTextToSize(text, maxWidth)

  lines.forEach((linea) => {
    if (center) {
      doc.text(linea, centrarTexto(linea), currentY)
    } else {
      doc.text(linea, 5, currentY)
    }
    currentY += 5
  })

  return currentY
}

/**
 * Calculate text height
 * @param {String} text text
 * @param {Number} maxWidth max width
 * @returns {Number} height
 */

export const calculateTextHeight = (text, maxWidth) => {
  if (!text || typeof text !== 'string') return 0
  const lines = Math.ceil(text.length / (maxWidth / 2))
  return lines * 5
}

/**
 * Header jsPDF
 * @param {Object} data data
 * @param {Object} companySession company session
 * @param {Number} pageWidth page width
 */

export const header = (data, companySession, pageWidth = 80) => {
  const maxWidth = 55
  let altura = 200

  // Calculate height with fallbacks to avoid NaN
  altura += calculateTextHeight(companySession?.name || '', maxWidth)
  altura += calculateTextHeight(companySession?.address || '', maxWidth)
  altura += 10 // Safe padding

  const productCount = data?.products?.length || 1
  altura += productCount * 10

  if (data.description) {
    altura += calculateTextHeight(`Descripción: ${data.description}`, maxWidth)
    altura += 5
  }
  altura += 10

  // Use positional arguments for JsPdf constructor (more robust across versions)
  const doc = new JsPdf('p', 'mm', [pageWidth, altura])

  doc.setFont('Courier', 'bold')
  doc.setFontSize(10)

  return { doc, pageWidth, companySession, maxWidth }
}

/**
 * Set qr image
 * @param {Object} data data
 * @param {Object} fields qr info
 * @param {Object} companySession company session
 * @returns {String} qr image
 */

export const setQrImage = async (data, fields, companySession, branchOffice = null) => {
  if (!data.billing) {
    const img = JSON.stringify({
      cliente: data.client.name,
      fecha: formatDate(data.date, 'YYYY-MM-DD'),
      total: data.total
    })
    return await QRCode.toDataURL(img)
  }
  const docQr = {
    ver: 1,
    fecha: formatDate(data.date, 'YYYY-MM-DD'),
    // Lógica de herencia: La sucursal manda, si no hay, manda la compañía
    cuit: Number(branchOffice?.document_number || companySession.document_number),
    ptoVta: branchOffice?.point_of_sale || fields.point_of_sale,
    tipoCmp: fields?.voucher_type?.Id,
    nroCmp: fields.cbte_hasta,
    importe: data.total,
    moneda: 'PES',
    tipoDocRec: data?.client?.document_type?.Id || 99,
    nroDocRec: Number(data.client.document_number),
    tipoCodAut: 'E',
    ctz: 1,
    codAut: Number(fields.cae)
  }
  const encoded = btoa(JSON.stringify(docQr))
  const url = 'https://servicioscf.afip.gob.ar/publico/comprobantes/cae.aspx?p='
  return await QRCode.toDataURL(`${url}${encoded}`)
}
