import React from 'react'
import { Link } from 'react-router-dom'
import Illustration from '@/images/logo_CATACAPI_oscuro.png'

function Error () {
  return (
    <div className='min-h-screen flex flex-col justify-center items-center text-center py-20 dark:bg-slate-900 bg-gray-100'>
      <img
        src={Illustration}
        alt='Página no encontrada'
        className='pointer-events-none h-48 w-auto mb-8'
      />

      <div className='max-w-[546px] mx-auto w-full'>
        <h4 className='text-slate-900 dark:text-white text-2xl font-semibold mb-4'>
          Oops! Página no encontrada
        </h4>
        <p className='dark:text-slate-400 text-slate-600 text-lg mb-8'>
          La página que estás buscando puede haber sido movida, eliminada o no está disponible temporalmente.
        </p>
      </div>

      <div className='max-w-[300px] mx-auto w-full'>
        <Link
          to='/'
          className='inline-block px-6 py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg'
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default Error
