import React from 'react'
import { FileInput, Label, Select, TextInput, Spinner } from 'flowbite-react'
import { useImageCompression } from '@/assets/components/useImageCompression'
import SearchVehiculo from '@/assets/components/SearchVehiculo'
import SearchMarca from '@/assets/components/SearchMarca'

export const DatosVehiculoForm = ({
  formData,
  handleInputChange,
  handleVehiculoSelect,
  disableMarca,
  disableModelo,
  disableTipo,
  cedulaImage,
  marbeteImage,
  setCedulaImage,
  setMarbeteImage,
  tipos,
  isLoadingTipos,
  errorTipos
}) => {
  const { isLoading: loadingCedula, loadingMarbete, handleCompressImage } = useImageCompression()

  return (
    <>
      <h4 className='mb-2 font-medium text-gray-600'>Vehículo</h4>

      <SearchVehiculo onSelectVehiculo={handleVehiculoSelect} />

      {formData.marca === 'INDETERMINADO' || !formData.marca
        ? (
          <SearchMarca
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
            disabled={disableMarca}
          />
          )}

      <input type='hidden' name='marca_id' value={formData.marca_id || ''} />

      <TextInput
        name='modelo'
        placeholder='Modelo del Vehículo'
        className='mb-3'
        value={formData.modelo || ''}
        onChange={handleInputChange}
        disabled={formData.modelo !== '0' && disableModelo}
      />

      <Select
        name='tipo'
        className='mb-2'
        value={formData.tipo || ''}
        onChange={handleInputChange}
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
        <div>
          <div className='mb-2 block'>
            <Label className='text-xl text-green-500' htmlFor='foto_marbete' value='Foto del Marbete' />
          </div>
          <FileInput
            name='foto_marbete'
            placeholder='Marbete del Vehículo'
            type='file'
            className='mb-3'
            onChange={async (e) => {
              const file = e.target.files[0]
              if (file) {
                const compressed = await handleCompressImage(file)
                setMarbeteImage(compressed)
                handleInputChange({
                  target: { name: 'foto_marbete', value: compressed }
                })
              }
            }}
            accept='image/*'
            capture='environment'
            disabled={loadingMarbete}
          />
          {loadingMarbete && (
            <div className='mb-3 text-sm text-gray-500 flex items-center gap-2'>
              <Spinner size='sm' /> Subiendo Archivo...
            </div>
          )}

          <TextInput
            name='numero_taxi_remis'
            placeholder='Número de Taxi/Remis/Colectivo'
            className='mb-3'
            value={formData.numero_taxi_remis || ''}
            onChange={handleInputChange}
          />
        </div>
      )}

      <div>
        <div className='mb-2 block'>
          <Label className='text-xl text-green-500' htmlFor='foto_cedula' value='Foto de la Cédula del Titular' />
        </div>
        <FileInput
          name='foto_cedula'
          placeholder='Cedula del Vehículo'
          type='file'
          className='mb-3'
          onChange={async (e) => {
            const file = e.target.files[0]
            if (file) {
              const compressed = await handleCompressImage(file)
              setCedulaImage(compressed)
              handleInputChange({
                target: { name: 'foto_cedula', value: compressed }
              })
            }
          }}
          accept='image/*'
          capture='environment'
          disabled={loadingCedula}
        />
        {loadingCedula && (
          <div className='mb-3 text-sm text-gray-500 flex items-center gap-2'>
            <Spinner /> Subiendo Archivo...
          </div>
        )}
      </div>
    </>
  )
}
