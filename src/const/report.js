import { formatDate, formatNumber } from './mixins'
import { cutWords, header } from './printers/common'

const numberToString = (number) => {
  if (!number) {
    return '0'
  }
  return String(formatNumber(number))
}

export const printReportTaxes = (data, userSession, params, voucherType) => {
  let y = 10
  const { company_session: companySession } = userSession
  const now = new Date()
  const { doc, pageWidth } = header(data, companySession, 95)

  y = cutWords(
    `RAZÓN SOCIAL: ${companySession?.name?.toUpperCase()}`,
    65,
    doc,
    y,
    false,
    95
  )
  y = cutWords(
    `DIRECCIÓN: ${companySession?.address?.toUpperCase()}`,
    65,
    doc,
    y,
    false,
    95
  )
  y = cutWords(
    `C.U.I.T: ${companySession?.document_number}`,
    65,
    doc,
    y,
    false,
    95
  )

  y = cutWords('IVA RESPONSABLE INSCRIPTO', 65, doc, y, false, 95)

  y = cutWords(`Habilitación: ${voucherType?.Desc || 'Todas'}`, 65, doc, y, false, 95)
  doc.text('----------------------------------------', 5, y)

  y += 4
  y = cutWords('INFORME DE CIERRE', 65, doc, y, true, 95)

  doc.text(`P.V Nº: ${companySession?.company_config?.point_of_sale}`, 5, y)

  y += 4

  doc.text(
    `FECHA: ${formatDate(now)} HORA: ${formatDate(now, 'HH:mm:ss')}`,
    5,
    y
  )

  y += 4
  doc.text('----------------------------------------', 5, y)
  y += 4

  if (params.day) {
    doc.text(`FECHA DE LA JORNADA: ${formatDate(`${params.day} 00:00:00`, 'DD/MM/YYYY')}`, 5, y)
  } else {
    doc.text(`DESDE ${formatDate(params.from, 'DD/MM/YYYY')} HASTA ${formatDate(params.to, 'DD/MM/YYYY')}`, 5, y)
  }
  y += 6
  y = cutWords('COMPROBANTES FISCALES', 65, doc, y, true, 95)
  y += 4

  doc.text('PRIMER COMPROBANTE', 5, y)
  doc.text(String(data?.summary?.first_invoice_id), pageWidth - 7, y, { align: 'right' })
  y += 4

  doc.text('ÚLTIMO COMPROBANTE', 5, y)
  doc.text(String(data?.summary?.last_invoice_id), pageWidth - 7, y, { align: 'right' })
  y += 4

  doc.text('GRAVADO', 5, y)
  doc.text(numberToString(data?.summary?.total_base), pageWidth - 7, y, { align: 'right' })
  y += 4

  doc.text('NO GRAVADO', 5, y)
  doc.text('0', pageWidth - 7, y, { align: 'right' })
  y += 4

  doc.text('EXENTO', 5, y)
  doc.text(numberToString(data?.ivaBreakdown.find(item => item.taxe_percentage === 0)?.taxe_total), pageWidth - 7, y, { align: 'right' })
  y += 4

  doc.text('COMPROBANTES GENERADOS', 5, y)
  doc.text(String(data?.summary?.total_invoices), pageWidth - 7, y, { align: 'right' })

  y += 4
  doc.text('----------------------------------------', 5, y)
  y += 4

  y = cutWords('DISTRIBUCIÓN DE IVA', 65, doc, y, true, 95)
  y += 4

  for (const item of data?.ivaBreakdown) {
    doc.text(`${item.taxe_percentage}%`, 5, y)
    doc.text(numberToString(item.taxe_total), pageWidth - 7, y, { align: 'right' })
    y += 4
  }

  doc.text('TOTAL DE IVA', 5, y)
  doc.text(numberToString(data?.summary?.total_tax), pageWidth - 7, y, { align: 'right' })

  y += 4
  doc.text('----------------------------------------', 5, y)
  y += 4

  doc.text('IMP. TOTAL COMP. FISCALES', 5, y)
  doc.text(numberToString(data?.summary?.total_invoiced), pageWidth - 7, y, { align: 'right' })

  return doc
}
