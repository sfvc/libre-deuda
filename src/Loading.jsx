import React from 'react'

const Loading = () => {
  return (
    <div
      className='flex flex-col items-center justify-center app_height'
      role='status'
      aria-label='Cargando contenido, por favor espere'
    >
      <span className='inline-block mt-1 font-medium text-sm text-gray-600 dark:text-gray-400'>
        Cargando...
      </span>
      <div className='mt-2 flex space-x-2'>
        <div className='h-2 w-2 rounded-full bg-blue-500 animate-pulse' />
        <div className='h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-150' />
        <div className='h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-300' />
      </div>
    </div>
  )
}

export default Loading
