import React, { useState } from 'react'
import { Alert, Button, FileInput, Label, Select, TextInput } from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import { getActasFilter, getTipos } from '@/services/multasService'
import DefaultNavbar from '../assets/layout/DefaultNavbar'
import DefaultFooter from '@/assets/layout/DefaultFooter'
import SearchInfractor from '@/assets/components/SearchInfractor'
import SearchVehiculo from '@/assets/components/SearchVehiculo'
import SearchMarca from '../assets/components/SearchMarca'
import Loading from '@/Loading'

export default function LibreDeudaPage () {
  const [errorMessage, setErrorMessage] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [shouldDisableFields, setShouldDisableFields] = useState(true)
  const [isValidated, setIsValidated] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [disableMarca, setDisableMarca] = useState(true)
  const [disableModelo, setDisableModelo] = useState(true)
  const [disableTipo, setDisableTipo] = useState(true)
  const [dniImage, setDniImage] = useState(null)
  const [cedulaImage, setCedulaImage] = useState(null)
  const [formData, setFormData] = useState({
    dominio: '',
    marca: '',
    marca_id: '',
    modelo: '',
    tipo: '',
    tipo_id: '',
    numero_taxi_remis: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  })

  const validateMarca = () => formData.marca && formData.marca.trim().length > 0
  const validateModelo = () => formData.modelo && formData.modelo.trim().length > 0
  const validateTipo = () => formData.tipo && formData.tipo.trim().length > 0

  const [filters, setFilters] = useState({
    persona_id: '',
    vehiculo_id: ''
  })

  const { data, isLoading } = useQuery({
    queryKey: ['actas', filters],
    queryFn: () => getActasFilter(filters),
    enabled
  })

  const { data: tipos, isLoading: isLoadingTipos, error: errorTipos } = useQuery({
    queryKey: ['tipos'],
    queryFn: getTipos
  })

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      if (name === 'dni') {
        setDniImage(files[0])
      } else if (name === 'cedula') {
        setCedulaImage(files[0])
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handlePersonaSelect = (persona) => {
    setFilters((prev) => ({ ...prev, persona_id: persona.persona_id }))

    setFormData((prev) => ({
      ...prev,
      nombre: persona?.nombre || '',
      apellido: persona?.apellido || '',
      email: persona.email || '',
      telefono: persona.telefono || ''
    }))

    setShouldDisableFields(persona.email !== null && persona.telefono !== null)
  }

  const handleVehiculoSelect = (vehiculo) => {
    setFilters((prev) => ({ ...prev, vehiculo_id: vehiculo.id }))

    setFormData((prev) => ({
      ...prev,
      dominio: vehiculo?.dominio || prev.dominio,
      marca: vehiculo?.marca?.nombre || prev.marca,
      marca_id: vehiculo?.marca?.id || prev.marca_id,
      modelo: vehiculo?.modelo || prev.modelo,
      tipo: vehiculo?.tipo?.nombre || prev.tipo,
      tipo_id: vehiculo?.tipo?.id || prev.tipo,
      numero_taxi_remis: vehiculo?.numero_taxi_remis || prev.numero_taxi_remis
    }))

    setDisableMarca(!!vehiculo?.marca?.id)
    setDisableModelo(!!vehiculo?.modelo)
    setDisableTipo(!!vehiculo?.tipo?.id)
  }

  const hasUnpaidOrPending = () => {
    if (isCheckingStatus) {
      return <Loading />
    }

    if (Array.isArray(data?.data)) {
      const filteredData = data.data.filter((multa) => {
        return multa?.estados?.some((estado) => {
          const nombre = estado?.nombre?.toLowerCase()
          return nombre !== 'pagada' && nombre !== 'terminada'
        })
      })
      return filteredData.length > 0
    }
    return false
  }

  const handleSubmit = () => {
    const { nombre, apellido, email, telefono, dominio } = formData

    console.log('Datos enviados para verificar:', {
      formData,
      dniImage,
      cedulaImage
    })

    const validationRules = {
      Nombre: nombre,
      Apellido: apellido,
      'Correo Electrónico': email,
      Teléfono: telefono,
      'Imagen del DNI': dniImage,
      Dominio: dominio,
      Marca: validateMarca(),
      Modelo: validateModelo(),
      'Tipo de vehículo': validateTipo(),
      'Imagen de la Cédula': cedulaImage
    }

    const missingFields = Object.entries(validationRules)
      .filter(([field, value]) => !value)
      .map(([field]) => `• ${field}`)

    if (missingFields.length > 0) {
      setErrorMessage(missingFields.join('\n'))
      return
    }

    setErrorMessage('')
    setEnabled(false)
    setIsCheckingStatus(true)
    setIsVerifying(true)

    setTimeout(() => {
      setEnabled(true)
      setIsValidated(true)
      setShowResults(true)
      setIsCheckingStatus(false)
      setIsVerifying(false)
    }, 0)
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 dark:bg-slate-900'>

      <DefaultNavbar />

      <main className='flex flex-1 justify-center items-center px-4 py-4'>
        <div className='bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8 w-full max-w-xl text-center space-y-4 flex flex-col items-center'>

          <div className='bg-white p-6 shadow-xl rounded-lg w-full max-w-md transition-all duration-300 flex flex-col items-center'>
            {isValidated && showResults
              ? (
                <div className='text-center w-full'>
                  {isLoading
                    ? (
                      <Loading />
                      )
                    : hasUnpaidOrPending()
                      ? (
                        <Alert color='failure' className='mb-4'>
                          <p className='text-red-600 text-lg font-semibold'>
                            No puedes generar tu libre deuda porque tienes multas pendientes.
                            {data?.data?.[0]?.juzgado_id === 2
                              ? ' Por favor, acércate al juzgado de faltas N°2. '
                              : ' Por favor, acércate al juzgado de faltas N°1. '}
                            Ubicado en la calle Maipu Norte 550 de 07:00 AM hasta 16:00 PM.
                          </p>
                        </Alert>
                        )
                      : (
                        <Button className='mt-6 w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out text-white text-lg'>
                          Generar Libre Deuda
                        </Button>
                        )}
                  <Button
                    className='mt-4 w-full py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white'
                    onClick={() => {
                      setShowResults(false)
                      setIsValidated(false)
                      setShouldDisableFields(true)
                      setEnabled(false)
                      setFormData({
                        nombre: '',
                        apellido: '',
                        email: '',
                        telefono: '',
                        dominio: '',
                        marca: '',
                        marca_id: '',
                        modelo: '',
                        tipo: '',
                        tipo_id: '',
                        numero_taxi_remis: ''
                      })
                      setDniImage(null)
                      setCedulaImage(null)
                    }}
                  >
                    Consultar Nuevamente
                  </Button>
                </div>
                )
              : (
                <>
                  <h2 className='text-gray-700 dark:text-slate-400 mb-2 font-semibold text-2xl'>
                    Ingresar Datos
                  </h2>

                  <div className='w-full'>
                    <p className='text-black mb-4'>
                      Si el email o teléfono no está completado al buscar, por favor, completalo para verificarlo correctamente.
                    </p>

                    <div>
                      <h4 className='mb-2 font-medium text-gray-600'>Titular</h4>

                      <SearchInfractor resetFiltro={!enabled} onSelectPersona={handlePersonaSelect} />

                      <TextInput
                        name='nombre'
                        placeholder='Nombre'
                        className={`mb-3 ${formData.nombre ? 'text-blue-500' : ''}`}
                        value={formData.nombre || ''}
                        onChange={handleInputChange}
                        disabled
                      />

                      <TextInput
                        name='apellido'
                        placeholder='Apellido'
                        className={`mb-3 ${formData.apellido ? 'text-blue-500' : ''}`}
                        value={formData.apellido || ''}
                        onChange={handleInputChange}
                        disabled
                      />

                      <TextInput
                        name='email'
                        placeholder='Correo Electrónico'
                        type='email'
                        className={`mb-3 ${formData.email ? 'text-blue-500' : ''}`}
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        disabled={shouldDisableFields}
                      />

                      <TextInput
                        name='telefono'
                        placeholder='Teléfono'
                        type='tel'
                        className={`mb-3 ${formData.telefono ? 'text-blue-500' : ''}`}
                        value={formData.telefono || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          handleInputChange({ target: { name: 'telefono', value } })
                        }}
                        disabled={shouldDisableFields}
                      />

                      <div>
                        <div className='mb-2 block'>
                          <Label className='text-xl text-green-500' htmlFor='file-upload' value='Foto del frente del DNI titular' />
                        </div>
                        <FileInput name='dni' placeholder='DNI del Titular' type='file' className='mb-3' onChange={handleInputChange} accept='image/png, image/jpeg, image/jpg' />
                      </div>

                      <h4 className='mb-2 font-medium text-gray-600'>Vehículo</h4>

                      <SearchVehiculo resetFiltro={!enabled} onSelectVehiculo={handleVehiculoSelect} />

                      {formData.marca === 'INDETERMINADO' || !formData.marca
                        ? (
                          <SearchMarca
                            resetFiltro={!enabled}
                            disabled={!enabled || shouldDisableFields}
                            onSelectMarca={(marca) => {
                              setFormData((prev) => ({
                                ...prev,
                                marca: marca?.nombre || '',
                                marca_id: marca?.id || ''
                              }))
                            }}
                          />
                          )
                        : (
                          <TextInput
                            name='marca'
                            placeholder='Marca del Vehículo'
                            className='mb-3'
                            value={formData.marca || ''}
                            onChange={handleInputChange}
                            disabled={disableMarca}
                          />
                          )}

                      <input type='hidden' name='marca_id' value={formData.marca_id || ''} disabled={shouldDisableFields} />

                      <TextInput
                        name='modelo'
                        placeholder='Modelo del Vehículo'
                        className='mb-3'
                        value={formData.modelo || ''}
                        onChange={handleInputChange}
                        disabled={disableModelo}
                      />

                      <Select
                        name='tipo'
                        className='mb-2'
                        value={formData.tipo || ''}
                        onChange={handleInputChange}
                        disabled={disableTipo}
                      >
                        <option value=''>Seleccione el Tipo de Vehículo</option>
                        {isLoadingTipos
                          ? (
                            <option>Cargando...</option>
                            )
                          : errorTipos
                            ? (
                              <option>Error al cargar</option>
                              )
                            : (
                                tipos.map((tipo) => (
                                  <option key={tipo.id} value={tipo.nombre}>
                                    {tipo.nombre}
                                  </option>
                                ))
                              )}
                      </Select>

                      {formData.tipo === 'SERVICIOS PúBLICOS' && (
                        <TextInput
                          name='numero_taxi_remis'
                          placeholder='Número de Taxi/Remis'
                          className='mb-3'
                          value={formData.numero_taxi_remis || ''}
                          onChange={handleInputChange}
                        />
                      )}

                      <div>
                        <div className='mb-2 block'>
                          <Label className='text-xl text-green-500' htmlFor='file-upload' value='Foto de la Cédula del Vehículo' />
                        </div>
                        <FileInput name='cedula' placeholder='Cedula del Vehículo' type='file' className='mb-3' onChange={handleInputChange} accept='image/png, image/jpeg, image/jpg' />
                      </div>
                    </div>

                    {errorMessage && (
                      <Alert color='failure' className='mb-4'>
                        <p className='font-semibold text-red-700'>Por favor, completa los siguientes campos faltantes:</p>
                        <pre className='whitespace-pre-wrap text-red-600'>{errorMessage}</pre>
                      </Alert>
                    )}

                    <Button
                      className='mt-4 w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white'
                      onClick={handleSubmit}
                      disabled={isVerifying}
                    >
                      {isVerifying ? <Loading /> : 'Verificar Datos'}
                    </Button>

                  </div>
                </>
                )}
          </div>
        </div>
      </main>

      <DefaultFooter />
    </div>
  )
}
