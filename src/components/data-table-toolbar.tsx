"use client"

import { Table, VisibilityState } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { IconChevronDown, IconRefresh } from "@tabler/icons-react"

interface TableToolbarProps<TData> {
    table: Table<TData>
    filterColumnId: string
    filterPlaceholder?: string
    filterValue: string
    onFilterChange: (value: string) => void
    columnVisibility: VisibilityState
    isAllSelected: boolean
    isSomeSelected: boolean
    selectedCount: number
    onSelectAll: (value: boolean) => void
    pageIndex: number
    pageCount: number
    totalRows: number
    canPreviousPage: boolean
    canNextPage: boolean
    onPreviousPage: () => void
    onNextPage: () => void
    isPending?: boolean
    onRefresh?: () => void
    bulkActions?: (selectedCount: number) => React.ReactNode
}
export function TableToolbar<TData>({
    table,
    filterPlaceholder = "Filter...",
    filterValue,
    onFilterChange,
    columnVisibility,
    isAllSelected,
    isSomeSelected,
    selectedCount,
    onSelectAll,
    pageIndex,
    pageCount,
    totalRows,
    canPreviousPage,
    canNextPage,
    onPreviousPage,
    onNextPage,
    isPending = false,
    onRefresh,
    bulkActions,
}: TableToolbarProps<TData>) {
    return (
        <div className="space-y-2 sticky top-16 z-40 bg-background border-b py-2">

            <div className="flex items-center justify-between">
                <Input
                    placeholder={filterPlaceholder}
                    value={filterValue}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="max-w-sm h-9"
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto h-9">
                            Columns <IconChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((col) => col.getCanHide())
                            .map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    className="capitalize"
                                    checked={columnVisibility[col.id] !== false}  
                                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                                >
                                    {col.id.replace(/([A-Z])/g, " $1").trim()}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                    <div className="flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent transition-colors">
                        <Checkbox
                            id="select-all"
                            checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                            onCheckedChange={(value) => onSelectAll(!!value)}
                            aria-label="Select all"
                            className="text-muted-foreground"
                        />
                    </div>

                    {selectedCount > 0 ? (
                        <div className="flex items-center animate-in fade-in slide-in-from-left-2 duration-200 ml-1">
                            {bulkActions?.(selectedCount)}
                        </div>
                    ) : (
                        <div className="flex items-center animate-in fade-in zoom-in-95 duration-200 ml-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onRefresh}
                                disabled={isPending}
                                className="h-9 w-9 text-muted-foreground"
                                title="Refresh"
                            >
                                <IconRefresh className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    )}
                </div>

                {totalRows > 0 && (
                    <div className="flex items-center gap-4 px-2">
                        <div className="text-sm text-muted-foreground hidden sm:block">
                            {selectedCount} of {totalRows} row(s) selected.
                        </div>

                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={(e) => { e.preventDefault(); onPreviousPage() }}
                                        className={!canPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <div className="px-4 text-sm text-muted-foreground font-medium whitespace-nowrap">
                                        Page {pageIndex + 1} of {pageCount}
                                    </div>
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={(e) => { e.preventDefault(); onNextPage() }}
                                        className={!canNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

            </div>
        </div>
    )
}