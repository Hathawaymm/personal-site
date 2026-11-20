import { readSoundMuted, subscribeSoundMuted } from "@/lib/sound-pref";

export type DeskShot = "loading" | "idle" | "desk" | "monitor";

const KEYS = [1, 2, 3, 4, 5, 6].map((index) => `/audio/desk/key_${index}.mp3`);

interface DeskState {
  context: AudioContext;
  master: GainNode;
  input: AudioNode;
  buffers: Map<string, AudioBuffer>;
  officeGain: GainNode;
  officeFilter: BiquadFilterNode;
  crtGain: GainNode;
  startedOffice: boolean;
  startedStartup: boolean;
  lastKey: string;
  voices: number;
}

let state: DeskState | null = null;
let loading: Promise<void> | null = null;
let prefetching: Promise<void> | null = null;
let unsubscribe = () => {};
const raw = new Map<string, ArrayBuffer>();

const FILES: [string, string][] = [
  ["office", "/audio/desk/office.mp3"],
  ["startup", "/audio/desk/startup.mp3"],
  ["mouseDown", "/audio/desk/mouse_down.mp3"],
  ["mouseUp", "/audio/desk/mouse_up.mp3"],
  ["type", "/audio/desk/type.mp3"],
  ...KEYS.map((url, index) => [`key${index + 1}`, url] as [string, string]),
];

/** Download while the desk page is open. Decode and playback wait for a gesture. */
export function prefetchDeskAudio() {
  if (prefetching || raw.size > 0) return;
  prefetching = Promise.all(FILES.map(async ([name, url]) => {
    const response = await fetch(url);
    if (response.ok) raw.set(name, await response.arrayBuffer());
  })).then(() => undefined).catch((error: unknown) => {
    console.warn("Desk sounds unavailable", error);
  });
}

function shotMix(shot: DeskShot) {
  if (shot === "monitor") return { gain: 0.05, frequency: 700 };
  if (shot === "desk") return { gain: 0.06, frequency: 1400 };
  return { gain: 0.09, frequency: 2800 };
}

async function decode(context: AudioContext, name: string, url: string) {
  const bytes = raw.get(name) ?? await (await fetch(url)).arrayBuffer();
  raw.set(name, bytes);
  return context.decodeAudioData(bytes.slice(0));
}

function createState(): DeskState | null {
  const Context = window.AudioContext;
  if (!Context) return null;
  const context = new Context();
  const master = context.createGain();
  master.gain.value = readSoundMuted() ? 0 : 1;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.knee.value = 8;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.12;
  compressor.connect(master);
  master.connect(context.destination);
  const officeGain = context.createGain();
  officeGain.gain.value = 0;
  const officeFilter = context.createBiquadFilter();
  officeFilter.type = "lowpass";
  officeFilter.frequency.value = 1000;
  officeFilter.connect(officeGain).connect(compressor);
  const crtGain = context.createGain();
  crtGain.gain.value = 0;
  crtGain.connect(compressor);
  // No CRT recording is loaded by the MIT app. A quiet mains hum stands in while the screen is filled.
  const hum = context.createOscillator();
  hum.type = "sine";
  hum.frequency.value = 60;
  const buzz = context.createOscillator();
  buzz.type = "triangle";
  buzz.frequency.value = 120;
  hum.connect(crtGain);
  buzz.connect(crtGain);
  hum.start();
  buzz.start();
  const next: DeskState = {
    context, master, input: compressor, buffers: new Map(), officeGain, officeFilter, crtGain,
    startedOffice: false, startedStartup: false, lastKey: "", voices: 0,
  };
  unsubscribe();
  unsubscribe = subscribeSoundMuted((muted) => {
    next.master.gain.setTargetAtTime(muted ? 0 : 1, next.context.currentTime, 0.03);
  });
  return next;
}

function armLoops(current: DeskState) {
  if (current.startedOffice && current.buffers.has("office")) startOffice(current);
  if (current.startedStartup && !current.buffers.has("startup-played") && current.buffers.has("startup")) {
    current.buffers.set("startup-played", current.buffers.get("startup")!);
    playNamed(current, "startup", 0.4);
  }
}

/** Fetch Henry's files on the first gesture. Scrolling the portfolio never hits this. */
export function unlockDeskAudio() {
  if (!state) state = createState();
  if (!state) return;
  if (state.context.state === "suspended") void state.context.resume();
  const current = state;
  current.startedOffice = true;
  current.startedStartup = true;
  if (!loading) {
    const files: [string, string][] = [
      ["office", "/audio/desk/office.mp3"],
      ["startup", "/audio/desk/startup.mp3"],
      ["mouseDown", "/audio/desk/mouse_down.mp3"],
      ["mouseUp", "/audio/desk/mouse_up.mp3"],
      ["type", "/audio/desk/type.mp3"],
      ...KEYS.map((url, index) => [`key${index + 1}`, url] as [string, string]),
    ];
    loading = Promise.all(files.map(async ([name, url]) => {
      current.buffers.set(name, await decode(current.context, name, url));
    })).then(() => {
      armLoops(current);
    }).catch((error: unknown) => {
      console.warn("Desk sounds unavailable", error);
    });
  }
  armLoops(current);
}

function startOffice(current: DeskState) {
  if (current.buffers.get("office-live")) return;
  const buffer = current.buffers.get("office");
  if (!buffer) return;
  current.buffers.set("office-live", buffer);
  const source = current.context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(current.officeFilter);
  source.start();
}

function playNamed(current: DeskState, name: string, volume: number, detune = 0) {
  const buffer = current.buffers.get(name);
  if (!buffer || current.voices > 8) return;
  const source = current.context.createBufferSource();
  const gain = current.context.createGain();
  source.buffer = buffer;
  source.detune.value = detune;
  gain.gain.value = volume;
  source.connect(gain).connect(current.input);
  current.voices += 1;
  source.onended = () => {
    current.voices = Math.max(0, current.voices - 1);
    source.disconnect();
    gain.disconnect();
  };
  source.start();
}

export function noteDeskShot(shot: DeskShot) {
  if (!state) return;
  const mix = shotMix(shot);
  const now = state.context.currentTime;
  state.officeGain.gain.setTargetAtTime(mix.gain, now, 0.15);
  state.officeFilter.frequency.setTargetAtTime(mix.frequency, now, 0.15);
  state.crtGain.gain.setTargetAtTime(shot === "monitor" ? 0.012 : 0, now, 0.1);
}

export function playDeskMouse(down: boolean) {
  if (!state || readSoundMuted()) return;
  playNamed(state, down ? "mouseDown" : "mouseUp", 0.8);
}

export function playDeskKey(key: string, repeat: boolean) {
  if (!state || readSoundMuted() || repeat) return;
  if (state.lastKey === key) return;
  state.lastKey = key;
  const index = 1 + Math.floor(Math.random() * KEYS.length);
  playNamed(state, `key${index}`, 0.8);
}

export function releaseDeskKey() {
  if (state) state.lastKey = "";
}

/** Original closed-caption tick. Henry detunes it by pitch 20, which is 2000 cents. */
export function playDeskType() {
  if (!state || readSoundMuted()) return;
  playNamed(state, "type", 0.1, 2000);
}

export function stopDeskAudio() {
  if (!state) return;
  state.officeGain.gain.value = 0;
  state.crtGain.gain.value = 0;
  state.startedOffice = false;
  try { state.context.close(); } catch { /* already closed */ }
  unsubscribe();
  unsubscribe = () => {};
  state = null;
  loading = null;
}
