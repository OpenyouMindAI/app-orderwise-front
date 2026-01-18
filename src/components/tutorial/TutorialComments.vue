<template>
  <div class="tutorial-comments" :class="{ 'mobile-comments': mobile }">
    <!-- Comments Header -->
    <div class="comments-header">
      <h3 class="comments-title">
        {{ commentsCount }} {{ commentsCount === 1 ? 'comentario' : 'comentarios' }}
      </h3>
      <q-btn
        v-if="isAdmin"
        flat
        dense
        icon="sort"
        :label="sortOrder === 'newest' ? 'Más recientes' : 'Destacados'"
        @click="toggleSort"
      />
    </div>

    <!-- Add Comment Input -->
    <div class="add-comment">
      <q-avatar size="40px">
        <img v-if="userAvatar" :src="userAvatar" alt="avatar" />
        <q-icon v-else name="person" />
      </q-avatar>
      <div class="comment-input-wrapper">
        <q-input
          v-model="newComment"
          placeholder="Añade un comentario..."
          dense
          borderless
          class="comment-input"
          @focus="commentInputFocused = true"
        />
        <transition name="fade">
          <div v-if="commentInputFocused || newComment" class="comment-actions">
            <q-btn
              flat
              label="Cancelar"
              @click="cancelComment"
            />
            <q-btn
              color="primary"
              label="Comentar"
              unelevated
              :disable="!newComment.trim()"
              @click="submitComment"
            />
          </div>
        </transition>
      </div>
    </div>

    <!-- Comments List -->
    <div class="comments-list" ref="commentsContainer">
      <div v-if="loading" class="loading-comments">
        <q-spinner color="primary" size="32px" />
      </div>

      <template v-else>
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
          :class="{ pinned: comment.is_pinned }"
        >
          <!-- Pinned badge -->
          <div v-if="comment.is_pinned" class="pinned-badge">
            <q-icon name="push_pin" size="xs" />
            <span>Fijado</span>
          </div>

          <div class="comment-content">
            <q-avatar size="40px" class="comment-avatar">
              <img v-if="comment.user?.avatar" :src="comment.user.avatar" alt="avatar" />
              <q-icon v-else name="person" />
            </q-avatar>

            <div class="comment-body">
              <div class="comment-header">
                <span class="author-name">{{ comment.user?.name || 'Usuario' }}</span>
                <span class="comment-date">{{ formatTimeAgo(comment.created_at) }}</span>
              </div>

              <div class="comment-text">
                {{ comment.content }}
              </div>

              <div class="comment-footer">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  :icon="comment.is_liked ? 'thumb_up' : 'thumb_up_off_alt'"
                  :color="comment.is_liked ? 'primary' : undefined"
                  @click="toggleCommentLike(comment)"
                />
                <span class="like-count">{{ comment.likes_count || 0 }}</span>

                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="thumb_down_off_alt"
                />

                <q-btn
                  flat
                  dense
                  label="Responder"
                  @click="startReply(comment)"
                />

                <!-- Admin actions -->
                <template v-if="isAdmin">
                  <q-btn flat dense round icon="more_vert" size="sm">
                    <q-menu>
                      <q-list dense>
                        <q-item clickable v-close-popup @click="togglePin(comment)">
                          <q-item-section avatar>
                            <q-icon :name="comment.is_pinned ? 'push_pin' : 'push_pin'" />
                          </q-item-section>
                          <q-item-section>
                            {{ comment.is_pinned ? 'Desfijar' : 'Fijar' }}
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="deleteComment(comment)">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section>Eliminar</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </template>
              </div>

              <!-- Reply Input -->
              <transition name="slide-down">
                <div v-if="replyingTo === comment.id" class="reply-input">
                  <q-avatar size="28px">
                    <img v-if="userAvatar" :src="userAvatar" alt="avatar" />
                    <q-icon v-else name="person" />
                  </q-avatar>
                  <div class="reply-input-wrapper">
                    <q-input
                      v-model="replyContent"
                      placeholder="Añade una respuesta..."
                      dense
                      borderless
                      autofocus
                    />
                    <div class="reply-actions">
                      <q-btn flat label="Cancelar" size="sm" @click="cancelReply" />
                      <q-btn
                        color="primary"
                        label="Responder"
                        size="sm"
                        unelevated
                        :disable="!replyContent.trim()"
                        @click="submitReply(comment)"
                      />
                    </div>
                  </div>
                </div>
              </transition>

              <!-- Replies -->
              <div v-if="comment.replies?.length > 0" class="replies-section">
                <q-btn
                  flat
                  dense
                  color="primary"
                  :icon="expandedReplies.includes(comment.id) ? 'expand_less' : 'expand_more'"
                  :label="`${comment.replies.length} ${comment.replies.length === 1 ? 'respuesta' : 'respuestas'}`"
                  @click="toggleReplies(comment.id)"
                />

                <transition name="slide-down">
                  <div v-if="expandedReplies.includes(comment.id)" class="replies-list">
                    <div
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      class="reply-item"
                    >
                      <q-avatar size="28px">
                        <img v-if="reply.user?.avatar" :src="reply.user.avatar" alt="avatar" />
                        <q-icon v-else name="person" />
                      </q-avatar>

                      <div class="reply-body">
                        <div class="comment-header">
                          <span class="author-name">{{ reply.user?.name || 'Usuario' }}</span>
                          <span class="comment-date">{{ formatTimeAgo(reply.created_at) }}</span>
                        </div>

                        <div class="comment-text">{{ reply.content }}</div>

                        <div class="comment-footer">
                          <q-btn
                            flat
                            round
                            dense
                            size="sm"
                            :icon="reply.is_liked ? 'thumb_up' : 'thumb_up_off_alt'"
                            :color="reply.is_liked ? 'primary' : undefined"
                            @click="toggleCommentLike(reply)"
                          />
                          <span class="like-count">{{ reply.likes_count || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="comments.length === 0 && !loading" class="no-comments">
          <q-icon name="chat_bubble_outline" size="48px" color="grey-5" />
          <p>No hay comentarios todavía</p>
          <p class="text-caption">¡Sé el primero en comentar!</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'
import { notify } from 'src/const/mixins'

/**
 * Props definition
 */
const props = defineProps({
  /**
   * Tutorial ID
   * @type {number}
   */
  tutorialId: {
    type: [Number, String],
    required: true
  },
  /**
   * Comments count
   * @type {number}
   */
  commentsCount: {
    type: Number,
    default: 0
  },
  /**
   * Whether user is admin
   * @type {boolean}
   */
  isAdmin: {
    type: Boolean,
    default: false
  },
  /**
   * Mobile mode
   * @type {boolean}
   */
  mobile: {
    type: Boolean,
    default: false
  }
})

const store = authentication()

/**
 * Comments list
 * @type {array}
 */
const comments = ref([])

/**
 * Loading state
 * @type {boolean}
 */
const loading = ref(false)

/**
 * New comment content
 * @type {string}
 */
const newComment = ref('')

/**
 * Comment input focused state
 * @type {boolean}
 */
const commentInputFocused = ref(false)

/**
 * Sort order: 'newest' or 'popular'
 * @type {string}
 */
const sortOrder = ref('newest')

/**
 * Comment ID being replied to
 * @type {number|null}
 */
const replyingTo = ref(null)

/**
 * Reply content
 * @type {string}
 */
const replyContent = ref('')

/**
 * Expanded replies
 * @type {array}
 */
const expandedReplies = ref([])

/**
 * User avatar
 * @type {string}
 */
const userAvatar = computed(() => store.userSession?.avatar || null)

/**
 * Fetch comments on mount and when tutorial changes
 */
onMounted(() => {
  getComments()
})

watch(() => props.tutorialId, () => {
  getComments()
})

/**
 * Fetch comments for the tutorial
 */
const getComments = async () => {
  try {
    loading.value = true
    const { data } = await api.get(`tutorials/${props.tutorialId}/comments`)
    comments.value = data.data || data
  } catch (error) {
    console.error('Error fetching comments:', error)
  } finally {
    loading.value = false
  }
}

/**
 * Submit a new comment
 */
const submitComment = async () => {
  if (!newComment.value.trim()) return

  try {
    const { data } = await api.post(`tutorials/${props.tutorialId}/comments`, {
      content: newComment.value.trim()
    })
    comments.value.unshift(data)
    newComment.value = ''
    commentInputFocused.value = false
    notify('Comentario publicado', 'positive', 'check')
  } catch (error) {
    notify(error.response?.data?.message || 'Error al publicar comentario', 'negative', 'warning')
  }
}

/**
 * Cancel comment input
 */
const cancelComment = () => {
  newComment.value = ''
  commentInputFocused.value = false
}

/**
 * Toggle sort order
 */
const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'newest' ? 'popular' : 'newest'
  // Re-sort comments
  if (sortOrder.value === 'popular') {
    comments.value.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
  } else {
    comments.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
}

/**
 * Start replying to a comment
 * @param {object} comment - Comment to reply to
 */
const startReply = (comment) => {
  replyingTo.value = comment.id
  replyContent.value = ''
}

/**
 * Cancel reply
 */
const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

/**
 * Submit a reply
 * @param {object} parentComment - Parent comment
 */
const submitReply = async (parentComment) => {
  if (!replyContent.value.trim()) return

  try {
    const { data } = await api.post(`tutorials/${props.tutorialId}/comments`, {
      content: replyContent.value.trim(),
      parent_id: parentComment.id
    })

    // Add reply to parent comment
    if (!parentComment.replies) {
      parentComment.replies = []
    }
    parentComment.replies.push(data)

    // Expand replies
    if (!expandedReplies.value.includes(parentComment.id)) {
      expandedReplies.value.push(parentComment.id)
    }

    replyingTo.value = null
    replyContent.value = ''
    notify('Respuesta publicada', 'positive', 'check')
  } catch (error) {
    notify(error.response?.data?.message || 'Error al publicar respuesta', 'negative', 'warning')
  }
}

/**
 * Toggle replies visibility
 * @param {number} commentId - Comment ID
 */
const toggleReplies = (commentId) => {
  const index = expandedReplies.value.indexOf(commentId)
  if (index !== -1) {
    expandedReplies.value.splice(index, 1)
  } else {
    expandedReplies.value.push(commentId)
  }
}

/**
 * Toggle like on a comment
 * @param {object} comment - Comment to like/unlike
 */
const toggleCommentLike = async (comment) => {
  try {
    const { data } = await api.post(`tutorial-comments/${comment.id}/like`)
    comment.is_liked = data.liked
    comment.likes_count = data.likes_count
  } catch (error) {
    notify('Error al dar like', 'negative', 'warning')
  }
}

/**
 * Toggle pin on a comment (admin only)
 * @param {object} comment - Comment to pin/unpin
 */
const togglePin = async (comment) => {
  try {
    const { data } = await api.post(`tutorial-comments/${comment.id}/pin`)
    comment.is_pinned = data.is_pinned
    // Re-sort to bring pinned to top
    comments.value.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      return 0
    })
    notify(data.is_pinned ? 'Comentario fijado' : 'Comentario desfijado', 'positive', 'push_pin')
  } catch (error) {
    notify('Error al fijar comentario', 'negative', 'warning')
  }
}

