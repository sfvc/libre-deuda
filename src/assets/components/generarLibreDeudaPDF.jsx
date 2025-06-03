import { convertHtmlToPdf } from '@/services/gotenbergService'
import { formatDate } from '@/assets/util/formatDate'
import QRCode from 'qrcode'
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

export const generarLibreDeudaPDF = async (data) => {
  const hoy = new Date()
  const horaActual = hoy.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
  const fechaDB = new Date().toISOString().split('T')[0]
  const fechaValidez = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000)
  const tieneDatosVehiculo = data.patente || data.tipo || data.marca || data.modelo || data.numero_taxi_remis

  const visorUrlBase = 'https://catamarcacapitalvisorpdf.netlify.app/index.html'
  const pdfUrl = data.urlParaQR || `https://archivos-cc.sfo3.digitaloceanspaces.com/juzgado/libre-deuda/${data.infractorDocumento}_${fechaDB}.pdf`
  const qrUrl = `${visorUrlBase}?file=${encodeURIComponent(pdfUrl)}`

  const [qrData, logoBase64] = await Promise.all([
    QRCode.toDataURL(qrUrl),
    convertirImagenABase64(logoCataCapi)
  ])

  const html = `
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; }
        .logo { width: 160px; }
        .form-info { text-align: right; border: 1px solid #000; padding: 10px; font-size: 12px; line-height: 1.5; margin-top: 40px; }
        .main-title { text-align: center; margin-top: 52px; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; }
        .section-title { background: #f0f0f0; font-weight: bold; border: 1px solid #000; padding: 6px; margin-top: 20px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td, .info-table th { border: 1px solid #000; padding: 6px; }
        .info-table th { background-color: #f9f9f9; text-align: left; }
        .content-box { border: 1px solid #000; padding: 20px; font-size: 14px; line-height: 1.6; }
        .bold { font-weight: bold; }
        .qr-container { margin-top: 30px; text-align: center; }
        .footer { font-size: 12px; text-align: center; background-color: #f1f1f1; padding: 15px; border-top: 2px solid #ccc; margin-top: 50px; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoBase64}" class="logo" alt="Logo Capital" />
        <div class="main-title">Certificado de LIBRE DEUDA</div>
        <div class="form-info">
          <strong>Nº de Libre Deuda:</strong> ${data?.libreDeudaID || ''}
        </div>
      </div>

      ${tieneDatosVehiculo
      ? `
          <div class="section-title">Datos del Automotor</div>
          <table class="info-table">
            <tr>
              <th>Dominio</th><td>${data.patente || ''}</td>
              <th>Tipo</th><td>${data.tipo || 'AUTOMOTOR'}</td>
            </tr>
            <tr>
              <th>Marca</th><td>${data.marca || ''}</td>
              <th>Modelo</th><td>${data.modelo || ''}</td>
            </tr>
            ${data.numero_taxi_remis ? `<tr><th>Nº Taxi/Remis</th><td colspan="3">${data.numero_taxi_remis}</td></tr>` : ''}
            <tr>
              <th>Titular</th><td colspan="3">${data.infractorNombreApellido || ''} - DNI ${data.infractorDocumento || ''}</td>
            </tr>
          </table>
        `
      : `
          <table class="info-table">
            <tr>
              <th>Persona</th><td colspan="3">${data.infractorNombreApellido || ''} - DNI ${data.infractorDocumento || ''}</td>
            </tr>
          </table>
        `
    }

      <div class="content-box">
        <span class="bold">CERTIFICO</span> que, conforme a los registros del Juzgado Municipal de Faltas, ${tieneDatosVehiculo
            ? 'el vehículo mencionado no presenta deudas pendientes al día de la fecha.'
            : 'el ciudadano mencionado no presenta deudas pendientes al día de la fecha.'
          }

        <br /><br />
        El presente certificado de <span class="bold">LIBRE DEUDA</span> se emite a solicitud del interesado.

        <br /><br />
        Vigencia hasta el día: <span class="bold">${formatDate(fechaValidez)}</span><br/>
        San Fernando del Valle de Catamarca, a horas <span class="bold">${horaActual}</span> del día <span class="bold">${formatDate(hoy)}</span>.
      </div>

      <div class="qr-container">
        <img src="${qrData}" alt="Código QR" />
        <p style="font-size: 12px; color: #555;">Escanee este código para verificar el certificado</p>
      </div>

      <div class="footer">
        La autenticidad de este certificado puede verificarse escaneando el código QR o ingresando al sitio web oficial.<br />
      </div>
    </body>
  </html>
`

  const pdfBlob = await convertHtmlToPdf(html)
  const fileName = `${data.infractorDocumento}_${fechaDB}.pdf`
  window.open(qrUrl, '_blank')

  return {
    pdfBlob,
    fileName
  }
}
