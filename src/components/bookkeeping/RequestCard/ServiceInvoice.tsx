import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export function ServiceInvoice({ formData, isSaving, isEditing, handleAddRow, handleDeleteRow, handleArrayChange, formatCurrency }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="flex-1 text-base font-semibold">Service Invoices</Label>
                <div className="w-[120px] text-xs text-muted-foreground font-medium">Amount Due</div>
                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddRow('invoices')}
                        disabled={isSaving}
                    >
                        <Plus className="w-4 h-4" />
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
                                value={sip.receiptNo || ""}
                                readOnly={!isEditing}
                                onChange={(e) => handleArrayChange('invoices', index, 'receiptNo', e.target.value)}
                                className={`${!isEditing ? "readOnlyInput" : ""}`}
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
                                onClick={() => handleDeleteRow('invoices', index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">No payments.</div>
            )}
        </div>
    );
}