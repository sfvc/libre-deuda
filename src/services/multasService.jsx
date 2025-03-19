import juzgadoApi from '@/api/juzgadoApi'

export const getDataFilter = async () => {
  const response = await juzgadoApi.get('actas-data')
  return response.data
}

export const getActasFilter = async (filters) => {
  let params = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '') params = { ...params, [key]: value }
  })

  const response = await juzgadoApi.get('/actas/filtrar', { params })
  return response.data
}

export const getActaById = async (filters) => {
  const response = await juzgadoApi.get(`/actas/${filters.id}`)
  const { data } = response.data
  return data
}
