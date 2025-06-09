// src/components/AnimatedButton.jsx
import React, { useState, useEffect } from "react";

export default function AnimatedButton({
  label,
  onClick,
  style: userStyle = {},
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // inject keyframes once
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      @keyframes pulse {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  // Base style, including a continuous pulse animation
  const baseStyle = {
    display: "inline-block",
    padding: "0.75em 1.5em",
    fontSize: "1rem",
    fontWeight: 500,
    borderRadius: "8px",
    backgroundColor: "#1326FD",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    userSelect: "none",

    // CSS transitions for hover/press
    transition: "transform 0.2s ease, box-shadow 0.2s ease",

    // continuous keyframe animation (will be picked up as rnProps.animations)
    animation: "pulse 2s ease-in-out 0s infinite",

    // initial shadow
    boxShadow: "0 4px 12px rgba(19, 38, 253, 0.3)",

    ...userStyle,
  };

  // Interactive adjustments
  const style = { ...baseStyle };
  if (pressed) {
    style.transform = "scale(0.95)";
    style.boxShadow = "0 2px 8px rgba(19, 38, 253, 0.2)";
    // faster transition on press
    style.transition = "transform 0.1s ease, box-shadow 0.1s ease";
  } else if (hovered) {
    style.transform = "scale(1.05)";
    style.boxShadow = "0 6px 16px rgba(19, 38, 253, 0.4)";
  }

  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {label}
    </button>
  );
}
