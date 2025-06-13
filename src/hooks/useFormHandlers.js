import { postPersonaDatos } from '@/services/multasService'

export const useFormHandlers = (state) => {
  const {
    formData, setFormData,
    setFilters,
    setShouldDisableFields,
    setFromVehicleSearch,
    setVehicleFieldsState,
    setShowPersonaForm,
    setShowTitularAlert,
    modoConsulta,
    images,
    setErrorMessage,
    setEnabled,
    setIsCheckingStatus,
    setIsValidated,
    setShowResults,
    setIsVerifying,
    setNumeroLibreDeuda
  } = state

  const handleInputChange = (e, tipos) => {
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
      email: persona?.email || '',
      telefono: persona?.telefono || '',
      dni: persona?.documento || persona?.dni || ''
    }))
    setShouldDisableFields(false)
    setFromVehicleSearch(false)
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

    setVehicleFieldsState({
      disableMarca: false,
      disableModelo: false,
      disableTipo: false
    })

    if (modoConsulta === 'completo') {
      setShowPersonaForm(true)
      setFromVehicleSearch(true)

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

  const handleSubmit = async () => {
    setIsVerifying(true)
    const dataToSend = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        const val = value === 'ㅤ' ? '' : value
        dataToSend.append(key, val)
      }
    })

    Object.entries(images).forEach(([key, image]) => {
      if (image instanceof File) {
        const fieldName = key === 'marbeteImage'
          ? 'foto_marbete'
          : key === 'cedulaImageFrente'
            ? 'foto_cedula_frente'
            : 'foto_cedula_dorso'
        dataToSend.append(fieldName, image)
      }
    })

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

  return {
    handleInputChange,
    handlePersonaSelect,
    handleVehiculoSelect,
    handleSubmit
  }
}
