<template>
  <q-page class="profile-page">
    <div class="profile-container">
      <!-- Header -->
      <div class="profile-header">
        <div class="avatar-wrapper">
          <q-avatar size="80px" class="user-avatar" color="primary" text-color="white">
            <img v-if="profile.avatar" :src="getAvatarUrl(profile.avatar)" alt="Avatar">
            <span v-else class="avatar-text">
              {{ getInitials() }}
            </span>
          </q-avatar>
          <q-btn
            round
            size="sm"
            color="primary"
            icon="photo_camera"
            class="avatar-upload-btn"
            @click="triggerFileInput"
          >
            <q-tooltip>Cambiar foto</q-tooltip>
          </q-btn>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="uploadAvatar"
          />
        </div>
        <div class="user-info">
          <h2>{{ profile.first_name }} {{ profile.last_name }}</h2>
          <p>{{ profile.email }}</p>
          <q-btn
            v-if="profile.avatar"
            label="Eliminar foto"
            size="sm"
            flat
            dense
            color="negative"
            @click="deleteAvatar"
            class="q-mt-xs"
          />
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="cards-grid">
        <!-- Card: Información Personal -->
        <q-card class="section-card">
          <q-card-section class="card-header">
            <div class="header-icon">
              <q-icon name="person" size="24px"/>
            </div>
            <div>
              <h3>Información Personal</h3>
              <p>Actualiza tus datos básicos</p>
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section>
            <q-form @submit.prevent="saveProfile" class="simple-form">
              <q-input
                v-model="profileForm.first_name"
                label="Nombre"
                outlined
                :error="!!errors.first_name"
                :error-message="errors.first_name"
                :rules="[
                  val => !!val || 'El nombre es requerido',
                  val => val.length >= 2 || 'Mínimo 2 caracteres'
                ]"
                @update:model-value="errors.first_name = ''"
              />

              <q-input
                v-model="profileForm.last_name"
                label="Apellido"
                outlined
                class="q-mt-md"
                :error="!!errors.last_name"
                :error-message="errors.last_name"
                :rules="[
                  val => !!val || 'El apellido es requerido',
                  val => val.length >= 2 || 'Mínimo 2 caracteres'
                ]"
                @update:model-value="errors.last_name = ''"
              />

              <div class="q-mt-lg">
                <q-btn
                  label="Guardar Cambios"
                  type="submit"
                  color="primary"
                  unelevated
                  :loading="loading.profile"
                  :disable="!hasProfileChanges || loading.profile"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Card: Correo Electrónico -->
        <q-card class="section-card">
          <q-card-section class="card-header">
            <div class="header-icon">
              <q-icon name="email" size="24px"/>
            </div>
            <div>
              <h3>Correo Electrónico</h3>
              <p>Actualiza tu email</p>
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section>
            <div class="email-display">
              <div class="email-value">{{ profile.email }}</div>
              <q-btn
                label="Cambiar correo"
                color="primary"
                flat
                @click="modals.email = true"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Card: Cambiar Contraseña -->
        <q-card class="section-card">
          <q-card-section class="card-header">
            <div class="header-icon">
              <q-icon name="lock" size="24px"/>
            </div>
            <div>
              <h3>Cambiar Contraseña</h3>
              <p>Mantén tu cuenta segura</p>
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section>
            <q-form @submit.prevent="changePassword" class="simple-form">
              <q-input
                v-model="passwordForm.current_password"
                label="Contraseña Actual"
                :type="showPasswords.current ? 'text' : 'password'"
                outlined
                :error="!!errors.current_password"
                :error-message="errors.current_password"
                :rules="[val => !!val || 'La contraseña actual es requerida']"
                @update:model-value="errors.current_password = ''"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPasswords.current ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPasswords.current = !showPasswords.current"
                  />
                </template>
              </q-input>

              <q-input
                v-model="passwordForm.new_password"
                label="Nueva Contraseña"
                :type="showPasswords.new ? 'text' : 'password'"
                outlined
                class="q-mt-md"
                :error="!!errors.new_password"
                :error-message="errors.new_password"
                @update:model-value="validatePasswordStrength"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPasswords.new ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPasswords.new = !showPasswords.new"
                  />
                </template>
              </q-input>

              <!-- Password Strength Meter -->
              <div v-if="passwordForm.new_password" class="password-strength q-mt-sm">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :class="passwordStrength.class"
                    :style="{ width: passwordStrength.width }"
                  ></div>
                </div>
                <div class="strength-text" :class="passwordStrength.class">
                  {{ passwordStrength.label }}
                </div>
                <ul v-if="passwordStrength.errors.length" class="strength-errors">
                  <li v-for="(error, i) in passwordStrength.errors" :key="i">{{ error }}</li>
                </ul>
              </div>

              <q-input
                v-model="passwordForm.confirm_password"
                label="Confirmar Nueva Contraseña"
                :type="showPasswords.confirm ? 'text' : 'password'"
                outlined
                class="q-mt-md"
                :error="!!errors.confirm_password"
                :error-message="errors.confirm_password"
                :rules="[
                  val => !!val || 'Confirma tu contraseña',
                  val => val === passwordForm.new_password || 'Las contraseñas no coinciden'
                ]"
                @update:model-value="errors.confirm_password = ''"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPasswords.confirm ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPasswords.confirm = !showPasswords.confirm"
                  />
                </template>
              </q-input>

              <div class="q-mt-lg">
                <q-btn
                  label="Cambiar Contraseña"
                  type="submit"
                  color="primary"
                  unelevated
                  :loading="loading.password"
                  :disable="!isPasswordFormValid || loading.password"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Card: Cuentas Vinculadas -->
        <q-card class="section-card full-width">
          <q-card-section class="card-header">
            <div class="header-icon">
              <q-icon name="link" size="24px"/>
            </div>
            <div>
              <h3>Cuentas Vinculadas</h3>
              <p>Inicia sesión más rápido</p>
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section>
            <!-- Google -->
            <div class="social-item">
              <div class="social-left">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <div class="social-text">
                  <div class="social-name">Google</div>
                  <div class="social-status">{{ linkedAccounts.google || 'No vinculada' }}</div>
                </div>
              </div>
              <q-btn
                v-if="!linkedAccounts.google"
                label="Vincular"
                color="primary"
                flat
                @click="linkGoogleAccount"
                :loading="loadingGoogle"
              />
              <q-btn
                v-else
                label="Desvincular"
                color="negative"
                flat
                @click="unlinkAccount('google')"
              />
            </div>

            <q-separator class="q-my-md"/>

            <!-- Facebook -->
            <div class="social-item">
              <div class="social-left">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                <div class="social-text">
                  <div class="social-name">Facebook</div>
                  <div class="social-status">{{ linkedAccounts.facebook || 'No vinculada' }}</div>
                </div>
              </div>
              <q-btn
                v-if="!linkedAccounts.facebook"
                label="Vincular"
                color="primary"
                flat
                @click="$q.notify('Próximamente disponible')"
              />
              <q-btn
                v-else
                label="Desvincular"
                color="negative"
                flat
                @click="unlinkAccount('facebook')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'

