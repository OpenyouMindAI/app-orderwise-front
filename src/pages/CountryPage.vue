<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddCountry = true" icon="add_circle" />
      </div>
      <div class="col-12">
        <q-table
          title="Países"
          row-key="name"
          :columns="columns"
          :rows="countries"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editCountry"
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

    <!-- Edit Dialog -->
    <q-dialog v-model="openEditCountry" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Modificar país</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="country.name"
                filled
                label="Nombre"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
              <q-input
                v-model="country.code"
                filled
                label="Código (ISO)"
                hint="Ej: AR, US"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
              <q-input
                v-model="country.phone_code"
                filled
                label="Código tel."
                hint="Ej: +54"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
              <q-select
                v-model="country.coin_id"
                :options="coins"
                option-label="name"
                option-value="id"
                filled
                label="Moneda (Coin)"
                emit-value
                map-options
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12 flex items-center">
              <q-toggle
                v-model="country.is_active"
                label="Activo"
                color="primary"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteCountry" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Add Dialog -->
    <q-dialog v-model="openAddCountry" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveCountry">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar país</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="country.name"
                filled
                label="Nombre"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
              <q-input
                v-model="country.code"
                filled
                label="Código (ISO)"
                hint="Ej: AR, US"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
              <q-input
                v-model="country.phone_code"
                filled
                label="Código tel."
                hint="Ej: +54"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
              <q-select
                v-model="country.coin_id"
                :options="coins"
                option-label="name"
                option-value="id"
                filled
                label="Moneda (Coin)"
                emit-value
                map-options
                @update:model-value="onCoinChange"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12 flex items-center">
              <q-toggle
                v-model="country.is_active"
                label="Activo"
                color="primary"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify } from 'quasar'

export default {
  name: 'CountryPage',
  data () {
    return {
      countries: [],
      coins: [],
      country: {
        is_active: true
      },
      filter: '',
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 20,
        dataSearch: {
          id: '',
          name: ''
        }
      },
      visible: false,
      openAddCountry: false,
      openEditCountry: null,
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
          name: 'code',
          align: 'left',
          label: 'ISO',
          field: 'code',
          sortable: true
        },
        {
          name: 'phone_code',
          align: 'left',
          label: 'Teléfono',
          field: 'phone_code',
          sortable: true
        },
        // Moneda se obtiene a través de coin_id para lógica interna, no se muestra combinando códigos aquí
        {
          name: 'is_active',
          align: 'left',
          label: 'Estado',
          field: 'is_active',
          sortable: true,
          format: val => (val ? 'Activo' : 'Inactivo')
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
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
    this.getCoins()
  },
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  methods: {
    closeModal () {
      this.openAddCountry = false
      this.openEditCountry = false
      this.country = { is_active: true }
    },
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getCountries(this.params)
    },
    getCoins () {
      this.visible = true
      this.$api.get('coins')
        .then(({ data }) => {
          this.coins = data.data || data
          this.visible = false
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
    getCountries (params = this.params) {
      this.visible = true
      this.$api.get('countries', { params })
        .then(({ data }) => {
          this.countries = data.data || data
          this.visible = false
          if (data.total) {
            this.paginationConfig.rowsNumber = data.total
          }
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
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getCountries(this.params)
    },
    saveCountry () {
      this.visible = true
      const payload = {
        name: this.country.name,
        code: this.country.code,
        phone_code: this.country.phone_code,
        coin_id: this.country.coin_id,
        is_active: this.country.is_active
      }
      this.$api.post('countries', payload)
        .then(() => {
          this.getCountries()
          this.openAddCountry = false
          this.visible = false
          this.country = { is_active: true }
          Notify.create({
            message: 'País creado exitosamente',
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
    editCountry (event, row) {
      this.openEditCountry = true
      this.country = {
        id: row.id,
        name: row.name,
        code: row.code,
        phone_code: row.phone_code,
        coin_id: row.coin_id,
        is_active: row.is_active
      }
    },
    saveEdit () {
      this.visible = true
      const payload = {
        name: this.country.name,
        code: this.country.code,
        phone_code: this.country.phone_code,
        coin_id: this.country.coin_id,
        is_active: this.country.is_active
      }
      this.$api.put(`countries/${this.country.id}`, payload)
        .then(() => {
          this.getCountries()
          this.openEditCountry = false
          this.visible = false
          this.country = { is_active: true }
          Notify.create({
            message: 'País editado exitosamente',
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
    deleteCountry () {
      this.visible = true
      this.$api.delete(`countries/${this.country.id}`)
        .then(() => {
          this.getCountries()
          this.openEditCountry = false
          this.visible = false
          this.country = { is_active: true }
          Notify.create({
            message: 'País eliminado exitosamente',
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
