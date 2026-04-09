import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export function DeliveryReceipt({ formData, isSaving, isEditing, handleAddRow, handleDeleteRow, handleArrayChange, formatDate, formatDateForInput }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="flex-1 text-base font-semibold">Delivery Receipts</Label>
                <div className="w-[130px] text-xs text-muted-foreground font-medium">Date Delivered</div>
                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddRow('deliveries')}
                        disabled={isSaving}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                )}
            </div>
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
                                className={`${!isEditing ? "readOnlyInput" : ""}`}
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
                                className={`${!isEditing ? "readOnlyInput" : ""}`}
                                required
                            />
                        </div>
                        {isEditing && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteRow('deliveries', index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">No delivery receipts.</div>
            )}
        </div>
    );
}