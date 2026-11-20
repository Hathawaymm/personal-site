"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import gsap from "gsap";
import { useLang } from "../portfolio/lang";
import { noteDeskShot, playDeskKey, playDeskMouse, playDeskType, releaseDeskKey, unlockDeskAudio } from "./desk-audio";

const MODELS = [
  ["/models/study/environment.glb", "/models/study/baked_environment.jpg"],
  ["/models/study/decor.glb", "/models/study/baked_decor.jpg"],
  ["/models/study/computer.glb", "/models/study/baked_computer.jpg"],
] as const;

type Shot = "loading" | "idle" | "desk" | "monitor";

const SHOTS: Record<Shot, { pos: THREE.Vector3; look: THREE.Vector3 }> = {
  loading: { pos: new THREE.Vector3(-35000, 35000, 35000), look: new THREE.Vector3(0, -5000, 0) },
  idle: { pos: new THREE.Vector3(-20000, 9000, 20000), look: new THREE.Vector3(0, -1000, 0) },
  desk: { pos: new THREE.Vector3(0, 1800, 5500), look: new THREE.Vector3(0, 500, 0) },
  monitor: { pos: new THREE.Vector3(0, 950, 2000), look: new THREE.Vector3(0, 950, 0) },
};

const SCREEN = new THREE.Vector3(0, 950, 255);
const SCREEN_TILT = -3 * THREE.MathUtils.DEG2RAD;

