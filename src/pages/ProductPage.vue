<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Barra de herramientas mejorada -->
      <div class="col-12">
        <!-- Diseño para móvil -->
        <div class="row q-gutter-sm items-center lt-sm q-mb-sm">
          <q-btn
            id="tour-btn-agregar"
            color="primary"
            @click="openAddProductDialog"
            icon="add_circle"
            round
            size="md"
            class="shadow-2"
          >
            <q-tooltip>Agregar Producto</q-tooltip>
          </q-btn>

          <q-btn
            id="tour-btn-filtrar"
            color="primary"
            @click="dialogFilter = true"
            icon="filter_alt"
            round
            outline
            size="md"
            class="shadow-1"
          >
            <q-tooltip>Filtrar</q-tooltip>
          </q-btn>

          <q-space />

          <!-- Botones de acciones masivas (cuando hay selección) -->
          <q-btn
            v-if="selection.length"
            color="positive"
            @click="openMassiveStockDialog"
            icon="add"
            round
            size="md"
            class="shadow-2"
          >
            <q-tooltip>Agregar stock</q-tooltip>
          </q-btn>

          <q-btn
            v-if="selection.length"
            color="negative"
            @click="deleteMassive"
            icon="delete"
            round
            size="md"
            class="shadow-2"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>

          <!-- Menú de más opciones -->
          <q-btn
            id="tour-btn-mas-opciones"
            ref="moreOptionsBtn"
            color="primary"
            icon="more_vert"
            round
            outline
            size="md"
            class="shadow-1"
          >
            <q-menu>
              <q-list>
                <q-item
                  id="tour-btn-seleccionar-multiples"
                  clickable
                  v-close-popup
                  @click="toggleMultipleSelection"
                >
                  <q-item-section avatar>
                    <q-icon :name="multipleSelected ? 'check_box' : 'check_box_outline_blank'" color="blue" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Seleccionar múltiples</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  id="tour-btn-codigos-qr"
                  clickable
                  v-close-popup
                  @click="openQrDialog"
                >
                  <q-item-section avatar>
                    <q-icon name="qr_code" color="teal" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Códigos QR</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  id="tour-btn-lista-precios"
                  clickable
                  v-close-popup
                  @click="listPriceDialog = true"
                >
                  <q-item-section avatar>
                    <q-icon name="list" color="purple" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Modificar lista de precios</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  clickable
                  v-close-popup
                  @click="openAiImageDialog"
                >
                  <q-item-section avatar>
                    <q-icon name="auto_awesome" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Generar imágenes con IA</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  id="tour-btn-exportar"
                  clickable
                  v-close-popup
                  @click="download"
                >
                  <q-item-section avatar>
                    <q-icon name="download" color="secondary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Exportar Excel</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="importDialog = true"
                >
                  <q-item-section avatar>
                    <q-icon name="upload" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Importar Excel</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator v-if="userSession.is_root" />

                <q-item
                  clickable
                  v-close-popup
                  @click="openCompaniesDialog"
                  v-if="userSession.is_root"
                >
                  <q-item-section avatar>
                    <q-icon name="content_copy" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Copiar a empresas</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <!-- Diseño para desktop -->
        <div class="row q-gutter-sm items-center gt-xs q-mb-sm">
          <!-- Botones principales (siempre visibles) -->
          <q-btn
            id="tour-btn-agregar-desktop"
            color="primary"
            @click="openAddProductDialog"
            icon="add_circle"
            label="Agregar Producto"
            unelevated
            class="shadow-2"
          />

          <q-btn
            id="tour-btn-filtrar-desktop"
            color="primary"
            @click="dialogFilter = true"
            icon="filter_alt"
            label="Filtrar"
            outline
            class="shadow-1"
          />

          <q-space />

          <!-- Botones de acciones masivas (cuando hay selección) -->
          <q-btn
            v-if="selection.length"
            color="positive"
            @click="openMassiveStockDialog"
            icon="add"
            label="Agregar stock"
            unelevated
            class="shadow-2"
          />

          <q-btn
            v-if="selection.length"
            color="negative"
            @click="deleteMassive"
            icon="delete"
            label="Eliminar"
            unelevated
            class="shadow-2"
          />

          <!-- Menú de más opciones -->
          <q-btn
            id="tour-btn-mas-opciones-desktop"
            ref="moreOptionsBtnDesktop"
            color="primary"
            icon="more_vert"
            label="Más opciones"
            outline
            class="shadow-1"
          >
            <q-menu>
              <q-list>
                <q-item
                  id="tour-btn-seleccionar-multiples-desktop"
                  clickable
                  v-close-popup
                  @click="toggleMultipleSelection"
                >
                  <q-item-section avatar>
                    <q-icon :name="multipleSelected ? 'check_box' : 'check_box_outline_blank'" color="blue" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Seleccionar múltiples</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  id="tour-btn-codigos-qr-desktop"
                  clickable
                  v-close-popup
                  @click="openQrDialog"
                >
                  <q-item-section avatar>
                    <q-icon name="qr_code" color="teal" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Códigos QR</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  id="tour-btn-lista-precios-desktop"
                  clickable
                  v-close-popup
                  @click="listPriceDialog = true"
                >
                  <q-item-section avatar>
                    <q-icon name="list" color="purple" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Modificar lista de precios</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  clickable
                  v-close-popup
                  @click="openAiImageDialog"
                >
                  <q-item-section avatar>
                    <q-icon name="auto_awesome" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Generar imágenes con IA</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  id="tour-btn-exportar-desktop"
                  clickable
                  v-close-popup
                  @click="download"
                >
                  <q-item-section avatar>
                    <q-icon name="download" color="secondary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Exportar Excel</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="importDialog = true"
                >
                  <q-item-section avatar>
                    <q-icon name="upload" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Importar Excel</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator v-if="$q.screen.gt.sm" />

                <q-item
                  clickable
                  v-close-popup
                  @click="columnDialog = true"
                  v-if="$q.screen.gt.sm"
                >
                  <q-item-section avatar>
                    <q-icon name="view_column" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Mostrar/Ocultar columnas</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator v-if="userSession.is_root" />

                <q-item
                  clickable
                  v-close-popup
                  @click="openCompaniesDialog"
                  v-if="userSession.is_root"
                >
                  <q-item-section avatar>
                    <q-icon name="content_copy" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Copiar a empresas</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <!-- Selection mode banner -->
      <div v-if="multipleSelected" class="col-12">
        <q-card flat class="bg-blue-1 text-primary q-pa-md" style="border-radius: 12px; border: 1px solid #90caf9;">
          <div class="row items-center q-gutter-sm">
            <q-icon name="check_circle" color="primary" size="24px" />
            <div class="col text-weight-medium">
              Modo de selección activo
              <span v-if="selection.length > 0" class="text-weight-bold">
                ({{ selection.length }})
              </span>
            </div>
            <q-btn flat round dense icon="close" color="primary" size="sm" @click="toggleMultipleSelection" style="box-shadow: none !important;"/>
          </div>
        </q-card>
      </div>

      <div class="col-12">
        <q-table
          id="tour-tabla-productos"
          title="Productos"
          row-key="id"
          :columns="visibleColumns"
          :rows="products"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          :selection="multipleSelected ? 'multiple' : 'none'"
          v-model:selected="selection"
          v-model:pagination="paginationConfig"
          @row-click="editProduct"
          @request="setPagination"
          no-data-label="Registro no encontrado"
          :grid="$q.screen.lt.md"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top-right>
            <q-input clearable filled dense debounce="800" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
              <q-card
                class="cursor-pointer q-hoverable no-shadow transition-all"
                :class="{ 'selected-card': isProductSelected(props.row) }"
                style="border-radius: 16px; border: 1px solid #eef0f3"
                @click="handleCardClick(props.row)"
                :id="props.rowIndex === 0 ? 'tour-first-product-card' : ''"
              >
                <span class="q-focus-helper"></span>

                <q-card-section class="row justify-between items-start compact-card-header">
                  <div class="col-9" style="max-width: 70%">
                    <div class="text-caption text-grey-5 text-uppercase text-weight-bold">{{ props.row.barcode || 'Sin código' }}</div>
                    <div class="text-indigo-10 text-weight-bold text-body1 ellipsis" style="font-size: 1.1rem; letter-spacing: -0.5px">{{ props.row.name }}</div>
                    <div class="row q-gutter-xs q-mt-xs">
                      <q-badge
                        v-if="props.row.show_catalog"
                        color="positive"
                        label="Catálogo"
                        class="q-py-xs q-px-sm text-weight-bold shadow-1"
                        rounded
                        style="font-size: 10px; letter-spacing: 0.5px"
                      />
                      <q-badge
                        v-if="props.row.is_bundle"
                        color="orange-8"
                        label="Pack"
                        class="q-py-xs q-px-sm text-weight-bold shadow-1"
                        rounded
                        style="font-size: 10px; letter-spacing: 0.5px"
                      />
                      <q-badge
                        v-if="props.row.is_addons"
                        color="indigo-7"
                        label="Adicional"
                        class="q-py-xs q-px-sm text-weight-bold shadow-1"
                        rounded
                        style="font-size: 10px; letter-spacing: 0.5px"
                      />
                    </div>
                  </div>
                  <div class="col-3 text-right">
                    <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Stock</div>
                    <div class="text-body2 text-grey-8">{{ props.row.is_bundle ? formatNumber(props.row.bundle_stock) : formatNumber(props.row.normal_stock) }}</div>
                  </div>
                </q-card-section>

                <q-separator color="grey-2" inset />

                <q-card-section class="compact-card-body">
                  <div class="row q-col-gutter-y-sm">
                    <div class="col-6">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Categoría</div>
                      <div class="text-body1 text-grey-9 text-weight-bold ellipsis">{{ props.row.category?.name || '-' }}</div>
                    </div>
                    <div class="col-6 text-right">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold">Precio</div>
                      <div class="text-h6 text-primary text-weight-bolder" style="letter-spacing: -0.5px">{{ formatNumber(props.row.price) }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </div>
    </div>

    <q-dialog v-model="openEditProduct" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :style="$q.screen.lt.sm ? '' : 'width: 1200px; max-width: 95vw;'"
        :class="$q.screen.lt.sm ? 'column full-height' : ''"
      >
        <q-card-section class="row items-center bg-primary text-white q-py-sm col-auto">
          <div class="text-h6">Modificar producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form
          @submit="saveEdit"
          :class="$q.screen.lt.sm ? 'col column' : ''"
        >
          <q-tabs
            v-model="tab"
            class="text-grey col-auto"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="basicData" label="Datos básicos" />
            <q-tab name="stock" label="Stock" v-if="!product.is_bundle"/>
            <q-tab name="product" label="Combo / Pack" v-if="product.is_bundle" />
            <q-tab name="recipe" label="Receta (Ingredientes)" v-if="isRecipeType && !isProduct"/>
          </q-tabs>

          <q-separator />

          <q-tab-panels
            v-model="tab"
            animated
            :class="$q.screen.lt.sm ? 'col scroll' : 'scroll'"
            :style="$q.screen.lt.sm ? '' : 'max-height: calc(100vh - 240px);'"
          >
            <q-tab-panel name="basicData">
              <div class="row q-col-gutter-md">
                <div class="row col-md-7 col-xs-12 col-sm-12">
                  <!-- Datos básicos -->
                  <div class="col-12">
                    <q-card flat bordered class="q-pa-md q-mb-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="info" class="q-mr-sm" />
                        Datos básicos
                      </div>
                      <div class="row q-col-gutter-md">
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-input
                            id="tour-edit-barcode"
                            filled
                            v-model="product.barcode"
                            autofocus
                            label="Código de barra"
                            dense
                            hide-bottom-space
                            @keyup.enter="getOneProduct(product.barcode)"
                          >
                            <template v-slot:append v-if="$q.platform.is.nativeMobile">
                              <q-icon name="qr_code_scanner" size="sm" class="cursor-pointer" @click.stop="startScanner" />
                            </template>
                          </q-input>
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-input
                            id="tour-edit-nombre"
                            :rules="[val => !!val || 'El campo es requerido.']"
                            filled
                            v-model="product.name"
                            label="Nombre"
                            dense
                            hide-bottom-space
                          />
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-select
                            id="tour-edit-categoria"
                            use-input
                            filled
                            label="Categoría"
                            input-debounce="0"
                            option-label="name"
                            option-value="id"
                            v-model="category"
                            :options="categories"
                            :rules="[val => !!val || 'El campo es requerido.']"
                            @filter="filterCategories"
                            @update:model-value="setCategory"
                            dense
                            hide-bottom-space
                          />
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-select
                            filled
                            dense
                            v-model="unitOfMeasure"
                            :options="unitOfMeasures"
                            option-label="name"
                            option-value="id"
                            label="Unidad de Medida"
                            :rules="[val => !!val || 'Requerido']"
                            hide-bottom-space
                          />
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-input
                            filled
                            dense
                            v-model.number="product.base_quantity"
                            label="Cantidad de la unidad"
                            type="number"
                            step="0.01"
                            min="0.01"
                            hide-bottom-space
                            hint="Cantidad del producto en gramos o mililitros"
                          />
                        </div>
                        <div class="col-12">
                          <q-input
                            filled
                            v-model="product.description"
                            type="textarea"
                            autogrow
                            label="Descripción"
                            dense
                            hide-bottom-space
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>

                  <!-- Precios -->
                  <div class="col-12">
                    <q-card flat bordered class="q-pa-md q-mb-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="attach_money" class="q-mr-sm" />
                        Precios
                      </div>
                      <div class="row q-col-gutter-md">
                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                          <q-input
                            :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                            filled
                            v-model="product.cost"
                            label="Costo"
                            type="number"
                            dense
                            hide-bottom-space
                            @update:model-value="updateCost"
                          />
                        </div>
                        <div class="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-xs-12">
                          <q-input
                            :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                            filled
                            v-model="profitPercentageDisplay"
                            label="Margen %"
                            dense
                            hide-bottom-space
                            class="profit-percentage-input"
                            inputmode="numeric"
                            @update:model-value="handleProfitPercentageInput"
                            @focus="initializeProfitPercentage"
                          />
                        </div>
                        <div class="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-xs-12">
                          <q-input
                            :rules="[val => !!val || 'El campo es requerido.']"
                            filled
                            v-model="product.price"
                            label="Precio base"
                            type="number"
                            step=".00"
                            dense
                            hide-bottom-space
                            @update:model-value="updatePrice"
                          />
                        </div>
                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                          <q-input
                            filled
                            v-model="product.minimum_stock"
                            label="Stock mínimo"
                            type="number"
                            step=".00"
                            dense
                            hide-bottom-space
                          />
                        </div>
                      </div>

                      <!-- Lista de precios adicionales -->
                      <div class="q-mb-md">
                        <div class="flex items-center justify-between q-mb-sm">
                          <span class="text-body1 text-weight-medium">Listas de precios adicionales</span>
                          <q-btn
                            color="positive"
                            icon="add"
                            label="Agregar lista"
                            size="sm"
                            @click="addPriceList"
                            unelevated
                          />
                        </div>

                        <div v-if="priceLists.length === 0" class="text-center q-pa-md text-grey-6">
                          <q-icon name="list_alt" size="2rem" class="q-mb-sm" />
                          <div>No hay listas de precios adicionales</div>
                        </div>

                        <q-card
                          v-for="(priceList, index) in priceLists"
                          :key="index"
                          class="q-mb-sm q-pa-none"
                        >
                          <q-card-section class="q-pa-md">
                            <div class="row q-gutter-x-md items-star">
                              <div class="col">
                                <q-input
                                  v-model="priceList.name"
                                  label="Nombre de la lista"
                                  filled
                                  dense
                                  :rules="[val => !!val || 'El precio mínimo es 3']"
                                />
                              </div>
                              <div class="col">
                                <q-input
                                v-model="priceList.profitPercentageDisplay"
                                label="Margen"
                                filled
                                dense
                                class="profit-percentage-input"
                                inputmode="numeric"
                                @update:model-value="val => handlePriceListMarginInput(val, priceList)"
                                @focus="initializePriceListMargin(priceList)"
                                />
                              </div>
                              <div class="col">
                                <q-input
                                  v-model="priceList.price"
                                  label="Precio"
                                  type="number"
                                  step=".01"
                                  :rules="[val => val >= 1 || 'El precio mínimo es 3']"
                                  filled
                                  dense
                                  @update:model-value="calculatePriceListMargin(priceList)"
                                />
                              </div>
                              <div class="col-auto q-pb-xs">
                                <q-btn
                                  icon="delete"
                                  color="negative"
                                  round
                                  flat
                                  @click="removePriceList(index)"
                                >
                                  <q-tooltip>Eliminar lista</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>

                      <div class="row q-col-gutter-md">
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-select
                            use-input
                            filled
                            label="Iva (%)"
                            input-debounce="0"
                            option-label="Desc"
                            option-value="id"
                            v-model="product.aliquot_type"
                            :options="aliquotTypes"
                            @filter="getAliquotTypes"
                            dense
                            hide-bottom-space
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>
                </div>

                <!-- Sección de imágenes -->
                <div class="col-md-5 col-xs-12 col-sm-12">
                  <q-card flat bordered class="q-pa-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="image" class="q-mr-sm" />
                      Imágenes
                    </div>
                    <q-card
                      flat
                      bordered
                      class="dropzone-card q-mb-md"
                      :class="{ 'dropzone-active': isDragOver }"
                      @dragover.prevent="isDragOver = true"
                      @dragleave.prevent="isDragOver = false"
                      @drop.prevent="handleDrop"
                    >
                      <q-card-section class="text-center q-pa-xl q-gutter-y-md">
                        <!-- Image Preview Grid -->
                        <div class="col-12" v-if="product.images.length">
                          <div class="text-subtitle2 text-primary q-mb-md">Vista Previa</div>
                          <div class="row q-col-gutter-md scroll q-pa-sm" style="max-height: 400px;">
                            <div
                              v-for="(image, index) in product.images"
                              :key="index"
                              class="col-6 col-sm-4 col-md-4"
                            >
                              <q-card flat class="image-preview-card cursor-pointer" @click="openImageViewer(index)">
                                <q-img
                                  :src="image.url"
                                  :ratio="1"
                                  class="rounded-borders"
                                >
                                  <div class="absolute-top-right bg-transparent">
                                    <q-btn
                                      size="sm"
                                      icon="close"
                                      color="negative"
                                      round
                                      dense
                                      @click.stop="deleteImage(image, index)"
                                    />
                                  </div>
                                  <div class="absolute-bottom text-center bg-transparent">
                                    <q-icon name="zoom_in" color="white" size="sm" />
                                  </div>
                                </q-img>
                              </q-card>
                            </div>
                          </div>
                        </div>
                        <div v-else>
                          <q-icon name="cloud_upload" size="4rem" color="grey-5" class="q-mb-md" />
                          <div class="text-h6 text-grey-7 q-mb-sm">
                            Arrastra las imágenes aquí
                          </div>
                          <div class="text-body2 text-grey-5 q-mb-md">
                            o haz clic para seleccionar archivos
                          </div>
                        </div>
                        <div class="row q-gutter-sm justify-center">
                          <q-btn
                            color="primary"
                            label="Seleccionar Imágenes"
                            icon="upload"
                            @click="$refs.fileInput.click()"
                            unelevated
                          />
                          <q-btn
                            color="orange"
                            label="Generar con IA"
                            icon="auto_awesome"
                            @click="generateSingleProductImage"
                            unelevated
                            :loading="generatingSingleImage"
                          />
                        </div>
                        <input
                          ref="fileInput"
                          type="file"
                          multiple
                          accept="image/*"
                          style="display: none"
                          @change="handleFileSelect"
                        />
                      </q-card-section>
                    </q-card>
                    <q-card flat bordered class="q-pa-md q-mb-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="settings" class="q-mr-sm" />
                        Configuración
                      </div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12">
                          <q-select
                            filled
                            v-model="product.product_type"
                            :options="productTypeOptions"
                            label="Tipo de Producto"
                            emit-value
                            map-options
                            dense
                            hide-bottom-space
                            :rules="[val => !!val || 'Requerido']"
                          >
                             <template v-slot:option="scope">
                              <q-item v-bind="scope.itemProps">
                                <q-item-section>
                                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                                </q-item-section>
                              </q-item>
                            </template>
                          </q-select>
                        </div>
                      </div>
                      <div class="row q-col-gutter-md">
                        <div class="col-6">
                          <q-toggle
                            v-model="product.skip_stock"
                            label="Facturar sin stock"
                            :true-value="1"
                            :false-value="0"
                            color="positive"
                          />
                        </div>
                        <div class="col-6">
                          <q-toggle
                            v-model="product.is_bundle"
                            label="Pack"
                            :true-value="1"
                            :false-value="0"
                            color="positive"
                          />
                        </div>
                        <div class="col-6">
                          <q-toggle
                            v-model="product.is_addons"
                            label="Es un adicional"
                            :true-value="1"
                            :false-value="0"
                            color="positive"
                          />
                        </div>
                        <div class="col-6">
                          <q-toggle
                            v-model="product.show_catalog"
                            label="Mostrar en catálogo"
                            :true-value="1"
                            :false-value="0"
                            color="positive"
                          />
                        </div>
                      </div>
                      <div
                        class="q-mt-md"
                        v-if="product.is_addons"
                      >
                        <q-select
                          use-input
                          filled
                          label="Productos a asociar"
                          input-debounce="0"
                          option-label="name"
                          option-value="id"
                          multiple
                          v-model="addonsProducts"
                          :options="addonsProductsOptions"
                          :rules="[val => !!val || 'El campo es requerido.']"
                          @filter="filterProductsAddons"
                          dense
                        />
                      </div>
                    </q-card>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel name="stock">
              <stock-product :product="product"/>
            </q-tab-panel>
            <q-tab-panel name="product">
              <pack-product :product="product"/>
            </q-tab-panel>
            <q-tab-panel name="recipe">
              <recipe-product :product="product"/>
            </q-tab-panel>
          </q-tab-panels>
          <q-card-actions align="right" class="col-auto q-pa-md">
            <q-btn color="negative" label="Eliminar" @click="deleteProduct" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddProduct" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :style="$q.screen.lt.sm ? '' : 'width: 1200px; max-width: 95vw;'"
        :class="$q.screen.lt.sm ? 'column full-height' : ''"
      >
        <q-card-section class="row items-center q-py-sm bg-primary text-white col-auto">
          <div class="text-h6">Agregar producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form
          @submit="saveProduct"
          ref="formAddProduct"
          :class="$q.screen.lt.sm ? 'col column' : ''"
        >
            <q-card-section
            :class="$q.screen.lt.sm ? 'col scroll' : 'scroll'"
            :style="$q.screen.lt.sm ? '' : 'height: calc(100vh - 200px);'"
          >
            <div class="row q-col-gutter-md">
              <div class="row col-md-7 col-xs-12 col-sm-12">
                <!-- Datos básicos -->
                <div class="col-12">
                  <q-card flat bordered class="q-pa-md q-mb-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="info" class="q-mr-sm" />
                      Datos básicos
                    </div>
                    <div class="row q-col-gutter-md">
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-input
                            id="tour-add-barcode"
                            filled
                            v-model="product.barcode"
                            autofocus
                            label="Código de barra"
                            dense
                            hide-bottom-space
                            @keyup.enter="getOneProduct(product.barcode)"
                          >
                            <template v-slot:append v-if="$q.platform.is.nativeMobile">
                              <q-icon name="qr_code_scanner" size="sm" class="cursor-pointer" @click.stop="startScanner" />
                            </template>
                          </q-input>
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-input
                            id="tour-add-nombre"
                            :rules="[val => !!val || 'El campo es requerido.']"
                            filled
                            v-model="product.name"
                            label="Nombre"
                            dense
                            hide-bottom-space
                          />
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-select
                            id="tour-add-categoria"
                            use-input
                            filled
                            label="Categoría"
                            input-debounce="500"
                            option-label="name"
                            option-value="id"
                            v-model="category"
                            :options="categories"
                            :rules="[val => !!val || 'El campo es requerido.']"
                            @filter="filterCategories"
                            @update:model-value="setCategory"
                            dense
                            hide-bottom-space
                          />
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                            <q-select
                              filled
                              v-model="product.product_type"
                              :options="productTypeOptions"
                              label="Tipo de Producto"
                              emit-value
                              map-options
                              dense
                              hide-bottom-space
                              :rules="[val => !!val || 'Requerido']"
                            >
                               <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                            </q-select>
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-select
                            filled
                            dense
                            v-model="unitOfMeasure"
                            :options="unitOfMeasures"
                            option-label="name"
                            option-value="id"
                            label="Unidad de Medida"
                            hide-bottom-space
                            :rules="[val => !!val || 'Requerido']"
                          />
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-input
                            filled
                            dense
                            v-model.number="product.base_quantity"
                            label="Cantidad de la unidad"
                            type="number"
                            step="0.01"
                            min="0.01"
                            hide-bottom-space
                            hint="Cantidad del producto en gramos o mililitros"
                          />
                        </div>
                        <div class="col-12">
                          <q-input
                            filled
                            v-model="product.description"
                            type="textarea"
                            autogrow
                            label="Descripción"
                            dense
                            hide-bottom-space
                          />
                        </div>
                    </div>
                  </q-card>
                </div>

                <!-- Precios -->
                <div class="col-12">
                  <q-card flat bordered class="q-pa-md q-mb-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="attach_money" class="q-mr-sm" />
                      Precios
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                        <q-input
                          :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                          filled
                          v-model="product.cost"
                          label="Costo"
                          type="number"
                          dense
                          hide-bottom-space
                          @update:model-value="updateCost"
                        />
                      </div>
                      <div class="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-xs-12">
                        <q-input
                          :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                          filled
                          v-model="profitPercentageDisplay"
                          label="Margen %"
                          dense
                          hide-bottom-space
                          class="profit-percentage-input"
                          inputmode="numeric"
                          @update:model-value="handleProfitPercentageInput"
                          @focus="initializeProfitPercentage"
                        />
                      </div>
                      <div class="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-xs-12">
                        <q-input
                          :rules="[val => !!val || 'El campo es requerido.']"
                          filled
                          v-model="product.price"
                          label="Precio base"
                          type="number"
                          step=".00"
                          dense
                          hide-bottom-space
                          @update:model-value="updatePrice"
                        />
                      </div>
                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                        <q-input
                          filled
                          v-model="product.minimum_stock"
                          label="Stock mínimo"
                          type="number"
                          step=".00"
                          dense
                          hide-bottom-space
                        />
                      </div>
                    </div>

                    <!-- Lista de precios adicionales -->
                    <div class="q-mb-md">
                      <div class="flex items-center justify-between q-mb-sm">
                        <span class="text-body1 text-weight-medium">Listas de precios adicionales</span>
                        <q-btn
                          color="positive"
                          icon="add"
                          label="Agregar lista"
                          size="sm"
                          @click="addPriceList"
                          unelevated
                        />
                      </div>

                      <div v-if="priceLists.length === 0" class="text-center q-pa-md text-grey-6">
                        <q-icon name="list_alt" size="2rem" class="q-mb-sm" />
                        <div>No hay listas de precios adicionales</div>
                      </div>

                        <q-card
                          v-for="(priceList, index) in priceLists"
                          :key="index"
                          class="q-mb-sm q-pa-none"
                        >
                          <q-card-section class="q-pa-md">
                            <div class="row q-gutter-x-md items-star">
                              <div class="col">
                                <q-input
                                  v-model="priceList.name"
                                  label="Nombre de la lista"
                                  filled
                                  dense
                                  :rules="[val => !!val || 'El precio mínimo es 3']"
                                />
                              </div>
                              <div class="col">
                                <q-input
                                v-model="priceList.profitPercentageDisplay"
                                label="Margen"
                                filled
                                dense
                                class="profit-percentage-input"
                                inputmode="numeric"
                                @update:model-value="val => handlePriceListMarginInput(val, priceList)"
                                @focus="initializePriceListMargin(priceList)"
                              />
                              </div>
                              <div class="col">
                                <q-input
                                  v-model="priceList.price"
                                  label="Precio"
                                  type="number"
                                  step=".01"
                                  :rules="[val => val >= 1 || 'El precio mínimo es 3']"
                                  filled
                                  dense
                                  @update:model-value="calculatePriceListMargin(priceList)"
                                />
                              </div>
                              <div class="col-auto q-pb-xs">
                                <q-btn
                                  icon="delete"
                                  color="negative"
                                  round
                                  flat
                                  @click="removePriceList(index)"
                                >
                                  <q-tooltip>Eliminar lista</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                    </div>

                    <div class="row q-col-gutter-md">
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-select
                          use-input
                          filled
                          label="Iva (%)"
                          input-debounce="0"
                          option-label="Desc"
                          option-value="id"
                          v-model="product.aliquot_type"
                          :options="aliquotTypes"
                          @filter="getAliquotTypes"
                          dense
                          hide-bottom-space
                        />
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>

              <!-- Sección de imágenes -->
              <div class="col-md-5 col-xs-12 col-sm-12">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                    <q-icon name="image" class="q-mr-sm" />
                    Imágenes
                  </div>
                  <q-card
                    flat
                    bordered
                    class="dropzone-card q-mb-md"
                    :class="{ 'dropzone-active': isDragOver }"
                    @dragover.prevent="isDragOver = true"
                    @dragleave.prevent="isDragOver = false"
                    @drop.prevent="handleDrop"
                  >
                    <q-card-section class="text-center q-pa-xl q-gutter-y-md">
                      <!-- Image Preview Grid -->
                      <div class="col-12" v-if="product.images.length">
                        <div class="text-subtitle2 text-primary q-mb-md">Vista Previa</div>
                        <div class="row q-col-gutter-md scroll q-pa-sm" style="max-height: 400px;">
                          <div
                            v-for="(image, index) in product.images"
                            :key="index"
                            class="col-6 col-sm-4 col-md-4"
                          >
                            <q-card flat class="image-preview-card">
                              <q-img
                                :src="image.url"
                                :ratio="1"
                                class="rounded-borders"
                              >
                                <div class="absolute-top-right bg-transparent">
                                  <q-btn
                                    size="sm"
                                    icon="close"
                                    color="negative"
                                    round
                                    dense
                                    @click="deleteImage(image, index)"
                                  />
                                </div>
                              </q-img>
                            </q-card>
                          </div>
                        </div>
                      </div>
                      <div v-else>
                        <q-icon name="cloud_upload" size="4rem" color="grey-5" class="q-mb-md" />
                        <div class="text-h6 text-grey-7 q-mb-sm">
                          Arrastra las imágenes aquí
                        </div>
                        <div class="text-body2 text-grey-5 q-mb-md">
                          o haz clic para seleccionar archivos
                        </div>
                      </div>
                      <q-btn
                        color="primary"
                        label="Seleccionar Imágenes"
                        @click="$refs.fileInput.click()"
                        unelevated
                      />
                      <input
                        ref="fileInput"
                        type="file"
                        multiple
                        accept="image/*"
                        style="display: none"
                        @change="handleFileSelect"
                      />
                    </q-card-section>
                  </q-card>
                  <q-card flat bordered class="q-pa-md q-mb-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="settings" class="q-mr-sm" />
                      Configuración
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <q-toggle
                          v-model="product.skip_stock"
                          label="Facturar sin stock"
                          :true-value="1"
                          :false-value="0"
                          color="positive"
                        />
                      </div>
                      <div class="col-6">
                        <q-toggle
                          v-model="product.is_bundle"
                          label="Pack"
                          :true-value="1"
                          :false-value="0"
                          color="positive"
                        />
                      </div>
                      <div class="col-6">
                        <q-toggle
                          v-model="product.is_addons"
                          label="Es un adicional"
                          :true-value="1"
                          :false-value="0"
                          color="positive"
                        />
                      </div>
                      <div class="col-6">
                        <q-toggle
                          v-model="product.show_catalog"
                          label="Mostrar en catálogo"
                          :true-value="1"
                          :false-value="0"
                          color="positive"
                        />
                      </div>
                    </div>
                    <div
                      class="q-mt-md"
                      v-if="product.is_addons"
                    >
                      <q-select
                        use-input
                        filled
                        label="Productos a asociar"
                        input-debounce="0"
                        option-label="name"
                        option-value="id"
                        multiple
                        v-model="addonsProducts"
                        :options="addonsProductsOptions"
                        :rules="[val => !!val || 'El campo es requerido.']"
                        @filter="filterProductsAddons"
                        dense
                      />
                    </div>
                  </q-card>
                </q-card>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md col-auto">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible" unelevated />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="companiesDialog" persistent>
      <q-card>
        <q-card-section class="flex justify-between items-center bg-primary text-white">
          <div class="text-h6">Compañías</div>
          <q-btn icon="close" flat round dense @click="companiesDialog = false" />
        </q-card-section>

        <q-card-section style="max-height: 50vh" class="scroll">
          <q-card v-for="org in companies" :key="org.id" class="q-mt-sm cursor-pointer q-py-sm">
            <q-item>
              <q-item-section avatar>
                <q-img alt="logo" :src="org.url || logo.white"/>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-subtitle1">
                  {{ org.name }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="company" :val="org.id"></q-radio>
              </q-item-section>
            </q-item>
          </q-card>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Copiar productos" color="primary" @click="copyProducts" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="massiveStockDialog" persistent>
      <q-card style="width: 400px; max-width: 90vw;">
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <div class="text-h6">Agregar stock masivo</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="massiveStockDialog = false" />
        </q-card-section>
        <q-card-section>
          <div class="q-mb-md">
            Seleccionados: {{ selection.length }} productos
          </div>
          <q-input
            v-model.number="massiveStockQuantity"
            type="number"
            min="1"
            label="Cantidad de stock a sumar"
            filled
            dense
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn color="secondary" label="Cancelar" flat @click="massiveStockDialog = false" />
          <q-btn color="primary" label="Confirmar" @click="confirmMassiveStock" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="dialogFilter"
      :position="$q.screen.lt.sm ? 'standard' : 'right'"
      :seamless="!$q.screen.lt.sm"
      :maximized="$q.screen.lt.sm"
    >
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column' : ''"
        :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 500px; max-width: 80vw;'"
      >
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
            @click="dialogFilter = false"
          />
        </q-card-section>

        <q-card-section
          :class="$q.screen.lt.sm ? 'col scroll q-pt-sm' : 'q-pt-sm scroll'"
          :style="$q.screen.lt.sm ? '' : 'max-height: calc(100vh - 200px);'"
        >
          <div class="column q-gutter-y-md">

            <!-- Filtros de texto -->
            <div>
              <div class="text-subtitle2 text-grey-7 q-mb-sm">
                <q-icon name="search" size="xs" class="q-mr-xs" />
                Búsqueda
              </div>
              <q-input
                v-model="filters.name"
                label="Nombre"
                filled
                dense
                clearable
              />
            </div>

            <q-input
              v-model="filters.description"
              label="Descripción"
              filled
              dense
              clearable
            />

            <q-input
              v-model="filters.barcode"
              label="Código de Barra"
              filled
              dense
              clearable
            />

            <q-separator />

            <!-- Filtros de selección -->
            <div>
              <div class="text-subtitle2 text-grey-7 q-mb-sm">
                <q-icon name="category" size="xs" class="q-mr-xs" />
                Clasificación
              </div>
              <q-select
                dense
                use-input
                filled
                label="Categoría"
                input-debounce="500"
                option-value="id"
                option-label="name"
                clearable
                multiple
                v-model="filters.category_id"
                :options="categories"
                @filter="filterCategories"
              />
            </div>

            <q-select
              dense
              use-input
              filled
              label="Unidad de Medida"
              input-debounce="0"
              option-value="id"
              option-label="name"
              clearable
              v-model="filters.measurement_unit_id"
              :options="measurementUnits"
              @filter="filterMeasurementUnits"
            />

            <q-separator />

            <!-- Filtros de opciones (con radio) -->
            <div>
              <div class="text-subtitle2 text-grey-7 q-mb-sm">
                <q-icon name="tune" size="xs" class="q-mr-xs" />
                Opciones
              </div>

              <div class="q-mb-md">
                <div class="text-body2 q-mb-xs">¿Es pack?</div>
                <q-option-group
                  v-model="filters.is_pack"
                  :options="[
                    { label: 'Todos', value: null },
                    { label: 'Sí', value: 1 },
                    { label: 'No', value: 0 }
                  ]"
                  color="primary"
                  inline
                  dense
                />
              </div>

              <div class="q-mb-md">
                <div class="text-body2 q-mb-xs">¿Es adicional?</div>
                <q-option-group
                  v-model="filters.is_addon"
                  :options="[
                    { label: 'Todos', value: null },
                    { label: 'Sí', value: 1 },
                    { label: 'No', value: 0 }
                  ]"
                  color="primary"
                  inline
                  dense
                />
              </div>

              <div class="q-mb-md">
                <div class="text-body2 q-mb-xs">¿Se muestra en catálogo?</div>
                <q-option-group
                  v-model="filters.show_in_catalog"
                  :options="[
                    { label: 'Todos', value: null },
                    { label: 'Sí', value: 1 },
                    { label: 'No', value: 0 }
                  ]"
                  color="primary"
                  inline
                  dense
                />
              </div>
            </div>

          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="secondary"
            label="Limpiar"
            @click="clearFilter"
          />
          <q-btn
            color="negative"
            label="Cerrar"
            @click="dialogFilter = false"
          />
          <q-btn
            color="primary"
            label="Aplicar"
            @click="filterProducts"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <OnboardingValidationModal
      v-model="showValidationModal"
      type="category"
      page="product"
      @action="goToCategories"
    />

    <!-- Diálogo de columnas -->
    <q-dialog v-model="columnDialog" position="right" seamless>
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section class="bg-info text-white row items-center justify-between">
          <div class="text-h6">
            <q-icon name="view_column" class="q-mr-sm" />
            Columnas visibles
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="columnDialog = false"
          />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-body2 text-grey-7 q-mb-md">
            Selecciona las columnas que deseas ver en la tabla
          </div>

          <q-list>
            <q-item
              v-for="col in columns"
              :key="col.name"
              tag="label"
              dense
            >
              <q-item-section avatar>
                <q-checkbox
                  v-model="visibleColumnNames"
                  :val="col.name"
                  color="primary"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ col.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="secondary"
            label="Todas"
            @click="selectAllColumns"
            flat
          />
          <q-btn
            color="primary"
            label="Cerrar"
            @click="columnDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de importación -->
    <q-dialog v-model="importDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card class="import-dialog-card" style="width: 550px; max-width: 90vw; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <q-card-section class="import-dialog-header q-pa-lg">
          <div class="row items-center justify-between">
            <div>
              <div class="text-h5 text-weight-medium q-mb-xs">
                <q-icon name="upload_file" size="28px" class="q-mr-sm" style="vertical-align: middle;" />
                Importar Productos
              </div>
              <div class="text-caption opacity-70">Carga masiva desde Excel</div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeImportDialog"
              class="import-close-btn"
            />
          </div>
        </q-card-section>

        <!-- Content -->
        <q-card-section class="q-pa-lg">
          <!-- Step 1: Download Template -->
          <div class="import-step q-mb-lg">
            <div class="row items-center q-mb-md">
              <div class="import-step-number">1</div>
              <div class="text-subtitle1 text-weight-medium">Descarga la plantilla</div>
            </div>
            <q-btn
              unelevated
              color="primary"
              icon="download"
              label="Descargar Plantilla Excel"
              @click="downloadTemplate"
              class="full-width"
              style="border-radius: 8px;"
              size="md"
            />
          </div>

          <!-- Step 2: Upload File -->
          <div class="import-step q-mb-lg">
            <div class="row items-center q-mb-md">
              <div class="import-step-number">2</div>
              <div class="text-subtitle1 text-weight-medium">Sube tu archivo</div>
            </div>

            <!-- Dropzone -->
            <div
              class="import-dropzone"
              :class="{ 'dropzone-active': isDragging, 'dropzone-has-file': importFile }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInput"
                type="file"
                accept=".xlsx,.xls"
                @change="handleImportFileSelect"
                style="display: none;"
              />

              <div v-if="!importFile" class="dropzone-content">
                <q-icon name="cloud_upload" size="48px" color="primary" class="q-mb-md" />
                <div class="text-h6 text-weight-medium q-mb-xs">
                  Arrastra tu archivo aquí
                </div>
                <div class="text-body2 text-grey-7 q-mb-md">
                  o haz clic para seleccionar
                </div>
                <div class="text-caption text-grey-6">
                  Formatos: .xlsx, .xls • Máx. 10MB
                </div>
              </div>

              <div v-else class="dropzone-file-info">
                <div class="row items-center">
                  <q-icon name="description" size="40px" color="positive" class="q-mr-md" />
                  <div class="col">
                    <div class="text-subtitle1 text-weight-medium">
                      {{ importFile.name }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ formatFileSize(importFile.size) }}
                    </div>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    color="grey-7"
                    @click.stop="removeFile"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <transition name="fade">
            <div v-if="importSuccess" class="import-success-banner q-mb-md">
              <q-icon name="check_circle" size="24px" class="q-mr-sm" />
              <div>
                <div class="text-weight-medium">{{ importSuccessMessage }}</div>
              </div>
            </div>
          </transition>

          <!-- Error Messages -->
          <transition name="fade">
            <div v-if="importErrors.length > 0" class="import-error-banner q-mb-md">
              <div class="row items-start">
                <q-icon name="error" size="24px" class="q-mr-sm" />
                <div class="col">
                  <div class="text-weight-medium q-mb-xs">Errores encontrados:</div>
                  <div class="import-error-list">
                    <div v-for="(error, index) in importErrors" :key="index" class="import-error-item">
                      {{ error }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </q-card-section>

        <!-- Actions -->
        <q-card-actions class="q-pa-lg q-pt-none">
          <q-btn
            flat
            label="Cancelar"
            @click="closeImportDialog"
            color="grey-8"
            class="q-px-lg"
            style="border-radius: 8px;"
          />
          <q-space />
          <q-btn
            unelevated
            color="positive"
            label="Importar"
            @click="importProducts"
            :disable="!importFile"
            :loading="importLoading"
            icon-right="upload"
            class="q-px-xl"
            style="border-radius: 8px;"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <bulk-price-dialog
      :modelValue="listPriceDialog"
      :products="selection.length > 0 ? selection : 'all'"
      @updated="handleBulkPriceUpdate"
      @close="listPriceDialog = false"
    />

    <!-- QR Dialog -->
    <q-dialog v-model="qrDialog" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :style="$q.screen.lt.sm ? '' : 'width: 900px; max-width: 95vw;'"
        :class="$q.screen.lt.sm ? 'column full-height' : ''"
      >
        <q-card-section class="row items-center bg-teal text-white q-py-sm col-auto">
          <q-icon name="qr_code" size="sm" class="q-mr-sm" />
          <div class="text-h6">Códigos QR de Productos</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeQrDialog" />
        </q-card-section>

        <q-card-section
          v-if="!qrCodes.length"
          :class="$q.screen.lt.sm ? 'col scroll flex flex-center' : ''"
        >
          <div class="text-center q-pa-lg">
            <q-icon name="qr_code_scanner" size="4rem" color="grey-5" class="q-mb-md" />
            <div class="text-h6 text-grey-7 q-mb-sm">
              Selecciona productos para generar QR
            </div>
            <div class="text-body2 text-grey-6">
              Puedes seleccionar productos específicos o generar QR para todos
            </div>
          </div>
        </q-card-section>

        <q-card-section
          v-else
          :class="$q.screen.lt.sm ? 'col scroll' : 'scroll'"
          :style="$q.screen.lt.sm ? '' : 'max-height: 60vh;'"
        >
          <div class="row q-col-gutter-md">
            <div
              v-for="qr in qrCodes"
              :key="qr.product_id"
              class="col-xs-12 col-sm-6 col-md-4"
            >
              <q-card flat bordered class="q-pa-md text-center" style="border-radius: 12px;">
                <div class="text-subtitle2 text-weight-bold q-mb-sm text-primary">
                  {{ qr.product_name }}
                </div>
                <div class="text-caption text-grey-7 q-mb-sm" v-if="qr.barcode">
                  Código: {{ qr.barcode }}
                </div>
                <q-img
                  :src="`data:image/png;base64,${qr.qr_code}`"
                  style="max-width: 200px; margin: 0 auto;"
                  class="q-mb-md"
                />
                <div class="q-gutter-sm">
                  <q-btn
                    size="sm"
                    color="positive"
                    icon="download"
                    label="Descargar"
                    @click="downloadQr(qr)"
                    unelevated
                  />
                  <q-btn
                    size="sm"
                    color="green"
                    icon="share"
                    label="WhatsApp"
                    @click="shareQrWhatsApp(qr)"
                    unelevated
                  />
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-gutter-sm col-auto bg-white">
          <q-btn
            color="secondary"
            label="Cerrar"
            @click="closeQrDialog"
            v-if="qrCodes.length"
            flat
          />
          <q-btn
            color="green"
            label="Compartir PDF"
            icon="share"
            @click="shareAllQrAsPdf"
            :loading="loadingPdf"
            v-if="qrCodes.length"
            unelevated
          />
          <q-btn
            color="orange"
            label="Descargar PDF"
            icon="picture_as_pdf"
            @click="downloadAllQrAsPdf"
            :loading="loadingPdf"
            v-if="qrCodes.length"
            unelevated
          />
          <q-btn
            color="teal"
            label="Generar QR seleccionados"
            icon="qr_code"
            @click="generateQrSelected"
            :loading="loadingQr"
            :disable="!selection.length"
            v-if="!qrCodes.length"
            unelevated
          />
          <q-btn
            color="teal"
            label="Generar QR de todos"
            icon="qr_code"
            @click="generateQrAll"
            :loading="loadingQr"
            v-if="!qrCodes.length"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Tour Overlay -->
    <!-- Tour System (Teleported to body for Z-Index supremacy) -->
    <teleport to="body">
      <template v-if="showTour">
        <!-- Layer 1: Dark Overlay & Spotlight (Z-Index ~2B) -->
        <div class="tour-overlay">
          <div class="tour-spotlight" :style="spotlightStyle"></div>
        </div>

        <!-- Layer 3: Tour Card (Z-Index MAX ~2.14B) - Separated from overlay to beat highlighted element -->
        <q-card class="tour-card" :style="tourCardStyle">
          <q-card-section class="tour-header">
            <div class="tour-step-indicator">Paso {{ currentTourStep + 1 }} de {{ currentTourSteps.length }}</div>
            <q-btn flat round dense icon="close" @click="skipTour" color="white" size="sm" />
          </q-card-section>
          <q-card-section>
            <div class="tour-title">{{ currentTourSteps[currentTourStep]?.title }}</div>
            <div class="tour-description">{{ currentTourSteps[currentTourStep]?.description }}</div>
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn
              flat
              label="Anterior"
              @click="previousTourStep"
              :disable="currentTourStep === 0"
              color="grey-7"
            />
            <q-btn
              flat
              label="Saltar tour"
              @click="skipTour"
              color="grey-7"
            />
            <q-btn
              unelevated
              :label="currentTourStep === currentTourSteps.length - 1 ? 'Finalizar' : 'Siguiente'"
              @click="nextTourStep"
              color="primary"
            />
          </q-card-actions>
        </q-card>
      </template>
    </teleport>

    <!-- Notificación flotante de descarga -->
    <transition name="slide-up">
      <div v-if="loadingDownload > 0" class="download-notification">
        <q-card flat class="download-card">
          <q-card-section class="row items-center q-pa-sm">
            <q-icon name="download" color="secondary" size="24px" class="q-mr-sm" />
            <div class="col">
              <div class="text-body2 text-weight-medium">Exportando productos...</div>
              <q-linear-progress
                :value="loadingDownload"
                color="secondary"
                class="q-mt-xs"
                rounded
                size="4px"
              />
            </div>
            <div class="text-caption text-grey-7 q-ml-sm">
              {{ Math.round(loadingDownload * 100) }}%
            </div>
          </q-card-section>
        </q-card>
      </div>
    </transition>

    <!-- Visor de imágenes profesional -->
    <q-dialog v-model="imageViewerDialog" @hide="closeImageViewer" maximized transition-show="fade" transition-hide="fade">
      <div class="image-viewer-container">
        <!-- Close button -->
        <q-btn
          icon="close"
          flat
          round
          size="lg"
          color="white"
          class="image-viewer-close"
          @click="closeImageViewer"
        >
          <q-tooltip>Cerrar (ESC)</q-tooltip>
        </q-btn>

        <!-- Image counter -->
        <div class="image-viewer-counter" v-if="product.images.length > 1">
          {{ currentImageIndex + 1 }} / {{ product.images.length }}
        </div>

        <!-- Main image -->
        <div class="image-viewer-main">
          <q-img
            :src="product.images[currentImageIndex]?.url"
            fit="contain"
            class="image-viewer-img"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center text-white">
                <q-icon name="broken_image" size="64px" />
              </div>
            </template>
          </q-img>
        </div>

        <!-- Navigation arrows (only if multiple images) -->
        <template v-if="product.images.length > 1">
          <q-btn
            icon="chevron_left"
            flat
            round
            size="xl"
            color="white"
            class="image-viewer-nav image-viewer-nav-left"
            @click="previousImage"
            :disable="currentImageIndex === 0"
          >
            <q-tooltip>Anterior</q-tooltip>
          </q-btn>

          <q-btn
            icon="chevron_right"
            flat
            round
            size="xl"
            color="white"
            class="image-viewer-nav image-viewer-nav-right"
            @click="nextImage"
            :disable="currentImageIndex === product.images.length - 1"
          >
            <q-tooltip>Siguiente</q-tooltip>
          </q-btn>
        </template>

        <!-- Thumbnails (only if multiple images) -->
        <div class="image-viewer-thumbnails" v-if="product.images.length > 1">
          <div
            v-for="(image, index) in product.images"
            :key="index"
            class="image-viewer-thumbnail"
            :class="{ 'active': index === currentImageIndex }"
            @click="currentImageIndex = index"
          >
            <q-img :src="image.url" :ratio="1" />
          </div>
        </div>
      </div>
    </q-dialog>

    <!-- Diálogo de generación de imágenes con IA -->
    <q-dialog v-model="aiImageDialog" persistent>
      <q-card style="min-width: 400px; max-width: 500px;">
        <q-card-section class="bg-orange text-white">
          <div class="text-h6">
            <q-icon name="auto_awesome" size="24px" class="q-mr-sm" />
            Generar Imágenes con IA
          </div>
        </q-card-section>

        <q-card-section v-if="!aiImageLoading">
          <div class="text-body1 q-mb-md">
            Selecciona qué productos deseas procesar:
          </div>

          <q-option-group
            v-model="aiImageOption"
            :options="[
              { label: `Productos seleccionados (${selection.length})`, value: 'selected', disable: selection.length === 0 },
              { label: 'Todos los productos sin imágenes', value: 'all_without_images' }
            ]"
            color="orange"
          />

          <q-banner class="bg-info text-white q-mt-md">
            <template v-slot:avatar>
              <q-icon name="info" />
            </template>
            La IA generará imágenes profesionales basadas en el nombre y descripción de cada producto.
          </q-banner>
        </q-card-section>

        <q-card-section v-if="aiImageLoading">
          <div class="text-center q-mb-md">
            <q-icon name="auto_awesome" size="64px" color="orange" class="rotating" />
          </div>

          <div class="text-h6 text-center q-mb-sm">
            Generando imágenes...
          </div>

          <div class="text-body2 text-center text-grey-7 q-mb-md">
            {{ aiImageProgress.current }}
          </div>

          <q-linear-progress
            :value="aiImageProgress.total > 0 ? aiImageProgress.processed / aiImageProgress.total : 0"
            color="orange"
            size="12px"
            class="q-mb-sm"
          />

          <div class="row justify-between text-caption text-grey-7">
            <div>
              Procesados: {{ aiImageProgress.processed }} / {{ aiImageProgress.total }}
            </div>
            <div>
              {{ Math.round((aiImageProgress.processed / aiImageProgress.total) * 100) }}%
            </div>
          </div>

          <div v-if="aiImageProgress.failed > 0" class="text-caption text-negative q-mt-sm">
            Fallidos: {{ aiImageProgress.failed }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Cancelar"
            flat
            @click="closeAiImageDialog"
            :disable="aiImageLoading"
          />
          <q-btn
            label="Generar"
            color="orange"
            @click="generateAiImages"
            :loading="aiImageLoading"
            :disable="aiImageLoading || (aiImageOption === 'selected' && selection.length === 0)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <DemoPersuasionModal v-model="showDemoModal" />
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { Notify } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import StockProduct from 'src/components/Product/StockProduct.vue'
import RecipeProduct from 'src/components/Product/RecipeProduct.vue'
import PackProduct from 'src/components/Product/PackProduct.vue'
import OnboardingValidationModal from 'src/components/Onboarding/OnboardingValidationModal.vue'
import { getDownload } from 'src/const/services'
import { formatNumber, loading, notify } from 'src/const/mixins'
import BulkPriceDialog from 'src/components/Product/BulkPriceDialog.vue'
import eventBus from 'src/utils/eventBus'
import { api } from 'boot/axios'
import { useDemoPersuasion } from 'src/composables/useDemoPersuasion'
import DemoPersuasionModal from 'src/components/DemoPersuasionModal.vue'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner'
export default {
  components: { StockProduct, BulkPriceDialog, OnboardingValidationModal, RecipeProduct, PackProduct, DemoPersuasionModal },
  setup () {
    const { showDemoModal, trackDemoAction } = useDemoPersuasion()
    return { showDemoModal, trackDemoAction }
  },
  data () {
    return {
      qrDialog: false,
      showValidationModal: false,
      qrCodes: [],
      loadingQr: false,
      loadingPdf: false,
      originalProduct: null,
      listPriceDialog: false,
      dialogFilter: false,
      columnDialog: false,
      importDialog: false,
      importFile: null,
      importLoading: false,
      importErrors: [],
      importSuccess: false,
      importSuccessMessage: '',
      isDragging: false,
      visibleColumnNames: ['barcode', 'name', 'category', 'show_catalog', 'cost', 'price', 'stock'],
      filters: {
        name: null,
        description: null,
        barcode: null,
        category_id: null,
        measurement_unit_id: null,
        is_pack: null,
        is_addon: null,
        show_in_catalog: null
      },
      priceLists: [],
      productImage: null,
      companiesDialog: false,
      companies: [],
      multipleSelected: false,
      products: [],
      selection: [],
      massiveStockDialog: false,
      massiveStockQuantity: null,
      isDragOver: false,
      aiImageDialog: false,
      aiImageLoading: false,
      aiImageOption: 'all_without_images',
      aiImageProgress: {
        total: 0,
        processed: 0,
        failed: 0,
        current: ''
      },
      generatingSingleImage: false,
      imageViewerDialog: false,
      currentImageIndex: 0,
      company: null,
      addonsProducts: [],
      addonsProductsOptions: [],
      tab: 'basicData',
      unitOfMeasures: [],
      unitOfMeasure: null,
      product: {
        is_bundle: 0,
        show_catalog: 0,
        is_addons: 0,
        skip_stock: 0,
        profit_percentage: 0,
        images: [],
        product_type: 'PRODUCT',
        base_quantity: 1
      },
      productTypeOptions: [
        { label: 'Producto', value: 'PRODUCT', description: 'Producto para venta' },
        { label: 'Materia Prima', value: 'RAW_MATERIAL', description: 'Insumo básico para recetas' },
        { label: 'Sub-receta', value: 'SUB_RECIPE', description: 'Producto intermedio fabricado' },
        { label: 'Receta', value: 'FINISHED_GOOD', description: 'Receta para fabricar un producto' }
      ],
      // Decimal input formatting for profit percentage
      profitPercentageValue: 0, // Internal value in centésimas (0.01 = 1)
      profitPercentageDisplay: '0',
      // Flags para evitar cálculos cíclicos
      isUpdatingFromMargin: false,
      isUpdatingFromPrice: false,
      isUpdatingFromCost: false,
      categories: [],
      imageUrl: null,
      aliquotTypes: [],
      category: null,
      filter: '',
      /**
       * Params search
       * @type {Object}
       */
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 1,
        stock: true,
        withStock: true,
        dataSearch: {
          id: '',
          barcode: '',
          name: '',
          'category.name': ''
        }
      },
      visible: false,
      openAddProduct: false,
      openEditProduct: null,
      loadingDownload: 0,
      columns: [
        {
          name: 'barcode',
          align: 'left',
          label: 'Código de barra',
          field: 'barcode',
          format: (val) => val ?? '-',
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
          name: 'category',
          align: 'left',
          label: 'Categoría',
          field: row => row?.category?.name || '-'
        },
        {
          name: 'show_catalog',
          align: 'left',
          label: 'Mostrar en catálogo',
          field: 'show_catalog',
          format: row => row ? 'Si' : 'No',
          sortable: true
        },
        {
          name: 'cost',
          align: 'right',
          label: 'Costo ($)',
          field: 'cost',
          format: (val) => formatNumber(val),
          sortable: true
        },
        {
          name: 'price',
          align: 'right',
          label: 'Precio ($)',
          field: 'price',
          format: (val) => formatNumber(val),
          sortable: true
        },
        {
          name: 'stock',
          align: 'right',
          label: 'Stock',
          field: row => row?.is_bundle ? formatNumber(row.bundle_stock) : formatNumber(row?.normal_stock)
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      // Tour System
      showTour: false,
      currentTourStep: 0,
      currentTourType: 'main',
      activeTourSteps: [],
      // Definición maestra de todos los pasos posibles con sus condiciones ideales
      allTourStepsDefinition: [
        // Pasos Desktop
        {
          target: '#tour-btn-agregar-desktop',
          title: '➕ Agregar Producto',
          description: 'Haz clic aquí para agregar un nuevo producto. Se abrirá un formulario completo con todos los campos necesarios.'
        },
        {
          target: '#tour-btn-filtrar-desktop',
          title: '🔍 Filtrar Productos',
          description: 'Filtra productos por categoría, precio, stock y más criterios para encontrar lo que necesitas.'
        },
        {
          target: '#tour-btn-mas-opciones-desktop',
          title: '⚙️ Más Opciones',
          description: 'Descubre opciones avanzadas como importación masiva, códigos QR y gestión de columnas.'
        },

        // Pasos Mobile
        {
          target: '#tour-btn-agregar',
          title: '➕ Agregar Producto',
          description: 'Toca aquí para agregar un nuevo producto de forma rápida.'
        },
        {
          target: '#tour-btn-filtrar',
          title: '🔍 Filtrar Productos',
          description: 'Filtra tus productos para encontrarlos más rápido.'
        },
        {
          target: '#tour-btn-mas-opciones',
          title: '⚙️ Más Opciones',
          description: 'Accede a herramientas adicionales como exportar datos o generar QRs.'
        },

        // Pasos Comunes / Condicionales
        {
          target: '#tour-tabla-productos',
          title: '📋 Tabla de Productos',
          description: 'Aquí se muestran todos tus productos con información clave.',
          excludeOnMobileTablet: true // Flag personalizado para excluir en tablet/mobile
        },
        {
          target: '#tour-tabla-productos tbody tr:first-child', // Desktop edit
          title: '✏️ Editar Producto',
          description: 'Haz clic en una fila para editar el producto.',
          excludeOnMobileTablet: true
        },
        {
          target: '#tour-first-product-card', // Mobile edit
          title: '✏️ Editar o Seleccionar',
          description: 'Toca una tarjeta para editar. Usa pulsación larga para más opciones.'
        }
      ],
      spotlightStyle: {},
      tourCardStyle: {}
    }
  },
  async mounted () {
    const isValid = await this.checkOnboardingStatus()
    if (isValid) {
      this.checkAndStartTour()
    }
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
    this.getUnitOfMeasures()

    // Listen for tour activation from navbar
    eventBus.on('activate-page-tour', (pageName) => {
      if (pageName === 'Product') {
        this.startMainTour()
      }
    })
  },
  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice']),
    /**
     * Get current tour steps
     */
    currentTourSteps () {
      return this.activeTourSteps
    },
    /**
     * Get visible columns based on user selection
     */
    visibleColumns () {
      return this.columns.filter(col => this.visibleColumnNames.includes(col.name))
    },
    isRecipeType () {
      return ['SUB_RECIPE', 'FINISHED_GOOD'].includes(this.product.product_type)
    },
    isProduct () {
      return ['PRODUCT'].includes(this.product.product_type)
    }
  },
  watch: {
    /**
     * Set pagination when branch office changes
     * @param {Object} value branch office
     */

    branchOffice (value) {
      this.setPagination({
        pagination: this.paginationConfig,
        filter: undefined
      })
    },
    openAddProduct (data) {
      this.tab = 'basicData'
      this.profitPercentageDisplay = 0
    },
    openEditProduct (data) {
      this.tab = 'basicData'
    },
    filter (data) {
      this.searchData(data)
    },
    category (data) {
      if (data) {
        this.product.category_id = data.id
      }
    },
    product (data) {
      this.category = data.category
    },
    unitOfMeasure (data) {
      this.product.unit_of_measure_id = data.id
    }
  },
  created () {
    this.getCategories()
    this.getMeasurementUnits()
  },
  methods: {
    formatNumber,
    async checkOnboardingStatus () {
      try {
        const isConfigured = this.userSession?.company_session?.company_config?.other?.configured
        if (isConfigured) {
          return true
        }
        const { data } = await api.get('/onboarding/tasks/status')
        if (data && data.tasks) {
          const categoryTask = data.tasks.find(t => t.route === 'Category')
          if (categoryTask && categoryTask.count === 0) {
            this.showValidationModal = true
            return false
          }
        }
        return true
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        return true // Fallback to allow tour if error
      }
    },
    goToCategories () {
      this.$router.push({ name: 'Category' })
    },
    /**
     * Toggle multiple selection mode
     */
    toggleMultipleSelection () {
      this.multipleSelected = !this.multipleSelected
      // Clear selection when disabling multiple selection
      if (!this.multipleSelected) {
        this.selection = []
      }
    },
    /**
     * Handle card click in mobile view
     */
    handleCardClick (product) {
      if (this.multipleSelected) {
        this.toggleProductSelection(product)
      } else {
        this.editProduct(null, product)
      }
    },
    /**
     * Check if product is selected
     */
    isProductSelected (product) {
      return this.selection.some(p => p.id === product.id)
    },
    /**
     * Toggle product selection
     */
    toggleProductSelection (product) {
      const index = this.selection.findIndex(p => p.id === product.id)
      if (index > -1) {
        this.selection.splice(index, 1)
      } else {
        this.selection.push(product)
      }
    },
    /**
     * Select all columns
     */
    selectAllColumns () {
      this.visibleColumnNames = this.columns.map(col => col.name)
    },
    /**
     * Download import template
     */
    async downloadTemplate () {
      try {
        const response = await this.$api.get('/products/download-import-template', {
          responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'plantilla-importar-productos.xlsx')
        document.body.appendChild(link)
        link.click()
        link.remove()

        notify('Plantilla descargada exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify('Error al descargar la plantilla', 'negative', 'error')
      }
    },
    /**
     * Import products from Excel
     */
    async importProducts () {
      if (!this.importFile) {
        notify('Por favor selecciona un archivo', 'warning', 'warning')
        return
      }

      this.importLoading = true
      this.importErrors = []
      this.importSuccess = false

      try {
        const formData = new FormData()
        formData.append('file', this.importFile)
        formData.append('branch_office_id', this.branchOffice.id)

        const response = await this.$api.post('/products/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        this.importSuccess = true
        this.importSuccessMessage = `${response.data.imported} productos importados exitosamente`

        if (response.data.errors && response.data.errors.length > 0) {
          this.importErrors = response.data.errors
        }

        notify(response.data.message, 'positive', 'check_circle')

        // Reload products after 2 seconds
        setTimeout(() => {
          this.setPagination({
            pagination: this.paginationConfig,
            filter: undefined
          })
          if (this.importErrors.length === 0) {
            this.closeImportDialog()
          }
        }, 2000)
      } catch (error) {
        notify(error?.message || 'Error al importar productos', 'negative', 'error')
        if (error?.errors) {
          this.importErrors = error.errors
        }
      } finally {
        this.importLoading = false
      }
    },
    /**
     * Close import dialog
     */
    closeImportDialog () {
      this.importDialog = false
      this.importFile = null
      this.importErrors = []
      this.importSuccess = false
      this.importSuccessMessage = ''
      this.isDragging = false
    },
    /**
     * Trigger file input click
     */
    triggerFileInput () {
      this.$refs.fileInput.click()
    },
    /**
     * Handle file selection from input for import
     */
    handleImportFileSelect (event) {
      const file = event.target.files[0]
      if (file) {
        this.validateAndSetFile(file)
      }
    },
    /**
     * Handle file drop
     */
    handleFileDrop (event) {
      this.isDragging = false
      const file = event.dataTransfer.files[0]
      if (file) {
        this.validateAndSetFile(file)
      }
    },
    /**
     * Validate and set file
     */
    validateAndSetFile (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!validTypes.includes(file.type)) {
        notify('Por favor selecciona un archivo Excel válido (.xlsx o .xls)', 'negative', 'error')
        return
      }

      if (file.size > maxSize) {
        notify('El archivo es demasiado grande. Máximo 10MB', 'negative', 'error')
        return
      }

      this.importFile = file
    },
    /**
     * Remove selected file
     */
    removeFile () {
      this.importFile = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    /**
     * Format file size
     */
    formatFileSize (bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    /**
     * Create deep clone of product
     * @param {Object} product - Product to clone
     * @returns {Object} - Cloned product
     */
    deepCloneProduct (product) {
      // Crear una copia profunda del producto
      const cloned = JSON.parse(JSON.stringify(product))

      // Manejar propiedades especiales que no se clonan bien con JSON
      if (product.images) {
        cloned.images = product.images.map(img => ({
          ...img,
          // Preservar objetos File si existen
          image: img.image instanceof File ? img.image : img.image
        }))
      }

      return cloned
    },
    updateProfitPercentage (newVal) {
      if (newVal && this.product.cost > 0) {
        const price = this.product.cost * (1 + newVal / 100)
        this.product.price = parseFloat(price.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0])
      }
    },
    formatProfitPercentage () {
      this.profitPercentageDisplay = (this.profitPercentageValue / 100).toFixed(2)
      this.product.profit_percentage = this.profitPercentageValue / 100

      // Solo calcular precio si hay un costo válido
      if (this.product.cost > 0) {
        this.isUpdatingFromMargin = true
        if (this.product.profit_percentage === 0) {
          // Si el margen es 0, el precio es igual al costo
          this.product.price = parseFloat(this.product.cost)
        } else {
          // Calcular precio con el margen
          this.product.price = parseFloat((this.product.cost * (1 + this.product.profit_percentage / 100)).toFixed(2))
        }
        this.$nextTick(() => {
          this.isUpdatingFromMargin = false
        })
      }
    },
    handleProfitPercentageInput (val) {
      if (this.isUpdatingFromPrice) return
      // Extraer solo dígitos de la cadena recibida
      const digits = val.replace(/\D/g, '')
      this.profitPercentageValue = digits ? parseInt(digits) : 0
      this.formatProfitPercentage()
    },
    initializeProfitPercentage () {
      const profitPercentage = parseFloat(this.product.profit_percentage || 0)
      this.profitPercentageValue = Math.max(0, Math.round(profitPercentage * 100))
      this.profitPercentageDisplay = (this.profitPercentageValue / 100).toFixed(2)
    },

    initializePriceListMargin (priceList) {
      const profitPercentage = parseFloat(priceList.profit_percentage || 0)
      priceList.profitPercentageValue = Math.max(0, Math.round(profitPercentage * 100))
      this.formatPriceListMargin(priceList)
    },

    handlePriceListMarginInput (val, priceList) {
      // Extraer solo dígitos
      const digits = val.replace(/\D/g, '')
      priceList.profitPercentageValue = digits ? parseInt(digits) : 0
      
      this.formatPriceListMargin(priceList)
    },

    formatPriceListMargin (priceList) {
      const displayValue = ((priceList.profitPercentageValue || 0) / 100).toFixed(2)
      priceList.profitPercentageDisplay = displayValue
      priceList.profit_percentage = parseFloat(displayValue)

      // Calcular precio solo si hay costo válido
      const basePrice = parseFloat(this.product.cost)
      if (!isNaN(basePrice) && basePrice > 0) {
        const newPrice = basePrice * (1 + priceList.profit_percentage / 100)
        priceList.price = parseFloat(newPrice.toFixed(2))
      }
    },
    updatePrice (newVal) {
      // Evitar recalcular si el precio está siendo actualizado desde margen o costo
      if (this.isUpdatingFromMargin || this.isUpdatingFromCost) {
        return
      }

      // Solo calcular margen si el usuario cambió el precio manualmente
      if (newVal && this.product.cost > 0) {
        this.isUpdatingFromPrice = true
        const margin = ((newVal - this.product.cost) / this.product.cost) * 100
        this.product.profit_percentage = Number(margin.toFixed(4))
        // Actualizar display del margen
        this.profitPercentageValue = Math.round(this.product.profit_percentage * 100)
        this.profitPercentageDisplay = parseFloat(this.product.profit_percentage || 0).toFixed(2)
        this.$nextTick(() => {
          this.isUpdatingFromPrice = false
        })
      }
    },
    updateCost (newVal) {
      // Evitar recalcular si el costo está siendo actualizado desde precio
      if (this.isUpdatingFromPrice) {
        return
      }

      // Mantener el margen constante y recalcular el precio basado en el nuevo costo
      if (newVal && newVal > 0) {
        this.isUpdatingFromCost = true
        // Usar el margen existente para calcular el nuevo precio principal
        const currentMargin = parseFloat(this.product.profit_percentage || 0)

        if (currentMargin === 0) {
          // Si el margen es 0, el precio es igual al costo
          this.product.price = parseFloat(newVal)
        } else {
          // Calcular precio con el margen existente
          this.product.price = parseFloat((newVal * (1 + currentMargin / 100)).toFixed(2))
        }

        // También actualizar los precios de las listas de precios manteniendo sus márgenes
        this.priceLists.forEach(priceList => {
          if (priceList.profit_percentage != null) {
            const listMargin = parseFloat(priceList.profit_percentage || 0)
            if (listMargin === 0) {
              priceList.price = parseFloat(newVal)
            } else {
              priceList.price = parseFloat((newVal * (1 + listMargin / 100)).toFixed(2))
            }
          }
        })

        this.$nextTick(() => {
          this.isUpdatingFromCost = false
        })
      } else {
        // Si costo es 0, mantener el margen pero resetear solo el precio
        // El margen se preserva para no perder la configuración
        this.isUpdatingFromCost = true
        this.product.price = 0

        // También resetear solo los precios de las listas, manteniendo sus márgenes
        this.priceLists.forEach(priceList => {
          priceList.price = 0
        })

        this.$nextTick(() => {
          this.isUpdatingFromCost = false
        })
      }
    },

    calculatePriceListMargin (priceList) {
      const basePrice = parseFloat(this.product.cost)
      const listPrice = parseFloat(priceList.price)

      if (!isNaN(basePrice) && !isNaN(listPrice) && basePrice > 0) {
        const margin = ((listPrice - basePrice) / basePrice) * 100
        priceList.profit_percentage = parseFloat(margin.toFixed(2))
        priceList.profitPercentageValue = Math.round(margin * 100)
        priceList.profitPercentageDisplay = margin.toFixed(2)
      }
      // No calcular precio automáticamente desde aquí
    },

    /**
     * Start scanner
     */
    async startScanner () {
      try {
        const result = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.ALL,
          scanInstructions: 'Escanear código',
          scanButton: false,
          scanText: 'Scan',
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
          android: {
            scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.ZXING
          }
        })
        this.getOneProduct(result.ScanResult)
      } catch (error) {
        if (error instanceof Error) {
          // notify(error.message, 'negative', 'warning')
        } else {
          notify('Error al escanear el código', 'negative', 'warning')
        }
      }
    },
    addPriceList () {
      this.priceLists.push({
        name: `Lista ${this.priceLists.length + 1}`,
        price: null,
        profit_percentage: 0,
        profitPercentageValue: 0,
        profitPercentageDisplay: '0.00'
      })
    },

    filterProducts () {
      this.params.dataSearch = {}

      const dataEqualFilter = {}
      const dataSearch = {}
      const whereIn = { category_id: [] }

      if (this.filters.name) dataSearch.name = this.filters.name
      if (this.filters.description) dataSearch.description = this.filters.description
      if (this.filters.barcode) dataSearch.barcode = this.filters.barcode

      if (this.filters?.category_id?.length > 0) whereIn.category_id = this.filters?.category_id?.map(category => category.id)
      if (this.filters.measurement_unit_id) dataEqualFilter.unit_of_measure_id = this.filters.measurement_unit_id.id
      if (this.filters.is_pack !== null) dataEqualFilter.is_bundle = this.filters.is_pack.value
      if (this.filters.is_addon !== null) dataEqualFilter.is_addons = this.filters.is_addon.value
      if (this.filters.show_in_catalog !== null) {
        dataEqualFilter.show_catalog = this.filters.show_in_catalog.value === 1
      }

      this.params.dataEqualFilter = dataEqualFilter
      this.params.dataSearch = dataSearch
      this.params.whereIn = whereIn

      this.getProducts(this.params)
      this.dialogFilter = false
    },

    clearFilter () {
      this.filters = {
        name: null,
        description: null,
        barcode: null,
        category_id: null,
        measurement_unit_id: null,
        is_pack: null,
        is_addon: null,
        show_in_catalog: null,
        product_type: 'PRODUCT'
      }

      // Limpiar completamente los parámetros de filtro antes de recargar
      this.params.dataSearch = {}
      this.params.dataEqualFilter = {}

      this.getProducts(this.params)
      this.dialogFilter = false
    },

    filterCategories (value, update) {
      this.$api.get('categories', {
        params: {
          paginate: false,
          branch_office_id: this.branchOffice?.id,
          dataSearch: { name: value }
        }
      }).then(({ data }) => {
        update(() => {
          this.categories = data
        })
      })
    },

    getCategories (value = '') {
      this.$api.get('categories', {
        params: {
          paginate: false,
          branch_office_id: this.branchOffice?.id,
          dataSearch: { name: value }
        }
      }).then(({ data }) => {
        this.categories = data
      })
    },

    getMeasurementUnits (value = '') {
      this.$api.get('unit-of-measures', {
        params: {
          paginate: false,
          dataSearch: { name: value }
        }
      }).then(({ data }) => {
        this.measurementUnits = data
      })
    },

    filterMeasurementUnits (value, update) {
      this.$api.get('unit-of-measures', {
        params: {
          paginate: false,
          dataSearch: { name: value }
        }
      }).then(({ data }) => {
        update(() => {
          this.measurementUnits = data
        })
      })
    },

    handleBulkPriceUpdate () {
      this.listPriceDialog = false
      this.getProducts(this.params)
    },

    removePriceList (index) {
      this.$q.dialog({
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que deseas eliminar esta lista de precios?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.priceLists.splice(index, 1)
      })
    },
    /**
     * Delete massive product
     */
    deleteMassive () {
      this.$q.dialog({
        title: 'Eliminar productos',
        message: '¿Está seguro de eliminar los productos seleccionados?',
        persistent: true,
        cancel: {
          color: 'negative',
          flat: true,
          label: 'Cancelar'
        },
        ok: {
          color: 'primary',
          label: 'Aceptar'
        }
      }).onOk(async () => {
        try {
          const ids = this.selection.map(item => item.id)
          await this.$api.post('products/delete-massive', { ids })
          notify('Productos eliminados exitosamente', 'positive', 'info')
          this.getProducts(this.params)
          this.selection = []
        } catch (error) {
          notify(error.message, 'negative', 'warning')
        }
      })
    },
    openMassiveStockDialog () {
      if (!this.selection.length) {
        notify('Selecciona al menos un producto', 'warning', 'warning')
        return
      }
      this.massiveStockQuantity = null
      this.massiveStockDialog = true
    },
    async confirmMassiveStock () {
      if (!this.massiveStockQuantity || this.massiveStockQuantity <= 0) {
        notify('La cantidad debe ser mayor a 0', 'warning', 'warning')
        return
      }
      try {
        loading(true)
        const productIds = this.selection.map(item => item.id)
        await this.$api.post('massive-stock', {
          product_ids: productIds,
          quantity: this.massiveStockQuantity,
          branch_office_id: this.branchOffice?.id
        })
        notify('Stock actualizado exitosamente', 'positive', 'info')
        this.massiveStockDialog = false
        this.selection = []
        this.getProducts(this.params)
      } catch (error) {
        notify(error.message || 'Error al actualizar el stock', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Open companies dialog
     */
    openCompaniesDialog () {
      this.companiesDialog = true
      this.getAllCompanies()
    },
    /**
     * Get one product
     * @param {Number} barcode barcode product
     * @returns {Promise<void>}
     */
    async getOneProduct (barcode) {
      try {
        const { data } = await this.$api.get('products', {
          params: {
            dataEqualFilter: { barcode }
          }
        })
        if (data[0]) {
          this.product = data[0]
          notify('Producto ya se encuentra registrado', 'positive', 'check_circle')
        } else {
          this.product = {
            barcode,
            images: [],
            is_bundle: 0,
            show_catalog: 0,
            is_addons: 0,
            skip_stock: 0
          }
          setTimeout(() => {
            this.$refs.formAddProduct.resetValidation()
          }, 500)
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get all companies
     */
    async getAllCompanies () {
      try {
        const { data } = await this.$api.get('companies')
        this.companies = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Download data
     */
    async download () {
      getDownload(
        'excel/products',
        {
          stock: true,
          withStock: false,
          branch_office_id: this.branchOffice?.id
        },
        (percentCompleted) => {
          this.loadingDownload = percentCompleted / 100
          if (percentCompleted === 100) {
            // Mantener visible por un momento antes de ocultar
            setTimeout(() => {
              this.loadingDownload = 0
              // Mostrar notificación de éxito
              Notify.create({
                message: 'Productos exportados exitosamente',
                icon: 'check_circle',
                color: 'positive',
                position: 'top',
                timeout: 2000
              })
            }, 500)
          }
        },
        (link) => {
          link.setAttribute(
            'download',
            'Productos.xlsx'
            // `Recibos de cobro: Desde ${proxyDate.value.from} Hasta ${proxyDate.value.to}.xlsx`
          )
          document.body.appendChild(link)
          link.click()
        }
      )
    },
    /**
     * Copy products
     */
    async copyProducts () {
      try {
        loading(true)
        await this.$api.post('products/copy', {
          company_from_id: this.company,
          company_to_id: this.userSession.company_session_id
        })
        this.getProducts(this.params)
        notify('Productos copiados exitosamente', 'positive', 'info')
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Value image
     * @param {File} e file image
     */
    changeImage (e) {
      const self = this
      const reader = new FileReader()
      reader.readAsDataURL(e)
      reader.onload = function (e) {
        self.imageUrl = this.result
      }
    },
    handleDrop (event) {
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.processFiles(files)
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterProductsAddons (value, update) {
      this.$api.get('products', {
        params: {
          paginate: true,
          perPage: 100,
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.addonsProductsOptions = data.data
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
    /**
     * Delete image
     * @param {Object} image data image
     * @param {Number} index index image
     */
    deleteImage (image, index) {
      if (image.id) {
        this.$api.delete(`product-images/${image.id}`)
          .then(({ data }) => {
            this.product.images.splice(index, 1)
          })
          .catch(err => {
            this.visible = false
            Notify.create({
              message: err.message,
              icon: 'warning',
              color: 'negative'
            })
          })
      } else {
        this.product.images.splice(index, 1)
      }
    },
    /**
     * Model product
     * @param {Object} data product
     */
    modelData (data, put = false) {
      const formData = new FormData()
      if (put) {
        formData.append('_method', 'put')
      }
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key]
          if (typeof data[key] !== 'object') {
            formData.append(key, element)
          }
        }
      }

      if (this.priceLists.length) {
        const formattedPriceLists = this.priceLists.map(pl => ({
          ...pl,
          profit_percentage: (pl.profit_percentage || 0) * 100
        }))
        formData.append('price_lists', JSON.stringify(formattedPriceLists))
      }

      if (data.aliquot_type) {
        formData.append('aliquot_type', JSON.stringify(data.aliquot_type))
      }

      if (this.unitOfMeasure) {
        formData.append('unit_of_measure_id', this.unitOfMeasure.id)
      }

      data.images.forEach((element, index) => {
        formData.append(`images[${index}]`, element.image)
      })

      if (this.addonsProducts.length > 0) {
        this.addonsProducts.forEach((element, index) => {
          formData.append(`addons[${index}]`, element.id)
        })
      }

      if (this.priceLists.length > 0) {
        this.priceLists.forEach((element, index) => {
          formData.append(`price_lists[${index}]`, JSON.stringify({ ...element, index }))
        })
      }

      formData.append('branch_office_ids[0]', this.branchOffice?.id)
      return formData
    },
    /**
     * Add image to product
     */
    addImage () {
      this.product.images.push({
        image: this.productImage,
        url: this.imageUrl
      })
      this.productImage = null
    },

    handleFileSelect (event) {
      const files = Array.from(event.target.files)
      this.processFiles(files)
    },
    processFiles (files) {
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.product.images.push({
              image: file,
              url: e.target.result
            })
          }
          reader.readAsDataURL(file)
        }
      })
    },
    /**
     * Close all modals
     */
    closeModal () {
      // Si estamos editando y hay un producto original, restaurarlo en la lista
      if (this.openEditProduct && this.originalProduct) {
        // Encontrar el índice del producto en la lista
        const index = this.products.findIndex(p => p.id === this.originalProduct.id)
        if (index !== -1) {
          // Restaurar el producto original en la lista
          this.products.splice(index, 1, this.deepCloneProduct(this.originalProduct))
        }
      }

      // Limpiar estados
      this.openAddProduct = false
      this.openEditProduct = false
      this.originalProduct = null
      this.priceLists = []
      this.product = {
        images: [],
        is_bundle: 0,
        show_catalog: 0,
        is_addons: 0,
        skip_stock: 0,
        profit_percentage: 0
      }
      this.getUnitOfMeasures()
    },
    /**
     * Search beneficiary
     * @param  {Object}
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getProducts(this.params)
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getAliquotTypes (value, update) {
      try {
        const { data } = await this.$apiArca.get('metadata/aliquot-types', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.aliquotTypes = data
        })
      } catch (err) {
        notify(err.message, 'negative', 'warning')
      }
    },
    /**
     * Get all products
     */
    getProducts (params = this.params) {
      this.visible = true
      this.$api.get('products', {
        params: {
          ...params,
          branch_office_id: this.branchOffice?.id
        }
      })
        .then(({ data }) => {
          console.log('Respuesta de la API al obtener productos:', data)
          this.products = data.data
          this.visible = false
          this.paginationConfig.rowsNumber = data.total
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Set category
     * @param {Object} data category
     */
    setCategory (data) {
      this.product.aliquot_type = data.aliquot_type
    },
    /**
     * Get all products
     */
    async getUnitOfMeasures () {
      try {
        const { data } = await this.$api.get('unit-of-measures')
        this.unitOfMeasures = data
        this.unitOfMeasure = this.unitOfMeasures[0]
      } catch (error) {
        Notify.create({
          message: error.message,
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getProducts(this.params)
    },
    /**
     * Save products
     */
    saveProduct () {
      this.visible = true
      this.$api.post('products', this.modelData(this.product))
        .then(({ data }) => {
          this.getProducts()
          this.openAddProduct = false
          this.visible = false
          this.closeModal()

          Notify.create({
            message: 'Producto creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })

          this.trackDemoAction(true)

          // Verificar si viene desde WelcomePage para preguntar si continuar
          this.checkContinueConfiguration()
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * View product
     */
    editProduct (event, row, index) {
      // Guardar el producto original antes de cualquier modificación
      this.originalProduct = this.deepCloneProduct(row)

      // Crear una copia para trabajar
      this.product = this.deepCloneProduct(row)

      this.openEditProduct = true
      this.unitOfMeasure = this.product.unit_of_measure
      this.addonsProducts = this.product.addons || []
      this.priceLists = this.product.product_price_lists || []

      // Inicializar valores display sin cálculos
      this.priceLists.forEach(pl => {
        const profitPercentageFromDB = pl.profit_percentage || 0
        pl.profit_percentage = parseFloat(profitPercentageFromDB)
        pl.profitPercentageValue = Math.round(profitPercentageFromDB * 100)
        pl.profitPercentageDisplay = Number(profitPercentageFromDB).toFixed(2)
      })

      // Inicializar margen principal
      const profitPercentageValue = parseFloat(this.product.profit_percentage || 0)
      this.profitPercentageValue = Math.round(profitPercentageValue * 100)
      this.profitPercentageDisplay = profitPercentageValue.toFixed(2)
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.post(`products/${this.product.id}`, this.modelData(this.product, true))
        .then(({ data }) => {
          this.getProducts()
          this.openEditProduct = false
          this.originalProduct = null
          this.visible = false
          this.closeModal()
          Notify.create({
            message: 'Producto editado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Delete product
     */
    deleteProduct () {
      this.visible = true
      this.$api.delete(`products/${this.product.id}`)
        .then(({ data }) => {
          this.getProducts()
          this.openEditProduct = false
          this.visible = false
          this.closeModal()
          Notify.create({
            message: 'Producto eliminado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Open QR dialog
     */
    openQrDialog () {
      this.qrDialog = true
      this.qrCodes = []
    },
    /**
     * Close QR dialog
     */
    closeQrDialog () {
      this.qrDialog = false
      this.qrCodes = []
    },
    /**
     * Generate QR for selected products
     */
    async generateQrSelected () {
      if (!this.selection.length) {
        notify('Selecciona al menos un producto', 'warning', 'warning')
        return
      }

      try {
        this.loadingQr = true
        const productIds = this.selection.map(p => p.id)
        const { data } = await this.$api.post('products/generate-qr', {
          product_ids: productIds
        })
        this.qrCodes = data.qr_codes
        notify('Códigos QR generados exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.loadingQr = false
      }
    },
    /**
     * Generate QR for all products
     */
    async generateQrAll () {
      try {
        this.loadingQr = true
        const productIds = this.products.map(p => p.id)

        if (!productIds.length) {
          notify('No hay productos para generar QR', 'warning', 'warning')
          return
        }

        const { data } = await this.$api.post('products/generate-qr', {
          product_ids: productIds
        })
        this.qrCodes = data.qr_codes
        notify('Códigos QR generados exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.loadingQr = false
      }
    },
    /**
     * Download QR code
     */
    downloadQr (qr) {
      try {
        const link = document.createElement('a')
        link.href = `data:image/png;base64,${qr.qr_code}`
        link.download = `QR-${qr.product_name.replace(/[^a-z0-9]/gi, '_')}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        notify('QR descargado exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify('Error al descargar el QR', 'negative', 'warning')
      }
    },
    /**
     * Share QR via WhatsApp
     */
    async shareQrWhatsApp (qr) {
      try {
        // Convert base64 to blob
        const base64Response = await fetch(`data:image/png;base64,${qr.qr_code}`)
        const blob = await base64Response.blob()

        // Create file from blob
        const file = new File([blob], `QR-${qr.product_name}.png`, { type: 'image/png' })

        // Check if Web Share API is available
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `QR - ${qr.product_name}`,
            text: `Código QR del producto: ${qr.product_name}${qr.barcode ? ` (${qr.barcode})` : ''}`,
            files: [file]
          })
          notify('Compartido exitosamente', 'positive', 'check_circle')
        } else {
          // Fallback: Open WhatsApp Web with text
          const text = encodeURIComponent(`Código QR del producto: ${qr.product_name}${qr.barcode ? ` (${qr.barcode})` : ''}`)
          window.open(`https://wa.me/?text=${text}`, '_blank')
          notify('Abre WhatsApp para compartir. Descarga el QR y envíalo manualmente.', 'info', 'info')
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          notify('Error al compartir por WhatsApp', 'negative', 'warning')
        }
      }
    },
    /**
     * Generate single product image with AI
     */
    async generateSingleProductImage () {
      if (!this.product.id) {
        notify('Debe guardar el producto primero', 'warning', 'warning')
        return
      }

      try {
        this.generatingSingleImage = true

        const { data } = await this.$api.post('ai-chats/generate-product-images', {
          product_ids: [this.product.id]
        })

        if (data.results.processed > 0) {
          notify('Imagen generada exitosamente', 'positive', 'check_circle')

          // Recargar el producto para obtener la nueva imagen
          const response = await this.$api.get(`products/${this.product.id}`)
          this.product.images = response.data.images

          // Refrescar la lista de productos
          this.getProducts()
        } else if (data.results.failed > 0) {
          notify('Error al generar la imagen', 'negative', 'error')
        }
      } catch (error) {
        notify(error.response?.data?.message || 'Error al generar imagen con IA', 'negative', 'error')
      } finally {
        this.generatingSingleImage = false
      }
    },
    /**
     * Open image viewer
     */
    openImageViewer (index) {
      this.currentImageIndex = index
      this.imageViewerDialog = true
    },
    /**
     * Close image viewer
     */
    closeImageViewer () {
      this.imageViewerDialog = false
      this.currentImageIndex = 0
    },
    /**
     * Navigate to previous image
     */
    previousImage () {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--
      }
    },
    /**
     * Navigate to next image
     */
    nextImage () {
      if (this.currentImageIndex < this.product.images.length - 1) {
        this.currentImageIndex++
      }
    },
    /**
     * Open AI Image Dialog
     */
    openAiImageDialog () {
      this.aiImageDialog = true
      this.aiImageOption = this.selection.length > 0 ? 'selected' : 'all_without_images'
    },
    /**
     * Close AI Image Dialog
     */
    closeAiImageDialog () {
      if (!this.aiImageLoading) {
        this.aiImageDialog = false
        this.aiImageProgress = {
          total: 0,
          processed: 0,
          failed: 0,
          current: ''
        }
      }
    },
    /**
     * Generate AI Images
     */
    async generateAiImages () {
      try {
        this.aiImageLoading = true

        const payload = {}

        if (this.aiImageOption === 'selected') {
          payload.product_ids = this.selection.map(p => p.id)
          this.aiImageProgress.total = this.selection.length
        } else {
          payload.generate_all_without_images = true
          // Estimamos el total, se actualizará con la respuesta
          this.aiImageProgress.total = 1
        }

        this.aiImageProgress.current = 'Iniciando generación de imágenes...'

        const { data } = await this.$api.post('ai-chats/generate-product-images', payload)

        this.aiImageProgress.total = data.results.total
        this.aiImageProgress.processed = data.results.processed
        this.aiImageProgress.failed = data.results.failed

        if (data.results.processed > 0) {
          notify(`Se generaron ${data.results.processed} imágenes exitosamente`, 'positive', 'check_circle')

          // Refrescar la lista de productos
          this.getProducts()

          // Limpiar selección
          this.selection = []
        }

        if (data.results.failed > 0) {
          notify(`${data.results.failed} productos fallaron al generar imagen`, 'warning', 'warning')
        }

        if (data.results.total === 0) {
          notify('No hay productos para procesar', 'info', 'info')
        }

        // Cerrar el diálogo después de un breve delay
        setTimeout(() => {
          this.closeAiImageDialog()
        }, 2000)
      } catch (error) {
        notify(error.response?.data?.message || 'Error al generar imágenes con IA', 'negative', 'error')
        this.closeAiImageDialog()
      } finally {
        this.aiImageLoading = false
      }
    },
    /**
     * Download all QR codes as PDF
     */
    async downloadAllQrAsPdf () {
      try {
        this.loadingPdf = true
        const productIds = this.qrCodes.map(qr => qr.product_id)

        const response = await this.$api.post('products/generate-qr-pdf', {
          product_ids: productIds
        }, {
          responseType: 'blob'
        })

        // Create download link
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `codigos-qr-productos-${new Date().getTime()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(link.href)

        notify('PDF descargado exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify(error.message || 'Error al generar PDF', 'negative', 'warning')
      } finally {
        this.loadingPdf = false
      }
    },
    /**
     * Share all QR codes as PDF via WhatsApp
     */
    async shareAllQrAsPdf () {
      try {
        this.loadingPdf = true
        const productIds = this.qrCodes.map(qr => qr.product_id)

        const response = await this.$api.post('products/generate-qr-pdf', {
          product_ids: productIds
        }, {
          responseType: 'blob'
        })

        const blob = new Blob([response.data], { type: 'application/pdf' })
        const file = new File([blob], 'codigos-qr-productos.pdf', { type: 'application/pdf' })

        // Try to share using Web Share API
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Códigos QR de Productos',
              text: `PDF con ${this.qrCodes.length} códigos QR de productos`,
              files: [file]
            })
            notify('PDF compartido exitosamente', 'positive', 'check_circle')
          } catch (shareError) {
            // If share fails or is cancelled, download instead
            if (shareError.name !== 'AbortError') {
              const link = document.createElement('a')
              link.href = window.URL.createObjectURL(blob)
              link.download = `codigos-qr-productos-${new Date().getTime()}.pdf`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              window.URL.revokeObjectURL(link.href)
              notify('PDF descargado. Compártelo manualmente', 'info', 'info')
            }
          }
        } else {
          // Fallback: Download
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = `codigos-qr-productos-${new Date().getTime()}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(link.href)
          notify('PDF descargado. Compártelo manualmente por WhatsApp', 'info', 'info')
        }
      } catch (error) {
        notify(error.message || 'Error al generar PDF', 'negative', 'warning')
      } finally {
        this.loadingPdf = false
      }
    },
    /**
     * Open add product dialog
     */
    openAddProductDialog () {
      this.openAddProduct = true
    },
    /**
     * Check and start tour on first visit
     */
    checkAndStartTour () {
      // Verificar si viene desde WelcomePage
      const activateFromWelcome = localStorage.getItem('activate_tour_from_welcome')
      const selectedTask = localStorage.getItem('welcome_selected_task')

      if (activateFromWelcome === 'true' && selectedTask === 'Product') {
        // Limpiar flags de activación
        localStorage.removeItem('activate_tour_from_welcome')
        localStorage.removeItem('welcome_selected_task')

        // Marcar que viene desde Welcome para preguntar después de configurar
        localStorage.setItem('came_from_welcome_product', 'true')

        // Activar tour automáticamente
        setTimeout(() => {
          this.startMainTour()
        }, 500)
        return
      }

      // Comportamiento normal: verificar si ya vio el tour
      const hasSeenTour = localStorage.getItem('has_seen_product_main_tour')
      if (hasSeenTour !== 'true') {
        this.$nextTick(() => {
          setTimeout(() => {
            this.startMainTour()
          }, 500)
        })
      }
    },
    /**
     * Start main page tour
     */
    startMainTour () {
      // 1. Calcular pasos válidos dinámicamente
      this.activeTourSteps = this.allTourStepsDefinition.filter(step => {
        // Regla explícita: Excluir tabla de productos en Mobile/Tablet
        if (step.excludeOnMobileTablet && this.$q.screen.lt.md) {
          return false
        }

        const element = document.querySelector(step.target)
        // 2. Verificar existencia y visibilidad real
        // offsetParent es null si el elemento (o ancestro) tiene display: none
        return element && element.offsetParent !== null
      })

      if (this.activeTourSteps.length === 0) {
        notify('No hay elementos visibles para mostrar en el tour en esta vista.', 'warning')
        return
      }

      this.currentTourType = 'main'
      this.currentTourStep = 0
      this.showTour = true
      this.$nextTick(() => {
        this.updateTourPosition()
      })
    },
    /**
     * Next tour step
     */
    nextTourStep () {
      if (this.currentTourStep < this.currentTourSteps.length - 1) {
        this.currentTourStep++
        this.$nextTick(() => {
          this.updateTourPosition()
        })
      } else {
        this.finishTour()
      }
    },
    /**
     * Previous tour step
     */
    previousTourStep () {
      if (this.currentTourStep > 0) {
        this.currentTourStep--
        this.$nextTick(() => {
          this.updateTourPosition()
        })
      }
    },
    /**
     * Skip tour
     */
    skipTour () {
      this.finishTour()
    },
    /**
     * Finish tour
     */
    finishTour () {
      // Remove highlight class from any element
      const highlightedElement = document.querySelector('.tour-element-highlighted')
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-element-highlighted')
      }

      this.showTour = false
      this.currentTourStep = 0
      localStorage.setItem('has_seen_product_main_tour', 'true')
      notify('¡Tour completado! Ya conoces cómo gestionar productos.', 'positive', 'check_circle')
    },
    /**
     * Check if should continue configuration
     */
    async checkContinueConfiguration () {
      // Solo preguntar si viene desde WelcomePage
      const cameFromWelcome = localStorage.getItem('came_from_welcome_product')

      if (cameFromWelcome === 'true') {
        // Limpiar flag
        localStorage.removeItem('came_from_welcome_product')

        // Verificar si el progreso está al 100%
        const progressData = await this.checkIfComplete()

        if (progressData.isComplete) {
          // Mostrar celebración al 100%
          this.showCelebration()
        } else {
          // Emitir evento de Pixel antes de mostrar el diálogo
          if (this.$fbq) {
            this.$fbq.event('PrimerProducto', {
              company_id: this.userSession?.company_session?.id,
              business_type: this.userSession?.company_session?.business_type?.name
            })
          }
          // Preguntar si quiere continuar con la siguiente tarea
          setTimeout(() => {
            this.$q.dialog({
              title: '¡Productos configurados! ✅',
              message: '¿Deseas continuar con la siguiente tarea de configuración?',
              cancel: {
                label: 'Más tarde',
                color: 'grey-7',
                flat: true
              },
              ok: {
                label: 'Continuar',
                color: 'primary',
                unelevated: true
              },
              persistent: false
            }).onOk(() => {
              // Volver a WelcomePage para continuar
              this.$router.push({ name: 'Welcome' })
            })
          }, 500)
        }
      }
    },
    /**
     * Check if all tasks are complete (100%)
     */
    async checkIfComplete () {
      try {
        const isConfigured = this.userSession?.company_session?.company_config?.other?.configured
        if (isConfigured) {
          return {
            isComplete: true,
            percentage: 100
          }
        }
        const { data } = await api.get('/onboarding/tasks/status')
        const tasks = data.tasks || []
        const total = tasks.length
        const completed = tasks.filter(t => t.count > 0 || (t.multiple && Object.values(t.multiple).every(v => v))).length
        const percentage = Math.round((completed / total) * 100)

        return {
          isComplete: percentage === 100,
          percentage
        }
      } catch (error) {
        console.error('Error checking completion:', error)
        return { isComplete: false, percentage: 0 }
      }
    },
    /**
     * Show celebration dialog when 100% complete
     */
    async showCelebration () {
      try {
        const { data } = await api.post('/companies/mark-configured')
        this.setCompanySession({
          ...this.userSession.company_session,
          company_config: data.data
        })
      } catch (error) {
        console.error('Error marking company as configured:', error)
      }
      const CelebrationDialog = await import('src/components/CelebrationDialog.vue')
      this.$q.dialog({
        component: CelebrationDialog.default
      })
    },
    /**
     * Update tour position
     */
    updateTourPosition (retryCount = 0) {
      this.$nextTick(() => {
        const step = this.currentTourSteps[this.currentTourStep]
        if (!step) return

        // Execute step action if defined
        if (typeof step.action === 'function') {
          step.action()
        }

        // Remove highlight class from previous element
        const previousHighlighted = document.querySelector('.tour-element-highlighted')
        if (previousHighlighted) {
          previousHighlighted.classList.remove('tour-element-highlighted')
        }

        const element = document.querySelector(step.target)
        // Check if element exists and is visible (logic from BillingPage)
        if (!element || element.offsetParent === null) {
          // Retry up to 5 times with increasing delay
          if (retryCount < 5) {
            console.warn(`Tour element not found or hidden: ${step.target}, retrying... (${retryCount + 1}/5)`)
            setTimeout(() => {
              this.updateTourPosition(retryCount + 1)
            }, 200 * (retryCount + 1))
            return
          } else {
            console.error('Tour element not found after retries or is hidden:', step.target)
            // Skip to next step if element not found/visible
            if (this.currentTourStep < this.currentTourSteps.length - 1) {
              this.currentTourStep++
              this.updateTourPosition()
            } else {
              this.finishTour()
            }
            return
          }
        }

        // Add highlight class to current element
        element.classList.add('tour-element-highlighted')

        // Scroll to element first (except for products table/list)
        if (step.target !== '#tour-tabla-productos') {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        }

        // Wait for scroll to finish before calculating positions
        setTimeout(() => {
          const rect = element.getBoundingClientRect()
          const isMobile = this.$q.screen.lt.md
          const viewportHeight = window.innerHeight
          const viewportWidth = window.innerWidth

          // En la nueva estructura con Teleport, el overlay puede no ser el padre directo para posicionamiento
          // pero calculamos offsets si fuera necesario. Como usamos position: absolute/fixed en body,
          // rect.top/left (viewport coordinates) son lo que necesitamos mayormente.

          // Update spotlight position directly based on rect (since it's in a fixed overlay or body)
          // Nota: Si el spotlight está dentro de un div fixed, usaremos coordenadas del viewport.
          this.spotlightStyle = {
            top: `${rect.top - 6}px`,
            left: `${rect.left - 6}px`,
            width: `${rect.width + 12}px`,
            height: `${rect.height + 12}px`
          }

          // En móvil: posicionar tarjeta fija en la parte inferior
          if (isMobile) {
            this.tourCardStyle = {
              position: 'fixed',
              bottom: '100px',
              left: '16px',
              right: '16px',
              top: 'auto',
              width: 'auto'
            }
            return
          }

          // Posicionar tarjeta (Desktop)
          const cardWidth = 400
          const cardHeight = 250 // Estimado, puede variar según contenido
          const padding = 20

          // Coordenadas base (viewport)
          const elTop = rect.top
          const elBottom = rect.bottom
          const elLeft = rect.left
          const elRight = rect.right
          const elCenterX = elLeft + (rect.width / 2)

          let cardTop, cardLeft

          // Estrategia de posicionamiento inteligente:
          // 1. Intentar ponerlo a la derecha si hay espacio
          // 2. Intentar ponerlo a la izquierda si no
          // 3. Ponerlo abajo o arriba según espacio vertical

          // Zona derecha disponible vs Zona izquierda disponible
          const spaceRight = viewportWidth - elRight
          const spaceLeft = elLeft

          // Si el elemento está muy a la derecha (ej: botones de acción), preferir izquierda
          if (spaceRight < (cardWidth + padding) && spaceLeft > (cardWidth + padding)) {
            // Posicionar a la izquierda
            cardLeft = elLeft - cardWidth - padding
            // Alinear verticalmente al centro del elemento o top
            cardTop = elTop
          } else if (spaceLeft < (cardWidth + padding) && spaceRight > (cardWidth + padding)) {
            // Si el elemento está muy a la izquierda, preferir derecha
            // Posicionar a la derecha
            cardLeft = elRight + padding
            cardTop = elTop
          } else {
            // Si no cabe a los lados o está centrado, poner abajo o arriba
            // Centrar horizontalmente respecto al elemento
            cardLeft = elCenterX - (cardWidth / 2)

            // Preferir abajo
            if ((viewportHeight - elBottom) > (cardHeight + padding)) {
              cardTop = elBottom + padding
            } else {
              // Si no cabe abajo, poner arriba
              cardTop = elTop - cardHeight - padding
            }
          }

          // Correcciones finales para asegurar que no se salga del viewport
          // Horizontal overflow check
          if (cardLeft < padding) cardLeft = padding
          if (cardLeft + cardWidth > viewportWidth - padding) {
            cardLeft = viewportWidth - cardWidth - padding
          }

          // Vertical overflow check
          if (cardTop < padding) cardTop = padding
          if (cardTop + cardHeight > viewportHeight - padding) {
            // Si se sale por abajo y ya intentamos ponerlo arriba, lo pegamos al borde inferior
            cardTop = viewportHeight - cardHeight - padding
          }

          this.tourCardStyle = {
            position: 'fixed', // Usar fixed para evitar líos con scroll parents
            top: `${cardTop}px`,
            left: `${cardLeft}px`,
            width: `${cardWidth}px`
          }
        }, 300)
      })
    },
    ...mapActions(authentication, ['setCompanySession'])
  }
}
</script>
<style>
/* Mobile toolbar improvements */
@media (max-width: 599px) {
  .q-pa-md {
    padding: 8px !important;
  }

  .q-table__title {
    font-size: 1.1rem !important;
  }

  .q-table__top {
    padding: 8px !important;
  }

  /* Toolbar móvil */
  .mobile-toolbar {
    padding: 8px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
    gap: 4px;
  }

  .body--dark .mobile-toolbar {
    background: rgba(255, 255, 255, 0.03);
  }

  /* Mejoras estéticas de botones móviles */
  .q-btn.q-btn--round {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .q-btn.q-btn--round:active {
    transform: scale(0.95);
  }

  .q-btn.q-btn--round:hover {
    transform: translateY(-2px);
  }
}

/* Mejoras estéticas generales de botones */
.q-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-btn:hover {
  transform: translateY(-1px);
}

.q-btn:active {
  transform: scale(0.98);
}

.q-btn.q-btn--round {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-btn.q-btn--round:hover {
  transform: translateY(-2px) scale(1.05);
}

.q-btn.q-btn--round:active {
  transform: scale(0.95);
}

.dropzone-card {
  border: 2px dashed #e0e0e0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.profit-percentage-input input {
  text-align: right !important;
}

.dropzone-card:hover,
.dropzone-active {
  border-color: #1976d2;
}

.image-preview-card {
  transition: transform 0.2s ease;
}

.image-preview-card:hover {
  transform: scale(1.02);
}

/* Tour Styles */
.tour-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 99999;
  pointer-events: none;
}

.tour-spotlight {
  position: absolute;
  background: transparent;
  border: 4px solid var(--q-primary);
  border-radius: 12px;
  box-shadow:
    0 0 0 9999px rgba(0, 0, 0, 0.75),
    0 0 0 8px rgba(255, 255, 255, 0.1),
    0 0 40px 4px rgba(var(--q-primary-rgb, 25, 118, 210), 0.6);
  transition: all 0.3s ease;
  z-index: 100000;
  pointer-events: none;
  animation: pulse-border 2s infinite;
}

/* Allow clicks on highlighted element when click is required */
.tour-spotlight.clickable {
  pointer-events: auto;
  cursor: pointer;
}

/* Make highlighted element clickeable during tour */
.tour-element-highlighted {
  position: relative;
  z-index: 100001 !important;
  pointer-events: auto !important;
}

@keyframes pulse-border {
  0%, 100% {
    border-color: var(--q-primary);
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      0 0 0 8px rgba(255, 255, 255, 0.1),
      0 0 40px 4px rgba(var(--q-primary-rgb, 25, 118, 210), 0.6);
  }
  50% {
    border-color: var(--q-primary);
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      0 0 0 8px rgba(255, 255, 255, 0.15),
      0 0 50px 6px rgba(var(--q-primary-rgb, 25, 118, 210), 0.8);
  }
}

.tour-card {
  position: absolute;
  z-index: 100002;
  min-width: 350px;
  max-width: 450px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: tour-card-appear 0.3s ease-out;
  pointer-events: auto;
}

@keyframes tour-card-appear {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary-dark, var(--q-primary)) 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.tour-step-indicator {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.tour-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--q-primary);
  line-height: 1.3;
}

.body--dark .tour-title {
  color: var(--q-primary);
}

.tour-description {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  white-space: pre-line;
}

.body--dark .tour-description {
  color: #b0b0b0;
}

/* Import Dialog Styles */
.import-dialog-card {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.import-dialog-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
  color: white;
}

.body--dark .import-dialog-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #0d47a1 100%);
}

.import-close-btn {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.import-close-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.import-step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--q-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
  font-size: 14px;
}

/* Dropzone Styles */
.import-dropzone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.02);
}

.body--dark .import-dropzone {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.05);
}

.import-dropzone:hover {
  border-color: var(--q-primary);
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.body--dark .import-dropzone:hover {
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.1);
}

.dropzone-active {
  border-color: var(--q-primary);
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.1);
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(var(--q-primary-rgb, 25, 118, 210), 0.2);
}

.dropzone-has-file {
  border-style: solid;
  border-color: var(--q-positive);
  background: rgba(76, 175, 80, 0.05);
  padding: 20px;
}

.body--dark .dropzone-has-file {
  background: rgba(76, 175, 80, 0.1);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.dropzone-file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.import-success-banner {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-left: 4px solid #4caf50;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  color: #2e7d32;
  animation: slideInUp 0.3s ease;
}

.body--dark .import-success-banner {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.25) 100%);
  color: #81c784;
}

.import-error-banner {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-left: 4px solid #f44336;
  padding: 16px;
  border-radius: 8px;
  color: #c62828;
  animation: slideInUp 0.3s ease;
}

.body--dark .import-error-banner {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.25) 100%);
  color: #ef5350;
}

.import-error-list {
  max-height: 200px;
  overflow-y: auto;
}

.import-error-item {
  padding: 6px 0;
  font-size: 13px;
  opacity: 0.9;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.body--dark .import-error-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.import-error-item:last-child {
  border-bottom: none;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Slide up animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Rotating animation for AI icon */
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotating {
  animation: rotating 2s linear infinite;
}

/* Image Viewer Professional Styles */
.image-viewer-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
}

.image-viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 9002;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.image-viewer-close:hover {
  background: rgba(0, 0, 0, 0.7);
}

.image-viewer-counter {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 16px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 20px;
  z-index: 9002;
}

.image-viewer-main {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 100px;
}

.image-viewer-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-viewer-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9002;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.image-viewer-nav:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-50%) scale(1.1);
}

.image-viewer-nav-left {
  left: 20px;
}

.image-viewer-nav-right {
  right: 20px;
}

.image-viewer-thumbnails {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  z-index: 9002;
  max-width: 90vw;
  overflow-x: auto;
}

.image-viewer-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.image-viewer-thumbnail:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.image-viewer-thumbnail.active {
  border-color: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .image-viewer-main {
    padding: 60px 20px 100px 20px;
  }

  .image-viewer-nav {
    display: none;
  }

  .image-viewer-thumbnails {
    bottom: 10px;
    padding: 8px;
    gap: 8px;
  }

  .image-viewer-thumbnail {
    width: 50px;
    height: 50px;
  }

  .image-viewer-counter {
    top: 10px;
    font-size: 14px;
    padding: 6px 16px;
  }

  .image-viewer-close {
    top: 10px;
    right: 10px;
  }
}

/* Responsive tour */
@media (max-width: 768px) {
  .tour-card {
    min-width: 300px;
    max-width: 90vw;
    left: 5vw !important;
  }

  .tour-title {
    font-size: 18px;
  }

  .tour-description {
    font-size: 13px;
  }
}

/* Download notification styles */
.download-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9000;
  max-width: 400px;
  min-width: 320px;
}

.download-card {
  background: var(--q-dark);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tour-element-highlighted {
  position: relative;
  z-index: 2000000020 !important;
  pointer-events: auto;
  background-color: white; /* Opcional: para asegurar opacidad si es necesario */
  border-radius: 4px; /* Opcional: para suavizar bordes si no tiene */
  transition: all 0.3s ease;
  box-shadow: 0 0 0 4px rgba(var(--q-primary-rgb, 25, 118, 210), 0.2);
}

/* Tour Styles - Replicated from BillingPage */
.tour-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 2000000000;
  pointer-events: auto;
}

.tour-spotlight {
  position: absolute;
  background: transparent;
  border: 4px solid var(--q-primary);
  border-radius: 12px;
  box-shadow:
    0 0 0 9999px rgba(0, 0, 0, 0.75),
    0 0 0 8px rgba(255, 255, 255, 0.1),
    0 0 40px 4px rgba(var(--q-primary-rgb, 25, 118, 210), 0.6);
  transition: all 0.3s ease;
  z-index: 2000000010;
  pointer-events: none;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% {
    border-color: var(--q-primary);
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      0 0 0 8px rgba(255, 255, 255, 0.1),
      0 0 40px 4px rgba(var(--q-primary-rgb, 25, 118, 210), 0.6);
  }
  50% {
    border-color: var(--q-primary);
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      0 0 0 8px rgba(255, 255, 255, 0.15),
      0 0 50px 6px rgba(var(--q-primary-rgb, 25, 118, 210), 0.8);
  }
}

.tour-card {
  position: absolute;
  z-index: 2147483647 !important;
  min-width: 350px;
  max-width: 450px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: tour-card-appear 0.3s ease-out;
}

@keyframes tour-card-appear {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary-dark, var(--q-primary)) 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.tour-step-indicator {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.tour-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--q-primary);
  line-height: 1.3;
}

.body--dark .tour-title {
  color: var(--q-primary);
}

.tour-description {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.body--dark .tour-description {
  color: #b0b0b0;
}

/* Responsive tour */
@media (max-width: 768px) {
  .tour-card {
    position: fixed !important;
    bottom: 100px !important;
    left: 16px !important;
    right: 16px !important;
    top: auto !important;
    min-width: auto;
    max-width: none;
    z-index: 2147483647 !important;
  }

  .tour-header {
    padding: 10px 14px;
  }

  .tour-title {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .tour-description {
    font-size: 13px;
    line-height: 1.5;
  }

  .tour-card .q-card-actions {
    padding: 12px 16px;
    gap: 8px;
  }

  .tour-card .q-card-actions .q-btn {
    min-height: 44px;
    padding: 8px 16px;
    font-size: 14px;
  }

  .tour-spotlight {
    border-width: 3px;
  }
}

.body--dark .download-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.body--light .download-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  transform: translateY(100px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 599px) {
  .download-notification {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
    min-width: auto;
  }
}
</style>

<style lang="scss" scoped>
/* Clases para tarjetas compactas */
.compact-card-header {
  padding: 0.5rem 1rem !important;
}

.compact-card-body {
  padding: 0.5rem 1rem !important;
}

.compact-card-footer {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  padding-top: 0 !important;
}

.compact-total-container {
  padding: 0.5rem !important;
}

/* Selected card styles */
.selected-card {
  outline: 2px solid #1976d2 !important;
  transition: none !important;
  transform: none !important;
}

@media (max-width: 1023px) {
  /* Reducir padding del top de la tabla - usando deep selector para sobrescribir Quasar */
  :deep(.q-table__top) {
    padding: 0 !important;
  }
  :deep(.q-table__top .flex) {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: center;
  }

  :deep(.q-table__top .q-select) {
    max-width: 200px;
  }

  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}
</style>
