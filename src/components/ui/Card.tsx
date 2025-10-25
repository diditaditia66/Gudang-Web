import React from "react";
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}
export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
}
