import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconCheck, IconEdit, IconLoader2, IconX } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/confirm-dialog"; // Adjust import path if needed

export function GeneralInformation({ formData, setFormData, onSaveSection }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Added state for the dialog
    const [backupData, setBackupData] = useState<any>({});

    const handleEdit = () => {
        // Backup only the flat fields managed by this section
        setBackupData({
            requestor: formData.requestor,
            tinNo: formData.tinNo,
            storeCategory: formData.storeCategory,
            storeName: formData.storeName,
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData((prev: any) => ({ ...prev, ...backupData }));
        setIsEditing(false);
    };

    // This now actually performs the save after confirmation
    const handleConfirmSave = async () => {
        setIsSaving(true);
        if (onSaveSection) {
            // Pass an object of just the updated root-level fields
            await onSaveSection('general', {
                requestor: formData.requestor,
                tinNo: formData.tinNo,
                storeCategory: formData.storeCategory,
                storeName: formData.storeName,
            });
        }
        setIsSaving(false);
        setIsEditing(false);
        setIsConfirmOpen(false); // Close the dialog upon success
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
                <Label className="text-base font-semibold">General Information</Label>

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

            <div className="space-y-2">
                <Label>Project Code</Label>
                <Input
                    type="text"
                    value={formData.projectCode || ""}
                    readOnly
                    className="font-medium bg-muted/50" // Removed duplicate bg-muted/30
                />
            </div>

            <div className="space-y-2">
                <Label>Requestor</Label>
                <Input
                    type="text"
                    value={formData.requestor || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, requestor: e.target.value }))}
                    className={!isEditing ? "font-medium bg-muted/30" : ""}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label>Tin No.</Label>
                <Input
                    type="text"
                    value={formData.tinNo || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, tinNo: e.target.value }))}
                    className={!isEditing ? "font-medium bg-muted/30" : ""}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label>Store Category</Label>
                <Input
                    type="text"
                    value={formData.storeCategory || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, storeCategory: e.target.value }))}
                    className={!isEditing ? "font-medium bg-muted/30" : ""}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                    type="text"
                    value={formData.storeName || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, storeName: e.target.value }))}
                    className={!isEditing ? "font-medium bg-muted/30" : ""}
                    required
                />
            </div>

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
                title="Save General Information?"
                description="Are you sure you want to save the changes made to the general information section?"
                onConfirm={handleConfirmSave}
                isPending={isSaving}
                confirmText={isSaving ? "Saving..." : "Confirm Save"}
            />
        </div>
    );
}