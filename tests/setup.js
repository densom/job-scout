import { vi } from "vitest";

// Minimal chrome API mock available globally in all tests.
// Individual tests can override specific methods with vi.fn().
globalThis.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
    session: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
    lastError: null,
    openOptionsPage: vi.fn(),
  },
};
