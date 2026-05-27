import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import type { SessionContext } from "./types.js";

const contextDirectory = path.join(process.cwd(), "context");

export async function loadSessionContext(): Promise<SessionContext> {
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
