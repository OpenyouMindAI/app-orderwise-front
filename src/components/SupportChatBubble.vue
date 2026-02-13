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
      <div v-if="showMiniChat" class="mini-chat-window">
        <!-- Header -->
        <div class="mini-chat-header bg-primary text-white">
          <div class="header-content">
            <q-avatar size="32px" color="white" text-color="primary">
              <q-icon name="headset_mic" />
            </q-avatar>
            <div class="header-text">
              <div class="header-title">Soporte</div>
              <div class="header-status">
                <div class="status-dot online"></div>
                <span>En línea</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <q-btn
              flat
              round
              dense
              icon="minimize"
              color="white"
              size="sm"
              @click="toggleMiniChat"
            />
            <q-btn
              flat
              round
              dense
              icon="open_in_new"
              color="white"
              size="sm"
              @click="openFullChat"
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
                class="q-mt-md"
                @click="createNewChat"
              />
            </div>

            <div v-else class="chats-list">
              <div
                v-for="chat in chats"
                :key="chat.id"
                class="chat-item"
                @click="selectChat(chat)"
              >
                <q-avatar size="40px" color="primary" text-color="white">
                  {{ getInitials(chat.subject) }}
                </q-avatar>
                <div class="chat-info">
                  <div class="chat-subject">{{ chat.subject }}</div>
                  <div class="chat-preview">{{ truncate(chat.last_message?.content) }}</div>
                </div>
                <q-badge
                  v-if="chat.unread_count > 0"
                  color="negative"
                  :label="chat.unread_count"
                />
              </div>
            </div>
          </q-scroll-area>
        </div>

        <!-- Active Chat -->
        <div v-else class="active-chat">
          <!-- Chat Header -->
          <div class="chat-header-mini">
            <q-btn
              flat
              round
              dense
              icon="arrow_back"
              size="sm"
              @click="selectedChat = null"
            />
            <div class="chat-title">{{ selectedChat.subject }}</div>
          </div>

          <!-- Messages -->
          <q-scroll-area class="messages-area" ref="messagesArea">
            <div class="messages-list q-pa-md">
              <div
                v-for="message in messages"
                :key="message.id"
                class="message"
                :class="isOwnMessage(message) ? 'own' : 'other'"
              >
                <div class="message-bubble">
                  <!-- Audio Message -->
                  <AudioPlayer
                    v-if="message.type === 'audio' && message.attachment_url"
                    :src="message.attachment_url"
                    :filename="message.attachment_name"
                  />
                  
                  <!-- Image Message -->
                  <q-img
                    v-else-if="message.type === 'image' && message.attachment_url"
                    :src="message.attachment_url"
                    class="message-image"
                    fit="cover"
                  />
                  
                  <!-- Text Message -->
                  <div v-if="message.content" class="message-text">{{ message.content }}</div>
                  
                  <div class="message-time">{{ formatTime(message.created_at) }}</div>
                </div>
              </div>
            </div>
          </q-scroll-area>

          <!-- Input -->
          <div class="chat-input">
            <q-input
              v-model="newMessage"
              placeholder="Escribe un mensaje..."
              dense
              outlined
              @keyup.enter="sendMessage"
              class="message-input"
            >
              <template v-slot:prepend>
                <AudioRecorder @send="sendAudio" />
              </template>
              <template v-slot:append>
                <q-btn
                  flat
                  round
                  dense
                  icon="send"
                  color="primary"
                  @click="sendMessage"
                  :disable="!newMessage.trim()"
                />
              </template>
            </q-input>
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
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import AudioRecorder from './AudioRecorder.vue'
import AudioPlayer from './AudioPlayer.vue'

/**
 * Router instance
 * @type {object}
 */
const router = useRouter()

/**
 * Quasar instance
 * @type {object}
 */
const $q = useQuasar()

/**
 * Auth store
 * @type {object}
 */
const authStore = authentication()

/**
 * Show mini chat
 * @type {import('vue').Ref<boolean>}
 */
const showMiniChat = ref(false)

/**
 * Chats list
 * @type {import('vue').Ref<Array>}
 */
const chats = ref([])

/**
 * Selected chat
 * @type {import('vue').Ref<object|null>}
 */
const selectedChat = ref(null)

/**
 * Messages
 * @type {import('vue').Ref<Array>}
 */
const messages = ref([])

/**
 * New message
 * @type {import('vue').Ref<string>}
 */
const newMessage = ref('')

/**
 * Loading chats
 * @type {import('vue').Ref<boolean>}
 */
