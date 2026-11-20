"use client";

import { useCallback, useEffect, useRef } from "react";
import { readSoundMuted, subscribeSoundMuted } from "@/lib/sound-pref";

const MAX_VOICES = 4;

type Slot = "press" | "release";

interface Voice {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

interface SoundState {
  context: AudioContext;
  master: GainNode;
  input: AudioNode;
  buffers: Partial<Record<Slot, AudioBuffer>>;
  voices: Voice[];
}

/** Exact Naresh press/release samples, at his gain of 0.4. Rate shifts a few cents per key. */
export function useKeyboardSounds() {
  const muted = useRef(false);
  const audio = useRef<SoundState | null>(null);

  useEffect(() => {
    muted.current = readSoundMuted();
    return subscribeSoundMuted((value) => {
      muted.current = value;
      const state = audio.current;
      if (state) state.master.gain.setTargetAtTime(value ? 0 : 1, state.context.currentTime, 0.02);
    });
  }, []);

  const ensure = useCallback(() => {
    if (audio.current) return audio.current;
    const Context = window.AudioContext;
    if (!Context) return null;
    const context = new Context();
    const master = context.createGain();
    master.gain.value = muted.current ? 0 : 1;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.1;
    compressor.connect(master);
    master.connect(context.destination);
    const state: SoundState = { context, master, input: compressor, buffers: {}, voices: [] };
    audio.current = state;
    void Promise.all((["press", "release"] as const).map(async (name) => {
      const response = await fetch(`/assets/keycap-sounds/${name}.mp3`);
      if (!response.ok) throw new Error(`Keyboard sound: HTTP ${response.status}`);
      state.buffers[name] = await context.decodeAudioData(await response.arrayBuffer());
    })).catch((error: unknown) => {
      console.warn("Keyboard sounds unavailable", error);
    });
    return state;
  }, []);

  useEffect(() => {
    const unlock = () => {
      const state = ensure();
      if (state && state.context.state === "suspended") void state.context.resume();
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, [ensure]);

  return useCallback((pressed: boolean, keyIndex = 0) => {
    if (muted.current) return;
    const state = ensure();
    if (!state) return;
    if (state.context.state === "suspended") void state.context.resume();
    const buffer = state.buffers[pressed ? "press" : "release"];
    if (!buffer) return;
    while (state.voices.length >= MAX_VOICES) {
      const oldest = state.voices.shift();
      if (!oldest) break;
      oldest.gain.gain.setTargetAtTime(0.0001, state.context.currentTime, 0.01);
      window.setTimeout(() => { try { oldest.source.stop(); } catch { /* already ended */ } }, 40);
    }
    const source = state.context.createBufferSource();
    const gain = state.context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = 0.94 + (Math.abs(keyIndex) % 8) * 0.018;
    gain.gain.value = 0.4;
    source.connect(gain).connect(state.input);
    const voice = { source, gain };
    state.voices.push(voice);
    source.onended = () => {
      state.voices = state.voices.filter((item) => item !== voice);
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }, [ensure]);
}
