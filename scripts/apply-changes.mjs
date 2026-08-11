import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const inputPath = process.argv[2];

if (!inputPath) {
  console.error(
    'Usage: node scripts/apply-changes.mjs <json-file>',
  );
  process.exit(1);
}

let raw = await fs.readFile(inputPath, 'utf8');

// Remove BOM.
raw = raw.replace(/^\uFEFF/, '');

// Remove ANSI terminal escape sequences.
raw = raw.replace(
  // eslint-disable-next-line no-control-regex
  /\u001B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g,
  '',
);

raw = raw.trim();

// Remove accidental Markdown fences.
if (raw.startsWith('```json')) {
  raw = raw.slice(7);
}

if (raw.startsWith('```')) {
  raw = raw.slice(3);
}

if (raw.endsWith('```')) {
  raw = raw.slice(0, -3);
}

raw = raw.trim();

let changeSet;

try {
  changeSet = JSON.parse(raw);
} catch (error) {
  console.error('Invalid JSON change set.');
  console.error(error.message);
  process.exit(1);
}

if (!Array.isArray(changeSet.files)) {
  throw new Error(
    'Invalid change set: files must be an array.',
  );
}

changeSet.install ??= {};
changeSet.install.dependencies ??= [];
changeSet.install.devDependencies ??= [];
changeSet.validationCommands ??= [];

const root = process.cwd();

function safePath(relativePath) {
  const resolved = path.resolve(root, relativePath);

  if (
    resolved !== root &&
    !resolved.startsWith(`${root}${path.sep}`)
  ) {
    throw new Error(
      `Unsafe path outside project: ${relativePath}`,
    );
  }

  return resolved;
}

/**
 * Write generated files.
 *
 * Current change-set format:
 *
 * {
 *   "path": "src/example.ts",
 *   "lines": [
 *     "line one",
 *     "line two"
 *   ]
 * }
 */
for (const file of changeSet.files) {
  if (typeof file.path !== 'string') {
    throw new Error(
      'Invalid file: path must be a string.',
    );
  }

  if (!Array.isArray(file.lines)) {
    throw new Error(
      `Invalid file ${file.path}: lines must be an array.`,
    );
  }

  if (
    !file.lines.every(
      (line) => typeof line === 'string',
    )
  ) {
    throw new Error(
      `Invalid file ${file.path}: every line must be a string.`,
    );
  }

  const target = safePath(file.path);

  await fs.mkdir(path.dirname(target), {
    recursive: true,
  });

  const content = `${file.lines.join('\n')}\n`;

  await fs.writeFile(
    target,
    content,
    'utf8',
  );

  console.log(`Wrote ${file.path}`);
}

/**
 * Install normal dependencies.
 */
const dependencies =
  changeSet.install.dependencies ?? [];

if (dependencies.length > 0) {
  console.log(
    `Installing dependencies: ${dependencies.join(', ')}`,
  );

  execFileSync(
    'npm',
    ['install', ...dependencies],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );
}

/**
 * Install development dependencies.
 */
const devDependencies =
  changeSet.install.devDependencies ?? [];

if (devDependencies.length > 0) {
  console.log(
    `Installing dev dependencies: ${devDependencies.join(', ')}`,
  );

  execFileSync(
    'npm',
    ['install', '-D', ...devDependencies],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );
}

/**
 * Only allow known-safe validation commands.
 */
const allowedCommands = new Set([
  'npm run typecheck',
  'npm run lint',
  'npm test',
  'npm run build',
]);

for (
  const command of
  changeSet.validationCommands ?? []
) {
  if (!allowedCommands.has(command)) {
    console.log(
      `Skipping unapproved command: ${command}`,
    );
    continue;
  }

  console.log(`Running: ${command}`);

  execFileSync(
    'zsh',
    ['-lc', command],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );
}