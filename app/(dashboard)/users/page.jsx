import { getAllUsers, getAllRoles } from "@/lib/pb/user-actions";
import { UsersTable } from "./components/users-table";
import AdminGenerateInvite from "./components/admin-generate-invite";

export default async function UsersPage() {
  let users;
  let roles;
  try {
    [users, roles] = await Promise.all([
      getAllUsers(),
      getAllRoles()
    ])
  } catch (error) {
    console.error(error)
    return "ERROR IN LOADING USERS:" + error.message
  }

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-balance text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">View Users & Manage user roles</p>
        </div>
        <AdminGenerateInvite roles={roles} />
      </header>

      <UsersTable roles={roles} users={users} />
    </>
  )
}

