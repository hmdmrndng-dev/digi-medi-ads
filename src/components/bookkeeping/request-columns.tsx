"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type RequestData = {
    id: string
    projectCode: string
    requestor: string | null
    storeName: string | null
    tinNo: string | null
    storeCategory: string | null
    deliveryStatus: string
    orNumber: string | null
    purchaseOrders: {
        products: {
            amount: number | null;
        }[]; // <--- Crucial: This must be an array!
    }[];
}

export const columns: ColumnDef<RequestData>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "projectCode",
        header: "Project Code",
    },
    {
        accessorKey: "requestor",
        header: "Requestor",
    }, {
        accessorKey: "storeName",
        header: "Store Details",
        cell: ({ row }) => {
            const name = row.getValue("storeName") as string;
            const category = row.original.storeCategory;

            return (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground capitalize">
                        {name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {category}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "tinNo",
        header: "TIN No.",
    },
    {
        accessorKey: "deliveryStatus",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("deliveryStatus") as string
            return <div className="capitalize">{status}</div>
        },
    },
    {
        accessorKey: "orNumber",
        header: "OR Number",
    },
    {
        header: "Total Amount",
        id: "totalAmount",
        cell: ({ row }) => {
            const pos = row.original.purchaseOrders || [];

            const total = pos.reduce((acc, po) => {
                const poSum = po.products.reduce((sum, p) => sum + (p.amount || 0), 0);
                return acc + poSum;
            }, 0);

            return (
                <div className="font-medium">
                    {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                    }).format(total)}
                </div>
            );
        },
    },
    {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => {
            const request = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(request.projectCode)}
                        >
                            Copy Project Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]