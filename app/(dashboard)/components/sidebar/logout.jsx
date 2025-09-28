"use client";
import { useRouter } from "next/navigation";
import { SidebarMenuButton } from "@/components/sidebar";
import { LogOut } from "lucide-react";
import { LOGIN } from "@/constants/page-routes";

export default function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    document.cookie = "pb_auth=; path=/; Max-Age=0;";
    router.push(LOGIN);
  };

  return (
    <SidebarMenuButton size="sm" onClick={logout}>
      <LogOut />
      <span>Logout</span>
    </SidebarMenuButton>
  );
}

