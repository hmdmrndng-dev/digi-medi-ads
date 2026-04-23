"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export type RequestData = {
    id: string
    projectCode: string
    requestor: string | null
    storeName: string | null
    tinNo: string | null
    storeCategory: string | null
    deliveryStatus: string
    orNumber: string | null
    amountDue: number
    purchaseOrders: {
        products: {
            id: string
            productName: string
            numOfOrderedStock: number
            amount: number | null;
        }[];
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
        accessorKey: "amountDue",
        header: "Amount Due",
        cell: ({ row }) => {
            const amountDue = Number(row.getValue("amountDue") || 0)

            return (
                <div className="font-medium">
                    {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                    }).format(amountDue)}
                </div>
            )
        },
    }
]