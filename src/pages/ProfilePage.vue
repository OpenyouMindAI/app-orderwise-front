<template>
  <q-page class="profile-page">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="profile-container">
      <!-- Hero Header with Glass Effect -->
      <div class="profile-hero">
        <div class="hero-content">
          <div class="avatar-section">
            <div class="avatar-glow"></div>
            <q-avatar size="120px" class="user-avatar" color="primary">
              <img v-if="profile.avatar" :src="profile.avatar" alt="Avatar">
              <span v-else class="avatar-text">{{ getInitials() }}</span>
            </q-avatar>
            <q-btn
              round
              size="md"
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
            <span class="user-name">{{ profile.first_name }} {{ profile.last_name }}</span>
            <p class="user-email">
              <q-icon name="email" size="18px" class="q-mr-xs" />
              {{ profile.email }}
            </p>
            <div class="user-badges">
              <q-chip
                v-if="linkedAccounts.google"
                icon="check_circle"
                color="positive"
                text-color="white"
                size="sm"
                class="q-py-md"
              >
                Google vinculado
              </q-chip>
              <q-chip
                icon="verified_user"
                color="primary"
                text-color="white"
                size="sm"
                class="q-py-md"
              >
                Cuenta verificada
              </q-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="cards-grid">
        <!-- Card: Información Personal + Email -->
        <q-card class="section-card">
          <q-card-section class="card-header-compact">
            <div class="header-icon-compact">
              <q-icon name="person" size="20px"/>
            </div>
            <div class="header-text">
              <h3>Información Personal</h3>
            </div>
          </q-card-section>

          <q-card-section class="card-content-compact">
            <q-form @submit.prevent="saveProfile" class="compact-form">
              <div class="input-row">
                <q-input
                  v-model="profileForm.first_name"
                  label="Nombre"
                  outlined
                  dense
                  :error="!!errors.first_name"
                  :error-message="errors.first_name"
                  @update:model-value="errors.first_name = ''"
                />
                <q-input
                  v-model="profileForm.last_name"
                  label="Apellido"
                  outlined
                  dense
                  :error="!!errors.last_name"
                  :error-message="errors.last_name"
                  @update:model-value="errors.last_name = ''"
                />
              </div>

              <div class="input-group q-mt-md">
                <label class="input-label">Correo Electrónico</label>
                <div class="email-display-compact">
                  <span class="email-value-compact">{{ profile.email }}</span>
                  <q-btn
                    label="Cambiar"
                    color="primary"
                    flat
                    dense
                    size="sm"
                    @click="modals.email = true"
                  />
                </div>
              </div>

              <div class="q-mt-md flex justify-end">
                <q-btn
                  label="Guardar"
                  type="submit"
                  color="primary"
                  unelevated
                  size="md"
                  :loading="loading.profile"
                  :disable="!hasProfileChanges || loading.profile"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Card: Cambiar Contraseña -->
        <q-card class="section-card">
          <q-card-section class="card-header-compact">
            <div class="header-icon-compact">
              <q-icon name="lock" size="20px"/>
            </div>
            <div class="header-text">
              <h3>Seguridad</h3>
            </div>
          </q-card-section>

          <q-card-section class="card-content-compact">
            <q-form @submit.prevent="changePassword" class="compact-form">
              <q-input
                v-model="passwordForm.current_password"
                label="Contraseña Actual"
                :type="showPasswords.current ? 'text' : 'password'"
                outlined
                dense
                :error="!!errors.current_password"
                :error-message="errors.current_password"
                @update:model-value="errors.current_password = ''"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPasswords.current ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    size="sm"
                    @click="showPasswords.current = !showPasswords.current"
                  />
                </template>
              </q-input>

              <div class="input-row q-mt-sm">
                <q-input
                  v-model="passwordForm.new_password"
                  label="Nueva Contraseña"
                  :type="showPasswords.new ? 'text' : 'password'"
                  outlined
                  dense
                  :error="!!errors.new_password"
                  :error-message="errors.new_password"
                  @update:model-value="validatePasswordStrength"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="showPasswords.new ? 'visibility' : 'visibility_off'"
                      class="cursor-pointer"
                      size="sm"
                      @click="showPasswords.new = !showPasswords.new"
                    />
                  </template>
                </q-input>

                <q-input
                  v-model="passwordForm.confirm_password"
                  label="Confirmar"
                  :type="showPasswords.confirm ? 'text' : 'password'"
                  outlined
                  dense
                  :error="!!errors.confirm_password"
                  :error-message="errors.confirm_password"
                  @update:model-value="errors.confirm_password = ''"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="showPasswords.confirm ? 'visibility' : 'visibility_off'"
                      class="cursor-pointer"
                      size="sm"
                      @click="showPasswords.confirm = !showPasswords.confirm"
                    />
                  </template>
                </q-input>
              </div>

              <!-- Password Strength Meter -->
              <div v-if="passwordForm.new_password" class="password-strength-compact q-mt-sm">
                <div class="strength-bar-compact">
                  <div
                    class="strength-fill"
                    :class="passwordStrength.class"
                    :style="{ width: passwordStrength.width }"
                  ></div>
                </div>
                <span class="strength-text-compact" :class="passwordStrength.class">
                  {{ passwordStrength.label }}
                </span>
              </div>

              <div class="q-mt-md flex justify-end">
                <q-btn
                  label="Actualizar"
                  type="submit"
                  color="primary"
                  unelevated
                  size="md"
                  :loading="loading.password"
                  :disable="!isPasswordFormValid || loading.password"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Card: Personalización -->
        <q-card class="section-card full-width">
          <q-card-section class="card-header">
            <div class="header-icon">
              <q-icon name="palette" size="24px"/>
            </div>
            <div>
              <h3>Personalización</h3>
              <p>Personaliza la apariencia de la aplicación</p>
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section>
            <div class="social-item">
              <div class="social-left">
                <q-icon name="color_lens" size="32px" color="primary" />
                <div class="social-text">
                  <div class="social-name">Tema de Colores</div>
                  <div class="social-status">Cambia la paleta de colores de la aplicación</div>
                </div>
              </div>
              <q-btn
                label="Cambiar Tema"
                color="primary"
                unelevated
                @click="openThemeSelector"
                icon="palette"
                no-caps
              />
            </div>
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
import { useThemeStore } from 'src/stores/themeStore'

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
    },
    isPasswordFormValid () {
      return this.passwordForm.current_password &&
             this.passwordForm.new_password &&
             this.passwordForm.confirm_password &&
             this.passwordForm.new_password === this.passwordForm.confirm_password &&
             this.passwordStrength.score >= 2
    },
    passwordStrength () {
      const password = this.passwordForm.new_password
      if (!password) return { score: 0, label: '', class: '', width: '0%', errors: [] }

      let score = 0
      const errors = []

      if (password.length >= 8) score++
      else errors.push('Mínimo 8 caracteres')

      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
      else errors.push('Incluye mayúsculas y minúsculas')

      if (/\d/.test(password)) score++
      else errors.push('Incluye números')

      if (/[^A-Za-z0-9]/.test(password)) score++
      else errors.push('Incluye caracteres especiales')

      const labels = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte']
      const classes = ['weak', 'weak', 'medium', 'strong', 'strong']
      const widths = ['20%', '40%', '60%', '80%', '100%']

      return {
        score,
        label: labels[score] || '',
        class: classes[score] || '',
        width: widths[score] || '0%',
        errors
      }
    }
  },
  async mounted () {
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

    // Inicializar Google Auth para móvil si es Capacitor
    if (this.$q.platform.is.nativeMobile && window.Capacitor) {
      await this.initializeGoogleAuthMobile()
    }
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
    validatePasswordStrength () {
      // Trigger computed property update
      this.errors.new_password = ''
    },
    async changePassword () {
      this.loading.password = true
      this.errors = {}
      try {
        await this.$api.post('/change-password', {
          current_password: this.passwordForm.current_password,
          password: this.passwordForm.new_password,
          password_confirmation: this.passwordForm.confirm_password
        })

        this.$q.notify({
          message: 'Contraseña cambiada exitosamente',
          icon: 'check_circle',
          color: 'positive'
        })

        // Limpiar formulario
        this.passwordForm = {
          current_password: '',
          new_password: '',
          confirm_password: ''
        }
      } catch (error) {
        if (error.response?.status === 422) {
          this.errors = error.response.data.errors || {}
        }
        this.$q.notify({
          message: error.response?.data?.message || 'Error al cambiar contraseña',
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loading.password = false
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
     * Inicializar Google Auth para móvil
     */
    async initializeGoogleAuthMobile () {
      try {
        console.log('Initializing Google Auth for mobile...')
        console.log('Platform info:', {
          isNativeMobile: this.$q.platform.is.nativeMobile,
          isCapacitor: this.$q.platform.is.capacitor,
          hasCapacitor: !!window.Capacitor,
          platform: this.$q.platform
        })

        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '241900278304-roncn79359cb608lgg5fflfrgca544mk.apps.googleusercontent.com'
        console.log('Client ID:', clientId)

        await GoogleAuth.initialize({
          clientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true
        })

        console.log('Google Auth initialized successfully on mount')
      } catch (error) {
        console.error('Error initializing Google Auth on mount:', error)
        console.error('Init error details:', error.message)
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
     * Vincular cuenta de Google - Mobile
     */
    async linkGoogleAccountMobile () {
      try {
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

        console.log('GoogleAuth plugin loaded')
        console.log('Attempting Google sign in...')

        const result = await GoogleAuth.signIn()
        console.log('Google sign in result:', result)

        if (result && result.email) {
          const userInfo = {
            email: result.email,
            name: result.name || result.displayName,
            sub: result.id,
            picture: result.imageUrl
          }

          console.log('User info:', userInfo)

          // Crear credential con toda la info
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
        } else {
          this.loadingGoogle = false
          console.error('Invalid result from Google:', result)
          this.$q.notify({
            message: 'No se pudo obtener información de Google',
            icon: 'warning',
            color: 'negative'
          })
        }
      } catch (error) {
        this.loadingGoogle = false
        console.error('Mobile Google link error:', error)
        console.error('Error message:', error.message)

        // Si el usuario canceló, no mostrar error
        if (error.message && (
          error.message.toLowerCase().includes('cancel') ||
          error.message.toLowerCase().includes('user_cancelled') ||
          error.code === 12501
        )) {
          console.log('User cancelled link')
          return
        }

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
      }
    },

    /**
     * Vincular cuenta de Google
     */
    linkGoogleAccount () {
      this.loadingGoogle = true

      // Detectar si es móvil nativo (Capacitor)
      if (this.$q.platform.is.nativeMobile && window.Capacitor) {
        this.linkGoogleAccountMobile()
        return
      }

      // Web: usar Google SDK
      if (this.googleClient) {
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
        this.loadingGoogle = false
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
    },

    /**
     * Abrir selector de temas
     */
    openThemeSelector () {
      const themeStore = useThemeStore()
      themeStore.showThemeSelectorModal()
    }
  }
}
</script>

<style scoped>
/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.body--dark .animated-bg {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  top: -10%;
  right: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  bottom: -10%;
  left: -10%;
  animation-delay: 7s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Container */
.profile-page {
  position: relative;
  min-height: 100vh;
  padding: 32px;
  z-index: 1;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* Hero Header - Glass Morphism */
.profile-hero {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  padding: 10px 48px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.6s ease-out;
}

.body--dark .profile-hero {
  background: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* Avatar Section */
.avatar-section {
  position: relative;
  animation: scaleIn 0.8s ease-out 0.2s both;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: var(--q-primary);
  border-radius: 50%;
  filter: blur(30px);
  opacity: 0.4;
  animation: pulse 3s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.user-avatar {
  position: relative;
  z-index: 1;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.avatar-text {
  font-size: 48px;
  font-weight: 700;
  color: white;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  z-index: 2;
  transition: transform 0.3s ease;
}

.avatar-upload-btn:hover {
  transform: scale(1.1);
}

/* User Info */
.user-info {
  flex: 1;
  animation: fadeInRight 0.8s ease-out 0.4s both;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.user-name {
  font-size: 25px;
  font-weight: 700;
  color: var(--q-primary);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.user-email {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
}

.body--dark .user-email {
  color: #94a3b8;
}

.user-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Cards Grid - Compact */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 20px;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.body--dark .section-card {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.section-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px !important;
  position: relative;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--q-primary), transparent);
  opacity: 0.3;
}

.header-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--q-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.3);
  transition: transform 0.3s ease;
}

.section-card:hover .header-icon {
  transform: rotate(5deg) scale(1.05);
}

.card-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.body--dark .card-header h3 {
  color: #f1f5f9;
}

.card-header p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.body--dark .card-header p {
  color: #94a3b8;
}

/* Compact Headers - Hero UI Style */
.card-header-compact {
  padding: 16px 20px !important;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-compact {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--q-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-text h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.2px;
}

.body--dark .header-text h3 {
  color: #f1f5f9;
}

/* Compact Content */
.card-content-compact {
  padding: 20px !important;
}

.compact-form {
  max-width: 100%;
}

/* Input Row - Tailwind Style */
.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}

.body--dark .input-label {
  color: #94a3b8;
}

/* Email Display Compact */
.email-display-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.body--dark .email-display-compact {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(51, 65, 85, 0.8);
}

.email-value-compact {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.body--dark .email-value-compact {
  color: #f1f5f9;
}

/* Utility Classes */
.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

/* Password Strength - Compact */
.password-strength-compact {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar-compact {
  flex: 1;
  height: 3px;
  background: rgba(226, 232, 240, 0.5);
  border-radius: 2px;
  overflow: hidden;
}

.body--dark .strength-bar-compact {
  background: rgba(51, 65, 85, 0.5);
}

.strength-text-compact {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
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

/* Social Items - Modern */
.social-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.5);
  transition: all 0.3s ease;
}

.body--dark .social-item {
  background: rgba(15, 23, 42, 0.5);
}

.social-item:hover {
  background: rgba(var(--q-primary-rgb), 0.05);
  transform: translateX(4px);
}

.body--dark .social-item:hover {
  background: rgba(var(--q-primary-rgb), 0.1);
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
  color: #1e293b;
}

.body--dark .social-name {
  color: #f1f5f9;
}

.social-status {
  font-size: 13px;
  color: #64748b;
}

.body--dark .social-status {
  color: #94a3b8;
}

/* Buttons - Enhanced */
:deep(.q-btn) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.q-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

:deep(.q-btn.q-btn--unelevated) {
  box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.3);
}

/* Input Fields - Modern */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.q-field--outlined .q-field__control:hover) {
  border-color: var(--q-primary);
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 3px rgba(var(--q-primary-rgb), 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 20px;
  }

  .profile-hero {
    padding: 32px 24px;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .user-name {
    font-size: 28px;
  }

  .user-badges {
    justify-content: center;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .input-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .social-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .social-left {
    width: 100%;
  }

  .gradient-orb {
    filter: blur(60px);
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 16px;
  }

  .profile-hero {
    padding: 24px 20px;
  }

  .user-avatar {
    width: 100px !important;
    height: 100px !important;
  }

  .avatar-glow {
    width: 120px;
    height: 120px;
  }

  .user-name {
    font-size: 24px;
  }

  .avatar-text {
    font-size: 40px;
  }
}
</style>
