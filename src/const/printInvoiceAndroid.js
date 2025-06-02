import { CapacitorThermalPrinter } from 'capacitor-thermal-printer'
import { formatDate, formatNumber, notify } from './mixins'
import { authentication } from 'src/stores/module-authentication'
import QRCode from 'qrcode'
import { Dialog, Loading, QSpinnerRadio } from 'quasar'

const getConfig = () => {
  const store = authentication()
  return {
    user: store?.userSession,
    company: store?.userSession?.company_session,
    branchOffice: store?.branchOffice,
    config: store?.userSession?.company_session?.company_config
  }
}

const header = (invoice) => {
  return `Razon social: ${invoice?.company?.name} ALE\n` +
    `Direccion: ${invoice?.company?.address}\n` +
    `C.U.I.T: ${invoice?.company?.document_number}\n` +
    '-----------------------------\n' +
    `NRO: ${invoice.code}\n` +
    `CLIENTE: ${invoice.client?.name || '-'}\n` +
    `FECHA: ${invoice.date}\n` +
    `HORA: ${invoice.hour}\n` +
    `TIPO: ${invoice.invoice_type?.name || 'Ticket'}\n` +
    '-----------------------------\n'
}

export const getPrintersB = async (data, quantity, type = 'command') => {
  let qty = quantity
  if (!quantity) {
    const { config } = getConfig()
    qty = config?.other.printer?.quantityToPrint || 1
  }
  try {
    for (let i = 0; i < qty; i++) {
      switch (type) {
        case 'command':
          await printCommand(data)
          break
        case 'ticket':
          await printTicket(data)
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
  if (!data.billing) {
    return await QRCode.toDataURL(JSON.stringify({
      cliente: data.client.name,
      fecha: formatDate(data.date, 'YYYY-MM-DD'),
      total: data.total
    }))
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
  return await QRCode.toDataURL(`${url}${encoded}`)
}

export async function printCommand (invoice) {
  // 2. Detalle solo cantidades y nombres
  let detail =
    'Descripcion         Cantidad\n' +
    '-----------------------------\n'

  const lineWidth = 29

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
    '-----------------------------\n' +
    'Gracias por tu compra!\n'

  // 4. Combinamos y enviamos a la impresora
  await CapacitorThermalPrinter.begin()
    .align('left')
    .text(header(invoice))
    .bold()
    .text(detail)
    .clearFormatting()
    .align('center')
    .text(footer)
    .cutPaper()
    .write()
    .then(() => console.log('Printed!'))
    .catch((e) => notify('Error al imprimir', 'negative', 'warning'))
}

export async function printTicket (invoice) {
  let detail =
    'Cant./Precio Unit   IMPORTE\n' +
    'Descripcion\n' +
    '-----------------------------\n'

  const lineWidth = 29

  let voucherType = ''

  if (invoice.billing) {
    voucherType += `${invoice.electronic_invoice.fields.voucher_type.Desc} \n`
    voucherType += `Codigo: ${invoice.electronic_invoice.fields.voucher_type.Id} \n`
    voucherType += `Nro: 000${invoice.electronic_invoice.fields.point_of_sale}-000${invoice.electronic_invoice.fields.cbte_hasta} \n`
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

  // 3. Totales
  const totalLine = '-----------------------------\n'
  const totalAmount =
    'TOTAL'.padEnd(7) + `${formatNumber(invoice.total)}\n` +
    '-----------------------------\n'

  if (invoice.billing) {
    detail += `Cae: ${invoice.electronic_invoice.fields.cae}\n`
    detail += `Vto: ${formatDate(invoice.electronic_invoice.fields.caef_ch_vto, 'DD/MM/YYYY')}\n`
  }
  detail += '-----------------------------\n'

  const qr = await getQr(invoice, invoice?.electronic_invoice?.fields)

  await CapacitorThermalPrinter.begin()
    .align('left')
    .text(header(invoice))
    .align('center')
    .clearFormatting()
    .bold()
    .text(voucherType)
    .text(detail)
    .text(totalLine)
    .bold()
    .align('right')
    .text(totalAmount)
    .clearFormatting()
    .align('center')
    .image(qr)
    .text('Gracias por tu compra!\n')
    .cutPaper()
    .write()
    .then(() => Loading.hide())
    .catch((e) => {
      Dialog.create({
        title: 'Error al imprimir',
        message: e.message,
        cancel: {
          label: 'Cerrar',
          color: 'negative',
          icon: 'close'
        },
        ok: {
          label: 'Reintentar',
          color: 'primary',
          icon: 'refresh'
        }
      }).onOk(async () => {
        Loading.show({
          message: 'Imprimiendo...',
          spinner: QSpinnerRadio
        })
        await getPrintersB(invoice, 1, 'ticket')
        Loading.hide()
      }).onCancel(() => {
        Loading.hide()
      })
    })
}
