"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

/**
 * The hero scene.
 *
 * In the middle is a portrait built from tens of thousands of particles, one
 * per sampled pixel of a photo, each pushed forward or back to give the face
 * depth. The particles fly in on load, move away from the pointer, burst when
 * the portrait is selected and drift apart as the page scrolls.
 *
 * Three objects orbit the portrait, one per project: an orbit model for
 * Repoverse, a honeycomb for Hivemind and a noise-displaced orb for VoxUI.
 * Hover one to stop the orbit, select it to jump to its project.
 */

type Slug = "repoverse" | "hivemind" | "voxui";

const SLUGS: Slug[] = ["repoverse", "hivemind", "voxui"];
const NAMES: Record<Slug, string> = { repoverse: "Repoverse", hivemind: "Hivemind", voxui: "VoxUI" };

/** Portrait size in world units before fitting to the screen. */
const PORTRAIT_WIDTH = 3.7;

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

interface Portrait {
  geometry: THREE.BufferGeometry;
  height: number;
}

/** Turn a cut-out photo into a cloud of coloured points with a little depth. */
function usePortrait(src: string): Portrait | null {
  const [portrait, setPortrait] = useState<Portrait | null>(null);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const { width: w, height: h } = image;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, w, h).data;

      // Fewer points on small or low-powered screens.
      const step = window.innerWidth < 700 ? 3 : 2;
      const height = (PORTRAIT_WIDTH * h) / w;
      const positions: number[] = [];
      const colors: number[] = [];
      const seeds: number[] = [];

      for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
          const i = (py * w + px) * 4;
          if (pixels[i + 3] < 110) continue;
          const u = px / w;
          const v = py / h;
          // Thin the points out toward the bottom so the bust fades instead of ending in a line.
          if (v > 0.78 && Math.random() < ((v - 0.78) / 0.22) * 0.9) continue;

          const r = pixels[i] / 255;
          const g = pixels[i + 1] / 255;
          const b = pixels[i + 2] / 255;
          const light = (r + g + b) / 3;

          // Depth is estimated, not measured: a dome for the head, a wider one for
          // the shoulders, and brighter pixels a touch closer.
          const hx = (u - 0.44) / 0.3;
          const hy = (v - 0.32) / 0.34;
          const head = Math.sqrt(Math.max(0, 1 - hx * hx - hy * hy));
          const bx = (u - 0.5) / 0.62;
          const by = (v - 1) / 0.5;
          const body = Math.sqrt(Math.max(0, 1 - bx * bx - by * by));
          const depth = head * 0.8 + body * 0.45 + (light - 0.4) * 0.25;

          positions.push((u - 0.5) * PORTRAIT_WIDTH, (0.5 - v) * height, depth);
          colors.push(r, g, b);
          seeds.push(Math.random(), Math.random(), Math.random(), Math.random());
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 4));
      geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
      setPortrait({ geometry, height });
    };
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return portrait;
}

const POINT_VERTEX = /* glsl */ `
attribute vec3 aColor;
attribute vec4 aSeed;
uniform float uTime;
uniform float uAssemble;
uniform float uScatter;
uniform float uBurst;
uniform float uSize;
uniform float uScale;
uniform vec3 uPointer;
uniform float uPush;
varying vec3 vColor;
void main(){
  // Fly in from a random cloud, each point with its own delay.
  vec3 start = (aSeed.xyz - 0.5) * vec3(11.0, 8.0, 6.0);
  float k = clamp((uAssemble - aSeed.w * 0.45) / 0.55, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  vec3 p = mix(start, position, k);

  // A slow shimmer keeps the portrait alive.
  p += 0.014 * vec3(sin(uTime * 1.3 + aSeed.x * 40.0), cos(uTime * 1.1 + aSeed.y * 40.0), sin(uTime * 0.9 + aSeed.z * 40.0));

  // Points move away from the pointer.
  vec2 away = p.xy - uPointer.xy;
  float near = (1.0 - smoothstep(0.0, 0.85, length(away))) * uPush;
  p.xy += normalize(away + 0.0001) * near * 0.5;
  p.z += near * 0.9 * (aSeed.z - 0.15);

  // Scrolling, or selecting the portrait, sends them outward.
  vec3 dir = normalize(aSeed.xyz - 0.5);
  p += dir * (uScatter * 7.0 * (0.35 + aSeed.w) + uBurst * 2.6 * aSeed.w);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uScale / -mv.z * (1.0 + near * 0.8);
  vColor = aColor;
}`;

const POINT_FRAGMENT = /* glsl */ `
varying vec3 vColor;
void main(){
  if (length(gl_PointCoord - 0.5) > 0.5) discard;
  gl_FragColor = vec4(vColor, 1.0);
}`;

interface SceneProps {
  still: boolean;
  hovered: Slug | null;
  onHover: (slug: Slug | null) => void;
  labels: RefObject<Record<Slug, HTMLElement | null>>;
}

