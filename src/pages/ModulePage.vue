<template>
  <q-page class="q-pa-md">
    <q-toolbar>
      <q-toolbar-title>Módulos de la aplicación</q-toolbar-title>

      <q-space />

      <!-- View Toggle -->
      <q-btn-toggle
        v-model="currentView"
        :options="[
          { label: 'Kanban', value: 'kanban', icon: 'view_kanban' },
          { label: 'Table', value: 'table', icon: 'table_view' },
        ]"
        class="q-mr-md"
      />

      <!-- Refresh Button -->
      <q-btn flat round dense icon="refresh" :loading="loading" class="q-mr-sm" @click="refreshData">
        <q-tooltip>Actualizar datos</q-tooltip>
      </q-btn>

      <!-- Add Section Button -->
      <q-btn flat round dense icon="add_box" :disable="loading" @click="openNewSectionForm">
        <q-tooltip>Agregar Sección</q-tooltip>
      </q-btn>

      <!-- Add Module Button -->
      <q-btn flat round dense icon="post_add" :disable="loading" @click="openNewModuleForm()">
        <q-tooltip>Agregar Módulo</q-tooltip>
      </q-btn>
    </q-toolbar>
    <!-- Loading State -->
    <div v-if="loading" class="full-width full-height flex flex-center">
      <div class="text-center">
        <q-spinner-dots size="50px" color="primary" />
        <div class="q-mt-md text-grey-6">{{ loadingMessage }}</div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="full-width full-height flex flex-center">
      <q-card class="q-pa-lg text-center" style="max-width: 400px">
        <q-icon name="error_outline" size="64px" color="negative" />
        <div class="text-h6 q-mt-md">Error al cargar datos</div>
        <div class="text-body2 text-grey-6 q-mt-sm">{{ error }}</div>
        <q-btn color="primary" label="Reintentar" class="q-mt-md" @click="loadData" />
      </q-card>
    </div>

    <!-- Kanban View -->
    <div v-else-if="currentView === 'kanban'" class="kanban-view">
      <div class="kanban-container">
        <div class="row no-wrap q-pa-xs">
          <div v-for="(section, sectionIndex) in sortedSections" :key="section.id" class="section-column q-mr-md">
            <SectionColumn
              :section="section"
              :items="getModulesBySection(section.id)"
              :is-first-section="sectionIndex === 0"
              :is-last-section="sectionIndex === sortedSections.length - 1"
              @edit-section="editSection"
              @delete-section="confirmDeleteSection"
              @add-item="openNewModuleForm"
              @edit-item="editModule"
              @delete-item="confirmDeleteModule"
              @move-item-up="moveModuleUp"
              @move-item-down="moveModuleDown"
              @move-section-left="moveSectionLeft"
              @move-section-right="moveSectionRight"
            />
          </div>

          <!-- Add Section Column -->
          <div class="section-column add-section-column q-mr-md">
            <q-card flat bordered class="full-height">
              <q-card-section class="flex flex-center full-height">
                <q-btn
                  color="grey-4"
                  text-color="grey-8"
                  icon="add"
                  label="Agregar Sección"
                  no-caps
                  unelevated
                  class="full-width"
                  :disable="loading"
                  @click="openNewSectionForm"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else-if="currentView === 'table'" class="table-view">
      <ModulesTable
        :modules="allModules"
        :sections="sections"
        @edit-module="editModule"
        @delete-module="confirmDeleteModule"
        @add-module="openNewModuleForm"
      />
    </div>

    <!-- Module Form Dialog -->
    <q-dialog v-model="showModuleForm" persistent>
      <ModuleForm
        :module="selectedModule"
        :sections="activeSections"
        :is-editing="isEditingModule"
        @save="saveModule"
        @cancel="showModuleForm = false"
      />
    </q-dialog>

    <!-- Section Form Dialog -->
    <q-dialog v-model="showSectionForm" persistent>
      <SectionForm
        :section="selectedSection"
        :is-editing="isEditingSection"
        @save="saveSection"
        @cancel="showSectionForm = false"
      />
    </q-dialog>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">{{ confirmMessage }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cancelar" color="primary" />
          <q-btn v-close-popup flat label="Eliminar" color="negative" @click="executeConfirmedAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import SectionColumn from 'src/components/Module/SectionColumn.vue'
