import React, { useState } from 'react'
import { Button, FileInput, Label, TextInput } from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import { getActasFilter } from '@/services/multasService'
import DefaultNavbar from '../assets/layout/DefaultNavbar'
import DefaultFooter from '@/assets/layout/DefaultFooter'
import ReCAPTCHA from 'react-google-recaptcha'
import Loading from '@/Loading'
import SearchInfractor from '@/assets/components/SearchInfractor'
import SearchVehiculo from '@/assets/components/SearchVehiculo'

export default function LibreDeudaPage () {
  const [formType, setFormType] = useState('persona')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [formData, setFormData] = useState({})
  const [enabled, setEnabled] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
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

  const handleSubmit = () => {
    setEnabled(false)
    setTimeout(() => {
      setEnabled(true)
      setHasSearched(true)
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

              <div className='w-full'>
                {formType === 'persona'
                  ? (
                    <>
                      <SearchInfractor
                        resetFiltro={!enabled}
                        onSelectPersona={(persona) => {
                          setFilters((prev) => ({ ...prev, persona_id: persona.persona_id }))
                          setFormData({
                            nombre: persona?.nombre || '',
                            apellido: persona?.apellido || '',
                            email: persona.email || '',
                            telefono: persona.telefono || ''
                          })
                        }}
                      />

                      <TextInput
                        name='nombre'
                        placeholder='Nombre'
                        className='mb-3'
                        value={formData.nombre || ''}
                        onChange={handleInputChange}
                      />

                      <TextInput
                        name='apellido'
                        placeholder='Apellido'
                        className='mb-3'
                        value={formData.apellido || ''}
                        onChange={handleInputChange}
                      />

                      <TextInput
                        name='correo'
                        placeholder='Correo Electrónico'
                        type='email'
                        className='mb-3'
                        value={formData.email || ''}
                        onChange={handleInputChange}
                      />

                      <TextInput
                        name='telefono'
                        placeholder='Teléfono'
                        type='tel'
                        className='mb-3'
                        value={formData.telefono || ''}
                        onChange={handleInputChange}
                      />

                      <div>
                        <div className='mb-2 block'>
                          <Label className='text-xl text-gray-500' htmlFor='file-upload' value='Foto del DNI del Titular' />
                        </div>
                        <FileInput name='archivo_dni' placeholder='DNI del Titular' type='file' className='mb-3' onChange={handleInputChange} />
                      </div>

                    </>
                    )
                  : (
                    <>
                      <SearchVehiculo
                        resetFiltro={!enabled}
                        onSelectVehiculo={(vehiculo) => {
                          setFilters((prev) => ({ ...prev, vehiculo_id: vehiculo.vehiculo_id }))
                          const titular = vehiculo.titular || {}

                          setFormData({
                            ...formData,
                            dominio: vehiculo.dominio || '',
                            marca: vehiculo.marca || '',
                            modelo: vehiculo.modelo || '',
                            tipo: vehiculo.tipo || '',
                            color: vehiculo.color || '',
                            numero_chasis: vehiculo.numero_chasis || '',
                            numero_motor: vehiculo.numero_motor || '',
                            numero_taxi_remis: vehiculo.numero_taxi_remis || '',

                            // Datos del titular extraídos del vehículo
                            nombre: titular.nombre || '',
                            apellido: titular.apellido || '',
                            correo: titular.email || '',
                            telefono: titular.telefono || ''
                          })
                        }}
                      />

                      <TextInput
                        name='marca'
                        placeholder='Marca'
                        className='mb-3'
                        value={formData.marca || ''}
                        onChange={handleInputChange}
                      />

                      <TextInput
                        name='modelo'
                        placeholder='Modelo'
                        className='mb-3'
                        value={formData.modelo || ''}
                        onChange={handleInputChange}
                      />

                      <TextInput
                        name='tipo'
                        placeholder='Tipo'
                        className='mb-3'
                        value={formData.tipo || ''}
                        readOnly
                      />

                      {/* Mostrar campo "Número de Licencia" solo si el tipo es "SERVICIOS PÚBLICOS" */}
                      {formData.tipo === 'SERVICIOS PúBLICOS' && (
                        <TextInput
                          name='numero_licencia'
                          placeholder='Número de Licencia'
                          className='mb-3'
                          value={formData.numero_licencia || ''}
                          onChange={handleInputChange}
                        />
                      )}

                      {/* Titular del Vehículo */}

                      <h4 className='mt-4 font-medium text-gray-600'>Titular</h4>

                      <TextInput
                        name='nombre'
                        placeholder='Nombre'
                        className='mb-3'
                        value={formData.nombre || ''}
                        onChange={handleInputChange}
                      />

                      <TextInput
                        name='apellido'
                        placeholder='Apellido'
                        className='mb-3'
                        value={formData.apellido || ''}
                        onChange={handleInputChange}
                      />

                      <TextInput
                        name='correo'
                        placeholder='Correo Electrónico'
                        type='email'
                        className='mb-3'
                        value={formData.correo || ''}
                        onChange={handleInputChange}
                      />

                      <TextInput
                        name='telefono'
                        placeholder='Teléfono'
                        type='tel'
                        className='mb-3'
                        value={formData.telefono || ''}
                        onChange={handleInputChange}
                      />

                      <div>
                        <div className='mb-2 block'>
                          <Label className='text-xl text-gray-500' htmlFor='file-upload' value='Foto de la Cédula del Vehículo' />
                        </div>
                        <FileInput name='cedula' placeholder='Cedula del Vehículo' type='file' className='mb-3' onChange={handleInputChange} />
                      </div>
                    </>
                    )}
              </div>

              <div className='mt-4 flex justify-center'>
                <ReCAPTCHA sitekey='6LeAwp8qAAAAABhAYn5FDw_uIzk8bskuHIP_sBIw' onChange={handleCaptchaChange} />
              </div>

              <Button
                className={`mt-4 w-full py-2 rounded-lg transition ${captchaVerified ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                onClick={handleSubmit}
                disabled={!captchaVerified}
              >
                Verificar Datos
              </Button>

              {isLoading && <Loading />}
            </div>
          )}
        </div>
      </main>

      <DefaultFooter />
    </div>
  )
}
