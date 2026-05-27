import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import type { SessionContext } from "./types.js";

const contextDirectories = [
  path.join(process.cwd(), "server", "context"),
  path.join(process.cwd(), "context"),
  path.join(process.cwd(), "..", "server", "context")
];

async function getContextDirectory() {
  for (const directory of contextDirectories) {
    try {
      const stat = await fs.stat(directory);
      if (stat.isDirectory()) {
        return directory;
      }
    } catch {
      // Try the next runtime layout.
    }
  }

  throw new Error(`AngelMC context directory not found from ${process.cwd()}`);
}

export async function loadSessionContext(): Promise<SessionContext> {
  const contextDirectory = await getContextDirectory();
  const entries = await fs.readdir(contextDirectory);
  const markdownFiles = entries.filter((entry) => entry.endsWith(".md")).sort();
  const parts = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const body = await fs.readFile(path.join(contextDirectory, fileName), "utf8");
      return `# ${fileName}\n\n${body}`;
    })
  );

  return {
    sessionId: `demo-${nanoid(8)}`,
    loadedContextFiles: markdownFiles,
    combinedContext: parts.join("\n\n---\n\n"),
    startedAt: new Date().toISOString()
  };
}