/**
 * Delete a comment (admin only)
 * @param {object} comment - Comment to delete
 */
const deleteComment = async (comment) => {
  try {
    await api.delete(`tutorial-comments/${comment.id}`)
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      comments.value.splice(index, 1)
    }
    notify('Comentario eliminado', 'positive', 'delete')
  } catch (error) {
    notify('Error al eliminar comentario', 'negative', 'warning')
  }
}

/**
 * Format time ago
 * @param {string} dateStr - Date string
 * @returns {string} Time ago string
 */
const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'hace un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} ${days === 1 ? 'día' : 'días'}`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  const months = Math.floor(days / 30)
  if (months < 12) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`
  const years = Math.floor(days / 365)
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`
}
</script>

<style lang="scss" scoped>
.tutorial-comments {
  padding: 16px 0;

  &.mobile-comments {
    padding: 8px;

    .add-comment,
    .comment-content {
      padding: 8px 0;
    }
  }
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  .comments-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
  }
}

.add-comment {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;

  .comment-input-wrapper {
    flex: 1;

    .comment-input {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);

      body.body--dark & {
        border-color: rgba(255, 255, 255, 0.1);
      }
    }

    .comment-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loading-comments {
  display: flex;
  justify-content: center;
  padding: 32px;
}

.comment-item {
  &.pinned {
    background: rgba(var(--q-primary-rgb), 0.05);
    border-radius: 12px;
    padding: 12px;
    margin: -12px;
    margin-bottom: 12px;
  }

  .pinned-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--q-grey-7);
    font-size: 0.75rem;
    margin-bottom: 8px;
  }
}

.comment-content {
  display: flex;
  gap: 12px;

  .comment-avatar {
    flex-shrink: 0;
  }

  .comment-body {
    flex: 1;
    min-width: 0;
  }

  .comment-header {
    margin-bottom: 4px;

    .author-name {
      font-weight: 600;
      font-size: 0.875rem;
      margin-right: 8px;
    }

    .comment-date {
      color: var(--q-grey-6);
      font-size: 0.75rem;
    }
  }

  .comment-text {
    font-size: 0.9375rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .comment-footer {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;

    .like-count {
      font-size: 0.75rem;
      color: var(--q-grey-6);
      margin-right: 8px;
    }
  }
}

.reply-input {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-left: 4px;

  .reply-input-wrapper {
    flex: 1;

    .reply-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
  }
}

.replies-section {
  margin-top: 8px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
  padding-left: 8px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);

  body.body--dark & {
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.reply-item {
  display: flex;
  gap: 8px;

  .reply-body {
    flex: 1;
    min-width: 0;
  }
}

.no-comments {
  text-align: center;
  padding: 48px 16px;
  color: var(--q-grey-6);

  p {
    margin: 8px 0 0;
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
