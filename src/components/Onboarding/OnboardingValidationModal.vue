<template>
  <q-dialog v-model="model" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 450px; max-width: 90vw; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
      <q-card-section class="column items-center q-pb-none q-pt-xl q-px-lg">
        <div class="icon-container q-mb-md">
          <q-icon :name="config.icon" size="48px" class="text-white" />
        </div>

        <div class="text-h5 text-center text-weight-bold q-mb-sm text-primary">
          {{ config.title }}
        </div>

        <div class="text-body1 text-center text-grey-7 q-mb-lg" style="line-height: 1.5;">
          {{ config.message }}
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-lg q-pt-none">
        <q-btn
          :label="config.buttonLabel"
          color="primary"
          class="full-width q-py-md text-weight-bold"
          rounded
          unelevated
          size="md"
          @click="config.action"
          icon-right="arrow_forward"
          style="box-shadow: 0 4px 15px rgba(var(--q-primary-rgb), 0.3);"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    default: 'category', // 'category' | 'product'
    validator: (val) => ['category', 'product'].includes(val)
  },
  page: {
    type: String,
    default: 'product', // 'product' | 'billing'
    validator: (val) => ['product', 'billing'].includes(val)
  }
})

const emit = defineEmits(['update:modelValue', 'action'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const configs = {
  product: { // Page
    category: {
      icon: 'category',
      title: '¡Organicemos tu inventario!',
      message: 'Para empezar a crear productos, primero necesitamos definir algunas categorías. Esto te ayudará a mantener todo ordenado y fácil de encontrar.',
      buttonLabel: 'Crear mi primera categoría'
    }
  },
  billing: { // Page
    category: {
      icon: 'category',
      title: '¡Antes de facturar!',
      message: 'Para realizar ventas necesitas productos, y para crear productos es necesario organizar tus categorías primero.',
      buttonLabel: 'Crear Categoría'
    },
    product: {
      icon: 'inventory_2',
      title: '¡Tu catálogo está vacío!',
      message: 'Para comenzar a facturar necesitas tener productos registrados en tu sistema. ¡Agreguemos el primero!',
      buttonLabel: 'Agregar Producto'
    }
  }
}

const config = computed(() => {
  const pageConfig = configs[props.page] || configs.product
  const typeConfig = pageConfig[props.type] || pageConfig.category || configs.product.category

  return {
    ...typeConfig,
    action: () => emit('action')
  }
})
</script>

<style scoped>
.icon-container {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--q-primary), var(--q-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(var(--q-primary-rgb), 0.4);
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb), 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(var(--q-primary-rgb), 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb), 0); }
}
</style>
