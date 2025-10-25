"use client";
import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" };
export default function Button({ className="", variant="default", ...rest }: Props) {
  const base = "btn " + (variant==="primary" ? "btn-primary" : "");
  return <button className={base + " " + className} {...rest} />;
}
