"use client";

/* eslint-disable react-hooks/immutability -- three.js objects (geometries,
   materials, the camera) are imperative and are mutated inside useFrame on
   every frame. That is how R3F is meant to be driven; none of it is React
   render state. */

// The sandbox: a sealed block of glass that holds a sample codebase. Agents
// probe it, findings light up inside it, and at the end of a run it is
// shattered. Everything here reads `scene` (see ./store) every frame.

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  RoundedBox,
  Trail,
} from "@react-three/drei";
import { scene, onSceneActive, isSceneActive } from "./store";
import { CODE_LAYERS } from "./code";
import { codeTexture, glowTexture, scanTexture } from "./textures";

const GROUND = "#07090a";
const FLARE = new THREE.Color("#ff5a1f");
const ICE = new THREE.Color("#dff3f7");
const SIZE = 2.5;
const SHEET = 2.02;
const SHARD_N = 5;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const damp = THREE.MathUtils.damp;

type Quality = { mobile: boolean; reduced: boolean };

/* ─── Positions shared by layers, findings and paths ──────────────────── */

function layerZ(i: number, spread: number) {
  const gap = 0.26 + spread * 0.2;
  return (i - (CODE_LAYERS.length - 1) / 2) * gap;
}

/** Local position (on its sheet) of the hot line of layer `i`. */
function hotPoint(i: number) {
  const layer = CODE_LAYERS[i];
  const size = 1024;
  const pad = size * 0.07;
  const lh = size * 0.047;
  const fs = size * 0.026;
  const y = pad + lh * 2.2 + (layer.hot ?? 0) * lh - fs * 0.35;
  const x = pad + fs * 2.6 + size * 0.1;
  return new THREE.Vector2((x / size - 0.5) * SHEET, (0.5 - y / size) * SHEET);
}

// Order in which findings light up: critical first.
const FINDING_ORDER = [1, 2, 3, 0, 4];
const FINDING_COLOR = [FLARE, FLARE, FLARE, new THREE.Color("#ffb020"), new THREE.Color("#ffd27a")];

/* ─── Inner code sheets ───────────────────────────────────────────────── */

