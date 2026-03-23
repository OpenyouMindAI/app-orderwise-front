<template>
  <q-card class="support-facebook-card shadow-2">
    <!-- Header -->
    <q-card-section class="card-header q-pa-md">
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="support-name q-pl-sm">{{ showUserSelection ? 'Seleccionar Usuario' : (isRoot ? 'Panel de Gestión' : 'Centro de Mensajes') }}</div>
        </div>
        <div class="row no-wrap items-center">
          <q-btn
            v-if="isRoot && showUserSelection"
            flat round dense
            icon="arrow_back"
            color="primary"
            size="sm"
            @click.stop="showUserSelection = false"
            class="q-mr-xs"
          >
            <q-tooltip>Volver</q-tooltip>
          </q-btn>
          <q-btn
            flat round dense
            icon="close"
            color="grey-7"
            size="sm"
            @click.stop="$emit('close')"
            class="close-btn"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- Admin Search & Filters -->
    <div v-if="isRoot" class="admin-search-filters q-px-md q-py-sm">
      <q-input
        v-model="searchQuery"
        dense
        outlined
        rounded
        :placeholder="showUserSelection ? 'Buscar persona...' : 'Buscar nombre o mensaje...'"
        class="search-input"
        clearable
      >
        <template v-slot:prepend>
          <q-icon name="search" size="20px" />
        </template>
      </q-input>

      <div v-if="!showUserSelection" class="row items-center no-wrap" style="gap: 8px;">
        <q-chip
          clickable
          :outline="statusFilter !== 'all'"
          :color="statusFilter === 'all' ? 'primary' : 'grey-7'"
          text-color="white"
          size="sm"
          class="q-ma-none"
          @click="statusFilter = 'all'"
        >
          Todos
        </q-chip>
        <q-chip
          clickable
          :outline="statusFilter !== 'open'"
          :color="statusFilter === 'open' ? 'positive' : 'grey-7'"
          text-color="white"
          size="sm"
          class="q-ma-none"
          @click="statusFilter = 'open'"
        >
          Abiertos
        </q-chip>
        <q-chip
          clickable
          :outline="statusFilter !== 'in_progress'"
          :color="statusFilter === 'in_progress' ? 'warning' : 'grey-7'"
          text-color="white"
          size="sm"
          class="q-ma-none"
          @click="statusFilter = 'in_progress'"
        >
          En Progreso
        </q-chip>
        <q-chip
          clickable
          :outline="statusFilter !== 'closed'"
          :color="statusFilter === 'closed' ? 'negative' : 'grey-7'"
          text-color="white"
          size="sm"
          class="q-ma-none"
          @click="statusFilter = 'closed'"
        >
          Cerrados
        </q-chip>
      </div>
    </div>
    <q-separator v-if="isRoot" />

    <!-- Chat List Container -->
    <div class="chats-main-container">
      <div class="chats-wrapper custom-scrollbar">
        <!-- User Selection View -->
        <template v-if="showUserSelection">
          <!-- Loading Users -->
          <div v-if="loadingUsers" class="text-center q-pa-lg">
            <q-spinner color="primary" size="32px" />
          </div>

          <!-- Empty Users State -->
          <div v-else-if="filteredUsers.length === 0" class="empty-state q-pa-xl text-center">
            <q-icon name="person_search" size="48px" color="grey-4" />
            <div class="text-h6 text-grey-9 q-mt-md">Sin usuarios</div>
            <div class="text-body2 text-grey-6 q-mt-xs">No se encontraron personas que coincidan.</div>
          </div>

          <!-- Users List -->
          <div v-else class="chat-items-list q-py-sm">
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="chat-row"
              @click="onUserClick(user)"
            >
              <div class="chat-row-avatar-container">
                <q-avatar size="42px" class="chat-row-avatar shadow-1">
                  <img v-if="user.avatar" :src="user.avatar" @error="user.avatar = null" />
                  <div v-else class="avatar-fallback bg-primary text-white">
                    {{ getInitials(user.name) }}
                  </div>
                </q-avatar>
                <div class="status-indicator" :class="{ 'online': user.status === 'online' }"></div>
              </div>

              <div class="col overflow-hidden">
                <div class="chat-row-title text-weight-bold text-no-wrap ellipsis">
                  {{ user.name }}
                </div>
                <div class="chat-row-subtitle text-grey-7 text-caption text-no-wrap ellipsis">
                   {{ user.company || user.email || 'Usuario' }}
                </div>
              </div>
            </div>
          </div>
        </template>

          <!-- Chat items (Unified Channels) -->
          <div v-else class="chat-items-list q-py-sm">
            <div
              v-for="chat in displayChannels"
              :key="chat.type"
              class="chat-row"
              :class="{ 'unread': chat.unread_count > 0 }"
              @click="handleChannelClick(chat)"
            >
              <div class="chat-row-avatar-container">
                <q-avatar size="42px" class="chat-row-avatar shadow-1" :class="chat.avatarClass">
                  <q-icon :name="chat.icon" size="22px" color="white" />
                </q-avatar>
                <div v-if="chat.unread_count > 0" class="unread-dot"></div>
              </div>

              <div class="col overflow-hidden" style="min-width: 0;">
                <div class="chat-row-title text-weight-bold text-no-wrap ellipsis">
                  {{ chat.subject }}
                </div>
                <div class="chat-row-subtitle text-grey-7 text-caption text-no-wrap ellipsis">
                  {{ chat.last_message?.content || chat.description }}
                </div>
              </div>

              <div class="column items-end">
                <q-badge
                  v-if="chat.unread_count > 0"
                  color="primary"
                  :label="chat.unread_count"
                  class="q-mb-xs"
                />
                <div v-if="chat.id" class="text-caption text-grey-5">
                  {{ formatDate(chat.last_message_at || chat.updated_at) }}
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>

    <!-- Footer CTA -->
    <q-separator />
    <q-card-section class="q-pa-sm text-center">
      <q-btn
        flat
        no-caps
        dense
        color="primary"
        label="Abrir chat completo"
        icon="open_in_new"
        size="sm"
        class="full-width"
        @click.stop="onOpenFull"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'
