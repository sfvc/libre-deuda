import QRCode from 'qrcode'
import { convertHtmlToPdf } from '@/services/gotenbergService'

export const generarLibreDeudaPDF = async (data) => {
  const qrData = await QRCode.toDataURL(`https://api-test-juzgado.cc.gob.ar/api/v1/libre-deuda?persona_id=${data.persona_id || ''}`) // Mandarle la url correcta cuando lo definamos

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 3rem; }
          h1, h2, h3 { text-align: center; }
          .qr-container { margin-top: 2rem; text-align: center; }
          .field { margin: 1rem 0; }
          .label { font-weight: bold; display: inline-block; width: 150px; }
          .line { margin: 0.5rem 0; }
        </style>
      </head>
      <body>
        <h2>MUNICIPALIDAD DE LA CIUDAD DE S.F. DEL VALLE DE CATAMARCA</h2>
        <h3>JUZGADO MUNICIPAL DE FALTAS</h3>

        <div class="field"><span class="label">LIBRE DEUDA N°:</span> ${data?.libreDeudaID || ''}</div>

        ${data?.vehiculo
? `
          <div class="field"><span class="label">VEHÍCULO:</span> ${data.vehiculo}</div>
          <div class="field"><span class="label">DOMINIO:</span> ${data.patente || ''} ${data.numeroTaxiRemis || ''}</div>
        `
: ''}

        <div class="field"><span class="label">PROPIETARIO:</span> ${data.infractorNombreApellido || ''} D.N.I N° ${data.infractorDocumento || ''}</div>

        <p class="line">
          CERTIFICO QUE EL ${data?.vehiculo ? 'VEHÍCULO DESCRIPTO PRECEDENTEMENTE' : 'PROPIETARIO'} NO POSEE DEUDA AL DIA ${data?.fechaActual || ''} EN EL JUZGADO DE FALTAS MUNICIPAL.
        </p>

        <p class="line">San Fernando del Valle de Catamarca, ${data?.fechaActual || ''}</p>

        <div class="qr-container">
          <img src="${qrData}" alt="Código QR" />
        </div>
      </body>
    </html>
  `

  const pdfBlob = await convertHtmlToPdf(html)
  const url = window.URL.createObjectURL(pdfBlob)
  window.open(url, '_blank')
}
