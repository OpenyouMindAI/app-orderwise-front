import { computed } from 'vue'
import { useCommandStore } from 'src/stores/command'
import { notify } from 'src/const/mixins'

/**
 * Composable para gestionar el carrito de compras
 * Centraliza toda la lógica de añadir, eliminar, actualizar y validar productos
 */
export function useCart() {
  const commandStore = useCommandStore()

  // Computed properties
  const items = computed(() => commandStore.command.products || [])
  const itemCount = computed(() => items.value.length)
  const total = computed(() =>
    items.value.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  )

  /**
   * Verifica si hay stock disponible para un producto
   * @param {Object} product - Producto a verificar
   * @param {Number} quantity - Cantidad solicitada
   * @returns {Boolean}
   */
  function hasStock(product, quantity) {
    const stock = product.is_bundle ? product.bundle_stock : product.normal_stock
    return product.skip_stock || stock >= quantity
  }

  /**
   * Añade un producto al carrito
   * @param {Object} product - Producto a añadir
   * @param {Number} quantity - Cantidad a añadir (default: 1)
   * @param {String} observation - Observación opcional
   * @returns {Boolean} - true si se añadió exitosamente
   */
  function addToCart(product, quantity = 1, observation = null) {
    // Validar stock
    if (!hasStock(product, quantity)) {
      notify(
        `No hay stock suficiente para ${product.name}`,
        'negative',
        'warning'
      )
      return false
    }

    const existing = items.value.find(item => item.id === product.id)

    if (existing) {
      // Si el producto ya existe, incrementar cantidad
      existing.amount += quantity
      existing.observation = observation || existing.observation
      existing.subtotal = existing.price * existing.amount

      // Validar que no exceda el stock
      if (!hasStock(product, existing.amount)) {
        notify(
          `No hay stock suficiente para ${product.name}`,
          'negative',
          'warning'
        )
        existing.amount -= quantity
        existing.subtotal = existing.price * existing.amount
        return false
      }

      // Actualizar el store
      commandStore.setCommands({ products: [...items.value] })
    } else {
      // Añadir nuevo producto
      commandStore.setCommands({
        products: [
          ...items.value,
          {
            ...product,
            product_id: product.id,
            amount: quantity,
            observation,
            subtotal: product.price * quantity
          }
        ]
      })
    }

    return true
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   * @param {Number} productId - ID del producto
   * @param {Number} quantity - Nueva cantidad
   * @returns {Boolean} - true si se actualizó exitosamente
   */
  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.id === productId)
    if (!item) return false

    // Validar cantidad mínima
    if (quantity < 1) {
      notify('La cantidad mínima es 1', 'warning', 'info')
      return false
    }

    // Validar stock
    if (!hasStock(item, quantity)) {
      notify(
        `No hay stock suficiente para ${item.name}`,
        'negative',
        'warning'
      )
      return false
    }

    item.amount = quantity
    item.subtotal = item.price * quantity
    commandStore.setCommands({ products: [...items.value] })
    return true
  }

  /**
   * Elimina un producto del carrito
   * @param {Number} productId - ID del producto a eliminar
   */
  function removeFromCart(productId) {
    const filtered = items.value.filter(item => item.id !== productId)
    commandStore.setCommands({ products: filtered })
  }

  /**
   * Limpia todo el carrito
   */
  function clearCart() {
    commandStore.setCommands({ products: [] })
  }

  /**
   * Actualiza la observación de un producto en el carrito
   * @param {Number} productId - ID del producto
   * @param {String} observation - Nueva observación
   */
  function updateObservation(productId, observation) {
    const item = items.value.find(i => i.id === productId)
    if (item) {
      item.observation = observation
      commandStore.setCommands({ products: [...items.value] })
    }
  }

  /**
   * Verifica si un producto está en el carrito
   * @param {Number} productId - ID del producto
   * @returns {Boolean}
   */
  function isInCart(productId) {
    return items.value.some(item => item.id === productId)
  }

  /**
   * Obtiene un producto del carrito por su ID
   * @param {Number} productId - ID del producto
   * @returns {Object|null}
   */
  function getCartItem(productId) {
    return items.value.find(item => item.id === productId) || null
  }

  return {
    // Estado
    items,
    itemCount,
    total,

    // Métodos
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    updateObservation,
    hasStock,
    isInCart,
    getCartItem
  }
}
