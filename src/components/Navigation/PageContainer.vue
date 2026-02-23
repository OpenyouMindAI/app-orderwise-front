<template>
  <div class="page-container">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <q-btn
          v-if="showBackButton"
          :icon="backIcon"
          flat
          round
          dense
          color="dark"
          class="back-btn bg-white shadow-2"
          size="sm"
          @click="$emit('back')"
        />
        <slot name="header-left"></slot>
      </div>

      <div class="header-center">
        <div v-if="title" class="header-title">{{ title }}</div>
        <slot name="header-center"></slot>
      </div>

      <div class="header-right">
        <slot name="header-right"></slot>
      </div>
    </header>

    <!-- Content -->
    <main class="page-content">
      <slot></slot>
    </main>

    <!-- Footer -->
    <footer v-if="$slots.footer" class="page-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  backIcon: {
    type: String,
    default: 'arrow_back_ios_new'
  }
})

defineEmits(['back'])
</script>

<style scoped>
.page-container {
  min-height: 100dvh;
  background: var(--background);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  width: 100%;
}

/* Header */
.page-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 16px 20px;
  background: var(--surface);
  border-bottom: 2px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.back-btn {
  width: 36px;
  height: 36px;
  min-height: 36px;
}

.back-btn :deep(.q-icon) {
  font-size: 16px;
  margin-right: -2px; /* Center adjustment for arrow_back_ios_new */
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Content */
.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Footer */
.page-footer {
  background: var(--surface);
  padding: 16px 20px;
  border-top: 2px solid var(--border);
  position: sticky;
  bottom: 0;
  z-index: 20;
}

/* Responsive */
@media (max-width: 599px) {
  .page-header {
    padding: 12px 16px;
  }

  .header-title {
    font-size: 18px;
  }

  .page-footer {
    padding: 12px 16px;
  }
}
</style>
