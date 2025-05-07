import React from 'react'
import { TextInput } from 'flowbite-react'
import SearchInfractor from '@/assets/components/SearchInfractor'

export const DatosPersonalesForm = ({
  formData,
  handleInputChange,
  handlePersonaSelect,
  shouldDisableFields,
  modoConsulta = 'simple'
}) => {
  return (
    <div>
      <h4 className='mb-2 font-medium text-gray-600'>
        {modoConsulta === 'simple' ? 'Persona' : 'Titular'}
      </h4>

      <SearchInfractor onSelectPersona={handlePersonaSelect} />

      <TextInput
        name='nombre'
        placeholder='Nombre'
        className='mb-3'
        value={formData.nombre || ''}
        onChange={handleInputChange}
        disabled
      />

      <TextInput
        name='apellido'
        placeholder='Apellido'
        className='mb-3'
        value={formData.apellido || ''}
        onChange={handleInputChange}
        disabled
      />

      <TextInput
        name='email'
        placeholder='Correo Electrónico'
        type='email'
        className='mb-3'
        value={formData.email || ''}
        onChange={handleInputChange}
        disabled={shouldDisableFields}
      />

      <TextInput
        name='telefono'
        placeholder='Teléfono'
        type='tel'
        className='mb-3'
        value={formData.telefono || ''}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '')
          handleInputChange({ target: { name: 'telefono', value } })
        }}
        disabled={shouldDisableFields}
      />
    </div>
  )
}
