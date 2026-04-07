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