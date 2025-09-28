import React from "react";

export function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };
  return (
    <div
      className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizes[size] || sizes.md} ${className}`}
    />
  );
}
