import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { useFinePointer } from '../hooks/useFinePointer';

/**
 * The hero object: a five-pointed star built as real geometry (a closed, irregular star curve
 * swept into an inflated tube with a varying cross-section) and shaded as liquid chrome.
 *
 * Reflections come from a studio environment generated once into a canvas and pre-filtered with
 * three's PMREM, so there is no HDR file to download and the highlights stay warm, not neon.
 *
 * Interaction: the star leans a few degrees toward the pointer with spring-like easing.
 * The loop only runs while something is still moving and stops when the star settles, so the page
 * is idle most of the time. The canvas takes no pointer events, so navigation is untouched.
 * On touch devices and with reduced motion the star is rendered once, standing still.
 */

const MAX_YAW = 0.3; // rad, ≈17°
const MAX_PITCH = 0.22; // rad, ≈13°

/** Studio environment: a dark room with a few soft warm panels, as an equirectangular canvas. */
function studioEnvironment() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  // a bright studio ceiling over a dark floor: this is what makes the metal read as mirror chrome
  sky.addColorStop(0, '#f6f1e8');
  sky.addColorStop(0.34, '#cac3b8');
  sky.addColorStop(0.5, '#4b4744');
  sky.addColorStop(0.62, '#1d1b1a');
  sky.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const panel = (x: number, y: number, w: number, h: number, alpha: number, warm = true) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h));
    g.addColorStop(0, warm ? `rgba(255, 246, 232, ${alpha})` : `rgba(226, 234, 245, ${alpha})`);
    g.addColorStop(0.55, warm ? `rgba(244, 231, 212, ${alpha * 0.35})` : `rgba(206, 216, 232, ${alpha * 0.3})`);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, h / w);
    ctx.translate(-x, -y);
    ctx.fillStyle = g;
    ctx.fillRect(x - w, y - w, w * 2, w * 2);
    ctx.restore();
  };

  // key softbox, fill, rim and a low bounce
  panel(250, 140, 230, 300, 1);
  panel(700, 170, 170, 240, 0.85, false);
  panel(930, 110, 120, 170, 0.7);
  panel(60, 240, 120, 200, 0.5);
  panel(520, 420, 280, 130, 0.22);
  return canvas;
}

/** A closed, slightly irregular five-point star path. */
function starCurve() {
  const points: THREE.Vector3[] = [];
  const spikes = 5;
  for (let i = 0; i < spikes * 2; i++) {
    const outer = i % 2 === 0;
    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    // hand-made irregularity: no two arms are identical
    const wobble = 1 + Math.sin(i * 1.9) * 0.06;
    const radius = (outer ? 1 : 0.44) * wobble;
    points.push(
      new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(i * 2.3) * 0.11),
    );
  }
  return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.55);
}

/** Sweeps the curve into a tube whose cross-section swells at the tips, like inflated metal. */
function inflatedTube(curve: THREE.Curve<THREE.Vector3>, tubular = 560, radial = 30, base = 0.225) {
  const frames = curve.computeFrenetFrames(tubular, true);
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();

  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t % 1, P);
    N.copy(frames.normals[i % tubular]);
    B.copy(frames.binormals[i % tubular]);
    // thickest at the outer tips, thinnest in the inner notches
    const lobe = Math.cos(t * Math.PI * 2 * 5) * 0.5 + 0.5;
    const radius = base * (0.78 + 0.62 * lobe + 0.06 * Math.sin(t * Math.PI * 2 * 3));
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);
      // flattened cross-section: a ribbon of metal rather than a round rope
      const nx = cos * N.x * 1 + sin * B.x * 0.62;
      const ny = cos * N.y * 1 + sin * B.y * 0.62;
      const nz = cos * N.z * 1 + sin * B.z * 0.62;
      const n = new THREE.Vector3(nx, ny, nz).normalize();
      positions.push(P.x + radius * nx, P.y + radius * ny, P.z + radius * nz);
      normals.push(n.x, n.y, n.z);
      uvs.push(t, j / radial);
    }
  }
  for (let i = 1; i <= tubular; i++) {
    for (let j = 1; j <= radial; j++) {
      const a = (radial + 1) * (i - 1) + (j - 1);
      const b = (radial + 1) * i + (j - 1);
      const c = (radial + 1) * i + j;
      const d = (radial + 1) * (i - 1) + j;
      indices.push(a, b, d, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

export default function HeroStar({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // no WebGL: the hero simply keeps its space empty
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 5.6);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = new THREE.CanvasTexture(studioEnvironment());
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    envTexture.colorSpace = THREE.SRGBColorSpace;
    const envMap = pmrem.fromEquirectangular(envTexture).texture;
    scene.environment = envMap;
    envTexture.dispose();
    pmrem.dispose();

    const geometry = inflatedTube(starCurve());
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xf2eee8,
      metalness: 1,
      roughness: 0.06,
      envMapIntensity: 1.9,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
    const star = new THREE.Mesh(geometry, material);
    // a fixed three-quarter tilt, so the object reads as volumetric even before the cursor moves
    const baseRotation = new THREE.Euler(-0.16, 0.24, -0.1);
    star.rotation.copy(baseRotation);
    scene.add(star);

    const key = new THREE.DirectionalLight(0xfff3e4, 1.1);
    key.position.set(-2.4, 2.2, 3);
    const rim = new THREE.DirectionalLight(0xd8e2f0, 0.5);
    rim.position.set(2.6, -1.4, -2);
    scene.add(key, rim);

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    let running = false;

    const render = () => {
      star.rotation.y = baseRotation.y + current.x * MAX_YAW;
      star.rotation.x = baseRotation.x - current.y * MAX_PITCH;
      star.position.x = current.x * 0.14;
      star.position.y = -current.y * 0.1;
      renderer.render(scene, camera);
    };

    const frame = () => {
      // spring-like easing; the loop stops as soon as the star has settled
      current.x += (target.x - current.x) * 0.075;
      current.y += (target.y - current.y) * 0.075;
      render();
      if (Math.abs(target.x - current.x) > 0.0005 || Math.abs(target.y - current.y) > 0.0005) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        raf = 0;
      }
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // keep the object the same visual size whatever the frame's shape is
      camera.position.z = width < height ? 5.6 * (height / width) * 0.82 + 1 : 5.6;
      camera.updateProjectionMatrix();
      render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const interactive = fine && !reduce;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      start();
    };
    if (interactive) window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      if (interactive) window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      envMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [fine, reduce]);

  return <div ref={hostRef} aria-hidden="true" className={`pointer-events-none ${className ?? ''}`} />;
}
