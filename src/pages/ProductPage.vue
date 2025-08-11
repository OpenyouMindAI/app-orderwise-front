<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right q-gutter-sm">
        <q-btn
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
          color="purple"
          @click="listPriceDialog = true"
          icon="list"
          label="Modificar lista de precios"
        />
        <q-btn
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
          color="primary"
          @click="openAddProduct = true"
          icon="add_circle"
          label="Agregar Producto"
        />
        <q-btn
          color="primary"
          @click="dialogFilter = true"
          icon="filter_alt"
          label="Filtrar Productos"
        />
      </div>
      <div class="col-12">
        <q-table
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
                            :rules="[val => !!val || 'El campo es requerido.']"
                            filled
                            v-model="product.name"
                            label="Nombre"
                            dense
                          />
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                          <q-select
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
                            v-model.number="product.profit_percentage"
                            :model-value="Number(product?.profit_percentage).toFixed(2)"
                            label="Margen %"
                            min="0"
                            dense
                            @update:model-value="updateProfitPercentage"
                          />
                        </div>
                        <div class="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-xs-12">
                          <q-input
                            :rules="[val => !!val || 'El campo es requerido.']"
                            filled
                            v-model="product.price"
                            label="Precio base"
                            type="number"
                            step=".01"
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
                            step=".01"
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
                          <q-card-section class="q-pa-none">
                            <div class="row q-col-gutter-sm items-center">
                              <div class="col-4">
                                <q-input
                                  v-model="priceList.name"
                                  label="Nombre de la lista"
                                  filled
                                  dense
                                  :rules="[val => !!val || 'El precio mínimo es 3']"
                                />
                              </div>
                              <div class="col-5 flex justify-between items-center">
                                <q-input
                                  v-model="priceList.price"
                                  label="Precio"
                                  type="number"
                                  step=".01"
                                  :rules="[val => val >= 1 || 'El precio mínimo es 3']"
                                  filled
                                  dense
                                />
                                <div>
                                  <q-btn
                                    icon="delete"
                                    color="negative"
                                    size="sm"
                                    round
                                    flat
                                    @click="removePriceList(index)"
                                  >
                                    <q-tooltip>Eliminar lista</q-tooltip>
                                  </q-btn>
                                </div>
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
                        <div class="col-6">
                          <q-toggle
                            v-model="product.is_default"
                            label="Predeterminado"
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
                          :rules="[val => !!val || 'El campo es requerido.']"
                          filled
                          v-model="product.name"
                          label="Nombre"
                          dense
                        />
                      </div>
                      <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <q-select
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
                          v-model.number="product.profit_percentage"
                          :model-value="Number(product?.profit_percentage).toFixed(2)"
                          label="Margen %"
                          min="0"
                          dense
                          @update:model-value="updateProfitPercentage"
                        />
                      </div>
                      <div class="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-xs-12">
                        <q-input
                          :rules="[val => !!val || 'El campo es requerido.']"
                          filled
                          v-model="product.price"
                          label="Precio base"
                          type="number"
                          step=".01"
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
                          step=".01"
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
                        flat
                        bordered
                        class="q-mb-sm"
                      >
                        <q-card-section class="q-pa-sm">
                          <div class="row q-col-gutter-sm items-center">
                            <div class="col-5">
                              <q-input
                                v-model="priceList.name"
                                label="Nombre de la lista"
                                filled
                                dense
                                :rules="[val => !!val || 'El precio mínimo es 3']"
                              />
                            </div>
                            <div class="col-5">
                              <q-input
                                v-model="priceList.price"
                                label="Precio"
                                type="number"
                                step=".01"
                                :rules="[val => val >= 1 || 'El precio mínimo es 3']"
                                filled
                                dense
                              />
                            </div>
                            <div class="col-2 text-right">
                              <q-btn
                                icon="delete"
                                color="negative"
                                size="sm"
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
                      <div class="col-6">
                          <q-toggle
                            v-model="product.is_default"
                            label="Predeterminado"
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
        is_default: 0,
        images: []
      },
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
      }
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
    this.getUnitOfMeasures()
  },
  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice'])
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
    updateProfitPercentage (newVal) {
      if (newVal && this.product.cost > 0) {
        const price = this.product.cost * (1 + newVal / 100)
        this.product.price = parseFloat(price.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0])
      }
    },
    updatePrice (newVal) {
      if (newVal && this.product.cost > 0) {
        const margin = ((newVal - this.product.cost) / this.product.cost) * 100
        this.product.profit_percentage = Number(margin.toFixed(4)) // 85.7143%
      }
    },
    updateCost (newVal) {
      if (newVal && this.product.profit_percentage != null) {
        const price = newVal * (1 + this.product.profit_percentage / 100)
        this.product.price = parseFloat(price.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0])
      }
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
        price: null
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
      this.openAddProduct = false
      this.openEditProduct = false
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
      this.openEditProduct = true
      this.product = row
      if (this.product.is_default === null || this.product.is_default === undefined) {
        this.product.is_default = 0
      }
      this.unitOfMeasure = row.unit_of_measure_id
      this.addonsProducts = row.addons
      this.priceLists = row.product_price_lists
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

</style>
