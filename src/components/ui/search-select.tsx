import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export interface SearchSelectOption {
    value: string
    label: string
    [key: string]: any
}

interface SearchSelectProps {
    options: SearchSelectOption[]
    value?: string
    onSelect: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    isLoading?: boolean
    onSearch?: (query: string) => void
}

export function SearchSelect({
    options,
    value,
    onSelect,
    placeholder = 'Select...',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No results found.',
    isLoading = false,
    onSearch
}: SearchSelectProps) {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        if (onSearch) {
            const timeout = setTimeout(() => {
                onSearch(searchQuery)
            }, 300)
            return () => clearTimeout(timeout)
        }
    }, [searchQuery, onSearch])

    const filteredOptions = onSearch
        ? options
        : options.filter(opt =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedOption?.label || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <CommandEmpty>
                        {isLoading ? 'Loading...' : emptyMessage}
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                        {filteredOptions.map((option) => (
                            <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={() => {
                                    onSelect(option.value)
                                    setOpen(false)
                                }}
                                className="cursor-pointer"
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value === option.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
