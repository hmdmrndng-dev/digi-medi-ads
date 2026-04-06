// src/app/bookkeeping/(protected)/financial/CreateRequestDialog.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { createRequest } from "@/actions/request/actions";

export function CreateRequestDialog({ expectedProjectCode }: { expectedProjectCode: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const formRef = useRef<HTMLFormElement>(null);

    const [items, setItems] = useState([
        { productName: "", numOfOrderedStock: "" }
    ]);

    const handleAddItem = () => {
        setItems([...items, { productName: "", numOfOrderedStock: "" }]);
    };

    const handleRemoveItem = (indexToRemove: number) => {
        setItems(items.filter((_, index) => index !== indexToRemove));
    };

    const handleItemChange = (index: number, field: "productName" | "numOfOrderedStock", value: string) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            try {
                await createRequest(formData);

                setOpen(false);
                setItems([{ productName: "", numOfOrderedStock: "" }]);
                formRef.current?.reset();

            } catch (error) {
                if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
                    setOpen(false);
                    setItems([{ productName: "", numOfOrderedStock: "" }]);
                    formRef.current?.reset();
                    throw error;
                }
                console.error("Failed to create request", error);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create Request</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Request</DialogTitle>
                    <DialogDescription>
                        Fill out the details below to log a new stock request.
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectCode">Project Code</Label>
                            <Input
                                type="text"
                                id="projectCode"
                                name="projectCode"
                                value={expectedProjectCode}
                                readOnly
                                className="bg-muted text-muted-foreground cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="projectType">Project Type</Label>
                            <Input
                                type="text"
                                id="projectType"
                                name="projectType"
                                required
                                disabled={isPending}
                                placeholder="e.g. Installation"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amountDue">Total Amount Due</Label>
                        <Input
                            type="number"
                            id="amountDue"
                            name="amountDue"
                            required
                            min="0"
                            step="0.01"
                            disabled={isPending}
                            placeholder="e.g. 199.99"
                        />
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Products</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddItem}
                                disabled={isPending}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Item
                            </Button>
                        </div>

                        <input type="hidden" name="itemsData" value={JSON.stringify(items)} />

                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        type="text"
                                        placeholder="Product Name"
                                        value={item.productName}
                                        required
                                        disabled={isPending}
                                        onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                                    />
                                </div>
                                <div className="w-[120px] space-y-2">
                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        value={item.numOfOrderedStock}
                                        required
                                        min="1"
                                        disabled={isPending}
                                        onChange={(e) => handleItemChange(index, "numOfOrderedStock", e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveItem(index)}
                                    disabled={items.length === 1 || isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={isPending}>
                        {isPending ? "Saving..." : "Save Request"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}