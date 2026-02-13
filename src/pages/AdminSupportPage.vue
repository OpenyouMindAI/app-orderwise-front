<template>
  <q-page class="support-chat-page">
    <div class="chat-container">
      <!-- Sidebar estilo WhatsApp -->
      <div class="chat-sidebar" :class="{ 'mobile-hidden': selectedChat && $q.screen.lt.md }">
        <!-- Modern Header -->
        <div class="sidebar-header">
          <div class="header-left">
            <q-avatar size="45px" class="header-avatar shadow-2">
              <img v-if="currentUser?.avatar" :src="currentUser.avatar" />
              <div v-else class="avatar-fallback bg-white text-primary">
                {{ getInitials(currentUser?.name) }}
              </div>
              <q-tooltip>Mi Perfil (Admin)</q-tooltip>
            </q-avatar>
            <div class="header-text">
              <div class="header-title">QSoporte</div>
              <div class="header-subtitle">{{ currentUser?.name || 'Administrador' }}</div>
            </div>
          </div>
          <div class="header-actions row no-wrap q-gutter-xs">
            <q-btn flat round dense icon="search" size="sm" color="white" @click="showSearch = !showSearch">
              <q-tooltip>{{ showSearch ? 'Ocultar búsqueda' : 'Buscar' }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="refresh" size="sm" color="white"
              @click="sidebarView === 'chats' ? loadChats() : fetchUsers()" :loading="loading">
              <q-tooltip>Actualizar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="chat" size="sm" color="white"
              @click="sidebarView = sidebarView === 'users' ? 'chats' : 'users'; sidebarView === 'users' ? fetchUsers() : loadChats()">
              <q-tooltip>{{ sidebarView === 'users' ? 'Ver chats' : 'Nuevo chat' }}</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Search Bar Modern -->
        <transition name="q-transition--scale">
          <div class="sidebar-search" v-if="showSearch">
            <q-input
              v-if="sidebarView === 'chats'"
              v-model="filters.search"
              dense
              rounded
              outlined
              placeholder="Buscar conversaciones..."
              class="search-input"
              @keyup.enter="loadChats()"
              autofocus
            >
              <template v-slot:prepend>
                <q-icon name="search" size="20px" color="grey-6" />
              </template>
            </q-input>
            <q-input
              v-else
              v-model="userSearch"
              dense
              rounded
              outlined
              placeholder="Buscar personas..."
              class="search-input"
              @keyup.enter="fetchUsers()"
              autofocus
            >
              <template v-slot:prepend>
                <q-icon name="search" size="20px" color="grey-6" />
              </template>
            </q-input>
          </div>
        </transition>

        <!-- Modern Tabs -->
        <div class="sidebar-tabs">
          <div
            class="tab-item"
            :class="{ active: sidebarView === 'chats' }"
            @click="sidebarView = 'chats'; loadChats()"
          >
            <span>Chats</span>
            <q-badge v-if="unreadCount > 0" color="negative" floating>{{ unreadCount }}</q-badge>
          </div>
          <div
            class="tab-item"
            :class="{ active: sidebarView === 'users' }"
            @click="sidebarView = 'users'; fetchUsers()"
          >
            <span>Personas</span>
          </div>
        </div>

        <!-- Sidebar Content -->
        <div class="chat-list">
          <transition name="fade" mode="out-in">
            <!-- ===== LISTA DE CHATS ===== -->
            <q-scroll-area v-if="sidebarView === 'chats'" key="chats-view" class="fit">
              <!-- Filtros de estado -->
              <div class="status-filters">
                <q-chip
                  v-for="status in statusOptions"
                  :key="status.value"
                  clickable
                  @click="filters.status = status.value; loadChats()"
                  :class="['status-chip', { active: filters.status === status.value }]"
                  size="sm"
                >
                  {{ status.label }}
                </q-chip>
              </div>

              <div v-if="loading && chats.length === 0" class="text-center q-pa-lg">
                <q-spinner-dots color="primary" size="40px" />
              </div>

              <div v-else-if="chats.length === 0" class="empty-state">
                <q-icon name="chat_bubble_outline" size="56px" color="grey-4" />
                <div class="empty-text">No hay conversaciones</div>
              </div>

              <div v-else class="chats-list-wrapper">
                <div
                  v-for="chat in chats"
                  :key="chat.id"
                  class="chat-item-wrapper"
                  :class="{ active: selectedChat?.id === chat.id }"
                  @click="selectChat(chat)"
                >
                  <div class="chat-item-content">
                    <div class="chat-avatar">
                      <q-avatar size="50px">
                        <img v-if="getChatPartner(chat)?.avatar" :src="getChatPartner(chat).avatar" />
                        <div v-else class="avatar-fallback bg-teal-7 text-white">
                          {{ getInitials(getChatPartner(chat)?.name) }}
                        </div>
                      </q-avatar>
                    </div>
                    <div class="chat-info">
                      <div class="chat-header-row">
                        <div class="chat-title">{{ truncateName(getChatPartner(chat)?.name) || 'Usuario' }}</div>
                        <div class="chat-meta">
                          <div class="chat-time">{{ formatDate(chat.last_message_at) }}</div>
                        </div>
                      </div>
                      <div class="chat-preview" :class="{ 'text-weight-bold': chat.unread_count > 0 }">
                        <q-icon
                          v-if="chat.last_message?.sender_id === currentUser?.id"
                          :name="chat.last_message?.is_read ? 'done_all' : 'done'"
                          :color="chat.last_message?.is_read ? 'light-blue-5' : 'grey-5'"
                          size="16px"
                          class="q-mr-xs"
                        />
                         {{ truncateMessage(chat.last_message?.content) || (chat.type === 'chat' ? 'Empezar conversación' : chat.subject) || 'Sin mensajes' }}
                      </div>
                    </div>
                    <q-badge
                      v-if="chat.unread_count > 0"
                      color="negative"
                      rounded
                      :label="chat.unread_count"
                    />
                  </div>
                </div>
              </div>

              <!-- Paginación -->
              <div v-if="pagination.lastPage > 1" class="text-center q-pa-sm">
                <q-pagination
                  v-model="pagination.page"
                  :max="pagination.lastPage"
                  :max-pages="3"
                  direction-links
                  flat
                  dense
                  size="sm"
                  @update:model-value="loadChats"
                />
              </div>
            </q-scroll-area>

            <!-- ===== VISTA DE USUARIOS ===== -->
            <q-scroll-area v-else key="users-view" class="fit">
              <!-- Usuarios Online primero -->
              <div v-if="onlineUsersFiltered.length > 0" class="users-section">
                <div class="section-label">En línea — {{ onlineUsersFiltered.length }}</div>
                <div
                  v-for="user in onlineUsersFiltered"
                  :key="'on-' + user.id"
                  class="chat-item-wrapper"
                >
                  <div class="chat-item-content" @click="openChatWithUser(user)">
                    <div class="chat-avatar">
                      <q-avatar size="48px">
                        <img v-if="user.avatar" :src="user.avatar" />
                        <div v-else class="avatar-fallback bg-primary text-white">{{ getInitials(user.name) }}</div>
                        <div class="chat-status-dot active"></div>
                      </q-avatar>
                    </div>
                    <div class="chat-info">
                      <div class="chat-title">{{ truncateName(user.name) }}</div>
                      <div class="chat-preview text-positive">Activo ahora</div>
                    </div>
                    <div class="contact-actions row no-wrap items-center">
                      <q-btn flat round dense icon="chat" color="primary" size="sm" @click.stop="openChatWithUser(user)">
                        <q-tooltip>Conversación</q-tooltip>
                      </q-btn>
                      <q-btn flat round dense icon="support_agent" color="secondary" size="sm" @click.stop="createSupportTicket(user)">
                        <q-tooltip>Nuevo Ticket de Soporte</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Usuarios Offline -->
              <div v-if="offlineUsersFiltered.length > 0" class="users-section">
                <div class="section-label">Otros usuarios — {{ offlineUsersFiltered.length }}</div>
                <div
                  v-for="user in offlineUsersFiltered"
                  :key="'off-' + user.id"
                  class="chat-item-wrapper"
                >
                  <div class="chat-item-content" @click="openChatWithUser(user)">
                    <div class="chat-avatar">
                      <q-avatar size="48px">
                        <img v-if="user.avatar" :src="user.avatar" />
                        <div v-else class="avatar-fallback bg-grey-5 text-white">{{ getInitials(user.name) }}</div>
                        <div class="chat-status-dot inactive"></div>
                      </q-avatar>
                    </div>
                    <div class="chat-info">
                      <div class="chat-title">{{ truncateName(user.name) }}</div>
                      <div class="chat-preview text-grey-6">{{ truncateName(user.company, 20) || 'Sin empresa' }}</div>
                    </div>
                    <div class="contact-actions row no-wrap items-center">
                      <q-btn flat round dense icon="chat" color="primary" size="sm" @click.stop="openChatWithUser(user)">
                        <q-tooltip>Conversación</q-tooltip>
                      </q-btn>
                      <q-btn flat round dense icon="support_agent" color="secondary" size="sm" @click.stop="createSupportTicket(user)">
                        <q-tooltip>Nuevo Ticket de Soporte</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="loading && uniqueUsers.length === 0" class="text-center q-pa-lg">
                <q-spinner-dots color="primary" size="40px" />
              </div>

              <div v-if="uniqueUsers.length === 0 && !loading" class="empty-state">
                <q-icon name="person_search" size="56px" color="grey-4" />
                <div class="empty-text">No se encontraron usuarios</div>
              </div>
            </q-scroll-area>
          </transition>
        </div>
      </div>

      <!-- Área de chat -->
      <div class="chat-main" :class="{ 'mobile-hidden': !selectedChat && $q.screen.lt.md }">
        <!-- Sin chat seleccionado -->
        <div v-if="!selectedChat" class="chat-empty">
           <q-icon name="support_agent" size="100px" color="primary" class="q-mb-lg" />
           <div class="empty-title">Centro de Control de Soporte</div>
           <p class="empty-subtitle text-grey-7 q-mt-md">
             Selecciona una conversación a la izquierda para empezar a gestionar las solicitudes.
             Puedes filtrar por estado o buscar usuarios específicos.
           </p>
        </div>

        <!-- Chat seleccionado -->
        <div v-else class="chat-content">
          <!-- Header Moderno -->
          <div class="chat-header">
            <q-btn
              v-if="$q.screen.lt.md"
              flat
              round
              dense
              icon="arrow_back"
              @click="selectedChat = null"
              class="q-mr-sm"
              color="primary"
            />
            <q-avatar size="45px" class="q-mr-md shadow-1">
              <img v-if="selectedChat.client?.avatar" :src="selectedChat.client.avatar" />
              <div v-else class="avatar-fallback bg-primary text-white">
                {{ getInitials(selectedChat.client?.name) }}
              </div>
            </q-avatar>
            <div class="header-info" @click="showContactInfo = !showContactInfo" style="cursor: pointer;">
              <div class="chat-name text-weight-bold">{{ truncateName(getChatPartner(selectedChat)?.name, 40) || 'Usuario' }}</div>
              <div class="chat-status-text row no-wrap items-center">
                <template v-if="isChatClientOnline(selectedChat.client_user_id || selectedChat.client?.id)">
                  <q-badge rounded color="positive" class="q-mr-xs" size="8px" />
                  <span class="text-positive text-caption">en línea ahora</span>
                </template>
                <template v-else>
                  <span class="text-grey-6 text-caption">{{ selectedChat.type === 'chat' ? 'Conversación Social' : selectedChat.subject }}</span>
                </template>
              </div>
            </div>
            <q-space />
            <div class="header-actions row no-wrap q-gutter-x-sm">
              <q-chip
                v-if="selectedChat.type === 'support'"
                :color="getStatusColor(selectedChat.status)"
                text-color="white"
                size="sm"
                icon="label"
              >
                {{ getStatusLabel(selectedChat.status) }}
              </q-chip>
              <q-btn flat round dense icon="more_vert" color="grey-7">
                <q-menu>
                  <q-list style="min-width: 150px">
                    <q-item clickable v-close-popup @click="createSupportTicket(selectedChat.client)">
                      <q-item-section>Crear Ticket</q-item-section>
                    </q-item>
                    <q-separator inset />
                    <q-item v-if="selectedChat.status !== 'closed'" clickable v-close-popup @click="closeChat">
                      <q-item-section class="text-negative">Cerrar Conversación</q-item-section>
                    </q-item>
                    <q-item v-else clickable v-close-popup @click="reopenChat">
                      <q-item-section>Reabrir Conversación</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>

          <!-- Mensajes Estilo Moderno -->
          <div class="messages-container" ref="messagesContainer">
            <q-scroll-area class="fit" ref="scrollArea">
              <div class="messages-list">
                <div
                  v-for="message in messages"
                  :key="message.id"
                  :class="[
                    'message-wrapper',
                    message.sender_id === currentUser?.id ? 'user-message' : 'assistant-message',
                    {
                      'is-image': message.type === 'image',
                      'is-audio': message.type === 'audio',
                      'has-content': message.content && message.content.trim() !== ''
                    }
                  ]"
                >
                  <!-- Audio Message Bubble -->
                  <div
                    v-if="message.type === 'audio'"
                    class="message-bubble audio-bubble"
                  >
                    <div class="audio-inner-layout">
                      <q-avatar size="45px" class="audio-avatar">
                        <img v-if="message.sender?.avatar" :src="getFullUrl(message.sender.avatar)" />
                        <div v-else class="avatar-fallback bg-grey-8 text-white">
                          {{ getInitials(message.sender?.name || 'S') }}
                        </div>
                        <q-icon name="mic" size="16px" class="mic-icon-overlay" color="primary" />
                      </q-avatar>
                      <div class="audio-controls-wrapper">
                        <AudioPlayer
                          v-if="message.attachment_url"
                          :src="getFullUrl(message.attachment_url)"
                          :filename="message.attachment_name"
                        />
                        <div v-else class="text-caption italic opacity-50">Audio no disponible</div>
                        <div class="message-footer">
                          <span class="message-time">{{ formatTime(message.created_at) }}</span>
                          <q-icon
                            v-if="isOwnMessage(message)"
                            :name="message.is_read ? 'done_all' : 'done'"
                            :color="message.is_read ? 'light-blue-4' : 'grey-5'"
                            size="14px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Image Message Bubble -->
                  <div
                    v-else-if="message.type === 'image'"
                    class="message-bubble image-bubble"
                  >
                    <div class="image-content-wrapper" @click="openImagePreview(message, getMessageImages(message))">
                       <q-img
                        v-if="message.attachment_url"
                        :src="getFullUrl(message.attachment_url)"
                        class="whatsapp-image"
                        fit="cover"
                        loading="lazy"
                        min-height="150px"
                       >
                         <template v-slot:loading>
                           <q-spinner color="white" size="24px" />
                         </template>
                       </q-img>
                       <div v-else class="q-pa-md text-center bg-grey-2 rounded-borders">
                         <q-icon name="image_not_supported" size="32px" color="grey-5" />
                         <div class="text-caption grey-7">Imagen no disponible</div>
                       </div>

                       <div class="image-footer-overlay" v-if="!message.content">
                         <span class="message-time">{{ formatTime(message.created_at) }}</span>
                         <q-icon
                            v-if="isOwnMessage(message)"
                            :name="message.is_read ? 'done_all' : 'done'"
                            :color="message.is_read ? 'light-blue-4' : 'grey-5'"
                            size="14px"
                          />
                       </div>
                    </div>
                    <div v-if="message.content" class="message-content q-pa-sm">
                       {{ message.content }}
                       <div class="message-footer text-right">
                          <span class="message-time">{{ formatTime(message.created_at) }}</span>
                          <q-icon
                            v-if="isOwnMessage(message)"
                            :name="message.is_read ? 'done_all' : 'done'"
                            :color="message.is_read ? 'light-blue-4' : 'grey-5'"
                            size="14px"
                          />
                       </div>
                    </div>
                  </div>

                  <!-- Standard Text/File Message Bubble -->
                  <div
                    v-else
                    class="message-bubble text-bubble"
                  >
                    <div
                      v-if="message.sender_id !== currentUser?.id"
                      class="message-sender client-sender"
                    >
                      {{ message.sender?.name || selectedChat.client?.name }}
                    </div>

                    <div v-if="message.type === 'file' && message.attachment_url" class="message-attachment file-link-wrapper">
                      <a :href="getFullUrl(message.attachment_url)" target="_blank" class="file-link">
                         <div class="file-icon-box">
                           <q-icon name="description" size="24px" color="white" />
                         </div>
                         <div class="file-details">
                           <span class="file-name">{{ message.attachment_name }}</span>
                           <span class="file-size text-caption opacity-70">{{ message.attachment_size ? (message.attachment_size / 1024).toFixed(1) + ' KB' : 'Archivo' }}</span>
                         </div>
                      </a>
                    </div>

                    <div class="message-content" v-if="message.content">{{ message.content }}</div>
                    <div class="message-content italic opacity-50" v-else-if="message.type !== 'text' && !message.attachment_url">
                      Mensaje sin contenido accesible
                    </div>

                    <div class="message-footer">
                      <span class="message-time">{{ formatTime(message.created_at) }}</span>
                      <q-icon
                        v-if="isOwnMessage(message)"
                        :name="message.is_read ? 'done_all' : 'done'"
                        :color="message.is_read ? 'light-blue-4' : 'grey-5'"
                        size="14px"
                      />
                    </div>
                  </div>
                </div>

                <!-- Indicador de escritura Moderno -->
                <div v-if="isTyping" class="message-wrapper assistant-message">
                  <div class="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </q-scroll-area>

            <!-- Alerta de nuevos mensajes -->
            <transition name="fade">
              <div v-if="showScrollButton" class="scroll-bottom-alert cursor-pointer shadow-10" @click="scrollToBottom">
                <q-chip v-if="unreadMessagesBelow > 0" color="negative" size="xs" :label="unreadMessagesBelow" />
                <span class="text-caption">Nuevos mensajes</span>
                <q-icon name="arrow_downward" />
              </div>
            </transition>
          </div>

          <!-- Input de mensaje Moderno -->
          <div class="q-pa-md border-top custom-input-area" v-if="selectedChat.status !== 'closed'">
            <!-- Preview del archivo seleccionado -->
            <q-slide-transition>
              <div v-if="selectedFile" class="attachment-preview q-mb-sm shadow-1">
                <div class="preview-content">
                  <q-img
                    v-if="selectedFilePreview && isImageFile(selectedFile)"
                    :src="selectedFilePreview"
                    class="preview-mini"
                  />
                  <div v-else class="preview-file-icon">
                    <q-icon :name="getFileIcon(selectedFile)" size="24px" color="primary" />
                    <span class="text-caption text-weight-medium text-primary">{{ selectedFile.name }}</span>
                  </div>
                </div>
                <q-btn flat round dense icon="close" size="xs" @click="clearSelectedFile" color="negative" />
              </div>
            </q-slide-transition>

            <div class="row no-wrap items-center q-gutter-x-sm">
              <q-btn flat round dense icon="add_circle" color="primary" size="lg">
                <q-menu anchor="top start" self="bottom start" class="modern-menu shadow-5">
                  <q-list style="min-width: 200px">
                    <q-item clickable v-close-popup @click="openFilePicker">
                      <q-item-section avatar><q-icon name="description" color="indigo" /></q-item-section>
                      <q-item-section>Documento</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openCamera">
                      <q-item-section avatar><q-icon name="photo_camera" color="pink" /></q-item-section>
                      <q-item-section>Cámara</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item-label header>Respuestas Rápidas</q-item-label>
                    <q-item clickable v-close-popup @click="insertQuickResponse('greeting')">
                      <q-item-section>👋 Saludo Estándar</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="insertQuickResponse('resolved')">
                      <q-item-section>✅ Caso Resuelto</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>

              <q-input
                v-model="newMessage"
                placeholder="Escribe un mensaje aquí..."
                rounded
                filled
                dense
                autogrow
                class="col"
                :disable="sending"
                @keyup.enter.exact="sendMessage"
              >
                <template v-slot:append>
                  <q-btn flat round dense icon="sentiment_satisfied_alt" color="grey-7" size="sm" />
                </template>
              </q-input>

              <template v-if="newMessage.trim() || selectedFile">
                <q-btn
                  unelevated
                  round
                  icon="send"
                  color="primary"
                  size="md"
                  class="send-btn-modern shadow-2"
                  @click="sendMessage"
                  :disable="sending"
                  :loading="sending"
                />
              </template>
              <template v-else>
                <AudioRecorder @send="sendAudioMessage" />
              </template>
            </div>
            <!-- Hidden file inputs -->
            <input
              type="file"
              ref="fileInput"
              accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
              @change="handleFileSelect"
              style="display: none"
            />
            <input
              type="file"
              ref="cameraInput"
              accept="image/*"
              capture="environment"
              @change="handleFileSelect"
              style="display: none"
            />
          </div>

          <!-- Chat cerrado -->
          <div v-else class="chat-closed-banner q-pa-md">
            <q-banner class="bg-positive text-white" rounded>
              <template v-slot:avatar>
                <q-icon name="check_circle" size="24px" />
              </template>
              <div class="row items-center">
                <div class="col">
                  Ticket cerrado el {{ formatFullDate(selectedChat.closed_at) }}
                </div>
                <q-btn
                  flat
                  label="Reabrir"
                  icon="refresh"
                  @click="reopenChat"
                />
              </div>
            </q-banner>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Overlay con Carrusel -->
    <transition name="fade">
      <div v-if="showImagePreview" class="image-preview-overlay" @click.self="closeImagePreview">
        <div class="preview-header">
          <div class="preview-title">
            <q-icon name="image" size="24px" class="q-mr-sm" />
            <span>{{ previewImages.length > 1 ? `Imagen ${currentPreviewIndex + 1} de ${previewImages.length}` : 'Vista previa' }}</span>
          </div>
          <div class="preview-actions">
            <q-btn flat round icon="download" color="white" @click="downloadImage">
              <q-tooltip>Descargar</q-tooltip>
            </q-btn>
            <q-btn flat round icon="close" color="white" @click="closeImagePreview">
              <q-tooltip>Cerrar</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="preview-content">
          <q-btn
            v-if="previewImages.length > 1"
            flat
            round
            icon="chevron_left"
            color="white"
            size="lg"
            class="nav-btn nav-prev"
            :disable="currentPreviewIndex === 0"
            @click="prevImage"
          />

          <div class="preview-image-container">
            <transition :name="slideDirection" mode="out-in">
              <img
                :key="currentPreviewIndex"
                :src="currentPreviewImage"
                class="preview-main-image"
                alt="Preview"
              />
            </transition>
          </div>

          <q-btn
            v-if="previewImages.length > 1"
            flat
            round
            icon="chevron_right"
            color="white"
            size="lg"
            class="nav-btn nav-next"
            :disable="currentPreviewIndex === previewImages.length - 1"
            @click="nextImage"
          />
        </div>

        <div v-if="previewImages.length > 1" class="preview-thumbnails">
          <div
            v-for="(img, index) in previewImages"
            :key="index"
            class="thumbnail-item"
            :class="{ active: index === currentPreviewIndex }"
            @click="goToImage(index)"
          >
            <q-img :src="getFullUrl(img)" :ratio="1" fit="cover" />
          </div>
        </div>
      </div>
    </transition>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import { echo } from 'src/boot/pusher'
