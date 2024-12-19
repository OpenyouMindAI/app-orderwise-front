<template>
  <q-page padding :style="!$q.screen.lt.md ? 'margin-left: 50%; transform: translateX(-40%)': ''">
    <q-card class="bg-grey-1">
      <q-form @submit="onSubmit">
        <q-card-section>
          <span class="text-h6">Cambiar logo de la empresa</span>
        </q-card-section>
        <q-card-section class="flex justify-center q-pt-none">
          <q-img
            :src="file.url || logo.white"
            spinner-color="white"
            style="height: 200px;"
            class="rounded-borders"
            fit="contain"
          >
            <div class="absolute-bottom text-subtitle1 text-center">
              <file-button-component icon="photo_camera" label="Subir imagen" @upload="onUpload" />
            </div>
          </q-img>
        </q-card-section>
        <q-card-section class="q-pb-none">
          <span class="text-h6">Datos de perfil de la empresa</span>
        </q-card-section>
        <q-card-section class="q-pb-sm">
          <div class="row q-col-gutter-x-md">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
              <q-input
                v-model="company.name"
                filled
                label="Nombre de la empresa"
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
              />
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
              <q-input
                v-model="company.document_number"
                filled
                label="Número de documento"
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
              />
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
              <q-input
                v-model="company.email"
                filled
                label="Correo electrónico"
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
              />
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
              <q-input
                v-model="company.phone_number"
                filled
                label="Número de teléfono"
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
              />
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
              <q-input
                v-model="company.address"
                filled
                label="Dirección"
                lazy-rules
                type="textarea"
                :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pt-xs">
          <q-btn color="primary" label="Guardar" type="submit" :loading="loading"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { authentication } from 'src/stores/module-authentication'
import FileButtonComponent from 'src/components/FileButtonComponent.vue'
import { logo, notify, setFiles } from '../const/mixins'
import { api } from 'src/boot/axios'
import { ref } from 'vue'

/**
 * Store module authentication
 * @type {Object}
 */
const store = authentication()

/**
 * User session
 * @type {Object}
 */
const userSession = store.userSession

/**
 * Company session
 * @type {Object}
 */
const company = ref(userSession.company_session)

/**
 * File
 * @type {Object}
 */
const file = ref({
  url: userSession.company_session.url
})

/**
 * Loading
 * @type {Boolean}
 */
const loading = ref(false)

/**
 * On upload
 * @param {Array} files
 */
const onUpload = async (files) => {
  const filesSelected = await setFiles(files)
  file.value = filesSelected[0]
}

/**
 * Form data
 * @param {Object} data
 */
const formDate = (data) => {
  const formData = new FormData()
  formData.append('file', file.value.file)
  formData.append('name', data.name)
  formData.append('address', data.address)
  formData.append('document_number', data.document_number)
  formData.append('email', data.email)
  formData.append('_method', 'put')
  return formData
}

/**
 * Save company config
 */
const onSubmit = async () => {
  try {
    loading.value = true
    const { data } = await api.post(`session/company/${company.value.id}`, formDate(company.value))
    store.setCompanySession(data)
    notify('Guardado exitosamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

</script>
