// src/components/app-header.tsx
"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb"

import { navData } from "@/config/menu"

export function AppHeader() {
  const pathname = usePathname();

  let activeParent = null;
  let activeChild = null;
  let tailSegment = null;

  for (const group of navData.navMain) {
    if (group.items) {
      const found = group.items.find((item) =>
        pathname === item.url || pathname.startsWith(`${item.url}/`)
      );

      if (found) {
        activeParent = group;
        activeChild = found;

        if (pathname !== found.url) {
          tailSegment = pathname.replace(`${found.url}/`, "");
        }
        break;
      }
    }
  }

  let formattedTail = tailSegment;

  if (tailSegment === "create") {
    formattedTail = "Create New";
  } else if (tailSegment && tailSegment.length > 10) {
    // If it's a massive UUID, slice it. Otherwise, leave the number as is.
    formattedTail = `${tailSegment.slice(0, 8)}...`;
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
                  {tailSegment ? (
                    <BreadcrumbLink href={activeChild.url}>
                      {activeChild.title}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{activeChild.title}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            )}

            {tailSegment && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">
                    {formattedTail}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </header>
  )
}