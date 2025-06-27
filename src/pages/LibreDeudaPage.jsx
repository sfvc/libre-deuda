import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Modal } from 'flowbite-react'
import { useEffect } from 'react'
import { generarLibreDeudaPDF } from '@/assets/components/generarLibreDeudaPDF'
import { ModoConsulta } from '@/assets/components/ModoConsulta'
import { DatosPersonalesForm } from '@/assets/forms/DatosPersonalesForm'
import { DatosVehiculoForm } from '@/assets/forms/DatosVehiculoForm'
import { ResultadosForm } from '@/assets/forms/ResultadosForm'
import DefaultFooter from '@/assets/layout/DefaultFooter'
import DefaultNavbar from '@/assets/layout/DefaultNavbar'
import { formatearData } from '@/assets/util/formatData'
import { useFormHandlers } from '@/hooks/useFormHandlers'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useLibreDeudaState } from '@/hooks/useLibreDeudaState'
import Loading from '@/Loading'
import { getActasFilter, getTipos, postLibreDeuda } from '@/services/multasService'

export default function LibreDeudaPage () {
  const state = useLibreDeudaState()
  const handlers = useFormHandlers(state)
  const { validateForm } = useFormValidation(state.formData, state.modoConsulta, state.images)

  const {
    modoConsulta, setModoConsulta,
    showPersonaForm, setShowPersonaForm,
    errorMessage, setErrorMessage,
    enabled,
    isCheckingStatus,
    showDeclarationModal, setShowDeclarationModal,
    isValidated,
    showResults,
    isVerifying,
    isGeneratingPdf, setIsGeneratingPdf,
    showTitularAlert,
    resetFiltro,
    numeroLibreDeuda,
    fromVehicleSearch,
    formData,
    setFormData,
    filters,
    vehicleFieldsState,
    images, setImages,
    resetForm
  } = state

  const { handleInputChange, handlePersonaSelect, handleVehiculoSelect, handleSubmit } = handlers

  const { data, isLoading } = useQuery({
    queryKey: ['actas', filters, modoConsulta],
    queryFn: () => {
      if (modoConsulta === 'simple') {
        return getActasFilter({ persona_id: filters.persona_id })
      }
      return getActasFilter(filters)
    },
    enabled
  })

  const { data: tipos, isLoading: isLoadingTipos, error: errorTipos } = useQuery({
    queryKey: ['tipos'],
    queryFn: getTipos
  })

  const handleMultasPagadas = () => {
    if (isCheckingStatus) {
      return <Loading />
    }
    if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
      return true
    }
    return data.data.every((multa) => {
      const estados = multa?.estadosActa || []
      return estados.some((estado) => {
        const nombre = estado?.nombre?.toLowerCase() || ''
        return nombre === 'pagada' || nombre === 'sin valor monetario'
      })
    })
  }

  const handleCheckAndShowModal = () => {
    const { isValid, errorMessage } = validateForm()
    if (isValid) {
      setShowDeclarationModal(true)
      setErrorMessage('')
    } else {
      setErrorMessage(errorMessage)
    }
  }

  const handleGenerateLibreDeuda = async () => {
    setIsGeneratingPdf(true)
    try {
      const vehId = formData.vehiculo_id || filters.vehiculo_id
      const acta = {
        infractores: [{
          nombre: formData.nombre,
          apellido: formData.apellido,
          documento: formData.dni || formData.infractorDocumento,
          cuit: formData.cuit || formData.cuit
        }],
        vehiculo: vehId
          ? {
              id: vehId,
              dominio: formData.dominio,
              marca: { nombre: formData.marca },
              modelo: formData.modelo,
              tipo: { nombre: formData.tipo },
              numero_taxi_remis: formData.numero_taxi_remis
            }
          : null
      }

      const formattedData = await formatearData(acta)
      formattedData.persona_id = formData.persona_id
      formattedData.libreDeudaID = numeroLibreDeuda
      formattedData.vehiculo = acta.vehiculo

      if (formattedData.vehiculo) {
        formattedData.marca = formattedData.vehiculo.marca.nombre
        formattedData.tipo = formattedData.vehiculo.tipo.nombre
        formattedData.patente = formattedData.vehiculo.dominio
        formattedData.numero_taxi_remis = formattedData.vehiculo.numero_taxi_remis
      }

      const { pdfBlob, fileName, qrUrl } = await generarLibreDeudaPDF(formattedData)
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })
      const libreDeudaFormData = new FormData()
      libreDeudaFormData.append('persona_id', formData.persona_id)
      libreDeudaFormData.append('vehiculo_id', formData.vehiculo_id)
      libreDeudaFormData.append('fuente', formData.fuente)
      libreDeudaFormData.append('libre_deuda', pdfFile)

      await postLibreDeuda(libreDeudaFormData)

      setTimeout(() => {
        window.open(qrUrl, '_blank')
      }, 1000)
    } catch (error) {
      console.error('Error generando el libre deuda', error)
      alert('Ocurrió un error al generar el libre deuda.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  useEffect(() => {
    if (modoConsulta === 'simple') {
      setFormData((prev) => ({
        ...prev,
        vehiculo_id: '',
        dominio: '',
        marca: '',
        marca_id: '',
        modelo: '',
        tipo: '',
        tipo_id: '',
        numero_taxi_remis: ''
      }))
      setImages({
        cedulaImageFrente: null,
        cedulaImageDorso: null,
        marbeteImage: null
      })
      state.setVehicleFieldsState({
        disableMarca: true,
        disableModelo: true,
        disableTipo: true
      })
      setModoConsulta('simple')
      state.setShowTitularAlert(false)
      state.setFilters((prev) => ({
        ...prev,
        vehiculo_id: ''
      }))
    }
  }, [modoConsulta])

  useEffect(() => {
    if (modoConsulta === 'simple') {
      setShowPersonaForm(true)
    } else {
      setShowPersonaForm(false)
    }
  }, [modoConsulta])

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 dark:bg-slate-900'>
      <DefaultNavbar />
      <main className='flex flex-1 justify-center items-center px-4 py-4'>
        <div className='bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8 w-full max-w-xl text-center space-y-4 flex flex-col items-center'>
          <div className='bg-white md:p-6 md:shadow-xl md:rounded-lg w-full max-w-md transition-all duration-300 flex flex-col items-center'>
            {!showResults && <ModoConsulta modoConsulta={modoConsulta} setModoConsulta={setModoConsulta} />}

            {isValidated && showResults
              ? (
                <ResultadosForm
                  isLoading={isLoading}
                  data={data}
                  handleMultasPagadas={handleMultasPagadas}
                  handleGenerateLibreDeuda={handleGenerateLibreDeuda}
                  isGeneratingPdf={isGeneratingPdf}
                  resetForm={resetForm}
                />
                )
              : (
                <>
                  <Button color='gray' className='w-full mb-2' onClick={resetForm} outline>
                    Limpiar formulario y comenzar de nuevo
                  </Button>

                  <p className='text-sm text-gray-600 mb-4'>
                    <strong>Consultar por Persona:</strong> Solo ingresás tus datos personales buscando por CUIL.<br />
                    <strong>Consultar por Vehículo:</strong> Ingresás también los datos del vehículo para emitir el Libre Deuda completo.
                  </p>

                  <div className='w-full'>
                    {showTitularAlert && (
                      <Alert color='warning' className='mb-4'>
                        El vehículo no tiene titular asociado. Por favor completá los datos ingresando el CUIL del mismo.
                      </Alert>
                    )}

                    {showPersonaForm && (
                      <DatosPersonalesForm
                        formData={formData}
                        handleInputChange={(e) => handleInputChange(e, tipos)}
                        shouldDisableFields={state.shouldDisableFields}
                        handlePersonaSelect={handlePersonaSelect}
                        modoConsulta={modoConsulta}
                        cedulaImageFrente={images.cedulaImageFrente}
                        setCedulaImageFrente={(img) => setImages(prev => ({ ...prev, cedulaImageFrente: img }))}
                        cedulaImageDorso={images.cedulaImageDorso}
                        setCedulaImageDorso={(img) => setImages(prev => ({ ...prev, cedulaImageDorso: img }))}
                        resetFiltro={resetFiltro}
                        fromVehicleSearch={fromVehicleSearch}
                      />
                    )}

                    {modoConsulta === 'completo' && (
                      <DatosVehiculoForm
                        formData={formData}
                        handleInputChange={(e) => handleInputChange(e, tipos)}
                        handleVehiculoSelect={handleVehiculoSelect}
                        disableMarca={vehicleFieldsState.disableMarca}
                        disableModelo={vehicleFieldsState.disableModelo}
                        disableTipo={vehicleFieldsState.disableTipo}
                        marbeteImage={images.marbeteImage}
                        setMarbeteImage={(img) => setImages(prev => ({ ...prev, marbeteImage: img }))}
                        tipos={tipos || []}
                        isLoadingTipos={isLoadingTipos}
                        errorTipos={errorTipos}
                        resetFiltro={resetFiltro}
                      />
                    )}

                    {errorMessage && (
                      <Alert color='failure' className='mb-4 mt-4'>
                        <p className='font-semibold text-red-700'>Por favor, completa los siguientes campos faltantes:</p>
                        <pre className='whitespace-pre-wrap text-red-600'>{errorMessage}</pre>
                      </Alert>
                    )}

                    <Button
                      className='mt-4 w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white'
                      onClick={handleCheckAndShowModal}
                      disabled={isVerifying}
                    >
                      {isVerifying ? <Loading /> : 'Verificar y Continuar'}
                    </Button>
                  </div>
                </>
                )}

            <Modal
              show={showDeclarationModal}
              size='md'
              onClose={() => setShowDeclarationModal(false)}
              popup
            >
              <Modal.Header />
              <Modal.Body>
                <div className='text-center'>
                  <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
                    Declaración Jurada
                  </h3>
                  <p className='mb-6 text-md text-gray-700 dark:text-gray-300'>
                    Los datos que estás por enviar tienen carácter de declaración jurada.
                    Asegurate de que sean correctos antes de continuar.
                  </p>
                  <div className='flex justify-center gap-4'>
                    <Button
                      color='failure'
                      onClick={() => setShowDeclarationModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      color='success'
                      onClick={() => {
                        setShowDeclarationModal(false)
                        handleSubmit()
                      }}
                    >
                      Aceptar y Continuar
                    </Button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </main>
      <DefaultFooter />
    </div>
  )
}
