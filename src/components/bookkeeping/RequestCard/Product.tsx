import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCheck, IconEdit, IconLoader2, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/confirm-dialog"; // Adjust import path if needed

export function Product({
    formData,
    setFormData,
    handleAddRow,
    handleArrayChange,
    formatCurrency,
    handleDeleteRow,
    onSaveSection
}: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Added state for the dialog
    const [backupData, setBackupData] = useState<any[]>([]);

    const handleEdit = () => {
        setBackupData(JSON.parse(JSON.stringify(formData.items || [])));
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData((prev: any) => ({ ...prev, items: backupData }));
        setIsEditing(false);
    };

    // This now actually performs the save after confirmation
    const handleConfirmSave = async () => {
        setIsSaving(true);
        if (onSaveSection) {
            await onSaveSection('items', formData.items);
        }
        setIsSaving(false);
        setIsEditing(false);
        setIsConfirmOpen(false); // Close the dialog upon success
    };

    return (
        <div className="space-y-4 border-t pt-4 lg:border-t-0 lg:pt-0">
            {/* COMPONENT HEADER WITH INDEPENDENT CONTROLS */}
            <div className="flex gap-2 items-center justify-between border-b pb-2">
                <Label className="text-base font-semibold">Products</Label>

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
                <div className="flex-1 text-xs text-muted-foreground font-medium">Product Name</div>
                <div className="w-[60px] text-xs text-muted-foreground font-medium">Qty</div>
                <div className="w-[120px] text-xs text-muted-foreground font-medium">Amount</div>
                <div className="w-[80px] text-xs text-muted-foreground font-medium">PO Number</div>
                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handleAddRow('items')}
                        disabled={isSaving}
                    >
                        <IconPlus className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* PRODUCT ROWS */}
            {formData.items?.length > 0 ? (
                formData.items.map((product: any, index: number) => {
                    const isCancelled = product.status === false;
                    return (
                        <div key={product.id || index} className={`flex gap-2 items-start ${isCancelled && !isEditing ? "opacity-50 grayscale" : ""}`}>
                            <div className="flex-1 space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Product Name"
                                    value={product.productName}
                                    readOnly={!isEditing}
                                    onChange={(e) => handleArrayChange('items', index, 'productName', e.target.value)}
                                    className={`${!isEditing ? "font-medium bg-muted/30" : ""} ${isCancelled && !isEditing ? "line-through text-muted-foreground" : ""}`}
                                    required
                                />
                            </div>
                            <div className="w-[60px] space-y-2">
                                <Input
                                    type="number"
                                    placeholder="Qty"
                                    value={product.numOfOrderedStock}
                                    readOnly={!isEditing}
                                    onChange={(e) => handleArrayChange('items', index, 'numOfOrderedStock', e.target.value)}
                                    className={`${!isEditing ? "font-medium bg-muted/30" : ""} ${isCancelled && !isEditing ? "line-through text-muted-foreground" : ""}`}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="w-[120px] space-y-2">
                                <Input
                                    type={isEditing ? "number" : "text"}
                                    placeholder="Amount"
                                    value={isEditing ? product.amount : formatCurrency(product.amount)}
                                    readOnly={!isEditing}
                                    onChange={(e) => handleArrayChange('items', index, 'amount', e.target.value)}
                                    className={`${!isEditing ? "font-medium bg-muted/30" : ""} ${isCancelled && !isEditing ? "line-through text-muted-foreground" : ""}`}
                                    required
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div className="w-[80px] space-y-2">
                                <Input
                                    type="text"
                                    placeholder="PO No."
                                    value={product.purchaseOrderNo}
                                    readOnly={!isEditing}
                                    onChange={(e) => handleArrayChange('items', index, 'purchaseOrderNo', e.target.value)}
                                    className={`${!isEditing ? "font-medium bg-muted/30" : ""} ${isCancelled && !isEditing ? "line-through text-muted-foreground" : ""}`}
                                    required
                                />
                            </div>
                            {isEditing && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => handleDeleteRow('items', index)}
                                    disabled={formData.items?.length <= 1 || isSaving}
                                >
                                    <IconTrash className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">No products found.</div>
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
                title="Save Products?"
                description="Are you sure you want to save the changes made to the products list?"
                onConfirm={handleConfirmSave}
                isPending={isSaving}
                confirmText={isSaving ? "Saving..." : "Confirm Save"}
            />
        </div>
    );
}