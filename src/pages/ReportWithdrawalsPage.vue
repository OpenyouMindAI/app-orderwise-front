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
        </div>
      </div>
    </div>

    <div class=" mx-auto q-mt-sm space-y-4 q-mt-md q-gutter-y-md">

      <!-- Filters section using Quasar classes for dark mode -->
      <q-expansion-item
        icon="tune"
        label="Filtros"
        class="shadow-2 rounded-borders"
        header-class="text-h6 text-weight-medium q-px-md q-py-sm"
        default-opened
      >
        <q-card flat>
          <q-card-section class="q-pa-md">
            <div class="flex q-gutter-md">
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
                        style="min-width: 150px;"
                        class="q-mx-sm"
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
                        style="min-width: 150px;"
                        class="q-mx-sm"
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
                  style="min-width: 200px;"
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
                  style="min-width: 200px;"
                  @update:model-value="debouncedLoadData"
                  :loading="loadingPaymentMethods"
                />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Completely redesigned summary cards with gradients and better visual hierarchy -->
      <div class="row q-col-gutter-x-xs justify-between">
        <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
          <q-card class="text-positive shadow-2xl">
            <q-card-section>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-subtitle1 font-bold mb-2">{{ formatCurrency(totalsAmount.paid_sales) }}</div>
                  <div class="text-positive text-subtitle2 font-medium">Total ventas</div>
                </div>
                <q-icon name="trending_down" size="3rem" class="text-white/30" />
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
          <q-card class="text-blue shadow-2xl">
            <q-card-section>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-subtitle1 font-bold mb-2">{{ formatCurrency(totalsAmount.sum_amount) }}</div>
                  <div class="text-blue text-subtitle2 font-medium">Total Retirado</div>
                </div>
                <q-icon name="trending_down" size="3rem" class="text-white/30" />
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
          <q-card class="bg-gradient-to-br from-blue-500 to-blue-600 text-blue shadow-2xl border-0 overflow-hidden relative">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <q-card-section class="p-8 relative">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-subtitle1 font-bold mb-2">{{ totalsAmount.difference_report }}</div>
                  <div class="text-blue text-subtitle2 font-medium">Diferencia</div>
                </div>
                <q-icon name="receipt_long" size="3rem" class="text-white/30" />
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
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
        :pagination="{ rowsPerPage: 0 }"
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
                  {{ formatDate(`${props.row.day} 00:00:00`) }}
                </div>
              </div>
            </q-td>
            <q-td key="paid_sales" :props="props" class="text-right q-py-md">
              <div class="text-h6 text-weight-bold text-negative">{{ formatCurrency(props.row.paid_sales) }}</div>
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
            <q-td key="difference" :props="props" class="text-right q-py-md">
              <div class="text-h6 text-weight-bold text-negative">{{ formatCurrency(props.row.difference_report) }}</div>
            </q-td>
            <q-td key="actions" :props="props" class="text-center q-py-md">
              <q-btn
                flat
                rounded
                :icon="expandedRows.has(props.row.day) ? 'expand_less' : 'expand_more'"
                @click="toggleExpanded(props.row.day)"
                :color="expandedRows.has(props.row.day) ? 'primary' : 'grey-5'"
                size="md"
              >
                <q-tooltip>{{ expandedRows.has(props.row.day) ? 'Ocultar' : 'Ver' }} detalles</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>

          <!-- Expandable section with Quasar colors and Add button -->
          <q-tr v-show="expandedRows.has(props.row.day)" :props="props">
            <q-td colspan="100%" class="p-0">
              <div class="q-pa-sm">
                <div class="column q-gutter-md">
                  <!-- Pagination info -->
                  <!-- Comment out pagination until we refactor for new structure -->
                  <!--
                  <div v-if="props.row.count > itemsPerPage" class="row items-center justify-between q-mb-sm">
                    <div class="text-caption text-grey-7">
                      Mostrando {{ ((dayPagination[props.row.day]?.currentPage || 1) - 1) * itemsPerPage + 1 }} -
                      {{ Math.min((dayPagination[props.row.day]?.currentPage || 1) * itemsPerPage, props.row.count) }}
                      de {{ props.row.count }} retiros
                    </div>
                    <div class="row q-gutter-xs">
                      <q-btn
                        flat
                        round
                        size="sm"
                        icon="chevron_left"
                        color="primary"
                        :disable="(dayPagination[props.row.day]?.currentPage || 1) === 1"
                        @click="changePage(props.row.day, 'prev')"
                      />
                      <div class="text-caption text-center q-px-sm q-py-xs">
                        {{ dayPagination[props.row.day]?.currentPage || 1 }} / {{ Math.ceil(props.row.count / itemsPerPage) }}
                      </div>
                      <q-btn
                        flat
                        round
                        size="sm"
                        icon="chevron_right"
                        color="primary"
                        :disable="(dayPagination[props.row.day]?.currentPage || 1) === Math.ceil(props.row.count / itemsPerPage)"
                        @click="changePage(props.row.day, 'next')"
                      />
                    </div>
                  </div>
                  -->
                  <!-- Paginated withdrawals -->
                  <q-card
                    v-for="cashbox in props.row.cashboxes" :key="cashbox.cashbox_user_id" class="q-mb-lg"
                  >
                    <div class="text-subtitle2 q-mb-sm flex justify-between q-pa-sm">
                      <div class="text-subtitle1">
                        <strong>{{ cashbox.cashbox.name }}</strong>
                        <span v-if="cashbox.user" class="text-body2 q-ml-sm">({{ cashbox.user.name }})</span>
                      </div>
                      <q-btn
                        flat
                        round
                        size="sm"
                        color="primary"
                        icon="add"
                        @click="openCashflowModal(cashbox)"
                      />
                    </div>
                    <q-card
                      v-for="withdrawal in cashbox.withdrawals" :key="withdrawal.id"
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
                              v-model.number="withdrawal.actual_amount"
                              placeholder="Monto Contado"
                              type="number"
                              outlined
                              dense
                              style="width: 150px;"
                              prefix="$"
                            />

                            <q-btn
                              rounded
                              color="primary"
                              label="Guardar"
                              icon="save"
                              @click="updateWithdrawal(withdrawal)"
                            />

                            <q-btn
                              v-if="withdrawal.images && withdrawal.images.length > 0"
                              rounded
                              color="blue-5"
                              icon="photo"
                              @click="openFileWithdrawal(withdrawal)"
                            >
                              <q-tooltip>Ver imagen ({{ withdrawal.images.length }})</q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
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
      :created-at="cashflow.createdAt"
      :payment-method="cashflow.paymentMethodId"
      :description-value="cashflow.description"
      :cashBoxState="cashflow.cashboxUser"
      :flow-type-options="[
        { label: 'Arqueo', value: 'withdrawal' }
      ]"
      @cashflow-saved="onCashflowSaved"
    />

    <!-- Image Preview Dialog -->
    <q-dialog
      v-model="showImagePreview"
      :maximized="$q.screen.lt.md"
      :full-width="$q.screen.gt.sm"
      :full-height="$q.screen.gt.sm"
    >
      <q-card class="image-preview-card">
        <q-card-section class="row items-center q-pa-sm bg-dark text-white">
          <div class="text-subtitle1 text-weight-medium">Previsualización de Imagen - Retiro</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" size="sm" />
        </q-card-section>

        <q-card-section class="image-container">
          <div v-if="imageLoading" class="image-placeholder">
            <q-spinner-dots size="50px" color="primary" />
            <div class="text-primary q-mt-md">Cargando imagen...</div>
          </div>

          <div v-else-if="imageError" class="image-placeholder">
            <q-icon name="broken_image" size="80px" color="grey-5" />
            <div class="text-grey-8 q-mt-md text-weight-medium">Error al cargar la imagen</div>
            <div class="text-grey-6 q-mt-sm text-caption">{{ imageError }}</div>
          </div>

          <img
            v-else-if="previewImageUrl"
            :src="previewImageUrl"
            class="preview-image"
            @error="handleImageError"
            @load="imageLoading = false"
          />

          <div v-else class="image-placeholder">
            <q-icon name="image_not_supported" size="80px" color="grey-5" />
            <div class="text-grey-8 q-mt-md text-weight-medium">No hay imagen disponible</div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-md bg-grey-1">
          <q-btn
            v-if="previewImageUrl && !imageError"
            color="primary"
            icon="download"
            label="Descargar"
            @click="downloadImage"
            unelevated
          />
          <q-btn
            color="grey-7"
            icon="close"
            label="Cerrar"
            v-close-popup
            flat
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import CashflowModal from 'src/components/CashflowModal.vue'

