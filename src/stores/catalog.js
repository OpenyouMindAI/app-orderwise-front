import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    company: null,
    categories: [],
    products: [],
    paymentMethods: [],
    lastFetchTime: null,
    currentCompanyId: null,
    currentBranchOfficeId: null
  }),

  actions: {
    async fetchCompany (id) {
      if (this.company && this.company.id === parseInt(id)) return

      try {
        const { data } = await api.get(`public/company/${id}`)
        this.company = data
      } catch (error) {
        console.error('Error fetching company:', error)
        Notify.create({
          message: 'Error al cargar información de la empresa',
          color: 'negative',
          icon: 'warning'
        })
      }
    },

    async fetchCategories (companyId) {
      // Check if we are fetching for a different company
      if (this.currentCompanyId && this.currentCompanyId !== parseInt(companyId)) {
        this.categories = []
        // We don't reset company here because fetchCompany handles that, but categories depend on it.
      }

      if (this.categories.length > 0 && this.currentCompanyId === parseInt(companyId)) return

      try {
        const { data } = await api.get(`public/categories/${companyId}`, {
          params: {
            dataFilter: {
              show_catalog: 1
            }
          }
        })
        this.categories = data
        this.currentCompanyId = parseInt(companyId)
      } catch (error) {
        console.error('Error fetching categories:', error)
        Notify.create({
          message: 'Error al cargar categorías',
          color: 'negative',
          icon: 'warning'
        })
      }
    },

    async fetchProducts (companyId, branchOfficeId) {
      // Check for context change
      const newCompanyId = parseInt(companyId)
      const newBranchId = branchOfficeId ? parseInt(branchOfficeId) : null

      if (
        (this.currentCompanyId && this.currentCompanyId !== newCompanyId) ||
        (this.currentBranchOfficeId && this.currentBranchOfficeId !== newBranchId)
      ) {
        this.products = []
        this.categories = [] // Categories are also likely invalid if company changes
        // fetchCategories will handle its own check but if we are here we know context changed
      }

      if (this.products.length > 0 && this.currentCompanyId === newCompanyId && this.currentBranchOfficeId === newBranchId) return

      try {
        const { data } = await api.get(`public/products/${companyId}`, {
          params: {
            stock: true,
            withStock: true,
            sortOrder: 'desc',
            sortBy: 'sold',
            branch_office_id: branchOfficeId,
            dataEqualFilter: {
              show_catalog: 1,
              'category.show_catalog': 1
            }
          }
        })
        this.products = data
        this.currentCompanyId = newCompanyId
        this.currentBranchOfficeId = newBranchId
        this.lastFetchTime = Date.now()
      } catch (error) {
        console.error('Error fetching products:', error)
        Notify.create({
          message: 'Error al cargar productos',
          color: 'negative',
          icon: 'warning'
        })
      }
    },

    async fetchPaymentMethods (companyId) {
      if (this.paymentMethods.length > 0 && this.currentCompanyId === parseInt(companyId)) return

      try {
        const { data } = await api.get(`public/payment-methods/${companyId}`)
        this.paymentMethods = data
      } catch (error) {
        console.error('Error fetching payment methods:', error)
        Notify.create({
          message: 'Error al cargar métodos de pago',
          color: 'negative',
          icon: 'warning'
        })
      }
    },

    clearCatalog () {
      this.company = null
      this.categories = []
      this.products = []
      this.paymentMethods = []
      this.lastFetchTime = null
      this.currentCompanyId = null
      this.currentBranchOfficeId = null
    }
  }
})
