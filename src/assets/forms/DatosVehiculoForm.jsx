import React, { useState } from 'react'
import { FileInput, Label, Select, TextInput, Spinner, Card } from 'flowbite-react'
import { useImageCompression } from '@/assets/components/useImageCompression'
import SearchVehiculo from '@/assets/components/SearchVehiculo'
import SearchMarca from '@/assets/components/SearchMarca'

const FotoDocumentoInput = ({ label, name, value, loading, onChange, fileSize }) => (
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
    {fileSize?.original && fileSize?.compressed && !loading && (
      <p className='text-sm text-gray-600 mt-1'>
        Peso original: {fileSize.original} KB <br />
        Peso comprimido: {fileSize.compressed} KB
      </p>
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
  cedulaImageFrente,
  cedulaImageDorso,
  marbeteImage,
  setCedulaImageFrente,
  setCedulaImageDorso,
  setMarbeteImage,
  tipos,
  isLoadingTipos,
  errorTipos
}) => {
  const { isLoading: loadingCedula, loadingMarbete, handleCompressImage } = useImageCompression()
  const [cedulaFrenteSize, setCedulaFrenteSize] = useState({ original: null, compressed: null })
  const [cedulaDorsoSize, setCedulaDorsoSize] = useState({ original: null, compressed: null })
  const [marbeteSize, setMarbeteSize] = useState({ original: null, compressed: null })

  const handleFileChange = async (e, setter, name, setSize) => {
    const file = e.target.files[0]
    if (file) {
      const originalSize = Math.round(file.size / 1024)
      const compressed = await handleCompressImage(file)
      const compressedSize = Math.round(compressed.size / 1024)

      setter(compressed)
      setSize({ original: originalSize, compressed: compressedSize })

      handleInputChange({
        target: { name, value: compressed }
      })
    }
  }

  return (
    <>
      <h4 className='mb-2 mt-2 font-medium text-gray-600'>Vehículo</h4>

      <SearchVehiculo onSelectVehiculo={handleVehiculoSelect} />

      {formData.marca === 'INDETERMINADO' || !formData.marca
        ? (
          <SearchMarca
            disabled={disableMarca}
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
            <h5 className='text-lg font-semibold text-gray-700 mb-2'>Foto del Marbete</h5>
            <FotoDocumentoInput
              label='Marbete del Vehículo'
              name='foto_marbete'
              value={marbeteImage}
              loading={loadingMarbete}
              onChange={(e) => handleFileChange(e, setMarbeteImage, 'foto_marbete', setMarbeteSize)}
              fileSize={marbeteSize}
            />
          </Card>
        </>
      )}

      <Card className='shadow-sm'>
        <FotoDocumentoInput
          label='Frente de la Cédula del Titular'
          name='foto_cedula_frente'
          value={cedulaImageFrente}
          loading={loadingCedula}
          onChange={(e) => handleFileChange(e, setCedulaImageFrente, 'foto_cedula_frente', setCedulaFrenteSize)}
          fileSize={cedulaFrenteSize}
        />

        <FotoDocumentoInput
          label='Dorso de la Cédula del Titular'
          name='foto_cedula_dorso'
          value={cedulaImageDorso}
          loading={loadingCedula}
          onChange={(e) => handleFileChange(e, setCedulaImageDorso, 'foto_cedula_dorso', setCedulaDorsoSize)}
          fileSize={cedulaDorsoSize}
        />
      </Card>
    </>
  )
}
