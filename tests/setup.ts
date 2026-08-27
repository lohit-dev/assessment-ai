// tests/setup.ts
// Runs before every test file — loads .env.local into process.env.
// override: true ensures the file wins over any stale shell-level env vars.
import { config } from "dotenv";
config({ path: ".env.local", override: true });
