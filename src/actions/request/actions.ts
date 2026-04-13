// src/actions/request/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createRequest(formData: FormData) {
    const requestor = formData.get("requestor") as string;
    const tinNo = formData.get("tinNo") as string;
    const storeCategory = formData.get("storeCategory") as string;
    const storeName = formData.get("storeName") as string;
    const purchaseOrderNo = formData.get("purchaseOrderNo") as string;

    const productsDataString = formData.get("productsData") as string;
    const parsedProducts = JSON.parse(productsDataString);

    const formattedProducts = parsedProducts.map((product: { productName: string; numOfOrderedStock: string; amount: string }) => ({
        purchaseOrderNo: purchaseOrderNo,
        productName: product.productName,
        numOfOrderedStock: parseInt(product.numOfOrderedStock, 10),
        amount: parseFloat(product.amount),
    }));

    const currentYear = new Date().getFullYear();

    const currentYearCount = await prisma.request.count({
        where: {
            projectCode: {
                startsWith: `${currentYear}-`,
            },
        },
    });

    const nextNumber = currentYearCount + 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');
    const projectCode = `${currentYear}-${paddedNumber}`;

    await prisma.request.create({
        data: {
            projectCode: projectCode,
            requestor: requestor,
            tinNo: tinNo,
            storeCategory: storeCategory,
            storeName: storeName,
            updatedBy: "developer",

            products: {
                create: formattedProducts,
            },
        },
    });

    redirect("/bookkeeping/project");
}

export async function getRequestDetails(projectCode: string) {
    const requestData = await prisma.request.findUnique({
        where: { projectCode },
        include: {
            products: true,
            invoices: true,
            deliveries: true,
        },
    });

    if (!requestData) {
        throw new Error("Request not found");
    }

    const { products, invoices, deliveries, ...safeRequestData } = requestData;

    return {
        ...safeRequestData,

        items: (products || []).map((p) => ({
            ...p,
            amount: p.amount ? p.amount.toNumber() : null
        })),

        deliveries: deliveries || [],

        invoices: (invoices || []).map((bill) => ({
            ...bill,
            amountDue: bill.amountDue ? bill.amountDue.toNumber() : null,
        }))
    };
}

