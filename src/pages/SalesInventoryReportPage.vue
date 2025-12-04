<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary">
          <q-icon name="assessment" size="32px" class="q-mr-sm" />
          Reporte de Ventas vs Inventario
        </div>
        <div class="text-caption text-grey-7">
          Análisis de ventas y stock para decisiones de compra y promociones
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          color="positive"
          icon="file_download"
          label="Exportar Excel"
          @click="exportExcel"
          :loading="loadingExport"
          unelevated
          class="q-mr-sm"
        />
        <q-btn
          color="negative"
          icon="picture_as_pdf"
          label="Exportar PDF"
          @click="exportPdf"
          :loading="loadingExport"
          unelevated
        />
      </div>
    </div>

    <!-- Filters Card -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section class="bg-grey-2">
        <div class="text-subtitle1 text-weight-medium">
          <q-icon name="filter_alt" class="q-mr-sm" />
          Filtros
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Date Range -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.date_from"
              label="Fecha Desde"
              type="date"
              filled
              dense
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.date_to"
              label="Fecha Hasta"
              type="date"
              filled
              dense
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>

          <!-- Branch Office -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.branch_office_id"
              :options="branchOffices"
              option-value="id"
              option-label="name"
              label="Sucursal"
              filled
              dense
              clearable
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="store" />
              </template>
            </q-select>
          </div>

          <!-- Category -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.category_id"
              :options="categories"
              option-value="id"
              option-label="name"
              label="Categoría"
              filled
              dense
              clearable
              emit-value
              map-options
              use-input
              @filter="filterCategories"
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>
          </div>

          <!-- Search -->
          <div class="col-12 col-md-9">
            <q-input
              v-model="filters.search"
              label="Buscar por código o nombre de producto"
              filled
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Apply Button -->
          <div class="col-12 col-md-3">
            <q-btn
              color="primary"
              icon="refresh"
              label="Aplicar Filtros"
              @click="loadReport"
              :loading="loading"
              unelevated
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- KPIs Section -->
    <div class="row q-col-gutter-md q-mb-md" v-if="kpis">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="bg-positive text-white">
            <div class="text-h6">
              <q-icon name="attach_money" size="24px" />
              Ventas Totales
            </div>
            <div class="text-h4 text-weight-bold">
              ${{ formatNumber(kpis.total_sales) }}
            </div>
            <div class="text-caption">
              {{ formatNumber(kpis.total_units) }} unidades vendidas
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="bg-info text-white">
            <div class="text-h6">
              <q-icon name="inventory" size="24px" />
              Valor del Stock
            </div>
            <div class="text-h4 text-weight-bold">
              ${{ formatNumber(kpis.stock_value) }}
            </div>
            <div class="text-caption">
              Stock actual valorizado
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              <q-icon name="analytics" size="20px" />
              Estado del Stock
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-4 text-center">
                <div class="text-h5 text-negative text-weight-bold">
                  {{ kpis.stock_critical_count }}
                </div>
                <div class="text-caption">Crítico</div>
              </div>
              <div class="col-4 text-center">
                <div class="text-h5 text-positive text-weight-bold">
                  {{ kpis.stock_healthy_count }}
                </div>
                <div class="text-caption">Sano</div>
              </div>
              <div class="col-4 text-center">
                <div class="text-h5 text-warning text-weight-bold">
                  {{ kpis.stock_idle_count }}
                </div>
                <div class="text-caption">Ocioso</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Top Products Cards -->
    <div class="row q-col-gutter-md q-mb-md" v-if="kpis">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="trending_up" class="q-mr-sm" />
              Top 5 Productos Más Vendidos
            </div>
          </q-card-section>
          <q-card-section>
            <q-list dense v-if="kpis.top_products_by_sales && kpis.top_products_by_sales.length">
              <q-item v-for="(product, index) in kpis.top_products_by_sales" :key="index">
                <q-item-section avatar>
                  <q-avatar color="positive" text-color="white" size="32px">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ product.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold text-positive">
                    ${{ formatNumber(product.value) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center text-grey-7 q-pa-md">
              Sin datos disponibles
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="warning" class="q-mr-sm" />
              Top 5 Productos con Menor Cobertura
              <q-tooltip>Productos con riesgo de quiebre de stock</q-tooltip>
            </div>
          </q-card-section>
          <q-card-section>
            <q-list dense v-if="kpis.top_products_by_low_coverage && kpis.top_products_by_low_coverage.length">
              <q-item v-for="(product, index) in kpis.top_products_by_low_coverage" :key="index">
                <q-item-section avatar>
                  <q-avatar color="negative" text-color="white" size="32px">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ product.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold text-negative">
                    {{ product.value }} días
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center text-grey-7 q-pa-md">
              Sin datos disponibles
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Detailed Table -->
    <q-card flat bordered>
      <q-card-section class="bg-grey-2">
        <div class="row items-center">
          <div class="col">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="table_chart" class="q-mr-sm" />
              Detalle por Producto
              <q-tooltip>
                <div>
                  <strong>Días de Cobertura:</strong> Stock actual / Promedio diario de ventas<br>
                  <strong>Stock Crítico:</strong> Menos de 7 días de cobertura<br>
                  <strong>Stock Ocioso:</strong> Sin ventas o más de 90 días de cobertura<br>
                  <strong>Stock Sano:</strong> Entre 7 y 90 días de cobertura
                </div>
              </q-tooltip>
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              dense
              round
              color="primary"
              icon="view_column"
              @click="showColumnDialog = true"
            >
              <q-tooltip>Mostrar/Ocultar Columnas</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              color="primary"
              icon="restart_alt"
              @click="resetTableConfig"
            >
              <q-tooltip>Restaurar Configuración</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-table
          :rows="products"
          :columns="visibleColumns"
          row-key="product_id"
          :loading="loading"
          :pagination="pagination"
          @update:pagination="pagination = $event"
          @request="onTableRequest"
          flat
          bordered
          binary-state-sort
        >
          <!-- Draggable Headers with Sorting -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                draggable="true"
                @dragstart="onDragStart($event, col)"
                @dragover.prevent
                @drop="onDrop($event, col)"
                @click="col.sortable ? props.sort(col.name) : null"
                class="draggable-header"
                :class="{ 'cursor-pointer': col.sortable, 'sortable': col.sortable }"
              >
                <div class="header-content">
                  <q-icon name="drag_indicator" size="14px" class="drag-icon" />
                  <span class="header-label">{{ col.label }}</span>
                  <q-icon
                    v-if="col.sortable && props.sort && props.colsMap[col.name].sortOrder"
                    :name="props.colsMap[col.name].sortOrder === 'ad' ? 'arrow_upward' : 'arrow_downward'"
                    size="14px"
                    class="sort-icon"
                  />
                </div>
                <q-tooltip
                  anchor="bottom middle"
                  self="top middle"
                  :offset="[0, 10]"
                  class="bg-grey-9 text-body2"
                  max-width="300px"
                >
                  {{ getColumnTooltip(col.name) }}
                </q-tooltip>
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body-cell-stock_status="props">
            <q-td :props="props">
              <q-badge
                :color="getStatusColor(props.value)"
                :label="getStatusLabel(props.value)"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-days_coverage="props">
            <q-td :props="props">
              <span :class="getCoverageClass(props.value)">
                {{ props.value !== null ? props.value : 'N/A' }}
              </span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Column Visibility Dialog -->
    <q-dialog v-model="showColumnDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="view_column" class="q-mr-sm" />
            Configurar Columnas
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-caption text-grey-7 q-mb-md q-mt-md">
            Selecciona las columnas que deseas visualizar en la tabla
          </div>
          <q-list>
            <q-item
              v-for="col in allColumns"
              :key="col.name"
              tag="label"
              clickable
            >
              <q-item-section avatar>
                <q-checkbox
                  v-model="columnVisibility[col.name]"
                  @update:model-value="saveColumnConfig"
                  color="primary"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ col.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cerrar"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Charts Section -->
    <div class="row q-col-gutter-md q-mt-md" v-if="chartData">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="bar_chart" class="q-mr-sm" />
              Top 10 Productos por Ventas
            </div>
          </q-card-section>
          <q-card-section>
            <div ref="chartTopSales" style="height: 300px;"></div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="pie_chart" class="q-mr-sm" />
              Ventas por Categoría
            </div>
          </q-card-section>
          <q-card-section>
            <div ref="chartSalesByCategory" style="height: 300px;"></div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="warning" class="q-mr-sm" />
              Top 10 Productos con Menor Cobertura
            </div>
          </q-card-section>
          <q-card-section>
            <div ref="chartLowCoverage" style="height: 300px;"></div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="inventory_2" class="q-mr-sm" />
              Stock Muerto (Sin Ventas)
            </div>
          </q-card-section>
          <q-card-section>
            <div ref="chartDeadStock" style="height: 300px;"></div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'
import * as echarts from 'echarts'

export default {
  name: 'SalesInventoryReportPage',
  data () {
    return {
      loading: false,
      loadingExport: false,
      showColumnDialog: false,
      draggedColumn: null,
      columnVisibility: {},
      columnOrder: [],
      filters: {
        date_from: this.getDefaultDateFrom(),
        date_to: this.getDefaultDateTo(),
        company_id: null,
        branch_office_id: null,
        category_id: null,
        search: null
      },
      kpis: null,
      products: [],
      chartData: null,
      pagination: {
        page: 1,
        rowsPerPage: 50,
        rowsNumber: 0
      },
      branchOffices: [],
      categories: [],
      allCategories: [],
      allColumns: [
        // Identificación
        {
          name: 'barcode',
          label: 'Código',
          align: 'left',
          field: 'barcode',
          sortable: true,
          required: true
        },
        {
          name: 'name',
          label: 'Nombre',
          align: 'left',
          field: 'name',
          sortable: true,
          required: true
        },
        {
          name: 'category',
          label: 'Categoría',
          align: 'left',
          field: 'category',
          sortable: true,
          required: false
        },
        {
          name: 'branch_office',
          label: 'Sucursal',
          align: 'left',
          field: 'branch_office',
          sortable: true,
          required: false
        },
        // Estado y Rotación (más importante)
        {
          name: 'stock_status',
          label: 'Estado',
          align: 'center',
          field: 'stock_status',
          sortable: true,
          required: true
        },
        {
          name: 'days_coverage',
          label: 'Días Cob.',
          align: 'right',
          field: 'days_coverage',
          sortable: true,
          required: true
        },
        {
          name: 'avg_daily_sales',
          label: 'Prom. Diario',
          align: 'right',
          field: 'avg_daily_sales',
          sortable: true,
          format: val => this.formatNumber(val),
          required: false
        },
        // Stock y Movimientos
        {
          name: 'stock_final',
          label: 'Stock Actual',
          align: 'right',
          field: 'stock_final',
          sortable: true,
          format: val => this.formatNumber(val),
          required: true
        },
        {
          name: 'units_sold',
          label: 'Ventas (Und)',
          align: 'right',
          field: 'units_sold',
          sortable: true,
          format: val => this.formatNumber(val),
          required: false
        },
        {
          name: 'stock_initial',
          label: 'Stock Inicial',
          align: 'right',
          field: 'stock_initial',
          sortable: true,
          format: val => this.formatNumber(val),
          required: false
        },
        {
          name: 'units_purchased',
          label: 'Compras (Und)',
          align: 'right',
          field: 'units_purchased',
          sortable: true,
          format: val => this.formatNumber(val),
          required: false
        },
        // Valores Económicos
        {
          name: 'sales_amount',
          label: 'Ventas $',
          align: 'right',
          field: 'sales_amount',
          sortable: true,
          format: val => '$' + this.formatNumber(val),
          required: true
        },
        {
          name: 'gross_margin',
          label: 'Margen $',
          align: 'right',
          field: 'gross_margin',
          sortable: true,
          format: val => '$' + this.formatNumber(val),
          required: false
        },
        {
          name: 'current_price',
          label: 'Precio',
          align: 'right',
          field: 'current_price',
          sortable: true,
          format: val => '$' + this.formatNumber(val),
          required: false
        },
        {
          name: 'current_cost',
          label: 'Costo',
          align: 'right',
          field: 'current_cost',
          sortable: true,
          format: val => '$' + this.formatNumber(val),
          required: false
        }
      ],
      charts: {
        topSales: null,
        salesByCategory: null,
        lowCoverage: null,
        deadStock: null
      }
    }
  },
  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice']),
    visibleColumns () {
      // Get column order from localStorage or use default
      const order = this.columnOrder.length > 0 ? this.columnOrder : this.allColumns.map(c => c.name)

      // Filter visible columns and sort by order
      return order
        .map(name => this.allColumns.find(c => c.name === name))
        .filter(col => col && this.columnVisibility[col.name])
    }
  },
  mounted () {
    this.filters.company_id = this.userSession.company_session_id
    this.loadTableConfig()
    this.loadBranchOffices()
    this.loadCategories()
    this.loadReport()
  },
  beforeUnmount () {
    // Dispose charts
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.dispose()
      }
    })
  },
  methods: {
    getDefaultDateFrom () {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date.toISOString().split('T')[0]
    },
    getDefaultDateTo () {
      return new Date().toISOString().split('T')[0]
    },
    async loadBranchOffices () {
      try {
        const { data } = await api.get('branch-offices', {
          params: { paginate: false }
        })
        this.branchOffices = Array.isArray(data) ? data : (data.data || [])
      } catch (error) {
        console.error('Error loading branch offices:', error)
      }
    },
    async loadCategories () {
      try {
        const { data } = await api.get('categories', {
          params: { paginate: false }
        })
        this.allCategories = Array.isArray(data) ? data : (data.data || [])
        this.categories = this.allCategories
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    },
    filterCategories (val, update) {
      update(() => {
        if (val === '') {
          this.categories = this.allCategories
        } else {
          const needle = val.toLowerCase()
          this.categories = this.allCategories.filter(
            v => v.name.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    },
    async loadReport () {
      this.loading = true
      try {
        // Load KPIs
        await this.loadKpis()
        
        // Load detailed data
        await this.loadDetailedData()
        
        // Load chart data
        await this.loadChartData()
      } catch (error) {
        notify('Error al cargar el reporte', 'negative', 'error')
        console.error('Error loading report:', error)
      } finally {
        this.loading = false
      }
    },
    async loadKpis () {
      const { data } = await api.get('sales-inventory-report/kpis', {
        params: this.filters
      })
      this.kpis = data
    },
    async loadDetailedData (page = 1) {
      const { data } = await api.get('sales-inventory-report/detailed', {
        params: {
          ...this.filters,
          page: page,
          per_page: this.pagination.rowsPerPage
        }
      })
      this.products = data.data
      this.pagination.page = data.current_page
      this.pagination.rowsNumber = data.total
    },
    async loadChartData () {
      const { data } = await api.get('sales-inventory-report/charts', {
        params: this.filters
      })
      this.chartData = data
      
      // Wait for DOM update
      await nextTick()
      
      // Render charts
      this.renderCharts()
    },
    onTableRequest (props) {
      this.pagination.page = props.pagination.page
      this.pagination.rowsPerPage = props.pagination.rowsPerPage
      this.loadDetailedData(props.pagination.page)
    },
    renderCharts () {
      if (!this.chartData) return

      // Top Sales Chart
      if (this.$refs.chartTopSales) {
        if (this.charts.topSales) {
          this.charts.topSales.dispose()
        }
        this.charts.topSales = echarts.init(this.$refs.chartTopSales)
        this.charts.topSales.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          xAxis: {
            type: 'category',
            data: this.chartData.top_by_sales.map(item => item.name),
            axisLabel: {
              interval: 0,
              rotate: 45
            }
          },
          yAxis: { type: 'value' },
          series: [{
            data: this.chartData.top_by_sales.map(item => item.value),
            type: 'bar',
            itemStyle: { color: '#4CAF50' }
          }]
        })
      }

      // Sales by Category Chart
      if (this.$refs.chartSalesByCategory) {
        if (this.charts.salesByCategory) {
          this.charts.salesByCategory.dispose()
        }
        this.charts.salesByCategory = echarts.init(this.$refs.chartSalesByCategory)
        this.charts.salesByCategory.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{b}: ${c} ({d}%)'
          },
          series: [{
            type: 'pie',
            radius: '50%',
            data: this.chartData.sales_by_category.map(item => ({
              name: item.name,
              value: item.value
            }))
          }]
        })
      }

      // Low Coverage Chart
      if (this.$refs.chartLowCoverage) {
        if (this.charts.lowCoverage) {
          this.charts.lowCoverage.dispose()
        }
        this.charts.lowCoverage = echarts.init(this.$refs.chartLowCoverage)
        this.charts.lowCoverage.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          xAxis: {
            type: 'category',
            data: this.chartData.top_by_low_coverage.map(item => item.name),
            axisLabel: {
              interval: 0,
              rotate: 45
            }
          },
          yAxis: { type: 'value' },
          series: [{
            data: this.chartData.top_by_low_coverage.map(item => item.value),
            type: 'bar',
            itemStyle: { color: '#F44336' }
          }]
        })
      }

      // Dead Stock Chart
      if (this.$refs.chartDeadStock) {
        if (this.charts.deadStock) {
          this.charts.deadStock.dispose()
        }
        this.charts.deadStock = echarts.init(this.$refs.chartDeadStock)
        this.charts.deadStock.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          xAxis: {
            type: 'category',
            data: this.chartData.dead_stock.map(item => item.name),
            axisLabel: {
              interval: 0,
              rotate: 45
            }
          },
          yAxis: { type: 'value' },
          series: [{
            data: this.chartData.dead_stock.map(item => item.value),
            type: 'bar',
            itemStyle: { color: '#FF9800' }
          }]
        })
      }
    },
    async exportExcel () {
      this.loadingExport = true
      try {
        const response = await api.get('sales-inventory-report/export-excel', {
          params: this.filters,
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `reporte-ventas-inventario-${new Date().getTime()}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        notify('Reporte exportado exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify('Error al exportar el reporte', 'negative', 'error')
        console.error('Error exporting Excel:', error)
      } finally {
        this.loadingExport = false
      }
    },
    async exportPdf () {
      this.loadingExport = true
      try {
        const response = await api.get('sales-inventory-report/export-pdf', {
          params: this.filters,
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `reporte-ventas-inventario-${new Date().getTime()}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        notify('Reporte exportado exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify('Error al exportar el reporte', 'negative', 'error')
        console.error('Error exporting PDF:', error)
      } finally {
        this.loadingExport = false
      }
    },
    formatNumber (value) {
      if (value === null || value === undefined) return '0.00'
      return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    getStatusColor (status) {
      const colors = {
        critical: 'negative',
        healthy: 'positive',
        idle: 'warning'
      }
      return colors[status] || 'grey'
    },
    getStatusLabel (status) {
      const labels = {
        critical: 'CRÍTICO',
        healthy: 'SANO',
        idle: 'OCIOSO'
      }
      return labels[status] || status
    },
    getCoverageClass (value) {
      if (value === null) return ''
      if (value < 7) return 'text-negative text-weight-bold'
      if (value > 90) return 'text-warning text-weight-bold'
      return 'text-positive text-weight-bold'
    },
    getColumnTooltip (columnName) {
      const tooltips = {
        barcode: 'Código de barras del producto',
        name: 'Nombre del producto',
        category: 'Categoría a la que pertenece el producto',
        branch_office: 'Sucursal donde se encuentra el stock',
        stock_status: 'Estado del stock basado en días de cobertura:\n• CRÍTICO: Menos de 7 días\n• SANO: Entre 7 y 90 días\n• OCIOSO: Sin ventas o más de 90 días',
        days_coverage: 'Días de cobertura = Stock actual / Promedio diario de ventas.\nIndica cuántos días durará el stock actual al ritmo de ventas del período.',
        avg_daily_sales: 'Promedio de unidades vendidas por día durante el período seleccionado',
        stock_final: 'Stock actual disponible en la sucursal',
        units_sold: 'Total de unidades vendidas durante el período',
        stock_initial: 'Stock estimado al inicio del período (Stock Final - Compras + Ventas)',
        units_purchased: 'Total de unidades compradas durante el período',
        sales_amount: 'Monto total de ventas en $ durante el período',
        gross_margin: 'Margen bruto = Ventas $ - (Unidades vendidas × Costo)',
        current_price: 'Precio de venta actual del producto',
        current_cost: 'Costo unitario actual del producto'
      }
      return tooltips[columnName] || 'Información de la columna'
    },
    // Table Configuration Methods
    loadTableConfig () {
      const savedVisibility = localStorage.getItem('salesInventoryReport_columnVisibility')
      const savedOrder = localStorage.getItem('salesInventoryReport_columnOrder')

      if (savedVisibility) {
        this.columnVisibility = JSON.parse(savedVisibility)
      } else {
        // Default: show all required columns and some important optional ones
        this.columnVisibility = {}
        this.allColumns.forEach(col => {
          this.columnVisibility[col.name] = col.required ||
            ['sales_amount', 'units_sold', 'stock_final', 'days_coverage', 'stock_status'].includes(col.name)
        })
      }

      if (savedOrder) {
        this.columnOrder = JSON.parse(savedOrder)
      } else {
        this.columnOrder = this.allColumns.map(c => c.name)
      }
    },
    saveColumnConfig () {
      localStorage.setItem('salesInventoryReport_columnVisibility', JSON.stringify(this.columnVisibility))
    },
    saveColumnOrder () {
      localStorage.setItem('salesInventoryReport_columnOrder', JSON.stringify(this.columnOrder))
    },
    resetTableConfig () {
      // Reset to default
      this.columnVisibility = {}
      this.allColumns.forEach(col => {
        this.columnVisibility[col.name] = col.required ||
          ['sales_amount', 'units_sold', 'stock_final', 'days_coverage', 'stock_status'].includes(col.name)
      })
      this.columnOrder = this.allColumns.map(c => c.name)

      // Save to localStorage
      this.saveColumnConfig()
      this.saveColumnOrder()

      notify('Configuración de tabla restaurada', 'positive', 'check_circle')
    },
    // Drag and Drop Methods
    onDragStart (event, column) {
      this.draggedColumn = column
      event.dataTransfer.effectAllowed = 'move'
    },
    onDrop (event, targetColumn) {
      if (!this.draggedColumn || this.draggedColumn.name === targetColumn.name) {
        return
      }

      // Get current order
      const currentOrder = this.visibleColumns.map(c => c.name)
      const draggedIndex = currentOrder.indexOf(this.draggedColumn.name)
      const targetIndex = currentOrder.indexOf(targetColumn.name)

      // Reorder
      currentOrder.splice(draggedIndex, 1)
      currentOrder.splice(targetIndex, 0, this.draggedColumn.name)

      // Update columnOrder with all columns (visible and hidden)
      const hiddenColumns = this.allColumns
        .filter(c => !this.columnVisibility[c.name])
        .map(c => c.name)

      this.columnOrder = [...currentOrder, ...hiddenColumns]

      // Save to localStorage
      this.saveColumnOrder()

      this.draggedColumn = null
    }
  }
}
</script>

<style scoped>
.kpi-card {
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Headers compactos y con estilo del tema */
.draggable-header {
  cursor: grab;
  user-select: none;
  transition: all 0.2s ease;
  position: relative;
  padding: 8px 12px !important;
  white-space: nowrap;
  font-weight: 600;
  font-size: 13px;
}

.draggable-header:hover {
  background-color: var(--q-primary) !important;
  color: white !important;
}

.draggable-header:active {
  cursor: grabbing;
  opacity: 0.8;
}

/* Contenido del header */
.header-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.header-label {
  font-size: 13px;
  font-weight: 600;
}

/* Icono de drag */
.drag-icon {
  opacity: 0.4;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.draggable-header:hover .drag-icon {
  opacity: 0.9;
  color: white;
}

.draggable-header:hover .header-label {
  color: white;
}

/* Icono de ordenamiento */
.sort-icon {
  opacity: 0.8;
  margin-left: 2px;
  flex-shrink: 0;
}

.draggable-header:hover .sort-icon {
  color: white;
  opacity: 1;
}

/* Columnas ordenables */
.draggable-header.sortable:hover {
  cursor: pointer;
}

.draggable-header.cursor-pointer {
  user-select: none;
}
</style>
