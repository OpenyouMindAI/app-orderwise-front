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
        <q-tooltip>Chat de Soporte</q-tooltip>
      </q-btn>
    </transition>

    <!-- Support Components (Card or Chat) -->
    <transition name="slide-up">
      <div v-if="showMiniChat" class="mini-chat-container">
        <!-- List View (Facebook Card) -->
        <transition name="fade-scale" mode="out-in">
          <SupportFacebookCard
            v-if="!selectedChat"
            class="full-height-component"
            @chat-click="selectChat"
            @new-chat="startNewChat"
            @close="toggleMiniChat"
          />

          <!-- Active Chat View (Messenger style) -->
          <q-card v-else class="support-facebook-card shadow-2">
            <!-- Header -->
            <q-card-section class="card-header q-pa-md">
              <div class="row items-center no-wrap">
                <div class="avatar-container q-mr-sm">
                  <q-avatar size="44px" class="palma-avatar">
                    <q-icon name="auto_awesome" size="22px" color="white" />
                    <div class="status-indicator online"></div>
                  </q-avatar>
                </div>
                <div class="col">
                  <div class="support-name">
                    <span class="ellipsis">{{ selectedChat ? (selectedChat.title || selectedChat.subject) : 'Soporte OrderWise' }}</span>
                  </div>
                  <div class="support-status">
                    <q-icon name="circle" size="8px" color="green-5" class="q-ml-none q-mr-xs" />
                    <span class="status-text">Activo ahora</span>
                  </div>
                </div>
                <div class="row no-wrap items-center">
                  <q-btn
                    flat round dense
                    icon="arrow_back"
                    color="grey-7"
                    size="sm"
                    class="close-btn q-mr-xs"
                    @click="selectedChat = null"
                  >
                    <q-tooltip>Volver</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat round dense
                    icon="close"
                    color="grey-7"
                    size="sm"
                    class="close-btn"
                    @click="toggleMiniChat"
                  />
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <!-- Content -->
            <div class="mini-chat-content">
              <div class="active-chat">
                <!-- Messages: native scroll with column-reverse (WhatsApp/Discord pattern) -->
                <div class="messages-area" ref="messagesArea">
                  <!-- Typing Indicator (first in DOM = bottom of screen) -->
                  <div v-if="isTyping" class="message messenger-message other sequential">
                    <div class="message-avatar-column"></div>
                    <div class="message-bubble-wrapper">
                      <div class="message-bubble shadow-sm typing-bubble">
                        <div class="typing-animation"><span></span><span></span><span></span></div>
                      </div>
                    </div>
                  </div>

                  <!-- Messages (reversed so newest is at bottom with column-reverse) -->
                  <div
                    v-for="(message, index) in [...messages].reverse()"
                    :key="message.id"
                    class="message messenger-message"
                    :class="[
                      isOwnMessage(message) ? 'own' : 'other',
                      isSequential(message, messages.length - 1 - index) ? 'sequential' : '',
                      isNextSameUser(message, messages.length - 1 - index) ? 'next-same' : 'last-in-group'
                    ]"
                  >
                    <!-- Other Message: Avatar on Left -->
                    <template v-if="!isOwnMessage(message)">
                      <div class="message-avatar-column">
                        <q-avatar v-if="!isNextSameUser(message, messages.length - 1 - index)" size="28px" class="message-avatar">
                          <div class="ai-avatar-bg"><q-icon name="auto_awesome" size="14px" color="white" /></div>
                        </q-avatar>
                      </div>

                      <div class="message-bubble-wrapper">
                        <div class="message-bubble shadow-sm">
                          <div v-if="message.content" class="message-text" v-html="formatMessageContent(message.content)"></div>
                        </div>
                        <div v-if="!isNextSameUser(message, messages.length - 1 - index)" class="message-time-caption">
                          {{ formatTimeShort(message.created_at) }}
                        </div>
                      </div>
                    </template>

                    <!-- Own Message: Content Aligned Right -->
                    <template v-else>
                      <div class="message-bubble-wrapper">
                        <div class="message-bubble shadow-sm">
                          <div v-if="message.content" class="message-text">{{ message.content }}</div>
                        </div>
                        <div v-if="!isNextSameUser(message, messages.length - 1 - index)" class="message-time-caption">
                          {{ formatTimeShort(message.created_at) }}
                        </div>
                      </div>
                    </template>
                  </div>

                  <!-- Encryption Notice (last in DOM = top of conversation) -->
                  <div class="encryption-notice text-center q-mb-lg">
                    <q-icon name="lock" size="14px" class="q-mr-xs" />
                    <span>Los mensajes están protegidos con cifrado.</span>
                  </div>
                </div>

                <!-- Footer -->
                <q-separator />
                <q-card-section class="q-pa-md messenger-footer">
                  <q-input
                    ref="chatInput"
                    v-model="newMessage"
                    placeholder="Envía un mensaje..."
                    dense
                    rounded
                    outlined
                    bg-color="white"
                    autogrow
                    :max-rows="4"
                    @keydown.enter.prevent="sendMessage"
                    class="messenger-text-input"
                  >
                    <template v-slot:append>
                      <q-btn
                        flat
                        round
                        icon="send"
                        :color="newMessage.trim() && !isTyping ? 'primary' : 'grey-5'"
                        size="sm"
                        @click="sendMessage"
                        class="send-btn"
                      />
                    </template>
                  </q-input>
                </q-card-section>
              </div>
            </div>
          </q-card>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'
