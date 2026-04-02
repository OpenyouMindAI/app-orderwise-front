<template>
  <div class="help-article">
    <!-- Encabezado del artículo -->
    <div class="help-article__header q-mb-xl">
      <div class="help-article__category-badge q-mb-sm" v-if="category">
        <q-chip
          :icon="category.icon"
          :color="category.color"
          text-color="white"
          :label="category.title"
          size="sm"
          class="q-ma-none"
          dense
        />
      </div>
      <h1 class="help-article__title">{{ article.title }}</h1>
      <p class="help-article__subtitle text-grey-7" v-if="article.subtitle">
        {{ article.subtitle }}
      </p>
    </div>

    <!-- Video Tutorial (si existe) -->
    <div v-if="article.tutorialVideo" class="help-article__video q-mb-xl">
      <q-card flat bordered class="video-card rounded-borders">
        <div class="video-thumbnail" @click="openVideo">
          <div class="video-play-btn">
            <q-icon name="play_circle_filled" size="64px" color="white" />
          </div>
          <div class="video-label">
            <q-icon name="play_arrow" size="18px" />
            <span>Ver tutorial en video</span>
          </div>
        </div>
      </q-card>
    </div>

    <!-- Contenido del artículo -->
    <div
      class="help-article__content"
      v-html="article.content"
    />

    <q-separator class="q-my-xl" />

    <!-- Feedback -->
    <div class="help-article__feedback text-center q-mb-xl">
      <div class="text-h6 text-grey-7 q-mb-md">¿Este artículo te fue útil?</div>
      <div class="row justify-center q-gutter-md">
        <q-btn
          :outline="feedbackGiven !== 'yes'"
          :unelevated="feedbackGiven === 'yes'"
          color="positive"
          icon="thumb_up"
          label="Sí, me ayudó"
          no-caps
          rounded
          class="feedback-btn"
          size="md"
          :disable="feedbackGiven !== null"
          @click="submitFeedback('yes')"
        />
        <q-btn
          :outline="feedbackGiven !== 'no'"
          :unelevated="feedbackGiven === 'no'"
          color="negative"
          icon="thumb_down"
          label="No me ayudó"
          no-caps
          rounded
          class="feedback-btn"
          size="md"
          :disable="feedbackGiven !== null"
          @click="submitFeedback('no')"
        />
      </div>
      <transition name="fade">
        <div v-if="feedbackGiven" class="q-mt-md text-body2 text-grey-6">
          <span v-if="feedbackGiven === 'yes'">¡Nos alegra haber ayudado! 🎉</span>
          <span v-else>
            Gracias por el feedback. ¿Querés <a class="help-link cursor-pointer" @click="reportProblem">reportar un problema</a>?
          </span>
        </div>
      </transition>
    </div>

    <!-- Artículos relacionados -->
    <div v-if="relatedArticles.length > 0" class="help-article__related">
      <div class="text-h6 text-weight-bold q-mb-md">Artículos relacionados</div>
      <q-list bordered separator class="rounded-borders">
        <q-item
          v-for="related in relatedArticles"
          :key="related.id"
          clickable
          v-ripple
          class="related-item"
          @click="$emit('navigate', related)"
        >
          <q-item-section avatar>
            <q-icon :name="getRelatedCategoryIcon(related.categoryId)" size="20px" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-body2 text-weight-medium">{{ related.title }}</q-item-label>
            <q-item-label caption>{{ getRelatedCategoryName(related.categoryId) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey-5" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Botón de soporte -->
    <div class="help-article__support text-center q-mt-xl q-pa-xl support-box rounded-borders">
      <q-icon name="support_agent" size="40px" color="primary" class="q-mb-md" />
      <div class="text-h6 q-mb-xs">¿Todavía tenés dudas?</div>
      <div class="text-body2 text-grey-6 q-mb-md">Nuestro equipo de soporte está para ayudarte</div>
      <q-btn
        unelevated
        color="primary"
        icon="chat"
        label="Chatear con soporte"
        no-caps
        rounded
        size="md"
        @click="$emit('open-support')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { helpCategories, getRelatedArticles } from 'src/data/helpArticles'

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  category: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['navigate', 'open-support', 'report-problem'])

const feedbackGiven = ref(null)

const relatedArticles = getRelatedArticles(props.article.relatedArticles || [])

function getCategoryById (id) {
  return helpCategories.find(c => c.id === id)
}

function getRelatedCategoryIcon (categoryId) {
  const cat = getCategoryById(categoryId)
  return cat ? cat.icon : 'article'
}

function getRelatedCategoryName (categoryId) {
  const cat = getCategoryById(categoryId)
  return cat ? cat.title : ''
}

function submitFeedback (type) {
  feedbackGiven.value = type
}

function openVideo () {
  if (props.article.tutorialVideo) {
    window.open(props.article.tutorialVideo.mobile || props.article.tutorialVideo.desktop, '_blank')
  }
}

function reportProblem () {
  emit('report-problem')
}
</script>

<style scoped>
.help-article__title {
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 700;
  line-height: 1.3;
  color: #1a1a2e;
  margin: 8px 0;
}

.help-article__subtitle {
  font-size: 17px;
  line-height: 1.5;
  margin: 0;
}

.video-card {
  overflow: hidden;
}

.video-thumbnail {
  height: 200px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: opacity 0.2s;
}

.video-thumbnail:hover {
  opacity: 0.9;
}

.video-play-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-label {
  position: absolute;
  bottom: 16px;
  left: 16px;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.help-article__content :deep(h3) {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 28px 0 12px;
}

.help-article__content :deep(p) {
  font-size: 16px;
  line-height: 1.7;
  color: #333;
  margin: 0 0 12px;
}

.help-article__content :deep(ul) {
  padding-left: 20px;
  margin-bottom: 12px;
}

.help-article__content :deep(li) {
  font-size: 16px;
  line-height: 1.7;
  color: #333;
  margin-bottom: 6px;
}

.help-article__content :deep(.help-step) {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0,0,0,0.02);
  border-radius: 12px;
  border-left: 4px solid var(--q-primary);
}

.help-article__content :deep(.step-number) {
  min-width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--q-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.help-article__content :deep(.step-content) {
  flex: 1;
  min-width: 0;
}

.help-article__content :deep(.step-content strong) {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  display: block;
  margin-bottom: 6px;
}

.help-article__content :deep(.step-content p) {
  font-size: 15px;
  color: #555;
  margin: 0 0 6px;
}

.help-article__content :deep(.help-tip) {
  background: #fff9e6;
  border: 1px solid #ffe082;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: #6d4c41;
  margin-top: 10px;
  line-height: 1.5;
}

.help-article__content :deep(.help-link) {
  color: var(--q-primary);
  text-decoration: underline;
  cursor: pointer;
}

.help-article__content :deep(.help-module-list) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.help-article__content :deep(.help-module-item) {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 10px;
  background: rgba(0,0,0,0.025);
}

.help-article__content :deep(.module-icon) {
  font-size: 24px;
  min-width: 36px;
  text-align: center;
}

.help-article__content :deep(.help-plan-comparison) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 16px 0;
}

.help-article__content :deep(.plan-item) {
  background: rgba(0,0,0,0.025);
  border-radius: 12px;
  padding: 16px;
}

.help-article__content :deep(.faq-item) {
  border-left: 3px solid var(--q-primary);
  padding: 12px 16px;
  margin-bottom: 16px;
  background: rgba(0,0,0,0.02);
  border-radius: 0 8px 8px 0;
}

.feedback-btn {
  min-width: 160px;
  font-size: 15px;
}

.support-box {
  background: rgba(var(--q-primary-rgb, 84, 110, 122), 0.04);
  border: 1px solid rgba(var(--q-primary-rgb, 84, 110, 122), 0.12);
}

.related-item {
  padding: 12px 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
