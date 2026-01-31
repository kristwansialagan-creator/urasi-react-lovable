export interface Currency {
    code: string
    symbol: string
    name: string
    country: string
}

export const CURRENCIES: Currency[] = [
    // Major Currencies
    { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
    { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
    { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },

    // Southeast Asia
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', country: 'Indonesia' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand' },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso', country: 'Philippines' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', country: 'Vietnam' },

    // Asia Pacific
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },

    // Middle East
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'United Arab Emirates' },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', country: 'Saudi Arabia' },
    { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', country: 'Qatar' },
    { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', country: 'Israel' },

    // Europe
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', country: 'Switzerland' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone', country: 'Denmark' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', country: 'Poland' },
    { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', country: 'Czech Republic' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble', country: 'Russia' },

    // Americas
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso', country: 'Mexico' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil' },
    { code: 'ARS', symbol: '$', name: 'Argentine Peso', country: 'Argentina' },
    { code: 'CLP', symbol: '$', name: 'Chilean Peso', country: 'Chile' },
    { code: 'COP', symbol: '$', name: 'Colombian Peso', country: 'Colombia' },

    // Africa
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria' },
    { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', country: 'Egypt' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya' },

    // Others
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey' },
    { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', country: 'Taiwan' },
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', country: 'Bangladesh' },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', country: 'Pakistan' },
]

// Helper function to get currency by code
export function getCurrencyByCode(code: string): Currency | undefined {
    return CURRENCIES.find(c => c.code === code)
}

// Helper function to get currency by symbol
export function getCurrencyBySymbol(symbol: string): Currency | undefined {
    return CURRENCIES.find(c => c.symbol === symbol)
}
