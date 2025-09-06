import axios from 'axios'

// In dev, prefer proxy + relative baseURL:
const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api", // <— TALK DIRECTLY TO FLASK
  timeout: 15000,
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
