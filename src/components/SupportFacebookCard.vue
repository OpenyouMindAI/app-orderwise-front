<template>
  <q-card class="support-facebook-card shadow-2">
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
          <div class="support-name">Lista de chats</div>
          <div class="support-status">
            <q-icon name="circle" size="8px" color="green-5" class="q-ml-none q-mr-xs" />
            <span class="status-text">Disponible ahora</span>
          </div>
        </div>
        <div class="row no-wrap items-center">
          <q-btn
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

    <!-- Chat List Container -->
    <div class="chats-main-container">
      <div class="chats-wrapper custom-scrollbar">
        <!-- Loading -->
        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="32px" />
        </div>

        <!-- Empty state -->
        <div v-else-if="chats.length === 0" class="empty-state q-pa-xl text-center" @click="onNewChat">
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

        <!-- Chat items -->
        <div v-else class="chat-items-list q-py-sm">
          <div
            v-for="(chat, index) in chats"
            :key="chat.id"
            class="chat-row"
            :class="{ 'is-last': index === chats.length - 1 }"
            @click="onChatClick(chat)"
          >
            <q-avatar size="42px" class="chat-row-avatar">
              <q-icon name="auto_awesome" size="20px" color="primary" />
            </q-avatar>
            <div class="col overflow-hidden" style="min-width: 0;">
              <div class="chat-row-title text-weight-bold text-no-wrap ellipsis">
                {{ chat.title || chat.subject || 'Conversación' }}
              </div>
              <div class="chat-row-subtitle text-grey-7 text-caption text-no-wrap ellipsis">
                {{ chat.last_message?.content || 'Ver conversación' }}
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
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'
import { useRouter } from 'vue-router'

const emit = defineEmits(['chat-click', 'new-chat', 'close'])

const router = useRouter()
const authStore = authentication()

const chats = ref([])
const loading = ref(false)

const loadChats = async () => {
  loading.value = true
  try {
    const { data } = await api.get('ai-chats', {
      params: { company_id: authStore.userSession?.company_session?.id }
    })
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

const onNewChat = () => {
  emit('new-chat')
}

const onOpenFull = () => {
  router.push('/ai-chat')
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
  font-size: 12px;
  color: #65676b;
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

.empty-state {
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f7f9ff;
  }
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
