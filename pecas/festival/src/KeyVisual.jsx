import { useMemo } from "react";

// Original contour system. Water ripples and sound interference share a shape.
export function contour(radius, phase = 0) {
  const points = Array.from({ length: 180 }, (_, i) => {
    const a = (i / 180) * Math.PI * 2;
    const ripple =
      1 + 0.095 * Math.sin(a * 3 + phase) + 0.045 * Math.cos(a * 5 - phase);
    const x = 400 + Math.cos(a) * radius * ripple;
    const y = 400 + Math.sin(a) * radius * ripple * 0.78;
    return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return points.join(" ") + " Z";
}
export default function KeyVisual({ frequency = 35, className = "" }) {
  const rings = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => {
        const r = 370 - i * 22;
        const phase = frequency / 32 + i * 0.09;
        return `${contour(r, phase)} ${contour(r - 11, phase)}`;
      }),
    [frequency],
  );
  return (
    <svg
      className={`key-visual ${className}`}
      viewBox="0 0 800 800"
      aria-hidden="true"
    >
      <g
        transform={`translate(400 400) rotate(${-24 + frequency / 12}) translate(-400 -400)`}
      >
        {rings.map((d, i) => (
          <path key={i} d={d} fillRule="evenodd" />
        ))}
      </g>
    </svg>
  );
}
