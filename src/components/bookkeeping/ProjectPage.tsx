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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Project Requests</h2>

                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create Request
                </Button>
            </div>

            <DataTable columns={columns} data={data} searchKey="projectCode" />

            <CreateRequest
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    )
}