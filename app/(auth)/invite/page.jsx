import { getInviteRoleByToken } from "@/lib/pb/user-actions";
import InvitePage from "./register-invite-form";

export default async function InvitePageServer({ searchParams }) {
  const token = (await searchParams)?.token;
  if (!token) return <p>Invite token missing.</p>;

  let inviteRoleData;
  try {
    inviteRoleData = await getInviteRoleByToken(token);
  } catch (error) {
    console.error(error);
    return <p style={{ color: "red" }}>Invalid or expired invite link</p>;
  }

  return <InvitePage token={token} role={inviteRoleData} />
}


