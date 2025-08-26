/**
 * Comprehensive data models for the promotion system
 * Based on the functional requirements for promotion creation and management
 */

// Promotion status options
export const PROMOTION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT: 'DRAFT',
  EXPIRED: 'EXPIRED'
}

// Channel options
export const PROMOTION_CHANNELS = {
  POS: 'POS',
  ONLINE: 'ONLINE',
  BOTH: 'BOTH'
}

// Pricing modes
export const PRICING_MODES = {
  FIXED_WITH_MODIFIERS: 'FIXED_WITH_MODIFIERS', // Fixed promo price + modifiers
  COMPONENT_SUM: 'COMPONENT_SUM' // Sum of component prices + modifiers
}

// Price modifier types
export const PRICE_MODIFIER_TYPES = {
  FIXED: 'FIXED', // Fixed amount (+$500)
  PERCENTAGE: 'PERCENTAGE' // Percentage (+10%)
}

// Selection step types
export const SELECTION_STEPS = {
  EXACT: 'EXACT', // Exact quantity (exactly 12)
  MULTIPLES: 'MULTIPLES', // Multiples of X (multiples of 6)
  RANGE: 'RANGE' // Any number in range
}

/**
 * Main Promotion Model
 */
export class PromotionModel {
  constructor (data = {}) {
    // Basic information
    this.id = data.id || null
    this.name = data.name || ''
    this.description = data.description || ''
    this.status = data.status || PROMOTION_STATUS.DRAFT
    this.channel = data.channel || PROMOTION_CHANNELS.BOTH

    // Validity period
    this.startDate = data.startDate || null
    this.endDate = data.endDate || null

    // Pricing configuration
    this.pricingMode = data.pricingMode || PRICING_MODES.FIXED_WITH_MODIFIERS
    this.basePrice = data.basePrice || 0 // Only used in FIXED_WITH_MODIFIERS mode
    this.finalPrice = data.finalPrice || 0 // Calculated final price

    // Selection groups
    this.selectionGroups = data.selectionGroups || []

    // Display configuration
    this.images = data.images || []
    this.displayOrder = data.displayOrder || 0
    this.featured = data.featured || false

    // System fields
    this.createdAt = data.createdAt || null
    this.updatedAt = data.updatedAt || null
    this.createdBy = data.createdBy || null

    // Analytics and reporting
    this.totalOrders = data.totalOrders || 0
    this.totalRevenue = data.totalRevenue || 0
  }

  /**
   * Validate promotion data
   */
  validate () {
    const errors = []

    if (!this.name.trim()) {
      errors.push('Name is required')
    }

    if (!this.description.trim()) {
      errors.push('Description is required')
    }

    if (!this.startDate) {
      errors.push('Start date is required')
    }

    if (!this.endDate) {
      errors.push('End date is required')
    }

    if (this.startDate && this.endDate && new Date(this.startDate) >= new Date(this.endDate)) {
      errors.push('End date must be after start date')
    }

    if (this.selectionGroups.length === 0) {
      errors.push('At least one selection group is required')
    }

    if (this.pricingMode === PRICING_MODES.FIXED_WITH_MODIFIERS && this.basePrice <= 0) {
      errors.push('Base price must be greater than 0 for fixed pricing mode')
    }

    // Validate selection groups
    this.selectionGroups.forEach((group, index) => {
      const groupErrors = group.validate()
      if (groupErrors.length > 0) {
        errors.push(`Group ${index + 1}: ${groupErrors.join(', ')}`)
      }
    })

    return errors
  }

  /**
   * Check if promotion is currently active
   */
  isActive () {
    const now = new Date()
    const start = new Date(this.startDate)
    const end = new Date(this.endDate)

    return this.status === PROMOTION_STATUS.ACTIVE &&
           now >= start &&
           now <= end
  }