import { revalidatePath } from "next/cache";
export async function updateRequestDetails(projectCode: string, payload: any) {
    try {
        const {
            deliveryStatus,
            requestor,
            tinNo,
            storeCategory,
            storeName,
            items = [],
            deliveries = [],
            invoices = []
        } = payload;

        const separateData = (arr: any[]) => {
            const toCreate = arr.filter(item => typeof item.id === 'string' && item.id.startsWith('temp-'))
                .map(({ id, ...rest }) => rest);

            const toUpdate = arr.filter(item => typeof item.id !== 'string' || !item.id.startsWith('temp-'));
            const existingIds = toUpdate.map(item => item.id);

            return { toCreate, toUpdate, existingIds };
        };

        const parsedItems = separateData(items);
        const parsedDRs = separateData(deliveries);
        const parsedSIs = separateData(invoices);

        // ========================================================================
        // 1. PRE-CHECK FOR DUPLICATE INVOICES
        // We do this so we can tell the frontend EXACTLY which invoiceNo failed
        // ========================================================================
        const allIncomingInvoices = [...parsedSIs.toCreate, ...parsedSIs.toUpdate];
        const invoiceNosToCheck = allIncomingInvoices.map(si => si.invoiceNo).filter(Boolean);

        if (invoiceNosToCheck.length > 0) {
            // Note: Change 'invoice' below to your actual Prisma model name for invoices (e.g., serviceInvoice)
            const existingDuplicateInvoices = await prisma.serviceInvoice.findMany({
                where: {
                    invoiceNo: { in: invoiceNosToCheck },
                    // We must exclude the IDs currently in this form, otherwise 
                    // updating an existing row will flag itself as a duplicate!
                    id: { notIn: parsedSIs.existingIds.length > 0 ? parsedSIs.existingIds : undefined }
                },
                select: { invoiceNo: true }
            });

            if (existingDuplicateInvoices.length > 0) {
                // Grab the first duplicate we found
                const badInvoice = existingDuplicateInvoices[0].invoiceNo;
                
                // Return the EXACT number in the string so the frontend can highlight it
                return {
                    success: false,
                    error: `This Service Invoice Number '${badInvoice}' already exists. Please use a unique SI number.`
                };
            }
        }

        // ========================================================================
        // 2. PRE-CHECK FOR DUPLICATE DELIVERIES (Optional but recommended)
        // ========================================================================
        const allIncomingDRs = [...parsedDRs.toCreate, ...parsedDRs.toUpdate];
        const receiptNosToCheck = allIncomingDRs.map(dr => dr.receiptNo).filter(Boolean);

        if (receiptNosToCheck.length > 0) {
            // Note: Change 'delivery' below to your actual Prisma model name
            const existingDuplicateDRs = await prisma.deliveryReceipt.findMany({
                where: {
                    receiptNo: { in: receiptNosToCheck },
                    id: { notIn: parsedDRs.existingIds.length > 0 ? parsedDRs.existingIds : undefined }
                },
                select: { receiptNo: true }
            });

            if (existingDuplicateDRs.length > 0) {
                const badReceipt = existingDuplicateDRs[0].receiptNo;
                return {
                    success: false,
                    error: `This Delivery Receipt Number '${badReceipt}' already exists. Please use a unique DR number.`
                };
            }
        }

        // ========================================================================
        // 3. EXECUTE MAIN UPDATE
        // ========================================================================
        const updatedRequest = await prisma.request.update({
            where: { projectCode },
            data: {
                deliveryStatus,
                requestor,
                tinNo,
                storeCategory,
                storeName,

                products: {
                    deleteMany: { id: { notIn: parsedItems.existingIds } },
                    create: parsedItems.toCreate.map(item => ({
                        productName: item.productName,
                        numOfOrderedStock: Number(item.numOfOrderedStock),
                        amount: Number(item.amount),
                        status: item.status
                    })),
                    update: parsedItems.toUpdate.map(item => ({
                        where: { id: item.id },
                        data: {
                            productName: item.productName,
                            numOfOrderedStock: Number(item.numOfOrderedStock),
                            amount: Number(item.amount),
                            status: item.status
                        }
                    }))
                },

                deliveries: {
                    deleteMany: { id: { notIn: parsedDRs.existingIds } },
                    create: parsedDRs.toCreate.map(dr => ({
                        receiptNo: dr.receiptNo,
                        dateDelivered: new Date(dr.dateDelivered)
                    })),
                    update: parsedDRs.toUpdate.map(dr => ({
                        where: { id: dr.id },
                        data: {
                            receiptNo: dr.receiptNo,
                            dateDelivered: new Date(dr.dateDelivered)
                        }
                    }))
                },

                invoices: {
                    deleteMany: { id: { notIn: parsedSIs.existingIds } },
                    create: parsedSIs.toCreate.map(si => ({
                        ...si,
                        amountDue: Number(si.amountDue)
                    })),
                    update: parsedSIs.toUpdate.map(si => ({
                        where: { id: si.id },
                        data: {
                            invoiceNo: si.invoiceNo,
                            amountDue: Number(si.amountDue)
                        }
                    }))
                }
            }
        });

        revalidatePath("/bookkeeping/project");
        return { success: true, data: updatedRequest };

    } catch (error: any) {
        console.error("Failed to update request:", error);

        // Fallback for Prisma P2002 just in case
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target?.includes('receiptNo')) {
                return { success: false, error: "A Delivery Receipt Number in this list already exists." };
            }
            if (target?.includes('invoiceNo')) {
                return { success: false, error: "A Service Invoice Number in this list already exists." };
            }
            return { success: false, error: "A record with this identifier already exists in the system." };
        }

        return { success: false, error: "Failed to update request details. Please try again." };
    }
}

export async function moveToTrash(id: string) {
    try {
        await prisma.request.update({
            where: { id },
            data: { inTrash: true },
        })

        // This forces Next.js to re-fetch the data so the table updates automatically
        revalidatePath("/project") // Adjust this path to wherever your table is displayed

        return { success: true }
    } catch (error) {
        console.error("Failed to move request to trash:", error)
        return { success: false, error: "Failed to move to trash" }
    }
}

export async function restoreFromTrash(id: string) {
    try {
        await prisma.request.update({
            where: { id },
            data: { inTrash: false },
        })
        revalidatePath("/project")
        return { success: true }
    } catch (error) {
        console.error("Failed to restore request from trash:", error)
        return { success: false, error: "Failed to restore from trash" }
    }
}

export async function permanentlyDelete(id: string) {
    try {
        await prisma.request.delete({
            where: { id },
        })
        revalidatePath("/project")
        return { success: true }
    } catch (error) {
        console.error("Failed to permanently delete request:", error)
        return { success: false, error: "Failed to permanently delete" }
    }
}
