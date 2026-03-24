import "dotenv/config";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(getEnv("PORT")),
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  NODE_ENV: getEnv("NODE_ENV")
};