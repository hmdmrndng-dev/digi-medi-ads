"use client";

import React, { useState, useTransition } from "react";
import { useForm, useFieldArray, Controller, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createRequestAction } from "@/actions/Requests/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
    FieldSet,
    FieldLegend
} from "@/components/ui/field";

const productSchema = z.object({
    productName: z.string().min(1, "Product name is required"),
    numOfOrderedStock: z.number().min(1, "Must order at least 1"),
    amount: z.number().optional(),
});

const poSchema = z.object({
    poNumber: z.string().min(1, "PO Number is required"),
    products: z.array(productSchema).length(1, "Exactly one product is required per purchase order"),
});

const formSchema = z.object({
    projectCode: z.string().optional(),
    requestor: z.string().optional(),
    storeName: z.string().optional(),
    tinNo: z.string().optional(),
    storeCategory: z.string().optional(),
    purchaseOrders: z.array(poSchema).min(1, "At least one purchase order is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateRequestProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateRequest({ isOpen, onClose }: CreateRequestProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [isPending, startTransition] = useTransition();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingSubmitData, setPendingSubmitData] = useState<FormValues | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectCode: "",
            requestor: "",
            storeName: "",
            tinNo: "",
            storeCategory: "",
            purchaseOrders: [{ poNumber: "", products: [{ productName: "", numOfOrderedStock: 1, amount: undefined }] }],
        },
    });

    const { fields: poFields, append: appendPO, remove: removePO } = useFieldArray({
        name: "purchaseOrders",
        control: form.control,
    });

    const handleNextStep = async () => {
        const isStep1Valid = await form.trigger([
            "requestor",
            "storeName",
            "tinNo",
            "storeCategory",
        ]);
        if (isStep1Valid) setStep(2);
    };

    const onSubmit = (data: FormValues) => {
        setPendingSubmitData(data);
        setIsConfirmOpen(true);
    };

    const handleConfirmSubmit = () => {
        if (!pendingSubmitData) return;

        startTransition(async () => {
            const result = await createRequestAction(pendingSubmitData);

            if (result.success) {
                const createdProjectCode = result.data?.projectCode;
                toast.success(
                    createdProjectCode
                        ? `Request created successfully. Project Code: ${createdProjectCode}`
                        : "Request created successfully."
                );

                setIsConfirmOpen(false);
                setPendingSubmitData(null);
                onClose();
                form.reset();
                setStep(1);
            } else {
                toast.error(result.message ?? "Failed to create request.");
            }
        });
    };

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            setStep(1);
            form.reset();
            setIsConfirmOpen(false);
            setPendingSubmitData(null);
        }

        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Request</DialogTitle>
                        <DialogDescription>
                            {step === 1 ? "Step 1: Core Details" : "Step 2: Purchase Orders & Products"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">

                        {/* ================= STEP 1: REQUEST DETAILS ================= */}
                        {step === 1 && (
                            <FieldSet className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                                <FieldGroup className="grid grid-cols-2 gap-4">
                                    <Controller
                                        name="requestor"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Requestor <span className="text-red-500">*</span></FieldLabel>
                                                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="e.g. John Doe" />
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="tinNo"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>TIN No. <span className="text-red-500">*</span></FieldLabel>
                                                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="e.g. TIN-123456789" />
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="storeName"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Store Name <span className="text-red-500">*</span></FieldLabel>
                                                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="e.g. ABC Store" />
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="storeCategory"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Store Category <span className="text-red-500">*</span> </FieldLabel>
                                                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="e.g. Retail" />
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>

                                <div className="flex justify-end pt-4">
                                    <Button type="button" onClick={handleNextStep}>
                                        Next Step <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </FieldSet>
                        )}

                        {/* ================= STEP 2: PURCHASE ORDERS ================= */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                {poFields.map((po, index) => (
                                    <FieldSet key={po.id} className="p-4 border rounded-md bg-muted/10 relative mt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                                            onClick={() => removePO(index)}
                                            disabled={poFields.length === 1 || isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <FieldLegend className="mb-4 text-base font-semibold">
                                            Purchase Order {index + 1}
                                        </FieldLegend>

                                        <Controller
                                            name={`purchaseOrders.${index}.poNumber`}
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid} className="mb-4">
                                                    <FieldLabel htmlFor={field.name}>PO Number <span className="text-red-500">*</span></FieldLabel>
                                                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="PO-12345" />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        {/* NESTED PRODUCTS */}
                                        <ProductList control={form.control} poIndex={index} />
                                    </FieldSet>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-dashed"
                                    onClick={() => appendPO({ poNumber: "", products: [{ productName: "", numOfOrderedStock: 1, amount: undefined }] })}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Purchase Order
                                </Button>

                                <div className="flex justify-between pt-4 border-t">
                                    <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isPending}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                        ) : (
                                            <>Submit Request <Check className="ml-2 h-4 w-4" /></>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Submit Request?"
                description="This will create the request and assign the next available project code."
                onConfirm={handleConfirmSubmit}
                isPending={isPending}
                confirmText="Submit"
                cancelText="Cancel"
            />
        </>
    );
}

// ---------------------------------------------------------------------------
// NESTED PRODUCT LIST COMPONENT
// ---------------------------------------------------------------------------
function ProductList({ control, poIndex }: { control: Control<FormValues>; poIndex: number }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `purchaseOrders.${poIndex}.products`,
    });

    return (
        <div className="space-y-3 mt-4 ml-2 pl-4 border-l-2 border-border">
            <div className="text-sm font-medium text-muted-foreground">Products</div>

            {fields.map((product, pIndex) => (
                <FieldGroup key={product.id} className="flex gap-3 items-start flex-row">

                    <Controller
                        name={`purchaseOrders.${poIndex}.products.${pIndex}.productName`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="flex-1">
                                <FieldLabel htmlFor={field.name} className="text-xs">Product Name <span className="text-red-500">*</span></FieldLabel>
                                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder="Item name" />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name={`purchaseOrders.${poIndex}.products.${pIndex}.numOfOrderedStock`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="w-[100px]">
                                <FieldLabel htmlFor={field.name} className="text-xs">Qty <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    type="number"
                                    {...field}
                                    id={field.name}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name={`purchaseOrders.${poIndex}.products.${pIndex}.amount`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="w-[120px]">
                                <FieldLabel htmlFor={field.name} className="text-xs">Amount</FieldLabel>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    id={field.name}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(pIndex)}
                        disabled={fields.length === 1}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </FieldGroup>
            ))}

            {fields.length === 0 && (
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => append({ productName: "", numOfOrderedStock: 1, amount: undefined })}
                >
                    <Plus className="mr-2 h-3 w-3" /> Add Product
                </Button>
            )}
        </div>
    );
}