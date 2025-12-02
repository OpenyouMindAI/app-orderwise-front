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
              <div class="header-subtitle">Orderwise Assistant</div>
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

            <q-list v-else>
              <q-item
                v-for="chat in chats"
                :key="chat.id"
                clickable
                v-ripple
                :active="selectedChat?.id === chat.id"
                @click="selectChat(chat)"
                class="chat-item"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    <q-icon name="smart_toy" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="chat-title">{{ chat.title || 'Nueva conversación' }}</q-item-label>
                  <q-item-label caption lines="1" class="chat-preview">
                    {{ chat.last_message?.content || 'Sin mensajes' }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-item-label caption>{{ formatDate(chat.last_message_at) }}</q-item-label>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="delete"
                    color="negative"
                    @click.stop="deleteChat(chat)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
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
              <div class="chat-name">Asistente Orderwise</div>
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

          <!-- Input de mensaje -->
          <div class="message-input-container">
            <q-input
              v-model="newMessage"
              outlined
              placeholder="Escribe tu mensaje..."
              class="message-input"
              @keyup.enter="sendMessage"
              :disable="isTyping"
              autogrow
              :max-height="100"
            >
              <template v-slot:prepend>
                <q-icon name="sentiment_satisfied_alt" class="cursor-pointer" color="grey-6">
                  <q-menu>
                    <div class="q-pa-md">Emojis próximamente</div>
                  </q-menu>
                </q-icon>
              </template>
              <template v-slot:append>
                <q-btn
                  round
                  dense
                  flat
                  icon="send"
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
  data() {
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
    currentCompany() {
      return this.userSession?.company_session
    }
  },
  mounted() {
    this.loadChats()
  },
  methods: {
    async loadChats() {
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

    async selectChat(chat) {
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

    createNewChat() {
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
            message: message
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

    async sendMessage() {
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

    deleteChat(chat) {
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

    openTutorial(tutorial) {
      this.selectedTutorial = tutorial
      this.showTutorialDialog = true
    },

    formatMessage(content) {
      if (!content) return ''

      let formatted = content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" class="message-link">$1</a>'
      )

      formatted = formatted.replace(/\n/g, '<br>')

      return formatted
    },

    formatDate(date) {
      if (!date) return ''
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
    },

    formatTime(date) {
      if (!date) return ''
      return format(new Date(date), 'HH:mm', { locale: es })
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        const scrollArea = container.querySelector('.q-scrollarea__container')
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight
        }
      }
    },

    getVideoUrl(path) {
      return `${process.env.VUE_APP_API_URL}/storage/${path}`
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-page {
  height: calc(100vh - 50px);
  overflow: hidden;
}

.chat-container {
  display: flex;
  height: 100%;
  background: #fff;
}

// Sidebar
.chat-sidebar {
  width: 380px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;

  @media (max-width: 1023px) {
    width: 100%;
    border-right: none;

    &.mobile-hidden {
      display: none;
    }
  }
}

.sidebar-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  font-size: 18px;
  font-weight: 600;
}

.header-subtitle {
  font-size: 12px;
  opacity: 0.9;
}

.new-chat-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.chat-list {
  flex: 1;
  overflow: hidden;
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
  color: #666;
  margin-bottom: 16px;
}

.chat-item {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  &.q-item--active {
    background: #e3f2fd;
    border-left: 3px solid #1976d2;
  }
}

.chat-title {
  font-weight: 500;
  font-size: 15px;
}

.chat-preview {
  color: #666;
  font-size: 13px;
}

// Main chat area
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;

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
  font-weight: 600;
  margin-top: 24px;
  color: #333;
}

.empty-subtitle {
  font-size: 16px;
  color: #666;
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
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.chat-name {
  font-weight: 600;
  font-size: 16px;
}

.chat-status {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.messages-container {
  flex: 1;
  overflow: hidden;
  background: #f5f5f5;
}

.messages-list {
  padding: 24px;
  min-height: 100%;
}

.message-wrapper {
  display: flex;
  margin-bottom: 16px;

  &.user-message {
    justify-content: flex-end;

    .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 18px 18px 4px 18px;
    }
  }

  &.assistant-message {
    justify-content: flex-start;

    .message-bubble {
      background: white;
      color: #333;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  word-wrap: break-word;

  @media (max-width: 768px) {
    max-width: 85%;
  }
}

.message-content {
  font-size: 15px;
  line-height: 1.5;

  :deep(a.message-link) {
    color: inherit;
    text-decoration: underline;
  }
}

.message-time {
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.7;
}

.tutorials-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.assistant-message .tutorials-section {
  border-top-color: rgba(0, 0, 0, 0.1);
}

.tutorials-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tutorial-item {
  padding: 8px;
  margin-top: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.user-message .tutorial-item {
  background: rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

// Typing indicator
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 16px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #999;
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
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

// Message input
.message-input-container {
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
}

.message-input {
  :deep(.q-field__control) {
    border-radius: 24px;
  }
}
</style>
