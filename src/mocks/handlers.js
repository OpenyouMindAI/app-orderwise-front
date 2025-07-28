// eslint-disable-next-line import/named
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Intercepta la petición GET a 'reports/payment-method-totals'
  http.get('*/reports/payment-method-totals', () => {
    // Devuelve una respuesta simulada con 4 métodos de pago
    return HttpResponse.json({
      payment_method_totals: [
        {
          id: 1,
          payment_method_name: 'Efectivo',
          transactions_count: 15,
          total_balance: 1150000
        },
        {
          id: 2,
          payment_method_name: 'Tarjeta de Crédito/Débito',
          transactions_count: 8,
          total_balance: 850000
        },
        {
          id: 3,
          payment_method_name: 'Transferencia Bancaria',
          transactions_count: 5,
          total_balance: 500000
        }
      ]
    })
  }),

  // Intercepta la petición GET para detalles de pago
  http.get('*/reports/payment-details', ({ request }) => {
    const url = new URL(request.url)
    const paymentMethodId = url.searchParams.get('payment_method_id')
    const filter = url.searchParams.get('filter')?.toLowerCase()

    const allPayments = [
      { id: 1, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 264597, date: '2025-07-01', invoice_number: 'INV-1-0001' },
      { id: 2, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 81957, date: '2025-07-02', invoice_number: 'INV-1-0002' },
      { id: 3, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 26437, date: '2025-07-03', invoice_number: 'INV-1-0003' },
      { id: 4, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 89519, date: '2025-07-04', invoice_number: 'INV-1-0004' },
      { id: 5, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 68153, date: '2025-07-05', invoice_number: 'INV-1-0005' },
      { id: 6, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 151825, date: '2025-07-06', invoice_number: 'INV-1-0006' },
      { id: 7, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 221693, date: '2025-07-07', invoice_number: 'INV-1-0007' },
      { id: 8, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 43369, date: '2025-07-08', invoice_number: 'INV-1-0008' },
      { id: 9, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 17776, date: '2025-07-09', invoice_number: 'INV-1-0009' },
      { id: 10, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 260330, date: '2025-07-10', invoice_number: 'INV-1-0010  ' },
      { id: 11, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 53550, date: '2025-07-11', invoice_number: 'INV-1-00 11' },
      { id: 12, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 92460, date: '2025-07-12', invoice_number: 'INV-1-0012' },
      { id: 13, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 53189, date: '2025-07-13', invoice_number: 'INV-1-0013' },
      { id: 14, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 25722, date: '2025-07-14', invoice_number: 'INV-1-0014' },
      { id: 15, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 116790, date: '2025-07-15', invoice_number: 'INV-1-0015' },
      { id: 16, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 266558, date: '2025-07-16', invoice_number: 'INV-1-0016' },
      { id: 17, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 193166, date: '2025-07-17', invoice_number: 'INV-1-0017' },
      { id: 18, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 266267, date: '2025-07-18', invoice_number: 'INV-1-0018' },
      { id: 19, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 195851, date: '2025-07-19', invoice_number: 'INV-1-0019' },
      { id: 20, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 23377, date: '2025-07-20', invoice_number: 'INV-1-0020' },
      { id: 21, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 296537, date: '2025-07-21', invoice_number: 'INV-1-0021' },
      { id: 22, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 278267, date: '2025-07-22', invoice_number: 'INV-1-0022' },
      { id: 23, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 263988, date: '2025-07-23', invoice_number: 'INV-1-0023' },
      { id: 24, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 227000, date: '2025-07-24', invoice_number: 'INV-1-0024' },
      { id: 25, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 226062, date: '2025-07-25', invoice_number: 'INV-1-0025' },
      { id: 26, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 185495, date: '2025-07-26', invoice_number: 'INV-1-0026' },
      { id: 27, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 270915, date: '2025-07-27', invoice_number: 'INV-1-0027' },
      { id: 28, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 278811, date: '2025-07-28', invoice_number: 'INV-1-0028' },
      { id: 29, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 245473, date: '2025-07-29', invoice_number: 'INV-1-0029' },
      { id: 30, payment_method_id: 1, payment_method_name: 'Efectivo', amount: 90794, date: '2025-07-30', invoice_number: 'INV-1-0030' },
      { id: 31, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 216966, date: '2025-07-31', invoice_number: 'INV-2-0001' },
      { id: 32, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 277317, date: '2025-08-01', invoice_number: 'INV-2-0002' },
      { id: 33, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 232505, date: '2025-08-02', invoice_number: 'INV-2-0003' },
      { id: 34, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 126581, date: '2025-08-03', invoice_number: 'INV-2-0004' },
      { id: 35, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 213756, date: '2025-08-04', invoice_number: 'INV-2-0005' },
      { id: 36, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 242907, date: '2025-08-05', invoice_number: 'INV-2-0006' },
      { id: 37, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 39655, date: '2025-08-06', invoice_number: 'INV-2-0007' },
      { id: 38, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 201512, date: '2025-08-07', invoice_number: 'INV-2-0008' },
      { id: 39, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 195642, date: '2025-08-08', invoice_number: 'INV-2-0009' },
      { id: 40, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 189211, date: '2025-08-09', invoice_number: 'INV-2-0010' },
      { id: 41, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 96229, date: '2025-08-10', invoice_number: 'INV-2-0011' },
      { id: 42, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 133217, date: '2025-08-11', invoice_number: 'INV-2-0012' },
      { id: 43, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 179746, date: '2025-08-12', invoice_number: 'INV-2-0013' },
      { id: 44, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 269080, date: '2025-08-13', invoice_number: 'INV-2-0014' },
      { id: 45, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 77639, date: '2025-08-14', invoice_number: 'INV-2-0015' },
      { id: 46, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 218211, date: '2025-08-15', invoice_number: 'INV-2-0016' },
      { id: 47, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 146823, date: '2025-08-16', invoice_number: 'INV-2-0017' },
      { id: 48, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 289565, date: '2025-08-17', invoice_number: 'INV-2-0018' },
      { id: 49, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 258907, date: '2025-08-18', invoice_number: 'INV-2-0019' },
      { id: 50, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 265592, date: '2025-08-19', invoice_number: 'INV-2-0020' },
      { id: 51, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 207074, date: '2025-08-20', invoice_number: 'INV-2-0021' },
      { id: 52, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 254518, date: '2025-08-21', invoice_number: 'INV-2-0022' },
      { id: 53, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 33726, date: '2025-08-22', invoice_number: 'INV-2-0023' },
      { id: 54, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 262572, date: '2025-08-23', invoice_number: 'INV-2-0024' },
      { id: 55, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 186710, date: '2025-08-24', invoice_number: 'INV-2-0025' },
      { id: 56, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 9417, date: '2025-08-25', invoice_number: 'INV-2-0026' },
      { id: 57, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 251804, date: '2025-08-26', invoice_number: 'INV-2-0027' },
      { id: 58, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 205103, date: '2025-08-27', invoice_number: 'INV-2-0028' },
      { id: 59, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 83678, date: '2025-08-28', invoice_number: 'INV-2-0029' },
      { id: 60, payment_method_id: 2, payment_method_name: 'Tarjeta de Crédito/Débito', amount: 224450, date: '2025-08-29', invoice_number: 'INV-2-0030' },
      { id: 61, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 15027, date: '2025-08-30', invoice_number: 'INV-3-0001' },
      { id: 62, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 186100, date: '2025-08-31', invoice_number: 'INV-3-0002' },
      { id: 63, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 212303, date: '2025-09-01', invoice_number: 'INV-3-0003' },
      { id: 64, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 266609, date: '2025-09-02', invoice_number: 'INV-3-0004' },
      { id: 65, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 31536, date: '2025-09-03', invoice_number: 'INV-3-0005' },
      { id: 66, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 186296, date: '2025-09-04', invoice_number: 'INV-3-0006' },
      { id: 67, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 101099, date: '2025-09-05', invoice_number: 'INV-3-0007' },
      { id: 68, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 295673, date: '2025-09-06', invoice_number: 'INV-3-0008' },
      { id: 69, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 218054, date: '2025-09-07', invoice_number: 'INV-3-0009' },
      { id: 70, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 275825, date: '2025-09-08', invoice_number: 'INV-3-0010' },
      { id: 71, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 225153, date: '2025-09-09', invoice_number: 'INV-3-0011' },
      { id: 72, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 217432, date: '2025-09-10', invoice_number: 'INV-3-0012' },
      { id: 73, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 21325, date: '2025-09-11', invoice_number: 'INV-3-0013' },
      { id: 74, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 157382, date: '2025-09-12', invoice_number: 'INV-3-0014' },
      { id: 75, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 268341, date: '2025-09-13', invoice_number: 'INV-3-0015' },
      { id: 76, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 79102, date: '2025-09-14', invoice_number: 'INV-3-0016' },
      { id: 77, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 158408, date: '2025-09-15', invoice_number: 'INV-3-0017' },
      { id: 78, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 115004, date: '2025-09-16', invoice_number: 'INV-3-0018' },
      { id: 79, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 186786, date: '2025-09-17', invoice_number: 'INV-3-0019' },
      { id: 80, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 257843, date: '2025-09-18', invoice_number: 'INV-3-0020' },
      { id: 81, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 164432, date: '2025-09-19', invoice_number: 'INV-3-0021' },
      { id: 82, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 117618, date: '2025-09-20', invoice_number: 'INV-3-0022' },
      { id: 83, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 68486, date: '2025-09-21', invoice_number: 'INV-3-0023' },
      { id: 84, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 218046, date: '2025-09-22', invoice_number: 'INV-3-0024' },
      { id: 85, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 180338, date: '2025-09-23', invoice_number: 'INV-3-0025' },
      { id: 86, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 218491, date: '2025-09-24', invoice_number: 'INV-3-0026' },
      { id: 87, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 37625, date: '2025-09-25', invoice_number: 'INV-3-0027' },
      { id: 88, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 265059, date: '2025-09-26', invoice_number: 'INV-3-0028' },
      { id: 89, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 79191, date: '2025-09-27', invoice_number: 'INV-3-0029' },
      { id: 90, payment_method_id: 3, payment_method_name: 'Transferencia Bancaria', amount: 264280, date: '2025-09-28', invoice_number: 'INV-3-0030' }
    ]

    let payments = allPayments

    if (paymentMethodId) {
      payments = payments.filter(p => p.payment_method_id === Number(paymentMethodId))
    }

    if (filter) {
      payments = payments.filter(p =>
        p.invoice_number.toLowerCase().includes(filter) ||
        p.payment_method_name.toLowerCase().includes(filter) ||
        String(p.amount).includes(filter)
      )
    }

    // Simular paginación del servidor
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const rowsPerPage = parseInt(url.searchParams.get('rowsPerPage') || '10', 10)
    const rowsNumber = payments.length

    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    const paginatedPayments = payments.slice(start, end)

    return HttpResponse.json({
      rows: paginatedPayments,
      rowsNumber
    })
  })
]
