import React, { useState } from 'react'
import { Outlet } from 'react-router-dom/dist'

export function Layout () {
  return (
    <div className='flex flex-col min-h-screen'>
      <Outlet />
    </div>
  )
}

export default Layout
