"use client"

import { X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="relative rounded-md border bg-background p-4 shadow min-w-[250px]"
        >
          {/* Close Button */}
          <button
            onClick={() => dismiss(toast.id)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>

          {toast.title && (
            <div className="font-semibold pr-6">{toast.title}</div>
          )}

          {toast.description && (
            <div className="text-sm text-muted-foreground pr-6">
              {toast.description}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
