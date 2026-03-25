<template>
  <div class="support-chat-bubble">
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
                  <q-avatar size="44px" :class="selectedChat?.avatarClass || 'palma-avatar'">
                    <q-icon :name="selectedChat?.icon || 'auto_awesome'" size="22px" color="white" />
                    <div class="status-indicator" :class="isPartnerOnline ? 'online' : 'offline'"></div>
                  </q-avatar>
                </div>
                <div class="col">
                  <div class="support-name">
                    <span class="ellipsis">{{ getChatName(selectedChat) }}</span>
                  </div>
                  <div class="support-status">
                    <span class="status-text">{{ isPartnerOnline ? 'Activo ahora' : 'Desconectado' }}</span>
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

                      <!-- Video: thumbnail bubble + message bubble -->
                      <template v-if="getVideoData(message.content)">
                        <div
                          v-for="(video, vIdx) in getVideoData(message.content)"
                          :key="vIdx"
                          class="video-group"
                        >
                          <div class="message-bubble-wrapper">
                            <div class="message-bubble shadow-sm video-bubble" @click="openVideoModal(video)">
                              <div class="video-thumbnail-container">
                                <q-img :src="getFileUrl(video.picture)" class="video-thumbnail" />
                                <div class="play-overlay">
                                  <q-icon name="play_arrow" size="42px" color="white" />
                                </div>
                              </div>
                              <div class="video-info q-pa-sm">
                                <div class="video-title text-weight-bold">{{ video.title }}</div>
                              </div>
                            </div>
                          </div>
                          <div v-if="video.message" class="message-bubble-wrapper q-mt-xs">
                            <div class="message-bubble shadow-sm">
                              <div class="message-text">{{ video.message }}</div>
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Invoice Review Card (Artificial intelligence process) -->
                      <div v-else-if="getInvoiceData(message.content)" class="message-bubble-wrapper">
                        <InvoiceReviewCard
                          :data="getInvoiceData(message.content)"
                          @confirm="(confirmedData) => {
                            if (selectedChat?.id === 'mock-purchase') {
                              const updated = updateMockMessage(message.id, { ...confirmedData, saveSuccess: true });
                              if (updated) message.content = updated.content;

                              const successMsg = {
                                id: 'msg-success-' + Date.now(),
                                type: 'text',
                                role: 'assistant',
                                content: '¡Factura integrada con éxito! ✅ Los productos y la compra han sido registrados en el sistema.',
                                sender_id: 'ia-system',
                                created_at: new Date().toISOString()
                              };
                              messages.push(successMsg);
                              saveMockPurchaseMessage(successMsg);
                              scrollToBottom();
                            } else {
                              eventBus.emit('apply-invoice-data', confirmedData);
                            }
                          }"
                          @discard="() => {
                            deleteMockMessage(message.id);
                            const idx = messages.indexOf(message);
                            if (idx !== -1) messages.splice(idx, 1);
                          }"
                        />
                        <div v-if="!isNextSameUser(message, messages.length - 1 - index)" class="message-time-caption">
                          {{ formatTimeShort(message.created_at) }}
                        </div>
                      </div>

                      <!-- Mensaje normal -->
                      <div v-else class="message-bubble-wrapper">
                        <!-- Audio -->
                        <div v-if="message.type === 'audio' && message.attachment_url" class="message-bubble shadow-sm audio-bubble">
                          <AudioPlayer :src="getFullUrl(message.attachment_url)" :is-own="false" />
                        </div>
                        <!-- Image -->
                        <div v-else-if="message.type === 'image' && message.attachment_url"
                             class="message-bubble shadow-sm image-message-bubble"
                             :class="{ 'image-only': !message.content || message.content.trim() === '' }">
                          <q-img :src="getFullUrl(message.attachment_url)" class="chat-image" />
                          <div v-if="message.content && message.content.trim() !== ''" class="message-text" v-html="formatMessageContent(message.content)"></div>
                        </div>
                        <!-- Video attachment -->
                        <div v-else-if="message.type === 'video' && message.attachment_url" class="message-bubble shadow-sm image-message-bubble" :class="{ 'image-only': !message.content || message.content.trim() === '' }">
                          <video :src="getFullUrl(message.attachment_url)" controls class="chat-video"></video>
                          <div v-if="message.content && message.content.trim() !== ''" class="message-text q-mt-xs" v-html="formatMessageContent(message.content)"></div>
                        </div>
                        <!-- File (Document) -->
                        <div v-else-if="message.type === 'file' && message.attachment_url" class="message-bubble shadow-sm doc-message-bubble">
                          <a :href="getFullUrl(message.attachment_url)" target="_blank" class="doc-card row items-center no-wrap">
                            <div class="doc-icon-container">
                              <q-icon :name="getFileTypeIcon(message.attachment_mime)" size="24px" color="primary" />
                            </div>
                            <div class="col q-px-sm overflow-hidden">
                              <div class="doc-name ellipsis">{{ message.attachment_name || 'Documento' }}</div>
                              <div class="doc-meta">{{ message.attachment_mime?.split('/')[1]?.toUpperCase() || 'FILE' }}</div>
                            </div>
                            <q-icon name="download" size="18px" color="grey-7" class="q-ml-xs" />
                          </a>
                          <div v-if="message.content && message.content.trim() !== ''" class="message-text q-mt-xs" v-html="formatMessageContent(message.content)"></div>
                        </div>
                        <!-- Text -->
                        <div v-else-if="message.content && message.content.trim() !== ''" class="message-bubble shadow-sm">
                          <div class="message-text" v-html="formatMessageContent(message.content)"></div>
                        </div>
                        <div v-if="!isNextSameUser(message, messages.length - 1 - index)" class="message-time-caption">
                          {{ formatTimeShort(message.created_at) }}
                        </div>
                      </div>
                    </template>

                    <!-- Own Message: Content Aligned Right -->
                    <template v-else>
                      <!-- Video: thumbnail bubble + message bubble -->
                      <template v-if="getVideoData(message.content)">
                        <div
                          v-for="(video, vIdx) in getVideoData(message.content)"
                          :key="vIdx"
                          class="video-group"
                        >
                          <div class="message-bubble-wrapper">
                            <div class="message-bubble shadow-sm video-bubble" @click="openVideoModal(video)">
                              <div class="video-thumbnail-container">
                                <q-img :src="getFileUrl(video.picture)" class="video-thumbnail" />
                                <div class="play-overlay">
                                  <q-icon name="play_arrow" size="42px" color="white" />
                                </div>
                              </div>
                              <div class="video-info q-pa-sm">
                                <div class="video-title text-weight-bold">{{ video.title }}</div>
                              </div>
                            </div>
                          </div>
                          <div v-if="video.message" class="message-bubble-wrapper q-mt-xs">
                            <div class="message-bubble shadow-sm">
                              <div class="message-text">{{ video.message }}</div>
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Mensaje normal (propio) -->
                      <div v-else class="message-bubble-wrapper">
                        <!-- Audio -->
                        <div v-if="message.type === 'audio' && message.attachment_url" class="message-bubble shadow-sm audio-bubble own">
                          <AudioPlayer :src="getFullUrl(message.attachment_url)" :is-own="true" />
                        </div>
                        <!-- Image -->
                        <div v-else-if="message.type === 'image' && message.attachment_url"
                             class="message-bubble shadow-sm image-message-bubble own"
                             :class="{ 'image-only': !message.content || message.content.trim() === '' }">
                          <q-img :src="getFullUrl(message.attachment_url)" class="chat-image" />
                          <div v-if="message.content && message.content.trim() !== ''" class="message-text">{{ message.content }}</div>
                        </div>
                        <!-- Video attachment -->
                        <div v-else-if="message.type === 'video' && message.attachment_url" class="message-bubble shadow-sm image-message-bubble own" :class="{ 'image-only': !message.content || message.content.trim() === '' }">
                          <video :src="getFullUrl(message.attachment_url)" controls class="chat-video"></video>
                          <div v-if="message.content && message.content.trim() !== ''" class="message-text q-mt-xs">{{ message.content }}</div>
                        </div>
                        <!-- File (Document) -->
                        <div v-else-if="message.type === 'file' && message.attachment_url" class="message-bubble shadow-sm doc-message-bubble own">
                          <a :href="getFullUrl(message.attachment_url)" target="_blank" class="doc-card own row items-center no-wrap">
                            <div class="doc-icon-container">
                              <q-icon :name="getFileTypeIcon(message.attachment_mime)" size="24px" color="primary" />
                            </div>
                            <div class="col q-px-sm overflow-hidden">
                              <div class="doc-name ellipsis">{{ message.attachment_name || 'Documento' }}</div>
                              <div class="doc-meta">{{ message.attachment_mime?.split('/')[1]?.toUpperCase() || 'FILE' }}</div>
                            </div>
                            <q-icon name="download" size="18px" color="grey-4" class="q-ml-xs" />
                          </a>
                          <div v-if="message.content && message.content.trim() !== ''" class="message-text q-mt-xs">{{ message.content }}</div>
                        </div>
                        <!-- Text -->
                        <div v-else-if="message.content && message.content.trim() !== ''" class="message-bubble shadow-sm">
                          <div class="message-text">{{ message.content }}</div>
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
                  <!-- File preview -->
                  <div v-if="selectedFile" class="row items-center no-wrap bg-grey-2 q-pa-xs rounded-borders q-mb-sm" style="gap: 8px;">
                    <q-img v-if="selectedFilePreview" :src="selectedFilePreview" style="width: 40px; height: 40px; border-radius: 6px;" />
                    <q-icon v-else :name="getFileIcon(selectedFile)" size="24px" color="primary" />
                    <div class="col ellipsis text-caption">{{ selectedFile.name }}</div>
                    <q-btn flat round dense icon="close" size="xs" @click="clearSelectedFile" />
                  </div>

                  <div class="row items-center no-wrap" style="gap: 4px;">
                    <!-- Attachment button (Squared & Centered) -->
                    <q-btn
                      flat
                      dense
                      icon="attach_file"
                      color="grey-7"
                      class="attachment-btn-square"
                    >
                      <q-menu
                        fit
                        anchor="top left"
                        self="bottom left"
                        class="attachment-menu-top"
                      >
                        <q-list dense style="min-width: 160px;">
                          <q-item clickable v-close-popup @click="openFilePicker">
                            <q-item-section avatar><q-icon name="collections" color="primary" /></q-item-section>
                            <q-item-section>Galería</q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup @click="openCamera">
                            <q-item-section avatar><q-icon name="photo_camera" color="secondary" /></q-item-section>
                            <q-item-section>Cámara</q-item-section>
                          </q-item>
                          <q-item v-if="selectedChat?.id !== 'mock-purchase'" clickable v-close-popup @click="openVideoPicker">
                            <q-item-section avatar><q-icon name="videocam" color="negative" /></q-item-section>
                            <q-item-section>Video</q-item-section>
                          </q-item>
                          <q-item v-if="selectedChat?.id !== 'mock-purchase'" clickable v-close-popup @click="openDocumentPicker">
                            <q-item-section avatar><q-icon name="description" color="warning" /></q-item-section>
                            <q-item-section>Documento</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>

                    <!-- Text input -->
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
                      :disable="sending"
                      hide-bottom-space
                      @keydown.enter.prevent="sendMessage"
                      class="messenger-text-input col"
                    >
                      <template v-slot:append>
                        <q-btn
                          v-if="newMessage.trim() || selectedFile"
                          flat round
                          icon="send"
                          :color="!isTyping ? 'primary' : 'grey-5'"
                          size="sm"
                          @click="sendMessage"
                          :loading="sending"
                          class="send-btn"
                        />
                      </template>
                    </q-input>

                    <!-- Audio recorder (shown when input is empty and not AI purchase) -->
                    <AudioRecorder v-if="!newMessage.trim() && !selectedFile && selectedChat?.id !== 'mock-purchase'" @send="sendAudioMessage" />
                  </div>

                  <!-- Hidden file inputs -->
                  <input type="file" ref="fileInput" accept="image/*,video/*" @change="handleFileSelect" style="display: none" />
                  <input type="file" ref="cameraInput" accept="image/*" capture="environment" @change="handleFileSelect" style="display: none" />
                  <input type="file" ref="videoInput" accept="video/*" @change="handleFileSelect" style="display: none" />
                  <input type="file" ref="documentInput" accept="application/pdf,.doc,.docx,.xls,.xlsx" @change="handleFileSelect" style="display: none" />

                  <CameraCapture v-model="showCamera" @capture="handleCameraCapture" />
                </q-card-section>
              </div>
            </div>
          </q-card>
        </transition>
      </div>
    </transition>

    <!-- Video Tutorial Modal -->
    <q-dialog v-model="showVideoModal" maximized persistent class="video-modal" transition-show="fade" transition-hide="fade">
      <div class="video-modal-container no-scroll">
        <q-btn
          flat round dense
          icon="close"
          color="white"
          class="absolute-top-right q-ma-md z-max"
          size="lg"
          v-close-popup
        />

        <video
          v-if="showVideoModal"
          :src="currentVideoUrl"
          controls
          autoplay
          class="video-player"
        ></video>
      </div>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'
