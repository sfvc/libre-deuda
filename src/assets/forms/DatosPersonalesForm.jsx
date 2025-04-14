import React from 'react'
import { FileInput, Label, Spinner, TextInput, Card } from 'flowbite-react'
import { useImageCompression } from '@/assets/components/useImageCompression'
import SearchInfractor from '@/assets/components/SearchInfractor'

const FotoDniInput = ({ label, name, value, onChange, loading }) => (
  <div className='mb-4'>
    <Label className='text-sm font-medium text-gray-700 mb-1 block'>{label}</Label>
    {value && (
      <img
        src={URL.createObjectURL(value)}
        alt={label}
        className='h-auto w-auto rounded shadow mb-2 object-cover'
      />
    )}
    <FileInput
      name={name}
      type='file'
      accept='image/*'
      capture='environment'
      onChange={onChange}
      disabled={loading}
    />
    {loading && (
      <div className='mt-1 text-sm text-blue-600 flex items-center gap-2'>
        <Spinner size='sm' /> Subiendo archivo...
      </div>
    )}
  </div>
)

export const DatosPersonalesForm = ({
  formData,
  handleInputChange,
  handlePersonaSelect,
  shouldDisableFields,
  dniImageFrente,
  setDniImageFrente,
  dniImageDorso,
  setDniImageDorso,
  modoConsulta = 'simple'
}) => {
  const { isLoading: loadingDNI, handleCompressImage } = useImageCompression()

  const handleFileChange = async (e, setter, name) => {
    const file = e.target.files[0]
    if (file) {
      const compressed = await handleCompressImage(file)
      const compressedFile = new File([compressed], file.name, {
        type: compressed.type || file.type,
        lastModified: Date.now()
      })

      setter(compressedFile)

      handleInputChange({
        target: { name, value: compressedFile }
      })
    }
  }

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

      <Card className=' shadow-sm mt-4'>
        <FotoDniInput
          label='Frente del DNI'
          // name='foto_dni_frente'
          name='foto_dni'
          value={dniImageFrente}
          loading={loadingDNI}
          // onChange={(e) => handleFileChange(e, setDniImageFrente, 'foto_dni_frente')}
          onChange={(e) => handleFileChange(e, setDniImageFrente, 'foto_dni')}
        />

        <FotoDniInput
          label='Dorso del DNI'
          name='foto_dni_dorso'
          value={dniImageDorso}
          loading={loadingDNI}
          onChange={(e) => handleFileChange(e, setDniImageDorso, 'foto_dni_dorso')}
        />
      </Card>
    </div>
  )
}
