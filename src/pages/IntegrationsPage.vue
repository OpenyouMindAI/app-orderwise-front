<template>
  <q-page class="integrations-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <q-icon name="extension" size="48px" class="header-icon" />
          <div>
            <h1 class="page-title">Integraciones</h1>
            <p class="page-subtitle">Conecta tu negocio con plataformas externas</p>
          </div>
        </div>
        <div v-if="isRootUser" class="header-right">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Nueva Integración"
            @click="openAdminDialog()"
            class="admin-btn"
          />
          <q-toggle
            v-model="adminMode"
            label="Modo Admin"
            color="warning"
            class="q-ml-md"
          />
        </div>
      </div>
    </div>

    <!-- Admin Mode Banner -->
    <q-banner v-if="isRootUser && adminMode" class="admin-banner q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="admin_panel_settings" color="warning" size="32px" />
      </template>
      <div class="text-subtitle1 text-weight-bold">Modo Administrador Activo</div>
      <div class="text-caption">Puedes crear, editar, eliminar y desactivar integraciones del sistema</div>
    </q-banner>

    <!-- Loading State -->
    <div v-if="loading" class="q-pa-lg">
      <q-skeleton height="200px" class="q-mb-md" />
      <q-skeleton height="200px" class="q-mb-md" />
      <q-skeleton height="200px" />
    </div>

    <!-- Integrations Grid -->
    <div v-else class="integrations-grid">
      <q-card
        v-for="integration in displayedIntegrations"
        :key="integration.id"
        class="integration-card"
        :class="{
          'configured': integration.is_configured,
          'inactive': adminMode && !integration.is_active
        }"
      >
        <!-- Card Header with Logo -->
        <div class="card-header" :style="{ background: integration.color }">
          <q-img
            v-if="integration.logo_url"
            :src="integration.logo_url"
            class="integration-logo"
            :alt="integration.name"
          />
          <div v-else class="integration-logo-placeholder">
            <q-icon name="extension" size="64px" color="white" />
          </div>
        </div>

        <!-- Card Body -->
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="integration-name">{{ integration.name }}</div>
            <q-badge
              v-if="adminMode && !integration.is_active"
              color="negative"
              class="inactive-badge"
            >
              <q-icon name="block" size="12px" class="q-mr-xs" />
              Inactiva
            </q-badge>
          </div>
          <p class="integration-description">{{ integration.description }}</p>

          <!-- Status Badge -->
          <div class="status-badge-container">
            <q-badge
              v-if="integration.is_configured"
              color="positive"
              class="status-badge"
            >
              <q-icon name="check_circle" size="14px" class="q-mr-xs" />
              Configurado
            </q-badge>
            <q-badge
              v-else
              color="grey-6"
              class="status-badge"
            >
              <q-icon name="radio_button_unchecked" size="14px" class="q-mr-xs" />
              No configurado
            </q-badge>
          </div>
        </q-card-section>

        <!-- Card Actions -->
        <q-card-actions class="card-actions">
          <!-- Admin Mode Actions -->
          <template v-if="adminMode && isRootUser">
            <q-btn
              flat
              color="primary"
              icon="edit"
              label="Editar"
              @click="openAdminDialog(integration)"
            />
            <q-btn
              flat
              :color="integration.is_active ? 'warning' : 'positive'"
              :icon="integration.is_active ? 'block' : 'check_circle'"
              :label="integration.is_active ? 'Desactivar' : 'Activar'"
              @click="toggleIntegrationStatus(integration)"
            />
            <q-btn
              flat
              color="negative"
              icon="delete"
              label="Eliminar"
              @click="confirmDeleteIntegration(integration)"
            />
          </template>

          <!-- User Mode Actions -->
          <template v-else>
            <q-btn
              v-if="!integration.is_configured"
              unelevated
              color="primary"
              label="Configurar"
              icon="settings"
              class="full-width"
              @click="openConfigDialog(integration)"
            />
            <template v-else>
              <q-btn
                flat
                color="primary"
                label="Editar"
                icon="edit"
                @click="openEditDialog(integration)"
              />
              <q-btn
                flat
                color="negative"
                label="Eliminar"
                icon="delete"
                @click="confirmDelete(integration)"
              />
            </template>
          </template>
        </q-card-actions>
      </q-card>
    </div>

    <!-- Dynamic Configuration Dialog -->
    <q-dialog v-model="showConfigDialog" persistent>
      <q-card class="config-dialog">
        <!-- Header -->
        <q-card-section class="dialog-header" :style="{ background: selectedIntegration?.color }">
          <div class="dialog-header-content">
            <q-img
              v-if="selectedIntegration?.logo_url"
              :src="selectedIntegration.logo_url"
              class="dialog-logo"
              :alt="selectedIntegration.name"
            />
            <div v-else class="dialog-logo-placeholder">
              <q-icon name="extension" size="48px" color="white" />
            </div>
          </div>
        </q-card-section>

        <!-- Form -->
        <q-card-section class="dialog-body">
          <div class="text-h6 text-center q-mb-md text-grey-8">
            Configurar {{ selectedIntegration?.name }}
          </div>
          <p class="text-body2 text-center text-grey-6 q-mb-lg">
            {{ selectedIntegration?.description }}
          </p>

          <q-form @submit="saveConfiguration" class="q-gutter-md">
            <div
              v-for="field in selectedIntegration?.fields"
              :key="field.name"
            >
              <q-input
                v-model="configForm[field.name]"
                :label="field.label"
                :type="field.type === 'password' ? (showPasswords[field.name] ? 'text' : 'password') : field.type"
                :placeholder="field.placeholder"
                :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                filled
                lazy-rules
              >
                <template v-slot:prepend>
                  <q-icon
                    :name="getFieldIcon(field.type)"
                    color="grey-6"
                  />
                </template>
                <template v-if="field.type === 'password'" v-slot:append>
                  <q-icon
                    :name="showPasswords[field.name] ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    color="grey-6"
                    @click="togglePasswordVisibility(field.name)"
                  />
                </template>
              </q-input>
            </div>

            <div class="text-caption text-grey-6 q-mt-md text-center">
              <q-icon name="lock" size="16px" class="q-mr-xs" />
              Tus credenciales se almacenan de forma segura y encriptada
            </div>
          </q-form>
        </q-card-section>

        <!-- Actions -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            @click="closeConfigDialog"
            :disable="saving"
          />
          <q-btn
            unelevated
            label="Guardar"
            color="primary"
            @click="saveConfiguration"
            :loading="saving"
            :disable="!isFormValid"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Admin Integration Dialog -->
    <q-dialog v-model="showAdminDialog" persistent>
      <q-card class="admin-dialog">
        <q-card-section class="dialog-header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
          <div class="dialog-header-content-improved">
            <div class="header-left-section">
              <div class="icon-circle">
                <q-icon name="admin_panel_settings" size="32px" color="white" />
              </div>
              <div class="header-text">
                <div class="text-h6 text-white text-weight-bold">
                  {{ adminEditMode ? 'Editar' : 'Nueva' }} Integración
                </div>
                <div class="text-caption text-white" style="opacity: 0.9;">
                  {{ adminEditMode ? 'Modifica los datos de la integración' : 'Configura una nueva integración del sistema' }}
                </div>
              </div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              color="white"
              size="md"
              @click="closeAdminDialog"
              class="close-dialog-btn"
            >
              <q-tooltip>Cerrar</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section class="dialog-body scrollable-dialog-body">

          <q-form class="q-gutter-md">
            <!-- Name -->
            <q-input
              v-model="adminForm.name"
              label="Nombre *"
              placeholder="Ej: WhatsApp Business"
              filled
              :rules="[val => !!val || 'El nombre es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="label" color="grey-6" />
              </template>
            </q-input>

            <!-- Slug -->
            <q-input
              v-model="adminForm.slug"
              label="Slug *"
              placeholder="Ej: whatsapp-business"
              filled
              :rules="[val => !!val || 'El slug es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="link" color="grey-6" />
              </template>
            </q-input>

            <!-- Description -->
            <q-input
              v-model="adminForm.description"
              label="Descripción"
              type="textarea"
              rows="3"
              filled
            >
              <template v-slot:prepend>
                <q-icon name="description" color="grey-6" />
              </template>
            </q-input>

            <!-- Logo Upload -->
            <div class="upload-section">
              <div class="text-subtitle2 q-mb-sm">Logo de la Integración</div>
              <q-file
                v-model="logoFile"
                label="Arrastra o selecciona el logo"
                filled
                accept="image/*"
                max-file-size="2097152"
                @update:model-value="onLogoSelected"
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" />
                </template>
                <template v-slot:hint>
                  Formatos: JPG, PNG, SVG (Máx. 2MB)
                </template>
              </q-file>
              <div v-if="logoPreview" class="image-preview q-mt-sm">
                <q-img
                  :src="logoPreview"
                  class="preview-img"
                  fit="contain"
                />
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="close"
                  size="sm"
                  class="remove-preview-btn"
                  @click="removeLogo"
                />
              </div>
            </div>

            <!-- Icon Upload -->
            <div class="upload-section">
              <div class="text-subtitle2 q-mb-sm">Icono de la Integración</div>
              <q-file
                v-model="iconFile"
                label="Arrastra o selecciona el icono"
                filled
                accept="image/*"
                max-file-size="1048576"
                @update:model-value="onIconSelected"
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" />
                </template>
                <template v-slot:hint>
                  Formatos: JPG, PNG, SVG (Máx. 1MB)
                </template>
              </q-file>
              <div v-if="iconPreview" class="image-preview q-mt-sm">
                <q-img
                  :src="iconPreview"
                  class="preview-img preview-img-small"
                  fit="contain"
                />
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="close"
                  size="sm"
                  class="remove-preview-btn"
                  @click="removeIcon"
                />
              </div>
            </div>

            <!-- Color -->
            <q-input
              v-model="adminForm.color"
              label="Color (Hex) *"
              placeholder="#FF0000"
              filled
              :rules="[val => !!val || 'El color es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="palette" color="grey-6" />
              </template>
              <template v-slot:append>
                <div
                  class="color-preview"
                  :style="{ background: adminForm.color }"
                ></div>
              </template>
            </q-input>

            <!-- API URL -->
            <q-input
              v-model="adminForm.api_url"
              label="URL de la API"
              placeholder="https://api.example.com"
              filled
            >
              <template v-slot:prepend>
                <q-icon name="cloud" color="grey-6" />
              </template>
            </q-input>

            <!-- Fields Configuration -->
            <div class="fields-section">
              <div class="text-subtitle2 q-mb-sm">Campos de Configuración</div>

              <div
                v-for="(field, index) in adminForm.fields"
                :key="index"
                class="field-item q-mb-md q-pa-md"
              >
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="field.name"
                      label="Nombre del campo"
                      dense
                      filled
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="field.label"
                      label="Etiqueta"
                      dense
                      filled
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="field.type"
                      :options="['text', 'password', 'email', 'url', 'number']"
                      label="Tipo"
                      dense
                      filled
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="field.placeholder"
                      label="Placeholder"
                      dense
                      filled
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-checkbox
                      v-model="field.required"
                      label="Requerido"
                      dense
                    />
                  </div>
                </div>
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  class="delete-field-btn"
                  @click="removeField(index)"
                />
              </div>

              <q-btn
                flat
                color="primary"
                icon="add"
                label="Agregar Campo"
                @click="addField"
              />
            </div>

            <!-- Webhook Support -->
            <q-toggle
              v-model="adminForm.has_webhook"
              label="Soporta Webhooks"
              color="primary"
            >
              <q-tooltip>
                Activa esta opción si la integración puede recibir notificaciones automáticas mediante webhooks
              </q-tooltip>
            </q-toggle>

            <!-- Active Status -->
            <q-toggle
              v-model="adminForm.is_active"
              label="Integración Activa"
              color="positive"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            @click="closeAdminDialog"
            :disable="savingAdmin"
          />
          <q-btn
            unelevated
            :label="adminEditMode ? 'Actualizar' : 'Crear'"
            color="primary"
            @click="saveAdminIntegration"
            :loading="savingAdmin"
            :disable="!isAdminFormValid"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { authentication } from 'src/stores/module-authentication'

