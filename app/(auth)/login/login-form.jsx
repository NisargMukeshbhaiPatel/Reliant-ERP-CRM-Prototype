"use client";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/components/card";
import { API_LOGIN } from "@/constants/api-routes";
import { DASHBOARD } from "@/constants/page-routes";
import Logo from "@/ui/components/logo";

export default function LoginForm({ existingAccounts }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const [email, password] = e.target;
    if (!email.value || !password.value) {
      throw new Error("Please fill in all fields");
    }
    try {
      const isAddingAccount = searchParams.get("addAccount") === "true";
      if (
        isAddingAccount &&
        existingAccounts.some((acc) => acc.user.email === email.value)
      ) {
        throw new Error("Account already exists");
      }
      const form = {
        email: email.value,
        password: password.value,
      };
      const response = await fetch(API_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error);
      }
      const redirectUrl = searchParams.get("redirect") || DASHBOARD;
      router.push(redirectUrl);
    } catch (err) {
      console.trace(err);
      let msg;
      switch (err.message) {
        case "Failed to authenticate.":
          msg = "Invalid credentials";
          break;
        default:
          msg = err.message;
          break;
      }
      toast({
        title: msg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo Container */}
        <div className="flex justify-center mb-8">
          <Logo width={200} />
        </div>

        {/* Main Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-gray-800 mb-2">Welcome Back</CardTitle>
            <p className="text-gray-500 font-medium">Sign in to your account</p>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-600 ml-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-600 ml-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Sign In
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
