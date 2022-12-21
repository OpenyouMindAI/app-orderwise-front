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
        Fecha de Emisión : <span class="text-bold">08/12/2022</span>
      </div>
      <div class="client">
        Señor(es) : <span class="text-bold">Luis Palma</span>
      </div>
      <div class="client-dni">
        DNI : <span class="text-bold">26720270</span>
      </div>
      <div class="coin">
        Moneda : <span class="text-bold">Soles</span>
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
            <tr>
              <td>Pan</td>
              <td class="text-right">1.00</td>
              <td class="text-right">10</td>
              <td class="text-right">0.00</td>
              <td class="text-right">34.00</td>
              <td class="text-right">0.00</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-left" style="margin-top: 40px;">
        (*) Sin impuestos. <br>
        (**) Incluye impuestos, de ser Op. Gravada.
      </div>
      <div class="col-right"></div>
    </div>
  </div>
</template>

<script>
import { date } from 'quasar'
export default {
  // name: 'ComponentName',
  setup () {
    return {
      formatDate (dateNew, format) {
        return date.formatDate(dateNew, format)
      }
    }
  }
}
</script>
<style>
.container {
  width: 80%;
  margin: auto;
  padding: 20px 10px;
  border: solid 3px;
  position: relative;
  font-weight: 400;
}
.col-left {
  width: 70%;
}
.head-name {
  font-weight: bold;
}
.text-bold {
  font-weight: bold;
}
.col-right {
  padding: 5px;
  border: solid 3px;
  top: 10px;
  right: 9px;
  text-align: center;
  position: absolute;
}
.divider {
  margin-top: 38px;
}
.crated_at span {
  margin-left: 40px;
}
.client span {
  margin-left: 90px;
}

.client-dni span {
  margin-left: 127px;
}
.observation span {
  margin-left: 72px;
}

.coin span {
  margin-left: 99px;
}
.expiry-date span {
  margin-left: 18px;
}
.products table {
  width: 100%
}
.text-right {
  text-align: right;
}
</style>
