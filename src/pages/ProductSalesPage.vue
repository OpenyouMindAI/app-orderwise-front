<template>
  <q-page padding>
    <!-- Título de la página -->
    <div class="text-h4 q-mb-md">Reporte de Ventas por Producto</div>

    <!-- Filtros y acciones -->
    <q-card class="q-mb-md filter-card">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-8">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-5">
                <q-input filled v-model="dateRange.from" label="Fecha desde">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="dateRange.from" mask="YYYY-MM-DD" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-5">
                <q-input filled v-model="dateRange.to" label="Fecha hasta">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="dateRange.to" mask="YYYY-MM-DD" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-2 self-end">
                <q-btn
                  color="primary"
                  icon="search"
                  label="Buscar"
                  class="full-width"
                  @click="fetchData"
                  :loading="loading"
                />
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4 text-right">
            <q-btn
              color="secondary"
              icon="file_download"
              label="Exportar"
              class="q-ml-sm"
              @click="exportData"
              :disable="!hasData"
            />
            <q-btn
              color="accent"
              icon="show_chart"
              label="Ver Gráfico"
              class="q-ml-sm"
              @click="showChart = !showChart"
              :disable="!hasData"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- KPI Cards -->
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-if="hasData" key="kpi-section" class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="bg-primary text-white">
            <q-card-section>
              <div class="text-h6">Total Vendido</div>
              <div class="text-h4">{{ formatCurrency(totalSales) }}</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-icon name="shopping_cart" size="md" class="q-mr-sm" />
              <span>Ventas totales en el período</span>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="bg-secondary text-white">
            <q-card-section>
              <div class="text-h6">Total Productos</div>
              <div class="text-h4">{{ totalQuantity }}</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-icon name="inventory_2" size="md" class="q-mr-sm" />
              <span>Unidades vendidas</span>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="bg-accent text-white">
            <q-card-section>
              <div class="text-h6">Ganancia Total</div>
              <div class="text-h4">{{ formatCurrency(totalProfit) }}</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-icon name="trending_up" size="md" class="q-mr-sm" />
              <span>Beneficio neto</span>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="bg-dark text-white">
            <q-card-section>
              <div class="text-h6">Margen Promedio</div>
              <div class="text-h4">{{ averageMargin }}%</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-icon name="analytics" size="md" class="q-mr-sm" />
              <span>Rentabilidad media</span>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </transition-group>

    <!-- Chart Section -->
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <q-card v-if="showChart && hasData" class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Distribución de Ventas por Producto</div>
          <div style="height: 300px" ref="chartContainer"></div>
        </q-card-section>
      </q-card>
    </transition>

    <!-- Data Table -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="products"
          :columns="columns"
          row-key="product_name"
          :loading="loading"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 20, 50, 0]"
          binary-state-sort
          flat
          bordered
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary">
              <q-spinner-dots size="50px" color="primary" />
            </q-inner-loading>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :class="col.align === 'right' ? 'text-right' : ''">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="product_name" :props="props">
                {{ props.row.product_name }}
              </q-td>
              <q-td key="total_quantity" :props="props" class="text-right">
                {{ props.row.total_quantity }}
              </q-td>
              <q-td key="total_sales" :props="props" class="text-right">
                {{ formatCurrency(props.row.total_sales) }}
              </q-td>
              <q-td key="total_cost" :props="props" class="text-right">
                {{ formatCurrency(props.row.total_cost) }}
              </q-td>
              <q-td key="profit" :props="props" class="text-right">
                <div :class="props.row.profit > 0 ? 'text-positive' : 'text-negative'">
                  {{ formatCurrency(props.row.profit) }}
                </div>
                <q-badge :color="props.row.profit > 0 ? 'positive' : 'negative'" class="q-ml-sm">
                  {{ calculateMargin(props.row.profit, props.row.total_sales) }}%
                </q-badge>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:bottom="props">
            <div class="row full-width">
              <div class="col-12 col-md-9">
                <div class="q-table__control">
                  <span class="q-table__bottom-item">
                    <strong>Totales:</strong> {{ props.pagination.rowsNumber }} productos
                  </span>
                  <span class="q-table__bottom-item q-ml-md">
                    <strong>Cantidad:</strong> {{ totalQuantity }}
                  </span>
                  <span class="q-table__bottom-item q-ml-md">
                    <strong>Ventas:</strong> {{ formatCurrency(totalSales) }}
                  </span>
                  <span class="q-table__bottom-item q-ml-md">
                    <strong>Ganancia:</strong> {{ formatCurrency(totalProfit) }}
                  </span>
                </div>
              </div>
              <div class="col-12 col-md-3 text-right">
                <q-pagination
                  v-model="pagination.page"
                  :max="pagesNumber"
                  :max-pages="6"
                  boundary-links
                  direction-links
                  @input="onPageChange"
                />
              </div>
            </div>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-8">
              <q-icon name="sentiment_dissatisfied" size="2em" class="q-mr-sm" />
              No hay datos disponibles. Por favor, seleccione un rango de fechas y haga clic en "Buscar".
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { date } from 'quasar'
import * as echarts from 'echarts'

