<template>
  <q-btn
    :icon="icon"
    :label="label"
    :round="round"
    :color="color"
    :class="className"
    :size="size"
    @click.stop="filterDeliveryPersons()"
  >
    <q-tooltip class="text-body2">
      {{ tooltips }}
    </q-tooltip>
    <q-popup-proxy v-if="showingProxy">
      <q-card style="width: 300px; max-width: 80vw;" flat>
        <q-card-section class="q-pa-sm flex justify-between items-center">
          <div class="text-subtitle2 text-center">
            {{proxyTitle}}
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            size="sm"
            v-close-popup
          />
        </q-card-section>
        <q-card-section class="q-pa-sm">
          <q-input
            label="Buscar"
            autofocus
            dense
            outlined
            debounce="1000"
            v-model="filter"
          />
        </q-card-section>
        <q-card-section
          class="q-pa-sm scroll"
          style="min-height: 100px; max-height: 500px;"
        >
          <q-list v-if="!loadingEdit">
            <q-item
              clickable
              v-for="l in list"
              :key="l.id"
              @click="saveEdit(l)"
              :disable="data?.id === l.id"
            >
              <q-item-section thumbnail>
                <span
                  class="bg-accent q-pa-xs text-white text-center text-bold flex items-center justify-center"
                  style="border-radius: 50%; width: 34px; height: 34px;"
                >
                  {{ getInitials(l.name) }}
                </span>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ l.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-inner-loading :showing="loadingEdit">
            <q-spinner
              color="primary"
              size="50px"
            />
          </q-inner-loading>
        </q-card-section>
      </q-card>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { notify, getInitials } from 'src/const/mixins'
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  },
  className: {
    type: String,
    default: ''
  },
  proxyTitle: {
    type: String,
    default: ''
  },
  showingProxy: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'sm'
  },
  color: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  tooltips: {
    type: String,
    default: ''
  },
  services: {
    type: String,
    required: true
  },
  round: {
    type: Boolean,
    default: false
  },
  paramsSearch: {
    type: Object,
    default: () => {}
  }
})

const list = ref([])

const emit = defineEmits(['saveEdit'])

const filter = ref('')

const params = ref({})

const loadingEdit = ref(false)

watch(filter, async (data) => {
  for (const key in props.paramsSearch) {
    if (Object.prototype.hasOwnProperty.call(props.paramsSearch, key)) {
      params.value[key] = data
    }
  }
  filterDeliveryPersons(params.value)
})
/**
 * Get all sellers
 */
const filterDeliveryPersons = async (params = props.paramsSearch) => {
  try {
    loadingEdit.value = true
    const { data } = await api.get(props.services, {
      params: {
        dataSearch: params
      }
    })
    list.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingEdit.value = false
  }
}

const saveEdit = async (data) => {
  emit('saveEdit', data)
}
</script>
