export const useFormValidation = (formData, modoConsulta, images) => {
  const validateMarca = () => formData.marca && formData.marca.trim().length > 0
  const validateModelo = () => formData.modelo && formData.modelo.trim().length > 0
  const validateTipo = () => formData.tipo && formData.tipo.trim().length > 0

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
        'Frente de la cédula': images.cedulaImageFrente,
        'Dorso de la cédula': images.cedulaImageDorso
      })
    }

    const missingFields = Object.entries(validationRules)
      .filter(([_, value]) => !value)
      .map(([field]) => `• ${field}`)

    if (missingFields.length > 0) {
      return {
        isValid: false,
        errorMessage: `Faltan completar los siguientes campos obligatorios:\n\n${missingFields.join('\n')}\n\nPor favor, completalos antes de continuar.`
      }
    }

    return { isValid: true, errorMessage: '' }
  }

  return { validateForm }
}
