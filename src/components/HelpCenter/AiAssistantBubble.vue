<template>
  <!-- AI Assistant Panel -->
  <div class="ai-assistant-wrapper">
    <transition name="slide-right">
      <div v-if="isOpen" class="ai-panel-overlay" @click.self="close">
        <div class="ai-panel">
          <!-- Panel Header -->
          <div class="ai-panel-header">
            <q-btn flat round dense icon="menu" color="grey-7" size="sm" />
            <div class="ai-panel-header-spacer" />
            <q-btn flat round dense icon="open_in_full" color="grey-7" size="sm" @click="goToFullChat">
              <q-tooltip>Abrir chat completo</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="close" color="grey-7" size="sm" @click="close" />
          </div>

          <!-- Panel Body -->
          <div class="ai-panel-body">
            <!-- When no conversation yet -->
            <div v-if="messages.length === 0 && !isTyping" class="ai-panel-welcome">
              <!-- AI Avatar Ring (open ring style like Meta AI) -->
              <div class="ai-avatar-ring-open">
                <svg viewBox="0 0 100 100" width="88" height="88">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00D4FF" />
                      <stop offset="33%" stop-color="#0080FF" />
                      <stop offset="66%" stop-color="#A033FF" />
                      <stop offset="100%" stop-color="#D946EF" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#ringGrad)" stroke-width="8" stroke-linecap="round" stroke-dasharray="230 34" />
                </svg>
              </div>
              <div class="ai-panel-title">Asistente QBITS</div>
              <div class="ai-panel-subtitle">Preguntame lo que necesites sobre el sistema</div>

              <!-- Input inside welcome (Meta AI style) -->
              <div class="ai-welcome-input-box">
                <input
                  v-model="inputText"
                  type="text"
                  placeholder="Hacé una pregunta..."
                  @keyup.enter="sendMessage(inputText)"
                  ref="inputField"
                  class="ai-welcome-input"
                />
                <div class="ai-welcome-input-actions">
                  <div class="ai-chip" @click="$refs.imageInput?.click()">
                    <q-icon name="attach_file" size="16px" class="ai-chip-icon" />
                    <span>Adjuntar</span>
                  </div>
                  <input ref="imageInput" type="file" accept="image/*,.pdf,application/pdf" style="display: none" />
                  <q-btn
                    round
                    flat
                    dense
                    icon="photo_camera"
                    size="sm"
                    color="grey-7"
                    class="ai-action-btn"
                    @click="showCamera = true"
                  />
                  <q-btn
                    round
                    flat
                    dense
                    :icon="isRecording ? 'stop' : 'mic'"
                    size="sm"
                    :color="isRecording ? 'negative' : 'grey-7'"
                    class="ai-action-btn"
                    @click="isRecording ? stopAudioRecording() : startAudioRecording()"
                  />
                  <div class="ai-welcome-input-spacer" />
                  <q-btn
                    round
                    unelevated
                    :color="inputText.trim() ? 'primary' : 'grey-4'"
                    icon="arrow_upward"
                    size="sm"
                    class="ai-send-btn-welcome"
                    :disable="!inputText.trim() || isTyping"
                    @click="sendMessage(inputText)"
                  />
                </div>
              </div>

              <!-- Suggestions -->
              <div class="ai-suggestions">
                <div
                  v-for="(suggestion, i) in suggestions"
                  :key="i"
                  class="ai-suggestion-item"
                  @click="sendMessage(suggestion.text)"
                >
                  <div class="ai-suggestion-icon-ring">
                    <svg viewBox="0 0 100 100" width="22" height="22">
                      <defs>
                        <linearGradient id="miniRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#00D4FF" />
                          <stop offset="33%" stop-color="#0080FF" />
                          <stop offset="66%" stop-color="#A033FF" />
                          <stop offset="100%" stop-color="#D946EF" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="38" fill="none" stroke="url(#miniRingGrad)" stroke-width="12" stroke-linecap="round" stroke-dasharray="200 40" />
                    </svg>
                  </div>
                  <span>{{ suggestion.label }}</span>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div v-else class="ai-messages" ref="messagesContainer">
              <div
                v-for="(msg, i) in messages"
                :key="i"
                class="ai-message"
                :class="msg.role"
              >
                <div v-if="msg.role === 'assistant'" class="ai-msg-avatar">
                  <q-icon name="auto_awesome" size="16px" color="white" />
                </div>
                <div class="ai-msg-content" v-html="msg.content" />
              </div>
              <div v-if="isTyping" class="ai-message assistant">
                <div class="ai-msg-avatar">
                  <q-icon name="auto_awesome" size="16px" color="white" />
                </div>
                <div class="ai-msg-content typing">
                  <q-spinner-dots size="20px" color="grey-5" />
                </div>
              </div>
            </div>
          </div>

          <!-- Input (only when in conversation) -->
          <div v-if="messages.length > 0 || isTyping" class="ai-panel-input">
            <div class="ai-input-wrapper">
              <input
                v-model="inputText"
                type="text"
                placeholder="Hacé una pregunta..."
                @keyup.enter="sendMessage(inputText)"
                ref="chatInputField"
              />
              <q-btn
                round
                unelevated
                :color="inputText.trim() ? 'primary' : 'grey-4'"
                icon="arrow_upward"
                size="sm"
                class="ai-send-btn"
                :disable="!inputText.trim() || isTyping"
                @click="sendMessage(inputText)"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Camera Capture Dialog -->
    <CameraCapture v-model="showCamera" @capture="handleCameraCapture" />

    <!-- Floating Bubble Button -->
    <transition name="scale-bounce">
      <div
        v-if="!isOpen"
        class="ai-bubble"
        @click="open"
      >
        <div class="ai-bubble-inner">
          <q-icon name="auto_awesome" size="24px" color="white" />
        </div>
        <div class="ai-bubble-pulse" />
      </div>
    </transition>
  </div>
