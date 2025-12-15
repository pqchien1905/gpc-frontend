/**
 * Get the API base URL
 * Uses the current hostname if running on localhost
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }

  // If localhost or not set, use current hostname
  const hostname = window.location.hostname;
  const port = 8000;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:${port}`;
}

/**
 * Get the storage URL
 * Uses the current hostname if running on localhost
 */
export function getStorageUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
  }

  const envUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }

  // If localhost or not set, use current hostname
  const hostname = window.location.hostname;
  const port = 8000;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:${port}/storage`;
}
