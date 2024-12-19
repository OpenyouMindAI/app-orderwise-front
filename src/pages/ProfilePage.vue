<template>
  <q-page padding :style="!$q.screen.lt.md ? 'margin-left: 50%; transform: translateX(-40%)': ''">
    <q-card>
      <q-card-section class="q-pb-none">
        <span class="text-h6">Datos de perfil</span>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-xs">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
            <q-input
              v-model="userSession.name"
              filled
              label="Nombre"
              hint="Nombre del usuario"
              lazy-rules
              readonly
            />
          </div>
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
            <q-input
              v-model="userSession.last_name"
              filled
              label="Apellido"
              hint="Apellido del usuario"
              lazy-rules
              readonly
            />
          </div>
        </div>
        <q-input
          v-model="userSession.email"
          filled
          label="Correo electrónico"
          hint="Correo electrónico del usuario"
          lazy-rules
          readonly
        />
      </q-card-section>
    </q-card>
    <q-card class="q-mt-md">
      <q-card-section class="q-pb-none">
        <span class="text-h6">Cambiar contraseña</span>
      </q-card-section>
      <q-card-section>
        <q-form
          class="q-gutter-md"
          @submit="onSubmit"
        >
          <q-input
            v-model="password"
            filled
            type="password"
            label="Contraseña"
            hint="Contraseña del usuario"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
          />

          <q-input
            v-model="confirmPassword"
            type="password"
            filled
            label="Confirmar contraseña"
            hint="Confirmar contraseña del usuario"
            lazy-rules
            :rules="[
              val => val && val.length > 0 || 'Este campo es requerido',
              val => val === password || 'Las contraseñas no coinciden'
            ]"
          />

          <div class="full-width text-right">
            <q-btn label="Guardar" type="submit" color="primary" :loading="loading"/>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
export default {
  name: 'ProfilePage',
  data () {
    return {
      password: '',
      confirmPassword: '',
      loading: false
    }
  },
  computed: {
    ...mapState(authentication, ['userSession'])
  },
  methods: {
    async onSubmit () {
      try {
        this.loading = true
        await this.$api.post('change-password', { password: this.password })
        this.$q.notify({
          message: 'Guardado exitosamente',
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (error) {
        this.$q.notify({
          message: error.message,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loading = false
        this.password = ''
        this.confirmPassword = ''
      }
    }
  }
}
</script>
