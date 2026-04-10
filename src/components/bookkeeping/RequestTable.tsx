// src/components/bookkeeping/RequestTable.tsx
"use client"

import { useState, useTransition } from "react"
import { Eye, Trash2 } from "lucide-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

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

// --- DATA TABLE COLUMNS DEFINITION ---
const columns: ColumnDef<RequestData>[] = [
  {
    accessorKey: "projectCode",
    header: "Project Code",
    cell: ({ row }) => <div className="font-medium">{row.getValue("projectCode")}</div>,
  },
  {
    accessorKey: "requestor",
    header: "Requestor",
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

export function RequestTable({ requests }: { requests: RequestData[] }) {
  // --- TRANSITION STATE ---
  const [isPending, startTransition] = useTransition()

  // --- DIALOG STATES ---
  const [selectedProjectCode, setSelectedProjectCode] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // --- MOUSE TRACKING DROPDOWN STATE ---
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [activeRequest, setActiveRequest] = useState<RequestData | null>(null)

  // --- TANSTACK TABLE INITIALIZATION ---
  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  })

  const { pageIndex, pageSize } = table.getState().pagination;
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, requests.length);

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

  const handleTrashClick = () => {
    setMenuOpen(false)
    setIsDeleteDialogOpen(true)
  }

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

      {/* DATA TABLE SECTION */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableCaption className="border-t py-2">
            Showing {requests.length > 0 ? startIndex + 1 : 0}-{endIndex} of {requests.length} requests.
          </TableCaption>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={(e) => handleRowClick(e, row.original)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
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
            <Select 
              value={String(pageSize)} 
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
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
                  onClick={(e) => {
                    e.preventDefault();
                    table.previousPage();
                  }}
                  className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem>
                <div className="px-4 text-sm text-muted-foreground font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault();
                    table.nextPage();
                  }}
                  className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}