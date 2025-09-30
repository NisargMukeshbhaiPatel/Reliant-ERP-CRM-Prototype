"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { changeUserRole } from "@/lib/pb/user-actions"
import { cn } from "@/lib/utils"

export function UserRoleSelector({ userId, currentRoleId, roles, className }) {
  const initial = currentRoleId ?? "none"
  const [value, setValue] = React.useState(initial)
  const [isPending, startTransition] = React.useTransition()

  function handleChange(next) {
    setValue(next)
    startTransition(async () => {
      await changeUserRole(userId, next === "none" ? null : next)
    })
  }

  const currentLabel =
    value === "none" || !roles.find(r => r.id === value)
      ? "None"
      : roles.find(r => r.id === value)?.title

  return (
    <Select value={value} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger
        className={cn("w-44 bg-background text-foreground", isPending && "opacity-70 cursor-wait", className)}
        aria-label="Edit role"
      >
        <SelectValue placeholder="Select role" aria-live="polite">
          {currentLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover text-popover-foreground">
        <SelectItem value="none">None</SelectItem>
        {roles.map(role => (
          <SelectItem key={role.id} value={role.id}>
            {role.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

