# Your cinematic portfolio (local)

Customized from the cinematic-portfolio template with your data from [anudeeppasala.vercel.app](https://anudeeppasala.vercel.app) and projects from [github.com/anudeeppasala](https://github.com/anudeeppasala).

## Run locally

```bash
cd ~/Desktop/anudeep-cinematic-portfolio
npm install
npm run dev
```

Open http://localhost:3000 — on the loader screen, use **Record my voice** (optional), then **Start**.

**Intro (first page):** your real suit photo → `intro-suit.png`  
**AI character widget:** stylized avatar from your reference pics → `ai-character.png`  
**Hero / About:** cinematic portraits → `hero.png`, `about.png`

## Edit your content

| File | Purpose |
|------|---------|
| `data/profile.json` | Name, bio, jobs, projects, socials, email |
| `data/content.json` | Section labels & UI copy |
| `data/intro.json` | Intro mode, narration script, voice preferences |
| `lib/siteConfig.js` | Public URL for SEO |

## Intro: your picture & your voice

**Picture:** Downloaded from your live site into `public/assets/hero.png` and `about.png`.

**Voice (pick one):**

1. **Record on the loader screen** (recommended) — click **Record my voice**, speak for up to 12 seconds, then **Start**. Saved in your browser only (IndexedDB).
2. **Drop an audio file** — save as `public/assets/intro-voice.webm` or `.mp3` and set `audioSrc` in `data/intro.json`.
3. **Fallback** — if neither exists, a neutral TTS reads `narration.text` from `intro.json`.

The template’s `about-me.mp4` (Vaibhav’s avatar) is **not used**.

Cinematic intro:

- Full-screen **your photo** with slow zoom
- **Presenter widget** (your face, bottom-right) on the intro section

### Optional: real AI avatar video (looks like you)

1. Use [HeyGen](https://www.heygen.com), [D-ID](https://www.d-id.com), or [Synthesia](https://www.synthesia.io) with your headshot (`hero.png`).
2. Export a short welcome clip (5–15s).
3. Save as `public/assets/intro-anudeep.mp4`.
4. In `data/intro.json` set `"mode": "video"` (or keep cinematic — the app auto-detects the file and layers video when present).

For a **custom cloned voice** (ElevenLabs, Play.ht), export `intro-narration.mp3` and wire it in a follow-up — browser TTS is the zero-setup default.

## Replace placeholder images

| File | Replace with |
|------|----------------|
| `hero.png` | Your headshot (intro + hero) |
| `about.webp` | About section photo |
| `work-experience.webp` | Experience background |
| `footer.png`, `footer-video.mp4` | Footer visuals |
| `project-*.png` | Screenshots for GitHub projects |

You can delete unused template files: `about-me.mp4` (Vaibhav’s intro).

## Deploy to GitHub + Vercel

```bash
cd ~/Desktop/anudeep-cinematic-portfolio
git init
git add .
git commit -m "Personal cinematic portfolio"
git remote add origin https://github.com/anudeeppasala/anudeeppasala-portfolio.git
git push -u origin main
```

Import the repo on Vercel to replace or complement [anudeeppasala.vercel.app](https://anudeeppasala.vercel.app).
