import { useEffect, useState } from 'react'
import { TextInput } from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import juzgadoApi from '@/api/juzgadoApi'

function SearchMarca ({ resetFiltro, onSelectMarca, disabled }) {
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(true)

  const { data: marcas = [], isFetching, refetch } = useQuery({
    queryKey: ['buscarMarca', search],
    queryFn: async () => {
      if (search.length <= 2) return []
      const response = await juzgadoApi.get(`libre-deuda/marcas-select?query=${search}`)
      const { data } = response.data
      return data
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

  function selectMarca (marca) {
    setSearch(marca?.nombre || '')
    setShow(false)

    if (onSelectMarca) {
      onSelectMarca({
        id: marca?.id || '',
        nombre: marca?.nombre || ''
      })
    }
  }

  return (
    <div className='mb-4 relative'>
      <TextInput
        name='marca'
        type='text'
        placeholder='Ingrese la marca del vehículo'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
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
        <ul className='w-full overflow-y-auto max-h-96 absolute z-10 bg-white'>
          {isFetching
            ? (
              <li className='hover:bg-slate-300 border-b-2 border-x px-2 py-2'>
                Buscando marca...
              </li>
              )
            : marcas.length > 0
              ? (
                  marcas.map((marca) => (
                    <li key={marca.id} className='hover:bg-slate-300 border-b-2 border-x px-2'>
                      <button
                        type='button'
                        className='mb-1 w-full text-start py-2'
                        onClick={() => selectMarca(marca)}
                      >
                        <strong>{marca?.nombre}</strong>
                      </button>
                    </li>
                  ))
                )
              : (
                <li className='hover:bg-slate-300 border-b-2 border-x px-2 py-2'>
                  No se encontró la marca.
                </li>
                )}
        </ul>
      )}
    </div>
  )
}

export default SearchMarca
