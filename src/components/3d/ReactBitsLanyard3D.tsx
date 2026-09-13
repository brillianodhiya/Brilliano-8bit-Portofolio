import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import {
  ChevronLeft,
  ChevronRight,
  Move,
  RotateCcw,
  X
} from "lucide-react";
import { playButtonSound } from "@/lib/audio";
import { QuestItem } from "@/pages/Experience";

interface ReactBitsLanyard3DProps {
  quest: QuestItem;
  onClose: () => void;
  onNextQuest?: () => void;
  onPrevQuest?: () => void;
  hasMultiple?: boolean;
  currentIndex?: number;
  totalQuests?: number;
}

// Helper to construct image URLs
const getImageUrl = (image?: string) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.BASE_URL}images/${image}`;
};

export function ReactBitsLanyard3D({
  quest,
  onClose,
  onNextQuest,
  onPrevQuest,
  hasMultiple = false,
  currentIndex = 0,
  totalQuests = 1,
}: ReactBitsLanyard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    // 1. THREE.JS SCENE SETUP
    const scene = new THREE.Scene();

    // Camera centered on compact hanging card
    const camera = new THREE.PerspectiveCamera(24, width / height, 0.1, 1000);
    camera.position.set(0, -0.4, 14);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Lighting Setup (Matching React Bits environment lightformers)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 10, 10);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.0); // Purple accent rim
    dirLight2.position.set(-8, -5, 5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xfbbf24, 2.0, 20); // Warm yellow glow
    pointLight.position.set(0, 2, 5);
    scene.add(pointLight);

    // 2. CREATE CARD COMPOSITE CANVAS TEXTURE (Front & Back)
    const createCardTexture = (isFront: boolean) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1350);
      grad.addColorStop(0, "#09090b");
      grad.addColorStop(0.5, "#18181b");
      grad.addColorStop(1, "#030712");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1350);

      // Outer Neon Pixel Border
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 24;
      ctx.strokeRect(20, 20, 984, 1310);

      // Inner Border
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, 944, 1270);

      // Top Punch Hole Slot
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.roundRect(437, 60, 150, 32, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Helper to draw text with automatic font size fitting so text never overflows the 3D card
      const drawFittedText = (
        text: string,
        y: number,
        defaultFontSize: number,
        fontFamily: string,
        color: string,
        maxW = 840,
        isItalic = false
      ) => {
        let fontSize = defaultFontSize;
        const fontStyle = isItalic ? "italic" : "";
        ctx.fillStyle = color;
        ctx.font = `${fontStyle} bold ${fontSize}px ${fontFamily}`;
        let width = ctx.measureText(text).width;
        while (width > maxW && fontSize > 16) {
          fontSize -= 2;
          ctx.font = `${fontStyle} bold ${fontSize}px ${fontFamily}`;
          width = ctx.measureText(text).width;
        }
        ctx.fillText(text, 512, y);
      };

      if (isFront) {
        // --- FRONT FACE: ID PASS DETAILS ---
        // Header Text
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 32px 'Press Start 2P', monospace, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("OFFICIAL EMPLOYEE ID PASS", 512, 160);

        ctx.fillStyle = "#a855f7";
        ctx.font = "bold 26px monospace";
        ctx.fillText(`RANK: ${quest.rank || "MEMBER"}`, 512, 210);

        // --- 3D EMBOSSED RELIEF LOGO BOX (Timbul Effect) ---
        // 1. Deep 3D Outer Drop Shadow
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 16;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(362, 260, 300, 300, 24);
        ctx.fill();
        ctx.restore();

        // 2. Light Top/Left 3D Bevel Highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.roundRect(358, 256, 308, 308, 26);
        ctx.stroke();

        // 3. Dark Bottom/Right 3D Bevel Shadow
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.roundRect(364, 262, 298, 298, 24);
        ctx.stroke();

        // 4. Inner White Badge Box
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(362, 260, 300, 300, 24);
        ctx.fill();

        // 5. Glossy Diagonal 3D Glass Shine Reflection
        const shineGrad = ctx.createLinearGradient(362, 260, 662, 560);
        shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
        shineGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.08)");
        shineGrad.addColorStop(1, "rgba(0, 0, 0, 0.15)");
        ctx.fillStyle = shineGrad;
        ctx.beginPath();
        ctx.roundRect(362, 260, 300, 300, 24);
        ctx.fill();

        // Fallback Company Initial Letter Logo (shown if image is missing/loading)
        const initialChar = (quest.company || "C").trim().charAt(0).toUpperCase();
        ctx.fillStyle = "#18181b";
        ctx.font = "900 130px monospace";
        ctx.textAlign = "center";
        ctx.fillText(initialChar, 512, 450);

        // Company Details with Auto-Fitting Font Size to Prevent Overflow
        drawFittedText(`@${quest.company}`, 630, 42, "monospace", "#ffffff", 840);
        drawFittedText(quest.position, 695, 32, "monospace", "#fbbf24", 840);
        drawFittedText(quest.period, 755, 28, "sans-serif", "#9ca3af", 840, true);

        // Status Badge Box
        const isOngoing = quest.period.toLowerCase().includes("present");
        ctx.fillStyle = isOngoing ? "#083344" : "#052e16";
        ctx.strokeStyle = isOngoing ? "#22d3ee" : "#4ade80";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(262, 820, 500, 80, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isOngoing ? "#22d3ee" : "#4ade80";
        ctx.font = "bold 28px monospace";
        ctx.fillText(isOngoing ? "[ ACTIVE_EMPLOYEE ]" : "[ CAMPAIGN_CLEARED ]", 512, 870);

        // Tech Stack Footer
        if (quest.tech && quest.tech.length > 0) {
          ctx.fillStyle = "#9ca3af";
          ctx.font = "bold 22px monospace";
          ctx.fillText("EQUIPPED SKILLS:", 512, 970);

          ctx.fillStyle = "#c084fc";
          const techStr = quest.tech.slice(0, 5).join(" • ");
          drawFittedText(techStr, 1020, 24, "monospace", "#c084fc", 840);
        }

        ctx.fillStyle = "#6b7280";
        ctx.font = "bold 22px monospace";
        ctx.fillText("VERIFIED WORK PASS - 3D LANYARD", 512, 1260);

        // Draw Image Logo with CORS Fallback
        const logoUrl = getImageUrl(quest.logo);
        if (logoUrl) {
          const drawLogoImage = (imgSrc: string, useCors: boolean) => {
            const img = new Image();
            if (useCors && imgSrc.startsWith("http")) {
              img.crossOrigin = "Anonymous";
            }
            img.onload = () => {
              ctx.fillStyle = "#ffffff";
              ctx.beginPath();
              ctx.roundRect(372, 270, 280, 280, 20);
              ctx.fill();

              // Preserve natural aspect ratio (object-fit: contain) to prevent squishing/gepeng
              const maxW = 250;
              const maxH = 250;
              const imgW = img.naturalWidth || img.width || 1;
              const imgH = img.naturalHeight || img.height || 1;
              const aspect = imgW / imgH;
              let dw = maxW;
              let dh = maxH;
              if (aspect > 1) {
                dh = maxW / aspect;
              } else {
                dw = maxH * aspect;
              }
              const dx = 512 - dw / 2;
              const dy = 410 - dh / 2;

              ctx.drawImage(img, dx, dy, dw, dh);
              texture.needsUpdate = true;
            };
            if (useCors) {
              img.onerror = () => {
                // Retry without crossOrigin if CORS failed
                drawLogoImage(imgSrc, false);
              };
            }
            img.src = imgSrc;
          };
          drawLogoImage(logoUrl, true);
        }
      } else {
        // --- BACK FACE: OBJECTIVES LIST ---
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 34px monospace";
        ctx.textAlign = "center";
        ctx.fillText("CAMPAIGN OBJECTIVES CLEARED", 512, 150);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px monospace";
        ctx.fillText(`@${quest.company}`, 512, 220);

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(100, 260);
        ctx.lineTo(924, 260);
        ctx.stroke();

        ctx.textAlign = "left";
        ctx.font = "28px sans-serif";
        ctx.fillStyle = "#e4e4e7";

        let yPos = 320;
        quest.description.slice(0, 6).forEach((desc, idx) => {
          ctx.fillStyle = "#fbbf24";
          ctx.fillText(`[0${idx + 1}]`, 80, yPos);

          ctx.fillStyle = "#f4f4f5";
          // Wrap text
          const words = desc.split(" ");
          let line = "";
          let lineY = yPos;
          for (let w = 0; w < words.length; w++) {
            const testLine = line + words[w] + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 720 && w > 0) {
              ctx.fillText(line, 160, lineY);
              line = words[w] + " ";
              lineY += 38;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 160, lineY);
          yPos = lineY + 55;
        });

        ctx.fillStyle = "#a855f7";
        ctx.font = "bold 24px monospace";
        ctx.textAlign = "center";
        ctx.fillText("PASS ID SECURITY VERIFIED", 512, 1260);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const frontTexture = createCardTexture(true);
    const backTexture = createCardTexture(false);

    // 3. CREATE ULTRA-PREMIUM 3D ACRYLIC ID CARD MESH
    const cardWidth = 2.4;
    const cardHeight = 3.2;
    const cardDepth = 0.20; // Premium 3D acrylic block thickness

    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
    // Shift card geometry down so its top punch hole center is at (0, 0, 0)
    cardGeometry.translate(0, -cardHeight / 2, 0);

    // Dark crystal obsidian side edges material
    const sideMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x18181b,
      roughness: 0.08,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
    });

    // Glossy clearcoat acrylic front & back face materials
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      ior: 1.5,
    });

    const backMaterial = new THREE.MeshPhysicalMaterial({
      map: backTexture,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      ior: 1.5,
    });

    const cardMaterials = [
      sideMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
      frontMaterial,
      backMaterial,
    ];

    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterials);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;

    // Chrome Eyelet Ring embedded inside top punch hole slot for seamless rope connection
    const eyeletGeo = new THREE.TorusGeometry(0.18, 0.04, 16, 32);
    const eyeletMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      roughness: 0.1,
      metalness: 0.95,
    });
    const eyeletMesh = new THREE.Mesh(eyeletGeo, eyeletMat);
    eyeletMesh.rotation.x = Math.PI / 2;
    eyeletMesh.position.set(0, 0, 0);
    cardMesh.add(eyeletMesh);

    // 4. PHYSICS PENDULUM ROPE NODES & SIMULATION (Compact Short Lanyard)
    const numSegments = 5;
    const segmentLength = 0.45;

    interface PhysicsNode {
      pos: THREE.Vector3;
      oldPos: THREE.Vector3;
      vel: THREE.Vector3;
    }

    const nodes: PhysicsNode[] = [];
    // Pin top anchor above the browser window top-0 boundary (Y = 3.8)
    const topAnchor = new THREE.Vector3(0, 3.8, 0);

    for (let i = 0; i <= numSegments; i++) {
      const pos = new THREE.Vector3(0, topAnchor.y - i * segmentLength, 0);
      nodes.push({
        pos: pos.clone(),
        oldPos: pos.clone(),
        vel: new THREE.Vector3(0, 0, 0),
      });
    }

    // 5. CREATE WOVEN LANYARD STRAP TUBE MESH (Thick 3D Ribbon Texture)
    const curvePoints = nodes.map((n) => n.pos);
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 48, 0.14, 12, false);

    // Woven Fabric Texture for Strap
    const strapCanvas = document.createElement("canvas");
    strapCanvas.width = 128;
    strapCanvas.height = 128;
    const sCtx = strapCanvas.getContext("2d");
    if (sCtx) {
      sCtx.fillStyle = "#4c1d95";
      sCtx.fillRect(0, 0, 128, 128);
      sCtx.fillStyle = "#6d28d9";
      sCtx.fillRect(0, 0, 64, 128);
      sCtx.fillStyle = "#fbbf24";
      sCtx.fillRect(56, 0, 16, 128);
    }
    const strapTexture = new THREE.CanvasTexture(strapCanvas);
    strapTexture.wrapS = THREE.RepeatWrapping;
    strapTexture.wrapT = THREE.RepeatWrapping;
    strapTexture.repeat.set(1, 10);

    const tubeMaterial = new THREE.MeshStandardMaterial({
      map: strapTexture,
      roughness: 0.7,
      metalness: 0.1,
    });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tubeMesh);

    // Add card mesh to the bottom node of the rope
    scene.add(cardMesh);

    // 6. INTERACTIVE MOUSE / TOUCH DRAGGING & SPRING BOUNCE ("Mental-Mental")
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDraggingCard = false;
    const dragOffset = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cardMesh);

      if (intersects.length > 0) {
        isDraggingCard = true;
        setHasDragged(true);
        playButtonSound();
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);
        dragOffset.copy(nodes[numSegments].pos).sub(intersectPoint);
        container.style.cursor = "grabbing";
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / height) * 2 + 1;

      if (isDraggingCard) {
        raycaster.setFromCamera(mouse, camera);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
          const targetPos = intersectPoint.add(dragOffset);
          // Apply kinematic drag to bottom node
          nodes[numSegments].pos.copy(targetPos);
          nodes[numSegments].vel.set(0, 0, 0);
        }
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(cardMesh);
        container.style.cursor = intersects.length > 0 ? "grab" : "default";
      }
    };

    const onPointerUp = () => {
      if (isDraggingCard) {
        isDraggingCard = false;
        container.style.cursor = "default";
      }
    };

    container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // 7. ANIMATION LOOP & VERLET PHYSICS (Spring & Pendulum Bouncing)
    let animationFrameId: number;
    const gravity = new THREE.Vector3(0, -32, 0);
    const dt = 0.016;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // --- Verlet Physics Integration for Rope & Card ---
      for (let i = 1; i <= numSegments; i++) {
        if (i === numSegments && isDraggingCard) continue;

        const node = nodes[i];
        // Calculate velocity from old position
        node.vel.subVectors(node.pos, node.oldPos).multiplyScalar(0.96); // Damping friction
        node.oldPos.copy(node.pos);

        // Apply gravity & spring force
        node.pos.add(node.vel);
        node.pos.addScaledVector(gravity, dt * dt);
      }

      // --- Distance Constraints Solver (Verlet Iterations for stiff rope & spring bounce) ---
      const constraintIterations = 8;
      for (let iter = 0; iter < constraintIterations; iter++) {
        // Pin Top Anchor
        nodes[0].pos.copy(topAnchor);

        for (let i = 0; i < numSegments; i++) {
          const n1 = nodes[i];
          const n2 = nodes[i + 1];

          const diff = new THREE.Vector3().subVectors(n2.pos, n1.pos);
          const dist = diff.length();

          if (dist > 0.0001) {
            const error = (dist - segmentLength) / dist;

            if (i === 0) {
              // Node 0 is fixed top
              n2.pos.addScaledVector(diff, -error);
            } else if (i + 1 === numSegments && isDraggingCard) {
              // Bottom node is locked by drag
              n1.pos.addScaledVector(diff, error);
            } else {
              // Both nodes free to spring & balance
              n1.pos.addScaledVector(diff, error * 0.5);
              n2.pos.addScaledVector(diff, -error * 0.5);
            }
          }
        }
      }

      // --- Update Card Position & 3D Pendulum Rotation ---
      const bottomNode = nodes[numSegments];
      cardMesh.position.copy(bottomNode.pos);

      // Calculate 3D pendulum tilt & twist from rope segment direction
      const prevNode = nodes[numSegments - 1];
      const ropeDir = new THREE.Vector3().subVectors(bottomNode.pos, prevNode.pos).normalize();

      const targetRotZ = -ropeDir.x * 1.2;
      const targetRotX = (ropeDir.y + 1) * 0.8;
      const targetRotY = Math.sin(Date.now() * 0.0015) * 0.1; // Subtle idle ambient swing

      cardMesh.rotation.z += (targetRotZ - cardMesh.rotation.z) * 0.15;
      cardMesh.rotation.x += (targetRotX - cardMesh.rotation.x) * 0.15;
      cardMesh.rotation.y += (targetRotY - cardMesh.rotation.y) * 0.15;

      // --- Update Tube Geometry (Woven Lanyard Rope Mesh) ---
      for (let i = 0; i <= numSegments; i++) {
        curve.points[i].copy(nodes[i].pos);
      }
      tubeMesh.geometry.dispose();
      tubeMesh.geometry = new THREE.TubeGeometry(curve, 48, 0.14, 12, false);

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      container.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [quest]);

  return (
    <>
      {createPortal(
        <button
          onClick={(e) => {
            e.stopPropagation();
            playButtonSound();
            onClose();
          }}
          className="pixel-btn px-3.5 py-2 bg-red-600 hover:bg-red-500 active:translate-y-1 text-white border-2 border-white font-display text-xs flex items-center gap-1.5 shadow-[4px_4px_0px_#000000] cursor-pointer pointer-events-auto transition-transform"
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 999999,
          }}
          title="Close Lanyard Pass"
        >
          <X size={16} strokeWidth={3} />
          <span>ESC</span>
        </button>,
        document.body
      )}

      <div
        ref={containerRef}
        className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-transparent select-none pointer-events-auto z-10"
      />
    </>
  );
}
