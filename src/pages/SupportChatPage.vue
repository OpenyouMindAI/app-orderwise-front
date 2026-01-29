<template>
  <q-page class="support-chat-page">
    <div class="chat-container">
      <!-- Sidebar con lista de tickets -->
      <div class="chat-sidebar" :class="{ 'mobile-hidden': selectedChat && $q.screen.lt.md }">
        <div class="sidebar-header">
          <div class="header-content">
            <q-icon name="support_agent" size="32px" color="white" />
            <div class="header-text">
              <div class="header-title">Soporte Técnico</div>
              <div class="header-subtitle">¿En qué podemos ayudarte?</div>
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="add"
            color="white"
            @click="openNewTicketDialog"
            class="new-chat-btn"
          >
            <q-tooltip>Nuevo ticket</q-tooltip>
          </q-btn>
        </div>

        <div class="chat-list">
          <q-scroll-area class="fit">
            <div v-if="loading && chats.length === 0" class="text-center q-pa-md">
              <q-spinner color="primary" size="40px" />
            </div>

            <div v-else-if="chats.length === 0" class="empty-state">
              <q-icon name="chat_bubble_outline" size="64px" color="grey-5" />
              <div class="empty-text">No tienes tickets de soporte</div>
              <q-btn
                flat
                color="primary"
                label="Crear ticket"
                icon="add"
                @click="openNewTicketDialog"
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
                    <q-avatar size="49px" :color="getStatusColor(chat.status)" text-color="white">
                      <q-icon :name="getStatusIcon(chat.status)" size="24px" />
                    </q-avatar>
                  </div>
                  <div class="chat-info">
                    <div class="chat-header-row">
                      <div class="chat-title">{{ chat.subject || 'Sin asunto' }}</div>
                      <q-badge
                        v-if="chat.unread_count > 0"
                        color="negative"
                        :label="chat.unread_count"
                        class="q-ml-sm"
                      />
                    </div>
                    <div class="chat-preview">
                      {{ truncateMessage(chat.last_message?.content) || 'Sin mensajes' }}
                    </div>
                  </div>
                  <div class="chat-meta">
                    <div class="chat-time">{{ formatDate(chat.last_message_at) }}</div>
                    <q-chip
                      :color="getStatusColor(chat.status)"
                      text-color="white"
                      size="sm"
                      dense
                    >
                      {{ getStatusLabel(chat.status) }}
                    </q-chip>
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
          <q-icon name="support_agent" size="120px" color="grey-4" />
          <div class="empty-title">Centro de Soporte</div>
          <div class="empty-subtitle">
            ¿Tienes algún problema o duda? Crea un ticket y nuestro equipo te ayudará lo antes posible.
          </div>
          <q-btn
            unelevated
            color="primary"
            label="Crear nuevo ticket"
            icon="add_comment"
            size="lg"
            @click="openNewTicketDialog"
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
            <q-avatar :color="getStatusColor(selectedChat.status)" text-color="white" size="40px">
              <q-icon name="support_agent" />
            </q-avatar>
            <div class="header-info">
              <div class="chat-name">{{ selectedChat.subject }}</div>
              <div class="chat-status">
                <q-chip
                  :color="getStatusColor(selectedChat.status)"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ getStatusLabel(selectedChat.status) }}
                </q-chip>
                <span v-if="selectedChat.admin" class="q-ml-sm text-caption">
                  Atendido por: {{ selectedChat.admin.name }}
                </span>
              </div>
            </div>
            <q-space />
            <q-chip
              :color="getPriorityColor(selectedChat.priority)"
              text-color="white"
              size="sm"
              icon="priority_high"
            >
              {{ getPriorityLabel(selectedChat.priority) }}
            </q-chip>
          </div>

          <!-- Mensajes -->
          <div class="messages-container" ref="messagesContainer">
            <q-scroll-area class="fit" ref="scrollArea">
              <div class="messages-list">
                <div
                  v-for="message in messages"
                  :key="message.id"
                  :class="['message-wrapper', isOwnMessage(message) ? 'user-message' : 'assistant-message']"
                >
                  <div class="message-bubble">
                    <div class="message-sender" v-if="!isOwnMessage(message)">
                      {{ message.sender?.name || 'Soporte' }}
                    </div>

                    <!-- Attachment: Image -->
                    <div v-if="message.type === 'image' && message.attachment_url" class="message-attachment image-attachment">
                      <div class="image-container" @click="openImagePreview(message, getMessageImages(message))">
                        <q-img
                          :src="message.attachment_url"
                          :alt="message.attachment_name"
                          class="attachment-image"
                          fit="cover"
                          :ratio="4/3"
                        >
                          <template v-slot:loading>
                            <div class="image-loading">
                              <q-spinner color="white" size="32px" />
                            </div>
                          </template>
                        </q-img>
                        <div class="image-overlay">
                          <q-icon name="zoom_in" size="28px" color="white" />
                        </div>
                      </div>
                    </div>

                    <!-- Attachment: Video -->
                    <div v-if="message.type === 'video' && message.attachment_url" class="message-attachment video-attachment">
                      <video
                        :src="message.attachment_url"
                        controls
                        class="attachment-video"
                        preload="metadata"
                        playsinline
                      ></video>
                    </div>

                    <!-- Attachment: File -->
                    <div v-if="message.type === 'file' && message.attachment_url" class="message-attachment file-attachment">
                      <a :href="message.attachment_url" target="_blank" class="file-link">
                        <div class="file-icon-wrapper">
                          <q-icon :name="getFileTypeIcon(message.attachment_mime)" size="28px" />
                        </div>
                        <div class="file-info">
                          <div class="file-name">{{ message.attachment_name }}</div>
                          <div class="file-size">{{ formatFileSize(message.attachment_size) }}</div>
                        </div>
                        <q-btn flat round dense icon="download" color="primary" />
                      </a>
                    </div>

                    <div v-if="message.content" class="message-content">{{ message.content }}</div>
                    <div class="message-footer">
                      <span class="message-time">{{ formatTime(message.created_at) }}</span>
                      <q-icon
                        v-if="isOwnMessage(message)"
                        :name="message.is_read ? 'done_all' : 'done'"
                        :color="message.is_read ? 'primary' : 'grey'"
                        size="16px"
                        class="q-ml-xs"
                      />
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
            <!-- New Messages Alert -->
            <transition name="fade">
              <div v-if="showScrollButton" class="scroll-bottom-alert cursor-pointer" @click="scrollToBottom">
                <q-chip
                  v-if="unreadMessagesBelow > 0"
                  color="positive"
                  text-color="white"
                  size="sm"
                  class="q-mr-xs"
                >
                  {{ unreadMessagesBelow }}
                </q-chip>
                <span class="text-caption q-mr-sm">Nuevos mensajes</span>
                <q-icon name="arrow_downward" />
              </div>
            </transition>
          </div>

          <!-- Input de mensaje -->
          <div class="q-pa-md" v-if="selectedChat.status !== 'closed'">
            <!-- Preview del archivo seleccionado -->
            <div v-if="selectedFile" class="attachment-preview q-mb-sm">
              <div class="preview-content">
                <q-img
                  v-if="selectedFilePreview && isImageFile(selectedFile)"
                  :src="selectedFilePreview"
                  class="preview-image"
                  fit="contain"
                />
                <div v-else class="preview-file">
                  <q-icon :name="getFileIcon(selectedFile)" size="32px" color="primary" />
                  <span>{{ selectedFile.name }}</span>
                </div>
              </div>
              <q-btn flat round dense icon="close" @click="clearSelectedFile" color="negative" />
            </div>

            <div class="input-wrapper">
              <div class="input-field">
                <q-input
                  v-model="newMessage"
                  placeholder="Escribe tu mensaje..."
                  filled
                  autogrow
                  :disable="sending"
                  @keyup.enter.exact="sendMessage"
                >
                  <template v-slot:prepend>
                    <q-btn-dropdown flat round dense icon="attach_file" color="grey">
                      <q-list>
                        <q-item clickable v-close-popup @click="openFilePicker">
                          <q-item-section avatar>
                            <q-icon name="photo_library" color="primary" />
                          </q-item-section>
                          <q-item-section>Galería</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="openCamera">
                          <q-item-section avatar>
                            <q-icon name="photo_camera" color="secondary" />
                          </q-item-section>
                          <q-item-section>Tomar Foto</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="openVideoPicker">
                          <q-item-section avatar>
                            <q-icon name="videocam" color="negative" />
                          </q-item-section>
                          <q-item-section>Video</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="openDocumentPicker">
                          <q-item-section avatar>
                            <q-icon name="description" color="warning" />
                          </q-item-section>
                          <q-item-section>Documento</q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </template>
                  <template v-slot:append>
                    <q-btn
                      round
                      icon="send"
                      size="md"
                      style="border-radius: 100px;"
                      color="primary"
                      @click="sendMessage"
                      :disable="(!newMessage.trim() && !selectedFile) || sending"
                      :loading="sending"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Hidden file inputs -->
            <input
              type="file"
              ref="fileInput"
              accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
              @change="handleFileSelect"
              style="display: none"
            />
            <input
              type="file"
              ref="cameraInput"
              accept="image/*"
              capture="environment"
              @change="handleFileSelect"
              style="display: none"
            />
            <input
              type="file"
              ref="videoInput"
              accept="video/*"
              @change="handleFileSelect"
              style="display: none"
            />
            <input
              type="file"
              ref="documentInput"
              accept="application/pdf,.doc,.docx,.xls,.xlsx"
              @change="handleFileSelect"
              style="display: none"
            />
          </div>

          <!-- Chat cerrado -->
          <div v-else class="chat-closed-banner q-pa-md">
            <q-banner class="bg-grey-3 text-grey-8" rounded>
              <template v-slot:avatar>
                <q-icon name="check_circle" color="positive" size="24px" />
              </template>
              Este ticket ha sido cerrado. Si necesitas más ayuda, crea un nuevo ticket.
            </q-banner>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog para nuevo ticket -->
    <q-dialog v-model="showNewTicketDialog" persistent>
      <q-card style="min-width: 400px; max-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            <q-icon name="support_agent" class="q-mr-sm" color="primary" />
            Nuevo Ticket de Soporte
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="createTicket" class="q-gutter-md">
            <q-input
              v-model="newTicket.subject"
              label="Asunto *"
              filled
              :rules="[val => !!val || 'El asunto es requerido']"
              hint="Describe brevemente tu problema"
            />

            <q-select
              v-model="newTicket.priority"
              :options="priorityOptions"
              label="Prioridad"
              filled
              emit-value
              map-options
            />

            <q-input
              v-model="newTicket.message"
              label="Descripción del problema *"
              type="textarea"
              filled
              autogrow
              :rules="[val => !!val || 'La descripción es requerida']"
              hint="Explica con detalle qué problema tienes o qué duda necesitas resolver"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            unelevated
            label="Crear Ticket"
            color="primary"
            icon="send"
            :loading="creating"
            @click="createTicket"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Image Preview Overlay con Carrusel -->
    <transition name="fade">
      <div v-if="showImagePreview" class="image-preview-overlay" @click.self="closeImagePreview">
        <div class="preview-header">
          <div class="preview-title">
            <q-icon name="image" size="24px" class="q-mr-sm" />
            <span>{{ previewImages.length > 1 ? `Imagen ${currentPreviewIndex + 1} de ${previewImages.length}` : 'Vista previa' }}</span>
          </div>
          <div class="preview-actions">
            <q-btn flat round icon="download" color="white" @click="downloadImage">
              <q-tooltip>Descargar</q-tooltip>
            </q-btn>
            <q-btn flat round icon="close" color="white" @click="closeImagePreview">
              <q-tooltip>Cerrar</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="preview-content">
          <!-- Botón anterior -->
          <q-btn
            v-if="previewImages.length > 1"
            flat
            round
            icon="chevron_left"
            color="white"
            size="lg"
            class="nav-btn nav-prev"
            :disable="currentPreviewIndex === 0"
            @click="prevImage"
          />

          <!-- Imagen principal -->
          <div class="preview-image-container">
            <transition :name="slideDirection" mode="out-in">
              <img
                :key="currentPreviewIndex"
                :src="currentPreviewImage"
                class="preview-main-image"
                alt="Preview"
              />
            </transition>
          </div>

          <!-- Botón siguiente -->
          <q-btn
            v-if="previewImages.length > 1"
            flat
            round
            icon="chevron_right"
            color="white"
            size="lg"
            class="nav-btn nav-next"
            :disable="currentPreviewIndex === previewImages.length - 1"
            @click="nextImage"
          />
        </div>

        <!-- Thumbnails del carrusel -->
        <div v-if="previewImages.length > 1" class="preview-thumbnails">
          <div
            v-for="(img, index) in previewImages"
            :key="index"
            class="thumbnail-item"
            :class="{ active: index === currentPreviewIndex }"
            @click="goToImage(index)"
          >
            <q-img :src="img" :ratio="1" fit="cover" />
          </div>
        </div>
      </div>
    </transition>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import { echo } from 'src/boot/pusher'
