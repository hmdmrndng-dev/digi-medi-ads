"use client"

import { useState } from "react"
import { DataTable } from "../data-table"
import CreateRequest from "./CreateRequest"
import { columns, RequestData } from "./request-columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface ProjectPageProps {
    data: RequestData[]
}

export default function ProjectPage({ data }: ProjectPageProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const renderRowHoverContent = (request: RequestData) => {
        const products = request.purchaseOrders.flatMap((po) => po.products)

        if (!products.length) {
            return <p className="text-sm text-muted-foreground">No products for this request.</p>
        }

        return (
            <>
                <p className="text-sm font-semibold">Products ({products.length})</p>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {products.map((product) => (
                        <div key={product.id} className="rounded-md border p-2 text-xs leading-5">
                            <p className="font-medium text-foreground">{product.productName}</p>
                            <p className="text-muted-foreground">Qty: {product.numOfOrderedStock}</p>
                            <p className="text-muted-foreground">
                                Amount: {new Intl.NumberFormat("en-PH", {
                                    style: "currency",
                                    currency: "PHP",
                                }).format(product.amount || 0)}
                            </p>
                        </div>
                    ))}
                </div>
            </>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Project Requests</h2>

                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create Request
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data}
                searchKey="projectCode"
                rowHoverContent={renderRowHoverContent}
            />


            <CreateRequest
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    )
}