const store = new Map();
const TTL_MS = 30_000;

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key, value) {
  store.set(key, {
    value,
    expiresAt: Date.now() + TTL_MS
  });
}
