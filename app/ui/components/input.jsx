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
          "flex h-11 w-full rounded-2xl border border-gray-300 bg-gray-200 px-4 py-3 text-base font-medium text-gray-700 transition-all duration-200 file:border-0 file:bg-transparent file:text-base file:font-medium file:text-gray-700 placeholder:text-gray-400 placeholder:font-normal focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          // Focused state - subtle scale and border highlight
          isFocused && "scale-[1.01] border-gray-400",
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
