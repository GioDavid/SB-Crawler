#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ROOT = process.cwd();
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:3b';
const OLLAMA_URL = 'http://localhost:11434/api/chat';

const [, , agentName, ...taskParts] = process.argv;
const task = taskParts.join(' ');

if (!agentName || !task) {
  console.error(
    'Usage: node scripts/agent-runner.mjs <agent-name> "<task>"',
  );
  process.exit(1);
}

function safePath(relativePath) {
  const resolved = path.resolve(ROOT, relativePath);

  if (
    resolved !== ROOT &&
    !resolved.startsWith(`${ROOT}${path.sep}`)
  ) {
    throw new Error(`Path outside project is not allowed: ${relativePath}`);
  }

  return resolved;
}

async function readOptional(relativePath) {
  try {
    return await fs.readFile(safePath(relativePath), 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return '';
    }

    throw error;
  }
}

async function buildContext() {
  const files = [
    `.cursor/agents/${agentName}.md`,
    '.cursor/rules/engineering.mdc',
    '.cursor/rules/workflow.mdc',
    'docs/PRD.md',
    'docs/SPEC.md',
    'docs/ARCHITECTURE.md',
    'docs/IMPLEMENTATION_PLAN.md',
  ];

  const sections = [];

  for (const file of files) {
    const content = await readOptional(file);

    if (content.trim()) {
      sections.push(`
# FILE: ${file}

${content}
`);
    }
  }

  return sections.join('\n');
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description:
        'Read a UTF-8 text file inside the current project.',
      parameters: {
        type: 'object',
        required: ['path'],
        properties: {
          path: {
            type: 'string',
            description: 'Project-relative path to read.',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'write_file',
      description:
        'Create or completely replace a UTF-8 text file inside the project.',
      parameters: {
        type: 'object',
        required: ['path', 'content'],
        properties: {
          path: {
            type: 'string',
            description: 'Project-relative path.',
          },
          content: {
            type: 'string',
            description: 'Complete file contents.',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'list_files',
      description:
        'List files and directories inside a project directory.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Project-relative directory. Defaults to root.',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'run_command',
      description:
        'Run an approved development command inside the project.',
      parameters: {
        type: 'object',
        required: ['command', 'args'],
        properties: {
          command: {
            type: 'string',
            description:
              'Executable. Allowed: npm, npx, node, git.',
          },
          args: {
            type: 'array',
            items: { type: 'string' },
            description: 'Command arguments.',
          },
        },
      },
    },
  },
];

async function executeTool(name, args) {
  switch (name) {
    case 'read_file': {
      const content = await fs.readFile(
        safePath(args.path),
        'utf8',
      );

      return content;
    }

    case 'write_file': {
      const target = safePath(args.path);

      await fs.mkdir(path.dirname(target), {
        recursive: true,
      });

      await fs.writeFile(target, args.content, 'utf8');

      return `Wrote ${args.path}`;
    }

    case 'list_files': {
      const relativePath = args.path || '.';
      const target = safePath(relativePath);

      const entries = await fs.readdir(target, {
        withFileTypes: true,
      });

      return entries
        .map((entry) =>
          entry.isDirectory()
            ? `${entry.name}/`
            : entry.name,
        )
        .join('\n');
    }

    case 'run_command': {
      const allowed = new Set([
        'npm',
        'npx',
        'node',
        'git',
      ]);

      if (!allowed.has(args.command)) {
        throw new Error(
          `Command not allowed: ${args.command}`,
        );
      }

      const commandArgs = Array.isArray(args.args)
        ? args.args
        : [];

      console.log(
        `\n[tool] ${args.command} ${commandArgs.join(' ')}`,
      );

      const { stdout, stderr } = await execFileAsync(
        args.command,
        commandArgs,
        {
          cwd: ROOT,
          timeout: 120_000,
          maxBuffer: 1024 * 1024 * 5,
        },
      );

      return [
        stdout ? `STDOUT:\n${stdout}` : '',
        stderr ? `STDERR:\n${stderr}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function chat(messages) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools,
      stream: false,

      options: {
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama returned ${response.status}: ${await response.text()}`,
    );
  }

  return response.json();
}

async function main() {
  const context = await buildContext();

  const messages = [
    {
      role: 'system',
      content: `
You are operating as a real coding agent.

You have filesystem and command tools.

IMPORTANT:

- When asked to implement something, you MUST use tools.
- Do not merely describe files that should exist.
- Do not claim a file was created unless write_file succeeded.
- Do not claim a command passed unless run_command actually returned success.
- Inspect existing files before overwriting them.
- Stay inside the current project.
- Implement ONLY the requested task.
- Do not implement future tasks.
- Follow the supplied project rules, PRD, specification,
  architecture, and implementation plan.
- Prefer small, maintainable TypeScript changes.
- After implementation, run the validation commands relevant
  to the requested task.

When all work is actually complete, provide a short summary of:
1. files changed
2. commands executed
3. validation results
`,
    },

    {
      role: 'user',
      content: `
# PROJECT CONTEXT

${context}

# CURRENT TASK

${task}

Use your tools to perform this task now.
Do not respond with a hypothetical implementation.
`,
    },
  ];

  const MAX_ITERATIONS = 25;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const response = await chat(messages);
    const message = response.message;

    messages.push(message);

    const toolCalls = message.tool_calls ?? [];

    if (!toolCalls.length) {
      console.log('\n=== AGENT RESULT ===\n');
      console.log(message.content || 'Agent finished.');
      return;
    }

    for (const call of toolCalls) {
      const name = call.function.name;
      const args = call.function.arguments ?? {};

      console.log(
        `\n[tool-call] ${name}`,
        JSON.stringify(args, null, 2),
      );

      try {
        const result = await executeTool(name, args);

        console.log(
          `[tool-result] ${String(result).slice(0, 1000)}`,
        );

        messages.push({
          role: 'tool',
          tool_name: name,
          content: String(result),
        });
      } catch (error) {
        const result = `TOOL_ERROR: ${error.message}`;

        console.error(result);

        messages.push({
          role: 'tool',
          tool_name: name,
          content: result,
        });
      }
    }
  }

  throw new Error(
    `Agent exceeded ${MAX_ITERATIONS} iterations.`,
  );
}

main().catch((error) => {
  console.error('\nAgent failed:');
  console.error(error);
  process.exit(1);
});