import SupportFacebookCard from './SupportFacebookCard.vue'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'
import AudioRecorder from 'src/components/AudioRecorder.vue'
import AudioPlayer from 'src/components/AudioPlayer.vue'
import CameraCapture from 'src/components/CameraCapture.vue'
import { useSupportChat } from 'src/composables/useSupportChat'
import InvoiceReviewCard from 'src/components/InvoiceReviewCard.vue'
import eventBus from 'src/utils/eventBus'

/**
 * Quasar instance
 */
const $q = useQuasar()

/**
 * Auth store
 */
const authStore = authentication()

// ─── Shared support chat logic ──────────────────────────────────────────────
const {
  selectedFile,
  selectedFilePreview,
  fileInput,
  cameraInput,
  videoInput,
  documentInput,
  getFileIcon,
  getFileTypeIcon,
  getFullUrl,
  getFileUrl,
  clearSelectedFile,
  handleFileSelect,
  handleCameraCapture: _handleCameraCapture,
  openFilePicker,
  openVideoPicker,
  openDocumentPicker,
  getVideoData,
  getInvoiceData,
  saveMockPurchaseMessage,
  updateMockMessage,
  deleteMockMessage,
  buildLocalMessage,
  sendChatMessage,
  sendAudioChatMessage,
  formatMessageContent
} = useSupportChat()

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
 * Video Modal State
 */