import { authentication } from 'src/stores/module-authentication'
import { useQuasar } from 'quasar'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

import AudioRecorder from 'src/components/AudioRecorder.vue'
import AudioPlayer from 'src/components/AudioPlayer.vue'

/**
 * Quasar instance
 * @type {object}
 */
const $q = useQuasar()

/**
 * Authentication store
 * @type {object}
 */
const authStore = authentication()

/**
 * Lista de chats de soporte
 * @type {import('vue').Ref<Array>}
 */
const chats = ref([])

/**
 * Chat seleccionado actualmente
 * @type {import('vue').Ref<object|null>}
 */
const selectedChat = ref(null)

/**
 * Mensajes del chat seleccionado
 * @type {import('vue').Ref<Array>}
 */
const messages = ref([])

/**
 * Nuevo mensaje a enviar
 * @type {import('vue').Ref<string>}
 */
const newMessage = ref('')

/**
 * Estado de carga
 * @type {import('vue').Ref<boolean>}
 */
const loading = ref(false)

/**
 * Estado de envío de mensaje
 * @type {import('vue').Ref<boolean>}
 */
const sending = ref(false)

/**
 * Indicador de escritura del cliente
 * @type {import('vue').Ref<boolean>}
 */
const isTyping = ref(false)
const route = useRoute()

