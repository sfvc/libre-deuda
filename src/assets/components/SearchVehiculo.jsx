import { useEffect, useState } from 'react'
import { TextInput } from 'flowbite-react'
import { deleteDuplicateName } from '../util/deleteDuplicateName'
import { useQuery } from '@tanstack/react-query'
import juzgadoApi from '@/api/juzgadoApi'

function SearchVehiculo ({ resetFiltro, onSelectVehiculo }) {
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(true)

  const { data: vehiculos = [], isFetching, refetch } = useQuery({
    queryKey: ['buscarVehiculo', search],
    queryFn: async () => {
      if (search.length <= 2) return []
      const response = await juzgadoApi.get(`/vehiculos/buscar/${search}`)
      return response.data.data
    },
    enabled: false
  })

  useEffect(() => {
    if (search.length > 2) {
      const timeoutId = setTimeout(() => refetch(), 1000)
      return () => clearTimeout(timeoutId)
    } else {
      setShow(true)
    }
  }, [search, refetch])

  useEffect(() => {
    if (!resetFiltro) setSearch('')
  }, [resetFiltro])

  function selectVehiculo (veh) {
    const titularNombre = veh.titular ? deleteDuplicateName(veh.titular.apellido, veh.titular.nombre) : 'SIN TITULAR'
    setSearch(`${veh.dominio} - ${titularNombre}`)
    setShow(false)

    if (onSelectVehiculo) {
      onSelectVehiculo({
        vehiculo_id: veh?.id,
        dominio: veh?.dominio,
        marca: veh?.marca || '',
        marca_id: veh?.marca?.id || '',
        modelo: veh?.modelo || '',
        tipo: veh?.tipo || '',
        numero_taxi_remis: veh?.numero_taxi_remis || '',
        titular: veh?.titular || {}
      })
    }
  }

  return (
    <>
      <div className='mb-4 relative'>
        <TextInput
          name='search'
          type='text'
          placeholder='Ingrese la patente del vehículo'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div type='button' className='absolute top-3 right-3'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='icon icon-tabler icon-tabler-search dark:stroke-white'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='#000000'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path stroke='none' d='M0 0h24v24H0z' fill='none' />
            <path d='M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0' />
            <path d='M21 21l-6 -6' />
          </svg>
        </div>

        {search.length >= 2 && show && (
          <ul className='w-full overflow-y-auto h-max-32 absolute z-10 bg-white'>
            {isFetching
              ? (
                <li className='hover:bg-slate-300 border-b-2 border-x px-2 py-2'>
                  Buscando vehículo...
                </li>
                )
              : vehiculos.length > 0
                ? (
                    vehiculos.map((veh) => (
                      <li key={veh.id} className='hover:bg-slate-300 border-b-2 border-x px-2'>
                        <button
                          type='button'
                          className='mb-1 w-full text-start py-2'
                          onClick={() => selectVehiculo(veh)}
                        >
                          <strong>{veh.dominio}</strong> - {veh.titular ? deleteDuplicateName(veh.titular.apellido, veh.titular.nombre) : 'SIN TITULAR'}
                        </button>
                      </li>
                    ))
                  )
                : (
                  <li className='hover:bg-slate-300 border-b-2 border-x px-2 py-2'>
                    No se encontró el vehículo.
                  </li>
                  )}
          </ul>
        )}
      </div>
    </>
  )
}

export default SearchVehiculo
