<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <!-- <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title class="flex items-center">
          <q-icon name="play_circle_filled" size="28px" class="q-mr-sm" />
          MiTubo
        </q-toolbar-title>
        <q-input
          dark
          dense
          standout
          v-model="searchQuery"
          placeholder="Buscar"
          class="q-ml-md"
          style="width: 300px"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space />
        <q-btn v-if="isSuperAdmin" color="secondary" label="Subir Video" icon="add" @click="showAddVideoDialog = true" />
        <q-btn round flat>
          <q-avatar size="26px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item clickable>
                <q-item-section>Mi Perfil</q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section>Configuración</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable>
                <q-item-section>Cerrar Sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header> -->

    <!-- Left Drawer -->
    <!-- <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="240"
      :breakpoint="700"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item clickable v-ripple to="/" exact>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Inicio</q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="whatshot" />
            </q-item-section>
            <q-item-section>Tendencias</q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="subscriptions" />
            </q-item-section>
            <q-item-section>Suscripciones</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="video_library" />
            </q-item-section>
            <q-item-section>Biblioteca</q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>Historial</q-item-section>
          </q-item>
          <q-separator />
          <q-item-label header>Suscripciones</q-item-label>
          <q-item v-for="channel in channels" :key="channel.id" clickable v-ripple>
            <q-item-section avatar>
              <q-avatar size="24px">
                <img :src="channel.avatar" />
              </q-avatar>
            </q-item-section>
            <q-item-section>{{ channel.name }}</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer> -->

    <!-- Main Content -->
    <q-page-container>
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
    </q-page-container>

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
            <q-file v-model="videoForm.thumbnail" label="Miniatura" accept=".jpg, .png" />
            <q-file v-model="videoForm.videoFile" label="Archivo de Video" accept="video/*" />
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
  </q-layout>
</template>

<script>
export default {
  name: 'YouTubeClone',
  data () {
    return {
      leftDrawerOpen: false,
      searchQuery: '',
      isSuperAdmin: true, // Set to true for demonstration
      selectedVideo: null,
      showAddVideoDialog: false,
      showDeleteDialog: false,
      editingVideo: null,
      videoToDelete: null,
      videoForm: {
        title: '',
        description: '',
        thumbnail: null,
        videoFile: null
      },
      videos: [
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
      ],
      channels: [
        { id: 1, name: 'Quasar Academy', avatar: 'https://cdn.quasar.dev/img/boy-avatar.png' },
        { id: 2, name: 'Vue Masters', avatar: 'https://cdn.quasar.dev/img/avatar1.jpg' },
        { id: 3, name: 'Web Dev Pro', avatar: 'https://cdn.quasar.dev/img/avatar5.jpg' },
        { id: 4, name: 'Coding with Sara', avatar: 'https://cdn.quasar.dev/img/avatar2.jpg' },
        { id: 5, name: 'JavaScript Ninja', avatar: 'https://cdn.quasar.dev/img/avatar3.jpg' }
      ]
    }
  },
  computed: {
    recommendedVideos () {
      if (!this.selectedVideo) return []
      return this.videos.filter(video => video.id !== this.selectedVideo.id).slice(0, 5)
    }
  },
  methods: {
    selectVideo (video) {
      this.selectedVideo = video
      // En una aplicación real, aquí incrementaríamos el contador de vistas
    },
    editVideo (video) {
      this.editingVideo = video
      this.videoForm = {
        title: video.title,
        description: video.description,
        thumbnail: null,
        videoFile: null
      }
      this.showAddVideoDialog = true
    },
    confirmDeleteVideo (video) {
      this.videoToDelete = video
      this.showDeleteDialog = true
    },
    deleteVideo () {
      if (this.videoToDelete) {
        // En una aplicación real, aquí enviaríamos una solicitud al servidor
        this.videos = this.videos.filter(v => v.id !== this.videoToDelete.id)

        // Si el video eliminado es el que se está reproduciendo, volvemos a la lista
        if (this.selectedVideo && this.selectedVideo.id === this.videoToDelete.id) {
          this.selectedVideo = null
        }

        this.videoToDelete = null
        this.$q.notify({
          color: 'positive',
          message: 'Video eliminado correctamente',
          icon: 'delete'
        })
      }
    },
    saveVideo () {
      if (!this.videoForm.title) {
        this.$q.notify({
          color: 'negative',
          message: 'El título es requerido',
          icon: 'warning'
        })
        return
      }

      // En una aplicación real, aquí subiríamos los archivos y guardaríamos los datos
      if (this.editingVideo) {
        // Actualizar video existente
        const index = this.videos.findIndex(v => v.id === this.editingVideo.id)
        if (index !== -1) {
          this.videos[index] = {
            ...this.editingVideo,
            title: this.videoForm.title,
            description: this.videoForm.description
          }

          // Actualizar el video seleccionado si es el mismo
          if (this.selectedVideo && this.selectedVideo.id === this.editingVideo.id) {
            this.selectedVideo = this.videos[index]
          }
        }

        this.$q.notify({
          color: 'positive',
          message: 'Video actualizado correctamente',
          icon: 'edit'
        })
      } else {
        // Crear nuevo video
        const newVideo = {
          id: this.videos.length + 1,
          title: this.videoForm.title,
          description: this.videoForm.description,
          thumbnail: 'https://cdn.quasar.dev/img/mountains.jpg', // Placeholder
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder
          channelName: 'Mi Canal',
          channelAvatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          views: '0',
          publishedDate: 'hace 1 minuto',
          subscribers: '0',
          comments: []
        }

        this.videos.unshift(newVideo)

        this.$q.notify({
          color: 'positive',
          message: 'Video agregado correctamente',
          icon: 'add'
        })
      }

      // Resetear formulario y cerrar diálogo
      this.videoForm = {
        title: '',
        description: '',
        thumbnail: null,
        videoFile: null
      }
      this.editingVideo = null
      this.showAddVideoDialog = false
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

/* Estilos responsivos adicionales */
@media (max-width: 599px) {
  .video-player-container {
    margin-bottom: 20px;
  }
}
</style>
