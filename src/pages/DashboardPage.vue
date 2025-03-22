<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <div class="flex justify-between items-center">
          <span class="text-subtitle1">
            Dashboard de ventas
          </span>
          <q-btn size="sm" icon="filter_alt" color="primary" @click="dialogFilter = true" round/>
        </div>
        <hr/>
      </div>
      <div class="col-8">
        <ChartComponent id="sales" :options="chartOptions">
          <template v-slot:top>
            <div class="text-subtitle2">
              Ventas por periodo
            </div>
          </template>
        </ChartComponent>
      </div>
      <div class="col-4">
        <ChartComponent id="payments" :options="chatCategoryOptions">
          <template v-slot:top>
            <div class="text-subtitle2">
              Distribución por tipo de pagos
            </div>
          </template>
        </ChartComponent>
      </div>
      <div class="col-8">
        <ChartComponent id="products" :options="chartProductOptions">
          <template v-slot:top>
            <div class="text-subtitle2">
              Ranking de productos más vendidos
            </div>
          </template>
        </ChartComponent>
      </div>
      <div class="col-4">
        <ChartComponent id="category" :options="chatCategoryOptions">
          <template v-slot:top>
            <div class="text-subtitle2">
              Distribución por categoría
            </div>
          </template>
        </ChartComponent>
      </div>
    </div>
    <q-dialog
      v-model="dialogFilter"
      position="right"
      seamless
      full-height
    >
      <q-card class="column full-height" style="width: 500px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white flex justify-between items-center">
          <div class="text-h6">Filtros</div>
          <q-btn icon="close" flat round dense @click="dialogFilter = false" />
        </q-card-section>

        <q-card-section class="col q-pt-sm q-gutter-md">
          <q-select
            use-input
            filled
            label="Vendedor"
            input-debounce="0"
            option-value="id"
            v-model="filter.seller"
            :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
            :options="sellers"
            clearable
            :readonly="!validate"
            @filter="filterSellers"
          />
          <q-option-group
            v-model="panel"
            inline
            :options="[
              { label: 'Dia', value: 'day' },
              { label: 'Entre fechas', value: 'between' }
            ]"
          />
          <q-tab-panels v-model="panel" animated class="shadow-2 rounded-borders">
            <q-tab-panel name="between" class="q-gutter-sm">
              <div class="text-h6">Filtrar entre fechas</div>
              <q-input filled v-model="filter.from" hint="Desde" type="date"/>
              <q-input filled v-model="filter.to" hint="Hasta" type="date"/>
            </q-tab-panel>
            <q-tab-panel name="day" class="q-gutter-sm">
              <div class="text-h6">Filtrar por dia y horas</div>
              <q-input filled v-model="filter.day" hint="Fecha del dia" type="date"/>
              <q-input filled v-model="filter.fromHours" hint="Desde" type="time"/>
              <q-input filled v-model="filter.toHours" hint="Hasta" type="time"/>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="negative" icon="filter_alt_off" @click="clearFilter" label="Limpiar" />
          <q-btn color="primary" icon="filter_alt" @click="filterDate" label="Filtrar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>

import ChartComponent from 'src/components/ChartComponent.vue'
import Highcharts from 'highcharts'

import { ref } from 'vue'

import { date } from 'quasar'

const dialogFilter = ref(false)

const validate = ref(null)
const panel = ref('day')
const filter = ref({})
const sellers = ref([])

const salesData = {
  day: [
    { name: 'Lun', data: 120 },
    { name: 'Mar', data: 140 },
    { name: 'Mié', data: 110 },
    { name: 'Jue', data: 160 },
    { name: 'Vie', data: 190 },
    { name: 'Sáb', data: 210 },
    { name: 'Dom', data: 150 }
  ],
  week: [
    { name: 'Semana 1', data: 980 },
    { name: 'Semana 2', data: 1200 },
    { name: 'Semana 3', data: 1100 },
    { name: 'Semana 4', data: 1400 }
  ],
  month: [
    { name: 'Ene', data: 4500 },
    { name: 'Feb', data: 5200 },
    { name: 'Mar', data: 4800 },
    { name: 'Abr', data: 5100 },
    { name: 'May', data: 5800 },
    { name: 'Jun', data: 6200 },
    { name: 'Jul', data: 5900 },
    { name: 'Ago', data: 6100 },
    { name: 'Sep', data: 6500 },
    { name: 'Oct', data: 7000 },
    { name: 'Nov', data: 7500 },
    { name: 'Dic', data: 8200 }
  ]
}

