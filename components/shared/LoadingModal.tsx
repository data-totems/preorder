import { Loader2 } from 'lucide-react'
import React from 'react'

const LoadingModal = ({ message }: { message?: string}) => {
  return (
    <div className='h-screen bg-white text-black flex flex-col justify-center items-center'>
      <Loader2 className='animate-spin text-green-500 ' size={30}  />

      {message && (
        <h2 className="text-sm text-muted-foreground">{message}</h2>
      )}
    </div>
  )
}

export default LoadingModal