export default {
  name: 'ProfilePage',
  data () {
    return {
      profile: {
        first_name: '',
        last_name: '',
        email: '',
        avatar: null
      },
      showPasswords: {},
      profileForm: {
        first_name: '',
        last_name: ''
      },
      originalProfile: {
        first_name: '',
        last_name: ''
      },
      emailForm: {
        new_email: '',
        password: ''
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      loading: {
        profile: false,
        email: false,
        password: false,
        google: false,
        facebook: false
      },
      errors: {
        first_name: '',
        last_name: '',
        new_email: '',
        email_password: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      },
      modals: {
        email: false,
        unlinkConfirm: false
      },
      tab: 'info',
      loadingProfile: false,
      loadingPassword: false,
      loadingGoogle: false,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      googleClient: null,
      linkedAccounts: {
        google: null,
        facebook: null
      }
    }
  },
  computed: {
    ...mapState(authentication, ['userSession']),
    hasProfileChanges () {
      return this.profileForm.first_name !== this.originalProfile.first_name ||
             this.profileForm.last_name !== this.originalProfile.last_name
    }
  },
  mounted () {
    // Inicializar profile con datos del usuario
    this.profile = {
      first_name: this.userSession.name || '',
      last_name: this.userSession.last_name || '',
      email: this.userSession.email || '',
      avatar: this.userSession.avatar || null
    }

    // Inicializar formularios
    this.profileForm = {
      first_name: this.userSession.name || '',
      last_name: this.userSession.last_name || ''
    }

    this.originalProfile = { ...this.profileForm }

    // Cargar cuentas vinculadas
    this.loadLinkedAccounts()

    // Cargar Google SDK
    this.loadGoogleScript()
  },
  methods: {
    getInitials () {
      const first = this.profile.first_name?.charAt(0) || 'U'
      const last = this.profile.last_name?.charAt(0) || ''
      return (first + last).toUpperCase()
    },
    async saveProfile () {
      this.loading.profile = true
      this.errors = {}
      try {
        const response = await this.$api.put('/profile', this.profileForm)
        this.profile.first_name = this.profileForm.first_name
        this.profile.last_name = this.profileForm.last_name
        this.originalProfile = { ...this.profileForm }

        this.$q.notify({
          message: 'Perfil actualizado correctamente',
          color: 'positive',
          icon: 'check_circle'
        })
      } catch (error) {
        if (error.response?.status === 422) {
          this.errors = error.response.data.errors || {}
        }
        this.$q.notify({
          message: error.response?.data?.message || 'Error al actualizar perfil',
          color: 'negative',
          icon: 'warning'
        })
      } finally {
        this.loading.profile = false
      }
    },
    getAvatarUrl (avatar) {
      if (!avatar) return null
      // Si es URL completa (de Google), retornar directamente
      if (avatar.startsWith('http')) return avatar
      // Si es path local, construir URL
      return `${this.$api.defaults.baseURL}/storage/${avatar}`
    },
    triggerFileInput () {
      this.$refs.fileInput.click()
    },
    async uploadAvatar (event) {
      const file = event.target.files[0]
      if (!file) return

      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.$q.notify({
          message: 'La imagen no debe superar 2MB',
          color: 'negative',
          icon: 'warning'
        })
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        this.$q.notify({
          message: 'El archivo debe ser una imagen',
          color: 'negative',
          icon: 'warning'
        })
        return
      }

      const formData = new FormData()
      formData.append('avatar', file)

      try {
        const response = await this.$api.post('/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        this.profile.avatar = response.data.avatar

        this.$q.notify({
          message: 'Foto de perfil actualizada',
          color: 'positive',
          icon: 'check_circle'
        })
      } catch (error) {
        this.$q.notify({
          message: error.response?.data?.message || 'Error al subir la foto',
          color: 'negative',
          icon: 'warning'
        })
      }

      // Limpiar input
      event.target.value = ''
    },
    async deleteAvatar () {
      this.$q.dialog({
        title: 'Confirmar',
        message: '¿Estás seguro de eliminar tu foto de perfil?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await this.$api.delete('/profile/avatar')
          this.profile.avatar = null

          this.$q.notify({
            message: 'Foto de perfil eliminada',
            color: 'positive',
            icon: 'check_circle'
          })
        } catch (error) {
          this.$q.notify({
            message: 'Error al eliminar la foto',
            color: 'negative',
            icon: 'warning'
          })
        }
      })
    },
    /**
     * Actualizar perfil
     */
    async updateProfile () {
      try {
        this.loadingProfile = true
        await this.$api.put('/profile', this.profileForm)

        // Actualizar sesión local
        this.userSession.name = this.profileForm.name
        this.userSession.last_name = this.profileForm.last_name
        this.userSession.email = this.profileForm.email

        this.$q.notify({
          message: 'Perfil actualizado exitosamente',
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (error) {
        this.$q.notify({
          message: error.response?.data?.message || 'Error al actualizar perfil',
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loadingProfile = false
      }
    },

    /**
     * Cambiar contraseña
     */
    async changePassword () {
      try {
        this.loadingPassword = true
        await this.$api.post('/change-password', {
          current_password: this.passwordForm.currentPassword,
          password: this.passwordForm.newPassword,
          password_confirmation: this.passwordForm.confirmPassword
        })

        this.$q.notify({
          message: 'Contraseña cambiada exitosamente',
          icon: 'check_circle',
          color: 'positive'
        })

        // Limpiar formulario
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      } catch (error) {
        this.$q.notify({
          message: error.response?.data?.message || 'Error al cambiar contraseña',
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loadingPassword = false
      }
    },

    /**
     * Cargar estado de cuentas sociales
     */
    async loadLinkedAccounts () {
      try {
        const response = await this.$api.get('/auth/social/status')
        if (response.data.providers) {
          this.linkedAccounts.google = response.data.providers.google?.linked ? response.data.providers.google.email : null
          this.linkedAccounts.facebook = response.data.providers.facebook?.linked ? response.data.providers.facebook.email : null
        }
      } catch (error) {
        console.error('Error loading linked accounts:', error)
      }
    },

    /**
     * Cargar script de Google
     */
    loadGoogleScript () {
      if (document.getElementById('google-sdk')) return

      const script = document.createElement('script')
      script.id = 'google-sdk'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        this.initializeGoogle()
      }
      document.head.appendChild(script)
    },

    /**
     * Inicializar Google
     */
    initializeGoogle () {
      if (window.google && window.google.accounts) {
        try {
          this.googleClient = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: this.handleGoogleResponse
          })
        } catch (error) {
          console.error('Error initializing Google:', error)
        }
      }
    },

    /**
     * Vincular cuenta de Google
     */
    linkGoogleAccount () {
      if (this.googleClient) {
        this.loadingGoogle = true
        try {
          this.googleClient.requestAccessToken()
        } catch (error) {
          this.loadingGoogle = false
          this.$q.notify({
            message: 'Error al abrir Google',
            icon: 'warning',
            color: 'negative'
          })
        }
      } else {
        this.$q.notify({
          message: 'Google no está disponible',
          icon: 'warning',
          color: 'negative'
        })
      }
    },

    /**
     * Manejar respuesta de Google
     */
    async handleGoogleResponse (tokenResponse) {
      if (tokenResponse && tokenResponse.access_token) {
        try {
          // Obtener información del usuario
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`
            }
          })

          const userInfo = await userInfoResponse.json()

          // Crear credential con toda la info incluyendo picture
          const credential = btoa(JSON.stringify({
            email: userInfo.email,
            sub: userInfo.sub,
            name: userInfo.name,
            picture: userInfo.picture
          }))

          // Vincular cuenta en el backend
          const response = await this.$api.post('/auth/social/link', {
            provider: 'google',
            credential,
            email: userInfo.email
          })

          this.linkedAccounts.google = userInfo.email

          // Si Google devolvió foto y no tenemos avatar, actualizar
          if (userInfo.picture && !this.profile.avatar) {
            this.profile.avatar = userInfo.picture
          }

          this.$q.notify({
            message: 'Tu cuenta de Google se vinculó correctamente',
            icon: 'check_circle',
            color: 'positive'
          })
        } catch (error) {
          if (error.response?.status === 409) {
            this.$q.notify({
              message: 'Este correo ya está vinculado a otra cuenta',
              icon: 'warning',
              color: 'warning',
              actions: [{
                label: 'Cambiar correo de cuenta',
                color: 'white',
                handler: () => { this.modals.email = true }
              }]
            })
          } else if (error.response?.status === 401 || error.response?.status === 400) {
            this.$q.notify({
              message: 'No pudimos verificar Google. Intenta nuevamente.',
              icon: 'warning',
              color: 'negative'
            })
          } else {
            this.$q.notify({
              message: error.response?.data?.message || 'Error al vincular cuenta de Google',
              icon: 'warning',
              color: 'negative'
            })
          }
        } finally {
          this.loadingGoogle = false
        }
      } else {
        this.loadingGoogle = false
      }
    },

    /**
     * Desvincular cuenta
     */
    async unlinkAccount (provider) {
      this.$q.dialog({
        title: 'Confirmar',
        message: `¿Estás seguro de desvincular tu cuenta de ${provider === 'google' ? 'Google' : 'Facebook'}?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await this.$api.post('/auth/social/unlink', {
            provider
          })

          this.linkedAccounts[provider] = null

          this.$q.notify({
            message: `Tu cuenta de ${provider === 'google' ? 'Google' : 'Facebook'} se desvinculó`,
            icon: 'check_circle',
            color: 'positive'
          })
        } catch (error) {
          this.$q.notify({
            message: error.response?.data?.message || 'Error al desvincular cuenta',
            icon: 'warning',
            color: 'negative'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
/* Contenedor principal */
.profile-page {
  background: #fafafa;
  min-height: 100vh;
  padding: 24px;
}

.profile-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Header */
.profile-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.avatar-wrapper {
  position: relative;
}

.user-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-text {
  font-size: 28px;
  font-weight: 600;
}

.avatar-upload-btn {
  position: absolute;
  bottom: -4px;
  right: -4px;
}

.user-info h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.user-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.section-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.section-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px !important;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.card-header p {
  font-size: 13px;
  color: #999;
  margin: 0;
}

/* Formularios */
.simple-form {
  max-width: 100%;
}

/* Email Display */
.email-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.email-value {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 500;
}

/* Password Strength */
.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-fill.weak {
  background: #f44336;
}

.strength-fill.medium {
  background: #ff9800;
}

.strength-fill.strong {
  background: #4caf50;
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.strength-text.weak {
  color: #f44336;
}

.strength-text.medium {
  color: #ff9800;
}

.strength-text.strong {
  color: #4caf50;
}

.strength-errors {
  list-style: none;
  padding: 0;
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #666;
}

.strength-errors li {
  padding: 2px 0;
}

.strength-errors li::before {
  content: "• ";
  color: #f44336;
  margin-right: 4px;
}

/* Social Items */
.social-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.social-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.social-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.social-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.social-status {
  font-size: 13px;
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .social-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .social-left {
    width: 100%;
  }
}
</style>