import { authentication } from 'src/stores/module-authentication'
import { useQuasar } from 'quasar'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Quasar instance
 * @type {object}
 */
const $q = useQuasar()

/**
 * Authentication store
 * @type {object}
 */
const authStore = authentication()

/**
 * Lista de chats de soporte
 * @type {import('vue').Ref<Array>}
 */
const chats = ref([])

/**
 * Chat seleccionado actualmente
 * @type {import('vue').Ref<object|null>}
 */
const selectedChat = ref(null)
const route = useRoute()

/**
 * Mensajes del chat seleccionado
 * @type {import('vue').Ref<Array>}
 */
const messages = ref([])

/**
 * Nuevo mensaje a enviar
 * @type {import('vue').Ref<string>}
 */
const newMessage = ref('')

/**
 * Estado de carga
 * @type {import('vue').Ref<boolean>}
 */
const loading = ref(false)

/**
 * Estado de envío de mensaje
 * @type {import('vue').Ref<boolean>}
 */
const sending = ref(false)

/**
 * Estado de creación de ticket
 * @type {import('vue').Ref<boolean>}
 */
const creating = ref(false)

/**
 * Indicador de escritura del otro usuario
 * @type {import('vue').Ref<boolean>}
 */
const isTyping = ref(false)

/**
 * Mostrar dialog de nuevo ticket
 * @type {import('vue').Ref<boolean>}
 */
