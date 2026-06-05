import React, { useRef, useEffect } from 'react';

export function OrbitDiagram() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
      el.style.transform = `translate(${dx * 14}px, ${dy * 12}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div className="orbit" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <circle className="ring dash" cx="100" cy="100" r="94" />
        <circle className="ring" cx="100" cy="100" r="74" />
        <circle className="ring" cx="100" cy="100" r="52" />
        <circle className="ring dash" cx="100" cy="100" r="30" />
        <circle className="core" cx="100" cy="100" r="11" />
        <circle className="node acc" cx="100" cy="100" r="2.4" />
        <g className="spin-c">
          <circle className="node" cx="100" cy="6" r="2.2" />
          <circle className="node" cx="194" cy="100" r="2.2" />
          <text className="glyph" x="100" y="2" textAnchor="middle">bridge</text>
        </g>
        <g className="spin-b">
          <circle className="node acc" cx="100" cy="26" r="2.6" />
          <circle className="node" cx="174" cy="100" r="2" />
          <circle className="node" cx="100" cy="174" r="2" />
        </g>
        <g className="spin-a">
          <circle className="node" cx="100" cy="48" r="2.4" />
          <circle className="node acc" cx="148" cy="100" r="2.4" />
          <circle className="node" cx="52" cy="100" r="2" />
        </g>
      </svg>
    </div>
  );
}

export function HeroOrb() { return <OrbitDiagram />; }
