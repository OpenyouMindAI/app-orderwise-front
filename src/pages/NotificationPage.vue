<template>
    <div class="notification-container">
      <div class="filters-section">
        <div class="search-container">
          <q-input
            v-model="search"
            dense
            placeholder="Buscar mensaje, tipo, excepción..."
            debounce="300"
            clearable
            filled
            @update:model-value="handleSearchChange"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="filter-chips">
          <q-btn-toggle
            v-model="typeFilter"
            toggle-color="primary"
            :options="typeToggleOptions"
            @update:model-value="handleTypeFilterChange"
            class="type-toggle"
            clearable
          />

        </div>

        <div class="actions-container">
          <q-btn
            dense
            color="primary"
            icon="refresh"
            label="Actualizar"
            @click="handleRefresh"
            class="refresh-btn"
          />
        </div>
      </div>

      <div class="notifications-list">
        <div v-if="filteredItems.length === 0" class="empty-state">
          <q-icon name="notifications_none" size="4rem" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-md">No hay notificaciones</div>
          <div class="text-body2 text-grey-5">No se encontraron notificaciones con los filtros aplicados</div>
        </div>

        <div v-for="notification in filteredItems" :key="notification.id" class="notification-card">
          <q-card flat class="modern-card" @click="handleNotificationClick(notification)">
            <q-card-section class="notification-header">
              <div class="notification-icon">
                <q-avatar
                  :color="getErrorColor(notification)"
                  text-color="white"
                  :icon="getErrorIcon(notification)"
                  size="48px"
                />
              </div>

              <div class="notification-content">
                <div class="notification-title">
                  {{ notification.data?.error_type || 'GENERAL_ERROR' }}
                </div>
                <div class="notification-exception">
                  {{ notification.data?.exception }}
                </div>
                <div class="notification-message">
                  {{ notification.data?.message }}
                </div>

                <div class="notification-meta">
                  <q-chip
                    dense
                    :icon="getMethodIcon(notification.data?.request_data?.method)"
                    :label="notification.data?.request_data?.method || 'N/A'"
                    :color="getMethodColor(notification.data?.request_data?.method)"
                    text-color="white"
                    class="meta-chip"
                  />
                  <q-chip
                    dense
                    icon="schedule"
                    :label="formatDate(notification.created_at)"
                    color="grey-6"
                    text-color="white"
                    class="meta-chip"
                  />
                </div>
              </div>

              <div class="notification-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="chevron_right"
                  color="primary"
                  size="md"
                />
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions class="card-actions">
              <q-btn
                flat
                dense
                icon="link"
                label="URL"
                :disable="!notification.data?.request_data?.url"
                :href="notification.data?.request_data?.url"
                target="_blank"
                color="primary"
                size="sm"
              />
              <q-btn
                flat
                dense
                icon="image"
                label="Snapshot"
                :disable="!notification.data?.snapshot_url"
                :href="notification.data?.snapshot_url"
                target="_blank"
                color="primary"
                size="sm"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <q-drawer
        v-model="drawer"
        side="right"
        overlay
        elevated
        :width="$q.screen.lt.md ? $q.screen.width : 600"
        class="notification-drawer"
      >
        <q-toolbar class="drawer-toolbar">
          <q-avatar
            :color="getErrorColor(selected)"
            text-color="white"
            :icon="getErrorIcon(selected)"
            size="32px"
            class="q-mr-sm"
          />
          <q-toolbar-title class="drawer-title">
            Notificación #{{ selected?.id }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="handleCloseDrawer" color="primary" />
        </q-toolbar>

        <q-separator />

        <div class="drawer-content">
          <!-- Resumen mejorado -->
          <q-card flat class="detail-card">
            <q-card-section>
              <div class="detail-header">
                <q-icon name="info" color="primary" size="20px" />
                <span class="detail-title">Resumen</span>
              </div>
              <div class="detail-content">
                <div class="detail-item">
                  <span class="detail-label">Tipo:</span>
                  <q-chip
                    :color="getErrorColor(selected)"
                    text-color="white"
                    :label="selected?.data?.error_type"
                    dense
                  />
                </div>
                <div class="detail-item">
                  <span class="detail-label">Excepción:</span>
                  <span class="detail-value">{{ selected?.data?.exception }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Mensaje:</span>
                  <span class="detail-value">{{ selected?.data?.message }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Archivo:</span>
                  <span class="detail-value">{{ selected?.data?.file }}:{{ selected?.data?.line }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fecha:</span>
                  <span class="detail-value">{{ formatDate(selected?.created_at) }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Request data mejorado -->
          <q-card flat class="detail-card">
            <q-card-section>
              <div class="detail-header">
                <q-icon name="http" color="primary" size="20px" />
                <span class="detail-title">Request Data</span>
                <q-space />
                <q-btn
                  dense
                  flat
                  icon="content_copy"
                  @click="handleCopyJson(selected?.data?.request_data)"
                  color="primary"
                  size="sm"
                />
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="code-section">
              <pre class="code-block">{{ formatJson(selected?.data?.request_data) }}</pre>
            </q-card-section>
          </q-card>

          <!-- Trace mejorado -->
          <q-card flat class="detail-card">
            <q-card-section>
              <div class="detail-header">
                <q-icon name="bug_report" color="primary" size="20px" />
                <span class="detail-title">Stack Trace</span>
                <q-space />
                <q-btn
                  dense
                  flat
                  icon="content_copy"
                  @click="handleCopyText(selected?.data?.trace)"
                  color="primary"
                  size="sm"
                />
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="code-section">
              <pre class="code-block trace-block">{{ selected?.data?.trace }}</pre>
            </q-card-section>
          </q-card>

          <!-- Snapshot mejorado -->
          <q-card v-if="selected?.data?.snapshot_url" flat class="detail-card">
            <q-card-section>
              <div class="detail-header">
                <q-icon name="image" color="primary" size="20px" />
                <span class="detail-title">Snapshot</span>
              </div>
            </q-card-section>
            <q-img
              :src="selected?.data?.snapshot_url"
              ratio="16/9"
              spinner-color="primary"
              class="snapshot-image"
            />
            <q-card-actions align="right">
              <q-btn
                dense
                flat
                icon="open_in_new"
                label="Abrir imagen"
                :href="selected?.data?.snapshot_url"
                target="_blank"
                color="primary"
              />
            </q-card-actions>
          </q-card>
        </div>
      </q-drawer>
    </div>
  </template>

<script>
import { useQuasar } from 'quasar'
import { api } from 'src/boot/services'
import { defineComponent, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'NotificationPage',
  setup () {
    const $q = useQuasar()
    const items = ref([])
    const selected = ref(null)
    const drawer = ref(false)
    const search = ref('')
    const typeFilter = ref(null)
    const severityFilter = ref(null)
    const route = useRoute()
    const router = useRouter()

    watch(route, () => {
      if (route.query.id) {
        selected.value = items.value.find(item => item.id === route.query.id)
        drawer.value = true
      }
    })

    watch(drawer, () => {
      if (!drawer.value) {
        selected.value = null
        router.replace({ query: {} })
      }
    })

    const typeToggleOptions = [
      { label: 'Base de Datos', value: 'DATABASE_ERROR', icon: 'storage' },
      { label: 'Aplicación', value: 'APPLICATION_ERROR', icon: 'code' },
      { label: 'General', value: 'GENERAL_ERROR', icon: 'error' }
    ]

    const getErrorColor = (notification) => {
      const errorType = notification?.data?.error_type
      switch (errorType) {
        case 'DATABASE_ERROR': return 'red-7'
        case 'APPLICATION_ERROR': return 'orange-7'
        case 'GENERAL_ERROR': return 'blue-7'
        default: return 'grey-7'
      }
    }

    const getErrorIcon = (notification) => {
      const errorType = notification?.data?.error_type
      switch (errorType) {
        case 'DATABASE_ERROR': return 'storage'
        case 'APPLICATION_ERROR': return 'code'
        case 'GENERAL_ERROR': return 'error'
        default: return 'warning'
      }
    }

    const getMethodIcon = (method) => {
      switch (method?.toUpperCase()) {
        case 'GET': return 'download'
        case 'POST': return 'upload'
        case 'PUT': return 'edit'
        case 'DELETE': return 'delete'
        case 'PATCH': return 'build'
        default: return 'http'
      }
    }

    const getMethodColor = (method) => {
      switch (method?.toUpperCase()) {
        case 'GET': return 'green-6'
        case 'POST': return 'blue-6'
        case 'PUT': return 'orange-6'
        case 'DELETE': return 'red-6'
        case 'PATCH': return 'purple-6'
        default: return 'grey-6'
      }
    }

    const formatJson = (obj) => {
      try {
        return JSON.stringify(obj ?? {}, null, 2)
      } catch {
        return String(obj)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const fetchItems = async () => {
      try {
        const params = {
          search: search.value || null,
          type: typeFilter.value || null,
          severity: severityFilter.value?.value || null
        }

        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const { data } = await api.get('notifications', { params })

        let notifications = data
        if (!Array.isArray(notifications)) {
          notifications = [notifications].filter(Boolean)
        }

        items.value = notifications

        if (route.query.id) {
          if (items.value.length > 0) {
            selected.value = items.value.find(item => item.id === route.query.id)
            drawer.value = true
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        $q.notify({
          type: 'negative',
          message: 'Error cargando notificaciones',
          position: 'top'
        })
        items.value = []
      }
    }

    const filteredItems = computed(() => {
      let filtered = items.value

      if (search.value) {
        const searchTerm = search.value.toLowerCase()
        filtered = filtered.filter(item => {
          const message = item.data?.message?.toLowerCase() || ''
          const errorType = item.data?.error_type?.toLowerCase() || ''
          const exception = item.data?.exception?.toLowerCase() || ''
          return message.includes(searchTerm) ||
             errorType.includes(searchTerm) ||
             exception.includes(searchTerm)
        })
      }

      if (typeFilter.value) {
        filtered = filtered.filter(item =>
          item.data?.error_type === typeFilter.value
        )
      }

      if (severityFilter.value?.value) {
        filtered = filtered.filter(item =>
          item.data?.error_type === severityFilter.value.value
        )
      }

      return filtered
    })

    const handleSearchChange = () => {
      fetchItems()
    }

    const handleTypeFilterChange = () => {
      fetchItems()
    }

    const handleRefresh = () => {
      fetchItems()
    }

    const handleNotificationClick = (notification) => {
      selected.value = notification
      drawer.value = true
    }

    const handleCloseDrawer = () => {
      drawer.value = false
    }

    const handleCopyJson = (obj) => {
      navigator.clipboard.writeText(formatJson(obj))
      $q.notify({
        message: 'JSON copiado al portapapeles',
        color: 'positive',
        icon: 'check',
        position: 'top'
      })
    }

    const handleCopyText = (text) => {
      navigator.clipboard.writeText(text || '')
      $q.notify({
        message: 'Trace copiado al portapapeles',
        color: 'primary',
        icon: 'content_copy',
        position: 'top'
      })
    }

    // Cargar datos iniciales
    fetchItems()

    return {
      filteredItems,
      items,
      selected,
      drawer,
      search,
      typeFilter,
      typeToggleOptions,
      getErrorColor,
      getErrorIcon,
      getMethodIcon,
      getMethodColor,
      formatJson,
      formatDate,
      handleSearchChange,
      handleTypeFilterChange,
      handleRefresh,
      handleNotificationClick,
      handleCloseDrawer,
      handleCopyJson,
      handleCopyText
    }
  }
})
</script>

  <style scoped>
  .notification-container {
    padding: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Estilos modernos para la sección de filtros */
  .filters-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid rgba(229, 231, 235, 0.5);
  }

  .search-container {
    width: 100%;
  }

  .search-input {
    border-radius: 12px;
  }

  .filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .type-toggle {
    border-radius: 12px;
  }

  .severity-select {
    min-width: 160px;
    border-radius: 12px;
  }

  .actions-container {
    display: flex;
    justify-content: flex-end;
  }

  .refresh-btn {
    border-radius: 12px;
    padding: 8px 16px;
  }

  /* Estilos modernos para las notificaciones */
  .notifications-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .notification-card {
    transition: all 0.3s ease;
  }

  .notification-card:hover {
    transform: translateY(-2px);
  }

  .modern-card {
    border-radius: 16px;
    border: 1px solid rgba(229, 231, 235, 0.5);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    overflow: hidden;
  }

  .notification-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }

  .notification-icon {
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .notification-exception {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }

  .notification-message {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .notification-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .meta-chip {
    border-radius: 8px;
    font-size: 12px;
  }

  .notification-actions {
    flex-shrink: 0;
    align-self: flex-start;
  }

  .card-actions {
    padding: 12px 20px;
    background: rgba(249, 250, 251, 0.8);
    gap: 8px;
  }

  /* Estado vacío mejorado */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  /* Estilos del drawer mejorados */
  .notification-drawer {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
  }

  .drawer-toolbar {
    background: linear-gradient(135deg, rgba(190, 18, 60, 0.1), rgba(236, 72, 153, 0.1));
    border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  }

  .drawer-title {
    font-weight: 600;
    color: #1f2937;
  }

  .drawer-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .detail-card {
    border-radius: 12px;
    border: 1px solid rgba(229, 231, 235, 0.5);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .detail-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .detail-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .detail-value {
    font-size: 14px;
    color: #374151;
    word-break: break-word;
  }

  .code-section {
    padding: 0;
  }

  .code-block {
    background: rgba(15, 23, 42, 0.05);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 8px;
    padding: 16px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 300px;
    overflow: auto;
    color: #334155;
  }

  .trace-block {
    max-height: 400px;
    font-size: 12px;
  }

  .snapshot-image {
    border-radius: 0 0 12px 12px;
  }

  /* Responsive design mejorado */
  @media (min-width: 768px) {
    .filters-section {
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-container {
      flex: 1;
      min-width: 300px;
    }

    .filter-chips {
      flex: none;
    }

    .actions-container {
      flex: none;
    }

    .notification-header {
      padding: 24px;
    }

    .card-actions {
      padding: 16px 24px;
    }
  }

  @media (max-width: 767px) {
    .notification-container {
      padding: 12px;
    }

    .filters-section {
      padding: 16px;
    }

    .notification-header {
      padding: 16px;
    }

    .notification-title {
      font-size: 15px;
    }

    .notification-exception {
      font-size: 13px;
    }

    .notification-message {
      font-size: 13px;
    }

    .drawer-content {
      padding: 16px;
    }

    .code-block {
      font-size: 12px;
      padding: 12px;
    }
  }
  </style>