export default function BakedStudy({
  intent,
  onReady,
}: {
  intent: "auto" | "desk" | "monitor";
  onReady: () => void;
}) {
  const { lang } = useLang();
  const mount = useRef<HTMLDivElement>(null);
  const go = useRef<(shot: Shot, duration?: number) => void>(() => {});
  const surfaceClick = useRef<(x: number, y: number) => void>(() => {});
  const shot = useRef<Shot>("loading");
  const [boot, setBoot] = useState(true);
  const [lineCount, setLineCount] = useState(1);
  const [current, setCurrent] = useState<Shot>("loading");
  const [hint, setHint] = useState(true);
  const intentRef = useRef(intent);
  intentRef.current = intent;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const lines = lang === "zh"
    ? ["ZoeOS 98 BIOS", "内存检查 ........ 640K 正常", "装入书房光贴图", "显示器 · 键盘 · 书桌", "准备进入房间"]
    : ["ZoeOS 98 BIOS", "Memory check ........ 640K OK", "Mounting baked study", "Display, keyboard, desk", "Entering the room"];

  useEffect(() => {
    const timers = [1, 2, 3, 4, 5].map((count, index) => window.setTimeout(() => setLineCount(count), index * 320));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [lang]);

  useEffect(() => {
    if (lineCount > 1) playDeskType();
  }, [lineCount]);

  useEffect(() => {
    if (intent === "auto") return;
    go.current(intent, intent === "monitor" ? 2.1 : 1.4);
  }, [intent]);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;
    const scene = new THREE.Scene();
    const cssScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 10, 900000);
    const camPos = SHOTS.loading.pos.clone();
    const camLook = SHOTS.loading.look.clone();
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height);
    renderer.setClearColor(0x100e0c, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    host.appendChild(renderer.domElement);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(width, height);
    cssRenderer.domElement.style.position = "absolute";
    cssRenderer.domElement.style.inset = "0";
    cssRenderer.domElement.style.pointerEvents = "none";
    host.appendChild(cssRenderer.domElement);

    const screenHit = new THREE.Mesh(
      new THREE.PlaneGeometry(1500, 1150),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    screenHit.position.set(0, 950, 420);
    screenHit.rotation.x = SCREEN_TILT;
    scene.add(screenHit);

    let cssObject: CSS3DObject | null = null;
    let screenEl: HTMLIFrameElement | null = null;
    let occluder: THREE.Mesh | null = null;
    const mountScreen = () => {
      if (cssObject) return;
      const shell = document.createElement("div");
      shell.style.width = "1280px";
      shell.style.height = "1024px";
      shell.style.position = "relative";
      shell.style.background = "#1d2e2f";
      const screen = document.createElement("iframe");
      screenEl = screen;
      screen.src = "/desk/os";
      screen.title = "ZoeOS 98";
      screen.style.width = "1280px";
      screen.style.height = "1024px";
      screen.style.border = "0";
      screen.style.background = "#6e8f72";
      screen.style.pointerEvents = "none";
      const scan = document.createElement("div");
      scan.style.position = "absolute";
      scan.style.inset = "0";
      scan.style.pointerEvents = "none";
      scan.style.background = "repeating-linear-gradient(to bottom, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)";
      scan.style.boxShadow = "inset 0 0 80px rgba(0,0,0,0.45)";
      shell.append(screen, scan);
      cssObject = new CSS3DObject(shell);
      cssObject.position.copy(SCREEN);
      cssObject.rotation.x = SCREEN_TILT;
      cssScene.add(cssObject);

      const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide });
      material.blending = THREE.NoBlending;
      occluder = new THREE.Mesh(new THREE.PlaneGeometry(1280, 1024), material);
      occluder.position.copy(SCREEN);
      occluder.rotation.x = SCREEN_TILT;
      scene.add(occluder);
    };

    const loader = new GLTFLoader();
    const textures = new THREE.TextureLoader();
    let disposed = false;
    let modelsReady = false;
    void Promise.all(MODELS.map(async ([modelUrl, textureUrl]) => {
      const [gltf, texture] = await Promise.all([loader.loadAsync(modelUrl), textures.loadAsync(textureUrl)]);
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      const material = new THREE.MeshBasicMaterial({ map: texture });
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.scale.set(900, 900, 900);
          child.material = material;
        }
      });
      scene.add(gltf.scene);
    })).then(() => {
      modelsReady = true;
      if (!disposed) onReadyRef.current();
    }).catch((error: unknown) => {
      console.warn("Study models failed", error);
      modelsReady = true;
      if (!disposed) onReadyRef.current();
    });

    const mouse = { x: width / 2, y: height / 2 };
    const parallax = { x: 0, y: 0 };
    let active: Shot = "loading";
    let tweening = false;
    const started = performance.now();
    let booted = false;

    const applyCamera = () => {
      camera.position.copy(camPos);
      camera.lookAt(camLook);
    };
    const travel = (next: Shot, duration = 1.6) => {
      if (disposed || active === next) return;
      if (next === "desk" || next === "monitor") mountScreen();
      active = next;
      shot.current = next;
      setCurrent(next);
      noteDeskShot(next);
      tweening = true;
      const target = SHOTS[next];
      gsap.to(camPos, {
        x: target.pos.x, y: target.pos.y, z: target.pos.z, duration, ease: "power3.inOut", overwrite: true,
        onComplete: () => { tweening = false; },
      });
      gsap.to(camLook, {
        x: target.look.x, y: target.look.y, z: target.look.z, duration, ease: "power3.inOut", overwrite: true,
      });
    };
    go.current = travel;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const monitorBox = new THREE.Box3(new THREE.Vector3(-1100, 350, -100), new THREE.Vector3(1100, 1700, 1100));
    const onSurface = (clientX: number, clientY: number) => {
      if (active === "loading" || active === "monitor") return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      if (active === "idle") {
        travel("desk", 1.5);
        return;
      }
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.ray.intersectBox(monitorBox, new THREE.Vector3()) !== null;
      travel(hit ? "monitor" : "idle", hit ? 2 : 1.4);
    };
    surfaceClick.current = onSurface;
    const onMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    window.addEventListener("pointermove", onMove);

    const unlock = () => {
      unlockDeskAudio();
      noteDeskShot(active);
    };
    window.addEventListener("pointerdown", unlock, true);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; kind?: string; key?: string; repeat?: boolean } | null;
      if (!data) return;
      if (data.type === "leave-monitor") travel("desk", 1.2);
      if (data.type === "desk-sound" && data.kind === "mouse-down") playDeskMouse(true);
      if (data.type === "desk-sound" && data.kind === "mouse-up") playDeskMouse(false);
      if (data.type === "desk-sound" && data.kind === "keydown") playDeskKey(data.key ?? "", Boolean(data.repeat));
      if (data.type === "desk-sound" && data.kind === "keyup") releaseDeskKey();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && active === "monitor") travel("desk", 1.2);
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKey);

    const startedAt = performance.now();
    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      if (document.hidden) return;
      const elapsed = (performance.now() - startedAt) / 1000;
      if (!booted && modelsReady && performance.now() - started > 1800) {
        booted = true;
        setBoot(false);
        setHint(true);
        const requested = intentRef.current;
        travel(requested === "auto" ? "idle" : requested, requested === "monitor" ? 2.4 : 2.6);
      }
      if (active === "idle" && !tweening) {
        const t = elapsed * 1000;
        camPos.x = Math.sin((t + 19000) * 0.00008) * SHOTS.idle.pos.x;
        camPos.y = Math.sin((t + 1000) * 0.000004) * 800 + SHOTS.idle.pos.y;
        camPos.z = SHOTS.idle.pos.z;
        camLook.copy(SHOTS.idle.look);
      }
      if (active === "desk" && !tweening) {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        parallax.x += ((mouse.x - w / 2) * 0.35 - parallax.x) * 0.05;
        parallax.y += ((h - mouse.y) * 0.2 - parallax.y) * 0.05;
        camPos.x = SHOTS.desk.pos.x + parallax.x;
        camPos.y = SHOTS.desk.pos.y + parallax.y * 0.35;
        camPos.z = SHOTS.desk.pos.z + (h / w) * 3000 - 1800;
        camLook.x = SHOTS.desk.look.x + parallax.x * 0.45;
        camLook.y = SHOTS.desk.look.y + parallax.y * 0.25;
      }
      if (active === "monitor" && !tweening) {
        const aspect = (host.clientHeight || 1) / (host.clientWidth || 1);
        const extra = (host.clientWidth || 1) < 768 ? 0 : 600;
        camPos.z = SHOTS.monitor.pos.z + aspect * 1200 - extra;
        camLook.copy(SHOTS.monitor.look);
      }
      applyCamera();
      renderer.render(scene, camera);
      if (cssObject) cssRenderer.render(cssScene, camera);
      const inside = active === "monitor" && !tweening;
      cssRenderer.domElement.style.pointerEvents = inside ? "auto" : "none";
      if (screenEl) screenEl.style.pointerEvents = inside ? "auto" : "none";
    };
    frame = requestAnimationFrame(render);

    const onResize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      cssRenderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      gsap.killTweensOf(camPos);
      gsap.killTweensOf(camLook);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKey);
      renderer.dispose();
      host.replaceChildren();
    };
  }, []);

  const hintText = lang === "zh"
    ? (current === "desk" ? "点击显示器进入桌面 · 点空白处退回" : "点击画面，走近书桌")
    : (current === "desk" ? "Click the monitor to enter · click empty space to step back" : "Click to walk up to the desk");

  return (
    <div className="absolute inset-0">
      <div ref={mount} className="absolute inset-0" />
      {current !== "monitor" && current !== "loading" && (
        <button
          type="button"
          aria-label={lang === "zh" ? "走近或进入显示器" : "Walk up or enter the monitor"}
          className="absolute inset-0 z-10 cursor-pointer bg-transparent"
          onClick={(event) => surfaceClick.current(event.clientX, event.clientY)}
        />
      )}
      {boot && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black font-mono text-[#9fdf9f]">
          <div className="w-[min(28rem,90vw)] text-sm leading-7">
            {lines.slice(0, lineCount).map((line) => <p key={line}>{line}</p>)}
            <p className="mt-3 text-[#9fdf9f]/50">_</p>
          </div>
        </div>
      )}
      {hint && !boot && current !== "monitor" && current !== "loading" && (
        <p className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-sm text-[#f4ead8] backdrop-blur">
          {hintText}
        </p>
      )}
      {current === "monitor" && (
        <button
          type="button"
          onClick={() => go.current("desk", 1.2)}
          className="absolute top-4 right-4 z-30 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-[#f4ead8] backdrop-blur"
        >
          {lang === "zh" ? "退出屏幕" : "Leave screen"}
        </button>
      )}
    </div>
  );
}
