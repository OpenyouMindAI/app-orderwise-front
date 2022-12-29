<template>
  <div class="ticket">
    <p class="centrado">
      EL RINCON DE SETIMA S.A.C
      <br>Norky`s
      <br>R.U.C 20513132248
      <br>Jr Sebastian Barranca Nro.1555(2do y
      <br>3er Piso.Alt Cdras.7 de Gamarra) -Lima
      <br>La victoria
      <br>Telefono: Central Delivery: 644-91000
    </p>
    <p class="left">
      <span class="text-left">Pedido: {{ data.code }}</span>
      <span class="text-right">Cliente: {{ data.client.name }}</span>
      <br>
      <span class="text-left">Fecha: {{ formatDate(data.created_at, 'DD/mm/YYYY') }}</span>
      <span class="text-right">Hora: {{ formatDate(data.created_at, 'H:mm:ss') }}</span>
      <br>
      <span class="text-left">Mesero: {{ data.seller.name }}</span>
      <span class="text-right">Tipo: {{ data.invoice_type.name }}</span>
      <br>
      <span class="text-left">T/Cambio: {{ data.exchange_rate }}</span>
      <span class="text-right">Mesa: {{ data.tables.map(table => `${table.name} ${table.living_room.name}`).join(', ') }}</span>
    </p>
    <table>
      <thead>
        <tr>
          <th class="producto">PRODUCTO</th>
          <th class="cantidad">CANT</th>
          <th class="precio">PRECIO</th>
          <th class="cantidad">SUBTOTAL</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in data.products" :key="product.id">
          <td class="producto">{{ product.name }}</td>
          <td class="cantidad">{{ product.pivot.amount }}</td>
          <td class="precio">{{ product.pivot.price }}</td>
          <td class="cantidad">{{ product.pivot.amount * product.pivot.price }}</td>
        </tr>
        <tr>
            <td class="producto" colspan="3">TOTAL</td>
            <td class="precio">{{ data.total }}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
      <p>
        Razon Social: ----------------------------------------------------------------
      </p>
    </div>
    <p class="centrado end">¡GRACIAS POR SU COMPRA!</p>
  </div>
</template>

<script>
import { date } from 'quasar'
export default {
  // name: 'ComponentName',
  props: {
    data: {
      type: Object
    }
  },
  setup () {
    return {
      formatDate (dateNew, format) {
        return date.formatDate(dateNew, format)
      }
    }
  }
}
</script>
