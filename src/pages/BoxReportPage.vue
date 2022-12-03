<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-4">
        <q-card class="my-card bg-purple text-white">
          <q-card-section>
            <div class="text-h6">Our Changing Planet</div>
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">
        <q-card class="my-card bg-purple text-white">
          <q-card-section>
            <div class="text-h6">Our Changing Planet</div>
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">
        <q-card class="my-card bg-purple text-white">
          <q-card-section>
            <div class="text-h6">Our Changing Planet</div>
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
  created () {
    this.getPaymentTotals()
  },
  methods: {
    getPaymentTotals () {
      this.$api.get('reports/payment-totals')
        .then(data => {
          console.log(data)
        })
    }
  }
}
</script>
