<template>
  <div class="grid q-gutter-sm">
    <div class="flex items-center justify-between">
      <div class="flex q-gutter-sm">
        <span class="text-h6">{{ branchOffice.name }}</span>
        <q-separator vertical/>
        <span class="text-h6">Costo Total: ${{ product.cost }}</span>
        <q-separator vertical/>
         <q-btn
            flat
            dense
            color="primary"
            icon="calculate"
            label="Recalcular Costo"
            @click="calculateCost"
            :loading="calculating"
         >
            <q-tooltip>Actualizar costo basado en ingredientes</q-tooltip>
         </q-btn>
      </div>
      <q-btn icon="add" color="primary" label="Agregar Ingrediente" @click="openAddIngredient = true"/>
    </div>

    <q-table
      title="Ingredientes"
      row-key="id"
      :columns="columns"
      :rows="recipeItems"
      :loading="loadingTable"
      binary-state-sort
      :pagination="paginationConfig"
      no-data-label="No hay ingredientes agregados"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn size="sm" color="primary" round dense flat icon="edit" @click="editIngredient(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn size="sm" color="negative" round dense flat icon="delete" @click="deleteIngredient(props.row)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Modal Agregar/Editar Ingrediente -->
    <q-dialog v-model="openAddIngredient" persistent>
      <q-card style="width: 600px; max-width: 80vw;">
        <q-form @submit="saveIngredient">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">{{ editingIngredient ? 'Editar' : 'Agregar' }} Ingrediente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeIngredientModal" />
          </q-card-section>

          <q-card-section class="row q-col-gutter-md">
            <!-- Selección de Ingrediente -->
            <div class="col-12">
              <q-select
                filled
                v-model="ingredientForm.ingredient"
                :options="productOptions"
                option-value="id"
                label="Ingrediente (Materia Prima o Sub-receta)"
                use-input
                @filter="filterProducts"
                :rules="[val => !!val || 'El ingrediente es requerido']"
                :option-label="opt => opt.name ? `${opt.name} ($${opt.cost})` : ''"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No se encontraron resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Cantidad y Unidad -->
            <div class="col-6">
              <q-input
                filled
                v-model.number="ingredientForm.quantity"
                label="Cantidad"
                type="number"
                step="0.001"
                min="0"
                :rules="[val => val > 0 || 'Debe ser mayor a 0']"
              />
            </div>
            <div class="col-6">
               <q-select
                  filled
                  v-model="ingredientForm.unit_of_measure_id"
                  :options="unitOfMeasures"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  label="Unidad"
                  :rules="[val => !!val || 'Requerido']"
                />
            </div>

            <!-- Merma -->
            <div class="col-6">
              <q-input
                filled
                v-model.number="ingredientForm.waste_percentage"
                label="% Merma (Desperdicio)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                hint="Ej: 10% se pierde en la preparación"
              />
            </div>

             <div class="col-6 flex items-center">
                <div class="text-grey-8" v-if="estimatedCost > 0">
                    Costo Estimado: <b>${{ estimatedCost }}</b>
                </div>
             </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn color="secondary" label="Cancelar" @click="closeIngredientModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="loadingForm"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { onMounted, ref, computed } from 'vue'
import { authentication } from 'src/stores/module-authentication'

const { branchOffice } = authentication()

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const columns = [
  { name: 'ingredient', align: 'left', label: 'Ingrediente', field: row => row.ingredient?.name, sortable: true },
  { name: 'quantity', align: 'right', label: 'Cantidad', field: 'quantity', sortable: true },
  { name: 'unit', align: 'left', label: 'Unidad', field: row => row.unit_of_measure?.name || '-' },
  { name: 'waste', align: 'right', label: '% Merma', field: 'waste_percentage', format: val => `${val}%` },
  { name: 'cost_impact', align: 'right', label: 'Costo Impacto', field: row => `$${calculateItemCost(row)}` },
  { name: 'actions', align: 'center', label: 'Acciones' }
]

const recipeItems = ref([])
const loadingTable = ref(false)
const loadingForm = ref(false)
const calculating = ref(false)
const openAddIngredient = ref(false)
const editingIngredient = ref(null)

const productOptions = ref([])
const unitOfMeasures = ref([])

