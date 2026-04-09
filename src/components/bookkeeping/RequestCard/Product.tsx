import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export function Product({ formData, isEditing, isSaving, handleAddRow, handleArrayChange, formatCurrency, handleDeleteRow }: any) {
    return (
        <div className="space-y-4 border-t pt-4 lg:border-t-0 lg:pt-0">
            <div className="flex gap-2 items-center">
                <Label className="flex-1 text-base font-semibold">Products</Label>
                <div className="w-[100px] text-xs text-muted-foreground font-medium">Qty</div>
                <div className="w-[120px] text-xs text-muted-foreground font-medium">Amount</div>
                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddRow('items')}
                        disabled={isSaving}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                )}
            </div>

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
                                    className={`${!isEditing ? "readOnlyInput" : ""} ${isCancelled && !isEditing ? "line-through text-muted-foreground" : ""}`}
                                    required
                                />
                            </div>
                            <div className="w-[100px] space-y-2">
                                <Input
                                    type="number"
                                    placeholder="Qty"
                                    value={product.numOfOrderedStock}
                                    readOnly={!isEditing}
                                    onChange={(e) => handleArrayChange('items', index, 'numOfOrderedStock', e.target.value)}
                                    className={`${!isEditing ? "readOnlyInput" : ""} ${isCancelled && !isEditing ? "line-through text-muted-foreground" : ""}`}
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
                                    className={`${!isEditing ? "readOnlyInput" : ""} ${isCancelled && !isEditing ? "line-through text-muted-foreground" : ""}`}
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
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteRow('items', index)}
                                    disabled={formData.items?.length <= 1 || isSaving}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/50 rounded-md">No products found.</div>
            )}
        </div>
    );
}