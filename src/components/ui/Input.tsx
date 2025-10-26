"use client";
import React, { forwardRef } from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
  hint?: string;
  id?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name ?? undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full rounded-xl border bg-white px-3 py-2 shadow-sm transition",
            "focus:outline-none focus:ring-2 focus:ring-blue-600",
            error ? "border-red-500" : "border-gray-300",
            className
          )}
          aria-invalid={!!error || undefined}
          aria-describedby={clsx(hint ? hintId : "", error ? errId : "") || undefined}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="mt-1 text-xs text-gray-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errId} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
