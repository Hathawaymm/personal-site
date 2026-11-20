"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { keyboardSkills, shellCopy, tx, type KeySkill } from "@/data/portfolio-data";
import { useLang } from "../lang";

const COLS = 6;

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function keyTexture(label: string, active: boolean): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.fillStyle = active ? "#f0c27a" : "#2a2622";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = active ? "#fff4df" : "#5c5146";
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, 232, 232);
  ctx.fillStyle = active ? "#1a1208" : "#f6efe2";
  ctx.font = "600 64px 'WenQuanYi Micro Hei', 'Droid Sans Fallback', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 128, 136);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function Keycap({ skill, position, active, label, onPick }: { skill: KeySkill; position: [number, number, number]; active: boolean; label: string; onPick: (id: string) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const top = useMemo(() => {
    const map = keyTexture(label, active);
    return new THREE.MeshStandardMaterial({
      map,
      roughness: 0.42,
      metalness: 0.08,
      emissive: new THREE.Color(active ? "#8a5a18" : "#000000"),
      emissiveIntensity: active ? 0.35 : 0,
    });
  }, [label, active]);
  const side = useMemo(
    () => new THREE.MeshStandardMaterial({ color: active ? "#c99645" : "#3a342c", roughness: 0.55, metalness: 0.08 }),
    [active],
  );
  useEffect(() => () => {
    top.map?.dispose();
    top.dispose();
    side.dispose();
  }, [top, side]);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const target = active ? 0.05 : 0.16;
    mesh.position.y = THREE.MathUtils.damp(mesh.position.y, target, 14, delta);
  });

  return (
    <group position={position}>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial color="#14120f" />
      </mesh>
      <mesh
        ref={ref}
        position={[0, 0.16, 0]}
        castShadow
        onPointerOver={(event) => {
          event.stopPropagation();
          onPick(skill.id);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onPick(skill.id);
        }}
      >
        <boxGeometry args={[0.84, 0.22, 0.84]} />
        <primitive object={[side, side, top, side, side, side]} attach="material" />
      </mesh>
    </group>
  );
}

function Board({ activeId, onPick, lang }: { activeId: string; onPick: (id: string) => void; lang: "zh" | "en" }) {
  return (
    <group>
      <mesh position={[0, -0.22, 0.35]} receiveShadow>
        <boxGeometry args={[7.1, 0.18, 3.6]} />
        <meshStandardMaterial color="#1b1714" metalness={0.2} roughness={0.6} />
      </mesh>
      {keyboardSkills.map((skill, index) => {
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const x = (col - (COLS - 1) / 2) * 1.08;
        const z = (row - 1) * 1.08;
        return (
          <Keycap
            key={skill.id}
            skill={skill}
            position={[x, 0, z]}
            active={skill.id === activeId}
            label={tx(skill.label, lang)}
            onPick={onPick}
          />
        );
      })}
    </group>
  );
}

class WebGLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function FlatKeys({ activeId, onPick }: { activeId: string; onPick: (id: string) => void }) {
  const { lang } = useLang();
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {keyboardSkills.map((skill) => {
        const active = skill.id === activeId;
        return (
          <button
            key={skill.id}
            type="button"
            aria-pressed={active}
            onMouseEnter={() => onPick(skill.id)}
            onFocus={() => onPick(skill.id)}
            onClick={() => onPick(skill.id)}
            className={`h-14 rounded-md border text-sm font-semibold shadow-[0_6px_0_#120e0a] transition-transform ${
              active ? "translate-y-1 border-[#e4b15a] bg-[#e4b15a] text-[#1a1208] shadow-none" : "border-white/10 bg-[#2a2622] text-[#f6efe2]"
            }`}
          >
            {tx(skill.label, lang)}
          </button>
        );
      })}
    </div>
  );
}

export default function SkillsKeyboard() {
  const { lang } = useLang();
  const [activeId, setActiveId] = useState(keyboardSkills[0]?.id ?? "pmp");
  const [webgl] = useState(hasWebGL);
  const skill = keyboardSkills.find((item) => item.id === activeId) ?? keyboardSkills[0];

  const flat = <FlatKeys activeId={activeId} onPick={setActiveId} />;

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.7fr)]">
      <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e13]">
        {webgl ? (
          <WebGLBoundary fallback={<div className="p-4">{flat}</div>}>
            <Canvas camera={{ position: [0, 6.4, 3.6], fov: 32 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: false }}>
              <color attach="background" args={["#0c0e13"]} />
              <ambientLight intensity={0.55} />
              <spotLight position={[3, 7, 4]} intensity={2.4} angle={0.55} penumbra={0.7} color="#ffe0b5" />
              <pointLight position={[-3, 3, -2]} intensity={0.6} color="#7ec8c3" />
              <Board activeId={activeId} onPick={setActiveId} lang={lang} />
            </Canvas>
          </WebGLBoundary>
        ) : (
          <div className="p-4">
            <p className="mb-3 text-xs text-[#f4ead8]/60">{tx(shellCopy.webglFallback, lang)}</p>
            {flat}
          </div>
        )}
      </div>
      <aside className="flex flex-col justify-between rounded-2xl border border-[#e4b15a]/30 bg-[#12141b] p-5 text-[#f4ead8]" aria-live="polite">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-[#e4b15a] uppercase">{tx(shellCopy.keyboardHint, lang)}</p>
          <h3 className="font-display mt-3 text-3xl">{skill ? tx(skill.title, lang) : tx(shellCopy.hudIdle, lang)}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#f4ead8]/75">{skill ? tx(skill.description, lang) : ""}</p>
        </div>
        <p className="mt-6 border-l-2 border-[#e4b15a] pl-3 text-sm leading-relaxed text-[#f6efe2]">{skill ? tx(skill.proof, lang) : ""}</p>
      </aside>
    </div>
  );
}
