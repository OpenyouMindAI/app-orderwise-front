<template>
  <q-card style="width: 500px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">{{ isEditing ? 'Edit Module' : 'New Module' }}</div>
    </q-card-section>

    <q-form ref="moduleForm" @submit="onSubmit">
      <q-card-section>
        <div class="q-gutter-md">
          <!-- Title -->
          <q-input
            v-model="form.title"
            label="Title *"
            :rules="[(val) => !!val || 'Title is required']"
            outlined
            autofocus
            counter
            maxlength="255"
          />

          <!-- Link/Route -->
          <q-input
            v-model="form.link"
            label="Link/Route *"
            :rules="[(val) => !!val || 'Link/Route is required']"
            outlined
            hint="Component name or route path"
          />

          <!-- Section -->
          <q-select
            v-model="form.section_id"
            :options="sectionOptions"
            label="Section *"
            :rules="[(val) => !!val || 'Section is required']"
            outlined
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

            <template #selected>
              <div v-if="selectedSectionOption" class="row items-center">
                <q-icon :name="selectedSectionOption.icon" class="q-mr-xs" />
                {{ selectedSectionOption.label }}
              </div>
            </template>
          </q-select>

          <!-- Icon -->
          <div>
            <q-input
              v-model="form.icon"
              label="Icon *"
              :rules="[(val) => !!val || 'Icon is required']"
              outlined
              readonly
            >
              <template #prepend>
                <q-icon :name="form.icon || 'help'" />
              </template>

              <template #append>
                <q-btn round flat icon="edit" @click="showIconPicker = true" />
              </template>
            </q-input>
          </div>

          <!-- Position (only for editing) -->
          <q-input v-if="isEditing" v-model.number="form.position" label="Position" type="number" outlined min="1" />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey-7" :disable="submitting" @click="$emit('cancel')" />
        <q-btn type="submit" :label="isEditing ? 'Update' : 'Create'" color="primary" :loading="submitting" />
      </q-card-actions>
    </q-form>

    <!-- Icon Picker Dialog -->
    <q-dialog v-model="showIconPicker">
      <IconPicker :selected-icon="form.icon" @select="onIconSelected" @cancel="showIconPicker = false" />
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import IconPicker from './IconPicker.vue'

const props = defineProps({
  module: {
    type: Object,
    default: () => ({}),
  },
  sections: {
    type: Array,
    default: () => [],
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'cancel'])

// State
const moduleForm = ref(null)
const submitting = ref(false)
const showIconPicker = ref(false)

const form = reactive({
  id: null,
  title: '',
  link: '',
  section_id: null,
  icon: 'note',
  position: 1,
})

// Computed properties
const sectionOptions = computed(() => {
  return props.sections.map((section) => ({
    label: section.name,
    value: section.id,
    icon: section.icon,
  }))
})

const selectedSectionOption = computed(() => {
  return sectionOptions.value.find((option) => option.value === form.section_id)
})

// Watch for changes in props.module
watch(
  () => props.module,
  (newModule) => {
    if (newModule) {
      Object.assign(form, {
        id: newModule.id,
        title: newModule.title || '',
        link: newModule.link || '',
        section_id: newModule.section_id,
        icon: newModule.icon || 'note',
        position: newModule.position || 1,
      })
    }
  },
  { immediate: true }
)

// Methods
const onSubmit = async () => {
  submitting.value = true
  try {
    emit('save', { ...form })
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    submitting.value = false
  }
}

const onIconSelected = (icon) => {
  form.icon = icon
  showIconPicker.value = false
}
</script>
