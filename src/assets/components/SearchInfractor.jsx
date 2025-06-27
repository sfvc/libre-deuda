import { useQuery } from '@tanstack/react-query'
import { TextInput } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { deleteDuplicateName } from '../util/deleteDuplicateName'
import juzgadoApi from '@/api/juzgadoApi'

function SearchInfractor ({ resetFiltro, onSelectPersona }) {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [show, setShow] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [hasSelectedPersona, setHasSelectedPersona] = useState(false)

  const { data: personas = [], isFetching, refetch } = useQuery({
    queryKey: ['buscarPersonas', search],
    queryFn: async () => {
      if (search.length <= 2) return []
      const response = await juzgadoApi.get(`libre-deuda/personas?search=${search}`)
      const data = response.data
      return Array.isArray(data) ? data : [data]
    },
    enabled: false
  })

  useEffect(() => {
    if (search.length > 2 && !hasSelectedPersona) {
      const timeoutId = setTimeout(() => {
        refetch()
        setIsTyping(false)
      }, 1000)
      return () => clearTimeout(timeoutId)
    } else if (!hasSelectedPersona) {
      setShow(true)
    }
  }, [search, refetch, hasSelectedPersona])

  useEffect(() => {
    if (!resetFiltro) setSearch('')
  }, [resetFiltro])

  useEffect(() => {
    if (resetFiltro) {
      setSearch('')
      setShow(true)
      setHasSelectedPersona(false)
    }
  }, [resetFiltro])

  function selectPersona (per) {
    const identificacion = per.cuit || per.numero_documento
    const nombre = deleteDuplicateName(per.apellido, per.nombre)
    setSearchInput(`${identificacion} - ${nombre}`)
    setShow(false)
    setHasSelectedPersona(true)

    if (onSelectPersona) {
      onSelectPersona({
        persona_id: per.id,
        nombre: per.nombre,
        apellido: per.apellido,
        dni: per.numero_documento,
        cuit: per.cuit,
        email: per.email,
        telefono: per.telefono,
        fuente: (per.fuente || 'INTERNA').toUpperCase()
      })
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setSearchInput(value)
      setSearch(value)
      setIsTyping(true)
      setHasSelectedPersona(false)
    }
  }

  return (
    <>
      <div className='mb-4 relative'>
        <TextInput
          name='search'
          type='text'
          maxLength={11}
          placeholder='CUIL'
          value={searchInput}
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
                          <strong>{per.cuit || per.dni}</strong> -{' '}
                          {deleteDuplicateName(per.apellido, per.nombre)}
                        </button>
                      </li>
                    ))
                  )
                : (
                  <li className='hover:bg-slate-300 border-b-2 border-x px-2'>
                    <strong>No se encontró a la persona.</strong><br />
                    <p className='text-sm text-gray-500'>Por favor, acércate al Juzgado de Faltas Municipal, Ubicado en la calle Maipu Norte 550 de 07:00 AM hasta 16:00 PM ante cualquier duda.</p>
                  </li>
                  )}
          </ul>
        )}
      </div>
    </>
  )
}

export default SearchInfractor
