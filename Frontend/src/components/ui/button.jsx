import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants"; // hoặc từ đường dẫn đúng tới file của bạn

function Button({
  className,
  variant,
  size,
  round = "md",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, round, className }))}
      {...props}
    />
  );
}

export { Button };
