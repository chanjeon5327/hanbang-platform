#!/usr/bin/env node
/**
 * app, components, lib, context, hooks 내 .ts, .tsx 파일을 UTF-8로 재저장
 * CP949로 저장된 파일은 UTF-8로 변환
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

let iconv;
try {
  iconv = (await import('iconv-lite')).default;
} catch {
  iconv = null;
}

const dirs = ['app', 'components', 'lib', 'context', 'hooks'];

function* walk(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        yield* walk(p);
      } else if (e.isFile() && /\.(ts|tsx)$/.test(e.name)) {
        yield p;
      }
    }
  } catch (_) {}
}

function isValidUtf8(buf) {
  try {
    const s = buf.toString('utf8');
    return !s.includes('\uFFFD');
  } catch {
    return false;
  }
}

let count = 0;
for (const dir of dirs) {
  for (const file of walk(dir)) {
    try {
      const buf = readFileSync(file);
      let content;
      if (iconv && !isValidUtf8(buf)) {
        content = iconv.decode(buf, 'cp949');
      } else {
        content = buf.toString('utf8');
      }
      writeFileSync(file, content, 'utf8');
      count++;
      console.log(file);
    } catch (err) {
      console.error('Error:', file, err.message);
    }
  }
}
console.log(`\nDone. ${count} files re-saved as UTF-8.`);
