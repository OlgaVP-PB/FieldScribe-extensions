/*
 * Example configuration for the FieldScribe offline-voice module.
 * Copy this to config.js (or paste the object inline before voice.js) and edit.
 * If you load voice.js without any config, these same defaults apply.
 */
window.FS_VOICE_CONFIG = {
  enabled: true,

  // Path (on YOUR site) to a vosk-browser-compatible model archive (.tar.gz).
  // See OFFLINE_VOICE.md for how to get one. Keep it on the same origin so it
  // works with no internet.
  modelUrl: 'model.tar.gz',

  // Which fields get a microphone button.
  //   'textarea'          -> all multi-line note fields
  //   'input.fs-voice'    -> any field you tag with class="fs-voice"
  // Broaden or narrow this as you like. Avoid putting it on ID/barcode fields -
  // those are better handled by the camera scanner.
  selector: 'textarea, input.fs-voice',

  // 'append' adds spoken text to whatever is already in the field;
  // 'replace' overwrites the field with the spoken text.
  mode: 'append'
};