const loadingChats = ref(false)

/**
 * Unread count
 * @type {import('vue').Ref<number>}
 */
const unreadCount = ref(0)

/**
 * Messages area ref
 * @type {import('vue').Ref<object|null>}
 */
const messagesArea = ref(null)

/**
 * Current user
 * @type {import('vue').ComputedRef<object>}
 */
const currentUser = computed(() => authStore.userSession)

/**
 * Toggle mini chat
 * @returns {void}
 */
const toggleMiniChat = () => {
  showMiniChat.value = !showMiniChat.value
  if (showMiniChat.value) {
    loadChats()
  }
}

/**
 * Load chats
 * @returns {Promise<void>}
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
 * @returns {Promise<void>}
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
 * @param {object} chat - Chat to select
 * @returns {Promise<void>}
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
 * @returns {Promise<void>}
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
 * Send audio
 * @param {Blob} audioBlob - Audio blob
 * @returns {Promise<void>}
 */
const sendAudio = async (audioBlob) => {
  if (!selectedChat.value) return

  try {
    const formData = new FormData()
    formData.append('attachment', audioBlob, 'audio.webm')

    const { data } = await api.post(`support-chats/${selectedChat.value.id}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    messages.value.push(data.data)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error sending audio:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar audio'
    })
  }
}

/**
 * Create new chat
 * @returns {void}
 */
const createNewChat = () => {
  openFullChat()
}

/**
 * Open full chat
 * @returns {void}
 */
const openFullChat = () => {
  router.push('/support')
  showMiniChat.value = false
}

/**
 * Is own message
 * @param {object} message - Message
 * @returns {boolean}
 */
const isOwnMessage = (message) => {
  return message.sender_id === currentUser.value?.id
}

/**
 * Get initials
 * @param {string} text - Text
 * @returns {string}
 */
const getInitials = (text) => {
  if (!text) return '?'
  return text.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2)
}

/**
 * Truncate text
 * @param {string} text - Text
 * @returns {string}
 */
const truncate = (text) => {
  if (!text) return ''
  return text.length > 40 ? text.substring(0, 40) + '...' : text
}

/**
 * Format time
 * @param {string} date - Date string
 * @returns {string}
 */
const formatTime = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

/**
 * Scroll to bottom
 * @returns {void}
 */
const scrollToBottom = () => {
  if (messagesArea.value) {
    messagesArea.value.setScrollPosition('vertical', 9999, 300)
  }
}

// Listen for new messages
let supportChannel = null

onMounted(() => {
  loadUnreadCount()
  
  // Subscribe to support channel
  if (echo && currentUser.value) {
    supportChannel = echo.private(`support.user.${currentUser.value.id}`)
      .listen('.message.sent', (data) => {
        if (selectedChat.value && data.message.support_chat_id === selectedChat.value.id) {
          messages.value.push(data.message)
          nextTick(() => scrollToBottom())
        }
        loadUnreadCount()
        loadChats()
      })
  }
})

onUnmounted(() => {
  if (supportChannel) {
    echo?.leave(`support.user.${currentUser.value.id}`)
  }
})

// Watch for chat selection
watch(selectedChat, (newVal) => {
  if (newVal) {
    loadChats()
  }
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
  
  &:hover {
    transform: scale(1.05);
  }
}

.mini-chat-window {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 360px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mini-chat-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-weight: 600;
  font-size: 14px;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  opacity: 0.9;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  &.online {
    background: #4caf50;
  }
}

.header-actions {
  display: flex;
  gap: 4px;
}

.chat-list-mini {
  flex: 1;
  overflow: hidden;
}

.chats-list {
  display: flex;
  flex-direction: column;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f5f5f5;
  }
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-subject {
  font-weight: 500;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-preview {
  font-size: 12px;
  color: #757575;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.active-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.chat-title {
  font-weight: 500;
  font-size: 14px;
}

.messages-area {
  flex: 1;
  background: #fafafa;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  display: flex;
  
  &.own {
    justify-content: flex-end;
    
    .message-bubble {
      background: #1976d2;
      color: white;
    }
  }
  
  &.other {
    justify-content: flex-start;
    
    .message-bubble {
      background: white;
      color: #212121;
    }
  }
}

.message-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-text {
  font-size: 13px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-image {
  max-width: 200px;
  border-radius: 8px;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 4px;
}

.chat-input {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.message-input {
  :deep(.q-field__control) {
    border-radius: 20px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

// Animations
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
</style>
