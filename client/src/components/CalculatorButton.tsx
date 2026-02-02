import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CalculatorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'destructive';
  span?: number;
}

export function CalculatorButton({ 
  children, 
  variant = 'default', 
  className,
  span = 1,
  ...props 
}: CalculatorButtonProps) {
  
  const variants = {
    default: "bg-white dark:bg-zinc-900 text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-800",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 border border-primary/50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
    accent: "bg-accent/10 text-accent font-semibold hover:bg-accent/20 border border-accent/20",
    destructive: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/50",
  };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ y: 0, scale: 0.96 }}
      className={cn(
        "h-14 rounded-xl text-lg font-medium transition-colors select-none",
        "flex items-center justify-center relative overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        variants[variant],
        span > 1 && `col-span-${span}`,
        className
      )}
      style={{ gridColumn: span > 1 ? `span ${span} / span ${span}` : undefined }}
      {...props}
    >
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
