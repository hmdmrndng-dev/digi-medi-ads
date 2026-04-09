"use client"

import { useState, useTransition } from "react"
import { Eye, Trash2 } from "lucide-react"
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
import { RequestDialog } from "./RequestDialog"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { moveToTrash } from "@/actions/request/actions"
import { ConfirmDialog } from "../confirm-dialog"

type RequestData = {
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

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return "-"
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)
}

const getStatusBadge = (status: string | null) => {
  const s = status?.toLowerCase() || "";
  switch (s) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
    case "delivered":
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Delivered</Badge>;
    case "cancelled":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
};

export function RequestTable({ requests }: { requests: RequestData[] }) {
  // --- TRANSITION STATE ---
  const [isPending, startTransition] = useTransition()

  // --- PAGINATION STATE ---
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)

  // --- DIALOG STATES ---
  const [selectedProjectCode, setSelectedProjectCode] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // --- MOUSE TRACKING DROPDOWN STATE ---
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [activeRequest, setActiveRequest] = useState<RequestData | null>(null)

  // --- PAGINATION LOGIC ---
  const totalPages = Math.max(1, Math.ceil(requests.length / rowsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * rowsPerPage
  const paginatedRequests = requests.slice(startIndex, startIndex + rowsPerPage)

  const handleRowsChange = (value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    if (safeCurrentPage > 1) setCurrentPage(p => p - 1)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    if (safeCurrentPage < totalPages) setCurrentPage(p => p + 1)
  }

  const handleRowClick = (e: React.MouseEvent, req: RequestData) => {
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setActiveRequest(req)
    setMenuOpen(true)
  }

  const handleView = () => {
    if (activeRequest) {
      setSelectedProjectCode(activeRequest.projectCode)
      setIsDialogOpen(true)
    }
  }

  // 1. Dropdown calls this to open the Alert Dialog
  const handleTrashClick = () => {
    setMenuOpen(false) // Close dropdown first
    setIsDeleteDialogOpen(true) // Open confirmation dialog
  }

  // 2. Alert Dialog calls this to actually process the database action
  const handleConfirmTrash = () => {
    if (!activeRequest) return

    startTransition(async () => {
      const result = await moveToTrash(activeRequest.id)
      if (result.success) {
        setIsDeleteDialogOpen(false)
      } else {
        alert("Failed to move to trash. Please try again.")
      }
    })
  }

  return (
    <div className="space-y-4">

      {/* VIEW DETAILS DIALOG */}
      {selectedProjectCode && (
        <RequestDialog
          key={selectedProjectCode}
          projectCode={selectedProjectCode}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Are you absolutely sure?"
        description={
          <>
            This will move project code <strong>{activeRequest?.projectCode}</strong> to the trash.
            You can restore it later from the trash bin.
          </>
        }
        onConfirm={handleConfirmTrash}
        isPending={isPending}
        confirmText={isPending ? "Moving..." : "Move to Trash"}
        variant="destructive"
      />

      {/* SINGLE GLOBAL DROPDOWN MENU */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              left: menuPosition.x,
              top: menuPosition.y,
              width: 1,
              height: 1,
              pointerEvents: 'none'
            }}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem onClick={handleView} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleTrashClick}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Move to Trash</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* TABLE SECTION */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableCaption className="border-t py-2">
            Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, requests.length)} of {requests.length} requests.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Project Code</TableHead>
              <TableHead>Requestor</TableHead>
              <TableHead>Store Category</TableHead>
              <TableHead>Store Name</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="text-right">Amount Due</TableHead>
              <TableHead>OR Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.map((req) => (
              <TableRow
                key={req.id}
                onClick={(e) => handleRowClick(e, req)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{req.projectCode}</TableCell>
                <TableCell>{req.requestor || "-"}</TableCell>
                <TableCell>{req.storeCategory || "-"}</TableCell>
                <TableCell>{req.storeName || "-"}</TableCell>
                <TableCell>{getStatusBadge(req.deliveryStatus)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(req.products.reduce((sum, item) => sum + (item.amount || 0), 0))}
                </TableCell>
                <TableCell>{req.orNumber || "-"}</TableCell>
              </TableRow>
            ))}

            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION SECTION */}
      {requests.length > 0 && (
        <div className="flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <Label htmlFor="select-rows-per-page" className="text-sm text-muted-foreground font-normal">
              Rows per page
            </Label>
            <Select value={String(rowsPerPage)} onValueChange={handleRowsChange}>
              <SelectTrigger className="w-20 h-8" id="select-rows-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={safeCurrentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem>
                <div className="px-4 text-sm text-muted-foreground font-medium">
                  Page {safeCurrentPage} of {totalPages}
                </div>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  className={safeCurrentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}