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
            v-if="!showUserSelection"
            flat round dense
            icon="add_comment"
            color="primary"
            size="sm"
            @click.stop="onNewChat"
            class="new-chat-btn q-mr-xs"
          >
            <q-tooltip>Nueva conversación</q-tooltip>
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

        <!-- Normal Chat List View -->
        <template v-else>
          <!-- Loading -->
          <div v-if="loading" class="text-center q-pa-lg">
            <q-spinner color="primary" size="32px" />
          </div>

          <!-- Empty state: usuario final sin chats -->
          <div v-else-if="filteredChats.length === 0 && !searchQuery && statusFilter === 'all' && !isRoot" class="empty-state q-pa-xl text-center" @click="onNewChat">
            <q-icon name="chat_bubble_outline" size="48px" color="grey-3" />
            <div class="text-h6 text-grey-9 q-mt-md">¡Hola!</div>
            <div class="text-body2 text-grey-6 q-mt-xs">Habla con Palma para resolver tus dudas.</div>
            <q-btn
              unelevated
              color="primary"
              label="Empezar a chatear"
              icon="send"
              class="q-mt-lg rounded-pill"
              @click.stop="onNewChat"
            />
          </div>

          <!-- Empty state: Admin sin chats -->
          <div v-else-if="filteredChats.length === 0 && !searchQuery && statusFilter === 'all' && isRoot" class="empty-state q-pa-xl text-center">
            <q-icon name="forum" size="48px" color="grey-3" />
            <div class="text-h6 text-grey-9 q-mt-md">Bandeja vacía</div>
            <div class="text-body2 text-grey-6 q-mt-xs">Selecciona un usuario para iniciar una conversación.</div>
            <q-btn
              unelevated
              color="primary"
              label="Iniciar conversación"
              icon="add"
              class="q-mt-lg rounded-pill"
              @click.stop="onNewChat"
            />
          </div>

          <!-- Empty state: filtro por estado activo sin resultados (admin) -->
          <div v-else-if="filteredChats.length === 0 && statusFilter !== 'all' && !searchQuery" class="empty-state q-pa-xl text-center">
            <q-icon name="inbox" size="48px" color="grey-4" />
            <div class="text-h6 text-grey-9 q-mt-md">Sin chats</div>
            <div class="text-body2 text-grey-6 q-mt-xs">
              No hay chats con estado
              <strong>{{ { open: 'Abierto', in_progress: 'En Progreso', closed: 'Cerrado' }[statusFilter] }}</strong>
              en este momento.
            </div>
            <q-btn flat color="primary" label="Ver todos" size="sm" class="q-mt-md" @click="statusFilter = 'all'" />
          </div>

          <!-- Empty state: búsqueda sin resultados -->
          <div v-else-if="filteredChats.length === 0 && searchQuery" class="empty-state q-pa-xl text-center">
            <q-icon name="search_off" size="48px" color="grey-4" />
            <div class="text-h6 text-grey-9 q-mt-md">Sin resultados</div>
            <div class="text-body2 text-grey-6 q-mt-xs">No se encontraron chats que coincidan con la búsqueda.</div>
          </div>

          <!-- Chat items -->
          <transition-group v-else name="list-stagger" tag="div" class="chat-items-list q-py-sm">
            <div
              v-for="(chat, index) in filteredChats"
              :key="chat.id"
              class="chat-row"
              :class="{ 'is-last': index === filteredChats.length - 1, 'unread': chat.unread_count > 0 }"
              @click="onChatClick(chat)"
            >
              <div class="chat-row-avatar-container">
                <q-avatar size="42px" class="chat-row-avatar shadow-1" :class="{ 'palma-avatar': !isRoot }">
                  <template v-if="isRoot">
                    <template v-if="getAvatarUrl(chat)">
                      <img :src="getAvatarUrl(chat)" @error="handleAvatarError(chat)" />
                    </template>
                    <div v-else class="avatar-fallback bg-primary text-white">
                      {{ getInitials(getChatName(chat)) }}
                    </div>
                  </template>
                  <q-icon v-else name="auto_awesome" size="20px" color="white" />
                </q-avatar>
                <div v-if="chat.unread_count > 0" class="unread-dot"></div>
              </div>

              <div class="col overflow-hidden" style="min-width: 0;">
                <div class="chat-row-title text-weight-bold text-no-wrap ellipsis">
                  {{ getChatName(chat) }}
                </div>
                <div class="chat-row-subtitle text-grey-7 text-caption text-no-wrap ellipsis">
                  <span v-if="chat.last_message?.sender_id === authStore.userSession?.id" class="text-primary text-weight-medium">Tú: </span>
                  {{ formatLastMessage(chat.last_message?.content) }}
                </div>
              </div>

              <div class="column items-end">
                <q-badge
                  v-if="chat.unread_count > 0"
                  color="primary"
                  :label="chat.unread_count"
                  class="q-mb-xs"
                />
                <div class="text-caption text-grey-5">{{ formatDate(chat.last_message_at || chat.updated_at) }}</div>
              </div>
            </div>
          </transition-group>
        </template>
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

