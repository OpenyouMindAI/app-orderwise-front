<template>
  <div class="q-pa-md">
    <q-toolbar>
      <q-toolbar-title class="flex items-center">
        <q-icon name="play_circle_filled" size="28px" class="q-mr-sm" />
        QTutorial
      </q-toolbar-title>
      <q-input
        dense
        standout
        v-model="searchQuery"
        placeholder="Buscar"
        class="q-ml-md"
        style="width: 400px"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-space />
      <q-btn v-if="isSuperAdmin" color="secondary" label="Subir Video" icon="add" @click="showAddVideoDialog = true" />
    </q-toolbar>

    <div class="q-pa-md">
      <!-- Video Player Section (when a video is selected) -->
      <div v-if="selectedVideo" class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <div class="video-player-container">
            <video
              :src="selectedVideo.video_url"
              controls
              class="full-width"
              style="max-height: 500px"
            />
            <div class="q-mt-md">
              <div class="row items-center q-mb-md">
                <div class="text-h5">{{ selectedVideo.title }}</div>
                <q-space />
                <div v-if="isSuperAdmin" class="admin-controls">
                  <q-btn flat round color="primary" icon="edit" @click="editVideo(selectedVideo)" />
                  <q-btn flat round color="negative" icon="delete" @click="confirmDeleteVideo(selectedVideo)" />
                </div>
              </div>
              <div class="row items-center q-mb-md">
                <div class="text-subtitle1">
                  234K
                  visualizaciones •
                  {{ formatDate(selectedVideo.created_at) }}
                </div>
                <q-space />
                <q-btn flat round icon="thumb_up" />
                <q-btn flat round icon="thumb_down" />
                <q-btn flat round icon="share" />
                <q-btn flat round icon="playlist_add" />
              </div>
              <q-separator />
              <div class="row q-mt-md items-center">
                <q-avatar size="40px">
                  <img :src="qBitsLogo.isoLogoColor"  alt="logo"/>
                </q-avatar>
                <div class="q-ml-sm">
                  <div class="text-subtitle1 text-weight-bold">{{ selectedVideo.channelName }}</div>
                  <div class="text-caption">20k suscriptores</div>
                </div>
                <q-space />
                <q-btn color="red" label="Suscribirse" />
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
          <div class="text-subtitle1 q-mb-sm">Videos recomendados</div>
          <div class="recommended-videos">
            <q-list>
              <q-item v-for="video in recommendedVideos" :key="video.id" clickable @click="selectVideo(video)">
                <q-item-section avatar>
                  <q-img :src="video.thumbnail" :ratio="16/9" style="width: 168px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="2" class="text-weight-medium">{{ video.title }}</q-item-label>
                  <q-item-label caption>{{ video.channelName }}</q-item-label>
                  <q-item-label caption>{{ video.views }} visualizaciones • {{ video.publishedDate }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>

      <!-- Video Grid (when no video is selected) -->
      <div v-else>
        <div class="text-h5 q-mb-md">Videos recomendados</div>
        <div class="row q-col-gutter-md">
          <div v-for="video in videos" :key="video.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card class="video-card" flat bordered @click="selectVideo(video)">
              <q-img :src="video.miniature_url" :ratio="16/9" />
              <q-card-section>
                <div class="row no-wrap">
                  <q-avatar size="40px">
                    <img :src="qBitsLogo.isoLogoColor" alt="videos"/>
                  </q-avatar>
                  <div class="q-ml-sm">
                    <div class="text-subtitle1 ellipsis-2-lines">{{ video.title }}</div>
                    <div class="text-caption">QBits</div>
                    <div class="text-caption">1000 visualizaciones • {{ formatDate(video.created_at) }}</div>
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
    </div>

    <!-- Add/Edit Video Dialog -->
    <q-dialog v-model="showAddVideoDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ editingVideo ? 'Editar Video' : 'Agregar Nuevo Video' }}</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveVideo">
            <q-input v-model="videoForm.title" label="Título" :rules="[val => !!val || 'El título es requerido']" />
            <q-input v-model="videoForm.description" label="Descripción" type="textarea" />
            <q-file v-model="videoForm.miniature" label="Miniatura" accept=".jpg, .png" />
            <q-input v-model="videoForm.videoUrl" label="Url de Video" type="url" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Guardar" color="primary" @click="saveVideo" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate, loading, qBitsLogo } from '../const/mixins'
import { authentication } from 'src/stores/module-authentication'

const $q = useQuasar()
const store = authentication()
/**
 * Search query
 * @type {String}
 */
const searchQuery = ref('')
/**
 * Is super admin
 * @type {Boolean}
 */
const isSuperAdmin = ref(store.userSession.is_root)
const selectedVideo = ref(null)
const showAddVideoDialog = ref(false)
const showDeleteDialog = ref(false)
const editingVideo = ref(null)
const videoToDelete = ref(null)

const videoForm = ref()

const videos = ref([])

const recommendedVideos = computed(() => {
  if (!selectedVideo.value) return []
  return videos.value.filter(video => video.id !== selectedVideo.value.id).slice(0, 5)
})

onMounted(() => {
  getVideos()
})

function selectVideo (video) {
  selectedVideo.value = video
}

async function getVideos () {
  try {
    loading(true)
    const { data } = await api.get('tutorials', {
      params: {
        status: 'published',
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 10,
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

function editVideo (video) {
  editingVideo.value = video
  videoForm.value = {
    title: video.title,
    description: video.description,
    thumbnail: null,
    videoFile: null
  }
  showAddVideoDialog.value = true
}

function confirmDeleteVideo (video) {
  videoToDelete.value = video
  showDeleteDialog.value = true
}

function deleteVideo () {
  if (videoToDelete.value) {
    videos.value = videos.value.filter(v => v.id !== videoToDelete.value.id)
    if (selectedVideo.value?.id === videoToDelete.value.id) {
      selectedVideo.value = null
    }
    videoToDelete.value = null
    $q.notify({ color: 'positive', message: 'Video eliminado correctamente', icon: 'delete' })
  }
}

async function saveVideo () {
  try {
    const formData = new FormData()
    formData.append('title', videoForm.value.title)
    formData.append('description', videoForm.value.description)
    formData.append('video_url', videoForm.value.videoUrl)
    formData.append('status', 'published')
    formData.append('miniature', videoForm.value.miniature)
    if (editingVideo.value) {
      formData.append('_method', 'put')
      const { data } = await api.post(`tutorials/${editingVideo.value.id}`, formData)
      $q.notify({ color: 'positive', message: 'Video actualizado correctamente', icon: 'edit' })
      console.log(data)
    } else {
      const { data } = await api.post('tutorials', formData)
      videoForm.value = {}
      editingVideo.value = null
      showAddVideoDialog.value = false
      console.log(data)
      $q.notify({ color: 'positive', message: 'Video agregado correctamente', icon: 'add' })
    }
    getVideos()
  } catch (error) {
    $q.notify({ color: 'negative', message: error.message, icon: 'warning' })
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
