<template>
  <q-page class="tutorial-page" :class="{ 'mobile-view': isMobileView }">
    <!-- Desktop Header (YouTube Style) -->
    <div v-if="!isMobileView" class="desktop-header">
      <div class="header-content">
        <div
          class="logo-section cursor-pointer"
          @click="$router.push({ name: 'Tutorial', query: {} })"
        >
          <img
            :src="`images/${$q.dark.isActive ? 'q-tutorials-white' : 'q-tutorials'}.png`"
            class="logo-img"
            alt="q-tutorials"
          />
          <span class="logo-text">Tutorials</span>
        </div>

        <div class="search-section">
          <q-form @submit="getVideos" class="search-form">
            <q-input
              v-model="searchQuery"
              placeholder="Buscar tutoriales"
              dense
              outlined
              class="search-input"
              clearable
              @clear="getVideos"
              @keyup.enter="getVideos"
            >
              <template v-slot:append>
                <q-btn
                  flat
                  round
                  icon="search"
                  class="search-btn"
                  @click="getVideos"
                />
              </template>
            </q-input>
          </q-form>
        </div>

        <div class="actions-section">
          <!-- Device Type Filter -->
          <q-btn-toggle
            v-model="deviceFilter"
            flat
            rounded
            toggle-color="primary"
            :options="[
              { value: 'all', slot: 'all' },
              { value: 'desktop', slot: 'desktop' },
              { value: 'mobile', slot: 'mobile' }
            ]"
            class="device-toggle q-mr-md"
            @update:model-value="getVideos"
          >
            <template v-slot:all>
              <q-icon name="devices" />
              <q-tooltip>Todos</q-tooltip>
            </template>
            <template v-slot:desktop>
              <q-icon name="desktop_windows" />
              <q-tooltip>Desktop</q-tooltip>
            </template>
            <template v-slot:mobile>
              <q-icon name="smartphone" />
              <q-tooltip>Mobile</q-tooltip>
            </template>
          </q-btn-toggle>

          <q-btn
            v-if="isSuperAdmin"
            color="primary"
            icon="add"
            label="Subir Video"
            class="upload-btn"
            unelevated
            @click="showAddVideoDialog = true"
          />
        </div>
      </div>
    </div>

    <!-- Mobile View Container -->
    <div v-if="isMobileView" class="mobile-layout bg-black text-white column" style="height: calc(100dvh - 56px); overflow: hidden;">

       <!-- Mobile Header (Only in Grid Mode) -->
       <div v-if="mobileViewMode === 'grid'" class="mobile-header q-pt-md q-px-md q-pb-xs bg-black">
          <div class="row no-wrap items-center q-mb-sm">
             <q-input
                dark dense outlined rounded
                v-model="searchQuery"
                placeholder="Descubre nuevos temas"
                class="col full-width search-input"
                bg-color="grey-9"
                borderless
                style="border-radius: 8px;"
                @keyup.enter="getVideos"
             >
                <template v-slot:prepend>
                   <q-icon name="search" color="grey-5" />
                </template>
             </q-input>
          </div>

          <!-- Badges -->
          <div class="row no-wrap scroll hide-scrollbar q-gutter-x-sm q-py-xs flex justify-center">
             <q-chip
               :color="deviceFilter === 'all' ? 'white' : 'grey-9'"
               :text-color="deviceFilter === 'all' ? 'black' : 'grey-5'"
               label="Para Ti"
               @click="deviceFilter = 'all'; getVideos()"
               clickable
               size="md"
               class="text-weight-bold"
             />
             <q-chip
               :color="deviceFilter === 'desktop' ? 'white' : 'grey-9'"
               :text-color="deviceFilter === 'desktop' ? 'black' : 'grey-5'"
               label="Desktop"
               @click="deviceFilter = 'desktop'; getVideos()"
               clickable
               size="md"
               class="text-weight-bold"
             />
          </div>
       </div>

       <!-- Mobile Content Area -->
       <div class="col relative-position mobile-content-area" ref="mobileContentArea" style="overflow: hidden; display: flex; flex-direction: column;">

          <!-- Grid Mode Content -->
          <div v-if="mobileViewMode === 'grid'" class="full-height scroll q-pa-xs">
             <div class="row q-col-gutter-xs">
                <div v-for="video in videos" :key="video.id" class="col-6" @click="selectVideoFromGrid(video)">
                   <q-card class="my-card bg-transparent no-shadow relative-position">
                      <!-- Aspect Ratio Container (9:16) -->
                      <div class="relative-position bg-black rounded-borders overflow-hidden" style="padding-top: 177.78%;">

                          <!-- Media Layer -->
                          <div class="absolute-full">
                              <q-img
                                v-if="video.miniature_url"
                                :src="video.miniature_url"
                                class="fit"
                                fit="cover"
                              />
                              <video
                                v-else
                                :src="video.video_url + '#t=0.1'"
                                class="fit"
                                style="object-fit: cover;"
                                muted
                                playsinline
                                preload="metadata"
                              ></video>
                          </div>

                          <!-- Overlay Info layer -->
                          <div class="absolute-bottom q-pa-xs transparent-gradient-bottom" style="background: transparent; z-index: 2;">
                            <div class="text-white text-weight-bold text-caption ellipsis-2-lines q-mb-xs" style="text-shadow: 1px 1px 2px black; line-height: 1.2;">
                               {{ video.title }}
                            </div>
                            <div class="row items-center no-wrap">
                               <q-avatar size="16px" class="q-mr-xs">
                                  <img :src="qBitsLogo.isoLogoColor" />
                               </q-avatar>
                               <div class="text-caption text-grey-4 ellipsis col">Qbits</div>
                               <div class="row items-center q-ml-sm">
                                  <q-icon name="favorite_border" size="12px" color="white" />
                                  <span class="text-caption q-ml-xs" style="font-size: 10px">{{ formatNumber(video.likes_count) }}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </q-card>
                </div>
             </div>
             <!-- Empty State for Grid -->
             <div v-if="videos.length === 0 && !loading" class="text-center q-pa-xl text-grey">
                No se encontraron videos
             </div>
          </div>

          <!-- Feed Mode Content (TikTok Style) -->
          <div v-else class="full-height bg-black relative-position">
             <!-- Top Bar Overlay -->
             <div class="absolute-top row justify-between items-center q-pa-md z-top" style="background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent); pointer-events: none;">
                <q-btn icon="arrow_back" flat round color="white" @click="mobileViewMode = 'grid'" dense style="pointer-events: auto;" />
                <div class="text-white text-weight-bold shadow-1" style="font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
                   Para ti
                </div>
                <!-- Search Button to go back to grid/discover -->
                <q-btn icon="search" flat round color="white" dense @click="mobileViewMode = 'grid'" style="pointer-events: auto;" />
             </div>

             <!-- Feed Container -->
              <div class="mobile-tiktok-container full-height" ref="mobileFeedRef">
                 <div
                    v-for="(video, index) in videos"
                    :key="video.id"
                    class="mobile-video-item full-height relative-position"
                    :data-index="index"
                 >
                    <!-- Video Layer -->
                    <div class="video-layer full-height" @click="toggleMobilePlay(index)">
                        <video
                            :src="video.video_url"
                            class="mobile-video-player full-height full-width"
                            style="object-fit: cover;"
                            loop
                            playsinline
                            :ref="el => { playerRefs[index] = el }"
                            :poster="video.miniature_url"
                        ></video>
                    </div>

                    <!-- Overlay Layer -->
                    <div class="absolute-full column justify-between pointer-events-none">
                        <!-- Spacer -->
                        <div class="col"></div>

                        <!-- Main Content (Bottom) -->
                        <div class="row no-wrap items-end q-pb-xl q-pl-md pointer-events-auto" style="margin-bottom: 60px;">
                            <!-- Left Info -->
                            <div class="col column q-pr-md">
                                <div class="text-weight-bold text-subtitle1 q-mb-xs">@Qbits</div>
                                <div class="text-body2 q-mb-sm ellipsis-3-lines">{{ video.description || video.title }}</div>
                                <div class="row items-center q-mb-xs">
                                    <q-icon name="music_note" size="xs" class="q-mr-xs" />
                                    <span class="text-caption">Sonido original - Qbits tutorial</span>
                                </div>
                            </div>

                            <!-- Right Actions -->
                            <div class="column items-center q-gutter-y-md q-pr-sm">
                                 <!-- Profile -->
                                 <div class="relative-position q-mb-xs">
                                     <q-avatar size="45px" class="q-mb-xs border-white">
                                         <img :src="qBitsLogo.isoLogoColor" />
                                     </q-avatar>
                                     <q-badge floating color="red" rounded class="absolute-bottom-right" style="bottom: -5px; right: 12px; padding: 0; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
                                         <q-icon name="add" size="12px" />
                                     </q-badge>
                                 </div>

                                 <!-- Like -->
                                 <div class="column items-center" @click.stop="toggleLike">
                                     <q-icon :name="selectedVideo && selectedVideo.id === video.id && selectedVideo.is_liked ? 'favorite' : 'favorite'"
                                             :color="selectedVideo && selectedVideo.id === video.id && selectedVideo.is_liked ? 'red' : 'white'"
                                             size="35px"
                                             style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));"
                                     />
                                     <span class="text-caption text-weight-bold">{{ formatNumber(video.likes_count) }}</span>
                                 </div>

                                 <!-- Comment -->
                                 <div class="column items-center" @click.stop="selectedVideo = video; showMobileComments = true">
                                     <q-icon name="chat_bubble" color="white" size="35px" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));" />
                                     <span class="text-caption text-weight-bold">{{ formatNumber(video.comments_count) }}</span>
                                 </div>
                                 <!-- Share -->
                                 <div class="column items-center" @click.stop="shareVideo">
                                     <q-icon name="reply" color="white" size="35px" style="transform: scaleX(-1); filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));" />
                                     <span class="text-caption text-weight-bold">Compartir</span>
                                 </div>
                                 <!-- Edit -->
                                 <div class="column items-center" @click.stop="editVideo(video)">
                                     <q-icon name="edit" color="white" size="35px" style="transform: scaleX(-1); filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));" />
                                     <span class="text-caption text-weight-bold">Editar</span>
                                 </div>
                            </div>
                        </div>

                        <!-- Add Comment Input at very bottom of screen (over video) -->
                        <div v-if="mobileViewMode === 'feed'" class="absolute-bottom q-pa-sm pointer-events-auto bg-black" style="z-index: 20;">
                             <q-input dark rounded outlined dense v-model="newComment" placeholder="Añadir comentario..." bg-color="grey-9" borderless>
                                <template v-slot:after>
                                   <q-btn round flat icon="send" color="primary" />
                                </template>
                             </q-input>
                        </div>
                    </div>
                 </div>
              </div>
          </div>
       </div>

       <!-- Bottom Navigation Footer -->
       <div class="mobile-footer bg-black row items-center justify-around q-py-sm border-top-grey" style="flex-shrink: 0; z-index: 50;">
          <div class="column items-center clickable" @click="mobileViewMode = 'grid'" :class="{'text-white': mobileViewMode === 'grid', 'text-grey-6': mobileViewMode !== 'grid'}">
             <q-icon :name="mobileViewMode === 'grid' ? 'home' : 'home'" size="26px" />
             <span style="font-size: 10px; margin-top: 2px;">Inicio</span>
          </div>

          <div v-if="isSuperAdmin" class="column items-center clickable" @click="showAddVideoDialog = true">
             <!-- Premium Custom Add Button -->
             <div class="custom-add-btn row items-center justify-center shadow-3 relative-position overflow-hidden"
                  style="width: 48px; height: 32px; border-radius: 12px; background: linear-gradient(135deg, var(--q-primary), #d500f9);">
                 <div class="absolute-full bg-white" style="opacity: 0.1"></div>
                 <q-icon name="add" color="white" size="24px" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3);" />
             </div>
          </div>

          <div class="column items-center clickable" @click="mobileViewMode = 'feed'" :class="{'text-white': mobileViewMode === 'feed', 'text-grey-6': mobileViewMode !== 'feed'}">
             <q-icon :name="mobileViewMode === 'feed' ? 'smart_display' : 'smart_display'" size="26px" />
             <span style="font-size: 10px; margin-top: 2px;">Videos</span>
          </div>
       </div>

      <!-- Mobile Comments Sheet -->
      <q-dialog v-model="showMobileComments" position="bottom" full-width>
        <q-card class="mobile-comments-sheet glass-morphism bg-grey-9 text-white">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Comentarios</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup color="white" />
          </q-card-section>
          <q-card-section class="comments-scroll">
            <TutorialComments
              v-if="selectedVideo"
              :tutorial-id="selectedVideo.id"
              :comments-count="selectedVideo.comments_count"
              :is-admin="isSuperAdmin"
              mobile
            />
          </q-card-section>
        </q-card>
      </q-dialog>

    </div>

    <!-- DESKTOP VIEW -->
    <div v-else class="main-content" :class="{ 'with-video': !!$route.query.videoId }">
      <!-- Video Player View -->
      <template v-if="$route.query.videoId && selectedVideo">
        <!-- Desktop Video Player (YouTube Style) -->
        <div v-if="!isMobileView" class="desktop-player-layout">
          <div class="player-main">
            <div class="video-container">
              <video
                ref="videoPlayer"
                :src="selectedVideo.video_url"
                controls
                class="main-video"
                @play="onVideoPlay"
              />
            </div>

            <div class="video-info-section">
              <h1 class="video-title">{{ selectedVideo.title }}</h1>

              <div class="video-meta">
                <div class="meta-left">
                  <span class="views-count">
                    <q-icon name="visibility" size="xs" />
                    {{ formatViews(selectedVideo.views_count) }} visualizaciones
                  </span>
                  <span class="separator">•</span>
                  <span class="upload-date">{{ formatDate(selectedVideo.created_at) }}</span>
                  <q-chip
                    v-if="selectedVideo.device_type !== 'both'"
                    dense
                    :icon="selectedVideo.device_type === 'desktop' ? 'desktop_windows' : 'smartphone'"
                    class="device-chip"
                  >
                    {{ selectedVideo.device_type === 'desktop' ? 'Desktop' : 'Mobile' }}
                  </q-chip>
                </div>

                <div class="meta-right">
                  <q-btn
                    :flat="!selectedVideo.is_liked"
                    :color="selectedVideo.is_liked ? 'primary' : undefined"
                    :outline="selectedVideo.is_liked"
                    class="like-btn"
                    @click="toggleLike"
                  >
                    <q-icon :name="selectedVideo.is_liked ? 'thumb_up' : 'thumb_up_off_alt'" />
                    <span class="like-count">{{ formatNumber(selectedVideo.likes_count) }}</span>
                  </q-btn>

                  <template v-if="isSuperAdmin">
                    <q-btn flat round icon="edit" color="primary" @click="editVideo(selectedVideo)">
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn flat round icon="delete" color="negative" @click="confirmDeleteVideo(selectedVideo)">
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </template>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Channel Info -->
              <div class="channel-info">
                <q-avatar size="48px">
                  <img :src="qBitsLogo.isoLogoColor" alt="Qbits" />
                </q-avatar>
                <div class="channel-details">
                  <div class="channel-name">Qbits</div>
                  <div class="channel-desc text-caption text-grey">Tutoriales oficiales</div>
                </div>
              </div>

              <!-- Description -->
              <div class="video-description" :class="{ expanded: descriptionExpanded }">
                <p>{{ selectedVideo.description }}</p>
                <q-btn
                  v-if="selectedVideo.description && selectedVideo.description.length > 200"
                  flat
                  dense
                  :label="descriptionExpanded ? 'Mostrar menos' : 'Mostrar más'"
                  @click="descriptionExpanded = !descriptionExpanded"
                />
              </div>

              <q-separator class="q-my-md" />

              <!-- Comments Section -->
              <TutorialComments
                :tutorial-id="selectedVideo.id"
                :comments-count="selectedVideo.comments_count"
                :is-admin="isSuperAdmin"
              />
            </div>
          </div>

          <!-- Recommended Videos Sidebar -->
          <div class="recommended-sidebar">
            <div class="sidebar-header">
              <span class="sidebar-title">Videos recomendados</span>
            </div>
            <div class="recommended-list">
              <div
                v-for="video in recommendedVideos"
                :key="video.id"
                class="recommended-card"
                @click="selectVideo(video)"
              >
                <div class="thumb-container relative-position bg-black">
                  <q-img
                    v-if="video.miniature_url"
                    :src="video.miniature_url"
                    :ratio="16/9"
                    class="video-thumb"
                  />
                  <div v-else class="video-thumb full-width" style="aspect-ratio: 16/9;">
                     <video
                        :src="video.video_url + '#t=0.1'"
                        class="fit"
                        style="object-fit: cover;"
                        muted
                        playsinline
                        preload="metadata"
                     ></video>
                  </div>
                  <q-chip
                    v-if="video.device_type !== 'both'"
                    dense
                    :icon="video.device_type === 'desktop' ? 'desktop_windows' : 'smartphone'"
                    class="device-indicator"
                  />
                </div>
                <div class="video-details">
                  <div class="video-card-title">{{ video.title }}</div>
                  <div class="video-card-meta">
                    <span>Qbits</span>
                    <span>{{ formatViews(video.views_count) }} vistas</span>
                  </div>
                </div>
              </div>

              <div v-if="recommendedVideos.length === 0" class="no-videos-msg">
                No hay más videos recomendados
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Video Player (TikTok Style) -->
        <div v-else class="mobile-player-layout">
          <div class="mobile-video-container">
            <video
              ref="videoPlayer"
              :src="selectedVideo.video_url"
              controls
              playsinline
              class="mobile-video"
              @play="onVideoPlay"
            />

            <!-- Mobile Video Overlay Actions -->
            <div class="mobile-video-overlay">
              <div class="overlay-left">
                <q-btn flat round icon="arrow_back" color="white" @click="goBack" />
              </div>

              <div class="overlay-right">
                <div class="action-item" @click="toggleLike">
                  <q-icon
                    :name="selectedVideo.is_liked ? 'favorite' : 'favorite_border'"
                    :color="selectedVideo.is_liked ? 'red' : 'white'"
                    size="32px"
                  />
                  <span>{{ formatNumber(selectedVideo.likes_count) }}</span>
                </div>

                <div class="action-item" @click="showMobileComments = true">
                  <q-icon name="chat_bubble_outline" color="white" size="32px" />
                  <span>{{ formatNumber(selectedVideo.comments_count) }}</span>
                </div>

                <div class="action-item" @click="shareVideo">
                  <q-icon name="share" color="white" size="32px" />
                  <span>Compartir</span>
                </div>

                <template v-if="isSuperAdmin">
                  <div class="action-item" @click="editVideo(selectedVideo)">
                    <q-icon name="edit" color="white" size="28px" />
                    <span>Editar</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Mobile Video Info -->
            <div class="mobile-video-info">
              <div class="info-header">
                <q-avatar size="36px">
                  <img :src="qBitsLogo.isoLogoColor" alt="Qbits" />
                </q-avatar>
                <span class="channel-name">Qbits</span>
              </div>
              <div class="video-title-mobile">{{ selectedVideo.title }}</div>
              <div class="video-desc-mobile" v-if="selectedVideo.description">
                {{ selectedVideo.description.slice(0, 100) }}
                <span v-if="selectedVideo.description.length > 100">...</span>
              </div>
            </div>
          </div>

          <!-- Mobile Comments Bottom Sheet -->
          <q-dialog v-model="showMobileComments" position="bottom" full-width>
            <q-card class="mobile-comments-sheet">
              <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">Comentarios</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>
              <q-card-section class="comments-scroll">
                <TutorialComments
                  :tutorial-id="selectedVideo.id"
                  :comments-count="selectedVideo.comments_count"
                  :is-admin="isSuperAdmin"
                  mobile
                />
              </q-card-section>
            </q-card>
          </q-dialog>
        </div>
      </template>

      <!-- Video Grid View -->
      <template v-else>
        <!-- Desktop Grid (YouTube Style) -->
        <div v-if="!isMobileView && videos.length > 0" class="desktop-grid">
          <!-- Admin Reorder Mode -->
          <div v-if="isSuperAdmin && reorderMode" class="reorder-toolbar">
            <q-icon name="drag_indicator" class="q-mr-sm" />
            <span>Modo de ordenamiento - Arrastra para reordenar</span>
            <q-space />
            <q-btn flat label="Guardar orden" color="primary" @click="saveOrder" />
            <q-btn flat label="Cancelar" @click="cancelReorder" />
          </div>

          <div v-if="isSuperAdmin && !reorderMode" class="admin-toolbar">
            <q-btn flat icon="reorder" label="Reordenar videos" @click="reorderMode = true" />
          </div>

          <draggable
            v-if="reorderMode"
            v-model="videos"
            item-key="id"
            class="video-grid draggable-grid"
            ghost-class="ghost"
            @end="onDragEnd"
          >
            <template #item="{ element: video }">
              <div class="video-card-wrapper">
                <VideoCard
                  :video="video"
                  :is-admin="isSuperAdmin"
                  draggable
                  @click="selectVideo(video)"
                  @edit="editVideo(video)"
                  @delete="confirmDeleteVideo(video)"
                />
              </div>
            </template>
          </draggable>

          <div v-else class="video-grid">
            <VideoCard
              v-for="video in videos"
              :key="video.id"
              :video="video"
              :is-admin="isSuperAdmin"
              @click="selectVideo(video)"
              @edit="editVideo(video)"
              @delete="confirmDeleteVideo(video)"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <q-img src="images/404.png" alt="No hay videos" class="empty-img" />
          <div class="empty-text">No hay tutoriales disponibles</div>
          <q-btn
            v-if="searchQuery"
            flat
            color="primary"
            label="Limpiar búsqueda"
            @click="searchQuery = ''; getVideos()"
          />
        </div>
      </template>
    </div>

    <!-- Viewers Dialog (Admin) -->
    <q-dialog v-model="showViewersDialog" persistent>
      <q-card class="viewers-dialog">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">
            <q-icon name="visibility" class="q-mr-sm" />
            Visualizaciones ({{ viewersTotal }})
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="viewers-list">
          <q-list>
            <q-item v-for="view in viewers" :key="view.id">
              <q-item-section avatar>
                <q-avatar>
                  <img v-if="view.user?.avatar" :src="view.user.avatar" alt="avatar" />
                  <q-icon v-else name="person" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ view.user?.name || 'Usuario desconocido' }}</q-item-label>
                <q-item-label caption>{{ view.user?.email }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>{{ formatDate(view.viewed_at, 'DD/MM/YYYY HH:mm') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-if="viewers.length === 0" class="text-center q-pa-md text-grey">
            No hay visualizaciones registradas
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Likers Dialog (Admin) -->
    <q-dialog v-model="showLikersDialog" persistent>
      <q-card class="likers-dialog">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">
            <q-icon name="thumb_up" class="q-mr-sm" />
            Likes ({{ likersTotal }})
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="likers-list">
          <q-list>
            <q-item v-for="like in likers" :key="like.id">
              <q-item-section avatar>
                <q-avatar>
                  <img v-if="like.user?.avatar" :src="like.user.avatar" alt="avatar" />
                  <q-icon v-else name="person" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ like.user?.name || 'Usuario desconocido' }}</q-item-label>
                <q-item-label caption>{{ like.user?.email }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>{{ formatDate(like.created_at, 'DD/MM/YYYY HH:mm') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-if="likers.length === 0" class="text-center q-pa-md text-grey">
            No hay likes todavía
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Video Dialog -->
    <q-dialog v-model="showAddVideoDialog" persistent transition-show="scale" transition-hide="scale" backdrop-filter="blur(4px)">
      <q-card class="video-form-dialog shadow-24">
        <q-card-section class="row items-center q-pa-lg border-bottom-theme">
          <div class="text-h5 text-weight-bold">
            {{ editingVideo ? 'Editar Video' : 'Subir Nuevo Video' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup class="text-grey-5" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit="saveVideo" class="row q-col-gutter-xl">
            <!-- Left Column: Media Upload -->
            <div class="col-12 col-md-5">
              <div class="media-upload-section full-height column">
                 <!-- Video Upload -->
                 <div class="col-auto">
                    <div class="text-subtitle2 q-mb-sm opacity-60">Video del tutorial</div>
                    <q-file
                      v-model="videoForm.video"
                      borderless
                      class="upload-drop-zone video-zone input-bg"
                      accept=".mp4,.webm,.ogg"
                      :disable="!!editingVideo && !videoForm.video"
                    >
                      <template v-slot:file="{ file }">
                        <div class="file-preview">
                          <q-icon name="movie" size="lg" color="primary" />
                          <div class="file-name text-caption ellipsis q-mt-sm">{{ file.name }}</div>
                          <div class="text-caption text-grey">{{ (file.size / (1024*1024)).toFixed(2) }} MB</div>
                        </div>
                      </template>
                      <template v-slot:default>
                         <div v-if="!videoForm.video" class="upload-placeholder column items-center justify-center full-height">
                            <template v-if="editingVideo">
                                <q-icon name="play_circle" size="48px" color="primary" />
                                <div class="text-caption">Video cargado</div>
                                <div class="text-caption text-grey-6" style="font-size: 11px">Click para reemplazar</div>
                            </template>
                            <template v-else>
                                <q-icon name="cloud_upload" size="48px" color="grey-6" />
                                <div class="text-body2 q-mt-md text-grey-5 text-center">Arrastra tu video aquí</div>
                            </template>
                         </div>
                      </template>
                    </q-file>
                 </div>

                 <!-- Miniature Upload -->
                 <div class="col-auto q-mt-lg">
                    <div class="text-subtitle2 q-mb-sm opacity-60">
                       Miniatura <span class="text-caption opacity-40 text-weight-regular">(Opcional)</span>
                    </div>
                    <q-file
                      v-model="videoForm.miniature"
                      borderless
                      class="upload-drop-zone miniature-zone input-bg"
                      accept=".jpg,.jpeg,.png,.webp"
                    >
                      <template v-slot:file>
                        <div class="file-preview">
                          <q-img :src="videoForm.miniatureUrl" class="miniature-preview-img" fit="cover" />
                        </div>
                      </template>
                      <template v-slot:default>
                        <div v-if="!videoForm.miniature" class="upload-placeholder column items-center justify-center full-height">
                          <template v-if="editingVideo && videoForm.currentMiniatureUrl">
                             <q-img :src="videoForm.currentMiniatureUrl" class="current-miniature-bg" fit="cover">
                               <div class="absolute-full flex flex-center bg-black-50 hover-reveal">
                                  <q-icon name="edit" color="white" size="md" />
                               </div>
                             </q-img>
                          </template>
                          <template v-else>
                            <q-icon name="image" size="36px" color="grey-6" />
                            <div class="text-caption q-mt-sm text-grey-5">Arrastra imagen</div>
                          </template>
                        </div>
                      </template>
                    </q-file>
                 </div>
              </div>
            </div>

            <!-- Right Column: Details -->
            <div class="col-12 col-md-7">
              <div class="column q-gutter-y-md">
                <q-input
                  v-model="videoForm.title"
                  label="Título del video"
                  outlined
                  rounded
                  :dark="$q.dark.isActive"
                  class="input-bg rounded-borders"
                  bg-color="transparent"
                  :label-color="$q.dark.isActive ? 'grey-5' : 'grey-7'"
                  color="primary"
                  :rules="[val => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="title" :color="$q.dark.isActive ? 'grey-6' : 'grey-7'" class="q-pl-sm" />
                  </template>
                </q-input>

                <div class="row q-col-gutter-md">
                   <div class="col-6">
                      <q-select
                        v-model="videoForm.device_type"
                        label="Dispositivo"
                        outlined
                        rounded
                        :dark="$q.dark.isActive"
                        class="input-bg rounded-borders"
                        bg-color="transparent"
                        :label-color="$q.dark.isActive ? 'grey-5' : 'grey-7'"
                        :options="deviceTypeOptions"
                        emit-value
                        map-options
                        :popup-content-class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-white text-black'"
                        dropdown-icon="expand_more"
                      >
                        <template v-slot:prepend>
                          <q-icon name="devices" :color="$q.dark.isActive ? 'grey-6' : 'grey-7'" class="q-pl-sm" />
                        </template>
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps" :class="$q.dark.isActive ? 'text-white hover-bg-grey-8' : 'text-black hover-bg-grey-2'">
                            <q-item-section avatar>
                              <q-icon :name="scope.opt.value === 'desktop' ? 'desktop_windows' : scope.opt.value === 'mobile' ? 'smartphone' : 'devices'" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                   </div>
                   <div class="col-6">
                      <q-select
                        v-model="videoForm.status"
                        label="Estado"
                        outlined
                        rounded
                        :dark="$q.dark.isActive"
                        class="input-bg rounded-borders"
                        bg-color="transparent"
                        :label-color="$q.dark.isActive ? 'grey-5' : 'grey-7'"
                        :options="statusOptions"
                        emit-value
                        map-options
                        :popup-content-class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-white text-black'"
                        dropdown-icon="expand_more"
                      >
                         <template v-slot:prepend>
                          <q-icon :name="videoForm.status === 'published' ? 'public' : videoForm.status === 'draft' ? 'edit_note' : 'visibility_off'" :color="$q.dark.isActive ? 'grey-6' : 'grey-7'" class="q-pl-sm" />
                        </template>
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps" :class="$q.dark.isActive ? 'text-white hover-bg-grey-8' : 'text-black hover-bg-grey-2'">
                             <q-item-section avatar>
                                <q-icon :name="scope.opt.value === 'published' ? 'public' : scope.opt.value === 'draft' ? 'edit_note' : 'visibility_off'" />
                             </q-item-section>
                             <q-item-section>{{ scope.opt.label }}</q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                   </div>
                </div>

                <q-input
                  v-model="videoForm.description"
                  label="Descripción"
                  outlined
                  rounded
                  :dark="$q.dark.isActive"
                  class="input-bg rounded-borders"
                  bg-color="transparent"
                  :label-color="$q.dark.isActive ? 'grey-5' : 'grey-7'"
                  type="textarea"
                  rows="6"
                  color="primary"
                />

                <q-input
                  v-model.number="videoForm.sort_order"
                  label="Orden (Prioridad)"
                  outlined
                  rounded
                  :dark="$q.dark.isActive"
                  class="input-bg rounded-borders"
                  bg-color="transparent"
                  :label-color="$q.dark.isActive ? 'grey-5' : 'grey-7'"
                  type="number"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <q-icon name="sort" :color="$q.dark.isActive ? 'grey-6' : 'grey-7'" class="q-pl-sm" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator :dark="$q.dark.isActive" />

        <q-card-actions align="right" class="q-pa-md action-bar">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup class="q-mr-sm" />
          <q-btn
            :label="editingVideo ? 'Guardar Cambios' : 'Subir Video'"
            color="primary"
            unelevated
            rounded
            padding="8px 24px"
            icon="cloud_upload"
            @click="saveVideo"
          />
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
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deleteVideo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatDate, loading, qBitsLogo, notify } from '../const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import VideoCard from 'src/components/tutorial/VideoCard.vue'
import TutorialComments from 'src/components/tutorial/TutorialComments.vue'
import { echo } from 'src/boot/pusher'

const $q = useQuasar()
const $route = useRoute()
const $router = useRouter()
const store = authentication()

// ... (other refs)

/**
 * Subscribe to tutorial channel
 * @param {number} tutorialId
 */
const subscribeToTutorial = (tutorialId) => {
  if (!echo) return

  // Unsubscribe from previous channel if exists
  if (selectedVideo.value && selectedVideo.value.id !== tutorialId) {
    echo.leave(`tutorial.${selectedVideo.value.id}`)
  }

  echo.channel(`tutorial.${tutorialId}`)
    .listen('.tutorial.liked', (e) => {
      if (selectedVideo.value && selectedVideo.value.id === e.tutorial_id) {
        selectedVideo.value.likes_count = e.likes_count
        // If current user is the one who liked, update is_liked status (handling sync issues)
        if (e.user.id === store.userSession.id) {
          selectedVideo.value.is_liked = e.is_liked
        }
      }
    })
    .listen('.comment.added', (e) => {
      if (selectedVideo.value && selectedVideo.value.id === e.tutorial_id) {
        selectedVideo.value.comments_count = e.comments_count
        // notify(`Nuevo comentario de ${e.comment.user_name}`, 'primary', 'chat_bubble')
      }
    })
}

/**
 * Unsubscribe from tutorial channel
 */
const unsubscribeFromTutorial = () => {
  if (selectedVideo.value && echo) {
    echo.leave(`tutorial.${selectedVideo.value.id}`)
  }
}

/**
 * Search query for videos
 * @type {string}
 */
const searchQuery = ref($route.query.search || '')

/**
 * Flag to check if user is super admin
 * @type {boolean}
 */
const isSuperAdmin = ref(store.userSession?.is_root || false)

/**
 * Currently selected video for playback
 * @type {object|null}
 */
const selectedVideo = ref(null)

/**
 * Flag to show the add/edit video dialog
 * @type {boolean}
 */
const showAddVideoDialog = ref(false)

/**
 * Flag to show delete confirmation dialog
 * @type {boolean}
 */
const showDeleteDialog = ref(false)

/**
 * Video being edited or null for new video
 * @type {object|null}
 */
const editingVideo = ref(null)

/**
 * Video marked for deletion
 * @type {object|null}
 */
const videoToDelete = ref(null)

/**
 * Form data for creating/editing videos
 * @type {object}
 */
const videoForm = ref({
  title: '',
  description: '',
  status: 'published',
  device_type: 'both',
  sort_order: 0,
  miniature: null,
  video: null,
  miniatureUrl: null, // For local preview
  currentMiniatureUrl: null // For existing video editing
})

/**
 * List of all videos
 * @type {array}
 */
const videos = ref([])

/**
 * Device type filter
 * @type {string}
 */
const deviceFilter = ref('all')

const showMobileComments = ref(false)

/**
 * Mobile Feed Refs
 */
const mobileFeedRef = ref(null)
const playerRefs = ref({})
const videoObserver = ref(null)
const mobileViewMode = ref('feed') // 'feed' | 'grid'

/**
 * Select video from mobile grid
 */
const selectVideoFromGrid = (video) => {
  mobileViewMode.value = 'feed'
  selectedVideo.value = video
  // Scroll to video will be handled by watcher or we can enforce it
  setTimeout(() => {
    const index = videos.value.findIndex(v => v.id === video.id)
    if (index !== -1 && playerRefs.value[index]) {
      playerRefs.value[index].scrollIntoView({ behavior: 'auto' })
    }
  }, 100)
}

/**
 * Handle mobile feed scroll / intersection
 */
const initMobileObserver = () => {
  if (!isMobileView.value) return

  const options = {
    root: null,
    threshold: 0.6 // 60% visibility required
  }

  videoObserver.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const index = parseInt(entry.target.dataset.index)
      const videoElement = playerRefs.value[index]

      if (entry.isIntersecting) {
        // Video is visible
        if (videoElement) {
          videoElement.play().catch(() => {
            // Autoplay blocked handling
            videoElement.muted = true
            videoElement.play()
          })
          // Set as selected video for URL/Stats context
          if (videos.value[index] && (!selectedVideo.value || selectedVideo.value.id !== videos.value[index].id)) {
            // Don't trigger full reload, just update context
            selectedVideo.value = videos.value[index]
            // Update URL silently
            const newUrl = $router.resolve({
              name: 'Tutorial',
              query: { videoId: selectedVideo.value.id }
            }).href
            window.history.replaceState({}, '', newUrl)

            // Subscribe to new channel
            subscribeToTutorial(selectedVideo.value.id)
          }
        }
      } else {
        // Video is not visible
        if (videoElement) {
          videoElement.pause()
          videoElement.currentTime = 0
        }
      }
    })
  }, options)
}

/**
 * Observe elements
 */
const observeMobileVideos = () => {
  if (!videoObserver.value) initMobileObserver()

  // Wait for DOM
  setTimeout(() => {
    const elements = document.querySelectorAll('.mobile-video-item')
    elements.forEach(el => videoObserver.value.observe(el))
  }, 500)
}

watch(videos, () => {
  if (isMobileView.value && videos.value.length > 0) {
    observeMobileVideos()
  }
})

watch(mobileViewMode, (val) => {
  if (val === 'feed') {
    // Wait for DOM
    setTimeout(() => {
      observeMobileVideos()
    }, 300)
  } else {
    // Stop playing videos if switching away
    Object.values(playerRefs.value).forEach(video => {
      if (video) video.pause()
    })
  }
})

/**
 * Toggle play/pause on mobile tap
 */
const toggleMobilePlay = (index) => {
  const video = playerRefs.value[index]
  if (video) {
    if (video.paused) video.play()
    else video.pause()
  }
}

/**
 * Flag for description expansion
 * @type {boolean}
 */
const descriptionExpanded = ref(false)

/**
 * Reorder mode for admin
 * @type {boolean}
 */
const reorderMode = ref(false)

/**
 * Original order before reordering
 * @type {array}
 */
const originalOrder = ref([])

/**
 * Viewers dialog visibility
 * @type {boolean}
 */
const showViewersDialog = ref(false)

/**
 * List of viewers
 * @type {array}
 */
const viewers = ref([])

/**
 * Total viewers count
 * @type {number}
 */
const viewersTotal = ref(0)

/**
 * Likers dialog visibility
 * @type {boolean}
 */
const showLikersDialog = ref(false)

/**
 * List of likers
 * @type {array}
 */
const likers = ref([])

/**
 * Total likers count
 * @type {number}
 */
const likersTotal = ref(0)

/**
 * Video player reference
 * @type {object}
 */
const videoPlayer = ref(null)

/**
 * Status options for video
 * @type {array}
 */
const statusOptions = [
  { value: 'published', label: 'Publicado' },
  { value: 'draft', label: 'Borrador' },
  { value: 'hidden', label: 'Oculto' }
]

/**
 * Device type options for video
 * @type {array}
 */
const deviceTypeOptions = [
  { value: 'both', label: 'Ambos dispositivos' },
  { value: 'desktop', label: 'Solo Desktop' },
  { value: 'mobile', label: 'Solo Mobile' }
]

/**
 * Check if current view is mobile
 * @type {boolean}
 */
const isMobileView = computed(() => {
  return $q.screen.lt.md
})

/**
 * Get recommended videos (excluding current)
 * @type {array}
 */
const recommendedVideos = computed(() => {
  if (!selectedVideo.value) return []
  return videos.value.filter(video => video.id !== selectedVideo.value.id).slice(0, 10)
})

/**
 * Reset video form to initial state
 */
const resetVideoForm = () => {
  videoForm.value = {
    title: '',
    description: '',
    status: 'published',
    device_type: 'both',
    sort_order: 0,
    miniature: null,
    video: null,
    miniatureUrl: null,
    currentMiniatureUrl: null
  }
  editingVideo.value = null
}

/**
 * Watch dialog close to reset form
 */
watch(showAddVideoDialog, (val) => {
  if (!val) {
    resetVideoForm()
  }
})

/**
 * Watch route for video ID changes
 */
watch(() => $route.query.videoId, (id) => {
  if (!id) {
    if (selectedVideo.value) {
      unsubscribeFromTutorial()
    }
    selectedVideo.value = null
    getVideos()
    return
  }
  getVideo(id)
})

/**
 * Set device filter based on user device on mount
 */
onMounted(() => {
  // Set initial filter based on device type
  if (isMobileView.value) {
    deviceFilter.value = 'mobile'
  }

  if ($route.query.videoId) {
    getVideo($route.query.videoId)
  }

  getVideos().then(() => {
    if (isMobileView.value) {
      observeMobileVideos()
    }
  })
})

onUnmounted(() => {
  unsubscribeFromTutorial()
})

/**
 * Select a video and navigate to it
 * @param {object} video - Video to select
 */
const selectVideo = (video) => {
  $router.push({ name: 'Tutorial', query: { videoId: video.id } })
}

/**
 * Go back to video list
 */
const goBack = () => {
  $router.push({ name: 'Tutorial' })
}

/**
 * Format view count for display
 * @param {number} count - View count
 * @returns {string} Formatted view count
 */
const formatViews = (count) => {
  if (!count) return '0'
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

/**
 * Format number for display (likes, comments)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Fetch all videos
 */
const getVideos = async () => {
  try {
    loading(true)
    const params = {
      dataEqualFilter: {
        status: 'published'
      },
      dataSearch: {
        title: searchQuery.value
      },
      use_sort_order: true,
      sortBy: 'sort_order',
      sortOrder: 'asc',
      perPage: 100,
      paginate: true
    }

    if (deviceFilter.value !== 'all') {
      params.device_type = deviceFilter.value
    }

    const { data } = await api.get('tutorials', { params })
    videos.value = data.data || data
  } catch (error) {
    notify(error.message || 'Error al cargar videos', 'negative', 'warning')
  } finally {
    loading(false)
  }
}

/**
 * Fetch a single video by ID
 * @param {number} id - Video ID
 */
const getVideo = async (id) => {
  try {
    loading(true)
    const { data } = await api.get(`tutorials/${id}`)
    selectedVideo.value = data
    subscribeToTutorial(data.id)
    // Also load videos for recommendations
    if (videos.value.length === 0) {
      await getVideos()
    }
  } catch (error) {
    notify(error.message || 'Error al cargar el video', 'negative', 'warning')
  } finally {
    loading(false)
  }
}

/**
 * Handle video play event - Record view
 */
const onVideoPlay = async () => {
  if (!selectedVideo.value) return
  try {
    await api.post(`tutorials/${selectedVideo.value.id}/view`)
    selectedVideo.value.views_count++
  } catch (error) {
    console.error('Error recording view:', error)
  }
}

/**
 * Toggle like on current video
 */
const toggleLike = async () => {
  if (!selectedVideo.value) return
  try {
    const { data } = await api.post(`tutorials/${selectedVideo.value.id}/like`)
    selectedVideo.value.is_liked = data.liked
    selectedVideo.value.likes_count = data.likes_count
  } catch (error) {
    notify(error.message || 'Error al dar like', 'negative', 'warning')
  }
}

/**
 * Share video (copy link)
 */
const shareVideo = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    notify('Enlace copiado al portapapeles', 'positive', 'content_copy')
  })
}

