// src/actions/request/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createRequest(formData: FormData) {
    const productName = formData.get("productName") as string;
    const numOfOrderedStock = parseInt(formData.get("numOfOrderedStock") as string, 10);
    const amountDue = parseFloat(formData.get("amountDue") as string);

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
            productName: productName,
            numOfOrderedStock: numOfOrderedStock,
            amountDue: amountDue,
        },
    });

    redirect("/bookkeeping/financial");
}