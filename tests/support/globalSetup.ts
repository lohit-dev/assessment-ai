import { startTestServer } from "./server";

export default async function globalSetup(): Promise<void> {
  await startTestServer();
}
