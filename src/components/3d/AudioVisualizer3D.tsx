import { useEffect, useRef } from "react";
import * as THREE from "three";

interface AudioVisualizer3DProps {
  isPlaying?: boolean;
  audioData?: Uint8Array | number[];
  className?: string;
}

const BARS_COUNT = 24;

export function AudioVisualizer3D({
  isPlaying = false,
  audioData,
  className = "w-full h-24",
}: AudioVisualizer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 100;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a16, 1.0);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 2);
    dirLight.position.set(2, 5, 3);
    scene.add(dirLight);

    // InstancedMesh for 3D Spectrum Voxel Bars
    const barGeo = new THREE.BoxGeometry(0.18, 1, 0.18);
    const barMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0055aa,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });

    const instancedMesh = new THREE.InstancedMesh(barGeo, barMat, BARS_COUNT);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < BARS_COUNT; i++) {
      dummy.position.set((i - BARS_COUNT / 2) * 0.22, 0, 0);
      dummy.scale.set(1, 0.2, 1);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);

    // Floor Mirror Reflection Line
    const gridHelper = new THREE.GridHelper(8, 16, 0xff0055, 0x222244);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Animation loop
    let animId: number;
    let time = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.05;

      for (let i = 0; i < BARS_COUNT; i++) {
        let val = 0.2;
        if (isPlaying) {
          if (audioData && audioData.length > i) {
            val = (audioData[i] / 255) * 3 + 0.1;
          } else {
            // Procedural Chiptune wave simulation
            val = Math.sin(time * 3 + i * 0.4) * 1.2 + Math.cos(time * 2 - i * 0.3) * 0.8 + 1.2;
          }
        }

        val = Math.max(0.1, val);

        dummy.position.set((i - BARS_COUNT / 2) * 0.22, val / 2, 0);
        dummy.scale.set(1, val, 1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        // Dynamic Color Gradient (Cyan to Pink to Gold)
        const hue = (0.5 + (val / 4) * 0.5) % 1.0;
        color.setHSL(hue, 0.9, 0.5);
        instancedMesh.setColorAt(i, color);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
      }

      // Slow scene tilt angle
      scene.rotation.y = Math.sin(time * 0.3) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      barGeo.dispose();
      barMat.dispose();
    };
  }, [isPlaying, audioData]);

  return (
    <div className={`relative overflow-hidden rounded border-2 border-white bg-slate-950 shadow-2xl ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-1 left-2 text-[8px] font-mono text-cyan-300 uppercase tracking-widest pointer-events-none bg-black/60 px-1 rounded">
        3D CHIPTUNE SPECTRUM // {isPlaying ? "PLAYING" : "IDLE"}
      </div>
    </div>
  );
}
