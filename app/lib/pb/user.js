import { cookies } from "next/headers";
import PBAuth from "./auth";
import { createPB, pbUserCache, globalPB as pb } from "./global";
import Client from "pocketbase";

export default class PBUser {

  /**
   * @returns {Promise<PBUser>}
   */
  static async get() {
    const cookieStore = await cookies();
    const cookie = PBAuth.getPBCookie(cookieStore);

    let user = pbUserCache.get(cookie);
    if (user) return user;

    user = new PBUser();
    const isAuth = PBAuth.isAuthenticated(cookieStore, user.pb);
    if (!isAuth) return null;

    pbUserCache.set(cookie, user);
    return user;
  }

  async getByEmail(email) {
    return await this.pb.collection("users").getFirstListItem('email="' + email + '"');
  }

  constructor() {
    /**
     * @type {Client}
     */
    this.pb = createPB();
  }

  getUser() {
    return this.pb.authStore.model;
  }

}

