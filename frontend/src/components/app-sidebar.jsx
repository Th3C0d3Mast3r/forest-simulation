"use client"

import * as React from "react"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  Compass, 
  Map, 
  ShieldCheck, 
  Trees, 
  Bird, 
  Zap,
  LayoutDashboard
} from "lucide-react"

const data = {
  user: {
    name: "Chief Ranger",
    email: "ranger@forestreserve.gov",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100",
  },
  projects: [
    {
      name: "Dashboard Overview",
      url: "/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      name: "Wildlife Tracker",
      url: "/dashboard/wildlife",
      icon: <Bird />,
    },
    {
      name: "Patrol Units",
      url: "/dashboard/patrol",
      icon: <ShieldCheck />,
    },
    {
      name: "Zone Mapping",
      url: "/dashboard/mapping",
      icon: <Map />,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg bg-bark text-ivory dark:bg-primary">
                  <Trees className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black text-bark uppercase tracking-tighter dark:text-ivory">Forest Reserve</span>
                  <span className="truncate text-[10px] font-black uppercase text-bark/40 dark:text-ivory/40">Command Center</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