import SupportFacebookCard from './SupportFacebookCard.vue'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'

/**
 * Quasar instance
 */
const $q = useQuasar()

/**
 * Auth store
 */
const authStore = authentication()

const showMiniChat = ref(false)

/**
 * Typing indicator
 */
const isTyping = ref(false)

/**
 * Chats list
 */
const chats = ref([])

/**
 * Selected chat
 */
const selectedChat = ref(null)
/**
 * Messages
 */
const messages = ref([])

/**
 * New message
 */
const newMessage = ref('')

/**
 * Messages area ref
 */
const messagesArea = ref(null)

/**
 * Chat input ref
 */
const chatInput = ref(null)

/**
 * Current user
 */
const currentUser = computed(() => authStore.userSession)

/**
 * Toggle mini chat
 */
const toggleMiniChat = () => {
  showMiniChat.value = !showMiniChat.value
}

/**
 * Load chats (kept for manual refresh if needed)
 */
const loadChats = async () => {
  try {
    const { data } = await api.get('ai-chats', {
      params: { company_id: authStore.userSession?.company_session?.id }
    })
    chats.value = data.data || data || []
  } catch (error) {
    console.error('Error loading AI chats:', error)
  }
}

/**
 * Select chat
 */
const selectChat = async (chat) => {
  selectedChat.value = chat
  messages.value = []
  try {
    const { data } = await api.get(`ai-chats/${chat.id}`)
    messages.value = data.messages || []
  } catch (error) {
    console.error('Error loading AI chat:', error)
  }
}

/**
 * Send message
 */
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value) return

  const messageText = newMessage.value
  newMessage.value = ''

  // Add user message locally for immediate feedback
  const userMessage = {
    id: Date.now(),
    role: 'user',
    sender_id: authStore.userSession?.id,
    content: messageText,
    created_at: new Date().toISOString()
  }
  messages.value.push(userMessage)

  isTyping.value = true
  await nextTick()
  scrollToBottom()

  try {
    // If it's a new chat, create it on first message
    if (selectedChat.value.id === 'new') {
      const { data } = await api.post('ai-chats', {
        company_id: authStore.userSession?.company_session?.id,
        message: messageText,
        branch_office_id: authStore.branchOffice?.id
      })

      // Update selected chat and message list (data is the new chat)
      const newChat = data.chat || data
      selectedChat.value = newChat
      chats.value.unshift(newChat)
      messages.value = newChat.messages || []
    } else {
      const { data } = await api.post(`ai-chats/${selectedChat.value.id}/messages`, {
        message: messageText,
        branch_office_id: authStore.branchOffice?.id
      })

      // Replace the local mock user message with the real one from server
      const userIdx = messages.value.findIndex(m => m.id === userMessage.id)
      if (userIdx !== -1 && data.user_message) messages.value[userIdx] = data.user_message

      messages.value.push(data.assistant_message)

      // Update last message in chat list
      const chatIndex = chats.value.findIndex(c => c.id === selectedChat.value.id)
      if (chatIndex !== -1) {
        chats.value[chatIndex].last_message = data.assistant_message
        chats.value[chatIndex].updated_at = new Date().toISOString()
      }
    }

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error sending AI message:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar mensaje a la IA'
    })
    // Rollback local message if it failed
    messages.value = messages.value.filter(m => m.id !== userMessage.id)
  } finally {
    isTyping.value = false
  }
}

