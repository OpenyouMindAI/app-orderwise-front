<template>
  <!-- The q-page adapts its background color based on the current theme -->
  <q-page padding>
    <!-- Header using Quasar colors to respect dark mode -->
    <div class="bg-primary text-white rounded-borders max-w-7xl mx-auto">
      <!-- Use inline max-width to avoid relying on Tailwind utility classes -->
      <div class="q-mx-auto q-px-md q-py-sm">
        <div class="row items-center justify-between">
          <div class="col-xs-12 col-sm-12 col-md-8">
            <div class="text-subtitle1 text-weight-bold">Reporte de Retiros por Día</div>
            <div class="text-subtitle2">Gestiona y visualiza los retiros diarios de manera inteligente</div>
          </div>
          <div class="q-gutter-sm col-xs-12 col-sm-12 col-md-4 text-right">
            <q-btn
              flat
              rounded
              icon="file_download"
              label="Exportar CSV"
              @click="exportCSV"
              :disable="!hasData"
              color="white"
            />
            <q-btn
              flat
              rounded
              icon="print"
              label="Imprimir"
              @click="printReport"
              :disable="!hasData"
              color="white"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto q-mt-sm space-y-4">

      <!-- Filters section using Quasar classes for dark mode -->
      <q-expansion-item
        icon="tune"
        label="Filtros"
        class="shadow-2 rounded-borders"
        header-class="text-h6 text-weight-medium q-px-md q-py-sm"
      >
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="row items-center justify-between">
                  <div class="row items-center q-gutter-xs">
                    <q-btn
                      flat
                      round
                      size="sm"
                      icon="chevron_left"
                      @click="changeDate(-1)"
                      color="primary"
                    />

                    <div class="row items-center">
                      <q-input
                        v-model="dateFrom"
                        label="Fecha Desde"
                        readonly
                        outlined
                        class="q-mx-sm"
                        style="width: 8rem;"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="dateFrom"
                                @update:model-value="loadData"
                                mask="YYYY-MM-DD"
                                color="primary"
                              >
                                <div class="row items-center justify-end q-pa-sm">
                                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>

                      <q-input
                        v-model="dateTo"
                        label="Fecha Hasta"
                        readonly
                        outlined
                        class="q-mx-sm"
                        style="width: 8rem;"
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="dateTo"
                                @update:model-value="loadData"
                                mask="YYYY-MM-DD"
                                color="primary"
                              >
                                <div class="row items-center justify-end q-pa-sm">
                                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>

                    <q-btn
                      flat
                      round
                      size="sm"
                      icon="chevron_right"
                      @click="changeDate(1)"
                      color="primary"
                    />
                  </div>
                </div>
                <q-select
                  v-model="filters.branch_office_ids"
                  :options="branchOffices"
                  option-value="id"
                  option-label="name"
                  label="Sucursales"
                  multiple
                  clearable
                  use-chips
                  outlined
                  @update:model-value="debouncedLoadData"
                  :loading="loadingBranches"
                />

                <q-select
                  v-model="filters.payment_method_ids"
                  :options="paymentMethods"
                  option-value="id"
                  option-label="name"
                  label="Métodos de Pago"
                  multiple
                  clearable
                  use-chips
                  outlined
                  @update:model-value="debouncedLoadData"
                  :loading="loadingPaymentMethods"
                />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Completely redesigned summary cards with gradients and better visual hierarchy -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <q-card class="text-red shadow-2xl">
          <q-card-section>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-subtitle1 font-bold mb-2">{{ formatCurrency(totalAmount) }}</div>
                <div class="text-red text-subtitle2 font-medium">Total Retirado</div>
              </div>
              <q-icon name="trending_down" size="3rem" class="text-white/30" />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="bg-gradient-to-br from-blue-500 to-blue-600 text-blue shadow-2xl border-0 overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <q-card-section class="p-8 relative">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-subtitle1 font-bold mb-2">{{ totalWithdrawals }}</div>
                <div class="text-blue text-subtitle2 font-medium">Total Retiros</div>
              </div>
              <q-icon name="receipt_long" size="3rem" class="text-white/30" />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="bg-gradient-to-br from-emerald-500 text-positive shadow-2xl border-0 overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <q-card-section class="p-8 relative">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-subtitle1 font-bold mb-2">{{ daysData.length }}</div>
                <div class="text-positive text-subtitle2 font-medium">Días con Actividad</div>
              </div>
              <q-icon name="calendar_today" size="3rem" class="text-white/30" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Modern loading state with better skeletons -->
      <div v-if="loading" class="space-y-6">
        <q-skeleton height="80px" class="rounded-2xl" />
        <q-skeleton height="300px" class="rounded-2xl" />
      </div>

      <!-- Empty state card respecting Quasar colors -->
      <q-card v-else-if="!hasData" flat bordered class="text-center q-pa-xl shadow-2 rounded-borders">
        <div class="q-mb-md">
          <q-icon name="receipt_long" size="3rem" color="grey-5" />
        </div>
        <div class="text-h6 text-weight-bold q-mb-sm">No se encontraron retiros</div>
        <div class="text-body2" style="max-width: 28rem; margin: 0 auto;">
          No hay transacciones de retiro para el período seleccionado. Intenta ajustar las fechas o filtros.
        </div>
      </q-card>

      <!-- Table with Quasar colors to respect dark mode -->
      <q-table
        v-else
        :rows="daysData"
        :columns="dayColumns"
        row-key="day"
        :pagination="{ rowsPerPage: 10 }"
        class="shadow-2 rounded-borders"
        table-header-class="bg-primary text-white"
        flat
        bordered
        row-hover
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="day" :props="props" class="q-py-md">
              <div class="column q-gutter-xs">
                <div class="text-body1 text-weight-bold text-uppercase">
                  {{ formatDate(props.row.day) }}
                </div>
              </div>
            </q-td>
            <q-td key="count" :props="props" class="text-center q-py-md">
              <q-chip
                :color="props.row.count > 5 ? 'info' : 'primary'"
                text-color="white"
                size="md"
                class="text-weight-medium"
              >
                {{ props.row.count }} retiros
              </q-chip>
            </q-td>
            <q-td key="sum_amount" :props="props" class="text-right q-py-md">
              <div class="text-h6 text-weight-bold text-negative">{{ formatCurrency(props.row.sum_amount) }}</div>
            </q-td>
            <q-td key="actions" :props="props" class="text-center q-py-md">
              <q-btn
                flat
                rounded
                :icon="props.expand ? 'expand_less' : 'expand_more'"
                @click="props.expand = !props.expand"
                :color="props.expand ? 'primary' : 'grey-5'"
                size="md"
              >
                <q-tooltip>{{ props.expand ? 'Ocultar' : 'Ver' }} detalles</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                size="sm"
                color="primary"
                icon="add"
                @click="openCashflowModal(props.row.day)"
              />
            </q-td>
          </q-tr>

          <!-- Expandable section with Quasar colors and Add button -->
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%" class="p-0">
              <div class="q-pa-sm">
                <div class="column q-gutter-md">
                  <q-card
                    v-for="withdrawal in props.row.withdrawals"
                    :key="withdrawal.id"
                    class="rounded-borders"
                    bordered
                    flat
                    :elevation="1"
                    style="border-left: 4px solid var(--q-negative);"
                  >
                    <q-card-section class="q-pa-md">
                      <div class="row items-center justify-between">
                        <div class="row items-center q-gutter-x-sm">
                          <q-badge color="negative" text-color="white" class="text-body2">
                            {{ withdrawal.time }}
                          </q-badge>
                          <div class="text-body1 text-weight-medium">
                            {{ withdrawal.description }} -
                          </div>
                          <div class="text-body1 text-weight-medium">
                            {{ withdrawal.payment_method_name }}
                          </div>
                        </div>

                        <div class="row items-center q-gutter-x-sm">
                          <div class="text-subtitle1 text-weight-bold">
                            Monto: {{ formatCurrency(withdrawal.amount) }}
                          </div>

                          <q-input
                            v-model.number="additionalAmounts[withdrawal.id]"
                            placeholder="Monto Contado"
                            type="number"
                            outlined
                            dense
                            style="width: 150px;"
                            prefix="$"
                          />

                          <div v-if="additionalAmounts[withdrawal.id] > 0" class="text-subtitle1 text-weight-bold" :class="getDifferenceColor(withdrawal.amount, withdrawal.id)">
                            Diferencia: {{ formatCurrency(calculateTotal(withdrawal.amount, withdrawal.id)) }}
                          </div>

                          <q-btn
                            flat
                            rounded
                            color="primary"
                            label="Guardar"
                            icon-right="save"
                            @click="updateWithdrawal(withdrawal)"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <!-- Cashflow Modal -->
    <CashflowModal
      v-model="showCashflowModal"
      :payment-methods="paymentMethods"
      :cash-box-state="null"
      :branch-office="branchOffice"
      :created-at="selectedDate"
      :flow-type-options="[
        { label: 'Arqueo', value: 'withdrawal' }
      ]"
      @cashflow-saved="onCashflowSaved"
    />
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import CashflowModal from 'src/components/CashflowModal.vue'

