import { Loading, Notify, copyToClipboard, date } from 'quasar'

export const notify = (message, color, icon) => {
  Notify.create({
    message,
    color,
    icon
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
export const loading = val => {
  if (val) {
    Loading.show()
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
  const options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    minimumIntegerDigits: 1,
    useGrouping: true,
    decimalSeparator: '.'
  }
  if (data) {
    return Number(data).toLocaleString('es', options)
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
  white: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QBits/white.png'
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

export const setCodeRequest = (code) => {
  switch (code) {
    case 'Subscription expired':
      return 200
    default:
      return 100
  }
}
