import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={cn(errorId, hintId) || undefined}
          className={cn(
            "h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm text-text-primary placeholder:text-text-muted",
            "transition-colors duration-150 ease-out",
            "focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15",
            error && "border-error focus:border-error focus:ring-error/15",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-secondary",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-xs text-error" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
