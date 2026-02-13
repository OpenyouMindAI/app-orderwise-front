<template>
  <q-dialog v-model="show" position="right" full-height>
    <q-card class="online-users-drawer">
      <q-bar class="drawer-header bg-primary text-white">
        <q-icon name="people" />
        <span class="q-ml-sm text-weight-medium">Usuarios Online</span>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>

      <div class="drawer-content">
        <!-- Search and Filters -->
        <div class="q-pa-md">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="Buscar usuarios..."
            clearable
            @update:model-value="debouncedSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <div class="row q-mt-sm q-gutter-sm">
            <q-btn
              :outline="statusFilter !== 'all'"
              :unelevated="statusFilter === 'all'"
              color="primary"
              label="Todos"
              size="sm"
              @click="statusFilter = 'all'"
            />
            <q-btn
              :outline="statusFilter !== 'online'"
              :unelevated="statusFilter === 'online'"
              color="positive"
              label="En línea"
              size="sm"
              @click="statusFilter = 'online'"
            />
            <q-btn
              :outline="statusFilter !== 'offline'"
              :unelevated="statusFilter === 'offline'"
              color="grey"
              label="Desconectados"
              size="sm"
              @click="statusFilter = 'offline'"
            />
          </div>

          <!-- Summary -->
          <div class="summary-cards q-mt-md">
            <div class="summary-card">
              <div class="summary-value text-positive">{{ summary.online }}</div>
              <div class="summary-label">En línea</div>
            </div>
            <div class="summary-card">
              <div class="summary-value text-grey">{{ summary.offline }}</div>
              <div class="summary-label">Offline</div>
            </div>
            <div class="summary-card">
              <div class="summary-value text-primary">{{ summary.total }}</div>
              <div class="summary-label">Total</div>
            </div>
          </div>
        </div>

        <!-- Users List -->
        <q-scroll-area class="users-list-area">
          <div v-if="loading" class="text-center q-pa-md">
            <q-spinner color="primary" size="40px" />
          </div>

          <div v-else-if="filteredUsers.length === 0" class="empty-state q-pa-md text-center">
            <q-icon name="people_outline" size="64px" color="grey-5" />
            <div class="text-grey-7 q-mt-md">No se encontraron usuarios</div>
          </div>

          <div v-else class="users-list q-pa-md">
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="user-item"
              :class="{ selected: selectedUsers.includes(user.id) }"
              @click="toggleUserSelection(user.id)"
            >
              <q-checkbox
                :model-value="selectedUsers.includes(user.id)"
                @update:model-value="toggleUserSelection(user.id)"
                class="user-checkbox"
              />
              <q-avatar size="40px" class="user-avatar">
                <img v-if="user.avatar" :src="user.avatar" />
                <span v-else>{{ getInitials(user.name) }}</span>
                <div class="status-indicator" :class="user.is_online ? 'online' : 'offline'"></div>
              </q-avatar>
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email text-caption text-grey-7">{{ user.email }}</div>
                <div v-if="user.company_session" class="user-company text-caption text-grey-6">
                  <q-icon name="business" size="12px" />
                  {{ user.company_session.name }}
                </div>
              </div>
              <div class="user-status">
                <q-chip
                  :color="user.is_online ? 'positive' : 'grey'"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ user.is_online ? 'Online' : 'Offline' }}
                </q-chip>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </div>

      <!-- Actions Footer -->
      <q-card-actions class="drawer-actions bg-grey-2">
        <div class="selected-count">
          <q-icon name="check_circle" color="primary" />
          <span class="q-ml-xs">{{ selectedUsers.length }} seleccionados</span>
        </div>
        <q-space />
        <q-btn
          flat
          label="Deseleccionar"
          @click="selectedUsers = []"
          :disable="selectedUsers.length === 0"
        />
        <q-btn
          unelevated
          color="primary"
          label="Enviar Mensaje"
          icon="send"
          @click="openBroadcastDialog"
          :disable="selectedUsers.length === 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Broadcast Message Dialog -->
  <q-dialog v-model="showBroadcastDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Enviar Mensaje Masivo</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-body2 text-grey-7 q-mb-md">
          Enviarás este mensaje a {{ selectedUsers.length }} usuario(s)
        </div>

        <q-input
          v-model="broadcastForm.subject"
          label="Asunto *"
          outlined
          dense
          :rules="[val => !!val || 'El asunto es requerido']"
        />

        <q-input
          v-model="broadcastForm.message"
          label="Mensaje *"
          type="textarea"
          outlined
          rows="5"
          class="q-mt-md"
          :rules="[val => !!val || 'El mensaje es requerido']"
        />

        <q-select
          v-model="broadcastForm.priority"
          :options="priorityOptions"
          label="Prioridad"
          outlined
          dense
          emit-value
          map-options
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          unelevated
          color="primary"
          label="Enviar"
          icon="send"
          @click="sendBroadcastMessage"
          :loading="sending"
          :disable="!broadcastForm.subject || !broadcastForm.message"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

