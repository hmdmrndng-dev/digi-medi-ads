// src/components/bookkeeping/RequestPage.tsx
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

// 1. Define the shape of your data based on your Prisma model
type RequestItem = {
  id: string
  productName: string
  numOfOrderedStock: number
  status: string | null
  deliverBy: string | null
  receivedBy: string | null
  location: string | null
  deliveredAt: Date | null
  purchaseOrderId: string | null
  amountDue: any // Prisma Decimals are usually passed as any or string, we'll convert it
  createdAt: Date
}

// 2. Helper functions
const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return "-"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const getStatusBadge = (status: string | null) => {
  const s = status?.toLowerCase() || ""
  if (s === "pending") return <Badge variant="secondary">Pending</Badge>
  if (s === "delivered" || s === "completed") return <Badge className="bg-green-600 hover:bg-green-700">Delivered</Badge>
  if (s === "cancelled") return <Badge variant="destructive">Cancelled</Badge>
  return <Badge variant="outline">{status || "Unknown"}</Badge>
}

// 3. The Component accepts the data as a prop
export function RequestTable({ requests }: { requests: RequestItem[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Requests</h1>
        <p className="text-muted-foreground">
          Manage and track all product orders and deliveries.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableCaption>A list of your recent requests.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead className="text-right">Amount Due</TableHead>
              <TableHead className="text-right">Ordered On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">
                  {req.productName}
                  <div className="text-xs text-muted-foreground">
                    {req.purchaseOrderId || "No PO"}
                  </div>
                </TableCell>
                <TableCell>{req.numOfOrderedStock}</TableCell>
                <TableCell>{getStatusBadge(req.status)}</TableCell>
                <TableCell>{req.location || "-"}</TableCell>
                <TableCell>
                  {req.deliverBy || "-"}
                  {req.receivedBy && (
                     <div className="text-xs text-muted-foreground">
                       Rcvd: {req.receivedBy}
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
            ))}
            
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