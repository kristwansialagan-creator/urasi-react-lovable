import { useSettings } from '@/hooks'
import { formatCurrency } from '@/lib/utils'

interface PrintItem {
    name: string
    quantity: number
    total_price: number
}

export function useReceiptPrinter() {
    const { settings } = useSettings()

    const printReceipt = (
        orderCode: string, 
        items: PrintItem[], 
        sub: number, 
        disc: number, 
        tot: number, 
        paid: number, 
        change: number,
        orderDate?: string | Date
    ) => {
        // Load settings from database
        const storeName = settings.store_name || 'URASI POS'
        const storeAddress = settings.store_address || ''
        const storePhone = settings.store_phone || ''
        const logoUrl = settings.receipt_logo_url || ''
        const headerText = settings.receipt_header || ''
        const footerText = settings.receipt_footer || 'Thank you for your purchase!'
        const showStoreName = settings.receipt_show_store_name ?? true
        const showStoreAddress = settings.receipt_show_store_address ?? true
        const showStorePhone = settings.receipt_show_store_phone ?? true
        const showCashier = settings.receipt_show_cashier ?? true
        const paperSize = settings.receipt_paper_size || '80mm'
        const fontSize = settings.receipt_font_size || '12'

        const dateToPrint = orderDate ? new Date(orderDate).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')

        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${orderCode}</title>
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        width: ${paperSize === '58mm' ? '58mm' : '80mm'}; 
                        margin: 20px auto;
                        font-size: ${fontSize}px;
                        line-height: 1.4;
                    }
                    .center { text-align: center; }
                    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .totals { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
                    .total-line { display: flex; justify-content: space-between; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; font-size: ${Math.max(10, parseInt(fontSize) - 1)}px; }
                    table { width: 100%; border-collapse: collapse; }
                    td { padding: 2px 0; }
                    .right { text-align: right; }
                </style>
            </head>
            <body>
                ${logoUrl ? `<div class="center"><img src="${logoUrl}" style="max-width: 80%; height: auto; margin-bottom: 10px;"></div>` : ''}
                
                <div class="header">
                    ${showStoreName ? `<h2>${storeName}</h2>` : ''}
                    ${showStoreAddress ? `<div>${storeAddress}</div>` : ''}
                    ${showStorePhone ? `<div>Telp: ${storePhone}</div>` : ''}
                    
                    ${headerText ? `<div style="margin-top: 10px;">${headerText}</div>` : ''}
                </div>
                
                <div style="margin: 10px 0;">
                    <table>
                        <tr><td>Tanggal:</td><td class="right">${dateToPrint}</td></tr>
                        <tr><td>Order:</td><td class="right">${orderCode}</td></tr>
                        ${showCashier ? `<tr><td>Kasir:</td><td class="right">Staff</td></tr>` : ''}
                    </table>
                </div>
                
                <div style="border-top: 1px dashed #000; padding-top: 10px;">
                    ${items.map(item => `
                        <div class="item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${formatCurrency(item.total_price)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="totals">
                    <div class="total-line"><span>Subtotal:</span><span>${formatCurrency(sub)}</span></div>
                    ${disc > 0 ? `<div class="total-line"><span>Diskon:</span><span>-${formatCurrency(disc)}</span></div>` : ''}
                    <div class="total-line"><span>Total:</span><span>${formatCurrency(tot)}</span></div>
                    <div class="total-line"><span>Dibayar:</span><span>${formatCurrency(paid)}</span></div>
                    <div class="total-line"><span>Kembali:</span><span>${formatCurrency(change)}</span></div>
                </div>
                
                <div class="footer">
                    <p>${footerText}</p>
                    <p style="margin-top: 10px;">***</p>
                </div>
            </body>
            </html>
        `

        const printWindow = window.open('', '', 'width=400,height=600')
        if (printWindow) {
            printWindow.document.write(receiptHTML)
            printWindow.document.close()
            // Wait for images to load before printing
            setTimeout(() => {
                printWindow.print()
            }, 500)
        }
    }

    return { printReceipt }
}
