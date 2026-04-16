"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRequests() {
    try {
        const requests = await prisma.request.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return { success: true, data: requests };
    } catch (error) {
        console.error("Failed to fetch requests:", error);
        return { success: false, error: "Failed to fetch requests" };
    }
}

type ProductInput = {
    productName: string;
    numOfOrderedStock: number;
    amount?: number;
};

type POInput = {
    poNumber: string;
    products: ProductInput[];
};

type CreateRequestInput = {
    projectCode?: string;
    requestor?: string;
    storeName?: string;
    tinNo?: string;
    storeCategory?: string;
    orNumber?: string;
    purchaseOrders?: POInput[];
};

async function generateProjectCode() {
    const currentYear = new Date().getFullYear();
    const prefix = `${currentYear}-`;

    const latestRequest = await prisma.request.findFirst({
        where: {
            projectCode: {
                startsWith: prefix,
            },
        },
        orderBy: {
            projectCode: "desc",
        },
        select: {
            projectCode: true,
        },
    });

    const latestCode = latestRequest?.projectCode ?? "";
    const latestNumberMatch = latestCode.match(new RegExp(`^${currentYear}-(\\d+)$`));
    const latestNumber = latestNumberMatch?.[1]
        ? Number.parseInt(latestNumberMatch[1], 10)
        : 0;

    const nextNumber = Number.isFinite(latestNumber) && latestNumber > 0
        ? latestNumber + 1
        : 1;

    return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

export async function getNextProjectCodeAction() {
    try {
        const projectCode = await generateProjectCode();
        return { success: true, data: { projectCode } };
    } catch (error) {
        console.error("Failed to generate next project code:", error);
        return { success: false, message: "Failed to generate Project Code preview." };
    }
}

export async function createRequestAction(data: CreateRequestInput) {
    try {
        let retryCount = 0;
        while (retryCount < 3) {
            try {
                const generatedProjectCode = await generateProjectCode();

                const newRequest = await prisma.request.create({
                    data: {
                        projectCode: generatedProjectCode,
                        requestor: data.requestor,
                        storeName: data.storeName,
                        tinNo: data.tinNo,
                        storeCategory: data.storeCategory,
                        updatedBy: "Admin",

                        purchaseOrders: {
                            create: data.purchaseOrders?.map((po) => ({
                                poNumber: po.poNumber,
                                products: {
                                    create: po.products.map((product) => ({
                                        productName: product.productName,
                                        numOfOrderedStock: product.numOfOrderedStock,
                                        amount: product.amount,
                                    })),
                                },
                            })) || [],
                        },
                    },
                });

                revalidatePath("/projects");

                return { success: true, data: newRequest };
            } catch (error: any) {
                const target = error?.meta?.target;
                const projectCodeConflict = Array.isArray(target)
                    ? target.includes("projectCode")
                    : target === "projectCode";

                if (error?.code === "P2002" && projectCodeConflict) {
                    retryCount += 1;
                    continue;
                }

                throw error;
            }
        }

        return { success: false, message: "Failed to generate a unique Project Code. Please try again." };
    } catch (error: any) {
        console.error("Failed to create request:", error);
        if (error.code === 'P2002') {
            return { success: false, message: "A request with this PO Number already exists." };
        }
        return { success: false, message: "An unexpected error occurred." };
    }
}