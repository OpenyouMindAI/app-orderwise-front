<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12 text-h6">
        Dashboard de Ventas
      </div>
      <div class="col-12">
        <ChartComponent id="sales" :options="chartOptions">
          <template v-slot:top>
            <div class="text-subtitle2">
              Ventas por periodo
            </div>
          </template>
        </ChartComponent>
      </div>
    </div>
  </q-page>
</template>

<script setup>

import ChartComponent from 'src/components/ChartComponent.vue'
import { ref } from 'vue'
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

</script>
