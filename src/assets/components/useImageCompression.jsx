import imageCompression from 'browser-image-compression'
import { useState } from 'react'

export const useImageCompression = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleCompressImage = async (file) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }

    setIsLoading(true)

    try {
      const compressedFile = await imageCompression(file, options)

      return compressedFile
    } catch (error) {
      console.error('Error al comprimir imagen:', error)
      return file
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleCompressImage
  }
}