/**
/**
 * Watch for new miniature file selection to create preview URL
 */
watch(() => videoForm.value.miniature, (file) => {
  if (file) {
    videoForm.value.miniatureUrl = URL.createObjectURL(file)
  } else {
    videoForm.value.miniatureUrl = null
  }
})

/**
 * Edit video - Open dialog with video data
 * @param {object} video - Video to edit
 */
const editVideo = (video) => {
  editingVideo.value = video
  videoForm.value = {
    title: video.title,
    description: video.description,
    status: video.status,
    device_type: video.device_type || 'both',
    sort_order: video.sort_order || 0,
    miniature: null,
    video: null,
    miniatureUrl: null, // Reset local preview
    currentMiniatureUrl: video.miniature_url // Store existing URL
  }
  showAddVideoDialog.value = true
}

// ...

/**
 * Confirm delete video
 * @param {object} video - Video to delete
 */
const confirmDeleteVideo = (video) => {
  videoToDelete.value = video
  showDeleteDialog.value = true
}

/**
 * Delete video
 */
const deleteVideo = async () => {
  if (!videoToDelete.value) return
  try {
    loading(true)
    await api.delete(`tutorials/${videoToDelete.value.id}`)
    notify('Video eliminado correctamente', 'positive', 'delete')
    videoToDelete.value = null
    showDeleteDialog.value = false
    $router.push({ name: 'Tutorial' })
    await getVideos()
  } catch (error) {
    notify(error.message || 'Error al eliminar', 'negative', 'warning')
  } finally {
    loading(false)
  }
}