const $q = useQuasar()
const store = authentication()

// State
const loading = ref(false)
const saving = ref(false)
const savingAdmin = ref(false)
const availableIntegrations = ref([])
const allIntegrations = ref([])
const showConfigDialog = ref(false)
const showAdminDialog = ref(false)
const selectedIntegration = ref(null)
const configForm = ref({})
const showPasswords = ref({})
const editMode = ref(false)
const editingCompanyIntegrationId = ref(null)
const adminMode = ref(false)
const adminEditMode = ref(false)
const editingIntegrationId = ref(null)
const adminForm = ref({
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  icon_url: '',
  color: '#000000',
  api_url: '',
  fields: [],
  has_webhook: false,
  is_active: true,
  sort_order: 0
})
const logoFile = ref(null)
const iconFile = ref(null)
const logoPreview = ref(null)
const iconPreview = ref(null)

// Computed
const isRootUser = computed(() => {
  return store.userSession?.is_root
})

const displayedIntegrations = computed(() => {
  if (adminMode.value && isRootUser.value) {
    return allIntegrations.value
  }
  return availableIntegrations.value
})

const isFormValid = computed(() => {
  if (!selectedIntegration.value?.fields) return false

  return selectedIntegration.value.fields
    .filter(f => f.required)
    .every(f => configForm.value[f.name])
})

