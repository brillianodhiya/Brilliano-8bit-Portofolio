import { useEffect, useRef } from "react";
import * as THREE from "three";

interface AvatarDiorama3DProps {
  skin?: string;
  name?: string;
  className?: string;
}

// Color palettes for procedural voxel avatars
const SKIN_PALETTES: Record<string, { body: number; accent: number; detail: number; eye: number }> = {
  cat: { body: 0xffa500, accent: 0xffffff, detail: 0xe07a00, eye: 0x00ffcc },
  demon: { body: 0xcc1133, accent: 0x330000, detail: 0xff4422, eye: 0xffff00 },
  f_knight_1: { body: 0x888899, accent: 0x2244aa, detail: 0xccccdd, eye: 0x00e5ff },
  f_knight_2: { body: 0xaa7744, accent: 0x882233, detail: 0xddbb99, eye: 0xff0055 },
  knight: { body: 0x556677, accent: 0xaa2222, detail: 0x8899aa, eye: 0x00ffcc },
  rex: { body: 0x22aa44, accent: 0x88ee55, detail: 0x116622, eye: 0xffcc00 },
};

export function AvatarDiorama3D({ skin = "cat", name = "HERO", className = "w-full h-64" }: AvatarDiorama3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 250;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 3.5, 5);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00ffff, 3, 10);
    pointLight.position.set(0, 0.5, 0);
    scene.add(pointLight);

    // Group for turntable rotation
    const dioramanGroup = new THREE.Group();
    scene.add(dioramanGroup);

    // Pedestal Platform (Floating 3D Voxel Stage)
    const voxelGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.8 });
    const neonMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.6 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 });

    // Build Circular Floating Island
    const radius = 1.8;
    for (let x = -6; x <= 6; x++) {
      for (let z = -6; z <= 6; z++) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist <= 5.5) {
          const isEdge = dist > 4.5;
          const mat = isEdge ? neonMat : (dist < 2 ? goldMat : stoneMat);
          const voxel = new THREE.Mesh(voxelGeo, mat);
          voxel.position.set(x * 0.3, -0.15 - (isEdge ? 0.05 : 0), z * 0.3);
          voxel.receiveShadow = true;
          voxel.castShadow = true;
          dioramanGroup.add(voxel);
        }
      }
    }

    // Procedural Voxel Character Model based on skin
    const palette = SKIN_PALETTES[skin] || SKIN_PALETTES.cat;
    const bodyMat = new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.6 });
    const accentMat = new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.5 });
    const detailMat = new THREE.MeshStandardMaterial({ color: palette.detail, roughness: 0.5 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: palette.eye, emissive: palette.eye, emissiveIntensity: 0.8 });

    const avatarGroup = new THREE.Group();
    avatarGroup.position.set(0, 0.15, 0);

    const unit = 0.12;
    const charVoxelGeo = new THREE.BoxGeometry(unit, unit, unit);

    const addVoxel = (x: number, y: number, z: number, mat: THREE.Material) => {
      const mesh = new THREE.Mesh(charVoxelGeo, mat);
      mesh.position.set(x * unit, y * unit, z * unit);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      avatarGroup.add(mesh);
    };

    // Body (4x6x3)
    for (let bx = -1; bx <= 1; bx++) {
      for (let by = 0; by <= 5; by++) {
        for (let bz = -1; bz <= 1; bz++) {
          const isFrontDetail = bz === 1 && by >= 2 && by <= 4 && bx === 0;
          addVoxel(bx, by, bz, isFrontDetail ? accentMat : bodyMat);
        }
      }
    }

    // Legs
    for (let lx of [-1, 1]) {
      for (let ly = -3; ly <= -1; ly++) {
        addVoxel(lx, ly, 0, detailMat);
      }
    }

    // Head (5x5x5)
    const headYOffset = 8;
    for (let hx = -2; hx <= 2; hx++) {
      for (let hy = 0; hy <= 4; hy++) {
        for (let hz = -2; hz <= 2; hz++) {
          const isEye = hy === 2 && hz === 2 && (hx === -1 || hx === 1);
          const isCheek = hy === 1 && hz === 2 && (hx === -2 || hx === 2);
          addVoxel(hx, headYOffset + hy, hz, isEye ? eyeMat : (isCheek ? accentMat : bodyMat));
        }
      }
    }

    // Special Accessories (Cat Ears & Tail / Demon Wings & Horns / Knight Shield & Sword / T-Rex Snout)
    if (skin === 'cat') {
      // Ears
      addVoxel(-2, headYOffset + 5, 0, accentMat);
      addVoxel(-1, headYOffset + 5, 0, accentMat);
      addVoxel(1, headYOffset + 5, 0, accentMat);
      addVoxel(2, headYOffset + 5, 0, accentMat);
      // Cat Tail
      for (let ty = 0; ty <= 4; ty++) {
        addVoxel(0, ty, -2 - (ty > 2 ? 1 : 0), accentMat);
      }
    } else if (skin === 'demon') {
      // Horns
      addVoxel(-2, headYOffset + 5, 0, detailMat);
      addVoxel(-2, headYOffset + 6, 1, eyeMat);
      addVoxel(2, headYOffset + 5, 0, detailMat);
      addVoxel(2, headYOffset + 6, 1, eyeMat);
      // Fiery Demon Wings
      for (let wy = 1; wy <= 5; wy++) {
        addVoxel(-2 - wy, wy + 2, -1, eyeMat);
        addVoxel(2 + wy, wy + 2, -1, eyeMat);
      }
    } else if (skin.includes('knight')) {
      // Helmet Visor
      for (let vx = -2; vx <= 2; vx++) {
        addVoxel(vx, headYOffset + 2, 2, accentMat);
      }
      // 3D Voxel Sword in hand
      for (let sy = -1; sy <= 7; sy++) {
        addVoxel(2, sy, 1, sy > 1 ? eyeMat : accentMat);
      }
    } else if (skin === 'rex') {
      // Dino Snout
      for (let sx = -1; sx <= 1; sx++) {
        for (let sy = 7; sy <= 9; sy++) {
          addVoxel(sx, sy, 3, detailMat);
        }
      }
    }

    dioramanGroup.add(avatarGroup);

    // Floating Sparkle Particles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 4;
      positions[i + 1] = Math.random() * 3;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.08,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    dioramanGroup.add(particles);

    // Mouse Interaction (Orbit Tilt)
    let mouseX = 0;
    let targetRotationY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    let time = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.02;

      // Turntable smooth auto-rotation + mouse tilt
      targetRotationY += 0.008;
      dioramanGroup.rotation.y = targetRotationY + mouseX * 0.5;

      // Gentle floating animation for character
      avatarGroup.position.y = 0.15 + Math.sin(time * 2) * 0.08;
      avatarGroup.rotation.y = Math.sin(time) * 0.1;

      // Particle floating drift
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posArr[i] += 0.005;
        if (posArr[i] > 3) posArr[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      voxelGeo.dispose();
      stoneMat.dispose();
      neonMat.dispose();
      goldMat.dispose();
      charVoxelGeo.dispose();
      bodyMat.dispose();
      accentMat.dispose();
      detailMat.dispose();
      eyeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [skin]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.15)] ${className}`}>
      <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest">
          3D DIORAMA // {name}
        </span>
      </div>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
