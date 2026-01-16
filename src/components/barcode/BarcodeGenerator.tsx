import React, { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeGeneratorProps {
    value: string
    format?: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39'
    width?: number
    height?: number
    displayValue?: boolean
    fontSize?: number
    margin?: number
    background?: string
    lineColor?: string
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
    value,
    format = 'CODE128',
    width = 2,
    height = 100,
    displayValue = true,
    fontSize = 20,
    margin = 10,
    background = '#ffffff',
    lineColor = '#000000'
}) => {
    const barcodeRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (barcodeRef.current && value) {
            try {
                JsBarcode(barcodeRef.current, value, {
                    format,
                    width,
                    height,
                    displayValue,
                    fontSize,
                    margin,
                    background,
                    lineColor
                })
            } catch (error) {
                console.error('Barcode generation error:', error)
            }
        }
    }, [value, format, width, height, displayValue, fontSize, margin, background, lineColor])

    if (!value) {
        return <div className="text-center text-[hsl(var(--muted-foreground))] p-4">No barcode value provided</div>
    }

    return (
        <div className="flex flex-col items-center">
            <svg ref={barcodeRef} />
        </div>
    )
}

export default BarcodeGenerator
