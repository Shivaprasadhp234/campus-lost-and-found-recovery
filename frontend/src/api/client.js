import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  withXSRFToken: true,
})

let csrfRequest = null

export function ensureCsrf(force = false) {
  if (force) {
    csrfRequest = null
  }
  if (!csrfRequest) {
    csrfRequest = api.get('/auth/csrf').catch((error) => {
      csrfRequest = null
      throw error
    })
  }
  return csrfRequest
}

export function resetCsrf() {
  csrfRequest = null
}

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (!data) {
    return error?.message || fallback
  }
  if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
    return Object.values(data.fieldErrors).join(' ')
  }
  return data.message || fallback
}
