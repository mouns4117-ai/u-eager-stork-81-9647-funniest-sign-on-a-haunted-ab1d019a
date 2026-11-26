// Funniest Sign on a Haunted Server Room Door — entry program.
// Writes one sign line (1-120 chars, single line, UTF-8) to /output/entry.txt.
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "DO NOT KNOCK. The ghost in rack 7 reboots the firewall at midnight and still blames the intern.";

function validateGate(text: string): void {
  // Fail fast: every gate rule checked up front, before any file work.
  const chars = [...text];
  if (chars.length < 1 || chars.length > 120) {
    throw new Error(`entry length ${chars.length} outside gate 1-120`);
  }
  if (text.trim().length === 0) throw new Error("entry is only whitespace");
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.charCodeAt(0) === 0xfeff) throw new Error("entry starts with BOM");
  for (const ch of text) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
      throw new Error("control character in entry");
    }
  }
  const bytes = Buffer.from(text, "utf8");
  if (bytes.length > 480) throw new Error(`entry too large: ${bytes.length} bytes`);
  if (bytes.toString("utf8") !== text) throw new Error("entry is not valid UTF-8");
}

function main(): void {
  validateGate(ENTRY);
  const chars = [...ENTRY];
  const bytes = Buffer.from(ENTRY, "utf8");

  // Empty /output contents only (never remove the mount dir itself).
  mkdirSync("/output", { recursive: true });
  for (const name of readdirSync("/output")) {
    rmSync(`/output/${name}`, { recursive: true, force: true });
  }
  writeFileSync("/output/entry.txt", ENTRY, "utf8");

  // Read-back verification: file must hold exactly the entry.
  const back = readFileSync("/output/entry.txt", "utf8");
  if (back !== ENTRY) throw new Error("read-back mismatch");
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote /output/entry.txt (${chars.length} chars, sha256 ${sha})`);
}

main();
