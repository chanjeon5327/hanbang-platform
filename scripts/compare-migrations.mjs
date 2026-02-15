#!/usr/bin/env node
/**
 * 원격/로컬 마이그레이션 diff 리포트
 * - remote에는 있는데 local에 없는 것
 * - local에는 있는데 remote에 없는 것
 * - 이름 충돌(같은 번호 다른 내용) 가능성 표기
 * - outputs/migration_diff_report.md 생성
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const OUTPUTS = resolve(process.cwd(), 'outputs');
const REMOTE_PATH = resolve(OUTPUTS, 'remote_schema_migrations.json');
const LOCAL_PATH = resolve(OUTPUTS, 'local_migrations.json');
const REPORT_PATH = resolve(OUTPUTS, 'migration_diff_report.md');

function loadJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error(`${label} 파일 없음: ${path}`);
    console.error('먼저 dump-remote-migrations.mjs, dump-local-migrations.mjs 실행');
    process.exit(1);
  }
}

function extractVersion(name) {
  const m = name.match(/^(\d{8})/);
  return m ? m[1] : null;
}

function main() {
  const remote = loadJson(REMOTE_PATH, 'remote');
  const local = loadJson(LOCAL_PATH, 'local');

  const remoteSet = new Set(remote.migrations ?? []);
  const localSet = new Set(local.migrations ?? []);

  const onlyRemote = [...remoteSet].filter((x) => !localSet.has(x));
  const onlyLocal = [...localSet].filter((x) => !remoteSet.has(x));

  const localByVersion = new Map();
  for (const n of localSet) {
    const v = extractVersion(n);
    if (v) {
      const list = localByVersion.get(v) ?? [];
      list.push(n);
      localByVersion.set(v, list);
    }
  }

  const collisions = [];
  for (const [ver, names] of localByVersion) {
    if (names.length > 1) {
      collisions.push({ version: ver, files: names });
    }
  }

  let md = `# Migration Diff Report\n\n`;
  md += `생성: ${new Date().toISOString()}\n\n`;
  md += `| 구분 | 개수 |\n|------|------|\n`;
  md += `| 원격(remote) | ${remote.migrations?.length ?? 0} |\n`;
  md += `| 로컬(local) | ${local.migrations?.length ?? 0} |\n`;
  md += `| 원격에만 있음 | ${onlyRemote.length} |\n`;
  md += `| 로컬에만 있음 | ${onlyLocal.length} |\n`;
  md += `| 이름 충돌(같은 번호) | ${collisions.length} |\n\n`;

  md += `## 원격에만 있는 마이그레이션 (local에 없음)\n\n`;
  if (onlyRemote.length === 0) {
    md += `없음\n\n`;
  } else {
    md += `\`\`\`\n${onlyRemote.join('\n')}\n\`\`\`\n\n`;
  }

  md += `## 로컬에만 있는 마이그레이션 (remote에 없음)\n\n`;
  if (onlyLocal.length === 0) {
    md += `없음\n\n`;
  } else {
    md += `\`\`\`\n${onlyLocal.join('\n')}\n\`\`\`\n\n`;
  }

  md += `## 이름 충돌 (같은 버전 번호, 다른 파일)\n\n`;
  if (collisions.length === 0) {
    md += `없음\n\n`;
  } else {
    for (const c of collisions) {
      md += `- **${c.version}**: ${c.files.join(', ')}\n`;
    }
    md += `\n`;
  }

  md += `---\n\n## 권장 조치\n\n`;
  if (onlyRemote.length > 0 && onlyLocal.length === 0) {
    md += `**권장: 로컬에 누락분 반영**\n\n`;
    md += `원격에만 있는 마이그레이션이 있습니다. 로컬에서 \`supabase db pull\` 또는 해당 마이그레이션 파일을 수동으로 추가하세요.\n\n`;
  } else if (onlyLocal.length > 0 && onlyRemote.length === 0) {
    md += `**권장: 원격에 push**\n\n`;
    md += `로컬에만 있는 마이그레이션이 있습니다. \`supabase db push\`로 원격에 적용하세요.\n\n`;
  } else if (onlyRemote.length > 0 && onlyLocal.length > 0) {
    md += `**권장: baseline migration(원격 기준) 생성**\n\n`;
    md += `원격과 로컬 모두 차이가 있습니다. 원격을 기준으로 baseline migration을 생성한 뒤, 로컬 누락분을 rebaseline 하세요.\n\n`;
    md += `1. \`supabase db pull\`로 원격 스키마를 로컬 마이그레이션으로 캡처\n`;
    md += `2. 로컬에만 있는 마이그레이션은 의존성 확인 후 순서 조정\n`;
  } else if (collisions.length > 0) {
    md += `**권장: 이름 충돌 해결**\n\n`;
    md += `같은 버전 번호를 가진 파일이 여러 개 있습니다. 파일명의 타임스탬프를 조정하여 충돌을 해소하세요.\n\n`;
  } else {
    md += `**정합성 OK**\n\n`;
    md += `원격과 로컬 마이그레이션이 일치합니다.\n\n`;
  }

  mkdirSync(OUTPUTS, { recursive: true });
  writeFileSync(REPORT_PATH, md, 'utf8');
  console.log('report saved:', REPORT_PATH);
}

main();