const filteredChats = computed(() => {
  return chats.value.filter(chat => {
    // Filtrar por estado
    if (statusFilter.value !== 'all') {
      // Ignorar filter si chat.status no coincide (o consider open por defecto si no tiene status)
      const chatStatus = chat.status || 'open'
      if (chatStatus !== statusFilter.value) return false
    }

    // Filtrar por texto
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const chatName = getChatName(chat).toLowerCase()
      const lastMsg = formatLastMessage(chat.last_message?.content).toLowerCase()
      return chatName.includes(q) || lastMsg.includes(q)
    }

    return true
  })
})

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const getChatName = (chat) => {
  if (isRoot.value) {
    return chat.client?.name || chat.users?.find(u => u.id !== authStore.userSession?.id)?.name || 'Cliente'
  }
  return chat.title || chat.subject || 'Soporte Palma'
}

const getAvatarUrl = (chat) => {
  if (isRoot.value) {
    return chat.client?.avatar || chat.users?.find(u => u.id !== authStore.userSession?.id)?.avatar
  }
  return null // O un avatar de AI si no es root
}

const handleAvatarError = (chat) => {
  if (isRoot.value) {
    const partner = chat.client || chat.users?.find(u => u.id !== authStore.userSession?.id)
    if (partner) partner.avatar = null
  }
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

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const { data } = await api.get('user-sessions', {
      params: {
        status: 'all',
        per_page: 100
      }
    })
    sessionUsers.value = data.data || []
  } catch (e) {
    console.error('Error loading users for card:', e)
  } finally {
    loadingUsers.value = false
  }
}

const onChatClick = (chat) => {
  emit('chat-click', chat)
}

const onNewChat = () => {
  if (isRoot.value) {
    showUserSelection.value = true
    loadUsers()
  } else {
    emit('new-chat')
  }
}

const onUserClick = async (user) => {
  loading.value = true
  try {
    const { data } = await api.post('support-chats/open-direct', { user_id: user.id })
    showUserSelection.value = false
    emit('chat-click', data.chat)
  } catch (e) {
    console.error('Error opening direct chat from card:', e)
  } finally {
    loading.value = false
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

const formatLastMessage = (content) => {
  if (!content) return 'Ver conversación'
  try {
    let raw = content
    // Handle nested message property from n8n/other sources
    if (typeof raw === 'object' && raw !== null && raw.message) {
      raw = raw.message
    }

    if (typeof raw === 'string' && (raw.trim().startsWith('[') || raw.trim().startsWith('{'))) {
      const parsed = JSON.parse(raw)
      const data = Array.isArray(parsed) ? parsed[0] : (parsed.message ? JSON.parse(parsed.message)[0] : parsed)

      if (data && (data.message || data.title)) {
        return data.message || data.title
      }
    }
    return typeof raw === 'string' ? raw : 'Ver conversación'
  } catch (e) {
    return content
  }
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
  border: 1.5px solid #dde4ff;
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
