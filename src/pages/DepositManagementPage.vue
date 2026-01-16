<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <!-- Deposit Info Card -->
          <div class="col-8">
            <q-card
              flat
              class="subscription-info-card-modern"
              :class="{
                'card-warning': deposits.length >= maxDeposits - 1 && deposits.length < maxDeposits,
                'card-danger': deposits.length >= maxDeposits,
                'card-success': deposits.length < maxDeposits - 1,
                'cursor-pointer': true
              }"
            >
              <q-card-section class="row items-center q-pa-md no-wrap">
                <div class="icon-container q-mr-md">
                  <q-icon
                    name="warehouse"
                    size="28px"
                    color="white"
                  />
                </div>
                <div class="info-content">
                  <div class="text-overline text-weight-medium opacity-80">Depósitos</div>
                  <div class="text-h5 text-weight-bold q-mb-xs">
                    {{ deposits.length }} <span class="text-body1 opacity-60">/ {{ maxDeposits }}</span>
                  </div>
                  <div v-if="currentSubscription" class="text-caption text-weight-medium opacity-80">
                    Plan: {{ currentSubscription.plan?.name || 'Free' }}
                  </div>
                  <div v-if="hasBranchOffice" class="text-caption text-weight-medium opacity-80">
                    Sucursal: {{ currentBranchOfficeName }}
                  </div>
                  <div v-else class="text-caption text-weight-medium opacity-80 text-warning">
                    Sin sucursal asignada
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Add Button -->
          <div class="col-auto">
            <q-btn
              unelevated
              rounded
              color="primary"
              icon="add_circle"
              label="Agregar Depósito"
              size="md"
              class="add-branch-btn-modern"
              @click="handleAddClick"
            >
              <q-tooltip v-if="isLimitReached">
                {{ limitTooltipMessage }}
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div class="q-gutter-y-md">
          <div class="col-12">
              <!-- Deposits List -->
            <q-table
              title="Depósitos"
              row-key="id"
              :columns="columns"
              :rows="deposits"
              :loading="visible"
              :no-data-label="visible ? 'Cargando...' : 'No se encontraron depósitos'"
              :rows-per-page-options="[10, 20, 50, 100]"
              :filter="depositFilter"
              binary-state-sort
            >
              <template v-slot:body-cell-name="props">
                <q-td :props="props">
                  <span class="text-primary text-weight-bold">
                    {{ props.value }}
                  </span>
                </q-td>
              </template>
              
              <template v-slot:loading>
                <q-inner-loading showing color="primary" />
              </template>
              
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat round icon="more_vert" color="primary">
                    <q-menu>
                      <q-list style="min-width: 150px">
                        <q-item clickable v-close-popup @click="viewDepositDetails(props.row)">
                          <q-item-section avatar>
                            <q-icon name="visibility" color="info" />
                          </q-item-section>
                          <q-item-section>Ver Detalle</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable v-close-popup @click="editDeposit(props.row)">
                          <q-item-section avatar>
                            <q-icon name="edit" />
                          </q-item-section>
                          <q-item-section>Editar</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable v-close-popup @click="deleteDeposit(props.row)">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section class="text-negative">Eliminar</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-td>
              </template>
              
              <template v-slot:top-right>
                <q-btn
                  color="primary"
                  @click="dialogFilterDeposits = true"
                  icon="filter_alt"
                  round
                  outline
                  size="md"
                  class="shadow-1 q-mr-sm"
                >
                  <q-tooltip>Filtrar</q-tooltip>
                </q-btn>
                <q-input filled dense debounce="500" v-model="depositFilter" placeholder="Buscar">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>
            </q-table>
          </div>
        </div>

        <!-- Filter Dialog -->
        <q-dialog v-model="dialogFilterDeposits" position="right" seamless>
          <q-card style="width: 400px; max-width: 80vw;">
            <q-card-section class="bg-primary text-white row items-center justify-between">
              <div class="text-h6">
                <q-icon name="filter_alt" class="q-mr-sm" />
                Filtros
              </div>
              <q-btn
                icon="close"
                flat
                round
                dense
                @click="dialogFilterDeposits = false"
              />
            </q-card-section>

            <q-card-section class="q-pt-sm scroll" style="max-height: calc(100vh - 200px);">
              <div class="column q-gutter-y-md">
                <div>
                  <div class="text-subtitle2 text-grey-7 q-mb-sm">
                    <q-icon name="search" size="xs" class="q-mr-xs" />
                    Búsqueda
                  </div>
                  <q-input
                    v-model="depositFilters.name"
                    label="Nombre"
                    filled
                    dense
                    clearable
                  />
                </div>

                <q-input
                  v-model="depositFilters.code"
                  label="Código"
                  filled
                  dense
                  clearable
                />

                <q-input
                  v-model="depositFilters.address"
                  label="Dirección"
                  filled
                  dense
                  clearable
                />
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                color="secondary"
                label="Limpiar"
                @click="clearDepositFilters"
              />
              <q-btn
                color="negative"
                label="Cerrar"
                @click="dialogFilterDeposits = false"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Add/Edit Deposit Dialog -->
        <q-dialog v-model="openAddDeposit" persistent>
          <q-card style="width: 700px; max-width: 80vw;">
            <q-form @submit="saveDeposit">
              <q-card-section class="row items-center bg-primary text-white">
                <div class="text-h6">{{ editingDepositId ? 'Editar Depósito' : 'Agregar Depósito' }}</div>
                <q-space />
                <q-btn icon="close" flat round dense @click="closeModal" />
              </q-card-section>

              <q-card-section class="row q-col-gutter-sm">
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    v-model="newDeposit.name"
                    label="Nombre"
                    filled
                    :rules="[val => !!val || 'Requerido']"
                    autofocus
                  />
                </div>
                
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    v-model="newDeposit.code"
                    label="Código"
                    filled
                    bottom-slots
                  />
                </div>
                
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    v-model="newDeposit.location"
                    label="Ubicación"
                    filled
                    bottom-slots
                    placeholder="Ej: Edificio A, Piso 2"
                  />
                </div>
                
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-select
                    v-model="newDeposit.storage_type"
                    label="Tipo de Almacenamiento"
                    filled
                    :options="storageTypeOptions"
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                    bottom-slots
                  />
                </div>
                
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-select
                    v-model="newDeposit.deposit_category"
                    label="Categoría de Depósito"
                    filled
                    :options="depositCategoryOptions"
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                    bottom-slots
                  />
                </div>
                
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    v-model="newDeposit.capacity"
                    label="Capacidad"
                    type="number"
                    filled
                    bottom-slots
                    placeholder="Ej: 1000"
                  />
                </div>
                
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <q-input
                    :value="userBranchOfficeName"
                    label="Sucursal"
                    filled
                    readonly
                    bottom-slots
                  >
                    <template v-slot:append>
                      <q-icon name="store" color="primary" />
                    </template>
                  </q-input>
                </div>
                
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <AddressComponent
                    :key="addressComponentKey"
                    :initial-address="address"
                    @address-selected="handleAddressSelected"
                  />
                </div>
              </q-card-section>

              <q-card-actions align="right" class="text-primary">
                <q-btn color="secondary" label="Cancelar" @click="closeModal" />
                <q-btn type="submit" color="primary" label="Guardar" />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-dialog>

        <!-- View Deposit Details Dialog -->
        <q-dialog v-model="viewDepositDialog" position="standard" full-width>
          <q-card style="width: 90vw; max-width: 1200px; max-height: 90vh;">
            <q-card-section class="row items-center bg-info text-white">
              <div class="text-h6">
                <q-icon name="visibility" class="q-mr-sm" />
                Detalles del Depósito: {{ selectedDeposit?.name }}
              </div>
              <q-space />
              <q-btn icon="close" flat round dense @click="closeViewDialog" />
            </q-card-section>

            <q-card-section class="scroll" style="max-height: calc(90vh - 120px);">
              <!-- Tabs for different sections -->
              <q-tabs v-model="depositTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
                <q-tab name="info" icon="info" label="Información" />
                <q-tab name="inventory" icon="inventory" label="Inventario" />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="depositTab" animated>
                <!-- Information Panel -->
                <q-tab-panel name="info" class="q-pa-none">
                  <div class="row q-col-gutter-md q-pa-md">
                    <!-- Información Básica -->
                    <div class="col-12 col-md-6">
                      <q-card flat bordered class="info-card">
                        <q-card-section>
                          <div class="text-subtitle2 text-primary q-mb-md">
                            <q-icon name="warehouse" class="q-mr-xs" />
                            Información General
                          </div>
                          <div class="row q-col-gutter-sm">
                            <div class="col-12">
                              <div class="text-caption text-grey-6">Código</div>
                              <div class="text-body1 text-weight-medium">#{{ selectedDeposit?.id || 'N/A' }}</div>
                            </div>
                            <div class="col-12">
                              <div class="text-caption text-grey-6">Nombre</div>
                              <div class="text-body1 text-weight-medium">{{ selectedDeposit?.name || 'N/A' }}</div>
                            </div>
                            <div class="col-12">
                              <div class="text-caption text-grey-6">Sucursal</div>
                              <div class="text-body1">{{ selectedDeposit?.branch_office_name || 'N/A' }}</div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-card flat bordered class="info-card">
                        <q-card-section>
                          <div class="text-subtitle2 text-primary q-mb-md">
                            <q-icon name="location_on" class="q-mr-xs" />
                            Ubicación
                          </div>
                          <div class="row q-col-gutter-sm">
                            <div class="col-12">
                              <div class="text-caption text-grey-6">Dirección</div>
                              <div class="text-body1">
                                {{ selectedDeposit?.address?.formattedAddress || selectedDeposit?.address || 'Sin dirección' }}
                              </div>
                            </div>
                            <div class="col-12">
                              <div class="text-caption text-grey-6">Ubicación Interna</div>
                              <div class="text-body1">{{ selectedDeposit?.location || 'N/A' }}</div>
                            </div>
                            <div class="col-12" v-if="selectedDeposit?.latitude || selectedDeposit?.longitude">
                              <div class="text-caption text-grey-6">Coordenadas</div>
                              <div class="text-body1">
                                {{ selectedDeposit?.latitude }}, {{ selectedDeposit?.longitude }}
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-card flat bordered class="info-card">
                        <q-card-section>
                          <div class="text-subtitle2 text-primary q-mb-md">
                            <q-icon name="category" class="q-mr-xs" />
                            Clasificación
                          </div>
                          <div class="row q-col-gutter-sm">
                            <div class="col-12">
                              <div class="text-caption text-grey-6">Tipo de Almacenamiento</div>
                              <div class="text-body1">
                                {{ getStorageTypeLabel(selectedDeposit?.type_id) || 'N/A' }}
                              </div>
                            </div>
                            <div class="col-12">
                              <div class="text-caption text-grey-6">Categoría</div>
                              <div class="text-body1">
                                {{ getDepositCategoryLabel(selectedDeposit?.category_id) || 'N/A' }}
                              </div>
                            </div>
                            <div class="col-12">
                              <div class="text-caption text-grey-6">Capacidad</div>
                              <div class="text-body1">{{ selectedDeposit?.capacity || 'N/A' }} unidades</div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-card flat bordered class="info-card">
                        <q-card-section>
                          <div class="text-subtitle2 text-primary q-mb-md">
                            <q-icon name="settings" class="q-mr-xs" />
                            Operación
                          </div>
                          <div class="row q-col-gutter-sm">
                            <div class="col-12" v-if="selectedDeposit?.responsible">
                              <div class="text-caption text-grey-6">Responsable</div>
                              <div class="text-body1">{{ selectedDeposit.responsible }}</div>
                            </div>
                            <div class="col-12" v-if="selectedDeposit?.schedule">
                              <div class="text-caption text-grey-6">Horario</div>
                              <div class="text-body1">{{ selectedDeposit.schedule }}</div>
                            </div>
                            <div class="col-12">
                              <div class="text-caption text-grey-6">Estado</div>
                              <q-badge color="positive" label="Activo" />
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>

                <!-- Inventory Panel -->
                <q-tab-panel name="inventory" class="q-pa-none">
                  <div class="q-pa-md">
                    <div class="row items-center justify-between q-mb-md">
                      <div class="text-h6">
                        <q-icon name="inventory" class="q-mr-sm" />
                        Inventario del Depósito
                      </div>
                      <div class="row items-center q-gutter-sm">
                        <q-badge color="primary" :label="`${depositInventory.length} productos`" />
                        <q-btn
                          color="primary"
                          icon="add_circle"
                          label="Agregar Producto"
                          @click="openAddProductDialog"
                          :disable="!selectedDeposit"
                        >
                          <q-tooltip>Agregar producto al inventario</q-tooltip>
                        </q-btn>
                        <q-btn
                          color="primary"
                          icon="refresh"
                          round
                          dense
                          @click="loadDepositInventory"
                          :loading="inventoryLoading"
                        >
                          <q-tooltip>Actualizar inventario</q-tooltip>
                        </q-btn>
                        <q-btn
                          color="info"
                          icon="swap_horiz"
                          round
                          dense
                          @click="openBulkTransferDialog"
                          :disable="!selectedDeposit || depositInventory.length === 0 || bulkTransferSelected.length === 0"
                        >
                          <q-tooltip>Transferencia masiva ({{ bulkTransferSelected.length }} seleccionados)</q-tooltip>
                        </q-btn>
                        <q-btn
                          color="grey"
                          icon="clear"
                          round
                          dense
                          @click="bulkTransferSelected = []"
                          :disable="bulkTransferSelected.length === 0"
                        >
                          <q-tooltip>Limpiar selección</q-tooltip>
                        </q-btn>
                      </div>
                    </div>

                    <q-table
                      :rows="depositInventory"
                      :columns="inventoryColumns"
                      row-key="id"
                      :loading="inventoryLoading"
                      :no-data-label="inventoryLoading ? 'Cargando...' : 'No hay productos en este depósito'"
                      flat
                      bordered
                      dense
                      selection="multiple"
                      v-model:selected="bulkTransferSelected"
                    >
                      <template v-slot:loading>
                        <q-inner-loading showing color="primary" />
                      </template>

                      <template v-slot:body-cell-product_name="props">
                        <q-td :props="props">
                          <div class="text-weight-medium">{{ props.value }}</div>
                        </q-td>
                      </template>

                      <template v-slot:body-cell-quantity="props">
                        <q-td :props="props">
                          <q-badge 
                            :color="props.value > 10 ? 'positive' : props.value > 0 ? 'warning' : 'negative'"
                            :label="props.value"
                          />
                        </q-td>
                      </template>

                      <template v-slot:body-cell-actions="props">
                        <q-td :props="props">
                          <div class="row items-center q-gutter-xs">
                            <q-btn
                              flat
                              round
                              size="sm"
                              icon="edit"
                              color="primary"
                              @click="editInventoryItem(props.row)"
                            >
                              <q-tooltip>Editar cantidad</q-tooltip>
                            </q-btn>
                            <q-btn
                              flat
                              round
                              size="sm"
                              icon="add"
                              color="positive"
                              @click="addQuantity(props.row)"
                            >
                              <q-tooltip>Agregar cantidad</q-tooltip>
                            </q-btn>
                            <q-btn
                              flat
                              round
                              size="sm"
                              icon="remove"
                              color="warning"
                              @click="removeQuantity(props.row)"
                              :disable="props.row.quantity <= 0"
                            >
                              <q-tooltip>Reducir cantidad</q-tooltip>
                            </q-btn>
                            <q-btn
                              flat
                              round
                              size="sm"
                              icon="delete"
                              color="negative"
                              @click="removeFromInventory(props.row)"
                            >
                              <q-tooltip>Eliminar del inventario</q-tooltip>
                            </q-btn>
                            <q-btn
                              flat
                              round
                              size="sm"
                              icon="swap_horiz"
                              color="info"
                              @click="openTransferDialog(props.row)"
                            >
                              <q-tooltip>Transferir producto</q-tooltip>
                            </q-btn>
                          </div>
                        </q-td>
                      </template>
                    </q-table>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn color="primary" label="Cerrar" @click="closeViewDialog" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Add Product to Deposit Dialog -->
        <q-dialog v-model="addProductDialog" persistent>
          <q-card style="width: 500px; max-width: 80vw;">
            <q-card-section class="row items-center bg-primary text-white">
              <div class="text-h6">
                <q-icon name="add_circle" class="q-mr-sm" />
                Agregar Producto al Inventario
              </div>
              <q-space />
              <q-btn icon="close" flat round dense @click="closeAddProductDialog" />
            </q-card-section>

            <q-card-section class="q-pt-md">
              <q-form @submit="addProductToInventory">
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <q-select
                      v-model="newInventoryItem.product_id"
                      :options="availableProducts"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      label="Producto *"
                      filled
                      :loading="productsLoading"
                      :rules="[val => !!val || 'Seleccione un producto']"
                      use-input
                      input-debounce="300"
                      @filter="filterProducts"
                      clearable
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                            <q-item-label caption>SKU: {{ scope.opt.sku }} | Stock: {{ scope.opt.stock || 'N/A' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No hay productos disponibles
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  
                  <div class="col-12">
                    <q-input
                      v-model.number="newInventoryItem.quantity"
                      type="number"
                      label="Cantidad *"
                      filled
                      min="1"
                      :rules="[val => val > 0 || 'La cantidad debe ser mayor a 0']"
                    />
                  </div>
                </div>
              </q-form>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn color="secondary" label="Cancelar" @click="closeAddProductDialog" />
              <q-btn color="primary" label="Agregar" @click="addProductToInventory" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Transfer Product Dialog -->
        <q-dialog v-model="transferDialog" persistent>
          <q-card style="width: 600px; max-width: 90vw;">
            <q-card-section class="row items-center bg-info text-white">
              <div class="text-h6">Transferir Producto</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section class="q-pt-md">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">
                    Producto: {{ transferItem?.product_name }}
                  </div>
                  <div class="text-caption text-grey-6 q-mb-md">
                    SKU: {{ transferItem?.sku }} | Stock actual: {{ transferItem?.quantity }}
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <q-select
                    v-model="newTransfer.to_deposit_id"
                    :options="availableDeposits"
                    option-value="id"
                    option-label="name"
                    label="Depósito de Destino *"
                    emit-value
                    map-options
                    outlined
                    dense
                    :loading="depositsLoading"
                    :disable="depositsLoading"
                    :rules="[val => val && val !== null || 'Seleccione un depósito de destino']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="warehouse" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay depósitos disponibles
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="newTransfer.quantity"
                    type="number"
                    label="Cantidad a Transferir *"
                    outlined
                    dense
                    min="0.01"
                    :max="transferItem?.quantity || 0"
                    :rules="[
                      val => val && val > 0 || 'La cantidad debe ser mayor a 0',
                      val => val <= (transferItem?.quantity || 0) || 'No hay stock suficiente'
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="inventory_2" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12">
                  <q-input
                    v-model="newTransfer.observations"
                    type="textarea"
                    label="Observaciones (opcional)"
                    outlined
                    dense
                    rows="3"
                    maxlength="500"
                  >
                    <template v-slot:prepend>
                      <q-icon name="note" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn color="secondary" label="Cancelar" @click="closeTransferDialog" />
              <q-btn 
                color="primary" 
                label="Transferir" 
                @click="transferProduct"
                :loading="depositsLoading"
                :disable="!newTransfer.to_deposit_id || !newTransfer.quantity || newTransfer.quantity <= 0"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Bulk Transfer Dialog -->
        <q-dialog v-model="bulkTransferDialog" persistent>
          <q-card style="width: 800px; max-width: 95vw;">
            <q-card-section class="row items-center bg-info text-white">
              <div class="text-h6">
                <q-icon name="swap_horiz" class="q-mr-sm" />
                Transferencia Masiva de Productos
              </div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section class="q-pt-md">
              <div class="row q-gutter-md">
                <div class="col-12">
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">
                    Productos seleccionados: {{ bulkTransferSelected.length }}
                  </div>
                </div>

                <div class="col-12">
                  <q-table
                    :rows="bulkTransferProducts"
                    :columns="bulkTransferColumns"
                    row-key="id"
                    flat
                    bordered
                    dense
                    :rows-per-page-options="[0]"
                    hide-pagination
                  >
                    <template v-slot:body-cell-product_name="props">
                      <q-td :props="props">
                        <div class="text-weight-medium">{{ props.row.product_name }}</div>
                        <div class="text-caption text-grey-6">SKU: {{ props.row.sku }}</div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-current_stock="props">
                      <q-td :props="props">
                        <div class="text-center">{{ props.row.current_stock }}</div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-transfer_quantity="props">
                      <q-td :props="props">
                        <q-input
                          v-model.number="props.row.transfer_quantity"
                          type="number"
                          dense
                          outlined
                          min="0"
                          :max="props.row.current_stock"
                          :rules="[
                            val => val >= 0 || 'La cantidad debe ser mayor o igual a 0',
                            val => val <= props.row.current_stock || 'No hay stock suficiente'
                          ]"
                          style="width: 120px"
                        />
                      </q-td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          round
                          size="sm"
                          icon="delete"
                          color="negative"
                          @click="removeFromBulkTransfer(props.row)"
                        >
                          <q-tooltip>Eliminar de la selección</q-tooltip>
                        </q-btn>
                      </q-td>
                    </template>
                  </q-table>
                </div>

                <div class="col-12">
                  <q-select
                    v-model="newBulkTransfer.to_deposit_id"
                    :options="availableDeposits"
                    option-value="id"
                    option-label="name"
                    label="Depósito de Destino *"
                    emit-value
                    map-options
                    outlined
                    dense
                    :loading="depositsLoading"
                    :disable="depositsLoading"
                    :rules="[val => val && val !== null || 'Seleccione un depósito de destino']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="warehouse" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay depósitos disponibles
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="col-12">
                  <q-input
                    v-model="newBulkTransfer.observations"
                    type="textarea"
                    label="Observaciones (opcional)"
                    outlined
                    dense
                    rows="3"
                    maxlength="500"
                  >
                    <template v-slot:prepend>
                      <q-icon name="note" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn color="secondary" label="Cancelar" @click="closeBulkTransferDialog" />
              <q-btn 
                color="primary" 
                label="Transferir Todo" 
                @click="executeBulkTransfer"
                :loading="bulkTransferLoading"
                :disable="!newBulkTransfer.to_deposit_id || bulkTransferSelected.length === 0"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
import { authentication } from 'src/stores/module-authentication'

export default {
  components: {
    AddressComponent
  },
  data () {
    return {
      // Deposit data
      deposits: [],
      maxDeposits: 1,
      currentSubscription: null,
      depositFilter: '',
      editingDepositId: null,
      openAddDeposit: false,
      dialogFilterDeposits: false,
      viewDepositDialog: false,
      selectedDeposit: null,
      depositInventory: [],
      inventoryLoading: false,
      addProductDialog: false,
      availableProducts: [],
      productsLoading: false,
      newInventoryItem: {
        product_id: null,
        quantity: 1,
        unit_price: 0
      },
      // Transfer data
      transferDialog: false,
      transferItem: null,
      availableDeposits: [],
      depositsLoading: false,
      newTransfer: {
        from_deposit_id: null,
        to_deposit_id: null,
        product_id: null,
        quantity: 1,
        observations: ''
      },
      // Bulk transfer data
      bulkTransferDialog: false,
      bulkTransferSelected: [],
      bulkTransferProducts: [],
      bulkTransferColumns: [
        { name: 'product_name', label: 'Producto', field: 'product_name', align: 'left' },
        { name: 'current_stock', label: 'Stock Actual', field: 'current_stock', align: 'center' },
        { name: 'transfer_quantity', label: 'Cantidad a Transferir', field: 'transfer_quantity', align: 'center' },
        { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
      ],
      bulkTransferLoading: false,
      newBulkTransfer: {
        to_deposit_id: null,
        observations: ''
      },
      depositFilters: {
        name: '',
        code: '',
        address: ''
      },
      newDeposit: {
        name: '',
        code: '',
        location: '',
        storage_type: '',
        deposit_category: '',
        capacity: '',
        type: '',
        responsible: '',
        schedule: '',
        branch_office_name: ''
      },
      storageTypeOptions: [],
      depositCategoryOptions: [],

      /**
       * Params search
       * @type {Object}
       */
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 20,
        dataSearch: {}
      },
      visible: false,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'address',
          align: 'left',
          label: 'Dirección',
          field: row => {
            if (!row.address) return 'Sin dirección'
            if (typeof row.address === 'string') return row.address
            if (row.address.formattedAddress) return row.address.formattedAddress
            if (row.address.name) return row.address.name
            return 'Sin dirección'
          },
          sortable: true
        },
        {
          name: 'location',
          align: 'left',
          label: 'Ubicación',
          field: 'location',
          sortable: true
        },
        {
          name: 'storage_type',
          align: 'left',
          label: 'Tipo Almacenamiento',
          field: row => {
            if (!row.type_id) return 'N/A'
            const option = this.storageTypeOptions.find(opt => opt.id === row.type_id)
            return option ? option.name : row.type_id
          },
          sortable: true
        },
        {
          name: 'deposit_category',
          align: 'left',
          label: 'Categoría',
          field: row => {
            if (!row.category_id) return 'N/A'
            const option = this.depositCategoryOptions.find(opt => opt.id === row.category_id)
            return option ? option.name : row.category_id
          },
          sortable: true
        },
        {
          name: 'capacity',
          align: 'left',
          label: 'Capacidad',
          field: 'capacity',
          sortable: true
        },
        {
          name: 'actions',
          align: 'right',
          label: 'Acciones',
          field: 'actions'
        }
      ],

      // Address component variables
      addressComponentKey: 0,
      address: null,
      formattedAddress: '',
      
      // Auth store
      authStore: null,
      
      // Tab control
      depositTab: 'info',
      
      // Inventory columns
      inventoryColumns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
        {
          name: 'product_name',
          align: 'left',
          label: 'Producto',
          field: 'product_name',
          sortable: true
        },
        {
          name: 'sku',
          align: 'left',
          label: 'SKU',
          field: 'sku',
          sortable: true
        },
        {
          name: 'quantity',
          align: 'center',
          label: 'Cantidad',
          field: 'quantity',
          sortable: true
        },
        {
          name: 'unit_price',
          align: 'right',
          label: 'Precio Unit.',
          field: 'unit_price',
          sortable: true,
          format: (val) => `$${parseFloat(val).toFixed(2)}`
        },
        {
          name: 'total_value',
          align: 'right',
          label: 'Valor Total',
          field: row => row.quantity * row.unit_price,
          sortable: true,
          format: (val) => `$${parseFloat(val).toFixed(2)}`
        },
        {
          name: 'status',
          align: 'center',
          label: 'Estado',
          field: 'status',
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Acciones',
          field: 'actions'
        }
      ]
    }
  },
  computed: {
    isLimitReached () {
      return this.deposits.length >= this.maxDeposits
    },
    limitTooltipMessage () {
      return `Has alcanzado el límite de depósitos de tu plan (${this.maxDeposits}). Actualiza tu plan para agregar más.`
    },
    currentBranchOffice () {
      try {
        const authStore = authentication()
        return authStore.branchOffice
      } catch (error) {
        console.error('Error getting auth store:', error)
        return null
      }
    },
    currentBranchOfficeName () {
      try {
        const authStore = authentication()
        const name = authStore.branchOffice?.name
        return name || 'Sin sucursal asignada'
      } catch (error) {
        console.error('Error getting branch office name:', error)
        return 'Sin sucursal asignada'
      }
    },
    hasBranchOffice () {
      try {
        const authStore = authentication()
        return !!authStore.branchOffice?.id
      } catch (error) {
        console.error('Error checking branch office:', error)
        return false
      }
    },
    userBranchOfficeName () {
      try {
        const authStore = authentication()
        return authStore.branchOffice?.name || ''
      } catch (error) {
        console.error('Error getting user branch office name:', error)
        return ''
      }
    }
  },
  mounted () {
    // Primero inicializar el authStore
    this.authStore = authentication()
    
    // Establecer estado de carga inicial
    this.visible = true
    
    // Luego cargar los datos en paralelo
    Promise.all([
      this.loadSubscription(),
      this.loadDepositTypes(),
      this.loadDepositCategories()
    ]).then(() => {
      // Después de cargar los datos auxiliares, cargar los depósitos
      return this.getDeposits()
    }).finally(() => {
      // Siempre detener el loading al final
      this.visible = false
    }).catch(error => {
      console.error('Error initializing deposit management:', error)
    })
  },
  watch: {
    depositFilter (data) {
      this.searchDepositData(data)
    }
  },
  methods: {
    getStorageTypeLabel (value) {
      const option = this.storageTypeOptions.find(opt => opt.id === value)
      return option ? option.name : value || 'N/A'
    },
    getDepositCategoryLabel (value) {
      const option = this.depositCategoryOptions.find(opt => opt.id === value)
      return option ? option.name : value || 'N/A'
    },
    async loadDepositTypes () {
      try {
        const { data } = await this.$api.get('deposit-types')
        this.storageTypeOptions = data.data || data || []
      } catch (error) {
        console.error('Error loading deposit types:', error)
        this.storageTypeOptions = []
      }
    },
    async loadDepositCategories () {
      try {
        const { data } = await this.$api.get('deposit-categories')
        this.depositCategoryOptions = data.data || data || []
      } catch (error) {
        console.error('Error loading deposit categories:', error)
        this.depositCategoryOptions = []
      }
    },

    async loadSubscription () {
      try {
        const { data } = await this.$api.get('subscriptions/current')
        this.currentSubscription = data.subscription
        this.maxDeposits = data.subscription?.plan?.max_deposits || 1
      } catch (error) {
        console.error('Error loading subscription:', error)
        this.maxDeposits = 1
      }
    },

    handleAddClick () {
      if (this.isLimitReached) {
        Notify.create({
          message: 'Has alcanzado el límite de depósitos',
          icon: 'warning',
          color: 'warning'
        })
        return
      }
      
      const authStore = authentication()
      this.newDeposit.branch_office_name = authStore.branchOffice?.name || ''
      this.openAddDeposit = true
    },

    closeModal () {
      this.openAddDeposit = false
      this.newDeposit = {
        name: '',
        code: '',
        location: '',
        storage_type: '',
        deposit_category: '',
        capacity: '',
        type: '',
        responsible: '',
        schedule: '',
        branch_office_name: ''
      }
      this.address = null
      this.formattedAddress = ''
      this.addressComponentKey += 1
      this.editingDepositId = null
    },

    async getDeposits (params = this.params) {
      try {
        const authStore = authentication()
        const currentBranchId = authStore?.branchOffice?.id
        
        const requestParams = { ...params }
        
        if (currentBranchId) {
          requestParams.branch_office_id = currentBranchId
        }
        
        const { data } = await this.$api.get('deposits', { params: requestParams })
        
        // Handle both paginated and non-paginated responses
        if (data && typeof data === 'object') {
          if (data.data && Array.isArray(data.data)) {
            // Paginated response
            this.deposits = data.data
          } else if (Array.isArray(data)) {
            // Direct array response
            this.deposits = data
          } else {
            console.warn('Unexpected API response structure:', data)
            this.deposits = []
          }
        } else {
          this.deposits = []
        }
        
        return this.deposits
      } catch (err) {
        console.error('Error loading deposits:', err)
        
        Notify.create({
          message: err.message || 'Error al cargar depósitos',
          icon: 'warning',
          color: 'negative'
        })
        return []
      }
    },

    handleAddressSelected (selectedAddress) {
      if (!selectedAddress) {
        this.address = null
        this.formattedAddress = ''
        return
      }

      this.address = selectedAddress

      if (typeof selectedAddress === 'object' && selectedAddress !== null) {
        if (selectedAddress.formattedAddress) {
          this.formattedAddress = selectedAddress.formattedAddress
        } else if (selectedAddress.name) {
          this.formattedAddress = selectedAddress.name
        } else {
          const addressParts = []
          if (selectedAddress.street) addressParts.push(selectedAddress.street)
          if (selectedAddress.city) addressParts.push(selectedAddress.city)
          if (selectedAddress.state) addressParts.push(selectedAddress.state)
          if (selectedAddress.country) addressParts.push(selectedAddress.country)
          if (selectedAddress.zipCode) addressParts.push(selectedAddress.zipCode)

          this.formattedAddress = addressParts.length > 0
            ? addressParts.join(', ')
            : JSON.stringify(selectedAddress)
        }
      } else if (typeof selectedAddress === 'string') {
        this.formattedAddress = selectedAddress
      } else {
        this.formattedAddress = String(selectedAddress)
      }
    },

    saveDeposit () {
      this.visible = true
      
      const authStore = authentication()
      const depositData = {
        ...this.newDeposit,
        address: this.address || null,
        branch_office_id: authStore.branchOffice?.id || null
      }
      
      if (typeof depositData.storage_type === 'object') {
        depositData.storage_type = depositData.storage_type.id
      }
      if (typeof depositData.deposit_category === 'object') {
        depositData.deposit_category = depositData.deposit_category.id
      }

      const request = this.editingDepositId
        ? this.$api.put(`deposits/${this.editingDepositId}`, depositData)
        : this.$api.post('deposits', depositData)

      request
        .then(({ data }) => {
          return this.getDeposits()
        })
        .then(() => {
          this.visible = false
          this.closeModal()
          Notify.create({
            message: this.editingDepositId ? 'Depósito actualizado exitosamente' : 'Depósito agregado exitosamente',
            color: 'positive',
            icon: 'check_circle'
          })
        })
        .catch(err => {
          this.visible = false
          if (err.response?.status === 422) {
            const errors = err.response?.data?.errors || {}
            if (errors.deposit_limit) {
              Notify.create({
                message: errors.deposit_limit[0],
                icon: 'warning',
                color: 'warning'
              })
              return
            }
            const firstError = Object.values(errors)[0]
            const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
            Notify.create({
              message: errorMessage || 'Error de validación',
              icon: 'warning',
              color: 'negative'
            })
          } else {
            Notify.create({
              message: err.message || 'Error al guardar depósito',
              icon: 'warning',
              color: 'negative'
            })
          }
        })
    },

    editDeposit (row) {
      if (!row) return
      this.editingDepositId = row.id
      
      this.newDeposit = { ...row }
      
      // Handle storage_type - puede venir como objeto o como ID numérico
      if (row.storage_type) {
        if (typeof row.storage_type === 'object') {
          this.newDeposit.storage_type = row.storage_type.id
        } else if (typeof row.storage_type === 'number') {
          this.newDeposit.storage_type = row.storage_type
        }
      }
      
      // Handle deposit_category - puede venir como objeto o como ID numérico
      if (row.deposit_category) {
        if (typeof row.deposit_category === 'object') {
          this.newDeposit.deposit_category = row.deposit_category.id
        } else if (typeof row.deposit_category === 'number') {
          this.newDeposit.deposit_category = row.deposit_category
        }
      }
      
      // Handle type_id y category_id directamente (fallback)
      if (row.type_id && !this.newDeposit.storage_type) {
        this.newDeposit.storage_type = row.type_id
      }
      if (row.category_id && !this.newDeposit.deposit_category) {
        this.newDeposit.deposit_category = row.category_id
      }
      
      if (!this.newDeposit.branch_office_name) {
        const authStore = authentication()
        this.newDeposit.branch_office_name = authStore.branchOffice?.name || ''
      }
      
      if (row.address && typeof row.address === 'object') {
        this.address = row.address
        this.formattedAddress = row.address.formattedAddress || row.address.name || ''
      }
      this.openAddDeposit = true
    },

    searchDepositData (val) {
      if (val && val.trim()) {
        this.params.dataSearch = { name: val }
      } else {
        this.params.dataSearch = {}
      }
      
      this.visible = true
      this.getDeposits(this.params).finally(() => {
        this.visible = false
      })
    },

    filterDeposits () {
      this.params.dataSearch = {}
      if (this.depositFilters.name) this.params.dataSearch.name = this.depositFilters.name
      if (this.depositFilters.code) this.params.dataSearch.code = this.depositFilters.code
      if (this.depositFilters.address) this.params.dataSearch.address = this.depositFilters.address

      this.visible = true
      this.getDeposits(this.params).finally(() => {
        this.visible = false
      })
      this.dialogFilterDeposits = false
    },

    clearDepositFilters () {
      this.depositFilters = {
        name: '',
        code: '',
        address: ''
      }
      this.filterDeposits()
    },

    viewDepositDetails (deposit) {
      this.selectedDeposit = deposit
      this.viewDepositDialog = true
      this.depositTab = 'info'
      this.loadDepositInventory()
    },

    async loadDepositInventory () {
      if (!this.selectedDeposit?.id) return
      
      this.inventoryLoading = true
      try {
        // Conexión real con API de DepositStock
        const { data } = await this.$api.get('deposit-stocks', { 
          params: { 
            deposit_id: this.selectedDeposit.id,
            available_only: true
          } 
        })
        
        // Transformar datos al formato esperado por la tabla
        this.depositInventory = data.data.map(stock => ({
          id: stock.product.id,
          product_name: stock.product.name,
          sku: stock.product.sku || 'N/A',
          quantity: stock.quantity,
          unit_price: stock.cost_average || stock.last_cost || 0,
          status: stock.quantity > 0 ? 'available' : 'unavailable',
          stock_id: stock.id, // Guardar referencia al stock_id para operaciones
          reserved_quantity: stock.reserved_quantity || 0,
          available_quantity: stock.available_quantity || (stock.quantity - (stock.reserved_quantity || 0))
        }))
        
        // Limpiar selección al recargar inventario
        this.bulkTransferSelected = []
      } catch (error) {
        console.error('Error loading deposit inventory:', error)
        Notify.create({
          message: 'Error al cargar el inventario del depósito',
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.inventoryLoading = false
      }
    },

    closeViewDialog () {
      this.viewDepositDialog = false
      this.selectedDeposit = null
      this.depositInventory = []
      this.depositTab = 'info'
    },

    async loadAvailableProducts () {
      this.productsLoading = true
      try {
        // Conexión real con API de productos
        const { data } = await this.$api.get('products', { 
          params: { 
            perPage: 100, // Obtener más productos para el select
            status: 'active' // Solo productos activos
          } 
        })
        
        // Transformar datos al formato esperado por el select
        this.availableProducts = (data.data || data).map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku || 'N/A',
          price: product.price || 0,
          stock: product.total_stock || 0 // Agregar información de stock si está disponible
        }))
      } catch (error) {
        console.error('Error loading available products:', error)
        Notify.create({
          message: 'Error al cargar productos disponibles',
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.productsLoading = false
      }
    },

    filterProducts (val, update) {
      if (val === '') {
        update(() => {
          this.loadAvailableProducts()
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.availableProducts = this.availableProducts.filter(v => 
          v.name.toLowerCase().indexOf(needle) > -1 || 
          v.sku.toLowerCase().indexOf(needle) > -1
        )
      })
    },

    openAddProductDialog () {
      this.loadAvailableProducts()
      this.addProductDialog = true
    },

    closeAddProductDialog () {
      this.addProductDialog = false
      this.newInventoryItem = {
        product_id: null,
        quantity: 1,
        unit_price: 0
      }
    },

    async addProductToInventory () {
      if (!this.newInventoryItem.product_id || this.newInventoryItem.quantity <= 0) {
        Notify.create({
          message: 'Complete todos los campos requeridos',
          icon: 'warning',
          color: 'warning'
        })
        return
      }

      try {
        const selectedProduct = this.availableProducts.find(p => p.id === this.newInventoryItem.product_id)
        
        // Verificar si el producto ya existe en el inventario
        const existingItem = this.depositInventory.find(item => item.id === this.newInventoryItem.product_id)
        
        if (existingItem) {
          // Si existe, usar el endpoint de adjustStock para actualizar cantidad
          const { data } = await this.$api.post('deposit-stocks/adjust', {
            deposit_id: this.selectedDeposit.id,
            product_id: this.newInventoryItem.product_id,
            new_quantity: existingItem.quantity + this.newInventoryItem.quantity,
            reason: 'Adición de stock manual'
          })
          
          if (data.success) {
            // Actualizar localmente
            existingItem.quantity += this.newInventoryItem.quantity
            existingItem.unit_price = selectedProduct.price || 0
            existingItem.status = existingItem.quantity > 0 ? 'available' : 'unavailable'
          }
        } else {
          // Si no existe, crear nuevo stock usando el endpoint de store
          const { data } = await this.$api.post('deposit-stocks', {
            deposit_id: this.selectedDeposit.id,
            product_id: this.newInventoryItem.product_id,
            quantity: this.newInventoryItem.quantity,
            cost: selectedProduct.price || 0
          })
          
          if (data.success) {
            // Agregar a la lista local
            const newItem = {
              id: this.newInventoryItem.product_id,
              product_name: selectedProduct.name,
              sku: selectedProduct.sku,
              quantity: this.newInventoryItem.quantity,
              unit_price: selectedProduct.price || 0,
              status: this.newInventoryItem.quantity > 0 ? 'available' : 'unavailable',
              stock_id: data.data.id
            }
            this.depositInventory.push(newItem)
          }
        }

        Notify.create({
          message: 'Producto agregado al inventario exitosamente',
          color: 'positive',
          icon: 'check_circle'
        })

        this.closeAddProductDialog()
      } catch (error) {
        console.error('Error adding product to inventory:', error)
        Notify.create({
          message: error.response?.data?.message || 'Error al agregar producto al inventario',
          icon: 'warning',
          color: 'negative'
        })
      }
    },

    editInventoryItem (item) {
      this.$q.dialog({
        title: 'Editar Cantidad',
        message: `Editar cantidad de ${item.product_name}`,
        prompt: {
          model: item.quantity.toString(),
          type: 'number',
          min: 0,
          label: 'Nueva cantidad'
        },
        cancel: true,
        persistent: true
      }).onOk(async (newQuantity) => {
        try {
          const quantity = parseInt(newQuantity)
          
          // Usar endpoint de adjustStock para actualizar
          const { data } = await this.$api.post('deposit-stocks/adjust', {
            deposit_id: this.selectedDeposit.id,
            product_id: item.id,
            new_quantity: quantity,
            reason: 'Ajuste manual de stock'
          })
          
          if (data.success) {
            // Actualizar localmente
            item.quantity = quantity
            item.status = quantity > 0 ? 'available' : 'unavailable'
            
            Notify.create({
              message: 'Cantidad actualizada exitosamente',
              color: 'positive',
              icon: 'check_circle'
            })
          }
        } catch (error) {
          console.error('Error updating inventory item:', error)
          Notify.create({
            message: error.response?.data?.message || 'Error al actualizar cantidad',
            icon: 'warning',
            color: 'negative'
          })
        }
      })
    },

    addQuantity (item) {
      this.$q.dialog({
        title: 'Agregar Cantidad',
        message: `¿Cuántas unidades deseas agregar a ${item.product_name}?`,
        prompt: {
          model: '1',
          type: 'number',
          min: 1,
          label: 'Cantidad a agregar'
        },
        cancel: true,
        persistent: true
      }).onOk(async (quantityToAdd) => {
        try {
          const quantity = parseInt(quantityToAdd)
          
          // Usar endpoint de adjustStock para agregar
          const { data } = await this.$api.post('deposit-stocks/adjust', {
            deposit_id: this.selectedDeposit.id,
            product_id: item.id,
            new_quantity: item.quantity + quantity,
            reason: 'Adición de stock manual'
          })
          
          if (data.success) {
            // Actualizar localmente
            item.quantity += quantity
            item.status = item.quantity > 0 ? 'available' : 'unavailable'
            
            Notify.create({
              message: `Se agregaron ${quantity} unidades`,
              color: 'positive',
              icon: 'check_circle'
            })
          }
        } catch (error) {
          console.error('Error adding quantity:', error)
          Notify.create({
            message: error.response?.data?.message || 'Error al agregar cantidad',
            icon: 'warning',
            color: 'negative'
          })
        }
      })
    },

    removeQuantity (item) {
      this.$q.dialog({
        title: 'Reducir Cantidad',
        message: `¿Cuántas unidades deseas reducir de ${item.product_name}?`,
        prompt: {
          model: '1',
          type: 'number',
          min: 1,
          max: item.quantity,
          label: 'Cantidad a reducir'
        },
        cancel: true,
        persistent: true
      }).onOk(async (quantityToRemove) => {
        try {
          const quantity = parseInt(quantityToRemove)
          
          // Usar endpoint de adjustStock para reducir
          const { data } = await this.$api.post('deposit-stocks/adjust', {
            deposit_id: this.selectedDeposit.id,
            product_id: item.id,
            new_quantity: item.quantity - quantity,
            reason: 'Reducción de stock manual'
          })
          
          if (data.success) {
            // Actualizar localmente
            item.quantity -= quantity
            item.status = item.quantity > 0 ? 'available' : 'unavailable'
            
            Notify.create({
              message: `Se redujeron ${quantity} unidades`,
              color: 'positive',
              icon: 'check_circle'
            })
          }
        } catch (error) {
          console.error('Error removing quantity:', error)
          Notify.create({
            message: error.response?.data?.message || 'Error al reducir cantidad',
            icon: 'warning',
            color: 'negative'
          })
        }
      })
    },

    removeFromInventory (item) {
      this.$q.dialog({
        title: 'Eliminar Producto',
        message: `¿Estás seguro de que deseas eliminar "${item.product_name}" del inventario?`,
        persistent: true,
        ok: {
          label: 'Eliminar',
          color: 'negative',
          flat: true
        },
        cancel: {
          label: 'Cancelar',
          color: 'primary',
          flat: true
        }
      }).onOk(async () => {
        try {
          // Usar endpoint DELETE para eliminar el stock
          await this.$api.delete(`deposit-stocks/${item.stock_id}`)
          
          // Eliminar de la lista local
          const index = this.depositInventory.findIndex(i => i.id === item.id)
          if (index > -1) {
            this.depositInventory.splice(index, 1)
            
            Notify.create({
              message: 'Producto eliminado del inventario',
              color: 'positive',
              icon: 'check_circle'
            })
          }
        } catch (error) {
          console.error('Error removing from inventory:', error)
          Notify.create({
            message: error.response?.data?.message || 'Error al eliminar producto del inventario',
            icon: 'warning',
            color: 'negative'
          })
        }
      })
    },

    deleteDeposit (row) {
      this.$q.dialog({
        title: 'Eliminar Depósito',
        message: `¿Estás seguro de que deseas eliminar el depósito "${row.name}"? Esta acción no se puede deshacer.`,
        persistent: true,
        ok: {
          label: 'Eliminar',
          color: 'negative',
          flat: true
        },
        cancel: {
          label: 'Cancelar',
          color: 'primary',
          flat: true
        }
      }).onOk(() => {
        this.visible = true
        this.$api.delete(`deposits/${row.id}`)
          .then(() => {
            return this.getDeposits()
          })
          .then(() => {
            Notify.create({
              message: 'Depósito eliminado exitosamente',
              color: 'positive',
              icon: 'check_circle'
            })
          })
          .catch(err => {
            this.visible = false
            Notify.create({
              message: err.message || 'Error al eliminar depósito',
              icon: 'warning',
              color: 'negative'
            })
          })
          .finally(() => {
            this.visible = false
          })
      })
    },

    // Transfer methods
    async openTransferDialog (item) {
      this.transferItem = item
      this.transferDialog = true
      
      // Reset form
      this.newTransfer = {
        from_deposit_id: this.selectedDeposit.id,
        to_deposit_id: null,
        product_id: item.id,
        quantity: 1,
        observations: ''
      }
      
      // Load available deposits (excluding current deposit)
      await this.loadAvailableDeposits()
    },

    closeTransferDialog () {
      this.transferDialog = false
      this.transferItem = null
      this.newTransfer = {
        from_deposit_id: null,
        to_deposit_id: null,
        product_id: null,
        quantity: 1,
        observations: ''
      }
    },

    async loadAvailableDeposits () {
      this.depositsLoading = true
      try {
        const { data } = await this.$api.get('deposits', {
          params: {
            perPage: 100,
            status: 'active'
          }
        })
        
        // Filter out current deposit and format for select
        this.availableDeposits = (data.data || data || [])
          .filter(deposit => deposit.id !== this.selectedDeposit.id)
          .map(deposit => ({
            id: deposit.id,
            name: deposit.name,
            code: deposit.code,
            location: deposit.location
          }))
      } catch (error) {
        console.error('Error loading available deposits:', error)
        Notify.create({
          message: 'Error al cargar depósitos disponibles',
          icon: 'warning',
          color: 'negative'
        })
        this.availableDeposits = []
      } finally {
        this.depositsLoading = false
      }
    },

    async transferProduct () {
      if (!this.newTransfer.to_deposit_id || !this.newTransfer.quantity || this.newTransfer.quantity <= 0) {
        Notify.create({
          message: 'Complete todos los campos requeridos',
          icon: 'warning',
          color: 'warning'
        })
        return
      }

      // Validate quantity
      if (this.newTransfer.quantity > (this.transferItem?.quantity || 0)) {
        Notify.create({
          message: 'No hay stock suficiente para esta transferencia',
          icon: 'warning',
          color: 'warning'
        })
        return
      }

      try {
        const { data } = await this.$api.post('deposit-stocks/transfer', {
          from_deposit_id: this.newTransfer.from_deposit_id,
          to_deposit_id: this.newTransfer.to_deposit_id,
          product_id: this.newTransfer.product_id,
          quantity: this.newTransfer.quantity,
          observations: this.newTransfer.observations || `Transferencia de ${this.transferItem?.product_name}`
        })

        if (data.success) {
          // Update local inventory
          const transferredQuantity = this.newTransfer.quantity
          this.transferItem.quantity -= transferredQuantity
          this.transferItem.status = this.transferItem.quantity > 0 ? 'available' : 'unavailable'
          this.transferItem.available_quantity = this.transferItem.quantity - (this.transferItem.reserved_quantity || 0)

          // Remove item if quantity is 0
          if (this.transferItem.quantity <= 0) {
            const index = this.depositInventory.findIndex(i => i.id === this.transferItem.id)
            if (index > -1) {
              this.depositInventory.splice(index, 1)
            }
          }

          Notify.create({
            message: `Transferencia exitosa: ${transferredQuantity} unidades de ${this.transferItem?.product_name}`,
            color: 'positive',
            icon: 'swap_horiz'
          })

          this.closeTransferDialog()
        }
      } catch (error) {
        console.error('Error transferring product:', error)
        Notify.create({
          message: error.response?.data?.message || 'Error al transferir producto',
          icon: 'warning',
          color: 'negative'
        })
      }
    },

    // Bulk transfer methods
    async openBulkTransferDialog () {
      if (this.bulkTransferSelected.length === 0) {
        Notify.create({
          message: 'Seleccione al menos un producto para transferir',
          icon: 'warning',
          color: 'warning'
        })
        return
      }

      // Debug: mostrar productos seleccionados
      console.log('Productos seleccionados:', this.bulkTransferSelected)

      // Preparar productos para la tabla de transferencia
      this.bulkTransferProducts = this.bulkTransferSelected.map(product => ({
        id: product.id,
        product_name: product.product_name,
        sku: product.sku,
        current_stock: product.quantity,
        transfer_quantity: product.quantity // Por defecto transferir todo el stock
      }))

      this.bulkTransferDialog = true
      
      // Reset form
      this.newBulkTransfer = {
        to_deposit_id: null,
        observations: ''
      }
      
      // Load available deposits (excluding current deposit)
      await this.loadAvailableDeposits()
    },

    closeBulkTransferDialog () {
      this.bulkTransferDialog = false
      this.newBulkTransfer = {
        to_deposit_id: null,
        observations: ''
      }
      this.bulkTransferProducts = []
    },

    removeFromBulkTransfer (product) {
      // Eliminar de la tabla de transferencia
      const index = this.bulkTransferProducts.findIndex(p => p.id === product.id)
      if (index > -1) {
        this.bulkTransferProducts.splice(index, 1)
      }
      
      // Eliminar de la selección original
      const selectedIndex = this.bulkTransferSelected.findIndex(p => p.id === product.id)
      if (selectedIndex > -1) {
        this.bulkTransferSelected.splice(selectedIndex, 1)
      }
      
      Notify.create({
        message: `${product.product_name} eliminado de la selección`,
        color: 'info',
        icon: 'info'
      })
    },

    async executeBulkTransfer () {
      if (!this.newBulkTransfer.to_deposit_id || this.bulkTransferSelected.length === 0) {
        Notify.create({
          message: 'Complete todos los campos requeridos',
          icon: 'warning',
          color: 'warning'
        })
        return
      }

      // Check if at least one product has transfer quantity > 0
      const hasValidTransfers = this.bulkTransferProducts.some(product => 
        product.transfer_quantity && product.transfer_quantity > 0
      )

      if (!hasValidTransfers) {
        Notify.create({
          message: 'Debe especificar una cantidad mayor a 0 para al menos un producto',
          icon: 'warning',
          color: 'warning'
        })
        return
      }

      this.bulkTransferLoading = true
      const transferResults = []
      const errors = []

      try {
        // Process each product in the transfer table
        for (const product of this.bulkTransferProducts) {
          // Skip products with zero transfer quantity
          if (!product.transfer_quantity || product.transfer_quantity <= 0) {
            continue
          }

          try {
            const { data } = await this.$api.post('deposit-stocks/transfer', {
              from_deposit_id: this.selectedDeposit.id,
              to_deposit_id: this.newBulkTransfer.to_deposit_id,
              product_id: product.id,
              quantity: product.transfer_quantity, // Use the selected transfer quantity
              observations: this.newBulkTransfer.observations || `Transferencia masiva: ${product.product_name}`
            })

            if (data.success) {
              transferResults.push({
                product: product.product_name,
                quantity: product.transfer_quantity,
                success: true
              })
              
              // Update local inventory (reduce quantity, don't remove completely)
              const index = this.depositInventory.findIndex(i => i.id === product.id)
              if (index > -1) {
                const newQuantity = this.depositInventory[index].quantity - product.transfer_quantity
                if (newQuantity <= 0) {
                  // Remove if no stock left
                  this.depositInventory.splice(index, 1)
                } else {
                  // Update quantity
                  this.depositInventory[index].quantity = newQuantity
                }
              }
            } else {
              errors.push({
                product: product.product_name,
                error: 'Error en respuesta del servidor'
              })
            }
          } catch (error) {
            errors.push({
              product: product.product_name,
              error: error.response?.data?.message || 'Error desconocido'
            })
          }
        }

        // Show results
        if (transferResults.length > 0) {
          const successMessage = transferResults.map(r => `${r.product} (${r.quantity} unid.)`).join(', ')
          Notify.create({
            message: `Transferencia masiva exitosa: ${transferResults.length} productos transferidos`,
            color: 'positive',
            icon: 'swap_horiz',
            timeout: 5000,
            actions: [
              {
                label: 'Ver detalles',
                color: 'white',
                handler: () => {
                  Notify.create({
                    message: `Transferidos: ${successMessage}`,
                    color: 'info',
                    timeout: 8000
                  })
                }
              }
            ]
          })
        }

        if (errors.length > 0) {
          const errorMessage = errors.map(e => `${e.product}: ${e.error}`).join('\n')
          Notify.create({
            message: `Errores en ${errors.length} productos`,
            color: 'negative',
            icon: 'warning',
            timeout: 8000,
            actions: [
              {
                label: 'Ver errores',
                color: 'white',
                handler: () => {
                  Notify.create({
                    message: errorMessage,
                    color: 'negative',
                    timeout: 10000,
                    multiLine: true
                  })
                }
              }
            ]
          })
        }

        this.closeBulkTransferDialog()
        this.bulkTransferSelected = [] // Clear selection
        
      } catch (error) {
        console.error('Error in bulk transfer:', error)
        Notify.create({
          message: 'Error general en transferencia masiva',
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.bulkTransferLoading = false
      }
    }
  }
}

</script>

<style scoped>
/* Info Cards */
.info-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Modern Subscription Info Card */
.subscription-info-card-modern {
  border-radius: 20px;
  background: #3b82f6;
  color: white;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.subscription-info-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 35px -5px rgba(59, 130, 246, 0.5);
}

/* Card States */
.subscription-info-card-modern.card-success {
  background: #3b82f6;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
}

.subscription-info-card-modern.card-success:hover {
  box-shadow: 0 20px 35px -5px rgba(59, 130, 246, 0.5);
}

.subscription-info-card-modern.card-warning {
  background: #f59e0b;
  box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.4);
}

.subscription-info-card-modern.card-warning:hover {
  box-shadow: 0 20px 35px -5px rgba(245, 158, 11, 0.5);
}

.subscription-info-card-modern.card-danger {
  background: #ef4444;
  box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4);
}

.subscription-info-card-modern.card-danger:hover {
  box-shadow: 0 20px 35px -5px rgba(239, 68, 68, 0.5);
}

/* Icon Container */
.icon-container {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.subscription-info-card-modern:hover .icon-container {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* Info Content */
.info-content {
  position: relative;
  z-index: 1;
}

.opacity-80 {
  opacity: 0.9;
}

.opacity-60 {
  opacity: 0.6;
}

.cursor-pointer {
  cursor: pointer;
}

/* Add Button Modern */
.add-branch-btn-modern {
  padding: 12px 28px;
  font-weight: 600;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-branch-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.add-branch-btn-modern:active {
  transform: translateY(0);
}

.add-branch-btn-modern:disabled {
  opacity: 0.5;
  transform: none !important;
  box-shadow: none !important;
}

/* Responsive */
@media (max-width: 768px) {
  .subscription-info-card-modern {
    min-width: 200px;
  }

  .icon-container {
    width: 48px;
    height: 48px;
  }

  .icon-container .q-icon {
    font-size: 24px !important;
  }
}
</style>
