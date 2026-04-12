import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCheck, IconEdit, IconLoader2, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/confirm-dialog"; // Adjust import path if needed

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
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Added state for the dialog
    const [backupData, setBackupData] = useState<any[]>([]);

    const handleEdit = () => {
        setBackupData(JSON.parse(JSON.stringify(formData.invoices || [])));
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData((prev: any) => ({ ...prev, invoices: backupData }));
        setIsEditing(false);
    };

    // This now actually performs the save after confirmation
    const handleConfirmSave = async () => {
        setIsSaving(true);
        if (onSaveSection) {
            await onSaveSection('invoices', formData.invoices);
        }
        setIsSaving(false);
        setIsEditing(false);
        setIsConfirmOpen(false); // Close the dialog upon success
    };

    return (
        <div className="space-y-4 border-t pt-4 lg:border-t-0 lg:pt-0">
            {/* COMPONENT HEADER WITH INDEPENDENT CONTROLS */}
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

            {/* COLUMN HEADERS & ADD BUTTON */}
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

            {/* INVOICE ROWS */}
            {formData.invoices?.length > 0 ? (
                formData.invoices.map((sip: any, index: number) => (
                    <div key={sip.id || index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                            <Input
                                type="text"
                                placeholder="SI Number"
                                value={sip.invoiceNo || ""}
                                readOnly={!isEditing}
                                onChange={(e) => handleArrayChange('invoices', index, 'invoiceNo', e.target.value)}
                                className={!isEditing ? "font-medium bg-muted/30" : ""}
                                required
                            />
                        </div>
                        <div className="w-[120px] space-y-2">
                            <Input
                                type={isEditing ? "number" : "text"}
                                placeholder="Amount Due"
                                value={isEditing ? (sip.amountDue ?? "") : formatCurrency(sip.amountDue)}
                                readOnly={!isEditing}
                                onChange={(e) => handleArrayChange('invoices', index, 'amountDue', e.target.value)}
                                className={!isEditing ? "font-medium bg-muted/30" : ""}
                                required
                                step="0.01"
                                min="0"
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

            {/* ACTION BUTTONS (BOTTOM) */}
            {isEditing && (
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                        <IconX className="w-4 h-4 mr-1" /> Cancel
                    </Button>

                    {/* Changed onClick to open the dialog instead of saving immediately */}
                    <Button type="button" size="sm" onClick={() => setIsConfirmOpen(true)} disabled={isSaving}>
                        {isSaving ? <IconLoader2 className="w-4 h-4 mr-1 animate-spin" /> : <IconCheck className="w-4 h-4 mr-1" />} Save
                    </Button>
                </div>
            )}

            {/* Added ConfirmDialog Portal here */}
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