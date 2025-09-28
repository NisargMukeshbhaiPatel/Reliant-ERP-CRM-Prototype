import * as React from "react"
import { Label } from './label'
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: [
          "bg-gray-200 text-gray-700 border-0",
          "shadow-[8px_8px_16px_#b8b8b8,-8px_-8px_16px_#ffffff]",
          "hover:shadow-[12px_12px_24px_#b8b8b8,-12px_-12px_24px_#ffffff]",
          "active:shadow-[inset_6px_6px_12px_#b8b8b8,inset_-6px_-6px_12px_#ffffff]",
          "hover:scale-[1.02]"
        ],
        primary: [
          "bg-gradient-to-br from-slate-600 to-slate-700 text-white border-0",
          "shadow-[8px_8px_16px_#b8b8b8,-8px_-8px_16px_#ffffff,inset_0_1px_0_rgba(255,255,255,0.1)]",
          "hover:shadow-[12px_12px_24px_#b8b8b8,-12px_-12px_24px_#ffffff,inset_0_1px_0_rgba(255,255,255,0.2)]",
          "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]",
          "hover:from-slate-500 hover:to-slate-600 hover:scale-[1.02]"
        ]
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs rounded-xl",
        lg: "h-12 px-8 py-4 text-base rounded-2xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Label : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
})
Button.displayName = "Button"
export { Button, buttonVariants }