const ingredientForm = ref({
  ingredient: null,
  quantity: 1,
  unit_of_measure_id: null,
  waste_percentage: 0
})

const paginationConfig = ref({
  rowsPerPage: 0 // All
})

// Computed
const estimatedCost = computed(() => {
  if (!ingredientForm.value.ingredient || !ingredientForm.value.quantity) return 0
  const baseCost = parseFloat(ingredientForm.value.ingredient.cost || 0)
  const qty = parseFloat(ingredientForm.value.quantity)
  const waste = parseFloat(ingredientForm.value.waste_percentage || 0)
  return (baseCost * qty * (1 + waste / 100)).toFixed(2)
})

// Methods
const loadRecipeItems = async () => {
  if (!props.product?.id) return
  loadingTable.value = true
  try {
    const { data } = await api.get(`products/${props.product.id}/recipe`)
    recipeItems.value = data
  } catch (error) {
    notify('Error al cargar ingredientes', 'negative')
  } finally {
    loadingTable.value = false
  }
}

const loadUnitOfMeasures = async () => {
  try {
    const { data } = await api.get('unit-of-measures', { params: { perPage: 100 } })
    unitOfMeasures.value = data.data || data
  } catch (error) {
    console.error(error)
  }
}

const filterProducts = async (val, update) => {
  if (val === '') {
    update(() => {
      productOptions.value = []
    })
    return
  }

  try {
    const { data } = await api.get('products', {
      params: {
        dataSearch: { name: val },
        perPage: 20
      }
    })
    // Filter out the current product itself to prevent recursion selection in UI
    productOptions.value = data.data.filter(p => p.id !== props.product.id)
    update()
  } catch (error) {
    console.error(error)
    update()
  }
}

const saveIngredient = async () => {
  loadingForm.value = true
  try {
    const payload = {
      product_id: props.product.id,
      ingredient_id: ingredientForm.value.ingredient.id,
      quantity: ingredientForm.value.quantity,
      unit_of_measure_id: ingredientForm.value.unit_of_measure_id,
      waste_percentage: ingredientForm.value.waste_percentage
    }

    if (editingIngredient.value) {
      await api.put(`products/${props.product.id}/recipe/${editingIngredient.value.id}`, payload)
      notify('Ingrediente actualizado', 'positive')
    } else {
      await api.post(`products/${props.product.id}/recipe`, payload)
      notify('Ingrediente agregado', 'positive')
    }
    await loadRecipeItems()
    closeIngredientModal()
    // Optionally trigger cost recalculation
    await calculateCost()
  } catch (error) {
    notify(error.response?.data?.message || 'Error al guardar', 'negative')
  } finally {
    loadingForm.value = false
  }
}

const editIngredient = (row) => {
  editingIngredient.value = row
  ingredientForm.value = {
    ingredient: row.ingredient,
    quantity: row.quantity,
    unit_of_measure_id: row.unit_of_measure_id,
    waste_percentage: row.waste_percentage
  }
  openAddIngredient.value = true
}

const deleteIngredient = async (row) => {
  try {
    await api.delete(`products/${props.product.id}/recipe/${row.id}`)
    notify('Ingrediente eliminado', 'positive')
    await loadRecipeItems()
    await calculateCost()
  } catch (error) {
    notify('Error al eliminar', 'negative')
  }
}

const calculateCost = async () => {
  calculating.value = true
  try {
    const { data } = await api.get(`products/${props.product.id}/recipe/cost`)
    props.product.cost = data.cost
    notify(`Costo actualizado: $${data.cost}`, 'positive')
  } catch (error) {
    notify('Error al calcular costo', 'negative')
  } finally {
    calculating.value = false
  }
}

const closeIngredientModal = () => {
  openAddIngredient.value = false
  editingIngredient.value = null
  ingredientForm.value = {
    ingredient: null,
    quantity: 1,
    unit_of_measure_id: null,
    waste_percentage: 0
  }
}

const calculateItemCost = (row) => {
  if (!row.ingredient || !row.quantity) return 0
  return (row.ingredient.cost * row.quantity * (1 + row.waste_percentage / 100)).toFixed(2)
}

onMounted(() => {
  loadRecipeItems()
  loadUnitOfMeasures()
})
</script>
