import { Footer } from 'flowbite-react'

export function DefaultFooter () {
  return (
    <div className='z-20 navbar__muni'>
      <Footer container className='rounded-none navbar__muni container mx-auto flex justify-between items-center'>
        <span className='text-white text-sm'>
          © {new Date().getFullYear()}{' '}
          <a
            href='https://www.catamarcaciudad.gob.ar'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:underline'
          >
            Municipalidad de la Ciudad de San Fernando Del Valle de Catamarca
          </a>
        </span>
      </Footer>
    </div>
  )
}

export default DefaultFooter