import ModulesTable from 'src/components/Module/ItemsTable.vue'
import ModuleForm from 'src/components/Module/ItemForm.vue'
import SectionForm from 'src/components/Module/SectionForm.vue'
import { api } from 'src/boot/services'

const $q = useQuasar()

// State
const currentView = ref('kanban')
const loading = ref(true)
const loadingMessage = ref('Cargando datos...')
const error = ref(null)
const sections = ref([])
const showModuleForm = ref(false)
const showSectionForm = ref(false)
const showConfirmDialog = ref(false)
const selectedModule = ref(null)
const selectedSection = ref(null)
const isEditingModule = ref(false)
const isEditingSection = ref(false)
const confirmMessage = ref('')
const confirmedAction = ref(null)

// Computed properties
const sortedSections = computed(() => {
  return sections.value.filter((section) => !section.deleted_at).sort((a, b) => a.index - b.index)
})

const activeSections = computed(() => {
  return sections.value.filter((section) => !section.deleted_at)
})

const allModules = computed(() => {
  return sections.value.reduce((modules, section) => {
    if (!section.deleted_at && section.modules) {
      const sectionModules = section.modules
        .filter((module) => !module.deleted_at)
        .map((module) => ({
          ...module,
          section_name: section.name,
          section_icon: section.icon
        }))
      modules.push(...sectionModules)
    }
    return modules
  }, [])
})

