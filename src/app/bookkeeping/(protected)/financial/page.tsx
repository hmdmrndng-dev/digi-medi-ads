// src/app/bookkeeping/(protected)/financial/page.tsx
import { CreateRequestDialog } from "@/components/bookkeeping/CreateRequestDialog";
import { RequestTable } from "@/components/bookkeeping/RequestTable"; 
import { prisma } from "@/lib/prisma";

export default async function Page() {
    const currentYear = new Date().getFullYear();

    const currentYearCount = await prisma.request.count({
        where: {
            projectCode: {
                startsWith: `${currentYear}-`,
            },
        },
    });

    const nextNumber = currentYearCount + 1;
    const expectedProjectCode = `${currentYear}-${String(nextNumber).padStart(4, '0')}`;

    // 1. Fetch requests AND include the nested items
    const rawRequests = await prisma.request.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            items: true // <-- Required to get the products for the table
        }
    });

    // 2. Map to match the new RequestData type in RequestTable.tsx
    const safeRequests = rawRequests.map((req) => ({
        id: req.id,
        projectCode: req.projectCode,
        projectType: req.projectType,
        requestor: req.requestor || null,
        storeName: req.storeName || null,
        deliveryStatus: req.deliveryStatus,
        deliveryDate: req.deliveryDate || null,
        purchaseOrderId: req.purchaseOrderId || null,
        // Convert Prisma Decimal to standard Number for the client component
        amountDue: req.amountDue ? Number(req.amountDue) : null,
        createdAt: req.createdAt,
        // Pass down the nested items array
        items: req.items.map(item => ({
            productName: item.productName,
            numOfOrderedStock: item.numOfOrderedStock,
        }))
    }));

    return (
        <div className="p-4 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stock Requests</h1>
                    <p className="text-muted-foreground">
                        Manage and track all product orders and deliveries.
                    </p>
                </div>

                <CreateRequestDialog expectedProjectCode={expectedProjectCode} />
            </div>

            <RequestTable requests={safeRequests} />
        </div>
    );
}