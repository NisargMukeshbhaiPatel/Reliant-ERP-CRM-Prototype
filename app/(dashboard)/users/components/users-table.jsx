"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/badge"
import { Input } from "@/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { UserRoleSelector } from "./user-role-selector"

export function UsersTable({ roles, users }) {
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      const roleMatches =
        roleFilter === "all"
          ? true
          : roleFilter === "none"
            ? !u.role && !u.expand?.role
            : u.role === roleFilter || u.expand?.role?.id === roleFilter

      const queryMatches = q.length === 0 || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)

      return roleMatches && queryMatches
    })
  }, [users, roleFilter, query])

  return (
    <section className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 w-full">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users by name or email"
            className="border-4"
            containerClass="flex-grow max-w-3xl"
          />
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="role-filter" className="text-sm text-muted-foreground">
              Role
            </label>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v)}>
              <SelectTrigger id="role-filter" className="w-40 bg-background text-foreground">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="none">None</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Name</TableHead>
            <TableHead className="w-[35%]">Email</TableHead>
            <TableHead className="w-[15%]">Role</TableHead>
            <TableHead className="w-[15%] text-right">Update Role</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((u) => {
            const roleTitle = u.expand?.role?.title ?? roles.find((r) => r.id === u.role)?.title ?? null
            return (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                <TableCell className="text-foreground">{u.email}</TableCell>
                <TableCell>
                  {roleTitle ? (
                    <Badge variant="primary">
                      {roleTitle}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      None
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <UserRoleSelector
                    userId={u.id}
                    currentRoleId={u.role ?? null}
                    roles={roles.map(({ id, title }) => ({ id, title }))}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* 
        //No pagination yet so not needed
      <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
        <span>
          Showing {filtered.length} of {users.length} users
        </span>
      </div>
      */}
    </section >
  )
}
