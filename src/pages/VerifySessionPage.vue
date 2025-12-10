<template>
  <div style="width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center;">
    <q-inner-loading
      :showing="visible"
      transition-show="slide-down"
      label="Por favor espere..."
      color="primary"
      size="90px"
      label-class="text-h6 text-primary"
      v-if="!error"
    />
    <q-card v-else class="text-center shadow-2" style="width: 500px; max-width: 96vw; border-radius: 20px;">
      <q-card-section>
        <q-icon name="sentiment_dissatisfied" size="90px" color="orange-8" />
        <div class="text-h4 text-primary">Ha ocurrido un problema inesperado</div>
      </q-card-section>
      <q-card-section>
        <div class="text-subtitle1 text-grey-7">
          Algo no salió como esperábamos. Intenta recargar la página o ponte en contacto con soporte si el problema continúa.
        </div>
      </q-card-section>
      <q-card-actions align="center" class="q-px-xl q-py-md">
        <q-btn
          color="primary"
          icon="refresh"
          label="Reintentar"
          class="full-width"
          rounded
          :loading="loadingRetry"
          @click="retry"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * Provides access to the current route's information (e.g., query params, path, etc.)
 * @type {Object}
 */
const route = useRoute()
/**
 * Enables programmatic navigation to other routes
 * @type {Object}
 */
const router = useRouter()
/**
 * Access to the authentication store, which handles session data
 * @type {Object}
 */
const store = authentication()
/**
 * Parameters passed via the route, such as query or path parameters
 * @type {Object}
 */
const visible = ref(true)
/**
 * Indicates whether the retry operation is currently loading
 * @type {Boolean}
 */
const loadingRetry = ref(false)
/**
 * Indicates whether an error has occurred
 * @type {Boolean}
 */
const error = ref(false)

/**
 * Initializes the component and fetches user information
 */
onMounted(() => {
  getUser()
})

/**
 * Handles retrying the user-fetching process
 */
const retry = async () => {
  loadingRetry.value = true
  await getUser()
  loadingRetry.value = false
}
/**
 * Fetches the user information and updates the session store
 * @returns {Promise<void>} No return value
 */
const getUser = async () => {
  try {
    const { data } = await api.post('session/get-token', {}, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `${route.params.token_type} ${route.params.access_token}`
      }
    })

    store.access_token = route.params.access_token
    store.token_type = route.params.token_type
    store.expires_In = route.params.expires_in

    data.roles = data?.roles?.length > 0 ? data?.roles : [data.role]

    // Update the complete store with user information
    store.setSessionData({
      ...route.params,
      user: data
    })
    router.push({ name: route.params.redirect })
  } catch (err) {
    console.log(err)
    error.value = true
    notify(err?.response?.data?.message || err.message, 'negative', 'warning')
  }
}
</script>
