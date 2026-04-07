// src/app/bookkeeping/(protected)/financial/RequestDialog.tsx
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
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { getRequestDetails } from "@/actions/request/actions";

export function RequestDialog({ projectCode, children }: { projectCode: string; children: React.ReactNode }) {
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
                {children ? children : (
                    <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" /> View
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="w-[95vw] sm:max-w-[1000px] lg:max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-6">
                        <div>
                            <DialogTitle>Request Details</DialogTitle>
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Skeleton: General Information */}
                            <div className="space-y-4">
                                <div className="pb-2 border-b">
                                    <Skeleton className="h-6 w-40" />
                                </div>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>

                            {/* Skeleton: Products, DRs, and Invoices */}
                            <div className="space-y-6 lg:border-r lg:pr-8 lg:border-l lg:pl-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between pb-2 border-b">
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-2">
                                            <Skeleton className="h-9 flex-1" />
                                            <Skeleton className="h-9 w-[60px]" />
                                            <Skeleton className="h-9 w-[90px]" />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between pb-2 border-b">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-9 flex-1" />
                                        <Skeleton className="h-9 w-[120px]" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between pb-2 border-b">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-9 flex-1" />
                                        <Skeleton className="h-9 w-[120px]" />
                                    </div>
                                </div>
                            </div>

                            {/* Skeleton: Financials */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="pb-2 border-b">
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b">
                                        <Label className="text-base font-semibold">General Information</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Project Code</Label>
                                        <Input type="text" value={requestData.projectCode || ""} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Requestor</Label>
                                        <Input type="text" value={requestData.requestor || "N/A"} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Store Category</Label>
                                        <Input type="text" value={requestData.storeCategory || "N/A"} readOnly className="readOnlyInput" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Store Name</Label>
                                        <Input type="text" value={requestData.storeName || "N/A"} readOnly className="readOnlyInput" />
                                    </div>
                                </div>

                                {/* COLUMN 3: Delivery Receipts & Payments */}
                                <div className="space-y-6 lg:border-r lg:pr-8 lg:border-l lg:pl-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <Label className="text-base font-semibold">Products</Label>
                                            {/* ✅ Added the Amount label next to Qty */}
                                            <div className="flex gap-4">
                                                <span className="text-xs text-muted-foreground w-[60px]">Qty</span>
                                                <span className="text-xs text-muted-foreground w-[90px]">Amount</span>
                                            </div>
                                        </div>
                                        {requestData.items?.length > 0 ? (
                                            requestData.items.map((product: any) => {
                                                const isCancelled = product.status === false;
                                                return (

                                                    <div key={product.id} className={`flex gap-2 items-center ${isCancelled ? "opacity-50 grayscale" : ""}`}
                                                        title={isCancelled ? "This product was cancelled" : ""}>
                                                        <div className="flex-1">
                                                            <Input type="text" value={product.productName} readOnly className={`readOnlyInput text-sm h-9 ${isCancelled ? "line-through text-muted-foreground" : ""}`} />
                                                        </div>
                                                        <div className="w-[60px]">
                                                            <Input type="text" value={product.numOfOrderedStock} readOnly className={`readOnlyInput text-sm h-9 ${isCancelled ? "line-through text-muted-foreground" : ""}`} />
                                                        </div>
                                                        {/* ✅ Added the Product Amount Display */}
                                                        <div className="w-[90px]">
                                                            <Input type="text" value={formatCurrency(product.amount)} readOnly className={`readOnlyInput text-sm h-9 ${isCancelled ? "line-through text-muted-foreground" : ""}`} />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">
                                                No products found.
                                            </div>
                                        )}
                                    </div>
                                    {/* Delivery Receipts List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <Label className="text-base font-semibold">Delivery Receipts</Label>
                                            <span className="text-xs text-muted-foreground pr-4 w-[120px]">Date</span>
                                        </div>
                                        {requestData.deliveryReceipts?.length > 0 ? (
                                            requestData.deliveryReceipts.map((dr: any) => (
                                                <div key={dr.id} className="flex gap-2 items-center">
                                                    <div className="flex-1">
                                                        <Input type="text" value={dr.deliveryReceipt || "No DR Number"} readOnly className="readOnlyInput text-sm h-9" />
                                                    </div>
                                                    <div className="w-[120px]">
                                                        <Input type="text" value={formatDate(dr.deliveryDate)} readOnly className="readOnlyInput text-sm h-9" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">
                                                No delivery receipts recorded.
                                            </div>
                                        )}
                                    </div>

                                    {/* Service Invoice Payments List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <Label className="text-base font-semibold">Service Invoices</Label>
                                            <span className="text-xs text-muted-foreground pr-4 w-[120px]">Paid</span>
                                        </div>
                                        {requestData.serviceInvoicePayment?.length > 0 ? (
                                            requestData.serviceInvoicePayment.map((sip: any) => (
                                                <div key={sip.id} className="flex gap-2 items-center">
                                                    <div className="flex-1">
                                                        <Input type="text" value={sip.serviceInvoiceId || "No SI Number"} readOnly className="readOnlyInput text-sm h-9" />
                                                    </div>
                                                    <div className="w-[120px]">
                                                        <Input type="text" value={formatCurrency(sip.amountPaid)} readOnly className="readOnlyInput text-sm h-9" />
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

                                {/* COLUMN 2: Financials & Products */}
                                <div className="space-y-6 ">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <Label className="text-base font-semibold">Financials</Label>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Total Amount Due</Label>
                                            {/* ✅ Changed to use requestData.items to safely calculate standard JS numbers */}
                                            <Input
                                                type="text"
                                                value={formatCurrency(
                                                    requestData.items
                                                        ?.filter((item: any) => item.status !== false) // 1. Filter out cancelled items
                                                        .reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0) // 2. Sum the rest
                                                )}
                                                readOnly
                                                className="readOnlyInput font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Total Amount Collected</Label>
                                            <Input
                                                type="text"
                                                value={formatCurrency(
                                                    requestData.serviceInvoicePayment
                                                        ?.reduce((sum: number, payment: any) => sum + (Number(payment.amountPaid) || 0), 0) // Sum all payments
                                                )}
                                                readOnly
                                                className="readOnlyInput font-medium"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Total Net Collected</Label>
                                            <Input
                                                type="text"
                                                value={formatCurrency(
                                                    (requestData.serviceInvoicePayment?.reduce(
                                                        (sum: number, payment: any) => sum + (Number(payment.amountPaid) || 0),
                                                        0
                                                    ) || 0) / 1.12
                                                )}
                                                readOnly
                                                className="readOnlyInput font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Total Vat</Label>
                                            <Input
                                                type="text"
                                                value={formatCurrency(
                                                    (requestData.serviceInvoicePayment?.reduce(
                                                        (sum: number, payment: any) => sum + (Number(payment.amountPaid) || 0),
                                                        0
                                                    ) || 0) / 1.12 * 0.12
                                                )}
                                                readOnly
                                                className="readOnlyInput font-medium"
                                            />
                                        </div>
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