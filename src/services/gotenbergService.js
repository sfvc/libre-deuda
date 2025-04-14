export const convertHtmlToPdf = async (htmlContent) => {
  const formData = new FormData()

  const htmlBlob = new Blob([htmlContent], { type: 'text/html' })

  formData.append('files', htmlBlob, 'index.html')
  formData.append('index.html', 'index.html')

  const response = await fetch('https://apis.v1.cc.gob.ar/gotenberg/forms/chromium/convert/html', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Error al convertir HTML a PDF')
  }

  return await response.blob()
}
