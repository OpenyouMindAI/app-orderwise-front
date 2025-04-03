<template>
  <q-card>
    <slot name="top" />
    <q-card-section class="q-pb-none q-px-md">
      <q-select
        filled
        v-model="livingRoom"
        label="Sala de estar"
        option-label="name"
        option-value="id"
        style="min-width: 300px;"
        dense
        :options="livingRooms"
      />
    </q-card-section>
    <q-card-section class="flex justify-center">
      <draggable-resizable-container
        class="container"
        :show-grid="true"
      >
        <draggable-resizable-vue
          v-for="table in tables"
          :key="table.id"
          v-model:x="table.x"
          v-model:y="table.y"
          v-model:h="table.height"
          v-model:w="table.width"
          class="element-one"
          :style="table.status ==='unoccupied' ? 'background-color: blue;': 'background-color: orange;'"
          :handles-size="10"
          :draggable="false"
          :resizable="false"
        >
          <span class="absolute-center">
            {{ table.name }} {{ statusTable[table.status] }}
          </span>
          <q-checkbox
            v-model="tableSelected"
            :val="table.id"
            color="teal"
            class="fixed-top-right"
            v-if="table.status === 'unoccupied'"
          />
          <q-btn
            icon="receipt"
            color="secondary"
            size="sm"
            round
            class="fixed-top-right"
            @click="emit('update:invoice', table)"
            v-else
          />
          <q-btn
            icon="close"
            color="negative"
            size="sm"
            round
            @click="emit('update:freeTable', table)"
            v-if="table.status === 'busy' && freeTable"
          />
        </draggable-resizable-vue>
      </draggable-resizable-container>
    </q-card-section>
    <slot name="footer" />
  </q-card>
</template>

<script  setup>
import { api } from 'src/boot/axios'
import { loading, notify } from 'src/const/mixins'
import { onMounted, ref, watch } from 'vue'
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'

const props = defineProps({
  tablesSelected: {
    type: Array,
    required: true
  },

  freeTable: {
    type: Boolean,
    default: false
  }
})

/**
 * Table list
 * @type {Array}
 */
const tables = ref([])
/**
 * Living room list
 * @type {Array}
 */
const livingRooms = ref([])
/**
 * Living room selected
 * @type {Object}
 */
const livingRoom = ref(null)
/**
 * Table status
 * @type {Array}
 */
const statusTable = {
  unoccupied: 'Libre',
  busy: 'Ocupada'
}
/**
 * Table selected
 * @type {Array}
 */
const tableSelected = ref(props.tablesSelected || [])

/**
 * Emit
 * @type {Array}
 */
const emit = defineEmits(['update:tableSelected', 'update:invoice', 'update:freeTable'])

watch(tableSelected, (data) => {
  emit('update:tableSelected', data)
})

watch(livingRoom, async (data) => {
  getTables(data)
})

onMounted(async () => {
  getLivingRooms()
})
/**
 * Get tables list
 * @params {Object} livingRoom living room
 */
const getTables = async (livingRoom) => {
  try {
    const { data } = await api.get('tables', {
      params: {
        dataEqualFilter: {
          living_room_id: livingRoom.id
        }
      }
    })
    tables.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}
/**
 * Get all livingRooms
 * @param {Object} params search params
 */
const getLivingRooms = async () => {
  try {
    loading(true)
    const { data } = await api.get('living-rooms')
    livingRooms.value = data
    livingRoom.value = data[0]
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading(false)
  }
}

/**
 * Expose data to parent
 * @type {Object}
 */
defineExpose({
  getTables,
  livingRoom
})

</script>
<style>
.container {
  height: 400px;
  width: 900px;
  border: 1px solid black;
}

.element-one {
  color: white;
}

</style>
