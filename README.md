# FieldScribe extensions

Optional, self-hostable add-ons for [FieldScribe](https://github.com/OlgaVP-PB/FieldScribe).

Each extension is **opt-in** and **not part of the core app**. FieldScribe itself
stays deliberately light; these are for teams who need a specific extra and are
willing to host their own build. Keeping them here, separate from the main app
repo, lets the app and its add-ons version independently.

## Extensions

| Folder | What it does | Status |
|--------|--------------|--------|
| [`voice/`](voice/) | Offline speech-to-text (dictation) for the free-text fields, using Vosk in the browser. No audio leaves the device. | Prototype - needs on-device testing |
| [`photo-matcher/`](photo-matcher/) | Links field photos to FieldScribe samples by EXIF timestamp and GPS, after fieldwork. Runs in the browser; no photo is uploaded. | EXIF reader verified; try on real photos |

Each extension has its own README and setup guide inside its folder.

---
*SciLifeLab Planetary Biology - FieldScribe project. Built with AI assistance from Claude (Anthropic).*
