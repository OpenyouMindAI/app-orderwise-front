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
        <sales-graph :filters="filter" />
      </div>
      <div class="col-4">
        <payment-methods-graph :filters="filter" />
      </div>
      <div class="col-7">
        <product-ranking-graph :filters="filter" />
      </div>
      <div class="col-5">
        <categories-graph :filters="filter" />
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

import CategoriesGraph from 'src/components/Dashboard/CategoriesGraph.vue'
import PaymentMethodsGraph from 'src/components/Dashboard/PaymentMethodsGraph.vue'
import ProductRankingGraph from 'src/components/Dashboard/ProductRankingGraph.vue'
import SalesGraph from 'src/components/Dashboard/SalesGraph.vue'
import { ref } from 'vue'
import { date } from 'quasar'

const dialogFilter = ref(false)

const validate = ref(null)
const panel = ref('day')
const filter = ref({})
const sellers = ref([])

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
const filterDate = () => {}

const filterSellers = () => {}

</script>
