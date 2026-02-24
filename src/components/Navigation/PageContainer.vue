<template>
  <div class="page-container">
    <!-- Header -->
    <header class="page-header" :class="{ 'overlay-header': overlayHeader }">
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
    <footer v-if="$slots.footer || (footerButtonLabel && footerButtonVisible)" class="page-footer">
      <slot name="footer">
        <q-btn
          class="primary-footer-btn full-width"
          unelevated
          no-caps
          :label="footerButtonLabel"
          :loading="footerButtonLoading"
          :disable="footerButtonDisable"
          @click="$emit('footer-click')"
        />
      </slot>
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
  },
  footerButtonLabel: {
    type: String,
    default: ''
  },
  footerButtonLoading: {
    type: Boolean,
    default: false
  },
  footerButtonDisable: {
    type: Boolean,
    default: false
  },
  footerButtonVisible: {
    type: Boolean,
    default: true
  },
  overlayHeader: {
    type: Boolean,
    default: false
  }
})

defineEmits(['back', 'footer-click'])
</script>

<style scoped>
.page-container {
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

.page-header.overlay-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
  border-bottom: none;
  z-index: 30;
}

.page-header.overlay-header :deep(.back-btn) {
  background: white !important;
  color: black !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
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
  padding: 1rem;
  border-top: 2px solid var(--border);
  position: sticky;
  bottom: 0;
  z-index: 20;
}

.primary-footer-btn {
  pointer-events: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  height: 56px;
  font-size: 1rem;
  border-radius: 16px !important;
  transition: all 0.3s ease;
  border: none !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.primary-footer-btn :deep(.q-btn__content) {
  font-weight: 600;
}

.primary-footer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.primary-footer-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 599px) {
  .page-header {
    padding: 12px 16px;
  }

  .header-title {
    font-size: 18px;
  }
}
</style>
