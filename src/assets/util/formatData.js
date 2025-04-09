import { deleteDuplicateName } from '../util/deleteDuplicateName'

export const combinarMarcaYModelo = (vehiculo) => {
  const marca = vehiculo?.marca || ''
  const modelo = vehiculo?.modelo || ''
  return `${marca} ${modelo}`.trim()
}

export const formatearData = async (acta) => {
  const f = new Date()
  const fechaActual = f.toLocaleDateString('es-AR')

  let personas = ''
  let documentos = ''

  for (const [i, infractor] of acta?.infractores?.entries() || []) {
    if (i === 0) {
      personas = deleteDuplicateName(infractor?.apellido || '', infractor?.nombre || '')
      documentos = String(infractor?.documento || '')
    } else {
      personas += `, ${deleteDuplicateName(infractor?.apellido || '', infractor?.nombre || '')}`
      documentos += `, ${String(infractor?.documento || '')}`
    }
  }

  const vehiculoFormatted = combinarMarcaYModelo(acta?.vehiculo)

  const data = {
    // Fecha actual
    fechaActual: fechaActual || '',

    // Acta
    causa: acta?.numero_causa || '',
    acta: acta?.numero_acta || '',
    infractorNombreApellido: personas || '',
    infractorDocumento: documentos || '',

    // Vehiculo
    patente: acta?.vehiculo?.dominio || '',
    marca: acta?.vehiculo?.marca || '',
    modelo: acta?.vehiculo?.modelo || '',
    vehiculo: vehiculoFormatted || '',
    tipo: acta?.vehiculo?.tipo || '',
    numeroTaxiRemis: acta?.vehiculo?.numero_taxi_remis || ''
  }

  return data
}
