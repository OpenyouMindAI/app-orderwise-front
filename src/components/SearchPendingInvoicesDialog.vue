<template>
  <q-dialog
    v-model="showDialog"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card style="width: 1000px; max-width: 90vw;">
      <!-- Header -->
      <q-card-section class="row items-center bg-primary text-white q-py-sm">
        <q-icon name="search" size="md" class="q-mr-sm" />
        <div class="text-h6">Buscar Facturas Pendientes</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Search Bar -->
      <q-card-section class="q-pb-none">
        <q-input
          v-model="search"
          outlined
          dense
          placeholder="Buscar por código, cliente o producto..."
          clearable
          autofocus
          @update:model-value="filterInvoices"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon name="info" size="xs" color="grey-6">
              <q-tooltip class="text-body2">
                Busca por código de factura, nombre de cliente o nombre de producto
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </q-card-section>

      <!-- Content -->
      <q-card-section class="q-pt-sm" style="max-height: 60vh; overflow-y: auto;">
        <!-- Loading -->
        <div v-if="loading" class="row justify-center q-py-xl">
          <q-spinner-dots size="50px" color="primary" />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredInvoices.length === 0" class="text-center q-py-xl">
          <q-icon name="receipt_long" size="64px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">No hay facturas pendientes</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            {{ search ? 'Intenta con otro término de búsqueda' : 'Todas las facturas están completadas' }}
          </div>
        </div>

        <!-- Desktop Table -->
        <q-table
          v-else-if="$q.screen.gt.sm"
          :rows="filteredInvoices"
          :columns="columns"
          row-key="id"
          flat
          bordered
          hide-pagination
          :rows-per-page-options="[0]"
          class="pending-invoices-table"
        >
          <template v-slot:body-cell-code="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-xs">
                <q-btn
                  flat
                  dense
                  round
                  size="xs"
                  :icon="expanded.includes(props.row.id) ? 'expand_less' : 'expand_more'"
                  @click.stop="toggleExpand(props.row.id)"
                  color="grey-7"
                >
                  <q-tooltip>{{ expanded.includes(props.row.id) ? 'Ocultar' : 'Ver' }} productos</q-tooltip>
                </q-btn>
                <div class="text-weight-bold text-primary">{{ props.row.code }}</div>
                <q-badge
                  v-if="props.row.products?.length"
                  color="grey-5"
                  text-color="dark"
                  :label="props.row.products.length"
                  rounded
                  class="products-count-badge"
                />
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-client="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.client?.name || '-' }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              <div class="text-body2">{{ formatDateTime(props.row.created_at) }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-delivery_date="props">
            <q-td :props="props">
              <div class="text-body2">
                {{ props.row.delivery_date ? formatDateTime(props.row.delivery_date) : '-' }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-total="props">
            <q-td :props="props">
              <div class="text-weight-bold">{{ formatCurrency(props.row.total) }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-paid="props">
            <q-td :props="props">
              <div :class="props.row.paid >= props.row.total ? 'text-positive' : 'text-warning'">
                {{ formatCurrency(props.row.paid || 0) }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="selectInvoice(props.row)"
              >
                <q-tooltip>Editar factura</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" @click="selectInvoice(props.row)" style="cursor: pointer;">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <component :is="'div'">
                  <template v-if="col.name === 'code'">
                    <div class="row items-center q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        size="xs"
                        :icon="expanded.includes(props.row.id) ? 'expand_less' : 'expand_more'"
                        @click.stop="toggleExpand(props.row.id)"
                        color="grey-7"
                      >
                        <q-tooltip>{{ expanded.includes(props.row.id) ? 'Ocultar' : 'Ver' }} productos</q-tooltip>
                      </q-btn>
                      <div class="text-weight-bold text-primary" v-html="highlightText(props.row.code)"></div>
                      <q-badge
                        v-if="props.row.products?.length"
                        color="grey-5"
                        text-color="dark"
                        :label="props.row.products.length"
                        rounded
                        class="products-count-badge"
                      />
                    </div>
                  </template>
                  <template v-else-if="col.name === 'client'">
                    <div class="text-weight-medium" v-html="highlightText(props.row.client?.name || '-')"></div>
                  </template>
                  <template v-else-if="col.name === 'created_at'">
                    <div class="text-body2">{{ formatDateTime(props.row.created_at) }}</div>
                  </template>
                  <template v-else-if="col.name === 'delivery_date'">
                    <div class="text-body2">
                      {{ props.row.delivery_date ? formatDateTime(props.row.delivery_date) : '-' }}
                    </div>
                  </template>
                  <template v-else-if="col.name === 'total'">
                    <div class="text-weight-bold">{{ formatCurrency(props.row.total) }}</div>
                  </template>
                  <template v-else-if="col.name === 'paid'">
                    <div :class="props.row.paid >= props.row.total ? 'text-positive' : 'text-warning'">
                      {{ formatCurrency(props.row.paid || 0) }}
                    </div>
                  </template>
                  <template v-else-if="col.name === 'actions'">
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="edit"
                      @click.stop="selectInvoice(props.row)"
                    >
                      <q-tooltip>Editar factura</q-tooltip>
                    </q-btn>
                  </template>
                </component>
              </q-td>
            </q-tr>
            <q-tr v-if="expanded.includes(props.row.id)" :props="props" class="expanded-row">
              <q-td colspan="100%" class="products-expanded-cell">
                <div class="products-expanded-content">
                  <div class="products-grid">
                    <div
                      v-for="(product, index) in props.row.products"
                      :key="index"
                      class="product-item-expanded"
                    >
                      <span class="product-qty-expanded">{{ formatQuantity(product.pivot?.amount || product.quantity) }}</span>
                      <span class="product-name-expanded" v-html="highlightText(product.name)"></span>
                    </div>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <!-- Mobile Cards -->
        <div v-else class="q-gutter-sm">
          <q-card
            v-for="invoice in filteredInvoices"
            :key="invoice.id"
            flat
            bordered
            class="invoice-card"
            @click="selectInvoice(invoice)"
          >
            <q-card-section class="q-pa-md">
              <!-- Header -->
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle1 text-weight-bold text-primary" v-html="highlightText(invoice.code)">
                </div>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  size="sm"
                  @click.stop="selectInvoice(invoice)"
                />
              </div>

              <!-- Client -->
              <div class="row items-center q-mb-xs">
                <q-icon name="person" size="16px" color="grey-7" class="q-mr-xs" />
                <div class="text-body2 text-weight-medium" v-html="highlightText(invoice.client?.name || 'Sin cliente')">
                </div>
              </div>

              <!-- Created Date -->
              <div class="row items-center q-mb-xs">
                <q-icon name="event" size="16px" color="grey-7" class="q-mr-xs" />
                <div class="text-caption text-grey-7">
                  Creada: {{ formatDateTime(invoice.created_at) }}
                </div>
              </div>

              <!-- Delivery Date -->
              <div v-if="invoice.delivery_date" class="row items-center q-mb-sm">
                <q-icon name="local_shipping" size="16px" color="grey-7" class="q-mr-xs" />
                <div class="text-caption text-grey-7">
                  Entrega: {{ formatDateTime(invoice.delivery_date) }}
                </div>
              </div>

              <!-- Products -->
              <div v-if="invoice.products?.length" class="products-mobile-section q-mb-sm">
                <div
                  class="products-mobile-header"
                  @click.stop="toggleMobileExpand(invoice.id)"
                >
                  <div class="row items-center">
                    <q-icon name="shopping_bag" size="16px" color="primary" class="q-mr-xs" />
                    <span class="text-caption text-weight-medium">Productos</span>
                    <q-badge color="primary" :label="invoice.products.length" rounded class="q-ml-xs" />
                  </div>
                  <q-icon
                    :name="expandedMobile.includes(invoice.id) ? 'expand_less' : 'expand_more'"
                    size="20px"
                    color="grey-7"
                  />
                </div>
                <q-slide-transition>
                  <div v-show="expandedMobile.includes(invoice.id)" class="products-list-mobile">
                    <div
                      v-for="(product, index) in invoice.products"
                      :key="index"
                      class="product-item-mobile"
                    >
                      <span class="product-qty-mobile">{{ formatQuantity(product.pivot?.amount || product.quantity) }}</span>
                      <span class="product-name-mobile" v-html="highlightText(product.name)"></span>
                    </div>
                  </div>
                </q-slide-transition>
              </div>

              <q-separator class="q-my-sm" />

              <!-- Amounts -->
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-6">Total</div>
                  <div class="text-h6 text-weight-bold">{{ formatCurrency(invoice.total) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-caption text-grey-6">Pagado</div>
                  <div
                    class="text-subtitle1 text-weight-bold"
                    :class="invoice.paid >= invoice.total ? 'text-positive' : 'text-warning'"
                  >
                    {{ formatCurrency(invoice.paid || 0) }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <!-- Footer with count -->
      <q-card-section v-if="!loading && filteredInvoices.length > 0" class="q-pt-none">
        <div class="text-center text-caption text-grey-7">
          Mostrando {{ filteredInvoices.length }} de {{ invoices.length }} facturas pendientes
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'

export default {
  name: 'SearchPendingInvoicesDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'invoice-selected'],
  setup (props, { emit }) {
    const $q = useQuasar()
    const invoices = ref([])
    const search = ref('')
    const loading = ref(false)
    const expanded = ref([])
    const expandedMobile = ref([])

    const showDialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const columns = [
      {
        name: 'code',
        label: 'Código',
        field: 'code',
        align: 'left',
        sortable: true
      },
      {
        name: 'client',
        label: 'Cliente',
        field: row => row.client?.name || '-',
        align: 'left',
        sortable: true
      },
      {
        name: 'created_at',
        label: 'Fecha Creación',
        field: 'created_at',
        align: 'left',
        sortable: true
      },
      {
        name: 'delivery_date',
        label: 'Fecha Entrega',
        field: 'delivery_date',
        align: 'left',
        sortable: true
      },
      {
        name: 'total',
        label: 'Total',
        field: 'total',
        align: 'right',
        sortable: true
      },
      {
        name: 'paid',
        label: 'Pagado',
        field: 'paid',
        align: 'right',
        sortable: true
      },
      {
        name: 'actions',
        label: 'Acciones',
        field: 'actions',
        align: 'center'
      }
    ]

    const filteredInvoices = computed(() => {
      if (!search.value) return invoices.value

      const searchLower = search.value.toLowerCase()
      return invoices.value.filter(invoice => {
        // Buscar por código de factura
        const matchesCode = invoice.code?.toLowerCase().includes(searchLower)

        // Buscar por nombre de cliente
        const matchesClient = invoice.client?.name?.toLowerCase().includes(searchLower)

        // Buscar por nombre de producto
        const matchesProduct = invoice.products?.some(product =>
          product.name?.toLowerCase().includes(searchLower)
        )

        return matchesCode || matchesClient || matchesProduct
      })
    })

    const fetchPendingInvoices = async () => {
      loading.value = true
      try {
        const { data } = await api.get('invoices', {
          params: {
            status: 'pending',
            per_page: 100
          }
        })
        invoices.value = data.data || data

        // Abrir todos los expands por defecto
        expanded.value = invoices.value.map(inv => inv.id)
        expandedMobile.value = invoices.value.map(inv => inv.id)
      } catch (error) {
        console.error('Error fetching pending invoices:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar facturas pendientes',
          icon: 'warning'
        })
      } finally {
        loading.value = false
      }
    }

    const selectInvoice = (invoice) => {
      emit('invoice-selected', invoice)
      showDialog.value = false
    }

    const formatCurrency = (value) => {
      if (!value && value !== 0) return '-'
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      }).format(value)
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      try {
        const parsedDate = date.extractDate(dateString, 'YYYY-MM-DD HH:mm:ss')
        return date.formatDate(parsedDate, 'DD/MM/YYYY HH:mm')
      } catch (error) {
        return dateString
      }
    }

    const filterInvoices = () => {
      // Trigger computed property update
    }

    const toggleExpand = (id) => {
      const index = expanded.value.indexOf(id)
      if (index > -1) {
        expanded.value.splice(index, 1)
      } else {
        expanded.value.push(id)
      }
    }

    const toggleMobileExpand = (id) => {
      const index = expandedMobile.value.indexOf(id)
      if (index > -1) {
        expandedMobile.value.splice(index, 1)
      } else {
        expandedMobile.value.push(id)
      }
    }

    const formatQuantity = (quantity) => {
      if (!quantity && quantity !== 0) return '0'
      const num = parseFloat(quantity)
      if (isNaN(num)) return '0'
      // Si es entero, mostrar sin decimales
      if (num % 1 === 0) return `${num}x`
      // Si tiene decimales, mostrar con 2 decimales
      return `${num.toFixed(2)}x`
    }

    const highlightText = (text) => {
      if (!text || !search.value) return text
      const searchLower = search.value.toLowerCase()
      const textLower = text.toLowerCase()
      const index = textLower.indexOf(searchLower)

      if (index === -1) return text

      const before = text.substring(0, index)
      const match = text.substring(index, index + search.value.length)
      const after = text.substring(index + search.value.length)

      return `${before}<mark class="search-highlight">${match}</mark>${after}`
    }

    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        fetchPendingInvoices()
        search.value = ''
      }
    })

    return {
      showDialog,
      invoices,
      search,
      loading,
      columns,
      filteredInvoices,
      selectInvoice,
      formatCurrency,
      formatDateTime,
      filterInvoices,
      expanded,
      expandedMobile,
      toggleExpand,
      toggleMobileExpand,
      formatQuantity,
      highlightText
    }
  }
}
</script>

