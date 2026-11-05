import * as React from "react";
import { cn } from "@/lib/utils";
function Card({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="card" className={cn("rounded-2xl border border-border bg-card shadow-[0_6px_24px_rgba(18,49,61,0.035)]", className)} {...props} />;
}
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-6", className)} {...props} />;
}
export { Card, CardContent };
