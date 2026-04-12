// src/app/bookkeeping/(protected)/project/page.tsx
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
            products: true,
        }
    });

    const safeRequests = rawRequests.map((req) => ({
        id: req.id,
        projectCode: req.projectCode,
        requestor: req.requestor || null,
        tinNo: req.tinNo || null,
        storeName: req.storeName || null,
        storeCategory: req.storeCategory || null,
        deliveryStatus: req.deliveryStatus,
        orNumber: req.orNumber || null,
        createdAt: req.createdAt,

        products: req.products.map(item => ({
            purchaseOrderNo: item.purchaseOrderNo,
            productName: item.productName,
            numOfOrderedStock: item.numOfOrderedStock,
            amount: item.amount ? Number(item.amount) : null,
            status: item.status
        }))
    }));

    return (
        <div className="p-4 space-y-2">
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