<template>
  <div class="help-search-bar">
    <q-input
      v-model="localQuery"
      :placeholder="placeholder"
      filled
      clearable
      class="help-search-input"
      bg-color="white"
      @update:model-value="onInput"
      @keyup.enter="onEnter"
    >
      <template #prepend>
        <q-icon name="search" size="24px" color="grey-6" />
      </template>
      <template #append v-if="localQuery">
        <q-icon name="close" class="cursor-pointer" @click="clear" />
      </template>
    </q-input>

    <!-- Sugerencias en tiempo real -->
    <div v-if="showSuggestions && suggestions.length > 0" class="search-suggestions">
      <q-card flat bordered class="suggestions-card">
        <q-list dense>
          <q-item
            v-for="article in suggestions"
            :key="article.id"
            clickable
            v-ripple
            @click="selectSuggestion(article)"
            class="suggestion-item"
          >
            <q-item-section avatar>
              <q-icon :name="getCategoryIcon(article.categoryId)" size="20px" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-body2">{{ article.title }}</q-item-label>
              <q-item-label caption class="text-caption text-grey-6">{{ getCategoryName(article.categoryId) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="arrow_forward" size="16px" color="grey-5" />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-if="localQuery.length >= 2" class="see-all-results q-pa-sm text-center">
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            :label="`Ver todos los resultados para &quot;${localQuery}&quot;`"
            @click="onEnter"
            size="sm"
          />
        </div>
      </q-card>
    </div>

    <!-- Sin resultados -->
    <div v-if="showSuggestions && localQuery.length >= 2 && suggestions.length === 0" class="search-no-results">
      <q-card flat bordered class="suggestions-card">
        <div class="q-pa-md text-center">
          <q-icon name="search_off" size="32px" color="grey-4" class="q-mb-sm" />
          <div class="text-body2 text-grey-6">No encontramos artículos para "{{ localQuery }}"</div>
          <div class="text-caption text-grey-5 q-mt-xs">Intentá con otras palabras o buscá por categoría</div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { searchArticles, helpCategories } from 'src/data/helpArticles'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Buscá artículos de ayuda...'
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'select'])

const localQuery = ref(props.modelValue)
const showSuggestions = ref(false)
let debounceTimer = null

const suggestions = computed(() => {
  if (!localQuery.value || localQuery.value.length < 2) return []
  return searchArticles(localQuery.value).slice(0, 6)
})

function getCategoryIcon (categoryId) {
  const cat = helpCategories.find(c => c.id === categoryId)
  return cat ? cat.icon : 'help_outline'
}

function getCategoryName (categoryId) {
  const cat = helpCategories.find(c => c.id === categoryId)
  return cat ? cat.title : ''
}

function onInput (val) {
  clearTimeout(debounceTimer)
  emit('update:modelValue', val || '')
  if (val && val.length >= 2) {
    debounceTimer = setTimeout(() => {
      showSuggestions.value = true
    }, 200)
  } else {
    showSuggestions.value = false
  }
}

function onEnter () {
  showSuggestions.value = false
  emit('search', localQuery.value)
}

function selectSuggestion (article) {
  showSuggestions.value = false
  localQuery.value = article.title
  emit('select', article)
}

function clear () {
  localQuery.value = ''
  showSuggestions.value = false
  emit('update:modelValue', '')
  emit('search', '')
}

function handleClickOutside (e) {
  if (!e.target.closest('.help-search-bar')) {
    showSuggestions.value = false
  }
}

watch(() => props.modelValue, (val) => {
  localQuery.value = val
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(debounceTimer)
})
</script>

<style scoped>
.help-search-bar {
  position: relative;
  width: 100%;
}

.help-search-input :deep(.q-field__control) {
  height: 52px;
  border-radius: 12px;
  font-size: 16px;
}

.help-search-input :deep(.q-field__native) {
  font-size: 16px;
}

.search-suggestions,
.search-no-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 9999;
}

.suggestions-card {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.suggestion-item {
  padding: 10px 16px;
  transition: background 0.15s;
}

.suggestion-item:hover {
  background: rgba(var(--q-primary-rgb, 84, 110, 122), 0.06);
}

.see-all-results {
  border-top: 1px solid rgba(0,0,0,0.06);
}
</style>
