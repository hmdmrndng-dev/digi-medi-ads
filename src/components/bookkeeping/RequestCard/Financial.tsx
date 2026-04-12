import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Financial({ formData, formatCurrency }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
                <Label className="text-base font-semibold">Financials</Label>
            </div>
            <div className="space-y-2">
                <Label>Total Amount Due</Label>
                <Input
                    type="text"
                    value={formatCurrency(
                        formData.items
                            ?.filter((item: any) => item.status !== false)
                            .reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0)
                    )}
                    readOnly
                    className="font-medium bg-muted/30"
                />
            </div>
            <div className="space-y-2">
                <Label>Total Net Collected</Label>
                <Input
                    type="text"
                    value={formatCurrency(
                        (formData.serviceInvoicePayment?.reduce(
                            (sum: number, payment: any) => sum + (Number(payment.amountPaid) || 0), 0
                        ) || 0) / 1.12
                    )}
                    readOnly
                    className="font-medium bg-muted/30"
                />
            </div>
            <div className="space-y-2">
                <Label>Total Vat</Label>
                <Input
                    type="text"
                    value={formatCurrency(
                        (formData.serviceInvoicePayment?.reduce(
                            (sum: number, payment: any) => sum + (Number(payment.amountPaid) || 0), 0
                        ) || 0) / 1.12 * 0.12
                    )}
                    readOnly
                    className="font-medium bg-muted/30"
                />
            </div>
            <div className="space-y-2">
                <Label>Total Amount Collected</Label>
                <Input
                    type="text"
                    value={formatCurrency(
                        formData.serviceInvoicePayment?.reduce((sum: number, payment: any) => sum + (Number(payment.amountPaid) || 0), 0)
                    )}
                    readOnly
                    className="font-medium bg-muted/30"
                />
            </div>
        </div>
    );
}