function Scene({ still, hovered, onHover, labels }: SceneProps) {
  const portrait = usePortrait("/me.png");
  const { viewport, size, camera } = useThree();
  const figure = useRef<THREE.Group>(null);
  const objects = useRef<Record<Slug, THREE.Group | null>>({ repoverse: null, hivemind: null, voxui: null });
  const scales = useRef<Record<Slug, number>>({ repoverse: 1, hivemind: 1, voxui: 1 });
  const orbit = useRef({ angle: 0.6, speed: 1 });
  const burst = useRef(0);
  const assemble = useRef(still ? 1 : 0);
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAssemble: { value: 0 },
      uScatter: { value: 0 },
      uBurst: { value: 0 },
      uSize: { value: 0.03 },
      uScale: { value: 1 },
      uPointer: { value: new THREE.Vector3(99, 99, 0) },
      uPush: { value: 0 },
    }),
    [],
  );

  const scratch = useMemo(
    () => ({ ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(), point: new THREE.Vector3() }),
    [],
  );

  // Fit the portrait to the canvas: beside the text on wide screens, centred on narrow ones.
  const wide = size.width >= 900;
  const height = portrait?.height ?? 4.4;
  const fit = Math.min(1.15, (viewport.height * 0.84) / height, wide ? 9 : (viewport.width * 0.92) / PORTRAIT_WIDTH);
  const centerX = wide ? viewport.width * 0.235 : 0;
  const centerY = -viewport.height / 2 + (height * fit) / 2 - 0.05;

  useFrame((state, dt) => {
    // Write to the material's own uniforms: the renderer keeps its own copy of each one,
    // so changing the object passed in as a prop would not reach the shader.
    const u = material.current?.uniforms ?? uniforms;
    const step = Math.min(dt, 0.05);
    const ease = (rate: number) => 1 - Math.exp(-step * rate);
    const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);

    if (!still) u.uTime.value += step;
    // Real elapsed time, so the fly-in takes about two seconds even when frames are slow.
    assemble.current = still ? 1 : Math.min(1, assemble.current + Math.min(dt, 0.3) / 2.2);
    u.uAssemble.value = portrait ? assemble.current : 0;
    if (!portrait) assemble.current = still ? 1 : 0;
    u.uScatter.value += ((still ? 0 : scroll) - u.uScatter.value) * ease(4);
    burst.current *= Math.exp(-step * 2.2);
    u.uBurst.value = burst.current;
    u.uScale.value = (size.height * state.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(21)));
    u.uSize.value = (window.innerWidth < 700 ? 0.046 : 0.031) * fit;

    if (figure.current) {
      // The portrait turns a little toward the pointer.
      if (!still) {
        figure.current.rotation.y += (state.pointer.x * 0.32 - figure.current.rotation.y) * ease(3);
        figure.current.rotation.x += (-state.pointer.y * 0.14 - figure.current.rotation.x) * ease(3);
      }
      figure.current.updateMatrixWorld();

      // Where the pointer meets the portrait's plane, in the portrait's own space.
      scratch.ray.setFromCamera(state.pointer, camera);
      scratch.plane.constant = -0.4;
      if (scratch.ray.ray.intersectPlane(scratch.plane, scratch.hit)) {
        u.uPointer.value.copy(figure.current.worldToLocal(scratch.hit));
      }
      const inside = Math.abs(state.pointer.x) < 0.999 && Math.abs(state.pointer.y) < 0.999 && (state.pointer.x !== 0 || state.pointer.y !== 0);
      u.uPush.value += ((still || !inside ? 0 : 1) - u.uPush.value) * ease(6);
    }

    // The three project objects circle the portrait, passing in front of it and behind it.
    orbit.current.speed += ((hovered || still ? 0 : 1) - orbit.current.speed) * ease(5);
    orbit.current.angle += step * 0.32 * orbit.current.speed;
    SLUGS.forEach((slug, i) => {
      const group = objects.current[slug];
      if (!group) return;
      const a = orbit.current.angle + (i * Math.PI * 2) / 3;
      const rx = (wide ? PORTRAIT_WIDTH * 0.6 : PORTRAIT_WIDTH * 0.5) * fit + scroll * 1.2;
      // The ring is tilted: objects cross in front at chest height and behind at head height,
      // so they never sit on top of the face.
      group.position.set(centerX + Math.cos(a) * rx, centerY - Math.sin(a) * height * fit * 0.2, Math.sin(a) * 1.7 * fit + 0.5);
      const target = (hovered === slug ? 0.52 : 0.42) * fit;
      scales.current[slug] += (target - scales.current[slug]) * ease(10);
      group.scale.setScalar(scales.current[slug]);

      const label = labels.current[slug];
      if (label) {
        scratch.point.copy(group.position);
        scratch.point.y -= 1.55 * scales.current[slug];
        scratch.point.project(camera);
        label.style.transform = `translate(${((scratch.point.x * 0.5 + 0.5) * size.width).toFixed(1)}px, ${((-scratch.point.y * 0.5 + 0.5) * size.height).toFixed(1)}px) translate(-50%, 0)`;
      }
    });
  });

  return (
    <>
      <group ref={figure} position={[centerX, centerY, 0]} scale={fit}>
        {portrait && (
          <>
            <points geometry={portrait.geometry} frustumCulled={false}>
              <shaderMaterial ref={material} vertexShader={POINT_VERTEX} fragmentShader={POINT_FRAGMENT} uniforms={uniforms} />
            </points>
            {/* An unseen sheet over the portrait, so selecting it is cheap to detect. */}
            <mesh
              position={[0, 0, 0.5]}
              onClick={(e) => {
                e.stopPropagation();
                if (!still) burst.current = 1;
              }}
            >
              <planeGeometry args={[PORTRAIT_WIDTH * 0.8, portrait.height * 0.92]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </>
        )}
      </group>

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
    </>
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