function CodeSheets() {
  const textures = useMemo(() => CODE_LAYERS.map((l) => codeTexture(l)), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.position.z = layerZ(i, scene.spread);
      const mat = m.material as THREE.MeshBasicMaterial;
      // During the scan, sheets brighten as the sheet passes them.
      const scanY = (scene.scan - 0.5) * SIZE;
      const near = scene.scanOn * Math.max(0, 1 - Math.abs(scanY) * 0.6);
      mat.opacity = scene.layers * (0.8 + near * 0.4) * (1 - scene.shatter);
    });
  });

  return (
    <group>
      {textures.map((t, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }}>
          <planeGeometry args={[SHEET, SHEET]} />
          <meshBasicMaterial
            map={t}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Knowledge graph edges between sheets ───────────────────────────── */

function Graph() {
  const ref = useRef<THREE.LineSegments>(null);
  const seeds = useMemo(() => {
    const rnd = mulberry(7);
    return Array.from({ length: 16 }, () => {
      const a = Math.floor(rnd() * (CODE_LAYERS.length - 1));
      return {
        a,
        b: a + 1 + (rnd() > 0.75 ? 1 : 0),
        p: [(rnd() - 0.5) * 1.6, (rnd() - 0.5) * 1.6],
        q: [(rnd() - 0.5) * 1.6, (rnd() - 0.5) * 1.6],
      };
    }).filter((s) => s.b < CODE_LAYERS.length);
  }, []);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(seeds.length * 6), 3));
    return g;
  }, [seeds]);

  useFrame(() => {
    const pos = geom.attributes.position as THREE.BufferAttribute;
    seeds.forEach((s, i) => {
      pos.setXYZ(i * 2, s.p[0], s.p[1], layerZ(s.a, scene.spread));
      pos.setXYZ(i * 2 + 1, s.q[0], s.q[1], layerZ(s.b, scene.spread));
    });
    pos.needsUpdate = true;
    if (ref.current) {
      (ref.current.material as THREE.LineBasicMaterial).opacity = scene.graph * 0.32 * (1 - scene.shatter);
    }
  });

  return (
    <lineSegments ref={ref} geometry={geom}>
      <lineBasicMaterial color={ICE} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

/* ─── Scan sheet ──────────────────────────────────────────────────────── */

function ScanSheet() {
  const tex = useMemo(() => scanTexture(), []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    m.visible = scene.scanOn > 0.01;
    m.position.y = (scene.scan - 0.5) * (SIZE - 0.2) - 0.18;
    (m.material as THREE.MeshBasicMaterial).opacity = scene.scanOn;
  });
  return (
    <mesh ref={ref} rotation={[0, 0, 0]}>
      <boxGeometry args={[SIZE - 0.14, 0.36, SIZE - 0.14]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ─── Findings: flares on the hot lines, and the attack path ─────────── */

function Findings({ quality }: { quality: Quality }) {
  const glow = useMemo(() => glowTexture(), []);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const cores = useRef<(THREE.Sprite | null)[]>([]);
  const light = useRef<THREE.PointLight>(null);
  const pathGeom = useMemo(() => new THREE.BufferGeometry(), []);
  const path = useMemo(
    () => new THREE.Line(pathGeom, new THREE.LineBasicMaterial({ color: FLARE, transparent: true, opacity: 0, toneMapped: false })),
    [pathGeom],
  );
  const pts = useMemo(() => CODE_LAYERS.map((_, i) => hotPoint(i)), []);
  const root = useRef<THREE.Group>(null);
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), v: new THREE.Vector3() }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Targets for the report are expressed facing the viewer, then mapped
    // back into the rotating block's local space.
    const inner = root.current?.parent;
    if (inner) tmp.q.copy(inner.quaternion).invert();
    let lit = 0;
    FINDING_ORDER.forEach((layerIdx, k) => {
      const s = sprites.current[k];
      const c = cores.current[k];
      if (!s || !c) return;
      const on = smooth(k / FINDING_ORDER.length, (k + 0.7) / FINDING_ORDER.length, scene.findings);
      lit += on;
      const p = pts[layerIdx];
      const z = layerZ(layerIdx, scene.spread);
      // Report: lifted out through the front face, fanned out.
      const ex = scene.extract;
      tmp.v.set((k - 2) * 0.72, 0.15 - Math.abs(k - 2) * 0.1, 2.6).applyQuaternion(tmp.q);
      s.position.set(
        THREE.MathUtils.lerp(p.x, tmp.v.x, ex),
        THREE.MathUtils.lerp(p.y, tmp.v.y, ex),
        THREE.MathUtils.lerp(z + 0.01, tmp.v.z, ex),
      );
      c.position.copy(s.position);
      const pulse = quality.reduced ? 1 : 1 + Math.sin(t * 3.2 + k) * 0.18;
      // Proof survives the teardown once it has been lifted out of the glass.
      const fade = 1 - smooth(0.15, 0.6, scene.shatter) * (1 - ex);
      s.scale.setScalar(0.62 * on * pulse * (1 + ex * 0.2));
      c.scale.setScalar(0.12 * on);
      (s.material as THREE.SpriteMaterial).opacity = on * 0.85 * fade;
      (c.material as THREE.SpriteMaterial).opacity = on * fade;
    });

    if (light.current) light.current.intensity = lit * 1.4 * (1 - scene.shatter * 0.7);

    // Attack path: routes/refund.ts (no rate limit) → handler.ts (no idempotency key)
    const a = pts[0];
    const b = pts[1];
    const za = layerZ(0, scene.spread);
    const zb = layerZ(1, scene.spread);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(a.x, a.y, za),
      new THREE.Vector3((a.x + b.x) / 2 + 0.7, (a.y + b.y) / 2 + 0.5, (za + zb) / 2),
      new THREE.Vector3(b.x, b.y, zb),
    );
    const n = 40;
    const drawn = Math.max(2, Math.floor(n * scene.paths));
    pathGeom.setFromPoints(curve.getPoints(n).slice(0, drawn));
    (path.material as THREE.LineBasicMaterial).opacity =
      scene.paths * (1 - scene.extract) * (1 - scene.shatter);
  });

  return (
    <group ref={root}>
      <pointLight ref={light} color={FLARE} intensity={0} distance={5} decay={1.6} position={[0.3, 0.4, 0]} />
      {FINDING_ORDER.map((_, k) => (
        <group key={k}>
          <sprite ref={(s) => { sprites.current[k] = s; }}>
            <spriteMaterial
              map={glow}
              color={FINDING_COLOR[k]}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
          <sprite ref={(s) => { cores.current[k] = s; }}>
            <spriteMaterial map={glow} color="#ffffff" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
        </group>
      ))}
      <primitive object={path} />
    </group>
  );
}

