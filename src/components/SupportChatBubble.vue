<template>
  <div class="support-chat-bubble">
    <!-- FAB Button -->
    <transition name="scale">
      <q-btn
        v-if="!showMiniChat"
        fab
        color="primary"
        icon="chat"
        class="chat-fab"
        @click="toggleMiniChat"
      >
        <q-badge
          v-if="unreadCount > 0"
          color="negative"
          floating
          :label="unreadCount > 99 ? '99+' : unreadCount"
        />
        <q-tooltip>Chat de Soporte</q-tooltip>
      </q-btn>
    </transition>

    <!-- Mini Chat Window -->
    <transition name="slide-up">
      <div v-if="showMiniChat" class="mini-chat-window messenger-theme">
        <!-- Header -->
        <div class="mini-chat-header messenger-header shadow-1">
          <div class="header-content clickable" @click="selectedChat = null">
            <div class="avatar-wrapper">
              <q-avatar size="36px" class="messenger-avatar">
                <q-img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" />
                <div class="status-indicator online"></div>
              </q-avatar>
            </div>
            <div class="header-text">
              <div class="header-title row items-center">
                <span>{{ selectedChat ? selectedChat.subject : 'Soporte OrderWise' }}</span>
                <q-icon name="expand_more" size="16px" class="q-ml-xs opacity-70" />
              </div>
              <div class="header-status">
                <span>{{ selectedChat ? 'Activo ahora' : 'En línea' }}</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <q-btn
              flat
              round
              dense
              icon="remove"
              color="primary"
              size="sm"
              class="messenger-action-btn"
              @click="toggleMiniChat"
            />
            <q-btn
              flat
              round
              dense
              icon="close"
              color="primary"
              size="sm"
              class="messenger-action-btn"
              @click="toggleMiniChat"
            />
          </div>
        </div>

        <!-- Chat List (if no active chat) -->
        <div v-if="!selectedChat" class="chat-list-mini">
          <q-scroll-area class="fit">
            <div v-if="loadingChats" class="text-center q-pa-md">
              <q-spinner color="primary" size="32px" />
            </div>

            <div v-else-if="chats.length === 0" class="empty-state q-pa-md text-center">
              <q-icon name="chat_bubble_outline" size="48px" color="grey-5" />
              <div class="text-grey-7 q-mt-sm">No hay conversaciones</div>
              <q-btn
                unelevated
                color="primary"
                label="Nuevo Chat"
                icon="add"
                size="sm"
                class="q-mt-md rounded-pill"
                @click="createNewChat"
              />
            </div>

            <div v-else class="chats-list">
              <div
                v-for="chat in chats"
                :key="chat.id"
                class="chat-item messenger-chat-item"
                @click="selectChat(chat)"
              >
                <q-avatar size="48px" color="primary" text-color="white" class="messenger-avatar">
                  {{ getInitials(chat.subject) }}
                </q-avatar>
                <div class="chat-info">
                  <div class="chat-subject">{{ chat.subject }}</div>
                  <div class="chat-preview row items-center">
                    <span class="ellipsis col">{{ truncate(chat.last_message?.content) }}</span>
                    <span class="dot q-mx-xs">•</span>
                    <span class="time">{{ formatRelativeTimeShort(chat.updated_at) }}</span>
                  </div>
                </div>
                <div v-if="chat.unread_count > 0" class="unread-dot"></div>
              </div>
            </div>
          </q-scroll-area>
        </div>

        <!-- Active Chat -->
        <div v-else class="active-chat">
          <!-- Messages -->
          <q-scroll-area class="messages-area messenger-bg" ref="messagesArea">
            <div class="messages-list q-pa-md">
              <!-- Encryption Notice -->
              <div class="encryption-notice text-center q-mb-lg">
                <q-icon name="lock" size="14px" class="q-mr-xs" />
                <span>Los mensajes están protegidos con cifrado de extremo a extremo. <a href="#" class="learn-more">Más información</a></span>
              </div>

              <!-- Date Separator -->
              <div class="date-separator text-center q-mb-md">
                <span>{{ formatDateHeader(messages[0]?.created_at) }}</span>
              </div>

              <div
                v-for="(message, index) in messages"
                :key="message.id"
                class="message messenger-message"
                :class="[
                  isOwnMessage(message) ? 'own' : 'other',
                  isSequential(message, index) ? 'sequential' : '',
                  isNextSameUser(message, index) ? 'next-same' : 'last-in-group'
                ]"
              >
                <!-- Other Message: Avatar on Left, Bubble on Right -->
                <template v-if="!isOwnMessage(message)">
                  <div class="message-avatar-column">
                    <q-avatar
                      v-if="!isNextSameUser(message, index)"
                      size="28px"
                      class="message-avatar"
                    >
                      <q-img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" />
                    </q-avatar>
                  </div>

                  <div class="message-bubble-wrapper">
                    <div class="message-bubble shadow-sm">
                      <div v-if="message.content" class="message-text">{{ message.content }}</div>
                    </div>
                    <div v-if="!isNextSameUser(message, index)" class="message-time-caption">
                      {{ formatTimeShort(message.created_at) }}
                    </div>
                  </div>
                </template>

                <!-- Own Message: Takes full width (aligned right via wrapper) -->
                <template v-else>
                  <div class="message-bubble-wrapper">
                    <div class="message-bubble shadow-sm">
                      <div v-if="message.content" class="message-text">{{ message.content }}</div>
                    </div>
                    <div v-if="!isNextSameUser(message, index)" class="message-time-caption">
                      {{ formatTimeShort(message.created_at) }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </q-scroll-area>

          <!-- Messenger Footer -->
          <div class="messenger-footer shadow-up-1">
            <div class="footer-actions row items-center no-wrap">

              <div class="input-container col">
                <q-input
                  v-model="newMessage"
                  placeholder="Escribe un mensaje..."
                  dense
                  borderless
                  @keyup.enter="sendMessage"
                  class="messenger-text-input"
                />
              </div>

              <q-btn
                flat round dense icon="send"
                color="primary"
                @click="sendMessage"
                size="13px"
                class="q-ml-xs"
                :disabled="!newMessage.trim()"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { echo } from 'src/boot/pusher'
import { authentication } from 'src/stores/module-authentication'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Router instance
 */
const router = useRouter()

/**
 * Quasar instance
 */
const $q = useQuasar()

/**
 * Auth store
 */
const authStore = authentication()

/**
 * Show mini chat
 */
const showMiniChat = ref(false)

/**
 * Chats list
 */
const chats = ref([
  {
    id: 1,
    subject: 'Soporte OrderWise',
    last_message: { content: '¡Hola! ¿En qué podemos ayudarte hoy?' },
    updated_at: new Date().toISOString(),
    unread_count: 1
  }
])

/**
 * Selected chat
 */
const selectedChat = ref({
  id: 1,
  subject: 'Soporte OrderWise'
})

/**
 * Messages
 */
const messages = ref([
  {
    id: 1,
    sender_id: 999, // Support ID mock
    content: '¡Hola! Bienvenido al soporte de OrderWise. 👋',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    type: 'text'
  },
  {
    id: 2,
    sender_id: 999,
    content: 'Estamos listos para ayudarte con cualquier duda que tengas sobre tu cuenta o pedidos.',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    type: 'text'
  },
  {
    id: 3,
    sender_id: 777, // Current user mock
    content: 'Genial, muchas gracias. Quería preguntar sobre mi último envío.',
    created_at: new Date(Date.now() - 900000).toISOString(),
    type: 'text'
  }
])

/**
 * New message
 */
const newMessage = ref('')

/**
 * Loading chats
 */
const loadingChats = ref(false)

/**
 * Unread count
 */
const unreadCount = ref(0)

/**
 * Messages area ref
 */
const messagesArea = ref(null)

/**
 * Current user
 */
const currentUser = computed(() => authStore.userSession)

/**
 * Toggle mini chat
 */
const toggleMiniChat = () => {
  console.log('toggleMiniChat called, current state:', showMiniChat.value)
  showMiniChat.value = !showMiniChat.value
  if (showMiniChat.value) {
    loadChats()
  }
}

/**
 * Load chats
 */
const loadChats = async () => {
  loadingChats.value = true
  try {
    const { data } = await api.get('support-chats', {
      params: {
        per_page: 10,
        only_open: true
      }
    })
    chats.value = data.data || []
    loadUnreadCount()
  } catch (error) {
    console.error('Error loading chats:', error)
  } finally {
    loadingChats.value = false
  }
}

/**
 * Load unread count
 */
const loadUnreadCount = async () => {
  try {
    const { data } = await api.get('support-chats/unread-count')
    unreadCount.value = data.unread_count || 0
  } catch (error) {
    console.error('Error loading unread count:', error)
  }
}

/**
 * Select chat
 */
const selectChat = async (chat) => {
  selectedChat.value = chat
  try {
    const { data } = await api.get(`support-chats/${chat.id}`)
    messages.value = data.messages || []
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error loading chat:', error)
  }
}

/**
 * Send message
 */
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value) return

  const messageText = newMessage.value
  newMessage.value = ''

  try {
    const { data } = await api.post(`support-chats/${selectedChat.value.id}/messages`, {
      message: messageText
    })
    messages.value.push(data.data)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar mensaje'
    })
  }
}

