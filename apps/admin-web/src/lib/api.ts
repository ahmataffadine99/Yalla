export type ApiHealth =
  | { available: true }
  | { available: false };

export async function getApiHealth(): Promise<ApiHealth> {
  const apiBaseUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return { available: false };
    }

    const health: unknown = await response.json();
    if (
      typeof health !== 'object' ||
      health === null ||
      !('status' in health) ||
      health.status !== 'ok'
    ) {
      return { available: false };
    }

    return { available: true };
  } catch {
    return { available: false };
  }
}
