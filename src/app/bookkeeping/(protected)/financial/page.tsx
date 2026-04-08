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
        where: {
            inTrash: false
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            product: true
        }
    });

    const safeRequests = rawRequests.map((req) => ({
        id: req.id,
        projectCode: req.projectCode,
        requestor: req.requestor || null,
        storeName: req.storeName || null,
        storeCategory: req.storeCategory || null,
        deliveryStatus: req.deliveryStatus,
        purchaseOrderId: req.purchaseOrderId || null,
        orNumber: req.orNumber || null,
        createdAt: req.createdAt,

        product: req.product.map(item => ({
            productName: item.productName,
            numOfOrderedStock: item.numOfOrderedStock,
            amount: item.amount ? Number(item.amount) : null,
            status: item.status
        }))
    }));

    return (
        <div className="p-4 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Requests</h1>
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