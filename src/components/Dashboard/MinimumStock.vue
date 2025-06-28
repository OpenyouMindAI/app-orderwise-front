<template>
  <q-card class="low-stock-dashboard q-mb-md">
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="col-12 col-sm-6">
          <div class="text-h6 text-weight-bold">
            <q-icon name="warning" color="negative" size="sm" class="q-mr-xs" />
            Productos con Bajo Stock
          </div>
          <div class="text-caption text-grey">
            Visualización de productos que requieren reposición
          </div>
        </div>
      </div>
      <q-table
        :rows="products"
        :columns="columns"
        row-key="product_id"
        :pagination="{ rowsPerPage: 5 }"
        :loading="loading"
        flat
        bordered
        class="low-stock-table"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="product_name" :props="props">
              {{ props.row.product_name }}
            </q-td>
            <q-td key="branch_office_name" :props="props">
              {{ props.row.branch_office_name }}
            </q-td>
            <q-td key="stock_quantity" :props="props" class="text-center">
              {{ props.row.stock_quantity }}
            </q-td>
            <q-td key="min_stock" :props="props" class="text-center">
              {{ props.row.min_stock }}
            </q-td>
            <q-td key="status" :props="props" class="text-center">
              <q-badge
                :color="getStatusColor(props.row)"
                :label="getStockPercentage(props.row) + '%'"
                class="q-px-sm"
              />
              <q-tooltip>
                {{ getStatusText(props.row) }}
              </q-tooltip>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-8">
            <q-icon name="check_circle" size="md" class="q-mr-sm" />
            No hay productos con bajo stock
          </div>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
      <div class="q-mt-md">
        <div class="text-h6 q-mb-sm">Nivel de stock por producto</div>
        <div id="stockChart" style="height: 500px"></div>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        flat
        color="primary"
        label="Ver todos los productos"
        @click="$router.push({ name: 'Product' })"
      />
      <q-btn
        color="negative"
        label="Generar orden de compra"
        icon="add_shopping_cart"
        @click="$router.push({ name: 'NewPurchase' })"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import Highcharts from 'highcharts'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'

export default {
  name: 'LowStockDashboard',

  setup () {
    const store = authentication()

    watch(() => store.branchOffice, () => {
      fetchData()
    })
    /**
     * Loading state
     * @type {Boolean}
     */
    const loading = ref(false)
    /**
     * List of products
     * @type {Array}
     */
    const products = ref([])
    /**
     * Columns of table
     * @type {Array}
     */
    const columns = [
      { name: 'product_name', align: 'left', label: 'Producto', field: 'product_name', sortable: true },
      { name: 'stock_quantity', align: 'center', label: 'Stock actual', field: 'stock_quantity', sortable: true },
      { name: 'min_stock', align: 'center', label: 'Stock mínimo', field: 'min_stock', sortable: true },
      { name: 'status', align: 'center', label: 'Estado', field: row => getStockPercentage(row), sortable: true }
    ]
    /**
     * Calculate percentage of stock respect to minimum
     * @param {Object} product product
     * @returns {Number} percentage
     */
    const getStockPercentage = (product) => {
      if (product.stock_quantity < 0) return 0
      const percentage = Math.round((product.stock_quantity / product.min_stock) * 100)
      return percentage
    }
    /**
     * Determine color by status
     * @param {Object} product product
     * @returns {String} color
     */
    const getStatusColor = (product) => {
      const percentage = getStockPercentage(product)
      if (percentage <= 30) return 'negative'
      if (percentage <= 60) return 'warning'
      return 'positive'
    }

    /**
     * Text description of status
     * @param {Object} product product
     * @returns {String} text
     */
    const getStatusText = (product) => {
      const percentage = getStockPercentage(product)
      if (percentage <= 30) return 'Stock crítico'
      if (percentage <= 60) return 'Stock bajo'
      return 'Stock adecuado'
    }

    /**
     * Load data from API
     */
    const fetchData = async () => {
      loading.value = true
      try {
        const { data } = await api.get('kardex/minimum-stock', {
          params: {
            branch_office_id: store.branchOffice?.id
          }
        })
        products.value = data.sort((a, b) => getStockPercentage(a) - getStockPercentage(b))
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        loading.value = false
      }
    }
    /**
     * Initialize chart
     */
    const initChart = () => {
      const chartData = products.value.map(product => ({
        name: product.product_name,
        y: getStockPercentage(product),
        color: getChartColor(getStockPercentage(product))
      }))

      Highcharts.chart('stockChart', {
        chart: {
          type: 'bar'
        },
        title: {
          text: null
        },
        xAxis: {
          categories: chartData.map(item => item.name),
          title: {
            text: null
          }
        },
        yAxis: {
          min: 0,
          max: 100,
          title: {
            text: 'Porcentaje de stock',
            align: 'high'
          },
          labels: {
            overflow: 'justify',
            format: '{value}%'
          },
          plotLines: [{
            value: 30,
            color: '#FF4C4C',
            dashStyle: 'dash',
            width: 2,
            label: {
              text: 'Crítico',
              align: 'right',
              style: {
                color: '#FF4C4C'
              }
            }
          }, {
            value: 60,
            color: '#FFC107',
            dashStyle: 'dash',
            width: 2,
            label: {
              text: 'Bajo',
              align: 'right',
              style: {
                color: '#FFC107'
              }
            }
          }]
        },
        tooltip: {
          valueSuffix: '%',
          formatter: function () {
            return `<b>${this.x}</b><br/>
                    Stock actual: ${getProductByName(this.x).stock_quantity}<br/>
                    Stock mínimo: ${getProductByName(this.x).min_stock}<br/>
                    Porcentaje: ${this.y}%`
          }
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              format: '{y}%'
            }
          }
        },
        legend: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'Stock',
          data: chartData
        }]
      })
    }

    /**
     * Get product by name (for tooltip chart)
     * @param {String} name name product
     * @returns {Object} product
     */
    const getProductByName = (name) => {
      return products.value.find(p => p.product_name === name)
    }

    /**
     * Get color chart by percentage
     * @param {Number} percentage percentage
     * @returns {String} color
     */
    const getChartColor = (percentage) => {
      if (percentage <= 30) return '#FF4C4C' // Rojo
      if (percentage <= 60) return '#FFC107' // Amarillo
      return '#4CAF50' // Verde
    }

    onMounted(async () => {
      await fetchData()
      initChart()
    })

    return {
      loading,
      products,
      columns,
      getStockPercentage,
      getStatusColor,
      getStatusText
    }
  }
}
</script>

<style>
.low-stock-dashboard {
  border-radius: 8px;
  overflow: hidden;
}

.low-stock-table {
  border-radius: 4px;
}

/* Estilos para modo oscuro */
.body--dark .low-stock-dashboard {
  background-color: #1e1e1e;
}

.body--dark .low-stock-table {
  background-color: #2d2d2d;
}

/* Animación para destacar productos críticos */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.q-table tr:has(.q-badge[color="negative"]) {
  animation: pulse 2s infinite;
  background-color: rgba(255, 76, 76, 0.05);
}

/* Estilos específicos para productos con stock negativo */
.negative-stock-row {
  background-color: rgba(193, 0, 21, 0.08) !important;
  animation: pulse 1.5s infinite !important;
  font-weight: 500;
}

.body--dark .negative-stock-row {
  background-color: rgba(193, 0, 21, 0.15) !important;
}
</style>
