import juzgadoApi from '@/api/juzgadoApi'

export const getActasFilter = async (filters) => {
  let params = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '') params = { ...params, [key]: value }
  })

  const response = await juzgadoApi.get('libre-deuda/actas/filtrar', { params })
  return response.data
}

export const getTipos = async () => {
  const response = await juzgadoApi.get('libre-deuda/vehiculos-data')
  return response.data.tipo
}

export const getMarcas = async () => {
  const response = await juzgadoApi.get('libre-deuda/vehiculos-data')
  return response.data.marcas
}

export const postPersonaDatos = async (formData) => {
  const response = await juzgadoApi.post('libre-deuda/actualizar-datos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  const data = response.data
  return data
}

export const postLibreDeuda = async (formData) => {
  const response = await juzgadoApi.post('libre-deuda/registrar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  const { data } = response.data
  return data
}
