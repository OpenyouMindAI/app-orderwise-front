<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right q-gutter-x-sm">
        <q-btn
          color="teal"
          @click="exportClients"
          icon="download"
          :round="$q.screen.lt.sm"
          :label="$q.screen.gt.xs ? 'Exportar' : ''"
        >
          <q-tooltip v-if="$q.screen.lt.sm">Exportar</q-tooltip>
        </q-btn>
        <q-btn
          color="indigo"
          @click="openImportDialog"
          icon="upload"
          :round="$q.screen.lt.sm"
          :label="$q.screen.gt.xs ? 'Importar' : ''"
        >
          <q-tooltip v-if="$q.screen.lt.sm">Importar</q-tooltip>
        </q-btn>
        <q-btn
          color="primary"
          @click="openNewClientModal"
          icon="add_circle"
          round
        />
      </div>
      <div class="col-12">
        <q-table
          title="Clientes"
          row-key="id"
          :columns="columns"
          :rows="clients"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editClient"
          @request="setPagination"
          no-data-label="Registro no encontrado"
          :grid="$q.screen.lt.md"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top>
            <div class="flex justify-between items-center full-width">
              <div class="text-h6" v-if="$q.screen.gt.xs">Clientes</div>
              <div class="row items-center no-wrap" :class="$q.screen.lt.md ? 'full-width' : ''">
                <q-input
                   filled
                   dense
                   debounce="500"
                   v-model="filter"
                   placeholder="Buscar por nombre o documento..."
                   class="col"
                 >
                   <template v-slot:append>
                     <q-icon name="search" />
                   </template>
                 </q-input>
                 <q-btn
                   flat
                   round
                   color="grey-7"
                   icon="filter_list"
                   class="q-ml-sm"
                   @click="showDrawerFilters = true"
                 >
                   <q-badge v-if="activeFiltersCount > 0" color="primary" floating>{{ activeFiltersCount }}</q-badge>
                 </q-btn>
               </div>
             </div>
           </template>

          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6">
              <q-card
                class="cursor-pointer q-hoverable no-shadow transition-all"
                style="border-radius: 16px; border: 1px solid #eef0f3"
                :class="$q.dark.isActive ? 'bg-dark border-dark' : 'bg-white border-light'"
                @click="editClient(null, props.row)"
              >
                <span class="q-focus-helper"></span>

                <q-card-section class="row justify-between items-start compact-card-header">
                  <div class="column">
                     <div class="text-weight-bold text-body1" :class="$q.dark.isActive ? 'text-indigo-2' : 'text-indigo-10'" style="font-size: 1.1rem; letter-spacing: -0.5px">
                       {{ props.row.name }}
                     </div>
                      <div class="text-caption text-weight-medium" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">
                        {{ props.row.document_number || 'Sin documento' }}
                      </div>
                  </div>
                </q-card-section>

                <q-separator color="grey-2" inset />

                <q-card-section class="compact-card-body">
                  <div class="row q-col-gutter-y-sm">
                    <div class="col-12">
                       <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Contacto</div>
                        <div class="row items-center q-gutter-x-sm">
                          <div class="text-body2 text-weight-bold ellipsis" :class="$q.dark.isActive ? 'text-grey-2' : 'text-grey-9'">
                            <q-icon name="phone" size="14px" color="grey-6" class="q-mr-xs" />
                            {{ props.row.phone_number || '-' }}
                          </div>
                          <div class="text-body2 ellipsis" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                            <q-icon name="email" size="14px" color="grey-6" class="q-mr-xs" />
                            {{ props.row.email || '-' }}
                          </div>
                        </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
          <template v-slot:body-cell-address="props">
            <q-td :props="props">
              <div
                class="address-cell"
                :title="props.value || 'Sin dirección'"
              >
                {{ props.value || 'Sin dirección' }}
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <!-- Dialog: Modificar Cliente -->
    <q-dialog v-model="openEditClient" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column' : ''"
        :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 90vw; border-radius: 16px;'"
      >
        <q-form @submit="saveEdit" class="column full-height">
          <q-card-section class="row items-center text-white bg-primary q-py-md">
            <q-icon name="edit" size="24px" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">Modificar Cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <div class="row q-col-gutter-md">
              <!-- SECCIÓN: INFORMACIÓN BÁSICA -->
              <div class="col-12 q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="person" size="20px" />
                  <span>Información Básica</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12">
                <q-input
                  filled
                  v-model="client.name"
                  label="Nombre Completo *"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  autofocus
                  dense
                >
                  <template v-slot:prepend><q-icon name="account_circle" /></template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.email"
                  type="email"
                  label="Correo Electrónico"
                  dense
                >
                  <template v-slot:prepend><q-icon name="email" /></template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.phone_number"
                  label="Teléfono / WhatsApp"
                  dense
                >
                  <template v-slot:prepend><q-icon name="phone" /></template>
                </q-input>
              </div>

              <!-- SECCIÓN: IDENTIFICACIÓN Y FISCAL -->
              <div class="col-12 q-mt-sm q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="badge" size="20px" />
                  <span>Identificación y Datos Fiscales</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12 col-sm-6" style="position: relative;">
                <div
                  v-if="(subscriptionPlan || 'Free') === 'Free'"
                  class="absolute-full"
                  style="z-index: 10; cursor: pointer;"
                  @click.stop="handleRestrictedClick"
                ></div>
                <premium-badge
                  :show="(subscriptionPlan || 'Free') === 'Free'"
                  :size="15"
                  top="0px"
                  right="4px"
                  padding="4px"
                />
                <q-select
                  filled
                  use-input
                  label="Tipo de documento"
                  option-label="Desc"
                  option-value="id"
                  v-model="client.document_type"
                  :options="documentTypes"
                  @filter="getDocumentTypes"
                  :disable="(subscriptionPlan || 'Free') === 'Free'"
                  dense
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.document_number"
                  label="Número de documento"
                  dense
                />
              </div>

              <div class="col-12" style="position: relative;">
                <div
                  v-if="(subscriptionPlan || 'Free') === 'Free'"
                  class="absolute-full"
                  style="z-index: 10; cursor: pointer;"
                  @click.stop="handleRestrictedClick"
                ></div>
                <premium-badge
                  :show="(subscriptionPlan || 'Free') === 'Free'"
                  :size="15"
                  top="0px"
                  right="4px"
                  padding="4px"
                />
                <q-select
                  filled
                  use-input
                  label="Condición de IVA"
                  option-label="name"
                  option-value="code"
                  v-model="client.condition_iva_receptor"
                  :options="conditionIvaReceptors"
                  @filter="getConditionIvaReceptor"
                  :disable="(subscriptionPlan || 'Free') === 'Free'"
                  dense
                />
              </div>

              <!-- SECCIÓN: ACCESO Y SEGURIDAD -->
              <div class="col-12 q-mt-sm q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="lock" size="20px" />
                  <span>Acceso al Sistema</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.username"
                  label="Usuario"
                  autocomplete="off"
                  name="client-username"
                  dense
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Contraseña"
                  autocomplete="new-password"
                  name="client-password"
                  dense
                >
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>

              <!-- SECCIÓN: UBICACIÓN Y CONTACTO -->
              <div class="col-12 q-mt-sm q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="location_on" size="20px" />
                  <span>Ubicación y Referencias</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12">
                <AddressComponent
                  :key="addressComponentKey"
                  :initial-address="address"
                  @address-selected="handleAddressSelected"
                />
              </div>

              <div class="col-12">
                <q-input
                  filled
                  v-model="client.reference"
                  label="Referencia / Observaciones"
                  dense
                  type="textarea"
                  rows="2"
                />
              </div>

              <!-- SECCIÓN: CONFIGURACIÓN ADICIONAL -->
              <div class="col-12 q-mt-sm q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="settings" size="20px" />
                  <span>Configuración Adicional</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12 row items-center q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-checkbox v-model="client.is_partner" label="¿Es Afiliado?" dense color="primary" class="full-width" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-checkbox v-model="client.is_credit" label="Habilitar Cuenta Corriente" dense color="primary" class="full-width" />
                </div>
              </div>

              <div class="col-12" v-if="!client.is_partner">
                <q-select
                  filled
                  v-model="client.partner"
                  label="Seleccionar Afiliado Asignado"
                  :options="partners"
                  @filter="getPartners"
                  use-input
                  option-label="name"
                  option-value="id"
                  dense
                >
                  <template v-slot:prepend><q-icon name="group" /></template>
                </q-select>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              flat
              icon="delete"
              color="negative"
              label="Eliminar Cliente"
              @click="deleteClient"
              :loading="visible"
              class="q-px-md"
            />
            <q-btn
              unelevated
              icon="save"
              color="primary"
              label="Guardar Cambios"
              type="submit"
              :loading="visible"
              class="q-px-lg"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog: Agregar Cliente -->
    <q-dialog v-model="openAddClient" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column' : ''"
        :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 90vw; border-radius: 16px;'"
      >
        <q-form @submit="saveClient" class="column full-height">
          <q-card-section class="row items-center text-white bg-primary q-py-md">
            <q-icon name="person_add" size="24px" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">Agregar Cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <div class="row q-col-gutter-md">
              <!-- SECCIÓN: INFORMACIÓN BÁSICA -->
              <div class="col-12 q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="person" size="20px" />
                  <span>Información Básica</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12">
                <q-input
                  filled
                  v-model="client.name"
                  label="Nombre Completo *"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  autofocus
                  dense
                >
                  <template v-slot:prepend><q-icon name="account_circle" /></template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.email"
                  type="email"
                  label="Correo Electrónico"
                  dense
                >
                  <template v-slot:prepend><q-icon name="email" /></template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.phone_number"
                  label="Teléfono / WhatsApp"
                  dense
                >
                  <template v-slot:prepend><q-icon name="phone" /></template>
                </q-input>
              </div>

              <!-- SECCIÓN: IDENTIFICACIÓN Y FISCAL -->
              <div class="col-12 q-mt-sm q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="badge" size="20px" />
                  <span>Identificación y Datos Fiscales</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12 col-sm-6" style="position: relative;">
                <div
                  v-if="(subscriptionPlan || 'Free') === 'Free'"
                  class="absolute-full"
                  style="z-index: 10; cursor: pointer;"
                  @click.stop="handleRestrictedClick"
                ></div>
                <premium-badge
                  :show="(subscriptionPlan || 'Free') === 'Free'"
                  :size="15"
                  top="0px"
                  right="4px"
                  padding="4px"
                />
                <q-select
                  filled
                  use-input
                  label="Tipo de documento"
                  option-label="Desc"
                  option-value="id"
                  v-model="client.document_type"
                  :options="documentTypes"
                  @filter="getDocumentTypes"
                  :disable="(subscriptionPlan || 'Free') === 'Free'"
                  dense
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.document_number"
                  label="Número de documento"
                  dense
                />
              </div>

              <div class="col-12" style="position: relative;">
                <div
                  v-if="(subscriptionPlan || 'Free') === 'Free'"
                  class="absolute-full"
                  style="z-index: 10; cursor: pointer;"
                  @click.stop="handleRestrictedClick"
                ></div>
                <premium-badge
                  :show="(subscriptionPlan || 'Free') === 'Free'"
                  :size="15"
                  top="0px"
                  right="4px"
                  padding="4px"
                />
                <q-select
                  filled
                  use-input
                  label="Condición de IVA"
                  option-label="name"
                  option-value="code"
                  v-model="client.condition_iva_receptor"
                  :options="conditionIvaReceptors"
                  @filter="getConditionIvaReceptor"
                  :disable="(subscriptionPlan || 'Free') === 'Free'"
                  dense
                />
              </div>

              <!-- SECCIÓN: ACCESO Y SEGURIDAD -->
              <div class="col-12 q-mt-sm q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="lock" size="20px" />
                  <span>Acceso al Sistema</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.username"
                  label="Usuario"
                  autocomplete="off"
                  name="new-client-username"
                  dense
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="client.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  name="new-client-password"
                  label="Contraseña"
                  dense
                >
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>

              <!-- SECCIÓN: UBICACIÓN Y CONTACTO -->
              <div class="col-12 q-mt-sm q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="location_on" size="20px" />
                  <span>Ubicación y Referencias</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12">
                <AddressComponent
                  :key="addressComponentKey"
                  :initial-address="address"
                  @address-selected="handleAddressSelected"
                />
              </div>

              <div class="col-12">
                <q-input
                  filled
                  v-model="client.reference"
                  label="Referencia / Observaciones"
                  dense
                  type="textarea"
                  rows="2"
                />
              </div>

              <!-- SECCIÓN: CONFIGURACIÓN ADICIONAL -->
              <div class="col-12 q-mt-sm q-mb-xs">
                <div class="text-subtitle2 text-primary row items-center q-gutter-x-xs">
                  <q-icon name="settings" size="20px" />
                  <span>Configuración Adicional</span>
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="col-12 row items-center q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-checkbox v-model="client.is_partner" label="¿Es Afiliado?" dense color="primary" class="full-width" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-checkbox v-model="client.is_credit" label="Habilitar Cuenta Corriente" dense color="primary" class="full-width" />
                </div>
              </div>

              <div class="col-12" v-if="!client.is_partner">
                <q-select
                  filled
                  v-model="client.partner"
                  label="Seleccionar Afiliado Asignado"
                  :options="partners"
                  @filter="getPartners"
                  use-input
                  option-label="name"
                  option-value="id"
                  dense
                >
                  <template v-slot:prepend><q-icon name="group" /></template>
                </q-select>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              unelevated
              icon="save"
              color="primary"
              label="Crear Cliente"
              type="submit"
              :loading="visible"
              class="q-px-lg"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Import Dialog -->
    <q-dialog v-model="showImportDialog" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column' : ''"
        :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 90vw;'"
      >
        <!-- Header -->
        <q-card-section class="row items-center text-white bg-indigo">
          <q-icon name="upload_file" size="md" class="q-mr-sm" />
          <div class="text-h6">Importar Clientes</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeImportDialog" />
        </q-card-section>

        <!-- Content -->
        <q-card-section class="q-pa-lg">
          <!-- Step 1: Download Template -->
          <div class="import-step q-mb-lg">
            <div class="row items-center q-mb-md">
              <div class="import-step-number">1</div>
              <div class="text-subtitle1 text-weight-medium">Descarga la plantilla (opcional)</div>
            </div>
            <q-btn
              unelevated
              color="primary"
              icon="download"
              label="Descargar Plantilla Excel"
              @click="exportClients"
              class="full-width"
              style="border-radius: 8px;"
              size="md"
            />
            <div class="text-caption text-grey-7 q-mt-sm q-ml-sm">
              Exporta tus clientes actuales como plantilla o descarga una vacía
            </div>
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
                ref="fileInputImport"
                type="file"
                accept=".xlsx,.xls,.csv"
                @change="handleFileSelect"
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
                  Formatos: .xlsx, .xls, .csv • Máx. 10MB
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
                      {{ formatFileSize(importFile.size) }} • {{ importPreview.length }} registros
                    </div>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    color="grey-7"
                    @click.stop="removeImportFile"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="importPreview.length > 0" class="import-step">
            <div class="row items-center q-mb-md">
              <div class="import-step-number">3</div>
              <div class="text-subtitle1 text-weight-medium">Vista previa</div>
            </div>
            <q-card flat bordered class="preview-card">
              <q-list separator>
                <q-item v-for="(client, index) in importPreview.slice(0, 5)" :key="index">
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" size="sm">
                      {{ index + 1 }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ client.name }}</q-item-label>
                    <q-item-label caption>{{ client.email || 'Sin email' }} • {{ client.document_number || 'Sin documento' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-separator />
              <div class="q-pa-sm text-center text-caption text-grey-7">
                Mostrando 5 de {{ importPreview.length }} registros
              </div>
            </q-card>
          </div>
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
            @click="importClients"
            :disable="!importFile"
            :loading="importLoading"
            icon-right="upload"
            class="q-px-xl"
            style="border-radius: 8px;"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Import Results Dialog -->
    <q-dialog v-model="showImportResults">
      <q-card style="width: 600px; max-width: 80vw;">
        <q-card-section class="row items-center text-white" :class="importResults.errors.length > 0 ? 'bg-orange' : 'bg-positive'">
          <q-icon :name="importResults.errors.length > 0 ? 'warning' : 'check_circle'" size="md" class="q-mr-sm" />
          <div class="text-h6">Resultado de la importación</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <p class="text-body1">
              <strong>Importados:</strong> {{ importResults.imported }} clientes
            </p>
            <p class="text-body1" v-if="importResults.skipped > 0">
              <strong>Omitidos:</strong> {{ importResults.skipped }} clientes (ya existían)
            </p>
          </div>

          <div v-if="importResults.errors.length > 0">
            <p class="text-body2 text-weight-bold text-negative">Errores:</p>
            <q-list bordered separator dense>
              <q-item v-for="(error, index) in importResults.errors" :key="index">
                <q-item-section>
                  <q-item-label caption>Fila {{ error.row }}</q-item-label>
                  <q-item-label class="text-negative">{{ error.message }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Cerrar"
            color="primary"
            v-close-popup
            @click="getClients()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <subscription-plans-dialog
      v-model="showSubscriptionDialog"
      @subscription-updated="loadSubscriptionInfo"
    />

    <!-- Filter Dialog -->
    <q-dialog v-model="showDrawerFilters" position="right" full-height>
      <q-card style="width: 450px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-md text-white bg-primary">
          <div class="text-h6">Filtros Avanzados</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-scroll-area style="height: calc(100% - 130px);">
          <q-card-section class="q-gutter-y-md">
            <!-- Search by Name -->
            <div class="filter-item">
              <div class="text-subtitle2 q-mb-xs">Nombre</div>
              <q-input
                filled
                dense
                v-model="params.dataSearch.name"
                placeholder="Ej: Juan Perez"
                @update:model-value="applyFilters"
              >
                <template v-slot:prepend><q-icon name="person" size="xs" /></template>
              </q-input>
            </div>

            <!-- Search by Email -->
            <div class="filter-item">
              <div class="text-subtitle2 q-mb-xs">Correo Electrónico</div>
              <q-input
                filled
                dense
                v-model="params.dataSearch.email"
                placeholder="Ej: cliente@correo.com"
                @update:model-value="applyFilters"
              >
                <template v-slot:prepend><q-icon name="email" size="xs" /></template>
              </q-input>
            </div>

            <!-- Client Type / Mode -->
            <div class="filter-item">
              <div class="text-subtitle2 q-mb-xs">Tipo de Cliente</div>
              <q-btn-toggle
                v-model="params.onlyClients"
                toggle-color="primary"
                flat
                stretch
                class="full-width no-shadow border-grey"
                @update:model-value="handlePartnerModeChange"
                :options="[
                  { label: 'Empresa', value: true },
                  { label: 'Afiliados', value: false }
                ]"
              />
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ params.onlyClients ? 'Mostrando clientes directos y socios.' : 'Mostrando exclusivamente clientes de socios.' }}
              </div>
            </div>

            <!-- Specific Partner Filter -->
            <div class="filter-item" v-if="userSession.is_root">
              <div class="text-subtitle2 q-mb-xs">Filtrar por Afiliado</div>
              <q-select
                filled
                dense
                v-model="selectedPartnerFilter"
                label="Seleccionar Afiliado"
                :options="partners"
                @filter="getPartners"
                @update:model-value="applyPartnerFilter"
                use-input
                option-label="name"
                option-value="id"
                clearable
              >
                <template v-slot:prepend><q-icon name="group" size="xs" /></template>
              </q-select>
            </div>

            <!-- Is Partner Toggle -->
            <div class="filter-item">
              <q-item tag="label" class="q-pa-none" v-ripple>
                <q-item-section>
                  <q-item-label>Mostrar solo Socios/Afiliados</q-item-label>
                  <q-item-label caption>Filtra registros que son prestadores.</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="filterIsPartner"
                    color="primary"
                    @update:model-value="applyFilters"
                  />
                </q-item-section>
              </q-item>
            </div>
          </q-card-section>
        </q-scroll-area>

        <q-separator />

        <q-card-actions align="between" class="q-pa-md">
          <q-btn flat label="Limpiar Filtros" color="negative" @click="clearFilters" />
          <q-btn unelevated label="Aplicar" color="primary" v-close-popup @click="applyFilters" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { apiArca } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