  /**
   * Calculate total price based on selections
   */
  calculatePrice (selections = []) {
    if (this.pricingMode === PRICING_MODES.FIXED_WITH_MODIFIERS) {
      // Start with base price and add modifiers
      let total = this.basePrice

      selections.forEach(selection => {
        if (selection.priceModifier) {
          if (selection.priceModifier.type === PRICE_MODIFIER_TYPES.FIXED) {
            total += selection.priceModifier.value * selection.quantity
          } else if (selection.priceModifier.type === PRICE_MODIFIER_TYPES.PERCENTAGE) {
            total += (selection.product.price * selection.priceModifier.value / 100) * selection.quantity
          }
        }
      })

      return total
    } else {
      // Sum component prices and modifiers
      return selections.reduce((total, selection) => {
        let itemPrice = selection.product.price

        if (selection.priceModifier) {
          if (selection.priceModifier.type === PRICE_MODIFIER_TYPES.FIXED) {
            itemPrice += selection.priceModifier.value
          } else if (selection.priceModifier.type === PRICE_MODIFIER_TYPES.PERCENTAGE) {
            itemPrice += (itemPrice * selection.priceModifier.value / 100)
          }
        }

        return total + (itemPrice * selection.quantity)
      }, 0)
    }
  }

  /**
   * Export to JSON
   */
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      channel: this.channel,
      startDate: this.startDate,
      endDate: this.endDate,
      pricingMode: this.pricingMode,
      basePrice: this.basePrice,
      finalPrice: this.finalPrice,
      selectionGroups: this.selectionGroups.map(group => group.toJSON()),
      images: this.images,
      displayOrder: this.displayOrder,
      featured: this.featured,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      totalOrders: this.totalOrders,
      totalRevenue: this.totalRevenue
    }
  }
}

/**
 * Selection Group Model
 */
export class SelectionGroupModel {
  constructor (data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.description = data.description || ''
    this.required = data.required !== undefined ? data.required : true

    // Selection constraints
    this.minSelection = data.minSelection || 0
    this.maxSelection = data.maxSelection || 1
    this.selectionStep = data.selectionStep || SELECTION_STEPS.RANGE
    this.stepValue = data.stepValue || 1 // For multiples or exact

    // Display configuration
    this.displayOrder = data.displayOrder || 0
    this.showImages = data.showImages !== undefined ? data.showImages : true
    this.multiColumn = data.multiColumn !== undefined ? data.multiColumn : false

    // Product options
    this.products = data.products || []
  }

  /**
   * Validate selection group
   */
  validate () {
    const errors = []

    if (!this.name.trim()) {
      errors.push('Group name is required')
    }

    if (this.minSelection < 0) {
      errors.push('Minimum selection cannot be negative')
    }

    if (this.maxSelection <= 0) {
      errors.push('Maximum selection must be greater than 0')
    }

    if (this.minSelection > this.maxSelection) {
      errors.push('Minimum selection cannot be greater than maximum')
    }

    if (this.products.length === 0) {
      errors.push('At least one product option is required')
    }

    // Validate product options
    this.products.forEach((product, index) => {
      const productErrors = product.validate()
      if (productErrors.length > 0) {
        errors.push(`Product ${index + 1}: ${productErrors.join(', ')}`)
      }
    })

    return errors
  }

  /**
   * Check if selection quantity is valid for this group
   */
  isValidSelection (quantity) {
    if (quantity < this.minSelection || quantity > this.maxSelection) {
      return false
    }

    if (this.selectionStep === SELECTION_STEPS.EXACT) {
      return quantity === this.stepValue
    }

    if (this.selectionStep === SELECTION_STEPS.MULTIPLES) {
      return quantity % this.stepValue === 0
    }

    return true // RANGE allows any quantity within min/max
  }

  /**
   * Get available product options (considering stock and active status)
   */
  getAvailableProducts () {
    return this.products.filter(product =>
      product.isAvailable()
    )
  }

