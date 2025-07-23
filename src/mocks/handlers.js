import { http, HttpResponse } from 'msw'

// Mock data para cajas
const mockCashBoxes = [
  { id: 1, name: 'Caja Principal', location: 'Planta Baja', status: 'available' },
  { id: 2, name: 'Caja Secundaria', location: 'Primer Piso', status: 'available' },
  { id: 3, name: 'Caja Rápida', location: 'Entrada', status: 'available' }
]

// Mock data para cajas abiertas
const openCashBoxes = []

export const handlers = [
  // GET /init-cashbox - Verificar si el usuario tiene una caja abierta
  http.get(/.*\/api\/init-cashbox$/, ({ request }) => {
    const url = new URL(request.url)
    const cashierId = url.searchParams.get('dataEqualFilter[cashier_id]') ||
      JSON.parse(url.searchParams.get('dataEqualFilter') || '{}').cashier_id

    console.log('MSW: Verificando caja abierta para cashier:', cashierId)

    // Buscar si el cajero tiene una caja abierta
    const openBox = openCashBoxes.find(box =>
      box.cashier_id === cashierId && box.status === 'open'
    )

    if (openBox) {
      return HttpResponse.json({
        data: [openBox],
        message: 'Caja abierta encontrada'
      })
    } else {
      return HttpResponse.json({
        data: [],
        message: 'No hay cajas abiertas'
      })
    }
  }),

  // GET /cashboxs - Obtener cajas disponibles
  http.get(/.*\/api\/cashboxs$/, () => {
    console.log('MSW: Obteniendo cajas disponibles')

    return HttpResponse.json({
      data: mockCashBoxes,
      message: 'Cajas disponibles obtenidas'
    })
  }),

  // POST /init-cashboxs - Abrir una caja
  http.post(/.*\/api\/init-cashboxs$/, async ({ request }) => {
    const body = await request.json()
    console.log('MSW: Abriendo caja con payload:', body)

    // Simular validaciones
    if (!body.cash_box_id || !body.init_amount || !body.cashier_id) {
      return HttpResponse.json(
        { message: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Verificar si la caja existe
    const cashBox = mockCashBoxes.find(box => box.id === body.cash_box_id)
    if (!cashBox) {
      return HttpResponse.json(
        { message: 'Caja no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si el cajero ya tiene una caja abierta
    const existingBox = openCashBoxes.find(box =>
      box.cashier_id === body.cashier_id && box.status === 'open'
    )
    if (existingBox) {
      return HttpResponse.json(
        { message: 'Ya tienes una caja abierta' },
        { status: 409 }
      )
    }

    // Crear registro de caja abierta
    const newOpenBox = {
      id: Date.now(), // ID único simple
      cash_box_id: body.cash_box_id,
      cash_box_name: cashBox.name,
      cashier_id: body.cashier_id,
      init_amount: body.init_amount,
      status: 'open',
      opened_at: new Date().toISOString()
    }

    openCashBoxes.push(newOpenBox)

    return HttpResponse.json({
      data: newOpenBox,
      message: `Caja "${cashBox.name}" abierta con éxito`
    })
  }),

  // POST /close-cashbox - Cerrar una caja
  http.post(/.*\/api\/close-cashbox$/, async ({ request }) => {
    const body = await request.json()
    console.log('MSW: Cerrando caja con payload:', body)

    // Buscar la caja abierta del cajero
    const openBoxIndex = openCashBoxes.findIndex(box =>
      box.cashier_id === body.cashier_id && box.status === 'open'
    )

    if (openBoxIndex === -1) {
      return HttpResponse.json(
        { message: 'No tienes ninguna caja abierta' },
        { status: 404 }
      )
    }

    // Cerrar la caja
    const closedBox = { ...openCashBoxes[openBoxIndex] }
    closedBox.status = 'closed'
    closedBox.closed_at = new Date().toISOString()
    closedBox.final_amount = body.final_amount || closedBox.init_amount

    // Remover de cajas abiertas
    openCashBoxes.splice(openBoxIndex, 1)

    return HttpResponse.json({
      data: closedBox,
      message: `Caja "${closedBox.cash_box_name}" cerrada con éxito`
    })
  })
]
