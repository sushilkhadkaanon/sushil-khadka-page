"use client";

import { useEffect, useRef, useState } from "react";

const fps = 8;
const windowSize = 8;
const segmentLength = 32;
const angles = [0.16, 1.68, 0.31, 1.48];
const knownCuts = [4, 8, 12];

function leadingAxis(points: number[][]) {
  let meanX = 0;
  let meanY = 0;
  for (const [x, y] of points) {
    meanX += x / points.length;
    meanY += y / points.length;
  }

  let xx = 0;
  let yy = 0;
  let xy = 0;
  for (const [x, y] of points) {
    const dx = x - meanX;
    const dy = y - meanY;
    xx += dx * dx;
    yy += dy * dy;
    xy += dx * dy;
  }

  return 0.5 * Math.atan2(2 * xy, xx - yy);
}

const embeddings = Array.from({ length: angles.length * segmentLength }, (_, frame) => {
  const angle = angles[Math.floor(frame / segmentLength)];
  const along = [1, -1, 0.68, -0.68][frame % 4] + 0.07 * Math.sin(frame * 0.83);
  const cross = [0.13, 0.13, -0.13, -0.13][frame % 4] + 0.05 * Math.cos(frame * 0.31);
  return [
    along * Math.cos(angle) - cross * Math.sin(angle),
    along * Math.sin(angle) + cross * Math.cos(angle),
  ];
});

const scores = embeddings.map((_, i) => {
  if (i < windowSize) return 0;
  const previous = leadingAxis(embeddings.slice(i - windowSize, i));
  const current = leadingAxis(embeddings.slice(i - windowSize + 1, i + 1));
  return 1 - Math.abs(Math.cos(current - previous));
});

function findCuts(threshold: number) {
  const selected: number[] = [];
  scores.forEach((score, frame) => {
    if (score > threshold && frame - (selected.at(-1) ?? -Infinity) >= fps) selected.push(frame);
  });
  return selected;
}

function draw(canvas: HTMLCanvasElement, threshold: number, frame: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const palette = getComputedStyle(canvas);
  const color = (property: string) => palette.getPropertyValue(property).trim();
  const { width, height } = canvas.getBoundingClientRect();
  if (width === 0 || height === 0) return;
  const ratio = window.devicePixelRatio;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.scale(ratio, ratio);

  const x = (seconds: number) => 37 + seconds * (width - 53) / 16;
  const y = (score: number) => height - 25 - score / 0.30 * (height - 40);
  function line(ax: number, ay: number, bx: number, by: number, color: string, dash: number[] = []) {
    if (!ctx) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash(dash);
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.font = "11px ui-monospace, monospace";
  ctx.fillStyle = color("--muted");
  [0, 0.1, 0.2, 0.3].forEach(score => {
    line(x(0), y(score), x(16), y(score), color("--rule"));
    ctx.fillText(score.toFixed(1), 6, y(score) + 3);
  });
  [0, ...knownCuts, 16].forEach(seconds => {
    line(x(seconds), y(0), x(seconds), y(0.3), color("--rule"));
    ctx.fillText(seconds + "s", x(seconds) - 6, height - 7);
  });

  line(x(0), y(threshold), x(16), y(threshold), color("--control"), [4, 4]);
  ctx.beginPath();
  ctx.strokeStyle = color("--accent");
  ctx.lineWidth = 1.7;
  scores.forEach((score, index) => {
    if (index === 0) ctx.moveTo(x(0), y(score));
    else ctx.lineTo(x(index / fps), y(score));
  });
  ctx.stroke();

  ctx.fillStyle = color("--accent");
  for (const cut of findCuts(threshold)) {
    ctx.beginPath();
    ctx.arc(x(cut / fps), y(scores[cut]), 3.3, 0, 2 * Math.PI);
    ctx.fill();
  }

  const position = x(frame / fps);
  line(position, y(0), position, y(0.3), color("--ink"));
}

export default function SceneLab() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [threshold, setThreshold] = useState(0.07);
  const [frame, setFrame] = useState(34);
  const cuts = findCuts(threshold);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const refresh = () => draw(element, threshold, frame);
    const observer = new ResizeObserver(refresh);
    observer.observe(element);
    const themeObserver = new MutationObserver(refresh);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    refresh();
    return () => {
      observer.disconnect();
      themeObserver.disconnect();
    };
  }, [threshold, frame]);

  return (
    <figure className="scene-lab">
      <div className="lab-header">
        <span>Scene-boundary experiment</span>
        <span className="muted">Synthetic embeddings</span>
      </div>
      <canvas className="lab-chart" ref={canvas} role="img"
        aria-label={"Scene change score over 16 seconds, with " + cuts.length + " detected cuts"} />
      <div className="lab-controls">
        <label>
          <span>Cut threshold <span aria-hidden="true">{threshold.toFixed(2)}</span></span>
          <input type="range" min="0.01" max="0.30" step="0.01" value={threshold}
            onChange={event => setThreshold(event.currentTarget.valueAsNumber)} />
        </label>
        <label>
          <span>Time <span aria-hidden="true">{(frame / fps).toFixed(2)} s</span></span>
          <input type="range" min="0" max={scores.length - 1} value={frame}
            aria-valuetext={(frame / fps).toFixed(2) + " seconds"}
            onChange={event => setFrame(event.currentTarget.valueAsNumber)} />
        </label>
      </div>
      <div className="lab-readout">
        <span>Change score <strong>{scores[frame].toFixed(3)}</strong></span>
        <span className="lab-values" aria-live="polite">
          <strong>{cuts.length} {cuts.length === 1 ? "cut" : "cuts"}</strong>
          {cuts.length > 0 && <span> at {cuts.map(cut => (cut / fps).toFixed(2) + " s").join(", ")}</span>}
        </span>
      </div>
      <figcaption className="lab-caption">
        The line shows shifts in the leading PCA eigenvector between overlapping windows. Dots mark detected cuts above the dashed threshold.
      </figcaption>
    </figure>
  );
}
