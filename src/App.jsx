import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/assets/layout/Layout'
import Error from '@/pages/404'
import LibreDeudaPage from '@/pages/LibreDeudaPage'

function App () {
  return (

    <Routes>
      {/* Rutas envueltas por el Layout */}
      <Route element={<Layout />}>
        <Route path='/' element={<LibreDeudaPage />} />
      </Route>

      {/* Rutas fuera del Layout */}
      <Route path='*' element={<Navigate to='/404' />} />
      <Route path='/404' element={<Error />} />
    </Routes>
  )
}

export default App
