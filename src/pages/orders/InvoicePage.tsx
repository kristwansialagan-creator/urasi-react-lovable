import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Printer, Mail, Download } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface Order {
    id: string; code: string; total: number | null; subtotal: number | null; tax_value: number | null
    discount: number | null; shipping: number | null; tendered: number | null; change: number | null
    payment_status: string | null; delivery_status?: string | null; type: string | null
    created_at: string | null; final_payment_date?: string | null
    customer: { name?: string | null; first_name: string | null; last_name: string | null; email?: string | null } | null
    user: { username: string | null } | null
    products: Array<{
        id: string; name: string | null; unit_price: number | null; quantity: number | null
        discount: number | null; tax_value: number | null; total_price: number | null
        unit: { name: string | null } | null
    }> | null
    taxes: Array<{ id: string; tax_name: string | null; tax_value: number | null }> | null
    billing_address?: any; shipping_address?: any
    tax_type: string | null
}

export default function InvoicePage() {
    const { id } = useParams()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState<any>({})
    const invoiceRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchOrder()
        fetchSettings()
    }, [id])

    const fetchOrder = async () => {
        if (!id) return
        setLoading(true)
        const { data } = await (supabase
            .from('orders')
            .select('*, customer:customers(*), user:profiles(*), products:order_products(*, unit:units(*)), taxes:orders_taxes(*)')
            .eq('id', id)
            .single() as any)
        setOrder(data)
        setLoading(false)
    }

    const fetchSettings = async () => {
        const { data } = await supabase.from('settings').select('*')
        const settingsObj: any = {}
        data?.forEach((s: any) => { settingsObj[s.key] = s.value })
        setSettings(settingsObj)
    }

    const handlePrint = () => {
        window.print()
    }

    const handleEmail = async () => {
        if (!order?.customer?.email) {
            return alert('Customer email not available')
        }
        alert(`Email invoice to ${order.customer.email} - Feature coming soon!`)
    }

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                logging: false,
                useCORS: true
            } as any)
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            pdf.save(`invoice-${order?.code || 'download'}.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF')
        }
    }

    if (loading || !order) {
        return <div className="flex items-center justify-center h-screen"><div className="text-xl">Loading invoice...</div></div>
    }

    const billingFields = [
        { name: 'name', label: 'Name' },
        { name: 'address_1', label: 'Address' },
        { name: 'city', label: 'City' },
        { name: 'state', label: 'State' },
        { name: 'country', label: 'Country' },
        { name: 'pobox', label: 'PO Box' }
    ]

    return (
        <div className="space-y-6">
            {/* Print buttons - hidden when printing */}
            <div className="print:hidden flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8" />Order Invoice</h1>
                <div className="flex gap-2">
                    <Button onClick={handleDownloadPDF} variant="outline"><Download className="h-4 w-4 mr-2" />Save PDF</Button>
                    <Button onClick={handleEmail} variant="outline"><Mail className="h-4 w-4 mr-2" />Email Invoice</Button>
                    <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print Invoice</Button>
                </div>
            </div>

            {/* Invoice Container */}
            <div ref={invoiceRef} className="bg-white text-black p-0 md:p-4">
                <Card className="shadow-lg print:shadow-none border-0 md:border">
                    <CardContent className="p-8">
                        {/* Header with Store Info */}
                        <div className="text-center border-b-2 border-[hsl(var(--primary))] pb-6 mb-6">
                            {settings.invoice_company_logo && (
                                <img src={settings.invoice_company_logo} alt="Logo" className="h-16 mx-auto mb-4" />
                            )}
                            <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">{settings.store_name || 'NexoPOS Store'}</h1>
                            {settings.store_address && <p className="text-[hsl(var(--muted-foreground))]">{settings.store_address}</p>}
                            <p className="text-[hsl(var(--muted-foreground))]">
                                {settings.store_phone && `Phone: ${settings.store_phone}`}
                                {settings.store_email && ` | Email: ${settings.store_email}`}
                            </p>
                        </div>

                        {/* Order & Customer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Order Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="font-medium">Order Code:</span><span className="font-mono">{order.code}</span></div>
                                    <div className="flex justify-between"><span className="font-medium">Date:</span><span>{new Date(order.created_at || '').toLocaleDateString()}</span></div>
                                    <div className="flex justify-between"><span className="font-medium">Cashier:</span><span>{order.user?.username}</span></div>
                                    <div className="flex justify-between"><span className="font-medium">Type:</span><span className="capitalize">{order.type}</span></div>
                                    <div className="flex justify-between"><span className="font-medium">Status:</span><span className={`px-2 py-0.5 rounded text-xs ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.payment_status}</span></div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Customer Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="font-medium">Name:</span><span>{order.customer?.name || `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`}</span></div>
                                    {order.customer?.email && <div className="flex justify-between"><span className="font-medium">Email:</span><span>{order.customer.email}</span></div>}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Billing Address</h3>
                                <div className="space-y-1 text-sm">
                                    {billingFields.map(field => order.billing_address?.[field.name] && (
                                        <div key={field.name}>{order.billing_address[field.name]}</div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="mb-6">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[hsl(var(--muted))]">
                                        <th className="border p-3 text-left">Product</th>
                                        <th className="border p-3 text-right">Unit Price</th>
                                        <th className="border p-3 text-center">Qty</th>
                                        <th className="border p-3 text-right">Discount</th>
                                        <th className="border p-3 text-right">Tax</th>
                                        <th className="border p-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.products?.map(product => (
                                        <tr key={product.id}>
                                            <td className="border p-3">
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">{product.unit?.name}</div>
                                            </td>
                                            <td className="border p-3 text-right">{formatCurrency(product.unit_price || 0)}</td>
                                            <td className="border p-3 text-center">{product.quantity}</td>
                                            <td className="border p-3 text-right">{formatCurrency(product.discount || 0)}</td>
                                            <td className="border p-3 text-right">{formatCurrency(product.tax_value || 0)}</td>
                                            <td className="border p-3 text-right font-bold">{formatCurrency(product.total_price || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="font-semibold">
                                    <tr><td colSpan={4} className="border p-3"></td><td className="border p-3 text-right">Subtotal:</td><td className="border p-3 text-right">{formatCurrency(order.subtotal || 0)}</td></tr>
                                    {(order.discount || 0) > 0 && <tr><td colSpan={4} className="border p-3"></td><td className="border p-3 text-right">Discount:</td><td className="border p-3 text-right text-red-600">-{formatCurrency(order.discount || 0)}</td></tr>}
                                    {(order.shipping || 0) > 0 && <tr><td colSpan={4} className="border p-3"></td><td className="border p-3 text-right">Shipping:</td><td className="border p-3 text-right">{formatCurrency(order.shipping || 0)}</td></tr>}
                                    {order.taxes?.map(tax => (
                                        <tr key={tax.id}><td colSpan={4} className="border p-3"></td><td className="border p-3 text-right">{tax.tax_name} ({order.tax_type}):</td><td className="border p-3 text-right">{formatCurrency(tax.tax_value || 0)}</td></tr>
                                    ))}
                                    <tr className="bg-[hsl(var(--muted))]"><td colSpan={4} className="border p-3"></td><td className="border p-3 text-right text-lg">TOTAL:</td><td className="border p-3 text-right text-lg text-[hsl(var(--primary))]">{formatCurrency(order.total || 0)}</td></tr>
                                    <tr><td colSpan={4} className="border p-3"></td><td className="border p-3 text-right">Paid:</td><td className="border p-3 text-right">{formatCurrency(order.tendered || 0)}</td></tr>
                                    <tr><td colSpan={4} className="border p-3 text-sm">{['partially_paid', 'unpaid'].includes(order.payment_status || '') && order.final_payment_date && `Due Date: ${new Date(order.final_payment_date).toLocaleDateString()}`}</td><td className="border p-3 text-right">{['partially_paid', 'unpaid'].includes(order.payment_status || '') ? 'Due:' : 'Change:'}</td><td className={`border p-3 text-right ${['partially_paid', 'unpaid'].includes(order.payment_status || '') ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(Math.abs(order.change || 0))}</td></tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Footer */}
                        {settings.invoice_footer_text && (
                            <div className="text-center text-sm text-[hsl(var(--muted-foreground))] border-t pt-4 mt-6">
                                {settings.invoice_footer_text}
                            </div>
                        )}

                        <div className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-4">
                            Thank you for your business!
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
