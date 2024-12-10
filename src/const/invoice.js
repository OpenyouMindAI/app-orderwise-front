import { jsPDF } from 'jspdf'
import { formatDate } from './mixins'
/**
 * Print invoice
 * @param {Object} data invoice saved
 */
export const printTicket = (data) => {
  console.log(data)
  const JsPdf = jsPDF
  const altura = 40 + data.products.length * 5 + 70

  const doc = new JsPdf({
    unit: 'mm',
    format: [80, altura]
  })

  doc.setFont('Courier', 'normal')
  doc.setFontSize(10)

  const pageWidth = 80
  let y = 5

  const centrarTexto = (texto) => {
    const textWidth = doc.getTextWidth(texto)
    return (pageWidth - textWidth) / 2
  }

  doc.text('LO DE LA ABUELA', centrarTexto('LO DE LA ABUELA'), y)
  y += 5
  doc.text('TENIENTE IBANEZ 2911', centrarTexto('TENIENTE IBANEZ 2911'), y)
  y += 5
  doc.text('(555) 123 4567', centrarTexto('(555) 123 4567'), y)
  y += 5
  doc.text('RFC0313282AB1', centrarTexto('RFC0313282AB1'), y)
  y += 5
  doc.text('--------------------------------', centrarTexto('--------------------------------'), y)
  y += 5

  doc.text(`NRO: ${data.code}`, 5, y)
  y += 5
  doc.text(`CLIENTE: ${data?.client?.name} ${data?.client?.last_name || ''}`, 5, y)
  y += 5
  doc.text(`FECHA: ${formatDate(data.created_at, 'DD/MM/YYYY')}`, 5, y)
  y += 5
  doc.text(`HORA: ${formatDate(data.created_at, 'HH:mm:ss')}`, 5, y)
  y += 5
  doc.text(`MESERO: ${data?.seller?.name} ${data?.seller?.last_name || ''}`, 5, y)
  y += 5
  doc.text(`TIPO: ${data?.invoice_type?.name}`, 5, y)
  y += 5
  if (data?.tables?.length > 0) {
    data?.tables?.forEach((table) => {
      doc.text(`MESA: ${table?.name} Sala ${table.living_room?.name}`, 5, y)
      y += 5
    })
  }
  doc.text('--------------------------------', 5, y)
  y += 5

  doc.text('ARTICULO', 5, y)
  doc.text('CANT', 65, y)
  y += 5

  const maxWidth = 55

  data.products.forEach((product) => {
    const lines = doc.splitTextToSize(product.name, maxWidth)
    lines.forEach((linea, index) => {
      if (index === 0) {
        doc.text(linea, 5, y)
        doc.text(`${product.pivot.amount}`, 68, y)
      } else {
        doc.text(linea, 5, y)
      }
      y += 5
    })
  })

  doc.text('--------------------------------', 5, y)
  y += 5
  doc.text('TOTAL', 5, y)
  doc.text(String(sum(data.products)), 68, y)
  y += 5

  doc.text('--------------------------------', 5, y)
  y += 5
  doc.text('¡GRACIAS POR SU COMPRA!', centrarTexto('¡GRACIAS POR SU COMPRA!'), y)

  return doc
}

const sum = (data) => {
  return data.reduce((a, b) => a + b.pivot.amount, 0)
}
