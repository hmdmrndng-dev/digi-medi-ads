// src/components/bookkeeping/RequestPage.tsx
"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// 1. Updated Type to match the new Prisma Schema including nested items
type RequestData = {
  id: string;
  projectCode: string;
  projectType: string;
  requestor: string | null;
  storeName: string | null;
  deliveryStatus: string;
  deliveryDate: Date | null;
  purchaseOrderId: string | null;
  amountDue: any; // Decimal from Prisma usually comes in as any/Decimal depending on how it's serialized
  createdAt: Date;
  items: {
    productName: string;
    numOfOrderedStock: number;
  }[];
}

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return "-"
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)
}

const getStatusBadge = (status: string | null) => {
  const s = status?.toLowerCase() || ""
  if (s === "pending") return <Badge variant="secondary">Pending</Badge>
  if (s === "delivered" || s === "completed") return <Badge className="bg-green-600 hover:bg-green-700">Delivered</Badge>
  if (s === "cancelled") return <Badge variant="destructive">Cancelled</Badge>
  return <Badge variant="outline">{status || "Unknown"}</Badge>
}

export function RequestTable({ requests }: { requests: RequestData[] }) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-card">
        <Table>
          <TableCaption>A list of your recent requests.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Store/Location</TableHead>
              <TableHead className="text-right">Amount Due</TableHead>
              <TableHead className="text-right">Ordered On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => {
              // Calculate total stock for this specific request
              const totalItems = req.items.reduce((acc, item) => acc + item.numOfOrderedStock, 0);
              // Create a comma-separated list of product names
              const productNames = req.items.map(item => item.productName).join(", ");

              return (
                <TableRow
                  key={req.id}
                  onClick={() => {
                    // Navigate using the parent Request ID
                    router.push(`/bookkeeping/financial/${req.id}`)
                  }}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {req.projectCode}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {req.projectType} {req.purchaseOrderId ? `• PO: ${req.purchaseOrderId}` : ""}
                    </div>
                  </TableCell>
                  
                  <TableCell className="max-w-[200px] truncate" title={productNames}>
                    {productNames || "No items"}
                  </TableCell>
                  
                  <TableCell>{totalItems}</TableCell>
                  
                  <TableCell>{getStatusBadge(req.deliveryStatus)}</TableCell>
                  
                  <TableCell>
                    {req.storeName || "-"}
                    {req.requestor && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Req by: {req.requestor}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {formatCurrency(Number(req.amountDue))}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </TableCell>
                </TableRow>
              )
            })}

            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}