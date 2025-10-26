import React from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-2xl border border-gray-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("p-5 border-b border-gray-100", className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return <h3 className={clsx("text-lg font-semibold text-gray-900", className)}>{children}</h3>;
}

export function CardDescription({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return <p className={clsx("mt-1 text-sm text-gray-600", className)}>{children}</p>;
}

export function CardBody({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("p-5", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("p-4 border-t border-gray-100", className)}>{children}</div>;
}
