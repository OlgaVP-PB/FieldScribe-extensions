# FieldScribe Photo Matcher

Links your field **photos** to FieldScribe **samples** by the moment each was
taken - using the photo's built-in EXIF timestamp (and GPS when present). FieldScribe
itself does not store images (too heavy); your phone's camera roll already does.
This tool reconnects the two afterwards, on a laptop.

**Everything runs in your browser. No photo is uploaded anywhere.** Open
`index.html` and work entirely offline if you like.

## Why

A photo carries a digital trace of *when* (and often *where*) it was taken, and
FieldScribe stamps every record with a time and GPS. So a photo taken while you
were handling a sample can be matched to that sample by comparing the two times.
A web app can't browse your camera roll or produce file paths, but once the
photos are off the phone, matching them by time is straightforward - which is
what this does.

## How to use

1. In FieldScribe, tap **Back up all data** and keep the JSON file.
2. Copy your photos off the phone to a folder on the computer.
3. Open `index.html`, load the backup JSON (step 1), select the photos (step 2).
4. Set the **time window** (how many minutes apart a photo and a sample can be),
   and a **clock offset** if the phone's clock and the records differ (time zone,
   or a separate camera's drift). Tick **Use GPS** to prefer the spatially closest
   sample when both have coordinates.
5. Click **Match photos to samples**, review the table, and **Download links
   (CSV)** - one row per photo, with its matched Sample ID, the time gap, and the
   distance.

## Notes and limits

- Works best when the **photos and the records come from the same phone** (same
  clock). A separate camera needs a one-time clock-offset correction (the offset
  field).
- Reads **JPEG** EXIF (what phones produce). HEIC/PNG without EXIF time can't be
  matched automatically.
- Record times come from the **"Back up all data"** JSON (which has the exact save
  time); the manifest CSV only has a collection *date*, so use the backup.
- Matching is a convenience: eyeball the result and adjust the window/offset until
  it looks right before trusting the CSV.

## Verification

The EXIF reader was tested against a generated JPEG with a known
`DateTimeOriginal` and GPS, and read both back exactly. The in-browser matching
and CSV export should still be tried on a real set of your own photos.

---
*FieldScribe extension. Built with AI assistance from Claude (Anthropic).*
