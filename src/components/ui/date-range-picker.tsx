import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Calendar } from './calendar'
import { CalendarIcon } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

interface DateRangePickerProps {
    from?: Date
    to?: Date
    onSelect: (from: Date, to: Date) => void
}

export function DateRangePicker({ from, to, onSelect }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [dateFrom, setDateFrom] = useState<Date | undefined>(from)
    const [dateTo, setDateTo] = useState<Date | undefined>(to)

    const handlePreset = (preset: string) => {
        const today = new Date()
        let newFrom: Date
        let newTo: Date = today

        switch (preset) {
            case 'today':
                newFrom = today
                break
            case 'yesterday':
                newFrom = subDays(today, 1)
                newTo = subDays(today, 1)
                break
            case 'last7days':
                newFrom = subDays(today, 7)
                break
            case 'last30days':
                newFrom = subDays(today, 30)
                break
            case 'thisMonth':
                newFrom = startOfMonth(today)
                newTo = endOfMonth(today)
                break
            case 'lastMonth':
                const lastMonth = subDays(startOfMonth(today), 1)
                newFrom = startOfMonth(lastMonth)
                newTo = endOfMonth(lastMonth)
                break
            case 'thisYear':
                newFrom = startOfYear(today)
                newTo = endOfYear(today)
                break
            default:
                return
        }

        setDateFrom(newFrom)
        setDateTo(newTo)
        onSelect(newFrom, newTo)
        setIsOpen(false)
    }

    const handleApply = () => {
        if (dateFrom && dateTo) {
            onSelect(dateFrom, dateTo)
            setIsOpen(false)
        }
    }

    const formatDateRange = () => {
        if (!from || !to) return 'Select date range'
        if (format(from, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd')) {
            return format(from, 'MMM dd, yyyy')
        }
        return `${format(from, 'MMM dd, yyyy')} - ${format(to, 'MMM dd, yyyy')}`
    }

    const presets = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 Days', value: 'last7days' },
        { label: 'Last 30 Days', value: 'last30days' },
        { label: 'This Month', value: 'thisMonth' },
        { label: 'Last Month', value: 'lastMonth' },
        { label: 'This Year', value: 'thisYear' },
    ]

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                    {/* Presets */}
                    <div className="border-r p-3 space-y-1">
                        <p className="text-sm font-medium mb-2">Presets</p>
                        {presets.map((preset) => (
                            <Button
                                key={preset.value}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-sm"
                                onClick={() => handlePreset(preset.value)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    {/* Calendar */}
                    <div className="p-3">
                        <div className="flex gap-2">
                            <div>
                                <p className="text-sm font-medium mb-2">From</p>
                                <Calendar
                                    mode="single"
                                    selected={dateFrom}
                                    onSelect={setDateFrom}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">To</p>
                                <Calendar
                                    mode="single"
                                    selected={dateTo}
                                    onSelect={setDateTo}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleApply} disabled={!dateFrom || !dateTo}>
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
