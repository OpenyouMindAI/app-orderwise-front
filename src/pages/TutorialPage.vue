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
              :src="selectedVideo.videoUrl"
              controls
              class="full-width"
              style="max-height: 500px"
            ></video>
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
                <div class="text-subtitle1">{{ selectedVideo.views }} visualizaciones • {{ selectedVideo.publishedDate }}</div>
                <q-space />
                <q-btn flat round icon="thumb_up" />
                <q-btn flat round icon="thumb_down" />
                <q-btn flat round icon="share" />
                <q-btn flat round icon="playlist_add" />
              </div>
              <q-separator />
              <div class="row q-mt-md items-center">
                <q-avatar size="40px">
                  <img :src="selectedVideo.channelAvatar" />
                </q-avatar>
                <div class="q-ml-sm">
                  <div class="text-subtitle1 text-weight-bold">{{ selectedVideo.channelName }}</div>
                  <div class="text-caption">{{ selectedVideo.subscribers }} suscriptores</div>
                </div>
                <q-space />
                <q-btn color="red" label="Suscribirse" />
              </div>
              <q-separator class="q-my-md" />
              <div class="video-description">
                <p>{{ selectedVideo.description }}</p>
              </div>
              <q-separator class="q-my-md" />
              <div class="comments-section">
                <div class="text-subtitle1 q-mb-md">{{ selectedVideo.comments.length }} comentarios</div>
                <div v-for="(comment, index) in selectedVideo.comments" :key="index" class="q-mb-md">
                  <div class="row items-start">
                    <q-avatar size="40px">
                      <img :src="comment.avatar" />
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
              </div>
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
              <q-img :src="video.thumbnail" :ratio="16/9" />
              <q-card-section>
                <div class="row no-wrap">
                  <q-avatar size="40px">
                    <img :src="video.channelAvatar" />
                  </q-avatar>
                  <div class="q-ml-sm">
                    <div class="text-subtitle1 ellipsis-2-lines">{{ video.title }}</div>
                    <div class="text-caption">{{ video.channelName }}</div>
                    <div class="text-caption">{{ video.views }} visualizaciones • {{ video.publishedDate }}</div>
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
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

const searchQuery = ref('')
const isSuperAdmin = ref(true)
const selectedVideo = ref(null)
const showAddVideoDialog = ref(false)
const showDeleteDialog = ref(false)
const editingVideo = ref(null)
const videoToDelete = ref(null)

const videoForm = ref({
  title: '',
  description: '',
  thumbnail: null,
  videoFile: null
})

const videos = ref([
  {
    id: 1,
    title: 'Cómo crear una aplicación con Quasar Framework',
    thumbnail: 'https://cdn.quasar.dev/img/mountains.jpg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    channelName: 'Quasar Academy',
    channelAvatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
    views: '120K',
    publishedDate: 'hace 2 semanas',
    description: 'En este tutorial, aprenderás a crear una aplicación completa con Quasar Framework y Vue.js. Veremos cómo configurar el proyecto, crear componentes y desplegar la aplicación.',
    subscribers: '500K',
    comments: [
      {
        username: 'María López',
        avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
        date: 'hace 3 días',
        text: '¡Excelente tutorial! Me ha ayudado mucho a entender Quasar.'
      },
      {
        username: 'Juan Pérez',
        avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
        date: 'hace 1 semana',
        text: '¿Podrías hacer un tutorial sobre cómo integrar Firebase con Quasar?'
      }
    ]
  },
  {
    id: 2,
    title: 'Vue.js 3 Composition API - Tutorial Completo',
    thumbnail: 'https://cdn.quasar.dev/img/parallax2.jpg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    channelName: 'Vue Masters',
    channelAvatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
    views: '85K',
    publishedDate: 'hace 1 mes',
    description: 'Aprende a utilizar la Composition API de Vue.js 3 con ejemplos prácticos y casos de uso reales.',
    subscribers: '320K',
    comments: [
      {
        username: 'Carlos Ruiz',
        avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
        date: 'hace 2 semanas',
        text: 'La Composition API es un cambio revolucionario en Vue.'
      }
    ]
  },
  {
    id: 3,
    title: 'Diseño Responsive con Quasar Framework',
    thumbnail: 'https://cdn.quasar.dev/img/parallax1.jpg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    channelName: 'Quasar Academy',
    channelAvatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
    views: '42K',
    publishedDate: 'hace 3 meses',
    description: 'Aprende a crear interfaces responsivas utilizando el sistema de grid y los componentes de Quasar Framework.',
    subscribers: '500K',
    comments: []
  },
  {
    id: 4,
    title: 'Creando una PWA con Quasar',
    thumbnail: 'https://cdn.quasar.dev/img/quasar.jpg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    channelName: 'Web Dev Pro',
    channelAvatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
    views: '67K',
    publishedDate: 'hace 5 días',
    description: 'Tutorial paso a paso para crear una Progressive Web App utilizando Quasar Framework.',
    subscribers: '250K',
    comments: []
  },
  {
    id: 5,
    title: 'Quasar vs Vuetify - Comparativa Completa',
    thumbnail: 'https://cdn.quasar.dev/img/mountains.jpg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    channelName: 'Vue Masters',
    channelAvatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
    views: '103K',
    publishedDate: 'hace 2 meses',
    description: 'Analizamos las diferencias, ventajas y desventajas entre Quasar Framework y Vuetify para ayudarte a elegir el mejor framework para tu próximo proyecto.',
    subscribers: '320K',
    comments: []
  },
  {
    id: 6,
    title: 'Optimización de Rendimiento en Aplicaciones Vue',
    thumbnail: 'https://cdn.quasar.dev/img/parallax2.jpg',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    channelName: 'Web Dev Pro',
    channelAvatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
    views: '29K',
    publishedDate: 'hace 1 semana',
    description: 'Aprende técnicas avanzadas para optimizar el rendimiento de tus aplicaciones Vue y Quasar.',
    subscribers: '250K',
    comments: []
  }
])

const recommendedVideos = computed(() => {
  if (!selectedVideo.value) return []
  return videos.value.filter(video => video.id !== selectedVideo.value.id).slice(0, 5)
})

function selectVideo (video) {
  selectedVideo.value = video
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
  if (editingVideo.value) {
    const index = videos.value.findIndex(v => v.id === editingVideo.value.id)
    if (index !== -1) {
      videos.value[index] = {
        ...editingVideo.value,
        title: videoForm.value.title,
        description: videoForm.value.description
      }
      if (selectedVideo.value?.id === editingVideo.value.id) {
        selectedVideo.value = videos.value[index]
      }
    }
    $q.notify({ color: 'positive', message: 'Video actualizado correctamente', icon: 'edit' })
  } else {
    try {
      const formData = new FormData()
      formData.append('title', videoForm.value.title)
      formData.append('description', videoForm.value.description)
      formData.append('video_url', videoForm.value.videoUrl)
      formData.append('status', 'published')
      formData.append('miniature', videoForm.value.miniature)
      const { data } = await api.post('tutorials', formData)
      videoForm.value = {}
      editingVideo.value = null
      showAddVideoDialog.value = false
      console.log(data)
      $q.notify({ color: 'positive', message: 'Video agregado correctamente', icon: 'add' })
    } catch (error) {
      $q.notify({ color: 'negative', message: error.message, icon: 'warning' })
    }
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
