import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ArrowLeft, Download, Trash2, Box, Sparkles, Paintbrush, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";

const PALETTE = [
  "#ff0055", "#ff5500", "#ffcc00", "#00ff66",
  "#00f0ff", "#0066ff", "#9900ff", "#ff00cc",
  "#ffffff", "#8888aa", "#333344", "#11111a",
];

interface VoxelData {
  x: number;
  y: number;
  z: number;
  color: string;
}

export default function WorkshopVoxel3D() {
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedColor, setSelectedColor] = useState<string>(PALETTE[4]);
  const [mode, setMode] = useState<"add" | "erase">("add");
  const [voxelCount, setVoxelCount] = useState<number>(0);
  const voxelsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const voxelDataRef = useRef<VoxelData[]>([]);

  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0a14);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 2, 20);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(16, 16, 0x00f0ff, 0x333355);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Orbit controls manual logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = { radius: 15, theta: Math.PI / 4, phi: Math.PI / 3 };

    const updateCameraPosition = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 1, 0);
    };
    updateCameraPosition();

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2 || e.shiftKey) {
        // Right click or Shift + Left click for Orbit rotation
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.01));

      previousMousePosition = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(4, Math.min(25, spherical.radius + e.deltaY * 0.01));
      updateCameraPosition();
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("contextmenu", (e) => e.preventDefault());

    // Raycaster for placing voxels
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.shiftKey) return; // Only normal left click

      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const objects = Array.from(voxelsRef.current.values()).concat([gridHelper as any]);
      const intersects = raycaster.intersectObjects(objects);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        if (mode === "add") {
          const normal = intersect.face?.normal || new THREE.Vector3(0, 1, 0);
          const p = intersect.point.clone().add(normal.clone().multiplyScalar(0.5));
          const vx = Math.round(p.x);
          const vy = Math.max(0, Math.round(p.y));
          const vz = Math.round(p.z);
          addVoxelAt(vx, vy, vz, selectedColor);
        } else if (mode === "erase") {
          if (intersect.object !== gridHelper) {
            removeVoxelMesh(intersect.object as THREE.Mesh);
          }
        }
      }
    };

    container.addEventListener("click", handleClick);

    // Initial default shape (Sword/Heart preset)
    loadPreset("sword");

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
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
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const addVoxelAt = (x: number, y: number, z: number, colorStr: string) => {
    const key = `${x},${y},${z}`;
    if (voxelsRef.current.has(key)) return;

    const scene = sceneRef.current;
    if (!scene) return;

    const geo = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorStr),
      roughness: 0.4,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
    voxelsRef.current.set(key, mesh);
    voxelDataRef.current.push({ x, y, z, color: colorStr });
    setVoxelCount(voxelsRef.current.size);
  };

  const removeVoxelMesh = (mesh: THREE.Mesh) => {
    const scene = sceneRef.current;
    if (!scene) return;

    for (const [key, m] of voxelsRef.current.entries()) {
      if (m === mesh) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        voxelsRef.current.delete(key);
        const [vx, vy, vz] = key.split(",").map(Number);
        voxelDataRef.current = voxelDataRef.current.filter(v => !(v.x === vx && v.y === vy && v.z === vz));
        setVoxelCount(voxelsRef.current.size);
        break;
      }
    }
  };

  const clearAllVoxels = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    voxelsRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    voxelsRef.current.clear();
    voxelDataRef.current = [];
    setVoxelCount(0);
  };

  const loadPreset = (preset: "sword" | "heart" | "castle") => {
    clearAllVoxels();
    if (preset === "sword") {
      // Hilt
      addVoxelAt(0, 0, 0, "#ff5500");
      addVoxelAt(0, 1, 0, "#ffcc00");
      addVoxelAt(-1, 1, 0, "#ffcc00");
      addVoxelAt(1, 1, 0, "#ffcc00");
      // Blade
      for (let y = 2; y <= 7; y++) {
        addVoxelAt(0, y, 0, "#00f0ff");
      }
      addVoxelAt(0, 8, 0, "#ffffff");
    } else if (preset === "heart") {
      const heartCoords = [
        [0,0], [1,0], [-1,0],
        [-1,1], [0,1], [1,1], [2,1], [-2,1],
        [-1,2], [0,2], [1,2], [2,2], [-2,2],
        [-1,3], [1,3],
      ];
      heartCoords.forEach(([x, y]) => addVoxelAt(x, y, 0, "#ff0055"));
    } else if (preset === "castle") {
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          for (let y = 0; y <= 3; y++) {
            if (y === 3 && (x % 2 !== 0 || z % 2 !== 0)) continue;
            addVoxelAt(x, y, z, y === 0 ? "#333344" : "#8888aa");
          }
        }
      }
    }
  };

  const exportOBJ = () => {
    let objText = "# 3D Voxel Model Exporter (Pixel Portfolio)\n";
    let vertexCount = 1;

    voxelDataRef.current.forEach((v) => {
      const minX = v.x - 0.475, maxX = v.x + 0.475;
      const minY = v.y - 0.475, maxY = v.y + 0.475;
      const minZ = v.z - 0.475, maxZ = v.z + 0.475;

      // 8 Vertices per voxel
      objText += `v ${minX} ${minY} ${minZ}\n`;
      objText += `v ${maxX} ${minY} ${minZ}\n`;
      objText += `v ${maxX} ${maxY} ${minZ}\n`;
      objText += `v ${minX} ${maxY} ${minZ}\n`;
      objText += `v ${minX} ${minY} ${maxZ}\n`;
      objText += `v ${maxX} ${minY} ${maxZ}\n`;
      objText += `v ${maxX} ${maxY} ${maxZ}\n`;
      objText += `v ${minX} ${maxY} ${maxZ}\n`;

      // 6 Faces (quads)
      const vc = vertexCount;
      objText += `f ${vc} ${vc+1} ${vc+2} ${vc+3}\n`;
      objText += `f ${vc+5} ${vc+4} ${vc+7} ${vc+6}\n`;
      objText += `f ${vc+4} ${vc} ${vc+3} ${vc+7}\n`;
      objText += `f ${vc+1} ${vc+5} ${vc+6} ${vc+2}\n`;
      objText += `f ${vc+3} ${vc+2} ${vc+6} ${vc+7}\n`;
      objText += `f ${vc+4} ${vc+5} ${vc+1} ${vc}\n`;

      vertexCount += 8;
    });

    const blob = new Blob([objText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `voxel_model_${Date.now()}.obj`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <SEO title="3D Voxel Workshop | Studio Exporter" description="Create and export 3D pixel voxel models in browser." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => { navigate("/secret-dungeon"); playButtonSound(); }}
          className="pixel-btn py-2 px-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={14} /> BACK TO DUNGEON
        </button>

        <div className="flex items-center gap-2">
          <span className="pixel-panel px-3 py-1 bg-cyan-500/10 border-cyan-500/50 font-display text-[10px] text-cyan-400">
            3D VOXEL WORKSHOP // VOXELS: {voxelCount}
          </span>
          <button
            onClick={exportOBJ}
            className="pixel-btn py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 text-xs"
          >
            <Download size={14} /> EXPORT .OBJ
          </button>
        </div>
      </div>

      {/* Main Studio Viewport & Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Toolbar */}
        <div className="pixel-panel p-4 bg-card/80 flex flex-col gap-4">
          <div>
            <h3 className="font-display text-xs text-primary mb-2 flex items-center gap-1">
              <Paintbrush size={14} /> MODE
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("add")}
                className={`pixel-btn py-2 text-xs flex items-center justify-center gap-1 ${
                  mode === "add" ? "bg-cyan-500 text-black font-bold" : "bg-muted"
                }`}
              >
                <Box size={14} /> ADD
              </button>
              <button
                onClick={() => setMode("erase")}
                className={`pixel-btn py-2 text-xs flex items-center justify-center gap-1 ${
                  mode === "erase" ? "bg-rose-500 text-white font-bold" : "bg-muted"
                }`}
              >
                <Trash2 size={14} /> ERASE
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xs text-primary mb-2">PALETTE</h3>
            <div className="grid grid-cols-4 gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => { setSelectedColor(c); setMode("add"); }}
                  className={`w-full aspect-square rounded border-2 transition-transform ${
                    selectedColor === c ? "border-white scale-110 shadow-lg" : "border-black/40 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-xs text-primary mb-2 flex items-center gap-1">
              <Sparkles size={14} /> PRESETS
            </h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => loadPreset("sword")} className="pixel-btn py-1.5 text-[10px] text-left px-2 bg-slate-800 hover:bg-slate-700">
                🗡️ Laser Sword
              </button>
              <button onClick={() => loadPreset("heart")} className="pixel-btn py-1.5 text-[10px] text-left px-2 bg-slate-800 hover:bg-slate-700">
                ❤️ 8-Bit Heart
              </button>
              <button onClick={() => loadPreset("castle")} className="pixel-btn py-1.5 text-[10px] text-left px-2 bg-slate-800 hover:bg-slate-700">
                🏰 Voxel Castle
              </button>
            </div>
          </div>

          <button
            onClick={clearAllVoxels}
            className="pixel-btn py-2 bg-rose-900/50 hover:bg-rose-800 text-rose-300 text-xs flex items-center justify-center gap-2 mt-auto"
          >
            <RotateCcw size={14} /> CLEAR ALL
          </button>
        </div>

        {/* 3D Canvas */}
        <div className="lg:col-span-3 pixel-panel p-2 bg-black relative min-h-[500px] overflow-hidden">
          <div ref={containerRef} className="w-full h-[500px] cursor-crosshair" />
          <div className="absolute bottom-4 left-4 pointer-events-none bg-black/70 px-3 py-1.5 rounded border border-white/10 text-[10px] font-mono text-muted-foreground">
            💡 Left Click: Place/Erase Voxel | Right Click / Shift+Click: Orbit Rotate | Scroll: Zoom
          </div>
        </div>
      </div>
    </div>
  );
}
