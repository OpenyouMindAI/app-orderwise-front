<template>
  <div class="full-width">
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      multiple
      @change="uploadFile"
    />
    <slot
      name="button"
      :input-file="$refs"
      v-if="$slots.button"
    />
    <q-btn
      v-else
      :class="className"
      :color="color"
      :icon="icon"
      :label="label"
      @click="$refs.fileInput.click()"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'FileButtonComponent'
})

defineProps({
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'attach_file'
  },
  color: {
    type: String,
    default: 'warning'
  },
  className: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['upload'])

const fileInput = ref(null)

const uploadFile = (e) => {
  const files = e.target.files
  emit('upload', files)
}

const onClick = () => {
  fileInput.value.click()
}

defineExpose({
  onClick
})
</script>
