# BackIn reels

Renders BackIn marketing reels on GitHub's servers, so no Mac is needed.

**From your phone:** GitHub app → this repo → Actions → **Render reel** → Run workflow → pick the reel → Run.
The finished run shows a 7-day private link for Buffer, and the video is downloadable from the run for 3 days.

- `video/` – Remotion templates (edit on github.com)
- `guard/` – upload script with the R2 free-tier guard (refuses at 30% of any limit)
- Assets (music, footage, voice) live in the private repo `backin-reels-assets`
- Optional footage from Google Drive: type the exact file name from the **BackIn Content** folder. Google sign-in is keyless (Workload Identity Federation) and read-only.
