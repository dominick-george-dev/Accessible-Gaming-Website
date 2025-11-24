import React from "react";

interface ChartsProps {
  children: React.ReactNode[];
  title?: string;
}

export function Charts({ children, title }: ChartsProps) {
  const total = React.Children.count(children);

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {React.Children.map(children, (child, index) => {
          // Default: span 1 column
          let spanClass = "col-span-1";

          // Last child spans full width
          if (index === total - 1) {
            spanClass = "col-span-1 lg:col-span-2";
          }

          return <div className={spanClass}>{child}</div>;
        })}
      </div>
    </div>
  );
}
