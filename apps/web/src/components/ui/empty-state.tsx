import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/20 bg-muted/30 p-12 text-center", className)}>
      {icon && <div className="mb-4 text-muted-foreground/60">{icon}</div>}
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      {description && <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorState({ title = "Something went wrong", description, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-12 text-center", className)}>
      <div className="mb-4 text-3xl">⚠️</div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      {description && <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {onRetry && (
        <button onClick={onRetry} className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors">
          Try again
        </button>
      )}
    </div>
  );
}

export { EmptyState, ErrorState };
