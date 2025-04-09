import { useState } from 'react'
import { convertHtmlToPdf } from '../../services/gotenbergService'

export default function HtmlToPdfButton () {
  const [loading, setLoading] = useState(false)

  const handleDownloadPdf = async () => {
    setLoading(true)
    try {
      const html = `
        <html>
          <head><title>Ejemplo</title></head>
          <body>
            <h1>Hola desde React</h1>
            <p>Este PDF fue generado con Gotenberg.</p>
          </body>
        </html>
      `

      const pdfBlob = await convertHtmlToPdf(html)

      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'archivo.pdf'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al generar el PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDownloadPdf} disabled={loading}>
      {loading ? 'Generando PDF...' : 'Descargar PDF'}
    </button>
  )
}
