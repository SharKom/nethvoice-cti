// QueueAnswerDrawerContent.tsx
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { closeSideDrawer } from '../../lib/utils'

interface QueueAnswerDrawerContentProps {
  config: {
    iframeUrl?: string
    [key: string]: any
  }
}

export const QueueAnswerDrawerContent: React.FC<QueueAnswerDrawerContentProps> = ({ config }) => {
  const dispatch = useDispatch()
  // Recupera l'URL dall'oggetto config; assicurati che sia un URL assoluto
  const iframeUrl = config?.iframeUrl || 'https://example.com'

  // Funzione di chiusura manuale
  const handleClose = () => {
    closeSideDrawer() // Chiamata diretta, senza dispatch
  }

  return (
    <div className="drawer-container">
      <div className="drawer-header flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Call Back</h2>
        <button onClick={handleClose} className="text-red-600">
          Chiudi
        </button>
      </div>
      <div className="drawer-content p-4">
        <iframe
          src={iframeUrl}
          style={{ width: '100%', height: '80vh', border: 'none' }}
          title="Informazioni Chiamata"
        />
      </div>
    </div>
  )
}
