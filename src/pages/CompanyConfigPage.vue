<template>
  <q-page class="minimalist-config">
    <!-- Tour Overlay -->
    <div v-if="showTour" class="tour-overlay">
      <div class="tour-spotlight" :style="spotlightStyle"></div>
      <q-card class="tour-card" :style="tourCardStyle">
        <q-card-section class="tour-header">
          <div class="tour-step-indicator">Paso {{ currentTourStep + 1 }} de {{ tourSteps.length }}</div>
          <q-btn flat round dense icon="close" @click="skipTour" color="grey-7" size="sm" />
        </q-card-section>
        <q-card-section>
          <div class="tour-title">{{ tourSteps[currentTourStep].title }}</div>
          <div class="tour-description">{{ tourSteps[currentTourStep].description }}</div>
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
            :label="currentTourStep === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'"
            @click="nextTourStep"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </div>

    <div class="config-container">
      <!-- Progress Header -->
      <div class="progress-header">
        <div class="progress-content">
          <span class="main-title text-h6">Configuración</span>
          <p class="main-subtitle">Configura tu empresa en {{ totalSteps }} pasos simples</p>

          <div class="progress-bar-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${(step / totalSteps) * 100}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ step }} de {{ totalSteps }}</span>
          </div>
        </div>
      </div>

      <!-- Steps Navigation -->
      <div class="steps-nav">
        <div
          v-for="stepItem in steps"
          :key="stepItem.number"
          :id="`tour-step-${stepItem.number}`"
          class="step-nav-item"
          :class="{
            'active': step === stepItem.number,
            'completed': step > stepItem.number
          }"
          @click="step = stepItem.number"
        >
          <div class="step-nav-icon">
            <q-icon
              :name="step > stepItem.number ? 'check' : stepItem.icon"
              size="16px"
            />
          </div>
          <span class="step-nav-label">{{ stepItem.title }}</span>
        </div>
      </div>

      <!-- Step Content -->
      <div class="step-content">
        <!-- Step 1: Company Information -->
        <div v-if="step === 1" class="step-card">
          <div class="step-header">
            <h2>Información básica</h2>
            <p>Los datos esenciales de tu empresa</p>
          </div>

          <q-form @submit="onSubmit" class="step-form">
            <!-- Logo Upload -->
            <div class="logo-section">
              <div class="upload-label">Logo de la empresa</div>
              <div class="logo-preview" @click="triggerLogoUpload">
                <q-img
                  :src="file.url || logo.white"
                  class="logo-image"
                  fit="contain"
                >
                  <div class="logo-overlay">
                    <q-icon name="photo_camera" size="18px" />
                    <span>Cambiar logo</span>
                  </div>
                </q-img>
              </div>
              <file-button-component
                ref="logoUploader"
                @upload="onUpload"
                style="display: none"
              />
            </div>

            <!-- Form Fields -->
            <div class="form-grid">
              <div class="form-group">
                <label class="field-label">
                  Nombre de la empresa
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Nombre legal o comercial de tu empresa que aparecerá en facturas y documentos
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="company.name"
                  outlined
                  dense
                  class="custom-input"
                  :rules="[val => val && val.length > 0 || 'Requerido']"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Documento
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      CUIT, RUT o número de identificación fiscal de tu empresa
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="company.document_number"
                  outlined
                  dense
                  class="custom-input"
                  :rules="[val => val && val.length > 0 || 'Requerido']"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Email
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Correo electrónico principal de contacto de la empresa
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="company.email"
                  outlined
                  dense
                  type="email"
                  class="custom-input"
                  :rules="[val => val && val.length > 0 || 'Requerido']"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Teléfono
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Número de teléfono principal de la empresa para contacto con clientes
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="company.phone_number"
                  outlined
                  dense
                  class="custom-input"
                  :rules="[val => val && val.length > 0 || 'Requerido']"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Rubro
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Tipo de negocio o actividad comercial (Restaurante, Farmacia, Supermercado, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="company.business_type"
                  :options="businessTypes"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="filterBusinessTypes"
                />
              </div>

              <div class="form-group full-width">
                <label class="field-label">
                  Dirección
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Dirección física de tu empresa. Usa el buscador para mayor precisión
                    </q-tooltip>
                  </q-icon>
                </label>
                <AddressComponent
                  :key="addressComponentKey"
                  :initial-address="address"
                  @address-selected="handleAddressSelected"
                />
              </div>
            </div>

            <div class="step-actions">
              <div></div>
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn q-mt-sm"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 6: Printer Configuration -->
        <div v-if="step === 6" class="step-card">
          <div class="step-header">
            <h2>Dispositivos</h2>
            <p>Configura tu impresora y balanza</p>
          </div>

          <q-form @submit="onSubmitConfig" class="step-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="field-label">
                  Código de balanza
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Código identificador de tu balanza electrónica para integración con el sistema
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.other.balance_code"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>

              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                    v-model="companyConfig.other.directPrint"
                    label="Impresión directa"
                    color="primary"
                  />
                  <p class="checkbox-description">Activar impresión automática</p>
                </div>
              </div>

              <div class="form-group">
                <label class="field-label">
                  Impresora
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Selecciona la impresora predeterminada para tickets y facturas
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.printer"
                  :options="printers"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  class="custom-input"
                  @filter="filterPrinters"
                />
              </div>
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = getPreviousStep(step)"
                class="action-btn-secondary"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 3: Default Values -->
        <div v-if="step === 3" class="step-card">
          <div class="step-header">
            <h2>Valores por defecto</h2>
            <p>Configuración para facturación</p>
          </div>

          <q-form @submit="onSubmitConfig" class="step-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="field-label">
                  Cliente
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Cliente predeterminado para facturas (ej: Consumidor Final)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.client"
                  :options="clients"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="filterClients"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Tipo de factura
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Tipo de comprobante predeterminado (Factura, Ticket, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.invoiceType"
                  :options="invoiceTypes"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="filterInvoiceTypes"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Tipo de servicio
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Categoría de servicio que ofrece tu empresa (Gastronomía, Retail, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.typeOfService"
                  :options="typeOfServices"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="filterTypeOfServices"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Método de pago
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Método de pago predeterminado (Efectivo, Tarjeta, Transferencia, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.paymentMethod"
                  :options="paymentMethods"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  class="custom-input"
                  @filter="filtersPaymentMethods"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Moneda
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Moneda predeterminada para tus transacciones (ARS, USD, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.coin"
                  :options="coins"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  class="custom-input"
                  @filter="filterCoins"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Tipo de concepto
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Concepto fiscal para AFIP/ARCA (Productos, Servicios, Productos y Servicios)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.other.concept_type"
                  :options="conceptTypes"
                  option-label="Desc"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="getConceptTypes"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Tipo de factura (Arca)
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Tipo de comprobante para facturación electrónica AFIP (A, B, C, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.other.voucher_type"
                  :options="voucherTypes"
                  option-label="Desc"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="getVoucherTypes"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  IVA (%)
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Alícuota de IVA predeterminada (21%, 10.5%, Exento, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.other.aliquot_type"
                  :options="aliquotTypes"
                  option-label="Desc"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="getAliquotTypes"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Inicio de actividades
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Fecha de inicio de actividades de tu empresa ante AFIP
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.other.activity_start_date"
                  outlined
                  dense
                  type="date"
                  class="custom-input"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Ingresos brutos
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Número de inscripción en Ingresos Brutos (IIBB)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.other.income_brut"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Punto de venta
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Número de punto de venta asignado por AFIP para facturación electrónica
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.point_of_sale"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>
              <div class="form-group">
              </div>

              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                  v-model="companyConfig.other.partial_billing"
                  label="Facturación parcial"
                  color="primary"
                  />
                  <p class="checkbox-description">Permitir facturación parcial</p>
                </div>
              </div>
              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                    v-model="companyConfig.other.open_cashbox"
                    label="Arqueo de caja"
                    color="primary"
                  />
                  <p class="checkbox-description">Permitir arqueo de caja</p>
                </div>
              </div>
              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                    v-model="companyConfig.other.categories_by_branch"
                    label="Categorías por sucursal"
                    color="primary"
                  />
                  <p class="checkbox-description">Filtrar categorías diferentes por sucursal</p>
                </div>
              </div>
              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                    v-model="companyConfig.is_table"
                    label="Sistema de mesas"
                    color="primary"
                  />
                  <p class="checkbox-description">Activar gestión de mesas y salones</p>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = getPreviousStep(step)"
                class="action-btn-secondary"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 4: Menu Configuration -->
        <div v-if="step === 4" class="step-card">
          <div class="step-header">
            <h2>Tienda</h2>
            <p>Personaliza tu tienda digital</p>
          </div>

          <div class="step-form">
            <!-- Banner Upload -->
            <div class="banner-section">
              <div class="upload-label">Banner del menú</div>
              <div class="banner-preview" @click="triggerBannerUpload">
                <q-img
                  :src="fileBanner?.url || logo.white"
                  class="banner-image"
                  fit="contain"
                >
                  <div class="banner-overlay">
                    <q-icon name="photo_camera" size="18px" />
                    <span>Cambiar banner</span>
                  </div>
                </q-img>
              </div>
              <file-button-component
                ref="bannerUploader"
                @upload="onUploadBanner"
                style="display: none"
              />
            </div>

            <!-- Description -->
            <div class="form-group full-width">
              <label class="field-label">Descripción</label>
              <q-editor
                v-model="menuConfig.description"
                min-height="100px"
                toolbar-color="grey-1"
                toolbar-text-color="grey-8"
                content-style="font-size: 14px"
                class="custom-editor"
              />
            </div>

            <!-- Schedule Component -->
            <div class="schedule-section">
              <div class="upload-label">Horarios de atención</div>
              <div class="schedule-wrapper">
                <schedule-company
                  :schedule="menuConfig.schedule"
                  @update:schedule="($event) => menuConfig.schedule = $event"
                />
              </div>
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = getPreviousStep(step)"
                class="action-btn-secondary"
              />
              <q-btn
                color="primary"
                label="Continuar"
                @click="saveMenuConfig"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </div>
        </div>

        <!-- Step 5: Client Screen -->
        <div v-if="step === 5" class="step-card">
          <div class="step-header">
            <h2>Pantalla de cliente</h2>
            <p>Imágenes para mostrar a tus clientes</p>
          </div>

          <q-form @submit="onSubmitImages" class="step-form">
            <div class="upload-section">
              <div class="upload-label">Subir imágenes</div>
              <div class="upload-area" @click="triggerFileUpload">
                <q-icon name="cloud_upload" size="32px" color="grey-5" />
                <h3>Arrastra archivos aquí</h3>
                <p>o haz clic para seleccionar</p>
              </div>
              <file-button-component
                ref="fileUploader"
                @upload="changeFiles"
                style="display: none"
              />
            </div>

            <div class="files-section">
              <file-component :files="configFiles" @delete:files="deleteFile" />
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = getPreviousStep(step)"
                class="action-btn-secondary"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 2: Branch Configuration -->
        <div v-if="step === 2" class="step-card">
          <div class="step-header">
            <h2>Configuración de Sucursal</h2>
            <p>Define los valores por defecto para esta sucursal</p>
          </div>

          <q-form @submit="onSubmitConfig" class="step-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="field-label">
                  Punto de venta
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Número de punto de venta específico para esta sucursal
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.point_of_sale"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Lista de precios por defecto
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Lista de precios que se aplicará por defecto en esta sucursal (1-5)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.other.default_price_list"
                  :options="['1', '2', '3', '4', '5']"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = getPreviousStep(step)"
                class="action-btn-secondary"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 7: Integrations -->
        <div v-if="step === 7" class="step-card">
          <div class="step-header">
            <h2>Integraciones</h2>
            <p>Conecta con servicios externos</p>
          </div>

          <div class="step-form">
            <div class="integration-wrapper">
              <IntegrationComponent />
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = getPreviousStep(step)"
                class="action-btn-secondary"
              />
              <q-btn
                color="positive"
                label="Finalizar"
                icon="check_circle"
                unelevated
                class="action-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { authentication } from 'src/stores/module-authentication'
import { storeToRefs } from 'pinia'
import FileButtonComponent from 'src/components/FileButtonComponent.vue'
import ScheduleCompany from 'src/components/Company/ScheduleCompany.vue'
import { logo, notify, setFiles } from '../const/mixins'
import { api, apiArca } from 'src/boot/axios'
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import eventBus from 'src/utils/eventBus'
import FileComponent from 'src/components/FileComponent.vue'
import IntegrationComponent from '../components/CompanyConfig/IntegrationComponent.vue'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
import 'driver.js/dist/driver.css'

const router = useRouter()
const $q = useQuasar()

// Reactive data
const coins = ref([])
const conceptTypes = ref([])
const voucherTypes = ref([])
const typeOfServices = ref([])
const step = ref(1)
const invoiceTypes = ref([])
const aliquotTypes = ref([])
const clients = ref([])
const paymentMethods = ref([])
const printers = ref([])
const businessTypes = ref([])
const loading = ref(false)

// Tour System
const showTour = ref(false)
const currentTourStep = ref(0)
const spotlightStyle = ref({})
const tourCardStyle = ref({})

// Store and session
const store = authentication()
const { branchOffice } = storeToRefs(store)
const userSession = store.userSession
const company = ref(userSession.company_session || {})

// Company config
const companyConfig = ref({
  id: company.value?.company_config?.id,
  client: company.value?.company_config?.client,
  paymentMethod: company.value?.company_config?.payment_method,
  invoiceType: company.value?.company_config?.invoice_type,
  typeOfService: company.value?.company_config?.type_of_service,
  coin: company.value?.company_config?.coin,
  priceList: company.value?.company_config?.price_list,
  printer: company.value?.company_config?.printer,
  is_table: company.value?.company_config?.is_table ?? false,
  other: {
    ...(company.value?.company_config?.other || {}),
    categories_by_branch: company.value?.company_config?.other?.categories_by_branch ?? false
  },
  point_of_sale: company.value?.company_config?.point_of_sale,
  files: company.value?.company_config?.files || [],
  partial_billing: company.value?.company_config?.partial_billing || false,
  open_cashbox: company.value?.company_config?.open_cashbox || true
})

const menuConfig = ref({
  ...companyConfig.value?.other?.menu
})

const fileBanner = ref({
  url: menuConfig.value?.banner_url
})

const configFiles = ref([...companyConfig?.value?.files])

const file = ref({
  url: userSession?.company_session?.url
})

// Address component variables
/**
 * Address component key for resetting
 * @type {Number}
 */
const addressComponentKey = ref(0)

/**
 * Address object for AddressComponent
 * @type {Object}
 */
const address = ref(null)

/**
 * Formatted address string
 * @type {String}
 */
const formattedAddress = ref('')

// Load branch office config into the form on component mount
onMounted(async () => {
  if (branchOffice.value) {
    companyConfig.value.point_of_sale = branchOffice.value.point_of_sale
    companyConfig.value.other.default_price_list = branchOffice.value.default_price_list
  }

  // Inicializar dirección si existe
  initializeAddress()

  // Cargar business types
  try {
    const { data } = await api.get('business-types')
    businessTypes.value = data.data || data
  } catch (error) {
    console.error('Error loading business types:', error)
  }

  // Verificar si viene desde WelcomePage
  const activateFromWelcome = localStorage.getItem('activate_tour_from_welcome')
  const selectedTask = localStorage.getItem('welcome_selected_task')

  if (activateFromWelcome === 'true' && selectedTask === 'CompanyConfig') {
    // Limpiar flags de activación
    localStorage.removeItem('activate_tour_from_welcome')
    localStorage.removeItem('welcome_selected_task')

    // Marcar que viene desde Welcome
    localStorage.setItem('came_from_welcome_config', 'true')

    // Ir directamente al paso 3 (Facturación)
    step.value = 3

    // Activar tour automáticamente
    await nextTick()
    setTimeout(() => {
      startTour()
    }, 500)
  } else {
    // Verificar si debe mostrar el tour (comportamiento normal)
    const hasSeenTour = localStorage.getItem('has_seen_company_config_tour')
    const needsTour = localStorage.getItem('needs_company_config_tour')
    if (hasSeenTour !== 'true' || needsTour === 'true') {
      localStorage.removeItem('needs_company_config_tour')
      await nextTick()
      setTimeout(() => {
        startTour()
      }, 500)
    }
  }

  // Listen for tour activation from navbar
  eventBus.on('activate-page-tour', (pageName) => {
    if (pageName === 'CompanyConfig') {
      startTour()
    }
  })
})

/**
 * Initialize address component with existing company address data
 */
const initializeAddress = () => {
  if (company.value?.address) {
    formattedAddress.value = company.value?.address?.formattedAddress
address.value = company.value.address
  } else {
    formattedAddress.value = ''
    address.value = null
  }

  // Incrementar clave para forzar re-renderización del AddressComponent
  addressComponentKey.value += 1
}

// Computed
const isFreePlan = computed(() => {
  const subscriptionPlan = store.subscriptionPlan
  const currentSubscription = store.currentSubscription

  return !currentSubscription || !subscriptionPlan || subscriptionPlan.toLowerCase() === 'free'
})

const totalSteps = computed(() => isFreePlan.value ? 5 : 7)

const steps = computed(() => {
  const allSteps = [
    { number: 1, title: 'Empresa', icon: 'business' },
    { number: 2, title: 'Sucursal', icon: 'store' },
    { number: 3, title: 'Facturación', icon: 'receipt' },
    { number: 4, title: 'Tienda', icon: 'restaurant_menu' },
    { number: 5, title: 'Pantalla', icon: 'tv' },
    { number: 6, title: 'Dispositivos', icon: 'print' },
    { number: 7, title: 'Integraciones', icon: 'hub' }
  ]

  // Si es plan Free, excluir Sucursal (2) e Integraciones (7)
  if (isFreePlan.value) {
    return allSteps.filter(s => s.number !== 2 && s.number !== 7)
  }

  return allSteps
})

const tourSteps = computed(() => {
  const allTourSteps = [
    {
      target: '.steps-nav',
      title: '🔢 Navegación de Configuración',
      description: 'Estos botones te permiten navegar entre las diferentes secciones de configuración de tu empresa. Haz clic en cualquiera para ir directamente a esa sección.'
    },
    {
      stepNumber: 1,
      target: '#tour-step-1',
      title: '🏢 Empresa',
      description: 'Configura la información básica de tu empresa: nombre, documento, email, teléfono, dirección y logo.'
    },
    {
      stepNumber: 2,
      target: '#tour-step-2',
      title: '🏪 Sucursal',
      description: 'Configura las sucursales de tu empresa. Define puntos de venta y listas de precios para cada sucursal.'
    },
    {
      stepNumber: 3,
      target: '#tour-step-3',
      title: '🧾 Facturación',
      description: 'Configura los parámetros de facturación: tipo de factura, moneda, tipo de servicio, método de pago y cliente por defecto.'
    },
    {
      stepNumber: 4,
      target: '#tour-step-4',
      title: '🍽️ Tienda',
      description: 'Configura las opciones de tu tienda: habilita mesas, define horarios de atención y personaliza la experiencia del cliente.'
    },
    {
      stepNumber: 5,
      target: '#tour-step-5',
      title: '📺 Pantalla',
      description: 'Configura la pantalla de visualización para tus clientes. Personaliza cómo se muestran los pedidos y productos.'
    },
    {
      stepNumber: 6,
      target: '#tour-step-6',
      title: '🖨️ Dispositivos',
      description: 'Configura las impresoras y otros dispositivos conectados a tu sistema para imprimir facturas y tickets.'
    },
    {
      stepNumber: 7,
      target: '#tour-step-7',
      title: '🔗 Integraciones',
      description: 'Conecta tu sistema con servicios externos como ARCA para facturación electrónica y otras integraciones.'
    }
  ]

  // Filtrar pasos del tour según el plan
  // Si es plan Free, excluir Sucursal (stepNumber 2) e Integraciones (stepNumber 7)
  if (isFreePlan.value) {
    return allTourSteps.filter(s => !s.stepNumber || (s.stepNumber !== 2 && s.stepNumber !== 7))
  }

  return allTourSteps
})

// Función para obtener el siguiente step válido
const getNextStep = (currentStep) => {
  const validSteps = steps.value.map(s => s.number).sort((a, b) => a - b)
  const currentIndex = validSteps.indexOf(currentStep)

  if (currentIndex === -1 || currentIndex === validSteps.length - 1) {
    return currentStep
  }

  return validSteps[currentIndex + 1]
}

// Función para obtener el step anterior válido
const getPreviousStep = (currentStep) => {
  const validSteps = steps.value.map(s => s.number).sort((a, b) => a - b)
  const currentIndex = validSteps.indexOf(currentStep)

  if (currentIndex === -1 || currentIndex === 0) {
    return currentStep
  }

  return validSteps[currentIndex - 1]
}

// Refs for file uploaders
const logoUploader = ref(null)
const bannerUploader = ref(null)
const fileUploader = ref(null)

// Methods
const triggerLogoUpload = async () => {
  await nextTick()
  if (logoUploader.value && logoUploader.value.$el) {
    const input = logoUploader.value.$el.querySelector('input[type="file"]')
    if (input) {
      input.click()
    }
  }
}

const triggerBannerUpload = async () => {
  await nextTick()
  if (bannerUploader.value && bannerUploader.value.$el) {
    const input = bannerUploader.value.$el.querySelector('input[type="file"]')
    if (input) {
      input.click()
    }
  }
}

const triggerFileUpload = async () => {
  await nextTick()
  if (fileUploader.value && fileUploader.value.$el) {
    const input = fileUploader.value.$el.querySelector('input[type="file"]')
    if (input) {
      input.click()
    }
  }
}

const onUpload = async (files) => {
  const filesSelected = await setFiles(files)
  file.value = filesSelected[0]
}

const onUploadBanner = async (files) => {
  const filesSelected = await setFiles(files)
  fileBanner.value = filesSelected[0]
}

const changeFiles = async (files) => {
  const filesSelected = await setFiles(files)
  configFiles.value = [...configFiles.value, ...filesSelected]
}

const deleteFile = async (file) => {
  try {
    const id = file[file.length - 1]
    await api.delete(`files/${id}`)
    const { data } = await api.get('company-configs')
    store.setCompanySession({
      ...company.value,
      company_config: data.data
    })
    notify('Archivo eliminado exitosamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

const formDate = (data) => {
  const formData = new FormData()
  formData.append('file', file.value.file)
  formData.append('name', data.name)

  // Enviar el objeto completo de la dirección como JSON
  if (address.value && typeof address.value === 'object') {
    formData.append('address', JSON.stringify(address.value))
  } else if (formattedAddress.value) {
    // Fallback: si solo hay string, crear objeto básico
    formData.append('address', JSON.stringify({
      formattedAddress: formattedAddress.value
    }))
  } else if (data.address) {
    // Fallback final: usar lo que venga en data
    formData.append('address', typeof data.address === 'string' 
      ? JSON.stringify({ formattedAddress: data.address })
      : JSON.stringify(data.address)
    )
  } else {
    formData.append('address', JSON.stringify({}))
  }

  formData.append('document_number', data.document_number)
  formData.append('email', data.email)
  formData.append('phone_number', data.phone_number)

  // Agregar business_type_id si está disponible
  if (data.business_type && data.business_type.id) {
    formData.append('business_type_id', data.business_type.id)
  }

  formData.append('_method', 'put')
  return formData
}

const onSubmit = async () => {
  try {
    loading.value = true

    // Validar que los campos requeridos estén completos
    if (!company.value.name || !company.value.email || !company.value.document_number) {
      notify('Por favor completa todos los campos requeridos', 'negative', 'warning')
      return
    }

    const { data } = await api.post(`session/company/${company.value.id}`, formDate(company.value))

    // Actualizar la sesión con los nuevos datos
    store.setCompanySession({
      ...company.value,
      ...data
    })

    // Actualizar la variable local con los datos guardados
    company.value = { ...company.value, ...data }

    // Reinicializar la dirección con los datos actualizados
    initializeAddress()

    notify('Guardado exitosamente', 'positive', 'check_circle')

    // Avanzar al siguiente paso
    step.value = getNextStep(step.value)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

const filterOptions = async (value, service, update) => {
  try {
    const { data } = await api.get(service, {
      params: {
        dataSearch: {
          name: value
        }
      }
    })
    update(data)
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  }
}

const onSubmitImages = async () => {
  if (!configFiles.value.length) {
    notify('Debe seleccionar al menos un archivo', 'negative', 'warning')
    return
  }
  try {
    loading.value = true
    const formData = new FormData()
    configFiles.value.forEach((file, index) => {
      formData.append(`files[${index}]`, file.file)
    })
    const { data } = await api.post(`company-configs/${companyConfig.value.id}/images`, formData)
    store.setCompanySession({
      ...company.value,
      company_config: data
    })
    notify('Guardado exitosamente', 'positive', 'check_circle')

    // Avanzar al siguiente paso
    step.value = getNextStep(step.value)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

const getConceptTypes = async (value, update) => {
  try {
    const { data } = await apiArca.get('metadata/concept-types', {
      params: {
        user: {
          name: userSession.name,
          email: userSession.email
        }
      }
    })
    update(() => {
      conceptTypes.value = data
    })
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  }
}

const getAliquotTypes = async (value, update) => {
  try {
    const { data } = await apiArca.get('metadata/aliquot-types', {
      params: {
        user: {
          name: userSession.name,
          email: userSession.email
        }
      }
    })
    update(() => {
      aliquotTypes.value = data
    })
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  }
}

const getVoucherTypes = async (value, update) => {
  try {
    const { data } = await apiArca.get('metadata/voucher-types', {
      params: {
        user: {
          name: userSession.name,
          email: userSession.email
        }
      }
    })
    update(() => {
      voucherTypes.value = data
    })
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  }
}

const filterInvoiceTypes = async (value, update) => {
  filterOptions(value, 'invoice-types', (data) => {
    update(() => {
      invoiceTypes.value = data
    })
  })
}

const filtersPaymentMethods = async (value, update) => {
  filterOptions(value, 'payment-methods', (data) => {
    update(() => {
      paymentMethods.value = data
    })
  })
}

const filterCoins = async (value, update) => {
  filterOptions(value, 'coins', (data) => {
    update(() => {
      coins.value = data
    })
  })
}

const filterPrinters = async (value, update) => {
  filterOptions(value, 'printers', (data) => {
    update(() => {
      printers.value = data
    })
  })
}

const filterClients = async (value, update) => {
  filterOptions(value, 'clients', (data) => {
    update(() => {
      clients.value = data
    })
  })
}

const filterTypeOfServices = async (value, update) => {
  filterOptions(value, 'type-of-services', (data) => {
    update(() => {
      typeOfServices.value = data
    })
  })
}

const filterBusinessTypes = async (value, update) => {
  filterOptions(value, 'business-types', (data) => {
    update(() => {
      businessTypes.value = data
    })
  })
}

const saveMenuConfig = async () => {
  try {
    loading.value = true
    const formData = new FormData()
    formData.append('file', fileBanner.value.file)
    formData.append('other', JSON.stringify({
      ...companyConfig.value.other,
      menu: menuConfig.value
    }))
    const { data } = await api.post(`session/company-other-configs/${company.value.id}`, formData)
    store.setCompanySession({
      ...company.value,
      company_config: data
    })
    notify('Guardado exitosamente', 'positive', 'check_circle')

    // Avanzar al siguiente paso
    step.value = getNextStep(step.value)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

const onSubmitConfig = async () => {
  try {
    loading.value = true

    // Si estamos en el paso 2 (Sucursal), guardamos la configuración de la sucursal
    if (step.value === 2) {
      const payload = {
        branch_office_id: branchOffice.value.id,
        point_of_sale: companyConfig.value.point_of_sale,
        default_price_list: companyConfig.value.other.default_price_list
      }
      const { data } = await api.post('branch-office-configs', payload)

      store.setBranchOffice(data)
    } else {
      const { data } = await api.post('company-configs', {
        coin_id: companyConfig.value?.coin?.id,
        type_of_service_id: companyConfig.value?.typeOfService?.id,
        invoice_type_id: companyConfig.value?.invoiceType?.id,
        payment_method_id: companyConfig.value?.paymentMethod?.id,
        client_id: companyConfig.value?.client?.id,
        printer_id: companyConfig.value?.printer?.id,
        is_table: companyConfig.value?.is_table,
        other: {
          ...companyConfig.value?.other
        },
        point_of_sale: companyConfig.value?.point_of_sale
      })
      store.setCompanySession({
        ...company.value,
        company_config: data
      })
    }

    notify('Guardado exitosamente', 'positive', 'check_circle')

    // Verificar si debe preguntar por continuar o mostrar celebración
    await checkContinueConfiguration()

    // Avanzar al siguiente paso
    step.value = getNextStep(step.value)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

/**
 * Start tour
 */
const startTour = () => {
  showTour.value = true
  currentTourStep.value = 0
  updateTourPosition()
}

/**
 * Next tour step
 */
const nextTourStep = () => {
  if (currentTourStep.value < tourSteps.value.length - 1) {
    currentTourStep.value++
    updateTourPosition()
  } else {
    finishTour()
  }
}

/**
 * Previous tour step
 */
const previousTourStep = () => {
  if (currentTourStep.value > 0) {
    currentTourStep.value--
    updateTourPosition()
  }
}

/**
 * Skip tour
 */
const skipTour = () => {
  finishTour()
}

/**
 * Finish tour
 */
const finishTour = () => {
  showTour.value = false
  localStorage.setItem('has_seen_company_config_tour', 'true')
  notify('¡Tour completado!', 'positive', 'check_circle')
}

/**
 * Check if should continue configuration
 */
const checkContinueConfiguration = async () => {
  const cameFromWelcome = localStorage.getItem('came_from_welcome_config')

  if (cameFromWelcome === 'true') {
    localStorage.removeItem('came_from_welcome_config')

    // Verificar si el progreso está al 100%
    const progressData = await checkIfComplete()

    if (progressData.isComplete) {
      // Mostrar celebración al 100%
      showCelebration()
    } else {
      // Preguntar si quiere continuar con la siguiente tarea
      setTimeout(() => {
        $q.dialog({
          title: '¡Configuración guardada! ✅',
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
          router.push({ name: 'Welcome' })
        })
      }, 500)
    }
  }
}

/**
 * Check if all tasks are complete (100%)
 */
const checkIfComplete = async () => {
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
}

/**
 * Show celebration dialog when 100% complete
 */
const showCelebration = async () => {
  try {
    const { data } = await api.post('/companies/mark-configured')
    store.setCompanySession({
      ...company.value,
      company_config: data.data
    })
    const CelebrationDialog = await import('src/components/CelebrationDialog.vue')
    $q.dialog({
      component: CelebrationDialog.default
    })
  } catch (error) {
    console.error('Error marking company as configured:', error)
  }
}

/**
 * Update tour position
 */
const updateTourPosition = () => {
  nextTick(() => {
    const step = tourSteps.value[currentTourStep.value]
    const element = document.querySelector(step.target)

    if (element) {
      // Scroll to element first
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

      // Wait for scroll to finish before calculating positions
      setTimeout(() => {
        const rect = element.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        // Update spotlight position
        spotlightStyle.value = {
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

        // Adjust vertical position to keep in viewport
        if (cardTop + cardHeight > scrollTop + viewportHeight) {
          cardTop = scrollTop + viewportHeight - cardHeight - padding
        }
        if (cardTop < scrollTop) {
          cardTop = scrollTop + padding
        }

        tourCardStyle.value = {
          top: `${cardTop}px`,
          left: `${cardLeft}px`
        }
      }, 300)
    }
  })
}

/**
 * Handle address selection from AddressComponent
 * @param {Object} selectedAddress - The selected address object
 */
const handleAddressSelected = (selectedAddress) => {
  // Si la dirección es nula, reiniciar el objeto de dirección
  if (!selectedAddress) {
    address.value = null
    formattedAddress.value = ''
    return
  }

  // Actualizar los campos de dirección para el formulario
  address.value = selectedAddress

  // Formatear la dirección para enviarla en la empresa
  // El componente AddressComponent devuelve un objeto con la estructura específica
  if (typeof selectedAddress === 'object' && selectedAddress !== null) {
    // Priorizar formattedAddress si existe
    if (selectedAddress.formattedAddress) {
      formattedAddress.value = selectedAddress.formattedAddress
    } else if (selectedAddress.name) {
      // Si no hay formattedAddress, usar el name del lugar
      formattedAddress.value = selectedAddress.name
    } else {
      // Construir dirección desde componentes disponibles
      const addressParts = []
      if (selectedAddress.street) addressParts.push(selectedAddress.street)
      if (selectedAddress.city) addressParts.push(selectedAddress.city)
      if (selectedAddress.state) addressParts.push(selectedAddress.state)
      if (selectedAddress.country) addressParts.push(selectedAddress.country)
      if (selectedAddress.zipCode) addressParts.push(selectedAddress.zipCode)

      formattedAddress.value = addressParts.length > 0
        ? addressParts.join(', ')
        : JSON.stringify(selectedAddress)
    }
  } else if (typeof selectedAddress === 'string') {
    // Si por alguna razón viene como string
    formattedAddress.value = selectedAddress
  } else {
    // Fallback: convertir a string
    formattedAddress.value = String(selectedAddress)
  }

  // Dirección procesada correctamente - no necesita reinicialización del componente
}
</script>

<style scoped>
.minimalist-config {
  min-height: 100vh;
  padding: 0;
}

.config-container {
  max-width: 850px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* Progress Header */
.progress-header {
  text-align: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 2.25rem;
  margin: 0 0 0.5rem 0;
}

.main-subtitle {
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  font-weight: 400;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.progress-bar {
  width: 200px;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--q-primary) 0%, #3b82f6 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 500;
  min-width: 50px;
}

/* Steps Navigation */
.steps-nav {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.step-nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.step-nav-item:hover {
  border-color: var(--q-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-nav-item.active {
  background: var(--q-primary);
  color: white;
  border-color: var(--q-primary);
  box-shadow: 0 2px 8px rgba(var(--q-primary-rgb), 0.3);
}

.step-nav-item.completed {
  background: #10b981;
  color: white;
  border-color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.step-nav-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-nav-label {
  font-weight: 500;
}

/* Step Content */
.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-card {
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
}

.step-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.step-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.step-header p {
  font-size: 0.95rem;
  margin: 0;
}

/* Form Styles */
.step-form {
  max-width: 650px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 5px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.field-label, .upload-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.upload-label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.custom-input {
  border-radius: 8px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 8px;
}

.custom-editor {
  border-radius: 8px;
}

.custom-editor :deep(.q-editor__content) {
  border-radius: 0 0 8px 8px;
}

.checkbox-group {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.checkbox-description {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
}

/* Logo Section */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.logo-preview {
  position: relative;
  width: 480px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #e2e8f0;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.logo-preview:hover {
  border-color: var(--q-primary);
  transform: scale(1.02);
}

.logo-image {
  width: 100%;
  height: 100%;
}

.logo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

/* Banner Section */
.banner-section {
  margin-bottom: 1.5rem;
}

.banner-preview {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #e2e8f0;
  transition: all 0.2s ease;
}

.banner-preview:hover {
  border-color: var(--q-primary);
  transform: scale(1.01);
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

/* Upload Section */
.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: var(--q-primary);
  transform: translateY(-1px);
}

.upload-area h3 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.upload-area p {
  margin: 0;
  font-size: 0.8rem;
}

/* Files Section */
.files-section {
  margin-bottom: 1rem;
}

/* Schedule Section */
.schedule-section {
  margin-bottom: 1.5rem;
}

/* Integration Section */
.integration-wrapper {
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

/* Actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.action-btn {
  min-width: 100px;
  height: 36px;
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  font-size: 0.8rem;
  box-shadow: 0 1px 4px rgba(var(--q-primary-rgb), 0.2);
}

.action-btn-secondary {
  color: #64748b;
  font-weight: 500;
  text-transform: none;
  font-size: 0.8rem;
}

.action-btn-secondary:hover {
  color: var(--q-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .config-container {
    padding: 1rem 0.75rem;
  }

  .main-title {
    font-size: 1.75rem;
  }

  .step-card {
    padding: 1.5rem 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .steps-nav {
    gap: 0.25rem;
  }

  .step-nav-item {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .step-nav-label {
    display: none;
  }

  .step-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }

  .action-btn {
    width: 100%;
  }

  .logo-preview {
    width: 160px;
    height: 90px;
  }

  .upload-area {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .progress-bar-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .progress-bar {
    width: 180px;
  }
}

/* Tour Styles */
.tour-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 9998;
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
  z-index: 9999;
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
  z-index: 10000;
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
