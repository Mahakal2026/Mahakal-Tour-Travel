import dotenv from "dotenv";
import { z } from "zod";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_EMAIL: z.string().email().default("mahakaltravels20@gmail.com"),
  ADMIN_PASSWORD_HASH: z.string().min(1, "ADMIN_PASSWORD_HASH is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  IMAGEKIT_PUBLIC_KEY: z.string().min(1, "IMAGEKIT_PUBLIC_KEY is required"),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  IMAGEKIT_URL_ENDPOINT: z.string().url("IMAGEKIT_URL_ENDPOINT must be a valid URL").min(1, "IMAGEKIT_URL_ENDPOINT is required"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Environment validation error:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
