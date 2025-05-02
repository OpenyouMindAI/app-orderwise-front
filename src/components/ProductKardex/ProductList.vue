<script setup>
import { defineEmits, ref, computed } from 'vue'

const emit = defineEmits(['select'])

const products = ref([
  { name: 'Notebook Lenovo ThinkPad X1', code: 'NB-LEN-X1-2023', category: 'Equipos Informáticos', currentStock: 15, unit: 'Unidades' },
  { name: 'HP EliteBook 845', code: 'HP-EL845', category: 'Equipos Informáticos', currentStock: 10, unit: 'Unidades' }
])

const searchTerm = ref('')

const filteredProducts = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return products.value.filter(product =>
    product.name.toLowerCase().includes(term) ||
    product.code.toLowerCase().includes(term)
  )
})
</script>

<template>
  <q-card class="q-pa-md shadow-2 rounded-borders full-height">
    <div class="text-h6 text-primary q-mb-md text-center">
      <q-icon name="inventory_2" size="md" class="q-mr-sm" />Productos
    </div>
    <q-input v-model="searchTerm" label="Buscar producto" outlined dense debounce="300" class="q-mb-md" />
    <q-list bordered class="rounded-borders">
      <q-item v-for="product in filteredProducts" :key="product.code" clickable @click="emit('select', product)" class="q-hoverable">
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ product.name }}</q-item-label>
          <q-item-label caption>Código: {{ product.code }} - Stock: {{ product.currentStock }} {{ product.unit }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
      <q-item v-if="filteredProducts.length === 0">
        <q-item-section class="text-center text-grey-6">No se encontraron productos</q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
