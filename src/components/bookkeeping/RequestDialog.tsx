// src/components/bookkeeping/RequestDialog.tsx
"use client";

import { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Edit2, Save, Loader2 } from "lucide-react";
import { getRequestDetails } from "@/actions/request/actions";
import { updateRequestDetails } from "@/actions/request/actions";
import { GeneralInformation } from "./RequestCard/GeneralInformation";
import { Product } from "./RequestCard/Product";
import { DeliveryReceipt } from "./RequestCard/DeliveryReceipt";
import { ServiceInvoice } from "./RequestCard/ServiceInvoice";
import { Financial } from "./RequestCard/Financial";
// IMPORT YOUR CONFIRM DIALOG
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatCurrency } from "@/lib/formatters";

export function RequestDialog({
    projectCode,
    children,
    open: externalOpen,
    onOpenChange
}: {
    projectCode: string;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = externalOpen !== undefined;
    const dialogOpen = isControlled ? externalOpen : internalOpen;
    const setDialogOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;

    const [requestData, setRequestData] = useState<any>(null);
    const [formData, setFormData] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        if (dialogOpen && !requestData) {
            setIsLoading(true);
            getRequestDetails(projectCode)
                .then((data) => {
                    setRequestData(data);
                    setFormData(data);
                })
                .catch((error) => console.error("Failed to fetch request:", error))
                .finally(() => setIsLoading(false));
        }
    }, [dialogOpen, projectCode, requestData]);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
    };

    const formatDateForInput = (dateString: string | null | undefined) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0];
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        setIsSaving(true);
        try {
            const response = await updateRequestDetails(projectCode, formData);
            if (response.success) {
                setRequestData(formData);
                setIsEditing(false);
                setIsConfirmOpen(false);
            } else {
                console.error("Failed to save:", response.error);
                // Optionally add a toast notification here
            }
        } catch (error) {
            console.error("Error saving data:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData(requestData);
        setIsEditing(false);
    };

    const handleArrayChange = (
        arrayName: 'items' | 'deliveryReceipts' | 'invoices',
        index: number,
        field: string,
        value: any
    ) => {
        const updatedArray = [...(formData[arrayName] || [])];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        setFormData({ ...formData, [arrayName]: updatedArray });
    };

    const handleAddRow = (arrayName: 'items' | 'deliveryReceipts' | 'invoices') => {
        let newRow = {};
        if (arrayName === 'items') {
            newRow = { id: `temp-${Date.now()}`, productName: "", numOfOrderedStock: "0", amount: 0, status: true };
        } else if (arrayName === 'deliveryReceipts') {
            newRow = { id: `temp-${Date.now()}`, receiptNo: "", dateDelivered: new Date().toISOString() };
        } else {
            newRow = { id: `temp-${Date.now()}`, invoiceNo: "", amountDue: 0 };
        }

        setFormData((prev: any) => ({
            ...prev,
            [arrayName]: [...(prev[arrayName] || []), newRow]
        }));
    };

    const handleDeleteRow = (arrayName: 'items' | 'deliveryReceipts' | 'serviceInvoicePayment', indexToRemove: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_: any, index: number) => index !== indexToRemove)
        }));
    };

    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={(val) => {
                if (!val) {
                    setDialogOpen(false);
                    setIsEditing(false);
                } else {
                    setDialogOpen(true);
                }
            }}>
                {children && (
                    <DialogTrigger asChild>
                        {children}
                    </DialogTrigger>
                )}

                <DialogContent className="w-[95vw] sm:max-w-[1000px] lg:max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex flex-col gap-2 items-start">
                            <div>
                                <DialogTitle>Request Details</DialogTitle>
                                <DialogDescription>
                                    {isEditing ? "Editing financial request details." : "Detailed breakdown for this financial request."}
                                </DialogDescription>
                            </div>

                            {formData && (
                                isEditing ? (
                                    <Select
                                        value={formData.deliveryStatus}
                                        onValueChange={(val) => setFormData({ ...formData, deliveryStatus: val })}
                                    >
                                        <SelectTrigger className="w-[140px] h-8">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge
                                        variant={formData.deliveryStatus?.toLowerCase() === 'delivered' ? 'default' : 'secondary'}
                                        className={
                                            formData.deliveryStatus?.toLowerCase() === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                                : formData.deliveryStatus?.toLowerCase() === 'cancelled'
                                                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                                    : 'bg-green-100 text-green-800 hover:bg-green-100'
                                        }
                                    >
                                        {formData.deliveryStatus?.toUpperCase()}
                                    </Badge>
                                )
                            )}
                        </div>
                    </DialogHeader>

                    <div>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                        ) : !formData ? (
                            <div className="flex items-center justify-center p-12 text-muted-foreground text-destructive">
                                Failed to load data.
                            </div>
                        ) : (
                            // Use the new handleFormSubmit
                            <form onSubmit={handleFormSubmit}>
                                <div className="grid grid-cols-1 lg:grid-cols-[2fr_4fr_2fr] gap-8">
                                    <GeneralInformation formData={formData} setFormData={setFormData} isEditing={isEditing} />

                                    <div className="space-y-6 lg:border-r lg:pr-8 lg:border-l lg:pl-8">

                                        <Product formData={formData} isEditing={isEditing} isSaving={isSaving} handleAddRow={handleAddRow} handleArrayChange={handleArrayChange} formatCurrency={formatCurrency} handleDeleteRow={handleDeleteRow} />

                                        <DeliveryReceipt formData={formData} isEditing={isEditing} isSaving={isSaving} handleAddRow={handleAddRow} handleDeleteRow={handleDeleteRow} handleArrayChange={handleArrayChange} formatDate={formatDate} formatDateForInput={formatDateForInput} />

                                        <ServiceInvoice formData={formData} isEditing={isEditing} isSaving={isSaving} handleAddRow={handleAddRow} handleDeleteRow={handleDeleteRow} handleArrayChange={handleArrayChange} formatCurrency={formatCurrency} />

                                    </div>

                                    <div className="space-y-6">
                                        <Financial formData={formData} formatCurrency={formatCurrency} />
                                    </div>
                                </div>

                                {/* FOOTER CONTROLS */}
                                <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isSaving}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleCancelEdit();
                                                }}
                                            >
                                                Cancel
                                            </Button>

                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                Save Changes
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setDialogOpen(false);
                                                }}
                                            >
                                                Close
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsEditing(true);
                                                }}
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* CONFIRMATION DIALOG PORTAL */}
            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Save Changes?"
                description="Are you sure you want to save the changes made to this request?"
                onConfirm={handleConfirmSave}
                isPending={isSaving}
                confirmText={isSaving ? "Saving..." : "Confirm Save"}
            />
        </>
    );
}