/**
 * Props
 */
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

/**
 * Emits
 */
const emit = defineEmits(['update:modelValue'])

/**
 * Quasar instance
 * @type {object}
 */
const $q = useQuasar()

/**
 * Show dialog
 * @type {import('vue').Ref<boolean>}
 */
const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

/**
 * Users list
 * @type {import('vue').Ref<Array>}
 */
const users = ref([])

/**
 * Selected users
 * @type {import('vue').Ref<Array<number>>}
 */
const selectedUsers = ref([])

/**
 * Search query
 * @type {import('vue').Ref<string>}
 */
const search = ref('')

/**
 * Status filter
 * @type {import('vue').Ref<string>}
 */
const statusFilter = ref('all')

/**
 * Loading state
 * @type {import('vue').Ref<boolean>}
 */
const loading = ref(false)

/**
 * Sending state
 * @type {import('vue').Ref<boolean>}
 */
const sending = ref(false)

/**
 * Summary data
 * @type {import('vue').Ref<object>}
 */
const summary = ref({
  total: 0,
  online: 0,
  offline: 0
})

/**
 * Show broadcast dialog
 * @type {import('vue').Ref<boolean>}
 */
const showBroadcastDialog = ref(false)

/**
 * Broadcast form
 * @type {import('vue').Ref<object>}
 */
const broadcastForm = ref({
  subject: '',
  message: '',
  priority: 'medium'
})

/**
 * Priority options
 * @type {Array}
 */
const priorityOptions = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Urgente', value: 'urgent' }
]

/**
 * Filtered users
 * @type {import('vue').ComputedRef<Array>}
 */
const filteredUsers = computed(() => {
  return users.value
})

let searchTimeout = null

/**
 * Debounced search
 * @returns {void}
 */
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchUsers()
  }, 300)
}

/**
 * Fetch users
 * @returns {Promise<void>}
 */
const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await api.get('broadcast-messages/online-users', {
      params: {
        search: search.value,
        status: statusFilter.value
      }
    })
    users.value = data.users || []
    summary.value = data.summary || { total: 0, online: 0, offline: 0 }
  } catch (error) {
    console.error('Error fetching users:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar usuarios'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Toggle user selection
 * @param {number} userId - User ID
 * @returns {void}
 */
const toggleUserSelection = (userId) => {
  const index = selectedUsers.value.indexOf(userId)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(userId)
  }
}

/**
 * Get initials from name
 * @param {string} name - User name
 * @returns {string}
 */
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

/**
 * Open broadcast dialog
 * @returns {void}
 */
const openBroadcastDialog = () => {
  broadcastForm.value = {
    subject: '',
    message: '',
    priority: 'medium'
  }
  showBroadcastDialog.value = true
}

/**
 * Send broadcast message
 * @returns {Promise<void>}
 */
const sendBroadcastMessage = async () => {
  if (!broadcastForm.value.subject || !broadcastForm.value.message) {
    $q.notify({
      type: 'warning',
      message: 'Complete todos los campos requeridos'
    })
    return
  }

  sending.value = true
  try {
    const { data } = await api.post('broadcast-messages/send', {
      user_ids: selectedUsers.value,
      subject: broadcastForm.value.subject,
      message: broadcastForm.value.message,
      priority: broadcastForm.value.priority
    })

    $q.notify({
      type: 'positive',
      message: `Mensaje enviado a ${data.success_count} usuario(s)`,
      caption: data.error_count > 0 ? `${data.error_count} errores` : undefined
    })

    showBroadcastDialog.value = false
    selectedUsers.value = []
    broadcastForm.value = {
      subject: '',
      message: '',
      priority: 'medium'
    }
  } catch (error) {
    console.error('Error sending broadcast:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar mensajes'
    })
  } finally {
    sending.value = false
  }
}

// Watch for dialog open
watch(show, (newVal) => {
  if (newVal) {
    fetchUsers()
  }
})

// Watch for status filter changes
watch(statusFilter, () => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.online-users-drawer {
  width: 500px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  padding: 12px 16px;
}

.drawer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
}

.summary-label {
  font-size: 12px;
  color: #757575;
  margin-top: 4px;
}

.users-list-area {
  flex: 1;
  height: 100%;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    border-color: #e0e0e0;
  }

  &.selected {
    background: #e3f2fd;
    border-color: #1976d2;
  }
}

.user-checkbox {
  flex-shrink: 0;
}

.user-avatar {
  position: relative;
  flex-shrink: 0;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;

  &.online {
    background: #4caf50;
  }

  &.offline {
    background: #9e9e9e;
  }
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-company {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-status {
  flex-shrink: 0;
}

.drawer-actions {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.selected-count {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
