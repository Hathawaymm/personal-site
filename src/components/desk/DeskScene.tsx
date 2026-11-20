"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function screenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#10241c";
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = "#b7f0c2";
    ctx.font = "600 42px 'WenQuanYi Micro Hei', sans-serif";
    ctx.fillText("ZoeOS 98", 36, 80);
    ctx.font = "24px 'WenQuanYi Micro Hei', sans-serif";
    ctx.fillStyle = "#d7ffe0";
    ctx.fillText("About_Me.exe", 36, 150);
    ctx.fillText("Projects/", 36, 190);
    ctx.fillText("Governance_Audit.sys", 36, 230);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Room({ zooming, onZoom, onDone }: { zooming: boolean; onZoom: () => void; onDone: () => void }) {
  const fired = useRef(false);
  const zoom = useRef(0);
  const screen = useMemo(() => screenTexture(), []);

  useFrame((state, delta) => {
    const goal = zooming ? 1 : 0;
    zoom.current = THREE.MathUtils.damp(zoom.current, goal, 2.4, delta);
    const rest = new THREE.Vector3(state.pointer.x * 0.45, 1.45 + state.pointer.y * 0.18, 4.5);
    const close = new THREE.Vector3(0, 1.22, 1.05);
    state.camera.position.lerpVectors(rest, close, zoom.current);
    state.camera.lookAt(0, 1.05, -0.2);
    if (zooming && zoom.current > 0.94 && !fired.current) {
      fired.current = true;
      onDone();
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#1a120e" />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.12, 1.8]} />
        <meshStandardMaterial color="#8a5a32" roughness={0.7} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 0.34, 0.55]}>
          <boxGeometry args={[0.12, 0.68, 0.12]} />
          <meshStandardMaterial color="#5c3b22" />
        </mesh>
      ))}
      <group position={[0, 1.15, -0.35]}>
        <mesh>
          <boxGeometry args={[1.35, 0.9, 0.08]} />
          <meshStandardMaterial color="#2a241e" />
        </mesh>
        <mesh position={[0, 0.02, 0.05]} onClick={(event) => { event.stopPropagation(); onZoom(); }}>
          <planeGeometry args={[1.15, 0.7]} />
          <meshStandardMaterial map={screen} emissive="#143028" emissiveIntensity={0.45} />
        </mesh>
        <mesh position={[0, -0.58, 0.12]}>
          <boxGeometry args={[0.16, 0.28, 0.16]} />
          <meshStandardMaterial color="#3a3128" />
        </mesh>
      </group>
      <group position={[0.15, 0.86, 0.25]}>
        {[-0.45, -0.15, 0.15, 0.45].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.22, 0.06, 0.22]} />
            <meshStandardMaterial color="#d8c7a4" />
          </mesh>
        ))}
      </group>
      <mesh position={[1.15, 0.86, 0.15]}>
        <sphereGeometry args={[0.08, 16, 12]} />
        <meshStandardMaterial color="#c9c2b6" />
      </mesh>
      <mesh position={[-1.2, 0.9, 0.2]}>
        <cylinderGeometry args={[0.12, 0.1, 0.22, 16]} />
        <meshStandardMaterial color="#f2efe6" />
      </mesh>
      <mesh position={[1.25, 0.84, -0.25]}>
        <boxGeometry args={[0.42, 0.05, 0.3]} />
        <meshStandardMaterial color="#efe6d4" />
      </mesh>
      <group position={[-1.35, 0.95, -0.4]}>
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.16, 12]} />
          <meshStandardMaterial color="#6d4a32" />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial color="#2f6b45" />
        </mesh>
      </group>
      <group position={[1.55, 1.35, -0.55]}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
          <meshStandardMaterial color="#c2b6a2" />
        </mesh>
        <mesh position={[0.12, 0.05, 0]} rotation={[0, 0, -0.6]}>
          <coneGeometry args={[0.18, 0.22, 16]} />
          <meshStandardMaterial color="#f3d7a1" emissive="#e7b56a" emissiveIntensity={0.4} />
        </mesh>
        <pointLight position={[0.05, 0.02, 0.3]} intensity={6} distance={4} color="#ffd7a1" />
      </group>
    </group>
  );
}

export default function DeskScene({ zooming, onZoom, onEnter }: { zooming: boolean; onZoom: () => void; onEnter: () => void }) {
  return (
    <Canvas camera={{ position: [0.2, 1.45, 4.5], fov: 38 }} dpr={[1, 1.5]}>
      <color attach="background" args={["#120e0c"]} />
      <fog attach="fog" args={["#120e0c", 6, 12]} />
      <ambientLight intensity={0.22} />
      <Room zooming={zooming} onZoom={onZoom} onDone={onEnter} />
    </Canvas>
  );
}
