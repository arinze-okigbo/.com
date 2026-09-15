"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Sculpture() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const cloud = useRef<THREE.Points>(null);
  const previous = useRef({ x: 0, y: 0, velocity: 0 });
  const paths = useMemo(
    () =>
      Array.from({ length: 14 }, (_, ring) =>
        Array.from({ length: 129 }, (_, i) => {
          const t = (i / 128) * Math.PI * 2;
          const twist = (ring / 14) * Math.PI;
          const radius = 1.65 + Math.sin(t * 3 + twist) * 0.12;
          return new THREE.Vector3(
            Math.cos(t) * radius,
            Math.sin(t) * Math.cos(twist) * radius,
            Math.sin(t) * Math.sin(twist) * radius,
          );
        }),
      ),
    [],
  );
  const particles = useMemo(() => {
    const positions = new Float32Array(720 * 3);
    for (let i = 0; i < 720; i++) {
      const theta = i * 2.399963229728653;
      const vertical = 1 - (i / 719) * 2;
      const radial = Math.sqrt(1 - vertical * vertical);
      const radius = 2.2 + Math.sin(i * 13.3) * 0.24;
      positions.set(
        [Math.cos(theta) * radial * radius, vertical * radius, Math.sin(theta) * radial * radius],
        i * 3,
      );
    }
    return positions;
  }, []);
  useFrame(({ pointer, clock }, delta) => {
    if (!group.current || !core.current || !cloud.current) return;
    const dt = Math.min(delta, 0.05);
    const velocity =
      Math.hypot(pointer.x - previous.current.x, pointer.y - previous.current.y) /
      Math.max(dt, 0.001);
    previous.current.velocity = THREE.MathUtils.damp(
      previous.current.velocity,
      Math.min(velocity, 5),
      5,
      dt,
    );
    previous.current.x = pointer.x;
    previous.current.y = pointer.y;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      pointer.x * 0.36 + clock.elapsedTime * 0.045,
      3,
      dt,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -0.25 + pointer.y * 0.25,
      3,
      dt,
    );
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.08;
    const scale = 1 + previous.current.velocity * 0.025;
    core.current.scale.setScalar(scale);
    core.current.rotation.y += dt * 0.09;
    cloud.current.rotation.y -= dt * 0.012;
  });
  return (
    <group ref={group} rotation={[-0.25, 0.15, -0.15]}>
      {paths.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={i % 3 === 0 ? "#d0ffe4" : "#8debc0"}
          transparent
          opacity={0.32 + (i % 3) * 0.16}
          lineWidth={0.8}
        />
      ))}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.57, 3]} />
        <meshPhysicalMaterial
          color="#78d9af"
          roughness={0.35}
          metalness={0.55}
          clearcoat={1}
          transparent
          opacity={0.82}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.73, 1]} />
        <meshBasicMaterial color="#b9f6d3" wireframe transparent opacity={0.17} />
      </mesh>
      <points ref={cloud}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#b9f6d3"
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function OrbitalScene({
  active,
  onFailure,
}: {
  active: boolean;
  onFailure: () => void;
}) {
  return (
    <Canvas
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", onFailure, { once: true });
      }}
      aria-hidden="true"
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.8], fov: 44 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 4, 5]} intensity={3} color="#d6ffe9" />
      <pointLight position={[-3, -2, 2]} intensity={14} color="#82c6b5" />
      <Sculpture />
    </Canvas>
  );
}
