import { useEffect, useState } from 'react'

interface UseBarcodeScannerProps {
    onScan: (barcode: string) => void
    minLength?: number
    timeout?: number
}

export function useBarcodeScanner({ onScan, minLength = 3, timeout = 50 }: UseBarcodeScannerProps) {
    useEffect(() => {
        let barcodeBuffer = ''
        let lastKeyTime = Date.now()

        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input field
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return
            }

            const currentTime = Date.now()
            
            // If more than timeout (ms) between keys, reset buffer (it's likely manual typing)
            if (currentTime - lastKeyTime > timeout) {
                barcodeBuffer = ''
            }
            
            lastKeyTime = currentTime

            if (e.key === 'Enter') {
                if (barcodeBuffer.length >= minLength) {
                    onScan(barcodeBuffer)
                    barcodeBuffer = ''
                }
            } else if (e.key.length === 1) {
                // Only append printable characters
                barcodeBuffer += e.key
            }
        }

        window.addEventListener('keypress', handleKeyPress)
        return () => window.removeEventListener('keypress', handleKeyPress)
    }, [onScan, minLength, timeout])
}
