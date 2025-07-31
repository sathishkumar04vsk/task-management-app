import { toast, type ToastOptions } from "sonner";

export function useToast() {
  return {
    toast: (options: ToastOptions) => toast(options),
  };
}
