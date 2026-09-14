import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground",
        success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-medium",
        warning: "border-amber-500/20 bg-amber-500/10 text-amber-400 font-medium",
        info: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

interface BadgeProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<
  HTMLDivElement,
  BadgeProps
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(badgeVariants({ variant, className }))}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge, badgeVariants }
export type { BadgeProps, BadgeVariant }
