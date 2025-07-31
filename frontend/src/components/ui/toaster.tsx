import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-text group-[.toaster]:border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-secondary group-[.toast]:text-text",
        },
      }}
    />
  )
}