const showNewTicketDialog = ref(false)

/**
 * Referencia al contenedor de mensajes
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const messagesContainer = ref(null)

/**
 * Referencia al scroll area
 * @type {import('vue').Ref<object|null>}
 */
const scrollArea = ref(null)

/**
 * Mostrar overlay de preview de imagen
 * @type {import('vue').Ref<boolean>}
 */
const showImagePreview = ref(false)

/**
 * Lista de imágenes para el carrusel
 * @type {import('vue').Ref<Array<string>>}
 */
const previewImages = ref([])

/**
 * Índice actual del carrusel
 * @type {import('vue').Ref<number>}
 */
const currentPreviewIndex = ref(0)

/**
 * Dirección de la animación del slide
 * @type {import('vue').Ref<string>}
 */
const slideDirection = ref('slide-left')

/**
 * Mostrar botón de scroll
 * @type {import('vue').Ref<boolean>}
 */
const showScrollButton = ref(false)

/**
 * Cantidad de mensajes nuevos abajo
 * @type {import('vue').Ref<number>}
 */
const unreadMessagesBelow = ref(0)

/**
 * Indica si el usuario ha scrolleado hacia arriba
 * @type {import('vue').Ref<boolean>}
 */
const isUserScrolledUp = ref(false)

/**
 * Imagen actual del preview
 * @type {import('vue').ComputedRef<string>}
 */
