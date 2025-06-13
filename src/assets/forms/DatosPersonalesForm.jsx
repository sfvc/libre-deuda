import { FileInput, Label, TextInput, Spinner, Card } from 'flowbite-react'
import { useEffect, useState } from 'react'
import SearchInfractor from '@/assets/components/SearchInfractor'
import { useImageCompression } from '@/assets/components/useImageCompression'

const FotoDocumentoInput = ({ label, name, value, loading, onChange }) => (
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
  setCedulaImageFrente,
  setCedulaImageDorso,
  cedulaImageFrente,
  cedulaImageDorso,
  modoConsulta = 'simple',
  resetFiltro,
  fromVehicleSearch = false
}) => {
  const { isLoading: loadingCedulaFrente, loadingCedulaDorso, handleCompressImage } = useImageCompression()

  const [habilitarContacto, setHabilitarContacto] = useState(false)

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

  const onPersonaSelect = (persona) => {
    handlePersonaSelect(persona)

    if ((!formData.email && !formData.telefono) || fromVehicleSearch) {
      setHabilitarContacto(true)
    }
  }

  useEffect(() => {
    if (fromVehicleSearch) {
      setHabilitarContacto(true)
    }
  }, [fromVehicleSearch])

  const shouldEnableContact = habilitarContacto || fromVehicleSearch || formData.email || formData.telefono

  return (
    <div>
      <h4 className='mb-2 font-medium text-gray-600'>
        {modoConsulta === 'simple' ? 'Persona' : 'Titular'}
      </h4>

      <SearchInfractor onSelectPersona={onPersonaSelect} resetFiltro={resetFiltro} />

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
        disabled={!shouldEnableContact}
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
        disabled={!shouldEnableContact}
      />

      {modoConsulta === 'completo' && (
        <Card className='shadow-sm'>
          <FotoDocumentoInput
            label='Frente de la Cédula del Vehículo del Titular'
            name='foto_cedula_frente'
            value={cedulaImageFrente}
            loading={loadingCedulaFrente}
            onChange={(e) => handleFileChange(e, setCedulaImageFrente, 'foto_cedula_frente')}
          />

          <FotoDocumentoInput
            label='Dorso de la Cédula del Vehículo del Titular'
            name='foto_cedula_dorso'
            value={cedulaImageDorso}
            loading={loadingCedulaDorso}
            onChange={(e) => handleFileChange(e, setCedulaImageDorso, 'foto_cedula_dorso')}
          />
        </Card>
      )}
    </div>
  )
}
