import React, { useState, useRef, useCallback } from "react";
import classic from "./assets/classic.png";
import neon from "./assets/neon.png";

/** ==== Tunables ==== */
const numRows = 40;
const numCols = 40;
const cellSize = 16; // px
const maxAgeForColor = 12; // ages beyond this clamp to hottest color
const initialSpeedMs = 300; // simulation delay (lower = faster)

/** Moore neighborhood */
const neighbors8 = [
  [0, 1], [0, -1], [1, -1], [-1, 1],
  [1, 1], [-1, -1], [1, 0], [-1, 0],
];

/** Empty grid with ages (0 = dead, >=1 = alive with age) */
const emptyGrid = () =>
  Array.from({ length: numRows }, () => Array(numCols).fill(0));

/** ==== THEMES ==== */
const themes = {
  classic: {
    name: "Classic",
    background: `url(${classic}) center/cover no-repeat`,
    gridBackground: "rgba(20, 20, 28, 0.9)",
    button:
      "px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md transition active:scale-95",
  },
  neon: {
    name: "Neon",
    background: `url(${neon}) center/cover no-repeat`,
    gridBackground: "rgba(5, 0, 20, 0.85)",
    button:
      "px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-md transition active:scale-95",
  },
};

/** Map age -> color (cool→warm gradient) */
function ageToColor(age) {
  if (age <= 0) return "#111827"; // dead = dark gray
  const a = Math.min(age, maxAgeForColor);
  const hue = 200 - (190 * (a - 1)) / (maxAgeForColor - 1 || 1); // cyan→red
  const light = 92 - (a - 1) * 4;
  return `hsl(${Math.round(hue)}, 70%, ${Math.round(light)}%)`;
}

export default function App() {
  const [grid, setGrid] = useState(emptyGrid);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(initialSpeedMs);
  const [theme, setTheme] = useState("classic");
  const runningRef = useRef(running);
  runningRef.current = running;

  // drawing state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const drawModeRef = useRef(1); // 1 = paint alive, 0 = erase

  /** Advance one generation */
  const stepOnce = useCallback(() => {
    setGrid((g) => {
      const next = emptyGrid();
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          let live = 0;
          for (const [dr, dc] of neighbors8) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) {
              if (g[nr][nc] > 0) live++;
            }
          }
          const alive = g[r][c] > 0;
          if (alive) {
            next[r][c] = live === 2 || live === 3 ? g[r][c] + 1 : 0;
          } else {
            next[r][c] = live === 3 ? 1 : 0;
          }
        }
      }
      return next;
    });
  }, []);

  /** Run loop */
  const runLoop = useCallback(() => {
    if (!runningRef.current) return;
    stepOnce();
    setTimeout(runLoop, speed);
  }, [stepOnce, speed]);

  /** Controls */
  const start = () => {
    if (runningRef.current) return;
    setRunning(true);
    runningRef.current = true;
    runLoop();
  };
  const stop = () => {
    setRunning(false);
    runningRef.current = false;
  };
  const clear = () => setGrid(emptyGrid());
  const randomize = () => {
    const rows = emptyGrid();
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        rows[r][c] = Math.random() < 0.25 ? 1 : 0;
      }
    }
    setGrid(rows);
  };

  /** Drawing handlers */
  const handleMouseDown = (r, c) => {
    setIsMouseDown(true);
    drawModeRef.current = grid[r][c] > 0 ? 0 : 1;
    setGrid((g) => {
      const copy = g.map((row) => row.slice());
      copy[r][c] = drawModeRef.current ? 1 : 0;
      return copy;
    });
  };
  const handleEnterWhileDrag = (r, c) => {
    if (!isMouseDown) return;
    setGrid((g) => {
      const copy = g.map((row) => row.slice());
      copy[r][c] = drawModeRef.current ? 1 : 0;
      return copy;
    });
  };
  const handleMouseUp = () => setIsMouseDown(false);

  const currentTheme = themes[theme];

  /** UI */
  return (
    <div
      style={{
        minHeight: "100vh",
        overflowX: "hidden",   // 👈 hides horizontal scrollbar
    overflowY: "auto",   
        background: currentTheme.background,
        backgroundAttachment: "fixed",
        color: "white",
        padding: "24px",
        transition: "background 0.6s ease",
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <h1
        style={{ textAlign: "center", marginBottom: 10 }}
        className="font-saira text-3xl convey "
      >
         <span style={{ color: "#008080" }}>Conway&apos;s Game of Life —</span>{" "}
        <span style={{ color: "#008080" , opacity: 0.8 }}>{currentTheme.name} Theme</span>
      </h1>

      {/* Controls */}
    {/* Controls */}
<div style={{ textAlign: "center", marginBottom: "20px" }}>
  <div className="inline-flex flex-wrap justify-center gap-4">
    {!running ? (
      <button className={currentTheme.button} onClick={start}>▶ Start</button>
    ) : (
      <button className={currentTheme.button} onClick={stop}>⏸ Pause</button>
    )}
    <button className={currentTheme.button} onClick={stepOnce} disabled={running}>⏭️ Step</button>
    <button className={currentTheme.button} onClick={randomize} disabled={running}>🎲 Random</button>
    <button className={currentTheme.button} onClick={clear} disabled={running}>🧹 Clear</button>
  </div>

  {/* Theme + Speed below buttons */}
  <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="px-3 py-2 rounded-lg bg-gray-800 text-white"
    >
      {Object.entries(themes).map(([key, t]) => (
        <option key={key} value={key}>{t.name}</option>
      ))}
    </select>

    <div className="flex items-center gap-2">
      <label style={{ color: "#008080" }} htmlFor="speed">Speed</label>
      <input
        id="speed"
        type="range"
        min="60"
        max="1000"
        step="20"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
      />
      <span className="opacity-80" style={{ color: "#008080" }}>{speed} ms</span>
    </div>
  </div>
</div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, ${cellSize}px)`,
          justifyContent: "center",
          gap: 0,
          userSelect: "none",
          margin: "0 auto",
          width: numCols * cellSize,
          background: currentTheme.gridBackground,
          padding: 6,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        {grid.map((row, r) =>
          row.map((age, c) => (
            <div
              key={`${r}-${c}`}
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleEnterWhileDrag(r, c)}
              role="button"
              aria-label="cell"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: ageToColor(age),
                transition:
                  "background-color 180ms linear, box-shadow 180ms linear",
                border: "1px solid rgba(80,80,100,0.35)",
                boxShadow:
                  age > 0
                    ? "inset 0 0 6px rgba(255,255,255,0.35)"
                    : "inset 0 0 0 rgba(0,0,0,0)",
                cursor: "crosshair",
              }}
            />
          ))
        )}
      </div>

      
    </div>
  );
}