const isAdminFormValid = computed(() => {
  return adminForm.value.name &&
         adminForm.value.slug &&
         adminForm.value.color
})

// Methods
const loadIntegrations = async () => {
  loading.value = true
  try {
    const { data } = await api.get('company-integrations/available')
    availableIntegrations.value = data

    // Load all integrations for admin mode
    if (isRootUser.value) {
      const { data: all } = await api.get('integrations')
      allIntegrations.value = all
    }
  } catch (error) {
    console.error('Error loading integrations:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar integraciones',
      caption: error.response?.data?.message || error.message
    })
  } finally {
    loading.value = false
  }
}

const openConfigDialog = (integration) => {
  selectedIntegration.value = integration
  configForm.value = {}
  showPasswords.value = {}
  editMode.value = false
  editingCompanyIntegrationId.value = null
  showConfigDialog.value = true
}

const openEditDialog = async (integration) => {
  try {
    // Get company integration details with credentials
    const { data: companyIntegrations } = await api.get('company-integrations')
    const companyIntegration = companyIntegrations.find(
      ci => ci.integration.id === integration.id
    )

    if (companyIntegration) {
      // Load full details with decrypted credentials
      const { data: fullDetails } = await api.get(`company-integrations/${companyIntegration.id}`)

      selectedIntegration.value = integration
      configForm.value = { ...fullDetails.credentials }
      showPasswords.value = {}
      editMode.value = true
      editingCompanyIntegrationId.value = companyIntegration.id
      showConfigDialog.value = true
    }
  } catch (error) {
    console.error('Error loading integration details:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar configuración',
      caption: error.response?.data?.message || error.message
    })
  }
}

