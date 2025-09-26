<template>
  <div class="callback-container">
    <div class="callback-content">
      <q-card class="callback-card" flat>
        <q-card-section class="text-center">
          <q-spinner-dots
            color="primary"
            size="50px"
            class="q-mb-md"
          />
          <h5 class="q-my-md">Procesando autenticación...</h5>
          <p class="text-grey-6">Por favor espera mientras completamos tu inicio de sesión</p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { mapActions } from 'pinia'
import { authentication } from 'stores/module-authentication'

export default {
  name: 'SocialCallbackPage',
  async mounted() {
    await this.handleCallback()
  },
  methods: {
    async handleCallback() {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const provider = this.$route.params.provider
        
        if (!code) {
          throw new Error('No authorization code received')
        }

        // Make request to backend to exchange code for token
        const response = await this.$api.get(`/authentication/social/${provider}/callback${window.location.search}`)
        
        if (response.data.access_token) {
          // Store token and user data
          localStorage.setItem('access_token', response.data.access_token)
          
          // Update authentication store
          await this.setUser(response.data.user)
          
          Notify.create({
            message: 'Inicio de sesión exitoso',
            color: 'positive',
            position: 'top',
            icon: 'check_circle'
          })
          
          // Redirect based on user type
          if (response.data.user.is_root) {
            this.$router.push({ name: 'Billing' })
          } else if (response.data.user.roles?.length === 0) {
            Notify.create({
              message: 'Usuario no tiene permisos',
              color: 'negative',
              position: 'top',
              icon: 'warning'
            })
            this.$router.push({ name: 'Login' })
          } else {
            this.$router.push({ name: 'Tutorial' })
          }
        } else {
          throw new Error('No access token received')
        }
        
      } catch (error) {
        console.error('Social auth error:', error)
        Notify.create({
          message: error.response?.data?.error || 'Error en la autenticación social',
          color: 'negative',
          position: 'top',
          icon: 'error'
        })
        this.$router.push({ name: 'Login' })
      }
    },
    
    ...mapActions(authentication, ['setUser'])
  }
}
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.callback-content {
  width: 100%;
  max-width: 400px;
}

.callback-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px 20px;
}

h5 {
  font-weight: 300;
  color: #1976d2;
  margin: 0;
}

.body--dark .callback-card {
  background: rgba(30, 30, 30, 0.95);
  color: white;
}

.body--dark h5 {
  color: #64b5f6;
}
</style>
