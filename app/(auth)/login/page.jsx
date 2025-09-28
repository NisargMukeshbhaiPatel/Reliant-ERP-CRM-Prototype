import { cookies } from 'next/headers';
import PBAuth from "@/lib/pb/auth";
import LoginForm from './login-form';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const existingAccounts = PBAuth.getStoredAccountsWithData(cookieStore) || [];

  return <LoginForm existingAccounts={existingAccounts} />;
}

