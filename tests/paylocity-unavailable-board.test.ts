import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('Paylocity JobNotFound with HTTP 200 emits an unavailable-source warning before reading job links', async () => {
  let closed = false, pageClosed = false;
  const warnings: string[] = [];
  const page = {
    goto: async () => ({ ok: () => true }),
    url: () => 'https://recruiting.paylocity.com/Recruiting/jobs/JobNotFound',
    locator: () => { throw Error('Unavailable board must not be scanned as empty'); },
    close: async () => { pageClosed = true; },
  };
  const browser = { newContext: async () => ({ newPage: async () => page }), close: async () => { closed = true; } };
  const source = ts.transpileModule(fs.readFileSync('lib/ats/paylocity.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: any = {};
  const require = (name: string) => {
    if (name.endsWith('/browser')) return { launchAtsBrowser: async () => browser };
    // No extraction dependency may run after the terminal error landing page.
    return {};
  };
  vm.runInNewContext('(function(require,exports){'+source+'\n})', { URL, console: { log: () => {}, warn: (message: string) => warnings.push(message) } })(require, exports);
  const jobs = await exports.fetchPaylocityJobs({ boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/old/board', name: 'Unavailable Board', verified: false });
  assert.equal(jobs.length, 0); assert.ok(pageClosed && closed);
  assert.equal(warnings.length, 1); assert.match(warnings[0], /source unavailable, not an empty board/);
});
