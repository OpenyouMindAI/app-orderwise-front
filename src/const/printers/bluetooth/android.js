import { CapacitorThermalPrinter } from 'capacitor-thermal-printer'
import { formatDate, formatNumber } from '../../mixins'
import { setQrImage } from '../common'
import { authentication } from 'src/stores/module-authentication'

function separatorLine (length = 29) {
  return '-'.repeat(length) + '\n'
}

const addressFormat = (address) => {
  if (typeof address === 'string') {
    return address?.toUpperCase()
  }
  return address?.formattedAddress?.toUpperCase() || ''
}

const header = (invoice, lineWidth) => {
  const store = authentication()
  const company = invoice?.company || store?.userSession?.company_session || {}
  return `Razon social: ${company?.name || ''}\n` +
    `Direccion: ${addressFormat(company?.address)}\n` +
    `C.U.I.T: ${company?.document_number || ''}\n` +
    separatorLine(lineWidth)
}

export async function printCommand (invoice, config) {
  const lineWidth = config?.size?.value || 24
  let detail = `NRO: ${invoice.code}\n` +
    `CLIENTE: ${invoice.client?.name || '-'}\n` +
    `TIPO DE SERVICIO: ${invoice.type_of_service?.name || '-'}\n` +
    `FECHA: ${formatDate(invoice.created_at, 'DD/MM/YYYY')} ${formatDate(invoice.created_at, 'HH:mm:ss')}\n` +
    `TIPO: ${invoice.invoice_type?.name || 'Ticket'}\n` +
    separatorLine(lineWidth) +
    'Descripcion         quantity\n' +
    separatorLine(lineWidth)

  invoice.products.forEach((product) => {
    const name = product.name || ''
    const quantity = parseFloat(product.pivot.amount).toFixed(2)
    const qtyLen = quantity.length
    const maxNameLen = lineWidth

    // Dividir el nombre en líneas completas (sin cortar)
    const nameLines = []
    for (let i = 0; i < name.length; i += maxNameLen) {
      nameLines.push(name.substring(i, i + maxNameLen))
    }

    // Imprimir todas las líneas del nombre; solo en la última línea va la quantity alineada a la derecha
    nameLines.forEach((line, idx) => {
      if (idx === nameLines.length - 1) {
        // última línea: quantity alineada derecha
        const spaces = ' '.repeat(Math.max(0, lineWidth - line.length - qtyLen))
        detail += `${line}${spaces}${quantity}\n`
      } else {
        detail += `${line}\n`
      }
    })
  })

  invoice.promotions.forEach((product) => {
    const name = product.name || ''
    const quantity = parseFloat(product.pivot.quantity).toFixed(2)
    const qtyLen = quantity.length
    const maxNameLen = lineWidth

    // Dividir el nombre en líneas completas (sin cortar)
    const nameLines = []
    for (let i = 0; i < name.length; i += maxNameLen) {
      nameLines.push(name.substring(i, i + maxNameLen))
    }

    // Imprimir todas las líneas del nombre; solo en la última línea va la quantity alineada a la derecha
    nameLines.forEach((line, idx) => {
      if (idx === nameLines.length - 1) {
        // última línea: quantity alineada derecha
        const spaces = ' '.repeat(Math.max(0, lineWidth - line.length - qtyLen))
        detail += `${line}${spaces}${quantity}\n`
      } else {
        detail += `${line}\n`
      }
    })
  })

  // 3. Footer
  const footer =
    separatorLine(lineWidth) +
    'Gracias por tu compra!\n'

  // 4. Combinamos y enviamos a la impresora
  for (let i = 0; i < Number(config.quantityToPrint); i++) {
    try {
      await CapacitorThermalPrinter.begin()
        .align('left')
        .text(header(invoice, lineWidth))
        .bold()
        .text(detail)
        .clearFormatting()
        .align('center')
        .text(footer)
        .beep()
        .cutPaper()
        .write()
        .then(() => console.log('Printed!'))
        .catch(async (e) => {
          console.log(e)
        })
    } catch (e) {
      console.error(`Error printing copy ${i + 1}:`, e)
    }
  }
}

