<template>
  <q-page class="q-pa-md">
    <div class="flex items-center justify-between q-px-md">
      <q-toolbar-title
        class="flex items-center q-gutter-sm justify-start cursor-pointer"
        @click="$router.push({ name: 'Tutorial' })"
      >
        <img
          :src="`images/${$q.dark.isActive ? 'q-tutorials-white' : 'q-tutorials'}.png`"
          style="width: 40px; height: 45px;"
          alt="q-tutorials"
        />
        <span>Tutorials</span>
      </q-toolbar-title>
      <q-form @submit="getVideos">
        <q-input
          dense
          v-model="searchQuery"
          placeholder="Buscar"
          filled
          style="width: 400px"
          clearable
          type="search"
          debounce="300"
          @update:model-value="(data) => $router.push({ name: 'Tutorial', query: { ...$route.query, search: data } })"
          @clear="getVideos"
        >
          <template v-slot:append>
            <q-btn round type="submit" icon="search" size="sm" color="primary" @click="() => {
              $router.push({ name: 'Tutorial', query: { search: searchQuery } })
              getVideos()
            }" />
          </template>
        </q-input>
      </q-form>
      <q-space />
      <q-btn
        v-if="isSuperAdmin"
        color="secondary"
        label="Subir Video"
        icon="add"
        @click="showAddVideoDialog = true"
      />
    </div>

    <div class="q-pa-md q-mt-md">
      <!-- Video Player Section (when a video is selected) -->
      <div v-if="$route.query.videoId && selectedVideo" class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <div class="video-player-container">
            <video
              :src="selectedVideo.video_url"
              controls
              class="full-width"
              style="max-height: 500px; ; border-radius: 10px;"
            />
            <div class="q-mt-md">
              <div class="row items-center q-mb-md">
                <div class="text-h5">
                  {{ selectedVideo.title }}
                </div>
                <q-space />
                <div v-if="isSuperAdmin" class="admin-controls">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="edit"
                    @click="editVideo(selectedVideo)"
                  />
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="confirmDeleteVideo(selectedVideo)"
                  />
                </div>
              </div>
              <div class="row items-center q-mb-md">
                <div class="text-subtitle1">
                  • {{ formatDate(selectedVideo.created_at) }}
                  <!-- 234K
                  visualizaciones • -->
                </div>
                <q-space />
                <!-- <q-btn flat round icon="thumb_up" />
                <q-btn flat round icon="thumb_down" /> -->
                <!-- <q-btn flat round icon="share" /> -->
                <!-- <q-btn flat round icon="playlist_add" /> -->
              </div>
              <q-separator />
              <div class="row q-mt-md items-center">
                <q-avatar size="40px">
                  <img :src="qBitsLogo.isoLogoColor"  alt="logo"/>
                </q-avatar>
                <div class="q-ml-sm">
                  <div class="text-subtitle1 text-weight-bold">Qbits</div>
                  <!-- <div class="text-caption">20k suscriptores</div> -->
                </div>
                <!-- <q-space />
                <q-btn color="red" label="Suscribirse" /> -->
              </div>
              <q-separator class="q-my-md" />
              <div class="video-description">
                <p>{{ selectedVideo.description }}</p>
              </div>
              <!-- <q-separator class="q-my-md" /> -->
              <!-- <div class="comments-section">
                <div class="text-subtitle1 q-mb-md">{{ selectedVideo.comments.length }} comentarios</div>
                <div v-for="(comment, index) in selectedVideo.comments" :key="index" class="q-mb-md">
                  <div class="row items-start">
                    <q-avatar size="40px">
                      <img :src="qBitsLogo.isoLogoColor"  alt="logo"/>
                    </q-avatar>
                    <div class="q-ml-sm">
                      <div class="text-weight-bold">{{ comment.username }} <span class="text-caption">{{ comment.date }}</span></div>
                      <div>{{ comment.text }}</div>
                      <div class="row q-mt-xs">
                        <q-btn flat dense size="sm" icon="thumb_up" />
                        <q-btn flat dense size="sm" icon="thumb_down" />
                        <q-btn flat dense size="sm" label="Responder" />
                      </div>
                    </div>
                  </div>
                </div>
              </div> -->
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="recommended-videos" v-if="recommendedVideos.length > 0">
            <div class="text-subtitle1 q-mb-sm">
              Videos recomendados
            </div>
            <q-list>
              <q-item
                v-for="video in recommendedVideos"
                :key="video.id"
                clickable
                style="border-radius: 10px;"
                @click="selectVideo(video)"
              >
                <q-item-section avatar>
                  <q-img
                    :src="video.miniature_url"
                    :ratio="12/9"
                    style="width: 158px; border-radius: 10px;"
                    alt="video"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="2" class="text-weight-medium">{{ video.title }}</q-item-label>
                  <q-item-label caption>Qbits</q-item-label>
                  <q-item-label caption>{{ formatDate(video.created_at) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="text-subtitle1 q-mb-sm text-center" v-else>
            No hay videos recomendados
          </div>
        </div>
      </div>

      <!-- Video Grid (when no video is selected) -->
      <div v-else-if="videos.length > 0" class="q-mb-md">
        <div class="text-h5 q-mb-md">
          Videos
        </div>
        <div class="row q-col-gutter-md">
          <div v-for="video in videos" :key="video.id" class="col-12 col-sm-6 col-md-4 col-lg-4">
            <q-card class="video-card" flat bordered @click="selectVideo(video)">
              <q-img :src="video.miniature_url" :ratio="16/9" />
              <q-card-section>
                <div class="row no-wrap">
                  <q-avatar size="40px">
                    <img :src="qBitsLogo.isoLogoColor" alt="videos"/>
                  </q-avatar>
                  <div class="q-ml-sm">
                    <div class="text-subtitle1 ellipsis-2-lines">{{ video.title }}</div>
                    <div class="text-caption">
                      QBits • {{ formatDate(video.created_at) }}
                    </div>
                  </div>
                </div>
              </q-card-section>
              <q-card-actions v-if="isSuperAdmin" align="right">
                <q-btn flat round color="primary" icon="edit" @click.stop="editVideo(video)" />
                <q-btn flat round color="negative" icon="delete" @click.stop="confirmDeleteVideo(video)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center full-width q-mt-lg">
        <q-img src="images/404.png" alt="404" style="width: 600px; max-width: 80vw;" />
      </div>
    </div>

    <!-- Add/Edit Video Dialog -->
    <q-dialog v-model="showAddVideoDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw;">
        <q-card-section class="flex justify-between items-center bg-primary text-white">
          <div class="text-h6">
            {{ editingVideo ? 'Editar Video' : 'Agregar nuevo video' }}
          </div>
          <q-btn icon="close" flat round dense @click="showAddVideoDialog = false" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveVideo" class="q-gutter-y-md">
            <q-file
              filled
              v-model="videoForm.miniature"
              label="Miniatura" accept=".jpg, .png"
            />
            <q-file
              filled
              v-model="videoForm.video"
              label="Video"
              type="file"
              accept=".mp4, .webm, .ogg"
            />
            <q-input
              filled
              v-model="videoForm.title"
              label="Título"
              :rules="[val => !!val || 'El título es requerido']"
            />
            <q-select
              filled
              v-model="videoForm.status"
              label="Estado"
              :options="statuses"
              emit-value
              map-options
              :rules="[val => !!val || 'El estado es requerido']"
            />
            <q-input
              filled
              v-model="videoForm.description"
              label="Descripción"
              type="textarea"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Guardar" color="primary" @click="saveVideo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro de que deseas eliminar este video?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deleteVideo" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate, loading, qBitsLogo } from '../const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { useRoute, useRouter } from 'vue-router'

const $q = useQuasar()
const $route = useRoute()
const $router = useRouter()
const store = authentication()
/**
 * Search query
 * @type {String}
 */
const searchQuery = ref($route.query.search || '')
/**
 * Is super admin
 * @type {Boolean}
 */
const isSuperAdmin = ref(store.userSession.is_root)
/**
 * Selected video
 * @type {Object}
 */
const selectedVideo = ref(null)
/**
 * Video form dialog
 * @type {Object}
 */
const showAddVideoDialog = ref(false)
/**
 * Video delete dialog
 * @type {Object}
 */
const showDeleteDialog = ref(false)
/**
 * Editing video
 * @type {Object}
 */
const editingVideo = ref(null)
/**
 * Video to delete
 * @type {Object}
 */
const videoToDelete = ref(null)
/**
 * Video form
 * @type {Object}
 */
const videoForm = ref({})
/**
 * Videos list
 * @type {Object}
 */
const videos = ref([])
/**
 * Video statuses
 * @type {Array}
 */
const statuses = ['published', 'draft', 'hidden']

/**
 * Show add video dialog
 * @type {Object}
 */

watch(showAddVideoDialog, (data) => {
  if (!data) {
    videoForm.value = {}
    editingVideo.value = null
  }
})

/**
 * Show delete dialog
 * @type {Object}
 */
const recommendedVideos = computed(() => {
  if (!selectedVideo.value) return []
  return videos.value.filter(video => video.id !== selectedVideo.value.id)
})

/**
 * Get videos
 */
onMounted(() => {
  if ($route.query.videoId) {
    getVideo($route.query.videoId)
  } else {
    getVideos()
  }
})

/**
 * Watch videoId query param
 */
watch(() => $route.query.videoId, (id) => {
  if (!id) {
    selectedVideo.value = null
    getVideos()
    return
  }
  getVideo(id)
})

/**
 * Select video
 * @param {Object}
 */
function selectVideo (video) {
  $router.push({ name: 'Tutorial', query: { videoId: video.id } })
}

/**
 * Get videos
 */
async function getVideos () {
  try {
    loading(true)
    const { data } = await api.get('tutorials', {
      params: {
        dataEqualFilter: {
          status: 'published'
        },
        dataSearch: {
          title: searchQuery.value
        },
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 100,
        paginate: true
      }
    })
    videos.value = data.data
  } catch (error) {
    $q.notify({ color: 'negative', message: error.message, icon: 'warning' })
  } finally {
    loading(false)
  }
}

/**
 * Get video
 * @param {String} id
 */
async function getVideo (id) {
  try {
    loading(true)
    const { data } = await api.get(`tutorials/${id}`)
    selectedVideo.value = data
  } catch (error) {
    $q.notify({ color: 'negative', message: error.message, icon: 'warning' })
  } finally {
    loading(false)
  }
}

/**
 * Edit video
 * @param {Object} video
 */
function editVideo (video) {
  editingVideo.value = video
  videoForm.value = {
    title: video.title,
    description: video.description,
    status: video.status,
    miniature: null,
    video: null
  }
  showAddVideoDialog.value = true
}

/**
 * Confirm delete video
 * @param {Object} video
 */
function confirmDeleteVideo (video) {
  videoToDelete.value = video
  showDeleteDialog.value = true
}

/**
 * Delete video
 */
async function deleteVideo () {
  try {
    loading(true)
    await api.delete(`tutorials/${videoToDelete.value.id}`)
    $q.notify({ color: 'positive', message: 'Video eliminado correctamente', icon: 'delete' })
    videoToDelete.value = null
    $router.push({ name: 'Tutorial' })
    getVideos()
  } catch (error) {
    $q.notify({ color: 'negative', message: error.message, icon: 'warning' })
  } finally {
    loading(false)
  }
}
/**
 * Before action
 * @param {Object} message
 * @param {String} icon
 */
const beforeAction = ({ message, icon }) => {
  $q.notify({ color: 'positive', message, icon })
  videoForm.value = {}
  editingVideo.value = null
  showAddVideoDialog.value = false
}

/**
 * Save video
 */
async function saveVideo () {
  try {
    loading(true)
    const formData = new FormData()
    formData.append('title', videoForm.value.title)
    formData.append('description', videoForm.value.description)
    formData.append('status', videoForm.value.status)
    if (videoForm.value.miniature) {
      formData.append('miniature', videoForm.value.miniature)
    }
    if (videoForm.value.video) {
      formData.append('video', videoForm.value.video)
    }
    if (editingVideo.value) {
      formData.append('_method', 'put')
      const { data } = await api.post(`tutorials/${editingVideo.value.id}`, formData)
      selectedVideo.value = data
      beforeAction({ message: 'Video actualizado correctamente', icon: 'edit' })
    } else {
      await api.post('tutorials', formData)
      beforeAction({ message: 'Video agregado correctamente', icon: 'add' })
    }
    getVideos()
  } catch (error) {
    $q.notify({ color: 'negative', message: error.message, icon: 'warning' })
  } finally {
    loading(false)
  }
}
</script>

<style>
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

@media (max-width: 599px) {
  .video-player-container {
    margin-bottom: 20px;
  }
}
</style>
