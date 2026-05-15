import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "danger" | "muted";
};

const tones = {
  default: "bg-primary/15 text-primary",
  success: "bg-emerald-500/15 text-emerald-300",
  warning: "bg-amber-500/15 text-amber-300",
  danger: "bg-red-500/15 text-red-300",
  muted: "bg-muted text-muted-foreground"
};

export const Badge = ({ className, tone = "default", ...props }: BadgeProps) => (
  <span
    className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", tones[tone], className)}
    {...props}
  />
);
