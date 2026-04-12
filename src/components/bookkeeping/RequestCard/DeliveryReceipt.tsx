import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCheck, IconEdit, IconLoader2, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/confirm-dialog"; // Adjust import path if needed

export function DeliveryReceipt({
    formData,
    setFormData,
    handleAddRow,
    handleDeleteRow,
    handleArrayChange,
    formatDate,
    formatDateForInput,
    onSaveSection
}: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [backupData, setBackupData] = useState<any[]>([]);

    const handleEdit = () => {
        setBackupData(JSON.parse(JSON.stringify(formData.deliveries || [])));
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData((prev: any) => ({ ...prev, deliveries: backupData }));
        setIsEditing(false);
    };

    const handleConfirmSave = async () => {
        setIsSaving(true);
        if (onSaveSection) {
            await onSaveSection('deliveries', formData.deliveries);
        }
        setIsSaving(false);
        setIsEditing(false);
        setIsConfirmOpen(false);
    };

    return (
        <div className="space-y-4 border-t pt-4 lg:border-t-0 lg:pt-0">
            {/* COMPONENT HEADER WITH INDEPENDENT CONTROLS */}
            <div className="flex gap-2 items-center justify-between border-b pb-2">
                <Label className="text-base font-semibold">Delivery Receipts</Label>

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
                <div className="flex-1 text-xs text-muted-foreground font-medium">DR Number</div>
                <div className="w-[130px] text-xs text-muted-foreground font-medium">Date Delivered</div>
                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handleAddRow('deliveries')}
                        disabled={isSaving}
                    >
                        <IconPlus className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* DELIVERY RECEIPT ROWS */}
            {formData.deliveries?.length > 0 ? (
                formData.deliveries.map((dr: any, index: number) => (
                    <div key={dr.id || index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                            <Input
                                type="text"
                                placeholder="DR Number"
                                value={dr.receiptNo || ""}
                                readOnly={!isEditing}
                                onChange={(e) => handleArrayChange('deliveries', index, 'receiptNo', e.target.value)}
                                className={!isEditing ? "font-medium bg-muted/30" : ""}
                                required
                            />
                        </div>
                        <div className="w-[130px] space-y-2">
                            <Input
                                type={isEditing ? "date" : "text"}
                                placeholder="Date"
                                value={isEditing ? formatDateForInput(dr.dateDelivered) : formatDate(dr.dateDelivered)}
                                readOnly={!isEditing}
                                onChange={(e) => handleArrayChange('deliveries', index, 'dateDelivered', e.target.value)}
                                className={!isEditing ? "font-medium bg-muted/30" : ""}
                                required
                            />
                        </div>
                        {isEditing && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => handleDeleteRow('deliveries', index)}
                                disabled={isSaving}
                            >
                                <IconTrash className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">No delivery receipts.</div>
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
                title="Save Delivery Receipts?"
                description="Are you sure you want to save the changes made to the delivery receipts?"
                onConfirm={handleConfirmSave}
                isPending={isSaving}
                confirmText={isSaving ? "Saving..." : "Confirm Save"}
            />
        </div>
    );
}