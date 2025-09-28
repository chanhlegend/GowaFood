// src/components/ui/tabs.jsx
import React, { createContext, useContext } from "react";
import { cn } from "../../lib/utils"; 
const TabsContext = createContext(null);

export function Tabs({ value, onValueChange, className, children }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex flex-wrap gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used inside <Tabs>");

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onValueChange?.(value)}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-medium transition-all",
        "border focus-visible:outline-none focus-visible:ring-2",
        isActive
          ? "border-green-700/30 bg-green-700/10 text-green-800 ring-green-600/40 shadow-[0_6px_20px_-6px_rgba(22,101,52,.22)]"
          : "border-transparent text-foreground/80 hover:text-foreground hover:shadow-[0_4px_14px_-6px_rgba(22,101,52,.18)] hover:scale-[1.02]",
        "active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used inside <Tabs>");

  const isActive = ctx.value === value;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      className={cn(isActive && "animate-[tabFadeSlideIn_.28s_ease-out_both]", className)}
      {...props}
    >
      {isActive ? children : null}
    </div>
  );
}
