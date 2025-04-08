import React, { useState } from 'react'
import { Alert, Button, FileInput, Label, Select, TextInput, Modal } from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import { getActasFilter, getTipos, postPersonaDatos } from '@/services/multasService'
import DefaultNavbar from '../assets/layout/DefaultNavbar'
import DefaultFooter from '@/assets/layout/DefaultFooter'
import SearchInfractor from '@/assets/components/SearchInfractor'
import SearchVehiculo from '@/assets/components/SearchVehiculo'
import SearchMarca from '../assets/components/SearchMarca'
import Loading from '@/Loading'

export default function LibreDeudaPage () {
  const [modoConsulta, setModoConsulta] = useState('simple')
  const [errorMessage, setErrorMessage] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [shouldDisableFields, setShouldDisableFields] = useState(true)
  const [showDeclarationModal, setShowDeclarationModal] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [disableMarca, setDisableMarca] = useState(true)
  const [disableModelo, setDisableModelo] = useState(true)
  const [disableTipo, setDisableTipo] = useState(true)
  const [dniImage, setDniImage] = useState(null)
  const [cedulaImage, setCedulaImage] = useState(null)
  const [marbeteImage, setMarbeteImage] = useState(null)
  const [formData, setFormData] = useState({
    persona_id: '',
    vehiculo_id: '',
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
    queryKey: ['actas', filters, modoConsulta],
    queryFn: () => {
      if (modoConsulta === 'simple') {
        return getActasFilter({ persona_id: filters.persona_id })
      }
      return getActasFilter(filters)
    },
    enabled
  })

  const { data: tipos, isLoading: isLoadingTipos, error: errorTipos } = useQuery({
    queryKey: ['tipos'],
    queryFn: getTipos
  })

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      if (name === 'foto_dni') {
        setDniImage(files[0])
      } else if (name === 'foto_cedula') {
        setCedulaImage(files[0])
      } else if (name === 'foto_marbete') {
        setMarbeteImage(files[0])
      }
    } else {
      if (name === 'tipo') {
        const tipoSeleccionado = tipos?.find((t) => t.nombre === value)

        setFormData((prev) => ({
          ...prev,
          tipo: value,
          tipo_id: tipoSeleccionado?.id || ''
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value
        }))
      }
    }
  }

  const handlePersonaSelect = (persona) => {
    setFilters((prev) => ({ ...prev, persona_id: persona.persona_id }))

    setFormData((prev) => ({
      ...prev,
      persona_id: persona?.persona_id || persona?.id || '',
      nombre: persona?.nombre || '',
      apellido: persona?.apellido || '',
      email: persona.email || '',
      telefono: persona.telefono || ''
    }))

    setShouldDisableFields(persona.email !== null && persona.telefono !== null)
  }

  const handleVehiculoSelect = (vehiculo) => {
    setFilters((prev) => ({ ...prev, vehiculo_id: vehiculo?.vehiculo_id || vehiculo?.id }))

    setFormData((prev) => ({
      ...prev,
      vehiculo_id: vehiculo?.vehiculo_id || vehiculo?.id || '',
      dominio: vehiculo?.dominio || prev.dominio,
      marca: vehiculo?.marca?.nombre || prev.marca,
      marca_id: vehiculo?.marca?.id || prev.marca_id,
      modelo: vehiculo?.modelo || prev.modelo,
      tipo: vehiculo?.tipo?.nombre || prev.tipo,
      tipo_id: vehiculo?.tipo?.id || prev.tipo,
      numero_taxi_remis: vehiculo?.numero_taxi_remis || prev.numero_taxi_remis
    }))

    setDisableMarca(!!vehiculo?.marca?.id)
    setDisableModelo(vehiculo?.modelo !== '0' && !!vehiculo?.modelo)
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
          return nombre !== 'pagada' && nombre !== 'XXX'
        })
      })
      return filteredData.length > 0
    }
    return false
  }

  const handleCheckAndShowModal = () => {
    const formDataWithIDs = {
      ...formData,
      persona_id: filters.persona_id,
      vehiculo_id: filters.vehiculo_id
    }

    const { nombre, apellido, email, telefono, dominio } = formDataWithIDs

    const validationRules = {
      Nombre: nombre,
      Apellido: apellido,
      'Correo Electrónico': email,
      Teléfono: telefono,
      'Imagen del DNI': dniImage
    }

    if (modoConsulta === 'completo') {
      Object.assign(validationRules, {
        Dominio: dominio,
        Marca: validateMarca(),
        Modelo: validateModelo(),
        'Tipo de vehículo': validateTipo(),
        'Imagen de la Cédula': cedulaImage,
        'Imagen del Marbete': marbeteImage
      })
    }

    const missingFields = Object.entries(validationRules)
      .filter(([field, value]) => !value)
      .map(([field]) => `• ${field}`)

    if (missingFields.length > 0) {
      setErrorMessage(missingFields.join('\n'))
      return
    }

    setErrorMessage('')
    setShowDeclarationModal(true)
  }

  const handleSubmit = async () => {
    const dataToSend = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File || value instanceof Blob) {
          dataToSend.append(key, value)
        } else {
          dataToSend.append(key, value)
        }
      }
    })

    if (dniImage instanceof File) dataToSend.append('foto_dni', dniImage)
    if (cedulaImage instanceof File) dataToSend.append('foto_cedula', cedulaImage)
    if (marbeteImage instanceof File) dataToSend.append('foto_marbete', marbeteImage)

    try {
      const response = await postPersonaDatos(dataToSend)
      console.log('Datos enviados correctamente:', response)

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
    } catch (error) {
      setErrorMessage('Ocurrió un error al enviar los datos. Revisá los campos e intentá nuevamente.')
    }
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 dark:bg-slate-900'>

      <DefaultNavbar />

      <main className='flex flex-1 justify-center items-center px-4 py-4'>
        <div className='bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8 w-full max-w-xl text-center space-y-4 flex flex-col items-center'>

          <div className='bg-white p-6 shadow-xl rounded-lg w-full max-w-md transition-all duration-300 flex flex-col items-center'>

            <div className='w-full'>
              <Label htmlFor='modoConsulta' className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
                Modo de Consulta
              </Label>
              <Select
                id='modoConsulta'
                value={modoConsulta}
                onChange={(e) => setModoConsulta(e.target.value)}
                className='mb-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-200'
              >
                <option value='simple'>Consulta por Persona</option>
                <option value='completo'>Consulta por Persona y Vehículo</option>
              </Select>
            </div>

            {isValidated && showResults
              ? (
                <div className='text-center w-full'>
                  {isLoading
                    ? (
                      <Loading />
                      )
                    : !data?.data?.length
                        ? (
                          <Alert color='warning' className='mb-4'>
                            <p className='text-yellow-700 text-lg font-semibold'>
                              No se registran multas relacionadas entre el infractor y el vehículo. Ante cualquier duda, por favor dirigite al Juzgado de Faltas Municipal, ubicado en calle Maipú Norte 550, en el horario de 07:00 a 16:00.
                            </p>
                          </Alert>
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
                      setMarbeteImage(null)
                    }}
                  >
                    Consultar Nuevamente
                  </Button>
                </div>
                )
              : (
                <>
                  <h2 className='text-gray-700 dark:text-slate-400 mb-2 font-semibold text-2xl'>
                    Libre Deuda Online
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
                        <FileInput name='foto_dni' placeholder='DNI del Titular' type='file' className='mb-3' onChange={handleInputChange} accept='image/png, image/jpeg, image/jpg' />
                      </div>

                      {modoConsulta === 'completo' && (
                        <>
                          <h4 className='mb-2 font-medium text-gray-600'>Vehículo</h4>

                          <SearchVehiculo resetFiltro={!enabled} onSelectVehiculo={handleVehiculoSelect} />

                          {formData.marca === 'INDETERMINADO' || !formData.marca
                            ? (
                              <SearchMarca
                                resetFiltro={!enabled}
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
                            disabled={formData.modelo !== '0' && disableModelo}
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
                            <div>
                              <div>
                                <div className='mb-2 block'>
                                  <Label className='text-xl text-green-500' htmlFor='file-upload' value='Foto del Marbete' />
                                </div>
                                <FileInput name='foto_marbete' placeholder='Marbete del Vehículo' type='file' className='mb-3' onChange={handleInputChange} accept='image/png, image/jpeg, image/jpg' />
                              </div>

                              <TextInput
                                name='numero_taxi_remis'
                                placeholder='Número de Taxi/Remis/Colectivo'
                                className='mb-3'
                                value={formData.numero_taxi_remis || ''}
                                onChange={handleInputChange}
                              />
                            </div>
                          )}

                          <div>
                            <div className='mb-2 block'>
                              <Label className='text-xl text-green-500' htmlFor='file-upload' value='Foto de la Cédula del Vehículo' />
                            </div>
                            <FileInput name='foto_cedula' placeholder='Cedula del Vehículo' type='file' className='mb-3' onChange={handleInputChange} accept='image/png, image/jpeg, image/jpg' />
                          </div>
                        </>
                      )}
                    </div>

                    {errorMessage && (
                      <Alert color='failure' className='mb-4'>
                        <p className='font-semibold text-red-700'>Por favor, completa los siguientes campos faltantes:</p>
                        <pre className='whitespace-pre-wrap text-red-600'>{errorMessage}</pre>
                      </Alert>
                    )}

                    <Button
                      className='mt-4 w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white'
                      onClick={handleCheckAndShowModal}
                      disabled={isVerifying}
                    >
                      {isVerifying ? <Loading /> : 'Verificar Datos'}
                    </Button>

                  </div>
                </>
                )}

            <Modal
              show={showDeclarationModal}
              onClose={() => setShowDeclarationModal(false)}
              size='md'
              popup
            >
              <Modal.Header className='border-b border-gray-200 dark:border-gray-700' />
              <Modal.Body>
                <div className='text-center px-4 py-2'>
                  <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
                    Declaración Jurada
                  </h3>
                  <p className='mb-6 text-sm text-gray-700 dark:text-gray-300'>
                    Los datos que estás por enviar tienen carácter de declaración jurada.
                    Asegurate de que sean correctos antes de continuar.
                  </p>
                  <div className='flex justify-center gap-4'>
                    <Button
                      color='gray'
                      className='w-28 rounded-lg'
                      onClick={() => setShowDeclarationModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      color='success'
                      className='w-28 rounded-lg bg-green-600 hover:bg-green-700 text-white'
                      onClick={() => {
                        setShowDeclarationModal(false)
                        handleSubmit()
                      }}
                    >
                      Aceptar
                    </Button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </main>

      <DefaultFooter />
    </div>
  )
}
