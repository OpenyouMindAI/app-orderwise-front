<template>
  <transition name="slide-toast">
    <div v-if="visible" class="support-notification-toast shadow-5" @click="handleClick">
      <div class="toast-content">
        <q-avatar size="42px" class="toast-avatar">
          <img v-if="avatar" :src="avatar" @error="handleAvatarError" />
          <q-icon v-else name="person" color="primary" />
        </q-avatar>
        <div class="toast-text">
          <div class="toast-name ellipsis">{{ name }}</div>
          <div class="toast-message ellipsis-2-lines">{{ message }}</div>
        </div>
        <q-btn flat round dense icon="close" size="sm" class="close-btn" @click.stop="hide" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  avatar: String,
  name: String,
  message: String,
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['click', 'close'])

const visible = ref(false)
let timer = null

const show = () => {
  if (timer) clearTimeout(timer)
  visible.value = true
  timer = setTimeout(() => {
    visible.value = false
  }, props.duration)
}

const hide = () => {
  visible.value = false
  if (timer) clearTimeout(timer)
}

const handleAvatarError = (e) => {
  e.target.src = 'https://cdn.quasar.dev/img/avatar.png' // Fallback
}

const handleClick = () => {
  emit('click')
  hide()
}

defineExpose({
  show,
  hide
})
</script>

<style scoped lang="scss">
.support-notification-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 320px;
  background: white;
  border-radius: 12px;
  z-index: 10000;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px;
  overflow: hidden;

  &:hover {
    background: #fdfdfd;
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.toast-avatar {
  flex-shrink: 0;
  border: 1.5px solid #f0f2f5;
  background: #f0f2f5;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-name {
  font-weight: 700;
  font-size: 14px;
  color: #1a1a1b;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 13px;
  color: #65676b;
  line-height: 1.3;
}

.close-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  color: #ced0d4;
  &:hover { color: #65676b; }
}

/* Animations: Right to Left and back */
.slide-toast-enter-active,
.slide-toast-leave-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-toast-enter-from,
.slide-toast-leave-to {
  transform: translateX(calc(100% + 40px));
  opacity: 0;
}

.slide-toast-enter-to,
.slide-toast-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* Dark Mode */
.body--dark .support-notification-toast {
  background: #242526;
  border-color: rgba(255, 255, 255, 0.1);

  .toast-name { color: #e4e6eb; }
  .toast-message { color: #b0b3b8; }
  .toast-avatar { border-color: #3a3b3c; background: #3a3b3c; }
}
</style>
