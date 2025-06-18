<template>
  <div style="height: 100vh; background-image: url('images/bg-page-login.png');" class="flex flex-center bg-login">
    <q-card
      class="row"
      :style="`${$q.screen.lt.sm ? 'width: 95%;' : 'width: 98vw; max-width: 1000px;'} min-height: 500px; box-shadow: rgba(0, 0, 0, 0.6) 0px 5px 15px; ${$q.screen.lt.sm ? 'border-radius: 10px;' : 'border-radius: 40px;'}`"
    >
      <div class="col-6" v-if="!$q.screen.lt.sm">
        <q-img src="images/bg-login.png" alt="bg-login" style="border-radius: 40px 170px 170px 40px; min-height: 500px;"/>
      </div>
      <div :class="`flex flex-center ${$q.screen.lt.sm ? 'col-12' : 'col-6'}`" style="position: relative;">
        <div class="text-center full-width" style="position: absolute; top: 20px;">
          <q-img :src="logo.color" style='width: 240px; max-width: 80vw;'/>
        </div>
        <q-form @submit="loginAt" class="flex-column q-pa-md" style="width: 400px; max-width: 85vw;">
          <div class='text-h5 q-mb-md'>Iniciar sesión</div>
          <q-input
            class="q-mt-sm"
            color="primary"
            v-model="username"
            label="Usuario o correo electrónico"
            ref="username"
            name="username"
            filled
            dense
            @keyup.enter="login"
            :rules="[val => !!val || 'El campo es requerido.']">
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
          <q-input
            class="q-mt-sm"
            color="primary"
            v-model="password"
            label="Contraseña"
            ref="password"
            name="password"
            type="password"
            filled
            dense
            @keyup.enter="login"
            :rules="[val => !!val || 'El campo es requerido.']"
          >
            <template v-slot:prepend>
              <q-icon name="lock"/>
            </template>
          </q-input>
          <q-checkbox
            checked
            label="Recordarme"
            color="primary"
            v-model="remember"
          />
          <q-btn
            color="primary"
            type="submit"
            class="full-width"
            :disable="btnDisable"
          >
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
        </q-form>
        <div align="center" class="grid q-gutter-md" style="position: absolute; bottom: 10px;">
          <q-btn
            round
            outline
            color="primary"
            icon="android"
            href="https://pub-1ee8b00ceed2443c917a8188cf6ed6a4.r2.dev/apk/orderwise.apk"
            target="_blank"
            v-if="!$q.platform.is.nativeMobile"
            type="a"
          />
          <div>
            <span class="text-subtitle1 text-center text-bold">
              Powered by
            </span>
            <a href="https://site.qbitsinc.com" alt="qbits" target="_blank">
              <q-img style="width:80px"  :src="darkMode ? qBitsLogo.white : qBitsLogo.black"/>
            </a>
          </div>
        </div>
      </div>
    </q-card>
  </div>
</template>
<script>
import { logo, qBitsLogo } from 'src/const/mixins'
import { Notify } from 'quasar'
import { mapActions, mapState } from 'pinia'
import { authentication } from 'stores/module-authentication'
import { notify } from '../const/mixins'
import { darkModeStore } from '../stores/darkModeStore'
export default {
  name: 'LoginPage',
  data () {
    return {
      qBitsLogo,
      remember: true,
      dialog: false,
      logo,
      slide: 'style',
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
      urlDownload: null,
      messageError: {
        'The user credentials were incorrect.':
          'El usuario o contraseña son incorrectos.'
      }
    }
  },
  computed: {
    /**
     * Height window
     * @returns {Number}
     */
    heightWindow () {
      return screen.height
    },
    /**
     * Dark mode
     * @returns {Boolean}
     */
    ...mapState(darkModeStore, ['darkMode'])
  },
  mounted () {
    this.$q.dark.set(this.darkMode)
  },
  methods: {
    /**
     * Login app
     */
    async loginAt () {
      try {
        this.btnDisable = true
        const data = await this.login({ username: this.username, password: this.password })
        if (data.is_root) {
          this.$router.push({ name: 'Billing' })
          return
        }
        if (data?.roles?.length === 0) {
          notify('Usuario no tiene permisos', 'negative', 'warning')
          return
        }
        this.$router.push({ name: 'Tutorial' })
        this.btnDisable = false
      } catch (error) {
        Notify.create({
          message: this.messageError[error?.response?.data?.message] || error.message,
          color: 'negative',
          position: 'top',
          icon: 'warning',
          timeout: 5000,
          actions: [
            {
              label: 'OK',
              color: 'white',
              handler: () => {
                this.btnDisable = false
              }
            }
          ]
        })
      } finally {
        this.btnDisable = false
      }
    },
    ...mapActions(authentication, ['login'])
  }
}
</script>
<style>
  .bg-login {
    background-size: cover;
    background-position: center;
  }
  .img {
    width: 40%;
  }
  .body {
    scroll-behavior: hidden;
  }
</style>
