"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

const MODELS = [
  ["/models/study/environment.glb", "/models/study/baked_environment.jpg"],
  ["/models/study/decor.glb", "/models/study/baked_decor.jpg"],
  ["/models/study/computer.glb", "/models/study/baked_computer.jpg"],
] as const;

const DESK = new THREE.Vector3(0, 1800, 5500);
const DESK_LOOK = new THREE.Vector3(0, 500, 0);
const MONITOR = new THREE.Vector3(0, 950, 2000);
const MONITOR_LOOK = new THREE.Vector3(0, 950, 0);

export default function BakedStudy({
  zooming,
  onZoom,
  onReady,
}: {
  zooming: boolean;
  onZoom: () => void;
  onReady: () => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const zoomingRef = useRef(zooming);
  zoomingRef.current = zooming;
  const onZoomRef = useRef(onZoom);
  onZoomRef.current = onZoom;

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const width = host.clientWidth;
    const height = host.clientHeight;
    const scene = new THREE.Scene();
    const cssScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 10, 900000);
    camera.position.copy(DESK);
    camera.lookAt(DESK_LOOK);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
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

    const screen = document.createElement("iframe");
    screen.src = "/desk/os";
    screen.title = "ZoeOS 98";
    screen.style.width = "1280px";
    screen.style.height = "1024px";
    screen.style.border = "0";
    screen.style.background = "#008080";
    const cssObject = new CSS3DObject(screen);
    cssObject.position.set(0, 950, 255);
    cssObject.rotation.x = -3 * THREE.MathUtils.DEG2RAD;
    cssScene.add(cssObject);

    const loader = new GLTFLoader();
    const textures = new THREE.TextureLoader();
    let disposed = false;
    void Promise.all(MODELS.map(async ([modelUrl, textureUrl]) => {
      const [gltf, texture] = await Promise.all([
        loader.loadAsync(modelUrl),
        textures.loadAsync(textureUrl),
      ]);
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({ map: texture });
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.scale.set(900, 900, 900);
          child.material = material;
        }
      });
      scene.add(gltf.scene);
    })).then(() => {
      if (!disposed) onReady();
    }).catch((error: unknown) => {
      console.warn("Study models failed", error);
      if (!disposed) onReady();
    });

    const blend = { t: 0 };
    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      const goal = zoomingRef.current ? 1 : 0;
      blend.t += (goal - blend.t) * 0.04;
      camera.position.lerpVectors(DESK, MONITOR, blend.t);
      const look = DESK_LOOK.clone().lerp(MONITOR_LOOK, blend.t);
      camera.lookAt(look);
      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
      cssRenderer.domElement.style.pointerEvents = zoomingRef.current && blend.t > 0.7 ? "auto" : "none";
    };
    frame = requestAnimationFrame(render);

    const onResize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      cssRenderer.setSize(w, h);
    };
    renderer.domElement.addEventListener("click", () => onZoomRef.current());
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      host.replaceChildren();
    };
  }, [onReady]);

  return <div ref={mount} className="absolute inset-0" />;
}
