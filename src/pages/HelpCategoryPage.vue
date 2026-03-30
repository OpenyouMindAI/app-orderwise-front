<template>
  <q-page class="help-category-page q-pa-md">
    <div class="help-category-inner">

      <!-- Breadcrumb -->
      <HelpBreadcrumb :category="category" />

      <!-- Encabezado de categoría -->
      <div v-if="category" class="help-category-header q-mb-xl">
        <div class="row items-center q-gutter-md">
          <div class="help-category-header__icon-wrap" :class="`bg-${category.color}-1`">
            <q-icon :name="category.icon" :color="category.color" size="40px" />
          </div>
          <div>
            <h1 class="help-category-header__title">{{ category.title }}</h1>
            <p class="help-category-header__desc text-grey-6">{{ category.description }}</p>
            <q-badge :color="category.color" :label="`${articles.length} artículos`" />
          </div>
        </div>
      </div>

      <!-- Buscador local -->
      <div class="q-mb-lg">
        <q-input
          v-model="localSearch"
          placeholder="Buscar en esta categoría..."
          filled
          clearable
          dense
          class="category-search-input"
          bg-color="white"
        >
          <template #prepend>
            <q-icon name="search" size="20px" color="grey-6" />
          </template>
        </q-input>
      </div>

      <!-- Lista de artículos -->
      <div v-if="filteredArticles.length === 0" class="text-center q-pa-xl">
        <q-icon name="search_off" size="64px" color="grey-3" class="q-mb-md" />
        <div class="text-h6 text-grey-5">No hay artículos que coincidan</div>
      </div>

      <q-list v-else bordered separator class="articles-list rounded-borders">
        <q-item
          v-for="article in filteredArticles"
          :key="article.id"
          clickable
          v-ripple
          class="article-list-item"
          @click="goToArticle(article)"
        >
          <q-item-section avatar>
            <div class="article-list-item__num text-caption text-grey-5 text-weight-bold">
              {{ article.id }}
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-body1 text-weight-medium article-list-item__title">
              {{ article.title }}
            </q-item-label>
            <q-item-label caption class="text-grey-6 q-mt-xs" v-if="article.subtitle">
              {{ article.subtitle }}
            </q-item-label>
            <!-- Tags -->
            <div class="q-mt-xs row q-gutter-xs" v-if="article.tags && article.tags.length">
              <q-chip
                v-for="tag in article.tags.slice(0,3)"
                :key="tag"
                dense
                size="xs"
                color="grey-2"
                text-color="grey-7"
                class="q-ma-none"
              >
                {{ tag }}
              </q-chip>
            </div>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey-5" />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Volver al centro de ayuda -->
      <div class="q-mt-xl text-center">
        <q-btn
          flat
          no-caps
          color="primary"
          icon="arrow_back"
          label="Ver todas las categorías"
          @click="$router.push({ name: 'HelpCenter' })"
        />
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HelpBreadcrumb from 'src/components/HelpCenter/HelpBreadcrumb.vue'
import { getArticlesByCategory, getCategoryById } from 'src/data/helpArticles'

const route = useRoute()
const router = useRouter()
const localSearch = ref('')

const category = computed(() => getCategoryById(route.params.category))

const articles = computed(() => {
  if (!route.params.category) return []
  return getArticlesByCategory(route.params.category)
})

const filteredArticles = computed(() => {
  if (!localSearch.value.trim()) return articles.value
  const q = localSearch.value.toLowerCase()
  return articles.value.filter(a =>
    a.title.toLowerCase().includes(q) ||
    (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
    (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
  )
})

function goToArticle (article) {
  router.push({
    name: 'HelpArticle',
    params: { category: article.categoryId, article: article.slug }
  })
}
</script>

<style scoped>
.help-category-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.help-category-inner {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 0 48px;
}

.help-category-header__icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.help-category-header__title {
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.help-category-header__desc {
  font-size: 15px;
  margin: 0 0 8px;
}

.category-search-input :deep(.q-field__control) {
  border-radius: 10px;
}

.articles-list {
  background: white;
  border-radius: 16px !important;
  overflow: hidden;
}

.article-list-item {
  padding: 16px;
  transition: background 0.15s;
}

.article-list-item:hover {
  background: rgba(var(--q-primary-rgb, 84, 110, 122), 0.04);
}

.article-list-item__num {
  font-size: 11px;
  min-width: 40px;
  text-align: center;
}

.article-list-item__title {
  font-size: 15px;
  line-height: 1.4;
}

/* Dark mode */
.body--dark .help-category-page {
  background: #0f0f1a;
}

.body--dark .articles-list {
  background: #1a1a2e;
}
</style>
