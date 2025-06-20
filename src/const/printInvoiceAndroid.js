import { CapacitorThermalPrinter } from 'capacitor-thermal-printer'
import { formatDate, formatNumber, notify } from './mixins'
import { authentication } from 'src/stores/module-authentication'
import QRCode from 'qrcode'
import { Loading } from 'quasar'
import { api } from 'src/boot/axios'

const getConfig = () => {
  const store = authentication()
  return {
    user: store?.userSession,
    branchOffice: store?.branchOffice,
    config: store?.userSession?.company_session?.company_config
  }
}

const header = (invoice, lineWidth) => {
  return `Razon social: ${invoice?.company?.name}\n` +
    `Direccion: ${invoice?.company?.address}\n` +
    `C.U.I.T: ${invoice?.company?.document_number}\n` +
    separatorLine(lineWidth)
}

export const getPrintersB = async (data, quantity, type = 'command') => {
  let qty = quantity
  const { config, user } = getConfig()
  if (!quantity) {
    qty = config?.other.printer?.quantityToPrint || 1
  }
  if (user.company_session_id === 14) {
    if (type === 'command') {
      type = 'commandUSB'
    } else {
      type = 'ticketUSB'
    }
  }
  try {
    for (let i = 0; i < qty; i++) {
      switch (type) {
        case 'command':
          await printCommand(data, config?.other?.printer)
          break
        case 'ticket':
          await printTicket(data, config?.other?.printer)
          break
        case 'ticketUSB':
          await printTicketUsb(data, config?.other?.printer)
          break
        case 'commandUSB':
          await printCommandUsb(data, config?.printer)
          break
        default:
          break
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const getQr = async (data, fields) => {
  const dataImg = await getStructureQr(data, fields)
  return await QRCode.toDataURL(dataImg)
}

const getStructureQr = async (data, fields) => {
  if (!data.billing) {
    return JSON.stringify({
      cliente: data.client.name,
      fecha: formatDate(data.date, 'YYYY-MM-DD'),
      total: data.total
    })
  }
  const docQr = {
    ver: 1,
    fecha: formatDate(data.date, 'YYYY-MM-DD'),
    cuit: Number(data.company.document_number),
    ptoVta: fields.point_of_sale,
    tipoCmp: fields.voucher_type.Id,
    nroCmp: fields.cbte_hasta,
    importe: data.total,
    moneda: 'PES',
    tipoDocRec: data?.client?.document_type?.Id,
    nroDocRec: Number(data?.client?.document_number),
    tipoCodAut: 'E',
    ctz: 1,
    codAut: Number(fields.cae)
  }
  const encoded = btoa(JSON.stringify(docQr))
  const url = 'https://servicioscf.afip.gob.ar/publico/comprobantes/cae.aspx?p='
  return `${url}${encoded}`
}

function separatorLine (length = 29) {
  return '-'.repeat(length) + '\n'
}

export async function printCommand (invoice, config) {
  // 2. Detalle solo cantidades y nombres
  const lineWidth = config?.size?.value || 29
  let detail = `NRO: ${invoice.code}\n` +
    `CLIENTE: ${invoice.client?.name || '-'}\n` +
    `TELEFONO: ${invoice.client?.phone_number || '-'}\n` +
    `TIPO DE SERVICIO: ${invoice.type_of_service?.name || '-'}\n` +
    `FECHA: ${invoice.date}\n` +
    `HORA: ${invoice.hour}\n` +
    `TIPO: ${invoice.invoice_type?.name || 'Ticket'}\n` +
    separatorLine(lineWidth) +
    'Descripcion         Cantidad\n' +
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

    // Imprimir todas las líneas del nombre; solo en la última línea va la cantidad alineada a la derecha
    nameLines.forEach((line, idx) => {
      if (idx === nameLines.length - 1) {
        // última línea: cantidad alineada derecha
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
      try {
        await api.get(`print/${invoice.id}`, {
          params: {
            type: 'command'
          }
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    })
}

export async function printTicket (invoice, config) {
  const lineWidth = config?.size?.value || 29
  let detail = `NRO: ${invoice.code}\n` +
    `CLIENTE: ${invoice.client?.name || '-'}\n` +
    `FECHA: ${invoice.date}\n` +
    `HORA: ${invoice.hour}\n` +
    `TIPO: ${invoice.invoice_type?.name || 'Ticket'}\n` +
    separatorLine(lineWidth) +
    'Cant./Precio Unit   IMPORTE\n' +
    'Descripcion\n' +
    separatorLine(lineWidth)

  let voucherType = ''
  let numberVoucher = ''
  if (invoice.billing) {
    voucherType += `${invoice.electronic_invoice.fields.voucher_type.Desc} \n`
    numberVoucher += `Codigo: ${invoice.electronic_invoice.fields.voucher_type.Id} \n`
    numberVoucher += `Nro: 000${invoice.electronic_invoice.fields.point_of_sale}-000${invoice.electronic_invoice.fields.cbte_hasta} \n`
  }

  invoice.products.forEach((p) => {
    const cantidad = parseFloat(p.pivot.amount).toFixed(2)
    const precio = p.pivot.price
    const total = (parseFloat(cantidad) * parseFloat(precio)).toFixed(2)

    // Línea con "cantidad X precio" y el total alineado a la derecha
    const leftDetail = `${cantidad} X ${precio}`
    const totalLen = total.length
    const detailLine = leftDetail.padEnd(lineWidth - totalLen) + total + '\n'

    detail += detailLine

    // Ahora partimos el nombre del producto en líneas de 'lineWidth' caracteres
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
  if (invoice.billing) {
    invoiceDetail += `Cae: ${invoice.electronic_invoice.fields.cae}\n`
    invoiceDetail += `Vto: ${formatDate(invoice.electronic_invoice.fields.caef_ch_vto, 'DD/MM/YYYY')}\n`
  }

  const qr = await getQr(invoice, invoice?.electronic_invoice?.fields)

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
    .then(() => Loading.hide())
    .catch(async (e) => {
      try {
        await api.get(`print/${invoice.id}`, {
          params: {
            type: 'ticket'
          }
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    })
}

export async function printTicketUsb (invoice, config) {
  const printer = window.Capacitor.Plugins.Printer
  const lineWidth = config?.size?.value || 48

  try {
    await printer.setPaperWidth({ width: lineWidth })
    await printer.text({
      text: header(invoice, lineWidth),
      align: 'left'
    })

    if (invoice.billing) {
      await printer.text({
        text: `${invoice.electronic_invoice.fields.voucher_type.Desc}`,
        align: 'center',
        fontWeight: 'bold',
        fontSize: 'large'
      })

      await printer.text({
        text: `Codigo: ${invoice.electronic_invoice.fields.voucher_type.Id}`,
        align: 'center',
        fontWeight: 'bold',
        fontSize: 'normal'
      })

      await printer.text({
        text: `Nro: 000${invoice.electronic_invoice.fields.point_of_sale}-000${invoice.electronic_invoice.fields.cbte_hasta}\n`,
        align: 'center'
      })
    }

    let detail = `Nro Comp.: ${invoice.code}\n` +
      `CLIENTE: ${invoice.client?.name || '-'}\n` +
      `FECHA: ${invoice.date}\n` +
      `HORA: ${invoice.hour}\n` +
      `TIPO: ${invoice.invoice_type?.name || 'Ticket'}\n` +
      separatorLine(lineWidth) +
      'Cant./Precio Unit'.padEnd(lineWidth - 7) + 'IMPORTE\n' +
      'Descripcion\n' +
      separatorLine(lineWidth)

    invoice.products.forEach((p) => {
      const cantidad = parseFloat(p.pivot.amount).toFixed(2)
      const precio = p.pivot.price
      const total = (parseFloat(cantidad) * parseFloat(precio)).toFixed(2)

      const leftDetail = `${cantidad} X ${precio}`
      const totalLen = total.length
      detail += leftDetail.padEnd(lineWidth - totalLen) + total + '\n'

      const name = p.name || ''
      for (let i = 0; i < name.length; i += lineWidth) {
        detail += name.substring(i, i + lineWidth) + '\n'
      }
    })

    detail += separatorLine(lineWidth)

    await printer.text({
      text: detail,
      align: 'left',
      fontWeight: 'normal'
    })

    // Total
    const totalAmount = 'TOTAL'.padEnd(lineWidth - formatNumber(invoice.total).length) + `${formatNumber(invoice.total)}`
    await printer.text({
      text: totalAmount,
      align: 'left'
    })
    await printer.text({
      text: separatorLine(lineWidth),
      align: 'left'
    })

    // Detalles de factura electrónica
    if (invoice.billing) {
      const invoiceDetail = `Cae: ${invoice.electronic_invoice.fields.cae}\n` +
        `Vto: ${formatDate(invoice.electronic_invoice.fields.caef_ch_vto, 'DD/MM/YYYY')}`

      await printer.text({
        text: invoiceDetail,
        align: 'left'
      })
    }

    const qrData = await getStructureQr(invoice, invoice?.electronic_invoice?.fields)

    if (qrData) {
      await printer.qr({
        data: qrData,
        align: 'center',
        size: 4,
        correction: 2
      })
    }

    // Pie de página
    await printer.text({
      text: 'Gracias por su compra! \n\n\n\n\n\n\n\n',
      align: 'center'
    })

    // Finalizar impresión
    await printer.print()
  } catch (e) {
    console.error('Error al imprimir:', e)
    try {
      await api.get(`print/${invoice.id}`, {
        params: {
          type: 'ticket'
        }
      })
    } catch (error) {
      notify(error.message, 'negative', 'warning')
    }
  }
}

export async function printCommandUsb (invoice, config) {
  const printer = window.Capacitor.Plugins.Printer
  const lineWidth = config?.size?.value || 29

  try {
    await printer.setPaperWidth({ width: lineWidth })

    // 1. Encabezado
    await printer.text({
      text: header(invoice, lineWidth),
      align: 'left'
    })

    // 2. Detalle de productos
    let detail = `NRO: ${invoice.code}\n` +
      `CLIENTE: ${invoice.client?.name || '-'}\n` +
      `TELEFONO: ${invoice.client?.phone_number || '-'}\n` +
      `TIPO DE SERVICIO: ${invoice.type_of_service?.name || '-'}\n` +
      `FECHA: ${invoice.date}\n` +
      `HORA: ${invoice.hour}\n` +
      `TIPO: ${invoice.invoice_type?.name || 'Ticket'}\n` +
      separatorLine(lineWidth) +
      'Descripcion         Cantidad\n' +
      separatorLine(lineWidth)

    invoice.products.forEach((product) => {
      const name = product.name || ''
      const quantity = parseFloat(product.pivot.amount).toFixed(2)
      const qtyLen = quantity.length
      const maxNameLen = lineWidth

      const nameLines = []
      for (let i = 0; i < name.length; i += maxNameLen) {
        nameLines.push(name.substring(i, i + maxNameLen))
      }

      nameLines.forEach((line, idx) => {
        if (idx === nameLines.length - 1) {
          const spaces = ' '.repeat(Math.max(0, lineWidth - line.length - qtyLen))
          detail += `${line}${spaces}${quantity}\n`
        } else {
          detail += `${line}\n`
        }
      })
    })

    await printer.text({
      text: detail,
      align: 'left',
      fontWeight: 'normal'
    })

    // 3. Footer
    await printer.text({
      text: separatorLine(lineWidth),
      align: 'left'
    })

    await printer.text({
      text: 'Gracias por tu compra!\n\n\n\n\n\n\n\n',
      align: 'center'
    })

    // 4. Finalizar impresión
    await printer.print()
  } catch (e) {
    console.error('Error al imprimir:', e)
    try {
      await api.get(`print/${invoice.id}`, {
        params: { type: 'command' }
      })
    } catch (error) {
      notify(error.message, 'negative', 'warning')
    }
  }
}
