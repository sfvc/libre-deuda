import { useState } from 'react'

const initialFormData = {
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
}

const initialFilters = {
  persona_id: '',
  vehiculo_id: ''
}

export const useLibreDeudaState = () => {
  const [modoConsulta, setModoConsulta] = useState('simple')
  const [showPersonaForm, setShowPersonaForm] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [shouldDisableFields, setShouldDisableFields] = useState(true)
  const [showDeclarationModal, setShowDeclarationModal] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [showTitularAlert, setShowTitularAlert] = useState(false)
  const [resetFiltro, setResetFiltro] = useState(false)
  const [numeroLibreDeuda, setNumeroLibreDeuda] = useState(null)
  const [fromVehicleSearch, setFromVehicleSearch] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [filters, setFilters] = useState(initialFilters)
  const [shouldFetchActas, setShouldFetchActas] = useState(true)

  const [vehicleFieldsState, setVehicleFieldsState] = useState({
    disableMarca: true,
    disableModelo: true,
    disableTipo: true
  })

  const [images, setImages] = useState({
    cedulaImageFrente: null,
    cedulaImageDorso: null,
    marbeteImage: null
  })

  const resetForm = () => {
    setShowResults(false)
    setIsValidated(false)
    setShouldDisableFields(true)
    setShouldFetchActas(true)
    setFormData(initialFormData)
    setFilters(initialFilters)
    setVehicleFieldsState({
      disableMarca: true,
      disableModelo: true,
      disableTipo: true
    })
    setImages({
      cedulaImageFrente: null,
      cedulaImageDorso: null,
      marbeteImage: null
    })
    setShowPersonaForm(modoConsulta === 'simple')
    setErrorMessage('')
    setShowTitularAlert(false)
    setFromVehicleSearch(false)
    setNumeroLibreDeuda(null)
    setResetFiltro(prev => !prev)
  }

  return {
    modoConsulta,
    setModoConsulta,
    showPersonaForm,
    setShowPersonaForm,
    errorMessage,
    setErrorMessage,
    enabled,
    setEnabled,
    isCheckingStatus,
    setIsCheckingStatus,
    shouldDisableFields,
    setShouldDisableFields,
    showDeclarationModal,
    setShowDeclarationModal,
    isValidated,
    setIsValidated,
    showResults,
    setShowResults,
    isVerifying,
    setIsVerifying,
    isGeneratingPdf,
    setIsGeneratingPdf,
    showTitularAlert,
    setShowTitularAlert,
    resetFiltro,
    setResetFiltro,
    numeroLibreDeuda,
    setNumeroLibreDeuda,
    fromVehicleSearch,
    setFromVehicleSearch,
    formData,
    setFormData,
    filters,
    setFilters,
    vehicleFieldsState,
    setVehicleFieldsState,
    images,
    setImages,
    resetForm,
    shouldFetchActas,
    setShouldFetchActas
  }
}
