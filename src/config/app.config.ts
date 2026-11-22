export const APP_CONFIG = Symbol('APP_CONFIG');

export interface AppConfig {
  port: number;
  defaultProfileSlug: string;
  logQueries: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT: ${env.PORT}`);
  }
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  return {
    port,
    defaultProfileSlug: env.DEFAULT_PROFILE_SLUG || 'mikhail-cherepanov',
    logQueries: env.PRISMA_LOG_QUERIES === 'true',
  };
}
