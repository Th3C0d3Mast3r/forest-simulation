"use client";

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b-2 border-bark/5 bg-background px-6 transition-colors duration-500">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-bark hover:bg-bark/10" />
            <Separator
              orientation="vertical"
              className="mx-2 h-4 bg-bark/10" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="font-bold text-muted-foreground hover:text-bark">
                    Command Center
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-black text-bark">Active View</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-bark/60 bg-bark/5 px-4 py-2 rounded-full border border-bark/10 dark:text-ivory dark:border-ivory/10">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Satellite Sync Active
             </div>
             <ModeToggle />
          </div>
        </header>
        
        <div className="flex flex-1 flex-col transition-all duration-500 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
