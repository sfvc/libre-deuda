import { Button, Modal } from 'flowbite-react'

const STEPS = [
  {
    num: 'Paso 1',
    title: 'Elegir modo de consulta',
    desc: (
      <>
        Seleccioná si querés consultar por <strong className='font-medium text-gray-800 dark:text-gray-200'>Persona</strong> o por <strong className='font-medium text-gray-800 dark:text-gray-200'>Vehículo</strong>.
      </>
    ),
    accent: 'bg-blue-500',
    dot: 'bg-blue-500'
  },
  {
    num: 'Paso 2',
    title: 'Buscar la persona',
    desc: (
      <>
        Ingresá el <strong className='font-medium text-gray-800 dark:text-gray-200'>CUIL</strong> del ciudadano y seleccioná la persona correcta.
      </>
    ),
    accent: 'bg-teal-500',
    dot: 'bg-teal-500'
  },
  {
    num: 'Paso 3',
    title: 'Verificar datos personales',
    desc: (
      <>
        Confirmá que el <strong className='font-medium text-gray-800 dark:text-gray-200'>correo</strong> y el <strong className='font-medium text-gray-800 dark:text-gray-200'>teléfono</strong> estén correctos.
      </>
    ),
    accent: 'bg-violet-500',
    dot: 'bg-violet-500'
  },
  {
    num: 'Paso 4',
    title: 'Datos del vehículo',
    desc: (
      <>
        Si elegiste consulta completa, ingresá la <strong className='font-medium text-gray-800 dark:text-gray-200'>patente</strong> y seleccioná el vehículo.
      </>
    ),
    accent: 'bg-amber-500',
    dot: 'bg-amber-500'
  },
  {
    num: 'Paso 5',
    title: 'Verificar información',
    desc: (
      <>
        Presioná <strong className='font-medium text-gray-800 dark:text-gray-200'>Verificar y Continuar</strong> para comprobar si hay multas asociadas.
      </>
    ),
    accent: 'bg-green-500',
    dot: 'bg-green-500'
  },
  {
    num: 'Paso 6',
    title: 'Generar libre deuda',
    desc: (
      <>
        Sin infracciones pendientes, podés generar el <strong className='font-medium text-gray-800 dark:text-gray-200'>Libre Deuda en PDF</strong>.
      </>
    ),
    accent: 'bg-green-700',
    dot: 'bg-green-700'
  }
]

export function TutorialModal ({ show, onClose }) {
  return (
    <Modal
      show={show}
      size='xl'
      position='bottom-center'
      className='[&>div]:!rounded-b-none sm:[&>div]:!rounded-2xl [&>div]:!rounded-t-2xl [&>div]:!m-0 sm:[&>div]:!m-auto'
      onClose={onClose}
    >
      {/* Drag handle — solo visible en mobile */}
      <div className='flex justify-center pt-3 pb-1 sm:hidden'>
        <div className='w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600' />
      </div>

      <Modal.Header className='!pt-3 sm:!pt-5 border-b border-gray-100 dark:border-gray-700'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex-shrink-0'>
            <svg
              className='w-5 h-5 text-blue-600 dark:text-blue-400'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              viewBox='0 0 20 20'
            >
              <circle cx='10' cy='10' r='8' />
              <path d='M10 9v5M10 7h.01' />
            </svg>
          </div>
          <div>
            <p className='text-sm sm:text-base font-semibold text-gray-800 dark:text-white leading-tight'>
              Cómo usar el sistema de libre deuda
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block'>
              Seguí estos pasos para realizar la consulta correctamente
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className='!px-4 sm:!px-6 !py-4 sm:!py-5 overflow-y-auto max-h-[70vh] sm:max-h-none'>

        {/* Steps — 1 col en mobile, 2 cols en sm+ */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4'>
          {STEPS.map((step) => (
            <div
              key={step.num}
              className='relative overflow-hidden flex items-start gap-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 transition-colors p-4 sm:p-3.5 active:bg-gray-50 dark:active:bg-gray-700/60'
            >
              {/* Barra accent izquierda */}
              <span className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm ${step.accent}`} />

              {/* Dot + número en mobile (columna izquierda) */}
              <div className='flex flex-col items-center gap-1 pl-2 flex-shrink-0 sm:hidden pt-0.5'>
                <span className={`w-2.5 h-2.5 rounded-full ${step.dot}`} />
              </div>

              {/* Contenido */}
              <div className='flex-1 pl-0 sm:pl-2 min-w-0'>
                <p className='text-[11px] font-medium text-gray-400 dark:text-gray-500 tracking-wide mb-0.5'>
                  {step.num}
                </p>
                <p className='text-sm sm:text-[13px] font-semibold text-gray-800 dark:text-white mb-1 leading-snug'>
                  {step.title}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 leading-relaxed'>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className='flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3.5 py-3'>
          <svg
            className='w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            viewBox='0 0 16 16'
          >
            <path d='M8 1L1 13h14L8 1z' />
            <path d='M8 6v3.5M8 11h.01' />
          </svg>
          <p className='text-xs text-amber-800 dark:text-amber-300 leading-relaxed'>
            <span className='font-semibold'>Importante: </span>
            Los datos enviados tienen carácter de declaración jurada y deben ser correctos antes de continuar.
          </p>
        </div>

      </Modal.Body>

      <Modal.Footer className='!px-4 sm:!px-6 !py-4 border-t border-gray-100 dark:border-gray-700'>
        <Button
          color='success'
          className='w-full !text-sm !py-2.5 sm:!py-2 sm:w-auto'
          onClick={onClose}
        >
          Entendido
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
