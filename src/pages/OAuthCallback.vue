<template>
  <div class="oauth-callback">
    <div class="callback-content">
      <q-spinner-dots size="50px" color="primary" />
      <p class="text-h6 q-mt-md">Procesando autenticación...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OAuthCallback',
  mounted() {
    this.handleCallback()
  },
  methods: {
    handleCallback() {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const error = urlParams.get('error')
        const user = urlParams.get('user')

        if (token) {
          // Success - send message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_SUCCESS',
              token: token,
              user: user ? JSON.parse(decodeURIComponent(user)) : null
            }, window.location.origin)
            window.close()
          } else {
            // Fallback for direct navigation
            localStorage.setItem('access_token', token)
            this.$router.push({ name: 'Dashboard' })
          }
        } else if (error) {
          // Error - send message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_ERROR',
              error: decodeURIComponent(error)
            }, window.location.origin)
            window.close()
          } else {
            // Fallback for direct navigation
            this.$router.push({ name: 'Login' })
          }
        } else {
          // No token or error - redirect to login
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_ERROR',
              error: 'No se recibió token de autenticación'
            }, window.location.origin)
            window.close()
          } else {
            this.$router.push({ name: 'Login' })
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        if (window.opener) {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: 'Error procesando la autenticación'
          }, window.location.origin)
          window.close()
        } else {
          this.$router.push({ name: 'Login' })
        }
      }
    }
  }
}
</script>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%);
}

.callback-content {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
</style>
