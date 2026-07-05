# litmus-lab, frontend

Landing page + waitlist for **litmus-lab**, the local CLI profiler that benchmarks LLMs across
FP16 · INT8 · INT4 and recommends the best precision to deploy.

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Framer Motion**. Theme: black
background, crimson accent. Statically exported, ready for **Cloudflare Pages**.

## Stack

- `next` 14, static export (`output: "export"`)
- `tailwindcss` 3, custom `ink` / `coral` / `bone` palette + glass utilities in `tailwind.config.ts`
- `framer-motion`, scroll reveals, animated terminal, count-ups, cursor glow, marquee

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Production build

```bash
npm run build    # emits a static site into ./out
```

## Deploy to Cloudflare Pages

This app exports to plain static HTML, so deployment is trivial.

**Option A, Dashboard (Git):**

1. Push this folder to a Git repo and connect it in the Cloudflare Pages dashboard.
2. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
3. Deploy.

**Option B, Wrangler (direct upload):**

```bash
npm run build
npx wrangler pages deploy out --project-name litmus-lab
```

## Waitlist wiring

The form in `components/Waitlist.tsx` works out of the box:

- **No endpoint set:** emails are stored in `localStorage` (good for preview/dev).
- **Endpoint set:** emails are `POST`ed as `{ email }` to `NEXT_PUBLIC_WAITLIST_ENDPOINT`.

To persist on Cloudflare, a Pages Function is included at `functions/api/waitlist.ts`:

1. In your Pages project, bind a **KV namespace** named `WAITLIST`
   (Settings → Functions → KV namespace bindings).
2. Set the build-time env var:

   ```
   NEXT_PUBLIC_WAITLIST_ENDPOINT=/api/waitlist
   ```

3. Redeploy. Submissions are stored as `email:<address>` keys in KV.

You can swap the endpoint for Formspree, Buttondown, or any URL that accepts `{ email }`.

## Structure

```
app/
  layout.tsx        fonts + metadata
  page.tsx          section composition
  globals.css       design tokens, grid/glow utilities
  icon.svg          favicon
components/
  Nav, Hero, AnimatedTerminal, Problem, Features,
  Metrics, CountUp, HowItWorks, Models, Waitlist, Footer, Reveal, Backdrop
functions/
  api/waitlist.ts   optional Cloudflare Pages Function
```
