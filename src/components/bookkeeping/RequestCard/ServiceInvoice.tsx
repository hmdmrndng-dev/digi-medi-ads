import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCheck, IconEdit, IconLoader2, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export function ServiceInvoice({
    formData,
    setFormData,
    handleAddRow,
    handleDeleteRow,
    handleArrayChange,
    formatCurrency,
    onSaveSection
}: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [backupData, setBackupData] = useState<any[]>([]);

    const [errors, setErrors] = useState<Record<number, { invoiceNo?: boolean; amountDue?: boolean }>>({});

    const handleEdit = () => {
        setBackupData(JSON.parse(JSON.stringify(formData.invoices || [])));
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData((prev: any) => ({ ...prev, invoices: backupData }));
        setIsEditing(false);
        setErrors({}); 
    };

    const clearError = (index: number, field: 'invoiceNo' | 'amountDue') => {
        setErrors((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                [field]: false,
            }
        }));
    };

    const handleConfirmSave = async () => {
        setIsSaving(true);
        
        let newErrors: Record<number, { invoiceNo?: boolean; amountDue?: boolean }> = {};
        let hasValidationError = false;
        let hasDuplicateError = false;

        // 1. FRONTEND CHECK: Duplicate SI Numbers in the current form
        const seenInvoices = new Set<string>();
        const duplicateInvoices = new Set<string>();

        formData.invoices?.forEach((invoice: any) => {
            const siNumber = invoice.invoiceNo?.trim().toLowerCase();
            if (siNumber) {
                if (seenInvoices.has(siNumber)) {
                    duplicateInvoices.add(siNumber);
                } else {
                    seenInvoices.add(siNumber);
                }
            }
        });

        // 2. Validate every row against blanks, zeros, AND frontend duplicates
        formData.invoices?.forEach((invoice: any, index: number) => {
            const siNumber = invoice.invoiceNo?.trim().toLowerCase();

            if (!invoice.invoiceNo || invoice.invoiceNo.trim() === "") {
                newErrors[index] = { ...newErrors[index], invoiceNo: true };
                hasValidationError = true;
            } else if (siNumber && duplicateInvoices.has(siNumber)) {
                newErrors[index] = { ...newErrors[index], invoiceNo: true };
                hasDuplicateError = true;
                hasValidationError = true;
            }

            if (!invoice.amountDue || Number(invoice.amountDue) <= 0) {
                newErrors[index] = { ...newErrors[index], amountDue: true };
                hasValidationError = true;
            }
        });

        if (hasValidationError) {
            setErrors(newErrors);
            if (hasDuplicateError) {
                toast.error("Duplicate SI Numbers found in the list. Please ensure all SI Numbers are unique.");
            } else {
                toast.error("Please fill out all required fields with valid amounts.");
            }
            setIsSaving(false);
            setIsConfirmOpen(false);
            return;
        }

        setErrors({}); 

        if (onSaveSection) {
            const response = await onSaveSection('invoices', formData.invoices);

            if (response && !response.success) {
                toast.error(response.error); 
                
                let backendErrors: Record<number, { invoiceNo?: boolean }> = {};
                let foundMatch = false;

                if (typeof response.error === 'string') {
                    formData.invoices.forEach((invoice: any, index: number) => {
                        if (invoice.invoiceNo && response.error.includes(invoice.invoiceNo)) {
                            backendErrors[index] = { invoiceNo: true };
                            foundMatch = true;
                        }
                    });
                }

                if (foundMatch) {
                    setErrors(backendErrors);
                }

                setIsSaving(false);
                setIsConfirmOpen(false);
                return; 
            }
        }

        toast.success("Service invoices saved successfully!");
        setIsSaving(false);
        setIsEditing(false);
        setIsConfirmOpen(false);
    };

    return (
        <div className="space-y-4 border-t pt-4 lg:border-t-0 lg:pt-0">
            <div className="flex gap-2 items-center justify-between border-b pb-2">
                <Label className="text-base font-semibold">Service Invoices</Label>

                {!isEditing ? (
                    <Button type="button" variant="ghost" size="sm" onClick={handleEdit}>
                        <IconEdit className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
                        <IconX className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <div className="flex gap-2 items-center px-1">
                <div className="flex-1 text-xs text-muted-foreground font-medium">SI Number</div>
                <div className="w-[120px] text-xs text-muted-foreground font-medium">Amount Due</div>
                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handleAddRow('invoices')}
                        disabled={isSaving}
                    >
                        <IconPlus className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {formData.invoices?.length > 0 ? (
                formData.invoices.map((sip: any, index: number) => (
                    <div key={sip.id || index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                            <Input
                                type="text"
                                placeholder="SI Number"
                                value={sip.invoiceNo || ""}
                                readOnly={!isEditing}
                                onChange={(e) => {
                                    clearError(index, 'invoiceNo');
                                    handleArrayChange('invoices', index, 'invoiceNo', e.target.value);
                                }}
                                className={`
                                    ${!isEditing ? "font-medium bg-muted/30" : ""} 
                                    ${errors[index]?.invoiceNo && isEditing ? "border-destructive focus-visible:ring-destructive text-destructive" : ""}
                                `}
                                required
                            />
                        </div>
                        <div className="w-[120px] space-y-2">
                            <Input
                                type={isEditing ? "number" : "text"}
                                placeholder="Amount Due"
                                value={isEditing ? (sip.amountDue ?? "") : formatCurrency(sip.amountDue)}
                                readOnly={!isEditing}
                                onChange={(e) => {
                                    clearError(index, 'amountDue');
                                    const cleanValue = e.target.value.replace(/^0+(?!\.|$)/, '');
                                    handleArrayChange('invoices', index, 'amountDue', cleanValue);
                                }}
                                className={`
                                    ${!isEditing ? "font-medium bg-muted/30" : ""}
                                    ${errors[index]?.amountDue && isEditing ? "border-destructive focus-visible:ring-destructive text-destructive" : ""}
                                `}
                                required
                                step="0.01"
                                min="0.01" 
                            />
                        </div>
                        {isEditing && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => handleDeleteRow('invoices', index)}
                                disabled={isSaving}
                            >
                                <IconTrash className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">No invoices found.</div>
            )}

            {isEditing && (
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                        <IconX className="w-4 h-4 mr-1" /> Cancel
                    </Button>

                    <Button type="button" size="sm" onClick={() => setIsConfirmOpen(true)} disabled={isSaving}>
                        {isSaving ? <IconLoader2 className="w-4 h-4 mr-1 animate-spin" /> : <IconCheck className="w-4 h-4 mr-1" />} Save
                    </Button>
                </div>
            )}

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Save Service Invoices?"
                description="Are you sure you want to save the changes made to the service invoices?"
                onConfirm={handleConfirmSave}
                isPending={isSaving}
                confirmText={isSaving ? "Saving..." : "Confirm Save"}
            />
        </div>
    );
}