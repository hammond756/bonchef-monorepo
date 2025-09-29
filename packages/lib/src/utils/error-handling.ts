import { z } from "zod";

const AppErrorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('auth') }),
  z.object({ kind: z.literal('notFound') }),
  z.object({ kind: z.literal('server'), status: z.number() }),
  z.object({ kind: z.literal('network') }),
  z.object({ kind: z.literal('unknown'), message: z.string().optional() }),
]);

export const isAppError = (error: unknown): error is AppError => {
  return AppErrorSchema.safeParse(error).success;
};

export type AppError = z.infer<typeof AppErrorSchema>;


export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return { kind: 'unknown', message: error.message };
  }

  return { kind: 'unknown', message: 'Unknown error' };
}