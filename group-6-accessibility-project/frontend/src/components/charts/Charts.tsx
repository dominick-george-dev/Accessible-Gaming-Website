import React from "react";

interface ChartsProps {
  children: React.ReactNode;
  title?: string;
}

export function Charts({ children, title }: ChartsProps) {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}
