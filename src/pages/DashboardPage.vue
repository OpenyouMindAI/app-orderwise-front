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
      <div class="col-xl-8 col-lg-8 col-md-12 col-sm-12 col-xs-12">
        <sales-graph :filters="filter" />
      </div>
      <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-xs-12">
        <payment-methods-graph :filters="filter" />
      </div>
      <div class="col-xl-5 col-lg-5 col-md-6 col-sm-6 col-xs-12">
        <categories-graph :filters="filter" />
      </div>
      <div class="col-xl-7 col-lg-7 col-md-12 col-sm-12 col-xs-12">
        <product-ranking-graph :filters="filter" />
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
            v-model="seller"
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
import { ref, watch } from 'vue'
import { authentication } from 'src/stores/module-authentication'
import { notify } from 'src/const/mixins'
import { api } from 'src/boot/axios'

/**
 * Dialog filter
 * @type {Ref<Boolean>}
 */
const dialogFilter = ref(false)

/**
 * Panel
 * @type {Ref<String>}
 */
const panel = ref('day')
/**
 * Filter
 * @type {Ref<Object>}
 */
const filter = ref({})
/**
 * Seller
 * @type {Ref<Object>}
 */
const seller = ref(null)
/**
 * Sellers
 * @type {Ref<Array>}
 */
const sellers = ref([])
/**
 * Permissions
 * @type {Array}
 */
const permissions = ['SAM']
/**
 * Store
 * @type {Object}
 */
const store = authentication()
/**
 * Validate
 * @type {Boolean}
 */
const validate = store.userSession.is_root || store.userSession.roles.some(role => permissions.includes(role.acronym))

watch(() => store.branchOffice, () => {
  filterDate()
})
/**
 * Clear filter
 */
const clearFilter = () => {
  filter.value = {}
  filterDate()
}

/**
 * Filter date
 */
const filterDate = () => {
  if (panel.value === 'day') {
    filter.value = {
      seller_id: seller.value?.id,
      day: filter.value.day,
      fromHours: filter.value.fromHours,
      toHours: filter.value.toHours
    }
  } else {
    filter.value = {
      seller_id: seller.value?.id,
      to: filter.value.to,
      from: filter.value.from
    }
  }
}

/**
 * Filter sellers
 * @param {String} value
 * @param {Function} update
 */

const filterSellers = async (value, update) => {
  try {
    const { data } = await api.get('sellers', {
      params: {
        dataSearch: {
          name: value,
          document_number: value
        }
      }
    })
    update(() => {
      sellers.value = data
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

</script>
