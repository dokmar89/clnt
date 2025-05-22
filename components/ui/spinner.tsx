import { cn } from "@/lib/utils"

type SpinnerProps = {
  size?: "small" | "medium" | "large"
  className?: string
}

export function Spinner({ size = "medium", className }: SpinnerProps) {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-6 w-6 border-2",
    large: "h-8 w-8 border-3",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-solid border-current border-t-transparent text-blue-600",
        sizeClasses[size],
        className
      )}
    />
  )
} 