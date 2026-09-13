import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  X,
  ExternalLink,
  Github,
  Shield,
  ChevronLeft,
  ChevronRight,
  Search,
  Grid,
  List,
  Cpu,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Lock,
  Box,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

import { usePortfolioData } from "@/hooks/use-portfolio-data";
import { Loader2 } from "lucide-react";
import { playButtonSound } from "@/lib/audio";
import { SEO } from "@/components/SEO";
import { useTheme } from "@/context/ThemeContext";
import { RetroCartridge3D } from "@/components/3d/RetroCartridge3D";

const PROJECT_COLORS = [
  "border-primary",
  "border-secondary",
  "border-accent",
  "border-destructive",
  "border-blue-400",
  "border-purple-400",
  "border-pink-400",
];

export default function Portfolio() {
  const { isKanrishaurus } = useTheme();
  const { data: projectsData, isLoading } = usePortfolioData("projects");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedTechTag, setSelectedTechTag] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [selected, setSelected] = useState<any | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Lock main page scrolling when 3D inspection modal is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);
  const [modalView, setModalView] = useState<"3D" | "2D">("3D");

  const PROJECTS = useMemo(() => {
    return (projectsData || []).map((p: any, idx: number) => ({
      ...p,
      desc: p.description || "",
      type: p.type || "Quest",
      color: isKanrishaurus
        ? "border-red-500"
        : p.color || PROJECT_COLORS[idx % PROJECT_COLORS.length],
      images: p.images || ["cartridge-1.png"],
      demoUrl: p.demo_url,
      githubUrl: p.github_url,
      company: p.company || "Independent",
      tech: p.tech || [],
      status: p.status || "COMPLETED",
    }));
  }, [projectsData, isKanrishaurus]);

  // Extract unique project types and tech tags
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    PROJECTS.forEach((p) => {
      if (p.type) types.add(p.type);
    });
    return ["ALL", ...Array.from(types)];
  }, [PROJECTS]);

  const popularTechTags = useMemo(() => {
    const tagsMap: Record<string, number> = {};
    PROJECTS.forEach((p) => {
      (p.tech || []).forEach((t: string) => {
        tagsMap[t] = (tagsMap[t] || 0) + 1;
      });
    });
    const sorted = Object.keys(tagsMap).sort((a, b) => tagsMap[b] - tagsMap[a]);
    return ["ALL", ...sorted.slice(0, 8)];
  }, [PROJECTS]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((proj) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        proj.title.toLowerCase().includes(q) ||
        proj.desc.toLowerCase().includes(q) ||
        proj.company.toLowerCase().includes(q) ||
        proj.tech.some((t: string) => t.toLowerCase().includes(q));

      const matchesType =
        selectedType === "ALL" ||
        proj.type.toLowerCase() === selectedType.toLowerCase();

      const matchesStatus =
        selectedStatus === "ALL" ||
        proj.status.toUpperCase() === selectedStatus.toUpperCase() ||
        (selectedStatus === "CONFIDENTIAL" && (!proj.demoUrl && !proj.githubUrl));

      const matchesTech =
        selectedTechTag === "ALL" || proj.tech.includes(selectedTechTag);

      return matchesSearch && matchesType && matchesStatus && matchesTech;
    });
  }, [PROJECTS, searchQuery, selectedType, selectedStatus, selectedTechTag]);

  // RPG Stats Dashboard metrics
  const stats = useMemo(() => {
    const total = PROJECTS.length;
    const active = PROJECTS.filter(
      (p) => p.status === "ONGOING" || p.status === "MAINTENANCE"
    ).length;
    const confidential = PROJECTS.filter(
      (p) => !p.demoUrl?.trim() && !p.githubUrl?.trim()
    ).length;
    const allTechs = new Set<string>();
    PROJECTS.forEach((p) => p.tech?.forEach((t: string) => allTechs.add(t)));
    return {
      total,
      active,
      confidential,
      publicCount: total - confidential,
      techCount: allTechs.size,
    };
  }, [PROJECTS]);

  const nextImage = () => {
    if (!selected) return;
    playButtonSound();
    setCurrentImageIdx((prev) => (prev + 1) % selected.images.length);
  };

  const prevImage = () => {
    if (!selected) return;
    playButtonSound();
    setCurrentImageIdx(
      (prev) => (prev - 1 + selected.images.length) % selected.images.length
    );
  };

  const getImageUrl = (image: string) => {
    if (image.startsWith("http")) return image;
    return `${import.meta.env.BASE_URL}images/${image}`;
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ONGOING":
        return "text-accent border-accent bg-accent/10 animate-pulse";
      case "MAINTENANCE":
        return "text-secondary border-secondary bg-secondary/10 animate-pulse";
      case "PAUSED":
        return "text-muted-foreground border-muted-foreground bg-muted/20";
      case "OUTDATED":
        return "text-destructive border-destructive bg-destructive/10 animate-pulse";
      default:
        return "text-primary border-primary bg-primary/10";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-primary">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  // Calculate empty inventory slots for 8-bit grid alignment
  const gridColumns = 4;
  const remainder = filteredProjects.length % gridColumns;
  const emptySlotsCount = remainder === 0 ? 0 : gridColumns - remainder;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-6"
    >
      <SEO
        title="Inventory | Projects"
        description="Explore the inventory of web applications, systems, and artifacts built by Brilliano Dhiya Ulhaq."
      />

      {/* Header & Capacity Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-white pb-4 gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-primary text-shadow-pixel flex items-center gap-2">
            <Box size={28} className="text-secondary" />
            {isKanrishaurus ? "WAR SPOILS" : "PROJECT INVENTORY"}
          </h2>
          <p className="font-body text-xl text-muted-foreground mt-1">
            {isKanrishaurus
              ? "Artifacts seized from defeated systems"
              : "Repository of Web Systems, Mobile Apps & Digital Artifacts"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="font-display text-xs text-secondary bg-background px-4 py-2 border-2 border-secondary flex items-center gap-3 shadow-lg">
            <Layers size={14} className="text-primary animate-pulse" />
            <span>
              SLOTS FILLED:{" "}
              <strong className="text-white font-bold">
                {isKanrishaurus ? "INF" : PROJECTS.length}
              </strong>
              /{isKanrishaurus ? "INF" : "99"}
            </span>
          </div>

          {/* 8-bit Progress Fill Bar */}
          <div className="w-full md:w-56 h-3 bg-black border-2 border-white/20 rounded-sm p-0.5 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, (PROJECTS.length / 99) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* RPG Inventory Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="pixel-panel p-3 bg-black/40 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/40 rounded flex items-center justify-center text-purple-400 font-display text-xs">
            {stats.total}
          </div>
          <div>
            <p className="font-display text-[8px] text-muted-foreground uppercase">
              TOTAL ARTIFACTS
            </p>
            <p className="font-display text-xs text-white">ALL SYSTEMS</p>
          </div>
        </div>

        <div className="pixel-panel p-3 bg-black/40 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center text-emerald-400 font-display text-xs">
            {stats.active}
          </div>
          <div>
            <p className="font-display text-[8px] text-muted-foreground uppercase">
              ACTIVE QUESTS
            </p>
            <p className="font-display text-xs text-emerald-400">ONGOING/MAINT</p>
          </div>
        </div>

        <div className="pixel-panel p-3 bg-black/40 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-blue-400 font-display text-xs">
            {stats.techCount}
          </div>
          <div>
            <p className="font-display text-[8px] text-muted-foreground uppercase">
              EQUIPPED TECHS
            </p>
            <p className="font-display text-xs text-blue-400">MASTERED STACK</p>
          </div>
        </div>

        <div className="pixel-panel p-3 bg-black/40 border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center text-amber-400 font-display text-xs">
            {stats.confidential}
          </div>
          <div>
            <p className="font-display text-[8px] text-muted-foreground uppercase">
              RESTRICTED GEAR
            </p>
            <p className="font-display text-xs text-amber-400">NDA / PRIVATE</p>
          </div>
        </div>
      </div>

      {/* Multi-Filter & Search Bar */}
      <div className="flex flex-col gap-3 bg-black/40 p-4 border-2 border-white/10 rounded-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Text Search Input */}
          <div className="relative w-full md:w-80 group">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
            />
            <input
              type="text"
              placeholder="SEARCH PROJECT, TECH, COMPANY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border-2 border-white/20 focus:border-primary rounded-lg py-2 pl-10 pr-4 font-display text-[10px] text-foreground placeholder:text-muted-foreground outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls: Show/Hide Filter Toggle + View Mode Switcher */}
          <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
            {/* Show / Hide Filters Button */}
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                playButtonSound();
              }}
              className={cn(
                "px-3 py-2 rounded border font-display text-[10px] flex items-center gap-2 transition-all relative",
                isFilterOpen
                  ? "bg-purple-600 text-white border-purple-400 shadow-md"
                  : "bg-background border-white/20 text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <SlidersHorizontal size={14} />
              <span>{isFilterOpen ? "HIDE FILTERS" : "SHOW FILTERS"}</span>
              {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}

              {/* Active Filter Count Badge */}
              {((selectedType !== "ALL" ? 1 : 0) +
                (selectedStatus !== "ALL" ? 1 : 0) +
                (selectedTechTag !== "ALL" ? 1 : 0) +
                (searchQuery ? 1 : 0)) > 0 && (
                <span className="w-4 h-4 rounded-full bg-yellow-400 text-black font-bold text-[8px] flex items-center justify-center -top-1.5 -right-1.5 absolute shadow-md animate-bounce">
                  {(selectedType !== "ALL" ? 1 : 0) +
                    (selectedStatus !== "ALL" ? 1 : 0) +
                    (selectedTechTag !== "ALL" ? 1 : 0) +
                    (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="font-display text-[8px] text-muted-foreground uppercase mr-1 hidden sm:inline">
                VIEW:
              </span>
              <button
                onClick={() => {
                  setViewMode("GRID");
                  playButtonSound();
                }}
                className={cn(
                  "p-2 rounded border font-display text-[10px] flex items-center gap-1.5 transition-all",
                  viewMode === "GRID"
                    ? "bg-primary text-black border-primary font-bold shadow-md"
                    : "bg-background border-white/20 text-muted-foreground hover:bg-white/5"
                )}
              >
                <Grid size={14} />
                SLOTS
              </button>

              <button
                onClick={() => {
                  setViewMode("LIST");
                  playButtonSound();
                }}
                className={cn(
                  "p-2 rounded border font-display text-[10px] flex items-center gap-1.5 transition-all",
                  viewMode === "LIST"
                    ? "bg-secondary text-black border-secondary font-bold shadow-md"
                    : "bg-background border-white/20 text-muted-foreground hover:bg-white/5"
                )}
              >
                <List size={14} />
                ARMORY LIST
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filter Options Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden flex flex-col gap-3 pt-2 border-t border-white/10"
            >
              {/* Category & Status Filter Chips */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-display text-[8px] text-muted-foreground uppercase mr-1">
                  TYPE:
                </span>
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      playButtonSound();
                    }}
                    className={cn(
                      "px-3 py-1 rounded text-[9px] font-display uppercase border transition-all",
                      selectedType === type
                        ? "bg-purple-500 text-white border-purple-400 shadow-md"
                        : "bg-background/80 text-muted-foreground border-white/10 hover:border-white/30"
                    )}
                  >
                    {type}
                  </button>
                ))}

                <span className="font-display text-[8px] text-muted-foreground uppercase ml-3 mr-1">
                  STATUS:
                </span>
                {["ALL", "COMPLETED", "ONGOING", "MAINTENANCE", "CONFIDENTIAL"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        playButtonSound();
                      }}
                      className={cn(
                        "px-3 py-1 rounded text-[9px] font-display uppercase border transition-all",
                        selectedStatus === status
                          ? "bg-blue-500 text-white border-blue-400 shadow-md"
                          : "bg-background/80 text-muted-foreground border-white/10 hover:border-white/30"
                      )}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>

              {/* Popular Tech Filter Pills */}
              <div className="flex flex-wrap gap-1.5 items-center pt-1">
                <span className="font-display text-[8px] text-muted-foreground uppercase mr-1">
                  TECH:
                </span>
                {popularTechTags.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => {
                      setSelectedTechTag(tech);
                      playButtonSound();
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-body transition-all border",
                      selectedTechTag === tech
                        ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                        : "bg-black/40 text-muted-foreground border-white/10 hover:text-white"
                    )}
                  >
                    {tech}
                  </button>
                ))}
                {(selectedType !== "ALL" ||
                  selectedStatus !== "ALL" ||
                  selectedTechTag !== "ALL" ||
                  searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedType("ALL");
                      setSelectedStatus("ALL");
                      setSelectedTechTag("ALL");
                      setSearchQuery("");
                      playButtonSound();
                    }}
                    className="ml-auto text-[8px] font-display text-red-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw size={10} /> RESET FILTERS
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Result Count Badge */}
      <div className="flex justify-between items-center px-1 font-display text-[9px] text-muted-foreground uppercase">
        <span>
          SHOWING {filteredProjects.length} OF {PROJECTS.length} ARTIFACTS
        </span>
        {searchQuery && <span>FILTERED BY: "{searchQuery}"</span>}
      </div>

      {/* DISPLAY LAYOUTS */}
      {filteredProjects.length > 0 ? (
        viewMode === "GRID" ? (
          /* 8-bit RPG Inventory Grid Slots View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProjects.map((proj, idx) => (
                <motion.div
                  key={proj.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => {
                    setSelected(proj);
                    setCurrentImageIdx(0);
                    setModalView("3D");
                    playButtonSound();
                  }}
                  className="pixel-panel p-4 cursor-pointer hover:-translate-y-2 transition-transform duration-200 group flex flex-col items-center text-center relative overflow-hidden"
                >
                  {/* Slot Number Tag */}
                  <div className="absolute top-2 left-2 font-display text-[7px] text-muted-foreground bg-black/80 px-1.5 py-0.5 rounded border border-white/10 z-10">
                    SLOT [{String(idx + 1).padStart(2, "0")}]
                  </div>

                  {/* Status Badge Tag */}
                  <div
                    className={cn(
                      "absolute top-2 right-2 font-display text-[6px] px-1.5 py-0.5 rounded z-10 border",
                      getStatusStyles(proj.status)
                    )}
                  >
                    {proj.status}
                  </div>

                  <div
                    className={`w-32 h-32 bg-background border-4 ${proj.color} mt-4 mb-3 flex items-center justify-center overflow-hidden relative p-2 rounded-lg`}
                  >
                    <div className="pixel-img-frame w-full h-full">
                      <img
                        src={getImageUrl(proj.images[0])}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform rendering-pixelated"
                      />
                    </div>
                    <div className="absolute bottom-0 w-full bg-black/90 font-display text-[8px] py-1 text-primary z-10 border-t border-primary/40">
                      INSPECT 3D
                    </div>
                  </div>

                  <div className="w-full h-10 flex items-center justify-center my-1 px-1 overflow-hidden min-w-0">
                    <h3 className="font-display text-[10px] sm:text-xs text-foreground leading-tight text-center line-clamp-2 break-words max-w-full">
                      {proj.title}
                    </h3>
                  </div>

                  <div className="w-full flex justify-between items-center gap-1 mt-auto">
                    <span className="font-body text-sm text-muted-foreground bg-background px-2 py-0.5 border border-white/10 flex-1 truncate">
                      {proj.type}
                    </span>
                    {(!proj.demoUrl?.trim() && !proj.githubUrl?.trim()) && (
                      <span
                        className="p-1 bg-red-950/80 border border-red-500/40 rounded text-red-400 shrink-0"
                        title="Confidential NDA Project"
                      >
                        <Lock size={12} />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Visual Empty Slot Fillers for 8-bit RPG Inventory feel */}
              {Array.from({ length: emptySlotsCount }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="pixel-panel p-4 flex flex-col items-center justify-center min-h-[220px] opacity-30 border-dashed border-white/20 bg-black/20 pointer-events-none"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-700 font-display text-[10px] mb-2">
                    EMPTY
                  </div>
                  <span className="font-display text-[8px] text-gray-600 tracking-widest">
                    [EMPTY SLOT]
                  </span>
                </div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Armory Spec List View */
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {filteredProjects.map((proj, idx) => (
                <motion.div
                  key={proj.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => {
                    setSelected(proj);
                    setCurrentImageIdx(0);
                    setModalView("3D");
                    playButtonSound();
                  }}
                  className={`pixel-panel p-4 cursor-pointer hover:-translate-y-1 transition-transform duration-200 flex flex-col md:flex-row items-center gap-6 border-l-8 ${proj.color}`}
                >
                  {/* Cartridge Thumbnail */}
                  <div className="w-24 h-24 bg-black border-2 border-white/20 rounded-lg overflow-hidden shrink-0 relative group/img">
                    <img
                      src={getImageUrl(proj.images[0])}
                      alt={proj.title}
                      className="w-full h-full object-cover rendering-pixelated group-hover/img:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <Sparkles size={18} className="text-primary animate-pulse" />
                    </div>
                  </div>

                  {/* Project Details Spec */}
                  <div className="flex-1 flex flex-col gap-2 w-full min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-wrap min-w-0">
                        <h3 className="font-display text-sm md:text-base text-white text-shadow-pixel break-words max-w-full">
                          {proj.title}
                        </h3>
                        <span className="font-display text-[8px] text-secondary bg-secondary/10 px-2 py-0.5 border border-secondary/20 uppercase shrink-0">
                          {proj.type}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "font-display text-[8px] px-2 py-0.5 rounded border",
                          getStatusStyles(proj.status)
                        )}
                      >
                        {proj.status}
                      </span>
                    </div>

                    <p className="font-body text-lg text-muted-foreground line-clamp-2">
                      {proj.desc}
                    </p>

                    {/* Equipped Gear Tech Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="font-display text-[8px] text-muted-foreground mr-1">
                        EQUIPPED:
                      </span>
                      {proj.tech?.map((t: string) => (
                        <span
                          key={t}
                          className="font-body text-xs bg-background px-2 py-0.5 border border-white/20 text-white rounded-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Quick Buttons */}
                  <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 border-white/10 pt-2 md:pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(proj);
                        setModalView("3D");
                        playButtonSound();
                      }}
                      className="pixel-btn px-4 py-2 bg-primary/20 hover:bg-primary/30 border-primary text-[10px] font-display flex-1 md:flex-none flex items-center justify-center gap-1"
                    >
                      <Sparkles size={12} /> INSPECT
                    </button>
                    {proj.demoUrl?.trim() && (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="pixel-btn px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border-blue-400 text-[10px] font-display flex-1 md:flex-none flex items-center justify-center gap-1 text-blue-200"
                      >
                        <ExternalLink size={12} /> LIVE DEMO
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
          <Layers className="text-gray-600 mb-4 animate-pulse" size={48} />
          <p className="font-display text-xs text-gray-500 tracking-widest uppercase">
            NO ARTIFACTS MATCH YOUR FILTER
          </p>
          <button
            onClick={() => {
              setSelectedType("ALL");
              setSelectedStatus("ALL");
              setSelectedTechTag("ALL");
              setSearchQuery("");
              playButtonSound();
            }}
            className="mt-6 pixel-btn bg-primary/20 border-primary px-6 py-2 text-[10px] font-display"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}

      {/* IN-HAND 3D CARTRIDGE INSPECTION OVERLAY (NO CONTAINER, PURE BACKDROP BLUR) */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop Blur Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl cursor-pointer"
              onClick={() => {
                setSelected(null);
                playButtonSound();
              }}
            />

            {/* Floating 3D Cartridge Inspection */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex items-center justify-center"
            >
              <RetroCartridge3D
                title={selected.title}
                type={selected.type}
                company={selected.company}
                status={selected.status}
                images={selected.images}
                currentImageIdx={currentImageIdx}
                onNextImage={nextImage}
                onPrevImage={prevImage}
                tech={selected.tech}
                color={selected.color}
                demoUrl={selected.demoUrl}
                githubUrl={selected.githubUrl}
                desc={selected.desc}
                onClose={() => setSelected(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