const showVideoModal = ref(false)
const currentVideoUrl = ref('')

/**
 * Chat input ref
 */
const chatInput = ref(null)

const showCamera = ref(false)
const sending = ref(false)

/**
 * Current user
 */
const currentUser = computed(() => authStore.userSession)
const isRoot = computed(() => !!authStore.userSession?.is_root)

const isPartnerOnline = computed(() => {
  if (!selectedChat.value) return false
  if (!isRoot.value) return true
  const partner = selectedChat.value.client || selectedChat.value.users?.find(u => u.id !== authStore.userSession?.id)
  return partner?.status === 'online' || partner?.is_online || false
})

const getChatName = (chat) => {
  if (!chat) return 'Soporte OrderWise'
  if (isRoot.value) {
    return chat.client?.name || chat.users?.find(u => u.id !== authStore.userSession?.id)?.name || 'Cliente'
  }
  return chat.title || chat.subject || 'Soporte OrderWise'
}

// Wrap handleCameraCapture to also close the camera modal
const handleCameraCapture = (file) => {
  _handleCameraCapture(file)
  showCamera.value = false
}

const openCamera = () => {
  showCamera.value = true
}

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

const selectChat = async (chat) => {
  selectedChat.value = chat
  messages.value = []

  if (chat.id === 'mock-purchase') {
    const stored = localStorage.getItem('mock_purchase_chat')
    if (stored) {
      const mock = JSON.parse(stored)
      messages.value = mock.messages || []
    } else {
      messages.value = chat.messages || []
    }
    await nextTick()
    scrollToBottom()
    return
  }

  try {
    const { data } = await api.get(`support-chats/${chat.id}`)
    messages.value = data.messages || []
    // Si el chat por alguna razón no tiene la metadata visual, le ponemos el default basado en su tipo
    if (!selectedChat.value.icon) {
      if (selectedChat.value.type === 'ai') {
        selectedChat.value.icon = 'auto_awesome'
        selectedChat.value.avatarClass = 'palma-avatar'
      } else if (selectedChat.value.type === 'support') {
        selectedChat.value.icon = 'headset_mic'
        selectedChat.value.avatarClass = 'bg-primary'
      } else {
        selectedChat.value.icon = 'receipt_long'
        selectedChat.value.avatarClass = 'bg-orange'
      }
    }
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
  if ((!newMessage.value.trim() && !selectedFile.value) || !selectedChat.value || sending.value) return

  const messageText = newMessage.value
  const fileToSend = selectedFile.value
  const filePreview = selectedFilePreview.value

  newMessage.value = ''
  clearSelectedFile()
  sending.value = true

  // Build optimistic message using composable helper
  const userMessage = buildLocalMessage({ messageText, fileToSend, filePreview })
  messages.value.push(userMessage)

  isTyping.value = true
  await nextTick()
  scrollToBottom()

  try {
    if (selectedChat.value.id === 'mock-purchase') {
      const aiResponse = await saveMockPurchaseMessage(userMessage)

      if (aiResponse) {
        // Simulate thinking time for the AI
        isTyping.value = true
        setTimeout(async () => {
          messages.value.push(aiResponse)
          isTyping.value = false
          await nextTick()
          scrollToBottom()
        }, 1500)
      } else {
        isTyping.value = false
      }

      sending.value = false
      await nextTick()
      scrollToBottom()
      return
    }

    const data = await sendChatMessage(selectedChat.value.id, messageText, fileToSend, userMessage.type)

    // Update local message if server returned enriched data
    if (data.user_message) {
      const idx = messages.value.findIndex(m => m.id === userMessage.id)
      if (idx !== -1) messages.value[idx] = data.user_message
    }
    if (data.assistant_message) {
      messages.value.push(data.assistant_message)
    }

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    $q.notify({ type: 'negative', message: 'Error al enviar mensaje' })
  } finally {
    sending.value = false
    isTyping.value = false
  }
}

/**
 * Send audio message
 */
const sendAudioMessage = async (audioBlob) => {
  if (sending.value || !selectedChat.value) return
  sending.value = true

  const tempId = Date.now()
  messages.value.push({
    id: tempId,
    type: 'audio',
    sender_id: authStore.userSession?.id,
    attachment_url: URL.createObjectURL(audioBlob),
    created_at: new Date().toISOString()
  })
  await nextTick()
  scrollToBottom()

  try {
    const data = await sendAudioChatMessage(selectedChat.value.id, audioBlob)
    const index = messages.value.findIndex(m => m.id === tempId)
    if (index !== -1) messages.value[index] = data.data || data
  } catch (error) {
    messages.value = messages.value.filter(m => m.id !== tempId)
  } finally {
    sending.value = false
  }
}

/**
 * Create new chat
 */
const startNewChat = async () => {
  selectedChat.value = { id: 'new', subject: 'Nueva conversación', title: 'Nueva conversación' }
  messages.value = []
}

/**
 * Is own message
 */
const isOwnMessage = (message) => {
  if (!message) return false
  return message.role === 'user' || message.sender_id === currentUser.value?.id
}

/**
 * Scroll to bottom
 */
const scrollToBottom = () => {
  if (messagesArea.value) {
    messagesArea.value.scrollTop = 0
  }
}

/**
 * Open video in fullscreen modal
 */
const openVideoModal = (video) => {
  currentVideoUrl.value = getFileUrl(video.url)
  showVideoModal.value = true
  showMiniChat.value = false // Close chat when video opens
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
  if (index === 0 || !message) return false
  const prevMessage = messages.value[index - 1]
  if (!prevMessage) return false

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
  if (index === messages.value.length - 1 || !message) return false
  const nextMessage = messages.value[index + 1]
  if (!nextMessage) return false

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

/**
 * Open mini chat explicitly
 */
const openMiniChat = () => {
  showMiniChat.value = true
}

// Expose methods for parent components
defineExpose({
  toggleMiniChat,
  openMiniChat
})
</script>

<style scoped lang="scss">
.support-chat-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 3000; /* Lower z-index so Quasar menus (6000) show on top */
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
  z-index: 3000;
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
  overflow: visible; /* CRITICAL: Allows menus to show on top without being cut */
  transition: all 0.3s;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* Messenger Theme Header */
.card-header {
  background: white;
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

  &.offline {
    background-color: #bcc0c4;
  }
}

.palma-avatar {
  background: linear-gradient(135deg, #0084ff, #00c6ff);
  box-shadow: 0 2px 8px rgba(0, 132, 255, 0.3);
}

.support-name {
  font-weight: 700;
  font-size: 15px;
  color: #18181b;
  line-height: 1.2;
  letter-spacing: -0.2px;
}

.support-status {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 12px;
  color: #65676b;
}

.mini-chat-content {
  flex: 1;
  min-height: 0; /* Critical: allows flex children to shrink properly */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.active-chat {
  flex: 1;
  min-height: 0; /* Critical: allows flex children to shrink properly */
  display: flex;
  flex-direction: column;
  overflow: visible; /* Changed to visible for dropdowns */
  background: white;
}

/* Messages scroll — column-reverse is the WhatsApp/Discord/Telegram pattern. */
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

  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  &:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    background-clip: content-box;
  }
}

.encryption-notice {
  padding: 12px 24px;
  color: #65676b;
  font-size: 12px;
  line-height: 1.4;
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
  align-items: flex-end;
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
      border-radius: 18px 18px 18px 0;
    }

    &.next-same:not(.sequential) .message-bubble {
      border-radius: 18px 18px 18px 4px;
    }

    &.sequential.next-same .message-bubble {
      border-radius: 4px 18px 18px 4px;
    }

    &.sequential:not(.next-same) .message-bubble {
      border-radius: 4px 18px 18px 0;
    }
  }

  &.own {
    grid-template-columns: 1fr;
    padding-left: 72px;
    padding-right: 12px;

    .message-bubble {
      background-color: #0084ff;
      color: white;
      border-radius: 18px 18px 0 18px;
    }

    &.next-same:not(.sequential) .message-bubble {
      border-radius: 18px 18px 4px 18px;
    }

    &.sequential.next-same .message-bubble {
      border-radius: 18px 4px 4px 18px;
    }

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
  min-width: 0;
}

.message-bubble {
  padding: 0.5rem 0.75rem;
  font-size: 14px;
  line-height: 1.4;
  overflow-wrap: break-word;
  word-break: break-word;
  position: relative;

  &.typing-bubble {
    background-color: #f0f2f5;
    padding: 12px 16px;
    width: fit-content;
  }

  &.image-message-bubble {
    padding: 0.25rem;
    width: 100%;
    max-width: 300px;
    min-width: 200px;
    background: #f0f2f5;

    &.own {
      background: #0084ff;
    }

    &.image-only {
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      max-width: 260px; /* Slightly narrower when no bubble frame */
    }
    > .message-text {
      padding: 0.25rem 0.5rem;
    }
  }

  &.audio-bubble {
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
    min-width: 220px;
  }

  &.doc-message-bubble {
    padding: 4px !important;
    background: #f8f9fa;
    border-radius: 12px;

    &.own {
      background: #0084ff;
    }
  }
}

.doc-card {
  display: flex;
  background: white;
  border-radius: 10px;
  padding: 8px;
  text-decoration: none;
  border: 1px solid rgba(0, 0, 0, 0.05);
  min-width: 180px;
  max-width: 280px;

  &.own {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);

    .doc-name { color: white; }
    .doc-meta { color: rgba(255, 255, 255, 0.7); }
    .doc-icon-container { background: white; }
  }
}

