import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orderCount: 0,
    loading: false
  }),
  actions: {
    async fetchOrderCount () {
      try {
        this.loading = true
        const { data } = await api.get('public/invoices', {
          params: {
            page: 1,
            perPage: 1,
            paginate: true
          }
        })
        this.orderCount = data.total || 0
      } catch (error) {
        console.error('Error fetching order count:', error)
      } finally {
        this.loading = false
      }
    },
    setOrderCount (count) {
      this.orderCount = count
    }
  }
})
