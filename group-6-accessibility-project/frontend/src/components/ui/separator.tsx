<<<<<<< HEAD
import React from 'react';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Separator: React.FC<SeparatorProps> = ({ 
  className = '', 
  orientation = 'horizontal' 
}) => {
  return (
    <div
      className={`
        ${orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full'}
        bg-gray-200 dark:bg-gray-700
        ${className}
      `}
      role="separator"
      aria-orientation={orientation}
    />
  );
};

export default Separator;
=======
"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "./utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
>>>>>>> bf2b40f823912743738040bf48c74e3a33b7fdda
