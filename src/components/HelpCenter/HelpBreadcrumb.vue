<template>
  <q-breadcrumbs
    class="help-breadcrumb q-mb-lg"
    active-color="primary"
    separator-color="grey-5"
  >
    <q-breadcrumbs-el
      label="Ayuda"
      icon="help_outline"
      class="cursor-pointer help-breadcrumb__item"
      @click="$router.push({ name: 'HelpCenter' })"
    />
    <q-breadcrumbs-el
      v-if="category"
      :label="category.title"
      class="cursor-pointer help-breadcrumb__item"
      @click="$router.push({ name: 'HelpCategory', params: { category: category.id } })"
    />
    <q-breadcrumbs-el
      v-if="article"
      :label="article.title"
      class="help-breadcrumb__item--current"
    />
  </q-breadcrumbs>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  category: {
    type: Object,
    default: null
  },
  article: {
    type: Object,
    default: null
  }
})

const router = useRouter()
</script>

<style scoped>
.help-breadcrumb {
  font-size: 14px;
}

.help-breadcrumb__item {
  color: var(--q-primary);
  font-weight: 500;
  transition: opacity 0.15s;
}

.help-breadcrumb__item:hover {
  opacity: 0.75;
  text-decoration: underline;
}

.help-breadcrumb__item--current {
  color: #5a5a5a;
  font-weight: 600;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