/**
 * Create new chat
 */
const startNewChat = async () => {
  // Option 1: Stay in bubble and show empty chat state with input
  selectedChat.value = { id: 'new', subject: 'Nueva conversación', title: 'Nueva conversación' }
  messages.value = []
}

/**
 * Is own message
 */
const isOwnMessage = (message) => {
  return message.role === 'user' || message.sender_id === currentUser.value?.id
}

/**
 * Scroll to bottom
 */
const scrollToBottom = () => {
  // With column-reverse, scrollTop = 0 is the visual bottom.
  // Just reset to 0 to snap to the latest message.
  if (messagesArea.value) {
    messagesArea.value.scrollTop = 0
  }
}

// NOTE: Scroll is managed exclusively inside selectChat() using the
// visibility-masking pattern. No competing watchers here.

const formatMessageContent = (content) => {
  if (!content) return ''
  return content
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="chat-link" style="color: #0084ff; text-decoration: none; font-weight: 500;">$1</a>')
    .replace(/\n/g, '<br>')
}

/**
 * Format time short for message captions
 */
const formatTimeShort = (dateStr) => {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'HH:mm')
}

/**
 * Check if messages are from same user to group them
 */
const isSequential = (message, index) => {
  if (index === 0) return false
  const prevMessage = messages.value[index - 1]
  if (message.role && prevMessage.role) {
    return message.role === prevMessage.role
  }
  if (message.sender_id && prevMessage.sender_id) {
    return message.sender_id === prevMessage.sender_id
  }
  return false
}

/**
 * Check if next message is from same user
 */
const isNextSameUser = (message, index) => {
  if (index === messages.value.length - 1) return false
  const nextMessage = messages.value[index + 1]
  if (message.role && nextMessage.role) {
    return message.role === nextMessage.role
  }
  if (message.sender_id && nextMessage.sender_id) {
    return message.sender_id === nextMessage.sender_id
  }
  return false
}

// Watch for chat selection — only reload the list when going back to null
watch(selectedChat, (newVal) => {
  if (newVal === null) {
    loadChats()
  }
})

// No scroll watchers needed — scroll is handled in selectChat()

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

.mini-chat-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 360px;
  height: 500px;
  z-index: 9999;
}

.full-height-component {
  height: 100%;
}