export async function printTicket (invoice, config) {
  const lineWidth = config?.size?.value || 29
  let detail = `NRO: ${invoice.code}\n` +
    `CLIENTE: ${invoice.client?.name || '-'}\n` +
    `FECHA: ${formatDate(invoice.created_at, 'DD/MM/YYYY')}\n` +
    `HORA: ${formatDate(invoice.created_at, 'HH:mm:ss')}\n` +
    `TIPO: ${invoice.invoice_type?.name || 'Ticket'}\n` +
    separatorLine(lineWidth) +
    'Cant./Precio Unit   IMPORTE\n' +
    'Descripcion\n' +
    separatorLine(lineWidth)

  let voucherType = ''
  let numberVoucher = ''
  if (invoice.billing && invoice.electronic_invoice?.fields) {
    voucherType += `${invoice.electronic_invoice.fields.voucher_type?.Desc || ''} \n`
    numberVoucher += `Codigo: ${invoice.electronic_invoice.fields.voucher_type?.Id || ''} \n`
    numberVoucher += `Nro: 000${invoice.electronic_invoice.fields.point_of_sale}-000${invoice.electronic_invoice.fields.cbte_hasta} \n`
  }

  invoice.products.forEach((p) => {
    const quantity = parseFloat(p.pivot.amount).toFixed(2)
    const precio = p.pivot.price
    const total = (parseFloat(quantity) * parseFloat(precio)).toFixed(2)

    const leftDetail = `${quantity} X ${precio}`
    const totalLen = total.length
    const detailLine = leftDetail.padEnd(lineWidth - totalLen) + total + '\n'

    detail += detailLine

    const name = p.name || ''
    for (let i = 0; i < name.length; i += lineWidth) {
      detail += name.substring(i, i + lineWidth) + '\n'
    }
    detail += '\n'
  })

  invoice.promotions.forEach((p) => {
    const quantity = parseFloat(p.pivot.quantity).toFixed(2)
    const precio = p.pivot.price
    const total = (parseFloat(quantity) * parseFloat(precio)).toFixed(2)

    const leftDetail = `${quantity} X ${precio}`
    const totalLen = total.length
    const detailLine = leftDetail.padEnd(lineWidth - totalLen) + total + '\n'

    detail += detailLine

    const name = p.name || ''
    for (let i = 0; i < name.length; i += lineWidth) {
      detail += name.substring(i, i + lineWidth) + '\n'
    }
    detail += '\n'
  })

  detail += separatorLine(lineWidth)

  const totalAmount =
    'TOTAL'.padEnd(4) + `${formatNumber(invoice.total)}\n` +
    separatorLine(lineWidth)

  let invoiceDetail = ''
  if (invoice.billing && invoice.electronic_invoice?.fields) {
    invoiceDetail += `Cae: ${invoice.electronic_invoice.fields.cae}\n`
    invoiceDetail += `Vto: ${formatDate(invoice.electronic_invoice.fields.caef_ch_vto, 'DD/MM/YYYY')}\n`
  }

  const qr = await setQrImage(invoice, invoice?.electronic_invoice?.fields, invoice.company)

  await CapacitorThermalPrinter.begin()
    .align('left')
    .text(header(invoice, lineWidth))
    .bold()
    .align('center')
    .doubleHeight()
    .text(voucherType)
    .clearFormatting()
    .bold()
    .align('center')
    .text(numberVoucher)
    .clearFormatting()
    .text(detail)
    .align('right')
    .text(totalAmount)
    .clearFormatting()
    .text(invoiceDetail)
    .align('center')
    .image(qr)
    .text('Gracias por su compra!\n')
    .beep()
    .cutPaper()
    .write()
    .then(() => console.log('Printed!'))
    .catch(async (e) => {
      console.log(e)
    })
}
