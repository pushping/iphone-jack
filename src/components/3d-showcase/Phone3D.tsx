import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, MeshDistortMaterial } from '@react-three/drei';
import type { Mesh, Group } from 'three';

function PhoneModel() {
  const groupRef = useRef<Group>(null);
  const screenRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
    if (screenRef.current) {
      screenRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Phone body */}
        <RoundedBox args={[1.4, 2.8, 0.12]} radius={0.15} smoothness={4}>
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.9}
            roughness={0.1}
          />
        </RoundedBox>

        {/* Screen */}
        <mesh ref={screenRef} position={[0, 0, 0.065]}>
          <RoundedBox args={[1.25, 2.6, 0.01]} radius={0.1} smoothness={4}>
            <MeshDistortMaterial
              color="#0f172a"
              speed={2}
              distort={0.05}
              radius={1}
            />
          </RoundedBox>
        </mesh>

        {/* Screen glow line */}
        <mesh position={[0, 0, 0.075]}>
          <planeGeometry args={[1.1, 2.3]} />
          <meshStandardMaterial
            color="#1e1b4b"
            emissive="#22d3ee"
            emissiveIntensity={0.15}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Camera module */}
        <group position={[-0.35, 0.85, 0.07]}>
          <RoundedBox args={[0.5, 0.5, 0.08]} radius={0.08} smoothness={4}>
            <meshStandardMaterial
              color="#1a1a2e"
              metalness={0.8}
              roughness={0.2}
            />
          </RoundedBox>
          {/* Camera lenses */}
          {[[-0.12, 0.12], [0.12, 0.12], [-0.12, -0.12]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.045]}>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
              <meshStandardMaterial
                color="#0f172a"
                emissive={i === 0 ? '#22d3ee' : '#3b82f6'}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      </group>
    </Float>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, 2, 4]} intensity={1} color="#22d3ee" distance={10} />
      <pointLight position={[3, -2, 2]} intensity={0.6} color="#c084fc" distance={10} />
    </>
  );
}

export function Phone3D() {
  return (
    <div className="w-full h-[500px] md:h-[600px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneLighting />
        <PhoneModel />
      </Canvas>
    </div>
  );
}
