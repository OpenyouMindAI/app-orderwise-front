<template>
  <section>
    <div v-if="slides.length === 0">
      <q-img src="https://cdn.quasar.dev/img/image-src.png" :style="!$q.screen.gt.xs ? 'height: calc(100vh - 170px);' : 'height: 100vh' "/>
    </div>
    <div v-for="(slide, index) in slides" :key="index" v-show="currentIndex === index">
      <q-img :src="slide.url" :alt="slide.caption" :style="!$q.screen.gt.xs ? 'height: calc(100vh - 170px);' : 'height: 100vh'" fit="fill">
        <div class="absolute-bottom all-pointer-events" v-if="slides.length > 1">
          <div class="flex justify-center">
            <q-btn color="primary" @click="prevSlide">&lt;</q-btn>
            <q-btn class="q-ml-sm" color="primary" @click="nextSlide">&gt;</q-btn>
          </div>
        </div>
      </q-img>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SlideComponent',
  props: {
    slides: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      currentIndex: 0
    }
  },
  methods: {
    nextSlide () {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length
    },
    prevSlide () {
      this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length
    }
  }
}
</script>
