"use client"

import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
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
    const { state, isMobile, setOpenMobile } = useSidebar()

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

                    // --------------------------------------------------------
                    // GOOGLE-STYLE FLYOUT CARD (When Sidebar is Closed)
                    // --------------------------------------------------------
                    if (state === "collapsed" && !isMobile) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                {hasSubItems ? (
                                    <HoverCard openDelay={0} closeDelay={100}>
                                        <HoverCardTrigger asChild>
                                            {/* We remove the tooltip here so it doesn't overlap with our custom card */}
                                            <SidebarMenuButton>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </HoverCardTrigger>

                                        <HoverCardContent
                                            side="right"
                                            align="start"
                                            sideOffset={16}
                                            className="w-48 p-2 shadow-lg"
                                        >
                                            {/* Card Header (Title of the group) */}
                                            <div className="px-2 pb-2 mb-2 border-b text-sm font-semibold text-foreground">
                                                {item.title}
                                            </div>

                                            {/* Card Sub-items */}
                                            <div className="flex flex-col gap-1">
                                                {item.items!.map((subItem) => (
                                                    <Link
                                                        key={subItem.title}
                                                        href={subItem.url}
                                                        onClick={handleNavClick}
                                                        className="block px-2 py-1.5 text-sm rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {subItem.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                ) : (
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <Link href={item.url} onClick={handleNavClick}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        )
                    }

                    // --------------------------------------------------------
                    // ACCORDION MENU (When Sidebar is Open)
                    // --------------------------------------------------------
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