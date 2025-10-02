"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/badge"
import Logo from "@/ui/components/logo"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { registerAndLoginUser } from "@/lib/pb/user-actions"

export default function InvitePage({ token, role }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!token) {
        throw new Error("Invite token is required")
      }

      const result = await registerAndLoginUser({
        token,
        name,
        email,
        password,
      })

      if (result.error) {
        console.log(result.error)
        toast({
          title: result.error == "Failed to create record." ? "User Already Exist" : "Registration Failed",
          variant: "destructive",
        })
        return;
      }
      router.push("/")

    } catch (err) {
      console.log(err)
      toast({
        title: "Registration Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo Container */}
        <div className="flex justify-center mb-8">
          <Logo width={200} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete Your Registration</CardTitle>
            <CardDescription>
              You've been invited to join as <strong>{role.title}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Invited as:</span>
                <Badge variant="primary" className="font-medium">
                  {role.title}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Create a password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} variant="primary">
                {isLoading ? "Registering..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div >
  )
}
