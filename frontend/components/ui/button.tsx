import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default:
        "bg-primary-600 text-white hover:bg-primary-700 shadow-purple hover:shadow-purple-lg active:bg-primary-800",
      secondary:
        "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200",
      outline:
        "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm",
      ghost:
        "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
      danger:
        "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-5 text-sm rounded-xl gap-2",
      lg: "h-12 px-7 text-[15px] rounded-xl gap-2.5",
      xl: "h-14 px-9 text-base rounded-2xl gap-3",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";