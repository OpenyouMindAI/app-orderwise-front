import { Loading, Notify, copyToClipboard, date } from 'quasar'

export const BALANZA_PREFIXES = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29']

export const notify = (message, color, icon, position = 'bottom') => {
  Notify.create({
    message,
    color,
    icon,
    position,
    timeout: 3000,
    actions: [
      {
        icon: 'close',
        color: 'white',
        handler: () => { /* Cerrar notificación */ }
      }
    ]
  })
}
/**
 * Set date format
 * @param {String} value date value
 * @param {Number} format date format
 * @return {String} date formatted
 */
export function formatDate (value, format = 'DD-MM-YYYY') {
  if (value) {
    return date.formatDate(value, format)
  }
}

/**
 * Loading statusList
 * @param {Boolean} val loading statusList
 */
export const loading = (val, options = {}) => {
  if (val) {
    Loading.show(options)
  } else {
    Loading.hide()
  }
}

/**
 * Model product
 * @param {Object} data product
 */
export const modelFormData = (data, put = false) => {
  const formData = new FormData()
  if (put) {
    formData.append('_method', 'put')
  }
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const element = data[key]
      if (typeof element !== 'object') {
        formData.append(key, element)
      }
    }
  }
  if (data.files) {
    data.files.forEach((element, index) => {
      formData.append(`files[${index}]`, element.file)
      formData.append(`file_types[${index}]`, element.file_type_id)
    })
  }
  return formData
}

export const formatNumber = (data) => {
  if (data && (typeof data === 'number' || typeof data === 'string')) {
    const factor = Math.pow(10, 3)
    const truncated = Math.floor(Number(data) * factor) / factor
    return truncated.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
  }
  return Number(data)
}

/**
 * @description convert text to slug
 * @param {*} Text
 */
export const convertToSlug = (Text) => {
  return Text.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '_')
}

export const copyClick = (data) => {
  copyToClipboard(data)
    .then(() => {
      Notify.create({
        color: 'primary',
        icon: 'content_copy',
        message: `Copiado: ${data}`
      })
    })
}

export const logo = {
  white: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QOrderWise/white.png',
  color: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QOrderWise/color.png',
  isoLogo: 'images/logo.png'
}

export const qBitsLogo = {
  black: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QBits/black.png',
  white: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QBits/white.png',
  isoLogoColor: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QBits/iso-logo-color.jpg'
}

export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export const setFiles = async (files) => {
  const filesSelected = []
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      filesSelected.push({
        url: await blobToBase64(file),
        file,
        type: file.type
      })
    }
  }
  return filesSelected
}

/**
 * Retrieves the initials of the first name and the first surname.
 *
 * The function ensures that the input contains at least a first name and a surname.
 * It supports different name formats:
 * - First name and one surname → Takes initials from both.
 * - First name, second name, and one surname → Takes initials from the first name and the surname.
 * - First name, second name, and two surnames → Takes initials from the first name and the first surname.
 *
 * @param {string} fullName - The full name to extract initials from.
 * @returns {string} The initials of the first name and the first surname, or an error message if invalid.
 */
export function getInitials (fullName) {
  const parts = fullName.trim().split(/\s+/)

  if (parts.length < 2) {
    return parts[0][0].toUpperCase()
  }

  const firstNameInitial = parts[0][0].toUpperCase()
  let surnameInitial = ''

  if (parts.length === 2) {
    surnameInitial = parts[1][0].toUpperCase()
  } else if (parts.length === 3) {
    surnameInitial = parts[2][0].toUpperCase()
  } else if (parts.length >= 4) {
    surnameInitial = parts[2][0].toUpperCase()
  }

  return `${firstNameInitial}${surnameInitial}`
}

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - Function to debounce
 * @param {Number} wait - Time to wait in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce (func, wait = 500) {
  let timeout
  return function executedFunction (...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
