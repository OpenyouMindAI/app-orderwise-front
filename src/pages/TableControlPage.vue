<template>
  <div class="luxury-restaurant-designer">
    <header class="luxury-header">
      <div class="header-content-wrapper">
        <div class="brand-identity flex justify-between items-center">
          <div class="brand-text-group flex q-gutter-sm items-center">
            <div class="brand-logo-circle">
              <q-icon name="restaurant" class="brand-icon" />
            </div>
            <div class="column">
              <span class="app-title">Mesas</span>
              <span class="app-subtitle">Gestión de Mesas y Pedidos</span>
            </div>
          </div>
          <div class="header-controls-group">
            <div class="room-selection-area">
              <q-select
                v-model="selectedRoom"
                :options="roomOptions"
                option-label="name"
                option-value="id"
                label="Seleccionar Sala"
                outlined
                dense
                class="luxury-select"
                @update:model-value="onRoomChange"
              >
                <template v-slot:prepend>
                  <q-icon name="meeting_room" class="select-icon" />
                </template>
              </q-select>
            </div>

            <div class="action-buttons-group">
              <q-btn
                icon="refresh"
                label="Actualizar"
                @click="refreshTables"
                class="action-button secondary-action-button"
                flat
              />
            </div>
          </div>
        </div>
      </div>
    </header>
    <main class="canvas-main-area" v-if="selectedRoom">
      <div class="canvas-controls">
        <q-btn icon="zoom_in" @click="zoomIn" dense round flat class="control-btn"></q-btn>
        <span class="zoom-level-display">{{ Math.round(zoomLevel * 100) }}%</span>
        <q-btn icon="zoom_out" @click="zoomOut" dense round flat class="control-btn"></q-btn>
      </div>
      <div
        class="canvas-viewport-container"
        @mousedown="startPan"
        @mousemove="onPan"
        @mouseup="endPan"
        @mouseleave="endPan"
        @touchstart="startPan"
        @touchmove="onPan"
        @touchend="endPan"
      >
        <div class="canvas-transform-wrapper" :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`, transition: isPanning ? 'none' : 'transform 0.1s ease-out' }">
          <draggable-resizable-container
            :grid="[gridSize, gridSize]"
            :show-grid="showGrid"
            class="luxury-canvas"
            :style="canvasStyle"
          >
            <draggable-resizable-vue
              v-for="(table, index) in currentTables"
              :key="table.id || index"
              v-model:x="table.x"
              v-model:y="table.y"
              v-model:h="table.height"
              v-model:w="table.width"
              :handles-size="8"
              :draggable="false"
              :resizable="false"
              @click="onTableClick(table)"
            >
              <div class="table-visual-surface">
                <div class="table-gloss-effect"></div>
                <div class="table-info-overlay">
                  <span class="table-name-text">{{ table.name }}</span>
                  <span v-if="table.status === 'busy' && getInvoiceFromTable(table)?.client" class="table-client-text">
                    <q-icon name="account_circle" class="client-icon" />
                    {{ getInvoiceFromTable(table).client.name }}
                  </span>
                </div>
                <div class="table-status-indicator" :class="table.status || 'unoccupied'"></div>
                <div v-if="table.status === 'busy'" class="table-quick-actions">
                  <q-btn
                    icon="swap_horiz"
                    size="xs"
                    round
                    color="white"
                    text-color="primary"
                    @click.stop="quickTransfer(table)"
                    @touchstart.stop
                    class="quick-action-btn"
                  >
                    <q-tooltip>Cambiar Mesa</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="print"
                    size="xs"
                    round
                    color="white"
                    text-color="primary"
                    @click.stop="quickPrint(table.invoices[0], 'comanda')"
                    @touchstart.stop
                    class="quick-action-btn"
                  >
                    <q-tooltip>Imprimir Comanda</q-tooltip>
                  </q-btn>
                </div>
              </div>
              <div :class="getTableDesignClass(table)">
              </div>
            </draggable-resizable-vue>
          </draggable-resizable-container>
        </div>
      </div>
    </main>
    <div v-else class="empty-state-container">
      <div class="empty-state-illustration">
        <div class="illustration-circle-bg">
          <q-icon name="restaurant_menu" />
        </div>
      </div>
      <div class="empty-state-content">
        <h3 class="empty-state-title">Bienvenido al Servicio de Mesas</h3>
        <p class="empty-state-description">Selecciona una sala para ver la distribución de mesas y gestionar pedidos.</p>
        <q-btn
          label="Seleccionar Sala"
          icon="meeting_room"
          @click="showRoomSelection = true"
          class="action-button primary-action-button large-button"
          unelevated
        />
      </div>
    </div>
    <!-- Invoice Modal -->
    <q-dialog v-model="showInvoiceModal" position="right" class="invoice-modal" @before-show="storeActiveElement" @hide="restoreFocus">
      <q-card class="invoice-card">
        <q-card-section class="invoice-header bg-primary text-white">
          <div class="invoice-header-content">
            <div class="invoice-title-group">
              <q-icon name="receipt_long" class="invoice-icon" />
              <div>
                <div class="invoice-title">{{ selectedInvoice?.code || 'Nueva Comanda' }}</div>
                <div class="invoice-subtitle">Mesa {{ selectedTable?.name }}</div>
              </div>
            </div>
            <div class="header-actions">
              <!-- Print Actions -->
              <div v-if="selectedInvoice" class="print-actions">
                <q-btn
                  icon="receipt"
                  flat
                  round
                  dense
                  @click="quickPrint(selectedInvoice, 'comanda')"
                  :loading="printing"
                  class="print-btn"
                >
                  <q-tooltip>Imprimir Comanda</q-tooltip>
                </q-btn>
                <q-btn
                  icon="receipt_long"
                  flat
                  round
                  dense
                  @click="quickPrint(selectedInvoice, 'ticket')"
                  :loading="printing"
                  class="print-btn"
                >
                  <q-tooltip>Imprimir Ticket</q-tooltip>
                </q-btn>
              </div>
              <!-- Transfer Order Button -->
              <q-btn
                v-if="selectedInvoice"
                icon="swap_horiz"
                flat
                round
                dense
                @click="openTransferDialog"
                class="transfer-btn"
              >
                <q-tooltip>Cambiar Mesa</q-tooltip>
              </q-btn>
              <q-btn
                icon="close"
                flat
                round
                dense
                @click="closeInvoiceModal"
                class="close-btn"
              />
            </div>
          </div>
        </q-card-section>
        <q-tabs
          v-model="activeTab"
          class="invoice-tabs"
          indicator-color="primary"
          active-color="primary"
          align="justify"
        >
          <q-tab name="order" label="Pedido" icon="restaurant" />
          <q-tab name="products" label="Productos" icon="add_shopping_cart" />
        </q-tabs>
        <div class="customer-section q-px-md q-pt-md row q-col-gutter-sm items-center">
          <div class="col">
            <q-select
              ref="clientSelect"
              filled
              dense
              v-model="tempClient"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :hide-dropdown-icon="$q.platform.is.nativeMobile"
              option-value="id"
              :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
              :options="clients"
              hide-bottom-space
              :disable="!clientFieldEnabled"
              @filter="filterClients"
              @focus="handleClientFocus"
              label="Cliente"
            />
          </div>
          <div class="col-auto">
            <q-btn
              style="padding: 1px 6px !important; border-radius: var(--border-radius-md);"
              :icon="clientFieldEnabled ? 'add' : 'edit'"
              color="primary"
              size="md"
              @click.stop.prevent="toggleClientField"
            >
              <q-tooltip>
                {{ clientFieldEnabled ? 'Agregar nuevo cliente' : 'Editar cliente' }}
              </q-tooltip>
            </q-btn>
          </div>
        </div>
        <q-separator />
        <q-tab-panels v-model="activeTab" class="invoice-body">
          <q-tab-panel name="order">
            <div class="products-section column q-gutter-y-sm q-pb-sm">
              <span class="text-h6">
                <q-icon name="restaurant" />
                Productos ({{ invoiceProducts.length }})
              </span>

              <div v-if="invoiceProducts.length === 0" class="empty-products">
                <q-icon name="shopping_cart" size="3rem" class="empty-icon" />
                <p>No hay productos en esta comanda</p>
                <q-btn
                  label="Agregar Producto"
                  icon="add"
                  color="primary"
                  @click="activeTab = 'products'"
                  unelevated
                />
              </div>

              <div v-else class="products-list">
                <div
                  v-for="(product, index) in invoiceProducts"
                  :key="product.id"
                  class="product-item"
                >
                  <div class="product-image">
                    <img
                      v-if="product.images && product.images.length > 0"
                      :src="product.images[0].url"
                      :alt="product.name"
                      class="product-img"
                    />
                    <q-icon v-else name="fastfood" size="2rem" class="product-placeholder" />
                  </div>

                  <div class="product-details">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-description">{{ product.description }}</div>
                    <div v-if="product.pivot.observation" class="product-observation">
                      <q-icon name="note" size="sm" />
                      {{ product.pivot.observation }}
                    </div>
                    <div class="product-price">${{ formatNumber(product.pivot.price) }}</div>
                  </div>

                  <div class="product-actions">
                    <div class="product-item-actions items-center q-gutter-x-sm">
                      <div class="product-total">
                        ${{ formatNumber(product.pivot.price * product.pivot.amount) }}
                      </div>
                      <q-btn
                        icon="edit_note"
                        size="sm"
                        round
                        flat
                        color="primary"
                        @click="editProductNote(index)"
                        class="edit-note-btn"
                      >
                        <q-tooltip>Agregar nota</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="delete"
                        size="sm"
                        round
                        flat
                        color="negative"
                        @click="removeProduct(index)"
                        class="remove-btn"
                      >
                        <q-tooltip>Eliminar producto</q-tooltip>
                      </q-btn>
                    </div>
                    <div class="quantity-controls">
                      <q-btn
                        icon="remove"
                        size="sm"
                        round
                        flat
                        @click="decreaseQuantity(index)"
                        :disable="product.pivot.amount <= 1"
                        class="quantity-btn"
                      />
                      <q-input
                        :model-value="formatInputNumber(product.pivot.amount)"
                        type="number"
                        min="1"
                        step="0.01"
                        dense
                        outlined
                        class="quantity-input"
                        style="min-width: 100px;"
                        @update:model-value="updateQuantity(index, $event)"
                      />
                      <q-btn
                        icon="add"
                        size="sm"
                        round
                        flat
                        @click="increaseQuantity(index)"
                        class="quantity-btn"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="products" class="products-panel">
            <div class="search-section">
              <q-input
                v-model="productSearch"
                placeholder="Buscar productos..."
                outlined
                dense
                class="search-input"
                @update:model-value="filterProducts"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>

              <q-select
                v-model="selectedCategory"
                :options="categoryOptions"
                label="Categoría"
                outlined
                dense
                option-label="name"
                option-value="id"
                class="category-select"
                @update:model-value="filterProducts"
                clearable
                @filter="getCategories"
                use-input
                hide-bottom-space
              />
            </div>
            <q-infinite-scroll class="products-grid"  @load="loadProducts" debounce="700" :offset="1000">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="product-card q-mt-sm"
              >
                <div class="product-card-image">
                  <img
                    v-if="product.images && product.images.length > 0"
                    :src="product.images[0].url"
                    :alt="product.name"
                    class="product-card-img"
                  />
                  <q-icon v-else name="fastfood" size="2rem" class="product-card-placeholder" />
                </div>

                <div class="product-card-info">
                  <div class="product-card-name">{{ product.name }}</div>
                  <div class="product-card-price">${{ formatNumber(product.price) }}</div>
                </div>

                <div class="product-card-actions">
                  <q-btn
                    icon="add"
                    color="primary"
                    round
                    size="sm"
                    @click="quickAddProduct(product)"
                    class="quick-add-btn"
                  >
                    <q-tooltip>Agregar rápido</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="note_add"
                    color="secondary"
                    round
                    size="sm"
                    @click="addProductWithNote(product)"
                    class="add-with-note-btn"
                  >
                    <q-tooltip>Agregar con nota</q-tooltip>
                  </q-btn>
                </div>
                <div
                  v-if="getProductQuantityInOrder(product.id) > 0"
                  class="quantity-badge"
                >
                  {{ getProductQuantityInOrder(product.id) }}
                </div>
              </div>
            </q-infinite-scroll>

            <div v-if="loadingProducts" class="loading-products">
              <q-spinner color="primary" size="2rem" />
              <p>Cargando productos...</p>
            </div>
            <div v-if="!loadingProducts && filteredProducts.length === 0" class="empty-products-search">
              <q-icon name="search_off" size="3rem" class="empty-search-icon" />
              <p>{{ emptyProductsMessage }}</p>
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator />

        <q-card-actions class="invoice-actions">
          <q-btn
            label="Cancelar"
            flat
            @click="closeInvoiceModal"
            class="cancel-btn"
          />
          <q-space />
          <div v-if="invoiceProducts.length > 0" class="q-mr-sm">
            <div class="flex justify-between items-center q-gutter-x-sm text-h6 text-bold">
              <span>Total:</span>
              <span>${{ formatNumber(calculateTotal()) }}</span>
            </div>
          </div>
          <q-btn
            v-if="selectedInvoice && selectedInvoice.id && invoiceProducts.length > 0"
            label="Cobrar"
            color="positive"
            @click="openPaymentDialog"
            :loading="saving"
          />
          <q-btn
            label="Guardar"
            color="primary"
            @click="handleSaveButton"
            :loading="saving"
            :disable="!invoiceProducts || invoiceProducts.length === 0"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showTransferDialog" class="transfer-dialog" @before-show="storeActiveElement" @hide="restoreFocus">
      <q-card class="transfer-card">
        <q-card-section class="transfer-header">
          <div class="transfer-title">
            <q-icon name="swap_horiz" />
            Cambiar Mesa del Pedido
          </div>
          <div class="transfer-subtitle">
            Pedido: {{ selectedInvoice?.code }} - Mesa Actual: {{ selectedTable?.name }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="transfer-content">
            <p class="transfer-description">
              Selecciona la sala y mesa de destino para transferir este pedido:
            </p>
            <q-select
              v-model="targetRoom"
              :options="roomOptions"
              option-label="name"
              option-value="id"
              label="Sala de Destino"
              outlined
              class="room-select"
              @update:model-value="onTargetRoomChange"
              :rules="[val => !!val || 'Debes seleccionar una sala']"
            >
              <template v-slot:prepend>
                <q-icon name="meeting_room" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon name="meeting_room" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>
                      {{ scope.opt.width }}x{{ scope.opt.height }} - {{ scope.opt.tables?.length || 0 }} mesas
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <!-- Table Selection -->
            <q-select
              v-model="targetTable"
              :options="availableTablesForTransfer"
              option-label="name"
              option-value="id"
              label="Mesa de Destino"
              outlined
              class="table-select"
              :disable="!targetRoom"
              :rules="[val => !!val || 'Debes seleccionar una mesa']"
            >
              <template v-slot:prepend>
                <q-icon name="table_restaurant" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon
                      :name="scope.opt.status === 'busy' ? 'table_restaurant' : 'table_restaurant'"
                      :color="scope.opt.status === 'busy' ? 'negative' : 'positive'"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>
                      {{ scope.opt.capacity }} personas - {{ getTableStatusLabel(scope.opt.status) }}
                      <span v-if="scope.opt.status === 'busy' && getInvoiceFromTable(scope.opt)?.client">
                        - Cliente: {{ getInvoiceFromTable(scope.opt).client.name }}
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Transfer Confirmation -->
            <div v-if="targetTable && targetRoom" class="transfer-confirmation">
              <q-icon name="info" color="primary" />
              <div class="confirmation-text">
                <div>
                  <strong>Origen:</strong> {{ selectedRoom?.name }} - Mesa {{ selectedTable?.name }}
                </div>
                <div>
                  <strong>Destino:</strong> {{ targetRoom.name }} - Mesa {{ targetTable.name }}
                </div>
              </div>
            </div>

            <!-- Warning for occupied table -->
            <div v-if="targetTable?.status === 'busy'" class="transfer-warning">
              <q-icon name="warning" color="warning" />
              <span>
                ⚠️ La mesa de destino está ocupada. El pedido se combinará con el pedido existente.
              </span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Cancelar"
            flat
            @click="cancelTransfer"
          />
          <q-btn
            label="Transferir Pedido"
            color="primary"
            @click="confirmTransfer"
            :loading="transferring"
            :disable="!targetTable || !targetRoom"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showNoteDialog" class="note-dialog" @before-show="storeActiveElement" @hide="restoreFocus">
      <q-card class="note-card">
        <q-card-section class="note-header">
          <div class="note-title">
            <q-icon name="note_add" />
            Agregar Nota
          </div>
          <div class="note-product-name">{{ noteProduct?.name }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="productNote"
            type="textarea"
            placeholder="Ej: Sin cebolla, extra queso, bien cocido..."
            outlined
            rows="3"
            class="note-input"
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Cancelar"
            flat
            @click="cancelNote"
          />
          <q-btn
            label="Agregar"
            color="primary"
            @click="confirmNote"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Client Modal -->
    <q-dialog v-model="openAddClient" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveClient">
          <q-card-section class="row items-center q-py-sm bg-primary text-white">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="(openAddClient = false)" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <!-- Required field -->
            <div class="col-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                autofocus
                v-model="clientAdded.name"
                label="Nombre *"
                hint="Campo obligatorio"
              />
            </div>

            <!-- Optional fields -->
            <div class="col-12">
              <div class="text-caption text-grey-7 q-mb-sm">Información adicional (opcional)</div>
            </div>

            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                dense
                label="Tipo de documento"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="clientAdded.document_type"
                :options="documentTypes"
                @filter="getDocumentTypes"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                dense
                v-model="clientAdded.document_number"
                label="Número de documento"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                dense
                v-model="clientAdded.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                dense
                v-model="clientAdded.phone_number"
                label="Teléfono"
              />
            </div>
            <div class="col-12">
              <q-select
                use-input
                filled
                dense
                label="Condición de IVA"
                input-debounce="0"
                option-label="name"
                option-value="code"
                v-model="clientAdded.condition_iva_receptor"
                :options="conditionIvaReceptors"
                @filter="getConditionIvaReceptor"
              />
            </div>
            <div class="col-12">
              <q-input
                filled
                dense
                v-model="clientAdded.address"
                label="Dirección"
                type="textarea"
                rows="2"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="loadingClient"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Payment Modal -->
    <PaymentModal
      :show="showPaymentDialog"
      :payment-methods="paymentMethods"
      :payments="invoicePayments"
      :total-amount="calculateTotal()"
      :coin="coin"
      :show-table-close="!!(selectedInvoice && selectedInvoice.id)"
      :table-close="tableClose"
      :loading="saving"
      :user-session="userSession"
      :type-of-service="{code: 1}"
      :exchange-rate="exchangeRate"
      :invoice-type="{acronym_serie: 'T'}"
      @update:show="showPaymentDialog = $event"
      @update:table-close="tableClose = $event"
      @payment-update="handlePaymentUpdate"
      @payment-delete="handlePaymentDelete"
      @action-click="handlePaymentAction"
    />
  </div>
</template>

<script>
import { Notify, date } from 'quasar'
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'
import { loading, formatNumber, notify } from 'src/const/mixins'
import { commandPrint, ticketPrint } from 'src/const/printers'
import { apiArca } from 'src/boot/axios'
import PaymentModal from 'src/components/PaymentModal.vue'

export default {
  components: {
    DraggableResizableContainer,
    DraggableResizableVue,
    PaymentModal
  },
  data () {
    return {
      formatNumber,
      invoiceTypes: [],
      typeOfServices: [],
      users: [],
      clients: [],
      client: null,
      defaultClient: null,
      tempClient: null,
      clientFieldEnabled: false,
      // Add client modal state
      openAddClient: false,
      clientAdded: {},
      documentTypes: [],
      conditionIvaReceptors: [],
      loadingClient: false,
      categoryOptions: [],
      selectedRoom: null,
      currentTables: [],
      livingRooms: [],
      showGrid: true,
      gridSize: 20,
      canvasWidth: 20,
      canvasHeight: 15,

      zoomLevel: 1,
      panX: 0,
      panY: 0,
      isPanning: false,
      startPanX: 0,
      startPanY: 0,

      // Invoice modal state
      showInvoiceModal: false,
      selectedTable: null,
      selectedInvoice: null,
      invoiceProducts: [],
      saving: false,
      activeTab: 'order',
      lastPageRequest: 0,

      // Product selector state
      productSearch: '',
      selectedCategory: null,
      filteredProducts: [],
      loadingProducts: false,
      searchTimer: null,

      // Note dialog state
      showNoteDialog: false,
      noteProduct: null,
      previousFocus: null,
      productNote: '',
      noteAction: null, // 'add' or 'edit'
      noteProductIndex: null,

      // Transfer dialog state
      showTransferDialog: false,
      targetTable: null,
      targetRoom: null,
      transferring: false,
      availableTablesForTransfer: [],

      // Print state
      printing: false,

      // Payment Modal state
      showPaymentDialog: false,
      paymentMethods: [],
      invoicePayments: [],
      tableClose: false,
      coin: null,
      exchangeRate: null,

      // Cashbox state
      cashBoxState: null,
      isUserBoxOpen: false,

      // Table status display labels
      statusMap: {
        unoccupied: 'Desocupada',
        busy: 'Ocupada'
      }
    }
  },

  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice']),

    roomOptions () {
      return this.livingRooms.map(room => ({
        ...room,
        label: room.name,
        value: room.id
      }))
    },

    canvasStyle () {
      return {
        width: `${this.canvasWidth * 30}px`,
        height: `${this.canvasHeight * 30}px`
      }
    },

    emptyProductsMessage () {
      if (this.productSearch || this.selectedCategory) {
        return 'No se encontraron productos con los filtros aplicados'
      }
      return 'No hay productos disponibles'
    }
  },

  watch: {
    selectedCategory (newVal, oldVal) {
      // Reset products when category changes
      this.filteredProducts = []
      this.lastPageRequest = 0

      // Reload products with new category filter
      if (newVal !== oldVal) {
        this.filterProducts()
      }
    },

    activeTab (newTab) {
      // Load products when switching to products tab if empty
      if (newTab === 'products' && this.filteredProducts.length === 0) {
        this.loadProducts(1, () => {}, {})
      }
    },

    client (client) {
      // Update selectedInvoice when client changes
      if (this.selectedInvoice) {
        this.selectedInvoice.client = client
        this.selectedInvoice.client_id = client?.id || null
      }
    }
  },

  async created () {
    this.getLocalStorage()
    await this.getExchangeRates()
    await this.checkCashBoxStatus()
    await this.getLivingRooms()
    await this.getInvoiceTypes()
    await this.getTypeOfServices()
    await this.getUsers()
    await this.getClients()
    await this.getPaymentMethods()
  },

  methods: {
    // Configuration Methods
    getLocalStorage () {
      const { company_session: companySession } = this.userSession
      this.coin = companySession?.company_config?.coin
      this.defaultClient = companySession?.company_config?.client
    },
    /**
     * Get exchange rate
     */
    getExchangeRates () {
      this.$api.get('exchange-rates', {
        params: {
          paginate: true,
          perPage: 1,
          page: 1,
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.exchangeRate = data?.data?.[0]
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },

    /**
     * Check cashbox status for current user
     */
    async checkCashBoxStatus () {
      try {
        const { data } = await this.$api.get('cashier-init', {
          params: {
            branch_office_id: this.branchOffice?.id
          }
        })

        if (data && data.status === 'open') {
          this.isUserBoxOpen = true
          this.cashBoxState = {
            id: data.id,
            cashbox_id: data.cashbox_id,
            user_id: data.user_id,
            init_balance: parseFloat(data.init_balance),
            init_date: data.init_date,
            status: data.status,
            close_date: data.close_date,
            end_balance: data.end_balance,
            user_close_id: data.user_close_id
          }
        } else {
          // Successful response but no active session
          this.isUserBoxOpen = false
          this.cashBoxState = null
        }
      } catch (error) {
        if (error.response?.status === 404 ||
            error.message?.includes('No query results for model') ||
            error.message?.includes('CashboxUser')) {
          // 404 or no data is normal behavior - no active session
          this.isUserBoxOpen = false
          this.cashBoxState = null
        } else {
          // Actual server error
          this.isUserBoxOpen = false
          this.cashBoxState = null
        }
      }
    },

    // Payment Modal Methods
    async openPaymentDialog () {
      if (this.invoiceProducts.length === 0) {
        this.$q.notify({
          message: 'Debe agregar al menos un producto para cobrar',
          type: 'warning',
          icon: 'warning'
        })
        return
      }

      await this.getPaymentMethods()
      this.showPaymentDialog = true
    },

    async getPaymentMethods () {
      try {
        const { data } = await this.$api.get('payment-methods')
        this.paymentMethods = data
      } catch (err) {
        this.$q.notify({
          message: 'Error al cargar métodos de pago',
          type: 'negative',
          icon: 'error'
        })
      }
    },

    handlePaymentUpdate (data) {
      const { payment, index } = data
      if (index !== undefined && this.invoicePayments[index]) {
        this.invoicePayments[index] = { ...payment }
      }
    },

    handlePaymentDelete (data) {
      const { index } = data
      if (index !== undefined) {
        this.invoicePayments.splice(index, 1)
      }
    },

    async handlePaymentAction (data) {
      const { action, params, tableClose } = data
      try {
        this.saving = true

        // Set tableClose first
        this.tableClose = tableClose

        // Add payments to the invoice save
        // saveInvoiceWithPayments now handles modal close and refresh AFTER printing
        await this.saveInvoiceWithPayments(params, action)
      } catch (error) {
        // Error handled by saveInvoiceWithPayments
      } finally {
        this.saving = false
      }
    },

    async saveInvoiceWithPayments (params, action = 'save') {
      try {
        // Use existing saveInvoice logic but include payments
        this.invoicePayments = params.payments || []
        // DON'T override tableClose - it's already set in handlePaymentAction
        // this.tableClose = params.tableClose || false
        const invoiceToProcess = { ...this.selectedInvoice } // Save copy

        // Skip modal close in saveInvoice - we'll handle it after printing
        const result = await this.saveInvoice(true)

        if (!result) {
          return false
        }

        // Handle printing based on action (BEFORE closing modal)
        if (action === 'invoice') {
          try {
            await ticketPrint(invoiceToProcess)
          } catch (printError) {
            this.$q.notify({
              message: 'Error al imprimir factura: ' + printError.message,
              type: 'warning',
              position: 'top'
            })
          }
        } else if (action === 'command') {
          try {
            await commandPrint(invoiceToProcess)
          } catch (printError) {
            this.$q.notify({
              message: 'Error al imprimir comanda: ' + printError.message,
              type: 'warning',
              position: 'top'
            })
          }
        }

        // NOW we can close modal and refresh tables
        if (this.tableClose) {
          this.clearInvoiceAndCloseModal()
        } else {
          this.showPaymentDialog = false
          this.invoicePayments = []
        }

        return result
      } catch (error) {
        return false
      }
    },

    clearInvoiceAndCloseModal () {
      this.showPaymentDialog = false

      if (this.tableClose) {
        // Free the table first
        if (this.selectedInvoice) {
          this.freeTableAfterClose(this.selectedInvoice)
        }
        // Clear invoice payments and close modal (closeInvoiceModal handles the rest)
        this.invoicePayments = []
        this.closeInvoiceModal()
        this.refreshTables()
      } else {
        // Just clear payments but keep the invoice open
        this.invoicePayments = []
      }
    },

    /**
     * Free table after close
     * @param {Object} invoice - Invoice object with table info
     */
    async freeTableAfterClose (invoice) {
      try {
        // Find table ID from invoice
        let tableId = null
        if (invoice.tables && invoice.tables.length > 0) {
          tableId = invoice.tables[0].id || invoice.tables[0]
        } else if (invoice.table_id) {
          tableId = invoice.table_id
        } else if (this.selectedTable && this.selectedTable.id) {
          tableId = this.selectedTable.id
        }

        if (tableId && this.selectedTable) {
          await this.$api.put(`tables/${tableId}`, {
            ...this.selectedTable,
            status: 'unoccupied'
          })
        }
      } catch (error) {
        // Continue with flow even if backend error occurs
      }
    },

    async getCategories (val, update) {
      try {
        const { data } = await this.$api.get('categories', {
          params: {
            dataSearch: {
              name: val
            }
          }
        })
        update(() => {
          this.categoryOptions = data
        })
      } catch (err) {
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    async getLivingRooms () {
      try {
        const { data } = await this.$api.get('living-rooms')
        this.livingRooms = data
        if (this.livingRooms.length > 0 && !this.selectedRoom) {
          this.selectedRoom = this.livingRooms[0]
          this.onRoomChange(this.selectedRoom)
        }
      } catch (err) {
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      }
    },

    async onRoomChange (room) {
      if (room) {
        this.canvasWidth = room.width || 20
        this.canvasHeight = room.height || 15
        await this.getTablesForRoom(room.id)
      }
    },

    async getTablesForRoom (roomId) {
      try {
        loading(true)
        const { data } = await this.$api.get('tables', {
          params: {
            dataEqualFilter: {
              living_room_id: roomId
            }
          }
        })
        this.currentTables = data
      } catch (err) {
        Notify.create({
          message: `Error al cargar mesas: ${err.message}`,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        loading(false)
      }
    },

    async refreshTables () {
      if (this.selectedRoom) {
        await this.getTablesForRoom(this.selectedRoom.id)
        Notify.create({
          message: 'Mesas actualizadas',
          icon: 'check_circle',
          color: 'positive'
        })
      }
    },

    onTableClick (table) {
      if (table.status === 'busy') {
        this.openInvoiceModal(table)
      } else {
        this.createNewOrder(table)
      }
    },

    // Helper method to get invoice from table (avoids duplication)
    getInvoiceFromTable (table) {
      return table.invoices && table.invoices.length > 0 ? table.invoices[0] : null
    },

    openInvoiceModal (table) {
      this.selectedTable = table
      this.selectedInvoice = this.getInvoiceFromTable(table)
      this.invoiceProducts = this.selectedInvoice ? [...this.selectedInvoice.products] : []
      this.client = this.selectedInvoice?.client || null
      this.tempClient = this.client ? { ...this.client } : null // Load client from start to display it
      // Clear payment state from previous operations
      this.invoicePayments = []
      this.tableClose = false
      this.showInvoiceModal = true
      this.activeTab = 'order'
    },

    createNewOrder (table) {
      this.selectedTable = table
      this.selectedInvoice = null
      this.invoiceProducts = []
      this.client = null
      this.tempClient = null
      this.clientFieldEnabled = false
      // Clear payment state from previous operations
      this.invoicePayments = []
      this.tableClose = false
      this.showInvoiceModal = true
      this.activeTab = 'products'
    },

    closeInvoiceModal () {
      // Don't update client - discard tempClient
      this.showInvoiceModal = false
      this.selectedTable = null
      this.selectedInvoice = null
      this.invoiceProducts = []
      this.client = null
      this.tempClient = null
      this.clientFieldEnabled = false
      // Clear payment state
      this.invoicePayments = []
      this.tableClose = false
      this.activeTab = 'order'
      this.productSearch = ''
      this.selectedCategory = null
    },

    // Quick actions from table view
    quickTransfer (table) {
      this.selectedTable = table
      this.selectedInvoice = this.getInvoiceFromTable(table)
      if (this.selectedInvoice) {
        this.openTransferDialog()
      }
    },

    async quickPrint (invoice, type) {
      this.selectedInvoice = invoice
      loading(true)
      if (type === 'comanda') {
        await commandPrint(invoice)
      } else {
        await ticketPrint(invoice)
      }
      loading(false)
    },

    // Enhanced transfer methods
    async onTargetRoomChange (room) {
      this.targetTable = null
      try {
        loading(true)
        const { data } = await this.$api.get('tables', {
          params: {
            dataEqualFilter: {
              living_room_id: room.id
            }
          }
        })
        this.availableTablesForTransfer = data
      } catch (err) {
        Notify.create({
          message: 'Error al cargar mesas de la sala',
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        loading(false)
      }
    },

    async confirmTransfer () {
      if (!this.targetTable || !this.targetRoom || !this.selectedInvoice) return

      this.transferring = true
      try {
        // Update the invoice with the new table and room
        await this.$api.put(`invoices/${this.selectedInvoice.id}`, {
          ...this.selectedInvoice,
          tables: [this.targetTable.id],
          living_room_id: this.targetRoom.id,
          products: this.invoiceProducts.map(product => ({
            ...product,
            amount: product.pivot.amount
          }))
        })

        const message = this.targetRoom.id === this.selectedRoom?.id
          ? `Pedido transferido a Mesa ${this.targetTable.name}`
          : `Pedido transferido a ${this.targetRoom.name} - Mesa ${this.targetTable.name}`

        Notify.create({
          message,
          icon: 'check_circle',
          color: 'positive',
          timeout: 3000
        })

        // Close dialogs and refresh
        this.cancelTransfer()
        this.closeInvoiceModal()
        this.refreshTables()
      } catch (err) {
        Notify.create({
          message: 'Error al transferir el pedido',
          icon: 'error',
          color: 'negative'
        })
      } finally {
        this.transferring = false
      }
    },

    cancelTransfer () {
      this.showTransferDialog = false
      this.targetTable = null
      this.targetRoom = null
      this.transferring = false
    },

    openTransferDialog () {
      this.targetTable = null
      this.showTransferDialog = true
    },

    increaseQuantity (index) {
      this.invoiceProducts[index].pivot.amount++
    },

    decreaseQuantity (index) {
      if (this.invoiceProducts[index].pivot.amount > 1) {
        this.invoiceProducts[index].pivot.amount--
      }
    },

    updateQuantity (index, newQuantity) {
      if (newQuantity >= 1) {
        this.invoiceProducts[index].pivot.amount = newQuantity
      }
    },

    // Format number to show only necessary decimals (max 2)
    formatInputNumber (value) {
      if (!value && value !== 0) return ''
      const num = Number(value)
      if (isNaN(num)) return value

      // Round to 2 decimal places
      const rounded = Math.round(num * 100) / 100

      // Convert to string and remove trailing zeros
      return rounded.toString().replace(/\.?0+$/, '')
    },

    removeProduct (index) {
      this.invoiceProducts.splice(index, 1)
    },

    // Product management methods
    async loadProducts (page, done, dataSearch = {}) {
      try {
        this.loadingProducts = true
        const { data } = await this.$api.get('products', {
          params: {
            dataEqualFilter: {
              show_catalog: 1,
              category_id: this.selectedCategory ? this.selectedCategory.id : null
            },
            dataSearch,
            orderBy: 'sold',
            sortOrder: 'desc',
            paginate: true,
            perPage: 50,
            page
          }
        })
        this.filteredProducts = [...this.filteredProducts, ...data.data]
        done((this.lastPageRequest || data.last_page) <= page)
        this.lastPageRequest = data.last_page
      } catch (err) {
        Notify.create({
          message: 'Error al cargar productos',
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loadingProducts = false
      }
    },

    filterProducts () {
      // Clear any existing timer to debounce search
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }

      // If search is empty, load all products
      if (!this.productSearch || this.productSearch.trim() === '') {
        this.filteredProducts = []
        this.lastPageRequest = 0
        this.loadProducts(1, () => {}, {})
        return
      }

      // Debounce search to avoid excessive API calls
      this.searchTimer = setTimeout(() => {
        // Clear products before filtering to avoid accumulation
        this.filteredProducts = []
        this.lastPageRequest = 0

        this.loadProducts(1, () => {}, {
          barcode: this.productSearch,
          name: this.productSearch
        })
      }, 400) // 400ms delay
    },

    quickAddProduct (product) {
      this.addProductToInvoice(product)
    },

    addProductWithNote (product) {
      this.noteProduct = product
      this.productNote = ''
      this.noteAction = 'add'
      this.showNoteDialog = true
    },

    editProductNote (index) {
      this.noteProduct = this.invoiceProducts[index]
      this.productNote = this.invoiceProducts[index].pivot.observation || ''
      this.noteAction = 'edit'
      this.noteProductIndex = index
      this.showNoteDialog = true
    },

    cancelNote () {
      this.showNoteDialog = false
      this.noteProduct = null
      this.productNote = ''
      this.noteAction = null
      this.noteProductIndex = null
    },

    confirmNote () {
      if (this.noteAction === 'add') {
        this.addProductToInvoice(this.noteProduct, this.productNote)
      } else if (this.noteAction === 'edit') {
        this.invoiceProducts[this.noteProductIndex].pivot.observation = this.productNote
      }
      this.cancelNote()
    },

    addProductToInvoice (product, note = null) {
      // Check if product already exists in invoice
      const existingIndex = this.invoiceProducts.findIndex(p => p.id === product.id)

      if (existingIndex >= 0) {
        // If exists, increase quantity
        this.invoiceProducts[existingIndex].pivot.amount++
        if (note) {
          this.invoiceProducts[existingIndex].pivot.observation = note
        }
      } else {
        // If doesn't exist, add new product
        const newProduct = {
          ...product,
          pivot: {
            amount: 1,
            price: product.price,
            taxe: 21,
            observation: note || null
          }
        }
        this.invoiceProducts.push(newProduct)
      }

      // Show success notification with quantity badge
      const totalQuantity = this.getProductQuantityInOrder(product.id)
      Notify.create({
        message: `${product.name} (${totalQuantity})`,
        icon: 'check_circle',
        color: 'positive',
        timeout: 800,
        position: 'top'
      })
    },

    getProductQuantityInOrder (productId) {
      const product = this.invoiceProducts.find(p => p.id === productId)
      return product ? product.pivot.amount : 0
    },

    calculateTotal () {
      return this.invoiceProducts.reduce((sum, product) => {
        return sum + (product.pivot.price * product.pivot.amount)
      }, 0)
    },

    async getInvoiceTypes () {
      try {
        const { data } = await this.$api.get('invoice-types')
        this.invoiceTypes = data
      } catch (error) {
        // Error handled silently
      }
    },

    async getTypeOfServices () {
      try {
        const { data } = await this.$api.get('type-of-services')
        this.typeOfServices = data
      } catch (error) {
        // Error handled silently
      }
    },

    async getUsers () {
      try {
        const { data } = await this.$api.get('users')
        this.users = data
      } catch (error) {
        // Error handled silently
      }
    },

    async getClients () {
      try {
        const { data } = await this.$api.get('clients')
        const clientList = Array.isArray(data) ? data : data?.data
        this.clients = clientList || []
      } catch (error) {
        // Error handled silently
      }
    },

    filterClients (value, update) {
      this.$api.get('clients', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          dataSearch: {
            name: value,
            document_number: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.clients = data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },

    handleClientFocus () {
      // Clear field and open dropdown automatically
      this.tempClient = null
      this.$nextTick(() => {
        if (this.$refs.clientSelect) {
          this.$refs.clientSelect.showPopup()
        }
      })
    },

    toggleClientField () {
      if (!this.clientFieldEnabled) {
        // Enable field for editing
        this.clientFieldEnabled = true
        // Focus on field after enabling it
        this.$nextTick(() => {
          if (this.$refs.clientSelect) {
            this.$refs.clientSelect.focus()
          }
        })
      } else {
        // Open modal to add new client
        this.openAddClient = true
      }
    },

    async getDocumentTypes (value, update) {
      try {
        const { data } = await apiArca.get('metadata/document-types', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.documentTypes = data
        })
      } catch (err) {
        notify('A ocurrido un error con la conexión con el ARCA', 'negative', 'warning')
      }
    },

    async getConditionIvaReceptor (value, update) {
      try {
        const { data } = await apiArca.get('metadata/condition-iva-receptors', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.conditionIvaReceptors = data
        })
      } catch (err) {
        notify('A ocurrido un error con la conexión con el ARCA', 'negative', 'warning')
      }
    },

    saveClient () {
      this.loadingClient = true
      this.$api.post('clients', this.clientAdded)
        .then(({ data }) => {
          this.openAddClient = false
          this.clientAdded = {}
          this.client = data
          this.loadingClient = false
          Notify.create({
            message: 'Cliente creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingClient = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },

    async handleSaveButton () {
      // Called directly from "Save" button - always close modal and refresh
      // Ensure no payment data is sent when using regular save button
      this.invoicePayments = []
      this.tableClose = false
      await this.saveInvoice(false)
      // saveInvoice already handles closing modal and refreshing tables
    },

    async saveInvoice (skipModalClose = false) {
      // Validate that there is at least one product
      if (!this.invoiceProducts || this.invoiceProducts.length === 0) {
        Notify.create({
          message: 'Debe agregar al menos un producto al pedido',
          color: 'negative',
          icon: 'warning',
          position: 'top'
        })
        return false
      }

      this.saving = true
      try {
        // Update existing invoice
        if (this.selectedInvoice) {
          // Save reference to invoice before updating
          const invoiceToUpdate = this.selectedInvoice
          const updateParams = {
            tableClose: this.tableClose,
            client_id: this.clientFieldEnabled
              ? (this.tempClient?.id || this.defaultClient?.id || null)
              : (this.client?.id || this.selectedInvoice.client_id || this.defaultClient?.id),
            seller_id: this.selectedInvoice.seller_id,
            coin_id: this.selectedInvoice.coin_id,
            description: this.selectedInvoice.description,
            type_of_service_id: this.selectedInvoice.type_of_service_id,
            invoice_type_id: this.selectedInvoice.invoice_type_id,
            user_created_id: this.userSession.id,
            cashbox_user_id: this.cashBoxState?.id,
            exchange_rate: this.selectedInvoice.exchange_rate,
            delivery_date: this.selectedInvoice.delivery_date,
            branch_office_id: this.selectedInvoice.branch_office_id,
            status: this.selectedInvoice.status,
            tables: this.selectedInvoice.tables.map(table => table.id),
            products: this.invoiceProducts.map(product => {
              return {
                id: product.id,
                amount: product.pivot.amount,
                price: product.pivot.price,
                observation: product.pivot.observation
              }
            }),
            payments: this.invoicePayments || [],
            total_amount: this.calculateTotal()
          }

          // Updating existing invoice

          await this.$api.put(`invoices/${this.selectedInvoice.id}`, updateParams)

          // Invoice updated successfully
          // Restore selectedInvoice reference for table closing
          this.selectedInvoice = invoiceToUpdate
        } else {
          // Create new invoice
          const invoiceType = this.invoiceTypes.find(it => it.acronym_serie === 'T')
          const typeOfService = this.typeOfServices.find(ts => ts.code === 2)

          if (!invoiceType || !typeOfService) {
            Notify.create({ message: 'No se pudieron encontrar los tipos de factura o servicio necesarios.', color: 'negative' })
            this.saving = false
            return false
          }

          const sellerId = this.users[0]?.id || this.userSession.id
          // If field enabled (editing), use tempClient (can be null if cleared)
          // Otherwise use client (original), or default client if none selected
          const clientId = this.clientFieldEnabled
            ? (this.tempClient?.id || this.defaultClient?.id || null)
            : (this.client?.id || this.defaultClient?.id || null)

          // Creating new invoice

          const params = {
            tableClose: this.tableClose,
            title: invoiceType.name,
            client_id: clientId,
            seller_id: sellerId,
            coin_id: this.coin?.id || 2,
            description: '',
            type_of_service_id: typeOfService.id,
            invoice_type_id: invoiceType.id,
            user_created_id: this.userSession.id,
            cashbox_user_id: this.cashBoxState?.id,
            exchange_rate: 0,
            delivery_date: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
            branch_office_id: this.branchOffice?.id,
            products: this.invoiceProducts.map(p => ({
              ...p,
              quantity: p.pivot.amount,
              amount: p.pivot.amount
            })),
            status: typeOfService.code === 2 ? 'delivered' : 'pending',
            payments: this.invoicePayments || [],
            total_amount: this.calculateTotal(),
            tables: [this.selectedTable.id],
            electronic_invoice: invoiceType?.bill,
            voucherType: null
          }

          // Sending invoice creation request

          await this.$api.post('invoices', params)

          // Invoice created successfully
        }

        Notify.create({
          message: 'Pedido guardado exitosamente',
          icon: 'check_circle',
          color: 'positive'
        })

        // Update client only if edited
        if (this.tempClient) {
          this.client = this.tempClient
        }

        // Only close modal and refresh if not skipping (i.e., not called from payment flow)
        if (!skipModalClose) {
          this.closeInvoiceModal()
          this.refreshTables()
        }
        return true
      } catch (err) {
        Notify.create({
          message: 'Error al guardar el pedido: ' + (err.response?.data?.message || err.message),
          icon: 'error',
          color: 'negative'
        })
        return false
      } finally {
        this.saving = false
      }
    },

    getTableDesignClass (table) {
      const baseClass = `luxury-table table-shape-${table.shape || 'round'}`
      const busyClass = table.status === 'busy' ? 'table-is-busy' : ''
      return `${baseClass} ${busyClass}`
    },

    getTableStatusLabel (status) {
      return this.statusMap[status] || status
    },

    storeActiveElement () {
      this.previousFocus = document.activeElement
    },

    restoreFocus () {
      this.$nextTick(() => {
        if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
          this.previousFocus.focus()
        }
        this.previousFocus = null
      })
    },

    startPan (event) {
      // If event originates from a table or its internal elements, don't start panning.
      // This allows click events on tables and their buttons to work correctly.
      if (event.target.closest('.draggable-resizable-vue')) {
        return
      }

      // DO NOT call preventDefault here to allow touch events
      // to convert to clicks when necessary

      this.isPanning = true
      const touch = event.touches ? event.touches[0] : event
      this.startPanX = touch.clientX - this.panX
      this.startPanY = touch.clientY - this.panY
      event.currentTarget.style.cursor = 'grabbing'
    },

    onPan (event) {
      if (!this.isPanning) return

      const touch = event.touches ? event.touches[0] : event
      this.panX = touch.clientX - this.startPanX
      this.panY = touch.clientY - this.startPanY

      // Only prevent default behavior when actually panning
      // This prevents browser scroll but allows normal clicks
      event.preventDefault()
    },

    endPan (event) {
      if (!this.isPanning) return

      this.isPanning = false
      event.currentTarget.style.cursor = 'grab'
    },

    zoomIn () {
      const newZoom = Math.min(this.zoomLevel + 0.2, 2)
      this.smoothZoom(newZoom)
    },

    zoomOut () {
      const newZoom = Math.max(this.zoomLevel - 0.2, 0.5)
      this.smoothZoom(newZoom)
    },

    smoothZoom (targetZoom) {
      const startZoom = this.zoomLevel
      const duration = 200 // milliseconds
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3)

        this.zoomLevel = startZoom + (targetZoom - startZoom) * easeOut

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }
}
</script>

<style>
/* --- Existing base styles remain the same --- */
/* --- Global Variables for Luxury Theme (Quasar Dark Mode Compatible) --- */
:root {
  /* Light Mode Defaults */
  --color-background: #f0f0f0;
  --color-surface: #ffffff;
  --color-card: #f8f8f8;
  --color-text: #333333;
  --color-text-muted: #666666;
  --color-border: #e0e0e0;

  /* Accent Colors (remain consistent across modes) */
  --color-accent-gold: #d4af37;
  --color-accent-gold-light: #e6c25a;
  --color-accent-gold-dark: #b8942e;
  --color-success: #4CAF50;
  --color-danger: #EF5350;
  --color-danger-dark: #CC3333; /* Darker shade for gradients */

  /* Table Base Colors (can be adjusted for dark mode if desired, but user asked for vibrant) */
  --table-round-bg: linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%); /* Deep Amethyst Purple */
  --table-square-bg: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); /* Sapphire Blue */
  --table-rectangle-bg: linear-gradient(135deg, #16A34A 0%, #15803D 100%); /* Emerald Green */
  --table-oval-bg: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); /* Ruby Red */

  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 14px;
  --spacing-unit: 0.8rem;
}

/* Dark Mode Overrides */
body.body--dark {
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --color-card: #282828;
  --color-text: #f0f0f0;
  --color-text-muted: #b0b0b0;
  --color-border: #3a3a3a;
}

/* --- Base Page Styling --- */
.luxury-restaurant-designer {
  color: var(--color-text);
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* --- Header Styling --- */
.luxury-header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4);
  padding: var(--spacing-unit) calc(var(--spacing-unit) * 1.5);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content-wrapper {
  display: flex;
  gap: calc(var(--spacing-unit) * 1.5);
}

.brand-identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-unit);
  width: 76vw;
}

.brand-logo-circle {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--color-accent-gold-dark) 0%, var(--color-accent-gold) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(var(--color-accent-gold-dark), 0.4);
}

.brand-icon {
  font-size: 1.8rem;
  color: white;
}

.brand-text-group .app-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
  letter-spacing: -0.03em;
}

.brand-text-group .app-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.header-controls-group {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
}

.room-selection-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.luxury-select {
  min-width: 220px;
  background-color: var(--color-card); /* Use card color for select background */
  border-radius: var(--border-radius-md);
}

.luxury-select :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  min-height: 40px;
  padding: 0 12px;
}

.luxury-select :deep(.q-field__label) {
  color: var(--color-text-muted);
  top: 10px;
}

.luxury-select :deep(.q-field__native) {
  padding-top: 8px;
}

.select-icon {
  color: var(--color-text-muted);
  font-size: 1.2rem;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.action-button {
  border-radius: var(--border-radius-md);
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.2s ease-in-out;
}

.primary-action-button {
  background-color: var(--color-accent-gold);
  color: var(--color-background); /* Text color should contrast with gold */
  box-shadow: 0 2px 8px rgba(var(--color-accent-gold), 0.3);
}

.primary-action-button:hover {
  background-color: var(--color-accent-gold-light);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(var(--color-accent-gold), 0.4);
}

.secondary-action-button {
  color: var(--color-text-muted);
}

.secondary-action-button:hover {
  background-color: var(--color-card);
  color: var(--color-text);
}

.large-button {
  padding: 0.9rem 1.8rem;
  font-size: 1rem;
}

/* --- Header Actions (Transfer Button) --- */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.transfer-btn {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.transfer-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

/* --- Main Canvas Area --- */
.canvas-main-area {
  flex: 1;
  background:
    radial-gradient(circle at 25px 25px, rgba(var(--color-border), 0.5) 1px, transparent 1px),
    var(--color-background);
  background-size: 50px 50px;
  /* Removed min-height to allow canvas to adapt fully */
  display: flex;
  justify-content: center;
  align-items: center;
}

.canvas-viewport-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%; /* Ensure it takes full height of parent */
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: var(--color-surface-light);
  border-radius: var(--border-radius-lg);
  cursor: grab;
  user-select: none; /* Prevent text selection while panning */
}

.canvas-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.control-btn {
  color: var(--color-primary);
}

.zoom-level-display {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  min-width: 40px;
  text-align: center;
}

.canvas-transform-wrapper {
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.luxury-canvas {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.luxury-canvas::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* --- Table Styling --- */
.table-draggable-wrapper {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 3px 12px rgba(0, 0, 0, 0.3));
}

.table-draggable-wrapper:hover {
  transform: translateY(-3px) scale(1.02);
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.4));
}

.table-draggable-wrapper.is-selected {
  z-index: 1000;
  filter:
    drop-shadow(0 0 0 3px var(--color-accent-gold))
    drop-shadow(0 9px 24px rgba(0, 0, 0, 0.5));
  transform: translateY(-3px) scale(1.02);
}

.luxury-table {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
}

.table-visual-surface {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.table-gloss-effect {
  position: absolute;
  top: 10%;
  left: 20%;
  right: 20%;
  height: 30%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%);
  border-radius: inherit;
  filter: blur(8px);
  opacity: 0.8;
}

.table-info-overlay {
  width: 100%;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.table-name-text {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.table-capacity-text {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.8rem;
  opacity: 0.95;
}

.capacity-icon {
  font-size: 0.8rem;
}

.table-client-text {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.7rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.client-icon {
  font-size: 0.8rem;
  flex-shrink: 0;
}

.table-status-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  z-index: 3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.table-status-indicator.unoccupied {
  background-color: var(--color-success); /* Green for unoccupied */
}

.table-status-indicator.busy {
  background-color: var(--color-danger); /* Red for busy */
}

/* --- Specific Table Shapes (Vibrant & Elegant) --- */
.table-shape-round {
  background: var(--table-round-bg);
  border-radius: 50%;
}

.table-shape-square {
  background: var(--table-square-bg);
  border-radius: var(--border-radius-md);
}

.table-shape-rectangle {
  background: var(--table-rectangle-bg);
  border-radius: var(--border-radius-lg);
}

.table-shape-oval {
  background: var(--table-oval-bg);
  border-radius: 50%;
  transform: scaleX(1.3);
}

/* --- Busy Table Background (More prominent) --- */
.luxury-table.table-is-busy {
  background: linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%);
  box-shadow: 0 0 15px rgba(var(--color-danger), 0.6);
  animation: pulse-red 1.5s infinite alternate; /* Optional: subtle pulse */
}

@keyframes pulse-red {
  from { box-shadow: 0 0 15px rgba(var(--color-danger), 0.6); }
  to { box-shadow: 0 0 25px rgba(var(--color-danger), 0.8); }
}

/* --- Empty State Styling --- */
.empty-state-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 1.5);
  min-height: calc(100vh - 180px); /* Keep a min-height for empty state */
}

.empty-state-illustration {
  margin-bottom: calc(var(--spacing-unit) * 2.5);
}

.illustration-circle-bg {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--color-accent-gold) 0%, var(--color-accent-gold-dark) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 28px rgba(var(--color-accent-gold), 0.3);
  margin: 0 auto;
}

.illustration-circle-bg .q-icon {
  font-size: 3.5rem;
  color: var(--color-background);
}

.empty-state-content .empty-state-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  color: var(--color-text);
  letter-spacing: -0.04em;
}

.empty-state-content .empty-state-description {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  margin-bottom: calc(var(--spacing-unit) * 2);
  max-width: 500px;
  line-height: 1.5;
}

/* --- Invoice Modal Styling --- */
.invoice-modal :deep(.q-dialog__inner) {
  padding: 0;
  justify-content: flex-end;
}

.invoice-card {
  width: 600px;
  max-width: 90vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
  background-color: var(--color-surface);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.invoice-header {
  color: white;
  flex-shrink: 0;
}

.invoice-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invoice-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.invoice-icon {
  font-size: 2rem;
}

.invoice-title {
  font-size: 1.4rem;
  font-weight: 700;
}

.invoice-subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

.close-btn {
  color: rgba(255, 255, 255, 0.8);
}

.close-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

/* --- Transfer Dialog Styling --- */
.transfer-dialog :deep(.q-dialog__inner) {
  padding: 16px;
}

.transfer-card {
  width: 500px;
  max-width: 90vw;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.transfer-header {
  background: linear-gradient(135deg, var(--color-accent-gold) 0%, var(--color-accent-gold-dark) 100%);
  color: white;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

.transfer-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 700;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.transfer-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
  font-weight: 500;
}

.transfer-content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.room-select, .table-select {
  width: 100%;
}

.room-select :deep(.q-field__control),
.table-select :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
  transition: border-color 0.2s ease;
}

.room-select :deep(.q-field__control):focus-within,
.table-select :deep(.q-field__control):focus-within {
  border-color: var(--color-accent-gold);
}

.confirmation-text {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.transfer-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 1rem;
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: var(--border-radius-md);
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

.transfer-description {
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1.4;
  margin: 0;
}

.table-select {
  width: 100%;
}

.table-select :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
  transition: border-color 0.2s ease;
}

.table-select :deep(.q-field__control):focus-within {
  border-color: var(--color-accent-gold);
}

.transfer-confirmation {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background-color: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: var(--border-radius-md);
  color: var(--color-text);
  font-size: 0.95rem;
  line-height: 1.4;
}

.transfer-confirmation strong {
  color: var(--color-accent-gold-dark);
  font-weight: 600;
}

/* --- Tabs Styling --- */
.invoice-tabs {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.invoice-body {
  flex: 1;
  overflow: hidden;
}

.invoice-body :deep(.q-tab-panel) {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.customer-section {
  padding: 0.5rem 1rem;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.5rem;
  background-color: var(--color-card);
  border-radius: var(--border-radius-md);
}

.customer-name {
  font-weight: 600;
  color: var(--color-text);
}

.customer-details {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.empty-products {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.empty-icon {
  opacity: 0.5;
  margin-bottom: 1rem;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--color-card);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-placeholder {
  color: var(--color-text-muted);
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.2;
}

.product-description {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.2;
}

.product-observation {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--color-accent-gold-dark);
  font-style: italic;
  background-color: rgba(212, 175, 55, 0.1);
  padding: 0.3rem 0.5rem;
  border-radius: var(--border-radius-sm);
  margin-top: 0.2rem;
}

.product-price {
  font-weight: 600;
  color: var(--color-accent-gold-dark);
  font-size: 0.9rem;
}

.product-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  min-height: 28px;
}

.quantity-input {
  width: 60px;
}

.quantity-input :deep(.q-field__control) {
  height: 38px;
  min-height: 38px;
  text-align: center;
  font-size: 0.9rem;
}

.quantity-input :deep(.q-field__native) {
  text-align: center;
  padding: 0;
}

.product-total {
  font-weight: 700;
  color: var(--color-text);
  font-size: 0.9rem;
  text-align: right;
}

.product-item-actions {
  display: flex;
  gap: 0.3rem;
}

.edit-note-btn, .remove-btn {
  width: 28px;
  height: 28px;
  min-height: 28px;
}

.summary-section {
  margin-top: 2rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.total-row {
  font-weight: 700;
  font-size: 1.1rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

/* --- Products Panel --- */
.products-panel {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 2;
}

.category-select {
  flex: 1;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.product-card {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent-gold);
}

.product-card-image {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  margin-bottom: 0.8rem;
}

.product-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card-placeholder {
  color: var(--color-text-muted);
}

.product-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;
  margin-bottom: 0.8rem;
}

.product-card-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.85rem;
  line-height: 1.2;
}

.product-card-price {
  font-weight: 700;
  color: var(--color-accent-gold-dark);
  font-size: 0.9rem;
}

.product-card-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
}

.quick-add-btn, .add-with-note-btn {
  width: 32px;
  height: 32px;
  min-height: 32px;
}

.quantity-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--color-accent-gold);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.loading-products, .empty-products-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-text-muted);
  text-align: center;
}

.empty-search-icon {
  opacity: 0.5;
  margin-bottom: 1rem;
}

/* --- Actions --- */
.invoice-actions {
  padding: 1rem 1.5rem;
  background-color: var(--color-card);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.cancel-btn {
  color: var(--color-text-muted);
}

/* --- Note Dialog --- */
.note-dialog :deep(.q-dialog__inner) {
  padding: 16px;
}

.note-card {
  width: 400px;
  max-width: 90vw;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
}

.note-header {
  background-color: var(--color-card);
  border-bottom: 1px solid var(--color-border);
}

.note-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
  font-size: 1.1rem;
}

.note-product-name {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-top: 0.3rem;
}

.note-input {
  width: 100%;
}

/* --- Table Quick Actions --- */
.table-quick-actions {
  position: absolute;
  width: 100%;
  bottom: 0;
  justify-content: space-between;
  transform: translate(0, 25%);
  display: flex;
  gap: 6px;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.quick-action-btn {
  width: 25px !important;
  height: 25px !important;
  min-height: 25px !important;
  font-size: 0.7rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* --- Print Actions in Header --- */
.print-actions {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-right: 0.5rem;
  padding-right: 0.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.print-btn {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.print-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

/* --- Enhanced Transfer Dialog --- */
.transfer-content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.room-select, .table-select {
  width: 100%;
}

.room-select :deep(.q-field__control),
.table-select :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
  transition: border-color 0.2s ease;
}

.room-select :deep(.q-field__control):focus-within,
.table-select :deep(.q-field__control):focus-within {
  border-color: var(--color-accent-gold);
}

.confirmation-text {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.transfer-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 1rem;
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: var(--border-radius-md);
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* --- Responsive Improvements --- */
@media (max-width: 768px) {
  .table-quick-actions {
    opacity: 1; /* Always visible on mobile */
  }

  .quick-action-btn {
    width: 24px !important;
    height: 24px !important;
    min-height: 24px !important;
  }

  .print-actions {
    gap: 0.2rem;
    margin-right: 0.3rem;
    padding-right: 0.3rem;
  }

  .transfer-card {
    width: 95vw;
    max-height: 90vh;
  }

  .confirmation-text {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .header-actions {
    gap: 0.2rem;
  }

  .transfer-warning {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
