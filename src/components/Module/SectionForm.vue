<template>
  <q-card style="width: 400px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">{{ isEditing ? 'Edit Section' : 'New Section' }}</div>
    </q-card-section>

    <q-form ref="sectionForm" @submit="onSubmit">
      <q-card-section>
        <div class="q-gutter-md">
          <!-- Name -->
          <q-input
            v-model="form.name"
            label="Name *"
            :rules="[(val) => !!val || 'Name is required']"
            outlined
            autofocus
            counter
            maxlength="100"
          />

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

          <!-- Index (only for editing) -->
          <q-input v-if="isEditing" v-model.number="form.index" label="Order" type="number" outlined min="1" />
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
import { ref, reactive, watch } from 'vue'
import IconPicker from './IconPicker.vue'

const props = defineProps({
  section: {
    type: Object,
    default: () => ({})
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

// State
const sectionForm = ref(null)
const submitting = ref(false)
const showIconPicker = ref(false)

const form = reactive({
  id: null,
  name: '',
  icon: 'folder',
  index: 1
})

// Watch for changes in props.section
watch(
  () => props.section,
  (newSection) => {
    if (newSection) {
      Object.assign(form, {
        id: newSection.id,
        name: newSection.name || '',
        icon: newSection.icon || 'folder',
        index: newSection.index || 1
      })
    }
  },
  { immediate: true }
)

// Methods
const onSubmit = async () => {
  submitting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
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
