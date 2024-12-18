<template>
  <div>
    <q-btn
      :class="className"
      :color="color"
      :icon="icon"
      :label="label"
      @click="$refs.fileInput.click()"
    />
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      multiple
      @change="uploadFile"
    />
    <slot></slot>
  </div>
</template>

<script setup>
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

const uploadFile = (e) => {
  const files = e.target.files
  emit('upload', files)
}
</script>
