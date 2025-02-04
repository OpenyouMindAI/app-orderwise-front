<template>
  <div>
    <q-card v-for="org in companies" :key="org.id" class="q-mt-sm cursor-pointer q-py-sm bg-primary text-white">
      <q-item>
        <q-item-section avatar>
          <img alt="logo" :src="org.url || logo.white" :style="$q.screen.lt.md
            ? 'height: 50px; width: 70px;'
            : 'height: 50px; width: 130px;'
            " />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-subtitle1">
            {{ org.name }} - {{ org.document_number }}
          </q-item-label>
          <q-item-label class="q-subtitle2 ">
            {{ org.email }}
            <q-badge rounded floating class="text-white text-bold q-pa-xs" color="secondary">
              Activa
            </q-badge>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn v-if="org.id === user.company_session_id" icon="published_with_changes" color="white" size="lg"
            dense round flat/>
          <q-btn v-else flat icon="sync" size="lg" round dense @click="changeCompany(org)">
            <q-tooltip> Cambiar la session de la empresa </q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-card>
    <q-dialog v-model="confirmDialog" persistent>
      <q-card style="width: 400px; max-width: 80vw">
        <q-form @submit="updateSession">
          <q-card-section class="row items-center q-py-md bg-primary text-white">
            <div class="text-h6">Confirmar usuario</div>
          </q-card-section>
          <q-card-section class="q-py-xs flex flex-center">
            <q-img :src="company.url || logo.white" width="200px" />
          </q-card-section>
          <q-card-section class="q-pb-md">
            <q-input v-model="password" type="password" label="Contraseña" outlined dense autofocus :rules="[
              (val) => (val && val.length > 0) || 'Este campo es requerido',
            ]" />
          </q-card-section>
          <q-card-actions align="right" class="q-gutter-sm q-pt-none">
            <q-btn color="secondary" icon="cancel" label="Cancelar" @click="confirmDialog = false" />
            <q-btn color="primary" icon="check_circle" label="Aceptar" type="submit" :loading="loading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup>
import { authentication } from 'src/stores/module-authentication'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { logo } from '../../const/mixins'

defineProps({
  companies: {
    type: Array,
    required: true
  }
})

/**
 * Company selected
 * @type {Object}
 */
const company = ref(null)
/**
 * Password of the user
 * @type {String}
 */
const password = ref('')
/**
 * Store of the application authentication
 * @type {Object}
 */
const store = authentication()
/**
 * User session
 * @type {Object}
 */
const user = store.userSession
/**
 * Dialog confirm
 * @type {Boolean}
 */
const confirmDialog = ref(false)
/**
 * Loading
 * @type {Boolean}
 */
const loading = ref(false)
/**
 * Quasar framework
 * @type {Object}
 */
const $q = useQuasar()

/**
 * Change company
 * @param  {Object} data
 */
function changeCompany (data) {
  company.value = data
  confirmDialog.value = true
}
/**
 * Update session
 */
async function updateSession () {
  try {
    loading.value = true
    console.log(company.value)
    const { data } = await api.post('session/company', {
      company_id: company.value.id,
      username: user.username || user.email,
      password: password.value
    })
    store.setBranchOffice(null)
    store.setSessionData(data)
    $q.notify({
      message:
        'Cambio realizado exitosamente, se actualizara los datos en unos segundos',
      color: 'positive',
      progress: true,
      timeout: 1000
    })
    setTimeout(() => window.location.reload(), 2000)
  } catch (error) {
    $q.notify({
      message: error?.response?.data?.message || error.message,
      color: 'negative',
      progress: true,
      timeout: 1500
    })
  } finally {
    loading.value = false
  }
}
</script>
