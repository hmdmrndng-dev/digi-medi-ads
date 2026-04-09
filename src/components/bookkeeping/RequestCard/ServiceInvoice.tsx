import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export function ServiceInvoice({ formData, isSaving, isEditing, handleAddRow, handleDeleteRow, handleArrayChange, formatCurrency }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Service Invoices</Label>
                <div className="w-[120px] text-xs text-muted-foreground font-medium">Paid</div>
                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddRow('serviceInvoicePayment')}
                        disabled={isSaving}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                )}
            </div>
            {formData.serviceInvoicePayment?.length > 0 ? (
                formData.serviceInvoicePayment.map((sip: any, index: number) => (
                    <div key={sip.id || index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                            <Input
                                type="text"
                                placeholder="SI Number"
                                value={sip.serviceInvoiceId || ""}
                                readOnly={!isEditing}
                                onChange={(e) => handleArrayChange('serviceInvoicePayment', index, 'serviceInvoiceId', e.target.value)}
                                className={`${!isEditing ? "readOnlyInput" : ""}`}
                                required
                            />
                        </div>
                        <div className="w-[120px] space-y-2">
                            <Input
                                type={isEditing ? "number" : "text"}
                                placeholder="Amount Paid"
                                value={isEditing ? sip.amountPaid : formatCurrency(sip.amountPaid)}
                                readOnly={!isEditing}
                                onChange={(e) => handleArrayChange('serviceInvoicePayment', index, 'amountPaid', e.target.value)}
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
                                onClick={() => handleDeleteRow('serviceInvoicePayment', index)}
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