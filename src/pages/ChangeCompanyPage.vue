<template>
  <q-page padding>
    <div class="row justify-center q-gutter-y-md">
      <div class="col-12 text-h6 text-center">Listas de Empresas</div>
      <div class="col-12 text-body2 q-px-md" style="display: grid; place-content: center">
        <div style="max-width: 600px; width: 100%">
          Bienvenido al módulo de Cambio de Sesión por Empresa. Esta función te
          permite gestionar tus actividades de forma organizada y eficiente al
          trabajar con múltiples empresas o entidades dentro de nuestro sistema.
        </div>
      </div>
      <div class="col-xl-4 col-lg-7 col-md-8 col-sm-10 col-xs-12">
        <change-company :companies="companies" />
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { api } from 'src/boot/axios'
import ChangeCompany from 'src/components/Company/ChangeCompany.vue'
import { loading } from 'src/const/mixins'
import { computed, onBeforeMount, ref } from 'vue'
import { authentication } from 'src/stores/module-authentication'
import { orderBy } from 'firebase/firestore'

const store = authentication()

const { userSession } = store
/**
 * Store of the application authentication
 * @type {Object}
 */
/**
 * All companies
 * @type {Array}
 */
const companies = ref([])

const params = computed(() => {
  if (userSession.is_root) {
    return {
      sortBy: 'name',
      sortOrder: 'asc'
    }
  }

  return {
    sortBy: 'name',
    sortOrder: 'asc',
    dataEqualFilter: {
      'users.user_id': userSession?.id
    }
  }
})

onBeforeMount(() => {
  getAllCompanies()
})
/**
 * Get companies all
 */
const getAllCompanies = async () => {
  try {
    loading(true)
    const { data } = await api.get('companies', {
      params: params.value
    })
    companies.value = data
    loading(false)
  } catch (error) {
    console.error('Error adding document: ', error)
    loading(false)
  }
}
</script>
