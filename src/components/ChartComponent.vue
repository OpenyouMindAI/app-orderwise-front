<template>
  <q-card class="full-width">
    <q-card-actions align="right" class="q-pt-xs">
      <slot name="top"></slot>
      <q-btn icon="fullscreen" color="primary" @click="toggleFullscreen"/>
    </q-card-actions>
    <q-card-section class="q-pa-xs q-px-none">
      <div
        :id="id"
        ref="chart"
        :style="styleGraph"
        :class="$q.dark.isActive ? 'highcharts-dark' : 'highcharts-light'">
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import Highcharts from 'highcharts'
// import HighchartsFullscreen from 'highcharts/modules/full-screen'
import { nextTick, onMounted, ref, watch } from 'vue'

// HighchartsFullscreen(Highcharts)

defineOptions({
  name: 'ChartComponent'
})

const props = defineProps({
  options: {
    type: Object,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  styleGraph: {
    type: String,
    required: false,
    default: ''
  }
})

const chart = ref(null)

watch(() => props.options, () => {
  setTimeout(() => {
    initChart()
  }, 100)
})

onMounted(() => {
  setTimeout(() => {
    initChart()
  }, 100)
})

function initChart () {
  chart.value = Highcharts.chart(props.id, props.options)
}

function toggleFullscreen () {
  nextTick(() => {
    chart.value?.fullscreen?.open()
  })
}
</script>

<style lang="sass">
@import "https://code.highcharts.com/css/highcharts.css"

.container
  height: 600px
  width: 100%
  margin: 0 auto

.br
  margin-top: 10px !important

// Link the series colors to axis colors
.highcharts-color-0
  fill: #139d4e
  stroke: #139d4e

.highcharts-axis.highcharts-color-0
  .highcharts-axis-line
    stroke: #139d4e

.highcharts-axis.highcharts-color-0
  text
    fill: #139d4e

.highcharts-color-1
  fill: #b10c18
  stroke: #b10c18

.highcharts-axis.highcharts-color-1
  .highcharts-axis-line
    stroke: #b10c18

.highcharts-axis.highcharts-color-1
  text
    fill: #b10c18

.highcharts-color-2
  fill: #2196F3
  stroke: #2196F3

.highcharts-axis.highcharts-color-2
  .highcharts-axis-line
    stroke: #2196F3

.highcharts-axis.highcharts-color-2
  text
    fill: #2196F3

.highcharts-yaxis
  .highcharts-axis-line
    stroke-width: 2px

.highcharts-figure,
.highcharts-data-table table
    min-width: 320px
    max-width: 800px
    margin: 1em auto

.highcharts-data-table table
    font-family: Verdana, sans-serif
    border-collapse: collapse
    border: 1px solid #ebebeb
    margin: 10px auto
    text-align: center
    width: 100%
    max-width: 500px

.highcharts-data-table caption
    padding: 1em 0
    font-size: 1.2em
    color: #555

.highcharts-data-table th
    font-weight: 600
    padding: 0.5em

.highcharts-data-table td,
.highcharts-data-table th,
.highcharts-data-table caption
    padding: 0.5em
.highcharts-data-table thead tr,
.highcharts-data-table tr:nth-child(even)
    background: #f8f8f8

.highcharts-data-table tr:hover
  background: #f1f7ff

</style>