.support-facebook-card {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* active chat specific styles */
.active-chat-window {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* Messenger Theme Header */
.card-header {
  background: white;
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

.ai-avatar-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0084ff, #00c6ff);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.avatar-wrapper {
  position: relative;
}

.status-indicator {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  z-index: 1;

  &.online {
    background-color: #31a24c;
  }
}

.palma-avatar {
  background: linear-gradient(135deg, #0084ff, #00c6ff);
  box-shadow: 0 2px 8px rgba(0, 132, 255, 0.3);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-weight: 700;
  font-size: 15px;
  color: #18181b;
  line-height: 1.2;
  letter-spacing: -0.2px;
}

.header-status {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 12px;
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

.mini-chat-content {
  flex: 1;
  min-height: 0; /* Critical: allows flex children to shrink properly */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-list-mini {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.active-chat {
  flex: 1;
  min-height: 0; /* Critical: allows flex children to shrink properly */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
}

/* Messages scroll — column-reverse is the WhatsApp/Discord/Telegram pattern.
   Items overflow from the BOTTOM, so the browser always starts at the end.
   No JS scrolling needed on load. */
.messages-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  padding: 16px;
  background-color: #ffffff;
  position: relative;
  z-index: 1;

  /* Smooth scrolling for new messages */
  scroll-behavior: smooth;

  /* Thin scrollbar */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
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
  margin-bottom: 8px;
  position: relative;
  align-items: flex-end; /* Align avatar with last line */
  gap: 8px;

  &.next-same {
    margin-bottom: 2px;
  }

  &.other {
    grid-template-columns: 28px 1fr;
    padding-right: 48px;

    .message-bubble {
      background-color: #f0f2f5;
      color: #050505;
      /* Send by itself -> Tail at bottom-left */
      border-radius: 18px 18px 18px 0;
    }

    /* Top message of a group (no prev, has next) -> no tail, flat bottom-left to connect */
    &.next-same:not(.sequential) .message-bubble {
      border-radius: 18px 18px 18px 4px;
    }

    /* Middle message of a group (has prev, has next) -> flat top-left, flat bottom-left */
    &.sequential.next-same .message-bubble {
      border-radius: 4px 18px 18px 4px;
    }

    /* Bottom message of a group (has prev, no next) -> flat top-left, tail at bottom-left */
    &.sequential:not(.next-same) .message-bubble {
      border-radius: 4px 18px 18px 0;
    }
  }

  &.own {
    grid-template-columns: 1fr;
    padding-left: 72px; /* Increase left space to match (other's avatar + gap + right padding) */
    padding-right: 12px; /* Minimal right space as requested */

    .message-bubble {
      background-color: #0084ff;
      color: white;
      /* Send by itself -> Tail at bottom-right */
      border-radius: 18px 18px 0 18px;
    }

    /* Top message of a group (no prev, has next) -> no tail, flat bottom-right to connect */
    &.next-same:not(.sequential) .message-bubble {
      border-radius: 18px 18px 4px 18px;
    }

    /* Middle message of a group (has prev, has next) -> flat top-right, flat bottom-right */
    &.sequential.next-same .message-bubble {
      border-radius: 18px 4px 4px 18px;
    }

    /* Bottom message of a group (has prev, no next) -> flat top-right, tail at bottom-right */
    &.sequential:not(.next-same) .message-bubble {
      border-radius: 18px 4px 0 18px;
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

  &.typing-bubble {
    background-color: #f0f2f5;
    padding: 12px 16px;
    width: fit-content;
  }
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
  background: #f8f9fa;
  position: relative;
  z-index: 100;
}

.messenger-text-input {
  width: 100%;
  font-size: 14px;
}

.send-btn {
  margin-left: 4px;
}

.rounded-pill {
  border-radius: 20px;
}

.typing-animation {
  display: flex;
  gap: 4px;
  padding: 4px 0;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #9ca3af;
    animation: typing-bounce 1.4s infinite ease-in-out;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
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
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15);
  transform-origin: bottom right;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.3);
}

@media (max-width: 600px) {
  .mini-chat-container {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    bottom: 16px;
    right: 16px;
  }
}

// Transitions for view switching
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Dark Mode */
.body--dark {
  .support-facebook-card {
    background-color: #242526;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-header, .messenger-footer, .messenger-bg, .messages-area, .active-chat {
    background-color: #242526 !important;
  }

  .support-name, .header-title, .chat-subject { color: #e4e6eb; }
  .header-status, .status-text, .encryption-notice, .date-separator, .message-time-caption, .chat-preview { color: #b0b3b8; }

  .card-header, .messenger-footer { border-color: rgba(255, 255, 255, 0.1); }

  .input-container { background-color: #3a3b3c; }

  .messenger-message.other .message-bubble {
    background-color: #3a3b3c;
    color: #e4e6eb;
  }
}
</style>
