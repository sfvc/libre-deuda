import { useState } from 'react'
import QRCode from 'qrcode'
import { convertHtmlToPdf } from '../../services/gotenbergService'

export const HtmlToPdfWithQR = () => {
  const [loading, setLoading] = useState(false)

  const handleDownloadPdf = async () => {
    setLoading(true)
    try {
      // Generar el código QR (puedes cambiar el contenido)
      const qrData = await QRCode.toDataURL('https://www.catamarcaciudad.gob.ar/') // Agregar url con query si hace falta

      // Crear HTML y agregar QR
      const html = `
        <html>
          <head>
            <title>PDF con QR</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 2rem; }
              .qr-container { margin-top: 2rem; }
              .qr-container img { width: 150px; height: 150px; }
            </style>
          </head>
          <body>
            <h1>Documento Oficial</h1>
            <p>Este documento contiene un código QR para ver más detalles.</p>
            <div class="qr-container">
              <img src="${qrData}" alt="Código QR">
            </div>
          </body>
        </html>
      `

      const pdfBlob = await convertHtmlToPdf(html)

      const url = window.URL.createObjectURL(pdfBlob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error al generar el PDF con QR:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='text-center min-h-screen w-full'>
      <button className='bg-blue-500 px-4 py-2 text-white' onClick={handleDownloadPdf} disabled={loading}>
        {loading ? 'Generando PDF...' : 'Descargar PDF'}
      </button>
    </div>

  )
}
