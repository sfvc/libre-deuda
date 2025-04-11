import React from 'react'
import { Alert, Button } from 'flowbite-react'
import Loading from '@/Loading'

export const ResultadosForm = ({
  isLoading,
  data,
  handleMultasPagadas,
  handleGenerateLibreDeuda,
  isGeneratingPdf,
  resetForm
}) => (
  <div className='text-center w-full'>
    {isLoading
      ? (
        <Loading />
        )
      : handleMultasPagadas()
        ? (
          <>
            <Alert color='success' className='mb-4'>
              <p className='text-green-700 text-lg font-semibold'>
                No posees multas o todas están pagadas.
              </p>
            </Alert>
            <Button
              className='mt-6 w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out text-white text-lg flex justify-center items-center'
              onClick={handleGenerateLibreDeuda}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? <Loading /> : 'Generar Libre Deuda'}
            </Button>
          </>
          )
        : (
          <Alert color='failure' className='mb-4'>
            <p className='text-red-600 text-lg font-semibold'>
              No puedes generar tu libre deuda porque tienes multas pendientes.
              {data?.data?.[0]?.juzgado_id === 2
                ? ' Por favor, acércate al juzgado de faltas N°2. '
                : ' Por favor, acércate al juzgado de faltas N°1. '}
              Ubicado en la calle Maipu Norte 550 de 07:00 AM hasta 16:00 PM.
            </p>
          </Alert>
          )}
    <Button
      className='mt-4 w-full py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white'
      onClick={resetForm}
    >
      Consultar Nuevamente
    </Button>
  </div>
)
