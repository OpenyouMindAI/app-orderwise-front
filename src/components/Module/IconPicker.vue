<template>
  <q-card style="width: 600px; max-width: 95vw; max-height: 80vh">
    <q-card-section>
      <div class="text-h6">Select Icon</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <!-- Search -->
      <q-input v-model="search" label="Search icons" outlined dense clearable debounce="300">
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <!-- Categories -->
      <div class="q-mt-md q-mb-sm scroll-x">
        <q-chip
          v-for="category in categories"
          :key="category"
          :selected="selectedCategory === category"
          clickable
          :color="selectedCategory === category ? 'primary' : 'grey-3'"
          :text-color="selectedCategory === category ? 'white' : 'black'"
          class="q-ma-xs"
          @click="selectedCategory = category"
        >
          {{ category }}
        </q-chip>
      </div>
    </q-card-section>

    <!-- Icons Grid -->
    <q-card-section class="icons-container q-pa-none">
      <div class="icons-grid q-pa-md">
        <div
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon-item"
          :class="{ selected: selectedIcon === icon }"
          @click="selectIcon(icon)"
        >
          <q-icon :name="icon" size="24px" />
          <div class="icon-name">{{ icon }}</div>
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancel" color="grey-7" @click="$emit('cancel')" />
      <q-btn label="Select" color="primary" :disable="!selectedIcon" @click="$emit('select', selectedIcon)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selectedIcon: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select', 'cancel'])

// State
const search = ref('')
const selectedCategory = ref('All')
const selectedIcon = ref(props.selectedIcon)

// Categories and icons
const categories = [
  'All',
  'Actions',
  'Navigation',
  'Content',
  'Communication',
  'Files',
  'Social',
  'Alerts',
  'AV',
  'Maps',
  'Device',
  'Hardware',
]

// Common Material Icons by category
const iconsByCategory = {
  Actions: [
    'add',
    'edit',
    'delete',
    'remove',
    'check',
    'close',
    'done',
    'clear',
    'search',
    'settings',
    'favorite',
    'bookmark',
    'star',
    'refresh',
    'sync',
    'save',
    'print',
    'share',
    'visibility',
    'visibility_off',
    'lock',
    'lock_open',
  ],
  Navigation: [
    'menu',
    'arrow_back',
    'arrow_forward',
    'arrow_upward',
    'arrow_downward',
    'chevron_left',
    'chevron_right',
    'expand_more',
    'expand_less',
    'home',
    'apps',
    'more_vert',
    'more_horiz',
    'fullscreen',
    'fullscreen_exit',
  ],
  Content: [
    'add_box',
    'add_circle',
    'remove_circle',
    'create',
    'filter_list',
    'flag',
    'font_download',
    'link',
    'low_priority',
    'report',
    'send',
    'sort',
    'text_format',
    'archive',
    'backspace',
    'ballot',
    'block',
  ],
  Communication: [
    'email',
    'chat',
    'message',
    'users.phone_number',
    'call',
    'contacts',
    'contact_mail',
    'comment',
    'forum',
    'import_export',
    'contact_phone',
    'contact_support',
    'location_on',
    'vpn_key',
    'alternate_email',
  ],
  Files: [
    'folder',
    'folder_open',
    'cloud',
    'cloud_download',
    'cloud_upload',
    'attachment',
    'file_copy',
    'create_new_folder',
    'download',
    'upload',
    'description',
    'insert_drive_file',
    'backup',
    'delete_forever',
  ],
  Social: [
    'group',
    'group_add',
    'people',
    'person',
    'person_add',
    'person_outline',
    'plus_one',
    'public',
    'school',
    'sentiment_satisfied',
    'sentiment_dissatisfied',
    'share',
    'thumb_up',
    'thumb_down',
    'whatshot',
  ],
  Alerts: [
    'add_alert',
    'error',
    'error_outline',
    'notification_important',
    'warning',
    'info',
    'info_outline',
    'help',
    'help_outline',
    'announcement',
    'feedback',
  ],
  AV: [
    'play_arrow',
    'pause',
    'stop',
    'skip_next',
    'skip_previous',
    'fast_forward',
    'fast_rewind',
    'volume_up',
    'volume_down',
    'volume_mute',
    'playlist_play',
    'mic',
    'mic_off',
    'movie',
    'videocam',
    'videocam_off',
    'music_note',
  ],
  Maps: [
    'map',
    'my_location',
    'location_on',
    'location_off',
    'directions',
    'navigation',
    'place',
    'restaurant',
    'store',
    'hotel',
    'local_airport',
    'local_atm',
    'local_bar',
    'local_cafe',
    'local_hospital',
  ],
  Device: [
    'devices',
    'smartphone',
    'tablet',
    'laptop',
    'desktop_windows',
    'tv',
    'watch',
    'keyboard',
    'mouse',
    'speaker',
    'security',
    'wifi',
    'bluetooth',
    'data_usage',
    'storage',
    'battery_full',
    'battery_alert',
  ],
  Hardware: [
    'computer',
    'desktop_mac',
    'keyboard',
    'mouse',
    'speaker',
    'phone_android',
    'phone_iphone',
    'sim_card',
    'scanner',
    'print',
    'headset',
    'headset_mic',
    'camera',
    'camera_alt',
    'memory',
    'usb',
    'dock',
    'gamepad',
  ],
}

// Flatten all icons for "All" category
const allIcons = Object.values(iconsByCategory).flat()

// Computed properties
const filteredIcons = computed(() => {
  let icons = selectedCategory.value === 'All' ? allIcons : iconsByCategory[selectedCategory.value] || []

  if (search.value) {
    const searchLower = search.value.toLowerCase()
    icons = icons.filter((icon) => icon.toLowerCase().includes(searchLower))
  }

  return icons
})

// Methods
const selectIcon = (icon) => {
  selectedIcon.value = icon
}
</script>

<style scoped>
.scroll-x {
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 8px;
}

.icons-container {
  max-height: 400px;
  overflow-y: auto;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-item:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.icon-item.selected {
  background-color: #e3f2fd;
  border-color: #1976d2;
  color: #1976d2;
}

.icon-name {
  margin-top: 8px;
  font-size: 10px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (max-width: 600px) {
  .icons-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  .icon-item {
    padding: 8px 4px;
  }

  .icon-name {
    font-size: 9px;
  }
}
</style>
