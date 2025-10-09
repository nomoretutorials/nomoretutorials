import { useState, useTransition } from "react";
import { toast } from "sonner";

export type ActionResponse<T> = { success: true; data: T } | { success: false; error: string };

type ServerAction<TInput, TOutput> = (input: TInput) => Promise<ActionResponse<TOutput>>;

interface Options<TOutput> {
  successMessage?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
}

export function useServerAction<TInput, TOutput>(
  action: ServerAction<TInput, TOutput>,
  options: Options<TOutput> = {}
) {
  const { successMessage, onSuccess, onError } = options;
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const execute = (input?: TInput): Promise<TOutput | null> => {
    setError(null);

    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const result = await action(input!);

          if (!result.success) {
            toast.error(result.error);
            setError(result.error);
            onError?.(result.error);
            resolve(null);
            return;
          }

          if (successMessage) toast.success(successMessage);
          onSuccess?.(result.data);
          resolve(result.data);
        } catch {
          const msg = "Something went wrong";
          toast.error(msg);
          setError(msg);
          onError?.(msg);
          resolve(null);
        }
      });
    });
  };

  return { execute, isPending, error };
}
