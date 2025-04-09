import axios from 'axios'

const juzgadoApi = axios.create({
  // baseURL: `${import.meta.env.VITE_API_URL}`
  baseURL: 'https://api-test-juzgado.cc.gob.ar/api/v1'
})

juzgadoApi.interceptors.request.use(config => {
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'X-API-TOKEN': import.meta.env.VITE_X_API_TOKEN
  }

  return config
})

export default juzgadoApi
