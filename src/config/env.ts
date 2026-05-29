import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .min(1, 'VITE_API_BASE_URL is required')
    .url('VITE_API_BASE_URL must be a valid URL'),
  VITE_AUTH_ME_ENDPOINT: z
    .string()
    .trim()
    .min(1, 'VITE_AUTH_ME_ENDPOINT cannot be empty')
    .optional(),
  VITE_AUTH_LOGOUT_ENDPOINT: z
    .string()
    .trim()
    .min(1, 'VITE_AUTH_LOGOUT_ENDPOINT cannot be empty')
    .optional(),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${parsedEnv.error.issues
      .map((issue) => issue.message)
      .join(', ')}`
  );
}

export const env = parsedEnv.data;
