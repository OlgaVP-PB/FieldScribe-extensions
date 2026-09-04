/*
 * FieldScribe - OPTIONAL offline voice input (Vosk).
 * =================================================
 * This file is NOT loaded by the standard FieldScribe app, and does nothing
 * until you deliberately enable it. It is for teams who need to dictate into
 * the free-text fields with NO internet - e.g. an expedition to somewhere
 * off-grid. See OFFLINE_VOICE.md for the full setup.
 *
 * What it does: adds a small microphone button to each field you choose, runs
 * speech recognition entirely on the device (Vosk, compiled to WebAssembly),
 * and types the recognised words into the field. No audio ever leaves the phone.
 *
 * Requires, all served from the SAME site (so it works offline):
 *   1. the vosk-browser library (its .js and .wasm), loaded BEFORE this file;
 *   2. a Vosk model archive (a .tar.gz), path given in the config below.
 *
 * Honesty note: this module is written against the documented vosk-browser API
 * but must be tested on a real device with a microphone (see the guide). It is
 * an add-on, not part of the core app, so it can never affect the standard build.
 */
(function () {
  'use strict';

  // ---- configuration (override via window.FS_VOICE_CONFIG before this script) ----
  var CFG = Object.assign({
    enabled: true,
    // Path to a vosk-browser-compatible model archive (.tar.gz). See the guide.
    modelUrl: 'voice/model.tar.gz',
    // Which fields get a mic button. Default: every <textarea>, plus any input
    // you tag with class="fs-voice". Broaden/narrow this as you like.
    selector: 'textarea, input.fs-voice',
    // 'append' adds to what's already typed; 'replace' overwrites the field.
    mode: 'append',
    // Cosmetic label shown in the tiny status line.
    lang: 'model'
  }, window.FS_VOICE_CONFIG || {});

  if (!CFG.enabled) return;

  // ---- minimal styling, injected so no extra CSS file is needed ----
  var css = '' +
    '.fs-voice-btn{display:inline-flex;align-items:center;justify-content:center;' +
    'width:2.1rem;height:2.1rem;margin-left:.35rem;border:none;border-radius:8px;' +
    'background:#A7C947;color:#02363c;font-size:1.05rem;cursor:pointer;vertical-align:middle;}' +
    '.fs-voice-btn.rec{background:#c0392b;color:#fff;animation:fsvpulse 1s infinite;}' +
    '.fs-voice-status{font-size:.75rem;color:#6A736F;margin-top:.2rem;min-height:1em;}' +
    '@keyframes fsvpulse{50%{opacity:.55;}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---- lazy model load (only the first time a mic is tapped) ----
  var modelPromise = null;
  function getModel() {
    if (!window.Vosk || !window.Vosk.createModel) {
      return Promise.reject(new Error('vosk-browser not loaded before voice.js'));
    }
    if (!modelPromise) modelPromise = window.Vosk.createModel(CFG.modelUrl);
    return modelPromise;
  }

  // Only one field records at a time. This holds the live session, if any.
  var active = null; // { field, btn, status, stop() }

  function setStatus(el, msg) { if (el) el.textContent = msg || ''; }

  function insertText(field, text) {
    text = (text || '').trim();
    if (!text) return;
    if (CFG.mode === 'replace') {
      field.value = text;
    } else {
      var cur = field.value || '';
      field.value = cur ? (cur.replace(/\s+$/, '') + ' ' + text) : text;
    }
    // let the app react (validation, autosave, etc.)
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function startRecording(field, btn, status) {
    if (active) { active.stop(); return; }
    setStatus(status, 'loading model…');
    btn.disabled = true;

    var model;
    try { model = await getModel(); }
    catch (e) { setStatus(status, 'voice unavailable (' + e.message + ')'); btn.disabled = false; return; }

    var mediaStream, audioCtx, source, processor, recognizer;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setStatus(status, 'microphone blocked - allow mic access'); btn.disabled = false; return;
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    recognizer = new model.KaldiRecognizer(audioCtx.sampleRate);
    recognizer.setWords(true);

    recognizer.on('result', function (m) {
      if (m && m.result && m.result.text) insertText(field, m.result.text);
    });
    recognizer.on('partialresult', function (m) {
      if (m && m.result) setStatus(status, m.result.partial ? ('… ' + m.result.partial) : 'listening…');
    });

    source = audioCtx.createMediaStreamSource(mediaStream);
    // ScriptProcessorNode is deprecated but still the most portable path across
    // mobile browsers; vosk-browser accepts the raw AudioBuffer.
    processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = function (ev) {
      try { recognizer.acceptWaveform(ev.inputBuffer); } catch (e) { /* ignore frame */ }
    };
    source.connect(processor);
    processor.connect(audioCtx.destination);

    btn.disabled = false;
    btn.classList.add('rec');
    btn.title = 'Stop dictation';
    setStatus(status, 'listening… tap the mic again to stop');

    active = {
      field: field, btn: btn, status: status,
      stop: function () {
        try { processor.disconnect(); source.disconnect(); } catch (e) {}
        try { mediaStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
        try { audioCtx.close(); } catch (e) {}
        try { if (recognizer.remove) recognizer.remove(); } catch (e) {}
        btn.classList.remove('rec'); btn.title = 'Dictate';
        setStatus(status, '');
        active = null;
      }
    };
  }

  function attach(field) {
    if (field.dataset.fsVoice === '1') return;      // already wired
    field.dataset.fsVoice = '1';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fs-voice-btn';
    btn.textContent = '🎤';
    btn.title = 'Dictate';
    btn.setAttribute('aria-label', 'Dictate into this field');

    var status = document.createElement('div');
    status.className = 'fs-voice-status';

    // place the button right after the field, and the status line under it
    if (field.parentNode) {
      field.insertAdjacentElement('afterend', btn);
      btn.insertAdjacentElement('afterend', status);
    }
    btn.addEventListener('click', function () {
      if (active && active.field === field) { active.stop(); return; }
      if (active) active.stop();
      startRecording(field, btn, status);
    });
  }

  function scan() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[FS voice] microphone API unavailable in this browser.');
      return;
    }
    document.querySelectorAll(CFG.selector).forEach(attach);
  }

  // Initial pass + watch for fields the app renders later (forms are dynamic).
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    scan();
    var mo = new MutationObserver(function () { scan(); });
    mo.observe(document.body, { childList: true, subtree: true });
  });
})();