<style lang="scss" scoped>
/* Search Highlight */
:deep(.search-highlight) {
  background-color: #ffeb3b;
  color: #000;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 3px;
}

.pending-invoices-table {
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-table__top) {
    padding: 12px;
  }

  :deep(thead tr th) {
    background: var(--q-primary);
    color: white;
    font-weight: 600;
    font-size: 13px;
    padding: 12px 16px;
  }

  :deep(tbody tr) {
    transition: all 0.2s ease;

    &:hover {
      background: rgba(var(--q-primary-rgb), 0.05);
      cursor: pointer;
    }
  }

  :deep(tbody td) {
    padding: 12px 16px;
    font-size: 13px;
  }
}

.invoice-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Products Count Badge */
.products-count-badge {
  font-size: 10px;
  padding: 2px 6px;
}

/* Expanded Row - Desktop */
.expanded-row {
  background: rgba(var(--q-primary-rgb), 0.02);
}

.products-expanded-cell {
  padding: 8px 16px !important;
}

.products-expanded-content {
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.product-item-expanded {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(var(--q-primary-rgb), 0.04);
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.product-item-expanded:hover {
  background: rgba(var(--q-primary-rgb), 0.08);
  transform: translateX(2px);
}

.product-qty-expanded {
  font-weight: 700;
  color: var(--q-primary);
  min-width: 40px;
  flex-shrink: 0;
  font-size: 12px;
}

.product-name-expanded {
  color: rgba(0, 0, 0, 0.8);
  line-height: 1.3;
}

/* Products Mobile Section */
.products-mobile-section {
  background: rgba(var(--q-primary-rgb), 0.03);
  border-radius: 8px;
  overflow: hidden;
}

.products-mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.products-mobile-header:hover {
  background: rgba(var(--q-primary-rgb), 0.06);
}

.products-mobile-header:active {
  background: rgba(var(--q-primary-rgb), 0.1);
}

.products-list-mobile {
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-item-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.product-qty-mobile {
  font-weight: 700;
  color: var(--q-primary);
  min-width: 40px;
  flex-shrink: 0;
}

.product-name-mobile {
  color: rgba(0, 0, 0, 0.8);
  line-height: 1.3;
}

/* Dark mode adjustments */
.body--dark {
  .pending-invoices-table {
    :deep(tbody tr:hover) {
      background: rgba(var(--q-primary-rgb), 0.1);
    }
  }

  .invoice-card:hover {
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  }

  .expanded-row {
    background: rgba(var(--q-primary-rgb), 0.05);
  }

  .products-expanded-content {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .product-item-expanded {
    background: rgba(var(--q-primary-rgb), 0.1);
  }

  .product-item-expanded:hover {
    background: rgba(var(--q-primary-rgb), 0.15);
  }

  .product-name-expanded {
    color: rgba(255, 255, 255, 0.8);
  }

  .products-mobile-section {
    background: rgba(var(--q-primary-rgb), 0.08);
  }

  .products-mobile-header:hover {
    background: rgba(var(--q-primary-rgb), 0.12);
  }

  .products-mobile-header:active {
    background: rgba(var(--q-primary-rgb), 0.15);
  }

  .product-item-mobile {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .product-name-mobile {
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>
