import { http, HttpResponse } from 'msw'

const categoryNames = [
  'PROMO PANCHO', 'GOLOSINAS', 'CHOCOLATES', 'ALMACEN', 'BEBIDAS',
  'GALLETITAS', 'ALCOHOL', 'HELADO', 'SNACKS', 'GASEOSAS',
  'LACTEOS', 'TABACO', 'agua', 'ALFAJORES', 'ALFAJOR',
  'FARMACIA', '- Sin Departamento -', 'CARAMELOS', 'JUGO', 'VARIOS',
  'CERVEZAS', 'ANTEOJOS', 'JUGOS', 'PAN DULCE', 'PASTILLAS',
  'CIGARRILLOS', 'chcolates', 'CEREAL', 'CBARRITA DE CEREAL', 'VINO',
  'cigarrillos sueltos', 'chcocolates', 'colgantes', 'ENCENDENDOR', 'ENSALADA DE FRUTAS',
  'YERBA', 'FRANUIS', 'alcoholo', 'ALFAJOR PROMO', 'ENERGIZANTES',
  'GIO', 'GOMITAS', 'jug', 'Sin categoría', 'hielo',
  'LECHE', 'CARTAS', 'CHOCOLATADA', 'PILA', 'PRESTOBARBA',
  'PANCHO', 'PAPELILLOS SUELTOS', 'PROMO JUGO', 'PROMO MANZANA', 'COMIDA',
  'TURRON', 'VELA', 'CAFE', 'QUESOS', 'FIAMBRES',
  'REMEDIOS', 'CONGELADOS', 'PANIFICADAS', 'PERFUMERÍA', 'LIMPIEZA'
]

// Generar categorías basadas en el listado del usuario (IDs desde 3397)
const categoriesData = categoryNames.map((name, index) => {
  const id = 3397 + index
  return {
    id,
    name,
    printer_id: null,
    aliquot_type: null,
    show_catalog: 1,
    sort_order: index + 1,
    company_id: 39,
    user_created_id: 35,
    user_updated_id: null,
    created_at: '2025-10-09T22:35:04.000000Z',
    updated_at: '2026-03-02T16:15:30.000000Z',
    deleted_at: null,
    product_count: index === 0 ? 50 : Math.floor(Math.random() * 15) + 5 // Al menos 5 productos, 50 para la primera
  }
})

const generateProductsForCategories = (categories) => {
  const allProducts = []
  let productId = 1

  categories.forEach(cat => {
    for (let i = 0; i < cat.product_count; i++) {
      const price = Math.floor(Math.random() * 8000) + 1000
      const cost = price * 0.6

      allProducts.push({
        id: productId,
        name: `${cat.name} - Producto ${i + 1}`,
        company_id: 39,
        cost: cost,
        description: `Esta es la descripción para ${cat.name} producto ${i + 1}. Ideal para pruebas de rendimiento.`,
        is_bundle: 0,
        is_addons: 0,
        is_default: 0,
        barcode: `759${productId.toString().padStart(10, '0')}`,
        aliases: null,
        price: price,
        skip_stock: 1,
        category_id: cat.id,
        product_type: 'RAW_MATERIAL',
        preparation_time: null,
        cooking_time: null,
        procedure: null,
        servings: null,
        aliquot_type: null,
        unit_of_measure_id: 1,
        base_quantity: 1,
        show_catalog: 1,
        user_created_id: 35,
        user_updated_id: 35,
        created_at: '2024-12-11T17:21:05.000000Z',
        updated_at: '2026-02-25T13:46:46.000000Z',
        deleted_at: null,
        minimum_stock: '0.00',
        sold: Math.floor(Math.random() * 50),
        average_rating: 0,
        ratings_count: 0,
        favorites_count: 0,
        profit_percentage: 40,
        yield_unit_id: null,
        bundle_stock: 0,
        total_cost: 0,
        normal_stock: 100,
        images: [
          {
            id: 1000 + productId,
            product_id: productId,
            url: `https://picsum.photos/400/400?random=${productId}`,
            created_at: '2025-01-17T00:25:19.000000Z',
            updated_at: '2025-01-17T00:25:19.000000Z',
            deleted_at: null
          }
        ],
        category: {
          id: cat.id,
          name: cat.name
        },
        addons: [],
        product_addons: []
      })
      productId++
    }
  })

  return allProducts
}

const mockProducts = generateProductsForCategories(categoriesData)

export const handlers = [
  // Interceptar productos
  http.get('*/public/products/:companyId', ({ request }) => {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get('dataEqualFilter[category_id]')

    console.log('MSW: Petición de productos para categoría ID:', categoryId)

    let filtered = mockProducts
    if (categoryId) {
      filtered = mockProducts.filter(p => p.category_id === parseInt(categoryId))
    }

    return HttpResponse.json({
      data: filtered,
      total: filtered.length
    })
  }),

  // Interceptar categorías
  http.get('*/public/categories/:companyId', () => {
    console.log('MSW: Petición de categorías interceptada')
    return HttpResponse.json(categoriesData)
  })
]
