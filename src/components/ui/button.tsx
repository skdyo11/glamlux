import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 hover:scale-[1.01] relative overflow-hidden group after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/0 after:via-white/5 after:to-white/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-white/10 dark:bg-black/30 backdrop-blur-xl text-foreground border border-white/20 dark:border-white/5 shadow-lg ring-1 ring-white/10",
        destructive:
          "bg-destructive/20 backdrop-blur-xl text-destructive-foreground hover:bg-destructive/30 border border-white/10",
        outline:
          "border border-primary/20 bg-white/5 backdrop-blur-md hover:bg-primary/5 hover:border-primary/40 text-primary",
        secondary:
          "bg-secondary/40 backdrop-blur-xl text-secondary-foreground hover:bg-secondary/60 border border-white/20 shadow-sm",
        ghost: "hover:bg-primary/5 hover:backdrop-blur-lg transition-all",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={asChild ? undefined : type}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }