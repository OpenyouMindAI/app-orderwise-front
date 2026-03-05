<template>
  <q-card flat bordered class="product-skeleton-card">
    <q-card-section horizontal class="items-center">
      <!-- Left: text content area -->
      <q-card-section class="q-pa-md col">
        <q-skeleton type="text" width="68%" height="18px" />
        <q-skeleton type="text" width="88%" height="13px" class="q-mt-sm" />
        <q-skeleton type="text" width="55%" height="13px" class="q-mt-xs" />
        <q-skeleton type="text" width="32%" height="22px" class="q-mt-sm" />
      </q-card-section>

      <!-- Right: image placeholder -->
      <q-card-section class="col-auto q-pa-md">
        <q-skeleton class="product-skeleton-image" />
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.product-skeleton-card {
  border-radius: 14px !important;
  border: 1px solid #e8ecf0 !important;
  overflow: hidden;
}

.product-skeleton-image {
  width: 96px;
  height: 96px;
  border-radius: 10px;
}

@media (max-width: 480px) {
  .product-skeleton-image {
    width: 80px;
    height: 80px;
  }
}
</style>
