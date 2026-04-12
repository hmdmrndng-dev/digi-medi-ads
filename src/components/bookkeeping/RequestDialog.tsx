// src/components/bookkeeping/RequestDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { IconLoader } from "@tabler/icons-react";
import { getRequestDetails, updateRequestDetails } from "@/actions/request/actions";
import { GeneralInformation } from "./RequestCard/GeneralInformation";
import { Product } from "./RequestCard/Product";
import { DeliveryReceipt } from "./RequestCard/DeliveryReceipt";
import { ServiceInvoice } from "./RequestCard/ServiceInvoice";
import { Financial } from "./RequestCard/Financial";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ConfirmDialog } from "@/components/confirm-dialog";

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

    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

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

    const formatDateForInput = (dateString: string | null | undefined) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0];
    };

    const handleArrayChange = (arrayName: 'items' | 'deliveries' | 'invoices', index: number, field: string, value: any) => {
        const updatedArray = [...(formData[arrayName] || [])];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        setFormData({ ...formData, [arrayName]: updatedArray });
    };

    const handleAddRow = (arrayName: 'items' | 'deliveries' | 'invoices') => {
        let newRow = {};
        if (arrayName === 'items') {
            newRow = { id: `temp-${Date.now()}`, productName: "", numOfOrderedStock: "0", amount: 0, status: true };
        } else if (arrayName === 'deliveries') {
            newRow = { id: `temp-${Date.now()}`, receiptNo: "", dateDelivered: new Date().toISOString() };
        } else {
            newRow = { id: `temp-${Date.now()}`, invoiceNo: "", amountDue: 0 };
        }

        setFormData((prev: any) => ({
            ...prev,
            [arrayName]: [...(prev[arrayName] || []), newRow]
        }));
    };

    const handleDeleteRow = (arrayName: 'items' | 'deliveries' | 'invoices', indexToRemove: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_: any, index: number) => index !== indexToRemove)
        }));
    };

    const handleSectionSave = async (sectionName: string, sectionData: any) => {
        try {
            const updatedPayload = sectionName === 'general'
                ? { ...formData, ...sectionData }
                : { ...formData, [sectionName]: sectionData };

            const response = await updateRequestDetails(projectCode, updatedPayload);

            if (response.success) {
                setRequestData(updatedPayload);
                setFormData(updatedPayload);
            } else {
                console.error(`Failed to save ${sectionName}:`, response.error);
            }
        } catch (error) {
            console.error(`Error saving ${sectionName}:`, error);
        }
    };

    const handleAttemptClose = () => {
        const isDirty = JSON.stringify(formData) !== JSON.stringify(requestData);
        if (isDirty) {
            setShowUnsavedAlert(true); // Pop the warning!
        } else {
            handleForceClose(); // Safe to close
        }
    };

    const handleForceClose = () => {
        setShowUnsavedAlert(false);
        setDialogOpen(false);
        if (requestData) {
            setFormData(JSON.parse(JSON.stringify(requestData)));
        }
    };

    return (
        <>
            <Dialog
                open={dialogOpen}
                onOpenChange={(val) => {
                    if (!val) handleAttemptClose();
                    else setDialogOpen(true);
                }}
            >
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
                                    Detailed breakdown for this financial request.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <IconLoader className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : !formData ? (
                            <div className="flex items-center justify-center p-12 text-muted-foreground text-destructive">
                                Failed to load data.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-[2fr_4fr_2fr] gap-8">
                                <GeneralInformation
                                    formData={formData}
                                    setFormData={setFormData}
                                    onSaveSection={handleSectionSave}
                                />

                                <div className="space-y-6">
                                    <Product
                                        formData={formData}
                                        setFormData={setFormData}
                                        handleAddRow={handleAddRow}
                                        handleArrayChange={handleArrayChange}
                                        formatCurrency={formatCurrency}
                                        handleDeleteRow={handleDeleteRow}
                                        onSaveSection={handleSectionSave}
                                    />

                                    <DeliveryReceipt
                                        formData={formData}
                                        setFormData={setFormData}
                                        handleAddRow={handleAddRow}
                                        handleDeleteRow={handleDeleteRow}
                                        handleArrayChange={handleArrayChange}
                                        formatDate={formatDate}
                                        formatDateForInput={formatDateForInput}
                                        onSaveSection={handleSectionSave}
                                    />

                                    <ServiceInvoice
                                        formData={formData}
                                        setFormData={setFormData}
                                        handleAddRow={handleAddRow}
                                        handleDeleteRow={handleDeleteRow}
                                        handleArrayChange={handleArrayChange}
                                        formatCurrency={formatCurrency}
                                        onSaveSection={handleSectionSave}
                                    />
                                </div>

                                <div className="space-y-6">
                                    <Financial
                                        formData={formData}
                                        formatCurrency={formatCurrency}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        {/* Fixed this button to trigger handleAttemptClose instead of skipping it */}
                        <Button variant="outline" onClick={handleAttemptClose}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                open={showUnsavedAlert}
                onOpenChange={setShowUnsavedAlert}
                title="Unsaved Changes"
                description="You have unsaved changes in this request. If you close now, all your unsaved edits will be lost. Are you sure you want to discard them?"
                onConfirm={handleForceClose}
                confirmText="Discard Changes"
            />
        </>
    );
}