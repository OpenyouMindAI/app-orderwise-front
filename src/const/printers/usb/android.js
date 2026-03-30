import { formatDate, formatNumber, notify } from '../../mixins'
import { authentication } from 'src/stores/module-authentication'
import { api } from 'src/boot/axios'

const addressFormat = (address) => {
  if (typeof address === 'string') return address.toUpperCase()
  return address?.formattedAddress?.toUpperCase() || ''
}

const buildHeader = (invoice, lineWidth) => {
  const store = authentication()
  const company = invoice?.company || store?.userSession?.company_session || {}
  return `Razon social: ${company?.name || ''}\n` +
    `Direccion: ${addressFormat(company?.address)}\n` +
    `C.U.I.T: ${company?.document_number || ''}\n` +
    '-'.repeat(lineWidth) + '\n'
}

function separatorLine (length = 29) {
  return '-'.repeat(length) + '\n'
}

const getStructureQr = async (data, fields) => {
  if (!data.billing || !fields) {
    return JSON.stringify({
      cliente: data.client?.name || '',
      fecha: formatDate(data.created_at, 'YYYY-MM-DD'),
      total: data.total
    })
  }
  const store = authentication()
  const company = data?.company || store?.userSession?.company_session || {}
  const docQr = {
    ver: 1,
    fecha: formatDate(data.created_at, 'YYYY-MM-DD'),
    cuit: Number(company?.document_number || 0),
    ptoVta: fields.point_of_sale,
    tipoCmp: fields.voucher_type?.Id,
    nroCmp: fields.cbte_hasta,
    importe: data.total,
    moneda: 'PES',
    tipoDocRec: data?.client?.document_type?.Id || 99,
    nroDocRec: Number(data?.client?.document_number || 0),
    tipoCodAut: 'E',
    ctz: 1,
    codAut: Number(fields.cae)
  }
  const encoded = btoa(JSON.stringify(docQr))
  const url = 'https://servicioscf.afip.gob.ar/publico/comprobantes/cae.aspx?p='
  return `${url}${encoded}`
}

export async function printTicketUsb (invoice, config) {
  const printer = window.Capacitor.Plugins.Printer
  const lineWidth = config?.size?.value || 48

  try {
    await printer.setPaperWidth({ width: lineWidth })
    await printer.text({
      text: buildHeader(invoice, lineWidth),
      align: 'left'
    })

    if (invoice.billing && invoice.electronic_invoice?.fields) {
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
      `FECHA: ${formatDate(invoice.created_at, 'DD/MM/YYYY')}\n` +
      `HORA: ${formatDate(invoice.created_at, 'HH:mm:ss')}\n` +
      `TIPO: ${invoice.invoice_type?.name || 'Ticket'}\n` +
      separatorLine(lineWidth) +
      'Cant./Precio Unit'.padEnd(lineWidth - 7) + 'IMPORTE\n' +
      'Descripcion\n' +
      separatorLine(lineWidth)

    invoice.products.forEach((p) => {
      const quantity = parseFloat(p.pivot.amount).toFixed(2)
      const precio = p.pivot.price
      const total = (parseFloat(quantity) * parseFloat(precio)).toFixed(2)

      const leftDetail = `${quantity} X ${precio}`
      const totalLen = total.length
      detail += leftDetail.padEnd(lineWidth - totalLen) + total + '\n'

      const name = p.name || ''
      for (let i = 0; i < name.length; i += lineWidth) {
        detail += name.substring(i, i + lineWidth) + '\n'
      }
    })

    if (invoice.promotions && invoice.promotions.length > 0) {
      invoice.promotions.forEach((p) => {
        const quantity = parseFloat(p.pivot.quantity).toFixed(2)
        const precio = p.pivot.price
        const total = (parseFloat(quantity) * parseFloat(precio)).toFixed(2)

        const leftDetail = `${quantity} X ${precio}`
        const totalLen = total.length
        detail += leftDetail.padEnd(lineWidth - totalLen) + total + '\n'

        const name = p.name || ''
        for (let i = 0; i < name.length; i += lineWidth) {
          detail += name.substring(i, i + lineWidth) + '\n'
        }
      })
    }
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
    if (invoice.billing && invoice.electronic_invoice?.fields) {
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
      text: buildHeader(invoice, lineWidth),
      align: 'left'
    })

    // 2. Detalle de productos
    let detail = `NRO: ${invoice.code}\n` +
      `CLIENTE: ${invoice.client?.name || '-'}\n` +
      `TELEFONO: ${invoice.client?.phone_number || '-'}\n` +
      `TIPO DE SERVICIO: ${invoice.type_of_service?.name || '-'}\n` +
      `FECHA: ${formatDate(invoice.created_at, 'DD/MM/YYYY')}\n` +
      `HORA: ${formatDate(invoice.created_at, 'HH:mm:ss')}\n` +
      `TIPO: ${invoice.invoice_type?.name || 'Ticket'}\n` +
      separatorLine(lineWidth) +
      'Descripcion         quantity\n' +
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

    if (invoice.promotions && invoice.promotions.length > 0) {
      invoice.promotions.forEach((product) => {
        const name = product.name || ''
        const quantity = parseFloat(product.pivot.quantity).toFixed(2)
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
    }

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
