// src/actions/request/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createRequest(formData: FormData) {
    const requestor = formData.get("requestor") as string;
    const storeCategory = formData.get("storeCategory") as string;
    const storeName = formData.get("storeName") as string;

    const productsDataString = formData.get("productsData") as string;
    const parsedProducts = JSON.parse(productsDataString);

    const formattedProducts = parsedProducts.map((product: { productName: string; numOfOrderedStock: string; amount: string }) => ({
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
            storeCategory: storeCategory,
            storeName: storeName,

            product: {
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
            product: true,
            serviceInvoicePayment: true,
            deliveryReceipts: true,
        },
    });

    if (!requestData) {
        throw new Error("Request not found");
    }

    const { product, serviceInvoicePayment, deliveryReceipts, ...safeRequestData } = requestData;

    return {
        ...safeRequestData,

        items: (product || []).map((p) => ({
            ...p,
            amount: p.amount ? p.amount.toNumber() : null
        })),

        deliveryReceipts: deliveryReceipts || [],

        serviceInvoicePayment: (serviceInvoicePayment || []).map((payment) => ({
            ...payment,
            amountPaid: payment.amountPaid ? payment.amountPaid.toNumber() : null,
        }))
    };
}

import { revalidatePath } from "next/cache";
export async function updateRequestDetails(projectCode: string, payload: any) {
    try {
        const {
            deliveryStatus,
            requestor,
            storeCategory,
            storeName,
            items = [],
            deliveryReceipts = [],
            serviceInvoicePayment = []
        } = payload;

        const separateData = (arr: any[]) => {
            const toCreate = arr.filter(item => typeof item.id === 'string' && item.id.startsWith('temp-'))
                .map(({ id, ...rest }) => rest);

            const toUpdate = arr.filter(item => typeof item.id !== 'string' || !item.id.startsWith('temp-'));
            const existingIds = toUpdate.map(item => item.id);

            return { toCreate, toUpdate, existingIds };
        };

        const parsedItems = separateData(items);
        const parsedDRs = separateData(deliveryReceipts);
        const parsedSIs = separateData(serviceInvoicePayment);

        const updatedRequest = await prisma.request.update({
            where: { projectCode },
            data: {
                deliveryStatus,
                requestor,
                storeCategory,
                storeName,

                // 🛑 CHANGED: 'items' to 'product' to match your Prisma schema
                product: {
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

                deliveryReceipts: {
                    deleteMany: { id: { notIn: parsedDRs.existingIds } },
                    create: parsedDRs.toCreate.map(dr => ({
                        deliveryReceipt: dr.deliveryReceipt,
                        deliveryDate: new Date(dr.deliveryDate)
                    })),
                    update: parsedDRs.toUpdate.map(dr => ({
                        where: { id: dr.id },
                        data: {
                            deliveryReceipt: dr.deliveryReceipt,
                            deliveryDate: new Date(dr.deliveryDate)
                        }
                    }))
                },

                serviceInvoicePayment: {
                    deleteMany: { id: { notIn: parsedSIs.existingIds } },
                    create: parsedSIs.toCreate.map(si => ({
                        ...si,
                        amountPaid: Number(si.amountPaid)
                    })),
                    update: parsedSIs.toUpdate.map(si => ({
                        where: { id: si.id },
                        data: {
                            serviceInvoiceId: si.serviceInvoiceId,
                            amountPaid: Number(si.amountPaid)
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