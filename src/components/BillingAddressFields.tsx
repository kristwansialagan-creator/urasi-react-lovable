import { Label } from './ui/label'
import { Input } from './ui/input'

interface BillingAddressFieldsProps {
    address: {
        address_1: string
        address_2: string
        city: string
        state: string
        country: string
        pobox: string
    }
    onChange: (address: any) => void
    disabled?: boolean
}

export function BillingAddressFields({ address, onChange, disabled = false }: BillingAddressFieldsProps) {
    const handleChange = (field: string, value: string) => {
        onChange({ ...address, [field]: value })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input
                    value={address.address_1}
                    onChange={(e) => handleChange('address_1', e.target.value)}
                    placeholder="Street address"
                    disabled={disabled}
                    className="bg-white border-gray-300"
                />
            </div>
            <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input
                    value={address.address_2}
                    onChange={(e) => handleChange('address_2', e.target.value)}
                    placeholder="Apartment, suite, etc. (optional)"

                    disabled={disabled}
                    className="bg-white border-gray-300"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                        value={address.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="City"
                        disabled={disabled}
                        className="bg-white border-gray-300"
                    />
                </div>
                <div className="space-y-2">
                    <Label>State/Province</Label>
                    <Input
                        value={address.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        placeholder="State"
                        disabled={disabled}
                        className="bg-white border-gray-300"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                        value={address.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        placeholder="Country"
                        disabled={disabled}
                        className="bg-white border-gray-300"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Postal/ZIP Code</Label>
                    <Input
                        value={address.pobox}
                        onChange={(e) => handleChange('pobox', e.target.value)}
                        placeholder="Postal code"
                        disabled={disabled}
                        className="bg-white border-gray-300"
                    />
                </div>
            </div>
        </div>
    )
}