/**
 * Save video (create or update)
 */
const saveVideo = async () => {
  if (!videoForm.value.title) {
    notify('El título es requerido', 'negative', 'warning')
    return
  }

  try {
    loading(true)
    const formData = new FormData()
    formData.append('title', videoForm.value.title)
    formData.append('description', videoForm.value.description || '')
    formData.append('status', videoForm.value.status)
    formData.append('device_type', videoForm.value.device_type)
    formData.append('sort_order', videoForm.value.sort_order || 0)

    if (videoForm.value.miniature) {
      formData.append('miniature', videoForm.value.miniature)
    }
    if (videoForm.value.video) {
      formData.append('video', videoForm.value.video)
    }

    const config = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        loading(true, { message: `Subiendo archivo... ${percentCompleted}%` })
      }
    }

    if (editingVideo.value) {
      formData.append('_method', 'put')
      const { data } = await api.post(`tutorials/${editingVideo.value.id}`, formData, config)
      if (selectedVideo.value && selectedVideo.value.id === editingVideo.value.id) {
        selectedVideo.value = data
      }
      notify('Video actualizado correctamente', 'positive', 'edit')
    } else {
      // Validate required fields for new video
      if (!videoForm.value.video) {
        notify('El archivo de video es requerido', 'negative', 'warning')
        loading(false)
        return
      }
      // Miniature is now optional

      await api.post('tutorials', formData, config)
      notify('Video agregado correctamente', 'positive', 'add')
    }

    showAddVideoDialog.value = false
    resetVideoForm()
    await getVideos()
  } catch (error) {
    notify(error.message || 'Error al guardar', 'negative', 'warning')
  } finally {
    loading(false)
  }
}

