import React from "react";
import { cn } from "@/lib/utils";

/**
 * Label component
 * @param {string} htmlFor - id của input mà label liên kết
 * @param {string} className - thêm class tùy chỉnh
 * @param {React.ReactNode} children - nội dung label
 */
const Label = React.forwardRef(({ className, htmlFor, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium text-foreground mb-1",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = "Label";

export { Label };