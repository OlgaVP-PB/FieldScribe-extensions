# FieldScribe offline-voice (prototype)

An **optional, self-hostable extension** that adds offline speech-to-text
(dictation) to FieldScribe's free-text fields, for teams working with no internet
in the field. Speech is recognised entirely on the device with
[Vosk](https://alphacephei.com/vosk/) compiled to WebAssembly - **no audio leaves
the phone.**

## Status: prototype

- Written against the documented `vosk-browser` API; **not yet tested on a real
  device**. The last step (mic + model on a phone) is yours - see
  `OFFLINE_VOICE.md`.
- **Not integrated** into the FieldScribe app, and it changes nothing there. The
  shared app stays light; this is only for people who build the voice variant.

## Why it exists

Offline voice needs a large per-language model (tens of MB) plus real device
memory and battery. Forcing that on every user would bloat a deliberately tiny
app. Because FieldScribe is open source and self-contained, a team that *knows*
they're going off-grid can build a heavier "voice" variant and preload it, while
everyone else keeps the light version. The weight becomes an opt-in choice made
by the person who actually needs it.

## Files

- `voice.js` - the drop-in module (mic button + Vosk recognition).
- `config.example.js` - example settings.
- `demo.html` - standalone test page to prove it works before integrating.
- `OFFLINE_VOICE.md` - full step-by-step setup and on-device test guide.

## Where this should live

Keep this **out of the main FieldScribe app repo** (which is deployed and has a
DOI - best kept clean). When you want to publish it, put it in its own repo, e.g.
`FieldScribe-extensions` or `fieldscribe-voice`, so the core app and its optional
add-ons version independently.

---
*Prototype for the SciLifeLab Planetary Biology FieldScribe project. Built with
AI assistance from Claude (Anthropic).*