/**
 * Mostrar botón de scroll
 * @type {import('vue').Ref<boolean>}
 */
const showScrollButton = ref(false)

/**
 * Vista actual del sidebar (chats o users)
 * @type {import('vue').Ref<string>}
 */
const sidebarView = ref('chats')

/**
 * Controla la visibilidad de la barra de búsqueda
 * @type {import('vue').Ref<boolean>}
 */
const showSearch = ref(false)

/**
 * Reset search on close
 */
watch(showSearch, (val) => {
  if (!val) {
    filters.value.search = ''
    userSearch.value = ''
    if (sidebarView.value === 'chats') {
      loadChats()
    } else {
      fetchUsers()
    }
  }
})

/**
 * Usuarios obtenidos del monitor de sesiones
 * @type {import('vue').Ref<Array>}
 */
const sessionUsers = ref([])

/**
 * Estado de búsqueda de usuarios
 * @type {import('vue').Ref<string>}
 */
const userSearch = ref('')

/**
 * Cantidad de mensajes nuevos abajo
 * @type {import('vue').Ref<number>}
 */
const unreadMessagesBelow = ref(0)

/**
 * Indica si el usuario ha scrolleado hacia arriba
 * @type {import('vue').Ref<boolean>}
 */
const isUserScrolledUp = ref(false)

