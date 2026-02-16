import { http, HttpResponse } from 'msw'

// Helper to generate products
const generateProducts = (count) => {
  const products = []
  const categories = [1, 2, 3, 4, 5] // Mock category IDs

  for (let i = 1; i <= count; i++) {
    const categoryId = categories[i % categories.length]
    products.push({
      id: i,
      name: `Producto Premium #${i}`,
      price: Math.floor(Math.random() * 100) + 10,
      description: `Esta es una descripción detallada para el producto premium #${i}. Calidad superior garantizada.`,
      images: [
        { url: `https://picsum.photos/id/${(i % 50) + 10}/400/300` }
      ],
      category_id: categoryId,
      show_catalog: 1,
      is_bundle: false,
      normal_stock: 50,
      skip_stock: true,
      product_addons: [
        { id: 100 + i, name: 'Extra Salsa', price: 2, amount: 0 },
        { id: 200 + i, name: 'Queso adicional', price: 3, amount: 0 }
      ]
    })
  }
  return products
}

const allProducts = generateProducts(50) // Generating 50 products

export const handlers = [
  // Intercepting Products
  http.get('**/public/products/:company_id', ({ params, request }) => {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get('dataEqualFilter[category_id]')

    let filteredProducts = allProducts
    if (categoryId && categoryId !== 'null') {
      filteredProducts = allProducts.filter(p => p.category_id === parseInt(categoryId))
    }

    return HttpResponse.json(filteredProducts)
  }),

  // Intercepting Categories
  http.get('**/public/categories/:company_id', () => {
    return HttpResponse.json([
      { id: 1, name: 'Hamburguesas', show_catalog: 1 },
      { id: 2, name: 'Pizzas', show_catalog: 1 },
      { id: 3, name: 'Bebidas', show_catalog: 1 },
      { id: 4, name: 'Postres', show_catalog: 1 },
      { id: 5, name: 'Entradas', show_catalog: 1 },
      { id: 6, name: 'Pastas', show_catalog: 1 },
      { id: 7, name: 'Pasticho', show_catalog: 1 }
    ])
  }),

  // Intercepting Company Info
  http.get('**/public/company/:company_id', () => {
    return HttpResponse.json({
      id: 1,
      name: 'OrderWise Mock Demo',
      url: 'https://picsum.photos/200',
      company_config: {
        coin_id: 1,
        other: {
          menu: {
            banner_url: 'https://picsum.photos/800/200',
            description: 'Bienvenido a nuestro menú Premium. Disfruta de la mejor experiencia gastronómica.',
            schedule: {}
          }
        }
      }
    })
  }),

  // Intercepting Payment Methods
  http.get('**/public/payment-methods/:company_id', () => {
    return HttpResponse.json([
      { id: 1, name: 'Efectivo', attributes: [] },
      { id: 2, name: 'Transferencia Bancaria', attributes: [{ id: 1, attribute_name: 'Banco: Qbits Bank' }, { id: 2, attribute_name: 'Cuenta: 123456789' }] },
      { id: 3, name: 'Pago Móvil', attributes: [{ id: 3, attribute_name: 'Teléfono: 0412-1234567' }] }
    ])
  }),

  // Intercepting Invoices (Orders)
  http.get('**/public/invoices', () => {
    return HttpResponse.json({
      data: [
        {
          id: 1001,
          code: 'ORD-001',
          total: 150,
          status: 'pending',
          created_at: new Date().toISOString(),
          client: { name: 'Cliente de Prueba' },
          invoice_payments: []
        }
      ]
    })
  }),

  // Session Tracking Mocks
  http.post('**/user-sessions/connect', () => {
    return HttpResponse.json({
      success: true,
      session_uuid: 'mock-session-uuid-12345'
    })
  }),

  http.post('**/user-sessions/disconnect', () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('**/user-sessions/track-activity', () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('**/user-sessions/update-status', () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('**/user-sessions/heartbeat', () => {
    return HttpResponse.json({ success: true })
  }),

  // Broadcasting Auth Mock
  http.post('**/broadcasting/auth', () => {
    return HttpResponse.json({
      auth: 'mock-auth-string',
      channel_data: JSON.stringify({ user_id: 1, user_info: { name: 'Mock User' } })
    })
  })
]
