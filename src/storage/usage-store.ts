import {
    appendFile,
    mkdir,
  } from 'node:fs/promises';
  
  import { dirname } from 'node:path';
  
  import type { UsageRecord } from '../domain/usage-record.js';
  
  const DEFAULT_USAGE_FILE = 'data/usage.jsonl';
  
  export async function saveUsageRecord(
    record: UsageRecord,
    filePath = DEFAULT_USAGE_FILE,
  ): Promise<void> {
    await mkdir(dirname(filePath), {
      recursive: true,
    });
  
    await appendFile(
      filePath,
      `${JSON.stringify(record)}\n`,
      'utf8',
    );
  }