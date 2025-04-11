import QRCode from 'qrcode'
import { convertHtmlToPdf } from '@/services/gotenbergService'
import logoCataCapi from '@/images/logo_CATACAPI_oscuro.png'

const convertirImagenABase64 = (ruta) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = ruta

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL('image/png')
      resolve(dataURL)
    }

    img.onerror = reject
  })
}

export const GenerarLibreDeudaPDF = async (data) => {
  const hoy = new Date()
  const fechaActual = hoy.toLocaleDateString('es-AR')
  const fechaDB = new Date().toISOString().split('T')[0]
  const fechaValidez = new Date(hoy.setMonth(hoy.getMonth() + 6)).toLocaleDateString('es-AR')
  const tieneDatosVehiculo = data.patente || data.tipo || data.marca || data.modelo
  const [qrData, logoBase64] = await Promise.all([
    QRCode.toDataURL(`https://archivos-cc.sfo3.digitaloceanspaces.com/juzgado/libre-deuda/${data.infractorDocumento}_${fechaDB}.pdf`),
    convertirImagenABase64(logoCataCapi)
  ])

  const html = `
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; font-size: 14px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; }
        .logo { width: 160px; }
        .form-info { text-align: right; border: 1px solid #000; padding: 10px; font-size: 12px; line-height: 1.5; margin-top: 40px; }
        .main-title { text-align: center; margin-top: 50px; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; }
        .section-title { background: #f0f0f0; font-weight: bold; border: 1px solid #000; padding: 6px; margin-top: 20px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td, .info-table th { border: 1px solid #000; padding: 6px; }
        .info-table th { background-color: #f9f9f9; text-align: left; }
        .content-box { border: 1px solid #000; padding: 20px; font-size: 14px; line-height: 1.6; }
        .bold { font-weight: bold; }
        .qr-container { margin-top: 30px; text-align: center; }
        .footer { margin-top: 20px; font-size: 12px; text-align: center; border-top: 1px solid #000; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoBase64}" class="logo" alt="Logo Capital" />
        <div class="main-title">Certificado de LIBRE DEUDA</div>
        <div class="form-info">
          <strong>Libre Deuda Nº:</strong> ${data?.libreDeudaID || ''}
        </div>
      </div>

      ${tieneDatosVehiculo
      ? `
        <div class="section-title">Datos del Automotor</div>
        <table class="info-table">
          <tr>
            <th>Patente</th><td>${data.patente || ''}</td>
            <th>Tipo</th><td>${data.tipo || 'AUTOMOTOR'}</td>
          </tr>
          <tr>
            <th>Marca</th><td>${data.marca || ''}</td>
            <th>Modelo</th><td>${data.modelo || ''}</td>
          </tr>
          <tr>
            <th>Titular</th><td colspan="3">${data.infractorNombreApellido || ''} - DNI ${data.infractorDocumento || ''}</td>
          </tr>
        </table>
      `
      : `
        <table class="info-table">
          <tr>
            <th>Titular</th><td colspan="3">${data.infractorNombreApellido || ''} - DNI ${data.infractorDocumento || ''}</td>
          </tr>
        </table>
      `}

      <div class="content-box">
        El funcionario que suscribe <span class="bold">CERTIFICA</span> que no registran deudas sin abonar en el Juzgado Municipal de Faltas, sin deuda pendiente al día de la fecha.

        <br /><br />
        A solicitud del interesado y a los fines de ser presentado ante quien corresponda, se extiende el presente <span class="bold">LIBRE DEUDA</span>.

        <br /><br />
        Válido hasta el día: <span class="bold">${fechaValidez}</span><br/>
        San Fernando del Valle de Catamarca <span class="bold">${fechaActual}</span>
      </div>

      <div class="qr-container">
        <img src="${qrData}" alt="Código QR" />
      </div>

      <div class="footer">
        La veracidad de este formulario puede ser consultada escaneando el código QR o accediendo al sitio oficial.<br />
        Generado el: ${fechaActual}
      </div>
    </body>
  </html>
`

  const pdfBlob = await convertHtmlToPdf(html)
  const url = window.URL.createObjectURL(pdfBlob)
  window.open(url, '_blank')
}
