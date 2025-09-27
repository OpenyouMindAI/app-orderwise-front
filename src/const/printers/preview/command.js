import { formatDate, formatNumber } from '../../mixins'
import { cutWords, header, sum } from '../common'

/**
 * Print command
 * @param {Object} data data
 * @param {Object} userSession user session
 * @returns {Object} jsPDF
 */
export const previewCommand = async (data, userSession) => {
  let y = 5
  const { company_session: companySession } = userSession

  const { doc, pageWidth, maxWidth } = header(data, companySession)

  const centrarTexto = (texto) => {
    const textWidth = doc.getTextWidth(texto)
    return (pageWidth - textWidth) / 2
  }

  y = cutWords(companySession?.name?.toUpperCase(), 55, doc, y, true)
  // y = cutWords(companySession?.address?.toUpperCase(), 55, doc, y, true)
  // doc.text(companySession?.phone_number, centrarTexto(companySession?.phone_number), y)

  // y += 5
  // doc.text(companySession?.document_number, centrarTexto(companySession?.document_number), y)

  // y += 5
  doc.text('--------------------------------', 5, y)
  y += 5

  doc.text(`NRO: ${data.code}`, 5, y)
  y += 5
  doc.text(`CLIENTE: ${data?.client?.name} ${data?.client?.last_name || ''}`, 5, y)
  y += 5
  doc.text(`TIPO DE SERVICIO: ${data?.type_of_service?.name || '-'}`, 5, y)
  y += 5
  doc.text(`CLIENTE: ${data?.client?.name} ${data?.client?.last_name || ''}`, 5, y)
  y += 5
  doc.text(`FECHA: ${formatDate(data.created_at, 'DD/MM/YYYY HH:mm:ss')}`, 5, y)
  // y += 5
  // doc.text(`HORA: ${formatDate(data.created_at, 'HH:mm:ss')}`, 5, y)
  if (data?.seller) {
    y += 5
    doc.text(`Vendedor: ${data?.seller?.name || ''} ${data?.seller?.last_name || ''}`, 5, y)
  }
  y += 5
  if (data?.tables?.length > 0) {
    data?.tables?.forEach((table) => {
      doc.text(`MESA: ${table?.name} Sala ${table.living_room?.name || ''}`, 5, y)
      y += 5
    })
  }
  doc.text('--------------------------------', 5, y)
  y += 5

  doc.text('ARTICULO', 5, y)
  doc.text('CANT', 65, y)
  y += 5

  // const maxWidth = 55

  data.products.forEach((product) => {
    const lines = doc.splitTextToSize(product.name, maxWidth)
    lines.forEach((linea, index) => {
      if (index === 0) {
        doc.text(linea, 5, y)
        doc.text(formatNumber(product.pivot.amount), 65, y)
      } else {
        doc.text(linea, 5, y)
      }
      y += 5
    })
    if (product.pivot.observation) {
      const observationLines = doc.splitTextToSize(`Observación: ${product.pivot.observation}`, maxWidth)
      observationLines.forEach((linea) => {
        doc.text(linea, 5, y)
        y += 5
      })
    }
  })
  if(data.promotions) {
    data.promotions.forEach((product) => {
    const lines = doc.splitTextToSize(product.name, maxWidth)
    lines.forEach((linea, index) => {
      if (index === 0) {
        doc.text(linea, 5, y)
        doc.text(formatNumber(product.pivot.quantity), 65, y)
      } else {
        doc.text(linea, 5, y)
      }
      y += 5
    })
    if (product.pivot.observation) {
      const observationLines = doc.splitTextToSize(`Observación: ${product.pivot.observation}`, maxWidth)
      observationLines.forEach((linea) => {
        doc.text(linea, 5, y)
        y += 5
      })
    }
  })
  }
  
  doc.text('--------------------------------', 5, y)
  y += 5
  doc.text('TOTAL', 5, y)
  doc.text(String(formatNumber(sum(data.products))), 65, y)
  y += 5
  doc.text('--------------------------------', 5, y)
  y += 5
  if (data.description) {
    y = cutWords(`Descripción: ${data.description}`, maxWidth, doc, y)
    y += 5
    doc.text('--------------------------------', 5, y)
  }
  y += 5
  doc.text('¡GRACIAS POR SU COMPRA!', centrarTexto('¡GRACIAS POR SU COMPRA!'), y)

  return doc
}
