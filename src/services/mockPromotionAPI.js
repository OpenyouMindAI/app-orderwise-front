/**
 * Mock API for Promotions with localStorage persistence
 * Simulates a real API with full CRUD operations and data persistence across tabs
 */

class MockPromotionAPI {
  constructor () {
    this.storageKeys = {
      promotions: 'app_promotions',
      products: 'app_products_catalog',
      orders: 'app_promotion_orders',
      config: 'app_promotion_config'
    }
    this.initializeData()
  }

  // Initialize default data if not exists
  initializeData () {
    if (!localStorage.getItem(this.storageKeys.promotions)) {
      this.setStorageData(this.storageKeys.promotions, [])
    }

    if (!localStorage.getItem(this.storageKeys.products)) {
      this.setStorageData(this.storageKeys.products, this.getDefaultProducts())
    }

    if (!localStorage.getItem(this.storageKeys.orders)) {
      this.setStorageData(this.storageKeys.orders, [])
    }
  }

  // Storage helpers
  getStorageData (key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || []
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return []
    }
  }

  setStorageData (key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Attempting to clean up old data...')
        this.cleanupOldData()
        try {
          localStorage.setItem(key, JSON.stringify(data))
          return true
        } catch (retryError) {
          console.error('localStorage quota still exceeded after cleanup:', retryError)
          return false
        }
      }
      console.error('Error writing to localStorage:', error)
      return false
    }
  }

  // Generate UUID for new records
  generateId () {
    return 'promo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Simulate API delay
  delay (ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Default products catalog
  getDefaultProducts () {
    return [
      {
        productId: 1,
        name: 'EMPANADA CARNE',
        price: 1100,
        cost: 600,
        stock: 100,
        category: 'Empanadas',
        active: true,
        images: [{ url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?q=80&w=1000' }]
      },
      {
        productId: 2,
        name: 'EMPANADA POLLO',
        price: 1100,
        cost: 600,
        stock: 80,
        category: 'Empanadas',
        active: true,
        images: [{ url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?q=80&w=1000' }]
      },
      {
        productId: 3,
        name: 'EMPANADA JAMÓN Y QUESO',
        price: 1200,
        cost: 650,
        stock: 60,
        category: 'Empanadas',
        active: true,
        images: [{ url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?q=80&w=1000' }]
      },
      {
        productId: 4,
        name: 'COCA-COLA 500CC',
        price: 1800,
        cost: 900,
        stock: 150,
        category: 'Bebidas',
        active: true,
        images: [{ url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=1000' }]
      },
      {
        productId: 5,
        name: 'FANTA 500CC',
        price: 1800,
        cost: 900,
        stock: 120,
        category: 'Bebidas',
        active: true,
        images: [{ url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=1000' }]
      },
      {
        productId: 6,
        name: 'SPRITE 500CC',
        price: 1800,
        cost: 900,
        stock: 90,
        category: 'Bebidas',
        active: true,
        images: [{ url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=1000' }]
      }
    ]
  }

  // ================== PROMOTIONS API ==================

  // Get all promotions
  async getPromotions (filters = {}) {
    await this.delay()

    let promotions = this.getStorageData(this.storageKeys.promotions)

    // Apply filters
    if (filters.status) {
      promotions = promotions.filter(p => p.status === filters.status)
    }

    if (filters.channel) {
      promotions = promotions.filter(p => p.channel === filters.channel || p.channel === 'BOTH')
    }

    if (filters.active !== undefined) {
      const now = new Date().toISOString()
      promotions = promotions.filter(p => {
        const isActive = p.startDate <= now && p.endDate >= now && p.status === 'ACTIVE'
        return filters.active ? isActive : !isActive
      })
    }

    return {
      data: promotions,
      total: promotions.length,
      success: true
    }
  }

  // Get promotion by ID
  async getPromotionById (id) {
    await this.delay()

    const promotions = this.getStorageData(this.storageKeys.promotions)
    const promotion = promotions.find(p => p.id === id)

    if (!promotion) {
      return {
        success: false,
        error: 'Promotion not found'
      }
    }

    return {
      data: promotion,
      success: true
    }
  }

  // Create new promotion
  async createPromotion (promotionData) {
    await this.delay()

    // Compress images to reduce storage size
    const processedData = { ...promotionData }
    if (processedData.images && Array.isArray(processedData.images)) {
      processedData.images = processedData.images.map(image => ({
        ...image,
        url: this.compressImageData(image.url)
      }))
    }
    if (processedData.imageUrl) {
      processedData.imageUrl = this.compressImageData(processedData.imageUrl)
    }

    const promotion = {
      id: this.generateId(),
      ...processedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const promotions = this.getStorageData(this.storageKeys.promotions)
    promotions.push(promotion)

    if (this.setStorageData(this.storageKeys.promotions, promotions)) {
      return {
        data: promotion,
        success: true
      }
    }

    return {
      success: false,
      error: 'Failed to save promotion'
    }
  }

  // Update promotion
  async updatePromotion (id, updateData) {
    await this.delay()

    const promotions = this.getStorageData(this.storageKeys.promotions)
    const index = promotions.findIndex(p => p.id === id)

    if (index === -1) {
      return {
        success: false,
        error: 'Promotion not found'
      }
    }

    promotions[index] = {
      ...promotions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    if (this.setStorageData(this.storageKeys.promotions, promotions)) {
      return {
        data: promotions[index],
        success: true
      }
    }

    return {
      success: false,
      error: 'Failed to update promotion'
    }
  }

  // Delete promotion
  async deletePromotion (id) {
    await this.delay()

    let promotions = this.getStorageData(this.storageKeys.promotions)
    const initialLength = promotions.length

    promotions = promotions.filter(p => p.id !== id)

    if (promotions.length === initialLength) {
      return {
        success: false,
        error: 'Promotion not found'
      }
    }

    if (this.setStorageData(this.storageKeys.promotions, promotions)) {
      return {
        success: true,
        message: 'Promotion deleted successfully'
      }
    }

    return {
      success: false,
      error: 'Failed to delete promotion'
    }
  }

  // ================== PRODUCTS API ==================

  // Get products catalog
  async getProducts (filters = {}) {
    await this.delay()

    let products = this.getStorageData(this.storageKeys.products)

    // Apply filters
    if (filters.category) {
      products = products.filter(p => p.category === filters.category)
    }

    if (filters.active !== undefined) {
      products = products.filter(p => p.active === filters.active)
    }

    if (filters.inStock) {
      products = products.filter(p => p.stock > 0)
    }

    return {
      data: products,
      total: products.length,
      success: true
    }
  }

  // Update product stock
  async updateProductStock (productId, quantity, operation = 'subtract') {
    await this.delay()

    const products = this.getStorageData(this.storageKeys.products)
    const index = products.findIndex(p => p.productId === productId)

    if (index === -1) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    const currentStock = products[index].stock
    const newStock = operation === 'subtract'
      ? currentStock - quantity
      : currentStock + quantity

    if (newStock < 0) {
      return {
        success: false,
        error: 'Insufficient stock'
      }
    }

    products[index].stock = newStock

    if (this.setStorageData(this.storageKeys.products, products)) {
      return {
        data: products[index],
        success: true
      }
    }

    return {
      success: false,
      error: 'Failed to update stock'
    }
  }

  // ================== ORDERS API ==================

  // Create order with promotion details
  async createOrder (orderData) {
    await this.delay()

    const order = {
      id: this.generateId(),
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    }

    const orders = this.getStorageData(this.storageKeys.orders)
    orders.push(order)

    if (this.setStorageData(this.storageKeys.orders, orders)) {
      // Update stock for ordered products
      for (const item of order.items) {
        if (item.type === 'promotion' && item.selectedProducts) {
          for (const selection of item.selectedProducts) {
            await this.updateProductStock(selection.productId, selection.quantity, 'subtract')
          }
        }
      }

      return {
        data: order,
        success: true
      }
    }

    return {
      success: false,
      error: 'Failed to create order'
    }
  }

  // Get orders with promotion details
  async getOrders (filters = {}) {
    await this.delay()

    let orders = this.getStorageData(this.storageKeys.orders)

    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status)
    }

    return {
      data: orders,
      total: orders.length,
      success: true
    }
  }

  // ================== UTILITY METHODS ==================

  // Clean up old data to free up space
  cleanupOldData () {
    try {
      // Remove old orders (keep only last 10)
      const orders = this.getStorageData(this.storageKeys.orders)
      if (orders.length > 10) {
        const recentOrders = orders.slice(-10)
        this.setStorageData(this.storageKeys.orders, recentOrders)
      }

      // Remove old promotions (keep only last 20)
      const promotions = this.getStorageData(this.storageKeys.promotions)
      if (promotions.length > 20) {
        const recentPromotions = promotions.slice(-20)
        this.setStorageData(this.storageKeys.promotions, recentPromotions)
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  // Compress image data to reduce storage size
  compressImageData (imageData) {
    try {
      if (!imageData || typeof imageData !== 'string') {
        return imageData
      }

      // Just return the original image for now to ensure saving works
      // In production, implement proper image compression
      return imageData
    } catch (error) {
      console.error('Error compressing image:', error)
      return imageData
    }
  }

  // Clear all data (for testing)
  clearAllData () {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key)
    })
    this.initializeData()
  }

  // Export data (for backup)
  exportData () {
    const data = {}
    Object.entries(this.storageKeys).forEach(([name, key]) => {
      data[name] = this.getStorageData(key)
    })
    return data
  }

  // Import data (for restore)
  importData (data) {
    Object.entries(this.storageKeys).forEach(([name, key]) => {
      if (data[name]) {
        this.setStorageData(key, data[name])
      }
    })
  }
}

// Export singleton instance
export default new MockPromotionAPI()
