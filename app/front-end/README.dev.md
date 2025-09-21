# Frontend Development Notes

This file contains quick steps to run the frontend in development and manage MSW (Mock Service Worker).

## Regenerate MSW worker

If you update `msw` version or the `public/mockServiceWorker.js` is out of sync, regenerate the worker:

```powershell
cd .\app\front-end
npx msw init ./public
```

## Run frontend (Vite)

```powershell
cd .\app\front-end
npm run dev
```

## MSW vs Backend real

- By default this project uses MSW in dev to mock many backend endpoints.
- To test against the real backend, either:
  - Disable `setupMsw()` in `src/app/main.tsx` (wrap it conditionally with an env var), or
  - Configure MSW to `onUnhandledRequest: 'bypass'` in `src/app/setup/msw.ts` so requests without handlers go to the real backend.

## Media endpoints

- For local dev without backend auth, MSW provides mock handlers for `/api/media/sign` and `/api/media/upload`.
- To test real uploads:
  1. Start backend (`app/back-end`) and authenticate as admin (routes are protected).
  2. Ensure `CLOUDINARY_*` env vars are configured in `app/back-end/.env` if you want to upload to Cloudinary.

Happy hacking!