  /**
   * Export to JSON
   */
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      required: this.required,
      minSelection: this.minSelection,
      maxSelection: this.maxSelection,
      selectionStep: this.selectionStep,
      stepValue: this.stepValue,
      displayOrder: this.displayOrder,
      showImages: this.showImages,
      multiColumn: this.multiColumn,
      products: this.products.map(product => product.toJSON())
    }
  }
}

/**
 * Product Option Model
 */
export class ProductOptionModel {
  constructor (data = {}) {
    this.productId = data.productId || null
    this.name = data.name || ''
    this.description = data.description || ''
    this.basePrice = data.basePrice || 0

    // Price modifier for this option in the promotion
    this.priceModifier = data.priceModifier || null // { type, value, description }

    // Stock and availability
    this.stock = data.stock || 0
    this.active = data.active !== undefined ? data.active : true
    this.maxPerOrder = data.maxPerOrder || null // Max quantity per order (e.g., max 6)

    // Display
    this.images = data.images || []
    this.displayOrder = data.displayOrder || 0

    // Category and grouping
    this.category = data.category || ''
    this.tags = data.tags || []
  }

  /**
   * Validate product option
   */
  validate () {
    const errors = []

    if (!this.productId) {
      errors.push('Product ID is required')
    }

    if (!this.name.trim()) {
      errors.push('Product name is required')
    }

    if (this.basePrice < 0) {
      errors.push('Base price cannot be negative')
    }

    if (this.stock < 0) {
      errors.push('Stock cannot be negative')
    }

    if (this.maxPerOrder !== null && this.maxPerOrder <= 0) {
      errors.push('Max per order must be greater than 0 if specified')
    }

    if (this.priceModifier) {
      if (!Object.values(PRICE_MODIFIER_TYPES).includes(this.priceModifier.type)) {
        errors.push('Invalid price modifier type')
      }

      if (typeof this.priceModifier.value !== 'number') {
        errors.push('Price modifier value must be a number')
      }
    }

    return errors
  }

  /**
   * Check if product is available for selection
   */
  isAvailable () {
    return this.active && this.stock > 0
  }

  /**
   * Calculate effective price with modifier
   */
  getEffectivePrice () {
    let price = this.basePrice

    if (this.priceModifier) {
      if (this.priceModifier.type === PRICE_MODIFIER_TYPES.FIXED) {
        price += this.priceModifier.value
      } else if (this.priceModifier.type === PRICE_MODIFIER_TYPES.PERCENTAGE) {
        price += (price * this.priceModifier.value / 100)
      }
    }

    return Math.max(0, price) // Ensure price is never negative
  }

  /**
   * Check if requested quantity is available
   */
  canSelectQuantity (quantity) {
    if (quantity <= 0) return false
    if (quantity > this.stock) return false
    if (this.maxPerOrder !== null && quantity > this.maxPerOrder) return false
    return true
  }

  /**
   * Export to JSON
   */
  toJSON () {
    return {
      productId: this.productId,
      name: this.name,
      description: this.description,
      basePrice: this.basePrice,
      priceModifier: this.priceModifier,
      stock: this.stock,
      active: this.active,
      maxPerOrder: this.maxPerOrder,
      images: this.images,
      displayOrder: this.displayOrder,
      category: this.category,
      tags: this.tags
    }
  }
}

/**
 * Selection Model (for user selections)
 */
export class SelectionModel {
  constructor (data = {}) {
    this.groupIndex = data.groupIndex || 0
    this.productId = data.productId || null
    this.product = data.product || null // Full product data
    this.quantity = data.quantity || 1
    this.priceModifier = data.priceModifier || null
    this.subtotal = data.subtotal || 0
  }

  /**
   * Calculate subtotal for this selection
   */
  calculateSubtotal () {
    if (!this.product) return 0

    let unitPrice = this.product.basePrice || this.product.price || 0

    if (this.priceModifier) {
      if (this.priceModifier.type === PRICE_MODIFIER_TYPES.FIXED) {
        unitPrice += this.priceModifier.value
      } else if (this.priceModifier.type === PRICE_MODIFIER_TYPES.PERCENTAGE) {
        unitPrice += (unitPrice * this.priceModifier.value / 100)
      }
    }

    this.subtotal = unitPrice * this.quantity
    return this.subtotal
  }

