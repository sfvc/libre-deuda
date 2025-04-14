import axios from 'axios'

const juzgadoApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`
})

juzgadoApi.interceptors.request.use(config => {
  config.headers = {
    ...config.headers,
    'X-API-TOKEN': import.meta.env.VITE_X_API_TOKEN
  }

  return config
})

export default juzgadoApi
