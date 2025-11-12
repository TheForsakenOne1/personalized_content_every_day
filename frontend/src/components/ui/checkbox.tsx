"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    const id = React.useId();
    const inputId = props.id || id;

    return (
      <div className="flex items-center">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            className={cn(
              "peer h-5 w-5 shrink-0 rounded border-2 border-gray-300 dark:border-gray-600",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "checked:bg-blue-600 checked:border-blue-600 dark:checked:bg-blue-500 dark:checked:border-blue-500",
              "cursor-pointer transition-all",
              "appearance-none",
              className
            )}
            {...props}
          />
          <Check
            className={cn(
              "absolute left-0.5 top-0.5 h-4 w-4 text-white pointer-events-none",
              "opacity-0 peer-checked:opacity-100 transition-opacity"
            )}
          />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
