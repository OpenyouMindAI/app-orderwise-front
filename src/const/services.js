import axios from 'axios'
import { authentication } from 'src/stores/module-authentication'

/**
 * Get download request
 * @param {String} url api url
 * @param {*} params filter params
 * @returns {Array} array with data api
 */
export const getDownload = async (
  url,
  params = {},
  callbackOnDownload,
  callbackResponse
) => {
  const $store = authentication()
  axios({
    url: `${import.meta.env.VITE_APP_API_URL}${url}`,
    params,
    method: 'GET',
    responseType: 'blob',
    headers: { Authorization: `Bearer ${$store.access_token}` },
    onDownloadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      callbackOnDownload(percentCompleted)
    }
  })
    .then(async (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      callbackResponse(link)
    })
    .catch((error) => {
      callbackOnDownload(0)
      // messageRequest(validDebugResponse(error))
      throw new Error(error)
    })
}
