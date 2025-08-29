<template>
  <q-card class="luxury-dialog invoice-dialog">
    <q-card-section class="dialog-header-section">
      <div class="dialog-title-group">
        <q-icon name="receipt_long" class="dialog-icon" />
        <span class="dialog-title-text">
          {{ invoice && invoice.id ? `Factura #${invoice.invoice_number || invoice.code}` : `Nueva Factura para Mesa ${table?.name}` }}
        </span>
      </div>
      <q-btn flat round icon="close" @click="$emit('close')" class="dialog-close-button" />
    </q-card-section>

    <q-card-section class="dialog-body-content invoice-body">
      <div v-if="invoice && invoice.id">
        <div class="invoice-summary">
          <div class="summary-item">
            <span class="summary-label">Estado:</span>
            <q-badge :color="invoice.status === 'pending' ? 'orange' : 'green'" class="summary-value">
              {{ invoice.status === 'pending' ? 'Pendiente' : 'Cerrada' }}
            </q-badge>
          </div>
          <div class="summary-item">
            <span class="summary-label">Cliente:</span>
            <span class="summary-value">{{ invoice.client?.name || 'N/A' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total:</span>
            <span class="summary-value">{{ invoice.coin?.symbol || '$' }} {{ invoice.total?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <h6 class="input-group-title">Productos</h6>
        <q-list separator class="product-list">
          <q-item v-for="(product, index) in invoice.products" :key="product.id" class="product-item">
            <q-item-section>
              <q-item-label>{{ product.name }}</q-item-label>
              <q-item-label caption>{{ product.pivot.price }} {{ invoice.coin?.symbol || '$' }} / unidad</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="product-quantity-controls">
                <q-btn flat round size="sm" icon="remove" @click="updateProductQuantity(index, -1)" />
                <q-input
                  v-model.number="product.pivot.amount"
                  type="number"
                  dense
                  outlined
                  min="1"
                  class="quantity-input"
                  @update:model-value="updateProductQuantity(index, 0, $event)"
                />
                <q-btn flat round size="sm" icon="add" @click="updateProductQuantity(index, 1)" />
                <q-btn flat round size="sm" icon="delete" color="negative" @click="confirmDeleteProduct(index)" />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="invoice.products.length === 0">
            <q-item-section class="text-center text-muted">No hay productos en esta factura.</q-item-section>
          </q-item>
        </q-list>

        <q-input
          v-model="searchProduct"
          label="Buscar y Añadir Producto"
          outlined
          dense
          class="luxury-input q-mt-md"
          @update:model-value="searchProducts"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-list v-if="foundProducts.length > 0" bordered class="found-products-list">
          <q-item v-for="prod in foundProducts" :key="prod.id" clickable @click="addProductToInvoice(prod)">
            <q-item-section>{{ prod.name }} ({{ prod.price }} {{ invoice.coin?.symbol || '$' }})</q-item-section>
            <q-item-section side>
              <q-btn flat round size="sm" icon="add_circle_outline" color="primary" />
            </q-item-section>
          </q-item>
        </q-list>

      </div>
      <div v-else class="new-invoice-prompt">
        <q-icon name="add_shopping_cart" size="xl" class="q-mb-md text-muted" />
        <p class="text-muted">Esta mesa está libre. ¿Deseas abrir una nueva factura?</p>
        <q-btn label="Abrir Nueva Factura" class="action-button primary-action-button" unelevated @click="createNewInvoice" />
      </div>
    </q-card-section>

    <q-card-actions class="dialog-action-buttons" v-if="invoice && invoice.id">
      <q-btn flat label="Imprimir Comanda" icon="print" @click="printComanda" class="dialog-cancel-button" />
      <q-btn flat label="Cerrar Mesa" icon="check_circle" @click="closeTable" class="action-button primary-action-button" unelevated />
      <q-btn label="Guardar Cambios" icon="save" @click="saveInvoice" class="action-button primary-action-button" unelevated />
    </q-card-actions>
  </q-card>

  <!-- Super Admin Code Dialog -->
  <q-dialog v-model="showSuperAdminDialog" persistent>
    <q-card class="luxury-dialog">
      <q-card-section class="dialog-header-section">
        <div class="dialog-title-group">
          <q-icon name="security" class="dialog-icon" />
          <span class="dialog-title-text">Código de Super Administrador</span>
        </div>
        <q-btn flat round icon="close" @click="showSuperAdminDialog = false; superAdminCode = ''" class="dialog-close-button" />
      </q-card-section>
      <q-card-section class="dialog-body-content">
        <q-input
          v-model="superAdminCode"
          label="Ingresa el código de super administrador"
          type="password"
          outlined
          autofocus
          class="luxury-input"
        />
      </q-card-section>
      <q-card-actions class="dialog-action-buttons">
        <q-btn flat label="Cancelar" @click="showSuperAdminDialog = false; superAdminCode = ''" class="dialog-cancel-button" />
        <q-btn label="Confirmar" @click="validateSuperAdminCode" class="action-button primary-action-button" unelevated />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { Notify } from 'quasar'
import { api } from 'src/boot/axios' // Assuming your axios instance is here
import { loading } from 'src/const/mixins' // Assuming loading mixin

export default {
  props: {
    invoice: {
      type: Object,
      default: null
    },
    table: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'invoice-updated', 'table-closed'],
  data () {
    return {
      currentInvoice: this.invoice ? JSON.parse(JSON.stringify(this.invoice)) : null,
      searchProduct: '',
      foundProducts: [],
      showSuperAdminDialog: false,
      superAdminCode: '',
      productToDeleteIndex: null
    }
  },
  watch: {
    invoice: {
      handler (newVal) {
        this.currentInvoice = newVal ? JSON.parse(JSON.stringify(newVal)) : null
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async createNewInvoice () {
      loading(true)
      try {
        // API call to create a new invoice
        const newInvoiceData = {
          ...this.currentInvoice, // Use the default structure from props.invoice
          status: 'pending',
          tables: [this.table.id], // Associate the table
          // Ensure other necessary fields are set for creation
          invoice_number: 0, // Or fetch from backend
          total: 0,
          subtotal: 0,
          taxe_total: 0,
          products: []
          // Add any other default values required by your backend for a new invoice
        }

        const response = await api.post('invoices', newInvoiceData)
        this.currentInvoice = response.data // Update with the newly created invoice
        // Update table status to 'occupied'
        await api.put(`tables/${this.table.id}`, { status: 'occupied' })

        Notify.create({
          message: `Factura para mesa ${this.table.name} creada exitosamente.`,
          icon: 'check_circle',
          color: 'positive'
        })
        this.$emit('invoice-updated', this.currentInvoice)
      } catch (error) {
        Notify.create({
          message: `Error al crear factura: ${error.message}`,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        loading(false)
      }
    },

    async searchProducts () {
      if (this.searchProduct.length < 3) {
        this.foundProducts = []
        return
      }
      loading(true)
      try {
        // API call to search products
        const { data } = await api.get('products', {
          params: {
            dataSearch: { name: this.searchProduct },
            paginate: false
          }
        })
        this.foundProducts = data
      } catch (error) {
        Notify.create({
          message: `Error al buscar productos: ${error.message}`,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        loading(false)
      }
    },

    addProductToInvoice (product) {
      if (!this.currentInvoice) return

      const existingProduct = this.currentInvoice.products.find(p => p.id === product.id)
      if (existingProduct) {
        existingProduct.pivot.amount++
      } else {
        this.currentInvoice.products.push({
          ...product,
          pivot: {
            invoice_id: this.currentInvoice.id,
            product_id: product.id,
            amount: 1,
            price: product.price,
            taxe: 21, // Default tax, adjust as needed
            observation: null
          }
        })
      }
      this.calculateTotals()
      this.searchProduct = '' // Clear search
      this.foundProducts = [] // Clear results
      Notify.create({
        message: `${product.name} añadido a la factura.`,
        icon: 'check_circle',
        color: 'positive'
      })
    },

    updateProductQuantity (index, change, newValue = null) {
      if (!this.currentInvoice) return
      const product = this.currentInvoice.products[index]
      if (newValue !== null) {
        product.pivot.amount = Math.max(1, parseInt(newValue) || 1)
      } else {
        product.pivot.amount = Math.max(1, product.pivot.amount + change)
      }
      this.calculateTotals()
    },

    confirmDeleteProduct (index) {
      this.productToDeleteIndex = index
      this.showSuperAdminDialog = true
    },

    async validateSuperAdminCode () {
      loading(true)
      try {
        // Replace with your actual API call to validate super admin code
        const response = await api.post('auth/validate-super-admin', { code: this.superAdminCode })
        if (response.data.isValid) { // Assuming your API returns { isValid: true/false }
          this.deleteProduct()
          Notify.create({
            message: 'Producto eliminado exitosamente.',
            icon: 'check_circle',
            color: 'positive'
          })
        } else {
          Notify.create({
            message: 'Código de super administrador inválido.',
            icon: 'warning',
            color: 'negative'
          })
        }
      } catch (error) {
        Notify.create({
          message: `Error de validación: ${error.message}`,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.showSuperAdminDialog = false
        this.superAdminCode = ''
        this.productToDeleteIndex = null
        loading(false)
      }
    },

    deleteProduct () {
      if (this.currentInvoice && this.productToDeleteIndex !== null) {
        this.currentInvoice.products.splice(this.productToDeleteIndex, 1)
        this.calculateTotals()
      }
    },

    calculateTotals () {
      if (!this.currentInvoice) return
      let subtotal = 0
      let taxe_total = 0

      this.currentInvoice.products.forEach(p => {
        const itemPrice = parseFloat(p.pivot.price)
        const itemAmount = parseInt(p.pivot.amount)
        const itemTaxRate = parseFloat(p.pivot.taxe || 0) / 100

        const itemSubtotal = itemPrice * itemAmount
        const itemTax = itemSubtotal * itemTaxRate

        subtotal += itemSubtotal
        taxe_total += itemTax
      })

      this.currentInvoice.subtotal = parseFloat(subtotal.toFixed(2))
      this.currentInvoice.taxe_total = parseFloat(taxe_total.toFixed(2))
      this.currentInvoice.total = parseFloat((subtotal + taxe_total).toFixed(2))
      this.currentInvoice.total_payments = this.currentInvoice.total // Assuming full payment on close
    },

    async saveInvoice () {
      loading(true)
      try {
        // API call to update the invoice
        await api.put(`invoices/${this.currentInvoice.id}`, this.currentInvoice)
        Notify.create({
          message: 'Factura guardada exitosamente.',
          icon: 'check_circle',
          color: 'positive'
        })
        this.$emit('invoice-updated', this.currentInvoice)
      } catch (error) {
        Notify.create({
          message: `Error al guardar factura: ${error.message}`,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        loading(false)
      }
    },

    async printComanda () {
      loading(true)
      try {
        // Simulate printing or make an API call to a print service
        console.log('Imprimiendo comanda para factura:', this.currentInvoice)
        // Example API call: await api.post('print/comanda', { invoiceId: this.currentInvoice.id });
        Notify.create({
          message: 'Comanda enviada a impresión.',
          icon: 'print',
          color: 'info'
        })
      } catch (error) {
        Notify.create({
          message: `Error al imprimir comanda: ${error.message}`,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        loading(false)
      }
    },

    async closeTable () {
      loading(true)
      try {
        // Update invoice status to 'closed' or 'completed'
        this.currentInvoice.status = 'completed' // Or 'closed'
        await api.put(`invoices/${this.currentInvoice.id}`, { status: this.currentInvoice.status })

        // Update table status to 'unoccupied'
        await api.put(`tables/${this.table.id}`, { status: 'unoccupied' })

        Notify.create({
          message: `Mesa ${this.table.name} cerrada y factura finalizada.`,
          icon: 'check_circle',
          color: 'positive'
        })
        this.$emit('table-closed', this.table.id)
        this.$emit('close') // Close the dialog
      } catch (error) {
        Notify.create({
          message: `Error al cerrar mesa: ${error.message}`,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        loading(false)
      }
    }
  }
}
</script>

<style scoped>
/* Reusing Luxury Theme Variables */
:root {
  --color-background-dark: #121212;
  --color-surface-dark: #1e1e1e;
  --color-card-dark: #282828;
  --color-text-light: #f0f0f0;
  --color-text-muted: #b0b0b0;
  --color-border-dark: #3a3a3a;
  --color-accent-gold: #d4af37;
  --color-accent-gold-light: #e6c25a;
  --color-accent-gold-dark: #b8942e;
  --color-success: #4CAF50;
  --color-danger: #EF5350;

  --font-family-primary: 'Inter', sans-serif;
  --font-family-secondary: 'Playfair Display', serif;

  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 14px;
  --spacing-unit: 0.8rem;
}

.luxury-dialog {
  width: 700px; /* Wider for invoice details */
  max-width: 95vw;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.dialog-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--spacing-unit) * 1.5);
  background: var(--primary);
  color: white;
}

.dialog-title-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.dialog-icon {
  font-size: 1.3rem;
}

.dialog-title-text {
  font-family: var(--font-family-secondary);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.dialog-body-content {
  padding: calc(var(--spacing-unit) * 1.5);
  color: var(--color-text-light);
}

.dialog-action-buttons {
  padding: var(--spacing-unit) calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 1.5);
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.dialog-cancel-button {
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease-in-out;
}

.dialog-cancel-button:hover {
  color: var(--color-text-light);
}

.action-button {
  border-radius: var(--border-radius-md);
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.2s ease-in-out;
}

.primary-action-button {
  background-color: var(--primary);
  color: white;
  box-shadow: 0 2px 8px rgba(var(--color-accent-gold), 0.3);
}

.primary-action-button:hover {
  background-color: var(--color-accent-gold-light);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(var(--color-accent-gold), 0.4);
}

.luxury-input {
  margin-bottom: var(--spacing-unit);
}

.luxury-input :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-dark);
  min-height: 40px;
  padding: 0 12px;
}

.luxury-input :deep(.q-field__label) {
  color: var(--color-text-muted);
  top: 10px;
}

.luxury-input :deep(.q-field__native) {
  padding-top: 8px;
}

.luxury-input :deep(.q-field__control):hover:before {
  border-color: var(--color-accent-gold) !important;
}

.luxury-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--color-accent-gold) !important;
  box-shadow: 0 0 0 2px rgba(var(--color-accent-gold), 0.3);
}

/* Invoice Specific Styles */
.invoice-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}

.invoice-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-unit);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-unit);
  border: 1px solid var(--primary);
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.2rem;
}

.summary-value {
  font-size: 1rem;
  font-weight: 600;
}

.q-badge {
  padding: 0.4em 0.6em;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.input-group-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.8rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-list {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--primary);
  max-height: 300px; /* Limit height for scroll */
  overflow-y: auto;
}

.product-item {
  padding: 0.8rem var(--spacing-unit);
  border-bottom: 1px solid var(--color-border-dark);
}

.product-item:last-child {
  border-bottom: none;
}

.product-quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.quantity-input {
  width: 60px;
  text-align: center;
}

.quantity-input :deep(.q-field__control) {
  padding: 0 4px;
  min-height: 32px;
}

.quantity-input :deep(.q-field__native) {
  text-align: center;
}

.found-products-list {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--primary);
  margin-top: var(--spacing-unit);
  max-height: 200px;
  overflow-y: auto;
}

.found-products-list .q-item {
  padding: 0.8rem var(--spacing-unit);
  border-bottom: 1px solid var(--primary);
}

.found-products-list .q-item:last-child {
  border-bottom: none;
}

.new-invoice-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing-unit) * 2);
  text-align: center;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-dark);
}

.new-invoice-prompt .text-muted {
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-unit);
}

/* Responsive adjustments for dialog */
@media (max-width: 768px) {
  .luxury-dialog {
    width: 95vw;
  }
  .invoice-summary {
    grid-template-columns: 1fr;
  }
  .product-quantity-controls {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .quantity-input {
    width: 100%;
  }
}
</style>
