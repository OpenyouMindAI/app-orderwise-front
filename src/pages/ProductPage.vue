<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 text-right q-gutter-sm">
        <q-btn
          id="tour-btn-seleccionar-multiples"
          color="blue"
          @click="multipleSelected = !multipleSelected"
          :icon="multipleSelected ? 'check_box' : 'check_box_outline_blank'"
          label="Seleccionar múltiples"
        />
        <q-btn
          color="negative"
          @click="deleteMassive"
          icon="delete"
          v-if="selection.length"
          label="Eliminar masivo"
        />
        <q-btn
          id="tour-btn-codigos-qr"
          color="teal"
          @click="openQrDialog"
          icon="qr_code"
          label="Códigos QR"
        />
        <q-btn
          id="tour-btn-lista-precios"
          color="purple"
          @click="listPriceDialog = true"
          icon="list"
          label="Modificar lista de precios"
        />
        <q-btn
          id="tour-btn-exportar"
          color="secondary"
          @click="download"
          icon="download"
          label="Exportar excel"
        />
        <q-btn
          color="info"
          @click="openCompaniesDialog"
          icon="content_copy"
          v-if="userSession.is_root"
        />
        <q-btn
          id="tour-btn-agregar"
          color="primary"
          @click="openAddProductDialog"
          icon="add_circle"
          label="Agregar Producto"
        />
        <q-btn
          id="tour-btn-filtrar"
          color="primary"
          @click="dialogFilter = true"
          icon="filter_alt"
          label="Filtrar Productos"
        />
      </div>
      <div class="col-12">
        <q-table
          id="tour-tabla-productos"
          title="Productos"
          row-key="id"
          :columns="columns"
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
        </q-table>
      </div>
    </div>
    <q-dialog v-model="openEditProduct" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 1200px; max-width: 95vw;">
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <div class="text-h6">Modificar producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="saveEdit">
          <q-tabs
            v-model="tab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="basicData" label="Datos básicos" />
            <q-tab name="stock" label="stock" v-if="!product.is_bundle"/>
            <q-tab name="product" label="Productos" v-if="product.is_bundle" />
          </q-tabs>
          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="basicData">
              <div class="row q-col-gutter-sm scroll" style="height: calc(100vh - 240px);">
                <div class="row col-md-7 col-xs-12 col-sm-12">
                  <!-- Datos básicos -->
                  <div class="col-12">
                    <q-card flat bordered class="q-pa-md q-mb-md">
                      <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                        <q-icon name="info" class="q-mr-sm" />
                        Datos básicos
                      </div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-input
                            id="tour-edit-barcode"
                            filled
                            v-model="product.barcode"
                            autofocus
                            label="Código de barra"
                            dense
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
                          />
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12 flex justify-start items-center">
                          <q-option-group
                            v-model="unitOfMeasure"
                            :options="unitOfMeasures"
                            color="positive"
                            inline
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
                      <div class="row q-col-gutter-sm q-mb-md">
                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                          <q-input
                            :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                            filled
                            v-model="product.cost"
                            label="Costo"
                            type="number"
                            dense
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
                            class="profit-percentage-input"
                            @keydown="handleProfitPercentageKeydown"
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
                                @keydown="event => handlePriceListMarginKeydown(event, priceList)"
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

                      <div class="row q-col-gutter-sm">
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
                          <div class="row q-col-gutter-sm scroll q-pa-sm" style="max-height: 400px;">
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
            </q-tab-panel>
            <q-tab-panel name="stock">
              <stock-product :product="product"/>
            </q-tab-panel>
            <q-tab-panel name="product">
              <pack-product :product="product"/>
            </q-tab-panel>
          </q-tab-panels>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteProduct" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddProduct" persistent :maximized="$q.screen.lt.sm">
      <q-card style="width: 1200px; max-width: 95vw;">
        <q-card-section class="row items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Agregar producto</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="saveProduct" ref="formAddProduct">
          <q-card-section class="scroll " style="height: calc(100vh - 200px);">
            <div class="row q-col-gutter-sm">
              <div class="row col-md-7 col-xs-12 col-sm-12">
                <!-- Datos básicos -->
                <div class="col-12">
                  <q-card flat bordered class="q-pa-md q-mb-md">
                    <div class="text-subtitle1 text-primary q-mb-md text-bold flex items-center">
                      <q-icon name="info" class="q-mr-sm" />
                      Datos básicos
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-input
                          id="tour-add-barcode"
                          filled
                          v-model="product.barcode"
                          autofocus
                          label="Código de barra"
                          dense
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
                        />
                      </div>
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-select
                          id="tour-add-categoria"
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
                        />
                      </div>
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12 flex justify-start items-center">
                        <q-option-group
                          v-model="unitOfMeasure"
                          :options="unitOfMeasures"
                          color="positive"
                          inline
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
                    <div class="row q-col-gutter-sm q-mb-md">
                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-12">
                        <q-input
                          :rules="[val => val !== null && val !== undefined || 'El campo es requerido.']"
                          filled
                          v-model="product.cost"
                          label="Costo"
                          type="number"
                          dense
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
                          class="profit-percentage-input"
                          @keydown="handleProfitPercentageKeydown"
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
                                @keydown="event => handlePriceListMarginKeydown(event, priceList)"
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

                    <div class="row q-col-gutter-sm">
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
                        <div class="row q-col-gutter-sm scroll q-pa-sm" style="max-height: 400px;">
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
          <q-card-actions align="right" class="text-primary q-pa-md">
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
    <q-dialog
      v-model="dialogFilter"
      position="right"
      seamless
    >
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-h6">
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

        <q-card-section class="q-pt-sm scroll" style="max-height: calc(100vh - 200px);">
          <div class="column q-gutter-y-md">

            <q-input
              v-model="filters.name"
              label="Nombre"
              filled
              dense
              clearable
            />

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

            <q-select
              dense
              use-input
              filled
              label="Categoría"
              input-debounce="0"
              option-value="id"
              option-label="name"
              clearable
              v-model="filters.category_id"
              :options="categories"
              @filter="filterCategories"
            />

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

            <q-select
              dense
              filled
              label="¿Es pack?"
              clearable
              v-model="filters.is_pack"
              :options="[{label: 'Sí', value: 1}, {label: 'No', value: 0}]"
            />

            <q-select
              dense
              filled
              label="¿Es adicional?"
              clearable
              v-model="filters.is_addon"
              :options="[{label: 'Sí', value: 1}, {label: 'No', value: 0}]"
            />

            <q-select
              dense
              filled
              label="¿Se muestra en catálogo?"
              clearable
              v-model="filters.show_in_catalog"
              :options="[{label: 'Sí', value: 1}, {label: 'No', value: 0}]"
            />

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
    <bulk-price-dialog
      :modelValue="listPriceDialog"
      :products="selection.length > 0 ? selection : 'all'"
      @updated="handleBulkPriceUpdate"
      @close="listPriceDialog = false"
    />

    <!-- QR Dialog -->
    <q-dialog v-model="qrDialog" persistent>
      <q-card style="width: 900px; max-width: 95vw;">
        <q-card-section class="row items-center bg-teal text-white q-py-sm">
          <q-icon name="qr_code" size="sm" class="q-mr-sm" />
          <div class="text-h6">Códigos QR de Productos</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeQrDialog" />
        </q-card-section>

        <q-card-section v-if="!qrCodes.length">
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

        <q-card-section v-else class="scroll" style="max-height: 60vh;">
          <div class="row q-col-gutter-md">
            <div
              v-for="qr in qrCodes"
              :key="qr.product_id"
              class="col-xs-12 col-sm-6 col-md-4"
            >
              <q-card flat bordered class="q-pa-md text-center">
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

        <q-card-actions align="right" class="q-pa-md q-gutter-sm">
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
          />
          <q-btn
            color="teal"
            label="Generar QR de todos"
            icon="qr_code"
            @click="generateQrAll"
            :loading="loadingQr"
            v-if="!qrCodes.length"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Tour Overlay -->
    <div v-if="showTour" class="tour-overlay">
      <div class="tour-spotlight" :style="spotlightStyle"></div>
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
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { Notify } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import StockProduct from 'src/components/Product/StockProduct.vue'
import PackProduct from 'src/components/Product/PackProduct.vue'
import { getDownload } from 'src/const/services'
import { loading, notify } from 'src/const/mixins'
import BulkPriceDialog from 'src/components/Product/BulkPriceDialog.vue'
import eventBus from 'src/utils/eventBus'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner'
export default {
  components: { StockProduct, PackProduct, BulkPriceDialog },
  data () {
    return {
      qrDialog: false,
      qrCodes: [],
      loadingQr: false,
      loadingPdf: false,
      originalProduct: null,
      listPriceDialog: false,
      dialogFilter: false,
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
      isDragOver: false,
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
        images: []
      },
      // Decimal input formatting for profit percentage
      profitPercentageValue: 0, // Internal value in centésimas (0.01 = 1)
      profitPercentageDisplay: '0',
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
          label: 'Costo',
          field: 'cost',
          sortable: true
        },
        {
          name: 'price',
          align: 'right',
          label: 'Precio',
          field: 'price',
          sortable: true
        },
        {
          name: 'stock',
          align: 'right',
          label: 'Stock',
          field: row => row?.is_bundle ? row.bundle_stock : row?.normal_stock
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
      mainTourSteps: [
        {
          target: '#tour-btn-seleccionar-multiples',
          title: '☑️ Seleccionar Múltiples',
          description: 'Activa este modo para seleccionar varios productos a la vez y realizar acciones masivas como eliminar.'
        },
        {
          target: '#tour-btn-codigos-qr',
          title: '📱 Códigos QR',
          description: 'Genera códigos QR para tus productos. Útil para impresión de etiquetas y gestión de inventario.'
        },
        {
          target: '#tour-btn-lista-precios',
          title: '💰 Modificar Lista de Precios',
          description: 'Actualiza los precios de múltiples productos de forma masiva usando listas de precios.'
        },
        {
          target: '#tour-btn-exportar',
          title: '📥 Exportar Excel',
          description: 'Descarga todos tus productos en un archivo Excel para análisis o respaldo.'
        },
        {
          target: '#tour-btn-agregar',
          title: '➕ Agregar Producto',
          description: 'Haz clic aquí para agregar un nuevo producto. Se abrirá un formulario completo con todos los campos necesarios.'
        },
        {
          target: '#tour-btn-filtrar',
          title: '🔍 Filtrar Productos',
          description: 'Filtra productos por categoría, precio, stock y más criterios para encontrar lo que necesitas.'
        },
        {
          target: '#tour-tabla-productos',
          title: '📋 Tabla de Productos',
          description: 'Aquí se muestran todos tus productos con información clave: nombre, categoría, precio, stock y más.'
        },
        {
          target: '#tour-tabla-productos tbody tr:first-child',
          title: '✏️ Editar Producto',
          description: 'Para editar un producto, simplemente haz clic en cualquier fila de la tabla. Se abrirá el formulario de edición.'
        }
      ],
      spotlightStyle: {},
      tourCardStyle: {}
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
    this.getUnitOfMeasures()
    
    // Check and start tour on first visit
    this.checkAndStartTour()
    
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
      return this.mainTourSteps
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
      this.product.unit_of_measure_id = data
    }
  },
  created () {
    this.getCategories()
    this.getMeasurementUnits()
  },
  methods: {
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
        this.product.price = parseFloat((this.product.cost * (1 + this.product.profit_percentage / 100)).toFixed(2))
      }
    },
    handleProfitPercentageKeydown (e) {
      e.preventDefault()
      if (e.key >= '0' && e.key <= '9') {
        this.profitPercentageValue = this.profitPercentageValue * 10 + parseInt(e.key)
      } else if (e.key === 'Backspace') {
        this.profitPercentageValue = Math.max(0, Math.floor(this.profitPercentageValue / 10))
      }

      // Calcular precio solo cuando el usuario escribe
      this.formatProfitPercentage()
    },
    initializeProfitPercentage () {
      const profitPercentage = parseFloat(this.product.profit_percentage || 0)
      this.profitPercentageValue = Math.max(0, Math.round(profitPercentage * 100))
      this.profitPercentageDisplay = (this.profitPercentageValue / 100).toFixed(2)
      // No calcular precio automáticamente
    },

    initializePriceListMargin (priceList) {
      const profitPercentage = parseFloat(priceList.profit_percentage || 0)
      priceList.profitPercentageValue = Math.max(0, Math.round(profitPercentage * 100))
      this.formatPriceListMargin(priceList)
    },

    handlePriceListMarginKeydown (e, priceList) {
      e.preventDefault()
      if (e.key >= '0' && e.key <= '9') {
        priceList.profitPercentageValue = (priceList.profitPercentageValue || 0) * 10 + parseInt(e.key)
      } else if (e.key === 'Backspace') {
        priceList.profitPercentageValue = Math.max(0, Math.floor((priceList.profitPercentageValue || 0) / 10))
      }

      // Solo calcular precio cuando el usuario escriba en el margen
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
      // Solo calcular margen si el usuario cambió el precio manualmente
      if (newVal && this.product.cost > 0) {
        const margin = ((newVal - this.product.cost) / this.product.cost) * 100
        this.product.profit_percentage = Number(margin.toFixed(4))
        // Actualizar display del margen
        this.profitPercentageValue = Math.round(this.product.profit_percentage * 100)
        this.profitPercentageDisplay = parseFloat(this.product.profit_percentage || 0).toFixed(2)
      }
    },
    updateCost (newVal) {
      // Mantener el margen constante y recalcular el precio basado en el nuevo costo
      if (newVal && newVal > 0) {
        // Usar el margen existente para calcular el nuevo precio principal
        const currentMargin = parseFloat(this.product.profit_percentage || 0)
        this.product.price = parseFloat((newVal * (1 + currentMargin / 100)).toFixed(2))

        // También actualizar los precios de las listas de precios manteniendo sus márgenes
        this.priceLists.forEach(priceList => {
          if (priceList.profit_percentage != null) {
            const listMargin = parseFloat(priceList.profit_percentage || 0)
            priceList.price = parseFloat((newVal * (1 + listMargin / 100)).toFixed(2))
          }
        })
      } else {
        // Si costo es 0, mantener el margen pero resetear solo el precio
        // El margen se preserva para no perder la configuración
        this.product.price = 0

        // También resetear solo los precios de las listas, manteniendo sus márgenes
        this.priceLists.forEach(priceList => {
          priceList.price = 0
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
      // Reiniciar los parámetros de búsqueda para evitar conflictos
      this.params.dataSearch = {}

      const dataEqualFilter = {}
      const dataSearch = {}

      // Filtros de texto (búsqueda parcial)
      if (this.filters.name) dataSearch.name = this.filters.name
      if (this.filters.description) dataSearch.description = this.filters.description
      if (this.filters.barcode) dataSearch.barcode = this.filters.barcode

      // Filtros de selección (coincidencia exacta)
      if (this.filters.category_id) dataEqualFilter.category_id = this.filters.category_id.id
      if (this.filters.measurement_unit_id) dataEqualFilter.unit_of_measure_id = this.filters.measurement_unit_id.id
      if (this.filters.is_pack !== null) dataEqualFilter.is_bundle = this.filters.is_pack.value
      if (this.filters.is_addon !== null) dataEqualFilter.is_addons = this.filters.is_addon.value
      if (this.filters.show_in_catalog !== null) {
        // Convertir a string para asegurar que el backend procese el valor '0'
        dataEqualFilter.show_catalog = this.filters.show_in_catalog.value === 1
      }

      this.params.dataEqualFilter = dataEqualFilter
      this.params.dataSearch = dataSearch

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
        show_in_catalog: null
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
            this.loadingDownload = 0
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
        this.unitOfMeasures = data.map(unit => ({ label: unit.name, value: unit.id }))
        this.unitOfMeasure = this.unitOfMeasures[0]?.value
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
      this.unitOfMeasure = this.product.unit_of_measure_id
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
        const file = new File([blob], `codigos-qr-productos.pdf`, { type: 'application/pdf' })

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
      this.showTour = false
      this.currentTourStep = 0
      localStorage.setItem('has_seen_product_main_tour', 'true')
      notify('¡Tour completado! Ya conoces cómo gestionar productos.', 'positive', 'check_circle')
    },
    /**
     * Update tour position
     */
    updateTourPosition (retryCount = 0) {
      this.$nextTick(() => {
        const step = this.currentTourSteps[this.currentTourStep]
        if (!step) return

        const element = document.querySelector(step.target)
        if (!element) {
          // Retry up to 5 times with increasing delay
          if (retryCount < 5) {
            console.warn(`Tour element not found: ${step.target}, retrying... (${retryCount + 1}/5)`)
            setTimeout(() => {
              this.updateTourPosition(retryCount + 1)
            }, 200 * (retryCount + 1))
            return
          } else {
            console.error('Tour element not found after retries:', step.target)
            return
          }
        }

        // Scroll to element first
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

        // Wait for scroll to finish before calculating positions
        setTimeout(() => {
          const rect = element.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

          // Update spotlight position
          this.spotlightStyle = {
            top: `${rect.top + scrollTop - 10}px`,
            left: `${rect.left + scrollLeft - 10}px`,
            width: `${rect.width + 20}px`,
            height: `${rect.height + 20}px`
          }

          // Position tour card with better logic
          const cardWidth = 400
          const cardHeight = 280
          const padding = 20
          const viewportHeight = window.innerHeight
          const viewportWidth = window.innerWidth

          let cardTop = rect.bottom + scrollTop + padding
          let cardLeft = rect.left + scrollLeft

          // Special positioning for table - place card at bottom of viewport
          if (step.target === '#tour-tabla-productos' || step.target === '#tour-tabla-productos tbody tr:first-child') {
            cardTop = scrollTop + viewportHeight - cardHeight - padding
            cardLeft = scrollLeft + (viewportWidth - cardWidth) / 2
          } else {
            // If card goes below viewport, position it above the element
            if (rect.bottom + cardHeight + padding > viewportHeight) {
              cardTop = rect.top + scrollTop - cardHeight - padding
            }

            // If still goes above viewport, position it in the middle
            if (cardTop < scrollTop) {
              cardTop = scrollTop + (viewportHeight - cardHeight) / 2
            }

            // Adjust horizontal position
            if (cardLeft + cardWidth > viewportWidth) {
              cardLeft = viewportWidth - cardWidth - padding
            }
            if (cardLeft < 0) {
              cardLeft = padding
            }
          }

          this.tourCardStyle = {
            top: `${cardTop}px`,
            left: `${cardLeft}px`
          }
        }, 300)
      })
    }
  }
}
</script>
<style>

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
  z-index: 10000;
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
  z-index: 10001;
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
  z-index: 10002;
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
</style>
