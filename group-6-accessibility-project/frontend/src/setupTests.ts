import { expect } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';
if (expect && matchers) {
  expect.extend(matchers);
}
// Make expect available globally for jest-dom matchers
// @ts-ignore
(globalThis as any).expect = expect;
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
  const store: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (store.hasOwnProperty(k) ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
