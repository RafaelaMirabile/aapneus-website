# A.A.Pneus — website

Next.js site for A.A.Pneus (Viana do Castelo). 5 languages: PT (default), EN, FR, DE, ES.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Where to edit things

| What | File |
|---|---|
| Phone, WhatsApp, address, Facebook, brand list | `lib/site.ts` |
| Opening hours (incl. lunch break) | `lib/site.ts` → `hours` |
| All text, per language | `dictionaries/pt.ts`, `en.ts`, `fr.ts`, `de.ts`, `es.ts` |
| Photos | `public/images/` (keep the same file names, or update them in the dictionaries) |
| Tyre sizes offered in the finder | `components/TireFinder.tsx` → `options` |
| Colours, fonts, spacing | `app/globals.css` (tokens at the top) |

The tyre finder and all "Book"/"Get a price" buttons open WhatsApp (`wa.me`) with a pre-filled message — no backend needed.

## Deploy

Easiest: push to GitHub and import the repo on [Vercel](https://vercel.com) (free tier is fine), then point `aappneus.com` to it.