const loadData = async () => {
  loading.value = true
  loadingMessage.value = 'Cargando secciones y módulos...'
  error.value = null

  try {
    // Fetch sections with modules from the API
    const data = await api.get('sections')

    // Validate and process the API response
    if (Array.isArray(data)) {
      sections.value = data.map((section) => ({
        ...section,
        modules: section.modules || []
      }))
    } else if (data.data && Array.isArray(data.data)) {
      sections.value = data.data.map((section) => ({
        ...section,
        modules: section.modules || []
      }))
    } else {
      throw new Error('Formato de respuesta de API inválido')
    }

    // Validate data integrity
    validateDataIntegrity()
  } catch (err) {
    error.value = err.message
    console.error('Error loading data:', err)

    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos',
      caption: err.message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const validateDataIntegrity = () => {
  const issues = []

  sections.value.forEach((section) => {
    // Check for required fields
    if (!section.name || !section.icon) {
      issues.push(`Sección ${section.id} faltan campos requeridos`)
    }

    // Check modules
    if (section.modules) {
      section.modules.forEach((module) => {
        if (!module.title || !module.link) {
          issues.push(`Módulo ${module.id} en sección ${section.name} faltan campos requeridos`)
        }

        if (module.section_id !== section.id) {
          issues.push(`Módulo ${module.id} tiene section_id incorrecto`)
        }
      })
    }
  })

  if (issues.length > 0) {
    console.warn('Problemas de integridad de datos encontrados:', issues)
  }
}

const refreshData = async () => {
  await loadData()
  $q.notify({
    type: 'positive',
    message: 'Datos actualizados correctamente',
    position: 'top'
  })
}

// Module Management
const getModulesBySection = (sectionId) => {
  const section = sections.value.find((s) => s.id === sectionId)
  if (!section || !section.modules) return []

  return section.modules.filter((module) => !module.deleted_at).sort((a, b) => a.position - b.position)
}

const openNewModuleForm = (sectionId = null) => {
  selectedModule.value = {
    title: '',
    link: '',
    section_id: sectionId || (sortedSections.value.length > 0 ? sortedSections.value[0].id : null),
    icon: 'note',
    position: 1
  }
  isEditingModule.value = false
  showModuleForm.value = true
}

const editModule = (module) => {
  selectedModule.value = { ...module }
  isEditingModule.value = true
  showModuleForm.value = true
}

const saveModule = async (moduleData) => {
  loading.value = true
  loadingMessage.value = isEditingModule.value ? 'Actualizando módulo...' : 'Creando módulo...'

  try {
    if (isEditingModule.value) {
      // Update existing module
      await api.put(`modules/${moduleData.id}`, moduleData)
    } else {
      // Create new module
      const newModuleData = {
        ...moduleData,
        position: getNextPosition(moduleData.section_id)
      }
      await api.post('modules', newModuleData)
    }

    // Refresh data to get updated state
    await loadData()

    $q.notify({
      type: 'positive',
      message: isEditingModule.value ? 'Módulo actualizado correctamente' : 'Módulo creado correctamente',
      position: 'top'
    })

    showModuleForm.value = false
  } catch (error) {
    console.error('Error saving module:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar módulo',
      caption: error.message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const confirmDeleteModule = (module) => {
  confirmMessage.value = `¿Está seguro de que desea eliminar "${module.title}"?`
  confirmedAction.value = () => deleteModule(module)
  showConfirmDialog.value = true
}

const deleteModule = async (module) => {
  loading.value = true
  loadingMessage.value = 'Eliminando módulo...'

  try {
    await api.delete(`modules/${module.id}`)

    // Refresh data
    await loadData()

    $q.notify({
      type: 'positive',
      message: 'Módulo eliminado correctamente',
      position: 'top'
    })
  } catch (error) {
    console.error('Error deleting module:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar módulo',
      caption: error.message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Module positioning methods
const moveModuleUp = async (moduleId) => {
  const module = findModuleById(moduleId)
  if (!module || module.position <= 1) return

  const sectionModules = getModulesBySection(module.section_id)
  const currentIndex = sectionModules.findIndex((m) => m.id === moduleId)

  if (currentIndex > 0) {
    const moduleAbove = sectionModules[currentIndex - 1]
    await swapModulePositions(module, moduleAbove)
  }
}

const moveModuleDown = async (moduleId) => {
  const module = findModuleById(moduleId)
  if (!module) return

  const sectionModules = getModulesBySection(module.section_id)
  const currentIndex = sectionModules.findIndex((m) => m.id === moduleId)

  if (currentIndex < sectionModules.length - 1) {
    const moduleBelow = sectionModules[currentIndex + 1]
    await swapModulePositions(module, moduleBelow)
  }
}

const swapModulePositions = async (module1, module2) => {
  loading.value = true
  loadingMessage.value = 'Actualizando posiciones...'

  try {
    // Swap positions
    const tempPosition = module1.position

    await api.patch(`modules/${module1.id}/position`, { position: module2.position })

    await api.patch(`modules/${module2.id}/position`, { position: tempPosition })

    // Refresh data
    await loadData()

    $q.notify({
      type: 'positive',
      message: `Posición de "${module1.title}" actualizada`,
      position: 'top',
      timeout: 1500
    })
  } catch (error) {
    console.error('Error updating positions:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar posiciones',
      caption: error.message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Section Management
const openNewSectionForm = () => {
  selectedSection.value = {
    name: '',
    icon: 'folder',
    index: getNextSectionIndex()
  }
  isEditingSection.value = false
  showSectionForm.value = true
}

const editSection = (section) => {
  selectedSection.value = { ...section }
  isEditingSection.value = true
  showSectionForm.value = true
}

const saveSection = async (sectionData) => {
  loading.value = true
  loadingMessage.value = isEditingSection.value ? 'Actualizando sección...' : 'Creando sección...'

  try {
    if (isEditingSection.value) {
      await api.put(`sections/${sectionData.id}`, sectionData)
    } else {
      await api.post('sections', sectionData)
    }

    await loadData()

    $q.notify({
      type: 'positive',
      message: isEditingSection.value ? 'Sección actualizada correctamente' : 'Sección creada correctamente',
      position: 'top'
    })

    showSectionForm.value = false
  } catch (error) {
    console.error('Error saving section:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar sección',
      caption: error.message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const confirmDeleteSection = (section) => {
  const sectionModules = getModulesBySection(section.id)

  if (sectionModules.length > 0) {
    $q.notify({
      type: 'warning',
      message: 'No se puede eliminar una sección con módulos. Mueva o elimine los módulos primero.',
      position: 'top'
    })
    return
  }

  confirmMessage.value = `¿Está seguro de que desea eliminar la sección "${section.name}"?`
  confirmedAction.value = () => deleteSection(section)
  showConfirmDialog.value = true
}

const deleteSection = async (section) => {
  loading.value = true
  loadingMessage.value = 'Eliminando sección...'

  try {
    await api.delete(`sections/${section.id}`)

    await loadData()

    $q.notify({
      type: 'positive',
      message: 'Sección eliminada correctamente',
      position: 'top'
    })
  } catch (error) {
    console.error('Error deleting section:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar sección',
      caption: error.message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Section positioning methods
const moveSectionLeft = async (sectionId) => {
  const section = sections.value.find((s) => s.id === sectionId)
  if (!section || section.index <= 1) return

  const activeSectionsList = sortedSections.value
  const currentIndex = activeSectionsList.findIndex((s) => s.id === sectionId)

  if (currentIndex > 0) {
    const sectionLeft = activeSectionsList[currentIndex - 1]
    await swapSectionPositions(section, sectionLeft)
  }
}

const moveSectionRight = async (sectionId) => {
  const section = sections.value.find((s) => s.id === sectionId)
  if (!section) return

  const activeSectionsList = sortedSections.value
  const currentIndex = activeSectionsList.findIndex((s) => s.id === sectionId)

  if (currentIndex < activeSectionsList.length - 1) {
    const sectionRight = activeSectionsList[currentIndex + 1]
    await swapSectionPositions(section, sectionRight)
  }
}

const swapSectionPositions = async (section1, section2) => {
  loading.value = true
  loadingMessage.value = 'Actualizando posiciones de sección...'

  try {
    const tempIndex = section1.index

    await api.path(`sections/${section1.id}/position`, { position: section2.index })

    await api.path(`sections/${section2.id}/position`, { index: tempIndex })

    await loadData()

    $q.notify({
      type: 'positive',
      message: `Posición de "${section1.name}" actualizada`,
      position: 'top',
      timeout: 1500
    })
  } catch (error) {
    console.error('Error updating section positions:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar posiciones de sección',
      caption: error.message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Helper functions
const findModuleById = (moduleId) => {
  for (const section of sections.value) {
    if (section.modules) {
      const module = section.modules.find((m) => m.id === moduleId)
      if (module) return module
    }
  }
  return null
}

const getNextPosition = (sectionId) => {
  const sectionModules = getModulesBySection(sectionId)
  return sectionModules.length > 0 ? Math.max(...sectionModules.map((module) => module.position)) + 1 : 1
}

const getNextSectionIndex = () => {
  return sections.value.length > 0 ? Math.max(...sections.value.map((section) => section.index)) + 1 : 1
}

const executeConfirmedAction = () => {
  if (confirmedAction.value) {
    confirmedAction.value()
    confirmedAction.value = null
  }
}

// Lifecycle hooks
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.kanban-view {
  height: calc(100vh - 140px);
  overflow: hidden;
}

.kanban-container {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
}

.section-column {
  width: 300px;
  min-width: 300px;
  height: 100%;
}

.add-section-column {
  width: 250px;
  min-width: 250px;
}

@media (max-width: 600px) {
  .section-column {
    width: 280px;
    min-width: 280px;
  }

  .add-section-column {
    width: 200px;
    min-width: 200px;
  }
}
</style>
