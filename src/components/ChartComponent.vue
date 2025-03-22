<template>
  <q-card class="full-width">
    <q-card-actions class="q-pt-sm q-px-md justify-between items-center flex">
      <slot name="top"></slot>
      <div>
        <slot name="top-right"></slot>
        <q-btn icon="fullscreen" color="primary" @click="toggleFullscreen"/>
      </div>
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
</style>
