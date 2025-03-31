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
  let titular = ''

  for (const [i, infractor] of acta?.infractores?.entries() || []) {
    if (i === 0) {
      personas = deleteDuplicateName(infractor?.apellido || '', infractor?.nombre || '')
      documentos = infractor?.documento || ''
    } else {
      personas += `, ${deleteDuplicateName(infractor?.apellido || '', infractor?.nombre || '')}`
      documentos += `, ${infractor?.documento || ''}`
    }
  }

  const vehiculoFormatted = combinarMarcaYModelo(acta?.vehiculo)

  if (acta?.vehiculo?.titular) {
    const apellido = acta?.vehiculo?.titular?.apellido || ''
    const nombre = acta?.vehiculo?.titular?.nombre || ''
    const numeroDocumento = acta?.vehiculo?.titular?.numero_documento || ''

    titular = `${deleteDuplicateName(apellido, nombre)} - ${numeroDocumento}`
  }

  const data = {
    // Fecha actual
    fechaActual: fechaActual || '',

    // Acta
    causa: acta?.numero_causa || '',
    acta: acta?.numero_acta || '',
    infractorNombreApellido: personas || '',
    infractorDocumento: documentos || '',
    fechaActa: acta?.fecha || '',
    actaHs: acta?.hora || '',
    actaObservaciones: acta?.observaciones || '',
    lugar: acta?.lugar || '',

    // Vehiculo
    titular,
    patente: acta?.vehiculo?.dominio || '',
    chasis: acta?.vehiculo?.numero_chasis || '',
    motor: acta?.vehiculo?.numero_motor || '',
    marca: acta?.vehiculo?.marca || '',
    modelo: acta?.vehiculo?.modelo || '',
    vehiculo: vehiculoFormatted || '',
    tipo: acta?.vehiculo?.tipo || '',
    numeroTaxiRemis: acta?.vehiculo?.numero_taxi_remis || ''
  }

  return data
}