const currentPreviewImage = computed(() => previewImages.value[currentPreviewIndex.value] || '')

/**
 * Referencia al input de archivo
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const fileInput = ref(null)

/**
 * Referencia al input de cámara
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const cameraInput = ref(null)

/**
 * Referencia al input de video
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const videoInput = ref(null)

/**
 * Referencia al input de documento
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const documentInput = ref(null)

/**
 * Archivo seleccionado para enviar
 * @type {import('vue').Ref<File|null>}
 */
const selectedFile = ref(null)

/**
 * Preview URL del archivo seleccionado
 * @type {import('vue').Ref<string|null>}
 */
const selectedFilePreview = ref(null)

/**
 * Datos del nuevo ticket
 * @type {import('vue').Ref<object>}
 */
const newTicket = ref({
  subject: '',
  message: '',
  priority: 'medium'
})

/**
 * Opciones de prioridad
 * @type {Array}
 */
const priorityOptions = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Urgente', value: 'urgent' }
]

/**
 * Usuario actual
 * @type {import('vue').ComputedRef<object>}
 */
const currentUser = computed(() => authStore.userSession)

/**
 * Carga la lista de chats de soporte
 * @returns {Promise<void>}
 */
const loadChats = async () => {
  loading.value = true
  try {
    const { data } = await api.get('support-chats')
    chats.value = data.data || data
  } catch (error) {
    console.error('Error loading chats:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los tickets de soporte'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Selecciona un chat y carga sus mensajes
 * @param {object} chat - Chat a seleccionar
 * @returns {Promise<void>}
 */
const selectChat = async (chat) => {
  selectedChat.value = chat
  loading.value = true
  try {
    const { data } = await api.get(`support-chats/${chat.id}`)
    messages.value = data.messages || []
    selectedChat.value = data

    // Actualizar contador de no leídos en la lista
    const chatIndex = chats.value.findIndex(c => c.id === chat.id)
    if (chatIndex !== -1) {
      chats.value[chatIndex].unread_count = 0
    }

    // Suscribirse al canal del chat
    subscribeToChat(chat.id)

    await nextTick()
    scrollToBottom()
    attachScrollListener()
  } catch (error) {
    console.error('Error loading chat:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el chat'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Abre el dialog para crear nuevo ticket
 * @returns {void}
 */
const openNewTicketDialog = () => {
  newTicket.value = {
    subject: '',
    message: '',
    priority: 'medium'
  }
  showNewTicketDialog.value = true
}

/**
 * Crea un nuevo ticket de soporte
 * @returns {Promise<void>}
 */
const createTicket = async () => {
  if (!newTicket.value.subject || !newTicket.value.message) {
    $q.notify({
      type: 'warning',
      message: 'Por favor completa todos los campos requeridos'
    })
    return
  }

  creating.value = true
  try {
    const { data } = await api.post('support-chats', newTicket.value)

    chats.value.unshift(data.chat)
    selectedChat.value = data.chat
    messages.value = data.chat.messages || []

    showNewTicketDialog.value = false

    $q.notify({
      type: 'positive',
      message: 'Ticket creado exitosamente'
    })

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error creating ticket:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al crear el ticket'
    })
  } finally {
    creating.value = false
  }
}

/**
 * Envía un mensaje al chat seleccionado
 * @returns {Promise<void>}
 */
const sendMessage = async () => {
  if ((!newMessage.value.trim() && !selectedFile.value) || sending.value || !selectedChat.value) return

  const messageText = newMessage.value
  const fileToSend = selectedFile.value
  newMessage.value = ''
  clearSelectedFile()
  sending.value = true

  // Agregar mensaje temporalmente
  const tempMessage = {
    id: Date.now(),
    content: messageText,
    type: fileToSend ? (isImageFile(fileToSend) ? 'image' : isVideoFile(fileToSend) ? 'video' : 'file') : 'text',
    sender_id: currentUser.value?.id,
    sender: { name: currentUser.value?.name },
    is_read: false,
    created_at: new Date().toISOString()
  }
  messages.value.push(tempMessage)

  await nextTick()
  scrollToBottom()

  try {
    const formData = new FormData()
    if (messageText) {
      formData.append('message', messageText)
    }
    if (fileToSend) {
      formData.append('attachment', fileToSend)
    }

    const { data } = await api.post(`support-chats/${selectedChat.value.id}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Reemplazar mensaje temporal con el real
    const tempIndex = messages.value.findIndex(m => m.id === tempMessage.id)
    if (tempIndex !== -1) {
      // Verificar si ya existe el mensaje real (por evento de socket)
      if (messages.value.find(m => m.id === data.data.id)) {
        messages.value.splice(tempIndex, 1)
      } else {
        messages.value[tempIndex] = data.data
      }
    }

    // Actualizar último mensaje en la lista
    const chatIndex = chats.value.findIndex(c => c.id === selectedChat.value.id)
    if (chatIndex !== -1) {
      chats.value[chatIndex].last_message = data.data
      chats.value[chatIndex].last_message_at = data.data.created_at
    }
  } catch (error) {
    console.error('Error sending message:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar el mensaje'
    })
    // Remover mensaje temporal en caso de error
    messages.value = messages.value.filter(m => m.id !== tempMessage.id)
  } finally {
    sending.value = false
  }
}

/**
 * Abre el selector de archivos
 * @returns {void}
 */
const openFilePicker = () => {
  fileInput.value?.click()
}

/**
 * Abre la cámara para tomar foto
 * @returns {void}
 */
const openCamera = () => {
  cameraInput.value?.click()
}

/**
 * Abre el selector de video
 * @returns {void}
 */
const openVideoPicker = () => {
  videoInput.value?.click()
}

/**
 * Abre el selector de documentos
 * @returns {void}
 */
const openDocumentPicker = () => {
  documentInput.value?.click()
}

/**
 * Maneja la selección de archivo
 * @param {Event} event - Evento de cambio del input
 * @returns {void}
 */
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validar tamaño (20MB max)
  const maxSize = 20 * 1024 * 1024
  if (file.size > maxSize) {
    $q.notify({
      type: 'warning',
      message: 'El archivo no puede superar los 20MB'
    })
    event.target.value = ''
    return
  }

  selectedFile.value = file

  // Crear preview si es imagen
  if (isImageFile(file)) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedFilePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    selectedFilePreview.value = null
  }

  // Limpiar el input para permitir seleccionar el mismo archivo
  event.target.value = ''
}

/**
 * Limpia el archivo seleccionado
 * @returns {void}
 */
const clearSelectedFile = () => {
  selectedFile.value = null
  selectedFilePreview.value = null
}

/**
 * Verifica si el archivo es una imagen
 * @param {File} file - Archivo a verificar
 * @returns {boolean}
 */
const isImageFile = (file) => {
  return file.type.startsWith('image/')
}

/**
 * Verifica si el archivo es un video
 * @param {File} file - Archivo a verificar
 * @returns {boolean}
 */
const isVideoFile = (file) => {
  return file.type.startsWith('video/')
}

/**
 * Obtiene el icono según el tipo de archivo
 * @param {File} file - Archivo
 * @returns {string}
 */
const getFileIcon = (file) => {
  if (isImageFile(file)) return 'image'
  if (isVideoFile(file)) return 'videocam'
  if (file.type.includes('pdf')) return 'picture_as_pdf'
  if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) return 'description'
  if (file.type.includes('excel') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) return 'table_chart'
  return 'attach_file'
}

/**
 * Formatea el tamaño del archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string}
 */
const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * Abre preview de imagen con carrusel
 * @param {object} message - Mensaje con la imagen
 * @param {Array} images - Lista de imágenes del carrusel
 * @returns {void}
 */
const openImagePreview = (message, images) => {
  previewImages.value = images
  currentPreviewIndex.value = images.indexOf(message.attachment_url)
  if (currentPreviewIndex.value === -1) currentPreviewIndex.value = 0
  showImagePreview.value = true
  // Bloquear scroll del body
  document.body.style.overflow = 'hidden'
}

/**
 * Cierra el preview de imagen
 * @returns {void}
 */
const closeImagePreview = () => {
  showImagePreview.value = false
  // Restaurar scroll del body
  document.body.style.overflow = ''
}

/**
 * Obtiene todas las imágenes del chat para el carrusel
 * @param {object} currentMessage - Mensaje actual
 * @returns {Array<string>}
 */
const getMessageImages = (currentMessage) => {
  return messages.value
    .filter(m => m.type === 'image' && m.attachment_url)
    .map(m => m.attachment_url)
}

/**
 * Navega a la imagen anterior
 * @returns {void}
 */
const prevImage = () => {
  if (currentPreviewIndex.value > 0) {
    slideDirection.value = 'slide-right'
    currentPreviewIndex.value--
  }
}

/**
 * Navega a la imagen siguiente
 * @returns {void}
 */
const nextImage = () => {
  if (currentPreviewIndex.value < previewImages.value.length - 1) {
    slideDirection.value = 'slide-left'
    currentPreviewIndex.value++
  }
}

/**
 * Navega a una imagen específica
 * @param {number} index - Índice de la imagen
 * @returns {void}
 */
const goToImage = (index) => {
  slideDirection.value = index > currentPreviewIndex.value ? 'slide-left' : 'slide-right'
  currentPreviewIndex.value = index
}

/**
 * Descarga la imagen actual
 * @returns {void}
 */
const downloadImage = () => {
  const url = currentPreviewImage.value
  const link = document.createElement('a')
  link.href = url
  link.download = `imagen-${Date.now()}.jpg`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Obtiene el icono según el tipo MIME del archivo
 * @param {string} mimeType - Tipo MIME
 * @returns {string}
 */
const getFileTypeIcon = (mimeType) => {
  if (!mimeType) return 'attach_file'
  if (mimeType.includes('pdf')) return 'picture_as_pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'description'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table_chart'
  if (mimeType.includes('image')) return 'image'
  if (mimeType.includes('video')) return 'videocam'
  return 'attach_file'
}

/**
 * Verifica si el mensaje es del usuario actual
 * @param {object} message - Mensaje a verificar
 * @returns {boolean}
 */
const isOwnMessage = (message) => {
  return message.sender_id === currentUser.value?.id
}

/**
 * Obtiene el color del estado
 * @param {string} status - Estado del chat
 * @returns {string}
 */
const getStatusColor = (status) => {
  const colors = {
    open: 'primary',
    in_progress: 'warning',
    closed: 'positive',
    reopened: 'orange'
  }
  return colors[status] || 'grey'
}

/**
 * Obtiene el icono del estado
 * @param {string} status - Estado del chat
 * @returns {string}
 */
const getStatusIcon = (status) => {
  const icons = {
    open: 'fiber_new',
    in_progress: 'hourglass_top',
    closed: 'check_circle',
    reopened: 'refresh'
  }
  return icons[status] || 'help'
}

/**
 * Obtiene la etiqueta del estado
 * @param {string} status - Estado del chat
 * @returns {string}
 */
const getStatusLabel = (status) => {
  const labels = {
    open: 'Abierto',
    in_progress: 'En progreso',
    closed: 'Cerrado',
    reopened: 'Reabierto'
  }
  return labels[status] || status
}

/**
 * Obtiene el color de la prioridad
 * @param {string} priority - Prioridad del ticket
 * @returns {string}
 */
const getPriorityColor = (priority) => {
  const colors = {
    low: 'grey',
    medium: 'primary',
    high: 'warning',
    urgent: 'negative'
  }
  return colors[priority] || 'grey'
}

/**
 * Obtiene la etiqueta de la prioridad
 * @param {string} priority - Prioridad del ticket
 * @returns {string}
 */
const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  }
  return labels[priority] || priority
}

/**
 * Formatea la fecha para mostrar
 * @param {string} date - Fecha a formatear
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

/**
 * Formatea la hora del mensaje
 * @param {string} date - Fecha a formatear
 * @returns {string}
 */
const formatTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'HH:mm', { locale: es })
}

/**
 * Trunca el mensaje para mostrar en la lista
 * @param {string} message - Mensaje a truncar
 * @returns {string}
 */
const truncateMessage = (message) => {
  if (!message) return ''
  const maxLength = 35
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}

/**
 * Hace scroll hasta el último mensaje
 * @returns {void}
 */
const scrollToBottom = () => {
  const scrollTarget = scrollArea.value?.$el?.querySelector('.q-scrollarea__container')
  if (scrollTarget) {
    scrollTarget.scrollTop = scrollTarget.scrollHeight
    // Resetear alertas
    showScrollButton.value = false
    unreadMessagesBelow.value = 0
    isUserScrolledUp.value = false

    if (selectedChat.value && document.hasFocus()) {
      api.post(`support-chats/${selectedChat.value.id}/read`)
    }
  }
}

/**
 * Maneja el evento de scroll
 */
const handleScroll = (evt) => {
  const target = evt.target
  // Distancia desde el fondo (tolerancia 100px)
  const bottom = target.scrollHeight - target.scrollTop - target.clientHeight

  if (bottom < 100) {
    const wasScrolledUp = isUserScrolledUp.value
    isUserScrolledUp.value = false
    showScrollButton.value = false
    unreadMessagesBelow.value = 0

    // Si acabamos de bajar y estamos enfocados, marcar como leído
    if (wasScrolledUp && selectedChat.value && document.hasFocus()) {
      api.post(`support-chats/${selectedChat.value.id}/read`)
    }
  } else {
    isUserScrolledUp.value = true
  }
}

/**
 * Adjunta el listener de scroll
 */
const attachScrollListener = () => {
  const scrollTarget = scrollArea.value?.$el?.querySelector('.q-scrollarea__container')
  if (scrollTarget) {
    scrollTarget.removeEventListener('scroll', handleScroll)
    scrollTarget.addEventListener('scroll', handleScroll)
  }
}

/**
 * Variable para controlar el canal actual
 */
let currentChatChannel = null

/**
 * Suscribe a eventos globales del usuario
 */
const subscribeToEvents = () => {
  if (!echo || !currentUser.value) return

  echo.private(`support.user.${currentUser.value.id}`)
    .listen('.message.sent', (data) => {
      handleGlobalMessage(data)
    })
}

/**
 * Suscribe a un chat específico
 * @param {number} chatId
 */
const subscribeToChat = (chatId) => {
  if (!echo) return

  // Si ya estamos suscritos a otro chat, salir
  if (currentChatChannel && currentChatChannel !== chatId) {
    echo.leave(`support.chat.${currentChatChannel}`)
  }

  // Si ya estamos suscritos a este chat, no hacer nada
  if (currentChatChannel === chatId) return

  currentChatChannel = chatId

  echo.private(`support.chat.${chatId}`)
    .listen('.message.sent', (data) => {
      // Si el chat está abierto, agregar mensaje
      if (selectedChat.value && selectedChat.value.id === data.chat_id) {
        // Verificar si ya existe para evitar duplicados
        if (!messages.value.find(m => m.id === data.message.id)) {
          messages.value.push(data.message)

          if (isUserScrolledUp.value) {
            showScrollButton.value = true
            unreadMessagesBelow.value++
          } else {
            scrollToBottom()
          }

          // Marcar como leído si estamos viendo y no estamos arriba
          if (document.hasFocus() && !isUserScrolledUp.value) {
            api.post(`support-chats/${chatId}/read`)
          }
        }
      }
    })
    .listen('.message.read', (data) => {
      if (selectedChat.value && selectedChat.value.id === data.chat_id) {
        // Si el otro usuario leyó, marcar mis mensajes como leídos
        if (data.user_id !== currentUser.value.id) {
          messages.value.forEach(m => {
            // Marcar todos como leídos o solo los míos
            m.is_read = true
          })
        }
      }
    })
}

/**
 * Maneja un mensaje entrante globalmente (para la lista)
 */
const handleGlobalMessage = (data) => {
  // Buscar el chat en la lista
  const chatIndex = chats.value.findIndex(c => c.id === data.chat_id)

  if (chatIndex !== -1) {
    // Actualizar chat existente
    const chat = chats.value[chatIndex]
    chat.last_message = data.message
    chat.last_message_at = data.timestamp

    // Si no es el chat activo, incrementar contador
    if (!selectedChat.value || selectedChat.value.id !== data.chat_id) {
      chat.unread_count = (chat.unread_count || 0) + 1
      // Reproducir sonido si se desea
    }

    // Mover al principio
    chats.value.splice(chatIndex, 1)
    chats.value.unshift(chat)
  } else {
    // Si el chat no está en la lista (nuevo), recargar lista
    loadChats()
  }
}

/**
 * Cancela suscripción a eventos de WebSocket
 * @returns {void}
 */
const unsubscribeFromEvents = () => {
  if (echo) {
    if (currentUser.value) {
      echo.leave(`support.user.${currentUser.value.id}`)
    }
    if (currentChatChannel) {
      echo.leave(`support.chat.${currentChatChannel}`)
    }
  }
}

onMounted(async () => {
  await loadChats()
  subscribeToEvents()
  checkRouteParam()
})

watch(() => route.query.id, () => {
  checkRouteParam()
})

const checkRouteParam = () => {
  if (route.query.id) {
    const chatToOpen = chats.value.find(c => c.id === route.query.id)
    if (chatToOpen) {
      selectChat(chatToOpen)
    }
  }
}

onUnmounted(() => {
  unsubscribeFromEvents()
})
</script>

<style lang="scss" scoped>
.support-chat-page {
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
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
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
  color: white;
}

.header-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.new-chat-btn {
  background: rgba(255, 255, 255, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
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
    background: rgba(25, 118, 210, 0.08);
  }
}

.body--dark .chat-item-wrapper {
  border-bottom-color: rgba(255, 255, 255, 0.08);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: rgba(25, 118, 210, 0.15);
  }
}

.chat-item-content {
  display: flex;
  align-items: center;
  padding: 12px 4px;
}

.chat-avatar {
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  margin-left: 7px;
  flex-direction: column;
}

.chat-header-row {
  display: flex;
  align-items: center;
}

.chat-title {
  font-weight: 500;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.chat-time {
  font-size: 11px;
  opacity: 0.6;
  white-space: nowrap;
}

.chat-preview {
  opacity: 0.7;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// Main chat area
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  @media (max-width: 1023px) {
    width: 100%;

    &.mobile-hidden {
      display: none;
    }
  }
}

.body--dark .chat-main {
  background: #121212;
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
  font-size: 28px;
  font-weight: 500;
  margin-top: 24px;
  color: var(--q-primary);
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
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  min-height: 70px;
}

.body--dark .chat-header {
  background: #1e1e1e;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.header-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.chat-name {
  font-weight: 600;
  font-size: 16px;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.messages-container {
  flex: 1;
  overflow: hidden;
  background: #e8e8e8;
  position: relative;
}

.body--dark .messages-container {
  background: #0a0a0a;
}

.messages-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
  max-width: 75%;

  &.user-message {
    align-self: flex-end;

    .message-bubble {
      background: #1976d2;
      color: white;
      border-radius: 18px 18px 4px 18px;
    }
  }

  &.assistant-message {
    align-self: flex-start;

    .message-bubble {
      background: white;
      color: #333;
      border-radius: 18px 18px 18px 4px;
    }
  }
}

.body--dark .message-wrapper.assistant-message .message-bubble {
  background: #2d2d2d;
  color: #e0e0e0;
}

.message-bubble {
  padding: 10px 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-sender {
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 4px;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 4px;
  gap: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.input-wrapper {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.body--dark .input-wrapper {
  background: #2d2d2d;
}

.input-field {
  width: 100%;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px !important;

  span {
    width: 8px;
    height: 8px;
    background: #90caf9;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-closed-banner {
  background: #f5f5f5;
}

.body--dark .chat-closed-banner {
  background: #1e1e1e;

  .q-banner {
    background: #2d2d2d !important;
    color: #e0e0e0 !important;
  }
}

// Attachment Styles
.message-attachment {
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
}

.image-attachment {
  .image-container {
    position: relative;
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    max-width: 320px;

    &:hover {
      .image-overlay {
        opacity: 1;
      }
    }
  }
}

.attachment-image {
  max-width: 320px;
  min-width: 200px;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.image-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
}

.video-attachment {
  max-width: 350px;
}

.attachment-video {
  width: 100%;
  max-height: 250px;
  border-radius: 12px;
  background: #000;
}

.file-attachment {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 280px;
}

.body--dark .file-attachment {
  background: rgba(255, 255, 255, 0.1);
}

.file-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;

  &:hover {
    .file-icon-wrapper {
      transform: scale(1.05);
    }
  }
}

.file-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.2s ease;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.file-size {
  font-size: 11px;
  opacity: 0.6;
}

// Attachment Preview (input)
.attachment-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.preview-file {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}

// Image Preview Overlay
.image-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  color: white;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
}

.preview-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 80px;
  min-height: 0;
}

.preview-image-container {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-main-image {
  max-width: 90vw;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.nav-btn {
  position: absolute;
  background: rgba(255,255,255,0.1) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(255,255,255,0.2) !important;
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
  }
}

.nav-prev {
  left: 16px;
}

.nav-next {
  right: 16px;
}

.preview-thumbnails {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  overflow-x: auto;
}

.thumbnail-item {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.5;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }

  &.active {
    opacity: 1;
    border-color: white;
    transform: scale(1.1);
  }
}

// Animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.scroll-bottom-alert {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  color: var(--q-primary);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  z-index: 10;
  border: 1px solid rgba(0,0,0,0.05);

  &:hover {
    background: #f5f5f5;
  }
}
</style>
