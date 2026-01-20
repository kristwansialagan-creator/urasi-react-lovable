import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Camera } from 'lucide-react'

interface BarcodeScannerProps {
    onScan: (barcode: string) => void
    trigger?: React.ReactNode
}

export function BarcodeScanner({ onScan, trigger }: BarcodeScannerProps) {
    const [open, setOpen] = useState(false)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const [mountKey, setMountKey] = useState(0)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [scanFlash, setScanFlash] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const stopCameraTracks = () => {
        const videos = containerRef.current?.querySelectorAll('video') ?? []
        videos.forEach((video) => {
            const stream = video.srcObject as MediaStream | null
            stream?.getTracks().forEach((t) => t.stop())
            video.srcObject = null
        })
    }

    const clearScanner = async () => {
        const current = scannerRef.current
        try {
            await current?.clear()
        } catch {}
        scannerRef.current = null
        stopCameraTracks()
    }

    const playBeep = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
            if (!AudioContextClass) return
            const audioContext = new AudioContextClass()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
            gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.12)

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.13)
            oscillator.onended = () => {
                try {
                    audioContext.close()
                } catch {
                    // ignore
                }
            }
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        if (!open) {
            setErrorMessage(null)
            void clearScanner()
            return
        }

        if (!window.isSecureContext) {
            setErrorMessage('Camera hanya bisa diakses pada HTTPS atau localhost.')
            return
        }

        const timer = setTimeout(() => {
            const elementId = 'reader'
            const element = document.getElementById(elementId)
            
            if (element && !scannerRef.current) {
                try {
                    setErrorMessage(null)
                    navigator.mediaDevices?.getUserMedia?.({
                        video: { facingMode: { ideal: 'environment' } }
                    }).then((stream) => {
                        stream.getTracks().forEach((t) => t.stop())
                    }).catch((err: any) => {
                        const name = err?.name || 'UnknownError'
                        if (name === 'NotAllowedError' || name === 'SecurityError') {
                            setErrorMessage('Izin kamera ditolak. Silakan izinkan kamera di pengaturan browser.')
                        } else if (name === 'NotFoundError') {
                            setErrorMessage('Kamera tidak ditemukan pada perangkat ini.')
                        } else {
                            setErrorMessage('Gagal mengakses kamera. Coba refresh halaman atau ganti browser.')
                        }
                    })

                    const scanner = new Html5QrcodeScanner(
                        elementId,
                        { 
                            fps: 15,
                            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                                const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
                                const size = Math.floor(minEdge * 0.72)
                                return { width: size, height: size }
                            },
                            aspectRatio: 1.0,
                            showTorchButtonIfSupported: true,
                            showZoomSliderIfSupported: true,
                            defaultZoomValueIfSupported: 2,
                            rememberLastUsedCamera: true,
                            videoConstraints: { facingMode: { ideal: 'environment' } },
                            formatsToSupport: [
                                Html5QrcodeSupportedFormats.QR_CODE,
                                Html5QrcodeSupportedFormats.EAN_13,
                                Html5QrcodeSupportedFormats.EAN_8,
                                Html5QrcodeSupportedFormats.CODE_128,
                                Html5QrcodeSupportedFormats.UPC_A,
                                Html5QrcodeSupportedFormats.UPC_E,
                                Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION
                            ]
                        },
                        /* verbose= */ false
                    )

                    scanner.render((decodedText: string) => {
                        setScanFlash(true)
                        if (navigator.vibrate) navigator.vibrate(80)
                        playBeep()
                        onScan(decodedText)
                        setTimeout(() => setScanFlash(false), 250)
                        stopCameraTracks()
                        setOpen(false)
                    }, (error: any) => {
                        const msg = error?.toString() || ""
                        if (msg.includes("NotFoundException")) {
                            return
                        }
                    })
                    
                    scannerRef.current = scanner
                } catch (err) {
                    setErrorMessage('Scanner gagal diinisialisasi. Coba refresh halaman.')
                }
            }
        }, 350)

        return () => {
            clearTimeout(timer)
            void clearScanner()
        }
    }, [open, onScan, mountKey])

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) stopCameraTracks()
            setOpen(val)
            if (val) setMountKey(k => k + 1)
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="icon">
                        <Camera className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-2 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[hsl(var(--foreground))]">Scan Barcode</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <div ref={containerRef} className="w-full max-w-sm overflow-hidden rounded-xl border-2 border-[hsl(var(--ring))] bg-white relative">
                        {scanFlash && <div className="absolute inset-0 ring-4 ring-green-500 pointer-events-none" />}
                        <div id="reader" className="w-full urasi-scanner" />
                    </div>
                    {errorMessage ? (
                        <p className="text-sm font-medium text-[hsl(var(--destructive))] mt-4 text-center">
                            {errorMessage}
                        </p>
                    ) : (
                        <p className="text-base font-semibold text-[hsl(var(--foreground))] mt-4 text-center">
                            Point your camera at a barcode
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