/**
 * Controls contact info panel visibility
 * @type {import('vue').Ref<boolean>}
 */
const showContactInfo = ref(false)

/**
 * Contador de tickets no leídos
 * @type {import('vue').Ref<number>}
 */
const unreadCount = ref(0)

/**
 * Referencia al scroll area
 * @type {import('vue').Ref<object|null>}
 */
const scrollArea = ref(null)

/**
 * Referencia al input de archivo
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const fileInput = ref(null)

/**
 * Referencia al input de cámara
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const cameraInput = ref(null)

/**
 * Archivo seleccionado para enviar
 * @type {import('vue').Ref<File|null>}
 */
const selectedFile = ref(null)

/**
 * Preview URL del archivo seleccionado
 * @type {import('vue').Ref<string|null>}
 */
const selectedFilePreview = ref(null)

/**
 * Mostrar overlay de preview de imagen
 * @type {import('vue').Ref<boolean>}
 */
const showImagePreview = ref(false)

/**
 * Lista de imágenes para el carrusel
 * @type {import('vue').Ref<Array<string>>}
 */
const previewImages = ref([])

/**
 * Índice actual del carrusel
 * @type {import('vue').Ref<number>}
 */
const currentPreviewIndex = ref(0)

/**
 * Dirección de la animación del slide
 * @type {import('vue').Ref<string>}
 */
const slideDirection = ref('slide-left')

/**
 * Imagen actual del preview
 * @type {import('vue').ComputedRef<string>}
 */
const currentPreviewImage = computed(() => getFullUrl(previewImages.value[currentPreviewIndex.value] || ''))

/**
 * Filtros de búsqueda
 * @type {import('vue').Ref<object>}
 */
const filters = ref({
  status: null,
  search: ''
})

/**
 * Paginación
 * @type {import('vue').Ref<object>}
 */
const pagination = ref({
  page: 1,
  lastPage: 1,
  total: 0
})

/**
 * Opciones de estado para filtro
 * @type {Array}
 */
const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Abiertos', value: 'open' },
  { label: 'En progreso', value: 'in_progress' },
  { label: 'Cerrados', value: 'closed' },
  { label: 'Reabiertos', value: 'reopened' }
]

/**
 * Respuestas rápidas predefinidas
 * @type {object}
 */
const quickResponses = {
  greeting: '¡Hola! Gracias por contactar con soporte técnico. Estoy revisando tu caso. ¿Podrías darme más detalles sobre el problema?',
  thanks: 'Gracias por tu paciencia. Estamos trabajando para resolver tu problema lo antes posible.',
  working: 'Estamos investigando el problema. Te mantendré informado sobre cualquier avance.',
  resolved: '¡Excelente! El problema ha sido resuelto. Si tienes alguna otra consulta, no dudes en contactarnos. Voy a proceder a cerrar este ticket.'
}

/**
 * Usuario actual
 * @type {import('vue').ComputedRef<object>}
 */
const currentUser = computed(() => authStore.userSession)

/**
 * Carga usuarios desde el endpoint de sesiones y los deduplica
 * @returns {Promise<void>}
 */
const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await api.get('user-sessions', {
      params: {
        status: 'all',
        search: userSearch.value,
        per_page: 100
      }
    })
    sessionUsers.value = data.data || []
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

/**
 * Usuarios únicos (deduplicados por user_id). Solo conserva la sesión más reciente.
 * @type {import('vue').ComputedRef<Array>}
 */
const uniqueUsers = computed(() => {
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
        status: session.status,
        lastActivity: session.last_activity_at
      })
    }
  })
  return Array.from(map.values())
})

/**
 * Usuarios online filtrados
 * @type {import('vue').ComputedRef<Array>}
 */
const onlineUsersFiltered = computed(() => {
  return uniqueUsers.value.filter(u => u.status === 'online')
})

/**
 * Usuarios offline filtrados
 * @type {import('vue').ComputedRef<Array>}
 */
const offlineUsersFiltered = computed(() => {
  return uniqueUsers.value.filter(u => u.status !== 'online')
})

/**
 * Checks if a specific user is currently online
 * @param {number} userId - User ID to check
 * @returns {boolean} Whether the user is online
 */
const isChatClientOnline = (userId) => {
  if (!userId) return false
  return onlineUsersFiltered.value.some(u => u.id === parseInt(userId))
}

/**
 * Obtiene el label legible del estado
 * @param {string} status - Estado en crudo
 * @returns {string}
 */
const getStatusLabel = (status) => {
  const options = {
    open: 'Abierto',
    in_progress: 'En progreso',
    closed: 'Cerrado',
    reopened: 'Reabierto'
  }
  return options[status] || status
}

/**
 * Obtiene el color del chip de estado
 * @param {string} status - Estado en crudo
 * @returns {string}
 */
const getStatusColor = (status) => {
  const colors = {
    open: 'positive',
    in_progress: 'warning',
    closed: 'negative',
    reopened: 'info'
  }
  return colors[status] || 'grey'
}

/**
 * Abre o selecciona una conversación con un usuario.
 * No crea el chat en la DB hasta que se envíe el primer mensaje.
 * @param {object} user - El usuario con el que se desea conversar
 * @returns {void}
 */
const openChatWithUser = (user) => {
  // 1. Buscar en los chats cargados si ya existe una conversación con este cliente
  // Buscamos cualquier chat, incluso si está cerrado, para mantener el historial "de por vida"
  const existingChat = chats.value.find(
    c => (c.client_user_id === user.id || c.client?.id === user.id)
  )

  if (existingChat) {
    selectChat(existingChat)
    sidebarView.value = 'chats'
    return
  }

  // 2. Si no existe, creamos un objeto de chat "pendiente" local
  // Esto permite abrir la vista derecha sin tocar la API todavía
  selectedChat.value = {
    id: null, // Indicar que es nuevo
    is_pending: true,
    type: 'chat', // Importante: Tipo red social
    subject: `Conversación con ${user.name}`,
    client_user_id: user.id,
    client: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      company: user.company
    },
    status: 'open',
    priority: 'medium',
    messages: []
  }

  messages.value = []
  sidebarView.value = 'chats' // Cambiar a la pestaña de chats para ver el contexto
}