import PremiumBadge from 'src/components/PremiumBadge.vue'
import SubscriptionPlansDialog from 'src/components/SubscriptionPlansDialog.vue'
import * as XLSX from 'xlsx'
import eventBus from 'src/utils/eventBus'
export default {
  components: {
    AddressComponent,
    PremiumBadge,
    SubscriptionPlansDialog
  },
  data () {
    return {
      store: authentication(),
      clients: [],
      documentTypes: [],
      client: {},
      filter: '',
      showImportDialog: false,
      importFile: null,
      importPreview: [],
      importLoading: false,
      isDragging: false,
      showPassword: false,
      showImportResults: false,
      importResults: {
        imported: 0,
        skipped: 0,
        errors: []
      },
      showSubscriptionDialog: false,
      partners: [],
      /**
       * Address component key for resetting
       * @type {Number}
       */
      addressComponentKey: 0,
      /**
       * Address object
       * @type {Object}
       */
      address: null,
      /**
       * Formatted address string
       * @type {String}
       */
      formattedAddress: '',
      showDrawerFilters: false,
      filterPartnerMode: null, // 'clients', 'partners', 'partner_clients'
      selectedPartnerFilter: null,
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 20,
        onlyClients: true,
        partner_id: null,
        dataSearch: {
          name: '',
          email: '',
          phone_number: '',
          document_number: ''
        },
        dataEqualFilter: {
          is_partner: null
        }
      },
      filterIsPartner: false,
      visible: false,
      openAddClient: false,
      openEditClient: null,
      conditionIvaReceptors: [],
      columns: [
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'document_number',
          align: 'left',
          label: 'Número de documento',
          field: 'document_number',
          format: (value) => value || '-',
          sortable: true
        },
        {
          name: 'phone_number',
          align: 'left',
          label: 'Número de teléfono',
          field: 'phone_number',
          format: (value) => value || '-',
          sortable: true
        },
        {
          name: 'email',
          align: 'left',
          label: 'Correo',
          field: 'email',
          format: (value) => value || '-',
          sortable: true
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
    this.loadClients()
  },
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  computed: {
    ...mapState(authentication, ['userSession', 'subscriptionPlan', 'isDemo']),
    /**
     * Checks if the current user is an administrator
     * @returns {Boolean} True if user is root or super admin
     */
    /* isAdmin () {
      return this.userSession?.is_root || this.userSession?.is_super_admin
    } */
    activeFiltersCount () {
      let count = 0
      if (this.params.dataSearch.name) count++
      if (this.params.dataSearch.email) count++
      if (this.params.partner_id) count++
      if (this.filterIsPartner) count++
      if (this.params.onlyClients === false) count++
      return count
    }
  },
  methods: {
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddClient = false
      this.openEditClient = false

      // Limpiar completamente el cliente
      this.client = {
        name: '',
        document_number: '',
        email: '',
        phone_number: '',
        address: '',
        condition_iva_receptor: null,
        document_type: null,
        is_credit: true,
        partner: null,
        username: '',
        password: ''
      }
      this.role = null
      this.showPassword = false

      // Limpiar las variables de dirección
      this.address = null
      this.formattedAddress = ''
      this.addressComponentKey += 1
    },
    /**
     * Open new client modal with clean form
     */
    openNewClientModal () {
      // Limpiar completamente antes de abrir
      this.client = {
        name: '',
        document_number: '',
        email: '',
        phone_number: '',
        address: '',
        condition_iva_receptor: null,
        document_type: null,
        is_credit: true,
        is_partner: true,
        partner: null,
        username: '',
        password: ''
      }
      this.role = null
      this.showPassword = false
      this.address = null
      this.formattedAddress = ''
      this.addressComponentKey += 1

      // Abrir modal
      this.openAddClient = true
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
      this.getClients(this.params)
    },
    /**
     * Handle restricted feature click
     */
    handleRestrictedClick () {
      if (this.isDemo) {
        eventBus.emit('open-create-company')
      } else {
        this.showSubscriptionDialog = true
      }
    },
    /**
     * Load subscription info
     */
    async loadSubscriptionInfo () {
      await this.store.loadSubscriptionInfo()
    },
    /**
     * Get all clients
     */
    getClients (params = this.params) {
      this.visible = true
      // params.onlyClients = Boolean(!this.store.partnerMode)
      this.$api.get('clients', { params })
        .then(({ data }) => {
          this.clients = data.data
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
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
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
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
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    /**
     * Get partners
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getPartners (value, update) {
      try {
        const { data } = await this.$api.get('partners', {
          params: {
            dataSearch: {
              name: value,
              document_number: value
            },
            paginate: true,
            page: 1,
            perPage: 20,
            sortBy: 'id',
            sortOrder: 'desc'
          }
        })
        update(() => {
          this.partners = data.data
        })
      } catch (err) {
        notify('Error en la conexión', 'negative', 'warning')
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
      this.getClients(this.params)
    },
    /**
     * Save clients
     */
    saveClient () {
      this.visible = true

      const clientData = { ...this.client }

      if (clientData.condition_iva_receptor && typeof clientData.condition_iva_receptor === 'object') {
        clientData.condition_iva_receptor = JSON.stringify(clientData.condition_iva_receptor)
      }

      if (clientData.document_type && typeof clientData.document_type === 'object') {
        clientData.document_type = JSON.stringify(clientData.document_type)
      }

      if (clientData.is_partner === false || clientData.is_partner === 0) {
        if (clientData?.partner?.id) {
          clientData.partner_id = clientData.partner.id
        }
      }

      clientData.address = this.address || this.client.address || null

      this.$api.post('clients', clientData)
        .then(({ data }) => {
          this.getClients()
          this.openAddClient = false
          this.visible = false
          this.client = {}
          this.role = null
          this.address = null
          this.formattedAddress = ''
          this.addressComponentKey += 1
          Notify.create({
            message: 'Cliente creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false

          let errorMessage = err.message
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message
          }
          Notify.create({
            message: `Error: ${errorMessage}`,
            icon: 'warning',
            color: 'negative',
            timeout: 8000
          })
        })
    },
    /**
     * View client
     */
    editClient (event, row, index) {
      this.openEditClient = true
      this.client = row
      this.role = row.role
      this.client.condition_iva_receptor = row.condition_iva_receptor ? JSON.parse(row.condition_iva_receptor) : null
      this.client.document_type = row.document_type ? JSON.parse(row.document_type) : null
      this.client.is_partner = Boolean(row.is_partner)
      this.client.partner = row.partner
      this.address = row.address
      // Incrementar la clave para forzar re-renderización del AddressComponent
      this.addressComponentKey += 1
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true

      const clientData = { ...this.client }

      if (clientData.is_partner === false || clientData.is_partner === 0) {
        if (clientData?.partner?.id) {
          clientData.partner_id = clientData.partner.id
        }
      }

      clientData.address = this.address || this.client.address || null

      this.$api.put(`clients/${this.client.id}`, clientData)
        .then(({ data }) => {
          this.getClients()
          this.openEditClient = false
          this.visible = false
          this.client = {}
          this.role = null
          // Limpiar las variables de dirección
          this.address = null
          this.formattedAddress = ''
          this.addressComponentKey += 1
          Notify.create({
            message: 'Cliente editado exitosamente',
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
     * Delete client
     */
    deleteClient () {
      this.visible = true
      this.$api.delete(`clients/${this.client.id}`)
        .then(({ data }) => {
          this.getClients()
          this.openEditClient = false
          this.visible = false
          this.client = {}
          Notify.create({
            message: 'Cliente eliminada exitosamente',
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
     * Handle address selection from AddressComponent
     * @param {String} selectedAddress - The selected address
     */
    handleAddressSelected (address) {
      // Si la dirección es nula, reiniciar el objeto de dirección
      if (!address) {
        this.address = null
        this.formattedAddress = ''
        return
      }

      // Actualizar los campos de dirección para el formulario
      this.address = address
    },
    /**
     * Export clients to Excel
     */
    async exportClients () {
      try {
        this.visible = true
        const { data } = await this.$api.post('clients/export')

        if (!data.data || data.data.length === 0) {
          Notify.create({
            message: 'No hay clientes para exportar',
            icon: 'warning',
            color: 'orange'
          })
          this.visible = false
          return
        }

        // Create worksheet from data
        const ws = XLSX.utils.json_to_sheet(data.data)

        // Create workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes')

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10)
        const filename = `clientes_${timestamp}.xlsx`

        // Download file
        XLSX.writeFile(wb, filename)

        this.visible = false
        Notify.create({
          message: `${data.total} clientes exportados exitosamente`,
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (err) {
        this.visible = false
        console.error('Error exporting clients:', err)
        Notify.create({
          message: err.response?.data?.message || 'Error al exportar clientes',
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Open import dialog
     */
    openImportDialog () {
      this.showImportDialog = true
      this.importFile = null
      this.importPreview = []
    },
    /**
     * Close import dialog
     */
    closeImportDialog () {
      this.showImportDialog = false
      this.importFile = null
      this.importPreview = []
      this.isDragging = false
    },
    /**
     * Trigger file input click
     */
    triggerFileInput () {
      this.$refs.fileInputImport?.click()
    },
    /**
     * Handle file drop
     */
    handleFileDrop (e) {
      this.isDragging = false
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.importFile = files[0]
        this.handleFileSelect({ target: { files: [files[0]] } })
      }
    },
    /**
     * Remove import file
     */
    removeImportFile () {
      this.importFile = null
      this.importPreview = []
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
     * Handle file selection and preview
     */
    async handleFileSelect (event) {
      const file = event.target?.files?.[0] || event
      if (!file) {
        this.importPreview = []
        return
      }

      this.importFile = file

      try {
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })

            // Get first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(firstSheet)

            this.importPreview = jsonData

            if (jsonData.length === 0) {
              Notify.create({
                message: 'El archivo está vacío',
                icon: 'warning',
                color: 'orange'
              })
            }
          } catch (err) {
            console.error('Error parsing file:', err)
            Notify.create({
              message: 'Error al leer el archivo',
              icon: 'warning',
              color: 'negative'
            })
          }
        }

        reader.readAsArrayBuffer(file)
      } catch (err) {
        console.error('Error reading file:', err)
        Notify.create({
          message: 'Error al procesar el archivo',
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Import clients from file
     */
    async importClients () {
      if (this.importPreview.length === 0) {
        Notify.create({
          message: 'No hay datos para importar',
          icon: 'warning',
          color: 'orange'
        })
        return
      }

      try {
        this.importLoading = true

        const { data } = await this.$api.post('clients/import', {
          clients: this.importPreview
        })

        this.importResults = {
          imported: data.imported,
          skipped: data.skipped,
          errors: data.errors || []
        }

        this.showImportDialog = false
        this.showImportResults = true
        this.importLoading = false

        Notify.create({
          message: data.message,
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (err) {
        this.importLoading = false
        console.error('Error importing clients:', err)
        Notify.create({
          message: err.response?.data?.message || 'Error al importar clientes',
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Initial load and state handling
     */
    async loadClients () {
      if (this.userSession?.is_partner) {
        this.params.onlyClients = false
      }
      this.setPagination({
        pagination: this.paginationConfig,
        filter: undefined
      })
    },
    /**
     * Apply all current filters
     */
    applyFilters () {
      this.params.page = 1
      this.params.is_partner = this.filterIsPartner ? 1 : null
      this.getClients()
    },
    /**
     * Handle change in partner mode (Empresa vs Clientes de Afiliados)
     */
    handlePartnerModeChange (val) {
      if (val) {
        // Mode Empresa: clear partner filter to show all company clients/partners
        this.params.partner_id = null
        this.selectedPartnerFilter = null
      }
      this.applyFilters()
    },
    /**
     * Apply specific partner filter
     */
    applyPartnerFilter (val) {
      if (val) {
        this.params.partner_id = val.id
        // When filtering by a specific partner, we usually want to see THEIR clients
        this.params.onlyClients = false
      } else {
        this.params.partner_id = null
      }
      this.applyFilters()
    },
    /**
     * Reset all filters to default
     */
    clearFilters () {
      this.filter = ''
      this.params.dataSearch = {
        name: '',
        email: '',
        phone_number: '',
        document_number: ''
      }
      this.params.is_partner = null
      this.filterIsPartner = false
      this.params.onlyClients = true
      this.params.partner_id = null
      this.selectedPartnerFilter = null
      this.applyFilters()
    }
    /**
     * Toggle partner mode
     */
    /* async togglePartnerMode () {
      await this.store.togglePartnerMode()
      this.getClients()
    } */
  }
}
</script>

<style scoped>
.address-cell {
  width: 250px;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
}

.address-cell:hover {
  color: var(--q-primary);
}

.filter-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  transition: all 0.3s ease;
}

.body--dark .filter-item {
  background: #1d1d1d;
  border-color: #333;
}

.border-grey {
  border: 1px solid #ddd;
  border-radius: 8px;
}

.body--dark .border-grey {
  border-color: #444;
}

/* Clases para tarjetas compactas (Consistencia con InvoicePage) */
.compact-card-header {
  padding: 0.5rem 1rem !important;
}

.compact-card-body {
  padding: 0.5rem 1rem !important;
}

@media (max-width: 1023px) {
  /* Reducir padding del top de la tabla */
  :deep(.q-table__top) {
    padding: 0.5rem !important;
  }
}

.border-light {
  border-color: #eef0f3 !important;
}

.border-dark {
  border-color: #333 !important;
}

/* Import Dialog Styles */
.import-close-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.import-close-btn:hover {
  opacity: 1;
}

.opacity-70 {
  opacity: 0.7;
}

.import-step {
  position: relative;
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

.preview-card {
  border-radius: 8px;
  overflow: hidden;
}
</style>