const closeConfigDialog = () => {
  showConfigDialog.value = false
  selectedIntegration.value = null
  configForm.value = {}
  showPasswords.value = {}
  editMode.value = false
  editingCompanyIntegrationId.value = null
}

const saveConfiguration = async () => {
  if (!isFormValid.value) return

  saving.value = true
  try {
    if (editMode.value && editingCompanyIntegrationId.value) {
      // Update existing
      await api.put(`company-integrations/${editingCompanyIntegrationId.value}`, {
        credentials: configForm.value
      })
      $q.notify({
        type: 'positive',
        message: 'Integración actualizada exitosamente',
        icon: 'check_circle'
      })
    } else {
      // Create new
      await api.post('company-integrations', {
        integration_id: selectedIntegration.value.id,
        credentials: configForm.value,
        is_active: true
      })
      $q.notify({
        type: 'positive',
        message: 'Integración configurada exitosamente',
        icon: 'check_circle'
      })
    }

    closeConfigDialog()
    await loadIntegrations()
  } catch (error) {
    console.error('Error saving configuration:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar configuración',
      caption: error.response?.data?.message || error.message
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (integration) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar la integración con ${integration.name}?`,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7'
    },
    ok: {
      label: 'Eliminar',
      unelevated: true,
      color: 'negative'
    },
    persistent: true
  }).onOk(async () => {
    try {
      const { data: companyIntegrations } = await api.get('company-integrations')
      const companyIntegration = companyIntegrations.find(
        ci => ci.integration.id === integration.id
      )

      if (companyIntegration) {
        await api.delete(`company-integrations/${companyIntegration.id}`)
        $q.notify({
          type: 'positive',
          message: 'Integración eliminada exitosamente',
          icon: 'check_circle'
        })
        await loadIntegrations()
      }
    } catch (error) {
      console.error('Error deleting integration:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar integración',
        caption: error.response?.data?.message || error.message
      })
    }
  })
}

const togglePasswordVisibility = (fieldName) => {
  showPasswords.value[fieldName] = !showPasswords.value[fieldName]
}

const getFieldIcon = (type) => {
  const icons = {
    text: 'text_fields',
    password: 'lock',
    email: 'email',
    url: 'link',
    number: 'pin'
  }
  return icons[type] || 'text_fields'
}

// Admin Methods
const openAdminDialog = (integration = null) => {
  if (integration) {
    adminEditMode.value = true
    editingIntegrationId.value = integration.id
    adminForm.value = {
      name: integration.name,
      slug: integration.slug,
      description: integration.description || '',
      logo_url: integration.logo_url || '',
      icon_url: integration.icon_url || '',
      color: integration.color || '#000000',
      api_url: integration.api_url || '',
      fields: integration.fields ? JSON.parse(JSON.stringify(integration.fields)) : [],
      has_webhook: integration.has_webhook || false,
      is_active: integration.is_active,
      sort_order: integration.sort_order || 0
    }
    // Set previews for existing images
    if (integration.logo_url) {
      logoPreview.value = integration.logo_url
    }
    if (integration.icon_url) {
      iconPreview.value = integration.icon_url
    }
  } else {
    adminEditMode.value = false
    editingIntegrationId.value = null
    adminForm.value = {
      name: '',
      slug: '',
      description: '',
      logo_url: '',
      icon_url: '',
      color: '#000000',
      api_url: '',
      fields: [],
      has_webhook: false,
      is_active: true,
      sort_order: 0
    }
  }
  showAdminDialog.value = true
}

const closeAdminDialog = () => {
  showAdminDialog.value = false
  adminEditMode.value = false
  editingIntegrationId.value = null
  adminForm.value = {
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    icon_url: '',
    color: '#000000',
    api_url: '',
    fields: [],
    has_webhook: false,
    is_active: true,
    sort_order: 0
  }
  logoFile.value = null
  iconFile.value = null
  logoPreview.value = null
  iconPreview.value = null
}

const addField = () => {
  adminForm.value.fields.push({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: ''
  })
}

const removeField = (index) => {
  adminForm.value.fields.splice(index, 1)
}

const saveAdminIntegration = async () => {
  if (!isAdminFormValid.value) return

  savingAdmin.value = true
  try {
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', adminForm.value.name)
    formData.append('slug', adminForm.value.slug)
    formData.append('description', adminForm.value.description || '')
    formData.append('color', adminForm.value.color)
    formData.append('api_url', adminForm.value.api_url || '')
    formData.append('fields', JSON.stringify(adminForm.value.fields))
    formData.append('has_webhook', adminForm.value.has_webhook ? '1' : '0')
    formData.append('is_active', adminForm.value.is_active ? '1' : '0')
    formData.append('sort_order', adminForm.value.sort_order || '0')

    // Add logo file if selected
    if (logoFile.value) {
      formData.append('logo', logoFile.value)
    } else if (adminForm.value.logo_url) {
      formData.append('logo_url', adminForm.value.logo_url)
    }

    // Add icon file if selected
    if (iconFile.value) {
      formData.append('icon', iconFile.value)
    } else if (adminForm.value.icon_url) {
      formData.append('icon_url', adminForm.value.icon_url)
    }

    if (adminEditMode.value && editingIntegrationId.value) {
      formData.append('_method', 'PUT')
      await api.post(`integrations/${editingIntegrationId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      $q.notify({
        type: 'positive',
        message: 'Integración actualizada exitosamente',
        icon: 'check_circle'
      })
    } else {
      await api.post('integrations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      $q.notify({
        type: 'positive',
        message: 'Integración creada exitosamente',
        icon: 'check_circle'
      })
    }

    closeAdminDialog()
    await loadIntegrations()
  } catch (error) {
    console.error('Error saving integration:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar integración',
      caption: error.response?.data?.message || error.message
    })
  } finally {
    savingAdmin.value = false
  }
}

