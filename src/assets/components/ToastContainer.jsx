/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react'

const toastQueue = []

export const addToast = (type, message) => {
  toastQueue.push({ id: Date.now(), type, message })
  window.dispatchEvent(new Event('new-toast'))
}

const toastStyles = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white'
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const showToast = () => {
      if (toastQueue.length) {
        const newToast = toastQueue.shift()
        setToasts((prev) => [...prev, newToast])

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
        }, 3000)
      }
    }

    window.addEventListener('new-toast', showToast)
    return () => window.removeEventListener('new-toast', showToast)
  }, [])

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded shadow-md transition-opacity duration-500 ${toastStyles[toast.type]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
