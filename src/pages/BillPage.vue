<template>
  <q-page padding>
    <q-table
      title="Facturas"
      grid
      dense
      :rows="bills"
      :columns="columns"
      row-key="name"
      :filter="filter"
      :loading="loadingPage"
    >
      <template v-slot:top-right>
        <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-6">
          <q-card>
            <q-card-section class="text-center q-pa-xs">
              <q-badge round color="negative" floating>
                <q-btn icon="close" size="xs" dense @click="deleteBill(props.row)"/>
              </q-badge>
              <strong>{{ props.row.date }}</strong>
            </q-card-section>
            <q-separator />
            <q-card-section class="flex flex-center q-pa-xs">
              <q-list class="full-width" dense>
                <q-item clickable v-ripple>
                  <q-item-section>Total en $:</q-item-section>
                  <q-item-section side>{{ props.row.total }}</q-item-section>
                </q-item>
                <q-item clickable v-ripple active-class="text-orange">
                  <q-item-section>Total en Bs:</q-item-section>
                  <q-item-section side>{{ props.row.totalExchange }}</q-item-section>
                </q-item>
                <q-item clickable v-ripple active-class="bg-teal-1 text-grey-8">
                  <q-item-section>Taza del dia:</q-item-section>
                  <q-item-section side>{{ props.row.exchange_rate }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { db } from '../dbfire'
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
export default {
  // name: 'PageName',
  data () {
    return {
      bills: [],
      filter: '',
      columns: [
        { name: 'date', align: 'left', label: 'Fecha', field: 'date', sortable: true },
        { name: 'exchange_rate', align: 'left', label: 'Taza del dia', field: 'exchange_rate', sortable: true },
        {
          name: 'total',
          required: true,
          label: 'Total en $',
          align: 'left',
          field: row => row.total,
          sortable: true
        },
        { name: 'totalExchange', align: 'left', label: 'Total en Bs', field: 'totalExchange', sortable: true }
      ]
    }
  },
  created () {
    this.getBills()
  },
  methods: {
    /**
     * Delete Product
     * @param {Object} data product
     */
    deleteBill (data) {
      try {
        this.$q.dialog({
          title: 'Alerta',
          message: '¿Desea eliminar la factura?',
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await deleteDoc(doc(db, 'bills', String(data.code)))
          this.getBills()
          this.$q.notify({
            message: 'Factura eliminado extisamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
      } catch (error) {
        console.log(error)
      }
    },
    /**
     * Get guides all
     */
    async getBills () {
      try {
        const billsCol = collection(db, 'bills')
        this.loadingPage = true
        const q = query(billsCol, orderBy('date', 'desc'))
        const billsnapshot = await getDocs(q)
        this.bills = billsnapshot.docs.map(doc => doc.data())
        this.loadingPage = false
      } catch (error) {
        console.error('Error adding document: ', error)
      }
    }
  }
}
</script>
