<template>
  <div class="container">
    <div class="col-left">
      <div class="text-bold">
        BONILLA CHINCHAY BERTHA ANTONIA
      </div>
      <div class="head-address">
        AV. EL PERRAL MZA. F LOTE. 5 SAN EULOGIO ESPALDA DE MEGA 80 COMAS - LIMA- LIMA
      </div>
    </div>
    <div class="col-right text-bold">
      <div class="head-title">
        <span>
          BOLETA DE VENTA ELECTRONICA
        </span>
        <br>
        <span>
          RUC: 10076087798
        </span>
        <br>
        EB01-57
      </div>
    </div>
    <hr class="divider">
    <div class="body">
      <div class="expiry-date">
        Fecha de Vencimiento: <span class="text-bold">-</span>
      </div>
      <div class="crated_at">
        Fecha de Emisión : <span class="text-bold">
          {{
            formatDate(data.created_at, 'DD/MM/YYYY')
          }}
        </span>
      </div>
      <div class="client">
        Señor(es) : <span class="text-bold">{{  data.client.name }}</span>
      </div>
      <div class="client-dni">
        DNI : <span class="text-bold">{{ data.client.document_number }}</span>
      </div>
      <div class="coin">
        Moneda : <span class="text-bold">{{ data.coin.name }}</span>
      </div>
      <div class="observation">
        Observación : <span class="text-bold">-</span>
      </div>
      <div class="products">
        <table>
          <thead>
            <tr class="text-bold">
              <td>Descripción</td>
              <td class="text-right">Cantidad</td>
              <td class="text-right">Valor Unitario(*)</td>
              <td class="text-right">Descuento(*)</td>
              <td class="text-right">Importe de venta(**)</td>
              <td class="text-right">ICBPER</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in data.products" :key="product.id">
              <td>{{ product.name }}</td>
              <td class="text-right">{{ product.pivot.amount }}</td>
              <td class="text-right">{{ product.pivot.price }}</td>
              <td class="text-right">0.00</td>
              <td class="text-right">{{ product.pivot.amount * product.pivot.price }}</td>
              <td class="text-right">0.00</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-left" style="margin-top: 40px;">
        (*) Sin impuestos. <br>
        (**) Incluye impuestos, de ser Op. Gravada.
      </div>
    </div>
    <div class="totales">
      <ul>
        <li>
          Op. Gravada:
          <span>
            {{ data.coin.symbol }}{{ data.tax_base }}
          </span>
        </li>
        <li v-for="taxe in data.taxes" :key="taxe.id">
          {{ taxe.name }} ({{ taxe.pivot.amount }}{{ taxeTranslate[taxe.pivot.type_taxe]}}):
          <span>
            {{ data.coin.symbol }}{{ calculateTaxe(taxe) }}
          </span>
        </li>
        <li>
          Importe total:
          <span>
            {{ data.coin.symbol }} {{ totalBill }}
          </span>
        </li>
      </ul>
    </div>
    <footer class="footer">
      Esta es una representación impresa de la Boleta de Venta Electrónica,
      generada en el Sistema de la SUNAT. EI Emisor Electrónico puede verificarla
      utilizando su clave SOL, el Adquirente o Usuario puede consultar su validez en
      SUNAT Virtual: www.sunat.gob.pe, en Opciones sin Clave SOL/ Consulta de Validez del CPE.
    </footer>
  </div>
</template>

<script>
import { date } from 'quasar'
export default {
  // name: 'ComponentName',
  props: {
    data: Object
  },
  computed: {
    totalBill () {
      const sum = this.data.taxes.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)
      return sum + this.data.total
    }
  },
  methods: {
    calculateTaxe (taxe) {
      if (taxe.pivot.type_taxe === 'percentage') {
        taxe.total = (this.data.total * taxe.pivot.amount) / 100
      } else {
        taxe.total = this.data.total + taxe.pivot.amount
      }
      console.log(this.data.total)
      return taxe.total
    }
  },
  setup () {
    return {
      taxeTranslate: {
        percentage: '%'
      },
      formatDate (dateNew, format) {
        return date.formatDate(dateNew, format)
      }
    }
  }
}
</script>
