// src/app/bookkeeping/(protected)/financial/ViewRequestDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { getRequestDetails } from "@/actions/request/actions";

export function ViewRequestDialog({ projectCode }: { projectCode: string }) {
    const [open, setOpen] = useState(false);
    const [requestData, setRequestData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && !requestData) {
            setIsLoading(true);
            getRequestDetails(projectCode)
                .then((data) => setRequestData(data))
                .catch((error) => console.error("Failed to fetch request:", error))
                .finally(() => setIsLoading(false));
        }
    }, [open, projectCode, requestData]);

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined) return "";
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                </Button>
            </DialogTrigger>

            {/* Changed width to max-w-7xl for landscape feel */}
            <DialogContent className="w-[95vw] sm:max-w-[1000px] lg:max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-6">
                        <div>
                            <DialogTitle>View Request Details</DialogTitle>
                            <DialogDescription>
                                Detailed breakdown for this financial request.
                            </DialogDescription>
                        </div>
                        {requestData && (
                            <Badge
                                variant={requestData.deliveryStatus?.toLowerCase() === 'pending' ? 'secondary' : 'default'}
                                className={
                                    requestData.deliveryStatus?.toLowerCase() === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                        : 'bg-green-100 text-green-800 hover:bg-green-100'
                                }
                            >
                                {requestData.deliveryStatus?.toUpperCase() || "UNKNOWN"}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12 text-muted-foreground">
                            Fetching details...
                        </div>
                    ) : !requestData ? (
                        <div className="flex items-center justify-center p-12 text-muted-foreground text-destructive">
                            Failed to load data.
                        </div>
                    ) : (
                        <>
                            {/* Main Landscape Responsive Container: Stacks on mobile, 3 columns on LG */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* COLUMN 1: General Info (stacked inputs) */}
                                <div className="space-y-4 lg:border-r lg:pr-8">
                                    <div className="flex items-center justify-between pb-2 border-b">
                                        <Label className="text-base font-semibold">General Information</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Project Code</Label>
                                        <Input type="text" value={requestData.projectCode || ""} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Project Type</Label>
                                        <Input type="text" value={requestData.projectType || ""} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Requestor</Label>
                                        <Input type="text" value={requestData.requestor || "N/A"} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Store Name</Label>
                                        <Input type="text" value={requestData.storeName || "N/A"} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Purchase Order ID</Label>
                                        <Input type="text" value={requestData.purchaseOrderId || "N/A"} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Delivery Receipt</Label>
                                        <Input type="text" value={requestData.deliveryReceipt || "N/A"} readOnly className="readOnlyInput" />
                                    </div>
                                </div>

                                {/* COLUMN 2: Dates & Financials (stacked inputs) */}
                                <div className="space-y-4 lg:border-r lg:pr-8">
                                    <div className="flex items-center justify-between pb-2 border-b">
                                        <Label className="text-base font-semibold">Dates & Financials</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total Amount Due</Label>
                                        <Input
                                            type="text"
                                            value={formatCurrency(requestData.amountDue)}
                                            readOnly
                                            className="readOnlyInput font-medium text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Delivery Date</Label>
                                        <Input type="text" value={formatDate(requestData.deliveryDate)} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Created At</Label>
                                        <Input type="text" value={formatDate(requestData.createdAt)} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Updated</Label>
                                        <Input type="text" value={formatDate(requestData.updatedAt)} readOnly className="readOnlyInput" />
                                    </div>
                                </div>

                                {/* COLUMN 3: Dynamic Lists (spanning right area) */}
                                <div className="space-y-8 lg:col-span-1 lg:max-h-[65vh] lg:overflow-y-auto">

                                    {/* Products Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <Label className="text-base font-semibold">Ordered Products</Label>
                                            <span className="text-xs text-muted-foreground pr-4 w-[80px]">Qty</span>
                                        </div>

                                        {requestData.items?.length > 0 ? (
                                            requestData.items.map((item: any) => (
                                                <div key={item.id} className="flex gap-2 items-center">
                                                    <div className="flex-1">
                                                        <Input type="text" value={item.productName} readOnly className="readOnlyInput text-sm h-9" />
                                                    </div>
                                                    <div className="w-[80px]">
                                                        <Input type="number" value={item.numOfOrderedStock} readOnly className="readOnlyInput text-sm h-9" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">
                                                No products found.
                                            </div>
                                        )}
                                    </div>

                                    {/* Service Invoice Payments Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <Label className="text-base font-semibold">Service Invoice Payments</Label>
                                            <span className="text-xs text-muted-foreground pr-4 w-[120px]">Paid</span>
                                        </div>

                                        {requestData.serviceInvoicePayment?.length > 0 ? (
                                            requestData.serviceInvoicePayment.map((payment: any) => (
                                                <div key={payment.id} className="flex gap-2 items-center">
                                                    <div className="flex-1">
                                                        <Input type="text" value={payment.serviceInvoiceId || "N/A"} readOnly className="readOnlyInput text-sm h-9" />
                                                    </div>
                                                    <div className="w-[120px]">
                                                        <Input type="text" value={formatCurrency(payment.amountPaid)} readOnly className="readOnlyInput text-sm h-9" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">
                                                No payments recorded.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}