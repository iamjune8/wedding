type Environment = Readonly<Record<string, string | undefined>>;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0']);

const isLocalHost = (hostname: string) =>
  LOCAL_HOSTS.has(hostname) || hostname.endsWith('.localhost');

function toWebUrl(value: string, source: string): URL {
  const url = (() => {
    try {
      return new URL(value);
    } catch (cause) {
      throw new Error(`${source} is not a valid URL: "${value}"`, { cause });
    }
  })();
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`${source} must start with http:// or https:// (got "${value}")`);
  }
  return url;
}

/**
 * The public address of the invitation, used for share links, calendar entries and social
 * previews. Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL (set this if you add a custom domain)
 *   2. VERCEL_PROJECT_PRODUCTION_URL (provided automatically by Vercel)
 * Returns null when neither is known, e.g. during local development.
 */
export function resolveSiteUrl(env: Environment): string | null {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelProduction = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  const url = explicit
    ? toWebUrl(explicit, 'NEXT_PUBLIC_SITE_URL')
    : vercelProduction
      ? toWebUrl(`https://${vercelProduction}`, 'VERCEL_PROJECT_PRODUCTION_URL')
      : null;
  if (!url) return null;

  if (env.VERCEL_ENV === 'production' && isLocalHost(url.hostname)) {
    throw new Error(
      `Refusing to publish with a localhost address (${url.origin}). ` +
        'Set NEXT_PUBLIC_SITE_URL to the public website address.',
    );
  }

  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}
