import { deleteDuplicateName } from '../util/deleteDuplicateName'

export const formatearData = async (acta) => {
  const f = new Date()
  const fechaActual = f.toLocaleDateString('es-AR')

  const primerInfractor = acta?.infractores?.[0]

  const data = {
    fechaActual: fechaActual || '',

    infractorNombreApellido: deleteDuplicateName(
      primerInfractor?.apellido || '',
      primerInfractor?.nombre || ''
    ),
    infractorDocumento: primerInfractor?.documento || '',
    cuit: primerInfractor?.cuit || '',

    patente: acta?.vehiculo?.dominio || '',
    marca: acta?.vehiculo?.marca || '',
    modelo: acta?.vehiculo?.modelo || '',
    tipo: acta?.vehiculo?.tipo || '',
    numeroTaxiRemis: acta?.vehiculo?.numero_taxi_remis || ''
  }

  return data
}
