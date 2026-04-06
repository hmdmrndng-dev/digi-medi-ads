// src/actions/request/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createRequest(formData: FormData) {
    // 1. Extract parent Request fields
    const projectType = formData.get("projectType") as string;
    const amountDue = parseFloat(formData.get("amountDue") as string);

    // 2. Extract and parse the multiple items array
    const itemsDataString = formData.get("itemsData") as string;
    const parsedItems = JSON.parse(itemsDataString);

    // Format the items to ensure numbers are parsed correctly for Prisma
    const formattedItems = parsedItems.map((item: { productName: string; numOfOrderedStock: string }) => ({
        productName: item.productName,
        numOfOrderedStock: parseInt(item.numOfOrderedStock, 10),
    }));

    // 3. Generate custom Project Code (YYYY-XXXX)
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

    // 4. Create the Request and nested RequestItems in one transaction
    await prisma.request.create({
        data: {
            projectCode: projectCode,
            projectType: projectType,
            amountDue: amountDue,
            // This is where Prisma creates all the associated products
            items: {
                create: formattedItems,
            },
        },
    });

    // 5. Redirect back to the main page
    redirect("/bookkeeping/financial");
}