import * as React from "react"
import { Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn(
      "w-full text-sm text-foreground bg-transparent",
      "border-separate border-spacing-y-2 border-spacing-x-0",
      "[--row-radius:theme(borderRadius.xl)]",
      className
    )}
    {...props}
  />
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "sticky top-0 z-10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "[&_tr]:border-b [&_tr]:border-border/60",
      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0",
      className
    )}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "rounded-[var(--row-radius)] bg-muted/20",
      "ring-1 ring-border/60",
      "font-medium text-foreground/90",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "group rounded-[var(--row-radius)] bg-card",
      "ring-1 ring-border/60 hover:ring-border/80",
      "transition-all hover:shadow-sm",
      "data-[state=selected]:bg-primary/5 data-[state=selected]:ring-primary/40",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-11 px-5 first:pl-6 last:pr-6 align-middle",
      "first:rounded-l-[var(--row-radius)] last:rounded-r-[var(--row-radius)]",
      "text-left text-md font-semibold tracking-wide text-muted-foreground",
      "border-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, children, emptyIcon, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-5 py-4 first:pl-6 last:pr-6 align-middle",
      "first:rounded-l-[var(--row-radius)] last:rounded-r-[var(--row-radius)]",
      "border-0",
      "text-foreground",
      className
    )}
    {...props}
  >
    {children ?? (
      <span className="inline-flex items-center text-muted-foreground/60">
        {emptyIcon ?? <Minus size={18} className="stroke-[1.5]" />}
      </span>
    )}
  </td>
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-3 text-sm text-muted-foreground/80 text-pretty", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
}