const timeRange = 'week'
const data = salesData[timeRange]
const categories = data.map((item) => item.name)
const values = data.map((item) => item.data)
/**
     * Clear filter
     */
const clearFilter = () => {
  filter.value.fromHours = null
  filter.value.toHours = null
  filter.value.seller = null
  filter.value.day = date.formatDate(Date(), 'YYYY-MM-DD')
  filter.value.from = date.formatDate(Date(), 'YYYY-MM-DD')
  filter.value.to = date.formatDate(Date(), 'YYYY-MM-DD')
  panel.value = 'day'
  filterDate()
}

const chartOptions = ref({
  chart: {
    type: 'column',
    height: 300
  },
  title: {
    text: undefined
  },
  xAxis: {
    categories,
    crosshair: true
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Ventas ($)'
    }
  },
  tooltip: {
    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
    pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>$' + '{point.y:.1f}</b></td></tr>',
    footerFormat: '</table>',
    shared: true,
    useHTML: true
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0
    }
  },
  series: [
    {
      name: 'Ventas',
      type: 'column',
      data: values,
      color: '#3b82f6'
    },
    {
      name: 'Tendencia',
      type: 'line',
      data: values,
      color: '#ef4444',
      marker: {
        lineWidth: 2,
        lineColor: '#ef4444',
        fillColor: 'white'
      }
    }
  ],
  credits: {
    enabled: false
  }
})

const topProductsData = ref([
  { name: 'Smartphone XYZ', y: 450 },
  { name: 'Laptop Pro', y: 380 },
  { name: 'Auriculares Bluetooth', y: 350 },
  { name: 'Zapatillas Running', y: 310 },
  { name: 'Smart TV 55', y: 290 },
  { name: 'Cafetera Automática', y: 270 },
  { name: 'Tablet Ultra', y: 250 },
  { name: 'Reloj Inteligente', y: 230 },
  { name: 'Cámara Digital', y: 210 },
  { name: 'Altavoz Portátil', y: 190 }
])

const categoryData = ref([
  { name: 'Electrónicos', y: 35 },
  { name: 'Ropa', y: 25 },
  { name: 'Hogar', y: 15 },
  { name: 'Deportes', y: 10 },
  { name: 'Alimentos', y: 15 }
])

const chartProductOptions = ref({
  chart: {
    type: 'bar',
    height: 300
  },
  title: {
    text: undefined
  },
  xAxis: {
    categories: topProductsData.value.map((item) => item.name),
    title: {
      text: null
    }
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Unidades vendidas',
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
      colorByPoint: true,
      colors: topProductsData.value.map((_, i) => {
        const ratio = i / (topProductsData.value.length - 1)
        return Highcharts.color('#3b82f6')
          .brighten((ratio - 0.5) * 0.8)
          .get()
      })
    }
  },
  legend: {
    enabled: false
  },
  credits: {
    enabled: false
  },
  series: [
    {
      name: 'Ventas',
      type: 'bar',
      data: topProductsData.value.map((item) => item.y)
    }
  ]
})

const chatCategoryOptions = ref({
  chart: {
    type: 'pie',
    height: 300
  },
  title: {
    text: undefined
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
      }
    }
  },
  series: [
    {
      name: 'Categorías',
      type: 'pie',
      colorByPoint: true,
      data: categoryData
    }
  ],
  credits: {
    enabled: false
  }
})

const filterDate = () => {}

const filterSellers = () => {}

</script>
