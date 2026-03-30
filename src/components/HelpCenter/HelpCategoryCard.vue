<template>
  <q-card
    class="help-category-card cursor-pointer"
    flat
    bordered
    @click="$emit('click', category)"
  >
    <q-card-section class="help-category-card__content text-center q-pa-lg">
      <div class="help-category-card__icon-wrapper q-mx-auto q-mb-md" :class="`bg-${category.color}-1`">
        <q-icon
          :name="category.icon"
          :color="category.color"
          size="36px"
        />
      </div>
      <div class="help-category-card__title text-weight-bold text-body1">
        {{ category.title }}
      </div>
      <div class="help-category-card__desc text-caption text-grey-6 q-mt-xs q-mb-sm">
        {{ category.description }}
      </div>
      <q-badge
        :color="category.color"
        text-color="white"
        :label="`${category.articleCount} artículos`"
        class="help-category-card__badge"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  category: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.help-category-card {
  border-radius: 16px !important;
  transition: all 0.2s ease;
  border: 1px solid rgba(0,0,0,0.08) !important;
  height: 100%;
}

.help-category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
  border-color: transparent !important;
}

.help-category-card__icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-category-card__title {
  font-size: 15px;
  line-height: 1.3;
}

.help-category-card__badge {
  font-size: 11px;
  border-radius: 20px;
  padding: 3px 10px;
}
</style>