/**
 * Crea un nuevo ticket de soporte técnico explícito.
 * A diferencia de las conversaciones de personas, esto siempre genera un nuevo chat.
 * @param {object} user - El usuario para el que se crea el ticket
 */
const createSupportTicket = (user) => {
  $q.dialog({
    title: 'Nuevo Ticket de Soporte',
    message: '¿Cuál es el asunto del soporte técnico?',
    prompt: {
      model: '',
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk(async (subject) => {
    loading.value = true
    try {
      const { data } = await api.post('support-chats', {
        client_id: user.id,
        subject: subject || 'Soporte Técnico',
        message: 'Nuevo ticket de soporte iniciado.',
        type: 'support',
        priority: 'high'
      })

      await loadChats()
      const newChat = chats.value.find(c => c.id === data.data?.id || c.id === data.id)
      if (newChat) selectChat(newChat)
      $q.notify({ type: 'positive', message: 'Ticket de soporte creado' })
    } catch (error) {
      console.error('Error:', error)
      $q.notify({ type: 'negative', message: 'Error al crear ticket' })
    } finally {
      loading.value = false
    }
  })
}

/**
 * Obtiene la información del "otro" participante del chat (el que no es el admin actual)
 * @param {object} chat - El objeto de chat
 * @returns {object} Datos del partner (id, name, avatar)
 */
const getChatPartner = (chat) => {
  if (!chat) return null

  // Si el chat es pendiente (creado localmente en 'Personas'), el partner es el client
  if (chat.is_pending) return chat.client

  // Si somos el admin del chat, el partner es el client
  if (parseInt(chat.admin_user_id) === parseInt(currentUser.value?.id)) {
    return chat.client || { name: 'Usuario' }
  }

  // Si somos el client del chat, el partner es el admin
  if (parseInt(chat.client_user_id) === parseInt(currentUser.value?.id)) {
    return chat.admin || { name: 'Soporte' }
  }

  // Por defecto, en la vista de admin, nos interesa ver al cliente
  return chat.client || chat.admin || { name: 'Usuario' }
}

const loadChats = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      per_page: 20
    }

    if (filters.value.status) {
      params.status = filters.value.status
    }

    if (filters.value.search) {
      params.search = filters.value.search
    }

    const { data } = await api.get('support-chats', { params })
    chats.value = data.data || data
    pagination.value.lastPage = data.last_page || 1
    pagination.value.total = data.total || 0

    // Cargar contador de no leídos
    loadUnreadCount()
  } catch (error) {
    console.error('Error loading chats:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los tickets de soporte'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Carga el contador de tickets no leídos
 * @returns {Promise<void>}
 */
const loadUnreadCount = async () => {
  try {
    const { data } = await api.get('support-chats/unread-count')
    unreadCount.value = data.unread_count || 0
  } catch (error) {
    console.error('Error loading unread count:', error)
  }
}

/**
 * Selecciona un chat y carga sus mensajes
 * @param {object} chat - Chat a seleccionar
 * @returns {Promise<void>}
 */
const selectChat = async (chat) => {
  selectedChat.value = chat
  loading.value = true
  try {
    const { data } = await api.get(`support-chats/${chat.id}`)
    messages.value = data.messages || []
    selectedChat.value = data

    // Actualizar contador de no leídos en la lista
    const chatIndex = chats.value.findIndex(c => c.id === chat.id)
    if (chatIndex !== -1) {
      chats.value[chatIndex].unread_count = 0
    }

    loadUnreadCount()

    // Suscribirse al canal del chat
    subscribeToChat(chat.id)

    await nextTick()
    scrollToBottom()
    attachScrollListener()
  } catch (error) {
    console.error('Error loading chat:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el chat'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Envía un mensaje al chat seleccionado
 * @returns {Promise<void>}
 */
/**
 * Envía un mensaje al chat seleccionado.
 * Si el chat es nuevo (is_pending), lo crea en el servidor primero.
 * @returns {Promise<void>}
 */
const sendMessage = async () => {
  if ((!newMessage.value.trim() && !selectedFile.value) || sending.value || !selectedChat.value) return

  const messageText = newMessage.value
  const fileToSend = selectedFile.value
  newMessage.value = ''
  clearSelectedFile()
  sending.value = true

  // Agregar mensaje temporalmente para UX inmediata
  const tempMessage = {
    id: Date.now(),
    content: messageText,
    type: fileToSend ? (isImageFile(fileToSend) ? 'image' : isVideoFile(fileToSend) ? 'video' : 'file') : 'text',
    attachment_url: fileToSend && isImageFile(fileToSend) ? selectedFilePreview.value : null,
    sender_id: currentUser.value?.id,
    sender: { name: currentUser.value?.name },
    is_read: false,
    created_at: new Date().toISOString()
  }
  messages.value.push(tempMessage)

  await nextTick()
  scrollToBottom()

  try {
    let chatId = selectedChat.value.id

    // Si el chat es pendiente, lo creamos primero
    if (selectedChat.value.is_pending) {
      const detectedType = fileToSend ? (isImageFile(fileToSend) ? 'image' : isVideoFile(fileToSend) ? 'video' : 'file') : 'text'
      const { data } = await api.post('support-chats', {
        client_id: selectedChat.value.client?.id,
        subject: selectedChat.value.subject,
        message: messageText || (fileToSend ? (isImageFile(fileToSend) ? '📷 Imagen' : '📁 Archivo') : '¡Hola!'),
        message_type: detectedType,
        type: selectedChat.value.type || 'support',
        priority: 'medium'
      })

      const newChat = data.data || data
      chatId = newChat.id
      selectedChat.value = newChat
      
      // Si no hay archivo, el mensaje ya se creó con el chat. 
      // Si hay archivo, el mensaje creado en 'store' es solo el texto, necesitamos subir el archivo.
      if (!fileToSend) {
        messages.value = newChat.messages || []
        await loadChats()
        subscribeToChat(chatId)
        return // Terminamos aquí si no hay archivo
      }
      
      // Si hay archivo, continuamos al flujo normal de sendMessage con el nuevo chatId
      await loadChats()
      subscribeToChat(chatId)
    }

    // Flujo normal: enviar mensaje (o archivo) a chat existente
    const formData = new FormData()
    if (messageText) formData.append('message', messageText)
    if (fileToSend) {
      formData.append('attachment', fileToSend)
      const detectedType = isImageFile(fileToSend) ? 'image' : isVideoFile(fileToSend) ? 'video' : 'file'
      formData.append('type', detectedType)
    }

    const { data } = await api.post(`support-chats/${chatId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    // Reemplazar mensaje temporal con el real
    const tempIndex = messages.value.findIndex(m => m.id === tempMessage.id)
    if (tempIndex !== -1) {
      // Si el mensaje real ya llegó por Pusher, borrar el temporal. Si no, reemplazarlo.
      if (messages.value.find(m => m.id === data.data.id && m.id !== tempMessage.id)) {
        messages.value.splice(tempIndex, 1)
      } else {
        messages.value[tempIndex] = data.data
      }
    }

      // Actualizar último mensaje en la lista lateral
      const chatIndex = chats.value.findIndex(c => c.id === selectedChat.value.id)
      if (chatIndex !== -1) {
        chats.value[chatIndex].last_message = data.data
        chats.value[chatIndex].last_message_at = data.data.created_at
      }
  } catch (error) {
    console.error('Error sending message:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar el mensaje'
    })
    messages.value = messages.value.filter(m => m.id !== tempMessage.id)
  } finally {
    sending.value = false
  }
}

/**
 * Send audio message
 * @param {Blob} audioBlob - Audio blob to send
 * @returns {Promise<void>}
 */
const sendAudioMessage = async (audioBlob) => {
  if (!audioBlob || sending.value || !selectedChat.value) return

  sending.value = true

  // Add temporary message
  const tempMessage = {
    id: Date.now(),
    content: '',
    type: 'audio',
    attachment_url: URL.createObjectURL(audioBlob),
    sender_id: currentUser.value?.id,
    sender: { name: currentUser.value?.name },
    is_read: false,
    created_at: new Date().toISOString()
  }
  messages.value.push(tempMessage)

  await nextTick()
  scrollToBottom()

  try {
    // Si el chat es pendiente, creamos el chat primero
    if (selectedChat.value.is_pending) {
      const { data: chatData } = await api.post('support-chats', {
        client_id: selectedChat.value.client?.id,
        subject: selectedChat.value.subject,
        message: 'Nota de voz 🎤',
        message_type: 'audio',
        type: selectedChat.value.type || 'chat',
        priority: 'medium'
      })

      const newChat = chatData.data || chatData
      selectedChat.value = newChat
      messages.value = newChat.messages || []

      await loadChats()
      subscribeToChat(newChat.id)

      // El primer mensaje ya se creó como 'Nota de voz'.
      // Enviamos el audio real como segundo mensaje para inicializar el objeto multimedia.
      const formData = new FormData()
      formData.append('attachment', audioBlob, 'audio.webm')
      formData.append('type', 'audio')
      const { data: audioData } = await api.post(`support-chats/${newChat.id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Actualizar mensajes finales
      const { data: finalData } = await api.get(`support-chats/${newChat.id}`)
      messages.value = finalData.messages || []
    } else {
      const formData = new FormData()
      formData.append('attachment', audioBlob, 'audio.webm')
      formData.append('type', 'audio')

      const { data } = await api.post(`support-chats/${selectedChat.value.id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Replace temporary message with real one
      const tempIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (tempIndex !== -1) {
        if (messages.value.find(m => m.id === data.data.id)) {
          messages.value.splice(tempIndex, 1)
        } else {
          messages.value[tempIndex] = data.data
        }
      }

      // Update last message in list
      const chatIndex = chats.value.findIndex(c => c.id === selectedChat.value.id)
      if (chatIndex !== -1) {
        chats.value[chatIndex].last_message = data.data
        chats.value[chatIndex].last_message_at = data.data.created_at
      }
    }
  } catch (error) {
    console.error('Error sending audio:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar el audio'
    })
    messages.value = messages.value.filter(m => m.id !== tempMessage.id)
  } finally {
    sending.value = false
  }
}

/**
 * Inserta una respuesta rápida predefinida
 * @param {string} type - Tipo de respuesta
 * @returns {void}
 */
const insertQuickResponse = (type) => {
  newMessage.value = quickResponses[type] || ''
}

/**
 * Abre el selector de archivos
 * @returns {void}
 */
const openFilePicker = () => {
  fileInput.value?.click()
}

/**
 * Abre la cámara para tomar foto
 * @returns {void}
 */
const openCamera = () => {
  cameraInput.value?.click()
}

/**
 * Maneja la selección de archivo
 * @param {Event} event - Evento de cambio del input
 * @returns {void}
 */
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validar tamaño (20MB max)
  const maxSize = 20 * 1024 * 1024
  if (file.size > maxSize) {
    $q.notify({
      type: 'warning',
      message: 'El archivo no puede superar los 20MB'
    })
    event.target.value = ''
    return
  }

  selectedFile.value = file

  // Crear preview si es imagen
  if (isImageFile(file)) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedFilePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    selectedFilePreview.value = null
  }

  // Limpiar el input para permitir seleccionar el mismo archivo
  event.target.value = ''
}

/**
 * Obtiene la URL completa para un recurso
 * @param {string} url - URL relativa o absoluta
 * @returns {string}
 */
const getFullUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  // Quitar /api del final de la URL si existe
  const baseUrl = import.meta.env.VITE_APP_API_URL?.replace(/\/api\/?$/, '') || ''
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * Limpia el archivo seleccionado
 * @returns {void}
 */
const clearSelectedFile = () => {
  selectedFile.value = null
  selectedFilePreview.value = null
}

/**
 * Verifica si el archivo es una imagen
 * @param {File|string} file - Archivo o tipo MIME a verificar
 * @returns {boolean}
 */
const isImageFile = (file) => {
  if (!file) return false
  const type = typeof file === 'string' ? file : file.type
  return type?.startsWith('image/')
}

/**
 * Verifica si el archivo es un video
 * @param {File} file - Archivo a verificar
 * @returns {boolean}
 */
const isVideoFile = (file) => {
  return file.type.startsWith('video/')
}

/**
 * Obtiene el icono según el tipo de archivo
 * @param {File} file - Archivo
 * @returns {string}
 */
const getFileIcon = (file) => {
  if (isImageFile(file)) return 'image'
  if (isVideoFile(file)) return 'videocam'
  if (file.type.includes('pdf')) return 'picture_as_pdf'
  if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) return 'description'
  if (file.type.includes('excel') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) return 'table_chart'
  return 'attach_file'
}

/**
 * Formatea el tamaño del archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string}
 */
const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * Abre preview de imagen con carrusel
 * @param {object} message - Mensaje con la imagen
 * @param {Array} images - Lista de imágenes del carrusel
 * @returns {void}
 */
const openImagePreview = (message, images) => {
  previewImages.value = images
  currentPreviewIndex.value = images.indexOf(getFullUrl(message.attachment_url))
  if (currentPreviewIndex.value === -1) currentPreviewIndex.value = 0
  showImagePreview.value = true
  document.body.style.overflow = 'hidden'
}

/**
 * Cierra el preview de imagen
 * @returns {void}
 */
const closeImagePreview = () => {
  showImagePreview.value = false
  document.body.style.overflow = ''
}

/**
 * Obtiene todas las imágenes del chat para el carrusel
 * @param {object} currentMessage - Mensaje actual
 * @returns {Array<string>}
 */
const getMessageImages = (currentMessage) => {
  return messages.value
    .filter(m => m.type === 'image' && m.attachment_url)
    .map(m => getFullUrl(m.attachment_url))
}

/**
 * Navega a la imagen anterior
 * @returns {void}
 */
const prevImage = () => {
  if (currentPreviewIndex.value > 0) {
    slideDirection.value = 'slide-right'
    currentPreviewIndex.value--
  }
}

/**
 * Navega a la imagen siguiente
 * @returns {void}
 */
const nextImage = () => {
  if (currentPreviewIndex.value < previewImages.value.length - 1) {
    slideDirection.value = 'slide-left'
    currentPreviewIndex.value++
  }
}

/**
 * Navega a una imagen específica
 * @param {number} index - Índice de la imagen
 * @returns {void}
 */
const goToImage = (index) => {
  slideDirection.value = index > currentPreviewIndex.value ? 'slide-left' : 'slide-right'
  currentPreviewIndex.value = index
}

/**
 * Descarga la imagen actual
 * @returns {void}
 */
const downloadImage = () => {
  const url = currentPreviewImage.value
  const link = document.createElement('a')
  link.href = url
  link.download = `imagen-${Date.now()}.jpg`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Obtiene el icono según el tipo MIME del archivo
 * @param {string} mimeType - Tipo MIME
 * @returns {string}
 */
const getFileTypeIcon = (mimeType) => {
  if (!mimeType) return 'attach_file'
  if (mimeType.includes('pdf')) return 'picture_as_pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'description'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table_chart'
  if (mimeType.includes('image')) return 'image'
  if (mimeType.includes('video')) return 'videocam'
  return 'attach_file'
}

/**
 * Cierra el ticket seleccionado
 * @returns {Promise<void>}
 */
const closeChat = async () => {
  if (!selectedChat.value) return

  $q.dialog({
    title: 'Cerrar ticket',
    message: '¿Estás seguro de que deseas cerrar este ticket de soporte?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const { data } = await api.post(`support-chats/${selectedChat.value.id}/close`)
      selectedChat.value = data.chat

      // Actualizar en la lista
      const chatIndex = chats.value.findIndex(c => c.id === selectedChat.value.id)
      if (chatIndex !== -1) {
        chats.value[chatIndex] = data.chat
      }

      $q.notify({
        type: 'positive',
        message: 'Ticket cerrado exitosamente'
      })
    } catch (error) {
      console.error('Error closing chat:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al cerrar el ticket'
      })
    }
  })
}

/**
 * Reabre el ticket seleccionado
 * @returns {Promise<void>}
 */
const reopenChat = async () => {
  if (!selectedChat.value) return

  try {
    const { data } = await api.post(`support-chats/${selectedChat.value.id}/reopen`)
    selectedChat.value = data.chat

    // Actualizar en la lista
    const chatIndex = chats.value.findIndex(c => c.id === selectedChat.value.id)
    if (chatIndex !== -1) {
      chats.value[chatIndex] = data.chat
    }

    $q.notify({
      type: 'positive',
      message: 'Ticket reabierto exitosamente'
    })
  } catch (error) {
    console.error('Error reopening chat:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al reabrir el ticket'
    })
  }
}

/**
 * Verifica si el mensaje es del usuario actual (admin)
 * @param {object} message - Mensaje a verificar
 * @returns {boolean}
 */
const isOwnMessage = (message) => {
  return message.sender_id === currentUser.value?.id
}

/**
 * Obtiene las iniciales del nombre
 * @param {string} name - Nombre completo
 * @returns {string}
 */
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

/**
 * Formatea la fecha relativa
 * @param {string} date - Fecha a formatear
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

/**
 * Formatea la fecha completa
 * @param {string} date - Fecha a formatear
 * @returns {string}
 */
const formatFullDate = (date) => {
  if (!date) return ''
  return format(new Date(date), "dd/MM/yyyy 'a las' HH:mm", { locale: es })
}

/**
 * Formatea la hora del mensaje
 * @param {string} date - Fecha a formatear
 * @returns {string}
 */
const formatTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'HH:mm', { locale: es })
}

/**
 * Trunca el nombre de usuario
 * @param {string} name - Nombre a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string}
 */
const truncateName = (name, maxLength = 25) => {
  if (!name) return ''
  if (name.length <= maxLength) return name
  return name.substring(0, maxLength) + '...'
}

/**
 * Trunca el mensaje para mostrar en la lista
 * @param {string} message - Mensaje a truncar
 * @returns {string}
 */
const truncateMessage = (message) => {
  if (!message) return ''
  const maxLength = 35
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}

/**
 * Hace scroll hasta el último mensaje
 * @returns {void}
 */
const scrollToBottom = () => {
  const scrollTarget = scrollArea.value?.$el?.querySelector('.q-scrollarea__container')
  if (scrollTarget) {
    scrollTarget.scrollTop = scrollTarget.scrollHeight
    showScrollButton.value = false
    unreadMessagesBelow.value = 0
    isUserScrolledUp.value = false

    if (selectedChat.value && document.hasFocus()) {
      api.post(`support-chats/${selectedChat.value.id}/read`)
    }
  }
}

/**
 * Maneja el evento de scroll
 */
const handleScroll = (evt) => {
  const target = evt.target
  const bottom = target.scrollHeight - target.scrollTop - target.clientHeight

  if (bottom < 100) {
    const wasScrolledUp = isUserScrolledUp.value
    isUserScrolledUp.value = false
    showScrollButton.value = false
    unreadMessagesBelow.value = 0

    if (wasScrolledUp && selectedChat.value && document.hasFocus()) {
      api.post(`support-chats/${selectedChat.value.id}/read`)
    }
  } else {
    isUserScrolledUp.value = true
  }
}

/**
 * Adjunta el listener de scroll
 */
const attachScrollListener = () => {
  const scrollTarget = scrollArea.value?.$el?.querySelector('.q-scrollarea__container')
  if (scrollTarget) {
    scrollTarget.removeEventListener('scroll', handleScroll)
    scrollTarget.addEventListener('scroll', handleScroll)
  }
}

/**
 * Variable para controlar el canal actual
 */
let currentChatChannel = null

/**
 * Suscribe a eventos globales
 */
const subscribeToEvents = () => {
  if (!echo) return

  // Canal global de admins
  echo.private('support.admins')
    .listen('.message.sent', (data) => {
      handleGlobalMessage(data)
    })
    .listen('.chat.created', (data) => {
      // Recargar lista si hay nuevo chat
      loadChats()
      // Opcional: Notificar
      $q.notify({
        message: `Nuevo ticket: ${data.chat.subject}`,
        color: 'primary',
        icon: 'support_agent'
      })
    })

  // Canal de usuario (por si acaso)
  if (currentUser.value) {
    echo.private(`support.user.${currentUser.value.id}`)
    // Listeners específicos de usuario si hacen falta
  }
}

/**
 * Suscribe a un chat específico
 * @param {number} chatId
 */
const subscribeToChat = (chatId) => {
  if (!echo) return

  // Si ya estamos suscritos a otro chat, salir
  if (currentChatChannel && currentChatChannel !== chatId) {
    echo.leave(`support.chat.${currentChatChannel}`)
  }

  // Si ya estamos suscritos a este chat, no hacer nada
  if (currentChatChannel === chatId) return

  currentChatChannel = chatId

  echo.private(`support.chat.${chatId}`)
    .listen('.message.sent', (data) => {
      // Si el chat está abierto, agregar mensaje
      if (selectedChat.value && selectedChat.value.id === data.chat_id) {
        // Verificar duplicados
        if (!messages.value.find(m => m.id === data.message.id)) {
          messages.value.push(data.message)

          if (isUserScrolledUp.value) {
            showScrollButton.value = true
            unreadMessagesBelow.value++
          } else {
            scrollToBottom()
          }

          // Marcar como leído si estamos viendo y no estamos arriba
          if (document.hasFocus() && !isUserScrolledUp.value) {
            api.post(`support-chats/${chatId}/read`)
          }
        }
      }
    })
    .listen('.message.read', (data) => {
      if (selectedChat.value && selectedChat.value.id === data.chat_id) {
        // Si el cliente leyó, marcar mis mensajes como leídos
        if (data.user_id !== currentUser.value.id) {
          messages.value.forEach(m => {
            m.is_read = true
          })
        }
      }
    })
}

/**
 * Maneja un mensaje entrante globalmente (para la lista)
 */
const handleGlobalMessage = (data) => {
  // Buscar el chat en la lista
  const chatIndex = chats.value.findIndex(c => c.id === data.chat_id)

  if (chatIndex !== -1) {
    // Actualizar chat existente
    const chat = chats.value[chatIndex]
    chat.last_message = data.message
    chat.last_message_at = data.timestamp

    // Si no es el chat activo, incrementar contador
    if (!selectedChat.value || selectedChat.value.id !== data.chat_id) {
      chat.unread_count = (chat.unread_count || 0) + 1
      loadUnreadCount()
    }

    // Mover al principio
    chats.value.splice(chatIndex, 1)
    chats.value.unshift(chat)
  } else {
    // Chat no está en lista (puede ser nuevo o paginado), recargar o ignorar
    // Si es mensaje nuevo, probablemente queramos verlo
    loadChats()
  }
}

/**
 * Cancela suscripción a eventos
 */
const unsubscribeFromEvents = () => {
  if (echo) {
    echo.leave('support.admins')
    if (currentUser.value) {
      echo.leave(`support.user.${currentUser.value.id}`)
    }
    if (currentChatChannel) {
      echo.leave(`support.chat.${currentChatChannel}`)
    }
  }
}

onMounted(async () => {
  await loadChats()
  subscribeToEvents()
  checkRouteParam()
})

watch(() => route.query.id, () => {
  checkRouteParam()
})

const checkRouteParam = () => {
  if (route.query.id) {
    const chatToOpen = chats.value.find(c => c.id === route.query.id)
    if (chatToOpen) {
      selectChat(chatToOpen)
    }
  }
}

onUnmounted(() => {
  unsubscribeFromEvents()
})
</script>

<style lang="scss" scoped>
.support-chat-page {
  height: calc(100vh - 120px);
  padding: 0;
  overflow: hidden;
}

.chat-container {
  display: flex;
  height: calc(100vh - 120px);
  padding: 0;
  gap: 0;
}

.chat-sidebar {
  width: 400px;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;

  @media (max-width: 1023px) {
    width: 100%;
    min-width: unset;
    border-right: none;

    &.mobile-hidden {
      display: none;
    }
  }
}

.body--dark .chat-sidebar {
  background: #1e1e1e;
  border-right-color: rgba(255, 255, 255, 0.1);
}

.sidebar-header {
  padding: 0px 24px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
}

.body--dark .sidebar-header {
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 50%;
}

.sidebar-search {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .search-input {
    :deep(.q-field__control) {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
  }
}

.body--dark .sidebar-search {
  background: #252525;
  border-bottom-color: rgba(255, 255, 255, 0.05);

  .search-input :deep(.q-field__control) {
    background: #2c2c2c;
  }
}

.sidebar-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  .tab-item {
    flex: 1;
    padding: 12px;
    text-align: center;
    cursor: pointer;
    font-weight: 600;
    color: #607d8b;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;

    &:hover { background: #f5f7f9; }

    &.active {
      color: #1976d2;
      border-bottom-color: #1976d2;
    }
  }
}

.body--dark .sidebar-tabs {
  background: #1e1e1e;
  border-bottom-color: rgba(255, 255, 255, 0.1);

  .tab-item {
    color: #b0bec5;
    &.active { color: #90caf9; border-bottom-color: #90caf9; }
  }
}

.chat-list {
  flex: 1;
  overflow: hidden;
}

.chat-item-wrapper {
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover { background: #f0f4f8; }

  &.active {
    background: #e3f2fd;
    border-left: 4px solid #1976d2;
    padding-left: 16px;
  }

  .chat-item-content {
    display: flex;
    gap: 14px;
  }

  .contact-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .contact-actions { opacity: 1; }
}

.body--dark .chat-item-wrapper {
  border-bottom-color: rgba(255, 255, 255, 0.05);
  &:hover { background: #2d2d2d; }
  &.active { background: #1a237e; border-left-color: #3f51b5; }
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-title {
  font-weight: 600;
  font-size: 15px;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.body--dark .chat-title { color: #ecf0f1; }

.chat-preview {
  font-size: 13px;
  color: #607d8b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.body--dark .chat-preview { color: #b0bec5; }

.chat-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.chat-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;

  &.active { background: #4caf50; }
  &.inactive { background: #bdbdbd; }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}

.body--dark .chat-main { background: #121212; }

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.empty-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-top: 24px;
}

.body--dark .empty-title { color: #ecf0f1; }

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow: hidden;
}

.chat-header {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  min-height: 70px;
}

.body--dark .chat-header {
  background: #1e1e1e;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.messages-container {
  flex: 1;
  position: relative;
  background-color: #0b141a;
  background-image: linear-gradient(rgba(11, 20, 26, 0.95), rgba(11, 20, 26, 0.95)), url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
  background-repeat: repeat;
  overflow: hidden;
}

.body--dark .messages-container {
  background-color: #0b141a;
}

.messages-list {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  margin-bottom: 2px;

  &.user-message {
    align-self: flex-end;
    .message-bubble {
      background: #005c4b;
      color: #e9edef;
      border-radius: 8px 0 8px 8px;
    }

    &.is-image .message-bubble {
      background: #005c4b;
      padding: 3px;
    }

    &.is-audio .message-bubble {
      background: #005c4b;
      min-width: 280px;
    }
  }

  &.assistant-message {
    align-self: flex-start;
    .message-bubble {
      background: #202c33;
      color: #e9edef;
      border-radius: 0 8px 8px 8px;
    }

    &.is-image .message-bubble {
      background: #202c33;
      padding: 3px;
    }

    &.is-audio .message-bubble {
      background: #202c33;
      min-width: 280px;
    }
  }
}

.message-bubble {
  position: relative;
  padding: 8px 12px;
  box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
  font-size: 14.5px;
  line-height: 1.4;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    width: 0;
    height: 0;
    border: 8px solid transparent;
  }
}

.user-message .message-bubble::before {
  right: -8px;
  border-left-color: #005c4b;
  border-top-color: #005c4b;
}

.assistant-message .message-bubble::before {
  left: -8px;
  border-right-color: #202c33;
  border-top-color: #202c33;
}

// Ocultar cola en medios puros (sin texto)
.is-image:not(.has-content) .message-bubble::before,
.is-audio .message-bubble::before {
  display: none;
}

.is-image:not(.has-content) .message-bubble,
.is-audio .message-bubble {
  border-radius: 8px !important;
}

.whatsapp-image {
  max-height: 400px;
  max-width: 100%;
  border-radius: 6px;
  display: block;
}
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px !important;
  background: #202c33 !important;
  border-radius: 0 15px 15px 15px !important;

  span {
    width: 6px;
    height: 6px;
    background: #8696a0;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: -0.1s; }
  }
}

// Audio Message styling
.audio-bubble {
  padding: 8px !important;
}

.audio-inner-layout {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
}

.audio-avatar {
  flex-shrink: 0;
  position: relative;
  border: 1.5px solid rgba(255,255,255,0.1);

  .mic-icon-overlay {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #005c4b;
    border-radius: 50%;
    padding: 2px;
    border: 1px solid #202c33;
  }
}

.audio-controls-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.audio-player) {
    background: transparent !important;
    padding: 0 !important;
    gap: 4px !important;

    .q-btn { color: #8696a0 !important; }
    .progress-bar {
      height: 3px !important;
      background: rgba(134, 150, 160, 0.2) !important;
    }
    .audio-time { color: #8696a0 !important; font-size: 11px; }
  }
}

// Image Message styling
.image-bubble {
  overflow: hidden;
  max-width: 330px;
}

.image-content-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
}

.whatsapp-image {
  max-height: 400px;
  width: 100%;
  display: block;
}

.image-footer-overlay {
  position: absolute;
  bottom: 4px;
  right: 6px;
  background: rgba(0,0,0,0.4);
  padding: 2px 6px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 10px;
}

// File styling
.file-link-wrapper {
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  margin-bottom: 6px;
  padding: 8px;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #e9edef;
}

.file-icon-box {
  width: 40px;
  height: 40px;
  background: #00a884;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-details {
  flex: 1;
  overflow: hidden;
  .file-name {
    display: block;
    font-weight: 500;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.message-sender {
  font-size: 13px;
  font-weight: 600;
  color: #53bdeb;
  margin-bottom: 4px;
}

.message-content {
  word-break: break-word;
  white-space: pre-wrap;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 11px;
  color: #8696a0;
  margin-top: 2px;
}

// Global Message Overrides
.user-message .message-footer {
  color: rgba(255,255,255,0.6);
}

.attachment-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: #202c33;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.05);

  .preview-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    overflow: hidden;
  }

  .preview-mini {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .preview-file-icon {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.status-filters {
  padding: 12px 16px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  background: #111b21;
}

// Reuse other animations and overlays from WhatsApp style but modernized
.image-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
}

.preview-header {
}

.preview-image-container {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-main-image {
  max-width: 90vw;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.nav-btn {
  position: absolute;
  background: rgba(255,255,255,0.1) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(255,255,255,0.2) !important;
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
  }
}

.nav-prev {
  left: 16px;
}

.nav-next {
  right: 16px;
}

.preview-thumbnails {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  overflow-x: auto;
}

.thumbnail-item {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.5;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }

  &.active {
    opacity: 1;
    border-color: white;
    transform: scale(1.1);
  }
}

// Animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.scroll-bottom-alert {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  color: var(--q-primary);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  z-index: 10;
  border: 1px solid rgba(0,0,0,0.05);

  &:hover {
    background: #f5f5f5;
  }
}
</style>