/* ─── The glass block ─────────────────────────────────────────────────── */

function GlassBlock({ quality }: { quality: Quality }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.Material>(null);
  useFrame(() => {
    // The sealed block exists only while fully assembled and unbroken; the
    // shards take over in between. Hiding the material also skips its
    // transmission buffer pass.
    const sealed = scene.assemble > 0.985 && scene.shatter < 0.001;
    if (mat.current) mat.current.visible = sealed;
    if (mesh.current) mesh.current.visible = sealed;
  });
  return (
    <RoundedBox ref={mesh} args={[SIZE, SIZE, SIZE]} radius={0.12} smoothness={6} creaseAngle={0.4}>
      <MeshTransmissionMaterial
        ref={mat as React.Ref<never>}
        background={new THREE.Color(GROUND)}
        backside
        backsideThickness={0.4}
        samples={quality.mobile ? 4 : 8}
        resolution={quality.mobile ? 512 : 1024}
        transmission={1}
        thickness={0.55}
        roughness={0}
        ior={1.22}
        chromaticAberration={0.06}
        anisotropicBlur={0}
        distortion={0.04}
        distortionScale={0.2}
        temporalDistortion={0}
        envMapIntensity={1.6}
        clearcoat={1}
        clearcoatRoughness={0.08}
        color="#f4f8f9"
        attenuationColor="#d4e6ea"
        attenuationDistance={4}
      />
    </RoundedBox>
  );
}

/* ─── Shards: the block, broken into cubes ───────────────────────────── */

