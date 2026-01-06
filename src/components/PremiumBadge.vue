<template>
  <q-badge
    v-if="showBadge"
    color="amber"
    floating
    :style="badgeStyle"
  >
    <img
      src="images/crown-premium.svg"
      :style="iconStyle"
      alt="Premium"
    />
    <q-tooltip class="text-body2 bg-primary text-white">
      {{ tooltipText }}
    </q-tooltip>
  </q-badge>
</template>

<script>
export default {
  name: 'PremiumBadge',
  props: {
    /**
     * Show badge condition
     */
    show: {
      type: Boolean,
      default: false
    },
    /**
     * Icon size in pixels
     */
    size: {
      type: Number,
      default: 15
    },
    /**
     * Top position
     */
    top: {
      type: String,
      default: '0px'
    },
    /**
     * Right position
     */
    right: {
      type: String,
      default: '4px'
    },
    /**
     * Badge padding
     */
    padding: {
      type: String,
      default: '4px'
    },
    /**
     * Tooltip text
     */
    tooltipText: {
      type: String,
      default: 'PREMIUM'
    }
  },
  computed: {
    showBadge () {
      return this.show
    },
    badgeStyle () {
      return `position: absolute; top: ${this.top}; right: ${this.right}; padding: ${this.padding};`
    },
    iconStyle () {
      return `width: ${this.size}px; height: ${this.size}px; display: block;`
    }
  }
}
</script>
