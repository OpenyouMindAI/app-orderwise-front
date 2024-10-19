<template>
  <q-form @submit="login" class="flex flex-center" style="height: 100vh">
    <q-card flat class="my-card" style="width: 400px; max-width: 80vw;">
      <q-card-section>
        <q-img :src="logo.color"/>
      </q-card-section>
      <q-card-section class="bg-primary text-white" style="border-radius: 5px 5px 0px 0px;">
        <div class="text-h6">Iniciar sesión</div>
      </q-card-section>
      <q-card-section :class="!$q.dark.isActive ? 'bg-blue-grey-1' : 'bg-dark'">
        <q-input
          class="q-mt-sm"
          color="primary"
          v-model="username"
          label="Usuario o correo electronico"
          ref="username"
          name="username"
          outlined
          dense
          @keyup.enter="login"
          :rules="[val => !!val || 'El campo es requerido.']">
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>
        <q-input
          class="q-mt-md"
          color="primary"
          v-model="password"
          label="Contraseña"
          ref="password"
          name="password"
          type="password"
          dense
          outlined
          @keyup.enter="login"
          :rules="[val => !!val || 'El campo es requerido.']">
          <template v-slot:prepend>
            <q-icon name="lock"/>
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions :class="!$q.dark.isActive ? 'bg-blue-grey-1' : 'bg-dark'">
        <q-space/>
        <q-btn
          label="app android"
          color="secondary"
          icon="cloud_download"
          type="a"
          :href="urlDownload"
          v-if="!this.$q.platform.is.nativeMobile && this.$q.platform.is.platform !== 'win' && this.$q.platform.is.platform !== 'linux'"
        />
        <q-btn
          color="primary"
          type="submit"
          :disable="btnDisable">
          <span v-if="btnDisable">
            <q-spinner-hourglass
              color="blue-1"
              size="20px"
              :disable="btnDisable"
            />
            Cargando...
          </span>
          <span v-if="!btnDisable">
            Iniciar Sesión
          </span>
        </q-btn>
      </q-card-actions>
      <q-card-actions align="center" class="flex flex-center q-gutter-sm">
       <span class="text-subtitle1 text-center text-bold">
         Powered by
       </span>
       <a href="https://site.qbitsinc.com" alt="qbits" target="_blank">
         <q-img style="width:120px"  :src="qBitsLogo.black"/>
       </a>
      </q-card-actions>
    </q-card>
  </q-form>
</template>
<script>
import { logo, qBitsLogo } from 'src/const/mixins'

// import { Notify } from 'quasar'
export default {
  data () {
    return {
      messageLogin: {
        'Request failed with status code 401': 'Credenciales incorrectas',
        'Network Error': 'Error de red',
        "Cannot read properties of undefined (reading 'route')": 'El rol no tiene acceso a los modulos del menu',
        'auth/too-many-requests': 'El acceso a esta cuenta se ha inhabilitado temporalmente debido a muchos intentos fallidos de inicio de sesión'
      },
      logo,
      qBitsLogo,
      /**
         * Email User
         * @type {String}
         */
      username: '',
      /**
         * Password User
         * @type {String}
         */
      password: '',

      btnDisable: false,
      urlDownload: null
    }
  },
  computed: {
    heightWindow () {
      return screen.height
    }
  },
  methods: {
    setRouter (roles) {
      const modules = []
      roles.forEach(role => {
        role.modules.forEach(module => {
          modules.push(module)
        })
      })
      const moduleFind = modules[0]
      this.$router.push({ name: moduleFind.route })
    },
    setDataSessionStorage (data) {
      localStorage.setItem('accessToken', data.access_token)
      localStorage.setItem('refreshToken', data.refresh_token)
      localStorage.setItem('tokenType', data.token_type)
      localStorage.setItem('expiresIn', data.expires_in)
      localStorage.setItem('user', JSON.stringify(data.user))
    },
    /**
     * Login app
     */
    async login () {
      this.btnDisable = true
      this.$api.post('authentication/login', {
        username: this.username,
        password: this.password
      })
        .then(({ data }) => {
          console.log(data)
          this.setDataSessionStorage(data)
          this.$router.push({ name: 'Billing' })
          this.btnDisable = false
        })
        .catch((error) => {
          this.btnDisable = false
          this.$q.notify({
            message: this.messageLogin[error.message] ?? error.message,
            color: 'negative'
          })
        })
    }
  }
}
</script>
<style>
  .img {
    width: 40%;
  }
  .body {
    scroll-behavior: hidden;
  }
</style>
