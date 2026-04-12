// src/components/bookkeeping/request-columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getStatusBadge } from "@/components/bookkeeping/status" // Using the status config we just made
import { formatCurrency } from "@/lib/formatters"

export type RequestData = {
  id: string;
  projectCode: string;
  requestor: string | null;
  storeName: string | null;
  storeCategory: string | null;
  deliveryStatus: string;
  orNumber: string | null;
  createdAt: Date;
  products: {
    productName: string;
    numOfOrderedStock: number;
    amount: number | null;
  }[];
}

export const columns: ColumnDef<RequestData>[] = [

  {
    accessorKey: "projectCode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
        <span className="font-medium">{row.getValue("projectCode")}</span>
      </div>
    ),
  },
  {
    accessorKey: "requestor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Requestor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.getValue("requestor") || "-",
  },
  {
    accessorKey: "storeCategory",
    header: "Store Category",
    cell: ({ row }) => row.getValue("storeCategory") || "-",
  },
  {
    accessorKey: "storeName",
    header: "Store Name",
    cell: ({ row }) => row.getValue("storeName") || "-",
  },
  {
    accessorKey: "deliveryStatus",
    header: "Delivery Status",
    cell: ({ row }) => getStatusBadge(row.getValue("deliveryStatus")),
  },
  {
    id: "amountDue",
    header: () => <div className="text-right">Amount Due</div>,
    cell: ({ row }) => {
      const products = row.original.products;
      const total = products.reduce((sum, item) => sum + (item.amount || 0), 0);
      return <div className="text-right">{formatCurrency(total)}</div>;
    },
  },
  {
    accessorKey: "orNumber",
    header: "OR Number",
    cell: ({ row }) => row.getValue("orNumber") || "-",
  },
];