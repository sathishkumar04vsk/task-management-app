import { toast } from "sonner";

export function useToast() {
  return {
    toast: (message: string | React.ReactNode, options?: object | undefined) =>
      toast(message, options),
  };
}
