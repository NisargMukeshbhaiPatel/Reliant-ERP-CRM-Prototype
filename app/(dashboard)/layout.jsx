import PBUser from "@/lib/pb/user";

import Sidebar from "./components/sidebar/sidebar";
import { SidebarProvider } from "@/components/sidebar";
// For global data
import { DataProvider } from "./context";
import { cookies } from "next/headers";

export default async function DashLayout({ children }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  let user;
  try {

    const pbUser = await PBUser.get();
    user = pbUser?.getUser();
    //TODO: later when we'll do multiple acc
    //  const storedAccounts = PBAuth.getStoredAccountsWithData(cookieStore);

  } catch (error) {
    console.error(error)
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DataProvider initialData={{ user }}>
        <div className="flex h-screen w-full">
          <Sidebar />
          <div className="flex-1 overflow-hidden">
            <main className="flex-1 pb-7 h-full overflow-y-auto pt-2 md:pt-8 px-4 md:px-8">
              <div className="w-full mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </DataProvider>
    </SidebarProvider>
  );
}
