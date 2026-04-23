"use client"

import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    const { isMobile, setOpenMobile } = useSidebar()

    const handleNavClick = React.useCallback(() => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }, [isMobile, setOpenMobile])

    const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(() =>
        items.reduce<Record<string, boolean>>((acc, item) => {
            acc[item.title] = Boolean(item.isActive)
            return acc
        }, {})
    )

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0

                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            open={Boolean(openItems[item.title])}
                            onOpenChange={(isOpen) => {
                                setOpenItems((prev) => ({ ...prev, [item.title]: isOpen }))
                            }}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    <Link href={item.url} onClick={handleNavClick}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>

                                {hasSubItems ? (
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuAction
                                            className="cursor-pointer data-[state=open]:rotate-90"
                                            aria-label={`Toggle ${item.title} submenu`}
                                        >
                                            <ChevronRight />
                                        </SidebarMenuAction>
                                    </CollapsibleTrigger>
                                ) : null}

                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href={subItem.url} onClick={handleNavClick}>
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}