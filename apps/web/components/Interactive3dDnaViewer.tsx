"use client";

import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Eye, Sparkles, HelpCircle } from "lucide-react";

interface BasePair {
  index: number;
  base1: "A" | "T" | "G" | "C";
  base2: "T" | "A" | "C" | "G";
  bonds: 2 | 3;
}

const SEQUENCE: BasePair[] = [
  { index: 1, base1: "A", base2: "T", bonds: 2 },
  { index: 2, base1: "T", base2: "A", bonds: 2 },
  { index: 3, base1: "G", base2: "C", bonds: 3 },
  { index: 4, base1: "C", base2: "G", bonds: 3 },
  { index: 5, base1: "C", base2: "G", bonds: 3 },
  { index: 6, base1: "G", base2: "C", bonds: 3 },
  { index: 7, base1: "A", base2: "T", bonds: 2 },
  { index: 8, base1: "T", base2: "A", bonds: 2 },
  { index: 9, base1: "G", base2: "C", bonds: 3 },
  { index: 10, base1: "C", base2: "G", bonds: 3 },
  { index: 11, base1: "A", base2: "T", bonds: 2 },
  { index: 12, base1: "T", base2: "A", bonds: 2 },
  { index: 13, base1: "G", base2: "C", bonds: 3 },
  { index: 14, base1: "A", base2: "T", bonds: 2 },
  { index: 15, base1: "C", base2: "G", bonds: 3 },
  { index: 16, base1: "T", base2: "A", bonds: 2 },
];

const BASE_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  A: { fill: "#10b981", stroke: "#059669", label: "Adenine (Purine)" },
  T: { fill: "#f59e0b", stroke: "#d97706", label: "Thymine (Pyrimidine)" },
  G: { fill: "#3b82f6", stroke: "#2563eb", label: "Guanine (Purine)" },
  C: { fill: "#ec4899", stroke: "#db2777", label: "Cytosine (Pyrimidine)" },
};

