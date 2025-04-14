import React, { useEffect, useState } from 'react'
import { Alert, Button, Modal } from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import { getActasFilter, getTipos, postPersonaDatos, postLibreDeuda } from '@/services/multasService'
import { formatearData } from '@/assets/util/formatData'
import { ModoConsulta } from '@/assets/components/ModoConsulta'
import { generarLibreDeudaPDF } from '@/assets/components/generarLibreDeudaPDF'
import { ResultadosForm } from '@/assets/forms/ResultadosForm'
import { DatosPersonalesForm } from '@/assets/forms/DatosPersonalesForm'
import { DatosVehiculoForm } from '@/assets/forms/DatosVehiculoForm'
import DefaultNavbar from '@/assets/layout/DefaultNavbar'
import DefaultFooter from '@/assets/layout/DefaultFooter'
import Loading from '@/Loading'

export default function LibreDeudaPage () {
  const [modoConsulta, setModoConsulta] = useState('simple')
  const [errorMessage, setErrorMessage] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [shouldDisableFields, setShouldDisableFields] = useState(true)
  const [showDeclarationModal, setShowDeclarationModal] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [disableMarca, setDisableMarca] = useState(true)
  const [disableModelo, setDisableModelo] = useState(true)
  const [disableTipo, setDisableTipo] = useState(true)
  const [dniImageFrente, setDniImageFrente] = useState(null)
  const [dniImageDorso, setDniImageDorso] = useState(null)
  const [cedulaImageFrente, setCedulaImageFrente] = useState(null)
  const [cedulaImageDorso, setCedulaImageDorso] = useState(null)
  const [marbeteImage, setMarbeteImage] = useState(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [formData, setFormData] = useState({
    persona_id: null,
    nombre: null,
    apellido: null,
    email: null,
    telefono: null,
    vehiculo_id: null,
    dominio: null,
    marca: null,
    marca_id: null,
    modelo: null,
    tipo: null,
    tipo_id: null,
    numero_taxi_remis: null
  })

  const [filters, setFilters] = useState({
    persona_id: '',
    vehiculo_id: ''
  })

  const validateMarca = () => formData.marca && formData.marca.trim().length > 0
  const validateModelo = () => formData.modelo && formData.modelo.trim().length > 0
  const validateTipo = () => formData.tipo && formData.tipo.trim().length > 0

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

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'tipo' && tipos) {
      const tipoSeleccionado = tipos.find((t) => t.nombre === value)
      setFormData((prev) => ({
        ...prev,
        tipo: value,
        tipo_id: tipoSeleccionado?.id || ''
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handlePersonaSelect = (persona) => {
    setFilters((prev) => ({ ...prev, persona_id: persona.persona_id || persona.id || '' }))

    setFormData((prev) => ({
      ...prev,
      persona_id: persona?.persona_id || persona?.id || '',
      nombre: persona?.nombre || '',
      apellido: persona?.apellido || '',
      email: persona.email || '',
      telefono: persona.telefono || '',
      dni: persona?.documento || persona?.dni || ''
    }))

    setShouldDisableFields(false)
  }

  const handleVehiculoSelect = (vehiculo) => {
    setFilters((prev) => ({ ...prev, vehiculo_id: vehiculo?.vehiculo_id || vehiculo?.id || '' }))

    setFormData((prev) => ({
      ...prev,
      vehiculo_id: vehiculo?.vehiculo_id || vehiculo?.id || null,
      dominio: vehiculo?.dominio || prev.dominio || null,
      marca: vehiculo?.marca?.nombre || prev.marca || null,
      marca_id: vehiculo?.marca?.id || prev.marca_id || null,
      modelo: vehiculo?.modelo || prev.modelo || null,
      tipo: vehiculo?.tipo?.nombre || prev.tipo || null,
      tipo_id: vehiculo?.tipo?.id || prev.tipo_id || null,
      numero_taxi_remis: vehiculo?.numero_taxi_remis || prev.numero_taxi_remis || null
    }))

    setDisableMarca(false)
    setDisableModelo(false)
    setDisableTipo(false)
  }

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

  const validateForm = () => {
    const validationRules = {
      Nombre: formData.nombre,
      Apellido: formData.apellido,
      'Correo Electrónico': formData.email,
      Teléfono: formData.telefono,
      'Frente del DNI': dniImageFrente,
      'Dorso del DNI': dniImageDorso
    }

    if (modoConsulta === 'completo') {
      Object.assign(validationRules, {
        Dominio: formData.dominio,
        Marca: validateMarca(),
        Modelo: validateModelo(),
        'Tipo de vehículo': validateTipo(),
        'Frente de la Cédula': cedulaImageFrente,
        'Dorso de la Cédula': cedulaImageDorso
      })
    }

    const missingFields = Object.entries(validationRules)
      .filter(([_, value]) => !value)
      .map(([field]) => `• ${field}`)

    if (missingFields.length > 0) {
      setErrorMessage(missingFields.join('\n'))
      return false
    }

    setErrorMessage('')
    return true
  }

  const handleCheckAndShowModal = () => {
    if (validateForm()) {
      setShowDeclarationModal(true)
    }
  }

  const handleGenerateLibreDeuda = async () => {
    setIsGeneratingPdf(true)
    try {
      const acta = {
        infractores: [{
          nombre: formData.nombre,
          apellido: formData.apellido,
          documento: formData.dni || formData.infractorDocumento
        }],
        vehiculo: formData.vehiculo_id
          ? {
              dominio: formData.dominio,
              marca: formData.marca,
              modelo: formData.modelo,
              tipo: formData.tipo,
              numero_taxi_remis: formData.numero_taxi_remis
            }
          : null
      }

      const formattedData = await formatearData(acta)
      formattedData.persona_id = formData.persona_id
      formattedData.libreDeudaID = Date.now()
      const { pdfBlob, fileName } = await generarLibreDeudaPDF(formattedData)
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })

      const libreDeudaFormData = new FormData()
      libreDeudaFormData.append('persona_id', formData.persona_id)
      libreDeudaFormData.append('vehiculo_id', formData.vehiculo_id)
      libreDeudaFormData.append('libre_deuda', pdfFile)

      const response = await postLibreDeuda(libreDeudaFormData)
      console.log('Libre deuda generado y enviado correctamente:', response)
    } catch (error) {
      console.error('Error generando el libre deuda', error)
      alert('Ocurrió un error al generar el libre deuda.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleSubmit = async () => {
    setIsVerifying(true)

    const dataToSend = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        dataToSend.append(key, value)
      }
    })

    // if (dniImageFrente instanceof File) dataToSend.append('foto_dni_frente', dniImageFrente)
    if (dniImageFrente instanceof File) dataToSend.append('foto_dni', dniImageFrente)
    if (dniImageDorso instanceof File) dataToSend.append('foto_dni_dorso', dniImageDorso)
    if (cedulaImageFrente instanceof File) dataToSend.append('foto_cedula_frente', cedulaImageFrente)
    if (cedulaImageDorso instanceof File) dataToSend.append('foto_cedula_dorso', cedulaImageDorso)
    if (marbeteImage instanceof File) dataToSend.append('foto_marbete', marbeteImage)

    try {
      await postPersonaDatos(dataToSend)

      setErrorMessage('')
      setEnabled(false)
      setIsCheckingStatus(true)

      setTimeout(() => {
        setEnabled(true)
        setIsValidated(true)
        setShowResults(true)
        setIsCheckingStatus(false)
        setIsVerifying(false)
      }, 0)
    } catch (error) {
      setIsVerifying(false)

      if (error.response && error.response.data) {
        const { message } = error.response.data
        setErrorMessage(message)
      } else {
        setErrorMessage('Ocurrió un error al enviar los datos. Revisá los campos e intentá nuevamente.')
      }
    }
  }

  const resetForm = () => {
    setShowResults(false)
    setIsValidated(false)
    setShouldDisableFields(true)
    setEnabled(false)
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      dominio: '',
      marca: '',
      marca_id: '',
      modelo: '',
      tipo: '',
      tipo_id: '',
      numero_taxi_remis: ''
    })
    setDniImageFrente(null)
    setDniImageDorso(null)
    setCedulaImageFrente(null)
    setCedulaImageDorso(null)
    setMarbeteImage(null)
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
      setCedulaImageFrente(null)
      setCedulaImageDorso(null)
      setMarbeteImage(null)
      setDisableMarca(true)
      setDisableModelo(true)
      setDisableTipo(true)
      setFilters((prev) => ({
        ...prev,
        vehiculo_id: ''
      }))
    }
  }, [modoConsulta])

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 dark:bg-slate-900'>
      <DefaultNavbar />

      <main className='flex flex-1 justify-center items-center px-4 py-4'>
        <div className='bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8 w-full max-w-xl text-center space-y-4 flex flex-col items-center'>
          <div className='bg-white p-6 shadow-xl rounded-lg w-full max-w-md transition-all duration-300 flex flex-col items-center'>

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
                  <h2 className='text-gray-700 dark:text-slate-400 mb-2 font-semibold text-2xl'>
                    Libre Deuda Online
                  </h2>

                  <div className='w-full'>
                    <p className='text-black mb-4'>
                      Si el email o teléfono no está completado al buscar, por favor, completalo para verificarlo correctamente.
                    </p>

                    <DatosPersonalesForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      shouldDisableFields={shouldDisableFields}
                      handlePersonaSelect={handlePersonaSelect}
                      dniImageFrente={dniImageFrente}
                      setDniImageFrente={setDniImageFrente}
                      dniImageDorso={dniImageDorso}
                      setDniImageDorso={setDniImageDorso}
                      modoConsulta={modoConsulta}
                    />

                    {modoConsulta === 'completo' && (
                      <DatosVehiculoForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleVehiculoSelect={handleVehiculoSelect}
                        disableMarca={disableMarca}
                        disableModelo={disableModelo}
                        disableTipo={disableTipo}
                        cedulaImageFrente={cedulaImageFrente}
                        setCedulaImageFrente={setCedulaImageFrente}
                        cedulaImageDorso={cedulaImageDorso}
                        setCedulaImageDorso={setCedulaImageDorso}
                        marbeteImage={marbeteImage}
                        setMarbeteImage={setMarbeteImage}
                        tipos={tipos || []}
                        isLoadingTipos={isLoadingTipos}
                        errorTipos={errorTipos}
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
                      {isVerifying ? <Loading /> : 'Verificar Datos'}
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
