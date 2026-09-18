declare module "playwright" {
  export const chromium: {
    launch: (options?: Record<string, unknown>) => Promise<{
      newPage: (options?: Record<string, unknown>) => Promise<{
        goto: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
        waitForFunction: (fn: () => boolean, options?: Record<string, unknown>) => Promise<unknown>;
        waitForTimeout: (ms: number) => Promise<unknown>;
        evaluate: <T>(fn: () => T) => Promise<T>;
      }>;
      close: () => Promise<void>;
    }>;
  };
}
