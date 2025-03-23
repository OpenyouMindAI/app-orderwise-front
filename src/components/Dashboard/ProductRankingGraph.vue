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
import { computed, onMounted, ref } from 'vue'
import ChartComponent from 'src/components/ChartComponent.vue'
import Highcharts from 'highcharts'

defineOptions({
  name: 'ProductRankingGraph'
})

// defineProps({
//   filters: {
//     type: Object,
//     default: null
//   }
// })

const store = authentication()

const loading = ref(false)

onMounted(() => {
  filterDate({
    branch_office_id: store.branchOffice.id,
    mostSold: true,
    paginated: true,
    perPage: 10
  })
})

const topProductsData = ref([])

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
      data: computed(() => topProductsData.value.map((item) => item.invoices_count))
    }
  ]
})

const filterDate = async (params) => {
  try {
    loading.value = true
    const { data } = await api.get('products', { params })
    console.log(data)
    topProductsData.value = data.data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

</script>