</template>

<script>
import { api } from 'src/boot/axios'
import CameraCapture from 'src/components/CameraCapture.vue'

export default {
  name: 'AiAssistantBubble',
  components: { CameraCapture },
  data () {
    return {
      isOpen: false,
      inputText: '',
      messages: [],
      isTyping: false,
      chatId: null,
      showCamera: false,
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      suggestions: [
        { label: '¿Cómo abro la caja para vender?', text: '¿Cómo abro la caja para vender?' },
        { label: '¿Cómo agrego un producto nuevo?', text: '¿Cómo agrego un producto nuevo?' },
        { label: '¿Cómo cobro una venta?', text: '¿Cómo cobro una venta?' },
        { label: '¿Cómo cierro la caja al final del día?', text: '¿Cómo cierro la caja al final del día?' }
      ]
    }
  },
  methods: {
    open () {
      this.isOpen = true
      this.$nextTick(() => {
        this.$refs.inputField?.focus()
      })
    },
    close () {
      this.isOpen = false
    },
    toggle () {
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    },
    goToFullChat () {
      this.close()
      this.$router.push({ name: 'AiChat' })
    },
    scrollToBottom () {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },
    handleCameraCapture (file) {
      this.showCamera = false
      // TODO: send image to AI chat
      this.messages.push({ role: 'user', content: '📷 Imagen enviada' })
      this.scrollToBottom()
    },
    async startAudioRecording () {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(stream)
        this.audioChunks = []

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.audioChunks.push(e.data)
        }

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
          stream.getTracks().forEach(t => t.stop())
          this.sendAudioMessage(audioBlob)
        }

        this.mediaRecorder.start()
        this.isRecording = true
      } catch (err) {
        console.error('Mic error:', err)
      }
    },
    stopAudioRecording () {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop()
        this.isRecording = false
      }
    },
    async sendAudioMessage (audioBlob) {
      this.messages.push({ role: 'user', content: '🎤 Audio enviado' })
      this.scrollToBottom()
      this.isTyping = true

      try {
        const formData = new FormData()
        formData.append('audio', audioBlob, 'audio.webm')
        if (this.chatId) {
          formData.append('chat_id', this.chatId)
        }
        const { data } = await api.post('ai-chats/audio', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const reply = data.reply || data.message?.content || data.response
        if (reply) {
          this.messages.push({ role: 'assistant', content: reply })
        }
      } catch (err) {
        console.error('Audio send error:', err)
        this.messages.push({
          role: 'assistant',
          content: 'No pude procesar el audio. Intentá de nuevo.'
        })
      } finally {
        this.isTyping = false
        this.scrollToBottom()
      }
    },
    async sendMessage (text) {
      if (!text?.trim() || this.isTyping) return

      const userMessage = text.trim()
      this.inputText = ''
      this.messages.push({ role: 'user', content: userMessage })
      this.scrollToBottom()
      this.isTyping = true

      try {
        if (!this.chatId) {
          const { data } = await api.post('ai-chats', {
            title: userMessage.substring(0, 50),
            message: userMessage
          })
          this.chatId = data.id || data.chat?.id
          const reply = data.reply || data.message?.content || data.response
          if (reply) {
            this.messages.push({ role: 'assistant', content: reply })
          }
        } else {
          const { data } = await api.post(`ai-chats/${this.chatId}/messages`, {
            content: userMessage
          })
          const reply = data.reply || data.message?.content || data.response || data.content
          if (reply) {
            this.messages.push({ role: 'assistant', content: reply })
          }
        }
      } catch (err) {
        console.error('AI Chat error:', err)
        this.messages.push({
          role: 'assistant',
          content: 'Perdón, hubo un error al procesar tu consulta. Intentá de nuevo en unos segundos.'
        })
      } finally {
        this.isTyping = false
        this.scrollToBottom()
      }
    }
  }
}
</script>

