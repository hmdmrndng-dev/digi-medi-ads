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

    const rawRequests = await prisma.request.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            items: true 
        }
    });

    const safeRequests = rawRequests.map((req) => ({
        id: req.id,
        projectCode: req.projectCode,
        projectType: req.projectType,
        requestor: req.requestor || null,
        storeName: req.storeName || null,
        deliveryStatus: req.deliveryStatus,
        deliveryDate: req.deliveryDate || null,
        purchaseOrderId: req.purchaseOrderId || null,
        amountDue: req.amountDue ? Number(req.amountDue) : null,
        createdAt: req.createdAt,
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