import { globalPB } from "./global";
import { prettifyPBError } from "@/lib/pretty-print";

export const ACCOUNTS_COOKIE_NAME = 'socket_accounts';
export const PB_AUTH_COOKIE_NAME = 'pb_auth';

export default class PBAuth {
  static async authenticate(cookieStore, email, password) {
    try {
      const result = await globalPB
        .collection("users")
        .authWithPassword(email, password);

      if (!result?.token) throw new Error("Invalid email or password");

      const cookie = globalPB.authStore.exportToCookie()
      cookieStore.set(PB_AUTH_COOKIE_NAME, cookie);
      PBAuth.storeAccount(cookieStore, result.record, cookie);
      return result;
    } catch (err) {
      console.error(err);
      throw new Error(prettifyPBError(err));
    } finally {
      globalPB.authStore.clear();
    }
  }

  static async register(name, email, password, sendEmailWithPassword = false) {
    try {
      const result = await globalPB.collection("users").create({
        name,
        email,
        emailVisibility: true,
        password,
        passwordConfirm: password,
      });

      // TODO send email w/o password

      return result;
    } catch (err) {
      throw new Error(prettifyPBError(err.data));
    }
  }

  static getPBCookie(cookieStore) {
    return cookieStore.get(PB_AUTH_COOKIE_NAME)?.value;
  }

  static logoutCurrent(cookieStore) {
    const cookie = cookieStore.get(PB_AUTH_COOKIE_NAME)?.value;
    if (!cookie) return null;
    
    globalPB.authStore.loadFromCookie(cookie);
    const userId = globalPB.authStore.model?.id;
    cookieStore.delete(PB_AUTH_COOKIE_NAME);
    globalPB.authStore.clear();
  
    const nextAccount = userId ? PBAuth.removeAccount(cookieStore, userId) : null;    
    if (nextAccount) {
      cookieStore.set(PB_AUTH_COOKIE_NAME, nextAccount.auth);
    }
    return nextAccount;
  }

  static isAuthenticated(cookieStore, pb) {
    let isValid = PBAuth.isValid(cookieStore, pb);
    while (!isValid) {
      const nextAccount = PBAuth.logoutCurrent(cookieStore);
      if (!nextAccount) return false;
      isValid = PBAuth.isValid(cookieStore, pb);
    }
    return true;
  }

  static isValid(cookieStore, pb) {
    const cookie = PBAuth.getPBCookie(cookieStore);
    pb.authStore.loadFromCookie(cookie || "");
    return pb.authStore.isValid || false;
  }

  static getStoredAccounts(cookieStore) {
    const accountsCookie = cookieStore.get(ACCOUNTS_COOKIE_NAME)?.value;
    return accountsCookie ? JSON.parse(decodeURIComponent(accountsCookie)) : [];
  }

  static getStoredAccountsWithData(cookieStore) {
    return PBAuth.getStoredAccounts(cookieStore).map((userId) => {
      return PBAuth.getAccountData(cookieStore, userId);
    });
  }

  static getAccountData(cookieStore, userId) {
    const accountDataRaw = cookieStore.get(userId)?.value;
    return accountDataRaw ? JSON.parse(decodeURIComponent(accountDataRaw)) : null;
  }

  static storeAccount(cookieStore, user, auth) {
    let accounts = PBAuth.getStoredAccounts(cookieStore);
    const userId = user.id;
    
    if (!accounts.includes(userId)) {
      accounts.push(userId);
      cookieStore.set(ACCOUNTS_COOKIE_NAME, encodeURIComponent(JSON.stringify(accounts)));
    }
    
    // Store user data and auth in a separate cookie
    cookieStore.set(userId, encodeURIComponent(JSON.stringify({ auth, user })));
  }

  static removeAccount(cookieStore, userId) {
    const accounts = PBAuth.getStoredAccounts(cookieStore);
    const index = accounts.indexOf(userId);
    
    if (index !== -1) {
      accounts.splice(index, 1);
      cookieStore.set(ACCOUNTS_COOKIE_NAME, encodeURIComponent(JSON.stringify(accounts)));
      cookieStore.delete(userId);
    }

    // Return next account if available
    if (accounts.length > 0) {
      return PBAuth.getAccountData(cookieStore, accounts[0]);
    }
    return null;
  }

  static switchAccount(cookieStore, userId) {
    const accountData = PBAuth.getAccountData(cookieStore, userId);
    if (accountData) {
      cookieStore.set(PB_AUTH_COOKIE_NAME, accountData.auth);
    }
  }
}