import jsPDF from 'jspdf'
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
  if (!text) return text

  const centrarTexto = (texto) => {
    const textWidth = doc.getTextWidth(texto)
    return (pageWidth - textWidth) / 2
  }
  const lines = doc.splitTextToSize(text, maxWidth)

  lines.forEach((linea) => {
    if (center) {
      doc.text(linea, centrarTexto(linea), y)
    } else {
      doc.text(linea, 5, y)
    }
    y += 5
  })

  return y
}

/**
 * Calculate text height
 * @param {String} text text
 * @param {Number} maxWidth max width
 * @returns {Number} height
 */

export const calculateTextHeight = (text, maxWidth) => {
  if (!text) return 0
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
  const JsPdf = jsPDF
  const maxWidth = 55

  let altura = 200
  altura += calculateTextHeight(companySession?.name, maxWidth)
  altura += calculateTextHeight(companySession?.address, maxWidth)
  altura += 5
  altura += 5
  altura += data?.products?.length || 1 * 10
  if (data.description) {
    altura += calculateTextHeight(`Descripción: ${data.description}`, maxWidth)
    altura += 5
  }
  altura += 10

  const doc = new JsPdf({
    unit: 'mm',
    format: [pageWidth, altura]
  })

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

export const setQrImage = async (data, fields, companySession) => {
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
    cuit: Number(companySession.document_number),
    ptoVta: fields.point_of_sale,
    tipoCmp: fields.voucher_type.Id,
    nroCmp: fields.cbte_hasta,
    importe: data.total,
    moneda: 'PES',
    tipoDocRec: data.client.document_type.Id,
    nroDocRec: Number(data.client.document_number),
    tipoCodAut: 'E',
    ctz: 1,
    codAut: Number(fields.cae)
  }
  const encoded = btoa(JSON.stringify(docQr))
  const url = 'https://servicioscf.afip.gob.ar/publico/comprobantes/cae.aspx?p='
  return await QRCode.toDataURL(`${url}${encoded}`)
}
