import React from 'react'
import { FileInput, Label, TextInput } from 'flowbite-react'
import SearchInfractor from '@/assets/components/SearchInfractor'

export const DatosPersonalesForm = ({ formData, handleInputChange, handlePersonaSelect, shouldDisableFields, dniImage, setDniImage }) => (
  <div>
    <h4 className='mb-2 font-medium text-gray-600'>Titular</h4>

    <SearchInfractor onSelectPersona={handlePersonaSelect} />

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
      <FileInput
        name='foto_dni'
        placeholder='DNI del Titular'
        type='file'
        className='mb-3'
        onChange={(e) => {
          setDniImage(e.target.files[0])
          handleInputChange(e)
        }}
        accept='image/*'
        capture='environment'
      />
    </div>
  </div>
)
