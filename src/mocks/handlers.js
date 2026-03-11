import { http, HttpResponse, delay } from 'msw'

// Use a wildcard prefix so MSW catches the request regardless of the exact absolute URL
const apiUrl = (path) => `*/${path}`

// Initial Mock Data
let chats = [
  {
    id: 1,
    title: 'Análisis de ventas mensuales',
    subject: 'Análisis de ventas',
    last_message: { content: 'Tus productos más vendidos este mes son las hamburguesas.' },
    updated_at: new Date().toISOString(),
    unread_count: 0,
    company_id: 1,
    messages: [
      {
        id: 101,
        role: 'user',
        content: '¿Cuáles fueron mis productos más vendidos?',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 102,
        role: 'assistant',
        content: 'Tus productos más vendidos este mes son las hamburguesas y las papas fritas.',
        created_at: new Date(Date.now() - 3500000).toISOString()
      }
    ]
  },
  {
    id: 2,
    title: 'Dudas sobre facturación',
    subject: 'Dudas sobre facturación',
    last_message: { content: 'Para emitir una factura electrónica debes ir a la sección...' },
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    unread_count: 2,
    company_id: 1,
    messages: [
      {
        id: 201,
        role: 'user',
        content: '¿Cómo emito una factura electrónica desde el panel?',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 202,
        role: 'assistant',
        content: 'Para emitir una factura electrónica debes ir a la sección "Facturación" en el menú principal, seleccionar el pedido y hacer clic en "Generar Factura".',
        created_at: new Date(Date.now() - 86300000).toISOString()
      }
    ]
  }
]

export const handlers = [
  // List chats
  http.get(apiUrl('ai-chats'), ({ request }) => {
    // Return all chats
    return HttpResponse.json({
      data: chats.map(c => {
        // Exclude messages from list endpoint
        const { messages, ...chatMeta } = c
        return chatMeta
      })
    })
  }),

  // Get specific chat
  http.get(apiUrl('ai-chats/:id'), ({ params }) => {
    const chat = chats.find(c => c.id === Number(params.id))
    if (!chat) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(chat)
  }),

  // Create new chat
  http.post(apiUrl('ai-chats'), async ({ request }) => {
    await delay(5000) // 5 seconds delay to allow testing consecutive messages
    const data = await request.json()
    const newChat = {
      id: Date.now(),
      title: 'Nueva Conversación',
      subject: 'Nueva Conversación',
      last_message: { content: '¡Claro! ¿En qué te ayudo?' },
      updated_at: new Date().toISOString(),
      unread_count: 0,
      company_id: data.company_id,
      messages: [
        {
          id: Date.now() + 1,
          role: 'user',
          content: data.message,
          created_at: new Date().toISOString()
        },
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: '¡Claro! He recibido tu consulta: "' + data.message + '". Estoy procesando la respuesta (esto es un mock de MSW).',
          created_at: new Date(Date.now() + 1000).toISOString()
        }
      ]
    }
    chats.unshift(newChat)
    return HttpResponse.json(newChat)
  }),

  // Send message
  http.post(apiUrl('ai-chats/:id/messages'), async ({ request, params }) => {
    await delay(5000) // 5 seconds delay to allow testing consecutive messages
    const chat = chats.find(c => c.id === Number(params.id))
    if (!chat) return new HttpResponse(null, { status: 404 })

    const data = await request.json()

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: data.message,
      created_at: new Date().toISOString()
    }

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: 'Esta es una respuesta simulada por MSW. Has dicho: "' + data.message + '"',
      created_at: new Date(Date.now() + 1000).toISOString()
    }

    chat.messages.push(userMessage, assistantMessage)
    chat.last_message = assistantMessage
    chat.updated_at = new Date().toISOString()

    return HttpResponse.json({
      user_message: userMessage,
      assistant_message: assistantMessage
    })
  }),

  // Delete chat
  http.delete(apiUrl('ai-chats/:id'), ({ params }) => {
    chats = chats.filter(c => c.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  })
]
