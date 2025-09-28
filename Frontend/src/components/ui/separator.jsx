import React from "react";

export function Separator({ className = "" }) {
  return <hr className={`my-4 border-t border-border ${className}`} />;
}