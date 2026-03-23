import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL:      z.string().url(),
  NEXT_PUBLIC_APP_NAME:     z.string().default("RAHO"),
  NEXT_PUBLIC_APP_VERSION:  z.string().default("1.0.0"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL:     process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME:    process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
});
