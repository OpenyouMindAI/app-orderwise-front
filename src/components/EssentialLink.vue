<template>
  <q-item
    clickable
    :active="link === $route.name"
    @click="changeRoute(link)"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '#'
    },

    icon: {
      type: String,
      default: ''
    }
  },
  setup () {
    return {
      route: '/',
      /**
       * Change route
       * @param  {String} data name route
       */
      changeRoute (data) {
        this.$router.push({ name: data })
        this.route = data
      }
    }
  }
})
</script>
