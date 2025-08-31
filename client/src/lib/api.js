import axios from 'axios'

// In dev, prefer proxy + relative baseURL:
const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (!config.headers) config.headers = {}
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // TEMP debug (remove later):
    console.log('Auth header ->', config.headers.Authorization?.slice(0, 30) + '...')
  }
  return config
})

export default api
