import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Error from './pages/404'
import Layout from './assets/layout/Layout'
import LibreDeudaPage from './pages/LibreDeudaPage'
import { Pdf } from './pages/Pdf'

function App () {
  return (

    <Routes>
      {/* Rutas envueltas por el Layout */}
      <Route element={<Layout />}>
        <Route path='/' element={<LibreDeudaPage />} />

        <Route path='/pdf' element={<Pdf />} />
      </Route>

      {/* Rutas fuera del Layout */}
      <Route path='*' element={<Navigate to='/404' />} />
      <Route path='/404' element={<Error />} />
    </Routes>
  )
}

export default App
