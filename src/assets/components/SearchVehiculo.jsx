/* eslint-disable camelcase */
import { useQuery } from '@tanstack/react-query'
import { Modal, Button, Label, TextInput, Select } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { deleteDuplicateName } from '../util/deleteDuplicateName'
import juzgadoApi from '@/api/juzgadoApi'
import SearchInfractor from '@/assets/components/SearchInfractor'
import SearchMarca from '@/assets/components/SearchMarca'
import { getTipos } from '@/services/multasService'

function SearchVehiculo ({ resetFiltro, onSelectVehiculo }) {
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [tipoSeleccionado, setTipoSeleccionado] = useState('')
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    titular_id: null,
    dominio: '',
    marca_id: null,
    modelo: '',
    tipo_id: '',
    numero_chasis: '',
    numero_motor: '',
    numero_taxi_remis: ''
  })

  const { data: vehiculos = [], isFetching, refetch } = useQuery({
    queryKey: ['buscarVehiculo', search],
    queryFn: async () => {
      if (search.length <= 2) return []
      const response = await juzgadoApi.get(`libre-deuda/vehiculos/buscar/${search}`)
      return response.data.data
    },
    enabled: false
  })

  const { data: tipos, isLoading: isLoadingTipos, error: errorTipos } = useQuery({
    queryKey: ['tipos'],
    queryFn: getTipos
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

  useEffect(() => {
    if (resetFiltro) {
      setSearch('')
      setShow(true)
    }
  }, [resetFiltro])

  function selectVehiculo (veh) {
    const titularNombre = veh.titular ? deleteDuplicateName(veh.titular.apellido, veh.titular.nombre) : 'SIN TITULAR'
    setSearch(`${veh.dominio} - ${titularNombre}`)
    setShow(false)

    if (onSelectVehiculo) {
      onSelectVehiculo({
        vehiculo_id: veh?.id,
        id: veh?.id,
        dominio: veh?.dominio,
        titular: veh?.titular,
        marca: veh?.marca || '',
        marca_id: veh?.marca?.id || '',
        modelo: ['0', '1', '2', '3', '4'].includes(veh?.modelo) ? '' : veh?.modelo || '',
        tipo: veh?.tipo || '',
        tipo_id: veh?.tipo?.id || '',
        numero_taxi_remis: veh?.numero_taxi_remis || ''
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
          maxLength={7}
          style={{ textTransform: 'uppercase' }}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsTyping(true)
          }}
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
          <ul className='w-full max-h-56 overflow-y-auto absolute z-10 bg-white shadow-md'>
            {isTyping || isFetching
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
                    <button
                      type='button'
                      className='w-full text-start py-2'
                      onClick={() => setShowModal(true)}
                    >
                      <strong>No se encontró el vehículo.</strong><br />
                      <span className='text-sm text-gray-500'>
                        La patente no existe en el sistema, haz click aquí para registrar tu vehículo.
                      </span>
                    </button>
                  </li>
                  )}
          </ul>
        )}

        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header>Crear nuevo vehículo</Modal.Header>
          <Modal.Body>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='persona_id' value='Titular' /> <strong className='obligatorio'>(*)</strong>
                <SearchInfractor onSelectPersona={(persona) => setNuevoVehiculo({ ...nuevoVehiculo, titular_id: persona.persona_id })} />
              </div>
              <div>
                <Label htmlFor='dominio' value='Dominio' /> <strong className='obligatorio'>(*)</strong>
                <TextInput
                  id='dominio'
                  placeholder='Ingrese la patente del vehículo'
                  className='mb-4'
                  type='text'
                  maxLength={7}
                  value={nuevoVehiculo.dominio}
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) =>
                    setNuevoVehiculo({ ...nuevoVehiculo, dominio: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor='modelo' value='Modelo' />
                <TextInput
                  id='modelo'
                  placeholder='Ingrese el modelo del vehículo'
                  className='mb-4'
                  type='text'
                  value={nuevoVehiculo.modelo}
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) =>
                    setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor='marca_id' value='Marca' />
                <SearchMarca onSelectMarca={(marca) => setNuevoVehiculo({ ...nuevoVehiculo, marca_id: marca?.id })} />
              </div>
              <div>
                <Label htmlFor='numero_chasis' value='Número de Chasis' />
                <TextInput
                  id='numero_chasis'
                  placeholder='Ingrese el número de chasis del vehículo'
                  className='mb-4'
                  type='text'
                  value={nuevoVehiculo.numero_chasis}
                  onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, numero_chasis: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor='numero_motor' value='Número de Motor' />
                <TextInput
                  id='numero_motor'
                  placeholder='Ingrese el número del motor del vehículo'
                  className='mb-4'
                  type='text'
                  value={nuevoVehiculo.numero_motor}
                  onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, numero_motor: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor='tipo_id' value='Tipo de Vehículo' />
                <Select
                  name='tipo_id'
                  value={tipoSeleccionado}
                  className='mb-4'
                  onChange={(e) => {
                    const value = e.target.value
                    setTipoSeleccionado(value)
                    setNuevoVehiculo({ ...nuevoVehiculo, tipo_id: value })
                  }}
                >
                  <option value='' className='text-gray-400'>Seleccione el Tipo de Vehículo</option>
                  {isLoadingTipos
                    ? <option>Cargando...</option>
                    : errorTipos
                      ? <option>Error al cargar</option>
                      : tipos.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </option>
                      ))}
                </Select>
              </div>
              <div>
                {tipoSeleccionado === '50067' && (
                  <div>
                    <Label htmlFor='numero_taxi_remis' value='Número de Taxi/Remis/Colectivo' />
                    <TextInput
                      name='numero_taxi_remis'
                      placeholder='Número de Taxi/Remis/Colectivo'
                      value={nuevoVehiculo.numero_taxi_remis || ''}
                      onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, numero_taxi_remis: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className='flex justify-end'>
            <Button
              onClick={async () => {
                try {
                  const response = await juzgadoApi.post('libre-deuda/vehiculos', nuevoVehiculo)
                  const vehiculoGuardado = response.data?.data

                  toast.success('Vehículo guardado correctamente')

                  selectVehiculo(vehiculoGuardado)
                  setNuevoVehiculo({
                    titular_id: null,
                    dominio: '',
                    marca_id: null,
                    modelo: '',
                    tipo_id: '',
                    numero_chasis: '',
                    numero_motor: '',
                    numero_taxi_remis: ''
                  })
                  setTipoSeleccionado('')
                  setShowModal(false)
                } catch (error) {
                  console.error('Error al guardar el vehículo:', error)
                  toast.error('Ocurrió un error al guardar el vehículo, la patente ya existe')
                }
              }}
            >
              Guardar
            </Button>
            <Button color='gray' onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  )
}

export default SearchVehiculo