export default {
  name: 'WithdrawalsReport',
  components: {
    CashflowModal
  },

  setup () {
    const $q = useQuasar()

    const loading = ref(false)
    const loadingBranches = ref(false)
    const loadingPaymentMethods = ref(false)
    const daysData = ref([])
    const store = authentication()
    const branchOffices = ref([])
    const paymentMethods = ref([])
    const dateFrom = ref(formatDateForInput(new Date()))
    const dateTo = ref(formatDateForInput(new Date()))
    const filters = ref({
      branch_office_ids: [store.branchOffice],
      payment_method_ids: [],
      cashbox_user_id: null
    })

    const additionalAmounts = ref({})
    const showCashflowModal = ref(false)
    const selectedDate = ref(null)
    const userSession = computed(() => store.userSession)
    const branchOffice = computed(() => store.branchOffice)

    const totalAmount = computed(() => {
      return daysData.value.reduce((sum, day) => sum + parseFloat(day.sum_amount || 0), 0)
    })

    const totalWithdrawals = computed(() => {
      return daysData.value.reduce((sum, day) => sum + parseInt(day.count || 0), 0)
    })

    const hasData = computed(() => {
      return daysData.value.length > 0
    })

    const dayColumns = [
      {
        name: 'day',
        label: 'Fecha',
        field: 'day',
        align: 'left',
        sortable: true
      },
      {
        name: 'count',
        label: 'Cantidad',
        field: 'count',
        align: 'center',
        sortable: true
      },
      {
        name: 'sum_amount',
        label: 'Total (ARS)',
        field: 'sum_amount',
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

    const loadBranchOffices = async () => {
      loadingBranches.value = true
      try {
        const response = await api.get('branch-offices')
        branchOffices.value = response.data || []
      } catch (error) {
        console.error('Error loading branch offices:', error)
        $q.notify({
          type: 'negative',
          message: 'Error cargando sucursales'
        })
      } finally {
        loadingBranches.value = false
      }
    }

    const loadPaymentMethods = async () => {
      loadingPaymentMethods.value = true
      try {
        const response = await api.get('payment-methods')
        paymentMethods.value = response.data || []
      } catch (error) {
        console.error('Error loading payment methods:', error)
        $q.notify({
          type: 'negative',
          message: 'Error cargando métodos de pago'
        })
      } finally {
        loadingPaymentMethods.value = false
      }
    }

    const loadData = async () => {
      loading.value = true

      try {
        const params = {
          type_cashflow: 'withdrawal',
          date_from: dateFrom.value,
          date_to: dateTo.value
        }

        // Add filters if they have values
        if (filters.value.branch_office_ids?.length) {
          params.branch_office_ids = filters.value.branch_office_ids.map(data => data.id)
        }
        if (filters.value.payment_method_ids?.length) {
          params.payment_method_ids = filters.value.payment_method_ids.map(data => data.id)
        }
        if (filters.value.cashbox_user_id) {
          params.cashbox_user_id = filters.value.cashbox_user_id
        }

        const response = await api.get('/reports/withdrawals-per-day', { params })
        daysData.value = response.data.days || []

        // Populate additionalAmounts with actual_amount values
        daysData.value.forEach(day => {
          if (day.withdrawals) {
            day.withdrawals.forEach(withdrawal => {
              if (withdrawal.actual_amount && withdrawal.actual_amount !== withdrawal.amount) {
                additionalAmounts.value[withdrawal.id] = withdrawal.actual_amount
              }
            })
          }
        })
      } catch (error) {
        console.error('Error loading withdrawals:', error)
        $q.notify({
          type: 'negative',
          message: 'Error cargando datos de retiros',
          caption: error.response?.data?.message || error.message
        })
        daysData.value = []
      } finally {
        loading.value = false
      }
    }

    // Debounced load data for filters
    let debounceTimer = null
    const debouncedLoadData = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(loadData, 300)
    }

    const changeDate = (days) => {
      const currentDate = new Date(dateFrom.value)
      currentDate.setDate(currentDate.getDate() + days)
      const newDate = formatDateForInput(currentDate)
      dateFrom.value = newDate
      dateTo.value = newDate
      loadData()
    }

    const exportCSV = () => {
      if (!hasData.value) return

      const headers = ['Fecha', 'Hora', 'Descripción', 'Monto', 'Método de Pago', 'Caja', 'Sucursal', 'Usuario']
      const rows = []

      daysData.value.forEach(day => {
        day.withdrawals.forEach(w => {
          rows.push([
            day.day,
            w.time,
            `"${w.description}"`,
            w.amount,
            `"${w.payment_method_name}"`,
            w.cashbox_user_id,
            w.branch_office_id,
            w.user_created_id
          ].join(','))
        })
      })

      const csvContent = [headers.join(','), ...rows].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `retiros-${dateFrom.value}-${dateTo.value}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      $q.notify({
        type: 'positive',
        message: 'CSV exportado exitosamente'
      })
    }

    // Update withdrawal with new calculated amount
    const updateWithdrawal = async (withdrawal) => {
      try {
        // Get the new amount from additionalAmounts
        const newAmount = additionalAmounts.value[withdrawal.id]

        if (!additionalAmounts.value[withdrawal.id] || additionalAmounts.value[withdrawal.id] <= 0) {
          $q.notify({
            type: 'warning',
            message: 'Debe ingresar un monto adicional válido'
          })
          return
        }

        const payload = {
          id: withdrawal.id,
          description: withdrawal.description,
          amount: withdrawal.amount,
          branch_office_id: branchOffice.value?.id,
          type_cashflow: 'withdrawal',
          cashbox_user_id: withdrawal.cashbox_user_id,
          payment_method_id: withdrawal.payment_method_id,
          created_at: withdrawal.created_at, // Mantener fecha original
          actual_amount: newAmount
        }

        await api.put(`cashflow/${withdrawal.id}`, payload)

        // Reset additional amount after successful update
        additionalAmounts.value[withdrawal.id] = 0

        // Update local data without reloading to maintain expanded state
        const dayIndex = daysData.value.findIndex(day =>
          day.withdrawals.some(w => w.id === withdrawal.id)
        )
        if (dayIndex >= 0) {
          const withdrawalIndex = daysData.value[dayIndex].withdrawals.findIndex(w => w.id === withdrawal.id)
          if (withdrawalIndex >= 0) {
            daysData.value[dayIndex].withdrawals[withdrawalIndex].amount = newAmount
          }
        }

        $q.notify({
          type: 'positive',
          message: 'Retiro actualizado exitosamente'
        })
      } catch (error) {
        console.error('Error updating withdrawal:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al actualizar el retiro',
          caption: error.response?.data?.message || error.message
        })
      }
    }

    // Open cashflow modal with specific date
    const openCashflowModal = (day) => {
      selectedDate.value = day
      showCashflowModal.value = true
    }

    // Handle cashflow saved event
    const onCashflowSaved = () => {
      showCashflowModal.value = false
      selectedDate.value = null
      loadData()
      $q.notify({
        type: 'positive',
        message: 'Retiro guardado exitosamente'
      })
    }
    const printReport = () => {
      const printContent = `
        <html>
          <head>
            <title>Reporte de Retiros - ${dateFrom.value} a ${dateTo.value}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1976d2; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .total { font-size: 18px; font-weight: bold; margin: 20px 0; }
              .day-header { background-color: #e3f2fd; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Reporte de Retiros por Día</h1>
            <p><strong>Período:</strong> ${formatDate(dateFrom.value)} - ${formatDate(dateTo.value)}</p>
            <div class="total">Total General: ${formatCurrency(totalAmount.value)}</div>
            <div class="total">Total Retiros: ${totalWithdrawals.value}</div>

            ${daysData.value.map(day => `
              <h3>Fecha: ${formatDate(day.day)} - Total: ${formatCurrency(day.sum_amount)} (${day.count} retiros)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Método de Pago</th>
                    <th>Caja</th>
                    <th>Sucursal</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  ${day.withdrawals.map(w => `
                    <tr>
                      <td>${w.time}</td>
                      <td>${w.description}</td>
                      <td>${formatCurrency(w.amount)}</td>
                      <td>${w.payment_method_name}</td>
                      <td>${w.cashbox_user_id}</td>
                      <td>${w.branch_office_id}</td>
                      <td>${w.user_created_id}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `).join('')}
          </body>
        </html>
      `

      const printWindow = window.open('', '_blank')
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }

    // Helper functions
    function formatCurrency (amount) {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount || 0)
    }

    function formatDate (dateString) {
      // Agregar 'T00:00:00' para evitar problemas de zona horaria
      const date = new Date(dateString + 'T00:00:00')
      return date.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    function formatDateShort (dateString) {
      // Agregar 'T00:00:00' para evitar problemas de zona horaria
      const date = new Date(dateString + 'T00:00:00')
      return date.toLocaleDateString('es-AR')
    }

    function formatDateForInput (date) {
      return date.toISOString().split('T')[0]
    }

    function calculateTotal (originalAmount, withdrawalId) {
      const newAmount = additionalAmounts.value[withdrawalId]
      if (newAmount && newAmount > 0) {
        return parseFloat(newAmount) - parseFloat(originalAmount)
      }
      return 0
    }

    function getDifferenceColor (originalAmount, withdrawalId) {
      const newAmount = additionalAmounts.value[withdrawalId]
      if (!newAmount || newAmount <= 0) return 'text-negative'

      const original = parseFloat(originalAmount)
      const replacement = parseFloat(newAmount)
      const difference = replacement - original

      if (difference < 0) return 'text-negative' // Rojo
      if (difference > 0) return 'text-positive' // Verde
      return 'text-info' // Azul
    }

    // Lifecycle
    onMounted(() => {
      loadBranchOffices()
      loadPaymentMethods()
      loadData()
    })

    return {
      // State
      loading,
      loadingBranches,
      loadingPaymentMethods,
      daysData,
      branchOffices,
      paymentMethods,
      dateFrom,
      dateTo,
      filters,

      // Computed
      totalAmount,
      totalWithdrawals,
      hasData,
      dayColumns,

      // Methods
      loadData,
      debouncedLoadData,
      changeDate,
      exportCSV,
      printReport,
      formatCurrency,
      formatDate,
      formatDateShort,
      calculateTotal,
      getDifferenceColor,
      additionalAmounts,
      showCashflowModal,
      selectedDate,
      userSession,
      branchOffice,
      updateWithdrawal,
      openCashflowModal,
      onCashflowSaved
    }
  }
}
</script>

<style scoped>
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.rounded-2xl {
  border-radius: 1rem;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.tracking-tight {
  letter-spacing: -0.025em;
}

.tracking-wide {
  letter-spacing: 0.025em;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.hover\:bg-white\/30:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.hover\:bg-gray-200:hover {
  background-color: #e5e7eb;
}

.hover\:bg-blue-50\/50:hover {
  background-color: rgba(239, 246, 255, 0.5);
}

.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modern-table {
  border-radius: 1rem;
  overflow: hidden;
}

.modern-select {
  border-radius: 0.5rem;
}

/* Grid system */
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* Spacing utilities */
.gap-6 {
  gap: 1.5rem;
}

.gap-8 {
  gap: 2rem;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-8 > * + * {
  margin-top: 2rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.space-x-6 > * + * {
  margin-left: 1.5rem;
}

/* Sizing utilities */
.w-24 {
  width: 6rem;
}

.h-24 {
  height: 6rem;
}

.w-32 {
  width: 8rem;
}

.h-32 {
  height: 8rem;
}

.w-44 {
  width: 11rem;
}

.max-w-md {
  max-width: 28rem;
}

.max-w-7xl {
  max-width: 80rem;
}

/* Positioning */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.top-0 {
  top: 0;
}

.right-0 {
  right: 0;
}

.-mr-16 {
  margin-right: -4rem;
}

.-mt-16 {
  margin-top: -4rem;
}

.ml-6 {
  margin-left: 1.5rem;
}

/* Padding utilities */
.p-0 {
  padding: 0;
}

.p-6 {
  padding: 1.5rem;
}

.p-8 {
  padding: 2rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.py-20 {
  padding-top: 5rem;
  padding-bottom: 5rem;
}

.pt-0 {
  padding-top: 0;
}

/* Text utilities */
.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.uppercase {
  text-transform: uppercase;
}

/* Color utilities */
.text-white {
  color: #ffffff;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-800 {
  color: #1f2937;
}

.text-gray-900 {
  color: #111827;
}

.text-red-600 {
  color: #dc2626;
}

.text-blue-100 {
  color: #dbeafe;
}

.text-red-100 {
  color: #fee2e2;
}

.text-emerald-100 {
  color: #dcfce7;
}

.text-indigo-100 {
  color: #e0e7ff;
}

.text-indigo-600 {
  color: #4f46e5;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-red-50 {
  background-color: #fef2f2;
}

.bg-red-100 {
  background-color: #fee2e2;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.border-blue-100 {
  border-color: #dbeafe;
}

.border-t {
  border-top-width: 1px;
}

.border-l-4 {
  border-left-width: 4px;
}

.border-red-500 {
  border-color: #ef4444;
}

.border-0 {
  border-width: 0;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.overflow-hidden {
  overflow: hidden;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.justify-between {
  justify-content: space-between;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1 1 0%;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

@media print {
  .q-toolbar,
  .q-expansion-item,
  .q-btn-toggle {
    display: none !important;
  }
}
</style>
