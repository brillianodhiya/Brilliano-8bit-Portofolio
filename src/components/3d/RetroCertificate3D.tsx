import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { ExternalLink, X, RotateCcw, ShieldCheck, Award } from "lucide-react";
import { playButtonSound } from "@/lib/audio";

export interface AwardItem {
  id?: string;
  title: string;
  issuer: string;
  date: string;
  rarity?: "LEGENDARY" | "EPIC" | "RARE" | string;
  icon?: any;
  certificate_url?: string;
  color?: string;
  bg?: string;
}

interface RetroCertificate3DProps {
  award: AwardItem;
  onClose: () => void;
}

// Helper to construct image URLs
const getImageUrl = (image?: string) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.BASE_URL}images/${image}`;
};

const RARITY_COLORS: Record<string, { main: string; goldHex: number; borderHex: string }> = {
  LEGENDARY: { main: "#fbbf24", goldHex: 0xfbbf24, borderHex: "#fbbf24" },
  EPIC: { main: "#f97316", goldHex: 0xf97316, borderHex: "#f97316" },
  RARE: { main: "#38bdf8", goldHex: 0x38bdf8, borderHex: "#38bdf8" },
};

export function RetroCertificate3D({ award, onClose }: RetroCertificate3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const rarityKey = (award.rarity || "RARE").toUpperCase();
    const theme = RARITY_COLORS[rarityKey] || RARITY_COLORS.RARE;

    // 1. THREE.JS SCENE SETUP
    const scene = new THREE.Scene();

    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(24, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Dynamic Window Resize Listener
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Lighting Setup (Holographic & Specular Lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3.0);
    dirLight1.position.set(6, 12, 12);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    // Accent Rim Light matching Rarity Color
    const rimLight = new THREE.DirectionalLight(theme.goldHex, 3.5);
    rimLight.position.set(-8, -6, 8);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.0, 25);
    pointLight.position.set(0, 2, 6);
    scene.add(pointLight);

    // 2. CREATE CERTIFICATE CANVAS TEXTURE (Front Face)
    const createCertTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1400;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Dark Holographic Glass Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1400, 1000);
      grad.addColorStop(0, "#09090b");
      grad.addColorStop(0.5, "#18181b");
      grad.addColorStop(1, "#030712");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1400, 1000);

      // Outer Rarity Glow Border
      ctx.strokeStyle = theme.borderHex;
      ctx.lineWidth = 28;
      ctx.strokeRect(24, 24, 1352, 952);

      // Inner Double Bevel Border
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 8;
      ctx.strokeRect(48, 48, 1304, 904);

      // Helper to draw auto-fitted text without overflow
      const drawFittedText = (
        text: string,
        y: number,
        defaultFontSize: number,
        fontFamily: string,
        color: string,
        maxW = 1100,
        isItalic = false
      ) => {
        let fontSize = defaultFontSize;
        const fontStyle = isItalic ? "italic" : "";
        ctx.fillStyle = color;
        ctx.font = `${fontStyle} bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        let w = ctx.measureText(text).width;
        while (w > maxW && fontSize > 18) {
          fontSize -= 2;
          ctx.font = `${fontStyle} bold ${fontSize}px ${fontFamily}`;
          w = ctx.measureText(text).width;
        }
        ctx.fillText(text, 700, y);
      };

      // Header Banner
      ctx.fillStyle = theme.borderHex;
      ctx.font = "bold 32px 'Press Start 2P', monospace, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CERTIFICATE OF ACHIEVEMENT", 700, 140);

      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "bold 24px monospace";
      ctx.fillText(`RARITY RANK: [ ${rarityKey} ACHIEVEMENT ]`, 700, 190);

      // Divider Line
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(150, 225);
      ctx.lineTo(1250, 225);
      ctx.stroke();

      // Certificate Title
      drawFittedText(award.title, 320, 52, "monospace", "#ffffff", 1150);

      // Issued By Section
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 26px monospace";
      ctx.fillText("OFFICIALLY ISSUED BY", 700, 410);

      drawFittedText(`@${award.issuer}`, 470, 46, "monospace", theme.borderHex, 1100);

      // Date Unlocked
      ctx.fillStyle = "#e4e4e7";
      ctx.font = "italic bold 30px sans-serif";
      ctx.fillText(`DATE UNLOCKED: ${award.date}`, 700, 530);

      // Official Hologram Seal Badge
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#18181b";
      ctx.beginPath();
      ctx.arc(1150, 750, 105, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner Gold/Rarity Ring
      ctx.strokeStyle = theme.borderHex;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(1150, 750, 96, 0, Math.PI * 2);
      ctx.stroke();

      // Star Icon Header in Seal
      ctx.fillStyle = theme.borderHex;
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("★", 1150, 715);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("VERIFIED", 1150, 750);

      ctx.fillStyle = theme.borderHex;
      ctx.font = "900 16px monospace";
      ctx.fillText("CREDENTIAL", 1150, 778);

      // Bottom Security Footer
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "bold 22px monospace";
      ctx.textAlign = "center";
      ctx.fillText("AUTHENTICATED 3D HOLOGRAPHIC TROPHY - PIXEL PORTFOLIO", 700, 930);

      // Issuer Image / Icon Drawing with CORS Fallback
      if (typeof award.icon === "string" && award.icon.startsWith("http")) {
        const logoUrl = getImageUrl(award.icon);
        if (logoUrl) {
          const drawLogoImage = (imgSrc: string, useCors: boolean) => {
            const img = new Image();
            if (useCors && imgSrc.startsWith("http")) {
              img.crossOrigin = "Anonymous";
            }
            img.onload = () => {
              ctx.fillStyle = "#ffffff";
              ctx.beginPath();
              ctx.roundRect(150, 680, 160, 160, 20);
              ctx.fill();

              // Preserve aspect ratio
              const maxW = 140;
              const maxH = 140;
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
              const dx = 230 - dw / 2;
              const dy = 760 - dh / 2;

              ctx.drawImage(img, dx, dy, dw, dh);
              texture.needsUpdate = true;
            };
            if (useCors) {
              img.onerror = () => {
                drawLogoImage(imgSrc, false);
              };
            }
            img.src = imgSrc;
          };
          drawLogoImage(logoUrl, true);
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // Create Back Face Texture (Authentication Stamp & Barcode)
    const createBackCertTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1400;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Dark Carbon-Grid Background
      ctx.fillStyle = "#0c0c0e";
      ctx.fillRect(0, 0, 1400, 1000);

      // Subtle Micro Grid Pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 2;
      for (let x = 0; x < 1400; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1000);
        ctx.stroke();
      }
      for (let y = 0; y < 1000; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1400, y);
        ctx.stroke();
      }

      // Outer Rarity Border
      ctx.strokeStyle = theme.borderHex;
      ctx.lineWidth = 24;
      ctx.strokeRect(24, 24, 1352, 952);

      // Inner Corner Brackets
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, 1300, 900);

      // Watermark Shield Emblem in background
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = theme.borderHex;
      ctx.beginPath();
      ctx.arc(700, 500, 320, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Back Header
      ctx.fillStyle = theme.borderHex;
      ctx.font = "bold 32px 'Press Start 2P', monospace, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SECURITY AUTHENTICATION BACKFACE", 700, 150);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "bold 22px monospace";
      ctx.fillText(`PROPERTY OF PIXEL PORTFOLIO VAULT • RANK: [ ${rarityKey} ]`, 700, 200);

      // Divider Line
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(150, 240);
      ctx.lineTo(1250, 240);
      ctx.stroke();

      // Certificate Info Summary Box
      ctx.fillStyle = "rgba(24, 24, 27, 0.85)";
      ctx.roundRect(200, 280, 1000, 320, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 24px monospace";
      ctx.fillText("TITLE:", 240, 340);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px monospace";
      ctx.fillText(award.title.length > 38 ? award.title.slice(0, 35) + "..." : award.title, 360, 340);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 24px monospace";
      ctx.fillText("ISSUER:", 240, 400);
      ctx.fillStyle = theme.borderHex;
      ctx.font = "bold 26px monospace";
      ctx.fillText(`@${award.issuer}`, 360, 400);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 24px monospace";
      ctx.fillText("DATE:", 240, 460);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px monospace";
      ctx.fillText(award.date, 360, 460);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 24px monospace";
      ctx.fillText("HASH ID:", 240, 520);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px monospace";
      ctx.fillText(`0x${(award.title.length * 918273).toString(16).toUpperCase()}8F9A42C7B01`, 360, 520);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 24px monospace";
      ctx.fillText("STATUS:", 240, 570);
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 22px monospace";
      ctx.fillText("● VERIFIED ON-CHAIN RECORD", 360, 570);

      // Draw Retro Barcode at bottom
      const startX = 420;
      const barcodeY = 660;
      const barcodeHeight = 120;
      ctx.fillStyle = "#ffffff";

      // Seeded pattern pseudo barcode
      let currX = startX;
      for (let i = 0; i < 50; i++) {
        const w = (i % 3 === 0 ? 8 : i % 2 === 0 ? 4 : 12);
        const gap = (i % 4 === 0 ? 6 : 4);
        ctx.fillRect(currX, barcodeY, w, barcodeHeight);
        currX += w + gap;
      }

      const serialNo = `SERIAL: PX-${rarityKey.slice(0, 3)}-${award.date.replace(/\s+/g, "")}-8894`;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.fillText(serialNo, 700, 830);

      // Drag Hint
      ctx.fillStyle = theme.borderHex;
      ctx.font = "bold 20px monospace";
      ctx.fillText("« 360° DRAG TO ROTATE BACK TO FRONT »", 700, 910);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const certTexture = createCertTexture();
    const backCertTexture = createBackCertTexture();

    // 3. CREATE 3D VOLUMETRIC CERTIFICATE PLAQUE MESH
    const certWidth = 4.2;
    const certHeight = 3.0;
    const certDepth = 0.22;

    const certGeo = new THREE.BoxGeometry(certWidth, certHeight, certDepth);

    const sideMat = new THREE.MeshPhysicalMaterial({
      color: 0x18181b,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
    });

    const frontMat = new THREE.MeshPhysicalMaterial({
      map: certTexture,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      ior: 1.5,
    });

    const backMat = new THREE.MeshPhysicalMaterial({
      map: backCertTexture,
      roughness: 0.15,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
    });

    const certMaterials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
    const certMesh = new THREE.Mesh(certGeo, certMaterials);
    certMesh.castShadow = true;
    certMesh.receiveShadow = true;
    scene.add(certMesh);

    // 3D Metallic Seal Ring frame attached to front face framing the seal badge
    const sealGeo = new THREE.TorusGeometry(0.31, 0.025, 16, 48);
    const sealMat = new THREE.MeshStandardMaterial({
      color: theme.goldHex,
      roughness: 0.15,
      metalness: 0.95,
    });
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.position.set(1.35, -0.75, certDepth / 2 + 0.015);
    certMesh.add(sealMesh);

    // 4. INTERACTIVE 360° DRAG & ROTATION PHYSICS
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    const previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      isDragging = true;
      setHasDragged(true);
      playButtonSound();
      previousMousePosition.x = clientX;
      previousMousePosition.y = clientY;
      container.style.cursor = "grabbing";
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - previousMousePosition.x;
        const deltaY = clientY - previousMousePosition.y;

        certMesh.rotation.y += deltaX * 0.01;
        certMesh.rotation.x += deltaY * 0.01;

        previousMousePosition.x = clientX;
        previousMousePosition.y = clientY;
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = "grab";
      }
    };

    container.style.cursor = "grab";
    container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // 5. ANIMATION LOOP
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Subtle ambient 3D float animation when not dragging
      if (!isDragging) {
        certMesh.position.y = Math.sin(Date.now() * 0.0018) * 0.12;
        certMesh.rotation.y += (0 - certMesh.rotation.y) * 0.02;
        certMesh.rotation.x += (0 - certMesh.rotation.x) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
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
  }, [award]);

  return (
    <>
      {/* 8-Bit Retro Close Button Mounted to document.body via Portal */}
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
          title="Close Certificate View"
        >
          <X size={16} strokeWidth={3} />
          <span>ESC</span>
        </button>,
        document.body
      )}

      {/* External Direct Verification Button Mounted via Portal */}
      {award.certificate_url &&
        createPortal(
          <button
            onClick={(e) => {
              e.stopPropagation();
              playButtonSound();
              window.open(award.certificate_url, "_blank");
            }}
            className="pixel-btn px-4 py-2.5 bg-accent text-black hover:bg-yellow-300 border-2 border-black font-display text-xs flex items-center gap-2 shadow-[4px_4px_0px_#000000] cursor-pointer pointer-events-auto transition-transform active:translate-y-1"
            style={{
              position: "fixed",
              bottom: "32px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 999999,
            }}
          >
            <ShieldCheck size={16} />
            <span>VERIFY OFFICIAL CREDENTIAL</span>
            <ExternalLink size={14} />
          </button>,
          document.body
        )}

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-transparent select-none pointer-events-auto z-10"
      />
    </>
  );
}
