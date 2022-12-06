<template>
  <div>
    <q-item
      clickable
      @click="setRoute(link)"
      v-if="link && visible && validateRole(link)"
      :active="link === $route.name"
      active-class="bg-grey-3"
    >
      <q-item-section
        v-if="icon"
        avatar
      >
        <q-icon :name="icon" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ title }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-expansion-item
      v-if="children && children.length > 0"
      :icon="icon"
      :label="title"
    >
      <div v-for="child in children" :key="child.id" class="q-px-md">
        <q-item
          clickable
          @click="setRoute(child.link)"
          v-if="child.link && child.visible && validateRole(child.link)"
          :active="child.link === $route.name"
          active-class="bg-grey-3"
        >
          <q-item-section
            v-if="icon"
            avatar
          >
            <q-icon :name="child.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ child.title }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-expansion-item>
  </div>
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
    visible: {
      type: Boolean,
      required: false
    },
    children: {
      type: Array,
      required: false
    },
    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String
    },

    icon: {
      type: String,
      default: ''
    }
  },
  setup () {
    return {
      validateRole (route) {
        console.log(route)
        if (localStorage.getItem('root') === 'true') {
          return true
        }
        const role = JSON.parse(localStorage.getItem('user')).role
        const modules = []
        role.modules.forEach(module => {
          modules.push(module)
        })
        return modules.find(module => module.link === route)
      },
      route: '/',
      setRoute (route) {
        this.$router.push({ name: route })
      }
    }
  }
})
</script>
