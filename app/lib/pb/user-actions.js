"use server"
import PBUser from "./user";
import { globalPB as pb } from "./global";

export async function isManager() {
  const pbUser = await PBUser.get();
  if (!pbUser) return false;
  const user = pbUser.getUser();
  return user.expand.role?.title === "Manager"; //Should use a const/or fetch from db
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

