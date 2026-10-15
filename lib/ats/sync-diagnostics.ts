import { AsyncLocalStorage } from 'node:async_hooks';
import { formatWithOptions } from 'node:util';
import { safeDiagnostic, type Diagnostics } from './sync-monitor';

const context = new AsyncLocalStorage<Diagnostics>();
let installed = false;
export async function captureAtsDiagnostics<T>(work: (diagnostics: Diagnostics) => Promise<T>): Promise<T> {
  if (!installed) {
    for (const level of ['warn', 'error'] as const) {
      const original = console[level].bind(console);
      console[level] = (...args: unknown[]) => {
        const diagnostics = context.getStore();
        if (diagnostics) {
          diagnostics[level === 'warn' ? 'warnings' : 'errors']++;
          if (diagnostics.samples.length < 20) diagnostics.samples.push({ level, message: safeDiagnostic(formatWithOptions({ depth: 2, maxStringLength: 1500 }, ...args)) });
        }
        original(...args);
      };
    }
    installed = true;
  }
  const diagnostics: Diagnostics = { warnings: 0, errors: 0, samples: [] };
  return context.run(diagnostics, () => work(diagnostics));
}
