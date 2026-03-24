/**
 * useSupportChat.js
 *
 * Reusable composable for shared support chat logic.
 * Used by SupportChatBubble.vue (mini chat) and SupportChatPage.vue (full page).
 *
 * Handles:
 * - File selection, preview, and type detection
 * - URL normalization (blob, data, relative, absolute)
 * - File type icon mapping
 * - Invoice and video data parsing
 * - Mock-purchase (local) chat state persistence
 * - Message sending with local optimistic updates
 */

import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'

export function useSupportChat () {
  const authStore = authentication()

  // ─── File state ──────────────────────────────────────────────────────────────
  const selectedFile = ref(null)
  const selectedFilePreview = ref(null)

  // Template refs — components using this composable should pass these in
  // or bind them. We expose setters so components can wire them up.
  const fileInput = ref(null)
  const cameraInput = ref(null)
  const videoInput = ref(null)
  const documentInput = ref(null)

  // ─── File type helpers ────────────────────────────────────────────────────────
  const isImageFile = (file) => file && file.type && file.type.startsWith('image/')
  const isVideoFile = (file) => file && file.type && file.type.startsWith('video/')

  const getFileIcon = (file) => {
    if (isImageFile(file)) return 'image'
    if (isVideoFile(file)) return 'videocam'
    return 'description'
  }

  const getFileTypeIcon = (mimeType) => {
    if (!mimeType) return 'insert_drive_file'
    if (mimeType.includes('pdf')) return 'picture_as_pdf'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description'
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'bar_chart'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'slideshow'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'folder_zip'
    if (mimeType.includes('image')) return 'image'
    if (mimeType.includes('video')) return 'videocam'
    return 'insert_drive_file'
  }

  const getMessageType = (file) => {
    if (!file) return 'text'
    if (isImageFile(file)) return 'image'
    if (isVideoFile(file)) return 'video'
    return 'file'
  }

  // ─── URL helpers ──────────────────────────────────────────────────────────────
  const getFullUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('data:')) return url
    const baseUrl = import.meta.env.VITE_APP_API_URL?.replace(/\/api\/?$/, '') || ''
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }

  // CDN URL for R2 assets (video thumbnails, etc.)
  const getFileUrl = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const r2Domain = 'https://pub-1ee8b00ceed2443c917a8188cf6ed6a4.r2.dev'
    return `${r2Domain}/${path}`
  }

  // ─── File selection ───────────────────────────────────────────────────────────
  const clearSelectedFile = () => {
    selectedFile.value = null
    selectedFilePreview.value = null
    if (fileInput.value) fileInput.value.value = ''
    if (cameraInput.value) cameraInput.value.value = ''
    if (videoInput.value) videoInput.value.value = ''
    if (documentInput.value) documentInput.value.value = ''
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      event.target.value = ''
      return
    }
    selectedFile.value = file
    if (isImageFile(file)) {
      const reader = new FileReader()
      reader.onload = (e) => { selectedFilePreview.value = e.target.result }
      reader.readAsDataURL(file)
    } else {
      selectedFilePreview.value = URL.createObjectURL(file)
    }
    event.target.value = ''
  }

  const handleCameraCapture = (file) => {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => { selectedFilePreview.value = e.target.result }
    reader.readAsDataURL(file)
  }

  const openFilePicker = () => fileInput.value?.click()
  const openVideoPicker = () => videoInput.value?.click()
  const openDocumentPicker = () => documentInput.value?.click()

  // ─── Content parsers ──────────────────────────────────────────────────────────

  /**
   * Detect and parse video tutorial data from message content.
   * @param {string|object} content
   * @returns {Array|null}
   */
  const getVideoData = (content) => {
    if (!content) return null
    try {
      let raw = content
      if (typeof raw === 'object' && raw !== null && typeof raw.message === 'string') {
        raw = raw.message
      }
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].url) {
        return parsed
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Detect and parse invoice data from message content.
   * Expects a JSON object with at least `invoice_number` or `total`.
   * @param {string|object} content
   * @returns {object|null}
   */
  const getInvoiceData = (content) => {
    if (!content) return null
    try {
      let raw = content
      if (typeof raw === 'object' && raw !== null && typeof raw.message === 'string') {
        raw = raw.message
      }
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.invoice_number || parsed.total || parsed.total_amount || parsed.subtotal)) {
        // Return structured data for the card
        return {
          invoice_number: parsed.invoice_number || 'S/N',
          provider: parsed.provider || parsed.provider_name || parsed.vendor || parsed.company || 'Proveedor Desconocido',
          date: parsed.date || new Date().toLocaleDateString(),
          total: parsed.total || parsed.total_amount || parsed.subtotal || 0,
          tax: parsed.tax || parsed.tax_amount || 0,
          currency: parsed.currency || '$',
          items: parsed.items || []
        }
      }
      return null
    } catch {
      return null
    }
  }

  // ─── Mock-purchase chat helpers ───────────────────────────────────────────────
  const MOCK_PURCHASE_KEY = 'mock_purchase_chat'

  const getMockPurchaseChat = () => {
    const stored = localStorage.getItem(MOCK_PURCHASE_KEY)
    if (stored) return JSON.parse(stored)

    return {
      id: 'mock-purchase',
      type: 'purchase',
      subject: 'Cargar Compra con IA',
      icon: 'receipt_long',
      avatarClass: 'bg-orange',
      description: 'Sube tu factura y automatiza',
      messages: [
        {
          id: 'welcome-msg',
          content: '¡Hola! Soy tu asistente de compras. Sube una foto de tu factura para procesarla automáticamente.',
          sender_id: 'ia-system',
          created_at: new Date().toISOString()
        }
      ],
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Real API call to analyze an invoice image using IA.
   * @param {File} file
   * @returns {Promise<object>}
   */
  const analyzeInvoiceWithIA = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('branch_office_id', authStore.branchOffice?.id)

    const { data } = await api.post('purchases/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }

  const saveMockPurchaseMessage = async (message) => {
    const stored = localStorage.getItem(MOCK_PURCHASE_KEY)
    const chat = stored ? JSON.parse(stored) : getMockPurchaseChat()
    chat.messages.push(message)
    chat.updated_at = new Date().toISOString()
    localStorage.setItem(MOCK_PURCHASE_KEY, JSON.stringify(chat))

    // Real AI Analysis if user sends an image/file
    if (message.role === 'user' && (message.type === 'image' || message.type === 'file')) {
      try {
        const response = await analyzeInvoiceWithIA(message.file || message.attachment_file || selectedFile.value)

        const aiMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          sender_id: 'ia-system',
          content: JSON.stringify(response.data || response), // Show real data
          type: 'text',
          created_at: new Date().toISOString()
        }
        chat.messages.push(aiMsg)
        localStorage.setItem(MOCK_PURCHASE_KEY, JSON.stringify(chat))
        return aiMsg
      } catch (error) {
        console.error('Error in IA Analysis:', error)
        return {
          id: Date.now() + 1,
          role: 'assistant',
          sender_id: 'ia-system',
          content: 'Error al procesar la factura con IA. Por favor intenta de nuevo.',
          type: 'text',
          created_at: new Date().toISOString()
        }
      }
    }
    return null
  }

  const updateMockMessage = (messageId, newContent) => {
    const stored = localStorage.getItem(MOCK_PURCHASE_KEY)
    if (!stored) return null
    const chat = JSON.parse(stored)
    const msg = chat.messages.find(m => m.id === messageId)
    if (msg) {
      msg.content = typeof newContent === 'string' ? newContent : JSON.stringify(newContent)
      msg.updated_at = new Date().toISOString()
      localStorage.setItem(MOCK_PURCHASE_KEY, JSON.stringify(chat))
      return msg
    }
    return null
  }

  const deleteMockMessage = (messageId) => {
    const stored = localStorage.getItem(MOCK_PURCHASE_KEY)
    if (!stored) return false
    const chat = JSON.parse(stored)
    chat.messages = chat.messages.filter(m => m.id !== messageId)
    localStorage.setItem(MOCK_PURCHASE_KEY, JSON.stringify(chat))
    return true
  }

  const clearMockPurchaseChat = () => {
    localStorage.removeItem(MOCK_PURCHASE_KEY)
  }

  // ─── Message sending ──────────────────────────────────────────────────────────

  /**
   * Build an optimistic user message object for immediate display.
   */
  const buildLocalMessage = ({ messageText, fileToSend, filePreview }) => ({
    id: Date.now(),
    role: 'user',
    sender_id: authStore.userSession?.id,
    content: messageText,
    type: getMessageType(fileToSend),
    attachment_url: filePreview,
    attachment_name: fileToSend?.name,
    attachment_mime: fileToSend?.type,
    file: fileToSend, // Keep original file for IA processing
    created_at: new Date().toISOString()
  })

  /**
   * Send a support chat message via the API (for real chats).
   * @param {string} chatId - The real chat ID.
   * @param {string} messageText
   * @param {File|null} fileToSend
   * @param {string} messageType - 'image' | 'video' | 'file' | 'text'
   * @returns {Promise<object>} Response data
   */
  const sendChatMessage = async (chatId, messageText, fileToSend, messageType) => {
    const formData = new FormData()
    if (messageText) formData.append('message', messageText)
    if (fileToSend) {
      formData.append('attachment', fileToSend)
      formData.append('type', messageType)
    }
    formData.append('branch_office_id', authStore.branchOffice?.id)

    const { data } = await api.post(`support-chats/${chatId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }

  /**
   * Send an audio message via the API.
   * @param {string} chatId
   * @param {Blob} audioBlob
   * @returns {Promise<object>} Response data
   */
  const sendAudioChatMessage = async (chatId, audioBlob) => {
    const formData = new FormData()
    formData.append('attachment', audioBlob, 'audio.webm')
    formData.append('type', 'audio')
    formData.append('branch_office_id', authStore.branchOffice?.id)

    const { data } = await api.post(`support-chats/${chatId}/messages`, formData)
    return data
  }

  // ─── Text formatting ──────────────────────────────────────────────────────────
  const formatMessageContent = (content) => {
    if (!content) return ''
    if (typeof content === 'string' && content.startsWith('[') && content.includes('"url"')) {
      return ''
    }
    return content.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" class="chat-link" style="color: #0084ff; text-decoration: none; font-weight: 500;">$1</a>'
    )
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '0.00'
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  return {
    // State
    selectedFile,
    selectedFilePreview,
    fileInput,
    cameraInput,
    videoInput,
    documentInput,

    // File type helpers
    isImageFile,
    isVideoFile,
    getFileIcon,
    getFileTypeIcon,
    getMessageType,

    // URL helpers
    getFullUrl,
    getFileUrl,

    // File selection
    clearSelectedFile,
    handleFileSelect,
    handleCameraCapture,
    openFilePicker,
    openVideoPicker,
    openDocumentPicker,

    // Content parsers
    getVideoData,
    getInvoiceData,

    // Mock-purchase
    getMockPurchaseChat,
    saveMockPurchaseMessage,
    updateMockMessage,
    deleteMockMessage,
    clearMockPurchaseChat,
    analyzeInvoiceWithIA,

    // Message building & sending
    buildLocalMessage,
    sendChatMessage,
    sendAudioChatMessage,

    // Text formatting
    formatMessageContent,
    formatFileSize,
    formatNumber
  }
}
