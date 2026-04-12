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
import { createRequest } from "@/actions/request/actions";
import { IconPlus, IconTrash } from "@tabler/icons-react";

export function CreateRequestDialog({ expectedProjectCode }: { expectedProjectCode: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const formRef = useRef<HTMLFormElement>(null);

    const [products, setProducts] = useState([
        { productName: "", numOfOrderedStock: "", amount: "" }
    ]);

    const handleAddProduct = () => {
        setProducts([...products, { productName: "", numOfOrderedStock: "", amount: "" }]);
    };

    const handleRemoveProduct = (indexToRemove: number) => {
        setProducts(products.filter((_, index) => index !== indexToRemove));
    };

    const handleProductChange = (index: number, field: "productName" | "numOfOrderedStock" | "amount", value: string) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        setProducts(newProducts);
    };

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            try {
                await createRequest(formData);

                setOpen(false);
                setProducts([{ productName: "", numOfOrderedStock: "", amount: "" }]);
                formRef.current?.reset();

            } catch (error) {
                if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
                    setOpen(false);
                    setProducts([{ productName: "", numOfOrderedStock: "", amount: "" }]);
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

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
                            <Label htmlFor="requestor">Requestor <span className="text-destructive">*</span></Label>
                            <Input
                                type="text"
                                id="requestor"
                                name="requestor"
                                required
                                disabled={isPending}
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tinNo">TIN No. </Label>
                            <Input
                                type="text"
                                id="tinNo"
                                name="tinNo"
                                required
                                disabled={isPending}
                                placeholder="e.g. 123-456-789-000 "
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="storeCategory">Store Category <span className="text-destructive">*</span></Label>
                            <Input
                                type="text"
                                id="storeCategory"
                                name="storeCategory"
                                required
                                disabled={isPending}
                                placeholder="e.g. Franchise"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name <span className="text-destructive">*</span></Label>
                            <Input
                                type="text"
                                id="storeName"
                                name="storeName"
                                required
                                disabled={isPending}
                                placeholder="e.g. Main Branch"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purchaseOrderNo">Purchase Order ID</Label>
                            <Input
                                type="text"
                                id="purchaseOrderNo"
                                name="purchaseOrderNo"
                                disabled={isPending}
                                placeholder="e.g. PO-12345"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Products <span className="text-destructive">*</span></Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddProduct}
                                disabled={isPending}
                            >
                                <IconPlus className="w-4 h-4" />
                            </Button>
                        </div>

                        <input type="hidden" name="productsData" value={JSON.stringify(products)} />

                        {products.map((product, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        type="text"
                                        placeholder="Product Name"
                                        value={product.productName}
                                        required
                                        disabled={isPending}
                                        onChange={(e) => handleProductChange(index, "productName", e.target.value)}
                                    />
                                </div>
                                <div className="w-[100px] space-y-2">
                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        value={product.numOfOrderedStock}
                                        required
                                        min="1"
                                        disabled={isPending}
                                        onChange={(e) => handleProductChange(index, "numOfOrderedStock", e.target.value)}
                                    />
                                </div>
                                <div className="w-[120px] space-y-2">
                                    <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={product.amount}
                                        step="0.01"
                                        min="0"
                                        disabled={isPending}
                                        onChange={(e) => handleProductChange(index, "amount", e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveProduct(index)}
                                    disabled={products.length === 1 || isPending}
                                >
                                    <IconTrash className="w-4 h-4" />
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