<template>
  <q-stepper v-model="step" vertical color="primary" animated class="q-pa-none">
    <q-step :name="1" title="Datos generales" icon="settings" :done="step > 1">
      <q-form class="q-gutter-y-sm" @submit="saveGeneralData">
        <q-input
          v-model="generalData.name"
          filled
          dense
          autofocus
          label="Nombre"
          :rules="[
            (val) =>
              (val && val.length > 0) || 'Debe ingresar un número de documento',
          ]"
        />
        <q-input
          v-model="generalData.document_number"
          filled
          dense
          label="Número de documento"
          :rules="[
            (val) =>
              (val && val.length > 0) || 'Debe ingresar un número de documento',
          ]"
        />
        <q-input
          v-model="generalData.phone_number"
          filled
          dense
          label="Número de teléfono"
          :rules="[
            (val) =>
              (val && val.length > 0) || 'Debe ingresar un número de documento',
          ]"
        />
        <q-input
          v-model="generalData.email"
          filled
          dense
          label="Correo electrónico"
          type="email"
          :rules="[
            (val) =>
              (val && val.length > 0) || 'Debe ingresar un número de documento',
          ]"
        />
        <q-input
          v-model="generalData.address"
          type="textarea"
          filled
          dense
          label="Dirección"
          :rules="[
            (val) =>
              (val && val.length > 0) || 'Debe ingresar un número de documento',
          ]"
        />
        <q-input
          v-model="generalData.description"
          type="textarea"
          filled
          dense
          label="Descripción"
        />
        <q-stepper-navigation class="text-right">
          <q-btn color="primary" label="Guardar y continuar" type="submit" />
        </q-stepper-navigation>
      </q-form>
    </q-step>

    <q-step
      :name="2"
      title="Datos del representante legal"
      icon="create_new_folder"
      :done="step > 2"
    >
      <q-form class="q-gutter-y-sm" @submit="step = 3">
        <q-input
          v-model="representative.document_number"
          filled
          readonly
          dense
          autofocus
          label="Número de documento"
        />
        <q-input
          v-model="representative.name"
          filled
          readonly
          dense
          label="Nombre"
          :rules="[
            (val) =>
              (val && val.length > 0) || 'Debe ingresar un número de documento',
          ]"
        />
        <q-input
          v-model="representative.last_name"
          filled
          readonly
          dense
          label="Apellido"
          :rules="[
            (val) =>
              (val && val.length > 0) || 'Debe ingresar un número de documento',
          ]"
        />
        <q-stepper-navigation class="text-right">
          <q-btn
            flat
            color="secondary"
            label="Volver"
            class="q-ml-sm"
            @click="step = 1"
          />
          <q-btn color="primary" label="Guardar y continuar" type="submit" />
        </q-stepper-navigation>
      </q-form>
    </q-step>

    <q-step :name="3" title="Archivos de la empresa" icon="add_comment">
      <div
        :style="`
          display: flex;
          flex-wrap: wrap;
          gap: 50px;
          justify-content: center;
          flex-grow: 1;
          flex-basis: 240;
          ${$q.screen.lt.xs ? 'width: 240px;' : ''}
        `"
      >
        <div class="q-gutter-sm text-center">
          <file-button-component
            label="Logo de la empresa"
            @upload="(files) => uploadFile(files, 'logo')"
          />
          <file-component v-if="files.logo" :files="[files.logo]" />
        </div>
        <div class="q-gutter-sm text-center">
          <file-button-component
            label="Sello de la empresa"
            @upload="(files) => uploadFile(files, 'seal')"
          />
          <file-component v-if="files.seal" :files="[files.seal]" />
        </div>
        <div class="q-gutter-sm text-center">
          <file-button-component
            label="Firma de la empresa"
            @upload="(files) => uploadFile(files, 'signature')"
          />
          <file-component v-if="files.signature" :files="[files.signature]" />
        </div>
      </div>

      <q-stepper-navigation class="text-right">
        <q-btn
          flat
          color="secondary"
          label="Volver"
          class="q-ml-sm"
          @click="step = 2"
        />
        <q-btn
          color="primary"
          label="Guardar"
          :loading="loadingSave"
          @click="actions"
        />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>
<script setup>
import { authentication } from 'src/stores/module-authentication'
import FileButtonComponent from 'src/components/FileButtonComponent.vue'
import FileComponent from 'src/components/FileComponent.vue'
import { onBeforeMount, ref } from 'vue'
import { modelData, setFiles } from 'src/const/common'
import { useOrganizationStore } from 'src/stores/organization-store'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'

defineOptions({
  name: 'CompanyFormComponent'
})

const props = defineProps({
  organization: {
    type: Object,
    required: false,
    default: null
  },
  edit: {
    type: Boolean,
    default: false
  }
})

const auth = authentication()

const organizationStore = useOrganizationStore()

const emits = defineEmits(['saved'])

/**
 * General data
 * @type {Object}
 */
const generalData = ref(organizationStore.generalBasic)

/**
 * General data
 * @type {Object}
 */
const representative = auth.userSession
/**
 * Files
 * @type {Object}
 */
const files = ref({})
/**
 * Stepper
 * @type {Number}
 */
const step = ref(1)

onBeforeMount(() => {
  if (props.organization) {
    generalData.value = props.organization
    files.value = {
      logo: {
        url: props.organization.logo,
        type: 'image/png'
      },
      seal: {
        url: props.organization.seal,
        type: 'image/png'
      },
      signature: {
        url: props.organization.signature,
        type: 'image/png'
      }
    }
  }
})
/**
 * Loading save
 * @type {Boolean}
 */
const loadingSave = ref(false)
/**
 * Save general data
 */
const saveGeneralData = () => {
  step.value = 2
  organizationStore.setGeneralBasic(generalData.value)
}

const beforeSave = (data, message) => {
  step.value = 1
  emits('saved', data)
  organizationStore.setGeneralBasic({})
  Notify.create({
    message,
    icon: 'check_circle',
    color: 'positive'
  })
}

const actions = async () => {
  try {
    loadingSave.value = true
    const url = props.edit
      ? `companies/${props.organization.id}`
      : 'companies'

    const message = props.edit
      ? 'Empresa modificada exitosamente'
      : 'Empresa creada exitosamente'

    const { data } = await api.post(
      url,
      modelData(
        {
          ...generalData.value,
          logo: files.value.logo.file,
          seal: files.value.seal.file,
          signature: files.value.signature.file,
          representative_id: representative.id
        },
        props.edit
      )
    )
    beforeSave(data, message)
  } catch (error) {
    Notify.create({
      message: error.message,
      icon: 'warning',
      color: 'negative'
    })
  } finally {
    loadingSave.value = false
  }
}

const uploadFile = async (data, type) => {
  const filesSelected = await setFiles(data)
  files.value[type] = filesSelected[0]
}
</script>
