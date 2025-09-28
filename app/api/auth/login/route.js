import PBAuth from "@/lib/pb/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = await cookies();
    console.log("all accounts", PBAuth.getStoredAccounts(cookieStore).length);
    await PBAuth.authenticate(cookieStore, email, password);
    console.log("all accounts", PBAuth.getStoredAccounts(cookieStore).length);
    return new Response(null, { status: 201 });
  } catch (e) {
    console.trace(e);
    return new Response(JSON.stringify({ error: e.message || e.toString() }), {
      status: 400,
    });
  }
}
