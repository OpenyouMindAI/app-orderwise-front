<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="q-gutter-xs">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>
          {{ title.title }}
        </q-toolbar-title>
        <span class="text-bold q-mr-sm bg-secondary q-pa-sm rounded-borders">
          {{ userSession.name }}
          ({{ userSession.role.name}})
        </span>
        <q-btn flat @click="$q.dark.toggle()" round dense icon="invert_colors" />
        <q-btn flat @click="logout" round dense icon="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Orderwise
        </q-item-label>

        <EssentialLink
          v-for="data in dataMenu"
          :key="data.title"
          v-bind="data"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Gestión de facturacion',
    icon: 'content_paste_go',
    visible: true,
    children: [
      {
        title: 'Facturar',
        visible: true,
        icon: 'receipt',
        link: 'Billing'
      },
      {
        title: 'Facturas',
        visible: true,
        icon: 'receipt_long',
        link: 'Invoice'
      },
      {
        title: 'Reporte de caja',
        visible: true,
        icon: 'list_alt',
        link: 'BoxReport'
      },
      {
        title: 'Productos',
        visible: true,
        icon: 'format_list_bulleted',
        link: 'Product'
      },
      {
        title: 'Ordenes de comandas',
        visible: true,
        icon: 'receipt',
        link: 'CommandOrder'
      }
    ]
  },
  {
    title: 'Comanda',
    icon: 'receipt',
    visible: true,
    children: [
      {
        title: 'Comanda',
        visible: true,
        icon: 'orderwise_bag',
        link: 'Command'
      }
    ]
  },
  {

    title: 'Gestión de personal',
    icon: 'groups_2',
    visible: true,
    children: [
      {
        title: 'Vendedores',
        visible: true,
        icon: 'face_6',
        link: 'Seller'
      },
      {
        title: 'Clientes',
        visible: true,
        icon: 'person_3',
        link: 'Client'
      }
    ]
  },
  {
    title: 'Configuración',
    icon: 'settings',
    visible: true,
    children: [
      {
        title: 'Roles',
        visible: true,
        icon: 'group',
        link: 'Role'
      },
      {
        title: 'Sala de estar',
        visible: true,
        icon: 'room_preferences',
        link: 'LivingRoom'
      },
      {
        title: 'Categorias',
        visible: true,
        icon: 'category',
        link: 'Category'
      },
      {
        title: 'Metodos de pago',
        visible: true,
        icon: 'payments',
        link: 'PaymentMethod'
      },
      {
        title: 'Impuestos',
        visible: true,
        icon: 'generating_tokens',
        link: 'Taxe'
      },
      {
        title: 'Tipos de factura',
        visible: true,
        icon: 'book',
        link: 'InvoiceType'
      },
      {
        title: 'Tipos de servicios',
        visible: true,
        icon: 'room_service',
        link: 'TypeOfService'
      },
      {
        title: 'Moneda',
        visible: true,
        icon: 'attach_money',
        link: 'Coin'
      },
      {
        title: 'Usuarios',
        visible: true,
        icon: 'person',
        link: 'User'
      }
    ]
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },
  created () {
    // this.$q.dark.set(true)
    this.$api.defaults.headers.common.authorization = `${localStorage.getItem('tokenType')} ${localStorage.getItem('accessToken')}`
  },
  computed: {
    title () {
      let titleNotCHildren = linksList.find((link) => {
        return link.route === this.$route.name
      })
      if (!titleNotCHildren) {
        linksList.forEach(child => {
          if (child.children) {
            const titleNotCHildrenEach = child.children.find(ch => {
              return ch.link === this.$route.name
            })
            if (titleNotCHildrenEach) {
              titleNotCHildren = titleNotCHildrenEach
            }
          }
        })
      }
      return titleNotCHildren
    },
    dataMenu () {
      return linksList.filter(link => {
        if (link.children) {
          return link.children.filter(child => {
            return this.validateRole(child.link)
          }).length > 0
        }
        return this.validateRole(link.link)
      })
    }
  },
  setup () {
    const leftDrawerOpen = ref(false)

    const userSession = JSON.parse(localStorage.getItem('user'))
    // const route = useRoute()
    const router = useRouter()
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      userSession,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      /**
       * Validate role
       * @param {String} route route
       */
      validateRole (route) {
        const role = JSON.parse(localStorage.getItem('user')).role
        const modules = []
        role.modules.forEach(module => {
          modules.push(module)
        })
        return modules.find(module => module.link === route)
      },
      /**
       * Logout
       */
      logout () {
        localStorage.clear()
        router.push({ name: 'Login' })
      }
    }
  }
})
</script>
