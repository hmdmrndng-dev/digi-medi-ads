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
                    products: {
                        include: {
                            invoiceItems: {
                                include: {
                                    serviceInvoice: {
                                        include: {
                                            allocations: {
                                                select: {
                                                    amountApplied: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    const formattedRequests: RequestData[] = requests.map((req) => ({
        ...req,
        amountDue: (() => {
            const totalProductAmount = req.purchaseOrders.reduce(
                (requestTotal, po) =>
                    requestTotal +
                    po.products.reduce(
                        (productTotal, p) => productTotal + (p.amount ? Number(p.amount) : 0),
                        0
                    ),
                0
            );

            const collectedByInvoice = new Map<string, number>();
            for (const po of req.purchaseOrders) {
                for (const product of po.products) {
                    for (const item of product.invoiceItems) {
                        const invoice = item.serviceInvoice;
                        if (collectedByInvoice.has(invoice.id)) {
                            continue;
                        }

                        const invoiceCollected = invoice.allocations.reduce(
                            (invoiceTotal, allocation) => invoiceTotal + Number(allocation.amountApplied),
                            0
                        );

                        collectedByInvoice.set(invoice.id, invoiceCollected);
                    }
                }
            }

            const totalCollected = Array.from(collectedByInvoice.values()).reduce(
                (sum, amount) => sum + amount,
                0
            );

            return totalProductAmount - totalCollected;
        })(),
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