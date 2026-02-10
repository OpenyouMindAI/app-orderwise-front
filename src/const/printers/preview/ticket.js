import { jsPDF as JsPdf } from 'jspdf'
import { formatDate, formatNumber } from '../../mixins'
import { cutWords, header, setQrImage } from '../common'
import qbitsLogo from '../../logo'
import autoTable from 'jspdf-autotable'

const addressFormat = (address) => {
  if (typeof address === 'string') {
    return address?.toUpperCase()
  }
  return address?.formattedAddress?.toUpperCase() || ''
}
/**
 * Print invoice
 * @param {Object} data invoice saved
 */
export const previewTicket = async (data, userSession) => {
  let y = 10
  const { company_session: companySession } = userSession
  let fields = null

  if (data.electronic_invoice) {
    fields = data.electronic_invoice.fields
  }
  const { doc, pageWidth } = header(data, companySession, 95)

  const centrarTexto = (texto, valid = false) => {
    const textWidth = doc.getTextWidth(texto || '')
    return valid ? (pageWidth - textWidth) / 2 : 5
  }

  y = cutWords(`Razón social: ${companySession?.name?.toUpperCase() || ''}`, 65, doc, y, false, 95)
  y = cutWords(`Dirección: ${addressFormat(companySession?.address)}`, 65, doc, y, false, 95)
  y = cutWords(`C.U.I.T: ${companySession?.document_number || ''}`, 65, doc, y, false, 95)
  if (data.billing && fields) {
    y = cutWords(`IIBB: ${fields?.income_brut || ''}`, 70, doc, y, false, 95)
    y = cutWords(`Inicio de actividad: ${formatDate(fields?.activity_start_date, 'DD/MM/YYYY')}`, 70, doc, y, false, 95)
  }
  y += 2
  doc.text('----------------------------------------', 5, y)
  y += 7
  if (data.billing && fields?.voucher_type) {
    doc.setFontSize(20)
    const desc = fields.voucher_type.Desc || ''
    doc.text(desc, centrarTexto(desc.toUpperCase(), true), y)
    doc.setFontSize(10)
    y += 5
    doc.text(`Código: ${fields.voucher_type.Id || ''}`, centrarTexto(`Código: ${fields.voucher_type.Id || ''}`, true), y)
    y += 7
  }
  if (data.billing) {
    doc.text(`NRO: 000${fields?.point_of_sale || ''}-000${fields?.cbte_hasta || ''}`, 5, y)
  } else {
    doc.text(`NRO: ${data.code || ''}`, 5, y)
  }
  y += 4
  doc.text(`CLIENTE: ${data?.client?.name || ''} ${data?.client?.last_name || ''}`, 5, y)
  y += 4
  doc.text(`FECHA: ${formatDate(data.created_at, 'DD/MM/YYYY')}`, 5, y)
  y += 4
  doc.text(`HORA: ${formatDate(data.created_at, 'HH:mm:ss')}`, 5, y)
  y += 4
  doc.text(`TIPO: ${data?.invoice_type?.name || ''}`, 5, y)
  y += 4
  if (data.billing && fields?.concept_type) {
    doc.text(`Concepto: ${fields.concept_type.Desc || ''}`, 5, y)
    y += 4
  }

  if (data?.tables?.length > 0) {
    data?.tables?.forEach((table) => {
      doc.text(`MESA: ${table?.name || ''} Sala ${table.living_room?.name || ''}`, 5, y)
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
    const cantidadPrecio = `${formatNumber(product.pivot?.amount || 0)} X ${product.pivot?.price || 0}`
    const subtotal = ((product.pivot?.amount || 0) * (product.pivot?.price || 0)).toFixed(2)

    doc.text(cantidadPrecio, 5, y)
    if (data.billing) {
      doc.text(`${product.pivot?.taxe || 0}%`, 50, y, { align: 'center' })
    }
    doc.text(subtotal, 90, y, { align: 'right' })
    y += 4

    const maxWidth = 60
    const description = doc.splitTextToSize(product.name || '', maxWidth)
    description.forEach((linea) => {
      doc.text(linea, 5, y)
      y += 4
    })
  })

  // Validar que promotions existe y es un array antes de iterar
  if (data.promotions && Array.isArray(data.promotions)) {
    data.promotions.forEach((product) => {
      const cantidadPrecio = `${formatNumber(product.pivot?.quantity || 0)} X ${product.pivot?.price || 0}`
      const subtotal = ((product.pivot?.quantity || 0) * (product.pivot?.price || 0)).toFixed(2)

      doc.text(cantidadPrecio, 5, y)
      if (data.billing) {
        doc.text(`${product.pivot?.taxe || 0}%`, 50, y, { align: 'center' })
      }
      doc.text(subtotal, 90, y, { align: 'right' })
      y += 4

      const maxWidth = 60
      const description = doc.splitTextToSize(product.name || '', maxWidth)
      description.forEach((linea) => {
        doc.text(linea, 5, y)
        y += 4
      })
    })
  }

  doc.text('----------------------------------------', 5, y)
  y += 4

  doc.text('TOTAL', 5, y)
  doc.text((data.total || 0).toFixed(2), 90, y, { align: 'right' })
  y += 4

  doc.text('----------------------------------------', 5, y)
  y += 4

  if (data.billing && fields) {
    const qrDataURL = await setQrImage(data, fields, companySession)
    doc.text(`CAE: ${fields?.cae || ''}`, 5, y)
    y += 4
    doc.text(`Vto: ${formatDate(fields?.caef_ch_vto, 'DD/MM/YYYY')}`, 5, y)
    y += 7
    doc.addImage(qrDataURL, 'PNG', 18, y, 60, 60)
  }

  return doc
}

export async function previewInvoice (invoice, userSession) {
  const doc = new JsPdf()
  const companySession = invoice.company
  const voucherType = invoice.electronic_invoice?.fields?.voucher_type || {}

  // -- Helper functions
  const drawBox = (x, y, w, h) => {
    doc.setLineWidth(0.1)
    doc.rect(x, y, w, h)
  }

  const PAGE_WIDTH = 210
  const MARGIN = 10
  const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)
  const MID_X = PAGE_WIDTH / 2
  let cursorY = 10

  // --- HEADER SECTION ---
  const headerHeight = 45
  drawBox(MARGIN, cursorY, CONTENT_WIDTH, headerHeight)

  // Vertical line
  doc.line(MID_X, cursorY, MID_X, cursorY + headerHeight)

  // Letter Box (Standard Factura Style)
  const boxSize = 12
  const boxX = MID_X - (boxSize / 2)
  const boxY = cursorY

  doc.setFillColor(255, 255, 255)
  doc.rect(boxX, boxY, boxSize, boxSize, 'F')
  doc.rect(boxX, boxY, boxSize, boxSize)

  // Letter
  doc.setFontSize(22) // Reduced slightly
  doc.setFont(undefined, 'bold')
  const letter = voucherType.Desc ? voucherType.Desc.split(' ')[1] : 'B'
  doc.text(letter, MID_X, boxY + 7.5, { align: 'center' })

  // Code below letter
  doc.setFontSize(7)
  doc.setFont(undefined, 'normal')
  const code = voucherType.Id ? String(voucherType.Id).padStart(3, '0') : '006'
  doc.text(`COD. ${code}`, MID_X, boxY + boxSize - 1.5, { align: 'center' })

  // Left Header Content
  const leftX = MARGIN + 4
  let leftY = cursorY + 10

  // Logo
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
      doc.addImage(base64, 'PNG', leftX, cursorY + 2, 40, 15)
      leftY = cursorY + 18
    } catch (e) {
      console.warn('Logo error', e)
      leftY = cursorY + 8
    }
  } else {
    leftY = cursorY + 8
  }

  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  // Use splitTextToSize to handle very long company names gracefully
  const nameLines = doc.splitTextToSize(String(companySession.name || 'EMPRESA'), 50)
  doc.text(nameLines, leftX, leftY)
  leftY += (nameLines.length * 5) + 2

  // Details
  doc.setFontSize(8) // Reduced font size for details
  doc.setFont(undefined, 'bold')
  doc.text('Razón Social:', leftX, leftY)
  doc.setFont(undefined, 'normal')
  doc.text(String(companySession.name || ''), leftX + 20, leftY)

  leftY += 4
  doc.setFont(undefined, 'bold')
  doc.text('Domicilio:', leftX, leftY)
  doc.setFont(undefined, 'normal')
  const address = addressFormat(companySession.address)
  // Ensure address doesn't overlap the middle line
  const addressLines = doc.splitTextToSize(String(address), 75)
  doc.text(addressLines, leftX + 14, leftY)

  leftY += (addressLines.length * 4) + 1

  doc.setFont(undefined, 'bold')
  doc.text('Condición IVA:', leftX, leftY)
  doc.setFont(undefined, 'normal')
  doc.text('Responsable Inscripto', leftX + 22, leftY)

  // Right Header Content
  const rightX = MID_X + 10 // Start a bit closer to the line
  let rightY = cursorY + 12

  doc.setFontSize(18) // Reduced headline
  doc.setFont(undefined, 'bold')
  doc.text('FACTURA', rightX, rightY)

  rightY += 8
  doc.setFontSize(8) // Reduced font size

  const labelX = rightX
  // Tighter spacing for columns
  const valX = labelX + 24
  const col2LabelX = valX + 15
  const col2ValX = col2LabelX + 18

  // Punto Venta / Comp Nro
  doc.setFont(undefined, 'bold')
  doc.text('Punto de Venta:', labelX, rightY)
  doc.setFont(undefined, 'normal')
  const ptoVta = String(invoice.electronic_invoice?.fields?.point_of_sale || 0).padStart(4, '0')
  doc.text(ptoVta, valX, rightY)

  doc.setFont(undefined, 'bold')
  doc.text('Comp. Nro:', col2LabelX, rightY)
  doc.setFont(undefined, 'normal')
  const cbteNro = String(invoice.electronic_invoice?.fields?.cbte_hasta || 0).padStart(8, '0')
  doc.text(cbteNro, col2ValX, rightY)

  rightY += 5
  doc.setFont(undefined, 'bold')
  doc.text('Fecha de Emisión:', labelX, rightY)
  doc.setFont(undefined, 'normal')
  doc.text(String(formatDate(invoice.created_at, 'DD/MM/YYYY')), labelX + 26, rightY)

  rightY += 5
  doc.setFont(undefined, 'bold')
  doc.text('CUIT:', labelX, rightY)
  doc.setFont(undefined, 'normal')
  doc.text(String(companySession.document_number || ''), labelX + 10, rightY)

  rightY += 5
  doc.setFont(undefined, 'bold')
  doc.text('Ingresos Brutos:', labelX, rightY)
  doc.setFont(undefined, 'normal')
  const incomeBrut = invoice.electronic_invoice?.fields?.income_brut
  doc.text(incomeBrut ? String(incomeBrut) : '-', labelX + 24, rightY)

  rightY += 5
  doc.setFont(undefined, 'bold')
  doc.text('Inicio de Actividades:', labelX, rightY)
  doc.setFont(undefined, 'normal')
  const activityDate = formatDate(invoice.electronic_invoice?.fields?.activity_start_date, 'DD/MM/YYYY')
  doc.text(activityDate ? String(activityDate) : '-', labelX + 29, rightY)

  cursorY += headerHeight + 2

  // --- CLIENT SECTION ---
  const clientHeight = 22 // Slightly more compact
  drawBox(MARGIN, cursorY, CONTENT_WIDTH, clientHeight)

  let cy = cursorY + 5
  const cx = MARGIN + 4

  // Row 1
  doc.setFontSize(8) // Reduced font size
  doc.setFont(undefined, 'bold')
  doc.text('DNI/CUIT:', cx, cy)
  doc.setFont(undefined, 'normal')
  doc.text(String(invoice.client.document_number || ''), cx + 16, cy)

  doc.setFont(undefined, 'bold')
  doc.text('Apellido y Nombre / Razón Social:', cx + 55, cy)
  doc.setFont(undefined, 'normal')
  doc.text(String(invoice.client.name || ''), cx + 105, cy, { maxWidth: 80 })

  cy += 5
  // Row 2
  doc.setFont(undefined, 'bold')
  doc.text('Condición IVA:', cx, cy)
  doc.setFont(undefined, 'normal')
  doc.text(String(invoice.client?.condition_iva_receptor?.Desc || 'Consumidor Final'), cx + 22, cy)

  doc.setFont(undefined, 'bold')
  doc.text('Domicilio:', cx + 75, cy)
  doc.setFont(undefined, 'normal')
  const clientAddr = addressFormat(invoice.client.address)
  doc.text(String(clientAddr), cx + 90, cy, { maxWidth: 95 })

  cy += 5
  // Row 3 (Condicion venta)
  const paymentMethods = invoice.invoice_payments?.map(p => p.payment_method?.name).filter(Boolean) || []
  const uniqueMethods = [...new Set(paymentMethods)]
  const paymentCondition = uniqueMethods.length > 0 ? uniqueMethods.join(', ') : 'Cuenta Corriente'

  doc.setFont(undefined, 'bold')
  doc.text('Condición de Venta:', cx, cy)
  doc.setFont(undefined, 'normal')
  doc.text(String(paymentCondition), cx + 28, cy)

  cursorY += clientHeight + 4

  // --- TABLE SECTION ---
  const body = []
  const head = [['Código', 'Producto / Servicio', 'Cantidad', 'U. Medida', 'Precio Unit.', '% Bonif', 'Imp. Bonif.', 'Subtotal']]

  invoice.products.forEach((product) => {
    const amount = Number(product.pivot.amount)
    const price = Number(product.pivot.price)
    const unit = product.unit_of_measure?.name || 'unidades'

    body.push([
      String(product.barcode || product.code || '-'),
      String(product.name),
      String(formatNumber(amount)),
      String(unit),
      String(formatNumber(price)),
      '0.00',
      '0.00',
      String(formatNumber(amount * price))
    ])
  })

  autoTable(doc, {
    startY: cursorY,
    head,
    body,
    theme: 'plain',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      halign: 'center',
      fontSize: 8 // Reduced header font
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fontSize: 7, // Reduced body font for more detail
      cellPadding: 1.5
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 14, halign: 'right' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 14, halign: 'right' },
      6: { cellWidth: 14, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' }
    },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_WIDTH
    // Optional: Draw a border around the table block if autoTable breaks pages
    // For now the simple plain theme looks good with the header box.
  })

  let finalY = doc.lastAutoTable.finalY

  // --- FOOTER SECTION ---
  const footerHeight = 40
  if (finalY + footerHeight + 35 > 280) {
    doc.addPage()
    finalY = 20
  } else {
    finalY += 4
  }

  // Footer Box
  drawBox(MARGIN, finalY, CONTENT_WIDTH, footerHeight)

  // -- TOTALS SECTION (Top Right) --
  // Positioned in the upper ~2/3 of the box
  let totalsY = finalY + 8
  const totalsLabelX = MARGIN + 120
  const totalsValX = MARGIN + CONTENT_WIDTH - 4

  doc.setFontSize(9)

  // Subtotal
  doc.setFont(undefined, 'bold')
  doc.text('Subtotal: $', totalsLabelX, totalsY, { align: 'right' })
  doc.setFont(undefined, 'normal')
  doc.text(String(formatNumber(invoice.subtotal)), totalsValX, totalsY, { align: 'right' })

  totalsY += 5
  // Otros Tributos
  doc.setFont(undefined, 'bold')
  doc.text('Importe Otros Tributos: $', totalsLabelX, totalsY, { align: 'right' })
  doc.setFont(undefined, 'normal')
  // const otherTaxes = invoice.taxe_total || 0
  doc.text(String(formatNumber(0)), totalsValX, totalsY, { align: 'right' })

  totalsY += 6
  // Total
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('Importe Total: $', totalsLabelX, totalsY, { align: 'right' })
  doc.text(String(formatNumber(invoice.subtotal)), totalsValX, totalsY, { align: 'right' })

  // -- SEPARATOR LINE --
  const lineY = totalsY + 4
  doc.line(MARGIN, lineY, MARGIN + CONTENT_WIDTH, lineY)

  // -- TRANSPARENCY SECTION (Bottom Left) --
  let transpY = lineY + 5

  doc.setFontSize(7)
  doc.setFont(undefined, 'bold')
  doc.text('Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)', MARGIN + 2, transpY)

  // IVA Contenido
  transpY += 5

  const lt = invoice?.taxe_total ? invoice?.taxe_total?.length : 0

  doc.text('IVA Contenido: $', MARGIN + 60, transpY, { align: 'right' })
  doc.setFont(undefined, 'normal')
  doc.text(String(formatNumber(invoice?.taxe_total)), MARGIN + 85 + lt, transpY, { align: 'right' })

  // --- CAE & QR ---
  const caeY = finalY + footerHeight + 4

  // QR
  const qrBase64 = await setQrImage(invoice, invoice.electronic_invoice.fields, companySession)
  if (qrBase64) {
    doc.addImage(qrBase64, 'PNG', MARGIN, caeY, 22, 22) // Smaller QR
  }

  // ARCA
  const arcaX = MARGIN + 25
  const arcaY = caeY + 4

  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('ARCA', arcaX, arcaY)

  doc.setFontSize(6)
  doc.setFont(undefined, 'normal')
  doc.text('AGENCIA DE RECAUDACIÓN Y CONTROL ADUANERO', arcaX, arcaY + 3.5)

  doc.setFontSize(8)
  doc.setFont(undefined, 'bold')
  doc.text('Comprobante Autorizado', arcaX, arcaY + 10)

  doc.setFontSize(7)
  doc.setFont(undefined, 'italic')
  doc.text('Esta agencia no se responsabiliza por los datos ingresados en el detalle de la operación', arcaX, arcaY + 14)

  // CAE Numbers
  const caeX = MARGIN + CONTENT_WIDTH
  let caeTextY = caeY + 4

  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text(`CAE N°: ${invoice.electronic_invoice.fields.cae}`, caeX, caeTextY, { align: 'right' })

  caeTextY += 5
  doc.text(`Fecha de Vto. de CAE: ${formatDate(invoice.electronic_invoice.fields.caef_ch_vto, 'DD/MM/YYYY')}`, caeX, caeTextY, { align: 'right' })

  // Brand
  if (companySession.is_test) {
    const logoBase64 = qbitsLogo
    const logoW = 35
    const logoH = 20
    const logoX = PAGE_WIDTH - logoW - MARGIN
    const logoY = 297 - logoH - MARGIN

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', logoX, logoY, logoW, logoH)
    }
  }

  return doc
}
