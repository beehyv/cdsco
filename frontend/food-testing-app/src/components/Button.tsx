import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type Props = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-green-600 text-white hover:bg-green-700 text-gray disabled:bg-gray-100 disabled:text-gray-400",
  outline:
    "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-50 disabled:text-gray-400",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: Props) {
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  return (
    <button className={classes} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}


