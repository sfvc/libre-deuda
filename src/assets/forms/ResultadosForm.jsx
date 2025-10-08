import { Alert, Button } from 'flowbite-react'
import { useState } from 'react'
import { addToast } from '../components/ToastContainer'
import Loading from '@/Loading'

export const ResultadosForm = ({
  isLoading,
  data,
  handleMultasPagadas,
  handleGenerateLibreDeuda,
  isGeneratingPdf,
  resetForm
}) => {
  const [hasGeneratedLibreDeuda, setHasGeneratedLibreDeuda] = useState(false)

  const handleGenerate = async () => {
    try {
      await handleGenerateLibreDeuda()
      setHasGeneratedLibreDeuda(true)
      addToast('success', '¡Libre deuda generado correctamente!')
    } catch (error) {
      addToast('error', 'Hubo un error al generar el libre deuda. Intenta nuevamente.')
    }
  }

  // Obtener valor para enviar en la query: CUIT o Patente
  const getPagoQueryParam = () => {
    const primerRegistro = data?.data?.[0]
    if (!primerRegistro) return ''

    if (primerRegistro.infractores?.[0]?.cuit) {
      return `cuit=${primerRegistro.infractores[0].cuit}`
    }

    if (primerRegistro.vehiculo?.[0]?.patente) {
      return `patente=${primerRegistro.vehiculo[0].patente}`
    }

    return ''
  }

  return (
    <div className='text-center w-full'>
      {isLoading
        ? <Loading />
        : handleMultasPagadas()
          ? (
            <>
              <Alert color='success' className='mb-4'>
                <p className='text-green-700 text-lg font-semibold'>
                  El ciudadano no registra infracciones impagas al momento de la consulta.
                </p>
              </Alert>
              <Button
                className='mt-6 w-full py-3 rounded-lg transition duration-300 ease-in-out text-white text-lg flex justify-center items-center
              disabled:bg-gray-400 bg-blue-500 hover:bg-blue-600'
                onClick={handleGenerate}
                disabled={isGeneratingPdf || hasGeneratedLibreDeuda}
              >
                {isGeneratingPdf ? <Loading /> : hasGeneratedLibreDeuda ? 'Consulta de nuevo para generar otro libre deuda' : 'Generar Libre Deuda'}
              </Button>
            </>
            )
          : (
            <div>
              <Alert color='failure' className='mb-4'>
                <p className='text-red-600 text-lg font-semibold'>
                  No puedes generar tu libre deuda porque tienes multas pendientes.
                  {data?.data?.[0]?.juzgado_id === 2
                    ? ' Por favor, acércate al juzgado de faltas N°2. '
                    : ' Por favor, acércate al juzgado de faltas N°1. '}
                  Ubicado en la calle Maipu Norte 550 de 07:00 AM hasta 16:00 PM.
                </p>
              </Alert>

              <Alert color='success' className='mb-4'>
                <p className='text-green-600 text-lg font-semibold'>
                  O paga de forma online dandole al boton "Pagar Deudas"
                </p>
              </Alert>
            </div>
            )}

      <Button
        className={`mt-4 w-full py-2 rounded-lg text-white transition ${hasGeneratedLibreDeuda
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-500 hover:bg-gray-600'
          }`}
        onClick={() => {
          setHasGeneratedLibreDeuda(false)
          resetForm()
        }}
      >
        Consultar Nuevamente
      </Button>

      <Button
        className='mt-4 w-full py-2 rounded-lg text-white bg-green-500 hover:bg-green-600 transition'
        onClick={() => {
          const query = getPagoQueryParam()
          if (query) {
            window.open(`https://pagosonlinejuzgado.netlify.app/?${query}`, '_blank')
          } else {
            addToast('error', 'No se encontró información para realizar el pago.')
          }
        }}
      >
        Pagar Deudas
      </Button>
    </div>
  )
}
