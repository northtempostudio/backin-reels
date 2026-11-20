# BackIn reels

Renders BackIn marketing reels on GitHub's servers, so no Mac is needed.

**From your phone:** GitHub app → this repo → Actions → **Render reel** → Run workflow → pick the reel → Run.
The reel appears on the private BackIn Reels dashboard. Nothing private is printed in run logs (this repo is public).

- `video/` – Remotion templates (edit on github.com)
- `guard/` – upload script with the R2 free-tier guard (refuses at 30% of any limit)
- Assets (music, footage, voice) live in the private repo `backin-reels-assets`
- Optional footage from Google Drive: switch on "drive_footage" to use the newest video in **BackIn Content > 03 Demo Recordings**. Google sign-in is keyless (Workload Identity Federation) and read-only.

## Dashboard prompts
Each reel has a detailed AI prompt in `video/about/<Reel>.md`. The upload step saves it next to the video, and the private dashboard shows it with a **Copy AI prompt** button for captions and hashtags. New reel? Add its `about` file.
