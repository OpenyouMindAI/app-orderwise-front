<template>
  <q-page class="trello-board">
    <!-- Header Compacto -->
    <div class="board-header">
      <div class="flex items-center q-gutter-sm">
        <div>
          <q-icon name="dashboard" size="24px" color="primary" />
          <span class="text-h6 text-weight-medium">Tablero de Órdenes</span>
        </div>
        <div>
          <q-badge v-for="branchOffice in branchOfficeSelect" :key="branchOffice?.id" color="primary" class="q-ml-xs">
            {{ branchOffice.name }}
          </q-badge>
        </div>
      </div>
      <q-btn icon="tune" label="Filtros" color="primary" flat @click="dialogFilter = true" />
    </div>

    <!-- Bulk Actions Notification Floating Bottom -->
    <transition name="slide-up">
      <q-page-sticky position="bottom" :offset="[0, 18]" v-if="selectedInvoices.length > 0" style="z-index: 10001;">
        <div id="bulk-notification-container" class="bg-dark text-white q-pa-sm rounded-borders shadow-10 flex items-center justify-between q-gutter-x-md" style="border-radius: 24px; min-width: 300px; max-width: 90vw;">
          <div class="flex items-center q-pl-sm">
            <q-btn round flat dense icon="close" size="sm" color="grey-5" @click="clearSelection" class="q-mr-sm" />
            <span class="text-subtitle2">{{ selectedInvoices.length }} seleccionada(s)</span>
          </div>

          <div class="flex items-center q-gutter-x-sm">
            <!-- Assign Delivery -->
            <DropdownMenu
              ref="deliveryDropdownRef"
              flat
              dense
              round
              color="white"
              icon="delivery_dining"
              target="#bulk-notification-container"
              anchor="top middle"
              :offset="[0, 10]"
            >
              <q-list>
                <q-item-label header>Asignar Repartidor</q-item-label>
                <q-item
                  v-for="dp in deliveryPersons"
                  :key="dp.id"
                  clickable
                  @click="applyBulkDeliveryPerson(dp); deliveryDropdownRef?.close()"
                >
                  <q-item-section avatar>
                    <q-icon name="two_wheeler" />
                  </q-item-section>
                  <q-item-section>{{ dp.name }}</q-item-section>
                </q-item>
              </q-list>
            </DropdownMenu>

            <!-- Change Status -->
            <DropdownMenu
              ref="statusDropdownRef"
              flat
              dense
              round
              color="white"
              icon="swap_horiz"
              target="#bulk-notification-container"
              anchor="top middle"
              :offset="[0, 10]"
            >
              <q-list>
                <q-item-label header>Cambiar Estado</q-item-label>
                <q-item
                  v-for="st in statuses"
                  :key="st.value"
                  clickable
                  @click="applyBulkStatus(st); statusDropdownRef?.close()"
                >
                  <q-item-section avatar>
                    <q-icon :name="st.icon" :color="st.color" />
                  </q-item-section>
                  <q-item-section>{{ st.label }}</q-item-section>
                </q-item>
              </q-list>
            </DropdownMenu>
          </div>
        </div>
      </q-page-sticky>
    </transition>

    <!-- Swiper Tabs for Mobile/Tablet -->
    <div class="lt-md sticky-tabs q-px-md">
      <swiper
        :slides-per-view="3"
        :space-between="10"
        :centered-slides="true"
        :breakpoints="{
          600: {
            slidesPerView: 5,
            loop: false,
            centeredSlides: false
          }
        }"
        :loop="true"
        class="bg-white text-black"
        @swiper="onSwiper"
        style="padding: 10px 5px;"
      >
        <swiper-slide
          v-for="status in filteredStatuses"
          :key="status.value"
          @click="tab = status.value"
          class="cursor-pointer"
        >
          <div
            class="column items-center q-gutter-xs q-pa-xs rounded-borders transition-all"
            :class="tab === status.value ? 'bg-primary text-white' : 'text-grey-8'"
            style="transition: all 0.3s ease;"
          >
            <q-icon :name="status.icon" :color="tab === status.value ? 'white' : status.color" size="20px" />
            <span class="text-weight-medium" style="font-size: 11px; white-space: nowrap;">{{ status.label }}</span>
            <q-badge color="red" floating v-if="status.total > 0" :style="tab === status.value ? 'border: 1px solid white' : ''">{{ status.total }}</q-badge>
          </div>
        </swiper-slide>
      </swiper>
    </div>

    <!-- Tablero Trello -->
    <div v-if="!$q.screen.lt.md" class="trello-columns">
      <div v-for="(status, index) in displayStatuses" :key="status.value" class="trello-column">
        <!-- Column Header -->
        <div class="column-header">
          <div class="flex items-center justify-between">
            <div class="flex items-center q-gutter-xs">
              <!-- Select All Checkbox -->
              <q-checkbox
                :model-value="isColumnSelected(status)"
                @update:model-value="toggleColumnSelection(status)"
                dense
                size="xs"
                color="primary"
              >
                <q-tooltip>Seleccionar toda la columna</q-tooltip>
              </q-checkbox>
              <q-icon :name="status.icon" size="18px" :color="status.color" />
              <span class="text-subtitle2 text-weight-bold">{{ status.label }}</span>
            </div>
            <div class="flex items-center q-gutter-xs">
              <!-- View All Drivers Button (only for in_delivery) -->
              <q-btn
                v-if="status.value === 'in_delivery'"
                icon="map"
                size="sm"
                flat
                dense
                round
                color="teal"
                @click="openAllDriversMap"
              >
                <q-tooltip>Ver todos los conductores</q-tooltip>
              </q-btn>
              <q-badge :color="status.color" rounded>{{ status.total }}</q-badge>
            </div>
          </div>
        </div>

        <!-- Cards Container with Drag & Drop -->
        <draggable
          v-model="status.data"
          :group="{ name: 'orders', pull: status.value !== 'in_delivery' && status.value !== 'delivered', put: status.value !== 'in_delivery' && status.value !== 'delivered' }"
          item-key="id"
          class="cards-container"
          @change="onDragChange($event, status, index)"
          :animation="200"
          ghost-class="ghost-card"
          :disabled="!isDraggable || status.value === 'in_delivery' || status.value === 'delivered'"
        >
          <template #item="{ element: invoice }">
            <q-card
              class="order-card"
              :class="{ 'selected-card': isInvoiceSelected(invoice.id) }"
              @click="showInvoices(invoice)"
            >

              <!-- Card Header -->
              <div class="card-header">
                <div class="flex items-center justify-between q-mb-xs">
                  <div class="flex items-center q-gutter-xs">
                    <!-- Selection Checkbox -->
                    <q-checkbox
                      :model-value="isInvoiceSelected(invoice.id)"
                      @update:model-value="toggleInvoiceSelection(invoice)"
                      @click.stop
                      dense
                      size="xs"
                      color="primary"
                    />
                    <span class="text-weight-bold text-body2">{{ invoice.code }}</span>
                  </div>
                  <q-badge :color="getInvoiceTypeColor(invoice.invoice_type?.name)" text-color="white" class="text-caption">
                    {{ invoice.invoice_type?.name }}
                  </q-badge>
                </div>
                <div class="text-caption text-grey-7">{{ invoice.branch_office?.name }}</div>
              </div>
              <!-- Products List with Checkboxes -->
              <div class="card-products">
                <div
                  v-for="product in invoice.products.slice(0, 3)"
                  :key="product.id"
                  class="product-item"
                  @click.stop
                >
                  <q-checkbox
                    v-model="product.pivot.is_ready"
                    dense
                    size="xs"
                    color="green"
                    :disable="status.value === 'in_delivery' || status.value === 'delivered'"
                    @update:model-value="toggleProductReady(invoice, product)"
                  />
                  <div class="product-info">
                    <span class="text-body2">{{ product.name }}</span>
                    <span class="text-caption text-grey-6">x{{ Number(product?.pivot?.amount).toFixed(0) }}</span>
                  </div>
                </div>
                <div v-if="invoice.products.length > 3" class="text-caption text-grey-6 q-mt-xs q-ml-md">
                  +{{ invoice.products.length - 3 }} más...
                </div>

                <!-- Progress Bar -->
                <div class="q-mt-xs">
                  <q-linear-progress
                    :value="getProductsProgress(invoice)"
                    color="green"
                    size="4px"
                    class="rounded-borders"
                  />
                  <div class="text-caption text-grey-6 q-mt-xs">
                    {{ getReadyProductsCount(invoice) }}/{{ invoice.products.length }} listos
                  </div>
                </div>
              </div>
              <!-- Card Footer -->
              <div class="card-footer">
                <!-- Cliente -->
                <div v-if="invoice.client" class="flex items-center q-gutter-xs q-mb-xs">
                  <q-icon name="person" size="14px" color="grey-6" />
                  <span class="text-caption text-grey-7">{{ invoice.client?.name }}</span>
                </div>

                <!-- Descripción -->
                <div v-if="invoice.description" class="flex items-start q-gutter-xs q-mb-xs">
                  <q-icon name="description" size="14px" color="grey-6" class="q-mt-xs" />
                  <span class="text-caption text-grey-7">{{ invoice.description }}</span>
                </div>

                <!-- Delivery Person Assignment -->
                <div class="delivery-assignment" @click.stop>
                  <q-select
                    v-model="invoice.delivery_person"
                    :options="deliveryPersons"
                    option-label="name"
                    option-value="id"
                    dense
                    borderless
                    placeholder="Asignar repartidor"
                    class="delivery-select"
                    :disable="status.value === 'in_delivery' || status.value === 'delivered'"
                    @update:model-value="assignDeliveryPerson(invoice, $event)"
                  >
                    <template v-slot:prepend>
                      <q-icon name="delivery_dining" size="16px" color="primary" />
                    </template>
                    <template v-slot:selected>
                      <span class="text-caption" v-if="invoice.delivery_person">
                        {{ invoice.delivery_person.name }}
                      </span>
                      <span class="text-caption text-grey-6" v-else>
                        Sin asignar
                      </span>
                    </template>
                  </q-select>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-between q-mt-xs">
                  <div class="flex items-center q-gutter-xs">
                    <q-icon name="schedule" size="14px" color="grey-6" />
                    <span class="text-caption text-grey-6">{{ formatDate(invoice.created_at, 'HH:mm') }}</span>
                  </div>
                  <div class="flex items-center q-gutter-xs">
                    <!-- Track Delivery Button (only for in_delivery status) -->
                    <q-btn
                      v-if="status.value === 'in_delivery' && invoice.delivery_run_id"
                      icon="map"
                      size="xs"
                      flat
                      dense
                      color="teal"
                      @click.stop="openTrackingMap(invoice)"
                    >
                      <q-tooltip>Ver ubicación en tiempo real</q-tooltip>
                    </q-btn>
                    <q-btn
                      icon="print"
                      size="xs"
                      flat
                      dense
                      color="grey-7"
                      @click.stop="print(invoice)"
                    />
                  </div>
                </div>

                <!-- Payment Button (if pending balance) -->
                <div v-if="invoice.pending > 0" class="q-mt-sm">
                  <q-btn
                    color="green"
                    size="sm"
                    dense
                    no-caps
                    class="full-width"
                    @click.stop="openPaymentDialogFromCard(invoice)"
                  >
                    <q-icon name="payments" size="16px" class="q-mr-xs" />
                    <span class="text-caption">Cobrar {{ formatNumber(invoice.pending) }}</span>
                  </q-btn>
                </div>
              </div>
            </q-card>
          </template>
        </draggable>

        <!-- Column Footer -->
        <div class="column-footer" v-if="status.total > status.data.length">
          <q-btn
            flat
            dense
            color="primary"
            label="Cargar más"
            size="sm"
            @click="loadMore(status)"
            :loading="status.loading"
          />
        </div>

        <q-inner-loading :showing="status.loading" color="primary" />
      </div>
    </div>

    <!-- Mobile Swipeable View -->
    <q-tab-panels
      v-else
      v-model="tab"
      animated
      swipeable
      infinite
      transition-prev="slide-right"
      transition-next="slide-left"
      class="bg-transparent"
    >
      <q-tab-panel
        v-for="(status, index) in displayStatuses"
        :key="status.value"
        :name="status.value"
        class="q-pa-none"
      >
        <div class="trello-column full-width q-mx-auto" :style="$q.screen.sm ? 'max-width: 900px;' : 'max-width: 500px;'">
          <!-- Column Header -->
          <div class="column-header">
            <div class="flex items-center justify-between">
              <div class="flex items-center q-gutter-xs">
                <!-- Select All Checkbox -->
                <q-checkbox
                  :model-value="isColumnSelected(status)"
                  @update:model-value="toggleColumnSelection(status)"
                  dense
                  size="xs"
                  color="primary"
                >
                  <q-tooltip>Seleccionar toda la columna</q-tooltip>
                </q-checkbox>
                <q-icon :name="status.icon" size="18px" :color="status.color" />
                <span class="text-subtitle2 text-weight-bold">{{ status.label }}</span>
              </div>
              <div class="flex items-center q-gutter-xs">
                <!-- View All Drivers Button (only for in_delivery) -->
                <q-btn
                  v-if="status.value === 'in_delivery'"
                  icon="map"
                  size="sm"
                  flat
                  dense
                  round
                  color="teal"
                  @click="openAllDriversMap"
                >
                  <q-tooltip>Ver todos los conductores</q-tooltip>
                </q-btn>
                <q-badge :color="status.color" rounded>{{ status.total }}</q-badge>
              </div>
            </div>
          </div>

          <!-- Cards Container with Drag & Drop -->
          <draggable
            v-model="status.data"
            :group="{ name: 'orders', pull: status.value !== 'in_delivery' && status.value !== 'delivered', put: status.value !== 'in_delivery' && status.value !== 'delivered' }"
            item-key="id"
            class="cards-container"
            @change="onDragChange($event, status, index)"
            :animation="200"
            ghost-class="ghost-card"
            :disabled="!isDraggable || status.value === 'in_delivery' || status.value === 'delivered'"
          >
            <template #item="{ element: invoice }">
              <q-card
                class="order-card"
                :class="{ 'selected-card': isInvoiceSelected(invoice.id) }"
                @click="showInvoices(invoice)"
              >

                <!-- Card Header -->
                <div class="card-header">
                  <div class="flex items-center justify-between q-mb-xs">
                    <div class="flex items-center q-gutter-xs">
                      <!-- Selection Checkbox -->
                      <q-checkbox
                        :model-value="isInvoiceSelected(invoice.id)"
                        @update:model-value="toggleInvoiceSelection(invoice)"
                        @click.stop
                        dense
                        size="xs"
                        color="primary"
                      />
                      <span class="text-weight-bold text-body2">{{ invoice.code }}</span>
                    </div>
                    <q-badge :color="getInvoiceTypeColor(invoice.invoice_type?.name)" text-color="white" class="text-caption">
                      {{ invoice.invoice_type?.name }}
                    </q-badge>
                  </div>
                  <div class="text-caption text-grey-7">{{ invoice.branch_office?.name }}</div>
                </div>
                <!-- Products List with Checkboxes -->
                <div class="card-products">
                  <div
                    v-for="product in invoice.products.slice(0, 3)"
                    :key="product.id"
                    class="product-item"
                    @click.stop
                  >
                    <q-checkbox
                      v-model="product.pivot.is_ready"
                      dense
                      size="xs"
                      color="green"
                      :disable="status.value === 'in_delivery' || status.value === 'delivered'"
                      @update:model-value="toggleProductReady(invoice, product)"
                    />
                    <div class="product-info">
                      <span class="text-body2">{{ product.name }}</span>
                      <span class="text-caption text-grey-6">x{{ Number(product?.pivot?.amount).toFixed(0) }}</span>
                    </div>
                  </div>
                  <div v-if="invoice.products.length > 3" class="text-caption text-grey-6 q-mt-xs q-ml-md">
                    +{{ invoice.products.length - 3 }} más...
                  </div>

                  <!-- Progress Bar -->
                  <div class="q-mt-xs">
                    <q-linear-progress
                      :value="getProductsProgress(invoice)"
                      color="green"
                      size="4px"
                      class="rounded-borders"
                    />
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ getReadyProductsCount(invoice) }}/{{ invoice.products.length }} listos
                    </div>
                  </div>
                </div>
                <!-- Card Footer -->
                <div class="card-footer">
                  <!-- Cliente -->
                  <div v-if="invoice.client" class="flex items-center q-gutter-xs q-mb-xs">
                    <q-icon name="person" size="14px" color="grey-6" />
                    <span class="text-caption text-grey-7">{{ invoice.client?.name }}</span>
                  </div>

                  <!-- Descripción -->
                  <div v-if="invoice.description" class="flex items-start q-gutter-xs q-mb-xs">
                    <q-icon name="description" size="14px" color="grey-6" class="q-mt-xs" />
                    <span class="text-caption text-grey-7">{{ invoice.description }}</span>
                  </div>

                  <!-- Delivery Person Assignment -->
                  <div class="delivery-assignment" @click.stop>
                    <q-select
                      v-model="invoice.delivery_person"
                      :options="deliveryPersons"
                      option-label="name"
                      option-value="id"
                      dense
                      borderless
                      placeholder="Asignar repartidor"
                      class="delivery-select"
                      :disable="status.value === 'in_delivery' || status.value === 'delivered'"
                      @update:model-value="assignDeliveryPerson(invoice, $event)"
                    >
                      <template v-slot:prepend>
                        <q-icon name="delivery_dining" size="16px" color="primary" />
                      </template>
                      <template v-slot:selected>
                        <span class="text-caption" v-if="invoice.delivery_person">
                          {{ invoice.delivery_person.name }}
                        </span>
                        <span class="text-caption text-grey-6" v-else>
                          Sin asignar
                        </span>
                      </template>
                    </q-select>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center justify-between q-mt-xs">
                    <div class="flex items-center q-gutter-xs">
                      <q-icon name="schedule" size="14px" color="grey-6" />
                      <span class="text-caption text-grey-6">{{ formatDate(invoice.created_at, 'HH:mm') }}</span>
                    </div>
                    <div class="flex items-center q-gutter-xs">
                      <!-- Track Delivery Button (only for in_delivery status) -->
                      <q-btn
                        v-if="status.value === 'in_delivery' && invoice.delivery_run_id"
                        icon="map"
                        size="xs"
                        flat
                        dense
                        color="teal"
                        @click.stop="openTrackingMap(invoice)"
                      >
                        <q-tooltip>Ver ubicación en tiempo real</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="print"
                        size="xs"
                        flat
                        dense
                        color="grey-7"
                        @click.stop="print(invoice)"
                      />
                    </div>
                  </div>

                  <!-- Payment Button (if pending balance) -->
                  <div v-if="invoice.pending > 0" class="q-mt-sm">
                    <q-btn
                      color="green"
                      size="sm"
                      dense
                      no-caps
                      class="full-width"
                      @click.stop="openPaymentDialogFromCard(invoice)"
                    >
                      <q-icon name="payments" size="16px" class="q-mr-xs" />
                      <span class="text-caption">Cobrar {{ formatNumber(invoice.pending) }}</span>
                    </q-btn>
                  </div>
                </div>
              </q-card>
            </template>
          </draggable>

          <!-- Column Footer -->
          <div class="column-footer" v-if="status.total > status.data.length">
            <q-btn
              flat
              dense
              color="primary"
              label="Cargar más"
              size="sm"
              @click="loadMore(status)"
              :loading="status.loading"
            />
          </div>

          <q-inner-loading :showing="status.loading" color="primary" />
        </div>
      </q-tab-panel>
    </q-tab-panels>
    <q-dialog v-model="openEditInvoice" persistent :maximized="$q.screen.lt.sm">
      <q-card class="column" :style="$q.screen.lt.sm ? '' : 'width: 900px; max-width: 80vw;'">
        <q-card-section class="flex justify-between items-center bg-primary text-white">
          <span class="text-h6">Detalles de la orden</span>
          <q-btn icon="close" flat round dense @click="openEditInvoice = false" />
        </q-card-section>
        <q-card-section
          class="scroll col"
          style="max-height: calc(100vh - 230px); overflow: auto;">
          <div class="row q-col-gutter-md">
            <div class="row q-col-gutter-sm col-sm-12 col-md-7 col-lg-7">
              <div class="col-6">
                <q-input v-model="invoice.code" label="Código" filled readonly dense />
              </div>
              <div class="col-6">
                <q-input
                  filled
                  readonly
                  dense
                  :model-value="formatDate(invoice.created_at, 'DD-MM-YYYY H:mm:ss')"
                  label="Fecha y hora"
                />
              </div>
              <div class="col-6">
                <q-input
                  label="Cliente"
                  filled
                  :model-value="invoice?.client?.name"
                  readonly
                  dense
                />
              </div>
              <div class="col-6">
                <q-input
                  label="Vendedor"
                  filled
                  :model-value="invoice?.seller?.name"
                  readonly
                  dense
                />
              </div>
              <div class="col-12" v-if="invoice?.tables?.length">
                <q-input
                  label="Mesas"
                  filled
                  :model-value="invoice?.tables?.map(table => table.name).join(', ')"
                  readonly
                  dense
                />
              </div>
              <div class="col-12">
                <q-input
                  :model-value="invoice?.address?.formattedAddress || invoice.client?.address?.formattedAddress"
                  type="textarea"
                  autogrow
                  label="Dirección"
                  filled
                  readonly
                  dense
                />
              </div>
              <div class="col-12">
                <span class="text-h6">Datos de la comanda</span>
              </div>
              <div class="col-6">
                <q-input
                  v-model="invoice.delivery_date"
                  type="datetime-local"
                  label="Fecha de entrega"
                  filled
                  dense
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="invoice.invoice_type"
                  use-input
                  filled
                  dense
                  label="Tipo de comprobante"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  :options="invoiceTypes"
                  :readonly="role.deliveryPerson"
                  :rules="[(val) => !!val || 'El campo es requerido.']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="invoice.type_of_service"
                  use-input
                  filled
                  dense
                  label="Tipo de servicio"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  :options="[]"
                  readonly
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="invoice.description"
                  type="textarea"
                  filled
                  label="Descripción"
                  autogrow
                  :readonly="role.deliveryPerson"
                />
              </div>
              <!-- <div class="col-12 q-mt-md">
                <div class="flex justify-between items-center">
                  <file-button-component color="primary" @upload="changeFiles" />
                </div>
                <file-component :files="files" @delete:files="deleteFile" />
              </div> -->
            </div>
            <div
              :class="`col-sm-12 col-md-5 col-lg-5 q-gutter-y-sm ${$q.screen.lt.sm ? 'full-width' : ''}`"
            >
              <!-- Sección de Archivos Adjuntos (Solo visualización) -->
              <div v-if="invoice && invoice.invoice_files && invoice.invoice_files.length > 0">
                <q-card flat bordered>
                  <q-card-section class="q-pb-none">
                    <div class="row items-center q-mb-sm">
                      <div class="col">
                        <div class="text-subtitle2 text-weight-medium">
                          <q-icon name="attach_file" size="20px" class="q-mr-xs" />
                          Archivos Adjuntos
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-chip dense color="primary" text-color="white" size="sm">
                          {{ invoice.invoice_files.length }}
                        </q-chip>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-section class="q-pt-sm">
                    <div class="invoice-files-grid">
                      <div
                        v-for="(file, index) in invoice.invoice_files"
                        :key="index"
                        class="invoice-file-item"
                        @click="openGallery(index)"
                      >
                        <div class="invoice-file-wrapper">
                          <!-- Imagen -->
                          <q-img
                            v-if="!file.name || !file.name.toLowerCase().endsWith('.pdf')"
                            :src="file.url"
                            :ratio="1"
                            fit="cover"
                            class="invoice-file-image"
                            loading="lazy"
                          >
                            <template v-slot:error>
                              <div class="absolute-full flex flex-center bg-grey-3">
                                <q-icon name="broken_image" size="32px" color="grey-5" />
                              </div>
                            </template>
                          </q-img>

                          <!-- PDF -->
                          <div v-else class="invoice-pdf-preview">
                            <q-icon name="picture_as_pdf" size="40px" color="red-6" />
                            <div class="invoice-pdf-name">
                              {{ file.name }}
                            </div>
                          </div>

                          <!-- Overlay hover -->
                          <div class="invoice-file-overlay">
                            <q-icon name="visibility" size="24px" color="white" />
                          </div>

                          <!-- Badge de número -->
                          <div class="invoice-file-badge">
                            {{ index + 1 }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <q-expansion-item
                v-if="role.deliveryPerson || visibleBranchOffice"
                icon="payments"
                label="Pagos"
                style="border-radius: 10px"
                class="shadow-1 overflow-hidden"
              >
                <q-card>
                  <q-card-section class="q-py-sm q-pt-none scroll" style="max-height: 150px">
                    <div
                      v-for="payment in invoice.invoice_payments"
                      :key="payment.id"
                      class="col-12 column q-gutter-y-sm"
                      v-show="invoice.invoice_payments.length > 0"
                    >
                      <div class="full-width row items-center justify-between">
                        <span class="text-subtitle2 text-uppercase">
                          {{ payment.payment_method.name }}
                        </span>
                        <span class="text-bold">
                          {{ formatNumber(payment.amount) }}
                        </span>
                      </div>
                      <img
                        v-for="file in payment.files"
                        :key="file.id"
                        :src="file.url"
                        alt="pagos"
                        style="max-height: 150px; max-width: 300px"
                      />
                    </div>
                    <div v-show="invoice.invoice_payments.length === 0" class="col-12 column q-gutter-y-sm">
                      <div class="full-width row items-center justify-between">
                        <span class="text-subtitle2 text-uppercase">
                          No hay pagos
                        </span>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              <q-expansion-item
                icon="list"
                label="Artículos"
                style="border-radius: 10px"
                class="shadow-1 overflow-hidden"
                default-opened
              >
                <q-card>
                  <q-card-section class="q-py-sm q-pt-none scroll" style="max-height: 250px">
                    <div v-for="product in invoice.products" :key="product.id" class="col-12 column">
                      <div class="full-width flex items-center justify-between">
                        <div class="flex q-gutter-sm items-center">
                          <file-component
                            v-if="product?.images?.length > 0"
                            :files="[product.images[0]]"
                            image-style="height: 50px; width: 50px; border-radius: 10px;"
                            only-view
                          />
                          <span class="text-body1">
                            {{ product.name.slice(0, 25) }}
                            <q-tooltip class="text-subtitle1">
                              {{ product.name }}
                            </q-tooltip>
                          </span>
                        </div>
                        <span class="text-bold">
                          {{ formatNumber(product.pivot.amount) }}
                        </span>
                      </div>
                      <span
                        v-if="product?.pivot?.observation"
                        class="q-mt-md text-body2 text-grey-7"
                      >
                        Observación: {{ product?.pivot?.observation }}
                      </span>
                      <q-separator class="q-mt-sm" />
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Promociones -->
              <q-expansion-item
                v-if="invoice.promotions && invoice.promotions.length > 0"
                icon="local_offer"
                label="Promociones"
                style="border-radius: 10px"
                class="shadow-1 overflow-hidden"
                default-opened
              >
                <q-card>
                  <q-card-section class="q-py-sm q-pt-none scroll" style="max-height: 250px">
                    <div v-for="promotion in invoice.promotions" :key="promotion.id" class="col-12 column q-mb-md">
                      <div class="full-width flex items-center justify-between">
                        <div class="flex q-gutter-sm items-center">
                          <file-component
                            v-if="promotion?.images?.length > 0"
                            :files="[promotion.images[0]]"
                            image-style="height: 50px; width: 50px; border-radius: 10px;"
                            only-view
                          />
                          <span class="text-body1 text-weight-medium">
                            {{ promotion.name }}
                            <q-tooltip class="text-subtitle1">
                              {{ promotion.name }}
                            </q-tooltip>
                          </span>
                        </div>
                        <div class="flex items-center q-gutter-xs">
                          <span class="text-bold">
                            {{ formatNumber(promotion.pivot.quantity) }}
                          </span>
                          <q-btn
                            v-if="promotion.pivot && promotion.pivot.promotion_details && promotion.pivot.promotion_details.length > 0"
                            :icon="promotionExpanded[promotion.id] ? 'expand_less' : 'expand_more'"
                            size="xs"
                            color="orange"
                            @click="togglePromotionDetails(promotion.id)"
                            round
                            dense
                          />
                        </div>
                      </div>

                      <!-- Detalles de la promoción -->
                      <div v-if="promotionExpanded[promotion.id] && promotion.pivot && promotion.pivot.promotion_details" class="q-mt-sm">
                        <div class="text-body2 text-weight-medium q-mb-sm">Detalles de la promoción</div>
                        <div v-for="group in promotion.pivot.promotion_details" :key="group.id" class="q-mb-sm">
                          <div class="text-body2 text-weight-medium q-mb-xs">
                            {{ group.name }} ({{ group.quantity }} requeridos)
                          </div>
                          <div class="q-ml-md">
                            <div v-if="group.products && group.products.length > 0">
                              <div
                                v-for="product in group.products.filter(p => p.pivot && p.pivot.quantity > 0)"
                                :key="product.id"
                                class="row justify-between items-center q-py-xs q-px-sm q-mb-xs"
                                style="border-left: 2px solid #e0e0e0;"
                              >
                                <span class="text-body2">• {{ product.name }}</span>
                                <span class="text-weight-medium">
                                  {{ product.pivot.quantity }} {{ product.pivot.quantity === 1 ? 'unidad' : 'unidades' }}
                                </span>
                              </div>
                            </div>
                            <div v-else class="text-caption text-grey-6 q-py-xs">
                              No hay productos seleccionados para este grupo
                            </div>
                          </div>
                        </div>
                      </div>

                      <q-separator class="q-mt-sm" />
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Timeline de Estados -->
              <q-expansion-item
                icon="trending_up"
                label="Historial de Estados"
                style="border-radius: 10px"
                class="shadow-1 overflow-hidden"
                default-opened
              >
                <q-card>
                  <q-card-section class="q-py-sm q-pt-none">
                    <!-- Tiempo Total -->
                    <div class="q-mb-md q-pa-md bg-grey-2 rounded-borders text-center">
                      <div class="text-overline text-grey-7">Tiempo Total</div>
                      <div class="text-h5 text-weight-bold text-primary q-mt-xs">
                        {{ getTotalTime(invoice) }}
                      </div>
                    </div>

                    <!-- Timeline Minimalista -->
                    <div class="status-timeline">
                      <div
                        v-for="(event, index) in getStatusTimeline(invoice)"
                        :key="index"
                        class="status-step"
                        :class="{ 'is-last': index === getStatusTimeline(invoice).length - 1 }"
                      >
                        <!-- Línea conectora -->
                        <div class="status-line" v-if="index < getStatusTimeline(invoice).length - 1"></div>

                        <!-- Icono del estado -->
                        <div class="status-icon" :style="`background-color: ${getStatusColor(event.color)}`">
                          <q-icon :name="event.icon" size="20px" color="white" />
                        </div>

                        <!-- Contenido del estado -->
                        <div class="status-content">
                          <div class="row items-center justify-between q-mb-xs">
                            <div class="text-subtitle2 text-weight-bold">{{ event.label }}</div>
                            <div v-if="event.duration" class="status-duration">
                              {{ event.duration }}
                            </div>
                          </div>
                          <div class="text-caption text-grey-7">{{ event.date }}</div>
                          <div v-if="event.user" class="text-caption text-grey-6 q-mt-xs">
                            👤 {{ event.user }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </div>
        </q-card-section>
        <q-card-actions class="flex justify-between items-center q-gutter-y-md" align="center">
          <q-badge :color="setStatusValue(invoice.status, 'color')" class="q-ml-xs text-subtitle1">
            {{ setStatusValue(invoice.status, 'label') }}
          </q-badge>
          <div class="q-gutter-sm text-right full-width flex justify-end">
            <q-btn
              v-if="!role.deliveryPerson"
              color="negative"
              label="Anular"
              icon="block"
              :loading="cancelLoading"
              @click="cancelInvoice"
            />
            <q-btn
              v-if="!role.deliveryPerson && invoice?.products?.length > 0 && invoice?.pending > 0"
              color="green"
              label="Cobrar"
              icon="payments"
              @click="openPaymentDialog"
            />
            <q-btn color="secondary" label="Ticket" icon="print" @click="print(invoice)" />
            <q-btn color="primary" icon="check_circle" label="Guardar" :loading="loadingEdit" @click="saveEdit" />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="dialogFilter"
      position="right"
      seamless
      full-height
    >
      <q-card class="column full-height filters-card">
        <!-- Header Minimalista -->
        <q-card-section class="filters-header">
          <div class="flex items-center justify-between">
            <div class="flex items-center q-gutter-sm">
              <q-icon name="filter_list" size="28px" color="primary" />
              <span class="text-h5 text-weight-medium">Filtros</span>
            </div>
            <q-btn icon="close" flat round dense color="grey-7" @click="dialogFilter = false" />
          </div>
        </q-card-section>

        <q-separator />

        <!-- Filters Content -->
        <q-card-section class="col q-pt-md filters-content">
          <q-scroll-area class="full-height">
            <div class="q-gutter-md q-pr-md">
              <!-- Filtro por Fecha de Entrega -->
              <div class="filter-group">
                <div class="filter-label">
                  <q-icon name="event" size="18px" color="grey-7" />
                  <span>Filtrar por Fecha</span>
                </div>
                <div class="q-gutter-sm q-mb-xs">
                  <div class="text-caption text-grey-7">Campo de fecha:</div>
                  <q-option-group
                    v-model="dateField"
                    inline
                    dense
                    class="q-mb-xs text-caption"
                    :options="[
                      { label: 'Entrega (Delivery)', value: 'delivery_date' },
                      { label: 'Registro (Creado)', value: 'created_at' }
                    ]"
                  />
                </div>
                <div class="text-caption text-grey-7">Modo:</div>
                <q-option-group
                  v-model="panel"
                  inline
                  dense
                  class="q-mb-sm"
                  :options="[
                    { label: 'Día', value: 'day' },
                    { label: 'Rango', value: 'between' }
                  ]"
                />
                <q-tab-panels v-model="panel" animated class="q-pa-none bg-transparent">
                  <q-tab-panel name="between" class="q-gutter-y-sm q-pa-none">
                    <q-input filled dense v-model="dateFilters.from" hint="Desde" type="date" @update:model-value="applyFilters" />
                    <q-input filled dense v-model="dateFilters.to" hint="Hasta" type="date" @update:model-value="applyFilters" />
                  </q-tab-panel>
                  <q-tab-panel name="day" class="q-gutter-y-sm q-pa-none">
                    <q-input filled dense v-model="dateFilters.day" hint="Fecha" type="date" @update:model-value="applyFilters" />
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <q-input filled dense v-model="dateFilters.fromHours" hint="Desde" type="time" @update:model-value="applyFilters" />
                      </div>
                      <div class="col-6">
                        <q-input filled dense v-model="dateFilters.toHours" hint="Hasta" type="time" @update:model-value="applyFilters" />
                      </div>
                    </div>
                  </q-tab-panel>
                </q-tab-panels>
              </div>

              <!-- Código -->
              <div class="filter-group">
                <div class="filter-label">
                  <q-icon name="tag" size="18px" color="grey-7" />
                  <span>Código de Orden</span>
                </div>
                <q-input
                  v-model="code"
                  placeholder="Buscar por código..."
                  outlined
                  dense
                  debounce="500"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="search" size="18px" />
                  </template>
                </q-input>
              </div>
              <!-- Afiliado/Socio -->
              <div class="filter-group">
                <div class="filter-label">
                  <q-icon name="handshake" size="18px" color="grey-7" />
                  <span>Afiliado (Partner)</span>
                </div>
                <q-select
                  v-model="partner"
                  :options="partners"
                  use-input
                  outlined
                  dense
                  clearable
                  input-debounce="300"
                  placeholder="Seleccionar afiliado..."
                  option-value="id"
                  :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
                  @filter="filterPartners"
                >
                  <template v-slot:prepend>
                    <q-icon name="handshake" size="18px" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No se encontraron afiliados
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <!-- Cliente -->
              <div class="filter-group">
                <div class="filter-label">
                  <q-icon name="person" size="18px" color="grey-7" />
                  <span>Cliente</span>
                </div>
                <q-select
                  v-model="client"
                  :options="clients"
                  use-input
                  outlined
                  dense
                  clearable
                  input-debounce="300"
                  placeholder="Seleccionar cliente..."
                  option-value="id"
                  :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
                  @filter="filterClients"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_search" size="18px" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No se encontraron clientes
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Vendedor -->
              <div class="filter-group" v-if="!role.deliveryPerson">
                <div class="filter-label">
                  <q-icon name="badge" size="18px" color="grey-7" />
                  <span>Vendedor</span>
                </div>
                <q-select
                  v-model="seller"
                  :options="sellers"
                  use-input
                  outlined
                  dense
                  clearable
                  input-debounce="0"
                  placeholder="Seleccionar vendedor..."
                  option-value="id"
                  :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
                  @filter="filterSellers"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_pin" size="18px" />
                  </template>
                </q-select>
              </div>

              <!-- Repartidor -->
              <div class="filter-group">
                <div class="filter-label">
                  <q-icon name="delivery_dining" size="18px" color="grey-7" />
                  <span>Repartidor</span>
                </div>
                <q-select
                  v-model="deliveryPerson"
                  :options="deliveryPersons"
                  use-input
                  outlined
                  dense
                  clearable
                  input-debounce="0"
                  placeholder="Seleccionar repartidor..."
                  option-value="id"
                  :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
                  :readonly="!validate"
                  @filter="filterDeliveryPersons"
                >
                  <template v-slot:prepend>
                    <q-icon name="two_wheeler" size="18px" />
                  </template>
                </q-select>
              </div>

              <!-- Categoría -->
              <div class="filter-group">
                <div class="filter-label">
                  <q-icon name="category" size="18px" color="grey-7" />
                  <span>Categoría</span>
                  <q-badge v-if="category.length" color="primary" rounded>{{ category.length }}</q-badge>
                </div>
                <q-select
                  v-model="category"
                  :options="categories"
                  outlined
                  dense
                  multiple
                  placeholder="Seleccionar categorías..."
                  option-value="id"
                  option-label="name"
                  use-chips
                >
                  <template v-slot:prepend>
                    <q-icon name="label" size="18px" />
                  </template>
                </q-select>
              </div>

              <!-- Tipo de Servicio -->
              <div class="filter-group">
                <div class="filter-label">
                  <q-icon name="room_service" size="18px" color="grey-7" />
                  <span>Tipo de Servicio</span>
                  <q-badge v-if="typeOfService.length" color="primary" rounded>{{ typeOfService.length }}</q-badge>
                </div>
                <q-select
                  v-model="typeOfService"
                  :options="typeOfServices"
                  outlined
                  dense
                  multiple
                  placeholder="Seleccionar servicios..."
                  option-value="id"
                  option-label="name"
                  use-chips
                >
                  <template v-slot:prepend>
                    <q-icon name="restaurant_menu" size="18px" />
                  </template>
                </q-select>
              </div>

              <!-- Tipo de Factura -->
              <div class="filter-group">
                <div class="filter-label">
                  <q-icon name="receipt" size="18px" color="grey-7" />
                  <span>Tipo de Factura</span>
                  <q-badge v-if="invoiceType.length" color="primary" rounded>{{ invoiceType.length }}</q-badge>
                </div>
                <q-select
                  v-model="invoiceType"
                  :options="invoiceTypes"
                  outlined
                  dense
                  multiple
                  placeholder="Seleccionar tipos..."
                  option-value="id"
                  option-label="name"
                  use-chips
                >
                  <template v-slot:prepend>
                    <q-icon name="description" size="18px" />
                  </template>
                </q-select>
              </div>

              <!-- Sucursales -->
              <div class="filter-group" v-if="userSession.is_root">
                <div class="filter-label">
                  <q-icon name="store" size="18px" color="grey-7" />
                  <span>Sucursales</span>
                  <q-badge v-if="branchOfficeSelect.length" color="primary" rounded>{{ branchOfficeSelect.length }}</q-badge>
                </div>
                <q-select
                  v-model="branchOfficeSelect"
                  :options="branchOffices"
                  outlined
                  dense
                  multiple
                  placeholder="Seleccionar sucursales..."
                  option-value="id"
                  option-label="name"
                  use-chips
                >
                  <template v-slot:prepend>
                    <q-icon name="business" size="18px" />
                  </template>
                </q-select>
              </div>
            </div>
          </q-scroll-area>
        </q-card-section>

        <!-- Footer Actions -->
        <q-separator />
        <q-card-actions class="filters-footer">
          <q-btn
            label="Limpiar Filtros"
            icon="clear_all"
            flat
            color="grey-7"
            @click="clearFilters"
          />
          <q-space />
          <q-btn
            label="Aplicar"
            icon="check"
            color="primary"
            unelevated
            @click="dialogFilter = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Image Gallery Preview -->
    <ImageGalleryPreview
      v-if="invoice && invoice.invoice_files && invoice.invoice_files.length > 0"
      v-model="showGallery"
      :images="invoice.invoice_files"
      :initial-index="selectedFileIndex"
      :loop="true"
      :show-thumbnails="true"
    />

    <!-- Tracking Map Dialog -->
    <q-dialog v-model="showTrackingMap" :maximized="$q.screen.lt.md">
      <q-card :style="$q.screen.lt.md ? '' : 'width: 900px; max-width: 90vw; height: 700px;'">
        <q-card-section class="row items-center q-pb-none bg-teal text-white">
          <div class="text-h6">Tracking en Tiempo Real</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px);">
          <div ref="trackingMapContainer" style="width: 100%; height: 100%;"></div>
        </q-card-section>

        <q-card-section v-if="trackingData" class="q-pt-sm">
          <div class="row q-gutter-md">
            <div class="col">
              <div class="text-caption text-grey-7">Repartidor</div>
              <div class="text-body2 text-weight-medium">{{ trackingData.delivery_person?.name || 'N/A' }}</div>
            </div>
            <div class="col">
              <div class="text-caption text-grey-7">Estado</div>
              <div class="text-body2 text-weight-medium">{{ getDeliveryStatusLabel(trackingData.current_status) }}</div>
            </div>
            <div class="col">
              <div class="text-caption text-grey-7">Última actualización</div>
              <div class="text-body2 text-weight-medium">{{ trackingData.last_update ? formatDate(trackingData.last_update, 'HH:mm:ss') : 'N/A' }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- All Drivers Map Dialog -->
    <q-dialog v-model="showAllDriversMap" maximized>
      <q-card>
        <!-- Header -->
        <q-card-section class="row items-center q-pb-none bg-teal text-white">
          <div class="text-subtitle1 text-sm-h5">Conductores en Tiempo Real</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- Map Container -->
        <q-card-section class="q-pa-none map-container">
          <div ref="allDriversMapContainer" style="width: 100%; height: 100%;"></div>
        </q-card-section>

        <!-- Footer Info - Responsive -->
        <q-card-section class="q-pa-sm q-pa-md-md bg-grey-1">
          <div class="row q-col-gutter-sm q-col-gutter-md-md items-center">
            <!-- Conductores Activos -->
            <div class="col-12 col-sm-auto">
              <div class="text-center text-sm-left">
                <div class="text-caption text-grey-7">Conductores activos</div>
                <div class="text-h6 text-weight-bold text-teal">{{ allDriversData.length }}</div>
              </div>
            </div>

            <!-- Leyenda de Colores -->
            <div class="col-12 col-sm">
              <div class="row q-gutter-xs q-gutter-sm-md justify-center justify-sm-start flex-wrap">
                <div class="flex items-center q-gutter-xs">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background: #00BCD4;"></div>
                  <span class="text-caption">Conductor</span>
                </div>
                <div class="flex items-center q-gutter-xs">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background: #4CAF50;"></div>
                  <span class="text-caption">Entregado</span>
                </div>
                <div class="flex items-center q-gutter-xs">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background: #FF9800;"></div>
                  <span class="text-caption">Pendiente</span>
                </div>
              </div>
            </div>

            <!-- Última Actualización -->
            <div class="col-12 col-sm-auto">
              <div class="text-center text-sm-right">
                <div class="text-caption text-grey-7">Última actualización</div>
                <div class="text-body2">{{ formatDate(new Date(), 'HH:mm:ss') }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Payment Dialog -->
    <q-dialog v-model="paymentDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Registrar Pago</div>
          <div class="text-caption">Factura #{{ invoice?.code }}</div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2 q-mb-md">
            Total de la factura: <strong class="text-primary">{{ formatNumber(invoice.pending) }}</strong>
          </div>

          <q-input
            v-model.number="paymentForm.amount"
            label="Monto a pagar"
            type="number"
            step="0.01"
            filled
            :rules="[val => val > 0 || 'Debe ser mayor a 0', val => val <= calculateTotal() || 'Excede el total']"
          />

          <q-select
            v-model="paymentForm.payment_method_id"
            :options="paymentMethods"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Método de pago"
            filled
            class="q-mt-md"
            @filter=getPaymentMethods
          />

          <q-input
            v-model="paymentForm.reference"
            label="Referencia (opcional)"
            filled
            class="q-mt-md"
          />

          <q-banner class="bg-info text-white q-mt-md">
            <template #avatar>
              <q-icon name="info" />
            </template>
            El pago se registrará con la fecha de hoy.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat @click="closePaymentDialog" />
          <q-btn
            label="Registrar Pago"
            color="primary"
            :loading="savingPayment"
            :disable="!canRegisterPayment"
            @click="registerPayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
/* global google */
import { api } from 'src/boot/axios'
import { formatDate, notify, formatNumber, loading } from 'src/const/mixins'
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { authentication } from 'src/stores/module-authentication'
import { useRoute, useRouter } from 'vue-router'
import FileComponent from 'src/components/FileComponent.vue'
import { commandPrint } from 'src/const/printers'
import { useQuasar, date } from 'quasar'
import ImageGalleryPreview from 'src/components/ImageGalleryComponent.vue'
import draggable from 'vuedraggable'
import DropdownMenu from 'src/components/DropdownMenu.vue'
import { loadGoogleMaps } from 'src/config/maps'

const store = authentication()

const userSession = store.userSession

const dialogFilter = ref(false)
const panel = ref('day')
const dateField = ref('delivery_date')
const dateFilters = ref({
  day: date.formatDate(new Date(), 'YYYY-MM-DD'),
  from: '',
  to: '',
  fromHours: '00:00',
  toHours: '23:59'
})
// const files = ref([])
const route = useRoute()
const router = useRouter()
const code = ref('')

watch(
  () => route.query.id,
  (newId, oldId) => {
    if (newId) getInvoiceOne(newId)
  }
)

// const setImagesToInvoice = async (files) => {
//   const formData = new FormData()
//   formData.append('fileable_type', 'App\\Models\\Invoice')
//   formData.append('fileable_id', invoice.value.id)
//   files.forEach(async (file) => {
//     formData.append('file', file.file)
//     await api.post('files', formData)
//   })
// }

// const changeFiles = async (e) => {
//   const filesSelected = await setFiles(e)
//   files.value = filesSelected
//   setImagesToInvoice(filesSelected)
// }

// const deleteFile = async (file) => {
//   try {
//     const id = file[file.length - 1]
//     await api.delete(`files/${id}`)
//   } catch (error) {
//     console.log(error)
//   }
// }

const $q = useQuasar()

const branchOffice = computed(() => store.branchOfficeGetter)
/**
 * Local storage
 */
const categoryCommand = JSON.parse(localStorage.getItem('category-command')) || []
/**
 * Local storage
 */
const invoiceTypeCommand = JSON.parse(localStorage.getItem('invoiceType-command')) || []
/**
 * Local storage
 */
const typeOfServiceCommand = JSON.parse(localStorage.getItem('typeOfService-command')) || []
/**
 * List branch office
 * @type {Array}
 */
const branchOfficeSelect = ref([])
/**
 * Select invoice
 * @type {Object}
 */
const invoice = ref(null)
/**
 * Selected invoices for bulk actions
 * @type {Array}
 */
const selectedInvoices = ref([])
const deliveryDropdownRef = ref(null)
const statusDropdownRef = ref(null)
/**
 * Bulk action delivery person
 * @type {Object}
 */
const bulkDeliveryPerson = ref(null)
/**
 * Bulk action status
 * @type {String}
 */
const bulkStatus = ref(null)
/**
 * Loading edit
 * @type {Boolean}
 */
const loadingEdit = ref(false)
/**
 * Loading cancel
 * @type {Boolean}
 */
const cancelLoading = ref(false)
/**
 * List invoice
 * @type {Array}
 */
const typeOfServices = ref([])
/**
 * Open edit invoice
 * @type {Boolean}
 */
const openEditInvoice = ref(false)
/**
 * Show gallery dialog
 * @type {Boolean}
 */
const showGallery = ref(false)
/**
 * Selected file index for gallery
 * @type {Number}
 */
const selectedFileIndex = ref(0)
/**
 * Select category
 * @type {Object}
 */
const category = ref(categoryCommand)
/**
 * Select invoiceType
 * @type {Object}
 */
const invoiceType = ref(invoiceTypeCommand)
/**
 * Select typeOfService
 * @type {Object}
 */
const typeOfService = ref(typeOfServiceCommand)

/**
 * List invoice
 * @type {Array}
 */
const categories = ref([])
/**
 * Invoice type
 * @type {Array}
 */
const invoiceTypes = ref([])
/**
 * Branch office
 * @type {Array}
 */
const branchOffices = ref([])

/**
 * Clients
 * @type {Array}
 */
const clients = ref([])
/**
 * Selected client
 * @type {Object}
 */
const client = ref(null)
/**
 * Sellers
 * @type {Array}
 */
const sellers = ref([])
/**
 * Selected seller
 * @type {Object}
 */
const seller = ref(null)
/**
 * Partners
 * @type {Array}
 */
const partners = ref([])
/**
 * Selected partner
 * @type {Object}
 */
const partner = ref(null)
/**
 * Delivery Persons
 * @type {Array}
 */
const deliveryPersons = ref([])
/**
 * Selected delivery person
 * @type {Object}
 */
const deliveryPerson = ref(null)
/**
 * Visible branch office
 * @type {Object}
 */
const visibleBranchOffice = userSession.is_root || userSession.is_super_admin
/**
 * Interval of the status
 * @type {Number}
 */
const interval = ref(null)
const role = ref({})
const isRefreshing = ref(false) // Flag para evitar peticiones simultáneas

const validate = ref(true)

/**
 * Promotion expanded state
 * @type {Object}
 */
const promotionExpanded = ref({})

const permissions = ['SAM']

/**
 * Tracking map variables
 */
const showTrackingMap = ref(false)
const trackingMapContainer = ref(null)
const trackingMap = ref(null)
const trackingData = ref(null)
const courierMarker = ref(null)
const trackingPolyline = ref(null)
const trackingInterval = ref(null)

/**
 * All drivers map variables
 */
const showAllDriversMap = ref(false)
const allDriversMapContainer = ref(null)
const allDriversMap = ref(null)
const allDriversData = ref([])
const driverMarkers = ref({})
const driverPolylines = ref({})
const allDriversInterval = ref(null)

/**
 * Payment Dialog variables
 */
const paymentDialog = ref(false)
const paymentMethods = ref([])
const paymentForm = ref({
  amount: 0,
  payment_method_id: null,
  reference: ''
})
const savingPayment = ref(false)

/**
 * List status
 * @type {Array}
 */
const statuses = ref([
  { label: 'Pendiente', value: 'pending', data: [], page: 1, loading: false, permissions: ['DP'], icon: 'schedule', color: 'orange', total: 0 },
  { label: 'En proceso', value: 'on_process', data: [], page: 1, loading: false, permissions: ['DP'], icon: 'restaurant', color: 'blue', total: 0 },
  { label: 'Terminado', value: 'finished', data: [], page: 1, loading: false, permissions: [], icon: 'check_circle', color: 'green', total: 0 },
  { label: 'En Delivery', value: 'in_delivery', data: [], page: 1, loading: false, permissions: [], icon: 'local_shipping', color: 'teal', total: 0 },
  { label: 'Entregado', value: 'delivered', data: [], page: 1, loading: false, permissions: [], icon: 'done_all', color: 'purple', total: 0 }
])

import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

/**
 * Filtered statuses (computed to avoid v-if with v-for)
 */
const filteredStatuses = computed(() => {
  return statuses.value.filter(status => !setPermissionsByUser(status.permissions))
})

/**
 * Active tab for mobile view
 */
const tab = ref('pending') // Default to first pending status

// Swiper logic
const swiperRef = ref(null)

const onSwiper = (swiper) => {
  swiperRef.value = swiper
}

const slideToLoop = (index) => {
  if (swiperRef.value) {
    swiperRef.value.slideToLoop(index)
  }
}

// Watch tab change to update swiper slide
watch(tab, (newVal) => {
  const index = filteredStatuses.value.findIndex(status => status.value === newVal)
  if (index !== -1) {
    slideToLoop(index)
  }
})

/**
 * Statuses to display based on screen size
 */
const displayStatuses = computed(() => {
  // Always return all filtered statuses. visibility is handled by q-tabs/q-tab-panels in mobile
  // and by flex layout in desktop.
  return filteredStatuses.value
})

/**
 * Check if drag and drop is allowed
 */
const isDraggable = computed(() => {
  // Disable drag and drop on mobile phones (XS), enable on tablets (SM) and desktop (MD+)
  return !$q.screen.xs
})

/**
 * Params search
 * @type {Object}
 */
const params = ref({
  sortOrder: 'asc',
  sortBy: 'delivery_date',
  whereIn: {
    'products.category_id': categoryCommand.map(item => item.id),
    invoice_type_id: invoiceTypeCommand.map(item => item.id),
    branch_office_id: branchOffice.value
  },
  dateFilter: {
    field: 'delivery_date',
    from: `${date.formatDate(new Date(), 'YYYY-MM-DD')} 00:00:00`,
    to: `${date.formatDate(new Date(), 'YYYY-MM-DD')} 23:59:59`
  }
})

onMounted(async () => {
  await setPermissions()
  getCategories()
  getInvoiceTypes()
  getTypeOfServices()
  getBranchOffices()
  getDeliveryPersons()
  if (route.query.id) getInvoiceOne(route.query.id)
})

watch(openEditInvoice, (data) => {
  if (!data) {
    router.push({ name: 'CommandOrder' })
  }
})

const setStatusValue = (sts, field) => {
  const st = statuses.value.find((status) => status.value === sts)
  return st ? st[field] : {}
}
/**
 * Load invoices
 * @param {Object} status status
 * @param {Boolean} silent if true, don't show loading indicator
 */
const loadInvoices = async (status, silent = false) => {
  try {
    if (!silent) {
      status.loading = true
    }
    const { data } = await api.get('command-orders', {
      params: {
        ...params.value,
        page: status.page,
        perPage: 10,
        paginate: true,
        dataEqualFilter: {
          status: status.value
        }
      }
    })
    status.data = data.data
    status.total = data.total
  } catch (error) {
    console.error(`Error al cargar datos para ${status.label}:`, error)
  } finally {
    if (!silent) {
      status.loading = false
    }
  }
}

onUnmounted(() => {
  // Limpiar todos los intervalos para evitar "Too Many Attempts"
  if (interval.value) {
    clearInterval(interval.value)
    interval.value = null
  }
  if (trackingInterval.value) {
    clearInterval(trackingInterval.value)
    trackingInterval.value = null
  }
  if (allDriversInterval.value) {
    clearInterval(allDriversInterval.value)
    allDriversInterval.value = null
  }
})

watch(code, async (cat) => {
  filters('id', cat, 'dataFilter')
})

watch(category, async (cat) => {
  localStorage.setItem('category-command', JSON.stringify(cat))
  const ids = cat.map((item) => item.id)
  filters('products.category_id', ids, 'whereIn')
})

watch(invoiceType, async (it) => {
  localStorage.setItem('invoiceType-command', JSON.stringify(it))
  const ids = it.map((item) => item.id)
  filters('invoice_type_id', ids, 'whereIn')
})

watch(typeOfService, async (it) => {
  localStorage.setItem('typeOfService-command', JSON.stringify(it))
  const ids = it.map((item) => item.id)
  filters('type_of_service_id', ids, 'whereIn')
})

watch(branchOfficeSelect, async (bo) => {
  localStorage.setItem('branchOffice-command', JSON.stringify(bo))
  const ids = bo.map((item) => item.id)
  filters('branch_office_id', ids, 'whereIn')
})

watch(client, async (client) => {
  const ids = client?.id ? [client?.id] : []
  filters('client_id', ids, 'whereIn')
})

watch(seller, async (seller) => {
  localStorage.setItem('seller-command', JSON.stringify(seller))
  const ids = seller?.id ? [seller?.id] : []
  filters('seller_id', ids, 'whereIn')
})

watch(deliveryPerson, async (data) => {
  const ids = data?.id ? [data?.id] : []
  filters('delivery_person_id', ids, 'whereIn')
})

watch(partner, async (partnerValue) => {
  const ids = partnerValue?.id ? [partnerValue?.id] : []
  filters('client.partner_id', ids, 'whereIn')
})

watch(validate, async (data) => {
  if (!data) {
    // Removido el filtro automático por vendedor - los vendedores ven todas las comandas
    // if (role.value.seller) {
    //   seller.value = userSession
    // }
    if (role.value.deliveryPerson) {
      deliveryPerson.value = userSession
    }
  }
})

/**
 * Filters
 * @param {String} field field
 * @param {Array} value value
 * @param {String} filterParams filterParams
 */
const filters = (field, value, filterParams) => {
  params.value[filterParams] = {
    ...params.value[filterParams],
    [field]: value
  }
  getInvoices(params.value)
}

/**
 * Apply filters for date
 */
const applyFilters = () => {
  if (panel.value === 'day') {
    if (dateFilters.value.day) {
      params.value.dateFilter = {
        field: dateField.value,
        from: `${dateFilters.value.day} ${dateFilters.value.fromHours || '00:00'}`,
        to: `${dateFilters.value.day} ${dateFilters.value.toHours || '23:59'}`
      }
    }
  } else {
    if (dateFilters.value.from && dateFilters.value.to) {
      params.value.dateFilter = {
        field: dateField.value,
        from: dateFilters.value.from,
        to: dateFilters.value.to
      }
    }
  }
  getInvoices(params.value)
}

watch(dateField, () => {
  applyFilters()
})

watch(panel, () => {
  applyFilters()
})

const setPermissions = () => {
  validate.value = userSession.is_root || userSession.roles.some(role => permissions.includes(role.acronym))

  role.value = {
    seller: setPermissionsByUser(['SEL']),
    deliveryPerson: setPermissionsByUser(['DP'])
  }

  // Auto-refresh every 30 seconds without loading indicator (aumentado para evitar Too Many Attempts)
  interval.value = setInterval(() => {
    refreshInvoicesSilently()
  }, 30000)
}

const setPermissionsByUser = (data) => {
  return userSession.roles.some(role => data.includes(role.acronym))
}
/**
 * Print invoice
 * @param {Object} data invoice saved
 */
const print = async (data) => {
  await commandPrint(data)
}
/**
 * Show invoice
 * @param {Object} data invoice saved
 */
const showInvoices = (data) => {
  invoice.value = data
  setTimeout(() => {
    openEditInvoice.value = true
  }, 100)
}

/**
 * Opens the gallery at a specific file index
 * @param {Number} index - Index of the file to display
 */
const openGallery = (index = 0) => {
  selectedFileIndex.value = index
  showGallery.value = true
}

const getInvoiceOne = async (id) => {
  try {
    loading(true)
    const { data } = await api.get(`invoices/${id}`)
    showInvoices(data.data)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading(false)
  }
}

/**
 * Get all invoices
 */
const getInvoices = async (dataFilter = {}) => {
  params.value = dataFilter
  statuses.value.forEach((column) => loadInvoices(column))
}

/**
 * Refresh invoices silently (without loading indicator)
 */
const refreshInvoicesSilently = async () => {
  // Evitar múltiples peticiones simultáneas
  if (isRefreshing.value) {
    return
  }

  try {
    isRefreshing.value = true
    // Cargar todas las columnas en paralelo
    await Promise.all(
      statuses.value.map((column) => loadInvoices(column, true))
    )
  } catch (error) {
    console.error('Error en refresh silencioso:', error)
  } finally {
    isRefreshing.value = false
  }
}
/**
 * Filter clients
 */
const filterClients = async (value, update) => {
  try {
    const { data } = await api.get('clients', {
      params: {
        dataSearch: {
          name: value,
          document_number: value
        },
        dataEqualFilter: {
          partner_id: partner.value?.id
        }
      }
    })
    update(() => {
      clients.value = data
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Filter partners
 */
const filterPartners = async (value, update) => {
  try {
    const { data } = await api.get('partners', {
      params: {
        dataSearch: {
          name: value,
          document_number: value
        }
      }
    })
    update(() => {
      partners.value = data
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Get all sellers
 */
const filterSellers = async (value, update) => {
  try {
    const { data } = await api.get('sellers', {
      params: {
        dataSearch: {
          name: value,
          document_number: value
        }
      }
    })
    update(() => {
      sellers.value = data
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}
/**
 * Get all delivery persons
 */
const getDeliveryPersons = async () => {
  try {
    const { data } = await api.get('delivery-persons')
    deliveryPersons.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Filter delivery persons
 */
const filterDeliveryPersons = async (value, update) => {
  try {
    const { data } = await api.get('delivery-persons', {
      params: {
        dataSearch: {
          name: value,
          document_number: value
        }
      }
    })
    update(() => {
      deliveryPersons.value = data
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Clear all filters
 */
const clearFilters = () => {
  code.value = null
  client.value = null
  partner.value = null
  seller.value = null
  deliveryPerson.value = null
  category.value = []
  typeOfService.value = []
  invoiceType.value = []
  branchOfficeSelect.value = []
  
  // Clear date filters
  dateFilters.value = {
    day: date.formatDate(new Date(), 'YYYY-MM-DD'),
    from: '',
    to: '',
    fromHours: '00:00',
    toHours: '23:59'
  }
  dateField.value = 'delivery_date'
  panel.value = 'day'
  
  params.value.dateFilter = {
    field: dateField.value,
    from: `${date.formatDate(new Date(), 'YYYY-MM-DD')} 00:00:00`,
    to: `${date.formatDate(new Date(), 'YYYY-MM-DD')} 23:59:59`
  }
  
  notify('Filtros limpiados', 'info', 'info')
  getInvoices(params.value)
}
/**
 * Get all invoices
 */
const getBranchOffices = async () => {
  try {
    if (userSession.is_root || role.value.deliveryPerson) {
      const { data } = await api.get('branch-offices')
      branchOffices.value = data
      branchOfficeSelect.value = data
    } else {
      branchOfficeSelect.value = [branchOffice.value]
    }
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Get all invoices
 */
const getCategories = async () => {
  try {
    const { data } = await api.get('categories', {
      params: {
        branch_office_id: branchOffice.value?.id
      }
    })
    categories.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

const getTypeOfServices = async () => {
  try {
    const { data } = await api.get('type-of-services')
    typeOfServices.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}
/**
 * Get invoice types
 */
const getInvoiceTypes = async () => {
  try {
    const { data } = await api.get('invoice-types')
    invoiceTypes.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Drag & Drop handler
 */
const onDragChange = async (evt, status, statusIndex) => {
  if (evt.added) {
    const invoice = evt.added.element
    const oldStatus = invoice.status

    try {
      const response = await api.put(`invoice-status-command/${invoice.id}`, {
        status: status.value
      })

      // Update invoice with response data
      if (response.data.invoice) {
        Object.assign(invoice, response.data.invoice)
      }

      // Update totals
      const oldStatusObj = statuses.value.find(s => s.value === oldStatus)
      if (oldStatusObj && oldStatusObj.total > 0) {
        oldStatusObj.total--
      }
      status.total++

      notify('Orden movida exitosamente', 'positive', 'check_circle')
    } catch (error) {
      notify(error.message, 'negative', 'warning')
      // Revert the change by reloading
      getInvoices(params.value)
    }
  }
}

/**
 * Toggle product ready status
 */
const toggleProductReady = async (invoice, product) => {
  try {
    await api.put(`invoice-product/${product.pivot.id}/toggle-ready`, {
      is_ready: product.pivot.is_ready
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
    product.pivot.is_ready = !product.pivot.is_ready
  }
}

/**
 * Get products progress
 */
const getProductsProgress = (invoice) => {
  if (!invoice.products || invoice.products.length === 0) return 0
  const readyCount = invoice.products.filter(p => p.pivot?.is_ready).length
  return readyCount / invoice.products.length
}

/**
 * Get ready products count
 */
const getReadyProductsCount = (invoice) => {
  if (!invoice.products) return 0
  return invoice.products.filter(p => p.pivot?.is_ready).length
}

/**
 * Assign delivery person to invoice
 */
const assignDeliveryPerson = async (invoice, deliveryPerson) => {
  try {
    await api.put(`invoices/${invoice.id}/assign-delivery-person`, {
      delivery_person_id: deliveryPerson?.id || null
    })
    notify('Repartidor asignado exitosamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Check if invoice is selected
 */
const isInvoiceSelected = (invoiceId) => {
  return selectedInvoices.value.some(inv => inv.id === invoiceId)
}

/**
 * Toggle invoice selection
 */
const toggleInvoiceSelection = (invoice) => {
  const index = selectedInvoices.value.findIndex(inv => inv.id === invoice.id)
  if (index > -1) {
    selectedInvoices.value.splice(index, 1)
  } else {
    selectedInvoices.value.push(invoice)
  }
}

/**
 * Check if all invoices in column are selected
 */
const isColumnSelected = (status) => {
  if (status.data.length === 0) return false
  return status.data.every(invoice => isInvoiceSelected(invoice.id))
}

/**
 * Toggle column selection
 */
const toggleColumnSelection = (status) => {
  const allSelected = isColumnSelected(status)
  if (allSelected) {
    // Deselect all from this column
    status.data.forEach(invoice => {
      const index = selectedInvoices.value.findIndex(inv => inv.id === invoice.id)
      if (index > -1) {
        selectedInvoices.value.splice(index, 1)
      }
    })
  } else {
    // Select all from this column
    status.data.forEach(invoice => {
      if (!isInvoiceSelected(invoice.id)) {
        selectedInvoices.value.push(invoice)
      }
    })
  }
}

/**
 * Clear all selections
 */
const clearSelection = () => {
  selectedInvoices.value = []
  bulkDeliveryPerson.value = null
  bulkStatus.value = null
}

/**
 * Apply delivery person to all selected invoices
 */
const applyBulkDeliveryPerson = async (deliveryPerson) => {
  if (!deliveryPerson || selectedInvoices.value.length === 0) return

  try {
    const promises = selectedInvoices.value.map(invoice =>
      api.put(`invoices/${invoice.id}/assign-delivery-person`, {
        delivery_person_id: deliveryPerson.id
      })
    )

    await Promise.all(promises)

    // Update local data
    selectedInvoices.value.forEach(selectedInvoice => {
      statuses.value.forEach(status => {
        const invoice = status.data.find(inv => inv.id === selectedInvoice.id)
        if (invoice) {
          invoice.delivery_person = deliveryPerson
        }
      })
    })

    notify(`Repartidor asignado a ${selectedInvoices.value.length} orden(es)`, 'positive', 'check_circle')
    clearSelection()
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Apply status change to all selected invoices
 */
const applyBulkStatus = async (newStatus) => {
  if (!newStatus || selectedInvoices.value.length === 0) return

  try {
    const promises = selectedInvoices.value.map(invoice =>
      api.put(`invoice-status-command/${invoice.id}`, {
        status: newStatus.value
      })
    )

    await Promise.all(promises)

    notify(`Estado cambiado a ${newStatus.label} para ${selectedInvoices.value.length} orden(es)`, 'positive', 'check_circle')
    clearSelection()
    getInvoices(params.value)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Get invoice type color
 */
const getInvoiceTypeColor = (typeName) => {
  const colors = {
    Factura: 'primary',
    Boleta: 'secondary',
    Ticket: 'accent',
    Pedido: 'info',
    Comanda: 'warning'
  }
  return colors[typeName] || 'grey'
}

/**
 * Load more items
 */
const loadMore = async (status) => {
  status.page++
  await loadInvoices(status)
}
/**
 * Model data for API save
 * @param {Object} data data to model
 * @return {Object} modeled data
 */
const modelData = (data) => {
  const result = { ...data }
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const element = result[key]
      if (element && typeof element === 'object' && element.id && !Array.isArray(element)) {
        result[`${key}_id`] = element.id
      }
    }
  }
  return result
}

/**
 * Save invoice edits
 */
const saveEdit = async () => {
  if (!invoice.value) return

  try {
    loadingEdit.value = true
    const payload = modelData(invoice.value)

    await api.put(`invoices/${invoice.value.id}`, payload)

    notify('Cambios guardados exitosamente', 'positive', 'check_circle')
    openEditInvoice.value = false

    // Reload only the affected column
    const statusObj = statuses.value.find(s => s.value === invoice.value.status)
    if (statusObj) {
      loadInvoices(statusObj)
    }
  } catch (error) {
    console.error('Error saving invoice:', error)
    notify(error.response?.data?.message || 'Error al guardar los cambios', 'negative', 'warning')
  } finally {
    loadingEdit.value = false
  }
}

/**
 * Change status invoice
 * @param {Object} data invoice
 * @param {Number} index index status
 */
const cancelInvoice = async () => {
  if (!invoice.value) return

  try {
    cancelLoading.value = true
    const originalStatus = invoice.value.status
    await api.put(`invoice-status-command/${invoice.value.id}`, { status: 'cancelled' })

    // Reload only the affected column
    const statusObj = statuses.value.find(s => s.value === originalStatus)
    if (statusObj) {
      loadInvoices(statusObj)
    }

    notify('Factura anulada exitosamente', 'positive', 'check_circle')
    openEditInvoice.value = false
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    cancelLoading.value = false
  }
}

/**
 * Get payment methods
 */
const getPaymentMethods = async (value, update) => {
  try {
    const { data } = await api.get('payment-methods', {
      params: {
        dataSearch: {
          name: value
        }
      }
    })
    update(() => {
      paymentMethods.value = data
    })
  } catch (error) {
    notify('Error al cargar métodos de pago', 'negative', 'error')
  }
}

/**
 * Calculate total amount from invoice products
 */
const calculateTotal = () => {
  if (!invoice.value?.products) return 0
  return invoice.value.products.reduce((sum, product) => {
    return sum + (product.pivot.price * product.pivot.amount)
  }, 0)
}

/**
 * Can register payment computed
 */
const canRegisterPayment = computed(() => {
  return paymentForm.value.amount > 0 &&
         paymentForm.value.amount <= calculateTotal() &&
         paymentForm.value.payment_method_id
})

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Open payment dialog
 */
const openPaymentDialog = async () => {
  if (!invoice.value?.products || invoice.value.products.length === 0) {
    notify('Debe tener al menos un producto para cobrar', 'warning', 'warning')
    return
  }

  // Reset form with pending amount
  paymentForm.value = {
    amount: invoice.value.pending || calculateTotal(),
    payment_method_id: null,
    reference: ''
  }
  paymentDialog.value = true
}

/**
 * Open payment dialog from card
 */
const openPaymentDialogFromCard = async (invoiceData) => {
  if (!invoiceData?.products || invoiceData.products.length === 0) {
    notify('Debe tener al menos un producto para cobrar', 'warning', 'warning')
    return
  }

  if (!invoiceData.pending || invoiceData.pending <= 0) {
    notify('Esta factura no tiene saldo pendiente', 'info', 'info')
    return
  }

  // Set the invoice as current
  invoice.value = invoiceData

  // Reset form with pending amount
  paymentForm.value = {
    amount: invoiceData.pending,
    reference: ''
  }
  paymentDialog.value = true
}

/**
 * Close payment dialog
 */
const closePaymentDialog = () => {
  paymentDialog.value = false
  paymentForm.value = {
    amount: 0,
    payment_method_id: null,
    reference: ''
  }
}

/**
 * Register payment for invoice
 */
const registerPayment = async () => {
  try {
    savingPayment.value = true

    // Create payment data with today's date
    const paymentData = {
      amount: paymentForm.value.amount,
      payment_method_id: paymentForm.value.payment_method_id,
      branch_office_id: invoice.value.branch_office_id,
      date: getTodayDate(),
      reference: paymentForm.value.reference,
      invoice_id: invoice.value.id
    }

    // Register payment
    const { data } = await api.post(`client-statement/clients/${invoice.value.client_id}/payments`, paymentData)

    notify('Pago registrado exitosamente', 'positive', 'check_circle')

    closePaymentDialog()

    // Update invoice locally without additional request
    const newBalance = data.new_balance || 0
    const newPayment = data.payment

    // Update invoice.value with new balance and payment
    if (invoice.value) {
      invoice.value.pending = newBalance
      invoice.value.balance = newBalance

      // Add new payment to invoice_payments array
      if (newPayment && invoice.value.invoice_payments) {
        invoice.value.invoice_payments.push({
          id: newPayment.id,
          amount: newPayment.amount,
          payment_method_id: newPayment.payment_method_id,
          payment_method: newPayment.paymentMethod,
          date: newPayment.date,
          reference: newPayment.reference,
          created_at: newPayment.created_at
        })
      }

      // Update the invoice in the statuses array (in the board)
      statuses.value.forEach(status => {
        const index = status.data.findIndex(inv => inv.id === invoice.value.id)
        if (index !== -1) {
          status.data[index] = { ...status.data[index], pending: newBalance, balance: newBalance }
        }
      })
    }
  } catch (error) {
    notify(error.response?.data?.message || 'Error al registrar el pago', 'negative', 'error')
  } finally {
    savingPayment.value = false
  }
}

/**
 * Toggle promotion details visibility
 * @param {Number} promotionId promotion id
 */
const togglePromotionDetails = (promotionId) => {
  promotionExpanded.value[promotionId] = !promotionExpanded.value[promotionId]
}

/**
 * Get status timeline with durations
 * @param {Object} invoice invoice object
 */
const getStatusTimeline = (invoice) => {
  if (!invoice || !invoice.status_history || invoice.status_history.length === 0) {
    return []
  }

  const statusConfig = {
    pending: { label: 'Pendiente', icon: 'schedule', color: 'orange' },
    on_process: { label: 'En Proceso', icon: 'restaurant', color: 'blue' },
    finished: { label: 'Terminado', icon: 'check_circle', color: 'green' },
    in_delivery: { label: 'En Delivery', icon: 'local_shipping', color: 'teal' },
    delivered: { label: 'Entregado', icon: 'done_all', color: 'purple' },
    cancelled: { label: 'Anulado', icon: 'cancel', color: 'red' }
  }

  const timeline = []
  const history = [...invoice.status_history].sort((a, b) =>
    new Date(a.created_at) - new Date(b.created_at)
  )

  history.forEach((event, index) => {
    const config = statusConfig[event.status] || { label: event.status, icon: 'circle', color: 'grey' }
    const eventDate = new Date(event.created_at)

    let duration = null
    if (index < history.length - 1) {
      const nextEvent = history[index + 1]
      const nextDate = new Date(nextEvent.created_at)
      duration = formatDuration(nextDate - eventDate)
    } else if (invoice.status === event.status) {
      // Estado actual - calcular desde este evento hasta ahora
      const now = new Date()
      duration = formatDuration(now - eventDate)
    }

    timeline.push({
      label: config.label,
      date: formatDate(event.created_at, 'DD/MM/YYYY HH:mm:ss'),
      icon: config.icon,
      color: config.color,
      duration,
      user: event.user?.name || event.actor?.name || null
    })
  })

  return timeline
}

/**
 * Get total time from first to last status
 * @param {Object} invoice invoice object
 */
const getTotalTime = (invoice) => {
  if (!invoice || !invoice.status_history || invoice.status_history.length === 0) {
    return 'N/A'
  }

  const history = [...invoice.status_history].sort((a, b) =>
    new Date(a.created_at) - new Date(b.created_at)
  )

  const firstEvent = new Date(history[0].created_at)
  const lastEvent = invoice.status === 'delivered' || invoice.status === 'cancelled'
    ? new Date(history[history.length - 1].created_at)
    : new Date()

  return formatDuration(lastEvent - firstEvent)
}

/**
 * Format duration in milliseconds to human readable format
 * @param {Number} ms milliseconds
 */
const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Get status color hex value
 * @param {String} colorName Quasar color name
 */
const getStatusColor = (colorName) => {
  const colors = {
    grey: '#9E9E9E',
    blue: '#2196F3',
    green: '#4CAF50',
    orange: '#FF9800',
    teal: '#009688',
    purple: '#9C27B0',
    red: '#F44336'
  }
  return colors[colorName] || '#9E9E9E'
}

/**
 * Open tracking map for delivery
 * @param {Object} invoice invoice object
 */
async function openTrackingMap (invoice) {
  showTrackingMap.value = true

  // Wait for DOM to render
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    // Load Google Maps first
    await loadGoogleMaps()

    // Load delivery run data
    const response = await api.get(`/invoice-delivery-runs/${invoice.delivery_run_id}`)
    trackingData.value = response.data.delivery_run

    // Initialize map
    initializeTrackingMap()

    // Start real-time updates
    startTrackingUpdates(invoice.delivery_run_id)
  } catch (error) {
    console.error('Error loading tracking data:', error)
    notify('Error al cargar datos de tracking', 'negative')
  }
}

/**
 * Initialize Google Maps for tracking
 */
function initializeTrackingMap () {
  if (!trackingMapContainer.value || !trackingData.value) return

  // Get current location or use first delivery location
  const currentLocation = trackingData.value.locations?.[0]
  const firstDelivery = trackingData.value.items?.[0]

  let centerLat = -12.0464 // Lima default
  let centerLng = -77.0428

  if (currentLocation) {
    centerLat = currentLocation.latitude
    centerLng = currentLocation.longitude
  } else if (firstDelivery?.invoice?.client?.address) {
    const addr = firstDelivery.invoice.client.address
    centerLat = addr.lat || addr.latitude || centerLat
    centerLng = addr.lng || addr.longitude || centerLng
  }

  // Create map
  trackingMap.value = new google.maps.Map(trackingMapContainer.value, {
    center: { lat: centerLat, lng: centerLng },
    zoom: 14,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  })

  // Add courier marker if location exists
  if (currentLocation) {
    courierMarker.value = new google.maps.Marker({
      position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
      map: trackingMap.value,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#00BCD4',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      },
      title: 'Repartidor'
    })
  }

  // Add delivery markers
  if (trackingData.value.items) {
    trackingData.value.items.forEach((item, index) => {
      const addr = item.invoice?.client?.address
      if (addr && (addr.lat || addr.latitude)) {
        const lat = addr.lat || addr.latitude
        const lng = addr.lng || addr.longitude

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: trackingMap.value,
          label: {
            text: String(index + 1),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: item.delivery_status === 'delivered' ? '#4CAF50' : '#FF9800',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          },
          title: item.invoice?.client?.name || 'Cliente'
        })

        // Info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <strong>${item.invoice?.code}</strong><br>
              ${item.invoice?.client?.name}<br>
              <span style="color: ${item.delivery_status === 'delivered' ? '#4CAF50' : '#FF9800'}">
                ${getDeliveryStatusLabel(item.delivery_status)}
              </span>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(trackingMap.value, marker)
        })
      }
    })
  }

  // Draw path if locations exist
  if (trackingData.value.locations && trackingData.value.locations.length > 1) {
    const path = trackingData.value.locations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude
    }))

    trackingPolyline.value = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#00BCD4',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: trackingMap.value
    })
  }
}

/**
 * Start real-time tracking updates
 * @param {Number} deliveryRunId delivery run id
 */
function startTrackingUpdates (deliveryRunId) {
  // Clear existing interval
  if (trackingInterval.value) {
    clearInterval(trackingInterval.value)
  }

  // Update every 10 seconds (aumentado de 5 a 10 para reducir carga)
  trackingInterval.value = setInterval(async () => {
    try {
      // Solo actualizar si el mapa está visible
      if (!showTrackingMap.value) {
        stopTrackingUpdates()
        return
      }

      const response = await api.get(`/invoice-delivery-runs/${deliveryRunId}`)
      const newData = response.data.delivery_run

      // Update tracking data
      trackingData.value = newData

      // Update courier marker position
      if (newData.locations && newData.locations.length > 0 && courierMarker.value) {
        const latestLocation = newData.locations[0]
        const newPosition = {
          lat: latestLocation.latitude,
          lng: latestLocation.longitude
        }

        courierMarker.value.setPosition(newPosition)

        // Update polyline path
        if (trackingPolyline.value) {
          const path = newData.locations.map(loc => ({
            lat: loc.latitude,
            lng: loc.longitude
          }))
          trackingPolyline.value.setPath(path)
        }
      }
    } catch (error) {
      console.error('Error updating tracking:', error)
      // Si hay error, detener actualizaciones para evitar acumulación
      if (error.response && error.response.status === 429) {
        console.warn('Too many requests, stopping tracking updates')
        stopTrackingUpdates()
      }
    }
  }, 10000)
}

/**
 * Stop tracking updates
 */
function stopTrackingUpdates () {
  if (trackingInterval.value) {
    clearInterval(trackingInterval.value)
    trackingInterval.value = null
  }
}

/**
 * Get delivery status label
 * @param {String} status delivery status
 */
function getDeliveryStatusLabel (status) {
  const labels = {
    pending: 'Pendiente',
    arrived: 'En ubicación',
    delivered: 'Entregado',
    failed: 'Fallido'
  }
  return labels[status] || status
}

// Watch for dialog close to stop updates
watch(showTrackingMap, (newVal) => {
  if (!newVal) {
    stopTrackingUpdates()
  }
})

/**
 * Open all drivers map
 */
async function openAllDriversMap () {
  showAllDriversMap.value = true

  // Wait for DOM to render
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    // Load Google Maps first
    await loadGoogleMaps()

    // Load all active delivery runs
    const response = await api.get('/invoice-delivery-runs/all-active')
    allDriversData.value = response.data.delivery_runs || []

    // Initialize map
    initializeAllDriversMap()

    // Start real-time updates
    startAllDriversUpdates()
  } catch (error) {
    console.error('Error loading all drivers data:', error)
    notify('Error al cargar datos de conductores', 'negative')
  }
}

/**
 * Initialize Google Maps for all drivers
 */
function initializeAllDriversMap () {
  if (!allDriversMapContainer.value) return

  // Center on Lima by default
  let centerLat = -12.0464
  let centerLng = -77.0428

  // If there are drivers, center on first one
  if (allDriversData.value.length > 0 && allDriversData.value[0].locations?.length > 0) {
    const firstLocation = allDriversData.value[0].locations[0]
    centerLat = parseFloat(firstLocation.latitude) || centerLat
    centerLng = parseFloat(firstLocation.longitude) || centerLng
  }

  // Create map
  allDriversMap.value = new google.maps.Map(allDriversMapContainer.value, {
    center: { lat: centerLat, lng: centerLng },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  })

  // Add markers for each driver
  allDriversData.value.forEach((deliveryRun) => {
    addDriverToMap(deliveryRun)
  })

  // Fit bounds to show all drivers
  if (allDriversData.value.length > 0) {
    const bounds = new google.maps.LatLngBounds()
    allDriversData.value.forEach((deliveryRun) => {
      if (deliveryRun.locations && deliveryRun.locations.length > 0) {
        const loc = deliveryRun.locations[0]
        const lat = parseFloat(loc.latitude)
        const lng = parseFloat(loc.longitude)
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend({ lat, lng })
        }
      }
    })
    allDriversMap.value.fitBounds(bounds)
  }
}

/**
 * Add driver to map
 * @param {Object} deliveryRun delivery run object
 */
function addDriverToMap (deliveryRun) {
  if (!deliveryRun.locations || deliveryRun.locations.length === 0) return

  const currentLocation = deliveryRun.locations[0]
  const driverId = deliveryRun.id

  // Parse coordinates to numbers
  const lat = parseFloat(currentLocation.latitude)
  const lng = parseFloat(currentLocation.longitude)

  // Validate coordinates
  if (isNaN(lat) || isNaN(lng)) {
    console.warn('Invalid coordinates for driver:', deliveryRun.delivery_person?.name)
    return
  }

  // Create driver marker
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map: allDriversMap.value,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: '#00BCD4',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3
    },
    title: deliveryRun.delivery_person?.name || 'Conductor'
  })

  // Info window
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="padding: 8px; min-width: 200px;">
        <strong>${deliveryRun.delivery_person?.name || 'Conductor'}</strong><br>
        <span style="color: #666;">Entregas: ${deliveryRun.items?.length || 0}</span><br>
        <span style="color: #4CAF50;">Completadas: ${deliveryRun.items?.filter(i => i.delivery_status === 'delivered').length || 0}</span><br>
        <span style="color: #FF9800;">Pendientes: ${deliveryRun.items?.filter(i => i.delivery_status !== 'delivered').length || 0}</span>
      </div>
    `
  })

  marker.addListener('click', () => {
    // Close all other info windows
    Object.values(driverMarkers.value).forEach(m => {
      if (m.infoWindow) m.infoWindow.close()
    })
    infoWindow.open(allDriversMap.value, marker)
  })

  // Store marker
  driverMarkers.value[driverId] = { marker, infoWindow }

  // Draw path if locations exist
  if (deliveryRun.locations.length > 1) {
    const path = deliveryRun.locations
      .map(loc => ({
        lat: parseFloat(loc.latitude),
        lng: parseFloat(loc.longitude)
      }))
      .filter(coord => !isNaN(coord.lat) && !isNaN(coord.lng))

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#00BCD4',
      strokeOpacity: 0.6,
      strokeWeight: 3,
      map: allDriversMap.value
    })

    driverPolylines.value[driverId] = polyline
  }

  // Add delivery markers
  if (deliveryRun.items) {
    deliveryRun.items.forEach((item, index) => {
      const addr = item.invoice?.client?.address
      if (addr && (addr.lat || addr.latitude)) {
        const lat = parseFloat(addr.lat || addr.latitude)
        const lng = parseFloat(addr.lng || addr.longitude)

        // Skip if invalid coordinates
        if (isNaN(lat) || isNaN(lng)) return

        // eslint-disable-next-line no-new
        new google.maps.Marker({
          position: { lat, lng },
          map: allDriversMap.value,
          label: {
            text: String(index + 1),
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: item.delivery_status === 'delivered' ? '#4CAF50' : '#FF9800',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          },
          title: item.invoice?.code || 'Entrega'
        })
      }
    })
  }
}

/**
 * Start real-time updates for all drivers
 */
function startAllDriversUpdates () {
  // Clear existing interval
  if (allDriversInterval.value) {
    clearInterval(allDriversInterval.value)
  }

  // Update every 15 seconds (aumentado de 10 a 15 para reducir carga)
  allDriversInterval.value = setInterval(async () => {
    try {
      // Solo actualizar si el mapa está visible
      if (!showAllDriversMap.value) {
        stopAllDriversUpdates()
        return
      }

      const response = await api.get('/invoice-delivery-runs/all-active')
      const newData = response.data.delivery_runs || []

      // Update data
      allDriversData.value = newData

      // Update markers
      newData.forEach((deliveryRun) => {
        const driverId = deliveryRun.id
        const driverMarker = driverMarkers.value[driverId]

        if (driverMarker && deliveryRun.locations && deliveryRun.locations.length > 0) {
          const latestLocation = deliveryRun.locations[0]
          const lat = parseFloat(latestLocation.latitude)
          const lng = parseFloat(latestLocation.longitude)

          if (!isNaN(lat) && !isNaN(lng)) {
            const newPosition = { lat, lng }

            // Update marker position
            driverMarker.marker.setPosition(newPosition)

            // Update polyline
            if (driverPolylines.value[driverId]) {
              const path = deliveryRun.locations
                .map(loc => ({
                  lat: parseFloat(loc.latitude),
                  lng: parseFloat(loc.longitude)
                }))
                .filter(coord => !isNaN(coord.lat) && !isNaN(coord.lng))
              driverPolylines.value[driverId].setPath(path)
            }
          }
        } else if (!driverMarker && deliveryRun.locations && deliveryRun.locations.length > 0) {
          // New driver appeared, add to map
          addDriverToMap(deliveryRun)
        }
      })

      // Remove markers for drivers that are no longer active
      Object.keys(driverMarkers.value).forEach((driverId) => {
        const stillActive = newData.find(d => d.id === parseInt(driverId))
        if (!stillActive) {
          driverMarkers.value[driverId].marker.setMap(null)
          if (driverPolylines.value[driverId]) {
            driverPolylines.value[driverId].setMap(null)
          }
          delete driverMarkers.value[driverId]
          delete driverPolylines.value[driverId]
        }
      })
    } catch (error) {
      console.error('Error updating all drivers:', error)
      // Si hay error 429, detener actualizaciones
      if (error.response && error.response.status === 429) {
        console.warn('Too many requests, stopping all drivers updates')
        stopAllDriversUpdates()
      }
    }
  }, 15000)
}

/**
 * Stop all drivers updates
 */
function stopAllDriversUpdates () {
  if (allDriversInterval.value) {
    clearInterval(allDriversInterval.value)
    allDriversInterval.value = null
  }

  // Clear markers
  Object.values(driverMarkers.value).forEach(({ marker }) => {
    marker.setMap(null)
  })
  driverMarkers.value = {}

  // Clear polylines
  Object.values(driverPolylines.value).forEach((polyline) => {
    polyline.setMap(null)
  })
  driverPolylines.value = {}
}

// Watch for all drivers dialog close to stop updates
watch(showAllDriversMap, (newVal) => {
  if (!newVal) {
    stopAllDriversUpdates()
  }
})

</script>

<style>

.board-command {
  overflow-x: auto;
  display: flex;
}

.column-command {
  width: 350px;
  overflow-y: auto;
}

/* Estilos para grid de archivos adjuntos */
.invoice-files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 12px;
  max-height: 250px;
  overflow-y: auto;
  padding: 4px;
}

.invoice-file-item {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.invoice-file-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.invoice-file-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.invoice-file-image {
  width: 100%;
  height: 100%;
}

.invoice-file-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.invoice-file-item:hover .invoice-file-overlay {
  opacity: 1;
}

.invoice-file-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.invoice-pdf-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 8px;
  padding: 12px;
  gap: 8px;
}

.invoice-pdf-name {
  font-size: 9px;
  font-weight: 500;
  color: #616161;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Scrollbar para el grid */
.invoice-files-grid::-webkit-scrollbar {
  width: 6px;
}

.invoice-files-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.invoice-files-grid::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 3px;
}

.invoice-files-grid::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}

/* ===== TRELLO BOARD STYLES ===== */
.trello-board {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  min-height: 100vh;
  padding: 0;
}

@media (max-width: 1023px) {
  .trello-board {
    padding-bottom: 80px;
  }
}

.board-header {
  background: white;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

/* Bulk Actions Toolbar */
.sticky-tabs {
  position: sticky;
  top: 56px;
  z-index: 98;
  background: white;
  margin-bottom: 8px;
}

.bulk-actions-toolbar {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  position: sticky;
  top: 0; /* Ahora se pega al borde superior o debajo del navbar directamente */
  z-index: 99; /* Mayor que sticky-tabs para superponerse si es necesario */
}

/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Selected card highlight */
.selected-card {
  border: 2px solid #1976d2 !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  background: #e3f2fd !important;
}

/* Filters Card Styles */
.filters-card {
  width: 500px;
  max-width: 80vw;
  background: #fafafa;
}

.filters-header {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.filters-content {
  background: #fafafa;
  padding: 24px;
}

.filters-footer {
  background: white;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}

.filter-group {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.filter-group:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #424242;
}

.trello-columns {
  display: flex;
  gap: 16px;
  padding: 20px;
  overflow-x: auto;
  height: calc(100vh - 80px);
  align-items: flex-start;
}

.trello-column {
  min-width: 320px;
  max-width: 320px;
  background: #f1f3f5;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: calc(100vh - 120px);
}

.trello-column.full-width {
  min-width: 100%;
  max-width: 100%;
  max-height: none;
}

.trello-column.full-width .cards-container {
  max-height: none;
  overflow-y: visible;
}

/* Grid de 2 columnas para tablets */
@media (min-width: 600px) and (max-width: 1023px) {
  .trello-column.full-width .cards-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    align-items: start;
  }

  .trello-column.full-width .cards-container .order-card {
    margin-bottom: 0;
  }
}

.column-header {
  padding: 16px;
  background: white;
  border-radius: 12px 12px 0 0;
  border-bottom: 2px solid #e9ecef;
}

.cards-container {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
  min-height: 100px;
  max-height: calc(100vh - 240px);
}

.cards-container::-webkit-scrollbar {
  width: 6px;
}

.cards-container::-webkit-scrollbar-track {
  background: transparent;
}

.cards-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.order-card {
  margin-bottom: 12px;
  border-radius: 10px;
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.order-card:active {
  cursor: grabbing;
}

.ghost-card {
  opacity: 0.5;
  background: #e3f2fd;
  border: 2px dashed #1976d2;
}

.card-header {
  padding: 12px;
  border-bottom: 1px solid #f1f3f5;
}

.card-products {
  padding: 12px;
  background: #fafbfc;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f1f3f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.product-info span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.card-footer {
  padding: 12px;
  background: white;
  border-top: 1px solid #f1f3f5;
}

.delivery-assignment {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px 8px;
  margin-bottom: 8px;
}

.delivery-select {
  font-size: 12px;
}

.column-footer {
  padding: 12px;
  text-align: center;
  background: white;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e9ecef;
}

/* Status Timeline Styles */
.status-timeline {
  position: relative;
  padding-left: 0;
}

.status-step {
  position: relative;
  display: flex;
  gap: 16px;
  padding-bottom: 24px;
}

.status-step.is-last {
  padding-bottom: 0;
}

.status-line {
  position: absolute;
  left: 19px;
  top: 40px;
  bottom: -24px;
  width: 2px;
  background: #e0e0e0;
}

.status-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1;
}

.status-content {
  flex: 1;
  padding-top: 4px;
}

.status-duration {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #f5f5f5;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.status-duration::before {
  content: '⏱️';
  margin-right: 4px;
}

/* Map Container - Responsive Heights */
.map-container {
  height: calc(100vh - 200px);
}

@media (max-width: 599px) {
  /* Mobile - More space for footer */
  .map-container {
    height: calc(100vh - 280px);
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  /* Tablet */
  .map-container {
    height: calc(100vh - 220px);
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  .map-container {
    height: calc(100vh - 180px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .trello-column {
    min-width: 280px;
    max-width: 280px;
  }

  .board-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

</style>
