import { Label, Select } from 'flowbite-react'

export const ModoConsulta = ({ modoConsulta, setModoConsulta }) => (
  <div className='w-full'>
    <Label htmlFor='modoConsulta' className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
      <strong>Modo de Consulta</strong>
    </Label>
    <Select
      id='modoConsulta'
      value={modoConsulta}
      onChange={(e) => setModoConsulta(e.target.value)}
      className='mb-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-200'
    >
      <option value='simple'>Consultar por Persona</option>
      <option value='completo'>Consultar por Vehículo</option>
    </Select>
  </div>
)

// Con botones de radio

// import { Label, Radio } from 'flowbite-react'

// export const ModoConsulta = ({ modoConsulta, setModoConsulta }) => (
//   <div className='w-full'>
//     <Label className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
//       <strong>Modo de Consulta</strong>
//     </Label>
//     <div className='flex flex-row md:gap-8 gap-2 mb-4'>
//       <div className='flex items-center gap-2'>
//         <Radio
//           id='modo-simple'
//           name='modoConsulta'
//           value='simple'
//           checked={modoConsulta === 'simple'}
//           onChange={(e) => setModoConsulta(e.target.value)}
//         />
//         <Label htmlFor='modo-simple'>Consultar por Persona</Label>
//       </div>
//       <div className='flex items-center gap-2'>
//         <Radio
//           id='modo-completo'
//           name='modoConsulta'
//           value='completo'
//           checked={modoConsulta === 'completo'}
//           onChange={(e) => setModoConsulta(e.target.value)}
//         />
//         <Label htmlFor='modo-completo'>Consultar por Vehículo</Label>
//       </div>
//     </div>
//   </div>
// )
