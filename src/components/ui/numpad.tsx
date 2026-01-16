import { Button } from './button'
import { X, Delete } from 'lucide-react'

interface NumpadProps {
    value: string
    onChange: (value: string) => void
    onConfirm?: () => void
    allowDecimal?: boolean
    maxValue?: number
}

export function Numpad({ value, onChange, onConfirm, allowDecimal = true, maxValue }: NumpadProps) {
    const handleClick = (key: string) => {
        if (key === 'clear') {
            onChange('')
        } else if (key === 'backspace') {
            onChange(value.slice(0, -1))
        } else if (key === '.' && !allowDecimal) {
            return
        } else if (key === '.' && value.includes('.')) {
            return
        } else {
            const newValue = value + key
            const numValue = parseFloat(newValue)
            if (maxValue && numValue > maxValue) return
            onChange(newValue)
        }
    }

    const keys = [
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        ['0', '.', 'backspace']
    ]

    return (
        <div className="space-y-2">
            {/* Display */}
            <div className="p-4 bg-[hsl(var(--muted))] rounded-lg text-right">
                <div className="text-3xl font-bold min-h-[48px] flex items-center justify-end">
                    {value || '0'}
                </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
                {keys.flat().map((key, index) => (
                    <Button
                        key={index}
                        variant={key === 'backspace' ? 'destructive' : 'outline'}
                        onClick={() => handleClick(key)}
                        className="h-14 text-xl font-semibold"
                        disabled={key === '.' && !allowDecimal}
                    >
                        {key === 'backspace' ? <Delete className="h-5 w-5" /> : key}
                    </Button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant="outline"
                    onClick={() => handleClick('clear')}
                    className="h-12"
                >
                    Clear
                </Button>
                {onConfirm && (
                    <Button
                        onClick={onConfirm}
                        className="h-12"
                        disabled={!value || value === '0'}
                    >
                        Confirm
                    </Button>
                )}
            </div>
        </div>
    )
}