/**
 * Create new chat
 */
const createNewChat = () => {
  openFullChat()
}

/**
 * Open full chat
 */
const openFullChat = () => {
  router.push('/support')
  showMiniChat.value = false
}

/**
 * Is own message
 */
const isOwnMessage = (message) => {
  if (message.sender_id === 777) return true // Mock User ID
  return message.sender_id === currentUser.value?.id
}

/**
 * Get initials
 */
const getInitials = (text) => {
  if (!text) return '?'
  return text.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2)
}

/**
 * Truncate text
 */
const truncate = (text) => {
  if (!text) return ''
  return text.length > 40 ? text.substring(0, 40) + '...' : text
}

/**
 * Scroll to bottom
 */
const scrollToBottom = () => {
  if (messagesArea.value) {
    messagesArea.value.setScrollPosition('vertical', 9999, 300)
  }
}

// Listen for new messages
let supportChannel = null

/**
 * Initialize Pusher subscription
 */
const initSubscription = () => {
  if (supportChannel) {
    echo?.leave(`support.user.${currentUser.value.id}`)
  }

  if (echo && currentUser.value) {
    supportChannel = echo.private(`support.user.${currentUser.value.id}`)
      .listen('.message.sent', (data) => {
        // Auto-open on new message
        if (!showMiniChat.value) {
          showMiniChat.value = true
          loadChats().then(() => {
            const incomingChat = chats.value.find(c => c.id === data.message.support_chat_id)
            if (incomingChat) selectChat(incomingChat)
          })
        }

        // Add message if it belongs to selected chat
        if (selectedChat.value && parseInt(data.message.support_chat_id) === parseInt(selectedChat.value.id)) {
          // Avoid duplicates
          const exists = messages.value.some(m => parseInt(m.id) === parseInt(data.message.id))
          if (!exists) {
            messages.value.push(data.message)
            nextTick(() => scrollToBottom())
          }
        }
        loadUnreadCount()
        loadChats()
      })
  }
}

