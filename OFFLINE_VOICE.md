# FieldScribe offline voice - setup guide

This is an **optional add-on** that lets people dictate into FieldScribe's
free-text fields with **no internet**, for teams going somewhere off-grid. It is
a **prototype**: the code follows the documented Vosk API, but it must be tested
on a real device with a microphone before you rely on it in the field.

It is **not part of the standard FieldScribe app** and does not change it. The
normal app everyone uses stays exactly as light as it is now; this is only for
people who deliberately build the "voice" variant.

Everything runs on the device - **no audio ever leaves the phone.**

---

## What's in this folder

| File | What it is |
|------|------------|
| `voice.js` | The module: adds a 🎤 button to chosen fields and does the recognition. |
| `config.example.js` | Example settings (which fields, model path, append/replace). |
| `demo.html` | A tiny standalone page to prove it works, before touching FieldScribe. |
| `OFFLINE_VOICE.md` | This guide. |

---

## The three pieces you need

Offline speech needs three things, all served from **your own site** (so no
internet is required in the field):

1. **The Vosk browser library** - a `.js` file (and a `.wasm` it loads). Provides
   `window.Vosk`.
2. **A language model** - a `.tar.gz` archive. This is the big file (~40-50 MB
   for a "small" model). One model = one language.
3. **`voice.js`** - the little module in this folder.

---

## Step 1 - Try the demo first (needs internet the first time)

1. Get a model (see Step 2) and note its URL.
2. Open `demo.html`, and set `modelUrl` to your model.
3. Put `demo.html` and `voice.js` on any HTTPS host (GitHub Pages, Serve, or run
   a local server - a microphone only works over **https** or **localhost**).
4. Open it on a phone, tap the mic, and talk. Words should appear in the box.

This confirms the concept on your device before you integrate anything.

## Step 2 - Get a model

1. Download a **small** Vosk model for your language from
   `https://alphacephei.com/vosk/models` (look for `vosk-model-small-<lang>`).
   Small models are the right size for phones; the big ones are for servers.
2. Vosk's browser build wants a **`.tar.gz`** whose contents (the `am/`, `conf/`,
   `graph/` … folders) sit at the **top level** of the archive. The download is
   usually a `.zip`, so repackage it once:

   ```bash
   unzip vosk-model-small-en-us-0.15.zip
   cd vosk-model-small-en-us-0.15
   tar -czf ../model.tar.gz .      # note the trailing dot - archives the contents
   ```

3. You now have `model.tar.gz`. That is your `modelUrl`.

## Step 3 - Localise the library (for true offline use)

For the demo, `voice.js` loads the Vosk library from a CDN, which needs internet.
For a field build, download the library and serve it yourself:

1. Get `vosk-browser.js` (and the `.wasm` next to it) from
   `https://www.npmjs.com/package/vosk-browser` (or the same jsDelivr URL used in
   `demo.html`, saved to disk).
2. Put those files next to `voice.js` on your site.
3. Load the local copy with a `<script>` tag **before** `voice.js`.

Now the library, the model, and the module are all on your origin - nothing is
fetched from the internet at run time.

## Step 4 - Enable it in a self-hosted FieldScribe build

Only do this in **your own copy** of FieldScribe (a fork or a private build) -
not the shared app. Just before `</body>` in `index.html`, add:

```html
<script src="vosk-browser.js"></script>            <!-- the library -->
<script>
  window.FS_VOICE_CONFIG = {
    enabled: true,
    modelUrl: 'model.tar.gz',
    selector: 'textarea, input.fs-voice',   // which fields get a mic
    mode: 'append'
  };
</script>
<script src="voice.js"></script>                    <!-- the module -->
```

Then choose which fields get a microphone:
- Every notes box (a `<textarea>`) gets one automatically.
- To add one to a specific single-line field, give that field
  `class="fs-voice"`, or widen the `selector`.

Ship `model.tar.gz`, `vosk-browser.js`/`.wasm`, and `voice.js` alongside the app.

## Step 5 - Preload before an expedition

The point is offline use, so make sure it is cached before you lose signal:
open the build **once while online** (or install it to the home screen), let it
load the model once, and it will then work with no connection - exactly like the
main app's offline behaviour.

You can host this build on SciLifeLab Serve, on GitHub Pages, or even carry it on
a laptop/USB and open it locally.

---

## On-device test checklist

- [ ] Page served over **https** (or localhost) - mic is blocked otherwise.
- [ ] Tapping the mic asks for microphone permission the first time; allow it.
- [ ] Speaking shows a live "… partial text" line, then inserts the final words.
- [ ] Turn on **airplane mode**, reload, and confirm it still transcribes.
- [ ] Try it on the actual phones your team will use, not just a new flagship.

## Troubleshooting

- **"voice unavailable (vosk-browser not loaded…)"** - the library `<script>` is
  missing or after `voice.js`. It must come first.
- **"microphone blocked"** - the page isn't on https, or permission was denied.
- **Nothing happens / very slow** - the model is loading (first time only) or the
  phone is old; try a smaller model, and expect on-device recognition to be
  slower than cloud dictation.
- **iOS** - Safari supports this but is the weaker platform for on-device audio;
  Android/Chrome is smoother. Test early on the exact devices you'll use.

## Accuracy note

You do **not** need to train the model on anyone's voice. Modern small models
already handle accents reasonably. If accuracy matters more than size, a Whisper-
based build is more accurate but heavier and slower on phones - ask and we can
prototype that variant too.

## Licensing

Vosk and vosk-browser are Apache-2.0; most Vosk models are Apache-2.0 or CC-BY.
All are fine to redistribute in an open build - check the individual model's page.
