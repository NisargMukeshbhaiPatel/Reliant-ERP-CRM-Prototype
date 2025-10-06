"use client";
import { FileText, UserRoundCog as Users, Package, LogIn, LogOut, UserCircle, Menu, BarChart3 } from "lucide-react";
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
  const { state, isMobile, toggleSidebar } = useSidebar();
  const { user } = useData();
  const router = useRouter();

  const isLoggedIn = user && user.id;
  const isCollapsed = state === "collapsed";

  const logout = () => {
    document.cookie = "pb_auth=; path=/; Max-Age=0;";
    router.push(LOGIN);
  };

  return (
    <>
      {isMobile && (
        <Menu
          onClick={toggleSidebar}
          className="absolute right-4 top-[1.88rem] z-50 cursor-pointer"
          size={20}
        />
      )}
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="pt-2 h-[40px] flex items-start overflow-hidden">
            <h1
              className={`shrink-0 text-2xl font-bold transition-opacity duration-300 ${!isCollapsed ? "opacity-100 delay-150" : "opacity-0"
                }`}
            >
              <span className="text-gray-900">Reliant</span>
              <span className="text-gray-600">-CRM</span>
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
                <Link
                  href="/"
                  onClick={() => {
                    if (isMobile) toggleSidebar();
                  }}
                >
                  <Package size={18} className="text-gray-800" />
                  <span>Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {user && user.expand.role?.title === "Manager" &&
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Analytics"
                    asChild
                    isActive={pathname === "/analytics"}
                  >
                    <Link
                      href="/analytics"
                      onClick={() => {
                        if (isMobile) toggleSidebar();
                      }}
                    >
                      <BarChart3 size={18} className="text-gray-800" />
                      <span>Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Users"
                    asChild
                    isActive={pathname === "/users"}
                  >
                    <Link
                      href="/users"
                      onClick={() => {
                        if (isMobile) toggleSidebar();
                      }}
                    >
                      <Users size={18} className="text-gray-800" />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            }
            {user && (user.expand.role?.title === "Manager" || user.expand.role?.title === "Sales") &&
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Quotations"
                  asChild
                  isActive={pathname === "/quotations"}
                >
                  <Link
                    href="/quotations"
                    onClick={() => {
                      if (isMobile) toggleSidebar();
                    }}
                  >
                    <FileText size={18} className="text-gray-800" />
                    <span>Quotations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            }
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {isLoggedIn ? (
            <div className="flex items-center gap-3 px-2">
              {!isCollapsed ? (
                <>
                  <UserCircle size={28} className="text-gray-600 shrink-0" />
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{user.name}</span>
                    <Badge variant="secondary" className="text-xs h-5 w-fit">
                      {user.expand.role?.title}
                    </Badge>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          onClick={logout}
                          className="shrink-0 h-9 w-9 shadow-none"
                        >
                          <LogOut size={18} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Logout</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                <UserCircle size={28} className="text-gray-600 shrink-0" />
              )}
            </div>
          ) : (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/login">
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
