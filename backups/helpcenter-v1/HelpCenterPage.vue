<template>
  <q-page class="help-center-page">
    <!-- Hero Section -->
    <div class="help-hero">
      <div class="help-hero__inner">
        <h1 class="help-hero__title">¿En qué podemos ayudarte?</h1>
        <p class="help-hero__subtitle">Buscá respuestas, guías y tutoriales para usar QBITS</p>

        <!-- Buscador principal -->
        <div class="help-hero__search">
          <HelpSearchBar
            v-model="searchQuery"
            placeholder="Buscá artículos... Ej: cómo cobrar, agregar producto, caja..."
            @search="onSearch"
            @select="onSelectArticle"
          />
        </div>
      </div>
    </div>

    <div class="help-center-content q-pa-md">

      <!-- Resultados de búsqueda -->
      <div v-if="searchQuery.length >= 2" class="help-search-results q-mb-xl">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6 text-weight-bold">
            Resultados para "{{ searchQuery }}"
            <q-badge color="primary" :label="searchResults.length" class="q-ml-sm" />
          </div>
          <q-btn flat dense no-caps color="grey-7" label="Limpiar búsqueda" icon="close" @click="clearSearch" size="sm" />
        </div>

        <div v-if="searchResults.length === 0" class="text-center q-pa-xl">
          <q-icon name="search_off" size="64px" color="grey-3" class="q-mb-md" />
          <div class="text-h6 text-grey-5">No encontramos resultados</div>
          <div class="text-body2 text-grey-5 q-mt-sm">Probá con otras palabras o explorá las categorías de abajo</div>
        </div>

        <div v-else class="row q-col-gutter-sm">
          <div
            v-for="article in searchResults"
            :key="article.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              flat
              bordered
              class="search-result-card cursor-pointer"
              @click="goToArticle(article)"
            >
              <q-card-section>
                <div class="row items-start no-wrap q-gutter-sm">
                  <q-icon :name="getCategoryIcon(article.categoryId)" :color="getCategoryColor(article.categoryId)" size="22px" class="q-mt-xs" />
                  <div class="col">
                    <div class="text-body2 text-weight-bold result-title">{{ article.title }}</div>
                    <div class="text-caption text-grey-6 q-mt-xs">{{ getCategoryName(article.categoryId) }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Categorías -->
      <div v-else>

        <!-- Artículos destacados -->
        <div class="q-mb-xl">
          <div class="section-title q-mb-md">
            <q-icon name="star" color="amber" size="20px" class="q-mr-xs" />
            <span class="text-h6 text-weight-bold">Los más consultados</span>
          </div>
          <div class="row q-col-gutter-sm">
            <div
              v-for="article in featuredArticlesData"
              :key="article.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-item
                clickable
                v-ripple
                bordered
                class="featured-article-item rounded-borders"
                @click="goToArticle(article)"
              >
                <q-item-section avatar>
                  <q-icon :name="getCategoryIcon(article.categoryId)" :color="getCategoryColor(article.categoryId)" size="24px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-weight-medium">{{ article.title }}</q-item-label>
                  <q-item-label caption>{{ getCategoryName(article.categoryId) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-5" size="18px" />
                </q-item-section>
              </q-item>
            </div>
          </div>
        </div>

        <!-- Todas las Categorías -->
        <div class="q-mb-xl">
          <div class="section-title q-mb-md">
            <q-icon name="grid_view" color="primary" size="20px" class="q-mr-xs" />
            <span class="text-h6 text-weight-bold">Explorar por categoría</span>
          </div>
          <div class="row q-col-gutter-md">
            <div
              v-for="category in helpCategories"
              :key="category.id"
              class="col-6 col-sm-4 col-md-3 col-lg-2"
            >
              <HelpCategoryCard
                :category="category"
                @click="goToCategory"
              />
            </div>
          </div>
        </div>

        <!-- Sección de soporte -->
        <div class="help-support-section q-pa-xl text-center rounded-borders q-mb-xl">
          <q-icon name="support_agent" size="48px" color="primary" class="q-mb-md" />
          <div class="text-h6 text-weight-bold q-mb-xs">¿No encontrás lo que buscás?</div>
          <div class="text-body2 text-grey-6 q-mb-lg">Nuestro equipo de soporte está listo para ayudarte</div>
          <div class="row justify-center q-gutter-md">
            <q-btn
              unelevated
              color="primary"
              icon="chat"
              label="Chatear con soporte"
              no-caps
              rounded
              size="md"
              @click="openSupport"
            />
            <q-btn
              outline
              color="primary"
              icon="bug_report"
              label="Reportar un problema"
              no-caps
              rounded
              size="md"
              @click="reportProblem"
            />
          </div>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import HelpSearchBar from 'src/components/HelpCenter/HelpSearchBar.vue'
import HelpCategoryCard from 'src/components/HelpCenter/HelpCategoryCard.vue'
import {
  helpCategories,
  allArticles,
  featuredArticles,
  searchArticles,
  getCategoryById
} from 'src/data/helpArticles'

const router = useRouter()
const searchQuery = ref('')

const featuredArticlesData = computed(() => {
  return featuredArticles
    .map(id => allArticles.find(a => a.id === id))
    .filter(Boolean)
})

const searchResults = computed(() => {
  if (searchQuery.value.length < 2) return []
  return searchArticles(searchQuery.value)
})

function getCategoryIcon (categoryId) {
  const cat = getCategoryById(categoryId)
  return cat ? cat.icon : 'help_outline'
}

function getCategoryColor (categoryId) {
  const cat = getCategoryById(categoryId)
  return cat ? cat.color : 'primary'
}

function getCategoryName (categoryId) {
  const cat = getCategoryById(categoryId)
  return cat ? cat.title : ''
}

function onSearch (query) {
  searchQuery.value = query
}

function onSelectArticle (article) {
  goToArticle(article)
}

function clearSearch () {
  searchQuery.value = ''
}

function goToCategory (category) {
  router.push({ name: 'HelpCategory', params: { category: category.id } })
}

function goToArticle (article) {
  router.push({
    name: 'HelpArticle',
    params: { category: article.categoryId, article: article.slug }
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
.help-center-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.help-hero {
  background: linear-gradient(135deg, var(--q-primary) 0%, color-mix(in srgb, var(--q-primary) 75%, #000) 100%);
  padding: 48px 16px 56px;
  text-align: center;
}

.help-hero__inner {
  max-width: 640px;
  margin: 0 auto;
}

.help-hero__title {
  color: white;
  font-size: clamp(24px, 5vw, 40px);
  font-weight: 800;
  margin: 0 0 10px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.help-hero__subtitle {
  color: rgba(255,255,255,0.85);
  font-size: 16px;
  margin: 0 0 28px;
}

.help-hero__search {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.help-center-content {
  max-width: 1200px;
  margin: -20px auto 0;
  padding: 0 16px 48px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 4px;
}

.featured-article-item {
  background: white;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px !important;
  transition: all 0.15s;
  padding: 12px 16px;
}

.featured-article-item:hover {
  border-color: var(--q-primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.search-result-card {
  border-radius: 12px !important;
  transition: all 0.15s;
  background: white;
}

.search-result-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
  border-color: var(--q-primary) !important;
}

.result-title {
  line-height: 1.3;
}

.help-support-section {
  background: linear-gradient(135deg, rgba(var(--q-primary-rgb, 84, 110, 122), 0.06), rgba(var(--q-primary-rgb, 84, 110, 122), 0.03));
  border: 1px solid rgba(var(--q-primary-rgb, 84, 110, 122), 0.15);
}

/* Dark mode */
.body--dark .help-center-page {
  background: #0f0f1a;
}

.body--dark .featured-article-item,
.body--dark .search-result-card {
  background: #1a1a2e;
  border-color: rgba(255,255,255,0.08);
}
</style>
