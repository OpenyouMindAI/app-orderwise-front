<template>
  <q-page class="help-article-page q-pa-md">
    <div class="help-article-inner">

      <!-- Breadcrumb -->
      <HelpBreadcrumb :category="category" :article="article" />

      <!-- Artículo no encontrado -->
      <div v-if="!article" class="text-center q-pa-xl">
        <q-icon name="article" size="80px" color="grey-3" class="q-mb-md" />
        <div class="text-h5 text-grey-5 q-mb-sm">Artículo no encontrado</div>
        <div class="text-body2 text-grey-5 q-mb-lg">El artículo que buscás no existe o fue movido.</div>
        <q-btn unelevated color="primary" no-caps label="Volver al centro de ayuda" @click="$router.push({ name: 'HelpCenter' })" />
      </div>

      <!-- Artículo encontrado -->
      <div v-else>
        <HelpArticle
          :article="article"
          :category="category"
          @navigate="goToArticle"
          @open-support="openSupport"
          @report-problem="reportProblem"
        />
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HelpBreadcrumb from 'src/components/HelpCenter/HelpBreadcrumb.vue'
import HelpArticle from 'src/components/HelpCenter/HelpArticle.vue'
import { getArticleBySlug, getCategoryById } from 'src/data/helpArticles'

const route = useRoute()
const router = useRouter()

const category = computed(() => getCategoryById(route.params.category))

const article = computed(() => {
  return getArticleBySlug(route.params.category, route.params.article)
})

function goToArticle (art) {
  router.push({
    name: 'HelpArticle',
    params: { category: art.categoryId, article: art.slug }
  })
}

function openSupport () {
  router.push({ name: 'Support' })
}

function reportProblem () {
  router.push({ name: 'Support' })
}
</script>

<style scoped>
.help-article-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.help-article-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 0 64px;
}

/* Dark mode */
.body--dark .help-article-page {
  background: #0f0f1a;
}
</style>
