import { stopTestServer } from "./testServer";

export default function globalTeardown(): void {
  stopTestServer();
}
