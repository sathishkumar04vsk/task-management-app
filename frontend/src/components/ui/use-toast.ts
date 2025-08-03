import { toast, type ToastOptions } from "sonner";

export function useToast() {
  return {
    toast: (message: string | React.ReactNode, options?: ToastOptions) =>
      toast(message, options),
  };
}