/**
 * Handle drag end for reordering
 */
const onDragEnd = () => {
  // Order is updated automatically by draggable
}

/**
 * Save new video order
 */
const saveOrder = async () => {
  try {
    loading(true)
    const tutorials = videos.value.map((video, index) => ({
      id: video.id,
      sort_order: index + 1
    }))

    await api.post('tutorials/reorder', { tutorials })
    notify('Orden guardado correctamente', 'positive', 'reorder')
    reorderMode.value = false
  } catch (error) {
    notify(error.message || 'Error al guardar orden', 'negative', 'warning')
  } finally {
    loading(false)
  }
}

/**
 * Cancel reordering
 */
const cancelReorder = () => {
  videos.value = [...originalOrder.value]
  reorderMode.value = false
}

/**
 * Enable reorder mode
 */
watch(reorderMode, (val) => {
  if (val) {
    originalOrder.value = [...videos.value]
  }
})

</script>

<style lang="scss" scoped>
.tutorial-page {
  min-height: 100vh;
  background: var(--q-background, #f5f5f5);

  body.body--dark & {
    background: #0f0f0f;
  }
}

// Desktop Header (YouTube Style)
.desktop-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--q-background, #ffffff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px 24px;

  body.body--dark & {
    background: #0f0f0f;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 24px;
    max-width: 1800px;
    margin: 0 auto;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .logo-img {
      width: 36px;
      height: 40px;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--q-primary);
    }
  }

  .search-section {
    flex: 1;
    max-width: 600px;

    .search-form {
      width: 100%;
    }

    .search-input {
      :deep(.q-field__control) {
        border-radius: 24px;
      }
    }
  }

  .actions-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .device-toggle {
    :deep(.q-btn) {
      padding: 6px 12px;
    }
  }

  .upload-btn {
    border-radius: 24px;
  }
}

