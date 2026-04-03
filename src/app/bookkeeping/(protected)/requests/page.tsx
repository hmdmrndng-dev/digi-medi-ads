// src/app/bookkeeping/(protected)/requests/page.tsx

import { RequestTable } from "@/components/bookkeeping/RequestPage"
import { prisma } from "@/lib/prisma";

export default async function Page() {

    const requests = await prisma.request.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    const safeRequests = requests.map((req) => ({
        ...req,
        // If amountDue exists, convert it to a number. Otherwise, leave it null.
        amountDue: req.amountDue ? Number(req.amountDue) : null,
    }))

    return (
        <>
            {/* 4. Pass the data to your UI component */}
            <RequestTable requests={safeRequests} />
        </>
    )
}