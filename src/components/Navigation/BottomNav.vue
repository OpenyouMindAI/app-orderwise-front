<template>
  <div v-if="$q.screen.lt.md && !hideOnRoute" class="bottom-nav-container">
    <nav class="bottom-nav" :class="{ 'bottom-nav--hidden': isHidden }">
      <div
        v-for="tab in availableTabs"
        :key="tab.name"
        class="bottom-nav__item"
        :class="{ 'bottom-nav__item--active': isActive(tab.name) }"
        @click="navigateTo(tab.name)"
      >
        <q-badge
          v-if="tab.badge && tab.badge > 0"
          :label="tab.badge"
          color="red"
          floating
          rounded
        />
        <q-icon :name="tab.icon" size="24px" class="bottom-nav__icon" />
        <span class="bottom-nav__label">{{ tab.label }}</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import { storeToRefs } from 'pinia'

/**
 * Component props
 */
const props = defineProps({
  /**
   * Menu data from MainLayout for role validation
   * @type {Array}
   */
  dataMenu: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = authentication()
const { userSession } = storeToRefs(authStore)

/**
 * Bottom navigation visibility state
 * @type {boolean}
 */
const isHidden = ref(false)

/**
 * Check if the current route should hide the bottom nav
 * @type {import('vue').ComputedRef<boolean>}
 */
const hideOnRoute = computed(() => {
  return route.meta?.hideBottomNav === true
})

/**
 * Last scroll position for hide/show logic
 * @type {number}
 */
let lastScrollTop = 0

/**
 * Navigation tabs configuration with module mapping for roles
 * @type {Array}
 */
const allTabs = [
  {
    name: 'Home',
    label: 'Inicio',
    icon: 'home',
    moduleName: 'home', // Always allowed if logged in
    badge: 0
  },
  {
    name: 'Billing',
    label: 'Ventas',
    icon: 'point_of_sale',
    moduleName: 'billing',
    badge: 0
  },
  {
    name: 'Product',
    label: 'Inventario',
    icon: 'inventory_2',
    moduleName: 'product',
    badge: 0
  },
  {
    name: 'Dashboard',
    label: 'Reportes',
    icon: 'analytics',
    moduleName: 'dashboard',
    badge: 0
  },
  {
    name: 'More',
    label: 'Más',
    icon: 'more_horiz',
    moduleName: 'profile', // Profile/Settings usually allowed
    badge: 0
  }
]

/**
 * Validate role for a set of roles
 * consistent with MainLayout.vue logic
 * @param {Array} roles - Roles allowed for a module
 * @return {boolean} Is allowed
 */
const validateRole = (roles = []) => {
  // Get first role of current user
  const userRol = userSession.value?.roles?.[0]

  // Root always has access
  if (userSession.value?.is_root) return true

  // If no roles specified for module, assume it's public
  if (!roles || roles.length === 0) return true

  // Check if user role is in the allowed list
  if (userRol) {
    return roles.some((element) => element.id === userRol.id)
  }

  return false
}

/**
 * Filtered tabs based on user roles and menu availability
 * @type {import('vue').ComputedRef<Array>}
 */
const availableTabs = computed(() => {
  if (!props.dataMenu || props.dataMenu.length === 0) {
    // If dataMenu isn't loaded yet, show basic tabs user likely has access to
    // or just 'Home' and 'More'
    return allTabs.filter(tab => tab.name === 'Home' || tab.name === 'More')
  }

  return allTabs.filter(tab => {
    // Home and More are special
    if (tab.name === 'Home') return true
    if (tab.name === 'More') return true

    // Search for the corresponding module in dataMenu to get its roles
    let allowed = false
    props.dataMenu.forEach(category => {
      category.modules.forEach(module => {
        // Match by link (route name) or some unique identifier
        // Matching by link/name is most reliable if tab.name matches route name
        if (module.link === tab.name || module.name?.toLowerCase() === tab.moduleName) {
          if (validateRole(module.roles)) {
            allowed = true
          }
        }
      })
    })

    return allowed
  })
})

/**
 * Check if tab is active
 * @param {string} tabName - Tab name to check
 * @return {boolean} Is active
 */
const isActive = (tabName) => {
  // Handle special cases
  if (tabName === 'Home') {
    return route.name === 'Home' || route.name === 'Welcome'
  }
  if (tabName === 'More') {
    // More tab is active for settings, profile, etc.
    const moreTabs = ['Profile', 'CompanyConfig', 'User', 'Role', 'BranchOffice']
    return moreTabs.includes(route.name)
  }
  return route.name === tabName
}

/**
 * Navigate to tab
 * @param {string} tabName - Tab name
 */
const navigateTo = (tabName) => {
  // Add haptic feedback on mobile
  if ($q.platform.is.mobile && navigator.vibrate) {
    navigator.vibrate(10)
  }

  // Navigate based on tab
  if (tabName === 'More') {
    // Navigate to profile/settings
    router.push({ name: 'Profile' })
  } else {
    router.push({ name: tabName })
  }
}

/**
 * Handle scroll to auto-hide bottom nav
 */
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scrolling down - hide nav
    isHidden.value = true
  } else {
    // Scrolling up - show nav
    isHidden.value = false
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop
}

onMounted(() => {
  // Add scroll listener for auto-hide
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/**
 * Bottom navigation container
 */
.bottom-nav-container {
  height: 64px;
  /* Reserve space for nav */
}

/**
 * Bottom navigation bar
 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 8px;
  z-index: 1000;
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
  /* Safe area for iPhone notch */
  padding-bottom: max(0px, env(safe-area-inset-bottom));
}

body.body--dark .bottom-nav {
  background: #1e1e1e;
  border-top-color: rgba(255, 255, 255, 0.08);
}

/**
 * Hidden state
 */
.bottom-nav--hidden {
  transform: translateY(100%);
}

/**
 * Nav item
 */
.bottom-nav__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  min-width: 64px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/**
 * Icon
 */
.bottom-nav__icon {
  color: #757575;
  margin-bottom: 4px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

body.body--dark .bottom-nav__icon {
  color: #9e9e9e;
}

/**
 * Label
 */
.bottom-nav__label {
  font-size: 12px;
  font-weight: 500;
  color: #757575;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

body.body--dark .bottom-nav__label {
  color: #9e9e9e;
}

/**
 * Active state
 */
.bottom-nav__item--active .bottom-nav__icon {
  color: var(--q-primary);
  transform: scale(1.1);
}

.bottom-nav__item--active .bottom-nav__label {
  color: var(--q-primary);
  font-weight: 600;
}

/**
 * Touch feedback
 */
.bottom-nav__item:active {
  transform: scale(0.95);
  opacity: 0.7;
}

/**
 * Ripple effect area
 */
.bottom-nav__item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--q-primary);
  opacity: 0;
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-nav__item:active::before {
  opacity: 0.1;
}

/**
 * Responsive adjustments
 */
@media (max-width: 380px) {
  .bottom-nav {
    padding: 0 4px;
  }

  .bottom-nav__item {
    min-width: 56px;
  }

  .bottom-nav__label {
    font-size: 11px;
  }

  .bottom-nav__icon {
    font-size: 22px;
  }
}
</style>