/**
 * Format relative time short (Messenger style)
 */
const formatRelativeTimeShort = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins} min`
  if (mins < 1440) return `${Math.floor(mins / 60)} h`
  return format(d, 'd MMM', { locale: es })
}

/**
 * Format time short for message captions
 */
const formatTimeShort = (dateStr) => {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'HH:mm')
}

/**
 * Format date header for message list
 */
const formatDateHeader = (dateStr) => {
  if (!dateStr) return ''
  return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
}

/**
 * Check if messages are from same user to group them
 */
const isSequential = (message, index) => {
  if (index === 0) return false
  return messages.value[index - 1].sender_id === message.sender_id
}

/**
 * Check if next message is from same user
 */
const isNextSameUser = (message, index) => {
  if (index === messages.value.length - 1) return false
  return messages.value[index + 1].sender_id === message.sender_id
}

onMounted(() => {
  loadUnreadCount()
  if (currentUser.value) {
    initSubscription()
  }
})

// Watch for user session to initialize subscription
watch(currentUser, (newVal) => {
  if (newVal) {
    initSubscription()
  }
}, { immediate: true })

onUnmounted(() => {
  if (supportChannel && currentUser.value) {
    echo?.leave(`support.user.${currentUser.value.id}`)
  }
})

// Watch for chat selection
watch(selectedChat, (newVal) => {
  if (newVal) {
    loadChats()
  }
})

// Expose methods for parent components
defineExpose({
  toggleMiniChat
})
</script>

<style scoped lang="scss">
.support-chat-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
}

.chat-fab {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: scale(1.1);
  }
}

.mini-chat-window {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 360px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s;
}

/* Messenger Theme Header */
.messenger-header {
  height: 60px;
  padding: 0 8px 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

.messenger-avatar {
  border: 1.5px solid #fff;
  background: #f0f2f5;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.avatar-wrapper {
  position: relative;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  z-index: 1;

  &.online {
    background-color: #31a24c;
  }
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-weight: 700;
  font-size: 15px;
  color: #050505;
  line-height: 1.2;
}

.header-status {
  font-size: 11px;
  color: #65676b;
}

.header-actions {
  display: flex;
  gap: 2px;
}

.messenger-action-btn {
  width: 32px;
  height: 32px;
  color: #0084ff !important;
}

.active-chat {
  display: flex;
  flex-direction: column;
  height: calc(500px - 60px); /* Height minus header */
}

/* Messenger BG & Messages */
.messenger-bg {
  background-color: #ffffff;
  flex: 1;
}

.messages-area {
  flex: 1;
}

.messages-list {
  display: flex;
  flex-direction: column;
}

.encryption-notice {
  padding: 12px 24px;
  color: #65676b;
  font-size: 12px;
  line-height: 1.4;

  .learn-more {
    color: #0084ff;
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
}

.date-separator {
  color: #65676b;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  margin: 16px 0;
}

.messenger-message {
  display: grid;
  margin-bottom: 2px;
  position: relative;
  align-items: flex-end; /* Align avatar with last line */
  gap: 8px;

  &.other {
    grid-template-columns: 28px 1fr;
    padding-right: 48px;

    .message-bubble {
      background-color: #f0f2f5;
      color: #050505;
      border-radius: 18px 18px 18px 4px;
    }

    &.sequential .message-bubble {
      border-top-left-radius: 4px;
    }

    &.next-same .message-bubble {
      border-bottom-left-radius: 4px;
    }
  }

  &.own {
    grid-template-columns: 1fr;
    padding-left: 72px; /* Increase left space to match (other's avatar + gap + right padding) */
    padding-right: 12px; /* Minimal right space as requested */

    .message-bubble {
      background-color: #0084ff;
      color: white;
      border-radius: 18px 18px 4px 18px;
    }

    &.sequential .message-bubble {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    &.next-same .message-bubble {
      border-bottom-right-radius: 4px;
    }

    .message-bubble-wrapper {
      align-items: flex-end;
    }
  }
}

.message-avatar-column {
  width: 28px;
  display: flex;
  justify-content: center;
}

.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.message-bubble {
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  position: relative;
}

.message-time-caption {
  font-size: 10px;
  color: #65676b;
  margin-top: 4px;
  padding: 0 4px;
}

.avatar-spacer {
  width: 28px;
}

/* Messenger Footer */
.messenger-footer {
  padding: 8px 12px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.input-container {
  background: #f0f2f5;
  border-radius: 20px;
  padding: 0 12px;
  margin: 0 8px;
  min-height: 36px;
  display: flex;
  align-items: center;
}

.messenger-text-input {
  width: 100%;
  font-size: 14px;

  :deep(.q-field__control) {
    height: 36px;
    background: transparent !important;
  }
}

/* Chat List Items */
.messenger-chat-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;

  &:hover {
    background: #f5f5f5;
  }

  .chat-subject {
    font-weight: 600;
    font-size: 14px;
    color: #050505;
  }

  .chat-preview {
    font-size: 12px;
    color: #65676b;

    .time {
      flex-shrink: 0;
    }
  }

  .unread-dot {
    width: 12px;
    height: 12px;
    background: #0084ff;
    border-radius: 50%;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.rounded-pill {
  border-radius: 20px;
}

// Animations
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 600px) {
  .mini-chat-window {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    bottom: 16px;
    right: 16px;
  }
}

/* Transitions for messages */
.slide-left-enter-active, .slide-right-enter-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from { transform: translateX(100%); }
.slide-right-enter-from { transform: translateX(-100%); }

/* Dark Mode */
.body--dark {
  .mini-chat-window, .messenger-header, .messenger-footer, .messenger-bg {
    background-color: #242526;
  }

  .header-title, .chat-subject { color: #e4e6eb; }
  .header-status, .status-text, .encryption-notice, .date-separator, .message-time-caption, .chat-preview { color: #b0b3b8; }

  .messenger-header, .messenger-footer { border-color: rgba(255, 255, 255, 0.1); }

  .input-container { background-color: #3a3b3c; }
  .messenger-chat-item:hover { background-color: #3a3b3c; }

  .messenger-message.other .message-bubble {
    background-color: #3a3b3c;
    color: #e4e6eb;
  }
}
</style>
