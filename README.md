# VedaAI Assessment Mapper

VedaAI Assessment Mapper reads a question paper and a student answer sheet, maps answers to questions, and grades each response with Gemini. It supports PDF, JPG, PNG, and WebP uploads with a responsive desktop and mobile results view.

## Requirements

- Bun 1.4 or newer
- A Gemini API key

Create `.env.local`:

```env
GEMINI_API_KEY=your_key_here
```

## Development

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000), upload both documents, and select **Start Mapping**.

## Verification

The single test command runs formatting checks, ESLint, a production build, the API integration server, and the full Gemini-backed test suite:

```bash
bun run test
```

Other useful commands:

```bash
bun run format       # Check Prettier formatting
bun run lint         # Run ESLint
bun run build        # Production build with Webpack (deployment-safe)
bun run build:webpack # Explicit Webpack production build
bun run prepare      # Install Husky hooks
```

Test PDFs can be regenerated with:

```bash
bun scripts/testing/generate-fixtures.ts
```

## Project layout

```text
src/app/                 Routes and API route handlers
src/components/          Reusable UI components
src/features/assessment/ Assessment API and server document processing
src/lib/ai/               Gemini client, prompts, and answer matching
src/lib/pdf/              Browser and server PDF utilities
src/store/                Zustand assessment state
public/images/            Application-owned brand, avatar, UI, and illustration assets
tests/                    API tests, fixtures, responses, and test-server support
scripts/testing/          Development-only fixture generators
```

## Deployment

Deploy as a standard Next.js application. Set `GEMINI_API_KEY` in the deployment environment, then run the platform’s Bun-compatible build command. For Vercel, the default Next.js build configuration is sufficient.
