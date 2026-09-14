import * as React from "react"
import {
  Accordion as PrimitiveAccordion,
  AccordionItem as PrimitiveAccordionItem,
  AccordionTrigger as PrimitiveAccordionTrigger,
  AccordionContent as PrimitiveAccordionContent,
} from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = PrimitiveAccordion
const AccordionItem = PrimitiveAccordionItem
const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof PrimitiveAccordionTrigger>
>(({ className, children, ...props }, ref) => (
  <PrimitiveAccordionTrigger
    ref={ref}
    className={cn(
      "flex items-center w-full h-10 px-4 py-2 text-sm text-left font-medium border-b border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
    >
    <span className="flex-1">{children}</span>
    <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50 transition-opacity data-[state=open]:opacity-100 data-[state=open]:rotate-180" />
  </PrimitiveAccordionTrigger>
))
AccordionTrigger.displayName = PrimitiveAccordionTrigger.displayName

const AccordionContent = PrimitiveAccordionContent

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
