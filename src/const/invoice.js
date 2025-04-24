import { jsPDF } from 'jspdf'
import { formatDate, formatNumber } from './mixins'
import QRCode from 'qrcode'
import qbitsLogo from './logo'
import autoTable from 'jspdf-autotable'

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

const header = (data, companySession, pageWidth = 80) => {
  const JsPdf = jsPDF
  const maxWidth = 55

  let altura = 200
  altura += calculateTextHeight(companySession?.name, maxWidth)
  altura += calculateTextHeight(companySession?.address, maxWidth)
  altura += 5
  altura += 5
  altura += data.products.length * 10
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
const setQrImage = async (data, fields, companySession) => {
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

export const printTicket = (data, userSession) => {
  let y = 5
  const { company_session: companySession } = userSession

  const { doc, pageWidth, maxWidth } = header(data, companySession)

  const centrarTexto = (texto) => {
    const textWidth = doc.getTextWidth(texto)
    return (pageWidth - textWidth) / 2
  }

  y = cutWords(companySession?.name?.toUpperCase(), 55, doc, y, true)
  y = cutWords(companySession?.address?.toUpperCase(), 55, doc, y, true)
  doc.text(companySession?.phone_number, centrarTexto(companySession?.phone_number), y)

  y += 5
  doc.text(companySession?.document_number, centrarTexto(companySession?.document_number), y)

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
  if (data?.seller) {
    y += 5
    doc.text(`Vendedor: ${data?.seller?.name || ''} ${data?.seller?.last_name || ''}`, 5, y)
  }
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

  // const maxWidth = 55

  data.products.forEach((product) => {
    const lines = doc.splitTextToSize(product.name, maxWidth)
    lines.forEach((linea, index) => {
      if (index === 0) {
        doc.text(linea, 5, y)
        doc.text(formatNumber(product.pivot.amount), 68, y)
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

  doc.text('--------------------------------', 5, y)
  y += 5
  doc.text('TOTAL', 5, y)
  doc.text(String(sum(data.products)), 68, y)
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
/**
 * Print invoice
 * @param {Object} data invoice saved
 */
export const printInvoice = async (data, userSession) => {
  let y = 10
  const { company_session: companySession } = userSession
  let fields = null

  if (data.electronic_invoice) {
    fields = data.electronic_invoice.fields
  }
  const { doc, pageWidth } = header(data, companySession, 95)

  const centrarTexto = (texto, valid = false) => {
    const textWidth = doc.getTextWidth(texto)
    return valid ? (pageWidth - textWidth) / 2 : 5
  }

  y = cutWords(`Razón social: ${companySession?.name?.toUpperCase()}`, 65, doc, y, false, 95)
  y = cutWords(`Dirección: ${companySession?.address?.toUpperCase()}`, 65, doc, y, false, 95)
  y = cutWords(`C.U.I.T: ${companySession?.document_number}`, 65, doc, y, false, 95)
  if (data.billing) {
    y = cutWords(`IIBB: ${fields?.income_brut}`, 70, doc, y, false, 95)
    y = cutWords(`Inicio de actividad: ${formatDate(fields?.activity_start_date, 'DD/MM/YYYY')}`, 70, doc, y, false, 95)
  }
  y += 1
  doc.text('----------------------------------------', 5, y)
  y += 7
  if (data.billing) {
    doc.setFontSize(20)
    doc.text(fields?.voucher_type?.Desc, centrarTexto(fields?.voucher_type?.Desc?.toUpperCase(), true), y)
    doc.setFontSize(10)
    y += 5
    doc.text(`Código: ${fields.voucher_type.Id}`, centrarTexto(`Código: ${fields.voucher_type.Id}`, true), y)
    y += 7
  }
  if (!data.billing) {
    doc.text(`NRO: ${data.code}`, 5, y)
  } else {
    doc.text(`NRO: ${data?.electronic_invoice?.fields?.cbte_hasta}`, 5, y)
  }
  y += 4
  doc.text(`CLIENTE: ${data?.client?.name} ${data?.client?.last_name || ''}`, 5, y)
  y += 4
  doc.text(`FECHA: ${formatDate(data.created_at, 'DD/MM/YYYY')}`, 5, y)
  y += 4
  doc.text(`HORA: ${formatDate(data.created_at, 'HH:mm:ss')}`, 5, y)
  if (data?.seller) {
    y += 5
    doc.text(`Vendedor: ${data?.seller?.name || ''} ${data?.seller?.last_name || ''}`, 5, y)
  }
  y += 4
  doc.text(`TIPO: ${data?.invoice_type?.name}`, 5, y)
  y += 4
  if (data.billing) {
    doc.text(`Concepto: ${fields?.concept_type?.Desc}`, 5, y)
    y += 4
  }

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
    const cantidadPrecio = `${formatNumber(product.pivot.amount)} X ${product.pivot.price}`
    const subtotal = (product.pivot.amount * product.pivot.price).toFixed(2)

    doc.text(cantidadPrecio, 5, y)
    if (data.billing) {
      doc.text(`${product.pivot.taxe}%`, 50, y, { align: 'center' })
    }
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

  if (data.billing) {
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
    const qrDataURL = await QRCode.toDataURL(`${url}${encoded}`)
    doc.text(`CAE: ${fields?.cae}`, 5, y)
    y += 4
    doc.text(`Vto: ${formatDate(fields?.caef_ch_vto, 'DD/MM/YYYY')}`, 5, y)
    y += 7
    doc.addImage(qrDataURL, 'PNG', 18, y, 60, 60)
  }

  return doc
}

export async function generarFacturaPDF (invoice, userSession) {
  const JsPdf = jsPDF

  const doc = new JsPdf()
  const { company_session: companySession } = userSession
  const voucherType = invoice.electronic_invoice?.fields?.voucher_type
  doc.setFontSize(14)
  if (companySession.url) {
    try {
      const response = await fetch(companySession.url)
      const blob = await response.blob()
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      doc.addImage(base64, 'PNG', 25, 10, 30, 20)
    } catch (error) {
      console.warn('No se pudo cargar el logo. Mostrando nombre de la empresa.')
      doc.text(companySession.name, 10, 20, { maxWidth: 60 })
    }
  } else {
    doc.text(companySession.name, 10, 20, { maxWidth: 60 })
  }
  doc.setFontSize(10)
  doc.text(`Razón social: ${companySession.name}`, 10, 33, { maxWidth: 70 })
  doc.text(`Domicilio Comercial: ${companySession.address}`, 10, 43, { maxWidth: 70 })
  doc.text('Condición Frente al IVA: Responsable inscrito', 10, 57)

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  const boxWidth = 15
  const boxHeight = 15

  const boxX = (pageWidth - boxWidth) / 2
  const boxY = margin

  doc.setLineWidth(0.5)
  doc.rect(boxX, boxY, boxWidth, boxHeight)

  doc.setFontSize(20)
  const split = voucherType.Desc.split(' ')
  const text = split[1]
  const textWidth = doc.getTextWidth(text)
  const textX = boxX + (boxWidth - textWidth) / 2
  const textY = boxY + boxHeight / 2 + 2

  doc.text(text, textX, textY)
  doc.setFontSize(20)
  doc.text(split[0], 140, 20)
  doc.setFontSize(10)
  doc.text(`Punto de Venta: ${invoice.electronic_invoice?.fields?.point_of_sale}`, 140, 30)
  doc.text(`Comp. Nro: ${invoice.electronic_invoice?.fields?.cbte_hasta}`, 140, 36)
  doc.text(`Fecha de Emisión: ${formatDate(invoice.created_at, 'DD/MM/YYYY')}`, 140, 42)
  doc.text(`CUIT: ${invoice.client.document_number}`, 140, 48)
  doc.text(`Ingresos Brutos: ${invoice?.electronic_invoice?.fields?.income_brut}`, 140, 54)
  doc.text(`Inicio de Actividades: ${invoice?.electronic_invoice?.fields?.activity_start_date}`, 140, 60)

  // Línea: Período
  doc.line(10, 68, 200, 68)
  doc.setFontSize(9)
  doc.text(`Período Facturado Desde: ${formatDate(invoice.created_at, 'DD/MM/YYYY')}`, 10, 74)
  if (invoice.delivery_date) {
    doc.text(`Hasta: ${formatDate(invoice.delivery_date, 'DD/MM/YYYY')}`, 70, 74)
    doc.text(`Fecha de Vto. para el pago: ${formatDate(invoice.delivery_date, 'DD/MM/YYYY')}`, 130, 74)
  }
  doc.line(10, 78, 200, 78)

  doc.setFontSize(10)
  // Cliente
  doc.text(`CUIL/CUIT: ${invoice.client.document_number}`, 10, 84)
  doc.text(`Apellido y Nombre / Razón social: ${invoice.client.name}`, 90, 84)
  doc.text('Condición Frente al IVA: Consumidor final', 10, 90)
  doc.text(`Domicilio: ${invoice.client.address}`, 90, 90)
  doc.text('Condición de venta: Efectivo', 10, 96)
  const body = []
  const head = [
    [
      'Código',
      'Producto / Servicio',
      'Cantidad', 'Precio Unit.',
      'Imp. Bonif.',
      'Subtotal'
    ]
  ]
  // Product details
  invoice.products.forEach((product) => {
    body.push([
      product.barcode,
      product.name,
      product.pivot.amount,
      formatNumber(product.pivot.price),
      formatNumber(product.pivot.taxe),
      formatNumber(Number(product.pivot.amount) * Number(product.pivot.price))
    ])
  })

  autoTable(doc, {
    startY: 105,
    headStyles: { fillColor: [0, 0, 0] },
    head,
    body,
    theme: 'striped',
    styles: { fontSize: 9 },
    tableWidth: pageWidth - 20,
    margin: { left: 10 }
  })

  const finalY = doc.lastAutoTable.finalY + 5

  // Totales
  const labelX = pageWidth - 60
  const valueX = pageWidth - 10

  const format = (value) => {
    if (value) {
      return formatNumber(value).padStart(6, ' ')
    }
    return ''
  }

  doc.line(10, finalY, 200, finalY)
  doc.text('Subtotal: $', labelX, finalY + 5, { align: 'right' })
  doc.text(format(invoice?.subtotal), valueX, finalY + 5, { align: 'right' })
  // Otros tributos
  doc.text('Importe Otros Tributos: $', labelX, finalY + 10, { align: 'right' })
  doc.text(format(invoice?.taxe_total?.toFixed(2)), valueX, finalY + 10, { align: 'right' })
  // Total
  doc.text('Importe total: $', labelX, finalY + 15, { align: 'right' })
  doc.text(format(invoice.total), valueX, finalY + 15, { align: 'right' })

  doc.line(10, finalY + 20, 200, finalY + 20)
  // QR
  const qrBase64 = await setQrImage(invoice, invoice.electronic_invoice.fields, companySession)
  doc.addImage(qrBase64, 'PNG', 5, finalY + 25, 50, 50)
  doc.setFontSize(30)
  doc.text('ARCA', 55, finalY + 45)
  doc.setFontSize(10)
  doc.text('Comprobante autorizado', 55, finalY + 50)
  doc.text(`CAE Nº: ${invoice.electronic_invoice.fields.cae}`, 55, finalY + 55)
  doc.text(`Fecha de Vto. de CAE: ${invoice.electronic_invoice.fields.caef_ch_vto}`, 55, finalY + 60)

  const pageHeight = doc.internal.pageSize.getHeight()

  const logoWidth = 45
  const logoHeight = 15

  const posX = pageWidth - logoWidth - 6
  const posY = pageHeight - logoHeight - 6

  const logoBase64 = qbitsLogo

  doc.addImage(logoBase64, 'PNG', posX, posY, logoWidth, logoHeight)
  doc.setFontSize(10)
  doc.text('Desarrollado por', posX, posY - 2, { align: 'left' })

  return doc
}

const sum = (data) => {
  return data.reduce((a, b) => a + Number(b.pivot.amount), 0)
}

const cutWords = (text, maxWidth, doc, y, center = false, pageWidth = 80) => {
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

const calculateTextHeight = (text, maxWidth) => {
  if (!text) return 0
  const lines = Math.ceil(text.length / (maxWidth / 2))
  return lines * 5
}
