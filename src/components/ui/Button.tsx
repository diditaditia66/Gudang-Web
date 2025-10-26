import React from "react";
import clsx from "clsx";

type ButtonVariant = "default" | "primary" | "secondary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({
  variant = "default",
  className,
  children,
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded-lg font-medium transition focus:outline-none";

  const variants: Record<ButtonVariant, string> = {
    default: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-800 text-white", // ⬅️ tambahan
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
