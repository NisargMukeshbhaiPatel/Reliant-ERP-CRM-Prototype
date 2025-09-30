"use client";
import { Package, LogIn, LogOut, UserCircle } from "lucide-react";
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
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { useData } from "../../context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LOGIN } from "@/constants/page-routes";

export default function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user } = useData();
  const router = useRouter();

  const isLoggedIn = user && user.id;
  const isCollapsed = state === "collapsed";

  const logout = () => {
    document.cookie = "pb_auth=; path=/; Max-Age=0;";
    router.push(LOGIN);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="pt-2 h-[40px] flex items-start overflow-hidden">
          <h1
            className={`shrink-0 text-2xl font-bold text-blue-600 transition-opacity duration-300 ${!isCollapsed ? "opacity-100 delay-150" : "opacity-0"
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
              isActive={pathname === "/products"}
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
        {isLoggedIn ? (
          <div className="flex items-center gap-3 px-2">
            {!isCollapsed ? (
              <>
                <UserCircle size={32} className="text-gray-600 shrink-0" />
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">{user.name}</span>
                  <Badge variant="secondary" className="text-xs h-5 w-fit">
                    {user.expand.role.title}
                  </Badge>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={logout}
                        className="shrink-0 h-10 w-10"
                      >
                        <LogOut size={26} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <UserCircle size={32} className="text-gray-600 shrink-0" />
            )}
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/login">
                  <LogIn size={24} />
                  <span>Login</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
