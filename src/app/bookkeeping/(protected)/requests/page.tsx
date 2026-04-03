// src/app/bookkeeping/(protected)/requests/page.tsx

import { RequestTable } from "@/components/bookkeeping/RequestPage"
import { prisma } from "@/lib/prisma";
export default async function Page() {

    // 3. Fetch data directly from the database
    const requests = await prisma.request.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <>
            {/* 4. Pass the data to your UI component */}
            <RequestTable requests={requests} />
        </>
    )
}