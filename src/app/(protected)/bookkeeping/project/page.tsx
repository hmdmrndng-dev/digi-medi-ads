// src/app/bookkeeping/project/page.tsx

import ProjectPage from "@/components/bookkeeping/ProjectPage";
import { RequestData } from "@/components/bookkeeping/request-columns";
import { prisma } from "@/lib/prisma";

export default async function Page() {
    const requests = await prisma.request.findMany({
        where: { inTrash: false },
        include: {
            purchaseOrders: {
                include: {
                    products: true
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    const formattedRequests: RequestData[] = requests.map((req) => ({
        ...req,
        purchaseOrders: req.purchaseOrders.map((po) => ({
            ...po,
            products: po.products.map((p) => ({
                ...p,
                amount: p.amount ? Number(p.amount) : 0,
            })),
        })),
    }));

    return (
        <div className="h-full flex-1 flex-col p-4 md:flex">
            <ProjectPage data={formattedRequests} />
        </div>
    );
}