"use client";
import { Package, LogIn } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/sidebar";
import { useData } from "../../context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout";

export default function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user } = useData();

  const isLoggedIn = user && user.id;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="pt-2 h-[40px] flex items-start overflow-hidden">
          <h1
            className={`shrink-0 text-2xl font-bold text-blue-600 transition-opacity duration-300 ${state !== "collapsed" ? "opacity-100 delay-150" : "opacity-0"
              }`}
          >
            Reliant-CRM
          </h1>
        </div>
        <SidebarTrigger className="absolute right-[9px] top-[10px]" />
      </SidebarHeader>

      <SidebarContent className="mt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Products"
              asChild
              isActive={pathname === "/"}
            >
              <Link href="/products">
                <Package size={24} />
                <span>Products</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {isLoggedIn ? (
            <SidebarMenuItem>
              <LogoutButton />
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
              >
                <Link href="/login">
                  <LogIn size={24} />
                  <span>Login</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
