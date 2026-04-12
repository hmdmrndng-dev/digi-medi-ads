// src/components/ui/table-context-menu.tsx
"use client"

import React from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ContextMenuItem {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: "default" | "destructive"
    separator?: boolean   // renders a separator BEFORE this item
}

interface TableContextMenuProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    position: { x: number; y: number }
    items: ContextMenuItem[]
}

export function TableContextMenu({
    open,
    onOpenChange,
    position,
    items,
}: TableContextMenuProps) {
    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
                <div
                    aria-hidden="true"
                    style={{
                        position: "fixed",
                        left: position.x,
                        top: position.y,
                        width: 1,
                        height: 1,
                        pointerEvents: "none",
                    }}
                />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-40">
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {item.separator && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            onClick={item.onClick}
                            className={
                                item.variant === "destructive"
                                    ? "cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100"
                                    : "cursor-pointer"
                            }
                        >
                            {item.icon && <span className="mr-2 h-4 w-4">{item.icon}</span>}
                            {item.label}
                        </DropdownMenuItem>
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}