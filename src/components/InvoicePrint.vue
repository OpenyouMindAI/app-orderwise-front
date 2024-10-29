<template>
  <div class="invoice">
    <div class="center">
      <span class="title">
        LO DE LA ABUELA
      </span>
      <span>
        <br />TENIENTE IBAÑEZ 2911 <br />(555) 123 4567 <br />RFC0031282AB1
      </span>
    </div>
    <span class="separator"></span>
    <div class="details" style="width: 100%">
      <span>Nro: {{ data.code }}</span>
      <br />
      <span>Cliente: {{ data.client.name }}</span>
      <br />
      <span>Fecha: {{ formatDate(data.created_at, "DD/mm/YYYY") }}</span>
      <br />
      <span>Hora: {{ formatDate(data.created_at, "H:mm:ss") }}</span>
      <br />
      <span>Mesero: {{ data.seller.name }}</span>
      <br />
      <span>Tipo: {{ data.invoice_type.name }}</span>
      <br />
      <span v-if="data.tables.length > 0">
        Mesa:
        {{
          data.tables
            .map((table) => `${table.name} ${table?.living_room?.name}`)
            .join(", ")
        }}</span
      >
    </div>
    <span class="separator"></span>
    <table>
      <thead>
        <tr>
          <th class="producto">Artículo</th>
          <th class="cantidad">Cant</th>
          <th class="precio" v-if="data.invoice_type.acronym_serie !== 'T'">
            Importe
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in data.products" :key="product.id">
          <td class="producto">{{ product.name }}</td>
          <td class="cantidad">{{ product.pivot.amount }}</td>
          <td class="precio" v-if="data.invoice_type.acronym_serie !== 'T'">
            {{ product.pivot.price * product.pivot.amount }}
          </td>
        </tr>
        <tr class="total">
          <td class="producto">Total</td>
          <td class="cantidad" v-if="data.invoice_type.acronym_serie !== 'T'"></td>
          <td class="precio" v-if="data.invoice_type.acronym_serie !== 'T'">
            {{ data.total }}
          </td>
          <td class="precio" v-else>
            {{ sum(data.products) }}
          </td>
        </tr>
      </tbody>
    </table>
    <span class="separator"></span>
    <p class="center">¡GRACIAS POR SU COMPRA!</p>
  </div>
</template>

<script>
import { date } from 'quasar'
export default {
  name: 'InvoicePrint',
  props: {
    data: {
      type: Object
    }
  },
  setup () {
    return {
      formatDate (dateNew, format) {
        return date.formatDate(dateNew, format)
      },
      sum (data) {
        return data.reduce((a, b) => a + b.pivot.amount, 0)
      }
    }
  }
}
</script>
