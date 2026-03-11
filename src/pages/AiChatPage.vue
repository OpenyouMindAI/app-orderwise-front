<template>
  <q-page class="ai-chat-modern">
    <div class="ai-layout">
      <!-- Sidebar Minimalista -->
      <div class="ai-sidebar" :class="{ 'hidden-mobile': selectedChat && $q.screen.lt.md }">
        <!-- Header Sidebar -->
        <div class="sidebar-header">
          <q-btn
            unelevated
            rounded
            color="primary"
            label="Nuevo Chat"
            icon="add"
            class="new-chat-button"
            @click="createNewChat"
          />
        </div>

        <!-- Lista de Conversaciones -->
        <div class="conversations-list">
          <q-scroll-area class="fit">
            <div v-if="loading && chats.length === 0" class="loading-state">
              <q-spinner-dots color="primary" size="40px" />
            </div>

            <div v-else-if="chats.length === 0" class="empty-conversations">
              <q-icon name="chat_bubble_outline" size="48px" class="text-grey-5" />
              <p class="text-caption text-grey-6 q-mt-sm">Sin conversaciones</p>
            </div>

            <div v-else class="conversation-items">
              <div
                v-for="chat in chats"
                :key="chat.id"
                class="conversation-card"
                :class="{ 'active': selectedChat?.id === chat.id }"
                @click="selectChat(chat)"
              >
                <div class="conv-icon">
                  <q-icon name="chat" size="20px" />
                </div>
                <div class="conv-content">
                  <div class="conv-title">{{ chat.title || 'Nueva conversación' }}</div>
                  <div class="conv-preview">{{ truncateMessage(chat.last_message?.content) || 'Iniciar chat...' }}</div>
                </div>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="more_vert"
                  class="conv-menu"
                  @click.stop
                >
                  <q-menu>
                    <q-list dense>
                      <q-item clickable v-close-popup @click="deleteChat(chat)">
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" size="18px" />
                        </q-item-section>
                        <q-item-section>Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </q-scroll-area>
        </div>
      </div>

      <!-- Área Principal del Chat -->
      <div class="ai-main" :class="{ 'hidden-mobile': !selectedChat && $q.screen.lt.md }">
        <!-- Estado Vacío -->
        <div v-if="!selectedChat" class="welcome-screen">
          <div class="welcome-content">
            <div class="ai-logo-container">
              <div class="ai-logo-ring"></div>
              <q-icon name="auto_awesome" size="64px" class="ai-logo-icon" />
            </div>
            <h1 class="welcome-title">Asistente IA Palma</h1>
            <p class="welcome-subtitle">
              Pregunta sobre tu negocio, analiza datos o solicita reportes en tiempo real
            </p>
            <div class="welcome-suggestions">
              <div class="suggestion-card" @click="quickPrompt('¿Cómo va mi empresa hoy?')">
                <q-icon name="trending_up" size="24px" />
                <span>Estado del negocio</span>
              </div>
              <div class="suggestion-card" @click="quickPrompt('Muéstrame las ventas de hoy')">
                <q-icon name="receipt_long" size="24px" />
                <span>Ventas del día</span>
              </div>
              <div class="suggestion-card" @click="quickPrompt('¿Cuál es el producto más vendido?')">
                <q-icon name="inventory_2" size="24px" />
                <span>Productos top</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Activo -->
        <div v-else class="chat-active">
          <!-- Header del Chat -->
          <div class="chat-header-modern">
            <q-btn
              v-if="$q.screen.lt.md"
              flat
              round
              dense
              icon="arrow_back"
              @click="selectedChat = null"
              class="q-mr-sm"
            />
            <div class="chat-header-info">
              <div class="chat-header-title">{{ selectedChat.title || 'Asistente IA' }}</div>
              <div class="chat-header-status">
                <div class="status-dot"></div>
                <span>En línea</span>
              </div>
            </div>
            <q-space />
            <q-btn flat round dense icon="more_vert" color="grey-7">
              <q-menu>
                <q-list dense style="min-width: 150px">
                  <q-item clickable v-close-popup @click="deleteChat(selectedChat)">
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Eliminar chat</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <!-- Mensajes -->
          <div class="messages-area">
            <q-scroll-area class="fit" ref="messagesContainer">
              <div
                class="messages-wrapper"
                :style="{ opacity: renderingChat ? 0 : 1, transition: 'opacity 0.2s ease-in-out' }"
              >
                <div
                  v-for="message in messages"
                  :key="message.id"
                  class="message-block"
                  :class="message.role"
                >
                  <div class="message-avatar">
                    <q-avatar size="32px" :color="message.role === 'user' ? 'primary' : 'grey-3'">
                      <q-icon :name="message.role === 'user' ? 'person' : 'smart_toy'" :color="message.role === 'user' ? 'white' : 'grey-7'" />
                    </q-avatar>
                  </div>
                  <div class="message-body">
                    <div class="message-author">{{ message.role === 'user' ? 'Tú' : 'Asistente IA' }}</div>
                    <div class="message-text" v-html="formatMessage(message.content)"></div>

                    <!-- Tutoriales -->
                    <div v-if="message.metadata?.tutorials?.length > 0" class="tutorials-container">
                      <div class="tutorials-header">
                        <q-icon name="school" size="18px" />
                        <span>Recursos relacionados</span>
                      </div>
                      <div class="tutorials-grid">
                        <div
                          v-for="tutorial in message.metadata.tutorials"
                          :key="tutorial.id"
                          class="tutorial-card-modern"
                        >
                          <!-- Video Player Embebido -->
                          <div class="tutorial-video-wrapper" v-if="tutorial.video_url">
                            <video
                              :src="tutorial.video_url"
                              controls
                              class="tutorial-video"
                              :poster="tutorial.miniature_url"
                            ></video>
                          </div>

                          <!-- Info del Tutorial -->
                          <div class="tutorial-info">
                            <div class="tutorial-title">{{ tutorial.title }}</div>
                            <div class="tutorial-description" v-if="tutorial.description">
                              {{ tutorial.description }}
                            </div>
                            <div class="tutorial-stats">
                              <span v-if="tutorial.views_count">
                                <q-icon name="visibility" size="14px" /> {{ tutorial.views_count }}
                              </span>
                              <span v-if="tutorial.likes_count">
                                <q-icon name="favorite" size="14px" /> {{ tutorial.likes_count }}
                              </span>
                            </div>

                            <!-- Botón para ir a la aplicación -->
                            <div class="q-mt-md">
                              <q-btn
                                flat
                                color="primary"
                                label="Ver tutorial completo"
                                icon="play_circle_filled"
                                size="sm"
                                class="full-width"
                                @click="$router.push({ name: 'Tutorial', query: { videoId: tutorial.id } })"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="message-timestamp">{{ formatTime(message.created_at) }}</div>
                  </div>
                </div>

                <!-- Typing Indicator -->
                <div v-if="isTyping" class="message-block assistant">
                  <div class="message-avatar">
                    <q-avatar size="32px" color="grey-3">
                      <q-icon name="smart_toy" color="grey-7" />
                    </q-avatar>
                  </div>
                  <div class="message-body">
                    <div class="message-author">Asistente IA</div>
                    <div class="typing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </q-scroll-area>
          </div>

          <!-- Input Moderno -->
          <div class="input-container-modern">
            <div class="input-box">
              <q-input
                v-model="newMessage"
                placeholder="Envía un mensaje al asistente..."
                borderless
                autogrow
                dense
                class="modern-input"
                @keyup.enter.exact="sendMessage"
              >
                <template v-slot:prepend>
                  <q-btn flat round dense icon="attach_file" size="sm" color="grey-6" />
                </template>
                <template v-slot:append>
                  <q-btn
                    v-if="newMessage.trim()"
                    unelevated
                    round
                    icon="send"
                    color="primary"
                    size="sm"
                    @click="sendMessage"
                    :disable="isTyping"
                    class="send-btn-modern"
                  />
                  <q-btn v-else flat round dense icon="mic" size="sm" color="grey-6" />
                </template>
              </q-input>
            </div>
            <div class="input-footer">
              <span class="text-caption text-grey-6">El asistente puede cometer errores. Verifica la información importante.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Tutorial -->
    <q-dialog v-model="showTutorialDialog" maximized>
      <q-card class="tutorial-dialog">
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
            autoplay
            style="width: 100%; max-height: 70vh; border-radius: 12px;"
          ></video>
          <div class="q-mt-md text-body1">{{ selectedTutorial?.description }}</div>
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
      renderingChat: false,
      showTutorialDialog: false,
      selectedTutorial: null
    }
  },
  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice']),
    currentCompany () {
      return this.userSession?.company_session
    },
    currentBranchOffice () {
      return this.branchOffice
    }
  },
  // Scroll is managed exclusively in selectChat() — no watch needed.
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
        this.$q.notify({ type: 'negative', message: 'Error al cargar las conversaciones' })
      } finally {
        this.loading = false
      }
    },

    async selectChat (chat) {
      this.selectedChat = chat
      this.messages = []
      this.renderingChat = true // 1. Hide messages area
      try {
        const { data } = await api.get(`ai-chats/${chat.id}`)
        this.messages = data.messages || []

        // 2. Wait for DOM to render messages (still invisible)
        await this.$nextTick()

        // 3. Teleport to bottom silently
        this.scrollToBottom()

        // 4. Brief settle time, then reveal
        setTimeout(() => {
          this.renderingChat = false // 5. Fade in — already at the bottom
        }, 30)
      } catch (error) {
        console.error('Error loading chat:', error)
        this.$q.notify({ type: 'negative', message: 'Error al cargar el chat' })
        this.renderingChat = false
      }
    },

    createNewChat () {
      if (!this.currentCompany) {
        this.$q.notify({ type: 'warning', message: 'Por favor selecciona una empresa primero' })
        return
      }

      this.$q.dialog({
        title: 'Nueva conversación',
        message: '¿En qué puedo ayudarte?',
        prompt: { model: '', type: 'textarea', placeholder: 'Ej: ¿Cómo va mi empresa hoy?' },
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
          this.$q.notify({ type: 'positive', message: 'Conversación iniciada' })
        } catch (error) {
          console.error('Error creating chat:', error)
          this.$q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al crear la conversación' })
        } finally {
          this.loading = false
        }
      })
    },

    quickPrompt (prompt) {
      if (!this.currentCompany) {
        this.$q.notify({ type: 'warning', message: 'Por favor selecciona una empresa primero' })
        return
      }
      this.loading = true
      api.post('ai-chats', {
        company_id: this.currentCompany.id,
        message: prompt,
        branch_office_id: this.currentBranchOffice?.id
      })
        .then(({ data }) => {
          this.chats.unshift(data)
          this.selectedChat = data
          this.messages = data.messages || []
          this.$nextTick(() => this.scrollToBottom())
        })
        .catch(error => {
          console.error('Error:', error)
          this.$q.notify({ type: 'negative', message: 'Error al iniciar la conversación' })
        })
        .finally(() => { this.loading = false })
    },

    async sendMessage () {
      if (!this.newMessage.trim() || this.isTyping) return
      const messageText = this.newMessage
      this.newMessage = ''
      const userMessage = { id: Date.now(), role: 'user', content: messageText, created_at: new Date().toISOString() }
      this.messages.push(userMessage)
      await this.$nextTick()
      this.scrollToBottom()
      this.isTyping = true

      try {
        const { data } = await api.post(`ai-chats/${this.selectedChat.id}/messages`, {
          message: messageText,
          branch_office_id: this.currentBranchOffice?.id
        })
        const userIndex = this.messages.findIndex(m => m.id === userMessage.id)
        if (userIndex !== -1) this.messages[userIndex] = data.user_message
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
        this.$q.notify({ type: 'negative', message: 'Error al enviar el mensaje' })
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
          this.$q.notify({ type: 'positive', message: 'Conversación eliminada' })
        } catch (error) {
          console.error('Error deleting chat:', error)
          this.$q.notify({ type: 'negative', message: 'Error al eliminar la conversación' })
        }
      })
    },

    openTutorial (tutorial) {
      this.selectedTutorial = tutorial
      this.showTutorialDialog = true
    },

    formatMessage (content) {
      if (!content) return ''
      let formatted = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="message-link">$1</a>')
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
      this.$nextTick(() => {
        const scrollArea = this.$refs.messagesContainer
        if (scrollArea) {
          // Use a large number and 0 duration for immediate scroll on load
          scrollArea.setScrollPosition('vertical', 999999, 0)
          // Also call with a slight animation if it's a dynamic update
          setTimeout(() => {
            scrollArea.setScrollPosition('vertical', 999999, 0)
          }, 50)
        }
      })
    },

    getVideoUrl (path) {
      return `${process.env.VUE_APP_API_URL}/storage/${path}`
    },

    truncateMessage (message) {
      if (!message) return ''
      const maxLength = 40
      if (message.length <= maxLength) return message
      return message.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-modern {
  height: calc(100vh - 60px);
  background: #f7f7f8;
  overflow: hidden;
}

.ai-layout {
  display: flex;
  height: 100%;
  max-width: 1800px;
  margin: 0 auto;
}

// Sidebar
.ai-sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;

  @media (max-width: 1023px) {
    width: 100%;
    &.hidden-mobile { display: none; }
  }
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.new-chat-button {
  width: 100%;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.conversations-list {
  flex: 1;
  overflow: hidden;
}

.loading-state, .empty-conversations {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.conversation-items {
  padding: 8px;
}

.conversation-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
  position: relative;

  &:hover {
    background: #f5f5f5;
    .conv-menu { opacity: 1; }
  }

  &.active {
    background: #ececf1;
    .conv-icon { background: var(--q-primary); color: white; }
  }
}

.conv-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #ececf1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.conv-content {
  flex: 1;
  min-width: 0;
}

.conv-title {
  font-size: 14px;
  font-weight: 600;
  color: #202123;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-preview {
  font-size: 12px;
  color: #6e6e80;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.conv-menu {
  opacity: 0;
  transition: opacity 0.2s;
}

// Main Area
.ai-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;

  @media (max-width: 1023px) {
    width: 100%;
    &.hidden-mobile { display: none; }
  }
}

