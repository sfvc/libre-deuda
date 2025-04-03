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
  const [enabled] = useState(false)
  const [shouldDisableFields] = useState(true)
  const [disableMarca] = useState(true)
  const [disableModelo] = useState(true)
  const [disableTipo] = useState(true)
  const [files, setFiles] = useState({ dni: null, cedula: null })
  const [status, setStatus] = useState({
    enabled: false,
    isCheckingStatus: false,
    isValidated: false,
    showResults: false,
    isVerifying: false
  })
  const [, setDisabledFields] = useState({
    shouldDisableFields: true,
    disableMarca: true,
    disableModelo: true,
    disableTipo: true
  })
  const validateFields = () => ({
    Nombre: formData.nombre,
    Apellido: formData.apellido,
    'Correo Electrónico': formData.email,
    Teléfono: formData.telefono,
    'Imagen del DNI': files.dni,
    Dominio: formData.dominio,
    Marca: formData.marca?.trim(),
    Modelo: formData.modelo?.trim(),
    'Tipo de vehículo': formData.tipo?.trim(),
    'Imagen de la Cédula': files.cedula
  })
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

  const [filters, setFilters] = useState({
    persona_id: '',
    vehiculo_id: ''
  })

  const { data, isLoading } = useQuery({
    queryKey: ['actas', filters],
    queryFn: () => getActasFilter(filters),
    enabled: status.enabled
  })

  const { data: tipos, isLoading: isLoadingTipos, error: errorTipos } = useQuery({
    queryKey: ['tipos'],
    queryFn: getTipos
  })

  const handleInputChange = (e) => {
    const { name, value, type, files: uploadedFiles } = e.target

    if (type === 'file') {
      setFiles((prev) => ({ ...prev, [name]: uploadedFiles[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
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
    setDisabledFields((prev) => ({ ...prev, shouldDisableFields: !!persona.email && !!persona.telefono }))
  }

  const handleVehiculoSelect = (vehiculo) => {
    setFilters((prev) => ({ ...prev, vehiculo_id: vehiculo.id }))

    setFormData((prev) => ({
      ...prev,
      dominio: vehiculo?.dominio || '',
      marca: vehiculo?.marca?.nombre || '',
      marca_id: vehiculo?.marca?.id || '',
      modelo: vehiculo?.modelo || '',
      tipo: vehiculo?.tipo?.nombre || '',
      tipo_id: vehiculo?.tipo?.id || '',
      numero_taxi_remis: vehiculo?.numero_taxi_remis || ''
    }))

    setDisabledFields({
      disableMarca: !!vehiculo?.marca?.id,
      disableModelo: !!vehiculo?.modelo,
      disableTipo: !!vehiculo?.tipo?.id
    })
  }

  const hasUnpaidOrPending = () => {
    if (status.isCheckingStatus) return <Loading />

    if (Array.isArray(data?.data)) {
      return data.data.some((multa) =>
        multa?.estados?.some((estado) => !['pagada', 'terminada'].includes(estado?.nombre?.toLowerCase()))
      )
    }
    return false
  }

  const handleSubmit = () => {
    console.log('Datos enviados para verificar:', {
      formData,
      files
    })

    const missingFields = Object.entries(validateFields())
      .filter(([_, value]) => !value)
      .map(([field]) => `• ${field}`)

    if (missingFields.length) {
      setErrorMessage(missingFields.join('\n'))
      return
    }

    setErrorMessage('')
    setStatus({ enabled: false, isCheckingStatus: true, isValidated: false, showResults: false, isVerifying: true })

    setTimeout(() => {
      setStatus({ enabled: true, isValidated: true, showResults: true, isCheckingStatus: false, isVerifying: false })
    }, 0)
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 dark:bg-slate-900'>

      <DefaultNavbar />

      <main className='flex flex-1 justify-center items-center px-4 py-4'>
        <div className='bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8 w-full max-w-xl text-center space-y-4 flex flex-col items-center'>

          <div className='bg-white p-6 shadow-xl rounded-lg w-full max-w-md transition-all duration-300 flex flex-col items-center'>
            {status.isValidated && status.showResults
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
                      setStatus({ isValidated: false, showResults: false, enabled: false })
                      setDisabledFields({ shouldDisableFields: true, disableMarca: true, disableModelo: true, disableTipo: true })
                      setFormData({ nombre: '', apellido: '', email: '', telefono: '', dominio: '', marca: '', marca_id: '', modelo: '', tipo: '', tipo_id: '', numero_taxi_remis: '' })
                      setFiles({ dni: null, cedula: null })
                    }}
                  >
                    Consultar Nuevamente
                  </Button>
                </div>
                )
              : (
                <>
                  <h2 className='rainbow__text mb-2 font-semibold text-2xl'>
                    Libre Deuda Online
                  </h2>

                  <div className='w-full'>
                    <p className='text-black mb-4'>
                      Si el email o teléfono no está completado al buscar, por favor, completalo para verificarlo correctamente.
                    </p>

                    <div>
                      <h4 className='mb-2 font-medium text-gray-600'>Titular</h4>

                      <SearchInfractor resetFiltro={!status.enabled} onSelectPersona={handlePersonaSelect} />

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

                      <SearchVehiculo resetFiltro={!status.enabled} onSelectVehiculo={handleVehiculoSelect} />

                      {formData.marca === 'INDETERMINADO' || !formData.marca
                        ? (
                          <SearchMarca
                            resetFiltro={!enabled}
                            disabled={disableMarca}
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
                        placeholder='Ingrese el tipo de vehículo'
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
                          placeholder='Número de Taxi/Remis/Colectivo'
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

                    <Button className='mt-4 w-full bg-green-500 hover:bg-green-600 text-white' onClick={handleSubmit} disabled={status.isVerifying}>
                      {status.isVerifying ? <Loading /> : 'Verificar Datos'}
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
