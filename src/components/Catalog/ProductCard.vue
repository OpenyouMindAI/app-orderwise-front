<template>
  <q-card flat bordered class="product-card">
    <q-card-section horizontal class="items-center product-card-inner">

      <!-- Contenido izquierdo (texto) -->
      <q-card-section class="q-pa-md col content-area">

        <Transition name="content-fade">
          <!-- SKELETON state -->
          <div v-if="!product" class="skeleton-content" key="skeleton">
            <q-skeleton type="text" width="70%" height="18px" />
            <q-skeleton type="text" width="90%" height="13px" class="q-mt-xs" />
            <q-skeleton type="text" width="40%" height="22px" class="q-mt-sm" />
          </div>

          <!-- LOADED state -->
          <div v-else class="real-content" key="data">
            <div class="product-title">{{ product.name }}</div>
            <div class="text-content q-mt-xs ellipsis-2-lines" v-html="product.description" />
            <div class="price-text q-mt-sm">$ {{ formatNumber(product.price) }}</div>
          </div>
        </Transition>
      </q-card-section>

      <!-- Imagen derecha -->
      <q-card-section class="col-auto q-pa-md image-area">
        <Transition name="content-fade">
          <q-img
            v-if="product"
            :key="'img-' + (product?.id || 'none')"
            :src="product.images?.[0]?.url || defaultImage"
            class="product-image"
          />
          <q-skeleton v-else key="img-skeleton" class="product-image-skeleton" />
        </Transition>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { formatNumber } from 'src/const/mixins'
import { noProductImage as defaultImage } from 'src/const/images'

defineProps({
  product: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.product-card {
  border-radius: 12px;
  /* Altura fija y exacta para evitar saltos */
  height: 112px;
  max-height: 112px;
  overflow: hidden;
}

.product-card-inner {
  height: 100%;
}

.content-area {
  position: relative;
  height: 100%;
}

.image-area {
  position: relative;
  width: 112px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image,
.product-image-skeleton {
  width: 80px;
  height: 80px;
  border-radius: 8px;
}

/* Transición limpia */
.content-fade-enter-active,
.content-fade-leave-active {
  transition: opacity 0.3s ease;
}

.content-fade-leave-active {
  position: absolute;
  /* El elemento que se va se posiciona absoluto respecto al padding del q-card-section */
  top: 16px; /* q-pa-md (16px) */
  left: 16px;
  width: calc(100% - 32px);
}

/* En la imagen el padding es igual */
.image-area .content-fade-leave-active {
  top: 16px;
  left: 16px;
  width: 80px;
}

.content-fade-enter-from,
.content-fade-leave-to {
  opacity: 0;
}

.product-title {
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2;
}
.text-content {
  font-size: 0.85rem;
  line-height: 1.4;
  color: #718096;
}
.price-text {
  font-weight: 700;
  color: var(--q-primary);
  font-size: 1rem;
}
</style>
