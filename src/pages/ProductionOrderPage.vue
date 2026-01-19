<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" label="Nueva Orden de Producción" @click="openNewOrder = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Órdenes de Producción"
          row-key="id"
          :columns="columns"
          :rows="orders"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="viewOrder"
          @request="setPagination"
          no-data-label="Registro no encontrado"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top-right>
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)">
                {{ getStatusLabel(props.row.status) }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Modal para nueva orden -->
    <q-dialog
      v-model="openNewOrder"
      persistent
      backdrop-filter="blur(4px)"
      :maximized="$q.screen.lt.sm"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card
        :style="$q.screen.gt.xs ? 'width: 1200px; max-width: 95vw; height: 90vh;' : ''"
        :class="[$q.dark.isActive ? 'bg-dark' : 'bg-grey-1', $q.screen.gt.xs ? 'rounded-lg shadow-24' : '']"
        class="column no-wrap overflow-hidden"
      >
        <q-form @submit="createOrder" class="column full-height">
          <!-- Professional Compact Header -->
          <q-card-section class="bg-primary text-white q-py-sm q-px-md row items-center no-wrap shadow-2">
            <q-icon name="precision_manufacturing" size="xs" class="q-mr-sm" />
            <div class="column">
              <div class="text-subtitle1 text-weight-bold line-height-1">Nueva Orden de Producción</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeNewOrderModal" v-close-popup size="sm" />
          </q-card-section>

          <q-card-section class="col scroll q-pa-md">
            <div class="row q-col-gutter-md full-height">

              <!-- LEFT SIDEBAR (1/3): Order Summary & General Info -->
              <div class="col-12 col-md-4">
                <div class="column q-gutter-y-sm">

                  <!-- Metadata Card -->
                  <q-card flat bordered class="shadow-1 rounded-lg" :class="$q.dark.isActive ? 'bg-grey-9 border-grey-8' : 'bg-white'">
                    <q-card-section class="q-pa-sm">
                      <div class="text-caption text-weight-bold q-mb-sm flex items-center text-primary">
                        <q-icon name="info" size="xs" class="q-mr-xs" />
                        INFORMACIÓN GENERAL
                      </div>
                      <div class="column q-gutter-y-sm">
                        <q-select
                          outlined
                          v-model="orderForm.branch_office_id"
                          :options="branchOffices"
                          option-value="id"
                          option-label="name"
                          emit-value
                          map-options
                          dense
                          label="Sucursal"
                          :bg-color="$q.dark.isActive ? 'grey-10' : 'grey-1'"
                        />
                        <q-input
                          outlined
                          v-model="orderForm.planned_date"
                          dense
                          label="Fecha/Hora Estimada"
                          type="datetime-local"
                          stack-label
                          :bg-color="$q.dark.isActive ? 'grey-10' : 'grey-1'"
                        />
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Total Investment Summary Card (Compact) -->
                  <q-card flat class="bg-primary text-white shadow-2 rounded-lg">
                    <q-card-section class="q-pa-none">
                      <div class="opacity-8">TOTAL INVERSIÓN</div>
                      <div class="text-h5 text-weight-bolder">
                        ${{ formatNumber(totalOrderCost) }}
                      </div>
                      <div class="text-caption opacity-7">
                        {{ orderForm.items.length }} ítems en lista
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Cart Sidebar: Items in Order (Tight) -->
                  <q-card flat bordered class="column rounded-lg shadow-1 flex-grow overflow-hidden" :class="$q.dark.isActive ? 'bg-grey-9 border-grey-8' : 'bg-white'">
                    <q-toolbar class="bg-grey-1 text-weight-bold text-overline" :class="$q.dark.isActive ? 'bg-grey-8' : ''" style="min-height: 32px">
                      <q-icon name="shopping_cart" size="xs" class="q-mr-xs" />
                      RECETAS SELECCIONADAS
                    </q-toolbar>
                    <q-separator />
                    <q-scroll-area style="height: 190px">
                      <q-list v-if="orderForm.items.length > 0" separator dense>
                        <q-item v-for="(item, index) in orderForm.items" :key="index" class="q-py-xs">
                          <q-item-section>
                            <q-item-label class="text-caption text-weight-bold">{{ getProductName(item.product_id) }}</q-item-label>
                            <q-item-label caption class="text-primary text-weight-bold" style="font-size: 10px">
                              {{ formatNumber(item.planned_quantity) }} un. | ${{ formatNumber(getItemCost(item)) }}
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <div class="row q-gutter-none">
                              <q-btn flat round dense color="grey-7" icon="edit" size="xs" @click="editConfiguredItem(item)" />
                              <q-btn flat round dense color="negative" icon="delete" size="xs" @click="removeConfiguredItem(index)" />
                            </div>
                          </q-item-section>
                        </q-item>
                      </q-list>
                      <div v-else class="flex flex-center column q-pa-lg text-grey-5 text-center">
                        <q-icon name="inventory_2" size="2em" class="q-mb-xs" />
                        <div class="text-caption">Lista vacía</div>
                      </div>
                    </q-scroll-area>
                  </q-card>
                </div>
              </div>

              <!-- MAIN PANEL (2/3): Catalog or Configurator -->
              <div class="col-12 col-md-8">
                <q-slide-transition mode="out-in">

                  <!-- Catalog View -->
                  <div v-if="!selectedProductConfig" class="column full-height">
                    <q-card flat bordered class="column full-height rounded-lg shadow-1" :class="$q.dark.isActive ? 'bg-grey-9 border-grey-8' : 'bg-white'">
                      <q-toolbar class="q-px-md q-py-sm">
                         <q-icon name="list" size="sm" class="text-primary q-mr-sm"/>
                         <q-toolbar-title class="text-subtitle1 text-weight-bold">Catálogo de Recetas</q-toolbar-title>
                         <q-input
                           v-model="filterProducts"
                           debounce="300"
                           placeholder="Buscar receta..."
                           outlined
                           dense
                           class="q-ml-md"
                           style="width: 250px"
                           :bg-color="$q.dark.isActive ? 'grey-10' : 'white'"
                         >
                           <template v-slot:prepend><q-icon name="search" /></template>
                         </q-input>
                      </q-toolbar>
                      <q-separator />
                      <div class="col overflow-auto">
                        <q-table
                          :rows="productsWithRecipe"
                          :columns="productSelectionColumns"
                          row-key="id"
                          flat
                          dense
                          :filter="filterProducts"
                          :loading="loadingProducts"
                          :pagination="{ rowsPerPage: 15 }"
                          @row-click="(evt, row) => selectProductForConfig(row)"
                          class="cursor-pointer sticky-header"
                          style="max-height: calc(100vh - 260px)"
                        >
                          <template v-slot:body="props">
                            <q-tr :props="props" @click="selectProductForConfig(props.row)" class="cursor-pointer hover-accent transition-all">
                               <q-td key="name" :props="props">
                                  <div class="text-weight-bold">{{ props.row.name }}</div>
                                  <div class="text-caption text-grey-6">{{ props.row.category?.name || 'Varios' }}</div>
                               </q-td>
                               <q-td key="stock" :props="props" class="text-right">
                                  <q-badge :color="props.row.stock < props.row.minimum_stock ? 'red-2' : 'green-2'"
                                           :text-color="props.row.stock < props.row.minimum_stock ? 'red-9' : 'green-9'"
                                           class="text-weight-bold">
                                    {{ formatNumber(props.row.stock) }} {{ props.row.unit_of_measure?.acronym }}
                                  </q-badge>
                               </q-td>
                               <q-td key="min_stock" :props="props" class="text-right">
                                  {{ formatNumber(props.row.minimum_stock) }} {{ props.row.unit_of_measure?.acronym }}
                               </q-td>
                               <q-td key="difference" :props="props" class="text-right">
                                  <q-chip :color="getStockStatusColor(props.row)" size="sm" text-color="white" class="text-weight-bold">
                                    {{ props.row.stock - props.row.minimum_stock }}
                                  </q-chip>
                               </q-td>
                            </q-tr>
                          </template>
                        </q-table>
                      </div>
                    </q-card>
                  </div>

                  <!-- Configurator View (Compact) -->
                  <div v-else class="column full-height">
                    <q-card flat bordered class="column full-height rounded-lg shadow-1" :class="$q.dark.isActive ? 'bg-grey-9 border-grey-8' : 'bg-white'">
                      <q-toolbar class="q-pa-sm bg-grey-1" :class="$q.dark.isActive ? 'bg-grey-8' : ''" style="min-height: 48px">
                        <q-btn flat round icon="arrow_back" dense @click="selectedProductConfig = null" color="primary" size="sm" class="q-mr-sm" />
                        <div class="column">
                          <div class="text-weight-bold">{{ selectedProductConfig.name }}</div>
                          <div class="text-caption text-primary line-height-1" style="font-size: 10px">Configuración Detallada</div>
                        </div>
                      </q-toolbar>
                      <q-separator />

                      <q-card-section class="col scroll q-pa-md">
                        <div class="row q-col-gutter-lg">
                          <!-- Config Params -->
                          <div class="col-12 col-md-5">
                            <div class="column q-gutter-y-md">
                              <div class="text-caption text-weight-bold flex items-center text-grey-7">
                                <q-icon name="tune" color="primary" class="q-mr-xs" />
                                PARÁMETROS DE LOTE
                              </div>
                              <q-input
                                outlined
                                v-model.number="configQuantities.units"
                                label="Cant. Recetas (Lotes)"
                                type="number"
                                dense
                                @update:model-value="updateFromUnits"
                              />
                              <q-input
                                outlined
                                v-model.number="configQuantities.portions"
                                label="Producción Estimada"
                                type="number"
                                dense
                                @update:model-value="updateFromPortions"
                              />

                              <!-- Investment Summary Inline -->
                              <div class="bg-blue-1 q-px-md q-py-sm rounded-lg border-blue-2" :class="$q.dark.isActive ? 'bg-blue-10 text-white' : 'text-blue-9'">
                                <div class="text-overline text-weight-bolder line-height-1">COSTO POR RECETA</div>
                                <div class="text-h6 text-weight-bolder font-numeric">${{ formatNumber(currentConfigCost) }}</div>
                              </div>

                              <q-btn
                                unelevated
                                color="primary"
                                :label="isEditingItem ? 'Actualizar' : 'Agregar'"
                                icon="add_circle"
                                size="md"
                                class="full-width text-weight-bold"
                                @click="confirmProductConfig"
                              />
                            </div>
                          </div>

                          <!-- Ingredients Preview (Dense List) -->
                          <div class="col-12 col-md-7">
                            <div class="text-caption text-weight-bold q-mb-xs flex items-center text-grey-7">
                              <q-icon name="list_alt" color="primary" class="q-mr-xs" />
                              REQUERIMIENTO TEÓRICO
                            </div>
                            <q-list dense separator class="rounded-lg bg-grey-1" :class="$q.dark.isActive ? 'bg-grey-10' : ''">
                              <template v-if="loadingRecipe">
                                <q-item v-for="i in 3" :key="i" class="q-py-sm">
                                  <q-item-section>
                                    <q-skeleton type="text" width="60%" height="20px" />
                                    <q-skeleton type="text" width="40%" height="14px" class="q-mt-xs" />
                                  </q-item-section>
                                  <q-item-section side>
                                    <q-skeleton type="rect" width="60px" height="20px" class="rounded-borders" />
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-else-if="recipePreviewItems.length > 0">
                                <q-item v-for="(item, idx) in recipePreviewItems" :key="idx" class="q-py-xs" style="min-height: 40px">
                                  <q-item-section>
                                    <q-item-label class="text-caption text-weight-bold">{{ item.ingredient?.name }}</q-item-label>
                                  </q-item-section>
                                  <q-item-section side class="text-right">
                                    <div class="text-subtitle2 text-primary text-weight-bolder font-numeric">{{ formatNumber(item.quantity * configQuantities.units) }} {{ item.unit_of_measure?.name }}</div>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <div v-else class="q-pa-md text-center text-grey-5 text-caption">
                                Sin detalles de receta
                              </div>
                            </q-list>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </q-slide-transition>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Compact Footer Actions -->
          <q-card-actions align="right" class="q-pa-sm bg-grey-1" :class="$q.dark.isActive ? 'bg-grey-9' : ''">
            <q-btn flat label="Cancelar" color="grey-7" @click="closeNewOrderModal" v-close-popup size="sm" class="q-px-md" />
            <q-btn
              unelevated
              color="primary"
              label="Procesar Orden"
              type="submit"
              icon="send"
              size="sm"
              :loading="visible"
              :disable="!hasSelectedItems"
              class="q-px-lg text-weight-bold shadow-1"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Modal para ver orden -->
    <q-dialog v-model="openViewOrder" persistent full-width>
      <q-card style="max-width: 1200px; width: 100%;">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Orden {{ selectedOrder?.order_number }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeViewOrderModal" />
        </q-card-section>

        <q-card-section v-if="selectedOrder">
          <div class="row q-col-gutter-md">
            <!-- Información general -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Información</div>
                  <q-separator class="q-my-sm"/>
                  <div class="q-gutter-sm">
                    <div><strong>Estado:</strong>
                      <q-badge :color="getStatusColor(selectedOrder.status)">
                        {{ getStatusLabel(selectedOrder.status) }}
                      </q-badge>
                    </div>
                    <div><strong>Depósito:</strong> {{ selectedOrder.deposit?.name }}</div>
                    <div><strong>Sucursal:</strong> {{ selectedOrder.branch_office?.name || 'N/A' }}</div>
                    <div><strong>Fecha planeada:</strong> {{ formatDate(selectedOrder.planned_date) }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Productos a fabricar -->
            <div class="col-12 col-md-8">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Recetas a Fabricar</div>
                  <q-separator class="q-my-sm"/>
                  <q-list bordered separator>
                    <q-item v-for="item in selectedOrder.items" :key="item.id">
                      <q-item-section>
                        <q-item-label>{{ item.product?.name }}</q-item-label>
                        <q-item-label caption>
                          Planeado: {{ item.planned_quantity }} | Producido: {{ item.produced_quantity }}
                        </q-item-label>
                      </q-item-section>
                       <q-item-section side>
                           <q-btn flat round color="primary" icon="receipt_long" size="sm" @click="viewRecipeForProduct(item)">
                              <q-tooltip>Ver detalle de receta</q-tooltip>
                           </q-btn>
                       </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <!-- Requerimientos de materiales -->
            <div class="col-12">
              <q-card flat bordered>
                <q-card-section>
                  <div class="row items-center q-gutter-x-sm">
                    <div class="text-h6">Requerimientos de Materiales</div>
                    <q-space/>
                    <div class="row items-center q-gutter-x-xs">
                       <div class="text-caption text-grey-7 q-mr-xs">Unificar:</div>
                       <q-btn outline color="primary" dense icon="expand_less" label="MAX" @click="convertAllToRefUnit('max')" size="sm" class="q-px-sm">
                          <q-tooltip>Convertir todo a unidad máxima</q-tooltip>
                       </q-btn>
                       <q-btn outline color="primary" dense icon="expand_more" label="MIN" @click="convertAllToRefUnit('min')" size="sm" class="q-px-sm">
                          <q-tooltip>Convertir todo a unidad mínima</q-tooltip>
                       </q-btn>
                    </div>
                    <q-separator vertical class="q-mx-sm" v-if="!$q.screen.lt.sm"/>
                    <q-btn color="primary" label="Ver Lista de Picking" @click="viewPickingList" size="sm"/>
                  </div>
                  <q-separator class="q-my-sm"/>
                  <q-table
                    :rows="materialRequirements"
                    :columns="materialColumns"
                    row-key="id"
                    flat
                    dense
                  >
                    <template v-slot:body-cell-required_quantity="props">
                      <q-td :props="props">
                        <div class="row items-center justify-end no-wrap">
                          <span class="text-weight-bold q-mr-xs">{{ formatNumber(props.row.required_quantity) }}</span>
                          <span class="text-grey-6" style="font-size: 0.8rem">{{ props.row.unit_of_measure?.acronym }}</span>
                        </div>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-available_quantity="props">
                      <q-td :props="props">
                         <span class="text-weight-medium">{{ formatNumber(props.row.available_quantity) }}</span>
                         <span class="text-grey-6 q-ml-xs" style="font-size: 0.8rem">{{ props.row.unit_of_measure?.acronym }}</span>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-status="props">
                      <q-td :props="props">
                        <q-badge :color="props.row.status === 'SUFFICIENT' ? 'positive' : 'negative'" class="text-weight-bold">
                          {{ props.row.status === 'SUFFICIENT' ? 'Suficiente' : 'Insuficiente' }}
                        </q-badge>
                      </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="secondary" label="Cerrar" @click="closeViewOrderModal" />
          <q-btn color="info" icon="print" label="Imprimir" @click="downloadPdf" :loading="downloadingPdf"/>
          <q-btn
            v-if="selectedOrder?.status === 'PLANNED' || selectedOrder?.status === 'IN_PROGRESS'"
            color="positive"
            label="Completar Producción"
            @click="openCompleteModal = true"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para completar producción -->
    <q-dialog v-model="openCompleteModal" persistent>
      <q-card style="width: 600px; max-width: 80vw;">
        <q-form @submit="completeProduction">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Completar Producción</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="openCompleteModal = false" />
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle1 q-mb-md">Ingrese las cantidades realmente producidas:</div>
            <div class="q-gutter-md">
              <div v-for="item in selectedOrder?.items" :key="item.id">
                <q-input
                  filled
                  v-model.number="completionForm[item.id]"
                  :label="item.product?.name"
                  type="number"
                  step="0.01"
                  min="0"
                  :hint="`Planeado: ${item.planned_quantity}`"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn color="secondary" label="Cancelar" @click="openCompleteModal = false" />
            <q-btn color="positive" label="Completar" type="submit" :loading="completing"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Modal para seleccionar producto -->
    <q-dialog v-model="openProductPicker" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Seleccionar Producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="openProductPicker = false" />
        </q-card-section>

        <q-card-section>
          <q-select
            filled
            v-model="selectedProductForOrder"
            :options="productsWithRecipe"
            option-value="id"
            option-label="name"
            label="Producto"
            use-input
            @filter="filterProductsWithRecipe"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="secondary" label="Cancelar" @click="openProductPicker = false" />
          <q-btn color="primary" label="Agregar" @click="addProductToOrder" :disable="!selectedProductForOrder"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Modal para detalle de receta -->
    <q-dialog v-model="openRecipeDetail">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Detalle de Receta: {{ selectedRecipeProduct?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2 q-mb-md">Base para fabricación de: {{ selectedRecipeQuantity }} unidades</div>
          <q-table
            :rows="selectedRecipeItems"
            :columns="[
              { name: 'ingredient', align: 'left', label: 'Ingrediente', field: row => row.ingredient?.name },
              { name: 'quantity', align: 'right', label: 'Cantidad', field: 'quantity' },
              { name: 'uom', align: 'left', label: 'Unidad', field: row => row.unit_of_measure?.acronym }
            ]"
            row-key="id"
            flat
            dense
            separator="horizontal"
          >
            <template v-slot:body-cell-quantity="props">
              <q-td :props="props" class="text-weight-bold">
                {{ formatNumber(props.row.quantity) }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { Notify } from 'quasar'
import { api } from 'boot/axios'
import { authentication } from 'src/stores/module-authentication'

const orders = ref([])
const selectedOrder = ref(null)
const materialRequirements = ref([])
const deposits = ref([])
const branchOffices = ref([])
const productsWithRecipe = ref([])
const allProductsWithRecipe = ref([])
const filter = ref('')
const visible = ref(false)
const downloadingPdf = ref(false)
const loadingProducts = ref(false)
const completing = ref(false)
const openNewOrder = ref(false)
const openViewOrder = ref(false)
const openCompleteModal = ref(false)
const openRecipeDetail = ref(false)
const selectedRecipeProduct = ref(null)
const selectedRecipeQuantity = ref(0)
const selectedRecipeItems = ref([])
const openProductPicker = ref(false)
const selectedProductForOrder = ref(null)
const filterProducts = ref('')
const loadingRecipe = ref(false)
const store = authentication()

const { branchOffice } = store
/**
 * State for product being configured
 * @type {Ref<Object|null>}
 */
const selectedProductConfig = ref(null)

/**
 * State for quantities in configuration mode
 * @type {Ref<{units: number, portions: number}>}
 */
const configQuantities = ref({
  units: 1,
  portions: 1
})

/**
 * Preview items for the selected product recipe
 * @type {Ref<Array>}
 */
const recipePreviewItems = ref([])

/**
 * Flag to indicate if we are editing an existing item in the order
 * @type {Ref<boolean>}
 */
const isEditingItem = ref(false)

/**
 * Index of the item being edited
 * @type {Ref<number>}
 */
const editingIndex = ref(-1)

const orderForm = ref({
  branch_office_id: branchOffice.id,
  planned_date: null,
  items: []
})

/**
 * Computed to check if order has items
 * @type {ComputedRef<boolean>}
 */
const hasSelectedItems = computed(() => {
  return orderForm.value.items.length > 0
})

/**
 * Computed to calculate total order cost
 * @type {ComputedRef<number>}
 */
const totalOrderCost = computed(() => {
  return orderForm.value.items.reduce((acc, item) => {
    return acc + getItemCost(item)
  }, 0)
})

/**
 * Computed to calculate cost of the product currently being configured
 * @type {ComputedRef<number>}
 */
const currentConfigCost = computed(() => {
  if (!selectedProductConfig.value) return 0
  const cost = parseFloat(selectedProductConfig.value.cost) || 0
  return cost * configQuantities.value.units
})

/**
 * Helper to get cost for a specific order item
 * @params {Object} item
 * @return {number}
 */
const getItemCost = (item) => {
  const product = allProductsWithRecipe.value.find(p => p.id === item.product_id)
  if (!product) return 0
  const cost = parseFloat(product.cost) || 0
  return cost * item.planned_quantity
}

const formatNumber = (val) => {
  return parseFloat(val || 0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const completionForm = ref({})

const params = ref({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 20
})

const paginationConfig = ref({
  rowsPerPage: 20,
  rowsNumber: 20,
  page: 1,
  sortBy: 'id',
  descending: true
})

const columns = [
  { name: 'order_number', align: 'left', label: 'Número', field: 'order_number', sortable: true },
  { name: 'status', align: 'center', label: 'Estado', field: 'status', sortable: true },
  { name: 'planned_date', align: 'left', label: 'Fecha Planeada', field: 'planned_date', sortable: true, format: val => formatDate(val) },
  { name: 'deposit', align: 'left', label: 'Depósito', field: row => row.deposit?.name }
]

const materialColumns = [
  { name: 'product', align: 'left', label: 'Material', field: row => row.product?.name },
  { name: 'required_quantity', align: 'right', label: 'Requerido', field: 'required_quantity' },
  { name: 'available_quantity', align: 'right', label: 'Disponible', field: 'available_quantity' },
  { name: 'status', align: 'center', label: 'Estado', field: 'status' }
]

const productSelectionColumns = [
  { name: 'name', align: 'left', label: 'Producto', field: 'name', sortable: true },
  { name: 'stock', align: 'right', label: 'Stock Actual', field: 'stock', sortable: true },
  { name: 'min_stock', align: 'right', label: 'Stock Mín.', field: 'minimum_stock', sortable: true },
  { name: 'difference', align: 'right', label: 'Diferencia', field: 'difference', sortable: true }
]

const getStatusColor = (status) => {
  const colors = {
    DRAFT: 'grey',
    PLANNED: 'blue',
    IN_PROGRESS: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'red'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    DRAFT: 'Borrador',
    PLANNED: 'Planeado',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('es-ES')
}

const getOrders = async () => {
  visible.value = true
  try {
    const { data } = await api.get('production-orders', { params: params.value })
    orders.value = data.data || data
    paginationConfig.value.rowsNumber = data.total || orders.value.length
  } catch (err) {
    Notify.create({
      message: err.message,
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    visible.value = false
  }
}

const viewOrder = async (event, row) => {
  try {
    const { data } = await api.get(`production-orders/${row.id}`)
    selectedOrder.value = data
    const materialsResponse = await api.get(`production-orders/${row.id}/materials`)
    materialRequirements.value = materialsResponse.data.requirements

    openViewOrder.value = true
  } catch (err) {
    Notify.create({
      message: 'Error al cargar la orden',
      icon: 'warning',
      color: 'negative'
    })
  }
}

const createOrder = async () => {
  visible.value = true
  try {
    // API expects product_id and planned_quantity for each item
    const payload = {
      ...orderForm.value,
      items: orderForm.value.items.map(item => ({
        product_id: item.product_id,
        planned_quantity: item.planned_quantity
      }))
    }

    await api.post('production-orders', payload)
    Notify.create({
      message: 'Orden creada exitosamente',
      icon: 'check_circle',
      color: 'positive'
    })
    closeNewOrderModal()
    getOrders()
  } catch (err) {
    Notify.create({
      message: err.response?.data?.message || 'Error al crear la orden',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    visible.value = false
  }
}

const completeProduction = async () => {
  completing.value = true
  try {
    const items = Object.entries(completionForm.value).map(([id, producedQuantity]) => ({
      id: parseInt(id),
      produced_quantity: producedQuantity
    }))

    await api.post(`production-orders/${selectedOrder.value.id}/complete`, { items })

    Notify.create({
      message: 'Producción completada exitosamente',
      icon: 'check_circle',
      color: 'positive'
    })

    openCompleteModal.value = false
    closeViewOrderModal()
    getOrders()
  } catch (err) {
    Notify.create({
      message: err.response?.data?.message || 'Error al completar la producción',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    completing.value = false
  }
}

const viewPickingList = async () => {
  try {
    const { data } = await api.get(`production-orders/${selectedOrder.value.id}/picking-list`)
    console.log('Picking List:', data)
    // Aquí podrías abrir un modal o descargar un PDF
    Notify.create({
      message: 'Lista de picking generada (ver consola)',
      icon: 'info',
      color: 'info'
    })
  } catch (err) {
    Notify.create({
      message: 'Error al generar lista de picking',
      icon: 'warning',
      color: 'negative'
    })
  }
}

const downloadPdf = async () => {
  if (!selectedOrder.value) return
  downloadingPdf.value = true
  try {
    const response = await api.get(`production-orders/${selectedOrder.value.id}/pdf`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `orden-produccion-${selectedOrder.value.order_number}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    Notify.create({
      message: 'Error al descargar PDF',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    downloadingPdf.value = false
  }
}

/**
 * Converts all requirements to their suggested reference unit (max/min)
 * @params {string} mode
 */
const convertAllToRefUnit = async (mode) => {
  if (!selectedOrder.value) return

  visible.value = true
  try {
    const { data } = await api.get(`production-orders/${selectedOrder.value.id}/materials`, {
      params: { mode }
    })

    materialRequirements.value = data.requirements

    Notify.create({
      message: `Materiales unificados en unidad ${mode === 'max' ? 'máxima' : 'mínima'}`,
      color: 'positive',
      icon: mode === 'max' ? 'expand_less' : 'expand_more'
    })
  } catch (error) {
    Notify.create({
      message: 'Error al convertir masivamente',
      color: 'negative'
    })
  } finally {
    visible.value = false
  }
}

const viewRecipeForProduct = async (item) => {
  selectedRecipeProduct.value = item.product
  selectedRecipeQuantity.value = item.planned_quantity
  loadingRecipe.value = true
  try {
    const { data } = await api.get(`products/${item.product_id}/recipe`)

    selectedRecipeItems.value = data.map(r => ({
      ...r,
      quantity: r.quantity * item.planned_quantity
    }))

    openRecipeDetail.value = true
  } catch (error) {
    Notify.create({ message: 'Error al cargar receta', color: 'negative' })
  } finally {
    loadingRecipe.value = false
  }
}

const addProductToOrder = () => {
  if (selectedProductForOrder.value) {
    orderForm.value.items.push({
      product_id: selectedProductForOrder.value.id,
      planned_quantity: 1
    })
    selectedProductForOrder.value = null
    openProductPicker.value = false
  }
}

const closeNewOrderModal = () => {
  openNewOrder.value = false
  orderForm.value = {
    branch_office_id: null,
    planned_date: null,
    items: []
  }
  // Reset configuration state
  selectedProductConfig.value = null
  recipePreviewItems.value = []
}

/**
 * Closes the view order modal and resets related state.
 */
const closeViewOrderModal = () => {
  openViewOrder.value = false
  selectedOrder.value = null
  materialRequirements.value = []
}

/**
 * Selects a product for configuration in the new order modal.
 * @param {Object} product - The product object to configure.
 */
const selectProductForConfig = async (product) => {
  selectedProductConfig.value = product
  configQuantities.value = {
    units: 1, // Default to 1 unit
    portions: parseFloat(product.servings || 1) // Default portions from servings
  }
  isEditingItem.value = false
  editingIndex.value = -1

  loadingRecipe.value = true
  try {
    const { data } = await api.get(`products/${product.id}/recipe`)
    recipePreviewItems.value = data
  } catch (error) {
    Notify.create({ message: 'Error al cargar ingredientes', color: 'negative' })
    recipePreviewItems.value = []
  } finally {
    loadingRecipe.value = false
  }
}

/**
 * Update portions based on units (batch count)
 */
const updateFromUnits = (val) => {
  const servings = parseFloat(selectedProductConfig.value.servings) || 1
  configQuantities.value.portions = parseFloat((val * servings).toFixed(2))
}

/**
 * Update units (batch count) based on portion count
 */
const updateFromPortions = (val) => {
  const servings = parseFloat(selectedProductConfig.value.servings) || 1
  configQuantities.value.units = parseFloat((val / servings).toFixed(2))
}

/**
 * Get product name for already selected items list
 * @params {number} id
 */
const getProductName = (id) => {
  const p = allProductsWithRecipe.value.find(prod => prod.id === id)
  return p ? p.name : 'Unknown Product'
}

/**
 * Confirms current configuration and adds/updates the order item list
 */
const confirmProductConfig = () => {
  if (configQuantities.value.units <= 0) {
    Notify.create({ message: 'La cantidad debe ser mayor a 0', color: 'warning' })
    return
  }

  const item = {
    product_id: selectedProductConfig.value.id,
    planned_quantity: configQuantities.value.units,
    planned_servings: configQuantities.value.portions
  }

  if (isEditingItem.value && editingIndex.value > -1) {
    orderForm.value.items[editingIndex.value] = item
  } else {
    // If product already in list, update it instead of adding duplicate
    const existingIndex = orderForm.value.items.findIndex(i => i.product_id === item.product_id)
    if (existingIndex > -1) {
      orderForm.value.items[existingIndex] = item
    } else {
      orderForm.value.items.push(item)
    }
  }

  // Exit config mode
  selectedProductConfig.value = null
  isEditingItem.value = false
  editingIndex.value = -1
}

/**
 * Re-enters configuration mode for an item already in the list
 * @params {Object} item
 */
const editConfiguredItem = (item) => {
  const product = allProductsWithRecipe.value.find(p => p.id === item.product_id)
  if (product) {
    selectProductForConfig(product)
    configQuantities.value = {
      units: item.planned_quantity,
      portions: item.planned_servings
    }
    isEditingItem.value = true
    editingIndex.value = orderForm.value.items.findIndex(i => i.product_id === item.product_id)
  }
}

/**
 * Removes an item from the planned items list
 * @params {number} index
 */
const removeConfiguredItem = (index) => {
  orderForm.value.items.splice(index, 1)
}

const filterProductsWithRecipe = (val, update) => {
  update(() => {
    if (val === '') {
      productsWithRecipe.value = allProductsWithRecipe.value
    } else {
      const needle = val.toLowerCase()
      productsWithRecipe.value = allProductsWithRecipe.value.filter(
        v => v.name.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const loadDeposits = async () => {
  try {
    const { data } = await api.get('deposits', { params: { perPage: 100 } })
    deposits.value = data.data || data
  } catch (err) {
    console.error(err)
  }
}

const loadBranchOffices = async () => {
  try {
    const { data } = await api.get('branch-offices', { params: { perPage: 100 } })
    branchOffices.value = data.data || data
  } catch (err) {
    console.error(err)
  }
}

const loadProductsWithRecipe = async () => {
  loadingProducts.value = true
  try {
    const params = {
      perPage: 1000,
      page: 1,
      paginate: true,
      stock: true,
      withStock: true,
      whereIn: {
        product_type: ['SUB_RECIPE', 'FINISHED_GOOD']
      }
    }

    // Pass sorting filters
    if (orderForm.value.branch_office_id) {
      params.branch_office_id = orderForm.value.branch_office_id
    }

    const { data } = await api.get('products', { params })

    // Map to include local state for the form
    allProductsWithRecipe.value = data.data.map(p => ({
      ...p,
      planned_quantity: 0,
      // If backend doesn't filter stock by deposit, we might need to assume 'stock' field is correct for the request context
      // The ProductsController seems to respect branch_office_id or standard filters.
      // Ensuring numbers
      stock: parseFloat(p.stock || p.stock_quantity || 0), // Adjust field name if necessary based on API response
      minimum_stock: parseFloat(p.minimum_stock || 0)
    }))

    productsWithRecipe.value = allProductsWithRecipe.value
  } catch (err) {
    console.error(err)
  } finally {
    loadingProducts.value = false
  }
}

// Watchers for reloading products when context changes
watch(() => orderForm.value.branch_office_id, () => {
  if (openNewOrder.value) loadProductsWithRecipe()
})

watch(openNewOrder, (val) => {
  if (val) loadProductsWithRecipe()
})
const getStockStatusColor = (row) => {
  const diff = row.stock - row.minimum_stock
  if (diff < 0) return 'negative'
  if (diff === 0) return 'warning'
  return 'positive'
}
const setPagination = (data) => {
  params.value.sortOrder = data.pagination.descending ? 'desc' : 'asc'
  params.value.page = data.pagination.page
  params.value.sortBy = data.pagination.sortBy ?? params.value.sortBy
  params.value.perPage = data.pagination.rowsPerPage
  paginationConfig.value = data.pagination
  getOrders()
}

onMounted(() => {
  getOrders()
  loadDeposits()
  loadBranchOffices()
  loadProductsWithRecipe()
})
</script>

<style scoped>
.font-numeric { font-variant-numeric: tabular-nums; }
.transition-all { transition: all 0.3s ease-in-out; }

.hover-accent:hover {
  background-color: rgba(var(--q-primary-rgb), 0.05) !important;
}

.sticky-header :deep(thead tr th) {
  position: sticky;
  z-index: 10;
  top: 0;
  background: #f5f5f5;
  font-weight: 700;
}

.body--dark .sticky-header :deep(thead tr th) {
  background: #1d1d1d;
}

.border-blue-2 {
  border: 1px solid rgba(21, 101, 192, 0.2);
}

.q-border-dark {
  border-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 599px) {
  .text-h3 { font-size: 2rem; }
}
</style>