export default defineComponent({
  name: 'ProductSalesReport',

  setup () {
    // Estado
    const loading = ref(false)
    const products = ref([])
    const dateRange = ref({
      from: date.formatDate(date.subtractFromDate(new Date(), { month: 1 }), 'YYYY-MM-DD'),
      to: date.formatDate(new Date(), 'YYYY-MM-DD')
    })
    const pagination = ref({
      sortBy: 'total_sales',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })
    const showChart = ref(false)
    const chartContainer = ref(null)
    let chart = null

    // Columnas de la tabla
    const columns = [
      {
        name: 'product_name',
        required: true,
        label: 'Producto',
        align: 'left',
        field: row => row.product_name,
        format: val => `${val}`,
        sortable: true
      },
      {
        name: 'total_quantity',
        required: true,
        label: 'Cantidad Vendida',
        align: 'right',
        field: 'total_quantity',
        sortable: true
      },
      {
        name: 'total_sales',
        required: true,
        label: 'Ventas Totales',
        align: 'right',
        field: 'total_sales',
        sortable: true,
        sort: (a, b) => a - b
      },
      {
        name: 'total_cost',
        required: true,
        label: 'Costo Total',
        align: 'right',
        field: 'total_cost',
        sortable: true,
        sort: (a, b) => a - b
      },
      {
        name: 'profit',
        required: true,
        label: 'Ganancia',
        align: 'right',
        field: 'profit',
        sortable: true,
        sort: (a, b) => a - b
      }
    ]

    // Valores calculados
    const hasData = computed(() => products.value.length > 0)

    const totalSales = computed(() => {
      return products.value.reduce((sum, product) => sum + product.total_sales, 0)
    })

    const totalQuantity = computed(() => {
      return products.value.reduce((sum, product) => sum + product.total_quantity, 0)
    })

    const totalProfit = computed(() => {
      return products.value.reduce((sum, product) => sum + product.profit, 0)
    })

    const averageMargin = computed(() => {
      if (totalSales.value === 0) return 0
      return Math.round((totalProfit.value / totalSales.value) * 100)
    })

    const pagesNumber = computed(() => {
      return Math.ceil(pagination.value.rowsNumber / pagination.value.rowsPerPage)
    })

    // Métodos
    const fetchData = async () => {
      loading.value = true
      try {
        // Aquí iría la llamada a la API real
        // const response = await fetch(`/api/sales?from=${dateRange.value.from}&to=${dateRange.value.to}`);
        // const data = await response.json();
        // products.value = data.products;
        // pagination.value.rowsNumber = data.total;

        // Simulación de datos para el ejemplo
        await new Promise(resolve => setTimeout(resolve, 800))
        const mockData = generateMockData()
        products.value = mockData
        pagination.value.rowsNumber = mockData.length

        if (showChart.value) {
          renderChart()
        }
      } catch (error) {
        console.error('Error al obtener datos:', error)
      } finally {
        loading.value = false
      }
    }

    const onPageChange = () => {
      // En una implementación real, aquí se haría una nueva llamada a la API
      // con los parámetros de paginación actualizados
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(value)
    }

    const calculateMargin = (profit, sales) => {
      if (sales === 0) return 0
      return Math.round((profit / sales) * 100)
    }

    const exportData = () => {
      // Aquí iría la lógica para exportar a Excel o PDF
      // Por ejemplo, usando una librería como xlsx o jspdf
      alert('Función de exportación: implementación pendiente')
    }

    const renderChart = () => {
      if (!chartContainer.value) return

      if (!chart) {
        chart = echarts.init(chartContainer.value)
      }

      const chartData = products.value
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 10)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            const data = params[0]
            return `${data.name}<br/>
                    Ventas: ${formatCurrency(data.value)}<br/>
                    Cantidad: ${products.value.find(p => p.product_name === data.name).total_quantity}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.map(item => item.product_name),
          axisLabel: {
            rotate: 45,
            interval: 0,
            textStyle: {
              fontSize: 10
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: value => formatCurrency(value).replace('ARS', '')
          }
        },
        series: [
          {
            name: 'Ventas',
            type: 'bar',
            data: chartData.map(item => item.total_sales),
            itemStyle: {
              color: function (params) {
                // Colores degradados según el valor
                const colorList = [
                  '#5470c6', '#91cc75', '#fac858', '#ee6666',
                  '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
                ]
                return colorList[params.dataIndex % colorList.length]
              }
            },
            label: {
              show: true,
              position: 'top',
              formatter: function (params) {
                return formatCurrency(params.value).replace('ARS', '')
              }
            }
          }
        ]
      }

      chart.setOption(option)

      // Responsive chart
      window.addEventListener('resize', () => {
        if (chart) {
          chart.resize()
        }
      })
    }

    // Datos de ejemplo para la demostración
    const generateMockData = () => {
      const products = [
        'Smartphone Galaxy S23', 'Laptop Lenovo ThinkPad', 'Monitor LG 27"',
        'Teclado Mecánico Redragon', 'Mouse Logitech G502', 'Auriculares Sony WH-1000XM4',
        'Tablet iPad Pro', 'Impresora HP LaserJet', 'Disco SSD Samsung 1TB',
        'Cámara Canon EOS', 'Parlante JBL Charge 5', 'Router TP-Link Archer',
        'Smartwatch Apple Watch', 'Consola PlayStation 5', 'TV Samsung 55"'
      ]

      return products.map(name => {
        const quantity = Math.floor(Math.random() * 100) + 1
        const unitPrice = Math.floor(Math.random() * 100000) + 10000
        const unitCost = unitPrice * (Math.random() * 0.6 + 0.2) // Entre 20% y 80% del precio

        const totalSales = quantity * unitPrice
        const totalCost = quantity * unitCost
        const profit = totalSales - totalCost

        return {
          product_name: name,
          total_quantity: quantity,
          total_sales: totalSales,
          total_cost: totalCost,
          profit
        }
      })
    }

    // Ciclo de vida
    onMounted(() => {
      fetchData()
    })

    watch(showChart, (newVal) => {
      if (newVal && hasData.value) {
        // Dar tiempo al DOM para renderizar el contenedor
        setTimeout(() => {
          renderChart()
        }, 100)
      }
    })

    return {
      loading,
      products,
      dateRange,
      columns,
      pagination,
      showChart,
      chartContainer,
      hasData,
      totalSales,
      totalQuantity,
      totalProfit,
      averageMargin,
      pagesNumber,
      fetchData,
      onPageChange,
      formatCurrency,
      calculateMargin,
      exportData
    }
  }
})
</script>

<style scoped>
.filter-card {
  background-color: #f5f5f5;
}

/* Animaciones */
.animated {
  animation-duration: 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}

/* Responsive */
@media (max-width: 599px) {
  .q-table__bottom-item {
    display: block;
    margin-bottom: 8px;
  }
}
</style>
