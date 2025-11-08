<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddExchangeRate = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Tasas de Cambio"
          row-key="name"
          :columns="columns"
          :rows="exchangeRates"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editExchangeRate"
          @request="setPagination"
          no-data-label="Registro no encontrado"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top-right>
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
        </q-table>
      </div>
    </div>
    <q-dialog v-model="openEditExchangeRate" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Modificar tasa de cambio</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="exchangeRate.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="exchangeRate.coin_id"
                :options="coins"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Moneda"
              >
                <template v-slot:selected-item="scope">
                  <span>{{ scope.opt.symbol }} - {{ scope.opt.name }}</span>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.symbol }} - {{ scope.opt.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="exchangeRate.amount"
                type="number"
                step="0.01"
                label="Monto"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteExchangeRate" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddExchangeRate" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveExchangeRate">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar tasa de cambio</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="exchangeRate.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="exchangeRate.coin_id"
                :options="coins"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Moneda"
              >
                <template v-slot:selected-item="scope">
                  <span>{{ scope.opt.symbol }} - {{ scope.opt.name }}</span>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.symbol }} - {{ scope.opt.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="exchangeRate.amount"
                type="number"
                step="0.01"
                label="Monto"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { formatDate } from 'src/const/mixins';
export default {
  data () {
    return {
      exchangeRates: [],
      exchangeRate: {},
      coins: [],
      filter: '',
      /**
       * Params search
       * @type {Object}
       */
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 1,
        dataSearch: {
          id: '',
          name: '',
          created_at: ''
        }
      },
      visible: false,
      openAddExchangeRate: false,
      openEditExchangeRate: null,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'coin',
          align: 'left',
          label: 'Moneda',
          field: row => row.coin ? `${row.coin.symbol} - ${row.coin.name}` : '',
          sortable: true
        },
        {
          name: 'amount',
          align: 'right',
          label: 'Monto',
          field: 'amount',
          sortable: true
        },
        {
          name: 'created_at',
          align: 'right',
          label: 'Fecha',
          field: 'created_at',
          format: (value) => formatDate(value, 'DD/MM/YYYY'),
          sortable: true
        },
        {
          name: 'created_at',
          align: 'right',
          label: 'Hora',
          field: 'created_at',
          format: (value) => formatDate(value, 'HH:mm:ss'),
          sortable: false
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      }
    }
  },
  mounted () {
    this.getCoins()
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
  },
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  methods: {
    /**
     * Get coins
     */
    getCoins () {
      this.$api.get('coins', {
        params: {
          paginate: false
        }
      })
        .then(({ data }) => {
          this.coins = data
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddExchangeRate = false
      this.openEditExchangeRate = false
      this.exchangeRate = {}
    },
    /**
     * Search exchange rates
     * @param  {Object}
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getExchangeRates(this.params)
    },
    /**
     * Get all exchange rates
     */
    getExchangeRates (params = this.params) {
      this.visible = true
      this.$api.get('exchange-rates', { params })
        .then(({ data }) => {
          this.exchangeRates = data.data
          this.visible = false
          this.paginationConfig.rowsNumber = data.total
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getExchangeRates(this.params)
    },
    /**
     * Save exchange rate
     */
    saveExchangeRate () {
      this.visible = true
      this.$api.post('exchange-rates', this.exchangeRate)
        .then(({ data }) => {
          this.getExchangeRates()
          this.openAddExchangeRate = false
          this.visible = false
          this.exchangeRate = {}
          Notify.create({
            message: 'Tasa de cambio creada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * View exchange rate
     */
    editExchangeRate (event, row, index) {
      this.openEditExchangeRate = true
      this.exchangeRate = {
        ...row,
        coin_id: row.coin_id || row.coin?.id
      }
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`exchange-rates/${this.exchangeRate.id}`, this.exchangeRate)
        .then(({ data }) => {
          this.getExchangeRates()
          this.openEditExchangeRate = false
          this.visible = false
          this.exchangeRate = {}
          Notify.create({
            message: 'Tasa de cambio editada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Delete exchange rate
     */
    deleteExchangeRate () {
      this.visible = true
      this.$api.delete(`exchange-rates/${this.exchangeRate.id}`)
        .then(({ data }) => {
          this.getExchangeRates()
          this.openEditExchangeRate = false
          this.visible = false
          this.exchangeRate = {}
          Notify.create({
            message: 'Tasa de cambio eliminada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    }
  }
}
</script>
