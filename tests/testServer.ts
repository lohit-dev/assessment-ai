import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

const PORT = 3100;
const SERVER_URL = `http://127.0.0.1:${PORT}`;
const PID_FILE = join(
  process.env.TMPDIR ?? "/tmp",
  "assessment-mapper-test-server.pid"
);

let server: ChildProcess | undefined;
let output = "";

export async function startTestServer(): Promise<void> {
  server = spawn("bun", ["run", "start", "--", "--port", String(PORT)], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  server.stdout?.on("data", appendOutput);
  server.stderr?.on("data", appendOutput);
  writeFileSync(PID_FILE, String(server.pid));

  try {
    await waitForServer();
  } catch (error) {
    stopTestServer();
    throw new Error(
      `The test server did not become ready at ${SERVER_URL}.\n${output}`,
      { cause: error }
    );
  }
}

export function stopTestServer(): void {
  if (server && !server.killed) {
    server.kill("SIGTERM");
  }

  if (existsSync(PID_FILE)) {
    const pid = Number(readFileSync(PID_FILE, "utf8"));
    if (Number.isInteger(pid)) {
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        // The process has already exited.
      }
    }
    unlinkSync(PID_FILE);
  }
}

async function waitForServer(): Promise<void> {
  const timeoutAt = Date.now() + 30_000;

  while (Date.now() < timeoutAt) {
    if (server?.exitCode !== null) {
      throw new Error(`Server exited with code ${server?.exitCode}.`);
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/grade`);
      if (response.status < 500) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Timed out waiting for the test server.");
}

function appendOutput(chunk: Buffer): void {
  output = `${output}${chunk.toString()}`.slice(-4_000);
}