// Mobile Header (TikTok Style)
.mobile-header {
  display: column;
  align-items: center;
  justify-content: space-between;
  background: var(--q-background);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;

  body.body--dark & {
    background: #0f0f0f;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .mobile-tabs {
    display: flex;
    gap: 8px;

    .q-btn {
      font-weight: 500;
      opacity: 0.6;
      transition: all 0.2s;

      &.active-tab {
        opacity: 1;
        font-weight: 700;
      }
    }
  }

  .mobile-actions {
    display: flex;
    gap: 4px;
  }
}

.mobile-search-bar {
  padding: 8px 16px 16px;
  background: var(--q-background);

  body.body--dark & {
    background: #0f0f0f;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

// Main Content
.main-content {
  padding: 24px;
  max-width: 1800px;
  margin: 0 auto;

  &.with-video {
    padding: 0;
  }
}

// Desktop Player Layout (YouTube Style)
.desktop-player-layout {
  display: flex;
  gap: 24px;
  padding: 24px;

  .player-main {
    flex: 1;
    max-width: 1100px;

    .video-container {
      position: relative;
      background: #000;
      border-radius: 12px;
      overflow: hidden;

      .main-video {
        width: 100%;
        max-height: 500px;
        object-fit: contain;
      }
    }

    .video-info-section {
      padding: 16px 0;
    }

    .video-title {
      font-size: 1.375rem;
      font-weight: 600;
      margin: 0 0 12px;
      line-height: 1.3;
    }

    .video-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;

      .meta-left {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--q-grey-6);
        font-size: 0.875rem;

        .separator {
          color: var(--q-grey-5);
        }

        .device-chip {
          font-size: 0.75rem;
        }
      }

      .meta-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .like-btn {
          border-radius: 24px;
          padding: 6px 16px;

          .like-count {
            margin-left: 6px;
          }
        }
      }
    }

    .channel-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;

      .channel-details {
        .channel-name {
          font-weight: 600;
          font-size: 1rem;
        }
      }
    }

    .video-description {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      padding: 12px;
      margin: 12px 0;
      max-height: 100px;
      overflow: hidden;
      transition: max-height 0.3s ease;

      body.body--dark & {
        background: rgba(255, 255, 255, 0.1);
      }

      &.expanded {
        max-height: none;
      }

      p {
        margin: 0;
        white-space: pre-wrap;
      }
    }
  }

  .recommended-sidebar {
    width: 400px;
    flex-shrink: 0;

    .sidebar-header {
      margin-bottom: 16px;

      .sidebar-title {
        font-weight: 600;
        font-size: 1rem;
      }
    }

    .recommended-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recommended-card {
      display: flex;
      gap: 12px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.05);

        body.body--dark & {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .thumb-container {
        position: relative;
        width: 168px;
        flex-shrink: 0;

        .video-thumb {
          border-radius: 8px;
        }

        .device-indicator {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 0.625rem;
        }
      }

      .video-details {
        flex: 1;
        min-width: 0;

        .video-card-title {
          font-weight: 600;
          font-size: 0.875rem;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .video-card-meta {
          color: var(--q-grey-6);
          font-size: 0.75rem;
          margin-top: 4px;

          span + span::before {
            content: ' • ';
          }
        }
      }
    }

    .no-videos-msg {
      text-align: center;
      color: var(--q-grey-6);
      padding: 24px;
    }
  }
}

