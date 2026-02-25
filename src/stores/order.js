import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: [],
    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    },
    orderCount: 0,
    loading: false
  }),
  actions: {
    async fetchOrderCount () {
      if (this.loading) return this._fetchPromise

      try {
        this.loading = true
        this._fetchPromise = api.get('public/invoices', {
          params: {
            page: 1,
            perPage: 1,
            paginate: true
          }
        })

        const { data } = await this._fetchPromise
        this.orderCount = data.total || 0
        return data
      } catch (error) {
        console.error('Error fetching order count:', error)
      } finally {
        this.loading = false
        this._fetchPromise = null
      }
    },

    async fetchOrders (page = 1) {
      if (this.loading) return

      try {
        this.loading = true
        const { data } = await api.get('public/invoices', {
          params: {
            page,
            perPage: this.pagination.rowsPerPage,
            sortBy: 'id',
            sortOrder: 'desc',
            paginate: true
          }
        })

        this.orders = data.data || []
        this.pagination.rowsNumber = data.total || 0
        this.pagination.page = page
        this.orderCount = data.total || 0
        return data
      } catch (error) {
        console.error('Error fetching orders:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setOrderCount (count) {
      this.orderCount = count
    },

    resetOrderStore () {
      this.orders = []
      this.pagination = {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      }
      this.orderCount = 0
      this.loading = false
    }
  }
})
