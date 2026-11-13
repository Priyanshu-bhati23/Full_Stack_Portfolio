"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

/**
 * The hero scene: an animated 3D character with the three projects floating
 * around it.
 *
 * The character is built from simple shapes (no model file), so it loads
 * instantly. It looks toward the pointer, blinks, breathes, waves when the page
 * opens or when it is selected, and turns to face whichever project the pointer
 * is over. Each project object leads to that project when selected.
 */

type Slug = "repoverse" | "hivemind" | "voxui";

const SLUGS: Slug[] = ["repoverse", "hivemind", "voxui"];
const NAMES: Record<Slug, string> = { repoverse: "Repoverse", hivemind: "Hivemind", voxui: "VoxUI" };

/** Where each project floats, relative to the character, in character-height units. */
const SPOTS: Record<Slug, [number, number, number]> = {
  repoverse: [-1.75, 0.55, 0.4],
  voxui: [1.75, 1.2, 0.1],
  hivemind: [1.5, -0.8, 0.6],
};

/** Character height in world units before fitting to the screen. */
const CHARACTER_HEIGHT = 3.4;

function goTo(slug: Slug) {
  document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Orbits({ still }: { still: boolean }) {
  const rings = useRef<THREE.Group>(null);
  const moons = useRef<(THREE.Mesh | null)[]>([]);
  const tracks = useMemo(
    () => [
      { radius: 1.0, tilt: [1.25, 0.2, 0] as const, color: "#6AA8FF", speed: 0.9 },
      { radius: 1.22, tilt: [1.6, 0.9, 0.3] as const, color: "#E0B15A", speed: -0.6 },
      { radius: 1.42, tilt: [0.9, -0.6, 0.2] as const, color: "#F29AD8", speed: 0.45 },
    ],
    [],
  );
  useFrame(({ clock }, dt) => {
    if (rings.current && !still) rings.current.rotation.y += dt * 0.25;
    const t = still ? 1 : clock.elapsedTime;
    tracks.forEach((track, i) => {
      const moon = moons.current[i];
      if (!moon) return;
      const a = t * track.speed + i * 2;
      moon.position.set(Math.cos(a) * track.radius, Math.sin(a) * track.radius, 0);
    });
  });
  return (
    <group ref={rings}>
      <mesh>
        <sphereGeometry args={[0.62, 48, 32]} />
        <meshStandardMaterial color="#0B1026" roughness={0.35} metalness={0.2} />
      </mesh>
      {tracks.map((track, i) => (
        <group key={i} rotation={track.tilt}>
          <mesh>
            <torusGeometry args={[track.radius, 0.012, 8, 96]} />
            <meshBasicMaterial color="#0B1026" />
          </mesh>
          <mesh
            ref={(m) => {
              moons.current[i] = m;
            }}
          >
            <sphereGeometry args={[0.11, 20, 16]} />
            <meshStandardMaterial color={track.color} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const HEX_COLORS = ["#FFB400", "#2F6BFF", "#8B45FF", "#0E9F6E", "#F0457A", "#F26A1B", "#12141C"];

function Honeycomb({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const cells = useRef<(THREE.Mesh | null)[]>([]);
  const spots = useMemo(() => {
    const out: Array<[number, number]> = [[0, 0]];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      out.push([Math.cos(a) * 0.78, Math.sin(a) * 0.78]);
    }
    return out;
  }, []);
  useFrame(({ clock }, dt) => {
    if (group.current && !still) group.current.rotation.y += dt * 0.3;
    const t = still ? 0.6 : clock.elapsedTime;
    cells.current.forEach((cell, i) => {
      if (!cell) return;
      const h = 0.45 + 0.38 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 1.3)) + (i === 0 ? 0.35 : 0);
      cell.scale.y = h;
      cell.position.y = h / 2 - 0.5;
    });
  });
  return (
    <group ref={group} rotation={[0.5, 0, 0]}>
      {spots.map(([x, z], i) => (
        <mesh
          key={i}
          position={[x, 0, z]}
          ref={(m) => {
            cells.current[i] = m;
          }}
        >
          <cylinderGeometry args={[0.43, 0.43, 1, 6]} />
          <meshStandardMaterial color={HEX_COLORS[i]} roughness={0.55} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// Simplex noise by Ian McEwan and Stefan Gustavson (MIT licence), the usual GLSL port.
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERTEX = /* glsl */ `
${NOISE}
uniform float uTime;
varying float vLift;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  vLift = snoise(normal * 1.3 + uTime * 0.35) + snoise(normal * 3.2 - uTime * 0.5) * 0.3;
  vec4 world = modelViewMatrix * vec4(position + normal * vLift * 0.17, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-world.xyz);
  gl_Position = projectionMatrix * world;
}`;

const FRAGMENT = /* glsl */ `
varying float vLift;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  float t = smoothstep(-0.9, 0.9, vLift);
  vec3 color = mix(vec3(0.85, 0.12, 0.47), vec3(1.0, 0.42, 0.27), smoothstep(0.0, 0.55, t));
  color = mix(color, vec3(1.0, 0.84, 0.42), smoothstep(0.55, 1.0, t));
  color += pow(1.0 - max(dot(normalize(vNormal), vView), 0.0), 2.4) * 0.35;
  gl_FragColor = vec4(color, 1.0);
}`;

function Blob({ still }: { still: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    // The material holds its own copy of each uniform, so update that one.
    if (!still && material.current) material.current.uniforms.uTime.value += Math.min(dt, 0.05);
  });
  return (
    <mesh>
      <icosahedronGeometry args={[0.92, 32]} />
      <shaderMaterial ref={material} vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} />
    </mesh>
  );
}


const SKIN = "#d6a07c";
const SKIN_SHADE = "#c48a66";
const HAIR = "#1b1513";
const JACKET = "#c9a37b";
const JACKET_SHADE = "#b48d65";
const SHIRT = "#4b1d2c";

/** One arm: a shoulder joint, an upper arm, an elbow joint, a forearm and a hand. */
function Arm({ side, shoulder, elbow }: { side: 1 | -1; shoulder: RefObject<THREE.Group | null>; elbow: RefObject<THREE.Group | null> }) {
  return (
    <group ref={shoulder} position={[side * 0.74, -0.42, 0]}>
      <mesh position={[0, -0.36, 0]}>
        <capsuleGeometry args={[0.17, 0.5, 6, 14]} />
        <meshStandardMaterial color={JACKET} roughness={0.8} />
      </mesh>
      <group ref={elbow} position={[0, -0.72, 0]}>
        <mesh position={[0, -0.32, 0]}>
          <capsuleGeometry args={[0.15, 0.44, 6, 14]} />
          <meshStandardMaterial color={JACKET} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.68, 0.02]}>
          <sphereGeometry args={[0.14, 18, 14]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

interface CharacterProps {
  still: boolean;
  /** World position the character should look toward, or null to follow the pointer. */
  lookAt: RefObject<THREE.Vector3 | null>;
  /** Raise to start a wave. */
  wave: RefObject<number>;
  onSelect: () => void;
}

function Character({ still, lookAt, wave, onSelect }: CharacterProps) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<(THREE.Group | null)[]>([]);
  const brows = useRef<(THREE.Mesh | null)[]>([]);
  const rightShoulder = useRef<THREE.Group>(null);
  const rightElbow = useRef<THREE.Group>(null);
  const leftShoulder = useRef<THREE.Group>(null);
  const leftElbow = useRef<THREE.Group>(null);
  const clock = useRef({ t: 0, nextBlink: 2.2, blink: 0, intro: still ? 1 : 0 });
  const target = useMemo(() => new THREE.Vector3(), []);
  const local = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.05);
    const c = clock.current;
    c.t += step;
    const ease = (rate: number) => 1 - Math.exp(-step * rate);

    // Entrance: rise and grow with a little overshoot.
    c.intro = Math.min(1, c.intro + step / 1.1);
    const k = c.intro;
    const pop = still ? 1 : 1 + Math.sin(k * Math.PI) * 0.06 * (1 - k) - (1 - k) * 0.4;
    if (root.current) {
      root.current.scale.setScalar(Math.max(0.01, pop * Math.min(1, k * 1.6)));
      root.current.position.y = still ? 0 : -(1 - k) * 0.8;
    }

    // Breathing.
    if (torso.current && !still) torso.current.scale.set(1, 1 + Math.sin(c.t * 1.8) * 0.012, 1 + Math.sin(c.t * 1.8) * 0.02);

    // Where to look: a hovered project, or the pointer.
    if (lookAt.current) target.copy(lookAt.current);
    else target.set(state.pointer.x * state.viewport.width * 0.5, state.pointer.y * state.viewport.height * 0.5, 6);
    if (head.current && root.current) {
      local.copy(target);
      root.current.worldToLocal(local);
      local.y -= 0.55;
      const yaw = THREE.MathUtils.clamp(Math.atan2(local.x, Math.max(0.5, local.z)), -0.75, 0.75);
      const pitch = THREE.MathUtils.clamp(-Math.atan2(local.y, Math.max(0.5, Math.hypot(local.x, local.z))), -0.35, 0.4);
      const r = still ? 1 : ease(5);
      head.current.rotation.y += (yaw - head.current.rotation.y) * r;
      head.current.rotation.x += (pitch - head.current.rotation.x) * r;
      head.current.rotation.z = still ? 0 : Math.sin(c.t * 0.7) * 0.03;
      if (torso.current) torso.current.rotation.y += (yaw * 0.35 - torso.current.rotation.y) * r;
    }

    // Blinking.
    if (!still && c.t > c.nextBlink) {
      c.blink = 1;
      c.nextBlink = c.t + 2.5 + Math.random() * 3;
    }
    c.blink = Math.max(0, c.blink - step * 7);
    const lid = c.blink > 0.5 ? (1 - c.blink) * 2 : c.blink * 2;
    eyes.current.forEach((eye) => eye?.scale.set(1, Math.max(0.08, 1 - lid), 1));

    // Eyebrows lift while waving or looking at a project.
    const lift = wave.current > 0 || lookAt.current ? 0.05 : 0;
    brows.current.forEach((b) => {
      if (b) b.position.y += (0.2 + lift - b.position.y) * ease(8);
    });

    // Waving with the right arm, then back to rest.
    if (!still) wave.current = Math.max(0, wave.current - step / 2.2);
    const w = wave.current;
    const up = w > 0 ? Math.min(1, Math.min(w, 1 - w) * 6 + (w > 0.15 && w < 0.85 ? 1 : 0)) : 0;
    if (rightShoulder.current && rightElbow.current) {
      const raise = up * 2.5;
      rightShoulder.current.rotation.z += (raise - rightShoulder.current.rotation.z) * ease(9);
      rightShoulder.current.rotation.x += (-up * 0.2 - rightShoulder.current.rotation.x) * ease(9);
      const swing = up * (0.55 + Math.sin(c.t * 11) * 0.45);
      rightElbow.current.rotation.z += (swing - rightElbow.current.rotation.z) * ease(14);
    }
    if (leftShoulder.current && leftElbow.current && !still) {
      leftShoulder.current.rotation.z = -0.08 - Math.sin(c.t * 1.8) * 0.02;
      leftElbow.current.rotation.z = -0.12;
    }
  });

  return (
    <group
      ref={root}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <group ref={torso}>
        {/* Jacket body */}
        <mesh position={[0, -0.95, 0]} scale={[1.18, 1, 0.78]}>
          <capsuleGeometry args={[0.6, 0.75, 8, 24]} />
          <meshStandardMaterial color={JACKET} roughness={0.85} />
        </mesh>
        {/* Zip */}
        <mesh position={[0, -0.95, 0.47]}>
          <boxGeometry args={[0.04, 1.1, 0.02]} />
          <meshStandardMaterial color={JACKET_SHADE} roughness={0.6} />
        </mesh>
        {/* Shirt and collar */}
        <mesh position={[0, -0.24, 0.06]}>
          <cylinderGeometry args={[0.27, 0.34, 0.26, 24]} />
          <meshStandardMaterial color={SHIRT} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.26, 0.02]} rotation={[Math.PI / 2 - 0.15, 0, 0]}>
          <torusGeometry args={[0.37, 0.09, 12, 28, Math.PI * 1.7]} />
          <meshStandardMaterial color={JACKET} roughness={0.85} />
        </mesh>
        <Arm side={-1} shoulder={leftShoulder} elbow={leftElbow} />
        <Arm side={1} shoulder={rightShoulder} elbow={rightElbow} />
        {/* Neck */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.19, 0.22, 0.34, 18]} />
          <meshStandardMaterial color={SKIN_SHADE} roughness={0.6} />
        </mesh>

        <group ref={head} position={[0, 0.55, 0]}>
          {/* Face */}
          <mesh scale={[0.9, 1.05, 0.95]}>
            <sphereGeometry args={[0.55, 40, 32]} />
            <meshStandardMaterial color={SKIN} roughness={0.55} />
          </mesh>
          {/* Ears */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.49, 0, -0.02]} scale={[0.45, 0.8, 0.5]}>
              <sphereGeometry args={[0.16, 16, 12]} />
              <meshStandardMaterial color={SKIN_SHADE} roughness={0.6} />
            </mesh>
          ))}
          {/* Hair: a cap and a swept front */}
          <mesh position={[0, 0.1, -0.03]} scale={[0.95, 1.02, 1]}>
            <sphereGeometry args={[0.57, 40, 20, 0, Math.PI * 2, 0, 1.25]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.04, 0.46, 0.18]} rotation={[0.35, 0.15, -0.12]} scale={[1, 0.55, 0.8]}>
            <sphereGeometry args={[0.36, 24, 16]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          {/* Beard and moustache */}
          <mesh position={[0, -0.02, 0.01]} scale={[0.93, 1.07, 0.97]}>
            <sphereGeometry args={[0.555, 40, 24, Math.PI * 0.08, Math.PI * 0.84, 1.98, 0.86]} />
            <meshStandardMaterial color="#2a1f1b" roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.22, 0.47]} rotation={[0, 0, Math.PI / 2]} scale={[0.6, 1, 0.6]}>
            <capsuleGeometry args={[0.05, 0.22, 4, 10]} />
            <meshStandardMaterial color={HAIR} roughness={0.95} />
          </mesh>
          {/* Mouth */}
          <mesh position={[0, -0.32, 0.47]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.022, 0.12, 4, 8]} />
            <meshStandardMaterial color="#7a3b33" roughness={0.6} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -0.06, 0.53]} scale={[0.8, 1.2, 1]}>
            <sphereGeometry args={[0.075, 16, 12]} />
            <meshStandardMaterial color={SKIN_SHADE} roughness={0.55} />
          </mesh>
          {/* Eyes and brows */}
          {[-1, 1].map((side, i) => (
            <group key={side}>
              <group
                ref={(g) => {
                  eyes.current[i] = g;
                }}
                position={[side * 0.18, 0.07, 0.46]}
              >
                <mesh scale={[1, 0.8, 0.5]}>
                  <sphereGeometry args={[0.075, 18, 14]} />
                  <meshStandardMaterial color="#f6f1ea" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, 0.03]}>
                  <sphereGeometry args={[0.042, 16, 12]} />
                  <meshStandardMaterial color="#1c1210" roughness={0.2} />
                </mesh>
                <mesh position={[0.014, 0.016, 0.06]}>
                  <sphereGeometry args={[0.011, 8, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
              <mesh
                ref={(m) => {
                  brows.current[i] = m;
                }}
                position={[side * 0.18, 0.2, 0.47]}
                rotation={[0, 0, side * -0.12]}
              >
                <boxGeometry args={[0.17, 0.04, 0.04]} />
                <meshStandardMaterial color={HAIR} roughness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

interface SceneProps {
  still: boolean;
  hovered: Slug | null;
  onHover: (slug: Slug | null) => void;
  labels: RefObject<Record<Slug, HTMLElement | null>>;
}

function Scene({ still, hovered, onHover, labels }: SceneProps) {
  const { viewport, size, camera } = useThree();
  const stage = useRef<THREE.Group>(null);
  const objects = useRef<Record<Slug, THREE.Group | null>>({ repoverse: null, hivemind: null, voxui: null });
  const scales = useRef<Record<Slug, number>>({ repoverse: 0.001, hivemind: 0.001, voxui: 0.001 });
  const lookAt = useRef<THREE.Vector3 | null>(null);
  const wave = useRef(still ? 0 : 1);
  const time = useRef(0);
  const point = useMemo(() => new THREE.Vector3(), []);
  const world = useMemo(() => new THREE.Vector3(), []);

  // Fit to the canvas: beside the text on wide screens, centred on narrow ones.
  const wide = size.width >= 900;
  const fit = Math.min((viewport.height * 0.62) / CHARACTER_HEIGHT, (viewport.width * (wide ? 0.42 : 0.62)) / 4.4);
  const centerX = wide ? viewport.width * 0.22 : 0;
  const centerY = wide ? -0.15 * fit : -0.05;

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.05);
    time.current += still ? 0 : step;
    const t = time.current;
    const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    if (stage.current) {
      stage.current.position.set(centerX, centerY - scroll * 1.2, 0);
      stage.current.rotation.y = still ? 0 : scroll * 0.8;
    }

    SLUGS.forEach((slug, i) => {
      const group = objects.current[slug];
      if (!group || !stage.current) return;
      const [x, y, z] = SPOTS[slug];
      const delay = 0.6 + i * 0.18;
      const shown = still || t > delay ? 1 : 0;
      group.position.set(x, y + (still ? 0 : Math.sin(t * 1.1 + i * 2) * 0.09), z);
      group.rotation.y = still ? 0.4 : t * (0.35 + i * 0.08);
      const target = shown * (hovered === slug ? 0.52 : 0.42);
      scales.current[slug] += (target - scales.current[slug]) * (1 - Math.exp(-step * 7));
      group.scale.setScalar(scales.current[slug]);

      if (hovered === slug) {
        group.getWorldPosition(world);
        lookAt.current = (lookAt.current ?? new THREE.Vector3()).copy(world).setZ(world.z + 2);
      }

      const label = labels.current[slug];
      if (label) {
        group.getWorldPosition(point);
        point.y -= 0.82 * fit;
        point.project(camera);
        label.style.opacity = String(Math.min(1, scales.current[slug] / 0.3));
        label.style.transform = `translate(${((point.x * 0.5 + 0.5) * size.width).toFixed(1)}px, ${((-point.y * 0.5 + 0.5) * size.height).toFixed(1)}px) translate(-50%, 0)`;
      }
    });
    if (!hovered) lookAt.current = null;
  });

  return (
    <group ref={stage} scale={fit}>
      <Character
        still={still}
        lookAt={lookAt}
        wave={wave}
        onSelect={() => {
          if (!still) wave.current = 1;
        }}
      />
      {SLUGS.map((slug) => (
        <group
          key={slug}
          ref={(g) => {
            objects.current[slug] = g;
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(slug);
          }}
          onPointerOut={() => onHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            goTo(slug);
          }}
        >
          {slug === "repoverse" && <Orbits still={still} />}
          {slug === "hivemind" && <Honeycomb still={still} />}
          {slug === "voxui" && <Blob still={still} />}
        </group>
      ))}
    </group>
  );
}

export default function HeroScene({ still }: { still: boolean }) {
  const [hovered, setHovered] = useState<Slug | null>(null);
  const labels = useRef<Record<Slug, HTMLElement | null>>({ repoverse: null, hivemind: null, voxui: null });

  return (
    <div className="scene" style={{ cursor: hovered ? "pointer" : "default" }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 9], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />
        <directionalLight position={[-5, -2, 2]} intensity={0.5} color="#BFC8FF" />
        <directionalLight position={[-3, 3, -5]} intensity={1.6} color="#ff8a3d" />
        <Scene still={still} hovered={hovered} onHover={setHovered} labels={labels} />
      </Canvas>
      <div className="scene-labels">
        {SLUGS.map((slug) => (
          <a
            key={slug}
            href={`#${slug}`}
            ref={(el) => {
              labels.current[slug] = el;
            }}
            className={hovered === slug ? "is-hovered" : ""}
          >
            {NAMES[slug]}
          </a>
        ))}
      </div>
    </div>
  );
}
