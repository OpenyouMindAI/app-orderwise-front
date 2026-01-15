<template>
  <q-card style="width: 800px; max-width: 95vw; max-height: 85vh">
    <q-card-section class="q-pb-none">
      <div class="row items-center justify-between">
        <div class="text-h6">Seleccionar Icono</div>
        <div v-if="selectedIcon" class="preview-container">
          <q-icon :name="selectedIcon" size="32px" color="primary" />
          <div class="text-caption text-grey-7 q-mt-xs">{{ getIconDisplayName(selectedIcon) }}</div>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-sm">
      <!-- Search -->
      <q-input v-model="search" label="Buscar iconos" outlined dense clearable debounce="300">
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #append>
          <q-badge v-if="filteredIcons.length > 0" color="primary" :label="filteredIcons.length" />
        </template>
      </q-input>
    </q-card-section>

    <!-- Icon Library Tabs -->
    <q-tabs
      v-model="selectedLibrary"
      dense
      class="text-grey-7"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="material" label="Material" icon="o_widgets" />
      <q-tab name="fontawesome" label="Font Awesome" icon="fab fa-font-awesome" />
      <q-tab name="ionicons" label="Ionicons" icon="ion-logo-ionic" />
      <q-tab name="mdi" label="MDI" icon="mdi-material-design" />
      <q-tab name="bootstrap" label="Bootstrap" icon="bi-bootstrap" />
    </q-tabs>

    <q-separator />

    <!-- Category Chips -->
    <q-card-section class="q-pt-sm q-pb-none">
      <div class="scroll-x">
        <q-chip
          v-for="category in currentCategories"
          :key="category"
          :selected="selectedCategory === category"
          clickable
          :color="selectedCategory === category ? 'primary' : 'grey-3'"
          :text-color="selectedCategory === category ? 'white' : 'grey-8'"
          size="sm"
          class="q-ma-xs"
          @click="selectedCategory = category"
        >
          {{ category }}
        </q-chip>
      </div>
    </q-card-section>

    <!-- Icons Grid -->
    <q-card-section class="icons-container q-pa-none">
      <div v-if="filteredIcons.length === 0" class="text-center q-pa-xl text-grey-6">
        <q-icon name="search_off" size="48px" />
        <div class="q-mt-md">No se encontraron iconos</div>
        <div class="text-caption">Intenta con otra búsqueda o categoría</div>
      </div>
      <div v-else class="icons-grid q-pa-md">
        <div
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon-item"
          :class="{ selected: selectedIcon === icon }"
          @click="selectIcon(icon)"
        >
          <q-icon :name="icon" size="28px" />
          <div class="icon-name">{{ getIconDisplayName(icon) }}</div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" color="grey-7" @click="$emit('cancel')" />
      <q-btn label="Seleccionar" color="primary" :disable="!selectedIcon" @click="$emit('select', selectedIcon)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  selectedIcon: {
    type: String,
    default: ''
  }
})

// State
const search = ref('')
const selectedLibrary = ref('material')
const selectedCategory = ref('Todos')
const selectedIcon = ref(props.selectedIcon)

// Detect library from selected icon
if (props.selectedIcon) {
  if (props.selectedIcon.startsWith('fa')) selectedLibrary.value = 'fontawesome'
  else if (props.selectedIcon.startsWith('ion-')) selectedLibrary.value = 'ionicons'
  else if (props.selectedIcon.startsWith('mdi-')) selectedLibrary.value = 'mdi'
  else if (props.selectedIcon.startsWith('bi-')) selectedLibrary.value = 'bootstrap'
  else selectedLibrary.value = 'material'
}

// Reset category when library changes
watch(selectedLibrary, () => {
  selectedCategory.value = 'Todos'
})

