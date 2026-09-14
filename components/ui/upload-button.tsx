import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const uploadButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline text-[hover:underline:underlined]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface UploadButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof uploadButtonVariants> {
  asChild?: boolean
}

const UploadButton = React.forwardRef<
  HTMLButtonElement,
  UploadButtonProps
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(uploadButtonVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  )
})
UploadButton.displayName = "UploadButton"

const UploadButtonTrigger = UploadButton

const UploadButtonContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return <span className={cn("flex items-center space-x-2 rtl:space-x-reverse", className)} {...props} />
}
UploadButtonContent.displayName = "UploadButtonContent"

const UploadButtonIcon = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  return <span className={cn("h-4 w-4 shrink-0", className)} {...props} />
}
UploadButtonIcon.displayName = "UploadButtonIcon"

export { UploadButton, UploadButtonTrigger, UploadButtonContent, UploadButtonIcon }
