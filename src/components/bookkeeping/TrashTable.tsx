// src/components/bookkeeping/TrashTable.tsx
"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { useState, useTransition } from "react"
import { IconRestore, IconTrash } from "@tabler/icons-react"
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
import { ConfirmDialog } from "../confirm-dialog"
import { restoreFromTrash, permanentlyDelete } from "@/actions/request/actions"
import { columns, RequestData } from "./columns/request-columns"
import { TableToolbar } from "../data-table-toolbar"
import { Button } from "../ui/button"
import { DataTable } from "../data-table"
import { TableContextMenu } from "../data-table-context-menu"

export function TrashTable({ requests }: { requests: RequestData[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // --- DIALOG STATES ---
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isBulkRestoreDialogOpen, setIsBulkRestoreDialogOpen] = useState(false)
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

    const handleConfirmRestore = () => {
        if (!activeRequest) return
        startTransition(async () => {
            const result = await restoreFromTrash(activeRequest.id)
            if (result.success) {
                setIsRestoreDialogOpen(false)
            } else {
                alert("Failed to restore. Please try again.")
            }
        })
    }

    const handleConfirmDelete = () => {
        if (!activeRequest) return
        startTransition(async () => {
            const result = await permanentlyDelete(activeRequest.id)
            if (result.success) {
                setIsDeleteDialogOpen(false)
            } else {
                alert("Failed to delete. Please try again.")
            }
        })
    }

    const handleConfirmBulkRestore = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        if (selectedRows.length === 0) return
        startTransition(async () => {
            const results = await Promise.all(
                selectedRows.map((row) => restoreFromTrash(row.original.id))
            )
            if (results.every((r) => r.success)) {
                setIsBulkRestoreDialogOpen(false)
                setRowSelection({})
            } else {
                alert("Some items failed to restore. Please try again.")
            }
        })
    }

    const handleConfirmBulkDelete = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        if (selectedRows.length === 0) return
        startTransition(async () => {
            const results = await Promise.all(
                selectedRows.map((row) => permanentlyDelete(row.original.id))
            )
            if (results.every((r) => r.success)) {
                setIsBulkDeleteDialogOpen(false)
                setRowSelection({})
            } else {
                alert("Some items failed to delete. Please try again.")
            }
        })
    }

    const handleRefresh = () => {
        startTransition(() => router.refresh())
    }

    return (
        <div>
            {/* DIALOGS */}
            <ConfirmDialog
                open={isRestoreDialogOpen}
                onOpenChange={setIsRestoreDialogOpen}
                title="Restore this item?"
                description={
                    <>
                        This will restore project code <strong>{activeRequest?.projectCode}</strong> back to active requests.
                    </>
                }
                onConfirm={handleConfirmRestore}
                isPending={isPending}
                confirmText={isPending ? "Restoring..." : "Restore"}
            />
            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Permanently delete this item?"
                description={
                    <>
                        This will permanently delete project code <strong>{activeRequest?.projectCode}</strong>. This action cannot be undone.
                    </>
                }
                onConfirm={handleConfirmDelete}
                isPending={isPending}
                confirmText={isPending ? "Deleting..." : "Delete Forever"}
                variant="destructive"
            />
            <ConfirmDialog
                open={isBulkRestoreDialogOpen}
                onOpenChange={setIsBulkRestoreDialogOpen}
                title="Restore selected items?"
                description={
                    <>
                        This will restore <strong>{table.getFilteredSelectedRowModel().rows.length}</strong> selected projects back to active requests.
                    </>
                }
                onConfirm={handleConfirmBulkRestore}
                isPending={isPending}
                confirmText={isPending ? "Restoring..." : "Restore All"}
            />
            <ConfirmDialog
                open={isBulkDeleteDialogOpen}
                onOpenChange={setIsBulkDeleteDialogOpen}
                title="Permanently delete selected items?"
                description={
                    <>
                        This will permanently delete <strong>{table.getFilteredSelectedRowModel().rows.length}</strong> selected projects. This action cannot be undone.
                    </>
                }
                onConfirm={handleConfirmBulkDelete}
                isPending={isPending}
                confirmText={isPending ? "Deleting..." : "Delete Forever"}
                variant="destructive"
            />

            {/* CONTEXT MENU */}
            <TableContextMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                position={menuPosition}
                items={[
                    {
                        label: "Restore",
                        icon: <IconRestore className="h-4 w-4" />,
                        onClick: () => { setMenuOpen(false); setIsRestoreDialogOpen(true) },
                    },
                    {
                        label: "Delete Forever",
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
                            onClick={() => setIsBulkRestoreDialogOpen(true)}
                            className="h-9 text-muted-foreground hover:text-green-600 hover:bg-green-50"
                        >
                            <IconRestore className="h-4 w-4 mr-2" />
                            Restore
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsBulkDeleteDialogOpen(true)}
                            className="h-9 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        >
                            <IconTrash className="h-4 w-4 mr-2" />
                            Delete Forever
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground ml-2">
                            {selectedCount} selected
                        </span>
                    </>
                )}
            />

            {/* TABLE */}
            <DataTable
                table={table}
                onRowClick={handleRowClick}
                emptyMessage="Trash is empty."
            />
        </div>
    )
}