/**
 * Opciones de países para prefijos telefónicos y validación.
 * iso: Corresponde al código ISO del país para mapeo con la API o sistemas externos.
 * code: Prefijo telefónico internacional.
 * mask: Máscara de formato para Quasar q-input.
 * regex: Expresión regular para validación básica.
 * flag: Emoji de la bandera del país.
 */
export const countryOptions = [
  { label: 'Argentina', code: '+54', iso: 'AR', mask: '## #### ####', regex: /^\d{10}$/, flag: '🇦🇷' },
  { label: 'Chile', code: '+56', iso: 'CL', mask: '# #### ####', regex: /^\d{9}$/, flag: '🇨🇱' },
  { label: 'México', code: '+52', iso: 'MX', mask: '## #### ####', regex: /^\d{10}$/, flag: '🇲🇽' },
  { label: 'Colombia', code: '+57', iso: 'CO', mask: '### ### ####', regex: /^\d{10}$/, flag: '🇨🇴' },
  { label: 'Perú', code: '+51', iso: 'PE', mask: '### ### ###', regex: /^\d{9}$/, flag: '🇵🇪' },
  { label: 'Uruguay', code: '+598', iso: 'UY', mask: '# ### ###', regex: /^\d{7,8}$/, flag: '🇺🇾' },
  { label: 'Venezuela', code: '+58', iso: 'VE', mask: '### ### ####', regex: /^\d{10}$/, flag: '🇻🇪' },
  { label: 'España', code: '+34', iso: 'ES', mask: '### ### ###', regex: /^\d{9}$/, flag: '🇪🇸' },
  { label: 'Otro', code: '', iso: null, mask: '', regex: /.+/, flag: '🌍' }
]
