import React, { useState } from 'react'
import { Alert, Button, FileInput, Label, Select, TextInput } from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import { getActasFilter } from '@/services/multasService'
import { getTipos } from '../services/multasService'
import DefaultNavbar from '../assets/layout/DefaultNavbar'
import DefaultFooter from '@/assets/layout/DefaultFooter'
import SearchInfractor from '@/assets/components/SearchInfractor'
import SearchVehiculo from '@/assets/components/SearchVehiculo'
import SearchMarca from '../assets/components/SearchMarca'
import ReCAPTCHA from 'react-google-recaptcha'
import Loading from '@/Loading'

export default function LibreDeudaPage () {
  const [formType, setFormType] = useState('persona')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [shouldDisableFields, setShouldDisableFields] = useState(true)
  const [isValidated, setIsValidated] = useState(false)
  const [, setHasSearched] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [formData, setFormData] = useState({
    dominio: '',
    marca: '',
    marca_id: '',
    modelo: '',
    tipo: '',
    color: '',
    numero_chasis: '',
    numero_motor: '',
    numero_taxi_remis: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  })
  const isFormComplete = () => {
    if (formType === 'persona') {
      return (
        formData.nombre &&
        formData.apellido &&
        formData.email &&
        formData.telefono &&
        captchaVerified
      )
    } else if (formType === 'vehiculo') {
      return (
        formData.dominio &&
        formData.marca &&
        formData.modelo &&
        formData.tipo &&
        formData.nombre &&
        formData.apellido &&
        formData.email &&
        formData.telefono &&
        captchaVerified
      )
    }
    return false
  }
  const [filters, setFilters] = useState({
    persona_id: '',
    numero_acta: '',
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

  const handleCaptchaChange = (value) => {
    setCaptchaVerified(!!value)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
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
      dominio: vehiculo?.dominio || '',
      marca: vehiculo?.marca?.nombre || '',
      marca_id: vehiculo?.marca?.id || '',
      modelo: vehiculo?.modelo || '',
      tipo: vehiculo?.tipo?.nombre || '',
      color: vehiculo?.color?.nombre || '',
      numero_chasis: vehiculo?.numero_chasis || '',
      numero_motor: vehiculo?.numero_motor || '',
      numero_taxi_remis: vehiculo?.numero_taxi_remis || '',
      nombre: vehiculo?.titular ? vehiculo.titular.nombre || '' : '',
      apellido: vehiculo?.titular ? vehiculo.titular.apellido || '' : '',
      email: vehiculo?.titular ? vehiculo.titular.email || '' : '',
      telefono: vehiculo?.titular ? vehiculo.titular.telefono || '' : ''
    }))

    setShouldDisableFields(
      vehiculo.titular &&
      (vehiculo.titular.nombre && vehiculo.titular.apellido && vehiculo.titular.email && vehiculo.titular.telefono && !!vehiculo?.marca && !!vehiculo?.modelo && !!vehiculo?.tipo)
    )
  }

  const hasUnpaidOrPending = () => {
    if (isLoading) {
      return <Loading />
    }

    if (Array.isArray(data?.data)) {
      const filteredData = data.data.filter((multa) => {
        const estado = multa?.estados?.[0]?.nombre?.toLowerCase()
        return estado !== 'pagada' && estado !== 'terminada'
      })
      return filteredData.length > 0
    }
    return false
  }

  const handleSubmit = () => {
    setEnabled(false)
    setTimeout(() => {
      setEnabled(true)
      setHasSearched(true)
      setIsValidated(true)
    }, 0)
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 dark:bg-slate-900'>

      <DefaultNavbar />

      <main className='flex flex-1 justify-center items-center px-4 py-4'>
        <div className='bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8 w-full max-w-xl text-center space-y-4 flex flex-col items-center'>
          <h2 className='text-gray-700 dark:text-slate-400 mb-2 font-semibold text-2xl'>
            Ingresar Datos
          </h2>

          <div className='flex gap-4 mb-6'>
            <Button
              onClick={() => setFormType('persona')}
              className={`px-6 py-2 rounded-lg transition ${formType === 'persona' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-black hover:text-white'
                }`}
            >
              Persona
            </Button>
            <Button
              onClick={() => setFormType('vehiculo')}
              className={`px-6 py-2 rounded-lg transition ${formType === 'vehiculo' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-black hover:text-white'
                }`}
            >
              Vehículo
            </Button>
          </div>

          {formType && (
            <div className='bg-white p-6 shadow-xl rounded-lg w-full max-w-md transition-all duration-300 flex flex-col items-center'>
              <h3 className='text-xl font-semibold text-gray-700 mb-4'>
                {formType === 'persona' ? 'Datos de la Persona' : 'Datos del Vehículo'}
              </h3>
              <p className='text-black mb-4'>
                Si el email o teléfono no está completado al buscar, por favor, completalo para validarlo correctamente.
              </p>

              <div className='w-full'>
                {formType === 'persona'
                  ? (
                    <>
                      <SearchInfractor
                        resetFiltro={!enabled}
                        onSelectPersona={handlePersonaSelect}
                      />

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
                          <Label className='text-xl text-gray-500' htmlFor='file-upload' value='Foto del DNI del Titular' />
                        </div>
                        <FileInput name='archivo_dni' placeholder='DNI del Titular' type='file' className='mb-3' onChange={handleInputChange} accept='image/png, image/jpeg, image/jpg' />
                      </div>
                    </>
                    )
                  : (
                    <>
                      <SearchVehiculo
                        resetFiltro={!enabled}
                        onSelectVehiculo={handleVehiculoSelect}
                      />

                      {formData.marca
                        ? (
                          <TextInput
                            name='marca'
                            placeholder='Marca del Vehículo'
                            className='mb-3'
                            value={formData.marca || ''}
                            onChange={handleInputChange}
                          />
                          )
                        : (
                          <SearchMarca
                            resetFiltro={!enabled}
                            disabled={shouldDisableFields}
                            onSelectMarca={(marca) => {
                              setFormData((prev) => ({
                                ...prev,
                                marca: marca?.nombre || '',
                                marca_id: marca?.id || ''
                              }))
                            }}
                          />
                          )}

                      <input type='hidden' name='marca_id' value={formData.marca_id || ''} disabled={shouldDisableFields} />

                      <TextInput
                        name='modelo'
                        placeholder='Modelo del Vehículo'
                        className='mb-3'
                        value={formData.modelo || ''}
                        onChange={handleInputChange}
                        disabled={shouldDisableFields}
                      />

                      <Select
                        name='tipo'
                        className='mb-3'
                        value={formData.tipo || ''}
                        onChange={handleInputChange}
                        disabled={shouldDisableFields}
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

                      {/* Mostrar input de taxi si el tipo es "SERVICIOS PÚBLICOS" */}
                      {formData.tipo === 'SERVICIOS PúBLICOS' && (
                        <TextInput
                          name='numero_taxi_remis'
                          placeholder='Número de Taxi/Remis'
                          className='mb-3'
                          value={formData.numero_taxi_remis || ''}
                          onChange={handleInputChange}
                        />
                      )}

                      {/* Titular del Vehículo */}

                      <h4 className='mt-4 font-medium text-gray-600'>Titular</h4>

                      <TextInput
                        name='nombre'
                        placeholder='Nombre'
                        className={`mb-3 ${formData.nombre ? 'text-blue-500' : ''}`}
                        value={formData.nombre || ''}
                        onChange={handleInputChange}
                        disabled={shouldDisableFields}
                      />

                      <TextInput
                        name='apellido'
                        placeholder='Apellido'
                        className={`mb-3 ${formData.apellido ? 'text-blue-500' : ''}`}
                        value={formData.apellido || ''}
                        onChange={handleInputChange}
                        disabled={shouldDisableFields}
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
                          <Label className='text-xl text-gray-500' htmlFor='file-upload' value='Foto de la Cédula del Vehículo' />
                        </div>
                        <FileInput name='cedula' placeholder='Cedula del Vehículo' type='file' className='mb-3' onChange={handleInputChange} accept='image/png, image/jpeg, image/jpg' />
                      </div>
                    </>
                    )}
              </div>

              <div className='mt-4 flex justify-center'>
                <ReCAPTCHA sitekey='6LeAwp8qAAAAABhAYn5FDw_uIzk8bskuHIP_sBIw' onChange={handleCaptchaChange} />
              </div>

              {isFormComplete() && (
                <Button
                  className='mt-4 w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white'
                  onClick={handleSubmit}
                >
                  Verificar Datos
                </Button>
              )}

              {isValidated && (
                <div className='absolute inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50 p-6'>
                  <div className='bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-xl text-center'>
                    {hasUnpaidOrPending()
                      ? (
                        <Alert color='failure' className='mb-4'>
                          <p className='text-red-600 text-lg font-semibold'>
                            No puedes sacar el libre deuda porque tienes multas pendientes. Por favor, acércate al juzgado de faltas municipal en la calle Maipu Norte 550.
                          </p>
                        </Alert>
                        )
                      : (
                        <Button className='mt-6 w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out text-white text-lg'>
                          Generar Libre Deuda
                        </Button>
                        )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <DefaultFooter />
    </div>
  )
}
