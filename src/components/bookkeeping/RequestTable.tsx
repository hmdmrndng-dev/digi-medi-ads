// src/components/bookkeeping/RequestTable.tsx
"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { useState, useTransition } from "react"
import { IconEye, IconTrash } from "@tabler/icons-react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { RequestDialog } from "./RequestDialog"
import { ConfirmDialog } from "../confirm-dialog"
import { moveToTrash } from "@/actions/request/actions"
import { columns, RequestData } from "./columns/request-columns"
import { TableToolbar } from "../data-table-toolbar"
import { Button } from "../ui/button"
import { DataTable } from "../data-table"
import { TableContextMenu } from "../data-table-context-menu"

export function RequestTable({ requests }: { requests: RequestData[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // --- DIALOG STATES ---
  const [selectedProjectCode, setSelectedProjectCode] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)

  // --- CONTEXT MENU STATE ---
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [activeRequest, setActiveRequest] = useState<RequestData | null>(null)

  // --- TABLE STATE ---
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 25 } },
  })

  // --- HANDLERS ---
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

  const handleConfirmBulkTrash = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) return
    startTransition(async () => {
      const results = await Promise.all(
        selectedRows.map((row) => moveToTrash(row.original.id))
      )
      if (results.every((r) => r.success)) {
        setIsBulkDeleteDialogOpen(false)
        setRowSelection({})
      } else {
        alert("Some items failed to move to trash. Please try again.")
      }
    })
  }

  const handleRefresh = () => {
    startTransition(() => router.refresh())
  }

  return (
    <div>
      {/* DIALOGS */}
      {selectedProjectCode && (
        <RequestDialog
          key={selectedProjectCode}
          projectCode={selectedProjectCode}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
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
      <ConfirmDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        title="Move multiple items to trash?"
        description={
          <>
            You are about to move{" "}
            <strong>{table.getFilteredSelectedRowModel().rows.length}</strong> selected
            projects to the trash.
          </>
        }
        onConfirm={handleConfirmBulkTrash}
        isPending={isPending}
        confirmText={isPending ? "Moving..." : "Move to Trash"}
        variant="destructive"
      />

      {/* CONTEXT MENU */}
      <TableContextMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        position={menuPosition}
        items={[
          {
            label: "View Details",
            icon: <IconEye className="h-4 w-4" />,
            onClick: handleView,
          },
          {
            label: "Move to Trash",
            icon: <IconTrash className="h-4 w-4" />,
            onClick: () => { setMenuOpen(false); setIsDeleteDialogOpen(true) },
            variant: "destructive",
            separator: true,
          },
        ]}
      />

      {/* TOOLBAR */}
      <TableToolbar
        table={table}
        filterColumnId="projectCode"
        filterPlaceholder="Filter project codes..."
        filterValue={(table.getColumn("projectCode")?.getFilterValue() as string) ?? ""}
        onFilterChange={(value) => table.getColumn("projectCode")?.setFilterValue(value)}
        columnVisibility={columnVisibility}
        isAllSelected={table.getIsAllPageRowsSelected()}
        isSomeSelected={table.getIsSomePageRowsSelected()}
        selectedCount={table.getFilteredSelectedRowModel().rows.length}
        onSelectAll={(value) => table.toggleAllPageRowsSelected(value)}
        pageIndex={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        totalRows={table.getFilteredRowModel().rows.length}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        onPreviousPage={() => table.previousPage()}
        onNextPage={() => table.nextPage()}
        isPending={isPending}
        onRefresh={handleRefresh}
        bulkActions={(selectedCount) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              className="h-9 text-muted-foreground hover:text-red-600 hover:bg-red-50"
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Trash
            </Button>
            <span className="text-sm font-medium text-muted-foreground ml-2">
              {selectedCount} selected
            </span>
          </>
        )}
      />

      {/* TABLE*/}
      <DataTable
        table={table}
        onRowClick={handleRowClick}
        emptyMessage="No requests found."
      />
    </div>
  )
}