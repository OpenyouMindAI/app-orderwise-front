<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
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
          Shopping
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
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
    title: 'Gestión de inventario',
    icon: 'content_paste_go',
    visible: true,
    children: [

      {
        title: 'Facturar',
        icon: 'shopping_cart',
        link: 'Billing'
      },
      {
        title: 'Productos',
        icon: 'format_list_bulleted',
        link: 'Product'
      },
      {
        title: 'Facturas',
        icon: 'receipt_long',
        link: 'Invoice'
      },
      {
        title: 'Reporte de caja',
        icon: 'list_alt',
        link: 'BoxReport'
      },
      {
        title: 'Categorias',
        icon: 'category',
        link: 'Category'
      },
      {
        title: 'Metodos de pago',
        icon: 'payments',
        link: 'PaymentMethod'
      },
      {
        title: 'Tipos de factura',
        icon: 'book',
        link: 'InvoiceType'
      },
      {
        title: 'Moneda',
        icon: 'attach_money',
        link: 'Coin'
      },
      {
        title: 'Usuarios',
        icon: 'person',
        link: 'User'
      },
      {
        title: 'Vendedores',
        icon: 'person',
        link: 'Seller'
      },
      {
        title: 'Clientes',
        icon: 'person',
        link: 'Client'
      },
      {
        title: 'Roles',
        icon: 'group',
        link: 'Role'
      },
      {
        title: 'Mesas',
        icon: 'table_bar',
        link: 'Table'
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
              return ch.route === this.$route.name
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
            return this.validateRole(child.route)
          }).length > 0
        }
        return this.validateRole(link.route)
      })
    }
  },
  setup () {
    const leftDrawerOpen = ref(false)

    // const route = useRoute()
    const router = useRouter()
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      /**
       * Validate role
       * @param {String} route route
       */
      validateRole (route) {
        const roles = JSON.parse(localStorage.getItem('user')).roles
        const modules = []
        roles.forEach(role => {
          role.modules.forEach(module => {
            modules.push(module)
          })
        })
        return modules.find(module => module.route === route)
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
