import { jsPDF } from 'jspdf'
import { formatDate } from './mixins'

export const status = {
  pending: {
    label: 'Pendiente',
    color: 'primary'
  },
  cancelled: {
    label: 'Anulada',
    color: 'negative'
  },
  on_process: {
    label: 'En proceso',
    color: 'teal'
  },
  finished: {
    label: 'Finalizado',
    color: 'positive'
  },
  delivered: {
    label: 'Entregado',
    color: 'info'
  }
}
/**
 * Print invoice
 * @param {Object} data invoice saved
 */
export const printTicket = (data, userSession) => {
  const { company_session: companySession } = userSession
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

  doc.text(companySession?.name?.toUpperCase(), centrarTexto(companySession?.name?.toUpperCase()), y)
  y += 5
  doc.text(companySession?.address?.toUpperCase(), centrarTexto(companySession?.address?.toUpperCase()), y)
  y += 5
  doc.text(companySession?.phone_number, centrarTexto(companySession?.phone_number), y)

  y += 5
  doc.text(companySession?.document_number?.toUpperCase(), centrarTexto(companySession?.document_number), y)

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
/**
 * Print invoice
 * @param {Object} data invoice saved
 */
export const printInvoice = (data, userSession) => {
  const { company_session: companySession } = userSession
  const JsPdf = jsPDF

  const altura = 40 + data.products.length * 5 + 95

  const doc = new JsPdf({
    unit: 'mm',
    format: [94, altura]
  })

  doc.setFont('Courier', 'normal')
  doc.setFontSize(10)

  const pageWidth = 94
  let y = 10

  const centrarTexto = (texto) => {
    const textWidth = doc.getTextWidth(texto)
    return (pageWidth - textWidth) / 2
  }

  doc.text(companySession?.name?.toUpperCase(), centrarTexto(companySession?.name?.toUpperCase()), y)
  y += 4
  doc.text(companySession?.address?.toUpperCase(), centrarTexto(companySession?.address?.toUpperCase()), y)
  y += 4
  doc.text(companySession?.phone_number, centrarTexto(companySession?.phone_number), y)
  y += 4
  doc.text(companySession?.document_number?.toUpperCase(), centrarTexto(companySession?.document_number), y)

  y += 4
  doc.text('----------------------------------------', 5, y)
  y += 4

  doc.text(`NRO: ${data.code}`, 5, y)
  y += 4
  doc.text(`CLIENTE: ${data?.client?.name} ${data?.client?.last_name || ''}`, 5, y)
  y += 4
  doc.text(`FECHA: ${formatDate(data.created_at, 'DD/MM/YYYY')}`, 5, y)
  y += 4
  doc.text(`HORA: ${formatDate(data.created_at, 'HH:mm:ss')}`, 5, y)
  y += 4
  doc.text(`MESERO: ${data?.seller?.name} ${data?.seller?.last_name || ''}`, 5, y)
  y += 4
  doc.text(`TIPO: ${data?.invoice_type?.name}`, 5, y)
  y += 4

  if (data?.tables?.length > 0) {
    data?.tables?.forEach((table) => {
      doc.text(`MESA: ${table?.name} Sala ${table.living_room?.name}`, 5, y)
      y += 4
    })
  }

  doc.text('----------------------------------------', 5, y)
  y += 4

  doc.text('Cant./Precio Unit', 5, y)
  doc.text('IMPORTE', 90, y, { align: 'right' })
  y += 4
  doc.text('Descripción', 5, y)
  y += 4

  doc.text('----------------------------------------', 5, y)

  y += 4
  data.products.forEach((product) => {
    const cantidadPrecio = `${product.pivot.amount} X ${product.pivot.price.toFixed(2)}`
    const subtotal = (product.pivot.amount * product.pivot.price).toFixed(2)

    doc.text(cantidadPrecio, 5, y)
    doc.text(subtotal, 90, y, { align: 'right' })
    y += 4

    const maxWidth = 60
    const description = doc.splitTextToSize(product.name, maxWidth)
    description.forEach((linea) => {
      doc.text(linea, 5, y)
      y += 4
    })
  })

  doc.text('----------------------------------------', 5, y)
  y += 4

  doc.text('TOTAL', 5, y)
  doc.text(data.total.toFixed(2), 90, y, { align: 'right' })
  y += 4

  doc.text('----------------------------------------', 5, y)
  y += 4
  doc.text('¡GRACIAS POR SU COMPRA!', centrarTexto('¡GRACIAS POR SU COMPRA!'), y)

  return doc
}

const sum = (data) => {
  return data.reduce((a, b) => a + b.pivot.amount, 0)
}