// Mobile Player Layout (TikTok Style)
.mobile-player-layout {
  position: relative;
  height: calc(100vh - 50px);

  .mobile-video-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;

    .mobile-video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .mobile-video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;

      .overlay-left {
        position: absolute;
        top: 16px;
        left: 16px;
        pointer-events: auto;
      }

      .overlay-right {
        position: absolute;
        right: 16px;
        bottom: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        pointer-events: auto;

        .action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
          cursor: pointer;

          span {
            font-size: 0.75rem;
            font-weight: 600;
          }
        }
      }
    }

    .mobile-video-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 70px;
      padding: 16px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      color: white;

      .info-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .channel-name {
          font-weight: 600;
        }
      }

      .video-title-mobile {
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 4px;
      }

      .video-desc-mobile {
        font-size: 0.875rem;
        opacity: 0.9;
      }
    }
  }
}

.mobile-comments-sheet {
  max-height: 70vh;
  border-radius: 16px 16px 0 0;

  .comments-scroll {
    max-height: calc(70vh - 60px);
    overflow-y: auto;
  }
}

// Desktop Video Grid (YouTube Style)
.desktop-grid {
  .reorder-toolbar,
  .admin-toolbar {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: rgba(var(--q-primary-rgb), 0.1);
    border-radius: 8px;
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;

    &.draggable-grid {
      cursor: grab;
    }
  }

  .ghost {
    opacity: 0.5;
    background: var(--q-primary);
    border-radius: 12px;
  }

  .video-card-wrapper {
    display: contents;
  }
}

