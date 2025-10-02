"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog"
import { Label } from "@/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Input } from "@/components/input"
import { toast } from "@/hooks/use-toast"
import { generateInvite } from "@/lib/pb/user-actions"

function AdminGenerateInvite({ roles }) {
  const [open, setOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState("")
  const [inviteLink, setInviteLink] = useState("")

  const resetState = useCallback(() => {
    setSelectedRoleId("")
    setLoading(false)
    setToken("")
    setInviteLink("")
  }, [])

  const onOpenChange = (nextOpen) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      resetState()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedRoleId) {
      toast({
        title: "Select a role",
        description: "Please choose a role before generating an invite.",
      })
      return
    }

    try {
      setLoading(true)
      const result = await Promise.resolve(generateInvite(selectedRoleId))
      setToken(result)
      const origin = typeof window !== "undefined" && window.location ? window.location.origin : ""
      const link = `${origin}/invite?token=${encodeURIComponent(result)}`
      setInviteLink(link)
    } catch (err) {
      toast({
        title: "Failed to generate invite",
        description: err?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast({ title: "Copied", description: "Invite link copied to clipboard." })
    } catch {
      const ok = window.confirm("Clipboard access blocked. Click OK to copy manually:\n\n" + inviteLink)
      if (ok) {
        // user can copy from prompt
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="primary">
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Invite Link</DialogTitle>
          <DialogDescription>Create a one-time invite for a new user with a selected role.</DialogDescription>
        </DialogHeader>

        {token && inviteLink ? (
          <div className="grid gap-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-link">Invite link to share</Label>
              <div className="flex flex-col gap-2">
                <Input id="invite-link" readOnly value={inviteLink} />
                <Button type="button" onClick={handleCopy} variant="primary">
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Select Role</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="role" aria-label="Select role">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Invite Link"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AdminGenerateInvite