.doc-icon-container {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  border-radius: 8px;
}

.doc-name {
  font-size: 13px;
  font-weight: 600;
  color: #1c1e21;
  line-height: 1.2;
}

.doc-meta {
  font-size: 11px;
  color: #65676b;
  margin-top: 2px;
}

.invoice-bubble {
  padding: 12px !important;
  background: white !important;
  border: 1px solid rgba(0,0,0,0.08);
  min-width: 240px;
  max-width: 300px;
  color: #1c1e21 !important;

  &.own {
    background: #0084ff !important;
    color: white !important;
    border: none;
  }
}

.invoice-card-header {
  margin-bottom: 8px;
}

.invoice-number {
  font-size: 14px;
  line-height: 1.2;
}

.invoice-date {
  font-size: 11px;
}

.opacity-70 {
  opacity: 0.7;
}

.message-text {
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;

  :deep(a) {
    word-break: break-all;
  }
}

.video-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.video-bubble {
  padding: 4px !important;
  cursor: pointer;

  &:hover .play-overlay {
    background: rgba(0, 0, 0, 0.45);
  }

  &:hover .video-thumbnail {
    transform: scale(1.03);
  }
}

.video-thumbnail-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/9;
  border-radius: 10px;
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  transition: background 0.2s ease;
  z-index: 2;
}

.video-info {
  background: #f8f9fa;
  border-radius: 0 0 10px 10px;
}

.video-title {
  font-size: 13px;
  line-height: 1.3;
  color: #1a1a1b;
  margin-bottom: 4px;
}

.video-modal :deep(.q-dialog__inner) {
  padding: 0 !important;
  margin: 0 !important;
  overflow: hidden !important;
  background: rgba(0, 0, 0, 0.8) !important;
}

.video-modal-container {
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.video-player {
  width: auto;
  height: auto;
  max-width: 90%;
  max-height: 85%;
  display: block;
  outline: none;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  font-size: 14px;
}

.send-btn {
  margin-left: 4px;
}

.attachment-btn-square {
  background: #f0f2f5;
  border-radius: 8px !important;
  width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0 !important;

  &:hover {
    background: #e4e6eb;
  }
}

.chat-image, .chat-video {
  width: 100%;
  border-radius: 14px;
  display: block;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.chat-video {
  max-width: 100%;
  height: auto;
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
