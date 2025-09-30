import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, containerClass, type, focused = false, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className={cn("relative", containerClass)
    } >
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border-0 bg-gray-200 px-4 py-3 text-base font-medium text-gray-700 transition-all duration-200 file:border-0 file:bg-transparent file:text-base file:font-medium file:text-gray-700 placeholder:text-gray-400 placeholder:font-normal focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          // Default inset shadow
          !isFocused && "shadow-[inset_6px_6px_12px_#b8b8b8,inset_-6px_-6px_12px_#ffffff]",
          // Focused state - deeper inset + subtle scale
          isFocused && "shadow-[inset_8px_8px_16px_#b8b8b8,inset_-8px_-8px_16px_#ffffff] scale-[1.01]",
          className
        )}
        ref={ref}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    </div >
  );
})
Input.displayName = "Input"

export { Input }
