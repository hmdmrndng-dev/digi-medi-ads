// src/components/app-header.tsx
"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { navData } from "@/config/menu"

export function AppHeader() {
  const pathname = usePathname();

  let activeParent = null;
  let activeChild = null;

  for (const group of navData.navMain) {
    if (group.items) {
      const found = group.items.find((item) => item.url === pathname);
      if (found) {
        activeParent = group;
        activeChild = found;
        break;
      }
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      
      {activeParent && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage className="text-muted-foreground font-normal">
                {activeParent.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
            
            {activeChild && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeChild.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </header>
  )
}