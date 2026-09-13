import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

interface ActivitySkyline3DProps {
  gridData: { date: string; count: number }[][];
  className?: string;
}

export function ActivitySkyline3D({
  gridData,
  className = "w-full h-80",
}: ActivitySkyline3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isKanrishaurus } = useTheme();
  const [hoveredInfo, setHoveredInfo] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !gridData || gridData.length === 0) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 14, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isKanrishaurus ? 0xff0044 : 0x00ff88, 2.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(isKanrishaurus ? 0xff0000 : 0x00f0ff, 3, 30);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, isKanrishaurus ? 0xff0000 : 0x00f0ff, 0x222244);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Flatten grid data for InstancedMesh
    const weeks = gridData.length;
    const daysPerWeek = 7;
    const totalCount = weeks * daysPerWeek;

    const buildingGeo = new THREE.BoxGeometry(0.35, 1, 0.35);
    const buildingMat = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.5,
    });

    const instancedMesh = new THREE.InstancedMesh(buildingGeo, buildingMat, totalCount);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const dataMap = new Map<number, { date: string; count: number }>();

    let idx = 0;
    const spacing = 0.45;
    const offsetX = (weeks * spacing) / 2;
    const offsetZ = (daysPerWeek * spacing) / 2;

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < daysPerWeek; d++) {
        const item = gridData[w]?.[d] || { date: "", count: 0 };
        dataMap.set(idx, item);

        const count = item.count;
        // Height scale based on commit count
        let h = 0.12;
        if (count > 0 && count < 3) h = 0.6;
        else if (count >= 3 && count < 6) h = 1.3;
        else if (count >= 6 && count < 10) h = 2.2;
        else if (count >= 10) h = 3.4;

        const posX = w * spacing - offsetX;
        const posZ = d * spacing - offsetZ;

        dummy.position.set(posX, h / 2, posZ);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(idx, dummy.matrix);

        // Colors
        if (count === 0) {
          color.setHex(0x181824);
        } else if (isKanrishaurus) {
          if (count < 3) color.setHex(0x550000);
          else if (count < 6) color.setHex(0x990000);
          else if (count < 10) color.setHex(0xdd0000);
          else color.setHex(0xff3333);
        } else {
          if (count < 3) color.setHex(0x0e4429);
          else if (count < 6) color.setHex(0x006d32);
          else if (count < 10) color.setHex(0x26a641);
          else color.setHex(0x39d353);
        }

        instancedMesh.setColorAt(idx, color);
        idx++;
      }
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    scene.add(instancedMesh);

    // Mouse Interaction Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(instancedMesh);

      if (intersects.length > 0) {
        const instanceId = intersects[0].instanceId;
        if (instanceId !== undefined && dataMap.has(instanceId)) {
          const info = dataMap.get(instanceId)!;
          setHoveredInfo({
            date: info.date,
            count: info.count,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          return;
        }
      }
      setHoveredInfo(null);
    };

    renderer.domElement.addEventListener("mousemove", handlePointerMove);

    // Camera Orbit Animation Loop
    let animId: number;
    let angle = 0;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMoveDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      angle += deltaX * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mousemove", onMouseMoveDrag);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        angle += 0.002;
      }

      const radius = 22;
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      camera.lookAt(0, 0, 0);

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
      renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("mousemove", onMouseMoveDrag);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      buildingGeo.dispose();
      buildingMat.dispose();
      renderer.dispose();
    };
  }, [gridData, isKanrishaurus]);

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border-2 border-white/20 bg-slate-950 ${className}`} ref={containerRef}>
      {/* 3D Orbit Control Hint */}
      <div className="absolute top-2 left-3 z-10 font-mono text-[8px] text-emerald-400 bg-black/70 px-2 py-0.5 rounded border border-emerald-500/30">
        🧊 3D VOXEL SKYLINE CITY // DRAG TO ROTATE 360°
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredInfo && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-black text-white text-[9px] px-2.5 py-1 rounded border border-emerald-400 font-display shadow-lg"
          style={{ left: hoveredInfo.x, top: hoveredInfo.y - 10 }}
        >
          <span className="text-emerald-300 font-bold">{hoveredInfo.count} XP</span> [{hoveredInfo.date}]
        </div>
      )}
    </div>
  );
}
