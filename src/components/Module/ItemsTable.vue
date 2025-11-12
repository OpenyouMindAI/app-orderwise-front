<template>
  <div class="modules-table-container">
    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input v-model="filters.search" label="Search modules" outlined dense clearable debounce="300">
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.section"
              :options="sectionOptions"
              label="Section"
              outlined
              dense
              clearable
              emit-value
              map-options
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <q-input v-model="filters.icon" label="Icon" outlined dense clearable debounce="300">
              <template #prepend>
                <q-icon name="emoji_symbols" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-2">
            <q-btn color="primary" icon="add" label="New Module" class="full-width" @click="$emit('add-module')" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-table
      :rows="filteredModules"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :loading="loading"
      :filter="filters.search"
      binary-state-sort
      flat
      bordered
    >
      <!-- Icon column -->
      <template #body-cell-icon="props">
        <q-td :props="props">
          <q-icon :name="props.value" size="24px" />
        </q-td>
      </template>

      <!-- Title column -->
      <template #body-cell-title="props">
        <q-td :props="props" :class="{ 'deleted-row': props.row.deleted_at }">
          {{ props.value }}
          <q-badge v-if="props.row.deleted_at" color="negative" class="q-ml-sm">Deleted</q-badge>
        </q-td>
      </template>

      <!-- Link column -->
      <template #body-cell-link="props">
        <q-td :props="props">
          <q-chip v-if="props.value" dense color="blue-1" text-color="blue-8" icon="link">
            {{ props.value }}
          </q-chip>
          <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <!-- Section column -->
      <template #body-cell-section="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-icon :name="getSectionIcon(props.value)" size="18px" class="q-mr-xs" />
            {{ props.value }}
          </div>
        </q-td>
      </template>

      <!-- Visible column -->
      <template #body-cell-visible="props">
        <q-td :props="props">
          <q-chip
            :color="props.value !== false ? 'green' : 'grey'"
            :text-color="props.value !== false ? 'white' : 'white'"
            dense
            size="sm"
          >
            <q-icon :name="props.value !== false ? 'visibility' : 'visibility_off'" size="16px" class="q-mr-xs" />
            {{ props.value !== false ? 'Visible' : 'Oculto' }}
          </q-chip>
        </q-td>
      </template>

      <!-- Roles column -->
      <template #body-cell-roles="props">
        <q-td :props="props">
          <div v-if="props.row.roles && props.row.roles.length > 0" class="q-gutter-xs">
            <q-chip
              v-for="role in props.row.roles.slice(0, 2)"
              :key="role.id"
              dense
              size="sm"
              color="purple-1"
              text-color="purple-8"
            >
              {{ role.acronym }}
            </q-chip>
            <q-chip v-if="props.row.roles.length > 2" dense size="sm" color="grey-3" text-color="grey-8">
              +{{ props.row.roles.length - 2 }}
            </q-chip>
          </div>
          <span v-else class="text-grey-5">No roles</span>
        </q-td>
      </template>

      <!-- Timestamps column -->
      <template #body-cell-timestamps="props">
        <q-td :props="props">
          <div class="text-caption">
            <div v-if="props.row.created_at">Created: {{ formatDate(props.row.created_at) }}</div>
            <div v-if="props.row.updated_at">Updated: {{ formatDate(props.row.updated_at) }}</div>
            <div v-if="!props.row.created_at && !props.row.updated_at" class="text-grey-5">No timestamps</div>
          </div>
        </q-td>
      </template>

      <!-- Actions column -->
      <template #body-cell-actions="props">
        <q-td :props="props" class="q-gutter-x-sm">
          <q-btn flat round dense color="primary" icon="edit" @click="$emit('edit-module', props.row)">
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn flat round dense color="negative" icon="delete" @click="$emit('delete-module', props.row)">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'

const props = defineProps({
  modules: {
    type: Array,
    default: () => [],
  },
  sections: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['edit-module', 'delete-module', 'add-module'])

// State
const loading = ref(false)
const filters = reactive({
  search: '',
  section: null,
  icon: '',
})

const pagination = ref({
  sortBy: 'updated_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Computed properties
const sectionOptions = computed(() => {
  return props.sections
    .filter((section) => !section.deleted_at)
    .map((section) => ({
      label: section.name,
      value: section.id,
      icon: section.icon,
    }))
})

const filteredModules = computed(() => {
  let result = [...props.modules]

  // Filter by section
  if (filters.section !== null) {
    result = result.filter((module) => module.section_id === filters.section)
  }

  // Filter by icon
  if (filters.icon) {
    const iconSearch = filters.icon.toLowerCase()
    result = result.filter((module) => module.icon && module.icon.toLowerCase().includes(iconSearch))
  }

  return result
})

// Table columns
const columns = [
  {
    name: 'icon',
    label: 'Icon',
    field: 'icon',
    align: 'center',
    sortable: true,
  },
  {
    name: 'title',
    label: 'Title',
    field: 'title',
    align: 'left',
    sortable: true,
  },
  {
    name: 'link',
    label: 'Link/Route',
    field: 'link',
    align: 'left',
    sortable: true,
  },
  {
    name: 'section',
    label: 'Section',
    field: 'section_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'position',
    label: 'Position',
    field: 'position',
    align: 'center',
    sortable: true
  },
  {
    name: 'visible',
    label: 'Visible',
    field: 'visible',
    align: 'center',
    sortable: true
  },
  {
    name: 'roles',
    label: 'Roles',
    field: 'roles',
    align: 'left',
    sortable: false
  },
  {
    name: 'timestamps',
    label: 'Timestamps',
    field: 'updated_at',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    sortable: false,
  },
]

// Helper functions
const getSectionIcon = (sectionName) => {
  const section = props.sections.find((s) => s.name === sectionName)
  return section ? section.icon : 'help'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

// Update pagination when modules change
watch(
  () => filteredModules.value.length,
  (count) => {
    pagination.value.rowsNumber = count
  }
)
</script>

<style scoped>
.modules-table-container {
  width: 100%;
}

.deleted-row {
  text-decoration: line-through;
  color: #f44336;
}
</style>