<style scoped>
.ai-assistant-wrapper {
  position: fixed;
  z-index: 9999;
}

/* ─── BUBBLE ─── */
.ai-bubble {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 9999;
  cursor: pointer;
}

.ai-bubble-inner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0866FF 0%, #A033FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(8, 102, 255, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.ai-bubble:hover .ai-bubble-inner {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(8, 102, 255, 0.5);
}

.ai-bubble-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0866FF 0%, #A033FF 100%);
  animation: pulse-ring 2s ease-out infinite;
  opacity: 0;
  z-index: -1;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* ─── PANEL OVERLAY ─── */
.ai-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.15);
}

/* ─── PANEL ─── */
.ai-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 100vw;
  height: 100vh;
  background: #FFFFFF;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  z-index: 9999;
}

@media (max-width: 480px) {
  .ai-panel {
    width: 100vw;
  }
}

/* ─── PANEL HEADER ─── */
.ai-panel-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: none;
  gap: 4px;
}

.ai-panel-header-spacer {
  flex: 1;
}

/* ─── PANEL BODY ─── */
.ai-panel-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ─── WELCOME (Meta AI style) ─── */
.ai-panel-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px 24px;
  flex: 1;
}

.ai-avatar-ring-open {
  margin-bottom: 20px;
}

.ai-panel-title {
  font-size: 21px;
  font-weight: 700;
  color: #1C1E21;
  margin-bottom: 8px;
  text-align: center;
}

.ai-panel-subtitle {
  font-size: 14px;
  color: #8A8D91;
  text-align: center;
  margin-bottom: 28px;
}

/* ─── WELCOME INPUT BOX ─── */
.ai-welcome-input-box {
  width: 100%;
  border: 1.5px solid #D1D5DB;
  border-radius: 18px;
  padding: 14px 16px 10px;
  transition: border-color 0.2s;
  margin-bottom: 8px;
}

.ai-welcome-input-box:focus-within {
  border-color: #0866FF;
}

.ai-welcome-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 15px;
  color: #1C1E21;
  background: transparent;
  padding: 0;
  margin-bottom: 12px;
}

