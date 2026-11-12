"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

/**
 * Three objects, one per project: an orbit model for Repoverse, a honeycomb
 * for Hivemind and a noise-displaced orb for VoxUI. Hover one to lift it,
 * select it to jump to its project.
 */

type Slug = "repoverse" | "hivemind" | "voxui";

const PLACES: Record<Slug, [number, number, number]> = {
  repoverse: [-1.5, 0.95, 0],
  hivemind: [0.25, -1.05, 0.6],
  voxui: [1.9, 1.0, -0.2],
};

/** How far below its centre each object's caption sits, in world units. */
const DROPS: Record<Slug, number> = { repoverse: 1.6, hivemind: 1.2, voxui: 1.25 };

const NAMES: Record<Slug, string> = { repoverse: "Repoverse", hivemind: "Hivemind", voxui: "VoxUI" };

function goTo(slug: Slug) {
  document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface ObjectProps {
  slug: Slug;
  still: boolean;
  hovered: Slug | null;
  onHover: (slug: Slug | null) => void;
  children: React.ReactNode;
}

/** Shared behaviour: float, lift on hover, select to navigate. */
function Floating({ slug, still, hovered, onHover, children }: ObjectProps) {
  const group = useRef<THREE.Group>(null);
  const scale = useRef(1);
  const [x, y, z] = PLACES[slug];
  const phase = x * 1.7;

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.position.y = y + (still ? 0 : Math.sin(t * 0.9 + phase) * 0.12);
    const target = hovered === slug ? 1.14 : hovered ? 0.94 : 1;
    scale.current += (target - scale.current) * (1 - Math.exp(-Math.min(dt, 0.05) * 10));
    group.current.scale.setScalar(scale.current);
  });

  return (
    <group
      ref={group}
      position={[x, y, z]}
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
      {children}
    </group>
  );
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
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    if (!still) uniforms.uTime.value += Math.min(dt, 0.05);
  });
  return (
    <mesh>
      <icosahedronGeometry args={[0.92, 32]} />
      <shaderMaterial vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} />
    </mesh>
  );
}

/** Keeps the DOM captions under their objects and turns the scene with the scroll. */
function Stage({ still, labels, children }: { still: boolean; labels: RefObject<Record<Slug, HTMLElement | null>>; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const point = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size, pointer }, dt) => {
    if (!group.current) return;
    if (!still) {
      const k = 1 - Math.exp(-Math.min(dt, 0.05) * 3);
      const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.2);
      group.current.rotation.y += (pointer.x * 0.22 + scroll * 0.9 - group.current.rotation.y) * k;
      group.current.rotation.x += (-pointer.y * 0.1 - group.current.rotation.x) * k;
      group.current.updateMatrixWorld();
    }
    // On narrow screens pull the objects closer together so all three fit.
    const fit = Math.min(1, size.width / 620);
    group.current.scale.setScalar(0.62 + 0.38 * fit);
    (Object.keys(PLACES) as Slug[]).forEach((slug) => {
      const el = labels.current[slug];
      if (!el) return;
      const [x, y, z] = PLACES[slug];
      point.set(x, y - DROPS[slug], z).applyMatrix4(group.current!.matrixWorld).project(camera);
      el.style.transform = `translate(${((point.x * 0.5 + 0.5) * size.width).toFixed(1)}px, ${((-point.y * 0.5 + 0.5) * size.height).toFixed(1)}px) translate(-50%, 0)`;
    });
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene({ still }: { still: boolean }) {
  const [hovered, setHovered] = useState<Slug | null>(null);
  const labels = useRef<Record<Slug, HTMLElement | null>>({ repoverse: null, hivemind: null, voxui: null });
  const shared = { still, hovered, onHover: setHovered };

  return (
    <div className="scene" style={{ cursor: hovered ? "pointer" : "default" }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 9], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />
        <directionalLight position={[-5, -2, 2]} intensity={0.5} color="#BFC8FF" />
        <Stage still={still} labels={labels}>
          <Floating slug="repoverse" {...shared}>
            <Orbits still={still} />
          </Floating>
          <Floating slug="hivemind" {...shared}>
            <Honeycomb still={still} />
          </Floating>
          <Floating slug="voxui" {...shared}>
            <Blob still={still} />
          </Floating>
        </Stage>
      </Canvas>
      <div className="scene-labels">
        {(Object.keys(NAMES) as Slug[]).map((slug) => (
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
