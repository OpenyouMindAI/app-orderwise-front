<template>
  <transition name="slide-toast">
    <div v-if="visible" class="support-notification-toast shadow-5" @click="handleClick">
      <div class="toast-content">
        <q-avatar size="42px" class="toast-avatar shadow-1">
          <img v-if="avatar" :src="avatar" @error="handleAvatarError" alt="Avatar" />
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
  e.target.src = 'https://cdn.quasar.dev/img/avatar.png'
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
  width: 340px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  z-index: 5000; /* Above Chat Bubble (4000), Below Quasar Menus (6000) */
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 14px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    background: #fff;
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0,0,0,0.2);
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
}

.toast-avatar {
  flex-shrink: 0;
  border: 2px solid #fff;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-name {
  font-weight: 700;
  font-size: 15px;
  color: #1a1a1b;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 13px;
  color: #5f6368;
  line-height: 1.4;
}

.close-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  color: #bdc3c7;
  &:hover { color: #2c3e50; }
}

/* Animations */
.slide-toast-enter-active,
.slide-toast-leave-active {
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.slide-toast-enter-from,
.slide-toast-leave-to {
  transform: translateX(120%) scale(0.9);
  opacity: 0;
}

.slide-toast-enter-to,
.slide-toast-leave-from {
  transform: translateX(0) scale(1);
  opacity: 1;
}

/* Dark Mode */
.body--dark .support-notification-toast {
  background: rgba(36, 37, 38, 0.95);
  border-color: rgba(255, 255, 255, 0.1);

  .toast-name { color: #e4e6eb; }
  .toast-message { color: #b0b3b8; }
  .toast-avatar { border-color: #3a3b3c; }
}
</style>
