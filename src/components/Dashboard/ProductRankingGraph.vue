<template>
  <div>
    <q-card v-if="loading">
      <q-card-section class="flex justify-center items-center">
        <q-skeleton type="QAvatar" class="full-width" style="min-height: 250px; max-width: 250px;"/>
      </q-card-section>
    </q-card>
    <ChartComponent id="products" :options="chartProductOptions" v-else>
      <template v-slot:top>
        <div class="text-subtitle2">
          Ranking de productos más vendidos
        </div>
      </template>
    </ChartComponent>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { computed, onMounted, ref, watch } from 'vue'
import ChartComponent from 'src/components/ChartComponent.vue'
import Highcharts from 'highcharts'

/**
 * Options
 * @type {Object}
 */
defineOptions({
  name: 'ProductRankingGraph'
})

/**
 * Props
 * @type {Object}
 */
const props = defineProps({
  filters: {
    type: Object,
    default: null
  }
})

/**
 * Store
 * @type {Object}
 */
const store = authentication()

/**
 * Loading
 * @type {Ref<Boolean>}
 */
const loading = ref(true)

/**
 * Params
 * @type {Ref<Object>}
 */
const params = ref({
  branch_office_id: store.branchOffice.id,
  mostSold: true,
  paginated: true,
  perPage: 10
})

onMounted(() => {
  filterDate(params.value)
})

/**
 * Watch filters
 */
watch(() => props.filters, (filters) => {
  filterDate({
    ...params.value,
    ...filters,
    branch_office_id: store.branchOffice.id
  })
})

/**
 * Top products data
 * @type {Ref<Array>}
 */
const topProductsData = ref([])

/**
 * Chart options
 * @type {Ref<Highcharts.Options>}
 */
const chartProductOptions = ref({
  chart: {
    type: 'bar',
    height: 300
  },
  title: {
    text: undefined
  },
  xAxis: {
    categories: computed(() => topProductsData.value.map((item) => item.name)),
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
      colors: computed(() => {
        return topProductsData.value.map((_, i) => {
          const ratio = i / (topProductsData.value.length - 1)
          return Highcharts.color('#3b82f6')
            .brighten((ratio - 0.5) * 0.8)
            .get()
        })
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
      data: computed(() => topProductsData.value.map((item) => Number(item.invoices_count)))
    }
  ]
})

/**
 * Filter data by date
 * @param {Object} params
 */
const filterDate = async (params) => {
  try {
    loading.value = true
    const { data } = await api.get('kpi/products-ranking', { params })
    topProductsData.value = data.data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

</script>
