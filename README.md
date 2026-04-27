# Boom Catcher — landing page

Landing page for the Boom Catcher mobile app. Static HTML/CSS/JS, deployed on Vercel.

## Run locally

No build step. Either:

```sh
python3 -m http.server 4000
```

…then open http://localhost:4000, or use VS Code's Live Server.

## Files

- `index.html` — landing page
- `privacy.html` — privacy policy
- `css/main.css` — all styles
- `js/main.js` — signup form handlers + sticky bar scroll trigger
- `videos/` — drop a real app capture here as `app-capture.mp4` to replace the placeholder inside the iPhone mockup
- `vercel.json` — clean URLs config

## Email signup

Submissions go to Formspree at `https://formspree.io/f/meevpakz` (set in `index.html`'s inline script). Update the URL there if you migrate to a different form service or list provider.

## Deploy

Push to GitHub, connect the repo to Vercel. Vercel serves the repo root as static files; clean URLs are enabled via `vercel.json`.
