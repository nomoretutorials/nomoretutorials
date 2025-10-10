"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.97] focus-visible:ring-primary/40",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 active:scale-[0.97] focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent/60 hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 active:scale-[0.97]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-[0.97]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 active:scale-[0.97]",
        link: "text-primary underline-offset-4 hover:underline active:scale-[0.97]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  // Filter out conflicting props for motion.button
  const { onDrag, onDragStart, onDragEnd, onAnimationStart, onAnimationEnd, ...motionProps } =
    props;

  // Explicitly void unused variables to avoid linter warnings
  void onDrag;
  void onDragStart;
  void onDragEnd;
  void onAnimationStart;
  void onAnimationEnd;

  return (
    <motion.button
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...motionProps}
    >
      {children}

      {/* ✨ Sparkle glow effect for 'default' variant */}
      {variant === "default" && (
        <AnimatePresence>
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-md"
            initial={{ opacity: 0 }}
            whileHover={{
              opacity: 0.1,
              background:
                "radial-gradient(circle at var(--x, 50%) var(--y, 50%), white 0%, transparent 70%)",
              transition: { duration: 0.3 },
            }}
            exit={{ opacity: 0 }}
          />
        </AnimatePresence>
      )}
    </motion.button>
  );
}

export { Button, buttonVariants };