  /**
   * Export to JSON
   */
  toJSON () {
    return {
      groupIndex: this.groupIndex,
      productId: this.productId,
      product: this.product,
      quantity: this.quantity,
      priceModifier: this.priceModifier,
      subtotal: this.subtotal
    }
  }
}

/**
 * Order Model (for completed orders with promotions)
 */
export class OrderModel {
  constructor (data = {}) {
    this.id = data.id || null
    this.customerInfo = data.customerInfo || {}
    this.items = data.items || []
    this.subtotal = data.subtotal || 0
    this.tax = data.tax || 0
    this.discount = data.discount || 0
    this.total = data.total || 0
    this.status = data.status || 'PENDING'
    this.paymentMethod = data.paymentMethod || null
    this.channel = data.channel || 'POS'
    this.createdAt = data.createdAt || null

    // Promotion analytics
    this.promotionDetails = data.promotionDetails || []
  }

  /**
   * Add promotion item to order
   */
  addPromotionItem (promotion, selections) {
    const promotionItem = {
      type: 'promotion',
      promotionId: promotion.id,
      name: promotion.name,
      basePrice: promotion.basePrice,
      finalPrice: promotion.calculatePrice(selections),
      selections: selections.map(s => s.toJSON()),
      quantity: 1
    }

    this.items.push(promotionItem)
    this.calculateTotals()
  }

  /**
   * Calculate order totals
   */
  calculateTotals () {
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + (item.finalPrice || item.price || 0) * (item.quantity || 1)
    }, 0)

    this.total = this.subtotal + this.tax - this.discount
  }

  /**
   * Export to JSON
   */
  toJSON () {
    return {
      id: this.id,
      customerInfo: this.customerInfo,
      items: this.items,
      subtotal: this.subtotal,
      tax: this.tax,
      discount: this.discount,
      total: this.total,
      status: this.status,
      paymentMethod: this.paymentMethod,
      channel: this.channel,
      createdAt: this.createdAt,
      promotionDetails: this.promotionDetails
    }
  }
}

// Helper functions for creating sample data
export const createSamplePromotion = () => {
  return new PromotionModel({
    name: 'Combo Empanadas + Bebida',
    description: 'Elige tus empanadas favoritas y acompáñalas con una bebida',
    status: PROMOTION_STATUS.ACTIVE,
    channel: PROMOTION_CHANNELS.BOTH,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    pricingMode: PRICING_MODES.FIXED_WITH_MODIFIERS,
    basePrice: 8000,
    selectionGroups: [
      new SelectionGroupModel({
        name: 'Empanadas - Elige tus sabores',
        description: 'Selecciona entre 3 y 6 empanadas',
        required: true,
        minSelection: 3,
        maxSelection: 6,
        selectionStep: SELECTION_STEPS.RANGE,
        products: [
          new ProductOptionModel({
            productId: 1,
            name: 'EMPANADA CARNE',
            basePrice: 1100,
            stock: 100,
            images: [{ url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?q=80&w=1000' }]
          }),
          new ProductOptionModel({
            productId: 2,
            name: 'EMPANADA POLLO',
            basePrice: 1100,
            stock: 80,
            images: [{ url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?q=80&w=1000' }]
          })
        ]
      }),
      new SelectionGroupModel({
        name: 'Bebidas - Selecciona tu favorita',
        description: 'Elige 1 o 2 bebidas',
        required: true,
        minSelection: 1,
        maxSelection: 2,
        selectionStep: SELECTION_STEPS.RANGE,
        products: [
          new ProductOptionModel({
            productId: 4,
            name: 'COCA-COLA 500CC',
            basePrice: 1800,
            stock: 150,
            images: [{ url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=1000' }]
          })
        ]
      })
    ]
  })
}
