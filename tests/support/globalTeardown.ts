import { stopTestServer } from "./server";

export default function globalTeardown(): void {
  stopTestServer();
}
