// src/components/Card.jsx
import React, { useState } from "react";

/**
 * A super-fancy card that accepts:
 * - title (string)
 * - content (string)
 * - image (URL string)
 * - tags (array of strings)
 * - actions (array of { label, onClick })
 * - footer (string or element)
 * - children (any React nodes)
 * - style (object) to override container styles
 * - onClick (function) for root click
 * - ...rest for any other DOM props (e.g. id, data-*)
 */
export default function Card({
  title,
  content,
  tags = [],
  actions = [],
  footer,
  children,
  style = {},
  onClick,
  ...rest
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Root container dynamic styles
  const containerStyle = {
    position: "relative",
    background: "linear-gradient(135deg, #ffffff, #fafafa)",
    borderRadius: "12px",
    boxShadow: hovered
      ? "0 12px 24px rgba(0,0,0,0.15)"
      : "0 6px 12px rgba(0,0,0,0.1)",
    transform: hovered ? "scale(1.02)" : pressed ? "scale(0.98)" : "scale(1)",
    transition: "all 0.2s ease-out",
    cursor: onClick ? "pointer" : "default",
    padding: "1.5rem",
    overflow: "hidden",
    ...style, // allow overrides
  };

  return (
    <div
      {...rest}
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {/* Optional image header */}

      {/* Title */}
      <h2
        style={{
          margin: 0,
          fontSize: "1.75rem",
          color: "#222",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h2>

      {/* Content text */}
      <p style={{ color: "#555", lineHeight: 1.4, marginBottom: "1rem" }}>
        {content}
      </p>

      {/* Any nested children you pass */}
      {children && <div style={{ marginBottom: "1rem" }}>{children}</div>}

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          {tags.map((tag, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                background: "#e0f7ff",
                color: "#007acc",
                borderRadius: "4px",
                padding: "0.25rem 0.5rem",
                fontSize: "0.85rem",
                marginRight: "0.5rem",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {actions.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            marginBottom: footer ? "1rem" : 0,
          }}
        >
          {actions.map(({ label, onClick: btnClick }, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                btnClick();
              }}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                background: "#007acc",
                color: "#fff",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#005fa3")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#007acc")
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div
          style={{
            borderTop: "1px solid #ddd",
            paddingTop: "0.75rem",
            fontSize: "0.85rem",
            color: "#888",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
