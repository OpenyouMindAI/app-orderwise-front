<template>
  <q-page class="command-page">
    <!-- Vista 1: Lista de productos con banner -->
    <div v-if="currentView === 'catalog'" class="command-container q-pa-md">
      <!-- Banner del comercio -->
      <div class="banner-container" v-if="companyBanner && !isSearching">
        <q-carousel
          v-if="companyBanner.length > 1"
          v-model="bannerSlide"
          animated
          navigation
          infinite
          :autoplay="5000"
          arrows
          transition-prev="slide-right"
          transition-next="slide-left"
          class="banner-carousel"
        >
          <q-carousel-slide
            v-for="(banner, index) in companyBanner"
            :key="index"
            :name="index"
            class="q-pa-none"
          >
            <q-img
              :src="banner"
              class="banner-image"
              :ratio="16/9"
            />
          </q-carousel-slide>
        </q-carousel>
        <q-img
          v-else
          :src="companyBanner[0]"
          class="banner-image"
          :ratio="16/9"
        />
      </div>
      <!-- Categorías -->
      <div class="q-mt-lg q-mb-md" v-if="!isSearching">
        <div class="text-subtitle2 text-white text-weight-medium q-mb-sm">Meal Category</div>
        <div class="category-scroll">
          <!-- Categoría All -->
          <div
            class="category-item"
            :class="{ 'category-item-active': selectedCategory === 'all' }"
            @click="selectedCategory = 'all'"
          >
            <div class="category-icon">
              <q-icon name="restaurant_menu" size="24px" />
            </div>
            <div class="category-name">All</div>
          </div>

          <!-- Categorías con/sin imágenes -->
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ 'category-item-active': selectedCategory === category.id }"
            @click="selectCategory(category)"
          >
            <div class="category-icon" v-if="category.images && category.images.length > 0">
              <q-img
                :src="category.images[0].url"
                :ratio="1"
                class="category-image"
              />
            </div>
            <div class="category-icon" v-else>
              <q-icon name="category" size="24px" />
            </div>
            <div class="category-name">{{ category.name }}</div>
          </div>
        </div>
      </div>

      <!-- Productos Populares -->
      <div>
        <div class="flex justify-between items-center q-mb-md">
          <span class="text-subtitle2 text-white text-weight-medium">Populares</span>
        </div>

        <!-- Grid de Productos -->
        <div class="products-grid">
          <div
            v-for="product in displayedProducts"
            :key="product.id"
            class="product-card"
            @click="handleProductClick(product)"
            @click.right.prevent="openProductDetails(product)"
            v-touch-hold="() => openProductDetails(product)"
          >
            <div class="product-image-container">
              <q-img
                v-if="product.images?.[0]?.url"
                :src="product.images[0].url"
                class="product-image"
                :ratio="1"
              />
              <div v-else class="product-no-image">
                <q-icon name="restaurant" size="60px" color="grey-6" />
              </div>
              <!-- Badge "En Carrito" -->
              <div v-if="getProductInCart(product)" class="in-cart-badge">
                <q-icon name="shopping_cart" size="14px" />
                <span>En Carrito</span>
              </div>
              <q-btn
                :icon="product.is_favorite ? 'favorite' : 'favorite_border'"
                :color="product.is_favorite ? 'red' : 'white'"
                flat
                round
                dense
                size="sm"
                class="favorite-btn"
                @click.stop="toggleFavorite(product)"
              />
            </div>
            <div class="product-info">
              <div class="product-name">
                {{ product.name?.toUpperCase() }}
              </div>
              <div class="product-description text-grey-5">
                {{ product.description?.toUpperCase() || 'Delicioso producto' }}
              </div>

              <!-- Rating -->
              <div class="product-rating-new" @click.stop="openRatingDialog(product)">
                <q-icon
                  v-for="i in 5"
                  :key="i"
                  name="star"
                  size="16px"
                  :color="i <= (product.average_rating || 0) ? 'orange' : 'grey-5'"
                />
              </div>

              <!-- Precio -->
              <q-chip
                class="product-price-chip"
                color="red"
                text-color="white"
                size="md"
                dense
              >
                ${{ formatNumber(product.price) }}
              </q-chip>

              <!-- Botones de Cantidad o Agregar -->
              <div v-if="getProductInCart(product)" class="quantity-controls" @click.stop>
                <q-btn
                  icon="remove"
                  round
                  dense
                  color="orange"
                  size="sm"
                  @click="updateQuantity(getProductInCart(product), -1)"
                />
                <span class="quantity-text">{{ getProductInCart(product).amount }}</span>
                <q-btn
                  icon="add"
                  round
                  dense
                  color="orange"
                  size="sm"
                  @click="updateQuantity(getProductInCart(product), 1)"
                />
              </div>
              <q-btn
                v-else
                label="Agregar"
                icon="add_shopping_cart"
                color="orange"
                class="add-to-cart-btn"
                rounded
                dense
                @click.stop="handleProductClick(product)"
              />
            </div>
          </div>
        </div>

        <!-- Skeleton Loading -->
        <div v-if="loading && currentPage === 1" class="products-grid q-mt-md">
          <div v-for="i in 4" :key="i">
            <q-skeleton height="200px" class="product-card" />
          </div>
        </div>

        <!-- Infinite Scroll -->
        <q-infinite-scroll
          v-if="!loading || currentPage > 1"
          @load="onLoadMore"
          :offset="250"
        >
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="orange" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>

        <!-- Mensaje de fin -->
        <div v-if="!hasMoreProducts && products.length > 0" class="text-center q-my-md">
          <span class="text-grey-5">No hay más productos</span>
        </div>
      </div>
    </div>

    <!-- Vista del Carrito -->
    <div v-else-if="currentView === 'cart'" class="cart-container">
      <div class="text-h5 text-white text-weight-medium q-px-md q-pt-md q-pb-sm">Mi Orden</div>

      <div v-if="cartProducts.length === 0" class="text-center q-py-xl">
        <q-icon name="shopping_cart" size="100px" color="grey-6" />
        <div class="text-grey-5 q-mt-md">Tu carrito está vacío</div>
        <q-btn
          label="Explorar Menú"
          color="orange"
          class="q-mt-lg"
          @click="$router.push({ query: { view: 'catalog' } })"
          rounded
          unelevated
        />
      </div>

      <div v-else class="cart-content">
        <!-- Items del carrito -->
        <div class="cart-items q-px-md">
          <div
            v-for="item in cartProducts"
            :key="item.id"
            class="cart-item"
          >
            <div class="cart-item-image">
              <q-img
                v-if="item.images?.[0]?.url"
                :src="item.images[0].url"
                :ratio="1"
              />
              <div v-else class="cart-item-no-image">
                <q-icon name="restaurant" size="40px" color="grey-6" />
              </div>
            </div>
            <div class="cart-item-info">
              <div class="cart-item-name">{{ item.name }}</div>
              <div class="cart-item-observation" v-if="item.observation">{{ item.observation }}</div>
              <div class="cart-item-price">${{ formatNumber(item.price) }}</div>
            </div>
            <div class="cart-item-actions">
              <div class="cart-item-quantity">
                <q-btn
                  icon="remove"
                  unelevated
                  dense
                  size="sm"
                  color="grey-8"
                  round
                  @click="updateQuantity(item, -1)"
                />
                <span class="quantity-value">{{ item.amount }}</span>
                <q-btn
                  icon="add"
                  unelevated
                  dense
                  size="sm"
                  round
                  color="grey-8"
                  @click="updateQuantity(item, 1)"
                />
              </div>
              <q-btn
                icon="delete"
                flat
                dense
                size="sm"
                color="red"
                @click="removeFromCart(item)"
              />
            </div>
          </div>
        </div>

        <!-- Total y Botón -->
        <div class="cart-footer">
          <div class="cart-total">
            <span class="total-label">Total</span>
            <span class="total-amount">${{ formatNumber(totalAmount) }}</span>
          </div>

          <!-- Botón de Mesas -->
          <q-btn
            :label="selectedTables.length > 0 ? `Mesas: ${selectedTables.map(t => t.name).join(', ')}` : 'Seleccionar Mesas'"
            color="grey-8"
            size="md"
            class="q-mb-sm"
            unelevated
            icon="table_bar"
            @click="openTableDialog"
          />

          <q-btn
            label="PROCESAR ORDEN"
            color="orange"
            size="md"
            class="process-order-btn"
            unelevated
            @click="processOrder"
          />
        </div>
      </div>
    </div>

    <!-- Vista de Órdenes -->
    <div v-else-if="currentView === 'orders'" class="orders-container q-pa-md">
      <div class="orders-header q-mb-md">
        <div class="text-h5 text-white">Órdenes de Hoy</div>
        <div class="text-caption text-grey-5">{{ formatDate(new Date()) }} - {{ userSession?.name }}</div>
        <!-- Resumen del día -->
        <div class="day-summary q-mt-md">
          <div class="summary-card">
            <div class="summary-icon">
              <q-icon name="receipt_long" size="24px" color="orange" />
            </div>
            <div class="summary-info">
              <div class="summary-number">{{ orders.length }}</div>
              <div class="summary-label">Órdenes</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">
              <q-icon name="attach_money" size="24px" color="green" />
            </div>
            <div class="summary-info">
              <div
                class="summary-number"
                :class="{ 'large-amount': todayTotal.toString().length > 8 }"
              >
                ${{ formatNumber(todayTotal) }}
              </div>
              <div class="summary-label">Total</div>
            </div>
          </div>
        </div>
      </div>

      <q-card
        v-for="order in orders"
        :key="order.id"
        class="order-card bg-grey-9 text-white q-mb-sm"
        flat
        @click="openOrderDetails(order)"
      >
        <q-card-section>
          <div class="flex justify-between items-center q-mb-sm">
            <div class="order-info">
              <div class="text-subtitle2 text-weight-medium">Orden #{{ order.code }}</div>
              <div class="text-caption text-grey-5">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                {{ formatTime(order.created_at) }}
              </div>
            </div>
            <div class="order-status text-right">
              <div class="text-h6 text-weight-bold text-orange">${{ formatNumber(order.total) }}</div>
              <q-badge
                :color="getStatusColor(order.status)"
                :label="getStatusLabel(order.status)"
                class="q-mt-xs"
              />
            </div>
          </div>

          <!-- BOTONES DE IMPRESIÓN -->
          <div class="print-buttons-container q-mt-sm">
            <div class="flex justify-end q-gutter-sm">
              <q-btn
                icon="print"
                color="orange"
                size="sm"
                round
                dense
                @click.stop="printCommand(order)"
                class="print-button"
              >
                <q-tooltip class="bg-orange text-white">Imprimir Comanda</q-tooltip>
              </q-btn>
              <q-btn
                icon="receipt_long"
                color="green"
                size="sm"
                round
                dense
                @click.stop="printTicket(order)"
                class="print-button"
              >
                <q-tooltip class="bg-green text-white">Imprimir Ticket</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Información adicional de la orden -->
          <div class="order-details">
            <div class="flex items-center justify-between">
              <div class="flex items-center text-caption text-grey-4">
                <q-icon name="person" size="14px" class="q-mr-xs" />
                {{ order.client?.name || 'Cliente' }}
              </div>
              <div class="flex items-center text-caption text-grey-4" v-if="order.tables?.length > 0">
                <q-icon name="table_bar" size="14px" class="q-mr-xs" />
                Mesa {{ order.tables.map(t => t.name).join(', ') }}
              </div>
            </div>
            <div class="text-caption text-grey-4 q-mt-xs" v-if="order.products?.length">
              <q-icon name="shopping_bag" size="14px" class="q-mr-xs" />
              {{ order.products.length }} producto{{ order.products.length !== 1 ? 's' : '' }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Skeleton Loading -->
      <div v-if="loadingOrders && ordersCurrentPage === 1">
        <q-skeleton v-for="i in 4" :key="i" height="80px" class="q-mb-sm" />
      </div>

      <!-- Infinite Scroll -->
      <q-infinite-scroll
        v-if="!loadingOrders || ordersCurrentPage > 1"
        @load="onLoadMoreOrders"
        :offset="250"
      >
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="orange" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>

      <!-- Mensaje de fin -->
      <div v-if="!hasMoreOrders && orders.length > 0" class="text-center q-my-md">
        <span class="text-grey-5">No hay más órdenes</span>
      </div>

      <div v-if="orders.length === 0 && !loadingOrders" class="empty-orders text-center q-py-xl">
        <q-icon name="receipt_long" size="100px" color="grey-6" />
        <div class="text-h6 text-grey-5 q-mt-md">No hay órdenes hoy</div>
        <div class="text-body2 text-grey-6 q-mt-sm">Las órdenes que realices aparecerán aquí</div>
        <q-btn
          label="Explorar Menú"
          color="orange"
          class="q-mt-lg"
          @click="$router.push({ query: { view: 'catalog' } })"
          rounded
          unelevated
        />
      </div>
    </div>

    <!-- Vista de Favoritos -->
    <div v-else-if="currentView === 'favorites'" class="favorites-container q-pa-md">
      <div class="text-h5 text-white q-mb-md">Mis Favoritos</div>

      <div class="products-grid">
        <div
          v-for="product in favoriteProducts"
          :key="product.id"
          class="product-card"
          @click="handleProductClick(product)"
          @click.right.prevent="openProductDetails(product)"
          v-touch-hold="() => openProductDetails(product)"
        >
          <div class="product-image-container">
            <q-img
              v-if="product.images?.[0]?.url"
              :src="product.images[0].url"
              class="product-image"
              :ratio="1"
            />
            <div v-else class="product-no-image">
              <q-icon name="restaurant" size="60px" color="grey-6" />
            </div>
            <!-- Badge "En Carrito" -->
            <div v-if="getProductInCart(product)" class="in-cart-badge">
              <q-icon name="shopping_cart" size="14px" />
              <span>En Carrito</span>
            </div>
            <q-btn
              icon="favorite"
              color="red"
              flat
              round
              dense
              size="sm"
              class="favorite-btn"
              @click.stop="toggleFavorite(product)"
            />
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.name?.toUpperCase() }}</div>
            <div class="product-description text-grey-5">{{ product?.description?.toUpperCase() || 'Delicioso producto' }}</div>

            <!-- Rating -->
            <div class="product-rating-new" @click.stop="openRatingDialog(product)">
              <q-icon
                v-for="i in 5"
                :key="i"
                name="star"
                size="16px"
                :color="i <= (product.average_rating || 0) ? 'orange' : 'grey-5'"
              />
            </div>

            <!-- Precio -->
            <q-chip
              class="product-price-chip"
              color="red"
              text-color="white"
              size="md"
              dense
            >
              ${{ formatNumber(product.price) }}
            </q-chip>

            <!-- Botones de Cantidad o Agregar -->
            <div v-if="getProductInCart(product)" class="quantity-controls" @click.stop>
              <q-btn
                icon="remove"
                round
                dense
                color="orange"
                size="sm"
                @click="updateQuantity(getProductInCart(product), -1)"
              />
              <span class="quantity-text">{{ getProductInCart(product).amount }}</span>
              <q-btn
                icon="add"
                round
                dense
                color="orange"
                size="sm"
                @click="updateQuantity(getProductInCart(product), 1)"
              />
            </div>
            <q-btn
              v-else
              label="Agregar"
              icon="add_shopping_cart"
              color="orange"
              class="add-to-cart-btn"
              rounded
              dense
              @click.stop="handleProductClick(product)"
            />
          </div>
        </div>
      </div>

      <div v-if="favoriteProducts.length === 0" class="text-center q-py-xl">
        <q-icon name="favorite_border" size="100px" color="grey-6" />
        <div class="text-grey-5 q-mt-md">No tienes favoritos</div>
        <q-btn
          label="Explorar Menú"
          color="orange"
          class="q-mt-lg"
          @click="$router.push({ query: { view: 'catalog' } })"
          rounded
        />
      </div>
    </div>

    <!-- Modal de Búsqueda -->
    <q-dialog v-model="searchDialog" position="top">
      <q-card class="search-dialog-card">
        <q-card-section class="q-pa-md">
          <div class="text-h6 text-white q-mb-md">Buscar productos</div>
          <q-input
            v-model="searchQuery"
            placeholder="Buscar por nombre, descripción o categoría..."
            dark
            outlined
            autofocus
            @keyup.enter="performSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-5" />
            </template>
            <template v-slot:append>
              <q-icon
                v-if="searchQuery"
                name="close"
                color="grey-5"
                class="cursor-pointer"
                @click="searchQuery = ''"
              />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            label="Cancelar"
            flat
            color="grey-5"
            v-close-popup
          />
          <q-btn
            label="Buscar"
            unelevated
            color="orange"
            @click="performSearch"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de Detalle de Orden -->
    <q-dialog
      v-model="orderDetailDialog"
      position="bottom"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="order-detail-card" v-if="selectedOrder">
        <!-- Header -->
        <div class="order-detail-header">
          <q-btn
            icon="arrow_back"
            flat
            round
            dense
            color="white"
            @click="orderDetailDialog = false"
          />
          <div class="order-detail-title text-white">
            <div class="text-h6">Orden #{{ selectedOrder.code }}</div>
            <div class="text-caption">{{ formatDate(selectedOrder.created_at) }}</div>
          </div>
          <q-badge :color="getStatusColor(selectedOrder.status)" :label="getStatusLabel(selectedOrder.status)" />
        </div>

        <q-card-section class="order-detail-content">
          <!-- Cliente -->
          <div class="compact-section">
            <div class="compact-title">
              <q-icon name="person" size="16px" color="orange" />
              <span>Cliente</span>
            </div>
            <div class="compact-info">
              <div class="compact-row">
                <span class="compact-label">Nombre:</span>
                <span class="compact-value">{{ selectedOrder.client?.name }}</span>
              </div>
              <div class="compact-row" v-if="selectedOrder.client?.document_number">
                <span class="compact-label">Documento:</span>
                <span class="compact-value">{{ selectedOrder.client.document_number }}</span>
              </div>
            </div>
          </div>

          <!-- Mesas -->
          <div class="compact-section" v-if="selectedOrder.tables?.length > 0">
            <div class="compact-title">
              <q-icon name="table_bar" size="16px" color="orange" />
              <span>Mesas</span>
            </div>
            <div class="compact-tables">
              <q-chip
                v-for="table in selectedOrder.tables"
                :key="table.id"
                color="orange"
                text-color="white"
                size="sm"
                icon="table_bar"
              >
                {{ table.name }}
              </q-chip>
            </div>
          </div>

          <!-- Productos -->
          <div class="compact-section">
            <div class="compact-title">
              <q-icon name="shopping_bag" size="16px" color="orange" />
              <span>Productos ({{ selectedOrder.products?.length }})</span>
            </div>
            <div class="compact-products">
              <div
                v-for="product in selectedOrder.products"
                :key="product.id"
                class="compact-product"
              >
                <div class="compact-product-image">
                  <q-img
                    v-if="product.images?.[0]?.url"
                    :src="product.images[0].url"
                    :ratio="1"
                  />
                  <q-icon v-else name="restaurant" size="32px" color="grey-6" />
                </div>
                <div class="compact-product-info">
                  <div class="compact-product-name">{{ product.name }}</div>
                  <div class="compact-product-meta">
                    Cantidad: {{ product.pivot.amount }} · Precio: ${{ formatNumber(product.pivot.price) }}
                  </div>
                </div>
                <div class="compact-product-total">
                  ${{ formatNumber(product.pivot.amount * product.pivot.price) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Total -->
          <div class="compact-total">
            <span>Total:</span>
            <span class="compact-total-amount">${{ formatNumber(selectedOrder.total) }}</span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo de Selección de Mesas -->
    <q-dialog
      v-model="tableDialog"
      position="bottom"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="table-dialog-card">
        <!-- Header -->
        <div class="table-dialog-header">
          <q-btn
            icon="arrow_back"
            flat
            round
            dense
            color="white"
            @click="tableDialog = false"
          />
          <div class="table-dialog-title text-white">
            <div class="text-h6">Seleccionar Mesas</div>
            <div class="text-caption" v-if="selectedTables.length > 0">
              {{ selectedTables.length }} mesa(s) seleccionada(s)
            </div>
          </div>
          <q-btn
            label="Confirmar"
            color="orange"
            unelevated
            dense
            @click="confirmTables"
            v-if="selectedTables.length > 0"
          />
        </div>

        <q-card-section class="table-dialog-content">
          <!-- Tabs de Salones -->
          <div class="room-tabs">
            <q-btn
              v-for="room in livingRooms"
              :key="room.id"
              :label="room.name"
              :color="selectedRoom?.id === room.id ? 'orange' : 'grey'"
              :unelevated="selectedRoom?.id === room.id"
              :outline="selectedRoom?.id !== room.id"
              class="room-tab"
              @click="changeRoom(room)"
            />
          </div>

          <!-- Loading -->
          <div v-if="loadingTables" class="text-center q-py-xl">
            <q-spinner color="orange" size="50px" />
          </div>

          <!-- Grid de Mesas -->
          <div v-else class="tables-grid">
            <div
              v-for="table in roomTables"
              :key="table.id"
              class="table-card"
              :class="{ 'table-selected': isTableSelected(table), 'table-occupied': table.invoices?.length > 0 }"
              @click="table.invoices?.length === 0 && toggleTable(table)"
            >
              <q-icon
                name="table_bar"
                size="32px"
                :color="isTableSelected(table) ? 'orange' : 'white'"
              />
              <div class="table-name">{{ table.name }}</div>
              <div class="table-status" v-if="table.invoices?.length > 0">
                Ocupada
              </div>
              <q-icon
                v-if="isTableSelected(table)"
                name="check_circle"
                size="20px"
                color="orange"
                class="table-check"
              />
            </div>
          </div>

          <!-- Sin mesas -->
          <div v-if="!loadingTables && roomTables.length === 0" class="text-center q-py-xl">
            <q-icon name="table_bar" size="80px" color="grey-6" />
            <div class="text-grey-5 q-mt-md">No hay mesas en este salón</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Vista 2: Detalle del producto -->
    <q-dialog
      v-model="productDialog"
      position="bottom"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="product-detail-card">
        <!-- Header -->
        <q-toolbar class="product-detail-header">
          <q-btn
            icon="arrow_back"
            flat
            round
            dense
            color="white"
            @click="productDialog = false"
          />
          <q-space />
          <q-btn
            :icon="selectedProduct?.is_favorite ? 'favorite' : 'favorite_border'"
            :color="selectedProduct?.is_favorite ? 'red' : 'white'"
            flat
            round
            dense
            @click="toggleFavorite(selectedProduct)"
          />
        </q-toolbar>

        <!-- Carrusel de imágenes del producto -->
        <div class="product-detail-image-container">
          <!-- Gradiente superior -->
          <div class="image-gradient-overlay"></div>
          <q-carousel
            v-if="selectedProduct?.images?.length > 1"
            v-model="productSlide"
            animated
            navigation
            infinite
            arrows
            transition-prev="slide-right"
            transition-next="slide-left"
            class="product-carousel"
          >
            <q-carousel-slide
              v-for="(image, index) in selectedProduct.images"
              :key="index"
              :name="index"
              class="q-pa-none"
            >
              <q-img
                :src="image.url"
                class="product-detail-image"
                :ratio="1"
              />
            </q-carousel-slide>
          </q-carousel>
          <q-img
            v-else-if="selectedProduct?.images?.[0]?.url"
            :src="selectedProduct.images[0].url"
            class="product-detail-image"
            :ratio="1"
          />
          <div v-else class="product-detail-no-image">
            <q-icon name="restaurant" size="120px" color="grey-6" />
          </div>
        </div>

        <!-- Información del producto -->
        <q-card-section class="product-detail-info">
          <div class="text-h5 text-white text-weight-medium">{{ selectedProduct?.name }}</div>
          <div class="text-caption text-grey-5 q-mt-xs">{{ selectedProduct?.category?.name }}</div>

          <!-- Rating y precio -->
          <div class="flex items-center justify-between q-mt-md">
            <div class="product-rating-large">
              <q-icon v-for="i in 5" :key="i" name="star" size="18px" color="orange" />
            </div>
            <div class="product-detail-price">${{ formatNumber(selectedProduct?.price) }}</div>
          </div>

          <!-- Descripción -->
          <div class="q-mt-lg" v-if="selectedProduct?.description">
            <div class="text-body2 text-grey-4">
              {{ selectedProduct?.description }}
            </div>
          </div>

          <!-- Observaciones -->
          <div class="q-mt-lg">
            <div class="text-subtitle2 text-white q-mb-sm">Observaciones</div>
            <q-input
              v-model="productObservation"
              filled
              dark
              type="textarea"
              placeholder="Ej: Sin cebolla, término medio..."
              rows="3"
              class="observation-input"
            />
          </div>

          <!-- Selector de cantidad -->
          <div class="quantity-selector q-mt-lg">
            <q-btn
              round
              flat
              icon="remove"
              color="white"
              size="md"
              @click="productQuantity = Math.max(1, productQuantity - 1)"
            />
            <div class="quantity-display">
              <span class="text-h6 text-white">{{ String(productQuantity).padStart(2, '0') }}</span>
            </div>
            <q-btn
              round
              flat
              icon="add"
              color="white"
              size="md"
              @click="productQuantity++"
            />
          </div>
        </q-card-section>

        <!-- Botón Order Now -->
        <q-card-actions class="q-pa-md">
          <q-btn
            label="Order Now"
            color="orange"
            size="lg"
            class="full-width order-btn"
            rounded
            @click="addToCart(selectedProduct, productQuantity, productObservation)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Vista 3: Vista de categoría con banner -->
    <q-dialog
      v-model="categoryDialog"
      position="bottom"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="category-detail-card">
        <!-- Header -->
        <!-- Banner con imagen de fondo -->
        <div class="category-banner-container" v-if="selectedCategoryData?.images?.length">
          <!-- Botón atrás -->
          <q-btn
            icon="arrow_back"
            flat
            round
            dense
            color="white"
            class="category-back-btn"
            @click="categoryDialog = false"
          />
          <!-- Avatar del usuario -->
          <q-avatar size="50px" class="category-user-avatar" v-if="userSession">
            <img :src="getUserAvatar()" />
          </q-avatar>
          <!-- Gradiente superior para los botones -->
          <div class="category-gradient-top"></div>
          <!-- Gradiente inferior para desvanecer la imagen -->
          <div class="category-gradient-bottom"></div>
          <q-carousel
            v-if="selectedCategoryData.images.length > 1"
            v-model="categorySlide"
            animated
            navigation
            infinite
            arrows
            transition-prev="slide-right"
            transition-next="slide-left"
            class="category-carousel"
          >
            <q-carousel-slide
              v-for="(image, index) in selectedCategoryData.images"
              :key="index"
              :name="index"
              class="q-pa-none"
            >
              <q-img
                :src="image.url"
                class="category-banner-image"
                :ratio="16/9"
              />
              <div class="category-banner-overlay">
                <div class="category-banner-text">
                  <div class="text-h4 text-white text-weight-bold">{{ selectedCategoryData.name }}</div>
                  <div class="text-h6 text-white q-mt-xs">{{ selectedCategoryData.name }}</div>
                  <div class="text-body2 text-grey-4 q-mt-xs" v-if="selectedCategoryData.description">
                    {{ selectedCategoryData.description }}
                  </div>
                </div>
              </div>
            </q-carousel-slide>
          </q-carousel>
          <div v-else class="category-banner-single">
            <q-img
              :src="selectedCategoryData.images[0].url"
              class="category-banner-image"
              :ratio="16/9"
            />
          </div>
          <div class="category-banner-overlay">
            <div class="category-banner-text">
              <div class="text-h4 text-white text-weight-bold">
                {{ selectedCategoryData.name }}
              </div>
              <div
                class="text-body2 text-grey-4 q-mt-xs"
                v-if="selectedCategoryData.description">
                {{ selectedCategoryData.description }}
              </div>
            </div>
          </div>
        </div>
        <!-- Productos de la categoría -->
        <q-card-section class="category-products q-pa-md">
          <div class="products-grid">
            <div
              v-for="product in categoryProducts"
              :key="product.id"
              class="product-card"
              @click="openProductDetails(product)"
            >
              <div class="product-image-container">
                <q-img
                  v-if="product.images?.[0]?.url"
                  :src="product.images[0].url"
                  class="product-image"
                  :ratio="1"
                />
                <div v-else class="product-no-image">
                  <q-icon name="restaurant" size="60px" color="grey-6" />
                </div>
                <q-badge
                  v-if="getProductInCart(product)"
                  color="green"
                  floating
                  class="cart-badge-product"
                >
                  {{ getProductInCart(product).amount }}
                </q-badge>
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-description">{{ product.category?.name }}</div>
                <div class="product-footer">
                  <div class="product-rating">
                    <q-icon v-for="i in 5" :key="i" name="star" size="10px" color="orange" />
                  </div>
                  <div class="product-price">${{ formatNumber(product.price) }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog de Rating -->
    <q-dialog v-model="showRatingDialog">
      <q-card class="rating-dialog" style="min-width: 350px">
        <q-card-section class="bg-grey-9 text-white">
          <div class="text-h6">Calificar Producto</div>
          <div class="text-caption">{{ selectedProduct?.name }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <div class="text-center q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Tu calificación</div>
            <div class="rating-stars-large">
              <q-icon
                v-for="i in 5"
                :key="i"
                name="star"
                size="40px"
                :color="i <= productRatingValue ? 'orange' : 'grey-5'"
                class="cursor-pointer"
                @click="productRatingValue = i"
              />
            </div>
          </div>

          <q-input
            v-model="productRatingComment"
            type="textarea"
            label="Comentario (opcional)"
            filled
            rows="3"
            maxlength="500"
            counter
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Cancelar"
            color="grey"
            flat
            @click="showRatingDialog = false"
          />
          <q-btn
            label="Guardar"
            color="orange"
            @click="submitRating"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Botón flotante del carrito -->
    <!-- <q-page-sticky position="bottom-right" :offset="[18, 18]" v-if="cartItemsCount > 0">
      <q-btn
        fab
        icon="shopping_cart"
        color="orange"
        @click="$router.push({ query: { ...$route.query, view: 'cart' } })"
        class="cart-fab"
      >
        <q-badge color="red" floating rounded>
          {{ cartItemsCount }}
        </q-badge>
      </q-btn>
    </q-page-sticky> -->

    <!-- Scanner de productos -->
    <!-- <ProductScanner
      @product-found="handleProductFound"
      @product-not-found="handleProductNotFound"
    /> -->
  </q-page>
</template>

<script>
import { mapState } from 'pinia'
import { useCommandStore } from 'src/stores/command'
import { authentication } from 'src/stores/module-authentication'
// import ProductScanner from 'src/components/Catalog/ProductScanner.vue'
import { formatNumber, formatDate } from 'src/const/mixins'
import { commandPrint, ticketPrint } from 'src/const/printers'

export default {
  name: 'CommandPageNew',
  components: {
    // ProductScanner
  },
  data () {
    return {
      bannerSlide: 0,
      productSlide: 0,
      categorySlide: 0,
      selectedCategory: 'all',
      selectedCategoryData: null,
      categories: [],
      products: [],
      featuredProduct: null,
      loading: false,
      showAllProducts: false,
      productDialog: false,
      categoryDialog: false,
      selectedProduct: null,
      productQuantity: 1,
      productObservation: '',
      productRatingValue: 0,
      productRatingComment: '',
      showRatingDialog: false,
      orders: [],
      favoriteProducts: [],
      formatNumber,
      formatDate,
      companyBanner: [],
      searchDialog: false,
      searchQuery: '',
      currentPage: 1,
      pageSize: 100,
      totalProducts: 0,
      hasMoreProducts: true,
      ordersCurrentPage: 1,
      ordersPageSize: 100,
      totalOrders: 0,
      hasMoreOrders: true,
      loadingOrders: false,
      orderDetailDialog: false,
      selectedOrder: null,
      tableDialog: false,
      livingRooms: [],
      selectedRoom: null,
      roomTables: [],
      selectedTables: [],
      loadingTables: false
    }
  },
  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice']),
    company () {
      return this.userSession?.company_session
    },
    greeting () {
      const hour = new Date().getHours()
      const name = this.userSession?.name?.split(' ')[0] || 'Usuario'
      if (hour < 12) return `Buenos días, ${name}!`
      if (hour < 18) return `Buenas tardes, ${name}!`
      return `Buenas noches, ${name}!`
    },
    currentView () {
      return this.$route.query.view || 'catalog'
    },
    searchQueryFromUrl () {
      return this.$route.query.search || ''
    },
    isSearching () {
      return !!this.searchQueryFromUrl
    },
    cartProducts () {
      const store = useCommandStore()
      return store?.command?.products || []
    },
    cartItemsCount () {
      return this.cartProducts.length
    },
    totalAmount () {
      return this.cartProducts.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    },
    displayedProducts () {
      // La búsqueda y paginación se manejan en el backend
      // Solo retornamos los productos tal cual vienen
      return this.products
    },
    todayTotal () {
      return this.orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0)
    },
    categoryProducts () {
      return this.products.filter(p => p.category_id === this.selectedCategoryData?.id)
    }
  },
  watch: {
    selectedCategory () {
      this.loadProducts()
    },
    currentView (newView) {
      if (newView === 'orders' && this.userSession) {
        this.loadOrders()
      } else if (newView === 'favorites' && this.userSession) {
        this.loadFavorites()
      }
    },
    searchQueryFromUrl (newVal) {
      this.searchQuery = newVal
      // Cuando cambia la búsqueda, recargar productos
      this.loadProducts()
    }
  },
  created () {
    this.loadCategories()
    this.loadProducts()
    this.loadCompanyBanner()
    if (this.currentView === 'orders' && this.userSession) {
      this.loadOrders()
    }
    if (this.currentView === 'favorites' && this.userSession) {
      this.loadFavorites()
    }
  },
  methods: {
    getUserAvatar () {
      const user = this.userSession?.user || this.userSession
      if (user?.avatar_url) {
        return user.avatar_url
      }
      const name = user?.name || 'U'
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff9800&color=fff&size=128&bold=true`
    },

    openSearchDialog () {
      this.searchQuery = this.searchQueryFromUrl
      this.searchDialog = true
    },

    performSearch () {
      if (this.searchQuery.trim()) {
        this.$router.push({
          query: {
            ...this.$route.query,
            search: this.searchQuery.trim()
          }
        })
      } else {
        this.clearSearch()
      }
      this.searchDialog = false
    },

    clearSearch () {
      this.searchQuery = ''
      const query = { ...this.$route.query }
      delete query.search
      this.$router.push({ query })
    },

    loadCompanyBanner () {
      if (this.company) {
        this.companyBanner = this.company.company_config?.other?.menu?.banner_url
          ? [this.company.company_config.other.menu.banner_url]
          : [this.company.url]
      }
    },

    async loadCategories () {
      try {
        const { data } = await this.$api.get('categories', {
          params: {
            sortBy: 'sort_order',
            sortOrder: 'asc',
            dataFilter: {
              show_catalog: 1
            }
          }
        })
        this.categories = data
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    },

    async loadProducts (reset = true) {
      try {
        if (reset) {
          this.currentPage = 1
          this.products = []
          this.hasMoreProducts = true
        }

        if (!this.hasMoreProducts) return

        this.loading = true
        const params = {
          stock: true,
          paginate: true,
          withStock: true,
          sortOrder: 'desc',
          sortBy: 'sold',
          branch_office_id: this.branchOffice?.id,
          with: 'ratings',
          page: this.currentPage,
          perPage: this.pageSize,
          dataEqualFilter: {
            show_catalog: 1,
            'category.show_catalog': 1
          },
          dataSearch: {
            name: '',
            description: '',
            barcode: ''
          }
        }

        // Si hay búsqueda, agregar al dataSearch
        if (this.searchQueryFromUrl) {
          params.dataSearch.name = this.searchQueryFromUrl
          params.dataSearch.description = this.searchQueryFromUrl
          params.dataSearch.barcode = this.searchQueryFromUrl
        }

        if (this.selectedCategory !== 'all') {
          params.dataEqualFilter.category_id = this.selectedCategory
        }

        const { data } = await this.$api.get('products', { params })

        if (reset) {
          this.products = data?.data || data
        } else {
          this.products = [...this.products, ...data?.data || data]
        }
        this.totalProducts = data?.total || data.length
        this.hasMoreProducts = data?.data?.length === this.pageSize

        if (this.products.length > 0 && !this.featuredProduct) {
          this.featuredProduct = this.products[0]
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        this.loading = false
      }
    },

    async loadMoreProducts () {
      if (this.loading || !this.hasMoreProducts) return

      this.currentPage++
      await this.loadProducts(false)
    },

    async onLoadMore (index, done) {
      if (!this.hasMoreProducts) {
        done()
        return
      }

      await this.loadMoreProducts()
      done()
    },

    selectCategory (category) {
      this.selectedCategory = category.id
      this.selectedCategoryData = category

      // Si la categoría tiene imágenes, mostrar la vista de categoría
      if (category.images && category.images.length > 0) {
        this.categorySlide = 0
        this.categoryDialog = true
      } else {
        // Si no tiene imágenes, solo filtrar productos
        this.loadProducts()
      }
    },

    handleProductClick (product) {
      // Si tiene addons, abrir el detalle
      if (product.addons && product.addons.length > 0) {
        this.openProductDetails(product)
        return
      }

      // Si no tiene addons, agregar directamente al carrito
      this.addToCart(product, 1, '')
    },

    openProductDetails (product) {
      this.selectedProduct = product
      this.productQuantity = 1
      this.productObservation = ''
      this.productDialog = true
    },

    addToCart (product, quantity = 1, observation = '') {
      const store = useCommandStore()
      const products = [...(store.command?.products || [])]

      const existingProduct = products.find(p => p.id === product.id)

      if (existingProduct) {
        existingProduct.amount += quantity
        existingProduct.subtotal = existingProduct.amount * existingProduct.price
        if (observation) {
          existingProduct.observation = observation
        }
      } else {
        products.push({
          ...product,
          amount: quantity,
          subtotal: quantity * product.price,
          observation,
          product_id: product.id
        })
      }

      store.setCommands({ products })

      this.productDialog = false

      this.$q.notify({
        type: 'positive',
        message: 'Producto agregado al carrito',
        position: 'top',
        timeout: 1500,
        icon: 'shopping_cart'
      })
    },

    getProductInCart (product) {
      return this.cartProducts.find(p => p.id === product.id)
    },

    handleProductFound (product) {
      this.openProductDetails(product)
    },

    handleProductNotFound (code) {
      this.$q.notify({
        type: 'warning',
        message: `Producto con código ${code} no encontrado`,
        position: 'top'
      })
    },

    async toggleFavorite (product) {
      try {
        const { data } = await this.$api.post('product-favorites', {
          product_id: product.id
        })

        product.is_favorite = data.is_favorite

        // Actualizar contador
        if (data.is_favorite) {
          product.favorites_count = (product.favorites_count || 0) + 1
        } else {
          product.favorites_count = Math.max(0, (product.favorites_count || 0) - 1)
        }

        this.$q.notify({
          type: 'positive',
          message: data.message,
          position: 'top',
          timeout: 1500
        })

        // Recargar favoritos si estamos en esa vista
        if (this.currentView === 'favorites') {
          this.loadFavorites()
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al actualizar favorito',
          position: 'top'
        })
      }
    },

    openRatingDialog (product) {
      this.selectedProduct = product
      this.productRatingValue = product.user_rating || 0
      this.productRatingComment = ''
      this.showRatingDialog = true
    },

    async submitRating () {
      if (this.productRatingValue === 0) {
        this.$q.notify({
          type: 'warning',
          message: 'Por favor selecciona una calificación',
          position: 'top'
        })
        return
      }

      try {
        const { data } = await this.$api.post('product-ratings', {
          product_id: this.selectedProduct.id,
          rating: this.productRatingValue,
          comment: this.productRatingComment
        })

        // Actualizar producto con nuevos datos
        this.selectedProduct.average_rating = data.product.average_rating
        this.selectedProduct.ratings_count = data.product.ratings_count
        this.selectedProduct.user_rating = this.productRatingValue

        // Actualizar en la lista de productos
        const productIndex = this.products.findIndex(p => p.id === this.selectedProduct.id)
        if (productIndex !== -1) {
          this.products[productIndex].average_rating = data.product.average_rating
          this.products[productIndex].ratings_count = data.product.ratings_count
          this.products[productIndex].user_rating = this.productRatingValue
        }

        this.showRatingDialog = false

        this.$q.notify({
          type: 'positive',
          message: 'Calificación guardada exitosamente',
          position: 'top'
        })
      } catch (error) {
        console.error('Error rating product:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al guardar calificación',
          position: 'top'
        })
      }
    },

    async loadFavorites () {
      try {
        const { data } = await this.$api.get('product-favorites', {
          params: {
            with: 'product.ratings'
          }
        })
        this.favoriteProducts = data.map(f => f.product)
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    },

    updateQuantity (item, delta) {
      const store = useCommandStore()
      const products = [...(store.command?.products || [])]
      const product = products.find(p => p.id === item.id)

      if (product) {
        product.amount = Math.max(1, product.amount + delta)
        product.subtotal = product.amount * product.price
        store.setCommands({ products })
      }
    },

    removeFromCart (item) {
      const store = useCommandStore()
      const products = (store.command?.products || []).filter(p => p.id !== item.id)
      store.setCommands({ products })
    },

    async processOrder () {
      // Validación: Usuario debe estar logueado
      if (!this.userSession) {
        this.$q.notify({
          type: 'warning',
          message: 'Debes iniciar sesión para procesar la orden',
          position: 'top'
        })
        return
      }

      // Validación: Debe haber productos en el carrito
      if (this.cartProducts.length === 0) {
        this.$q.notify({
          type: 'warning',
          message: 'No se puede crear pedido sin productos',
          position: 'top'
        })
        return
      }

      // Obtener cliente default de la configuración
      const client = this.userSession?.company_session?.company_config?.client

      if (!client) {
        this.$q.notify({
          type: 'warning',
          message: 'No se puede crear pedido sin cliente configurado',
          position: 'top'
        })
        return
      }

      try {
        this.$q.loading.show({
          message: 'Procesando orden...'
        })

        const products = this.cartProducts.map(product => ({
          id: product.id,
          amount: product.amount,
          price: product.price,
          cost: product.cost || 0,
          subtotal: product.subtotal,
          observation: product.observation || ''
        }))

        // Crear la orden
        await this.$api.post('command-orders', {
          seller_id: this.userSession?.id,
          client_id: client?.id,
          products,
          branch_office_id: this.branchOffice?.id,
          tables: this.selectedTables.map(table => table.id),
          company_id: this.userSession?.company_session_id,
          code: 2
        })

        // Limpiar carrito y mesas después de crear la orden
        const store = useCommandStore()
        store.setCommands({ products: [] })
        this.selectedTables = []

        // Mostrar notificación de éxito
        this.$q.notify({
          type: 'positive',
          message: 'Pedido creado exitosamente',
          position: 'top',
          icon: 'check_circle'
        })

        // Cambiar a vista de órdenes
        this.$router.push({
          query: {
            ...this.$route.query,
            view: 'orders'
          }
        })

        // Recargar órdenes
        this.loadOrders()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Error al procesar la orden',
          position: 'top',
          icon: 'warning'
        })
      } finally {
        this.$q.loading.hide()
      }
    },

    async loadOrders (reset = true) {
      try {
        if (reset) {
          this.ordersCurrentPage = 1
          this.orders = []
          this.hasMoreOrders = true
        }

        if (!this.hasMoreOrders) return

        this.loadingOrders = true
        const { data } = await this.$api.get('invoices', {
          params: {
            paginate: true,
            page: this.ordersCurrentPage,
            perPage: this.ordersPageSize,
            sortOrder: 'desc',
            sortBy: 'id',
            dataFilter: {
              seller_id: this.userSession.id
            }
          }
        })

        if (reset) {
          this.orders = data?.data || data
        } else {
          this.orders = [...this.orders, ...(data?.data || data)]
        }

        this.totalOrders = data?.total || data.length
        this.hasMoreOrders = (data?.data || data).length === this.ordersPageSize
      } catch (error) {
        console.error('Error loading orders:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar órdenes del día',
          position: 'top'
        })
      } finally {
        this.loadingOrders = false
      }
    },

    async loadMoreOrders () {
      if (this.loadingOrders || !this.hasMoreOrders) return

      this.ordersCurrentPage++
      await this.loadOrders(false)
    },

    async onLoadMoreOrders (index, done) {
      if (!this.hasMoreOrders) {
        done()
        return
      }

      await this.loadMoreOrders()
      done()
    },

    async openOrderDetails (order) {
      try {
        this.$q.loading.show()
        // Cargar detalles completos de la orden
        const { data } = await this.$api.get(`invoices/${order.id}`)
        this.selectedOrder = data.data
        this.orderDetailDialog = true
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar detalles de la orden',
          position: 'top'
        })
      } finally {
        this.$q.loading.hide()
      }
    },

    getStatusColor (status) {
      const statusColors = {
        1: 'warning',
        2: 'positive',
        3: 'negative'
      }
      return statusColors[status] || 'grey'
    },

    getStatusLabel (status) {
      const statusLabels = {
        pending: 'Pendiente',
        paid: 'Pagado',
        cancelled: 'Cancelado'
      }
      return statusLabels[status] || 'Desconocido'
    },

    async openTableDialog () {
      this.tableDialog = true
      await this.loadLivingRooms()
    },

    async loadLivingRooms () {
      try {
        this.loadingTables = true
        const { data } = await this.$api.get('living-rooms')
        this.livingRooms = data
        if (this.livingRooms.length > 0) {
          this.selectedRoom = this.livingRooms[0]
          await this.loadTablesForRoom(this.selectedRoom.id)
        }
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar salones',
          position: 'top'
        })
      } finally {
        this.loadingTables = false
      }
    },

    async loadTablesForRoom (roomId) {
      try {
        this.loadingTables = true
        const { data } = await this.$api.get('tables', {
          params: {
            dataEqualFilter: {
              living_room_id: roomId
            }
          }
        })
        this.roomTables = data
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar mesas',
          position: 'top'
        })
      } finally {
        this.loadingTables = false
      }
    },

    async changeRoom (room) {
      this.selectedRoom = room
      await this.loadTablesForRoom(room.id)
    },

    toggleTable (table) {
      const index = this.selectedTables.findIndex(t => t.id === table.id)
      if (index > -1) {
        this.selectedTables.splice(index, 1)
      } else {
        this.selectedTables.push(table)
      }
    },

    isTableSelected (table) {
      return this.selectedTables.some(t => t.id === table.id)
    },

    confirmTables () {
      this.tableDialog = false
      this.$q.notify({
        type: 'positive',
        message: `${this.selectedTables.length} mesa(s) seleccionada(s)`,
        position: 'top'
      })
    },

    formatTime (dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    },

    /**
     * Print command for order
     * @param {Object} order order data
     */
    async printCommand (order) {
      try {
        commandPrint(order)
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Error al imprimir comanda',
          position: 'top',
          icon: 'warning'
        })
      }
    },

    /**
     * Print ticket for order
     * @param {Object} order order data
     */
    async printTicket (order) {
      try {
        ticketPrint(order)
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Error al imprimir ticket',
          position: 'top',
          icon: 'warning'
        })
      }
    }
  }
}
</script>

<style scoped>
.command-page {
  background: linear-gradient(180deg, #1a1d29 0%, #252836 100%);
  min-height: 100vh;
}

.command-container {
  max-width: 500px;
  margin: 0 auto;
  padding-bottom: 80px;
}

/* Banner */
.banner-container {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.banner-carousel,
.banner-image {
  border-radius: 16px;
}

/* Producto Destacado */
.featured-card {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;
}

.featured-card:hover {
  transform: translateY(-4px);
}

.featured-image-container {
  width: 140px;
  height: 105px;
  border-radius: 12px;
  overflow: hidden;
  float: left;
  margin-right: 16px;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-info {
  padding-top: 8px;
}

.featured-price {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
}

/* Categorías */
.category-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  padding-top: 4px;
}

.category-scroll::-webkit-scrollbar {
  height: 4px;
}

.category-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  cursor: pointer;
}

.category-item:active {
  opacity: 0.8;
}

.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  overflow: hidden;
}

.category-item-active .category-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-color: #ff6b6b;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.category-icon .q-icon {
  color: #8e8e93;
}

.category-item-active .category-icon .q-icon {
  color: white;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.category-name {
  color: #8e8e93;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.category-item-active .category-name {
  color: white;
  font-weight: 600;
}

/* Botón See More */
.see-more-btn {
  font-size: 12px;
  opacity: 0.7;
}

/* Grid de Productos */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.product-card {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}

.product-card:active {
  opacity: 0.9;
}

.product-image-container {
  width: 100%;
  height: 140px;
  overflow: hidden;
  position: relative;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
}

.cart-badge-product {
  top: 8px;
  right: 8px;
}

.product-info {
  padding: 12px 12px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.product-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.product-description {
  color: #8e8e93;
  font-size: 11px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-footer-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
  gap: 8px;
}

.product-rating-new {
  display: flex;
  gap: 3px;
  justify-content: center;
  margin-top: 8px;
}

/* Controles de Cantidad */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  padding: 6px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.quantity-text {
  color: white;
  font-size: 16px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

/* Botón Agregar */
.add-to-cart-btn {
  margin-top: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.product-price {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.product-price-chip {
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 12px;
  text-align: center !important;
}

/* Detalle de Orden */
.order-detail-card {
  background: linear-gradient(180deg, #1a1d29 0%, #252836 100%);
  height: 100%;
}

.order-detail-header {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.order-detail-title {
  flex: 1;
}

.order-detail-content {
  padding: 8px;
  max-height: calc(100vh - 70px);
  overflow-y: auto;
}

/* Secciones Compactas */
.compact-section {
  margin-bottom: 12px;
}

.compact-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: orange;
  font-weight: 600;
  margin-bottom: 6px;
  padding-left: 4px;
}

/* Info Cliente */
.compact-info {
  padding-left: 4px;
}

.compact-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: white;
}

.compact-label {
  color: #8e8e93;
}

.compact-value {
  font-weight: 500;
}

/* Mesas */
.compact-tables {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-left: 4px;
}

/* Productos Compactos */
.compact-products {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compact-product {
  display: flex;
  gap: 8px;
  align-items: center;
}

.compact-product-image {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.compact-product-info {
  flex: 1;
  min-width: 0;
}

.compact-product-name {
  color: white;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-product-meta {
  color: #8e8e93;
  font-size: 12px;
}

.compact-product-total {
  color: orange;
  font-weight: 600;
  flex-shrink: 0;
}

/* Total Compacto */
.compact-total {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: 700;
  margin-top: 8px;
}

.compact-total-amount {
  font-size: 20px;
}

/* Diálogo de Mesas */
.table-dialog-card {
  background: linear-gradient(180deg, #1a1d29 0%, #252836 100%);
  height: 100%;
}

.table-dialog-header {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table-dialog-title {
  flex: 1;
}

.table-dialog-content {
  padding: 12px;
  max-height: calc(100vh - 70px);
  overflow-y: auto;
}

/* Tabs de Salones */
.room-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 12px;
  -webkit-overflow-scrolling: touch;
}

.room-tabs::-webkit-scrollbar {
  display: none;
}

.room-tab {
  flex-shrink: 0;
  min-width: 100px;
}

/* Grid de Mesas */
.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.table-card {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  border-radius: 12px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 80px;
  border: 2px solid transparent;
}

.table-card:hover:not(.table-occupied) {
  transform: translateY(-2px);
  border-color: rgba(255, 152, 0, 0.3);
}

.table-card.table-selected {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-color: orange;
}

.table-card.table-occupied {
  background: linear-gradient(135deg, #424242 0%, #303030 100%);
  opacity: 0.6;
  cursor: not-allowed;
}

.table-name {
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
}

.table-status {
  color: #ff5252;
  font-size: 11px;
  font-weight: 500;
}

.table-check {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Detalle del Producto */
.product-detail-card {
  background: linear-gradient(180deg, #1a1d29 0%, #252836 100%);
  height: 100%;
}

.product-detail-header {
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.product-detail-image-container {
  width: 100%;
  height: 50vh;
  max-height: 500px;
  position: relative;
}

/* Gradiente oscuro superior sobre la imagen */
.image-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
  z-index: 5;
  pointer-events: none;
}

.product-carousel,
.product-detail-image {
  width: 100%;
  height: 100%;
}

.product-detail-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
}

.product-detail-info {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  border-radius: 24px 24px 0 0;
  margin-top: -24px;
  position: relative;
  z-index: 5;
}

.product-rating-large {
  display: flex;
  gap: 4px;
}

.product-detail-price {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
}

.observation-input {
  background: rgba(255, 255, 255, 0.05);
}

.quantity-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 12px;
}

.quantity-display {
  min-width: 60px;
  text-align: center;
}

.order-btn {
  font-size: 16px;
  font-weight: 600;
  text-transform: none;
  padding: 14px 0;
}

/* Vista de Categoría */
.category-detail-card {
  background: linear-gradient(180deg, #1a1d29 0%, #252836 100%);
  height: 100%;
}

.category-detail-header {
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.category-banner-container {
  width: 100%;
  height: 45vh;
  max-height: 400px;
  position: relative;
  overflow: visible;
}

.category-gradient-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
  z-index: 3;
  pointer-events: none;
}

.category-gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(
    to top,
    #252836 0%,
    #252836 3%,
    rgba(37, 40, 54, 0.98) 8%,
    rgba(37, 40, 54, 0.95) 15%,
    rgba(37, 40, 54, 0.85) 25%,
    rgba(37, 40, 54, 0.7) 40%,
    rgba(37, 40, 54, 0.5) 55%,
    rgba(37, 40, 54, 0.3) 70%,
    rgba(37, 40, 54, 0.15) 85%,
    transparent 100%
  );
  z-index: 4;
  pointer-events: none;
}

.category-carousel,
.category-banner-single {
  width: 100%;
  height: 100%;
  position: relative;
}

.category-banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.category-back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.4);
}

.category-user-avatar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
}

.category-banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 0 24px 40px 24px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0,0,0,0.3) 50%,
    rgba(0,0,0,0.7) 80%,
     rgba(0,0,0,0.85) 100%);
  z-index: 1;
}

.category-banner-text {
  text-align: center;
  max-width: 90%;
  z-index: 1;
}

.category-products {
  background: linear-gradient(
    to top,
    transparent 0%,
    rgba(37, 40, 54, 0.3) 90px,
    rgba(37, 40, 54, 0.7) 150px,
    #252836 250px,
    #252836 100%
  );
  border-radius: 0;
  position: relative;
  z-index: 2;
  min-height: 60vh;
}

/* Botón flotante del carrito */
.cart-fab {
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4);
}

/* Vistas de Carrito, Órdenes y Favoritos */
.cart-container,
.orders-container,
.favorites-container {
  max-width: 500px;
  margin: 0 auto;
}

/* Carrito Mejorado */
.cart-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 166px);
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.cart-item {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.cart-item-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.cart-item-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  color: white;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-observation {
  color: #8e8e93;
  font-size: 12px;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-price {
  color: #ff9800;
  font-size: 16px;
  font-weight: 700;
}

.cart-item-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 20px;
}

.quantity-value {
  color: white;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.cart-footer {
  background: linear-gradient(135deg, #2d3142 0%, #1f2233 100%);
  padding: 20px 16px;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.total-label {
  color: white;
  font-size: 18px;
  font-weight: 500;
}

.total-amount {
  color: #ff9800;
  font-size: 18px;
  font-weight: 700;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
}

.process-order-btn {
  width: 100%;
  border-radius: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.rounded-borders {
  border-radius: 8px;
}

/* Badge "En Carrito" */
.in-cart-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
  z-index: 2;
  animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
  }
  50% {
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.6);
  }
}

/* Botón de Favorito */
.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2;
}

/* Rating Interactivo */
.product-rating {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.product-rating:active {
  opacity: 0.8;
}

/* Dialog de Rating */
.rating-dialog {
  background: linear-gradient(180deg, #1a1d29 0%, #252836 100%);
}

.rating-stars-large {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.rating-stars-large .q-icon:active {
  opacity: 0.7;
}

/* Orders Section Styles */
.orders-container {
  max-width: 500px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.orders-header {
  text-align: center;
}

.day-summary {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 12px;
  flex: 1;
  min-width: 140px;
  max-width: none;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 152, 0, 0.1);
}

.summary-info {
  text-align: left;
}

.summary-number {
  font-size: 18px;
  font-weight: 700;
  color: white;
  word-break: break-all;
  line-height: 1.2;
}

.summary-label {
  font-size: 12px;
  color: #8e8e93;
  margin-top: 2px;
}

.order-card {
  border-radius: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.order-info {
  flex: 1;
}

.order-status {
  text-align: right;
}

.order-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-orders {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 40px 20px;
  margin: 20px 0;
}

/* Responsive adjustments for large amounts */
@media (max-width: 480px) {
  .summary-card {
    min-width: 120px;
    padding: 12px;
  }

  .summary-number {
    font-size: 16px;
  }

  .summary-icon {
    width: 35px;
    height: 35px;
  }
}

/* Special handling for very large numbers */
.summary-number.large-amount {
  font-size: 16px;
}

@media (min-width: 481px) {
  .summary-number.large-amount {
    font-size: 17px;
  }
}
</style>
