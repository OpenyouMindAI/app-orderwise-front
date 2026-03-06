/* eslint-disable camelcase */
import { http, HttpResponse } from 'msw'

// Obtener la URL base de las variables de entorno
const rawApiUrl = import.meta.env.VITE_APP_API_URL || ''
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl

const categoryNames = [
  'PROMO PANCHO', 'GOLOSINAS', 'CHOCOLATES', 'ALMACEN', 'BEBIDAS',
  'GALLETITAS', 'ALCOHOL', 'HELADO', 'SNACKS', 'GASEOSAS',
  'LACTEOS', 'TABACO', 'agua', 'ALFAJORES', 'ALFAJOR'
]

const generateCategories = (companyId) => {
  return categoryNames.map((name, index) => {
    const id = 3397 + index
    // Variamos los conteos para probar los bloques (30, 5, 5, 30...)
    const product_count = (index % 4 === 0) ? 60 : 10
    return {
      id,
      name,
      sort_order: index + 1,
      company_id: parseInt(companyId),
      product_count
    }
  })
}

const generateProductsForCategory = (cat, branchId) => {
  const products = []
  for (let i = 0; i < cat.product_count; i++) {
    const productId = cat.id * 1000 + i
    const price = Math.floor(Math.random() * 8000) + 1000
    products.push({
      id: productId,
      name: `${cat.name} - Producto ${i + 1}`,
      company_id: cat.company_id,
      branch_office_id: branchId ? parseInt(branchId) : null,
      description: `Descripción detallada del producto ${cat.name} número ${i + 1}`,
      price,
      category_id: cat.id,
      show_catalog: 1,
      images: [{ url: `https://picsum.photos/400/400?random=${productId}` }],
      category: { id: cat.id, name: cat.name }
    })
  }
  return products
}

export const handlers = [
  // Categorías
  http.get(`${API_URL}/public/categories/:companyId`, ({ params }) => {
    return HttpResponse.json(generateCategories(params.companyId))
  }),

  // Productos con soporte de Paginación Global (Bloques)
  http.get(`${API_URL}/public/products/:companyId`, ({ params, request }) => {
    const { companyId } = params
    const url = new URL(request.url)

    // Parámetros de paginación
    const page = parseInt(url.searchParams.get('page') || '1')
    const rowsPerPage = parseInt(url.searchParams.get('rowsPerPage') || '50')
    const categoryId = url.searchParams.get('dataEqualFilter[category_id]')

    const categories = generateCategories(companyId)
    const branchId = url.searchParams.get('branch_office_id')

    // 1. Generar todos los productos en orden de categoría
    let allProducts = []
    categories.forEach(cat => {
      allProducts = [...allProducts, ...generateProductsForCategory(cat, branchId)]
    })

    // 2. Si hay filtro de categoría, filtramos primero
    let filtered = allProducts
    if (categoryId) {
      filtered = allProducts.filter(p => p.category_id === parseInt(categoryId))
    }

    // 3. Aplicar paginación (bloques)
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    const paginated = filtered.slice(start, end)

    return HttpResponse.json({
      data: paginated,
      total: filtered.length
    })
  }),

  // Empresa
  http.get(`${API_URL}/public/company/:companyId`, ({ params }) => {
    return HttpResponse.json({
      id: parseInt(params.companyId),
      name: `Empresa de Prueba ${params.companyId}`,
      logo: null
    })
  })
]
