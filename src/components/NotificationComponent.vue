<template>
  <div :style="styleCss">
    <skeleton-component
      v-if="loadingNotification"
      style="width: 100%; min-width: 300px"
    />
    <q-card v-else style="min-width: 300px">
      <q-card-section class="row items-center q-py-xs">
        <span class="text-h6"> Notificaciones </span>
        <q-space />
        <q-btn icon="more_horiz" round flat size="12px">
          <q-popup-proxy>
            <q-card style="width: 250px">
              <q-card-section class="q-pa-none">
                <q-list dense>
                  <q-item v-ripple clickable @click="unReadNotifications">
                    <q-item-section thumbnail>
                      <q-avatar size="xl" icon="check" />
                    </q-item-section>
                    <q-item-section>Marcar como leídos</q-item-section>
                  </q-item>
                  <q-item
                    v-if="$route.name !== 'Notification'"
                    v-ripple
                    clickable
                    @click="gotToNotification"
                  >
                    <q-item-section thumbnail>
                      <q-avatar size="xl" icon="menu" />
                    </q-item-section>
                    <q-item-section>Abrir notificaciones</q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
      </q-card-section>
      <q-card-section class="row items-center q-pa-xs q-gutter-xs">
        <q-btn
          no-caps
          dense
          class="q-px-md"
          color="primary"
          label="No leídos"
          rounded
          size="12px"
          :flat="!active"
          :outline="active"
          @click="getAllNotifications(true)"
        />
        <q-btn
          no-caps
          dense
          class="q-px-md"
          color="primary"
          label="Todas"
          rounded
          size="13px"
          :flat="active"
          :outline="!active"
          @click="getAllNotifications(false)"
        />
      </q-card-section>
      <q-card-section v-if="notifications.length" class="q-px-xs q-py-xs">
        <div style="max-height: calc(70vh)" class="scroll">
          <q-list>
            <q-item
              v-for="notify in notifications"
              :key="notify.number_guide"
              v-ripple
              clickable
              :class="notify.read_at ? 'text-grey' : ''"
              @click="goToAboutPage(notify)"
            >
              <q-item-section
                thumbnail
                :class="notify.read_at ? 'text-grey' : ''"
              >
                <q-avatar size="xl" :icon="getErrorIcon(notify)" />
              </q-item-section>
              <q-item-section>
                <q-item-label
                  lines="1"
                  :class="notify.read_at ? 'text-grey' : ''"
                >
                  {{ $t(`command.${notify.data?.title || notify.data?.error_type?.toLowerCase()}`) }}
                </q-item-label>
                <q-item-label caption lines="2">
                  <span>{{ notify.data?.content || notify.data?.message }}</span>
                </q-item-label>
                <q-item-label
                  caption
                  lines="3"
                  :class="notify.read_at ? '' : 'text-primary text-bold'"
                >
                  <span>{{ timeAgo(notify.created_at) }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section v-if="!notify.read_at" side>
                <q-badge rounded color="primary" />
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Botón cargar más -->
          <div v-if="pagination.current_page < pagination.last_page" class="q-pa-md text-center">
            <q-btn
              color="primary"
              label="Cargar más"
              icon-right="expand_more"
              :loading="loadingMore"
              @click="loadMore"
              dense
              rounded
              no-caps
            />
          </div>

          <!-- Info de paginación -->
          <div v-if="pagination.total > 0" class="q-pa-sm text-center text-caption text-grey-6">
            {{ notifications.length }} de {{ pagination.total }} notificaciones
          </div>
        </div>
      </q-card-section>
      <q-card-section v-else class="q-px-xs q-py-xs q-pb-md text-center">
        <q-icon size="110px" name="circle_notifications" class="text-primary" />
        <div class="text-subtitle1 text-bold">No tienes notificaciones.</div>
      </q-card-section>
    </q-card>
  </div>
</template>
<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SkeletonComponent from './Skeleton.vue'
import { format } from 'timeago.js'
import { api } from 'src/boot/axios'
import { loading } from 'src/const/mixins'

export default {
  components: {
    SkeletonComponent
  },
  props: {
    activeRead: {
      type: Boolean,
      default: true
    },
    styleCss: {
      type: String,
      default: 'width: 360px; max-height: 80vh;'
    }
  },

  emits: ['onLoad'],

  setup (props, { emit }) {
    /**
     * Active read
     * @type {Object}
     */
    const active = ref(props.activeRead)
    /**
     * Loading notification
     * @type {Boolean}
     */
    const loadingNotification = ref(false)
    /**
     * Number of notifications
     * @type {Number} number
     */
    const numberOfNotifications = ref(0)
    /**
     * Notifications
     * @type {Array}
     */
    const notifications = ref([])

    /**
     * Loading more notifications
     * @type {Boolean}
     */
    const loadingMore = ref(false)

    /**
     * Pagination data
     * @type {Object}
     */
    const pagination = ref({
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0
    })

    /**
     * Router
     * @type {Object}
     */
    const $router = useRouter()

    /***
     * Time to publication
     */
    const timeAgo = (date) => {
      return format(date, 'es_US')
    }
    /**
     * Get notifications
     * @param {Boolean} unread status guide
     * @param {Number} page page number
     * @param {Boolean} append append to existing notifications
     */
    const getAllNotifications = async (unread, page = 1, append = false) => {
      try {
        active.value = unread
        if (!append) {
          loadingNotification.value = true
        } else {
          loadingMore.value = true
        }

        const params = {
          unread: unread ? 'true' : undefined,
          page,
          per_page: pagination.value.per_page
        }

        const { data } = await api.get('notifications', { params })

        // Actualizar paginación
        pagination.value = {
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total
        }

        // Actualizar notificaciones
        if (append) {
          notifications.value = [...notifications.value, ...data.data]
        } else {
          notifications.value = data.data
        }

        loadingNotification.value = false
        loadingMore.value = false
        emit('onLoad')
      } catch (error) {
        if (!append) {
          notifications.value = []
        }
        loadingNotification.value = false
        loadingMore.value = false
        console.error('Error adding document: ', error)
      }
    }

    /**
     * Load more notifications
     */
    const loadMore = async () => {
      if (pagination.value.current_page < pagination.value.last_page) {
        await getAllNotifications(active.value, pagination.value.current_page + 1, true)
      }
    }

    /**
     * get notifications
     */
    const unReadNotifications = async () => {
      try {
        await api.post('notifications/mark-as-read')
        getAllNotifications(true)
      } catch (error) {
        console.error('Error adding document: ', error)
      }
    }

    /**
     * get notifications
     */
    const unReadOneNotifications = async (id) => {
      try {
        return await api.put(`notifications/mark-as-read-one/${id}`)
      } catch (error) {
        console.error('Error adding document: ', error)
      }
    }
    const getErrorIcon = (notification) => {
      const errorType = notification?.data?.error_type
      switch (errorType) {
        case 'DATABASE_ERROR': return 'storage'
        case 'APPLICATION_ERROR': return 'code'
        case 'GENERAL_ERROR': return 'error'
        default: return notification.data.icon
      }
    }
    /**
     * Go to about page
     * @param {Object} notify notify
     */
    const goToAboutPage = async (notify) => {
      try {
        loading(true)
        const { data } = await unReadOneNotifications(notify.id)
        if (data?.data?.route_type && data?.data?.route_type === 'query') {
          $router.push(
            {
              name: data?.data?.route_name,
              query: { id: data?.data?.route_id }
            }
          )
        } else {
          $router.push({ path: data?.data?.route || 'notifications', query: { id: notify.id } })
        }
        getAllNotifications(true)
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    }

    const gotToNotification = () => {
      $router.push({ name: 'Notification' })
    }

    return {
      active,
      getErrorIcon,
      loadingNotification,
      loadingMore,
      notifications,
      numberOfNotifications,
      pagination,
      unReadOneNotifications,
      gotToNotification,
      timeAgo,
      goToAboutPage,
      getAllNotifications,
      unReadNotifications,
      loadMore
    }
  },
  created () {
    this.getAllNotifications(true)
  }
}
</script>