// Icon libraries configuration
const iconLibraries = {
  material: {
    categories: ['Todos', 'Acciones', 'Navegación', 'Contenido', 'Comunicación', 'Archivos', 'Social', 'Alertas', 'Multimedia', 'Mapas', 'Dispositivos', 'Negocios', 'Editor'],
    icons: {
      Acciones: ['add', 'edit', 'delete', 'remove', 'check', 'close', 'done', 'clear', 'search', 'settings', 'favorite', 'bookmark', 'star', 'refresh', 'sync', 'save', 'print', 'share', 'visibility', 'visibility_off', 'lock', 'lock_open', 'undo', 'redo', 'zoom_in', 'zoom_out', 'build', 'tune', 'code', 'bug_report'],
      Navegación: ['menu', 'arrow_back', 'arrow_forward', 'arrow_upward', 'arrow_downward', 'chevron_left', 'chevron_right', 'expand_more', 'expand_less', 'home', 'apps', 'more_vert', 'more_horiz', 'fullscreen', 'fullscreen_exit', 'first_page', 'last_page', 'unfold_more', 'unfold_less', 'subdirectory_arrow_right', 'subdirectory_arrow_left'],
      Contenido: ['add_box', 'add_circle', 'remove_circle', 'create', 'filter_list', 'flag', 'link', 'report', 'send', 'sort', 'archive', 'backspace', 'ballot', 'block', 'content_copy', 'content_cut', 'content_paste', 'drafts', 'inbox', 'mail', 'markunread', 'next_week', 'redo', 'reply', 'reply_all', 'save_alt', 'select_all', 'text_format', 'unarchive', 'undo', 'weekend'],
      Comunicación: ['email', 'chat', 'message', 'phone', 'call', 'contacts', 'contact_mail', 'comment', 'forum', 'import_export', 'contact_phone', 'contact_support', 'vpn_key', 'alternate_email', 'business', 'call_end', 'call_made', 'call_received', 'chat_bubble', 'chat_bubble_outline', 'clear_all', 'dialpad', 'duo', 'mail_outline', 'mobile_screen_share', 'no_sim', 'phone_enabled', 'phone_disabled', 'portable_wifi_off', 'present_to_all', 'ring_volume', 'rss_feed', 'screen_share', 'speaker_phone', 'stay_current_landscape', 'stay_current_portrait', 'swap_calls', 'textsms', 'voicemail', 'vpn_lock'],
      Archivos: ['folder', 'folder_open', 'cloud', 'cloud_download', 'cloud_upload', 'attachment', 'file_copy', 'create_new_folder', 'download', 'upload', 'description', 'insert_drive_file', 'backup', 'delete_forever', 'cloud_circle', 'cloud_done', 'cloud_off', 'cloud_queue', 'folder_shared', 'snippet_folder'],
      Social: ['group', 'group_add', 'people', 'person', 'person_add', 'person_outline', 'plus_one', 'public', 'school', 'sentiment_satisfied', 'sentiment_dissatisfied', 'share', 'thumb_up', 'thumb_down', 'whatshot', 'cake', 'domain', 'emoji_emotions', 'emoji_events', 'emoji_flags', 'emoji_food_beverage', 'emoji_nature', 'emoji_objects', 'emoji_people', 'emoji_symbols', 'emoji_transportation', 'engineering', 'face', 'groups', 'history_edu', 'military_tech', 'mood', 'mood_bad', 'nights_stay', 'notifications', 'notifications_active', 'notifications_none', 'notifications_off', 'notifications_paused', 'outdoor_grill', 'pages', 'party_mode', 'people_alt', 'people_outline', 'person_add_alt', 'person_remove', 'poll', 'psychology', 'recommend', 'reduce_capacity', 'sanitizer', 'science', 'self_improvement', 'sentiment_very_dissatisfied', 'sentiment_very_satisfied', 'share_location', 'sick', 'single_bed', 'sports', 'sports_baseball', 'sports_basketball', 'sports_esports', 'sports_football', 'sports_golf', 'sports_handball', 'sports_hockey', 'sports_kabaddi', 'sports_mma', 'sports_motorsports', 'sports_rugby', 'sports_soccer', 'sports_tennis', 'sports_volleyball', 'switch_account', 'thumb_down_alt', 'thumb_up_alt', 'thumbs_up_down'],
      Alertas: ['add_alert', 'error', 'error_outline', 'notification_important', 'warning', 'info', 'info_outline', 'help', 'help_outline', 'announcement', 'feedback', 'report_problem', 'new_releases', 'priority_high'],
      Multimedia: ['play_arrow', 'pause', 'stop', 'skip_next', 'skip_previous', 'fast_forward', 'fast_rewind', 'volume_up', 'volume_down', 'volume_mute', 'playlist_play', 'mic', 'mic_off', 'movie', 'videocam', 'videocam_off', 'music_note', 'album', 'art_track', 'audiotrack', 'av_timer', 'branding_watermark', 'call_to_action', 'closed_caption', 'equalizer', 'explicit', 'featured_play_list', 'featured_video', 'fiber_dvr', 'fiber_manual_record', 'fiber_new', 'fiber_pin', 'fiber_smart_record', 'forward_10', 'forward_30', 'forward_5', 'games', 'hd', 'hearing', 'high_quality', 'library_add', 'library_books', 'library_music', 'loop', 'mic_none', 'movie_creation', 'music_video', 'new_releases', 'not_interested', 'note', 'pause_circle_filled', 'pause_circle_outline', 'play_circle_filled', 'play_circle_outline', 'playlist_add', 'playlist_add_check', 'queue', 'queue_music', 'queue_play_next', 'radio', 'recent_actors', 'remove_from_queue', 'repeat', 'repeat_one', 'replay', 'replay_10', 'replay_30', 'replay_5', 'shuffle', 'snooze', 'sort_by_alpha', 'speed', 'stop_circle', 'subscriptions', 'subtitles', 'surround_sound', 'video_call', 'video_label', 'video_library', 'videocam', 'volume_off', 'web', 'web_asset'],
      Mapas: ['map', 'my_location', 'location_on', 'location_off', 'directions', 'navigation', 'place', 'restaurant', 'store', 'hotel', 'local_airport', 'local_atm', 'local_bar', 'local_cafe', 'local_hospital', 'add_location', 'beenhere', 'category', 'compass_calibration', 'departure_board', 'directions_bike', 'directions_boat', 'directions_bus', 'directions_car', 'directions_railway', 'directions_run', 'directions_subway', 'directions_transit', 'directions_walk', 'edit_location', 'ev_station', 'fastfood', 'flight', 'layers', 'layers_clear', 'local_activity', 'local_car_wash', 'local_convenience_store', 'local_dining', 'local_drink', 'local_florist', 'local_gas_station', 'local_grocery_store', 'local_laundry_service', 'local_library', 'local_mall', 'local_movies', 'local_offer', 'local_parking', 'local_pharmacy', 'local_pizza', 'local_play', 'local_post_office', 'local_printshop', 'local_see', 'local_shipping', 'local_taxi', 'location_city', 'location_disabled', 'location_searching', 'money', 'near_me', 'not_listed_location', 'person_pin', 'person_pin_circle', 'pin_drop', 'rate_review', 'restaurant_menu', 'satellite', 'store_mall_directory', 'streetview', 'subway', 'terrain', 'traffic', 'train', 'tram', 'transfer_within_a_station', 'transit_enterexit', 'trip_origin', 'zoom_out_map'],
      Dispositivos: ['devices', 'smartphone', 'tablet', 'laptop', 'desktop_windows', 'tv', 'watch', 'keyboard', 'mouse', 'speaker', 'security', 'wifi', 'bluetooth', 'data_usage', 'storage', 'battery_full', 'battery_alert', 'battery_charging_full', 'battery_std', 'battery_unknown', 'bluetooth_audio', 'bluetooth_connected', 'bluetooth_disabled', 'bluetooth_searching', 'brightness_auto', 'brightness_high', 'brightness_low', 'brightness_medium', 'computer', 'developer_mode', 'device_hub', 'devices_other', 'dock', 'gamepad', 'gps_fixed', 'gps_not_fixed', 'gps_off', 'graphic_eq', 'headset', 'headset_mic', 'keyboard_hide', 'keyboard_voice', 'laptop_chromebook', 'laptop_mac', 'laptop_windows', 'memory', 'monitor', 'mouse', 'network_cell', 'network_wifi', 'nfc', 'phonelink', 'phonelink_off', 'power', 'router', 'scanner', 'screen_lock_landscape', 'screen_lock_portrait', 'screen_lock_rotation', 'screen_rotation', 'sd_storage', 'settings_system_daydream', 'signal_cellular_4_bar', 'signal_cellular_connected_no_internet_4_bar', 'signal_cellular_no_sim', 'signal_cellular_null', 'signal_cellular_off', 'signal_wifi_4_bar', 'signal_wifi_4_bar_lock', 'signal_wifi_off', 'storage', 'usb', 'wallpaper', 'widgets', 'wifi_lock', 'wifi_tethering'],
      Negocios: ['business', 'business_center', 'work', 'work_outline', 'card_giftcard', 'card_membership', 'card_travel', 'store', 'storefront', 'local_offer', 'local_atm', 'monetization_on', 'money', 'money_off', 'payment', 'receipt', 'shopping_basket', 'shopping_cart', 'account_balance', 'account_balance_wallet', 'attach_money', 'euro_symbol', 'trending_up', 'trending_down', 'trending_flat', 'show_chart', 'pie_chart', 'bar_chart', 'assessment', 'timeline', 'insert_chart', 'multiline_chart'],
      Editor: ['format_align_center', 'format_align_justify', 'format_align_left', 'format_align_right', 'format_bold', 'format_clear', 'format_color_fill', 'format_color_reset', 'format_color_text', 'format_indent_decrease', 'format_indent_increase', 'format_italic', 'format_line_spacing', 'format_list_bulleted', 'format_list_numbered', 'format_paint', 'format_quote', 'format_shapes', 'format_size', 'format_strikethrough', 'format_textdirection_l_to_r', 'format_textdirection_r_to_l', 'format_underlined', 'functions', 'highlight', 'insert_comment', 'insert_emoticon', 'insert_link', 'insert_photo', 'mode_comment', 'publish', 'space_bar', 'strikethrough_s', 'text_fields', 'title', 'vertical_align_bottom', 'vertical_align_center', 'vertical_align_top', 'wrap_text']
    }
  },
  fontawesome: {
    categories: ['Todos', 'Sólido', 'Regular', 'Marcas', 'Común'],
    icons: {
      Sólido: ['fas fa-home', 'fas fa-user', 'fas fa-heart', 'fas fa-star', 'fas fa-cog', 'fas fa-search', 'fas fa-envelope', 'fas fa-phone', 'fas fa-shopping-cart', 'fas fa-camera', 'fas fa-file', 'fas fa-folder', 'fas fa-trash', 'fas fa-edit', 'fas fa-save', 'fas fa-download', 'fas fa-upload', 'fas fa-check', 'fas fa-times', 'fas fa-plus', 'fas fa-minus', 'fas fa-bars', 'fas fa-arrow-left', 'fas fa-arrow-right', 'fas fa-arrow-up', 'fas fa-arrow-down', 'fas fa-calendar', 'fas fa-clock', 'fas fa-map-marker-alt', 'fas fa-bell', 'fas fa-comment', 'fas fa-share', 'fas fa-lock', 'fas fa-unlock', 'fas fa-key', 'fas fa-users', 'fas fa-chart-bar', 'fas fa-chart-line', 'fas fa-chart-pie', 'fas fa-database', 'fas fa-server', 'fas fa-cloud', 'fas fa-wifi', 'fas fa-print', 'fas fa-copy', 'fas fa-paste', 'fas fa-cut', 'fas fa-bold', 'fas fa-italic', 'fas fa-underline', 'fas fa-link', 'fas fa-image', 'fas fa-video', 'fas fa-music', 'fas fa-play', 'fas fa-pause', 'fas fa-stop', 'fas fa-volume-up', 'fas fa-volume-down', 'fas fa-volume-mute'],
      Regular: ['far fa-heart', 'far fa-star', 'far fa-user', 'far fa-envelope', 'far fa-file', 'far fa-folder', 'far fa-calendar', 'far fa-clock', 'far fa-comment', 'far fa-bell', 'far fa-bookmark', 'far fa-image', 'far fa-copy', 'far fa-save', 'far fa-edit', 'far fa-trash-alt', 'far fa-check-circle', 'far fa-times-circle', 'far fa-plus-square', 'far fa-minus-square'],
      Marcas: ['fab fa-facebook', 'fab fa-twitter', 'fab fa-instagram', 'fab fa-linkedin', 'fab fa-youtube', 'fab fa-github', 'fab fa-google', 'fab fa-apple', 'fab fa-microsoft', 'fab fa-amazon', 'fab fa-whatsapp', 'fab fa-telegram', 'fab fa-discord', 'fab fa-slack', 'fab fa-spotify', 'fab fa-tiktok', 'fab fa-pinterest', 'fab fa-reddit', 'fab fa-snapchat', 'fab fa-twitch'],
      Común: ['fa fa-home', 'fa fa-user', 'fa fa-search', 'fa fa-envelope', 'fa fa-star', 'fa fa-heart', 'fa fa-cog', 'fa fa-trash', 'fa fa-edit', 'fa fa-save', 'fa fa-download', 'fa fa-upload', 'fa fa-check', 'fa fa-times', 'fa fa-plus', 'fa fa-minus', 'fa fa-bars', 'fa fa-calendar', 'fa fa-clock-o', 'fa fa-bell']
    }
  },
  ionicons: {
    categories: ['Todos', 'Común', 'Logos', 'Outlined', 'Sharp'],
    icons: {
      Común: ['ion-home', 'ion-person', 'ion-heart', 'ion-star', 'ion-settings', 'ion-search', 'ion-mail', 'ion-call', 'ion-cart', 'ion-camera', 'ion-document', 'ion-folder', 'ion-trash', 'ion-create', 'ion-save', 'ion-download', 'ion-cloud-upload', 'ion-checkmark', 'ion-close', 'ion-add', 'ion-remove', 'ion-menu', 'ion-arrow-back', 'ion-arrow-forward', 'ion-arrow-up', 'ion-arrow-down', 'ion-calendar', 'ion-time', 'ion-location', 'ion-notifications', 'ion-chatbubble', 'ion-share', 'ion-lock-closed', 'ion-lock-open', 'ion-key', 'ion-people', 'ion-bar-chart', 'ion-pie-chart', 'ion-server', 'ion-cloud', 'ion-wifi', 'ion-print', 'ion-copy', 'ion-cut', 'ion-image', 'ion-videocam', 'ion-musical-notes', 'ion-play', 'ion-pause', 'ion-stop', 'ion-volume-high', 'ion-volume-low', 'ion-volume-mute'],
      Logos: ['ion-logo-facebook', 'ion-logo-twitter', 'ion-logo-instagram', 'ion-logo-linkedin', 'ion-logo-youtube', 'ion-logo-github', 'ion-logo-google', 'ion-logo-apple', 'ion-logo-windows', 'ion-logo-android', 'ion-logo-whatsapp', 'ion-logo-discord', 'ion-logo-slack', 'ion-logo-chrome', 'ion-logo-firefox', 'ion-logo-edge', 'ion-logo-safari', 'ion-logo-ionic', 'ion-logo-react', 'ion-logo-vue', 'ion-logo-angular', 'ion-logo-nodejs', 'ion-logo-python', 'ion-logo-javascript'],
      Outlined: ['ion-home-outline', 'ion-person-outline', 'ion-heart-outline', 'ion-star-outline', 'ion-settings-outline', 'ion-search-outline', 'ion-mail-outline', 'ion-call-outline', 'ion-cart-outline', 'ion-camera-outline', 'ion-document-outline', 'ion-folder-outline', 'ion-trash-outline', 'ion-create-outline', 'ion-save-outline', 'ion-download-outline', 'ion-cloud-upload-outline', 'ion-checkmark-outline', 'ion-close-outline', 'ion-add-outline', 'ion-remove-outline'],
      Sharp: ['ion-home-sharp', 'ion-person-sharp', 'ion-heart-sharp', 'ion-star-sharp', 'ion-settings-sharp', 'ion-search-sharp', 'ion-mail-sharp', 'ion-call-sharp', 'ion-cart-sharp', 'ion-camera-sharp', 'ion-document-sharp', 'ion-folder-sharp', 'ion-trash-sharp', 'ion-create-sharp', 'ion-save-sharp', 'ion-download-sharp', 'ion-cloud-upload-sharp', 'ion-checkmark-sharp', 'ion-close-sharp', 'ion-add-sharp', 'ion-remove-sharp']
    }
  },
  mdi: {
    categories: ['Todos', 'Común', 'Acciones', 'Navegación', 'Archivos', 'Dispositivos'],
    icons: {
      Común: ['mdi-home', 'mdi-account', 'mdi-heart', 'mdi-star', 'mdi-cog', 'mdi-magnify', 'mdi-email', 'mdi-phone', 'mdi-cart', 'mdi-camera', 'mdi-file', 'mdi-folder', 'mdi-delete', 'mdi-pencil', 'mdi-content-save', 'mdi-download', 'mdi-upload', 'mdi-check', 'mdi-close', 'mdi-plus', 'mdi-minus', 'mdi-menu', 'mdi-calendar', 'mdi-clock', 'mdi-map-marker', 'mdi-bell', 'mdi-message', 'mdi-share', 'mdi-lock', 'mdi-lock-open', 'mdi-key'],
      Acciones: ['mdi-refresh', 'mdi-sync', 'mdi-undo', 'mdi-redo', 'mdi-content-copy', 'mdi-content-cut', 'mdi-content-paste', 'mdi-printer', 'mdi-eye', 'mdi-eye-off', 'mdi-bookmark', 'mdi-bookmark-outline', 'mdi-flag', 'mdi-flag-outline'],
      Navegación: ['mdi-arrow-left', 'mdi-arrow-right', 'mdi-arrow-up', 'mdi-arrow-down', 'mdi-chevron-left', 'mdi-chevron-right', 'mdi-chevron-up', 'mdi-chevron-down', 'mdi-menu-left', 'mdi-menu-right', 'mdi-menu-up', 'mdi-menu-down'],
      Archivos: ['mdi-file-document', 'mdi-file-pdf', 'mdi-file-excel', 'mdi-file-word', 'mdi-file-powerpoint', 'mdi-file-image', 'mdi-file-video', 'mdi-file-music', 'mdi-folder-open', 'mdi-cloud', 'mdi-cloud-download', 'mdi-cloud-upload'],
      Dispositivos: ['mdi-cellphone', 'mdi-tablet', 'mdi-laptop', 'mdi-desktop-mac', 'mdi-monitor', 'mdi-television', 'mdi-watch', 'mdi-keyboard', 'mdi-mouse', 'mdi-headphones', 'mdi-wifi', 'mdi-bluetooth', 'mdi-battery']
    }
  },
  bootstrap: {
    categories: ['Todos', 'Común', 'UI', 'Comunicación', 'Archivos', 'Comercio'],
    icons: {
      Común: ['bi-house', 'bi-person', 'bi-heart', 'bi-star', 'bi-gear', 'bi-search', 'bi-envelope', 'bi-telephone', 'bi-cart', 'bi-camera', 'bi-file-earmark', 'bi-folder', 'bi-trash', 'bi-pencil', 'bi-save', 'bi-download', 'bi-upload', 'bi-check', 'bi-x', 'bi-plus', 'bi-dash', 'bi-list', 'bi-calendar', 'bi-clock', 'bi-geo-alt', 'bi-bell', 'bi-chat', 'bi-share', 'bi-lock', 'bi-unlock', 'bi-key'],
      UI: ['bi-arrow-left', 'bi-arrow-right', 'bi-arrow-up', 'bi-arrow-down', 'bi-chevron-left', 'bi-chevron-right', 'bi-chevron-up', 'bi-chevron-down', 'bi-eye', 'bi-eye-slash', 'bi-bookmark', 'bi-flag', 'bi-grid', 'bi-layout-sidebar', 'bi-layout-split', 'bi-layout-three-columns', 'bi-columns', 'bi-justify'],
      Comunicación: ['bi-chat-dots', 'bi-chat-left', 'bi-chat-right', 'bi-chat-square', 'bi-chat-text', 'bi-envelope-open', 'bi-mailbox', 'bi-inbox', 'bi-send', 'bi-reply', 'bi-reply-all', 'bi-forward'],
      Archivos: ['bi-file-text', 'bi-file-pdf', 'bi-file-excel', 'bi-file-word', 'bi-file-ppt', 'bi-file-image', 'bi-file-music', 'bi-file-play', 'bi-folder2', 'bi-folder2-open', 'bi-cloud', 'bi-cloud-download', 'bi-cloud-upload'],
      Comercio: ['bi-bag', 'bi-basket', 'bi-cart2', 'bi-cart3', 'bi-credit-card', 'bi-currency-dollar', 'bi-currency-euro', 'bi-currency-pound', 'bi-currency-yen', 'bi-receipt', 'bi-shop', 'bi-wallet', 'bi-wallet2']
    }
  }
}

// Computed properties
const currentCategories = computed(() => {
  return iconLibraries[selectedLibrary.value]?.categories || ['Todos']
})

const currentIcons = computed(() => {
  const library = iconLibraries[selectedLibrary.value]
  if (!library) return []

  if (selectedCategory.value === 'Todos') {
    return Object.values(library.icons).flat()
  }

  return library.icons[selectedCategory.value] || []
})

const filteredIcons = computed(() => {
  let icons = currentIcons.value

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

const getIconDisplayName = (icon) => {
  // Remove prefixes for cleaner display
  return icon
    .replace(/^(fas|far|fab|fa|ion-|mdi-|bi-)\s*/, '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
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

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 10px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 10px;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #fafafa;
}

.icon-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #bdbdbd;
}

.icon-item.selected {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #1976d2;
  color: #1976d2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.icon-name {
  margin-top: 8px;
  font-size: 10px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  font-weight: 500;
  text-transform: capitalize;
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
