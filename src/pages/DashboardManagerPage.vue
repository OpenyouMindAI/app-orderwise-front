<template>
  <q-page padding>
    <!-- Filtros -->
    <div class="q-mb-lg">
      <q-card flat bordered class="filter-card">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-md-4 col-sm-6 col-xs-12">
              <q-select
                v-model="filters.selectedCompany"
                :options="companyOptions"
                label="Seleccionar empresa"
                dense
                outlined
                clearable
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                @filter="filterCompanies"
                class="company-select"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No se encontraron resultados
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:prepend>
                  <q-icon name="business" />
                </template>
              </q-select>
            </div>
            <div class="col-md-8 col-sm-6 col-xs-12">
              <div class="row q-col-gutter-sm">
                <div class="col">
                  <q-input v-model="filters.dateRange.from" label="Desde" dense outlined type="date" class="date-input" />
                </div>
                <div class="col">
                  <q-input v-model="filters.dateRange.to" label="Hasta" dense outlined type="date" class="date-input" />
                </div>
                <div class="col-auto self-end">
                  <q-btn color="primary" label="Filtrar" icon="filter_alt" @click="applyFilters" class="filter-btn" />
                </div>
                <div class="col-auto self-end">
                  <q-btn outline color="grey" label="Limpiar" icon="clear" @click="clearFilters" class="filter-btn" />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Tarjetas de resumen -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="bg-primary text-white dashboard-card">
          <q-card-section>
            <div class="text-h6">Total Empresas</div>
            <div class="text-h6">{{ dashboardData.cards.total_companies }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="business" size="2rem" class="absolute-bottom-right q-mr-md q-mb-md opacity-50" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="bg-secondary text-white dashboard-card">
          <q-card-section>
            <div class="text-h6">Total Facturas</div>
            <div class="text-h6">{{ formatNumber(dashboardData.cards.total_invoices) }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="receipt" size="2rem" class="absolute-bottom-right q-mr-md q-mb-md opacity-50" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="bg-positive text-white dashboard-card">
          <q-card-section>
            <div class="text-h6">Total Facturado</div>
            <div class="text-h6">{{ formatCurrency(dashboardData.cards.total_revenue) }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="payments" size="2rem" class="absolute-bottom-right q-mr-md q-mb-md opacity-50" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="bg-accent text-white dashboard-card">
          <q-card-section>
            <div class="text-h6">Productos Vendidos</div>
            <div class="text-h6">{{ formatNumber(dashboardData.cards.products_sold) }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="inventory_2" size="2rem" class="absolute-bottom-right q-mr-md q-mb-md opacity-50" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficas -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-md-8 col-sm-12">
        <q-card class="chart-card">
          <q-card-section>
            <div class="text-h6">Facturación Mensual</div>
            <div class="text-subtitle2 text-grey">Evolución de ingresos en el tiempo</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <div style="height: 300px" ref="monthlyRevenueChart"></div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-md-4 col-sm-12">
        <q-card class="chart-card">
          <q-card-section>
            <div class="text-h6">Empresas que más facturaron</div>
            <div class="text-subtitle2 text-grey">Top empresas por ingresos</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <div style="height: 300px" ref="topCompaniesChart"></div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card class="chart-card">
          <q-card-section>
            <div class="text-h6">Productos más vendidos</div>
            <div class="text-subtitle2 text-grey">Top productos por cantidad</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <div style="height: 300px" ref="topProductsChart"></div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de empresas -->
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card class="table-card">
          <q-card-section>
            <div class="text-h6">Resumen de Empresas</div>
            <div class="text-subtitle2 text-grey">Actividad por empresa</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <q-table
              :rows="filteredCompanies"
              :columns="companiesColumns"
              row-key="id"
              :pagination="pagination"
              binary-state-sort
              class="modern-table"
            >
              <template v-slot:body-cell-name="props">
                <q-td :props="props">
                  <div class="row items-center">
                    <q-avatar color="primary" text-color="white" size="28px" class="q-mr-sm">
                      {{ props.value.charAt(0) }}
                    </q-avatar>
                    <div>{{ props.value }}</div>
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-invoices_count="props">
                <q-td :props="props">
                  <q-badge color="secondary" text-color="white" rounded>
                    {{ props.value }}
                  </q-badge>
                </q-td>
              </template>
              <template v-slot:body-cell-total_invoiced="props">
                <q-td :props="props">
                  <div class="text-positive font-weight-bold">
                    {{ formatCurrency(props.value) }}
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-last_invoice_at="props">
                <q-td :props="props">
                  <q-chip outline color="grey" size="sm" class="date-chip">
                    {{ formatDate(props.value) }}
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <q-drawer v-model="leftDrawerOpen" bordered class="rounded-drawer">
      <q-list>
        <q-item-label header>Menú Principal</q-item-label>
        <q-item clickable v-ripple class="q-my-sm">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable v-ripple class="q-my-sm">
          <q-item-section avatar>
            <q-icon name="business" />
          </q-item-section>
          <q-item-section>Empresas</q-item-section>
        </q-item>
        <q-item clickable v-ripple class="q-my-sm">
          <q-item-section avatar>
            <q-icon name="receipt" />
          </q-item-section>
          <q-item-section>Facturas</q-item-section>
        </q-item>
        <q-item clickable v-ripple class="q-my-sm">
          <q-item-section avatar>
            <q-icon name="inventory_2" />
          </q-item-section>
          <q-item-section>Productos</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue'
import { date } from 'quasar'
import Highcharts from 'highcharts'
import { api } from 'src/boot/axios'
import { loading } from '../const/mixins'

export default defineComponent({
  name: 'AdminDashboard',

  setup () {
    const leftDrawerOpen = ref(false)

    // Referencias para los gráficos
    const monthlyRevenueChart = ref(null)
    const topCompaniesChart = ref(null)
    const topProductsChart = ref(null)

    // Datos del dashboard
    const dashboardData = ref({
      cards: {
        total_companies: 0,
        total_invoices: 0,
        total_revenue: 0,
        products_sold: 0
      },
      charts: {
        monthly_revenue: [],
        top_companies: [],
        top_products: []
      },
      companies_summary: []
    })

    // Filtros
    const filters = ref({
      selectedCompany: null,
      dateRange: {
        from: '',
        to: ''
      }
    })

    // Opciones para el select de empresas
    const companyOptions = ref([])

    // Configuración de la tabla
    const pagination = ref({
      sortBy: 'total_invoiced',
      descending: true,
      page: 1,
      rowsPerPage: 10
    })

    const companiesColumns = [
      { name: 'name', label: 'Empresa', field: 'name', sortable: true, align: 'left' },
      { name: 'invoices_count', label: 'Facturas', field: 'invoices_count', sortable: true, align: 'center' },
      { name: 'total_invoiced', label: 'Total Facturado', field: 'total_invoiced', sortable: true, align: 'right' },
      { name: 'last_invoice_at', label: 'Última Factura', field: 'last_invoice_at', sortable: true, align: 'center' }
    ]

    // Empresas filtradas
    const filteredCompanies = computed(() => {
      if (!filters.value.selectedCompany) {
        return dashboardData.value.companies_summary
      }

      return dashboardData.value.companies_summary.filter(company =>
        company.id === filters.value.selectedCompany.value
      )
    })

    // Métodos
    const fetchDashboardData = async () => {
      loading(true)
      try {
        const { data } = await api.get('admin/dashboard', {
          params: {
            company_id: filters.value?.selectedCompany?.value,
            start_date: filters.value?.dateRange?.from,
            end_date: filters.value?.dateRange?.to
          }
        })

        dashboardData.value = data

        companyOptions.value = data.companies_summary.map(company => ({
          label: company.name,
          value: company.id
        }))

        nextTick(() => {
          renderCharts()
        })
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error)
      } finally {
        loading(false)
      }
    }

    const renderCharts = () => {
      renderMonthlyRevenueChart()
      renderTopCompaniesChart()
      renderTopProductsChart()
    }

    const renderMonthlyRevenueChart = () => {
      const monthlyData = dashboardData.value.charts.monthly_revenue
      const categories = monthlyData.map(item => {
        const [year, month] = item.month.split('-')
        return `${getMonthName(month)} ${year}`
      })
      const data = monthlyData.map(item => Number(item.total))

      Highcharts.chart(monthlyRevenueChart.value, {
        chart: {
          type: 'column',
          borderRadius: 10,
          style: {
            fontFamily: 'Roboto, sans-serif'
          }
        },
        title: {
          text: null
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories,
          crosshair: true
        },
        yAxis: {
          title: {
            text: 'Facturación ($)'
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>$' + '{point.y:,.2f}</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            borderRadius: 5
          }
        },
        series: [{
          name: 'Facturación',
          data,
          color: '#1976D2'
        }]
      })
    }

    const renderTopCompaniesChart = () => {
      const topCompaniesData = dashboardData.value.charts.top_companies
      const data = topCompaniesData.map(item => ({
        name: item.name,
        y: Number(item.total)
      }))

      Highcharts.chart(topCompaniesChart.value, {
        chart: {
          type: 'pie',
          borderRadius: 10,
          style: {
            fontFamily: 'Roboto, sans-serif'
          }
        },
        title: {
          text: null
        },
        credits: {
          enabled: false
        },
        tooltip: {
          pointFormat: '{series.name}: <b>$$ {point.y:,.2f}</b>'
        },
        accessibility: {
          point: {
            valueSuffix: '%'
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %'
            },
            showInLegend: true,
            borderRadius: 5
          }
        },
        colors: ['#1976D2', '#26A69A', '#9C27B0', '#FF9800', '#F44336'],
        series: [{
          name: 'Facturación',
          colorByPoint: true,
          data
        }]
      })
    }

    const renderTopProductsChart = () => {
      const topProductsData = dashboardData.value.charts.top_products
      const categories = topProductsData.map(item => item.name)
      const data = topProductsData.map(item => Number(item.total_quantity))

      Highcharts.chart(topProductsChart.value, {
        chart: {
          type: 'bar',
          borderRadius: 10,
          style: {
            fontFamily: 'Roboto, sans-serif'
          }
        },
        title: {
          text: null
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories,
          title: {
            text: null
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Cantidad vendida',
            align: 'high'
          }
        },
        tooltip: {
          valueSuffix: ' unidades'
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true
            },
            borderRadius: 5,
            colorByPoint: true
          }
        },
        colors: ['#26A69A', '#1976D2', '#9C27B0', '#FF9800', '#F44336'],
        legend: {
          enabled: false
        },
        series: [{
          name: 'Cantidad',
          data
        }]
      })
    }

    const getMonthName = (month) => {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
      return months[parseInt(month) - 1]
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      }).format(value)
    }

    const formatNumber = (value) => {
      return new Intl.NumberFormat('es-AR').format(value)
    }

    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'DD/MM/YYYY HH:mm')
    }

    const filterCompanies = (val, update) => {
      if (val === '') {
        update(() => {
          companyOptions.value = dashboardData.value.companies_summary.map(company => ({
            label: company.name,
            value: company.id
          }))
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        companyOptions.value = dashboardData.value.companies_summary
          .filter(company => company.name.toLowerCase().indexOf(needle) > -1)
          .map(company => ({
            label: company.name,
            value: company.id
          }))
      })
    }

    const applyFilters = () => {
      fetchDashboardData()
    }

    const clearFilters = () => {
      filters.value = {
        selectedCompany: null,
        dateRange: {
          from: '',
          to: ''
        }
      }
    }

    const viewCompany = (company) => {
      console.log('Ver detalles de empresa:', company)
    }

    const editCompany = (company) => {
      console.log('Editar empresa:', company)
    }

    // Cargar datos al montar el componente
    onMounted(() => {
      fetchDashboardData()
    })

    return {
      leftDrawerOpen,
      dashboardData,
      filters,
      companyOptions,
      pagination,
      companiesColumns,
      filteredCompanies,
      monthlyRevenueChart,
      topCompaniesChart,
      topProductsChart,
      formatCurrency,
      formatNumber,
      formatDate,
      filterCompanies,
      applyFilters,
      clearFilters,
      viewCompany,
      editCompany
    }
  }
})
</script>

<style>
/* Estilos generales */
body {
  font-family: 'Roboto', sans-serif;
}

/* Estilos para tarjetas */
.dashboard-card {
  border-radius: 16px !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.chart-card, .table-card, .filter-card {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.chart-card:hover, .table-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Estilos para inputs y botones */
.company-select, .date-input {
  border-radius: 8px;
}

.filter-btn {
  border-radius: 8px;
  font-weight: 500;
}

/* Estilos para la tabla */
.modern-table {
  border-radius: 16px;
}

.modern-table .q-table__top,
.modern-table .q-table__bottom,
.modern-table thead tr:first-child th {
  background-color: #f8f9fa;
}

.modern-table thead tr th {
  font-weight: 600;
  color: #495057;
}

.modern-table tbody tr:hover {
  background-color: #f1f5f9 !important;
}

.date-chip {
  border-radius: 16px;
  font-size: 0.8rem;
}

/* Estilos para el drawer */
.rounded-drawer {
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

.rounded-bottom-borders {
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

/* Estilos para los gráficos de Highcharts */
.highcharts-container {
  border-radius: 16px;
}

.highcharts-background {
  fill: transparent;
}
</style>
