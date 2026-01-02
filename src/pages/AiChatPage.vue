<template>
  <q-page class="ai-chat-page">
    <div class="chat-container">
      <!-- Sidebar con lista de conversaciones -->
      <div class="chat-sidebar" :class="{ 'mobile-hidden': selectedChat && $q.screen.lt.md }">
        <div class="sidebar-header">
          <div class="header-content">
            <q-icon name="smart_toy" size="32px" color="primary" />
            <div class="header-text">
              <div class="header-title">Asistente IA</div>
              <div class="header-subtitle">Qbits Assistant</div>
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="add"
            color="primary"
            @click="createNewChat"
            class="new-chat-btn"
          >
            <q-tooltip>Nueva conversación</q-tooltip>
          </q-btn>
        </div>

        <div class="chat-list">
          <q-scroll-area class="fit">
            <div v-if="loading && chats.length === 0" class="text-center q-pa-md">
              <q-spinner color="primary" size="40px" />
            </div>

            <div v-else-if="chats.length === 0" class="empty-state">
              <q-icon name="chat_bubble_outline" size="64px" color="grey-5" />
              <div class="empty-text">No hay conversaciones</div>
              <q-btn
                flat
                color="primary"
                label="Iniciar chat"
                icon="add"
                @click="createNewChat"
              />
            </div>

            <div v-else class="chats-list-wrapper">
              <div
                v-for="chat in chats"
                :key="chat.id"
                class="chat-item-wrapper"
                :class="{ 'active': selectedChat?.id === chat.id }"
                @click="selectChat(chat)"
              >
                <div class="chat-item-content">
                  <div class="chat-avatar">
                    <q-avatar size="49px" color="primary" text-color="white">
                      <q-icon name="smart_toy" size="24px" />
                    </q-avatar>
                  </div>
                  <div class="chat-info">
                    <div class="chat-header-row">
                      <div class="chat-title">{{ chat.title || 'Nueva conversación' }}</div>
                    </div>
                    <div class="chat-preview">{{ truncateMessage(chat.last_message?.content) || 'Sin mensajes' }}</div>
                  </div>
                  <div class="chat-meta">
                    <div class="chat-time">{{ formatDate(chat.last_message_at) }}</div>
                    <div class="chat-actions" @click.stop>
                      <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="expand_more"
                        color="grey-6"
                        class="menu-btn"
                      >
                        <q-menu>
                          <q-list>
                            <q-item clickable v-close-popup @click="deleteChat(chat)">
                              <q-item-section avatar>
                                <q-icon name="delete" color="negative" />
                              </q-item-section>
                              <q-item-section>Eliminar</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-scroll-area>
        </div>
      </div>

      <!-- Área de chat -->
      <div class="chat-main" :class="{ 'mobile-hidden': !selectedChat && $q.screen.lt.md }">
        <!-- Sin chat seleccionado -->
        <div v-if="!selectedChat" class="chat-empty">
          <q-icon name="forum" size="120px" color="grey-4" />
          <div class="empty-title">Bienvenido al Asistente IA</div>
          <div class="empty-subtitle">
            Pregúntame sobre el estado de tu empresa, reportes de caja, métodos de pago o cómo usar el sistema
          </div>
          <q-btn
            unelevated
            color="primary"
            label="Iniciar conversación"
            icon="add_comment"
            size="lg"
            @click="createNewChat"
            class="q-mt-md"
          />
        </div>

        <!-- Chat seleccionado -->
        <div v-else class="chat-content">
          <!-- Header del chat -->
          <div class="chat-header">
            <q-btn
              v-if="$q.screen.lt.md"
              flat
              round
              dense
              icon="arrow_back"
              @click="selectedChat = null"
              class="q-mr-sm"
            />
            <q-avatar color="primary" text-color="white" size="40px">
              <q-icon name="smart_toy" />
            </q-avatar>
            <div class="header-info">
              <div class="chat-name">Asistente Qbits</div>
              <div class="chat-status">
                <q-icon name="circle" size="8px" color="positive" />
                En línea
              </div>
            </div>
          </div>

          <!-- Mensajes -->
          <div class="messages-container" ref="messagesContainer">
            <q-scroll-area class="fit">
              <div class="messages-list">
                <div
                  v-for="message in messages"
                  :key="message.id"
                  :class="['message-wrapper', message.role === 'user' ? 'user-message' : 'assistant-message']"
                >
                  <div class="message-bubble">
                    <div class="message-content" v-html="formatMessage(message.content)"></div>
                    <div class="message-time">{{ formatTime(message.created_at) }}</div>

                    <!-- Mostrar tutoriales si existen -->
                    <div v-if="message.metadata?.tutorials?.length > 0" class="tutorials-section">
                      <div class="tutorials-title">
                        <q-icon name="play_circle" size="20px" />
                        Tutoriales relacionados:
                      </div>
                      <div
                        v-for="tutorial in message.metadata.tutorials"
                        :key="tutorial.id"
                        class="tutorial-item"
                        @click="openTutorial(tutorial)"
                      >
                        <q-icon name="video_library" color="primary" />
                        <span>{{ tutorial.title }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Typing indicator -->
                <div v-if="isTyping" class="message-wrapper assistant-message">
                  <div class="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </q-scroll-area>
          </div>

          <div class="q-pa-md">
            <div class="input-wrapper">
              <div class="input-field">
                <q-input
                  v-model="newMessage"
                  placeholder="Escribe un mensaje"
                  filled
                  autogrow
                  @keyup.enter.exact="sendMessage"
                >
                  <template v-slot:append>
                    <q-btn
                      round
                      icon="send"
                      size="md"
                      style="border-radius: 100px;"
                      color="primary"
                      @click="sendMessage"
                      :disable="!newMessage.trim() || isTyping"
                    />
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog para ver tutorial -->
    <q-dialog v-model="showTutorialDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selectedTutorial?.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <video
            v-if="selectedTutorial?.video_path"
            :src="getVideoUrl(selectedTutorial.video_path)"
            controls
            style="width: 100%; max-height: 70vh;"
          ></video>
          <div class="q-mt-md">{{ selectedTutorial?.description }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default {
  name: 'AiChatPage',
  data () {
    return {
      chats: [],
      selectedChat: null,
      messages: [],
      newMessage: '',
      loading: false,
      isTyping: false,
      showTutorialDialog: false,
      selectedTutorial: null
    }
  },
  computed: {
    ...mapState(authentication, ['userSession']),
    currentCompany () {
      return this.userSession?.company_session
    }
  },
  mounted () {
    this.loadChats()
  },
  methods: {
    async loadChats () {
      this.loading = true
      try {
        const { data } = await api.get('ai-chats', {
          params: { company_id: this.currentCompany?.id }
        })
        this.chats = data.data || data
      } catch (error) {
        console.error('Error loading chats:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar las conversaciones'
        })
      } finally {
        this.loading = false
      }
    },

    async selectChat (chat) {
      this.selectedChat = chat
      this.loading = true
      try {
        const { data } = await api.get(`ai-chats/${chat.id}`)
        this.messages = data.messages || []
        await this.$nextTick()
        this.scrollToBottom()
      } catch (error) {
        console.error('Error loading chat:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar el chat'
        })
      } finally {
        this.loading = false
      }
    },

    createNewChat () {
      if (!this.currentCompany) {
        this.$q.notify({
          type: 'warning',
          message: 'Por favor selecciona una empresa primero'
        })
        return
      }

      this.$q.dialog({
        title: 'Nueva conversación',
        message: '¿En qué puedo ayudarte?',
        prompt: {
          model: '',
          type: 'textarea',
          placeholder: 'Ej: ¿Cómo va mi empresa hoy?'
        },
        cancel: true,
        persistent: false
      }).onOk(async (message) => {
        if (!message.trim()) return

        this.loading = true
        try {
          const { data } = await api.post('ai-chats', {
            company_id: this.currentCompany.id,
            message
          })

          this.chats.unshift(data)
          this.selectedChat = data
          this.messages = data.messages || []

          await this.$nextTick()
          this.scrollToBottom()

          this.$q.notify({
            type: 'positive',
            message: 'Conversación iniciada'
          })
        } catch (error) {
          console.error('Error creating chat:', error)
          this.$q.notify({
            type: 'negative',
            message: error.response?.data?.message || 'Error al crear la conversación'
          })
        } finally {
          this.loading = false
        }
      })
    },

    async sendMessage () {
      if (!this.newMessage.trim() || this.isTyping) return

      const messageText = this.newMessage
      this.newMessage = ''

      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString()
      }
      this.messages.push(userMessage)

      await this.$nextTick()
      this.scrollToBottom()

      this.isTyping = true

      try {
        const { data } = await api.post(`ai-chats/${this.selectedChat.id}/messages`, {
          message: messageText
        })

        const userIndex = this.messages.findIndex(m => m.id === userMessage.id)
        if (userIndex !== -1) {
          this.messages[userIndex] = data.user_message
        }

        this.messages.push(data.assistant_message)

        const chatIndex = this.chats.findIndex(c => c.id === this.selectedChat.id)
        if (chatIndex !== -1) {
          this.chats[chatIndex].last_message = data.assistant_message
          this.chats[chatIndex].last_message_at = data.assistant_message.created_at
        }

        await this.$nextTick()
        this.scrollToBottom()
      } catch (error) {
        console.error('Error sending message:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al enviar el mensaje'
        })
        this.messages = this.messages.filter(m => m.id !== userMessage.id)
      } finally {
        this.isTyping = false
      }
    },

    deleteChat (chat) {
      this.$q.dialog({
        title: 'Confirmar',
        message: '¿Estás seguro de eliminar esta conversación?',
        cancel: true,
        persistent: false
      }).onOk(async () => {
        try {
          await api.delete(`ai-chats/${chat.id}`)
          this.chats = this.chats.filter(c => c.id !== chat.id)

          if (this.selectedChat?.id === chat.id) {
            this.selectedChat = null
            this.messages = []
          }

          this.$q.notify({
            type: 'positive',
            message: 'Conversación eliminada'
          })
        } catch (error) {
          console.error('Error deleting chat:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Error al eliminar la conversación'
          })
        }
      })
    },

    openTutorial (tutorial) {
      this.selectedTutorial = tutorial
      this.showTutorialDialog = true
    },

    formatMessage (content) {
      if (!content) return ''

      let formatted = content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" class="message-link">$1</a>'
      )

      formatted = formatted.replace(/\n/g, '<br>')

      return formatted
    },

    formatDate (date) {
      if (!date) return ''
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
    },

    formatTime (date) {
      if (!date) return ''
      return format(new Date(date), 'HH:mm', { locale: es })
    },

    scrollToBottom () {
      const container = this.$refs.messagesContainer
      if (container) {
        const scrollArea = container.querySelector('.q-scrollarea__container')
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight
        }
      }
    },

    getVideoUrl (path) {
      return `${process.env.VUE_APP_API_URL}/storage/${path}`
    },

    truncateMessage (message) {
      if (!message) return ''
      const maxLength = 29
      if (message.length <= maxLength) return message
      return message.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-page {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.chat-container {
  display: flex;
  height: 100%;
  background: var(--q-page);
}

// Sidebar
.chat-sidebar {
  width: 380px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  background: white;

  @media (max-width: 1023px) {
    width: 100%;
    border-right: none;

    &.mobile-hidden {
      display: none;
    }
  }
}

.sidebar-header {
  padding: 16px;
  background: var(--q-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
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
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.header-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.new-chat-btn {
  background: transparent;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.chat-list {
  flex: 1;
  overflow: hidden;
  background: white;
}

.body--dark .chat-sidebar {
  background: #1e1e1e;
  border-right-color: rgba(255, 255, 255, 0.12);
}

.body--dark .chat-list {
  background: #1e1e1e;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  margin-top: 16px;
  font-size: 16px;
  color: var(--q-secondary);
  margin-bottom: 16px;
}

.chats-list-wrapper {
  padding: 0;
}

.chat-item-wrapper {
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  &.active {
    background: rgba(var(--q-primary-rgb), 0.08);
  }
}

.body--dark .chat-item-wrapper {
  border-bottom-color: rgba(255, 255, 255, 0.08);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: rgba(var(--q-primary-rgb), 0.15);
  }
}

.chat-item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  position: relative;
}

.chat-avatar {
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.chat-header-row {
  display: flex;
  align-items: center;
}

.chat-title {
  font-weight: 400;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}

.chat-time {
  font-size: 12px;
  opacity: 0.6;
  white-space: nowrap;
}

.chat-preview {
  opacity: 0.7;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 20px;
}

.chat-actions {
  display: flex;
  align-items: center;
  justify-content: center;

  .menu-btn {
    opacity: 0.6;
    transition: all 0.2s;

    &:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

.body--dark .chat-actions .menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

// Main chat area
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.body--dark .chat-main {
  background: #0b141a;

  @media (max-width: 1023px) {
    width: 100%;

    &.mobile-hidden {
      display: none;
    }
  }
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.empty-title {
  font-size: 24px;
  font-weight: 400;
  margin-top: 24px;
}

.empty-subtitle {
  font-size: 16px;
  opacity: 0.7;
  margin-top: 12px;
  max-width: 500px;
  line-height: 1.6;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  min-height: 60px;
}

.body--dark .chat-header {
  background: #202c33;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.header-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.chat-name {
  font-weight: 500;
  font-size: 16px;
}

.chat-status {
  font-size: 13px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 6px;
}

.messages-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #e5ddd5;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M25 25 L75 25 L50 75 Z" fill="%23000000" opacity="0.04"/></svg>');
    background-repeat: repeat;
    opacity: 0.4;
    pointer-events: none;
  }
}

.body--dark .messages-container {
  background: #0b141a;

  &::before {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M25 25 L75 25 L50 75 Z" fill="%23ffffff" opacity="0.03"/></svg>');
  }
}

.messages-list {
  padding: 20px;
  min-height: 100%;
  position: relative;
  z-index: 1;
}

.message-wrapper {
  display: flex;
  margin-bottom: 8px;

  &.user-message {
    justify-content: flex-end;

    .message-bubble {
      background: var(--q-primary);
      color: white;
      border-radius: 7.5px 7.5px 0 7.5px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  &.assistant-message {
    justify-content: flex-start;

    .message-bubble {
      background: white;
      color: #000;
      border-radius: 7.5px 7.5px 7.5px 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }
}

.body--dark .message-wrapper {
  &.assistant-message .message-bubble {
    background: #202c33;
    color: #e9edef;
  }

  &.user-message .message-bubble {
    color: white;
  }
}

.message-bubble {
  max-width: 65%;
  padding: 6px 7px 8px 9px;
  word-wrap: break-word;
  position: relative;

  @media (max-width: 768px) {
    max-width: 85%;
  }
}

.message-content {
  font-size: 14.2px;
  line-height: 19px;

  :deep(a.message-link) {
    color: var(--q-accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.message-time {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
}

.tutorials-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tutorials-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.8;
}

.tutorial-item {
  padding: 8px 10px;
  margin-top: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  transition: background 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

// Typing indicator
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: white;
  border-radius: 7.5px 7.5px 7.5px 0;
  width: fit-content;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.attach-btn {
  opacity: 0.6;
  margin-bottom: 4px;

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.05);
  }
}

.body--dark .attach-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.input-field {
  flex: 1;
}

.message-input {
  :deep(.q-field__control) {
    border-radius: 8px;
    background: #f0f2f5;
    min-height: 42px;

    &::before {
      border: none;
    }

    &::after {
      border: none;
    }
  }

  :deep(.q-field__native) {
    padding: 10px 12px;
    font-size: 15px;
  }
}

.body--dark .message-input {
  :deep(.q-field__control) {
    background: #b4b9bc;
  }

  :deep(.q-field__native) {
    color: #e9edef;
  }

  :deep(.q-field__control-container) {
    padding: 0;
  }
}

.send-btn {
  background: var(--q-primary);
  color: white;
  width: 42px;
  height: 42px;
  margin-bottom: 4px;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
  }

  :deep(.q-icon) {
    font-size: 20px;
  }
}
</style>