import { useRouter } from 'vue-router'

const emit = defineEmits(['chat-click', 'new-chat', 'close'])

const router = useRouter()
const authStore = authentication()

const chats = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')

const showUserSelection = ref(false)
const sessionUsers = ref([])
const loadingUsers = ref(false)

const isRoot = computed(() => !!authStore.userSession?.is_root)

/**
 * Handle Purchase Mock Chat
 */
const getPurchaseMock = () => {
  const stored = localStorage.getItem('mock_purchase_chat')
  if (stored) return JSON.parse(stored)

  // Default initial mock state
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

const filteredUsers = computed(() => {
  const map = new Map()
  sessionUsers.value.forEach(session => {
    const userId = session.user_id || session.user?.id
    if (!userId) return
    const existing = map.get(userId)
    if (!existing || session.status === 'online') {
      map.set(userId, {
        id: userId,
        name: session.user?.name || 'Usuario',
        email: session.user?.email || '',
        avatar: session.user?.avatar || null,
        company: session.company?.name || '',
        status: session.status
      })
    }
  })
  const unique = Array.from(map.values())

  if (!searchQuery.value) return unique
  const q = searchQuery.value.toLowerCase()
  return unique.filter(u =>
    u.name?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    u.company?.toLowerCase().includes(q)
  )
})

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const loadChats = async () => {
  loading.value = true
  try {
    const params = {
      is_root: isRoot.value ? 1 : 0
    }
    const { data } = await api.get('support-chats', { params })
    chats.value = data.data || data || []
  } catch (e) {
    console.error('Error loading chats for card:', e)
  } finally {
    loading.value = false
  }
}

const onChatClick = (chat) => {
  emit('chat-click', chat)
}

/**
 * Display channels logic
 */
const displayChannels = computed(() => {
  const types = [
    { type: 'ai', subject: 'Asistente IA', icon: 'auto_awesome', avatarClass: 'palma-avatar', description: 'Resuelve tus dudas con IA' },
    { type: 'support', subject: 'Soporte Técnico', icon: 'headset_mic', avatarClass: 'bg-primary', description: 'Chatea con nuestro equipo' },
    { type: 'purchase', subject: 'Cargar Compra con IA', icon: 'receipt_long', avatarClass: 'bg-orange', description: 'Sube tu factura y automatiza' }
  ]

  const mockPurchase = getPurchaseMock()

  return types.map(config => {
    let base = {}
    if (config.type === 'purchase') {
      base = chats.value.find(c => c.type === 'purchase') || mockPurchase
    } else {
      base = chats.value.find(c => c.type === config.type) || {}
    }

    return {
      ...base,
      ...config, // UI Config always stays
      unread_count: base.unread_count || 0
    }
  })
})

const handleChannelClick = async (channel) => {
  if (channel.id === 'mock-purchase') {
    onChatClick(channel)
    return
  }

  if (channel.id) {
    onChatClick(channel)
  } else {
    loading.value = true
    try {
      const { data } = await api.post('support-chats', {
        subject: channel.subject,
        type: channel.type,
        priority: 'medium',
        message: 'Hola, me gustaría iniciar una conversación.'
      })
      const newChat = data.raw_data || data.data || data
      chats.value.push(newChat)
      onChatClick(newChat)
    } catch (e) {
      console.error('Error opening channel:', e)
    } finally {
      loading.value = false
    }
  }
}

const onOpenFull = () => {
  router.push('/support')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

onMounted(() => {
  loadChats()
})
</script>

<style scoped lang="scss">
.support-facebook-card {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: white;
}

.palma-avatar {
  background: linear-gradient(135deg, #0084ff, #00c6ff);
  box-shadow: 0 2px 8px rgba(0, 132, 255, 0.3);
  position: relative;
}

.avatar-container {
  position: relative;
}

.admin-search-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fafafa;
  border-bottom: 1px solid rgba(0,0,0,0.03);

  :deep(.q-field--outlined .q-field__control) {
    background: white;
  }
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
  background-color: #bcc0c4;

  &.online {
    background-color: #31a24c;
  }
}

.support-name {
  font-size: 15px;
  font-weight: 700;
  color: #18181b;
  letter-spacing: -0.2px;
}

.support-status {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 11px;
  color: #71717a;
  font-weight: 500;
}

.new-chat-btn {
  color: #0084ff;
}

/* Chat list */
.chats-main-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: white;
}

.chats-wrapper {
  flex: 1;
  overflow-y: auto;
}

.custom-scrollbar {
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

.chats-wrapper :deep(.q-scrollarea__content) {
  width: 100%;
}

.chat-items-list {
  border-top: none;
}

.chat-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f0f0f0;

  &.is-last {
    border-bottom: none;
  }

  &:hover {
    background: #f7f9ff;
  }

  &:active {
    background: #eef2ff;
  }
}

.chat-row-avatar {
  background: #f0f4ff;
  flex-shrink: 0;
}

.chat-row-title {
  font-size: 14px;
  color: #18181b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-row-subtitle {
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded-pill {
  border-radius: 20px;
}

.palma-avatar {
  background: linear-gradient(135deg, #0084ff, #00c6ff) !important;
  box-shadow: 0 2px 8px rgba(0, 132, 255, 0.3);
  border: none !important;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.chat-row-avatar-container {
  position: relative;
  flex-shrink: 0;
}

.unread-dot {
  position: absolute;
  top: 0;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #1976d2;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 2;
}

.list-stagger-enter-active {
  transition: all 0.3s ease-out;
}
.list-stagger-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.chat-row.unread {
  background: rgba(25, 118, 210, 0.02);
  .chat-row-title {
    color: #1a73e8;
  }
}

.empty-state {
  height: 100%;
}

/* Dark mode */
.body--dark {
  .support-facebook-card {
    background: #242526;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-header,
  .chats-wrapper {
    background: #242526;
  }

  .support-name,
  .chat-row-title {
    color: #e4e6eb;
  }

  .status-text {
    color: #b0b3b8;
  }

  .chat-row {
    border-color: rgba(255, 255, 255, 0.05);

    &:hover {
      background: #3a3b3c;
    }
  }

  .chat-row-avatar {
    background: #3a3b3c;
    border-color: #4a4b4c;
  }
}
</style>
