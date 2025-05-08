import React from 'react'
import { FileInput, Label, Select, TextInput, Spinner, Card } from 'flowbite-react'
import { useImageCompression } from '@/assets/components/useImageCompression'
import SearchVehiculo from '@/assets/components/SearchVehiculo'
import SearchMarca from '@/assets/components/SearchMarca'

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

export const DatosVehiculoForm = ({
  formData,
  handleInputChange,
  handleVehiculoSelect,
  disableMarca,
  disableModelo,
  disableTipo,
  marbeteImage,
  setMarbeteImage,
  tipos,
  isLoadingTipos,
  errorTipos,
  resetFiltro
}) => {
  const { isLoading: loadingMarbete, handleCompressImage } = useImageCompression()

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
    <>
      <h4 className='mb-2 mt-2 font-medium text-gray-600'>Vehículo</h4>

      <SearchVehiculo onSelectVehiculo={handleVehiculoSelect} resetFiltro={resetFiltro} />

      {formData.marca === 'INDETERMINADO' || !formData.marca
        ? (
          <SearchMarca
            disabled={disableMarca}
            resetFiltro={resetFiltro}
            onSelectMarca={(marca) => {
              handleInputChange({
                target: { name: 'marca', value: marca?.nombre || '' }
              })
              handleInputChange({
                target: { name: 'marca_id', value: marca?.id || '' }
              })
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
          />
          )}

      <input type='hidden' name='marca_id' value={formData.marca_id || ''} />

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
        className='mb-3'
        value={formData.tipo || ''}
        onChange={handleInputChange}
        disabled={disableTipo}
      >
        <option value='' className='text-gray-400'>Seleccione el Tipo de Vehículo</option>
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
        <>
          <TextInput
            name='numero_taxi_remis'
            placeholder='Número de Taxi/Remis/Colectivo'
            className='mb-3'
            value={formData.numero_taxi_remis || ''}
            onChange={handleInputChange}
          />

          <Card className='p-4 shadow-sm mb-4'>
            <FotoDocumentoInput
              label='Marbete del Vehículo'
              name='foto_marbete'
              value={marbeteImage}
              loading={loadingMarbete}
              onChange={(e) => handleFileChange(e, setMarbeteImage, 'foto_marbete')}
            />
          </Card>
        </>
      )}
    </>
  )
}
