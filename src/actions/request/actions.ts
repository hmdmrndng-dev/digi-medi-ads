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

            products: {
                create: formattedProducts,
            },
        },
    });

    redirect("/bookkeeping/financial");
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
                            receiptNo: si.receiptNo,
                            amountDue: Number(si.amountDue)
                        }
                    }))
                }
            }
        });

        revalidatePath("/bookkeeping/financial");
        return { success: true, data: updatedRequest };

    } catch (error) {
        console.error("Failed to update request:", error);
        return { success: false, error: "Failed to update request details." };
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

        // This forces Next.js to re-fetch the data so the table updates automatically
        revalidatePath("/project") // Adjust this path to wherever your table is displayed

        return { success: true }
    } catch (error) {
        console.error("Failed to move request to trash:", error)
        return { success: false, error: "Failed to move to trash" }
    }
}