// Welcome Screen
.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-content {
  max-width: 600px;
  text-align: center;
}

.ai-logo-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
}

.ai-logo-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid var(--q-primary);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.1; }
}

.ai-logo-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--q-primary);
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #202123;
  margin: 0 0 16px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: #6e6e80;
  margin: 0 0 40px 0;
  line-height: 1.5;
}

.welcome-suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 32px;
}

.suggestion-card {
  padding: 20px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;

  &:hover {
    border-color: var(--q-primary);
    background: #fafafa;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .q-icon { color: var(--q-primary); }
  span { font-size: 14px; font-weight: 500; color: #202123; }
}

// Chat Active
.chat-active {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header-modern {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  background: white;
  z-index: 10;
}

.chat-header-info {
  flex: 1;
}

.chat-header-title {
  font-size: 16px;
  font-weight: 600;
  color: #202123;
}

.chat-header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6e6e80;
  margin-top: 2px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10a37f;
}

// Messages
.messages-area {
  flex: 1;
  overflow: hidden;
  background: white;
}

.messages-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.message-block {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;

  &.user {
    .message-body { background: #f7f7f8; }
  }

  &.assistant {
    .message-body { background: transparent; }
  }
}

.message-avatar {
  flex-shrink: 0;
}

.message-body {
  flex: 1;
  min-width: 0;
  padding: 16px;
  border-radius: 12px;
}

.message-author {
  font-size: 13px;
  font-weight: 700;
  color: #202123;
  margin-bottom: 8px;
}

.message-text {
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
  word-wrap: break-word;

  :deep(a.message-link) {
    color: var(--q-primary);
    text-decoration: underline;
    &:hover { text-decoration: none; }
  }
}

.message-timestamp {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
}

// Tutorials
.tutorials-container {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.tutorials-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6e6e80;
  margin-bottom: 12px;
}

.tutorials-grid {
  display: grid;
  gap: 16px;
}

.tutorial-card-modern {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
}

.tutorial-video-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; // 16:9 aspect ratio
  background: #000;
}

.tutorial-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tutorial-info {
  padding: 12px;
}

.tutorial-title {
  font-size: 14px;
  font-weight: 600;
  color: #202123;
  margin-bottom: 6px;
}

.tutorial-description {
  font-size: 13px;
  color: #6e6e80;
  margin-bottom: 8px;
  line-height: 1.4;
}

.tutorial-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

// Typing Animation
.typing-animation {
  display: flex;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
    animation: typing-bounce 1.4s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

// Input Modern
.input-container-modern {
  padding: 16px 24px 24px;
  background: white;
  border-top: 1px solid #e5e5e5;
}

.input-box {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 50px;
  padding: 6px 12px;
  transition: all 0.2s;

  &:focus-within {
    border-color: #9ca3af;
  }
}

.modern-input {
  font-size: 15px;
  border-radius: 50px;
  :deep(.q-field__native) {
    padding: 10px 12px;
    color: #374151;
  }
  :deep(.q-field__control) {
    min-height: 44px;
  }
}

.input-footer {
  max-width: 800px;
  margin: 8px auto 0;
  text-align: center;
}

// Dark Mode
.body--dark {
  .ai-chat-modern { background: #212121; }
  .ai-sidebar { background: #171717; border-color: #2d2d2d; }
  .sidebar-header { border-color: #2d2d2d; }
  .conversation-card {
    &:hover { background: #2d2d2d; }
    &.active { background: #2d2d2d; .conv-icon { background: var(--q-primary); } }
  }
  .conv-icon { background: #2d2d2d; }
  .conv-title { color: #ececf1; }
  .conv-preview { color: #9ca3af; }

  .ai-main { background: #212121; }
  .welcome-title { color: #ececf1; }
  .welcome-subtitle { color: #9ca3af; }
  .suggestion-card {
    background: #2d2d2d;
    border-color: #3d3d3d;
    &:hover { background: #3d3d3d; border-color: var(--q-primary); }
    span { color: #ececf1; }
  }

  .chat-header-modern { background: #171717; border-color: #2d2d2d; }
  .chat-header-title { color: #ececf1; }
  .chat-header-status { color: #9ca3af; }

  .messages-area { background: #212121; }
  .message-block.user .message-body { background: #2d2d2d; }
  .message-author { color: #ececf1; }
  .message-text { color: #d1d5db; }

  .tutorials-container { border-color: #3d3d3d; }
  .tutorial-card-modern {
    background: #2d2d2d;
    border-color: #3d3d3d;
    &:hover { background: #3d3d3d; }
  }
  .tutorial-title { color: #ececf1; }
  .tutorial-description { color: #9ca3af; }
  .tutorial-stats { color: #6e6e80; }

  .input-container-modern { background: #171717; border-color: #2d2d2d; }
  .input-box {
    background: #2d2d2d;
    border-color: #3d3d3d;
    &:focus-within { border-color: #4d4d4d; }
  }
  .modern-input :deep(.q-field__native) { color: #ececf1; }
}
</style>