// Mobile Feed (TikTok Style)
.mobile-feed {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px;

  .mobile-video-card {
    cursor: pointer;

    .mobile-thumb-container {
      position: relative;
      border-radius: 8px;
      overflow: hidden;

      .mobile-thumb {
        filter: brightness(0.9);
      }

      .mobile-thumb-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 8px;
        color: white;

        .play-icon {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
        }

        .video-stats {
          font-size: 0.75rem;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
      }
    }

    .mobile-card-info {
      padding: 8px 4px;

      .mobile-card-title {
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .mobile-card-meta {
        font-size: 0.75rem;
        color: var(--q-grey-6);
        margin-top: 2px;

        span + span::before {
          content: ' • ';
        }
      }
    }
  }
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;

  .empty-img {
    max-width: 400px;
    width: 100%;
    margin-bottom: 24px;
  }

  .empty-text {
    font-size: 1.125rem;
    color: var(--q-grey-6);
    margin-bottom: 16px;
  }
}

// Dialogs
.video-form-dialog {
  width: 500px;
  max-width: 95vw;
}

.viewers-dialog,
.likers-dialog {
  width: 500px;
  max-width: 95vw;

  .viewers-list,
  .likers-list {
    max-height: 400px;
  }
}

// Video Form Dialog Styles
.video-form-dialog {
  width: 900px; /* Wider dialog */
  max-width: 95vw;
  border-radius: 24px;
  background: white;
  color: black;

  body.body--dark & {
     background: #1d1d1d;
     color: white;
     border: 1px solid rgba(255,255,255,0.1);
  }

  .border-bottom-theme {
     border-bottom: 1px solid #e0e0e0;
     body.body--dark & {
        border-bottom: 1px solid rgba(255,255,255,0.1);
     }
  }

  .input-bg {
     background: #f1f3f4;
     body.body--dark & {
        background: #2d2d2d;
     }
  }

  .action-bar {
     background: #f8f9fa;
     border-top: 1px solid #e0e0e0;
     body.body--dark & {
        background: #1d1d1d;
        border-top: 1px solid rgba(255,255,255,0.1);
     }
  }

  .upload-drop-zone {
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 12px;
    transition: all 0.2s ease;
    cursor: pointer;
    overflow: hidden;

    &:hover {
      border-color: var(--q-primary);
      background: #f1f3f5;
    }

    body.body--dark & {
      background: #1e1e1e;
      border-color: #333;

      &:hover {
        background: #252525;
        border-color: var(--q-primary);
      }
    }

    &.video-zone {
      height: 200px;
    }

    &.miniature-zone {
      height: 140px;
    }

    :deep(.q-field__control) {
      height: 100%;
      padding: 0;

      &:before, &:after {
        display: none;
      }
    }

    :deep(.q-field__native) {
      height: 100%;
      padding: 0;
    }

    :deep(.q-field__control-container) {
       width: 100%;
       display: flex;
       align-items: center;
       justify-content: center;
    }

    .upload-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }

    .file-preview {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: #e3f2fd;
      border-radius: 10px;

      body.body--dark & {
        background: rgba(var(--q-primary-rgb), 0.15);
      }
    }

    .current-miniature-bg {
      width: 100%;
      height: 100%;
      border-radius: 10px;
    }
  }

  .bg-black-50 {
    background: rgba(0,0,0,0.5);
  }

  .hover-reveal {
     opacity: 0;
     transition: opacity 0.2s;
  }
  .upload-drop-zone:hover .hover-reveal {
     opacity: 1;
  }

  .miniature-preview-img {
    max-width: 100%;
    max-height: 100px;
    border-radius: 4px;
    margin-bottom: 8px;
  }
}

