'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function DoNotSellBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('doNotSellDismissed') !== 'true') setShow(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem('doNotSellDismissed', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black py-3 px-6 flex items-center justify-between z-50">
      <p className="text-sm">
        California residents: <span className="font-medium">Do Not Sell My Personal Information</span>. 
        <a href="/ccpa" className="underline ml-1">Learn more</a>
      </p>
      <button onClick={dismiss} className="hover:bg-black/10 p-1 rounded">
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}