function Shards() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = SHARD_N ** 3;
  const data = useMemo(() => {
    const rnd = mulberry(3);
    const cell = SIZE / SHARD_N;
    return Array.from({ length: count }, (_, i) => {
      const ix = i % SHARD_N;
      const iy = Math.floor(i / SHARD_N) % SHARD_N;
      const iz = Math.floor(i / SHARD_N / SHARD_N);
      const home = new THREE.Vector3(
        (ix - (SHARD_N - 1) / 2) * cell,
        (iy - (SHARD_N - 1) / 2) * cell,
        (iz - (SHARD_N - 1) / 2) * cell,
      );
      const dir = home.clone().add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.2)).normalize();
      return {
        home,
        away: dir.multiplyScalar(2.4 + rnd() * 3.4).multiply(new THREE.Vector3(1.25, 1, 0.55)),
        rot: new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6),
        delay: rnd() * 0.35,
      };
    });
  }, [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cell = SIZE / SHARD_N;
  const material = useMemo(() => voxelMaterial(), []);

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const broken = Math.max(1 - scene.assemble, scene.shatter);
    m.visible = broken > 0.001;
    if (!m.visible) return;
    // Cross-fade with the sealed block as the voxels lock into place.
    material.uniforms.uOpacity.value =
      scene.shatter > 0 ? 1 - smooth(0.6, 1, scene.shatter) : smooth(0, 0.04, 1 - scene.assemble) * 0.7 + 0.3 * (1 - scene.assemble);
    data.forEach((d, i) => {
      const t = smooth(d.delay, 1, broken);
      dummy.position.lerpVectors(d.home, d.away, t);
      dummy.rotation.set(d.rot.x * t, d.rot.y * t, d.rot.z * t);
      // Shrink as they fly; at teardown they disappear completely.
      const s = scene.shatter > 0 ? 1 - smooth(0.35, 1, scene.shatter) * (0.6 + d.delay) : 1 - t * 0.35;
      dummy.scale.setScalar(Math.max(0, s) * 0.94);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} visible={false}>
      <boxGeometry args={[cell, cell, cell]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
}

/* ─── Agents: probes orbiting and diving into the block ──────────────── */

function Probe({ seed, quality }: { seed: number; quality: Quality }) {
  const head = useRef<THREE.Mesh>(null);
  const cfg = useMemo(() => {
    const rnd = mulberry(seed * 13 + 1);
    const axis = new THREE.Vector3(rnd() - 0.5, rnd() * 0.6 + 0.4, rnd() - 0.5).normalize();
    const start = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI * 2);
    const ortho = new THREE.Vector3().crossVectors(axis, start).normalize();
    const radial = new THREE.Vector3().crossVectors(ortho, axis).normalize();
    return {
      axis,
      radial,
      ortho,
      radius: 2.2 + rnd() * 1.5,
      speed: (0.25 + rnd() * 0.35) * (rnd() > 0.5 ? 1 : -1),
      phase: rnd() * Math.PI * 2,
      target: new THREE.Vector3((rnd() - 0.5) * 1.6, (rnd() - 0.5) * 1.6, (rnd() - 0.5) * 1.2),
      rank: seed / 12,
      diveRate: 0.35 + rnd() * 0.3,
    };
  }, [seed]);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const m = head.current;
    if (!m) return;
    const t = quality.reduced ? cfg.phase : clock.elapsedTime;
    const a = cfg.phase + t * cfg.speed * (0.6 + scene.probes * 0.5);
    v.copy(cfg.radial).multiplyScalar(Math.cos(a) * cfg.radius)
      .addScaledVector(cfg.ortho, Math.sin(a) * cfg.radius);
    // Dive: a periodic pulse toward a point inside the glass, only while attacking.
    const cycle = (t * cfg.diveRate + cfg.phase) % 1;
    const dive = Math.pow(Math.max(0, Math.sin(cycle * Math.PI)), 6) * smooth(0.45, 1, scene.probes);
    v.lerp(cfg.target, dive * 0.92);
    m.position.copy(v);
    const on = smooth(cfg.rank * 0.9, cfg.rank * 0.9 + 0.12, scene.probes) * (1 - scene.shatter);
    m.scale.setScalar(0.024 * (0.4 + on * 0.6) * (1 + dive * 0.6));
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.25 + on * 0.75;
    mat.color.copy(ICE).lerp(FLARE, dive);
  });

  const mesh = (
    <mesh ref={head}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color={ICE} transparent toneMapped={false} />
    </mesh>
  );

  if (quality.reduced) return mesh;
  return (
    <Trail width={0.45} length={quality.mobile ? 2.5 : 3.5} color={ICE} attenuation={(w) => w * w} decay={1.2}>
      {mesh}
    </Trail>
  );
}

/* ─── Dust for depth ──────────────────────────────────────────────────── */

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const rnd = mulberry(11);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rnd() - 0.5) * 24;
      arr[i * 3 + 1] = (rnd() - 0.5) * 14;
      arr[i * 3 + 2] = -rnd() * 14 + 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.006;
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color="#c9d6da" size={0.022} sizeAttenuation transparent opacity={0.42} depthWrite={false} />
    </points>
  );
}

/* ─── Rig: placement, pointer, rotation ──────────────────────────────── */

