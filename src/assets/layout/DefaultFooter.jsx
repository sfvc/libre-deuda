import { Footer } from 'flowbite-react'
import { MapPin, Phone, Mail, Globe, BadgeInfo, Badge } from 'lucide-react'

export function DefaultFooter () {
  return (
    <div className='navbar__muni text-white mt-auto'>
      <Footer container className='navbar__muni rounded-none'>
        <div className='container mx-auto w-full px-4 py-2'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-sm'>

            {/* Institución */}

            <div>
              <h3 className='font-semibold text-white mb-3'>
                Juzgado de Faltas Municipal
              </h3>

              <p className='text-white/90'>
                Sistema oficial para solicitar el libre deuda de infracciones de tránsito.
                Correspondientes a infracciones registradas por el
                Juzgado de Faltas de la Municipalidad de la Ciudad
                de San Fernando del Valle de Catamarca.
              </p>
            </div>

            {/* Contacto */}

            <div>
              <h3 className='font-semibold text-white mb-3'>
                Información de Contacto
              </h3>

              <ul className='space-y-2 text-white/90'>

                <li>
                  <a
                    href='https://maps.app.goo.gl/p6Ctxfd3hqmMK4A88'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 hover:text-white hover:underline'
                  >
                    <MapPin size={16} />
                    Maipú Norte 550, Catamarca, Argentina
                  </a>
                </li>

                <li>
                  <a
                    href='tel:+5493834437408'
                    className='flex items-center gap-2 hover:text-white hover:underline'
                  >
                    <Phone size={16} />
                    +54 9 383 4437408
                  </a>
                </li>

                <li>
                  <a
                    href='mailto:juzgadodefaltas@catamarcaciudad.gob.ar'
                    className='flex items-center gap-2 hover:text-white hover:underline'
                  >
                    <Mail size={16} />
                    juzgadodefaltas@catamarcaciudad.gob.ar
                  </a>
                </li>

              </ul>
            </div>

            {/* Enlaces oficiales */}

            <div>
              <h3 className='font-semibold text-white mb-3'>
                Enlaces Oficiales
              </h3>

              <ul className='space-y-2'>

                <li>
                  <a
                    href='https://www.catamarcaciudad.gob.ar'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 text-white/90 hover:text-white hover:underline'
                  >
                    <Globe size={16} />
                    Portal Oficial del Municipio
                  </a>
                </li>

                <li>
                  <a
                    href='https://juzgadoinfo.netlify.app/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 text-white/90 hover:text-white hover:underline'
                  >
                    <BadgeInfo size={16} />
                    Portal Informativo del Juzgado de Faltas
                  </a>
                </li>

                <li>
                  <a
                    href='https://portal.catamarca.gob.ar/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 text-white/90 hover:text-white hover:underline'
                  >
                    <Badge size={16} />
                    Gobierno de la Ciudad
                  </a>
                </li>

              </ul>
            </div>
          </div>

          <div className='border-t border-white/20 mt-6 pt-4 text-center text-xs text-white/80'>
            © {new Date().getFullYear()} Municipalidad de la Ciudad de
            San Fernando del Valle de Catamarca.
            Secretaria de Gabinete y Modernizacion.
          </div>

        </div>
      </Footer>
    </div>
  )
}

export default DefaultFooter
