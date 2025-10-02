"use server"
import { prettifyPBError } from "../pretty-print";
import PBAuth from "./auth";
import { cookies } from "next/headers";
import PBUser from "./user";
import { randomUUID } from 'crypto';
import { globalPB as pb } from "./global";

export async function isManager() {
  const pbUser = await PBUser.get();
  if (!pbUser) return false;
  const user = pbUser.getUser();
  return user.expand.role?.title === "Manager"; //Should use a const/or fetch from db
}
export async function isManagerOrSales() {
  const pbUser = await PBUser.get();
  if (!pbUser) return false;
  const user = pbUser.getUser();
  return user.expand.role?.title === "Manager" || user.expand.role?.title === "Sales";
}

export async function getAllUsers() {
  if (!await isManager()) {
    throw new Error("Unauthorized: Only managers can see all users");
  }
  try {
    const resultList = await pb.collection('users').getFullList({
      expand: 'role',
      sort: '-created',
    });
    return resultList;
  } catch (error) {
    throw error
  }
}


// USER ROLES
export async function changeUserRole(userId, roleId) {
  if (!await isManager()) {
    throw new Error("Unauthorized: Only managers can change user roles");
  }
  console.log("Chg role:", userId, roleId)
  try {
    const updatedUser = await pb.collection('users').update(userId, {
      role: roleId
    });
    return updatedUser;
  } catch (error) {
    throw error;
  }
}

export async function getAllRoles() {
  try {
    const resultList = await pb.collection('roles').getFullList({
      sort: 'title',
    });
    return resultList;
  } catch (error) {
    throw error;
  }
}

//
// REGISTER WITH INVITE ONLY
export async function registerAndLoginUser(request) {
  try {
    const { token, name, email, password } = request;

    if (!token || !name || !email || !password) {
      return { error: "Missing required fields" };
    }

    const invite = await pb.collection("invites").getFirstListItem(`token="${token}"`);

    if (!invite) {
      return { error: "Invalid or expired invite" };
    }

    const user = await pb.collection("users").create({
      name,
      email,
      password,
      passwordConfirm: password,
      role: invite.role,
      emailVisibility: true
    });

    await pb.collection("invites").delete(invite.id);

    const cookieStore = await cookies();
    await PBAuth.authenticate(cookieStore, email, password);

    return {
      success: true,
      id: user.id,
    };
  } catch (err) {
    const errorMessage = prettifyPBError(err);
    console.error(errorMessage);
    return { error: errorMessage };
  }
}

//INVITES
export async function getInviteRoleByToken(token) {
  if (!token) throw new Error("Token is required");

  try {
    const invite = await pb.collection("invites").getFirstListItem(`token="${token}"`);
    if (!invite) throw new Error("Invalid or expired token");
    const role = await pb.collection("roles").getOne(invite.role);

    return {
      id: role.id,
      title: role.title
    };
  } catch (err) {
    console.error(err)
    return {}
  }
}

export async function generateInvite(role) {
  // Check if current user is admin/manager
  if (!await isManager()) {
    throw new Error("Unauthorized: Only managers can create invites");
  }

  if (!role) {
    throw new Error("Role is required to generate invite");
  }

  try {
    const token = randomUUID();

    // Create invite in PocketBase
    const invite = await pb.collection('invites').create({
      token,
      role
    });

    return invite.token;
  } catch (error) {
    throw error;
  }
}
