<template>
  <div>
    <q-card v-if="loading">
      <q-card-section class="flex justify-center items-center">
        <q-skeleton type="QAvatar" class="full-width" style="min-height: 250px; max-width: 250px;"/>
      </q-card-section>
    </q-card>
    <ChartComponent id="categories" :options="chatCategoryOptions" v-else>
      <template v-slot:top>
        <div class="text-subtitle2">
          Distribución por categoría
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

/**
 * Options
 * @type {Object}
 */
defineOptions({
  name: 'CategoriesGraph'
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
 * Category data
 * @type {Ref<Array>}
 */
const categoryData = ref([])

/**
 * Loading
 * @type {Ref<Boolean>}
 */
const loading = ref(true)

/**
 * On mounted
 * @param {Object} params
 */
onMounted(() => {
  filterDate({
    branch_office_id: store.branchOffice?.id
  })
})

/**
 * Watch filters
 */
watch(() => props.filters, (filters) => {
  filterDate({
    branch_office_id: store.branchOffice?.id,
    ...filters
  })
})

/**
 * Chart options
 * @type {Ref<Highcharts.Options>}
 */
const chatCategoryOptions = ref({
  chart: {
    type: 'pie',
    height: 300
  },
  title: {
    text: undefined
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
      data: computed(() => categoryData.value)
    }
  ],
  credits: {
    enabled: false
  }
})

/**
 * Filter data by date
 * @param {Object} params
 */
const filterDate = async (params) => {
  try {
    loading.value = true
    const { data } = await api.get('reports/category-totals', { params })
    categoryData.value = data.categories_totals.map((item) => {
      return {
        name: item.category_name,
        y: item.total_sales
      }
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

</script>