/**
 * Component for displaying and managing daily withdrawal reports
 * @component ReportWithdrawalsPage
 * @description Displays a report of daily withdrawals with filtering, export, and management capabilities
 */

export default {
  name: 'WithdrawalsReport',
  components: {
    CashflowModal
  },

  watch: {
    /**
     * Watcher for showCashflowModal changes
     * @param {boolean} newShow - New value of showCashflowModal
     */
    showCashflowModal (newShow) {
      if (!newShow) {
        this.cashflow = {}
      }
    }
  },

  /**
   * Component setup function
   * @returns {Object} Component's public interface
   */
  setup () {
    const $q = useQuasar()

    /*
     * Controls the loading state for the main data
     * @type {import('vue').Ref<boolean>}
     */
    const loading = ref(false)

    /*
     * Controls the loading state for branch offices data
     * @type {import('vue').Ref<boolean>}
     */
    const loadingBranches = ref(false)

    /*
     * Controls the loading state for payment methods data
     * @type {import('vue').Ref<boolean>}
     */
    const loadingPaymentMethods = ref(false)

    /*
     * Array containing daily withdrawal data with summary information
     * @type {import('vue').Ref<Array<{
     *   day: string,
     *   sum_amount: number,
     *   count: number,
     *   withdrawals: Array<Object>,
     *   cashboxes: Array<Object>
     * }>>}
     */
    const daysData = ref([])

    /*
     * Authentication store instance
     * @type {Object}
     */
    const store = authentication()

    /*
     * List of available branch offices
     * @type {import('vue').Ref<Array<Object>>}
     */
    const branchOffices = ref([])

    /*
     * List of available payment methods
     * @type {import('vue').Ref<Array<Object>>}
     */
    const paymentMethods = ref([])

    /*
     * Start date for the report in YYYY-MM-DD format
     * @type {import('vue').Ref<string>}
     */
    const dateFrom = ref('')

    /*
     * End date for the report in YYYY-MM-DD format
     * @type {import('vue').Ref<string>}
     */
    const dateTo = ref('')

    /*
     * Active filters for the report
     * @type {import('vue').Ref<{
     *   branch_office_ids: Array<number>,
     *   payment_method_ids: Array<number>,
     *   cashbox_user_id: number|null
     * }>}
     */
    const filters = ref({
      branch_office_ids: [],
      payment_method_ids: [],
      cashbox_user_id: null
    })

    /*
     * Current user session data from the authentication store
     * @type {import('vue').ComputedRef<Object>}
     */
    const userSession = computed(() => store.userSession)

    /*
     * Current branch office data from the authentication store
     * @type {import('vue').ComputedRef<Object>}
     */
    const branchOffice = computed(() => store.branchOffice)

    /*
     * Visibility of the cashflow modal
     * @type {import('vue').Ref<boolean>}
     */
    const showCashflowModal = ref(false)

    /*
     * Currently selected date for cashflow operations
     * @type {import('vue').Ref<string|null>}
     */
    const selectedDate = ref(null)

    /*
     * Set of expanded row dates
     * @type {import('vue').Ref<Set<string>>}
     */
    /*
     * Tracks which date rows are currently expanded
     * @type {import('vue').Ref<Set<string>>}
     */
    const expandedRows = ref(new Set())

    /*
     * Pagination state for each day's withdrawal list
     * @type {import('vue').Ref<{[key: string]: {currentPage: number}}>}
     */
    const dayPagination = ref({})

    /*
     * Number of items to display per page in the paginated lists
     * @type {number}
     */
    const itemsPerPage = 50

    /*
     * Aggregated totals for the report
     * @type {import('vue').Ref<{
     *   paid_sales?: number,
     *   sum_amount?: number,
     *   difference_report?: string
     * }>}
     */
    const totalsAmount = ref({})

    /*
     * Controls visibility of the image preview modal
     * @type {import('vue').Ref<boolean>}
     */
    const showImagePreview = ref(false)

    /*
     * URL of the image being previewed
     * @type {import('vue').Ref<string|null>}
     */
    const previewImageUrl = ref(null)

    /*
     * Loading state for the image preview
     * @type {import('vue').Ref<boolean>}
     */
    const imageLoading = ref(false)

    /*
     * Error message for image loading failures
     * @type {import('vue').Ref<string|null>}
     */
    const imageError = ref(null)

    /*
     * Currently selected withdrawal for preview
     * @type {import('vue').Ref<Object|null>}
     */
    const currentWithdrawal = ref(null)
    const cashflow = ref({})

    /**
     * Computed property that calculates the total amount of all withdrawals
     * @type {import('vue').ComputedRef<number>}
     */
    const totalAmount = computed(() => {
      return daysData.value.reduce((sum, day) => sum + parseFloat(day.sum_amount || 0), 0)
    })

    /**
     * Computed property that calculates the total number of withdrawals
     * @type {import('vue').ComputedRef<number>}
     */
    const totalWithdrawals = computed(() => {
      return daysData.value.reduce((sum, day) => sum + parseInt(day.count || 0), 0)
    })

    /**
     * Computed property that checks if there is any data to display
     * @type {import('vue').ComputedRef<boolean>}
     */
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
        name: 'paid_sales',
        label: 'Ventas Pagadas',
        field: 'paid_sales',
        align: 'right',
        format: val => formatCurrency(val),
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
        name: 'difference',
        label: 'Diferencia',
        field: 'difference',
        align: 'right',
        format: val => formatCurrency(val),
        sortable: true
      },
      {
        name: 'actions',
        label: 'Acciones',
        field: 'actions',
        align: 'center'
      }
    ]

    const isMounted = ref(false)

    onMounted(() => {
      isMounted.value = true
      loadBranchOffices()
      loadPaymentMethods()
      loadData()
    })

    onUnmounted(() => {
      isMounted.value = false
    })

    /**
     * Loads the list of branch offices from the API
     * @async
     * @returns {Promise<void>}
     * @description Fetches branch offices and updates the component state
     */
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

    /**
     * Loads the list of available payment methods from the API
     * @async
     * @returns {Promise<void>}
     * @description Fetches payment methods and updates the component state
     */
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

    /**
     * Loads withdrawal data based on current filters and date range
     * @async
     * @returns {Promise<void>}
     * @description Fetches withdrawal data from the API and updates the component state
     */
    const loadData = async () => {
      if (!isMounted.value) return
      loading.value = true

      try {
        const params = {
          type_cashflow: 'withdrawal',
          date_from: dateFrom.value,
          date_to: dateTo.value
        }

        // Add filters if they have values
        if (filters.value.branch_office_ids?.length) {
          params.branch_office_ids = filters.value.branch_office_ids.map(data => data?.id)
        }
        if (filters.value.payment_method_ids?.length) {
          params.payment_method_ids = filters.value.payment_method_ids.map(data => data?.id)
        }
        if (filters.value.cashbox_user_id) {
          params.cashbox_user_id = filters.value.cashbox_user_id
        }

        const response = await api.get('/reports/withdrawals-per-day', { params })
        if (isMounted.value) {
          daysData.value = response.data.days || []
          totalsAmount.value = response.data.meta
        }
      } catch (error) {
        console.error('Error loading withdrawals:', error)
        if (isMounted.value) {
          $q.notify({
            type: 'negative',
            message: 'Error cargando datos de retiros',
            caption: error.response?.data?.message || error.message
          })
          daysData.value = []
        }
      } finally {
        if (isMounted.value) {
          loading.value = false
        }
      }
    }

    /**
     * Timer ID for debouncing API calls
     * @type {number|null}
     */
    let debounceTimer = null

    /**
     * Debounced version of loadData to prevent excessive API calls
     * @returns {void}
     * @description Delays the execution of loadData by 300ms to prevent rapid successive calls
     */
    const debouncedLoadData = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(loadData, 300)
    }

    /**
     * Changes the current date range by the specified number of days
     * @param {number} days - Number of days to adjust the date range by
     * @returns {void}
     * @description Updates both dateFrom and dateTo to the same new date
     */
    const changeDate = (days) => {
      const currentDate = new Date(dateFrom.value)
      currentDate.setDate(currentDate.getDate() + days)
      const newDate = formatDateForInput(currentDate)
      dateFrom.value = newDate
      dateTo.value = newDate
      loadData()
    }

    /**
     * Exports the withdrawal data to a CSV file
     * @returns {void}
     * @description Generates and downloads a CSV file containing withdrawal data
     */
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

    /**
     * Updates a withdrawal with a new calculated amount
     * @async
     * @param {Object} withdrawal - The withdrawal object to update
     * @returns {Promise<void>}
     * @description Updates the withdrawal amount and refreshes the UI
     */
    const updateWithdrawal = async (withdrawal) => {
      try {
        // Get the new amount from withdrawal.actual_amount
        const newAmount = withdrawal.actual_amount

        if (!newAmount || newAmount <= 0) {
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

        // Update local data without reloading to maintain expanded state
        const dayIndex = daysData.value.findIndex(day =>
          day.withdrawals.some(w => w.id === withdrawal.id)
        )
        if (dayIndex >= 0) {
          const withdrawalIndex = daysData.value[dayIndex].withdrawals.findIndex(w => w.id === withdrawal.id)
          if (withdrawalIndex >= 0) {
            // Update actual_amount instead of amount to preserve original amount for difference calculation
            daysData.value[dayIndex].withdrawals[withdrawalIndex].actual_amount = newAmount
          }
        } else {
          // Fallback: reload data if day not found
          loadData()
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

    /**
     * Gets a paginated subset of withdrawals for a specific day
     * @param {Array} dayWithdrawals - Array of withdrawals for the day
     * @param {string} day - The day identifier
     * @returns {Array} - Paginated array of withdrawals
     */
    const getPaginatedWithdrawals = (dayWithdrawals, day) => {
      if (!dayPagination.value[day]) {
        dayPagination.value[day] = { currentPage: 1 }
      }

      const startIndex = (dayPagination.value[day].currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return dayWithdrawals.slice(startIndex, endIndex)
    }

    /**
     * Calculates the total number of pages for a day's withdrawals
     * @param {Array} dayWithdrawals - Array of withdrawals for the day
     * @returns {number} - Total number of pages
     */
    const getTotalPages = (dayWithdrawals) => {
      return Math.ceil(dayWithdrawals.length / itemsPerPage)
    }

    /**
     * Changes the current page for a specific day's withdrawals
     * @param {string} day - The day identifier
     * @param {string} direction - Direction to change page ('next' or 'prev')
     * @returns {void}
     */
    const changePage = (day, direction) => {
      if (!dayPagination.value[day]) {
        dayPagination.value[day] = { currentPage: 1 }
      }

      const dayData = daysData.value.find(d => d.day === day)
      if (!dayData) return

      const totalPages = getTotalPages(dayData.withdrawals)
      const currentPage = dayPagination.value[day].currentPage

      if (direction === 'next' && currentPage < totalPages) {
        dayPagination.value[day].currentPage++
      } else if (direction === 'prev' && currentPage > 1) {
        dayPagination.value[day].currentPage--
      }
    }

    /**
     * Toggles the expanded/collapsed state for a specific day
     * @param {string} day - The day identifier to toggle
     * @returns {void}
     */
    const toggleExpanded = (day) => {
      if (expandedRows.value.has(day)) {
        expandedRows.value.delete(day)
      } else {
        expandedRows.value.add(day)
        // Initialize pagination for this day if not exists
        if (!dayPagination.value[day]) {
          dayPagination.value[day] = { currentPage: 1 }
        }
      }
    }

    /**
     * Opens the cashflow modal for a specific date
     * @param {Object} row - The row data containing date and cashbox information
     * @returns {void}
     */
    const openCashflowModal = (row) => {
      selectedDate.value = row.day
      showCashflowModal.value = true
      cashflow.value = {
        cashboxUser: {
          id: row.cashbox_user_id
        },
        paymentMethodId: row.by_payment_method[0]?.payment_method_id || paymentMethods.value[0]?.id,
        createdAt: row.closed_at,
        branchOffice: branchOffice.value,
        description: 'Arqueo'
      }
      // Ensure the row is expanded when adding a new record
      expandedRows.value.add(row.day)
    }

    /**
     * Handles the cashflow saved event
     * @param {Object} newCashflow - The newly saved cashflow data
     * @returns {void}
     * @description Updates the UI with the new cashflow data
     */
    const onCashflowSaved = (newCashflow) => {
      showCashflowModal.value = false
      const currentSelectedDate = selectedDate.value
      selectedDate.value = null
      if (newCashflow && currentSelectedDate) {
        const dayIndex = daysData.value.findIndex(day => day.day === currentSelectedDate)
        if (dayIndex >= 0) {
          // Add new withdrawal to existing day
          if (!daysData.value[dayIndex].withdrawals) {
            daysData.value[dayIndex].withdrawals = []
          }
          daysData.value[dayIndex].withdrawals.push(newCashflow)
          // Update counters
          daysData.value[dayIndex].count = (daysData.value[dayIndex].count || 0) + 1
          daysData.value[dayIndex].sum_amount = (daysData.value[dayIndex].sum_amount || 0) + parseFloat(newCashflow.amount || 0)
        } else {
          // Fallback: reload data if day not found
          loadData()
        }
      } else {
        // Fallback: reload data if no specific date
        loadData()
      }

      cashflow.value = {}

      $q.notify({
        type: 'positive',
        message: 'Retiro guardado exitosamente'
      })
    }

    /**
     * Opens the image preview for a withdrawal
     * @param {Object} withdrawal - The withdrawal object containing image data
     * @returns {void}
     */
    const openFileWithdrawal = (withdrawal) => {
      try {
        currentWithdrawal.value = withdrawal
        imageLoading.value = true
        imageError.value = null
        previewImageUrl.value = null
        showImagePreview.value = true

        // Check if withdrawal has images
        if (withdrawal.images && withdrawal.images.length > 0) {
          // Use the first image URL directly from the API response
          const firstImage = withdrawal.images[0]
          if (firstImage.url) {
            previewImageUrl.value = firstImage.url
            imageLoading.value = false
          } else {
            throw new Error('URL de imagen no disponible')
          }
        } else {
          throw new Error('No hay imágenes disponibles para este retiro')
        }
      } catch (error) {
        console.error('Error loading withdrawal image:', error)
        imageError.value = error.message || 'Error al cargar la imagen'
        previewImageUrl.value = null
        imageLoading.value = false
      }
    }

    /**
     * Handles image loading errors
     * @returns {void}
     */
    const handleImageError = () => {
      imageError.value = 'Error al cargar la imagen'
      imageLoading.value = false
    }

    /**
     * Initiates download of the currently viewed image
     * @returns {void}
     */
    const downloadImage = () => {
      if (previewImageUrl.value && currentWithdrawal.value) {
        const link = document.createElement('a')
        link.href = previewImageUrl.value

        // Create a descriptive filename
        const date = currentWithdrawal.value.created_at
          ? currentWithdrawal.value.created_at.split('T')[0]
          : new Date().toISOString().split('T')[0]
        const description = currentWithdrawal.value.description?.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '') || 'retiro'
        const extension = previewImageUrl.value.includes('.jpg') ? '.jpg'
          : previewImageUrl.value.includes('.png') ? '.png'
            : previewImageUrl.value.includes('.jpeg') ? '.jpeg' : '.jpg'

        link.download = `${description}-${currentWithdrawal.value.id}-${date}${extension}`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        $q.notify({
          type: 'positive',
          message: 'Descarga iniciada',
          caption: 'La imagen se está descargando...'
        })
      }
    }

    /**
     * Flattens withdrawals from all cashboxes for a given day
     * @param {Object} dayData - The day data object containing cashboxes
     * @returns {Array} - Flattened array of all withdrawals for the day
     */
    const getAllWithdrawalsForDay = (dayData) => {
      return dayData.cashboxes.flatMap(cashbox => cashbox.withdrawals)
    }

    /**
     * Generates and opens a print-friendly version of the withdrawal report
     * @returns {void}
     * @description Creates a new window with a print-optimized view of the report
     */
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
                  ${getAllWithdrawalsForDay(day).map(w => `
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
    /**
     * Formats a number as currency in Argentine Peso (ARS)
     * @param {number} amount - Number to format
     * @returns {string} - Formatted currency string
     */
    function formatCurrency (amount) {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount || 0)
    }

    /**
     * Formats a date string to a localized date format
     * @param {string} dateString - Date string to format
     * @returns {string} - Formatted date string in 'DD/MM/YYYY' format
     */
    function formatDate (dateString) {
      if (!dateString) return ''
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    }

    /**
     * Formats a date string to a localized short date format
     * @param {string} dateString - Date string to format
     * @returns {string} - Formatted date string in 'DD/MM/YYYY' format
     */
    /**
     * Formats a date string to a short localized format
     * @param {string} dateString - The date string to format
     * @returns {string} - Formatted date string
     */
    function formatDateShort (dateString) {
      // Agregar 'T00:00:00' para evitar problemas de zona horaria
      const date = new Date(dateString + 'T00:00:00')
      return date.toLocaleDateString('es-AR')
    }

    /**
     * Formats a date object to YYYY-MM-DD string format
     * @param {Date|string} date - The date to format
     * @returns {string} - Formatted date string
     */
    function formatDateForInput (date) {
      return date.toISOString().split('T')[0]
    }

    /**
     * Calculates the difference between actual and original amount
     * @param {number|string} originalAmount - The original amount
     * @param {number|string} actualAmount - The actual/current amount
     * @returns {number} - The difference between amounts
     */
    function calculateTotal (originalAmount, actualAmount) {
      const newAmount = actualAmount
      if (newAmount && newAmount > 0) {
        return parseFloat(newAmount) - parseFloat(originalAmount)
      }
      return 0
    }

    /**
     * Determines the color class based on amount difference
     * @param {number|string} originalAmount - The original amount
     * @param {number|string} actualAmount - The actual/current amount
     * @returns {string} - CSS class for the difference display
     */
    function getDifferenceColor (originalAmount, actualAmount) {
      const newAmount = actualAmount
      if (!newAmount || newAmount <= 0) return 'text-negative'

      const original = parseFloat(originalAmount)
      const replacement = parseFloat(newAmount)
      const difference = replacement - original

      if (difference < 0) return 'text-negative' // Rojo
      if (difference > 0) return 'text-positive' // Verde
      return 'text-info' // Azul
    }

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
      cashflow,
      filters,
      totalsAmount,

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
      showCashflowModal,
      selectedDate,
      expandedRows,
      dayPagination,
      itemsPerPage,
      getPaginatedWithdrawals,
      getTotalPages,
      changePage,
      userSession,
      branchOffice,
      updateWithdrawal,
      openCashflowModal,
      onCashflowSaved,
      toggleExpanded,

      // Image preview
      showImagePreview,
      previewImageUrl,
      imageLoading,
      imageError,
      currentWithdrawal,
      openFileWithdrawal,
      handleImageError,
      downloadImage
    }
  }
}
</script>

<style scoped>
/* Custom shadow that's not in Quasar by default */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Custom responsive grid utilities */
@media (min-width: 600px) {
  .col-xs-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (min-width: 768px) {
  .col-sm-6 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (min-width: 1024px) {
  .col-md-8 {
    flex: 0 0 66.666667%;
    max-width: 66.666667%;
  }

  .col-md-4 {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
  }
}

@media (min-width: 1280px) {
  .col-lg-3 {
    flex: 0 0 25%;
    max-width: 25%;
  }
}

/* Print styles */
@media print {
  .q-toolbar,
  .q-expansion-item,
  .q-btn-toggle {
    display: none !important;
  }
}
</style>
