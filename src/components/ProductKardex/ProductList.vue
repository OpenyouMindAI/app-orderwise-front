<script setup>
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { defineEmits, ref, onMounted, watch } from 'vue'

const emit = defineEmits(['select'])

const products = ref([])

const searchTerm = ref('')

const store = authentication()

watch(searchTerm, (data) => {
  getProducts({
    dataSearch: {
      name: data,
      barcode: data
    }
  })
})

const getProducts = async (params) => {
  try {
    const { data } = await api.get('products', {
      params: {
        orderBy: 'id',
        sortOrder: 'desc',
        stock: true,
        branch_office_id: store.branchOffice?.id,
        ...params
      }
    })
    products.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

onMounted(() => {
  getProducts()
})

</script>

<template>
  <q-card class="q-pa-md shadow-2 rounded-borders full-height">
    <div class="text-h6 text-primary q-mb-md text-center">
      <q-icon name="inventory_2" size="md" class="q-mr-sm" />Productos
    </div>
    <q-input
      v-model="searchTerm"
      label="Buscar producto"
      outlined
      dense
      debounce="300"
      class="q-mb-md"
      clearable
    />
    <q-list bordered class="rounded-borders scroll" style="max-height: calc(100vh - 220px);">
      <q-item
        v-for="product in products"
        :key="product.id"
        clickable
        @click="emit('select', product)"
        class="q-hoverable"
      >
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ product.name }}</q-item-label>
          <q-item-label caption>
            Código: {{ product.barcode }} - Stock: {{ product.normal_stock || product.bundle_stock }} {{ product?.unit_of_measure?.acronym }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
      <q-item v-if="products.length === 0">
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
