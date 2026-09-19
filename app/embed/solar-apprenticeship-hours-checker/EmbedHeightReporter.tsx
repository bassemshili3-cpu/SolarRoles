'use client'

import { useEffect } from 'react'

const MESSAGE_TYPE = 'solarroles:solar-hours-checker:resize'

export default function EmbedHeightReporter() {
  useEffect(() => {
    let frame = 0

    const reportHeight = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        window.parent.postMessage(
          {
            type: MESSAGE_TYPE,
            height: Math.ceil(document.documentElement.scrollHeight),
          },
          '*',
        )
      })
    }

    const observer = new ResizeObserver(reportHeight)
    observer.observe(document.documentElement)
    window.addEventListener('load', reportHeight)
    reportHeight()

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('load', reportHeight)
    }
  }, [])

  return null
}
