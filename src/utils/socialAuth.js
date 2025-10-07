/**
 * Social Authentication Utilities
 */

export const socialAuthConfig = {
  apiUrl: import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api',
  popupOptions: 'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes'
}

export const openSocialAuthPopup = (provider, onSuccess, onError) => {
  const authUrl = `${socialAuthConfig.apiUrl}/authentication/social/${provider}`
  
  // Debug: Log the URL being used
  console.log('OAuth URL:', authUrl)
  
  // Open popup window
  const popup = window.open(authUrl, `${provider}-oauth`, socialAuthConfig.popupOptions)
  
  if (!popup) {
    onError('Las ventanas emergentes están bloqueadas. Por favor, habilítalas para continuar.')
    return null
  }

  // Check if popup is closed manually
  const checkClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkClosed)
      onError('Autenticación cancelada')
    }
  }, 1000)

  // Listen for OAuth callback messages
  const messageHandler = (event) => {
    if (event.origin !== window.location.origin) return
    
    if (event.data.type === 'OAUTH_SUCCESS') {
      popup.close()
      clearInterval(checkClosed)
      window.removeEventListener('message', messageHandler)
      onSuccess(event.data.token, event.data.user)
    } else if (event.data.type === 'OAUTH_ERROR') {
      popup.close()
      clearInterval(checkClosed)
      window.removeEventListener('message', messageHandler)
      onError(event.data.error)
    }
  }

  window.addEventListener('message', messageHandler)

  return popup
}

export const handleSocialAuthSuccess = (token, user, router, notify) => {
  // Store token
  localStorage.setItem('access_token', token)
  
  // Show success notification
  notify.create({
    message: 'Autenticación exitosa',
    color: 'positive',
    position: 'top',
    icon: 'check_circle',
    timeout: 3000
  })

  // Redirect to dashboard
  router.push({ name: 'Dashboard' })
}

export const handleSocialAuthError = (error, notify) => {
  notify.create({
    message: error || 'Error en la autenticación social',
    color: 'negative',
    position: 'top',
    icon: 'error',
    timeout: 5000
  })
}

// Fallback for direct redirect (when popups are blocked)
export const redirectToSocialAuth = (provider) => {
  const authUrl = `${socialAuthConfig.apiUrl}/authentication/social/${provider}`
  window.location.href = authUrl
}

// Test function to verify backend connectivity
export const testSocialAuthBackend = async () => {
  try {
    const testUrl = `${socialAuthConfig.apiUrl}/authentication/social/test`
    console.log('Testing backend connectivity:', testUrl)
    
    const response = await fetch(testUrl)
    const data = await response.json()
    
    console.log('Backend test response:', data)
    return data
  } catch (error) {
    console.error('Backend test failed:', error)
    return { error: error.message }
  }
}
