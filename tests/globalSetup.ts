import { startTestServer } from "./testServer";

export default async function globalSetup(): Promise<void> {
  await startTestServer();
}
