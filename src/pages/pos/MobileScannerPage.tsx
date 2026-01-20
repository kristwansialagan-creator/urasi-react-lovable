import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ScanLine, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function MobileScannerPage() {
    const { sessionId } = useParams<{ sessionId: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [manualCode, setManualCode] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const [lastScanned, setLastScanned] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [scanFlash, setScanFlash] = useState(false)
    const channelRef = useRef<any>(null)
    const lastScanRef = useRef<{ code: string; at: number }>({ code: '', at: 0 })
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const cameraContainerRef = useRef<HTMLDivElement | null>(null)

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
                } catch {}
            }
        } catch {}
    }

    const stopCameraTracks = () => {
        const videos = cameraContainerRef.current?.querySelectorAll('video') ?? []
        videos.forEach((video) => {
            const stream = video.srcObject as MediaStream | null
            stream?.getTracks().forEach((t) => t.stop())
            video.srcObject = null
        })
    }

    const clearScanner = async () => {
        const current = scannerRef.current
        scannerRef.current = null
        try {
            await current?.clear()
        } catch {}
        stopCameraTracks()
    }

    useEffect(() => {
        if (!sessionId) return
        const channel = supabase.channel(`scanner:${sessionId}`)
        channelRef.current = channel
        channel.subscribe()
        return () => {
            supabase.removeChannel(channel)
            channelRef.current = null
        }
    }, [sessionId])

    // Send scan result to desktop via Realtime
    const sendScan = async (code: string) => {
        if (!sessionId || !code) return

        try {
            await channelRef.current?.send({
                type: 'broadcast',
                event: 'scan',
                payload: { code }
            })

            setLastScanned(code)
            toast({
                title: "Sent",
                description: `Scanned: ${code}`,
                duration: 1000
            })

            if (navigator.vibrate) navigator.vibrate(120)
            playBeep()
            setScanFlash(true)
            setTimeout(() => setScanFlash(false), 250)
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send scan to desktop"
            })
        }
    }

    useEffect(() => {
        if (!isScanning) {
            void clearScanner()
            return
        }

        if (!window.isSecureContext) {
            setErrorMessage('Camera hanya bisa diakses pada HTTPS atau localhost.')
            setIsScanning(false)
            return
        }

        const timer = setTimeout(() => {
            if (scannerRef.current) return

            const scanner = new Html5QrcodeScanner(
                "mobile-reader",
                { 
                    fps: 15,
                    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
                        const size = Math.floor(minEdge * 0.78)
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
                        Html5QrcodeSupportedFormats.UPC_A
                    ]
                },
                false
            )

            scanner.render((decodedText: string) => {
                const now = Date.now()
                const last = lastScanRef.current
                if (last.code === decodedText && now - last.at < 1200) {
                    return
                }
                lastScanRef.current = { code: decodedText, at: now }
                sendScan(decodedText)
            }, (_error: unknown) => {})

            scannerRef.current = scanner
        }, 100)

        return () => {
            clearTimeout(timer)
            void clearScanner()
        }
    }, [isScanning])

    return (
        <div className="min-h-screen bg-background p-4 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => { stopCameraTracks(); void clearScanner(); navigate('/') }}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-bold">Remote Scanner</h1>
            </div>

            <Card className="flex-1 flex flex-col mb-4">
                <CardHeader>
                    <CardTitle className="text-center text-sm text-muted-foreground">
                        Connected to Session: <span className="font-mono text-foreground">{sessionId}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    {/* Camera Area */}
                    <div ref={cameraContainerRef} className="flex-1 bg-white rounded-xl overflow-hidden relative min-h-[320px] border-2 border-[hsl(var(--ring))]">
                        {scanFlash && <div className="absolute inset-0 ring-4 ring-green-500 pointer-events-none z-10" />}
                        {isScanning ? (
                            <div id="mobile-reader" className="w-full h-full urasi-scanner" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground p-4 bg-muted/20">
                                <ScanLine className="h-16 w-16 mb-4 opacity-50" />
                                <p className="text-base font-semibold text-foreground">Camera Paused</p>
                                {errorMessage && (
                                    <p className="text-sm font-medium text-[hsl(var(--destructive))] mt-2 text-center">
                                        {errorMessage}
                                    </p>
                                )}
                                <Button 
                                    onClick={async () => {
                                        setErrorMessage(null)
                                        if (!window.isSecureContext) {
                                            setErrorMessage('Camera hanya bisa diakses pada HTTPS atau localhost.')
                                            return
                                        }
                                        try {
                                            const stream = await navigator.mediaDevices.getUserMedia({
                                                video: { facingMode: { ideal: 'environment' } }
                                            })
                                            stream.getTracks().forEach((t) => t.stop())
                                            setIsScanning(true)
                                        } catch (err: any) {
                                            const name = err?.name || 'UnknownError'
                                            if (name === 'NotAllowedError' || name === 'SecurityError') {
                                                setErrorMessage('Izin kamera ditolak. Silakan izinkan kamera di pengaturan browser.')
                                            } else if (name === 'NotFoundError') {
                                                setErrorMessage('Kamera tidak ditemukan pada perangkat ini.')
                                            } else {
                                                setErrorMessage('Gagal mengakses kamera. Coba refresh halaman atau ganti browser.')
                                            }
                                        }
                                    }} 
                                    variant="secondary" 
                                    className="mt-4"
                                >
                                    Start Camera
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Manual Input */}
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Type barcode manually..." 
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                        />
                        <Button onClick={() => { sendScan(manualCode); setManualCode('') }}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Last Scanned */}
                    {lastScanned && (
                        <div className="p-3 bg-muted rounded-md text-center">
                            <p className="text-xs text-muted-foreground">Last Scanned</p>
                            <p className="text-lg font-mono font-bold">{lastScanned}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
