import { useEffect, useState } from 'react'
import { TextInput } from 'flowbite-react'
import juzgadoApi from '@/api/juzgadoApi'
import { deleteDuplicateName } from '../util/deleteDuplicateName'
import { useQuery } from '@tanstack/react-query'

function SearchInfractor ({ resetFiltro, onSelectPersona }) {
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(true)
  const [isTyping, setIsTyping] = useState(false)

  const { data: personas = [], isFetching, refetch } = useQuery({
    queryKey: ['buscarPersonas', search],
    queryFn: async () => {
      if (search.length <= 2) return []
      const response = await juzgadoApi.get(`libre-deuda/personas/buscar/${search}`)
      return response.data.data
    },
    enabled: false
  })

  useEffect(() => {
    if (search.length > 2) {
      const timeoutId = setTimeout(() => {
        refetch()
        setIsTyping(false)
      }, 1000)
      return () => clearTimeout(timeoutId)
    } else {
      setShow(true)
    }
  }, [search, refetch])

  useEffect(() => {
    if (!resetFiltro) setSearch('')
  }, [resetFiltro])

  function selectPersona (per) {
    const identificacion = per.numero_documento ? per.numero_documento : per.cuit
    const nombre = deleteDuplicateName(per.apellido, per.nombre)
    setSearch(`${identificacion} - ${nombre}`)
    setShow(false)

    if (onSelectPersona) {
      onSelectPersona({
        persona_id: per.id,
        nombre: per.nombre,
        apellido: per.apellido,
        dni: per.numero_documento,
        email: per.email,
        telefono: per.telefono,
        cuit: per.cuit,
        razon_social: per.razon_social,
        domicilio: per.domicilio
      })
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setSearch(value)
      setIsTyping(true)
    }
  }

  return (
    <>
      <div className='mb-4 relative'>
        <TextInput
          name='search'
          type='text'
          placeholder='DNI'
          value={search}
          onChange={handleSearchChange}
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
          <ul className='w-full max-h-52 overflow-y-auto absolute z-10 bg-white shadow-md'>
            {isTyping || isFetching
              ? (
                <li className='hover:bg-slate-300 border-b-2 border-x px-2 py-2'>
                  Buscando personas...
                </li>
                )
              : personas.length > 0
                ? (
                    personas.map((per) => (
                      <li
                        key={per.id}
                        className='hover:bg-slate-300 border-b-2 border-x px-2'
                      >
                        <button
                          type='button'
                          className='mb-1 w-full text-start py-2'
                          onClick={() => selectPersona(per)}
                        >
                          <strong>{per.numero_documento || per.cuit}</strong> -{' '}
                          {deleteDuplicateName(per.apellido, per.nombre)}
                        </button>
                      </li>
                    ))
                  )
                : (
                  <li className='hover:bg-slate-300 border-b-2 border-x px-2'>
                    <button
                      type='button'
                      className='w-full text-start py-2'
                      onClick={() => {
                        setShow(false)
                        if (onSelectPersona) {
                          onSelectPersona({
                            persona_id: 639757,
                            nombre: 'ㅤ',
                            apellido: 'ㅤ',
                            dni: search,
                            cuit: 'SIN DATOS',
                            razon_social: 'SIN DATOS',
                            domicilio: 'SIN DATOS'
                          })
                        }
                      }}
                    >
                      <strong>No se encontró a la persona.</strong><br />
                      <span className='text-sm text-gray-500'>
                        Click aquí para cargar con datos vacíos.
                      </span>
                    </button>
                  </li>

                  )}
          </ul>
        )}
      </div>
    </>
  )
}

export default SearchInfractor
