import React from 'react'
import { FileInput, Label, TextInput } from 'flowbite-react'
import { useImageCompression } from '@/assets/util/useImageCompression'
import SearchInfractor from '@/assets/components/SearchInfractor'
import Loading from '@/Loading'

export const DatosPersonalesForm = ({
  formData,
  handleInputChange,
  handlePersonaSelect,
  shouldDisableFields,
  dniImage,
  setDniImage
}) => {
  const { isLoading: loadingDNI, handleCompressImage } = useImageCompression()

  return (
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
          onChange={async (e) => {
            const file = e.target.files[0]
            if (file) {
              const compressed = await handleCompressImage(file)
              setDniImage(compressed)
              handleInputChange({
                target: { name: 'foto_dni', value: compressed }
              })
            }
          }}
          accept='image/*'
          capture='environment'
          disabled={loadingDNI}
        />
        {loadingDNI && (
          <div className='mb-3 text-sm text-gray-500 flex items-center gap-2'>
            <Loading /> Subiendo Archivo...
          </div>
        )}
      </div>
    </div>
  )
}