// Mobile View Adjustments
.mobile-view {
  .main-content {
    padding: 0;
  }
}
// Mobile TikTok Style Feed
.mobile-tiktok-container {
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  background: #000;
  position: relative;

  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mobile-video-item {
  height: 100%;
  width: 100%;
  scroll-snap-align: start;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
}

.video-layer {
  width: 100%;
  height: 100%;

  .mobile-video-player {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Cover full screen like TikTok */
  }
}

.overlay-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let clicks pass to video layer */
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.overlay-top {
  height: 100px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
}

.actions-right {
  position: absolute;
  right: 12px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  pointer-events: auto;

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .icon-wrapper {
       padding: 10px;
       border-radius: 50%;
       background: rgba(0,0,0,0.4);
       transition: transform 0.2s;

       &:active {
         transform: scale(0.9);
       }

       &.glass {
         backdrop-filter: blur(4px);
       }
    }

    .action-label {
      color: white;
      font-size: 12px;
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    }
  }
}

.info-bottom {
  padding: 16px 60px 40px 16px; /* Increased bottom padding for comment input space */
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  pointer-events: auto;
  color: white;
  margin-bottom: 40px;

  .channel-pill {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px 4px 4px;
    border-radius: 20px;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(4px);
  }

  .video-title-overlay {
    font-size: 16px;
    font-weight: 600;
    margin: 8px 0 4px;
    line-height: 1.3;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  }

  .video-desc-overlay {
    opacity: 0.9;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  }
}

.transparent-gradient-bottom {
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%) !important;
}

.rotating-disc {
  animation: rotate 5s linear infinite;
  border: 4px solid #222;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.border-white {
  border: 1px solid white;
}

.border-top-grey {
  border-top: 1px solid rgba(255,255,255,0.1);
}

.mobile-comments-sheet {
  height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--q-background, #fff);

  body.body--dark & {
    background: #1a1a1a;
  }

  .comments-scroll {
    flex: 1;
    overflow-y: auto;
  }
}

/* Adjust Empty State for full height */
.full-height {
  height: 100vh;
}
</style>
