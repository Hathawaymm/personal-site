"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChibiScene, type ChibiSceneApi, type RuntimeEvent, type ScenePointerEvent } from "@chibi3d/runtime";
import { tx, type KeySkill } from "@/data/portfolio-data";
import { useCareer } from "../career-context";
import { readSoundMuted } from "@/lib/sound-pref";
import { useLang } from "../lang";
import { createKeyInput, isTypingTarget } from "./input";
import { createKeyboardMotion } from "./motion";
import { createKeyboardScene, resolveKeyboardAsset, type KeyboardSkill } from "./scene";
import { useAdaptiveGraphics } from "./use-adaptive-graphics";
import { useKeyboardSounds } from "./use-keyboard-sounds";

const SceneCanvas = memo(ChibiScene);
const SCENE_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100dvh",
  zIndex: 1,
};

const COLORS = ["#e4b15a", "#7ec8c3", "#e07a5f", "#9bb7d4", "#c9a27a", "#8fb38a"];
const LEGENDS: Record<string, string> = {
  pmp: "PMP", agile: "Agile", gates: "Gate", audit: "Audit", oms: "OMS", edi: "EDI",
  rpa: "RPA", feishu: "Feishu", crm: "CRM", risk: "Risk", data: "Data", agent: "Agent",
  vibe: "Vibe", next: "Next", cursor: "Cursor", delivery: "Ship", wms: "WMS", erp: "ERP",
};

function legendIcon(text: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 220;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.clearRect(0, 0, 512, 220);
  ctx.fillStyle = "#24180f";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = 128;
  ctx.font = `700 ${size}px Georgia, serif`;
  while (ctx.measureText(text).width > 470 && size > 42) {
    size -= 8;
    ctx.font = `700 ${size}px Georgia, serif`;
  }
  ctx.fillText(text, 256, 110);
  return canvas.toDataURL("image/png");
}

function sceneSkills(skills: (KeySkill & { legend?: string })[]): KeyboardSkill[] {
  return skills.map((skill, index) => ({
    name: skill.id,
    label: skill.legend || LEGENDS[skill.id] || skill.label.en,
    shortDescription: skill.proof.en,
    color: COLORS[index % COLORS.length],
    keyboardColor: COLORS[index % COLORS.length],
    icon: legendIcon(skill.legend || LEGENDS[skill.id] || skill.label.en) || `/images/keys/${skill.id}.png`,
  }));
}

export default function ZoeKeyboard() {
  const { lang } = useLang();
  const api = useRef<ChibiSceneApi>(null);
  const [failed, setFailed] = useState(false);
  const motion = useRef<ReturnType<typeof createKeyboardMotion> | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [section, setSection] = useState("hero");
  const { keyboardSkills } = useCareer();
  const playSound = useKeyboardSounds();
  const scene = useMemo(() => createKeyboardScene(sceneSkills(keyboardSkills), 6), [keyboardSkills]);
  const { settings: graphics, markActive } = useAdaptiveGraphics(ready);
  const environment = useMemo(() => ({
    ...scene.document.environment,
    shadows: graphics.shadows,
    softShadows: graphics.softShadows,
    ao: graphics.ao,
    bloom: graphics.bloom,
    contactShadows: false,
    vignette: false,
    preset: graphics.lighting ? scene.document.environment.preset : null,
  }), [scene, graphics]);
  const dpr = useMemo<[number, number]>(() => [1, Math.min(graphics.dpr, 1.15)], [graphics.dpr]);
  const input = useMemo(() => createKeyInput(scene.keys, scene.columns), [scene]);
  const visibleLabel = useRef<string | null>(null);
  const held = useRef<typeof scene.keys>([]);

  useEffect(() => input.subscribe((key, pressed) => {
    markActive();
    api.current?.transitionNodeTo(key.nodeId, pressed ? key.pressedStateId : "base", { duration: 0.1, ease: "easeInOut" });
    api.current?.setMaterial(key.materialId, {
      emissive: scene.document.materials[key.materialId].color,
      emissiveIntensity: pressed ? 0.7 : 0,
    });
    held.current = held.current.filter((item) => item !== key);
    if (pressed) held.current.push(key);
    const shown = held.current.at(-1) ?? null;
    const labelId = shown?.labelId ?? scene.defaultLabelId;
    if (labelId !== (visibleLabel.current ?? scene.defaultLabelId)) {
      api.current?.setNodeVisible(visibleLabel.current ?? scene.defaultLabelId, false);
      if (shown) api.current?.setNodeVisible(labelId, true);
    }
    api.current?.setNodeVisible(scene.labelsId, Boolean(shown));
    visibleLabel.current = shown?.labelId ?? null;
    setSelectedId(shown?.skill.name ?? null);
    if (!readSoundMuted()) playSound(pressed, Math.max(0, scene.keys.indexOf(key)));
  }), [input, scene, playSound, markActive]);

  const onPointerEvent = useCallback((event: ScenePointerEvent) => {
    const pointer = `pointer:${event.pointerId}`;
    if (event.type === "hoverEnter" && event.pointerType === "mouse") input.press("hover", event.nodeId);
    if (event.type === "hoverExit") input.release("hover", event.nodeId);
    if (event.type === "pointerDown") input.press(pointer, event.nodeId);
    if (event.type === "pointerUp" || event.type === "pointerCancel") input.release(pointer);
  }, [input]);

  useEffect(() => {
    if (!ready || !api.current) return;
    const controller = createKeyboardMotion(api.current, scene, (next) => {
      input.releaseAll();
      setSection(next);
    }, markActive);
    motion.current = controller;
    controller.reveal();
    return () => {
      controller.dispose();
      motion.current = null;
    };
  }, [ready, scene, input, markActive]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      const key = input.shortcuts.get(event.code);
      if (key) input.press(`key:${event.code}`, key.nodeId);
    };
    const up = (event: KeyboardEvent) => input.release(`key:${event.code}`);
    const release = () => input.releaseAll();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", release);
      release();
    };
  }, [input]);

  const skill = keyboardSkills.find((item) => item.id === selectedId) ?? keyboardSkills[0];
  const onError = useCallback((error: Error) => {
    setFailed(true);
    console.warn("Keyboard scene unavailable", error);
  }, []);

  if (failed) return null;

  return (
    <>
      <SceneCanvas
        document={scene.document}
        environment={environment}
        resolveAsset={resolveKeyboardAsset}
        api={api}
        style={SCENE_STYLE}
        dpr={dpr}
        transparent
        interactive
        orbit={false}
        orthographic
        pointerTargets={scene.pointerTargets}
        onPointerEvent={onPointerEvent}
        onLoad={() => { if (!failed) setReady(true); }}
        onError={onError}
        onEvent={(event: RuntimeEvent) => { if (event.type === "contextLost") onError(new Error("WebGL context lost")); }}
      />
      {section === "skills" && (
        <div className="pointer-events-none fixed right-4 bottom-4 z-30 hidden w-72 rounded-2xl border border-[#e4b15a]/30 bg-[#101218]/90 p-4 text-[#f4ead8] backdrop-blur md:block">
          <p className="text-[11px] tracking-[0.16em] text-[#e4b15a] uppercase">{skill ? tx(skill.title, lang) : ""}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#f4ead8]/80">{skill ? tx(skill.proof, lang) : ""}</p>
        </div>
      )}
    </>
  );
}
