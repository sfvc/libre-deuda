import { useEffect, useState } from 'react'
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
  const [showPersonaForm, setShowPersonaForm] = useState(modoConsulta === 'simple')
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
  const [cedulaImageFrente, setCedulaImageFrente] = useState(null)
  const [cedulaImageDorso, setCedulaImageDorso] = useState(null)
  const [marbeteImage, setMarbeteImage] = useState(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [showTitularAlert, setShowTitularAlert] = useState(false)
  const [resetFiltro, setResetFiltro] = useState(false)
  const [numeroLibreDeuda, setNumeroLibreDeuda] = useState(null)
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
    const id = vehiculo.vehiculo_id
    setFilters(prev => ({
      ...prev,
      vehiculo_id: id,
      persona_id: vehiculo.titular?.id || ''
    }))
    setFormData(prev => ({
      ...prev,
      vehiculo_id: vehiculo.id,
      dominio: vehiculo.dominio,
      marca: vehiculo.marca?.nombre || '',
      marca_id: vehiculo.marca?.id || '',
      modelo: vehiculo.modelo,
      tipo: vehiculo.tipo?.nombre || '',
      tipo_id: vehiculo.tipo?.id || '',
      numero_taxi_remis: vehiculo.numero_taxi_remis || ''
    }))
    setDisableMarca(false)
    setDisableModelo(false)
    setDisableTipo(false)

    if (modoConsulta === 'completo') {
      setShowPersonaForm(true)

      if (vehiculo.titular) {
        setFormData(prev => ({
          ...prev,
          persona_id: vehiculo.titular.id,
          nombre: vehiculo.titular.nombre,
          apellido: vehiculo.titular.apellido,
          email: vehiculo.titular.email || '',
          telefono: vehiculo.titular.telefono || '',
          dni: vehiculo?.titular.numero_documento || vehiculo?.titular.documento || ''
        }))
        setShouldDisableFields(true)
        setShowTitularAlert(false)
      } else {
        setFormData(prev => ({
          ...prev,
          persona_id: null,
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          dni: ''
        }))
        setShouldDisableFields(false)
        setShowTitularAlert(true)
      }
    }
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
      Teléfono: formData.telefono

    }

    if (modoConsulta === 'completo') {
      Object.assign(validationRules, {
        Dominio: formData.dominio,
        Marca: validateMarca(),
        Modelo: validateModelo(),
        'Tipo de vehículo': validateTipo(),
        'Frente de la cédula': cedulaImageFrente,
        'Dorso de la cédula': cedulaImageDorso
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

  const handleSubmit = async () => {
    setIsVerifying(true)

    const dataToSend = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        const val = value === 'ㅤ' ? '' : value
        dataToSend.append(key, val)
      }
    })

    if (marbeteImage instanceof File) dataToSend.append('foto_marbete', marbeteImage)
    if (cedulaImageFrente instanceof File) dataToSend.append('foto_cedula_frente', cedulaImageFrente)
    if (cedulaImageDorso instanceof File) dataToSend.append('foto_cedula_dorso', cedulaImageDorso)

    try {
      const response = await postPersonaDatos(dataToSend)

      if (response?.numeroLibreDeuda) {
        setNumeroLibreDeuda(response.numeroLibreDeuda)
      }

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

  const handleGenerateLibreDeuda = async () => {
    setIsGeneratingPdf(true)
    try {
      const vehId = formData.vehiculo_id || filters.vehiculo_id
      const acta = {
        infractores: [{
          nombre: formData.nombre,
          apellido: formData.apellido,
          documento: formData.dni || formData.infractorDocumento
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
      const { pdfBlob, fileName } = await generarLibreDeudaPDF(formattedData)
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })

      const libreDeudaFormData = new FormData()
      libreDeudaFormData.append('persona_id', formData.persona_id)
      libreDeudaFormData.append('vehiculo_id', formData.vehiculo_id)
      libreDeudaFormData.append('libre_deuda', pdfFile)

      await postLibreDeuda(libreDeudaFormData)
    } catch (error) {
      console.error('Error generando el libre deuda', error)
      alert('Ocurrió un error al generar el libre deuda.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const resetForm = () => {
    setShowResults(false)
    setIsValidated(false)
    setShouldDisableFields(true)
    setFormData({
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
    setFilters({
      persona_id: '',
      vehiculo_id: ''
    })
    setDisableMarca(true)
    setDisableModelo(true)
    setDisableTipo(true)
    setShowPersonaForm(modoConsulta === 'simple')
    setErrorMessage('')
    setCedulaImageFrente(null)
    setCedulaImageDorso(null)
    setMarbeteImage(null)
    setShowTitularAlert(false)
    setResetFiltro(prev => !prev)
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
      setModoConsulta('simple')
      setShowTitularAlert(false)
      setFilters((prev) => ({
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
                  <Button color='gray' className='w-full mb-2' onClick={resetForm} outline>
                    Blanquear datos
                  </Button>

                  <h2 className='text-gray-700 dark:text-slate-400 mb-2 font-semibold text-2xl'>
                    Libre Deuda Online
                  </h2>

                  <div className='w-full'>
                    <p className='text-black mb-4'>
                      Si el email o teléfono no está completado al buscar, por favor, completalo para verificarlo correctamente.
                    </p>

                    {showTitularAlert && (
                      <Alert color='warning' className='mb-4'>
                        El vehículo no tiene titular asociado. Por favor completá los datos ingresando el DNI del mismo.
                      </Alert>
                    )}

                    {showPersonaForm && (
                      <DatosPersonalesForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        shouldDisableFields={shouldDisableFields}
                        handlePersonaSelect={handlePersonaSelect}
                        modoConsulta={modoConsulta}
                        cedulaImageFrente={cedulaImageFrente}
                        setCedulaImageFrente={setCedulaImageFrente}
                        cedulaImageDorso={cedulaImageDorso}
                        setCedulaImageDorso={setCedulaImageDorso}
                        resetFiltro={resetFiltro}
                      />
                    )}

                    {modoConsulta === 'completo' && (
                      <DatosVehiculoForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleVehiculoSelect={handleVehiculoSelect}
                        disableMarca={disableMarca}
                        disableModelo={disableModelo}
                        disableTipo={disableTipo}
                        marbeteImage={marbeteImage}
                        setMarbeteImage={setMarbeteImage}
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
