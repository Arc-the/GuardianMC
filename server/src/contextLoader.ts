import fs from 'fs';
import path from 'path';

const CONTEXT_DIR = path.join(__dirname, '..', 'context');

export function loadAllContext(): { files: string[]; content: string } {
  const files: string[] = [];
  let content = '';

  if (!fs.existsSync(CONTEXT_DIR)) {
    console.warn('Context directory not found:', CONTEXT_DIR);
    return { files, content };
  }

  const contextFiles = fs.readdirSync(CONTEXT_DIR).filter(f => f.endsWith('.md'));

  for (const file of contextFiles) {
    const filePath = path.join(CONTEXT_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    files.push(file);
    content += `\n\n--- ${file} ---\n${fileContent}`;
  }

  return { files, content };
}