.ai-welcome-input::placeholder {
  color: #9CA3AF;
}

.ai-welcome-input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-welcome-input-spacer {
  flex: 1;
}

/* ─── CHIPS ─── */
.ai-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #F0F2F5;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #4B5563;
  transition: background 0.15s;
  white-space: nowrap;
}

.ai-chip:hover {
  background: #E4E6EB;
}

.ai-chip-icon {
  color: #A033FF;
}

.ai-send-btn-welcome {
  flex-shrink: 0;
}

/* ─── SUGGESTIONS ─── */
.ai-suggestions {
  width: 100%;
  margin-top: auto;
  padding-top: 16px;
}

.ai-suggestion-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 4px;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.15s;
  color: #1C1E21;
  font-size: 15px;
}

.ai-suggestion-item:hover {
  background: #F7F8FA;
}

.ai-suggestion-icon-ring {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
}

/* ─── MESSAGES ─── */
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-message {
  display: flex;
  gap: 10px;
  max-width: 90%;
}

.ai-message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-message.assistant {
  align-self: flex-start;
}

.ai-msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0866FF, #A033FF);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.ai-msg-content {
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.ai-message.user .ai-msg-content {
  background: #0866FF;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message.assistant .ai-msg-content {
  background: #F0F2F5;
  color: #1C1E21;
  border-bottom-left-radius: 4px;
}

.ai-msg-content.typing {
  background: #F0F2F5;
  padding: 12px 20px;
}

/* ─── INPUT (conversation mode) ─── */
.ai-panel-input {
  padding: 12px 16px 16px;
  border-top: 1px solid #f0f0f0;
}

.ai-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid #CCD0D5;
  border-radius: 24px;
  padding: 4px 4px 4px 16px;
  transition: border-color 0.2s;
}

.ai-input-wrapper:focus-within {
  border-color: #0866FF;
}

.ai-input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #1C1E21;
  background: transparent;
  padding: 8px 0;
}

.ai-input-wrapper input::placeholder {
  color: #8A8D91;
}

.ai-send-btn {
  flex-shrink: 0;
}

/* ─── TRANSITIONS ─── */
.slide-right-enter-active {
  transition: all 0.3s ease;
}
.slide-right-leave-active {
  transition: all 0.25s ease;
}
.slide-right-enter-from .ai-panel,
.slide-right-leave-to .ai-panel {
  transform: translateX(100%);
}
.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}

.scale-bounce-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-bounce-leave-active {
  transition: all 0.2s ease;
}
.scale-bounce-enter-from,
.scale-bounce-leave-to {
  transform: scale(0);
  opacity: 0;
}

/* ─── DARK MODE ─── */
.body--dark .ai-panel {
  background: #1A1A2E;
}

.body--dark .ai-panel-header {
  border-color: rgba(255,255,255,0.08);
}

.body--dark .ai-panel-title {
  color: #FFFFFF;
}

.body--dark .ai-panel-subtitle {
  color: #8A8D91;
}

.body--dark .ai-welcome-input-box {
  border-color: rgba(255,255,255,0.15);
  background: #2D2D3F;
}

.body--dark .ai-welcome-input {
  color: #E4E6EB;
}

.body--dark .ai-chip {
  background: #2D2D3F;
  color: #E4E6EB;
}

.body--dark .ai-suggestion-item {
  color: #E4E6EB;
}

.body--dark .ai-suggestion-item:hover {
  background: rgba(255,255,255,0.06);
}

.body--dark .ai-message.assistant .ai-msg-content {
  background: #2D2D3F;
  color: #E4E6EB;
}

.body--dark .ai-input-wrapper {
  border-color: rgba(255,255,255,0.15);
  background: #2D2D3F;
}

.body--dark .ai-input-wrapper input {
  color: #E4E6EB;
}

.body--dark .ai-panel-input {
  border-color: rgba(255,255,255,0.08);
}
</style>
