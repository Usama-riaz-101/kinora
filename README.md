# Kinora

Mobile-first studio that turns one sentence, or a script you already have, into a vertical short drama: screenplay, still frames, then a four-second clip per shot.

Built and owned by Usama Riaz.

## Stack

- Next.js App Router
- Vercel AI SDK through the AI Gateway
- Screenplay: `google/gemini-3.8-flash`
- Frames: `google/gemini-3.1-flash-image`
- Clips: `google/veo-3.1-fast-generate-001`

## Run locally

```bash
cp .env.example .env.local
# Add AI_GATEWAY_API_KEY
npm install
npm run dev
```

Open `/studio` on a phone-width window. Write an idea, render one frame, then shoot that clip. Each step is its own request so a phone can show progress without waiting on a whole episode.

## Deploy

Connect the GitHub repo to Vercel and set `AI_GATEWAY_API_KEY`. The clip route allows 60 seconds, which is the cap on a fresh Vercel project. Raise `maxDuration` in `src/app/api/clip/route.ts` if the linked plan allows a longer video call.

Stripe prices are shown on the landing page and are not charged yet. Connect Stripe on the Vercel project before taking payment.

## What an episode costs you

Gateway usage is billed to the key on the project. A full episode is one screenplay, up to four frames, and up to four clips. Render a frame before you shoot, so a bad still does not spend a video call.
