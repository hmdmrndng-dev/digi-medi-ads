"use client"

import { Table as TanstackTable, VisibilityState, flexRender } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData> {
  table: TanstackTable<TData>
  columnVisibility: VisibilityState
  onRowClick?: (e: React.MouseEvent, row: TData) => void
  emptyMessage?: string
}

export function DataTable<TData>({
  table,
  columnVisibility,
  onRowClick,
  emptyMessage = "No results found.",
}: DataTableProps<TData>) {
  const visibleColumns = table.getVisibleLeafColumns()

  return (
    <div className="border-b bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers
                .filter((header) => columnVisibility[header.column.id] !== false)  // 👈 read from prop directly
                .map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={onRowClick ? (e) => onRowClick(e, row.original) : undefined}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
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
              <TableCell
                colSpan={visibleColumns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}