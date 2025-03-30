<template>
  <div>
    <q-card v-if="loading">
      <q-card-section class="flex justify-center items-center">
        <q-skeleton type="QAvatar" class="full-width" style="min-height: 250px; max-width: 250px;"/>
      </q-card-section>
    </q-card>
    <ChartComponent id="sales" :options="chartOptions" v-else>
      <template v-slot:top>
        <div class="text-subtitle2">
          Ventas por periodo
        </div>
      </template>
      <template v-slot:top-right>
        <q-tabs
          v-model="tab"
          indicator-color="transparent"
          active-bg-color="primary"
          active-class="text-white"
          class="q-pa-xs"
          style="border-radius: 50px;"
          dense
        >
          <q-tab name="diary" label="Por dia" style="border-radius: 50px;"/>
          <q-tab name="weekly" label="Semanal" style="border-radius: 50px;"/>
          <q-tab name="monthly" label="Mensual" style="border-radius: 50px;"/>
          <q-tab name="yearly" label="Anual" style="border-radius: 50px;"/>
        </q-tabs>
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
    default: () => ({})
  }
})

/**
 * Store
 * @type {Object}
 */
const store = authentication()

/**
 * Tabs
 * @type {string}
 */
const tab = ref('weekly')

/**
 * Loading state
 * @type {boolean}
 */
const loading = ref(true)

/**
 * Sales data
 * @type {Array}
 */
const salesData = ref([])

/**
 * Sales params
 * @type {object}
 */
const params = ref({
  branch_office_id: store.branchOffice?.id,
  year: 2025
})

/**
 * On mounted
 */
onMounted(() => {
  filterDate(params.value)
})

/**
 * Watch filters
 */
watch(() => props.filters, (filters) => {
  params.value = {
    ...params.value,
    ...filters,
    groupBy: tab.value,
    branch_office_id: store.branchOffice?.id
  }
  filterDate(params.value)
})

/**
 * Watch tab
 */
watch(() => tab.value, (groupBy) => {
  filterDate({ ...params.value, groupBy })
})

/**
 * Chart options
 * @type {object}
 */
const chartOptions = ref({
  chart: {
    type: 'column',
    height: 300
  },
  title: {
    text: undefined
  },
  xAxis: {
    categories: computed(() => salesData.value.map(item => item.transaction_group)),
    crosshair: true
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Ventas ($)'
    }
  },
  tooltip: {
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
      data: computed(() => salesData.value.map(item => item.total)),
      color: '#3b82f6'
    },
    {
      name: 'Tendencia',
      type: 'line',
      data: computed(() => salesData.value.map(item => item.total)),
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

/**
 * Get sales data
 * @param {Object} params
 */
const filterDate = async (params) => {
  try {
    loading.value = true
    const { data } = await api.get('kpi/invoices', { params })
    salesData.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

</script>
