<template>
  <div class="q-pa-md">
    <!-- Page Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6 text-weight-bold">
          <q-icon
            name="precision_manufacturing"
            size="md"
            color="primary"
            class="q-mr-sm"
          />
          Órdenes de Producción
        </div>
        <div class="text-caption text-grey-6">
          Gestiona y monitorea las órdenes de producción
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          label="Nueva Orden"
          @click="openNewOrder = true"
          icon="add_circle"
          class="q-px-lg"
        />
      </div>
    </div>
    <!-- Main Table Card -->
    <q-card flat bordered class="rounded-lg">
      <q-table
        row-key="id"
        :columns="columns"
        :rows="orders"
        :loading="visible"
        :filter="filter"
        binary-state-sort
        v-model:pagination="paginationConfig"
        @row-click="viewOrder"
        @request="setPagination"
        no-data-label="No hay órdenes de producción"
        flat
        class="production-table"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary">
            <q-spinner-gears size="40px" color="primary" />
          </q-inner-loading>
        </template>
        <template v-slot:top>
          <div class="row full-width items-center q-pa-sm">
            <div class="text-subtitle1 text-weight-bold q-mr-auto">
              <q-icon name="list" size="sm" class="q-mr-xs" />
              Listado de Órdenes
            </div>
            <q-input
              outlined
              dense
              debounce="500"
              v-model="filter"
              placeholder="Buscar orden..."
              class="q-ml-md"
              style="width: 250px"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" class="cursor-pointer" @click="filter = ''" />
              </template>
            </q-input>
          </div>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" @click="viewOrder($event, props.row)" class="cursor-pointer table-row-hover">
            <q-td key="order_number" :props="props">
              <div class="text-weight-bold text-primary">{{ props.row.order_number }}</div>
            </q-td>
            <q-td key="status" :props="props">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                size="sm"
                :icon="getStatusIcon(props.row.status)"
                class="text-weight-medium"
              >
                {{ getStatusLabel(props.row.status) }}
              </q-chip>
            </q-td>
            <q-td key="planned_date" :props="props">
              <div class="row items-center no-wrap">
                <q-icon name="event" size="xs" color="grey-6" class="q-mr-xs" />
                {{ formatDate(props.row.planned_date) }}
              </div>
            </q-td>
            <q-td key="deposit" :props="props">
              {{ props.row.deposit?.name || 'No disponible' }}
            </q-td>
            <q-td key="actions" :props="props" auto-width>
              <q-btn flat round dense color="primary" icon="visibility" size="sm">
                <q-tooltip>Ver detalles</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

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
                        <q-select
                          outlined
                          v-model="orderForm.responsible_user_id"
                          :options="users"
                          option-value="id"
                          option-label="name"
                          emit-value
                          map-options
                          dense
                          clearable
                          label="Responsable"
                          :bg-color="$q.dark.isActive ? 'grey-10' : 'grey-1'"
                          @filter="filterUsers"
                          use-input
                          input-debounce="300"
                        >
                          <template v-slot:prepend>
                            <q-icon name="person" size="xs" />
                          </template>
                          <template v-slot:no-option>
                            <q-item>
                              <q-item-section class="text-grey">Sin resultados</q-item-section>
                            </q-item>
                          </template>
                        </q-select>
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

    <!-- Modal para ver orden (Rediseñado) -->
    <q-dialog
      v-model="openViewOrder"
      persistent
      :maximized="$q.screen.lt.md"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card
        :style="$q.screen.gt.sm ? 'width: 1200px; max-width: 95vw;' : ''"
        :class="[$q.dark.isActive ? 'bg-dark' : 'bg-grey-1']"
        class="column no-wrap"
      >
        <!-- Header con gradiente -->
        <q-card-section class="bg-primary text-white q-py-md">
          <div class="row items-center no-wrap">
            <q-icon name="precision_manufacturing" size="md" class="q-mr-md" />
            <div class="column">
              <div class="text-h6 text-weight-bold">Orden {{ selectedOrder?.order_number }}</div>
              <div class="text-caption opacity-8">
                {{ formatDate(selectedOrder?.created_at) }}
              </div>
            </div>
            <q-space />
            <q-badge
              :color="getStatusColor(selectedOrder?.status)"
              class="text-weight-bold q-px-md q-py-xs"
              style="font-size: 0.9rem"
            >
              {{ getStatusLabel(selectedOrder?.status) }}
            </q-badge>
            <q-btn icon="close" flat round dense @click="closeViewOrderModal" class="q-ml-md" />
          </div>
        </q-card-section>

        <!-- Loading overlay -->
        <q-inner-loading :showing="loadingOrderDetail" color="primary">
          <q-spinner-gears size="50px" color="primary" />
          <div class="q-mt-sm text-primary">Cargando detalles...</div>
        </q-inner-loading>

        <q-card-section v-if="selectedOrder && !loadingOrderDetail" class="col scroll q-pa-md">
          <div class="row q-col-gutter-md">

            <!-- Panel izquierdo: Info + Acciones rápidas -->
            <div class="col-12 col-md-4">
              <div class="column q-gutter-y-md">

                <!-- Información General -->
                <q-card flat bordered class="rounded-lg" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
                  <q-card-section class="q-pa-md">
                    <div class="text-overline text-primary text-weight-bold q-mb-sm">
                      <q-icon name="info" size="xs" class="q-mr-xs" />
                      INFORMACIÓN
                    </div>
                    <q-list dense>
                      <q-item class="q-px-none">
                        <q-item-section avatar>
                          <q-icon name="store" color="grey-7" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Sucursal</q-item-label>
                          <q-item-label class="text-weight-bold">{{ selectedOrder.branch_office?.name || 'N/A' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item class="q-px-none">
                        <q-item-section avatar>
                          <q-icon name="warehouse" color="grey-7" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Depósito</q-item-label>
                          <q-item-label class="text-weight-bold">{{ selectedOrder.deposit?.name || 'No disponible' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item class="q-px-none">
                        <q-item-section avatar>
                          <q-icon name="person" color="grey-7" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Responsable</q-item-label>
                          <q-item-label class="text-weight-bold">
                            {{ selectedOrder.responsible_user?.name || 'Sin asignar' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item class="q-px-none">
                        <q-item-section avatar>
                          <q-icon name="event" color="grey-7" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Fecha Planeada</q-item-label>
                          <q-item-label class="text-weight-bold">{{ formatDate(selectedOrder.planned_date) }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Cambiar Estado -->
                <q-card flat bordered class="rounded-lg" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
                  <q-card-section class="q-pa-md">
                    <div class="text-overline text-primary text-weight-bold q-mb-sm">
                      <q-icon name="sync" size="xs" class="q-mr-xs" />
                      CAMBIAR ESTADO
                    </div>
                    <q-select
                      v-model="newStatus"
                      :options="statusOptions"
                      option-value="value"
                      option-label="label"
                      emit-value
                      map-options
                      outlined
                      dense
                      :loading="updatingStatus"
                      :disable="updatingStatus"
                    >
                      <template v-slot:prepend>
                        <q-icon :name="getStatusIcon(newStatus)" :color="getStatusColor(newStatus)" />
                      </template>
                    </q-select>
                    <q-btn
                      unelevated
                      color="primary"
                      label="Actualizar Estado"
                      icon="save"
                      class="full-width q-mt-sm"
                      :loading="updatingStatus"
                      :disable="newStatus === selectedOrder?.status"
                      @click="updateOrderStatus"
                    />
                  </q-card-section>
                </q-card>

                <!-- Acciones Rápidas -->
                <q-card flat bordered class="rounded-lg" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
                  <q-card-section class="q-pa-md">
                    <div class="text-overline text-primary text-weight-bold q-mb-sm">
                      <q-icon name="flash_on" size="xs" class="q-mr-xs" />
                      ACCIONES
                    </div>
                    <div class="column q-gutter-y-sm">
                      <q-btn
                        outline
                        color="info"
                        icon="print"
                        label="Imprimir Orden"
                        class="full-width"
                        :loading="downloadingPdf"
                        @click="downloadPdf"
                      />
                      <q-btn-dropdown
                        outline
                        color="deep-purple"
                        icon="menu_book"
                        label="Imprimir Recetas"
                        class="full-width"
                        :loading="downloadingRecipes"
                      >
                        <q-list>
                          <q-item clickable v-close-popup @click="downloadAllRecipesPdf">
                            <q-item-section avatar>
                              <q-icon name="library_books" color="deep-purple" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>Todas las Recetas</q-item-label>
                              <q-item-label caption>{{ selectedOrder?.items?.length || 0 }} recetas en PDF</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-separator />
                          <q-item-label header class="text-weight-bold">Recetas Individuales</q-item-label>
                          <q-item
                            v-for="item in selectedOrder?.items"
                            :key="item.id"
                            clickable
                            v-close-popup
                            @click="downloadRecipePdf(item.id)"
                          >
                            <q-item-section avatar>
                              <q-icon name="restaurant" color="grey-7" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ item.product?.name }}</q-item-label>
                              <q-item-label caption>{{ item.planned_quantity }} unidades</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>
                      <q-btn
                        outline
                        color="secondary"
                        icon="edit"
                        label="Editar Orden"
                        class="full-width"
                        :disable="selectedOrder?.status === 'COMPLETED' || selectedOrder?.status === 'CANCELLED'"
                        @click="openEditOrderModal"
                      />
                      <q-btn
                        v-if="selectedOrder?.status === 'PLANNED' || selectedOrder?.status === 'IN_PROGRESS'"
                        unelevated
                        color="positive"
                        icon="check_circle"
                        label="Completar Producción"
                        class="full-width"
                        @click="openCompleteModal = true"
                      />
                      <q-btn
                        v-if="selectedOrder?.status !== 'CANCELLED' && selectedOrder?.status !== 'COMPLETED'"
                        flat
                        color="negative"
                        icon="cancel"
                        label="Cancelar Orden"
                        class="full-width"
                        @click="confirmCancelOrder"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Panel derecho: Recetas y Materiales -->
            <div class="col-12 col-md-8">
              <div class="column q-gutter-y-md">

                <!-- Productos a Fabricar -->
                <q-card flat bordered class="rounded-lg" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
                  <q-card-section class="q-pa-md">
                    <div class="row items-center q-mb-md">
                      <q-icon name="inventory_2" size="sm" color="primary" class="q-mr-sm" />
                      <div class="text-subtitle1 text-weight-bold">Recetas a Fabricar</div>
                      <q-space />
                      <q-badge color="primary" class="q-px-sm">
                        {{ selectedOrder?.items?.length || 0 }} ítems
                      </q-badge>
                    </div>
                    <q-list bordered separator class="rounded-borders">
                      <q-item v-for="item in selectedOrder?.items" :key="item.id">
                        <q-item-section avatar>
                          <q-avatar color="primary" text-color="white" size="md">
                            <q-icon name="restaurant" size="xs" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold">{{ item.product?.name }}</q-item-label>
                          <q-item-label caption>
                            <span class="text-primary">Planeado: {{ item.planned_quantity }}</span>
                            <span class="q-mx-sm">|</span>
                            <span :class="item.produced_quantity > 0 ? 'text-positive' : 'text-grey'">
                              Producido: {{ item.produced_quantity || 0 }}
                            </span>
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

                <!-- Requerimientos de Materiales -->
                <q-card flat bordered class="rounded-lg" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
                  <q-card-section class="q-pa-md">
                    <div class="row items-center q-mb-md">
                      <q-icon name="list_alt" size="sm" color="primary" class="q-mr-sm" />
                      <div class="text-subtitle1 text-weight-bold">Requerimientos de Materiales</div>
                      <q-space />
                      <div class="row q-gutter-x-xs">
                        <q-btn outline color="primary" dense icon="expand_less" size="sm" @click="convertAllToRefUnit('max')">
                          <q-tooltip>Unificar a unidad máxima</q-tooltip>
                        </q-btn>
                        <q-btn outline color="primary" dense icon="expand_more" size="sm" @click="convertAllToRefUnit('min')">
                          <q-tooltip>Unificar a unidad mínima</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <q-table
                      :rows="materialRequirements"
                      :columns="materialColumns"
                      row-key="id"
                      flat
                      dense
                      :loading="loadingMaterials"
                      hide-pagination
                      :rows-per-page-options="[0]"
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
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'">
          <q-btn flat label="Cerrar" color="grey-7" @click="closeViewOrderModal" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para editar orden -->
    <q-dialog v-model="openEditOrder" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-form @submit="saveEditOrder">
          <q-card-section class="row items-center bg-secondary text-white">
            <q-icon name="edit" size="sm" class="q-mr-sm" />
            <div class="text-h6">Editar Orden {{ selectedOrder?.order_number }}</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="openEditOrder = false" />
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <q-select
              outlined
              v-model="editForm.branch_office_id"
              :options="branchOffices"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              label="Sucursal"
            />
            <q-input
              outlined
              v-model="editForm.planned_date"
              label="Fecha/Hora Planeada"
              type="datetime-local"
              stack-label
            />

            <div class="text-subtitle2 q-mt-md">Ítems de la orden</div>
            <q-list bordered separator class="rounded-borders">
              <q-item v-for="(item, index) in editForm.items" :key="index">
                <q-item-section>
                  <q-item-label>{{ getProductName(item.product_id) }}</q-item-label>
                </q-item-section>
                <q-item-section side style="width: 120px">
                  <q-input
                    v-model.number="item.planned_quantity"
                    type="number"
                    dense
                    outlined
                    min="1"
                  />
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense color="negative" icon="delete" @click="editForm.items.splice(index, 1)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" color="grey-7" @click="openEditOrder = false" />
            <q-btn unelevated color="primary" label="Guardar Cambios" type="submit" :loading="savingEdit" icon="save" />
          </q-card-actions>
        </q-form>
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
import { Notify, useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { authentication } from 'src/stores/module-authentication'

/**
 * Quasar instance
 * @type {Object}
 */
const $q = useQuasar()

/**
 * List of production orders
 * @type {Ref<Array>}
 */
const orders = ref([])

/**
 * Currently selected production order for viewing/editing
 * @type {Ref<Object|null>}
 */
const selectedOrder = ref(null)

/**
 * List of material requirements for the selected order
 * @type {Ref<Array>}
 */
const materialRequirements = ref([])

/**
 * List of available deposits
 * @type {Ref<Array>}
 */
const deposits = ref([])

/**
 * List of available branch offices
 * @type {Ref<Array>}
 */
const branchOffices = ref([])

/**
 * Filtered list of products that have a recipe
 * @type {Ref<Array>}
 */
const productsWithRecipe = ref([])

/**
 * Unfiltered list of all products that have a recipe
 * @type {Ref<Array>}
 */
const allProductsWithRecipe = ref([])

/**
 * Search filter for the orders table
 * @type {Ref<string>}
 */
const filter = ref('')

/**
 * Loading state for general actions
 * @type {Ref<boolean>}
 */
const visible = ref(false)

/**
 * Loading state for PDF downloads
 * @type {Ref<boolean>}
 */
const downloadingPdf = ref(false)

/**
 * Loading state for recipes PDF downloads
 * @type {Ref<boolean>}
 */
const downloadingRecipes = ref(false)

/**
 * Loading state for products list
 * @type {Ref<boolean>}
 */
const loadingProducts = ref(false)

/**
 * Loading state for completion process
 * @type {Ref<boolean>}
 */
const completing = ref(false)

/**
 * Visibility state for the new order modal
 * @type {Ref<boolean>}
 */
const openNewOrder = ref(false)

/**
 * Visibility state for the view order modal
 * @type {Ref<boolean>}
 */
const openViewOrder = ref(false)

/**
 * Visibility state for the completion modal
 * @type {Ref<boolean>}
 */
const openCompleteModal = ref(false)

/**
 * Visibility state for the recipe detail modal
 * @type {Ref<boolean>}
 */
const openRecipeDetail = ref(false)

/**
 * Currently selected product recipe for detailed view
 * @type {Ref<Object|null>}
 */
const selectedRecipeProduct = ref(null)

/**
 * Quantity for the selected recipe in detailed view
 * @type {Ref<number>}
 */
const selectedRecipeQuantity = ref(0)

/**
 * Filtered list of users for responsible assignment
 * @type {Ref<Array>}
 */
const users = ref([])

/**
 * Full list of users
 * @type {Ref<Array>}
 */
const allUsers = ref([])

/**
 * Visibility state for the edit order modal
 * @type {Ref<boolean>}
 */
const openEditOrder = ref(false)

/**
 * Loading state for edit form submission
 * @type {Ref<boolean>}
 */
const savingEdit = ref(false)

/**
 * Loading state for order details
 * @type {Ref<boolean>}
 */
const loadingOrderDetail = ref(false)

/**
 * Loading state for material requirements
 * @type {Ref<boolean>}
 */
const loadingMaterials = ref(false)

/**
 * Loading state for status updates
 * @type {Ref<boolean>}
 */
const updatingStatus = ref(false)

/**
 * Target status value for update
 * @type {Ref<string>}
 */
const newStatus = ref('')

/**
 * State for the order edit form
 * @type {Ref<Object>}
 */
const editForm = ref({
  branch_office_id: null,
  planned_date: null,
  items: []
})

/**
 * Available status options for filter and updates
 * @type {Array<Object>}
 */
const statusOptions = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PLANNED', label: 'Planeado' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'CANCELLED', label: 'Cancelado' }
]

/**
 * List of items in the selected recipe
 * @type {Ref<Array>}
 */
const selectedRecipeItems = ref([])

/**
 * Search filter for the product catalog
 * @type {Ref<string>}
 */
const filterProducts = ref('')

/**
 * Loading state for recipe data
 * @type {Ref<boolean>}
 */
const loadingRecipe = ref(false)

/**
 * Authentication store instance
 * @type {Object}
 */
const store = authentication()

/**
 * Current branch office from session
 * @type {Object}
 */
const { branchOffice } = store

/**
 * State for product being configured
 * @type {Ref<Object|null>}
 */
const selectedProductConfig = ref(null)

/**
 * State for quantities in configuration mode (batch units and resulting portions)
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
 * Index of the item being edited in the orders list
 * @type {Ref<number>}
 */
const editingIndex = ref(-1)

/**
 * Form state for creating a new production order
 * @type {Ref<Object>}
 */
const orderForm = ref({
  branch_office_id: branchOffice.id,
  responsible_user_id: null,
  planned_date: null,
  items: []
})

/**
 * Computed property to check if the current order form has any items selected
 * @type {ComputedRef<boolean>}
 */
const hasSelectedItems = computed(() => {
  return orderForm.value.items.length > 0
})

/**
 * Computed property to calculate the total cost of the order based on items
 * @type {ComputedRef<number>}
 */
const totalOrderCost = computed(() => {
  return orderForm.value.items.reduce((acc, item) => {
    return acc + getItemCost(item)
  }, 0)
})

/**
 * Computed property to calculate the cost of the product currently being configured
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

/**
 * Form state for production completion (actual quantities produced)
 * @type {Ref<Object>}
 */
const completionForm = ref({})

/**
 * Base parameters for fetching and sorting orders
 * @type {Ref<Object>}
 */
const params = ref({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 20
})

/**
 * Pagination configuration for the main table
 * @type {Ref<Object>}
 */
const paginationConfig = ref({
  rowsPerPage: 20,
  rowsNumber: 20,
  page: 1,
  sortBy: 'id',
  descending: true
})

/**
 * Column definitions for the production orders table
 * @type {Array<Object>}
 */
const columns = [
  { name: 'order_number', align: 'left', label: 'Número', field: 'order_number', sortable: true },
  { name: 'status', align: 'center', label: 'Estado', field: 'status', sortable: true },
  { name: 'planned_date', align: 'left', label: 'Fecha Planeada', field: 'planned_date', sortable: true, format: val => formatDate(val) },
  { name: 'deposit', align: 'left', label: 'Depósito', field: row => row.deposit?.name },
  { name: 'actions', align: 'center', label: 'Acciones', field: 'actions' }
]

/**
 * Column definitions for the material requirements table
 * @type {Array<Object>}
 */
const materialColumns = [
  { name: 'product', align: 'left', label: 'Material', field: row => row.product?.name },
  { name: 'required_quantity', align: 'right', label: 'Requerido', field: 'required_quantity' },
  { name: 'available_quantity', align: 'right', label: 'Disponible', field: 'available_quantity' },
  { name: 'status', align: 'center', label: 'Estado', field: 'status' }
]

/**
 * Column definitions for the product selection table (catalog)
 * @type {Array<Object>}
 */
const productSelectionColumns = [
  { name: 'name', align: 'left', label: 'Producto', field: 'name', sortable: true },
  { name: 'stock', align: 'right', label: 'Stock Actual', field: 'stock', sortable: true },
  { name: 'min_stock', align: 'right', label: 'Stock Mín.', field: 'minimum_stock', sortable: true },
  { name: 'difference', align: 'right', label: 'Diferencia', field: 'difference', sortable: true }
]

/**
 * Returns the corresponding color for a given status
 * @params {string} status
 * @return {string}
 */
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

/**
 * Returns the user-friendly label for a status code
 * @params {string} status
 * @return {string}
 */
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

/**
 * Gets the icon for a given status
 * @param {String} status - The status value
 * @return {String} - Material icon name
 */
const getStatusIcon = (status) => {
  const icons = {
    DRAFT: 'edit_note',
    PLANNED: 'schedule',
    IN_PROGRESS: 'pending',
    COMPLETED: 'check_circle',
    CANCELLED: 'cancel'
  }
  return icons[status] || 'help'
}

/**
 * Formats a date string to a localized readable format
 * @params {string} date
 * @return {string}
 */
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('es-ES')
}

/**
 * Fetches the list of production orders from the API
 * @return {Promise<void>}
 */
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

/**
 * Load users for responsible selection
 */
const loadUsers = async () => {
  try {
    const { data } = await api.get('users', { params: { perPage: 100 } })
    allUsers.value = data.data || data
    users.value = allUsers.value
  } catch (err) {
    console.error('Error loading users:', err)
  }
}

/**
 * Filter users for autocomplete
 * @param {String} val - Search query
 * @param {Function} update - Update callback
 */
const filterUsers = (val, update) => {
  update(() => {
    if (val === '') {
      users.value = allUsers.value
    } else {
      const needle = val.toLowerCase()
      users.value = allUsers.value.filter(
        u => u.name.toLowerCase().includes(needle)
      )
    }
  })
}

/**
 * Download individual recipe PDF
 * @param {Number} itemId - Production order item ID
 */
const downloadRecipePdf = async (itemId) => {
  if (!selectedOrder.value) return
  downloadingRecipes.value = true
  try {
    const response = await api.get(`production-orders/${selectedOrder.value.id}/recipe-pdf/${itemId}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `receta-${itemId}-${selectedOrder.value.order_number}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    Notify.create({
      message: 'Error al descargar la receta',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    downloadingRecipes.value = false
  }
}

/**
 * Download all recipes PDF
 */
const downloadAllRecipesPdf = async () => {
  if (!selectedOrder.value) return
  downloadingRecipes.value = true
  try {
    const response = await api.get(`production-orders/${selectedOrder.value.id}/recipes-pdf`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `todas-recetas-${selectedOrder.value.order_number}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    Notify.create({
      message: 'Error al descargar las recetas',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    downloadingRecipes.value = false
  }
}

/**
 * Loads and displays detailed info for a specific production order
 * @params {Event} event
 * @params {Object} row
 * @return {Promise<void>}
 */
const viewOrder = async (event, row) => {
  openViewOrder.value = true
  loadingOrderDetail.value = true
  loadingMaterials.value = true

  try {
    const { data } = await api.get(`production-orders/${row.id}`)
    selectedOrder.value = data
    newStatus.value = data.status

    const materialsResponse = await api.get(`production-orders/${row.id}/materials`)
    materialRequirements.value = materialsResponse.data.requirements
  } catch (err) {
    Notify.create({
      message: 'Error al cargar la orden',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    loadingOrderDetail.value = false
    loadingMaterials.value = false
  }
}

/**
 * Submits the create order form to the API
 * @return {Promise<void>}
 */
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

/**
 * Submits completed production quantities to finalize records
 * @return {Promise<void>}
 */
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

/**
 * Generates and downloads the production order PDF
 * @return {Promise<void>}
 */
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

/**
 * Fetches and displays detail for a specific product recipe
 * @params {Object} item
 * @return {Promise<void>}
 */
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
/**
 * Closes the new order modal and resets the form state
 * @return {void}
 */
const closeNewOrderModal = () => {
  openNewOrder.value = false
  orderForm.value = {
    branch_office_id: null,
    responsible_user_id: null,
    planned_date: null,
    items: []
  }
  // Reset configuration state
  selectedProductConfig.value = null
  recipePreviewItems.value = []
}

/**
 * Closes the view order modal and resets related state
 * @return {void}
 */
const closeViewOrderModal = () => {
  openViewOrder.value = false
  selectedOrder.value = null
  materialRequirements.value = []
  newStatus.value = ''
}

/**
 * Submits a request to update the status of the currently selected order
 * @return {Promise<void>}
 */
const updateOrderStatus = async () => {
  if (!selectedOrder.value || newStatus.value === selectedOrder.value.status) return

  updatingStatus.value = true
  try {
    await api.patch(`production-orders/${selectedOrder.value.id}`, {
      status: newStatus.value
    })

    selectedOrder.value.status = newStatus.value

    Notify.create({
      message: 'Estado actualizado correctamente',
      icon: 'check_circle',
      color: 'positive'
    })

    getOrders()
  } catch (err) {
    Notify.create({
      message: err.response?.data?.message || 'Error al actualizar el estado',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    updatingStatus.value = false
  }
}

/**
 * Opens the edit order modal and populates the form with existing order data
 * @return {void}
 */
const openEditOrderModal = () => {
  if (!selectedOrder.value) return

  editForm.value = {
    branch_office_id: selectedOrder.value.branch_office_id,
    planned_date: selectedOrder.value.planned_date
      ? new Date(selectedOrder.value.planned_date).toISOString().slice(0, 16)
      : null,
    items: selectedOrder.value.items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      planned_quantity: item.planned_quantity
    }))
  }

  openEditOrder.value = true
}

/**
 * Submits the edit form to save changes to an existing production order
 * @return {Promise<void>}
 */
const saveEditOrder = async () => {
  if (!selectedOrder.value) return

  savingEdit.value = true
  try {
    const payload = {
      branch_office_id: editForm.value.branch_office_id,
      planned_date: editForm.value.planned_date,
      items: editForm.value.items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        planned_quantity: item.planned_quantity
      }))
    }

    const { data } = await api.put(`production-orders/${selectedOrder.value.id}`, payload)
    selectedOrder.value = data

    Notify.create({
      message: 'Orden actualizada correctamente',
      icon: 'check_circle',
      color: 'positive'
    })

    openEditOrder.value = false
    getOrders()
  } catch (err) {
    Notify.create({
      message: err.response?.data?.message || 'Error al guardar los cambios',
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    savingEdit.value = false
  }
}

/**
 * Prompts for confirmation and cancels the currently viewed production order
 * @return {void}
 */
const confirmCancelOrder = () => {
  $q.dialog({
    title: 'Cancelar Orden',
    message: '¿Está seguro que desea cancelar esta orden de producción? Esta acción no se puede deshacer.',
    cancel: {
      label: 'No, mantener',
      color: 'grey'
    },
    ok: {
      label: 'Sí, cancelar',
      color: 'negative'
    },
    persistent: true
  }).onOk(async () => {
    updatingStatus.value = true
    try {
      await api.patch(`production-orders/${selectedOrder.value.id}`, {
        status: 'CANCELLED'
      })

      selectedOrder.value.status = 'CANCELLED'
      newStatus.value = 'CANCELLED'

      Notify.create({
        message: 'Orden cancelada correctamente',
        icon: 'check_circle',
        color: 'positive'
      })

      getOrders()
    } catch (err) {
      Notify.create({
        message: err.response?.data?.message || 'Error al cancelar la orden',
        icon: 'warning',
        color: 'negative'
      })
    } finally {
      updatingStatus.value = false
    }
  })
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
 * Updates the estimated portions based on the number of units (batches)
 * @params {number} val
 * @return {void}
 */
const updateFromUnits = (val) => {
  const servings = parseFloat(selectedProductConfig.value.servings) || 1
  configQuantities.value.portions = parseFloat((val * servings).toFixed(2))
}

/**
 * Updates the number of units (batches) based on the target portion count
 * @params {number} val
 * @return {void}
 */
const updateFromPortions = (val) => {
  const servings = parseFloat(selectedProductConfig.value.servings) || 1
  configQuantities.value.units = parseFloat((val / servings).toFixed(2))
}

/**
 * Returns the name of a product given its ID
 * @params {number} id
 * @return {string}
 */
const getProductName = (id) => {
  const p = allProductsWithRecipe.value.find(prod => prod.id === id)
  return p ? p.name : 'Unknown Product'
}

/**
 * Confirms the current product configuration and adds or updates it in the order items list
 * @return {void}
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
 * Opens configuration mode for an item already present in the order list
 * @params {Object} item
 * @return {void}
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
 * Removes an item from the planned items list by its index
 * @params {number} index
 * @return {void}
 */
const removeConfiguredItem = (index) => {
  orderForm.value.items.splice(index, 1)
}

/**
 * Loads available deposits from the API
 * @return {Promise<void>}
 */
const loadDeposits = async () => {
  try {
    const { data } = await api.get('deposits', { params: { perPage: 100 } })
    deposits.value = data.data || data
  } catch (err) {
    console.error(err)
  }
}

/**
 * Loads available branch offices from the API
 * @return {Promise<void>}
 */
const loadBranchOffices = async () => {
  try {
    const { data } = await api.get('branch-offices', { params: { perPage: 100 } })
    branchOffices.value = data.data || data
  } catch (err) {
    console.error(err)
  }
}

/**
 * Fetches products that have recipes defined, including their current stock and requirements
 * @return {Promise<void>}
 */
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
      // Ensure numbers
      stock: parseFloat(p.stock || p.stock_quantity || 0),
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
/**
 * Returns the corresponding color for stock status based on minimum levels
 * @params {Object} row
 * @return {string}
 */
const getStockStatusColor = (row) => {
  const diff = row.stock - row.minimum_stock
  if (diff < 0) return 'negative'
  if (diff === 0) return 'warning'
  return 'positive'
}
/**
 * Handles table pagination and sorting changes
 * @params {Object} data
 */
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
  loadUsers()
})
</script>

<style scoped>
.font-numeric { font-variant-numeric: tabular-nums; }
.transition-all { transition: all 0.3s ease-in-out; }

/* Stat Cards */
.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.body--dark .stat-card {
  background: #1e1e1e;
  border-color: #333;
}

/* Table Styling */
.production-table {
  border-radius: 12px;
}

.production-table :deep(thead tr th) {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  background: #f8f9fa;
}

.body--dark .production-table :deep(thead tr th) {
  background: #2d2d2d;
}

.table-row-hover {
  transition: all 0.2s ease;
}

.table-row-hover:hover {
  background-color: rgba(var(--q-primary-rgb), 0.08) !important;
}

.body--dark .table-row-hover:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

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

/* Rounded cards */
.rounded-lg {
  border-radius: 12px !important;
}

/* Responsive */
@media (max-width: 599px) {
  .text-h3 { font-size: 2rem; }
  .stat-card .text-h6 { font-size: 1.1rem; }
}
</style>
