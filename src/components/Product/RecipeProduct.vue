<template>
  <div class="test-design">
    <div class="row q-col-gutter-lg">
      <!-- Left Panel: Configuration & Stats -->
      <div class="col-12 col-md-4">
        <div class="column q-gutter-y-md">

          <!-- Cost Card -->
          <q-card class="bg-primary text-white shadow-3">
            <q-card-section>
              <div class="text-subtitle2 text-white-8" style="opacity: 0.9">Costo Unitario ({{ productSelected?.unit_of_measure?.name || 'Unidad' }})</div>
              <div class="row items-center q-mt-xs">
                <q-input
                  v-model="productSelected.cost"
                  borderless
                  dark
                  dense
                  class="col"
                  input-class="text-h4 text-weight-bold"
                >
                  <template v-slot:prepend>
                    <span class="text-h5 text-white" style="opacity: 0.8">$</span>
                  </template>
                </q-input>
                <q-btn
                  flat
                  round
                  icon="sync"
                  color="white"
                  :loading="calculating"
                  @click="calculateCost"
                >
                  <q-tooltip class="bg-white text-primary text-body2">Recalcular basado en ingredientes</q-tooltip>
                </q-btn>
              </div>
              <div class="text-caption text-white" style="opacity: 0.8">
                 Costo Total Ingredientes: {{ totalRecipeCost ? '$' + formatNumber(totalRecipeCost) : '$0.00' }}
              </div>
            </q-card-section>
          </q-card>

          <!-- Configuration Card -->
          <q-card flat bordered :class="['shadow-1', $q.dark.isActive ? 'bg-dark q-border-dark' : 'bg-white']">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md flex items-center" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                <q-icon name="settings" class="q-mr-sm text-primary"/>
                Configuración de Receta
              </div>

              <div class="row q-col-gutter-md">
                <!-- Servings & Yield -->
                <div class="col-12">
                   <div class="text-caption text-weight-medium text-grey-7">Rendimiento</div>
                </div>
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    v-model="productSelected.servings"
                    label="Cant. Rinde"
                    type="number"
                    :bg-color="$q.dark.isActive ? 'grey-9' : 'grey-1'"
                    hint="Porciones"
                    @update:model-value="calculateCostByUnitOfMeasure"
                  />
                </div>
                <div class="col-6">
                  <q-select
                    outlined
                    dense
                    v-model="productSelected.yield_unit_id"
                    :options="unitOfMeasures"
                    label="Unidad Rinde"
                    emit-value
                    map-options
                    option-label="name"
                    option-value="id"
                    :bg-color="$q.dark.isActive ? 'grey-9' : 'grey-1'"
                    hint="Unidad"
                    @update:model-value="calculateCostByUnitOfMeasure"
                  />
                </div>

                <div class="col-12">
                   <q-separator />
                </div>

                <!-- Times -->
                 <div class="col-12">
                   <div class="text-caption text-weight-medium text-grey-7">Tiempos de Elaboración</div>
                </div>
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    v-model="productSelected.preparation_time"
                    label="Preparación"
                    suffix="min"
                    type="number"
                    :bg-color="$q.dark.isActive ? 'grey-9' : 'grey-1'"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    v-model="productSelected.cooking_time"
                    label="Cocción"
                    suffix="min"
                    type="number"
                    :bg-color="$q.dark.isActive ? 'grey-9' : 'grey-1'"
                  />
                </div>

                 <!-- Procedure -->
                 <div class="col-12">
                  <q-input
                    outlined
                    dense
                    v-model="productSelected.procedure"
                    label="Procedimiento / Pasos"
                    type="textarea"
                    rows="4"
                    :bg-color="$q.dark.isActive ? 'grey-9' : 'grey-1'"
                    placeholder="Describa el proceso de elaboración..."
                  />
                 </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Right Panel: Ingredients List -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="shadow-1 fit column" :class="$q.dark.isActive ? 'bg-dark q-border-dark' : 'bg-white'">
          <q-toolbar class="q-pa-md" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-grey-9'">
             <q-icon name="restaurant" size="sm" class="text-primary q-mr-sm"/>
             <q-toolbar-title class="text-subtitle1 text-weight-bold">
               Ingredientes
             </q-toolbar-title>
             <q-btn
                unelevated
                color="primary"
                icon="add"
                label="Agregar Ingrediente"
                no-caps
                class="q-px-md shadow-2"
                @click="openAddIngredient = true"
              />
          </q-toolbar>

          <q-separator />

          <q-table
            flat
            :rows="recipeItems"
            :columns="columns"
            row-key="id"
            :loading="loadingTable"
            :pagination="paginationConfig"
            hide-pagination
            binary-state-sort
            class="full-width"
          >
             <template v-slot:header="props">
                <q-tr :props="props" :class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-grey-1 text-grey-8'">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
                    {{ col.label }}
                  </q-th>
                </q-tr>
             </template>

             <template v-slot:body-cell-ingredient="props">
                <q-td :props="props">
                   <div class="text-weight-medium text-primary">{{ props.row.ingredient?.name }}</div>
                </q-td>
             </template>

             <template v-slot:body-cell-unit="props">
                <q-td :props="props">
                   <q-badge color="grey-3" text-color="grey-9" :label="props.row.unit_of_measure?.name || '-'" />
                </q-td>
             </template>

             <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="text-center">
                  <q-btn size="sm" color="grey-7" round flat icon="edit" @click="editIngredient(props.row)">
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn size="sm" color="negative" round flat icon="delete" @click="deleteIngredient(props.row)">
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
              </q-td>
            </template>

             <template v-slot:bottom-row>
               <q-tr :class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-grey-1 text-grey-8'" class="text-subtitle1">
                  <q-td colspan="4" class="text-right text-weight-bold">
                      Costo Total Ingredientes:
                  </q-td>
                  <q-td class="text-right text-weight-bold text-primary">
                      ${{ formatNumber(totalRecipeCost) }}
                  </q-td>
                  <q-td></q-td> <!-- Empty cell for actions column -->
               </q-tr>
             </template>

             <template v-slot:no-data>
                <div class="column flex-center q-pa-xl text-grey-5 full-width">
                  <q-icon name="playlist_add" size="4em" class="q-mb-sm"/>
                  <div class="text-h6">No hay ingredientes</div>
                  <div class="text-caption">Agrega ingredientes para calcular el costo</div>
                </div>
             </template>
             
             <template v-slot:loading>
               <q-inner-loading showing color="primary" />
             </template>
          </q-table>
        </q-card>
      </div>

      <!-- Modal Agregar/Editar Ingrediente -->
      <q-dialog v-model="openAddIngredient" persistent>
        <q-card style="width: 600px; max-width: 95vw;" class="shadow-5">
          <q-form @submit="saveIngredient">
            <q-card-section class="row items-center bg-primary text-white q-py-sm">
              <div class="text-h6 text-weight-bold">{{ editingIngredient ? 'Editar' : 'Agregar' }} Ingrediente</div>
              <q-space />
              <q-btn icon="close" flat round dense @click="closeIngredientModal" />
            </q-card-section>

            <q-card-section class="q-pa-md">
              <div class="row q-col-gutter-md">
                <!-- Selección de Ingrediente -->
                <div class="col-12">
                  <q-select
                    outlined
                    v-model="ingredientForm.ingredient"
                    :options="productOptions"
                    option-value="id"
                    option-label="name"
                    label="Buscar Ingrediente"
                    use-input
                    @filter="filterProducts"
                    @update:model-value="setProduct"
                    :rules="[val => !!val || 'El ingrediente es requerido']"
                    :bg-color="$q.dark.isActive ? 'grey-9' : 'white'"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No se encontraron resultados
                        </q-item-section>
                      </q-item>
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>{{ scope.opt.name }}</q-item-label>
                          <q-item-label caption>Costo Base: ${{ scope.opt.cost }} / {{ scope.opt.unit_of_measure?.name }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Cantidad y Unidad -->
                <div class="col-6">
                  <q-input
                    outlined
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
                      outlined
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
                    outlined
                    v-model.number="ingredientForm.waste_percentage"
                    label="% Merma"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    hint="Desperdicio en la preparación"
                  >
                    <template v-slot:append>%</template>
                  </q-input>
                </div>

                 <div class="col-6 flex items-center justify-end">
                    <div class="text-subtitle1 text-primary bg-blue-1 q-px-md q-py-sm rounded-borders" v-if="estimatedCost > 0">
                        Costo: <b>${{ estimatedCost }}</b>
                    </div>
                 </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'">
              <q-btn flat :color="$q.dark.isActive ? 'white' : 'grey-8'" label="Cancelar" @click="closeIngredientModal" class="q-mr-sm"/>
              <q-btn unelevated color="primary" label="Guardar Ingrediente" type="submit" :loading="loadingForm" class="q-px-lg"/>
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { formatNumber, notify } from 'src/const/mixins'
import { onMounted, ref, computed } from 'vue'

/**
 * Component props
 * @type {Object}
 */
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

/**
 * Table columns configuration
 * @type {Array}
 */
const columns = [
  { name: 'ingredient', align: 'left', label: 'Ingrediente', field: row => row.ingredient?.name, sortable: true },
  { name: 'quantity', align: 'right', label: 'Cantidad', field: 'quantity', sortable: true, format: val => formatNumber(val) },
  { name: 'unit', align: 'left', label: 'Unidad', field: row => row.unit_of_measure?.name || '-' },
  { name: 'waste', align: 'right', label: '% Merma', field: 'waste_percentage', format: val => `${val}%` },
  { name: 'cost_impact', align: 'right', label: 'Costo Impacto', field: row => `$${formatNumber(calculateItemCost(row))}` },
  { name: 'actions', align: 'center', label: 'Acciones' }
]

/**
 * List of recipe ingredients
 * @type {Ref<Array>}
 */
const recipeItems = ref([])

/**
 * Loading state for the table
 * @type {Ref<boolean>}
 */
const loadingTable = ref(false)

/**
 * Loading state for the form submission
 * @type {Ref<boolean>}
 */
const loadingForm = ref(false)

/**
 * State for cost recalculation process
 * @type {Ref<boolean>}
 */
const calculating = ref(false)

/**
 * State for the add ingredient modal visibility
 * @type {Ref<boolean>}
 */
const openAddIngredient = ref(false)

/**
 * Currently editing ingredient row
 * @type {Ref<Object|null>}
 */
const editingIngredient = ref(null)

/**
 * Selected product reference from props
 * @type {Ref<Object>}
 */
const productSelected = ref(props.product)

/**
 * Sum of all ingredient costs (total recipe cost)
 * @type {Ref<number>}
 */
const totalRecipeCost = ref(0)

/**
 * List of products for ingredient selection
 * @type {Ref<Array>}
 */
const productOptions = ref([])

/**
 * List of available units of measure
 * @type {Ref<Array>}
 */
const unitOfMeasures = ref([])

/**
 * Form data for adding/editing an ingredient
 * @type {Ref<Object>}
 */
const ingredientForm = ref({
  ingredient: null,
  quantity: 1,
  unit_of_measure_id: null,
  waste_percentage: 0
})

/**
 * Pagination configuration for the ingredients table
 * @type {Ref<Object>}
 */
const paginationConfig = ref({
  rowsPerPage: 0 // All
})

// Computed
/**
 * Calculates the estimated cost of the current ingredient in the form
 * @type {ComputedRef<number|string>}
 */
const estimatedCost = computed(() => {
  if (!ingredientForm.value.ingredient || !ingredientForm.value.quantity || !ingredientForm.value.unit_of_measure_id) return 0

  const ingredient = ingredientForm.value.ingredient
  const fromUomId = ingredientForm.value.unit_of_measure_id
  const toUomId = ingredient.unit_of_measure_id

  const factor = getConversionFactor(fromUomId, toUomId)

  const baseCost = parseFloat(ingredient.cost || 0)
  const qty = parseFloat(ingredientForm.value.quantity)
  const waste = parseFloat(ingredientForm.value.waste_percentage || 0)

  // Cost = (Quantity * Factor) * UnitCost * (1 + Waste)
  return ((qty * factor) * baseCost * (1 + waste / 100)).toFixed(2)
})

// Methods
/**
 * Gets the conversion factor between two units of measure
 * @params {number} fromUomId Source unit ID
 * @params {number} toUomId Target unit ID
 * @return {number} Conversion factor
 */
const getConversionFactor = (fromUomId, toUomId) => {
  if (fromUomId === toUomId) return 1

  const fromUom = unitOfMeasures.value.find(u => u.id === fromUomId)
  const toUom = unitOfMeasures.value.find(u => u.id === toUomId)

  if (!fromUom || !toUom) return 1

  // Logic: (quantity * fromRatio) / toRatio
  // Factor = fromRatio / toRatio
  return (parseFloat(fromUom.ratio) / parseFloat(toUom.ratio)) || 1
}
/**
 * Loads the ingredients associated with the current product recipe
 * @return {Promise<void>}
 */
const loadRecipeItems = async () => {
  if (!productSelected.value?.id) return
  loadingTable.value = true
  try {
    const { data } = await api.get(`products/${productSelected.value.id}/recipe`)
    recipeItems.value = data
  } catch (error) {
    notify('Error al cargar ingredientes', 'negative')
  } finally {
    loadingTable.value = false
  }
}

/**
 * Sets default unit of measure when a product is selected as an ingredient
 * @params {Object} product Selected product object
 * @return {void}
 */
const setProduct = (product) => {
  ingredientForm.value.unit_of_measure_id = product.unit_of_measure_id
}

/**
 * Loads all available units of measure
 * @return {Promise<void>}
 */
const loadUnitOfMeasures = async () => {
  try {
    const { data } = await api.get('unit-of-measures')
    unitOfMeasures.value = data.data || data
  } catch (error) {
    console.error(error)
  }
}

/**
 * Filters products for the ingredient selection dropdown
 * @params {string} val Search term
 * @params {Function} update Quasar update function
 * @return {Promise<void>}
 */
const filterProducts = async (val, update) => {
  try {
    const { data } = await api.get('products', {
      params: {
        dataSearch: { name: val },
        perPage: 40,
        paginate: true,
        sortBy: 'name',
        sortOrder: 'asc',
        whereIn: {
          product_type: ['RAW_MATERIAL', 'SUB_RECIPE']
        }
      }
    })
    productOptions.value = data.data.filter(p => p.id !== productSelected.value.id)
    update()
  } catch (error) {
    console.error(error)
    update()
  }
}

/**
 * Calculates the product cost per base unit based on the total recipe cost and yield
 * @return {void}
 */
const calculateCostByUnitOfMeasure = () => {
  const cost = parseFloat(totalRecipeCost.value) || 0
  const servings = parseFloat(productSelected.value.servings) || 0

  if (servings === 0) {
    productSelected.value.cost = 0
    return
  }

  const yieldUnitId = productSelected.value.yield_unit_id
  const baseUnitId = productSelected.value.unit_of_measure_id

  let factor = 1
  if (yieldUnitId && baseUnitId) {
    factor = getConversionFactor(yieldUnitId, baseUnitId)
  }

  // Cost per base unit = TotalCost / (QuantityInBaseUnits)
  // QuantityInBaseUnits = Servings * Factor(Yield -> Base)
  productSelected.value.cost = (cost / (servings * factor)).toFixed(2)
}

/**
 * Saves or updates an ingredient in the current product recipe
 * @return {Promise<void>}
 */
const saveIngredient = async () => {
  loadingForm.value = true
  try {
    const payload = {
      product_id: productSelected.value.id,
      ingredient_id: ingredientForm.value.ingredient.id,
      quantity: ingredientForm.value.quantity,
      unit_of_measure_id: ingredientForm.value.unit_of_measure_id,
      waste_percentage: ingredientForm.value.waste_percentage
    }

    if (editingIngredient.value) {
      await api.put(`products/${productSelected.value.id}/recipe/${editingIngredient.value.id}`, payload)
      notify('Ingrediente actualizado', 'positive')
    } else {
      await api.post(`products/${productSelected.value.id}/recipe`, payload)
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

/**
 * Prepares the form with ingredient data for editing
 * @params {Object} row Ingredient row data
 * @return {void}
 */
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

/**
 * Deletes an ingredient from the recipe
 * @params {Object} row Ingredient row data
 * @return {Promise<void>}
 */
const deleteIngredient = async (row) => {
  try {
    await api.delete(`products/${productSelected.value.id}/recipe/${row.id}`)
    notify('Ingrediente eliminado', 'positive')
    await loadRecipeItems()
    await calculateCost()
  } catch (error) {
    notify('Error al eliminar', 'negative')
  }
}

/**
 * Triggers a cost recalculation for the entire recipe from the server
 * @return {Promise<void>}
 */
const calculateCost = async () => {
  calculating.value = true
  try {
    const { data } = await api.get(`products/${productSelected.value.id}/recipe/cost`)
    totalRecipeCost.value = data.cost
    calculateCostByUnitOfMeasure()
  } catch (error) {
    notify('Error al calcular costo', 'negative')
  } finally {
    calculating.value = false
  }
}

/**
 * Closes the ingredient modal and resets form data
 * @return {void}
 */
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

/**
 * Calculates the individual cost impact of a single ingredient row
 * @params {Object} row Ingredient row data
 * @return {number|string} Calculated cost
 */
const calculateItemCost = (row) => {
  if (!row.ingredient || !row.quantity) return 0
  const fromUomId = row.unit_of_measure_id
  const toUomId = row.ingredient.unit_of_measure_id
  const factor = getConversionFactor(fromUomId, toUomId)

  return ((row.quantity * factor) * row.ingredient.cost * (1 + row.waste_percentage / 100)).toFixed(2)
}

onMounted(async () => {
  loadRecipeItems()
  await loadUnitOfMeasures()
  // Calculate initial cost if servings are set
  if (productSelected.value.servings) {
    await calculateCost()
  }
})
</script>
