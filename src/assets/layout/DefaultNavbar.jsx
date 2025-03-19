import React from 'react'
import Logo from '@/images/logo-capital-dark.webp'

export function DefaultNavbar () {
  return (
    <header className='navbar__muni text-white py-2'>
      <div className='container mx-auto flex justify-between items-center'>
        <a href='https://www.catamarcaciudad.gob.ar' target='_blank' rel='noreferrer'><img src={Logo} alt='Logo Catamarca' className='max-w-full h-12 w-auto m-2' /></a>
      </div>
    </header>
  )
}

export default DefaultNavbar