function Rig({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const { viewport, camera, size } = useThree();
  const look = useRef({ x: 0, y: 0 });

  useFrame(({ clock }, dt) => {
    const g = group.current;
    const i = inner.current;
    if (!g || !i) return;
    const vp = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0), size);
    g.position.x = damp(g.position.x, scene.x * vp.width, 6, dt);
    g.position.y = damp(g.position.y, scene.y * vp.height, 6, dt);
    const fit = Math.min(1, vp.width / 7.2); // keep the block inside narrow viewports
    const s = scene.scale * (quality.mobile ? Math.max(0.62, fit) : 1);
    g.scale.setScalar(damp(g.scale.x, s, 6, dt));

    look.current.x = damp(look.current.x, scene.pointerX, 3, dt);
    look.current.y = damp(look.current.y, scene.pointerY, 3, dt);

    const t = quality.reduced ? 0 : clock.elapsedTime;
    i.rotation.y = -0.62 + Math.sin(t * 0.18) * 0.16 + look.current.x * 0.32 + scene.spin;
    i.rotation.x = 0.2 + Math.cos(t * 0.15) * 0.05 - look.current.y * 0.18;

    camera.position.x = damp(camera.position.x, look.current.x * 0.35, 3, dt);
    camera.position.y = damp(camera.position.y, -look.current.y * 0.2, 3, dt);
    camera.position.z = damp(camera.position.z, 10 - scene.zoom * 2.6, 4, dt);
    camera.lookAt(g.position.x * 0.25, g.position.y * 0.25, 0);
  });

  const probes = quality.mobile ? 8 : 12;
  return (
    <group ref={group}>
      <group ref={inner}>
        <CodeSheets />
        <Graph />
        <ScanSheet />
        <Findings quality={quality} />
        <GlassBlock quality={quality} />
        <Shards />
      </group>
      {Array.from({ length: probes }, (_, k) => (
        <Probe key={k} seed={k} quality={quality} />
      ))}
    </group>
  );
}

/* ─── Frame gating: pause when covered ───────────────────────────────── */

function FrameGate() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    setFrameloop(isSceneActive() ? "always" : "never");
    return onSceneActive((on) => setFrameloop(on ? "always" : "never"));
  }, [setFrameloop]);
  return null;
}

/* ─── Canvas ──────────────────────────────────────────────────────────── */

export default function SandboxScene({ onReady }: { onReady?: () => void }) {
  const [quality] = useState<Quality>(() => ({
    mobile: typeof window !== "undefined" && window.matchMedia("(max-width: 767px), (pointer: coarse)").matches,
    reduced: typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      scene.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <Canvas
      dpr={quality.mobile ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl, scene: s }) => {
        gl.setClearColor(GROUND, 1);
        s.background = new THREE.Color(GROUND);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        requestAnimationFrame(() => onReady?.());
      }}
    >
      <FrameGate />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -4]} scale={[12, 2.4, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 4, 9]} rotation-x={Math.PI / 2.4} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[-5, -1, 7]} rotation-y={Math.PI / 4} scale={[1.2, 8, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-6, 0.5, -1]} rotation-y={Math.PI / 2} scale={[9, 0.7, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[6, -0.6, -2]} rotation-y={-Math.PI / 2} scale={[9, 0.5, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#ff5a1f" position={[3, -4, -3]} scale={[6, 0.6, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-4, 3, 6]} rotation-y={Math.PI * 0.8} scale={[0.6, 3, 1]} />
        <Lightformer form="rect" intensity={0.7} position={[0, -6, 1]} rotation-x={-Math.PI / 2} scale={[14, 6, 1]} />
      </Environment>
      <ambientLight intensity={0.25} />
      <Dust count={quality.mobile ? 260 : 520} />
      <Rig quality={quality} />
    </Canvas>
  );
}

/* ─── utils ───────────────────────────────────────────────────────────── */

/** Glass voxel: luminous edges plus a fresnel fill, additive, instanced. */
function voxelMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color("#cfeaf0") }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float edge = 1.0 - smoothstep(0.0, 0.028, e);
        float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.5);
        float a = edge * 0.42 + fres * 0.1 + 0.012;
        gl_FragColor = vec4(uColor * a * uOpacity, 1.0);
      }`,
  });
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