export default function Interactive3dDnaViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [selectedPair, setSelectedPair] = useState<BasePair | null>(SEQUENCE[2]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showGrooves, setShowGrooves] = useState<boolean>(true);
  const angleRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Resize dynamically
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#081216");
      grad.addColorStop(1, "#0d222b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = "rgba(45, 212, 191, 0.05)";
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const helixRadius = 120 * zoomLevel;
      const verticalSpacing = 26 * zoomLevel;
      const totalPairs = SEQUENCE.length;
      const startY = centerY - ((totalPairs - 1) * verticalSpacing) / 2;

      // Pitch is 36 deg per base pair (10 pairs per turn)
      const currentAngle = angleRef.current;

      // Compute 3D coords & sort by Z for correct depth buffering
      interface RenderNode {
        type: "backbone" | "base" | "bond" | "groove_marker";
        z: number;
        draw: () => void;
      }
      const nodes: RenderNode[] = [];

      // Render strands
      for (let i = 0; i < totalPairs; i++) {
        const pair = SEQUENCE[i];
        const theta = currentAngle + (i * 36 * Math.PI) / 180;
        const y = startY + i * verticalSpacing;

        // Strand 1 (5' -> 3')
        const x1 = centerX + Math.cos(theta) * helixRadius;
        const z1 = Math.sin(theta) * helixRadius;
        const scale1 = (z1 + 250) / 350;

        // Strand 2 (3' -> 5', 180 deg opposite)
        const x2 = centerX + Math.cos(theta + Math.PI) * helixRadius;
        const z2 = Math.sin(theta + Math.PI) * helixRadius;
        const scale2 = (z2 + 250) / 350;

        const isPairSelected = selectedPair?.index === pair.index;

        // Connect backbone segment from previous pair
        if (i > 0) {
          const prevTheta = currentAngle + ((i - 1) * 36 * Math.PI) / 180;
          const prevY = startY + (i - 1) * verticalSpacing;
          const prevX1 = centerX + Math.cos(prevTheta) * helixRadius;
          const prevZ1 = Math.sin(prevTheta) * helixRadius;
          const prevX2 = centerX + Math.cos(prevTheta + Math.PI) * helixRadius;
          const prevZ2 = Math.sin(prevTheta + Math.PI) * helixRadius;

          // Strand 1 backbone ribbon
          nodes.push({
            type: "backbone",
            z: (z1 + prevZ1) / 2 - 2,
            draw: () => {
              ctx.beginPath();
              ctx.moveTo(prevX1, prevY);
              ctx.lineTo(x1, y);
              ctx.strokeStyle = "rgba(45, 212, 191, 0.75)";
              ctx.lineWidth = 4 * ((z1 + prevZ1) / 400 + 0.8);
              ctx.stroke();
            },
          });

          // Strand 2 backbone ribbon
          nodes.push({
            type: "backbone",
            z: (z2 + prevZ2) / 2 - 2,
            draw: () => {
              ctx.beginPath();
              ctx.moveTo(prevX2, prevY);
              ctx.lineTo(x2, y);
              ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
              ctx.lineWidth = 4 * ((z2 + prevZ2) / 400 + 0.8);
              ctx.stroke();
            },
          });
        }

        // Hydrogen bonds connecting the pair
        const midZ = (z1 + z2) / 2;
        nodes.push({
          type: "bond",
          z: midZ,
          draw: () => {
            ctx.save();
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.strokeStyle = isPairSelected
              ? "#fde047"
              : pair.bonds === 3
              ? "rgba(147, 197, 253, 0.6)"
              : "rgba(253, 186, 116, 0.6)";
            ctx.lineWidth = isPairSelected ? 3 : 2;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          },
        });

        // Base 1 sphere / label
        nodes.push({
          type: "base",
          z: z1,
          draw: () => {
            const rad = 10 * scale1 * (isPairSelected ? 1.3 : 1);
            const color = BASE_COLORS[pair.base1];

            // Outer glow if selected
            if (isPairSelected) {
              ctx.beginPath();
              ctx.arc(x1, y, rad + 6, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(250, 204, 21, 0.35)";
              ctx.fill();
            }

            // Sphere gradient
            const sGrad = ctx.createRadialGradient(
              x1 - rad * 0.3,
              y - rad * 0.3,
              rad * 0.1,
              x1,
              y,
              rad
            );
            sGrad.addColorStop(0, "#ffffff");
            sGrad.addColorStop(0.4, color.fill);
            sGrad.addColorStop(1, color.stroke);

            ctx.beginPath();
            ctx.arc(x1, y, rad, 0, Math.PI * 2);
            ctx.fillStyle = sGrad;
            ctx.fill();
            ctx.strokeStyle = color.stroke;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Label
            if (scale1 > 0.6) {
              ctx.fillStyle = "#ffffff";
              ctx.font = `bold ${Math.max(9, Math.round(11 * scale1))}px ui-sans-serif, system-ui`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(pair.base1, x1, y);
            }
          },
        });

        // Base 2 sphere / label
        nodes.push({
          type: "base",
          z: z2,
          draw: () => {
            const rad = 10 * scale2 * (isPairSelected ? 1.3 : 1);
            const color = BASE_COLORS[pair.base2];

            if (isPairSelected) {
              ctx.beginPath();
              ctx.arc(x2, y, rad + 6, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(250, 204, 21, 0.35)";
              ctx.fill();
            }

            const sGrad = ctx.createRadialGradient(
              x2 - rad * 0.3,
              y - rad * 0.3,
              rad * 0.1,
              x2,
              y,
              rad
            );
            sGrad.addColorStop(0, "#ffffff");
            sGrad.addColorStop(0.4, color.fill);
            sGrad.addColorStop(1, color.stroke);

            ctx.beginPath();
            ctx.arc(x2, y, rad, 0, Math.PI * 2);
            ctx.fillStyle = sGrad;
            ctx.fill();
            ctx.strokeStyle = color.stroke;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (scale2 > 0.6) {
              ctx.fillStyle = "#ffffff";
              ctx.font = `bold ${Math.max(9, Math.round(11 * scale2))}px ui-sans-serif, system-ui`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(pair.base2, x2, y);
            }
          },
        });
      }

      // Sort back-to-front (lowest z drawn first)
      nodes.sort((a, b) => a.z - b.z);
      nodes.forEach((node) => node.draw());

      // Major / Minor groove indicator callout if enabled
      if (showGrooves && width > 480) {
        ctx.save();
        ctx.fillStyle = "rgba(45, 212, 191, 0.15)";
        ctx.strokeStyle = "rgba(45, 212, 191, 0.4)";
        ctx.lineWidth = 1;

        // Major Groove Callout
        const mgY = startY + 4 * verticalSpacing;
        ctx.strokeRect(centerX + helixRadius + 15, mgY - 24, 150, 48);
        ctx.fillRect(centerX + helixRadius + 15, mgY - 24, 150, 48);
        ctx.fillStyle = "#2dd4bf";
        ctx.font = "bold 11px ui-sans-serif, system-ui";
        ctx.textAlign = "left";
        ctx.fillText("Major Groove (2.2 nm)", centerX + helixRadius + 25, mgY - 6);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px ui-sans-serif, system-ui";
        ctx.fillText("TF & Polymerase Binding Site", centerX + helixRadius + 25, mgY + 10);

        // Minor Groove Callout
        const minY = startY + 9 * verticalSpacing;
        ctx.strokeRect(centerX - helixRadius - 165, minY - 24, 150, 48);
        ctx.fillRect(centerX - helixRadius - 165, minY - 24, 150, 48);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 11px ui-sans-serif, system-ui";
        ctx.textAlign = "left";
        ctx.fillText("Minor Groove (1.2 nm)", centerX - helixRadius - 155, minY - 6);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px ui-sans-serif, system-ui";
        ctx.fillText("Histone Core Interaction Loci", centerX - helixRadius - 155, minY + 10);

        ctx.restore();
      }

      if (isPlaying && !isDraggingRef.current) {
        angleRef.current += 0.012 * rotationSpeed;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, rotationSpeed, selectedPair, zoomLevel, showGrooves]);

  // Mouse drag handlers for manual 3D rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;
    angleRef.current += delta * 0.01;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="space-y-4">
      {/* Simulation HUD Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/90 text-white p-3 rounded-2xl border border-teal-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause Rotation" : "Resume Auto-Spin"}</span>
          </button>

          <button
            onClick={() => {
              angleRef.current = 0;
              setZoomLevel(1);
            }}
            title="Reset View"
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-gray-300" />
          </button>

          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* Speed Pills */}
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            <span className="text-gray-400 mr-1">Speed:</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setRotationSpeed(s)}
                className={`px-2 py-0.5 rounded-md font-mono ${
                  rotationSpeed === s
                    ? "bg-teal-400 text-slate-950 font-bold"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Zoom & Overlay toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrooves(!showGrooves)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border transition-colors ${
              showGrooves
                ? "bg-teal-500/20 border-teal-400 text-teal-300"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Groove Annotations</span>
          </button>

          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1 hover:bg-white/20 rounded-lg text-gray-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 text-gray-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
              className="p-1 hover:bg-white/20 rounded-lg text-gray-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive 3D Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-[480px] cursor-grab active:cursor-grabbing block"
        />

        {/* Drag Hint Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-teal-200/90 pointer-events-none flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-300" />
          <span>Click & drag horizontally to rotate helix in 3D</span>
        </div>

        {/* DNA Legend in top right */}
        <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs space-y-1.5 pointer-events-none hidden sm:block">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Watson-Crick Nucleotides
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-gray-200">A (Adenine)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-gray-200">T (Thymine)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span className="text-gray-200">G (Guanine)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
              <span className="text-gray-200">C (Cytosine)</span>
            </div>
          </div>
          <p className="text-[10px] text-teal-300/80 pt-1 border-t border-white/10">
            A=T (2 H-bonds) • G≡C (3 H-bonds)
          </p>
        </div>
      </div>

      {/* Interactive Nucleotide Selector & Biophysical Details Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00837b]" />
              Select Base Pair to Inspect Molecular Energetics
            </h4>
            <p className="text-xs text-gray-500">
              Click any nucleotide pair along the 16-rung helical sequence
            </p>
          </div>
          <span className="text-xs font-mono bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200 font-semibold">
            B-DNA Pitch: 3.4 nm (10.5 bp/turn)
          </span>
        </div>

        {/* Base Pair Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {SEQUENCE.map((pair) => {
            const isSelected = selectedPair?.index === pair.index;
            return (
              <button
                key={pair.index}
                onClick={() => setSelectedPair(pair)}
                className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl border text-xs font-mono transition-all ${
                  isSelected
                    ? "bg-[#00837b] text-white border-[#00837b] shadow-md scale-105"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <span className="text-[10px] opacity-70">#{pair.index}</span>
                <span className="font-bold">
                  {pair.base1}-{pair.base2}
                </span>
                <span className="text-[9px] mt-0.5 opacity-80">
                  {pair.bonds === 3 ? "≡ 3H" : "= 2H"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Pair Detail Box */}
        {selectedPair && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gradient-to-r from-teal-50/70 to-emerald-50/50 border border-teal-200/80 rounded-xl p-4">
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-semibold">Base Pairing & Class</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {selectedPair.base1} ({BASE_COLORS[selectedPair.base1].label.split(" ")[0]}) ↔{" "}
                {selectedPair.base2} ({BASE_COLORS[selectedPair.base2].label.split(" ")[0]})
              </p>
              <p className="text-xs text-teal-800 mt-1">
                {selectedPair.base1 === "A" || selectedPair.base1 === "G"
                  ? "Purine (double ring) paired to Pyrimidine (single ring)"
                  : "Pyrimidine (single ring) paired to Purine (double ring)"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-gray-500 uppercase font-semibold">Hydrogen Bond Energetics</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {selectedPair.bonds} Hydrogen Bonds ({selectedPair.bonds === 3 ? "G≡C" : "A=T"})
              </p>
              <p className="text-xs text-teal-800 mt-1">
                {selectedPair.bonds === 3
                  ? "Higher thermal stability & higher melting temperature (Tm)."
                  : "Lower thermal melting resistance; accessible for replication unzipping."}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-gray-500 uppercase font-semibold">Topological Orientation</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                Helical Angle: {((selectedPair.index - 1) * 36) % 360}°
              </p>
              <p className="text-xs text-teal-800 mt-1">
                Antiparallel phosphodiester backbones: 5′-to-3′ opposite 3′-to-5′ orientation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