const toggleIntegrationStatus = async (integration) => {
  try {
    await api.put(`integrations/${integration.id}`, {
      is_active: !integration.is_active
    })

    $q.notify({
      type: 'positive',
      message: integration.is_active ? 'Integración desactivada' : 'Integración activada',
      icon: 'check_circle'
    })

    await loadIntegrations()
  } catch (error) {
    console.error('Error toggling integration:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar estado',
      caption: error.response?.data?.message || error.message
    })
  }
}

const confirmDeleteIntegration = (integration) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar la integración "${integration.name}"? Esta acción no se puede deshacer.`,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7'
    },
    ok: {
      label: 'Eliminar',
      unelevated: true,
      color: 'negative'
    },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`integrations/${integration.id}`)
      $q.notify({
        type: 'positive',
        message: 'Integración eliminada exitosamente',
        icon: 'check_circle'
      })
      await loadIntegrations()
    } catch (error) {
      console.error('Error deleting integration:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar integración',
        caption: error.response?.data?.message || error.message
      })
    }
  })
}

// File upload handlers
const onLogoSelected = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const onIconSelected = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      iconPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeLogo = () => {
  logoFile.value = null
  logoPreview.value = null
  adminForm.value.logo_url = ''
}

const removeIcon = () => {
  iconFile.value = null
  iconPreview.value = null
  adminForm.value.icon_url = ''
}

// Lifecycle
onMounted(() => {
  loadIntegrations()
})
</script>

<style scoped lang="scss">
.integrations-page {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
  animation: slideDown 0.6s ease-out;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.integration-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  &.configured {
    border-color: #10b981;
  }
}

.card-header {
  padding: 5px 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 140px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
}

.integration-logo {
  width: 400px;
  max-width: 80%;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  position: relative;
  z-index: 1;
}

.integration-logo-placeholder {
  position: relative;
  z-index: 1;
}

.integration-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.integration-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 16px;
}

.status-badge-container {
  display: flex;
  justify-content: flex-start;
}

.status-badge {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.card-actions {
  padding: 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.config-dialog {
  width: 600px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  padding: 40px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
}

.dialog-header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-header-content-improved {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-left-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.icon-circle {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-text {
  flex: 1;
  min-width: 0;
}

.close-dialog-btn {
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
}

.dialog-logo {
  width: 280px;
  max-width: 70vw;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.dialog-logo-placeholder {
  display: flex;
  justify-content: center;
}

.dialog-body {
  padding: 32px 24px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 10px 24px;
}

.admin-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  animation: slideDown 0.6s ease-out;
}

.integration-card.inactive {
  opacity: 0.6;
  border-color: #ef4444;
}

.inactive-badge {
  font-size: 11px;
  padding: 4px 8px;
}

.admin-dialog {
  width: 800px;
  max-width: 95vw;
  border-radius: 16px;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.scrollable-dialog-body {
  max-height: calc(90vh - 150px);
  overflow-y: auto;
  overflow-x: hidden;
}

.upload-section {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #f9fafb;
}

.image-preview {
  position: relative;
  display: inline-block;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  background: white;
}

.preview-img {
  max-width: 200px;
  max-height: 100px;
  border-radius: 4px;
}

.preview-img-small {
  max-width: 100px;
  max-height: 50px;
}

.remove-preview-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.fields-section {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #f9fafb;
}

.field-item {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.delete-field-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
}

.body--dark {
  .integrations-page {
    background: #0f172a;
  }

  .integration-name {
    color: #f3f4f6;
  }

  .integration-description {
    color: #9ca3af;
  }

  .card-actions {
    background: #1e293b;
    border-top-color: #334155;
  }

  .admin-banner {
    background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
    border-color: #f59e0b;
  }

  .fields-section {
    background: #1e293b;
    border-color: #475569;
  }

  .field-item {
    background: #0f172a;
    border-color: #475569;
  }

  .upload-section {
    background: #1e293b;
    border-color: #475569;
  }

  .image-preview {
    background: #0f172a;
    border-color: #475569;
  }
}
</style>
